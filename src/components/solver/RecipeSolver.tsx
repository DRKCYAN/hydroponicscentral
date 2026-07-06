"use client";

import { useMemo, useState } from "react";
import {
  solveRecipe,
  type RecipeSolveResult,
  forwardPpm,
} from "@/lib/calc/solver";
import { ionBalance, ppmMapFromElements, ecFromCations } from "@/lib/calc/validation";
import { partitionStocks } from "@/lib/calc/stock";
import { FERTILIZERS, MACRO_ELEMENTS, fertilizerById } from "@/lib/data/fertilizers";
import { CROP_TARGETS } from "@/lib/data/crops";
import { WATER_PROFILES } from "@/lib/data/mock";
import type { WeightScheme } from "@/lib/calc/solver";
import {
  Card,
  CardHeader,
  Button,
  CaveatNote,
  StatusPill,
  UnitValue,
} from "@/components/ui/primitives";
import { LockedPanel, ProvenanceTrace } from "@/components/ui/feature";
import { Field, inputClass } from "@/components/ui/field";
import { fmt, fmtSigned } from "@/lib/format";

type Tier = "free" | "pro";
type Targets = Record<(typeof MACRO_ELEMENTS)[number], string>;

const WEIGHT_LABELS: Record<WeightScheme, string> = {
  relative: "Relative — equal % accuracy across macros & micros",
  absolute: "Absolute — minimize raw ppm error (macros dominate)",
  custom: "Custom weights (advanced)",
};

