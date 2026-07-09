"use client";

import { useState } from "react";
import Link from "next/link";
import { ventilationBaseCfm, ventilationRequiredCfm } from "@/lib/calc/hvac";
import { cfmToM3h } from "@/lib/calc/units";
import { Card, CardHeader, Kicker, CaveatNote, Stat, UnitValue } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { fmt, fmtInt } from "@/lib/format";

export function VentilationClient() {
  const [length, setLength] = useState("4");
  const [width, setWidth] = useState("4");
  const [height, setHeight] = useState("6.5");
  const [minutes, setMinutes] = useState("3");
  const [filter, setFilter] = useState(true);
  const [longDuct, setLongDuct] = useState(false);
  const [hotLights, setHotLights] = useState(false);

  const volFt3 = (parseFloat(length) || 0) * (parseFloat(width) || 0) * (parseFloat(height) || 0);
  const base = ventilationBaseCfm(volFt3, parseFloat(minutes) || 0);
  const required = ventilationRequiredCfm(base, {
    filter: filter ? 1.25 : 1.0,
    ducting: longDuct ? 1.2 : 1.0,
    heat: hotLights ? 1.1 : 1.0,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Kicker>Free calculator</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        Ventilation &amp; carbon filter CFM calculator
      </h1>
      <p className="mt-2 text-neutral-600">
        Fans are rated in free air, but a carbon filter and every duct bend push the fan up its
        pressure curve where it moves less. Size from the room, then derate for what&apos;s bolted
        to the fan.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Space & restrictions" />
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

            <Field
              label="Minutes per full air exchange"
              unit="min"
              hint="1–3 minutes is the usual grow-space target; heat-heavy rooms aim for 1."
            >
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </Field>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={filter}
                  onChange={(e) => setFilter(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-accent-600)]"
                />
                Carbon filter inline (+25%)
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={longDuct}
                  onChange={(e) => setLongDuct(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-accent-600)]"
                />
                Long or bendy ducting (+20%)
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={hotLights}
                  onChange={(e) => setHotLights(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-accent-600)]"
                />
                High heat load / hot climate (+10%)
              </label>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Result"
            subtitle={`Room volume ${fmt(volFt3, 0)} ft³`}
          />
          <div className="space-y-5 p-5">
            <div>
              <div className="text-xs font-medium text-neutral-500">Fan rating to shop for</div>
              <UnitValue value={fmtInt(required)} unit="CFM" size="xl" />
              <div className="mt-0.5 text-xs text-neutral-400">
                = {fmtInt(cfmToM3h(required))} m³/h
              </div>
            </div>
            <Stat
              label="Base exchange requirement"
              value={fmtInt(base)}
              unit="CFM"
              tone="muted"
              hint={`One full exchange every ${minutes || "-"} min`}
            />
            <div className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-500">
              Pick a carbon filter <strong>rated at or above</strong> the fan&apos;s CFM: an
              undersized filter chokes the fan and lets odor slip through at high flow.
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <CaveatNote>
          Percentages are rules of thumb, not duct engineering. A speed-controlled fan one size up
          beats an exact-size fan at full throttle, quieter, and you keep headroom for a clogged
          filter (they load up over months). Running CO₂ enrichment? Exhausting during lights-on
          throws that money away.
        </CaveatNote>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Sealed room instead of vented?{" "}
        <Link href="/calculators/ac-btu" className="font-medium text-accent-700 hover:underline">
          Size the AC →
        </Link>{" "}
        and{" "}
        <Link href="/calculators/co2" className="font-medium text-accent-700 hover:underline">
          the CO₂ system →
        </Link>
      </p>
    </div>
  );
}
