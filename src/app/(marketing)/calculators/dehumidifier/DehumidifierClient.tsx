"use client";

import { useState } from "react";
import Link from "next/link";
import {
  dehumGrowRoomLDay,
  dehumDryRoomLDay,
  dryingWaterLossL,
  dehumidifierSize,
} from "@/lib/calc/hvac";
import { galToL, lDayToPintDay } from "@/lib/calc/units";
import { Card, CardHeader, Kicker, CaveatNote, Stat, UnitValue } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { fmt } from "@/lib/format";

const LB_TO_KG = 0.4536;

export function DehumidifierClient() {
  const [mode, setMode] = useState<"grow" | "dry">("grow");

  // Grow room
  const [waterIn, setWaterIn] = useState("5");
  const [transpired, setTranspired] = useState("90");

  // Drying room
  const [wetWeight, setWetWeight] = useState("10");
  const [wi, setWi] = useState("80");
  const [wf, setWf] = useState("12");
  const [dryDays, setDryDays] = useState("10");

  let loadLDay: number;
  let totalDryingL = 0;
  if (mode === "grow") {
    loadLDay = dehumGrowRoomLDay(galToL(parseFloat(waterIn) || 0), (parseFloat(transpired) || 0) / 100);
  } else {
    const wetKg = (parseFloat(wetWeight) || 0) * LB_TO_KG;
    const wiF = (parseFloat(wi) || 0) / 100;
    const wfF = (parseFloat(wf) || 0) / 100;
    totalDryingL = dryingWaterLossL(wetKg, wiF, wfF);
    loadLDay = dehumDryRoomLDay(wetKg, wiF, wfF, parseFloat(dryDays) || 0);
  }
  const sized = dehumidifierSize(loadLDay);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Kicker>Free calculator</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        Dehumidifier sizing calculator
      </h1>
      <p className="mt-2 text-neutral-600">
        Water in equals water out: nearly every liter you feed a grow room comes back as vapor,
        and everything a drying harvest loses ends up in the air. Match removal capacity to that
        load or RH drifts up every day.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Moisture load" />
          <div className="space-y-4 p-5">
            <div className="inline-flex rounded-md border border-neutral-300 p-0.5 text-sm">
              {(["grow", "dry"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded px-3 py-1 font-medium ${
                    mode === m ? "bg-accent-600 text-neutral-0" : "text-neutral-600"
                  }`}
                >
                  {m === "grow" ? "Grow room" : "Drying room"}
                </button>
              ))}
            </div>

            {mode === "grow" ? (
              <>
                <Field
                  label="Water fed per day"
                  unit="gal/day"
                  hint="Total irrigation across all plants, minus what goes to drain."
                >
                  <input
                    className={`${inputClass} num`}
                    inputMode="decimal"
                    value={waterIn}
                    onChange={(e) => setWaterIn(e.target.value)}
                  />
                </Field>
                <Field
                  label="Fraction transpired"
                  unit="%"
                  hint="What isn't retained in biomass or drained returns to the air. 90% is typical at steady state."
                >
                  <input
                    className={`${inputClass} num`}
                    inputMode="decimal"
                    value={transpired}
                    onChange={(e) => setTranspired(e.target.value)}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Wet harvest weight" unit="lb">
                  <input
                    className={`${inputClass} num`}
                    inputMode="decimal"
                    value={wetWeight}
                    onChange={(e) => setWetWeight(e.target.value)}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Starting moisture" unit="%">
                    <input
                      className={`${inputClass} num`}
                      inputMode="decimal"
                      value={wi}
                      onChange={(e) => setWi(e.target.value)}
                    />
                  </Field>
                  <Field label="Final moisture" unit="%">
                    <input
                      className={`${inputClass} num`}
                      inputMode="decimal"
                      value={wf}
                      onChange={(e) => setWf(e.target.value)}
                    />
                  </Field>
                </div>
                <Field
                  label="Drying period"
                  unit="days"
                  hint="Slow drying (10–14 days) needs less capacity per day than a fast dry."
                >
                  <input
                    className={`${inputClass} num`}
                    inputMode="decimal"
                    value={dryDays}
                    onChange={(e) => setDryDays(e.target.value)}
                  />
                </Field>
              </>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Result" subtitle="Includes a 1.3× real-world safety factor" />
          <div className="space-y-5 p-5">
            <div>
              <div className="text-xs font-medium text-neutral-500">
                Rated capacity to shop for
              </div>
              <UnitValue value={fmt(sized.pintsDay, 0)} unit="pints/day" size="xl" />
              <div className="mt-0.5 text-xs text-neutral-400">= {fmt(sized.lDay, 1)} L/day</div>
            </div>
            <Stat
              label="Actual moisture load"
              value={fmt(lDayToPintDay(loadLDay), 1)}
              unit="pints/day"
              tone="muted"
              hint={`${fmt(loadLDay, 1)} L/day before the safety factor`}
            />
            {mode === "dry" && (
              <Stat
                label="Total water shed over the dry"
                value={fmt(totalDryingL, 1)}
                unit="L"
                tone="muted"
              />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <CaveatNote>
          Pint ratings (AHAM) are measured at 80 °F / 60% RH; in a cooler room or at a lower RH
          setpoint the same unit removes much less, which is what the 1.3× factor covers. If your
          AC runs constantly it also removes water; this sizing treats the dehumidifier as doing
          all the work.
        </CaveatNote>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Not sure what RH you should hold?{" "}
        <Link href="/calculators/vpd" className="font-medium text-accent-700 hover:underline">
          Find your VPD target →
        </Link>
      </p>
    </div>
  );
}
