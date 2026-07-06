/**
 * Recipe Solver — the crown jewel. [II-3.3] multi-salt weighted least squares
 * with a non-negativity constraint, plus the targeting/validation helpers that
 * bundle with it: source-water correction [II-4.1], RO blend [II-4.2],
 * nutrient ratio [II-3.4].
 *
 * Real recipes use several salts, most of which supply multiple elements, so
 * "grams of each salt to hit all target ppms" is a constrained weighted
 * least-squares problem — NOT a stack of single-salt calculators.
 */
import { lstsq, matVec, selectColumns, type Matrix, type Vector } from "./linalg";

// ---- [II-4.1] Source water correction ----
/** ppm the fertilizer must supply = target − source, floored at 0. */
export function sourceCorrect(targetPpm: number, sourcePpm: number): number {
  return Math.max(0, targetPpm - sourcePpm);
}

/** Flag elements where source already exceeds target (cannot fix by adding). */
export function overTargetElements(
  targets: Record<string, number>,
  source: Record<string, number>,
): string[] {
  return Object.keys(targets).filter((el) => (source[el] ?? 0) > targets[el] + 1e-9);
}

// ---- [II-4.2] RO / dilution blend for hard water ----
/** Fraction of RO water to blend to bring an over-target ion/EC down. */
export function roBlendFraction(targetValue: number, sourceValue: number): number {
  if (sourceValue <= 0) return 0;
  return Math.max(0, Math.min(1, 1 - targetValue / sourceValue));
}

// ---- [II-3.4] Nutrient ratio ----
export function nutrientRatioMass(ppmA: number, ppmB: number): number {
  return ppmB === 0 ? Infinity : ppmA / ppmB;
}
export function nutrientRatioMolar(
  ppmA: number,
  ppmB: number,
  molarA: number,
  molarB: number,
): number {
  const molB = ppmB / molarB;
  return molB === 0 ? Infinity : ppmA / molarA / molB;
}

// ---- [II-3.3] Non-negative least squares (Lawson–Hanson active-set) ----
/**
 * minimize ||A x − b||^2 subject to x >= 0.
 * A is m×n (elements × fertilizers), b length m, returns x length n.
 */
export function nnls(A: Matrix, b: Vector, maxIter = 3 * (A[0]?.length ?? 0) + 10): Vector {
  const m = A.length;
  const n = A[0]?.length ?? 0;
  if (n === 0) return [];
  const tol = 1e-10;
  const x = new Array(n).fill(0);
  const passive = new Set<number>();
  const active = new Set<number>(Array.from({ length: n }, (_, j) => j));

  const gradient = (): Vector => {
    const resid = b.map((bi, i) => bi - A[i].reduce((s, a, j) => s + a * x[j], 0));
    // w = A^T resid
    const w = new Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let i = 0; i < m; i++) s += A[i][j] * resid[i];
      w[j] = s;
    }
    return w;
  };

  let outer = 0;
  while (active.size > 0 && outer++ < maxIter) {
    const w = gradient();
    // pick most-positive gradient among active columns
    let jStar = -1;
    let best = tol;
    for (const j of active) {
      if (w[j] > best) {
        best = w[j];
        jStar = j;
      }
    }
    if (jStar === -1) break; // KKT satisfied

    active.delete(jStar);
    passive.add(jStar);

    // inner loop
    let inner = 0;
    while (inner++ < maxIter) {
      const cols = [...passive].sort((a, b2) => a - b2);
      const Ap = selectColumns(A, cols);
      const zp = lstsq(Ap, b) ?? cols.map(() => 0);
      const z = new Array(n).fill(0);
      cols.forEach((c, k) => (z[c] = zp[k]));

      const minZ = Math.min(...cols.map((c) => z[c]));
      if (minZ > tol) {
        for (let j = 0; j < n; j++) x[j] = z[j];
        break;
      }

      // step length alpha to keep x >= 0
      let alpha = Infinity;
      for (const q of cols) {
        if (z[q] <= tol) {
          const denom = x[q] - z[q];
          if (denom > 0) alpha = Math.min(alpha, x[q] / denom);
        }
      }
      if (!isFinite(alpha)) alpha = 0;
      for (let j = 0; j < n; j++) x[j] = x[j] + alpha * (z[j] - x[j]);

      // move any zeroed columns back to active
      for (const q of [...passive]) {
        if (x[q] <= tol) {
          x[q] = 0;
          passive.delete(q);
          active.add(q);
        }
      }
    }
  }
  return x.map((v) => (v < 0 ? 0 : v));
}

// ---- Weighted multi-salt solve (the operator-facing entry point) ----
export type WeightScheme = "absolute" | "relative" | "custom";

export interface FertColumn {
  id: string;
  name: string;
  /** elemental fraction (0–1) of each solved element in this product. */
  fractions: Record<string, number>;
}

export interface RecipeSolveInput {
  elements: string[]; // e.g. ["N","P","K","Ca","Mg","S"]
  targetsPpm: Record<string, number>; // desired final ppm
  sourcePpm?: Record<string, number>; // water already contains this ppm
  fertilizers: FertColumn[];
  weightScheme?: WeightScheme;
  customWeights?: Record<string, number>;
  volumeL?: number; // for reporting grams-per-batch (default per-liter)
  /** Pin a fertilizer to a fixed g/L (equality lock); solver won't move it. */
  locks?: Record<string, number>;
}

