"use client";

import { useState } from "react";
import Link from "next/link";
import {
  co2MassForChange,
  co2LossAirExchange,
  co2TimeToSetpoint,
} from "@/lib/calc/psychro";
import { ft3ToM3 } from "@/lib/calc/units";
import { Card, CardHeader, Kicker, CaveatNote, Stat, UnitValue } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { fmt } from "@/lib/format";

const TANK_20LB_G = 9072; // 20 lb CO2 tank

export function Co2Client() {
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("10");
  const [height, setHeight] = useState("8");
  const [ambient, setAmbient] = useState("420");
  const [target, setTarget] = useState("1200");
  const [ach, setAch] = useState("1");
  const [injector, setInjector] = useState("");

  const volFt3 = (parseFloat(length) || 0) * (parseFloat(width) || 0) * (parseFloat(height) || 0);
  const volM3 = ft3ToM3(volFt3);
  const ambientPpm = parseFloat(ambient) || 0;
  const targetPpm = parseFloat(target) || 0;
  const achV = parseFloat(ach) || 0;
  const injectorGh = parseFloat(injector) || 0;

  const deltaPpm = Math.max(0, targetPpm - ambientPpm);
  const massG = co2MassForChange(deltaPpm, volM3);
  const lossGh = co2LossAirExchange(achV * volM3, targetPpm, ambientPpm);
  const timeH = co2TimeToSetpoint(massG, injectorGh);
  const tankDays = lossGh > 0 ? TANK_20LB_G / (lossGh * 24) : Infinity;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Kicker>Free calculator</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        Grow room CO₂ calculator
      </h1>
      <p className="mt-2 text-neutral-600">
        Enrichment is two problems: the one-time charge to raise the room to setpoint, and the
        continuous top-up that replaces what leaks out with every air exchange. The leak usually
        costs more than the charge.
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

            <Field label="Ambient / starting CO₂" unit="ppm" hint="Outdoor air is ~420 ppm.">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={ambient}
                onChange={(e) => setAmbient(e.target.value)}
              />
            </Field>

            <Field label="Target CO₂" unit="ppm">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </Field>

            <Field
              label="Air exchanges per hour"
              unit="ACH"
              hint="Sealed room ≈ 0.5–1. Anything with an exhaust fan running is far higher: enrichment fights the fan."
            >
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={ach}
                onChange={(e) => setAch(e.target.value)}
              />
            </Field>

            <Field label="Injector / generator rate (optional)" unit="g/h">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                placeholder="e.g. 300"
                value={injector}
                onChange={(e) => setInjector(e.target.value)}
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
                CO₂ to raise room {fmt(ambientPpm, 0)} → {fmt(targetPpm, 0)} ppm
              </div>
              <UnitValue value={fmt(massG, 0)} unit="g" size="xl" />
              <div className="mt-0.5 text-xs text-neutral-400">
                = {fmt(massG / 453.6, 2)} lb of tank CO₂
              </div>
            </div>
            <Stat
              label="Ongoing loss to air exchange"
              value={fmt(lossGh, 0)}
              unit="g/h"
              hint={`≈ ${fmt((lossGh * 24) / 453.6, 1)} lb/day held at setpoint`}
            />
            <Stat
              label="Time to setpoint at injector rate"
              value={timeH === Infinity ? "-" : fmt(timeH * 60, 0)}
              unit={timeH === Infinity ? undefined : "min"}
              tone="muted"
              hint={injectorGh > 0 ? undefined : "Enter an injector rate to estimate this."}
            />
            <div className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-500">
              A 20 lb tank ({fmt(TANK_20LB_G / 1000, 1)} kg) holds setpoint for roughly{" "}
              <strong className="num">{tankDays === Infinity ? "-" : fmt(tankDays, 1)}</strong>{" "}
              days, plus another {fmt(massG, 0)} g each time you vent and re-enrich.
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <CaveatNote>
          Plants consume CO₂ too (roughly 20–50 g/h per kW of light at full canopy), so real usage
          runs above the leakage-only estimate. Never enrich an occupied sealed room without a
          monitor: 5,000 ppm is the workplace exposure limit.
        </CaveatNote>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Exhausting air you just enriched?{" "}
        <Link
          href="/calculators/ventilation"
          className="font-medium text-accent-700 hover:underline"
        >
          Check your fan CFM →
        </Link>
      </p>
    </div>
  );
}