export function RecipeSolver({ tier = "free" }: { tier?: Tier }) {
  const [cropId, setCropId] = useState(CROP_TARGETS[0].id);
  const [targets, setTargets] = useState<Targets>(() => toTargets(CROP_TARGETS[0].ppm));
  const [volume, setVolume] = useState("100");
  const [waterId, setWaterId] = useState<string>("none");
  const [weightScheme, setWeightScheme] = useState<WeightScheme>("relative");
  const [selectedFerts, setSelectedFerts] = useState<string[]>(
    FERTILIZERS.map((f) => f.id),
  );
  const [result, setResult] = useState<RecipeSolveResult | null>(null);
  const [committed, setCommitted] = useState(false);

  function applyCrop(id: string) {
    setCropId(id);
    const crop = CROP_TARGETS.find((c) => c.id === id);
    if (crop) setTargets(toTargets(crop.ppm));
    setResult(null);
    setCommitted(false);
  }

  const vol = parseFloat(volume) || 1;
  const source =
    tier === "pro" && waterId !== "none"
      ? WATER_PROFILES.find((w) => w.id === waterId)
      : undefined;

  const activeFerts = useMemo(
    () => FERTILIZERS.filter((f) => selectedFerts.includes(f.id)),
    [selectedFerts],
  );

  function solve() {
    const targetsPpm = Object.fromEntries(
      MACRO_ELEMENTS.map((e) => [e, parseFloat(targets[e]) || 0]),
    );
    const sourcePpm: Record<string, number> = source
      ? { N: source.N, P: 0, K: source.K, Ca: source.Ca, Mg: source.Mg, S: source.S, Na: source.Na, Cl: source.Cl }
      : {};
    const res = solveRecipe({
      elements: [...MACRO_ELEMENTS],
      targetsPpm,
      sourcePpm,
      fertilizers: activeFerts,
      weightScheme,
      volumeL: vol,
    });
    setResult(res);
    setCommitted(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* ---- INPUTS (left) ---- */}
      <div className="space-y-6">
        <Card>
          <CardHeader title="Target profile" subtitle="Desired final concentration per element" />
          <div className="space-y-4 p-5">
            <Field label="Crop / stage preset">
              <select className={inputClass} value={cropId} onChange={(e) => applyCrop(e.target.value)}>
                {CROP_TARGETS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.stage} (EC ~{c.ecTarget})
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-3 gap-3">
              {MACRO_ELEMENTS.map((el) => (
                <Field key={el} label={el} unit="ppm">
                  <input
                    className={`${inputClass} num`}
                    inputMode="decimal"
                    value={targets[el]}
                    onChange={(e) => {
                      setTargets({ ...targets, [el]: e.target.value });
                      setResult(null);
                    }}
                  />
                </Field>
              ))}
            </div>
            <Field label="Batch volume" unit="L" hint="Grams scale linearly with volume.">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
              />
            </Field>
            <Field label="Solve weighting">
              <select
                className={inputClass}
                value={weightScheme}
                onChange={(e) => setWeightScheme(e.target.value as WeightScheme)}
              >
                {(Object.keys(WEIGHT_LABELS) as WeightScheme[]).map((w) => (
                  <option key={w} value={w}>
                    {WEIGHT_LABELS[w]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        {/* Source-water correction — the visible-but-locked panel in free tier */}
        {tier === "free" ? (
          <LockedPanel title="Source-water correction is a Pro feature" tier="Pro">
            <SourceCorrectionPanel waterId="well-a" onChange={() => {}} disabled />
          </LockedPanel>
        ) : (
          <SourceCorrectionPanel
            waterId={waterId}
            onChange={(id) => {
              setWaterId(id);
              setResult(null);
            }}
          />
        )}

        <Card>
          <CardHeader
            title="Available fertilizers"
            subtitle={`${activeFerts.length} of ${FERTILIZERS.length} salts in the solve`}
          />
          <div className="max-h-64 divide-y divide-neutral-100 overflow-y-auto">
            {FERTILIZERS.map((f) => {
              const on = selectedFerts.includes(f.id);
              return (
                <label
                  key={f.id}
                  className="flex cursor-pointer items-center gap-3 px-5 py-2.5 hover:bg-neutral-50"
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => {
                      setSelectedFerts((s) =>
                        on ? s.filter((x) => x !== f.id) : [...s, f.id],
                      );
                      setResult(null);
                    }}
                    className="h-4 w-4 accent-[var(--color-accent-600)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-neutral-800">
                      {f.name}
                    </span>
                    <span className="block text-xs text-neutral-400">{f.label}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </Card>

        <Button onClick={solve} className="w-full" size="md">
          Solve recipe
        </Button>
      </div>

      {/* ---- OUTPUT (right) ---- */}
      <div className="space-y-6">
        {!result ? (
          <Card>
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="text-4xl">⚗️</div>
              <p className="mt-3 text-sm font-medium text-neutral-600">
                Set your targets and press <span className="text-accent-700">Solve recipe</span>.
              </p>
              <p className="mt-1 max-w-xs text-xs text-neutral-400">
                The engine finds the grams of each salt that best hit every target at once — not one
                element at a time.
              </p>
            </div>
          </Card>
        ) : (
          <SolveOutput
            result={result}
            ferts={activeFerts}
            volume={vol}
            source={source}
            tier={tier}
            committed={committed}
            onCommit={() => setCommitted(true)}
            weightLabel={WEIGHT_LABELS[weightScheme]}
          />
        )}
      </div>
    </div>
  );
}

function toTargets(ppm: Record<string, number>): Targets {
  return Object.fromEntries(MACRO_ELEMENTS.map((e) => [e, String(ppm[e] ?? 0)])) as Targets;
}

// ---- Source-water correction panel ----
function SourceCorrectionPanel({
  waterId,
  onChange,
  disabled,
}: {
  waterId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const water = WATER_PROFILES.find((w) => w.id === waterId);
  return (
    <Card>
      <CardHeader title="Source-water correction" subtitle="Subtract what's already in your water" />
      <div className="space-y-3 p-5">
        <Field label="Water source profile">
          <select
            className={inputClass}
            value={waterId}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="none">None (mix in pure water)</option>
            {WATER_PROFILES.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} — EC {w.ec}, Ca {w.Ca} ppm
              </option>
            ))}
          </select>
        </Field>
        {water && (
          <div className="grid grid-cols-4 gap-2 text-xs text-neutral-500">
            {(["Ca", "Mg", "S", "Na", "Cl", "K", "N"] as const).map((k) => (
              <div key={k} className="rounded bg-neutral-50 px-2 py-1">
                <span className="text-neutral-400">{k}</span>{" "}
                <span className="num text-neutral-700">{water[k]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ---- Solve output ----
function SolveOutput({
  result,
  ferts,
  volume,
  source,
  tier,
  committed,
  onCommit,
  weightLabel,
}: {
  result: RecipeSolveResult;
  ferts: typeof FERTILIZERS;
  volume: number;
  source?: { name: string } | undefined;
  tier: Tier;
  committed: boolean;
  onCommit: () => void;
  weightLabel: string;
}) {
  const dosed = ferts
    .map((f) => ({ f, gpl: result.gramsPerLiter[f.id] ?? 0 }))
    .filter((d) => d.gpl > 1e-4)
    .sort((a, b) => b.gpl - a.gpl);

  // Cl / Na for the ion balance (Cl comes from the mix, Na from source water).
  const fullPpm = forwardPpm(
    [...MACRO_ELEMENTS, "Cl"],
    result.gramsPerLiter,
    ferts,
    {},
  );
  const balanceInput = ppmMapFromElements({
    N: result.achievedPpm.N,
    P: result.achievedPpm.P,
    K: result.achievedPpm.K,
    Ca: result.achievedPpm.Ca,
    Mg: result.achievedPpm.Mg,
    S: result.achievedPpm.S,
    Cl: fullPpm.Cl,
  });
  const balance = ionBalance({ ppm: balanceInput });
  const ecEst = ecFromCations(balance.sumCationsMeq);
  const partition = partitionStocks(dosed.map((d) => d.f));

  return (
    <>
      {/* The "whoa" moment: a solved multi-salt mix */}
      <Card>
        <CardHeader
          title="Solved recipe"
          subtitle={`For a ${fmt(volume, 0)} L batch · ${weightLabel.split("—")[0].trim()} weighting`}
          right={<StatusPill status="ok">Solved</StatusPill>}
        />
        <div className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs text-neutral-400">
                <th className="pb-2 font-medium">Fertilizer</th>
                <th className="pb-2 text-right font-medium">g / batch</th>
                <th className="pb-2 text-right font-medium">g / L</th>
                <th className="pb-2 pl-3 text-left font-medium">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {dosed.map(({ f, gpl }) => (
                <tr key={f.id}>
                  <td className="py-2.5">
                    <span className="font-medium text-neutral-800">{f.name}</span>
                    <span className="block text-xs text-neutral-400">{f.label}</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <UnitValue value={fmt(gpl * volume, 1)} unit="g" />
                  </td>
                  <td className="py-2.5 text-right text-neutral-500">
                    <span className="num">{fmt(gpl, 3)}</span>
                  </td>
                  <td className="py-2.5 pl-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        partition.stockA.includes(f.id)
                          ? "bg-info-50 text-info-700"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {partition.stockA.includes(f.id) ? "A" : "B"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dosed.length === 0 && (
            <p className="py-6 text-center text-sm text-neutral-400">
              No salt needed — targets already met by the source water.
            </p>
          )}
          <div className="mt-4">
            <ProvenanceTrace
              summary={`${dosed.length} salts · solved just now`}
              steps={[
                `targets: ${MACRO_ELEMENTS.map((e) => `${e} ${fmt(result.correctedTargetPpm[e] + 0, 0)}`).join(", ")} ppm`,
                source ? `water: ${source.name} (corrected)` : "water: pure (no correction)",
                `weighting: ${weightLabel}`,
                `constraint: grams ≥ 0 (non-negative least squares)`,
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Achieved vs target */}
      <Card>
        <CardHeader title="Achieved vs target" subtitle="How close the solve landed, per element" />
        <div className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs text-neutral-400">
                <th className="pb-2 font-medium">Element</th>
                <th className="pb-2 text-right font-medium">Target</th>
                <th className="pb-2 text-right font-medium">Achieved</th>
                <th className="pb-2 text-right font-medium">Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {MACRO_ELEMENTS.map((el) => {
                // residual = achieved − target, so target = achieved − residual.
                const tgt = result.achievedPpm[el] - result.residualPpm[el];
                const dev = tgt > 0 ? Math.abs(result.residualPpm[el]) / tgt : 0;
                const status = dev <= 0.05 ? "ok" : dev <= 0.15 ? "caution" : "danger";
                return (
                  <tr key={el}>
                    <td className="py-2 font-medium text-neutral-700">{el}</td>
                    <td className="py-2 text-right text-neutral-500">
                      <span className="num">{fmt(tgt, 0)}</span>
                    </td>
                    <td className="py-2 text-right">
                      <span className="num font-medium">{fmt(result.achievedPpm[el], 0)}</span>
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className={`num text-xs ${
                          status === "ok"
                            ? "text-ok-700"
                            : status === "caution"
                              ? "text-caution-700"
                              : "text-danger-700"
                        }`}
                      >
                        {fmtSigned(result.residualPpm[el], 0)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ion balance + EC — locked panel in free tier */}
      {tier === "free" ? (
        <LockedPanel title="Ion balance & EC estimate are Pro" tier="Pro">
          <IonBalanceCard balance={balance} ecEst={ecEst} />
        </LockedPanel>
      ) : (
        <IonBalanceCard balance={balance} ecEst={ecEst} />
      )}

      {/* Safety warnings — ALWAYS free, regardless of tier */}
      {(partition.notes.length > 0 || result.warnings.length > 0) && (
        <div className="space-y-2">
          {result.warnings.map((w, i) => (
            <CaveatNote key={`w${i}`} tone="danger">
              {w}
            </CaveatNote>
          ))}
          <CaveatNote>
            {partition.notes[partition.notes.length - 1]} Stock A ={" "}
            {partition.stockA.map((id) => fertilizerById(id)?.name.split(" (")[0]).join(", ") || "—"}
            . Stock B ={" "}
            {partition.stockB.map((id) => fertilizerById(id)?.name.split(" (")[0]).join(", ") || "—"}.
          </CaveatNote>
        </div>
      )}

      {/* Commit / save actions */}
      {tier === "pro" ? (
        <div className="flex items-center gap-3">
          <Button variant={committed ? "secondary" : "primary"} onClick={onCommit}>
            {committed ? "✓ Recipe activated" : "Use this recipe"}
          </Button>
          <Button variant="secondary">Export</Button>
          {committed && (
            <span className="text-xs text-neutral-500">
              Written as this system&apos;s active target — Log & Monitor now compare against it.
            </span>
          )}
        </div>
      ) : (
        <LockedPanel title="Save, export & re-run are Pro" tier="Pro">
          <div className="flex items-center gap-3 p-5">
            <Button variant="secondary">Save recipe</Button>
            <Button variant="secondary">Export CSV</Button>
            <Button variant="secondary">Re-run at new volume</Button>
          </div>
        </LockedPanel>
      )}
    </>
  );
}

function IonBalanceCard({
  balance,
  ecEst,
}: {
  balance: ReturnType<typeof ionBalance>;
  ecEst: number;
}) {
  const status = balance.imbalanceMagnitudePct <= 5 ? "ok" : balance.imbalanceMagnitudePct <= 10 ? "caution" : "danger";
  return (
    <Card>
      <CardHeader
        title="Ion balance & EC estimate"
        subtitle="Charge sanity-check on the formulation"
        right={<StatusPill status={status}>{fmt(balance.imbalanceMagnitudePct, 1)}% off</StatusPill>}
      />
      <div className="grid grid-cols-2 gap-4 p-5">
        <div>
          <div className="text-xs text-neutral-500">Σ cations</div>
          <UnitValue value={fmt(balance.sumCationsMeq, 2)} unit="meq/L" size="lg" />
        </div>
        <div>
          <div className="text-xs text-neutral-500">Σ anions</div>
          <UnitValue value={fmt(balance.sumAnionsMeq, 2)} unit="meq/L" size="lg" />
        </div>
        <div>
          <div className="text-xs text-neutral-500">
            Imbalance{" "}
            <span className="text-neutral-400">
              ({balance.direction === "cation-excess" ? "cation excess" : balance.direction === "anion-excess" ? "anion excess" : "balanced"})
            </span>
          </div>
          <span className={`num text-lg font-semibold ${status === "ok" ? "text-ok-700" : status === "caution" ? "text-caution-700" : "text-danger-700"}`}>
            {fmtSigned(balance.imbalanceSignedPct, 1)}%
          </span>
        </div>
        <div>
          <div className="text-xs text-neutral-500">Estimated EC</div>
          <UnitValue value={fmt(ecEst, 2)} unit="mS/cm" size="lg" />
        </div>
      </div>
      <div className="px-5 pb-5">
        <CaveatNote tone="info">
          The signed % is directional (+ = cation excess, short on anions), not an error. EC is an
          empirical approximation (±10–15%) — always confirm with a calibrated meter.
        </CaveatNote>
      </div>
    </Card>
  );
}
