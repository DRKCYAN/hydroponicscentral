"use client";

import { useState } from "react";
import Link from "next/link";
import { EC_SCALE, type EcScale } from "@/lib/calc/constants";
import { ecToPpm, ppmToEc, ecTempCorrect, EC_SCALE_LABEL } from "@/lib/calc/ecppm";
import { Card, CardHeader, Kicker, CaveatNote, UnitValue } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { fmt } from "@/lib/format";

export default function EcPpmCalculator() {
  const [mode, setMode] = useState<"ec" | "ppm">("ec");
  const [value, setValue] = useState("1.8");
  const [scale, setScale] = useState<EcScale>("ppm500");
  const [temp, setTemp] = useState("");

  const v = parseFloat(value) || 0;
  const tempC = temp === "" ? null : parseFloat(temp);

  // Working EC at 25°C (apply temp correction if a temp is given and mode is EC).
  let ec25: number;
  let ppm: number;
  if (mode === "ec") {
    ec25 = tempC != null ? ecTempCorrect(v, tempC) : v;
    ppm = ecToPpm(ec25, scale);
  } else {
    ec25 = ppmToEc(v, scale);
    ppm = v;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Kicker>Free calculator</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        EC ↔ ppm / TDS converter
      </h1>
      <p className="mt-2 text-neutral-600">
        Meters report either EC or a “ppm” that is just EC scaled by a standard. There is no single
        true conversion — it depends on the meter&apos;s scale, so always store which scale a ppm
        value came from.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Input" />
          <div className="space-y-4 p-5">
            <div className="inline-flex rounded-md border border-neutral-300 p-0.5 text-sm">
              {(["ec", "ppm"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded px-3 py-1 font-medium ${
                    mode === m ? "bg-accent-600 text-neutral-0" : "text-neutral-600"
                  }`}
                >
                  {m === "ec" ? "I have EC" : "I have ppm"}
                </button>
              ))}
            </div>

            <Field label={mode === "ec" ? "EC reading" : "ppm reading"} unit={mode === "ec" ? "mS/cm" : "ppm"}>
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </Field>

            <Field label="Meter scale (ppm standard)">
              <select
                className={inputClass}
                value={scale}
                onChange={(e) => setScale(e.target.value as EcScale)}
              >
                {(Object.keys(EC_SCALE) as EcScale[]).map((s) => (
                  <option key={s} value={s}>
                    {EC_SCALE_LABEL[s]}
                  </option>
                ))}
              </select>
            </Field>

            {mode === "ec" && (
              <Field
                label="Solution temperature (optional)"
                unit="°C"
                hint="Corrects a raw reading back to 25 °C. Leave blank if your meter auto-compensates."
              >
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  placeholder="25"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                />
              </Field>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Result" subtitle="Converted on the selected meter scale" />
          <div className="space-y-5 p-5">
            <div>
              <div className="text-xs font-medium text-neutral-500">EC (at 25 °C)</div>
              <UnitValue value={fmt(ec25, 2)} unit="mS/cm" size="xl" />
              <div className="mt-0.5 text-xs text-neutral-400">
                = {fmt(ec25 * 1000, 0)} µS/cm = {fmt(ec25, 2)} dS/m
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-neutral-500">
                TDS / ppm on {EC_SCALE[scale]} scale
              </div>
              <UnitValue value={fmt(ppm, 0)} unit="ppm" size="xl" />
            </div>
            <div className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-500">
              Other scales:{" "}
              {(Object.keys(EC_SCALE) as EcScale[])
                .map((s) => `${fmt(ecToPpm(ec25, s), 0)} (${EC_SCALE[s]})`)
                .join(" · ")}{" "}
              ppm
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <CaveatNote>
          1000 ppm on a 500-scale meter is <strong>not</strong> 1000 ppm on a 700-scale meter. When
          you share or store a ppm number, record the scale alongside it — otherwise the value is
          ambiguous by up to 40%.
        </CaveatNote>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Need to actually mix to a target?{" "}
        <Link href="/calculators/recipe-solver" className="font-medium text-accent-700 hover:underline">
          Try the recipe solver →
        </Link>
      </p>
    </div>
  );
}
