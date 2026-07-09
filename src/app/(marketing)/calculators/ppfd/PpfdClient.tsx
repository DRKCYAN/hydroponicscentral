"use client";

import { useState } from "react";
import Link from "next/link";
import { PPFD_TARGETS, DLI_TARGETS } from "@/lib/calc/constants";
import { dli } from "@/lib/calc/psychro";
import { ppfFromWattage, averagePpfd, wattageForPpfd } from "@/lib/calc/lighting";
import { ft2ToM2 } from "@/lib/calc/units";
import {
  Card,
  CardHeader,
  Kicker,
  CaveatNote,
  Stat,
  StatusPill,
  UnitValue,
} from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { fmt, fmtInt } from "@/lib/format";

type Stage = keyof typeof PPFD_TARGETS;
const STAGE_LABEL: Record<Stage, string> = {
  seedling: "Seedlings / clones",
  vegetative: "Vegetative",
  flowering: "Flowering / fruiting",
};

export function PpfdClient() {
  const [mode, setMode] = useState<"have" | "need">("have");
  const [watts, setWatts] = useState("600");
  const [targetPpfd, setTargetPpfd] = useState("700");
  const [efficacy, setEfficacy] = useState("2.7");
  const [length, setLength] = useState("4");
  const [width, setWidth] = useState("4");
  const [photoperiod, setPhotoperiod] = useState("18");
  const [stage, setStage] = useState<Stage>("vegetative");

  const areaFt2 = (parseFloat(length) || 0) * (parseFloat(width) || 0);
  const areaM2 = ft2ToM2(areaFt2);
  const eff = parseFloat(efficacy) || 0;
  const hours = parseFloat(photoperiod) || 0;

  let ppfdV: number;
  let wattsV: number;
  if (mode === "have") {
    wattsV = parseFloat(watts) || 0;
    ppfdV = averagePpfd(ppfFromWattage(wattsV, eff), areaM2);
  } else {
    ppfdV = parseFloat(targetPpfd) || 0;
    wattsV = wattageForPpfd(ppfdV, areaM2, eff);
  }
  const dliV = dli(ppfdV, hours);

  const [pLo, pHi] = PPFD_TARGETS[stage];
  const [dLo, dHi] = DLI_TARGETS[stage];
  const ppfdIn = ppfdV >= pLo && ppfdV <= pHi;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Kicker>Free calculator</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        Grow light coverage &amp; PPFD calculator
      </h1>
      <p className="mt-2 text-neutral-600">
        Watts don&apos;t grow plants — photons do. Wattage × efficacy gives the photon flux (PPF);
        spread over your canopy it becomes PPFD, and PPFD × hours becomes the daily light integral
        the crop actually experiences.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Fixture & coverage" />
          <div className="space-y-4 p-5">
            <div className="inline-flex rounded-md border border-neutral-300 p-0.5 text-sm">
              {(["have", "need"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded px-3 py-1 font-medium ${
                    mode === m ? "bg-accent-600 text-neutral-0" : "text-neutral-600"
                  }`}
                >
                  {m === "have" ? "I have a light" : "I need a light"}
                </button>
              ))}
            </div>

            {mode === "have" ? (
              <Field label="Fixture wattage (actual draw)" unit="W">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={watts}
                  onChange={(e) => setWatts(e.target.value)}
                />
              </Field>
            ) : (
              <Field label="Target average PPFD" unit="µmol/m²/s">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={targetPpfd}
                  onChange={(e) => setTargetPpfd(e.target.value)}
                />
              </Field>
            )}

            <Field
              label="Fixture efficacy"
              unit="µmol/J"
              hint="Modern LED bars 2.5–3.0, budget LEDs ~2.0–2.5, double-ended HPS ~1.7."
            >
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={efficacy}
                onChange={(e) => setEfficacy(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Coverage length" unit="ft">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
              </Field>
              <Field label="Coverage width" unit="ft">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                />
              </Field>
            </div>

            <Field label="Photoperiod" unit="h/day">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={photoperiod}
                onChange={(e) => setPhotoperiod(e.target.value)}
              />
            </Field>

            <Field label="Growth stage (target band)">
              <select
                className={inputClass}
                value={stage}
                onChange={(e) => setStage(e.target.value as Stage)}
              >
                {(Object.keys(PPFD_TARGETS) as Stage[]).map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABEL[s]} ({PPFD_TARGETS[s][0]}–{PPFD_TARGETS[s][1]} µmol/m²/s)
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Result"
            subtitle={`${fmt(areaFt2, 0)} ft² (${fmt(areaM2, 2)} m²) canopy, 90% utilization`}
          />
          <div className="space-y-5 p-5">
            {mode === "have" ? (
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-500">Average PPFD</span>
                  <StatusPill status={ppfdIn ? "ok" : "caution"}>
                    {ppfdIn ? "In target range" : ppfdV < pLo ? "Below target" : "Above target"}
                  </StatusPill>
                </div>
                <UnitValue value={fmtInt(ppfdV)} unit="µmol/m²/s" size="xl" />
              </div>
            ) : (
              <div>
                <div className="text-xs font-medium text-neutral-500">Fixture wattage needed</div>
                <UnitValue value={fmtInt(wattsV)} unit="W" size="xl" />
                <div className="mt-0.5 text-xs text-neutral-400">
                  at {fmt(eff, 1)} µmol/J efficacy
                </div>
              </div>
            )}
            <Stat
              label="Daily light integral"
              value={fmt(dliV, 1)}
              unit="mol/m²/day"
              hint={`Stage target ${dLo}–${dHi} mol/m²/day`}
              tone={dliV >= dLo && dliV <= dHi ? "ok" : "caution"}
            />
            <Stat
              label={mode === "have" ? "Photon flux (PPF)" : "Photon flux needed"}
              value={fmtInt(mode === "have" ? ppfFromWattage(wattsV, eff) : (ppfdV * areaM2) / 0.9)}
              unit="µmol/s"
              tone="muted"
            />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <CaveatNote>
          This assumes photons spread evenly with 90% reaching the canopy — real fixtures run
          hotter in the center and dimmer at the edges, and hanging height changes the map. Treat
          it as a shopping estimate; verify with a PAR meter or the manufacturer&apos;s PPFD chart.
          Above ~1000 µmol/m²/s, plants need CO₂ enrichment to use the extra light.
        </CaveatNote>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Every one of those watts becomes heat —{" "}
        <Link href="/calculators/ac-btu" className="font-medium text-accent-700 hover:underline">
          size the cooling →
        </Link>{" "}
        or{" "}
        <Link
          href="/calculators/electricity"
          className="font-medium text-accent-700 hover:underline"
        >
          the power bill →
        </Link>
      </p>
    </div>
  );
}
