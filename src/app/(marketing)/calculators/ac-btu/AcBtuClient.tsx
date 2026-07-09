"use client";

import { useState } from "react";
import Link from "next/link";
import { acHeatLoadW, acSizing } from "@/lib/calc/hvac";
import { Card, CardHeader, Kicker, CaveatNote, Stat, UnitValue } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { fmt, fmtInt } from "@/lib/format";

const STANDARD_BTU = [5000, 6000, 8000, 10000, 12000, 15000, 18000, 24000, 36000];

export function AcBtuClient() {
  const [lights, setLights] = useState("600");
  const [equipment, setEquipment] = useState("150");
  const [dehumidifier, setDehumidifier] = useState("0");

  const loadW = acHeatLoadW({
    lightsW: parseFloat(lights) || 0,
    equipmentW: parseFloat(equipment) || 0,
    dehumidifierW: parseFloat(dehumidifier) || 0,
  });
  const sized = acSizing(loadW);
  const standard = STANDARD_BTU.find((b) => b >= sized.btuh);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Kicker>Free calculator</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        AC / BTU sizing calculator
      </h1>
      <p className="mt-2 text-neutral-600">
        In a sealed grow room, every electrical watt becomes heat the AC must pump back out —
        lights, fans, pumps, and especially the dehumidifier, which returns all its power to the
        room as warmth.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Heat sources" />
          <div className="space-y-4 p-5">
            <Field label="Grow lights (total draw)" unit="W">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={lights}
                onChange={(e) => setLights(e.target.value)}
              />
            </Field>

            <Field
              label="Other equipment"
              unit="W"
              hint="Fans, pumps, controllers, CO₂ gear — everything else that draws power in the room."
            >
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
              />
            </Field>

            <Field
              label="Dehumidifier"
              unit="W"
              hint="Compressor dehumidifiers add their full draw as heat while running."
            >
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={dehumidifier}
                onChange={(e) => setDehumidifier(e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Result" subtitle="Includes a 1.2× safety factor" />
          <div className="space-y-5 p-5">
            <div>
              <div className="text-xs font-medium text-neutral-500">Cooling capacity needed</div>
              <UnitValue value={fmtInt(sized.btuh)} unit="BTU/hr" size="xl" />
              <div className="mt-0.5 text-xs text-neutral-400">
                = {fmt(sized.tons, 2)} tons = {fmt(sized.kw, 1)} kW of cooling
              </div>
            </div>
            <Stat label="Raw heat load" value={fmtInt(loadW)} unit="W" tone="muted" />
            <div className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-500">
              {standard ? (
                <>
                  Nearest standard unit:{" "}
                  <strong className="num">{fmtInt(standard)}</strong> BTU/hr. Mildly oversized is
                  fine — grossly oversized short-cycles and dehumidifies poorly.
                </>
              ) : (
                <>Above common single-unit sizes — consider multiple units or a split system.</>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <CaveatNote>
          This covers equipment heat only. Sun-exposed rooms, hot climates, poor insulation, or
          heat-throwing gear in adjacent spaces add load a full Manual-J calculation would catch.
          If the room is vented rather than sealed, the exhaust fan removes much of the light heat
          first.
        </CaveatNote>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Venting instead of sealing?{" "}
        <Link
          href="/calculators/ventilation"
          className="font-medium text-accent-700 hover:underline"
        >
          Size the exhaust fan →
        </Link>{" "}
        Curious what the AC adds to the bill?{" "}
        <Link
          href="/calculators/electricity"
          className="font-medium text-accent-700 hover:underline"
        >
          Electricity cost →
        </Link>
      </p>
    </div>
  );
}
