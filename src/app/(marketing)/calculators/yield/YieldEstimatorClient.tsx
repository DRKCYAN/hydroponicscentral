"use client";

import { useState } from "react";
import Link from "next/link";
import {
  predictedYield,
  freshFromDry,
  yieldDensity,
  cyclesPerYear,
  revenueCycle,
  annualRevenue,
} from "@/lib/calc/economics";
import { Card, CardHeader, Kicker, CaveatNote, Stat, UnitValue } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { fmt, fmtMoney } from "@/lib/format";

export function YieldEstimatorClient() {
  const [area, setArea] = useState("10");
  const [cgr, setCgr] = useState("10");
  const [hi, setHi] = useState("0.8");
  const [duration, setDuration] = useState("35");
  const [turnaround, setTurnaround] = useState("3");
  const [moisture, setMoisture] = useState("95");
  const [price, setPrice] = useState("8");

  const areaM2 = parseFloat(area) || 0;
  const cgrV = parseFloat(cgr) || 0;
  const hiV = parseFloat(hi) || 0;
  const durationV = parseFloat(duration) || 0;
  const turnaroundV = parseFloat(turnaround) || 0;
  const moistureFrac = (parseFloat(moisture) || 0) / 100;
  const priceKg = parseFloat(price) || 0;

  const dryG = predictedYield(cgrV, durationV, areaM2, hiV);
  const dryKg = dryG / 1000;
  const freshKg = freshFromDry(dryKg, moistureFrac);
  const densityKgM2 = yieldDensity(freshKg, areaM2);
  const cycles = cyclesPerYear(durationV, turnaroundV);
  const annualKg = freshKg * cycles;
  const revCycle = revenueCycle(freshKg, priceKg);
  const revAnnual = annualRevenue(revCycle, cycles);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Kicker>Free calculator</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        Yield estimator &amp; production planner
      </h1>
      <p className="mt-2 text-neutral-600">
        Yield is growth rate × time × area, discounted to the part you can sell. From one cycle,
        the planner rolls forward: how many cycles the calendar allows, and what the year is worth
        at your price.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Crop & cycle" />
          <div className="space-y-4 p-5">
            <Field label="Growing area" unit="m²">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </Field>

            <Field
              label="Crop growth rate (dry)"
              unit="g/m²/day"
              hint="Lettuce runs ~5–15, herbs ~5–10, fruiting crops higher at full canopy. Calibrate from a past harvest if you have one."
            >
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={cgr}
                onChange={(e) => setCgr(e.target.value)}
              />
            </Field>

            <Field
              label="Harvest index"
              hint="Fraction of total biomass you actually sell (0–1). Lettuce ≈ 0.7–0.9."
            >
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={hi}
                onChange={(e) => setHi(e.target.value)}
              />
            </Field>

            <Field label="Cycle length" unit="days">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </Field>

            <Field label="Turnaround between cycles" unit="days">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={turnaround}
                onChange={(e) => setTurnaround(e.target.value)}
              />
            </Field>

            <Field label="Moisture content of fresh product" unit="%">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={moisture}
                onChange={(e) => setMoisture(e.target.value)}
              />
            </Field>

            <Field label="Price" unit="$/kg fresh">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Result" subtitle="Per cycle, then annualized" />
          <div className="space-y-5 p-5">
            <div>
              <div className="text-xs font-medium text-neutral-500">Fresh yield per cycle</div>
              <UnitValue value={fmt(freshKg, 1)} unit="kg" size="xl" />
              <div className="mt-0.5 text-xs text-neutral-400">
                {fmt(dryKg, 2)} kg dry · {fmt(densityKgM2, 1)} kg/m² per cycle
              </div>
            </div>
            <Stat
              label="Cycles per year"
              value={fmt(cycles, 1)}
              tone="muted"
              hint={`${fmt(durationV, 0)} grow + ${fmt(turnaroundV, 0)} turnaround days`}
            />
            <Stat label="Annual production" value={fmt(annualKg, 0)} unit="kg/yr" />
            <Stat label="Revenue per cycle" value={fmtMoney(revCycle)} tone="muted" />
            <Stat label="Annual revenue" value={fmtMoney(revAnnual)} />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <CaveatNote>
          Growth rate is the whole game — it swings with light (DLI), CO₂, temperature, and
          cultivar, so treat this as a planning envelope, not a promise. Revenue here is gross:
          no seed, nutrient, labor, or electricity costs are subtracted.
        </CaveatNote>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Is your light actually delivering the DLI this assumes?{" "}
        <Link href="/calculators/ppfd" className="font-medium text-accent-700 hover:underline">
          Check PPFD &amp; DLI →
        </Link>
      </p>
    </div>
  );
}