export interface RecipeSolveResult {
  gramsPerLiter: Record<string, number>;
  gramsPerBatch: Record<string, number>;
  achievedPpm: Record<string, number>;
  correctedTargetPpm: Record<string, number>;
  residualPpm: Record<string, number>;
  weights: Record<string, number>;
  warnings: string[];
}

/**
 * Assemble A/b, apply weighting, run NNLS. Guards the "100× trap": A must hold
 * FRACTIONS in [0,1] (b is in g/L), never raw percentages.
 */
export function solveRecipe(input: RecipeSolveInput): RecipeSolveResult {
  const {
    elements,
    targetsPpm,
    sourcePpm = {},
    fertilizers,
    weightScheme = "relative",
    customWeights = {},
    volumeL = 1,
    locks = {},
  } = input;

  const warnings: string[] = [];

  // corrected targets in g/L
  const corrected: Record<string, number> = {};
  for (const el of elements) {
    corrected[el] = sourceCorrect(targetsPpm[el] ?? 0, sourcePpm[el] ?? 0);
  }
  for (const el of overTargetElements(targetsPpm, sourcePpm)) {
    if (elements.includes(el)) {
      warnings.push(
        `Source water already exceeds target for ${el} — dilute with RO water; fertilizer cannot remove it.`,
      );
    }
  }

  // Build A (fractions) and validate the 100× trap.
  const lockedIds = new Set(Object.keys(locks));
  const freeFerts = fertilizers.filter((f) => !lockedIds.has(f.id));

  const A: Matrix = elements.map((el) =>
    freeFerts.map((f) => {
      const frac = f.fractions[el] ?? 0;
      if (frac < 0 || frac > 1) {
        warnings.push(
          `${f.name}: ${el} fraction ${frac} is outside [0,1] — did a percentage leak in? (÷100)`,
        );
      }
      return frac;
    }),
  );
  for (const f of freeFerts) {
    const colSum = elements.reduce((s, el) => s + (f.fractions[el] ?? 0), 0);
    if (colSum > 1.000001) {
      warnings.push(`${f.name}: elemental fractions sum to ${colSum.toFixed(3)} > 1 (impossible).`);
    }
  }

  // b in g/L, minus contributions of locked fertilizers.
  const b: Vector = elements.map((el, i) => {
    let bi = corrected[el] / 1000;
    for (const [id, gpl] of Object.entries(locks)) {
      const f = fertilizers.find((x) => x.id === id);
      if (f) bi -= gpl * (f.fractions[el] ?? 0);
    }
    return Math.max(bi, i >= 0 ? -Infinity : 0); // allow negative -> NNLS handles
  });

  // Weights per element.
  const weights: Record<string, number> = {};
  for (const el of elements) {
    if (weightScheme === "absolute") weights[el] = 1;
    else if (weightScheme === "custom") weights[el] = customWeights[el] ?? 1;
    else {
      const t = corrected[el] / 1000;
      weights[el] = t > 0 ? 1 / (t * t) : 1;
    }
  }

  // Scale rows by sqrt(w) so NNLS minimizes the weighted objective.
  const sw = elements.map((el) => Math.sqrt(weights[el]));
  const Aw = A.map((row, i) => row.map((a) => a * sw[i]));
  const bw = b.map((bi, i) => bi * sw[i]);

  const xFree = nnls(Aw, bw);

  // Reassemble grams-per-liter including locks.
  const gramsPerLiter: Record<string, number> = {};
  freeFerts.forEach((f, j) => (gramsPerLiter[f.id] = xFree[j] ?? 0));
  for (const [id, gpl] of Object.entries(locks)) gramsPerLiter[id] = gpl;

  // Achieved ppm from ALL fertilizers (free + locked) + source water.
  const achievedPpm: Record<string, number> = {};
  const residualPpm: Record<string, number> = {};
  for (const el of elements) {
    let gPerL = sourcePpm[el] ? sourcePpm[el] / 1000 : 0;
    for (const f of fertilizers) gPerL += (gramsPerLiter[f.id] ?? 0) * (f.fractions[el] ?? 0);
    achievedPpm[el] = gPerL * 1000;
    residualPpm[el] = achievedPpm[el] - (targetsPpm[el] ?? 0);
  }

  const gramsPerBatch: Record<string, number> = {};
  for (const [id, gpl] of Object.entries(gramsPerLiter)) gramsPerBatch[id] = gpl * volumeL;

  return {
    gramsPerLiter,
    gramsPerBatch,
    achievedPpm,
    correctedTargetPpm: corrected,
    residualPpm,
    weights,
    warnings,
  };
}

/** Utility for callers/tests: forward ppm produced by a g/L mix + source water. */
export function forwardPpm(
  elements: string[],
  gramsPerLiter: Record<string, number>,
  fertilizers: FertColumn[],
  sourcePpm: Record<string, number> = {},
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const el of elements) {
    let gPerL = (sourcePpm[el] ?? 0) / 1000;
    for (const f of fertilizers) gPerL += (gramsPerLiter[f.id] ?? 0) * (f.fractions[el] ?? 0);
    out[el] = gPerL * 1000;
  }
  return out;
}

export { matVec };
