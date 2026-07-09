"use client";

import { useState } from "react";
import Link from "next/link";
import { VPD_TARGETS } from "@/lib/calc/constants";
import { vpd, leafVpd, dewPoint, vpdToRh } from "@/lib/calc/psychro";
import { fToC, cToF } from "@/lib/calc/units";
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
import { fmt } from "@/lib/format";

type Stage = keyof typeof VPD_TARGETS;
const STAGE_LABEL: Record<Stage, string> = {
  propagation: "Propagation / clones",
  vegetative: "Vegetative",
  flowering: "Flowering",
};

export function VpdClient() {
  const [unit, setUnit] = useState<"c" | "f">("c");
  const [temp, setTemp] = useState("25");
  const [rh, setRh] = useState("60");
  const [leafOffset, setLeafOffset] = useState("-2");
  const [stage, setStage] = useState<Stage>("vegetative");

  function switchUnit(u: "c" | "f") {
    if (u === unit) return;
    const t = parseFloat(temp);
    const o = parseFloat(leafOffset);
    if (isFinite(t)) setTemp((u === "f" ? cToF(t) : fToC(t)).toFixed(1));
    if (isFinite(o)) setLeafOffset((u === "f" ? o * 1.8 : o / 1.8).toFixed(1));
    setUnit(u);
  }

  const tRaw = parseFloat(temp) || 0;
  const oRaw = parseFloat(leafOffset) || 0;
  const tC = unit === "f" ? fToC(tRaw) : tRaw;
  const oC = unit === "f" ? oRaw / 1.8 : oRaw;
  const rhPct = parseFloat(rh) || 0;

  const airVpd = vpd(tC, rhPct);
  const leaf = leafVpd(tC, tC + oC, rhPct);
  const dpC = dewPoint(tC, rhPct);
  const [lo, hi] = VPD_TARGETS[stage];
  const inRange = leaf >= lo && leaf <= hi;
  const rhForMid = vpdToRh((lo + hi) / 2, tC);
  const degUnit = unit === "f" ? "°F" : "°C";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Kicker>Free calculator</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        VPD calculator
      </h1>
      <p className="mt-2 text-neutral-600">
        Vapor pressure deficit (not RH alone) is what drives transpiration. The same 60% RH is
        gentle at 20 °C and punishing at 30 °C. Leaves run cooler than the air, so leaf VPD is the
        number worth steering.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Room conditions" />
          <div className="space-y-4 p-5">
            <div className="inline-flex rounded-md border border-neutral-300 p-0.5 text-sm">
              {(["c", "f"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => switchUnit(u)}
                  className={`rounded px-3 py-1 font-medium ${
                    unit === u ? "bg-accent-600 text-neutral-0" : "text-neutral-600"
                  }`}
                >
                  {u === "c" ? "°C" : "°F"}
                </button>
              ))}
            </div>

            <Field label="Air temperature" unit={degUnit}>
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
              />
            </Field>

            <Field label="Relative humidity" unit="%">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={rh}
                onChange={(e) => setRh(e.target.value)}
              />
            </Field>

            <Field
              label="Leaf temperature offset"
              unit={degUnit}
              hint="Leaves usually run 1–3 °C cooler than the air under LEDs. Measure with an IR thermometer if you can."
            >
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={leafOffset}
                onChange={(e) => setLeafOffset(e.target.value)}
              />
            </Field>

            <Field label="Growth stage (target band)">
              <select
                className={inputClass}
                value={stage}
                onChange={(e) => setStage(e.target.value as Stage)}
              >
                {(Object.keys(VPD_TARGETS) as Stage[]).map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABEL[s]} ({VPD_TARGETS[s][0]}–{VPD_TARGETS[s][1]} kPa)
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Result" subtitle="Deficit between leaf and air moisture" />
          <div className="space-y-5 p-5">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-500">Leaf VPD</span>
                <StatusPill status={inRange ? "ok" : "caution"}>
                  {inRange
                    ? "In target range"
                    : leaf < lo
                      ? "Low: sluggish transpiration, damp-off risk"
                      : "High: stress / wilting risk"}
                </StatusPill>
              </div>
              <UnitValue value={fmt(leaf, 2)} unit="kPa" size="xl" />
            </div>
            <Stat label="Air VPD" value={fmt(airVpd, 2)} unit="kPa" tone="muted" />
            <Stat
              label="Dew point"
              value={fmt(unit === "f" ? cToF(dpC) : dpC, 1)}
              unit={degUnit}
              tone="muted"
              hint="Surfaces colder than this will condense: keep lights-off temps above it."
            />
            <div className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-500">
              To sit mid-band ({fmt((lo + hi) / 2, 2)} kPa) at this air temperature you&apos;d need
              about <strong className="num">{fmt(rhForMid, 0)}%</strong> RH.
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <CaveatNote>
          Stage bands are rules of thumb, and the leaf offset default (−2 °C) is typical under
          LEDs; HPS canopies often run warmer than the air. VPD moves fast with temperature, so
          re-check after any lighting or HVAC change.
        </CaveatNote>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        RH too high to hit your target?{" "}
        <Link
          href="/calculators/dehumidifier"
          className="font-medium text-accent-700 hover:underline"
        >
          Size a dehumidifier →
        </Link>{" "}
        Too low?{" "}
        <Link
          href="/calculators/humidifier"
          className="font-medium text-accent-700 hover:underline"
        >
          Size a humidifier →
        </Link>
      </p>
    </div>
  );
}
