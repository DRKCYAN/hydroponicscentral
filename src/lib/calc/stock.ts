/**
 * Stock solutions & injector dilution.
 * [II-3b.1] dilution C1V1=C2V2, [II-3b.2] stock concentration factor,
 * [II-3b.3] injector ratio (convention toggle changes the MATH),
 * [II-3b.4] stock batch mass + A/B compatibility partition.
 */
import type { FertColumn } from "./solver";

/** [II-3b.1] C1·V1 = C2·V2 — solve for the one missing value. */
export function dilutionSolve(vals: {
  c1?: number;
  v1?: number;
  c2?: number;
  v2?: number;
}): { key: "c1" | "v1" | "c2" | "v2"; value: number } {
  const { c1, v1, c2, v2 } = vals;
  if (c1 == null) return { key: "c1", value: (c2! * v2!) / v1! };
  if (v1 == null) return { key: "v1", value: (c2! * v2!) / c1! };
  if (c2 == null) return { key: "c2", value: (c1 * v1!) / v2! };
  return { key: "v2", value: (c1 * v1!) / c2! };
}

/** [II-3b.2] Stock concentration factor. */
export function concentrationFactor(cStock: number, cWorking: number): number {
  return cStock / cWorking;
}

export type InjectorConvention = "A" | "B";

/**
 * [II-3b.3] Required stock concentration for an injector quoted "1:R".
 * The convention toggle MUST switch the formula, not just the caption:
 *   A — "1 part concentrate : R parts WATER"  -> C_stock = C_working·(R+1)
 *   B — "1:R ratio to FINAL solution"         -> C_stock = C_working·R
 */
export function injectorStockConcentration(
  cWorking: number,
  R: number,
  convention: InjectorConvention,
): number {
  return convention === "A" ? cWorking * (R + 1) : cWorking * R;
}

/** [II-3b.4] Salt mass to make a stock tank at working ppm × CF. */
export function stockBatchMass(
  targetWorkingPpm: number,
  cf: number,
  vStockL: number,
  percentElement: number,
): number {
  return (targetWorkingPpm * cf * vStockL) / (percentElement * 10);
}

/**
 * ⚠ Compatibility rule (enforced, not a formula): never combine calcium with
 * sulfate or phosphate in the same concentrated stock. Partition solver output
 * into Stock A (calcium/nitrate) and Stock B (phosphate/sulfate/micros).
 */
export interface StockPartition {
  stockA: string[]; // fertilizer ids -> calcium / nitrate tank
  stockB: string[]; // fertilizer ids -> phosphate / sulfate / micro tank
  notes: string[];
}
export function partitionStocks(fertilizers: FertColumn[]): StockPartition {
  const stockA: string[] = [];
  const stockB: string[] = [];
  const notes: string[] = [];
  for (const f of fertilizers) {
    const hasCa = (f.fractions.Ca ?? 0) > 0;
    const hasSO4 = (f.fractions.S ?? 0) > 0;
    const hasP = (f.fractions.P ?? 0) > 0;
    if (hasCa && (hasSO4 || hasP)) {
      notes.push(`${f.name} carries Ca with S/P together — verify; usually a formulation error.`);
    }
    if (hasCa) stockA.push(f.id);
    else if (hasSO4 || hasP) stockB.push(f.id);
    else stockB.push(f.id); // micros / neutral salts default to B
  }
  notes.push("Keep calcium (Stock A) and phosphate/sulfate (Stock B) in separate concentrates.");
  return { stockA, stockB, notes };
}
