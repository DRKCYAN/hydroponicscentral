"use client";

import { useState } from "react";
import Link from "next/link";
import { humidifierLoadLDay, humidifierInitialChargeL } from "@/lib/calc/hvac";
import { ft3ToM3, lToGal } from "@/lib/calc/units";
import { Card, CardHeader, Kicker, CaveatNote, Stat, UnitValue } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { fmt } from "@/lib/format";

export function HumidifierClient() {
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("10");
  const [height, setHeight] = useState("8");
  const [temp, setTemp] = useState("25");
  const [rhCurrent, setRhCurrent] = useState("40");
  const [rhTarget, setRhTarget] = useState("65");
  const [ach, setAch] = useState("1");

  const volFt3 = (parseFloat(length) || 0) * (parseFloat(width) || 0) * (parseFloat(height) || 0);
  const volM3 = ft3ToM3(volFt3);
  const tC = parseFloat(temp) || 0;
  const cur = parseFloat(rhCurrent) || 0;
  const tgt = parseFloat(rhTarget) || 0;
  const achV = parseFloat(ach) || 0;

  const loadLDay = humidifierLoadLDay(volM3, achV, tC, cur, tgt);
  const chargeL = humidifierInitialChargeL(volM3, tC, cur, tgt);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Kicker>Free calculator</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        Humidifier sizing calculator
      </h1>
      <p className="mt-2 text-neutral-600">
        A humidifier isn&apos;t filling the room once — it&apos;s replacing the moisture that
        every air exchange carries away. The output you need scales with room volume, the RH gap,
        and how leaky the space is.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Room & setpoint" />
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Length" unit="ft">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
              </Field>
              <Field label="Width" unit="ft">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                />
              </Field>
              <Field label="Height" unit="ft">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </Field>
            </div>

            <Field label="Air temperature" unit="°C" hint="77 °F = 25 °C. Warm air holds more water, so the same RH gap costs more at higher temps.">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Current RH" unit="%">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={rhCurrent}
                  onChange={(e) => setRhCurrent(e.target.value)}
                />
              </Field>
              <Field label="Target RH" unit="%">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={rhTarget}
                  onChange={(e) => setRhTarget(e.target.value)}
                />
              </Field>
            </div>

            <Field
              label="Air exchanges per hour"
              unit="ACH"
              hint="Sealed room ≈ 0.5–1, tent with passive intakes ≈ 2–5, active exhaust far higher."
            >
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={ach}
                onChange={(e) => setAch(e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Result"
            subtitle={`Room volume ${fmt(volFt3, 0)} ft³ (${fmt(volM3, 1)} m³)`}
          />
          <div className="space-y-5 p-5">
            <div>
              <div className="text-xs font-medium text-neutral-500">
                Output to hold {fmt(tgt, 0)}% RH
              </div>
              <UnitValue value={fmt(loadLDay, 1)} unit="L/day" size="xl" />
              <div className="mt-0.5 text-xs text-neutral-400">
                = {fmt(lToGal(loadLDay), 1)} gal/day
              </div>
            </div>
            <Stat
              label="One-time charge to raise the air"
              value={fmt(chargeL * 1000, 0)}
              unit="mL"
              tone="muted"
              hint="Tiny compared to the ongoing load — leakage is the real bill."
            />
            <div className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-500">
              Shop for a unit rated ~20% above this (
              <strong className="num">{fmt(loadLDay * 1.2, 1)}</strong> L/day) so it can cycle
              rather than run flat out — and expect transpiring plants to shrink the load as the
              canopy fills in.
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <CaveatNote>
          Assumes make-up air enters at room temperature and your current RH. In winter, infiltrating
          air is colder and much drier once heated, so real demand runs higher than this estimate —
          size up if you heat.
        </CaveatNote>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Chasing an RH number? What actually matters is{" "}
        <Link href="/calculators/vpd" className="font-medium text-accent-700 hover:underline">
          VPD — calculate it here →
        </Link>
      </p>
    </div>
  );
}
