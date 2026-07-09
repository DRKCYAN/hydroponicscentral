"use client";

import { useState } from "react";
import Link from "next/link";
import {
  pumpGphForTurnover,
  emitterTotalGph,
  requiredPumpGph,
  totalDynamicHeadFt,
} from "@/lib/calc/irrigation";
import { gphToLh } from "@/lib/calc/units";
import { Card, CardHeader, Kicker, CaveatNote, Stat, UnitValue } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { fmt, fmtInt } from "@/lib/format";

export function PumpFlowClient() {
  const [reservoir, setReservoir] = useState("50");
  const [turnovers, setTurnovers] = useState("1");
  const [emitters, setEmitters] = useState("12");
  const [gphEach, setGphEach] = useState("0.5");
  const [lift, setLift] = useState("4");
  const [friction, setFriction] = useState("2");

  const turnoverGph = pumpGphForTurnover(parseFloat(reservoir) || 0, parseFloat(turnovers) || 0);
  const emitterGph = emitterTotalGph(parseFloat(emitters) || 0, parseFloat(gphEach) || 0);
  const required = requiredPumpGph(turnoverGph, emitterGph);
  const headFt = totalDynamicHeadFt(parseFloat(lift) || 0, parseFloat(friction) || 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Kicker>Free calculator</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        Pump &amp; irrigation flow rate calculator
      </h1>
      <p className="mt-2 text-neutral-600">
        A pump has to satisfy two demands — turning the reservoir over for oxygen and mixing, and
        feeding every emitter at once — and it has to do it at height, where its rated GPH has
        already fallen off.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="System demands" />
          <div className="space-y-4 p-5">
            <Field label="Reservoir volume" unit="gal">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={reservoir}
                onChange={(e) => setReservoir(e.target.value)}
              />
            </Field>

            <Field
              label="Turnovers per hour"
              unit="×/h"
              hint="Recirculating systems typically cycle the full reservoir 1–2× per hour."
            >
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={turnovers}
                onChange={(e) => setTurnovers(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Emitters / drippers" unit="count">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={emitters}
                  onChange={(e) => setEmitters(e.target.value)}
                />
              </Field>
              <Field label="Flow per emitter" unit="GPH">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={gphEach}
                  onChange={(e) => setGphEach(e.target.value)}
                />
              </Field>
            </div>

            <Field
              label="Vertical lift"
              unit="ft"
              hint="Water surface in the reservoir up to the highest outlet."
            >
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={lift}
                onChange={(e) => setLift(e.target.value)}
              />
            </Field>

            <Field
              label="Friction allowance"
              unit="ft"
              hint="Rule of thumb: ~1 ft per 10 ft of tubing run plus ~1 ft per sharp elbow or inline filter."
            >
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={friction}
                onChange={(e) => setFriction(e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Result" subtitle="Includes a 1.2× wear & clogging factor" />
          <div className="space-y-5 p-5">
            <div>
              <div className="text-xs font-medium text-neutral-500">
                Pump delivery needed at {fmt(headFt, 1)} ft of head
              </div>
              <UnitValue value={fmtInt(required)} unit="GPH" size="xl" />
              <div className="mt-0.5 text-xs text-neutral-400">
                = {fmtInt(gphToLh(required))} L/h
              </div>
            </div>
            <Stat
              label="Reservoir turnover demand"
              value={fmtInt(turnoverGph)}
              unit="GPH"
              tone="muted"
            />
            <Stat
              label="Emitter demand"
              value={fmtInt(emitterGph)}
              unit="GPH"
              tone="muted"
              hint="The pump is sized to the larger of the two demands."
            />
            <div className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-500">
              Check the pump&apos;s <strong>flow-at-height curve</strong>, not the headline GPH:
              it must still deliver {fmtInt(required)} GPH at{" "}
              <strong className="num">{fmt(headFt, 1)}</strong> ft. Max-head ratings mean zero
              flow at that height.
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <CaveatNote>
          The friction allowance is a flat estimate, not a hydraulic calculation — long runs of
          narrow tubing, drip manifolds, and venturis can lose far more. When in doubt, one pump
          size up costs a few watts; an undersized pump starves the far emitters first, silently.
        </CaveatNote>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Now that the water moves — what&apos;s in it?{" "}
        <Link
          href="/calculators/recipe-solver"
          className="font-medium text-accent-700 hover:underline"
        >
          Solve your nutrient recipe →
        </Link>
      </p>
    </div>
  );
}
