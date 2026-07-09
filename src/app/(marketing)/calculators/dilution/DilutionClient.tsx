"use client";

import { useState } from "react";
import Link from "next/link";
import {
  dilutionSolve,
  concentrationFactor,
  injectorStockConcentration,
  type InjectorConvention,
} from "@/lib/calc/stock";
import { Card, CardHeader, Kicker, CaveatNote, Stat, UnitValue } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { fmt } from "@/lib/format";

type DilutionKey = "c1" | "v1" | "c2" | "v2";
const KEY_LABEL: Record<DilutionKey, { short: string; long: string; unit: string }> = {
  c1: { short: "C₁", long: "Stock concentration", unit: "ppm / EC" },
  v1: { short: "V₁", long: "Stock volume", unit: "L / gal" },
  c2: { short: "C₂", long: "Final concentration", unit: "ppm / EC" },
  v2: { short: "V₂", long: "Final volume", unit: "L / gal" },
};

export function DilutionClient() {
  const [solveFor, setSolveFor] = useState<DilutionKey>("v1");
  const [values, setValues] = useState<Record<DilutionKey, string>>({
    c1: "10000",
    v1: "",
    c2: "800",
    v2: "100",
  });

  const [working, setWorking] = useState("800");
  const [ratio, setRatio] = useState("100");
  const [convention, setConvention] = useState<InjectorConvention>("A");

  const parsed = Object.fromEntries(
    (Object.keys(values) as DilutionKey[]).map((k) => [
      k,
      k === solveFor ? undefined : parseFloat(values[k]) || 0,
    ]),
  ) as { [K in DilutionKey]?: number };

  const solved = dilutionSolve(parsed);
  const full = { ...parsed, [solved.key]: solved.value } as Record<DilutionKey, number>;
  const cf = full.c2 > 0 ? concentrationFactor(full.c1, full.c2) : Infinity;

  const workingC = parseFloat(working) || 0;
  const r = parseFloat(ratio) || 0;
  const stockC = injectorStockConcentration(workingC, r, convention);
  const injectorCf = workingC > 0 ? concentrationFactor(stockC, workingC) : Infinity;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Kicker>Free calculator</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        Dilution &amp; injector calculator
      </h1>
      <p className="mt-2 text-neutral-600">
        Every dilution is the same equation — C₁V₁ = C₂V₂. Pick the value you don&apos;t know,
        enter the other three in whatever units you use (just keep them consistent), and read the
        answer.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Dilute a solution" subtitle="C₁V₁ = C₂V₂" />
          <div className="space-y-4 p-5">
            <div>
              <span className="mb-1 block text-xs font-medium text-neutral-600">Solve for</span>
              <div className="inline-flex rounded-md border border-neutral-300 p-0.5 text-sm">
                {(Object.keys(KEY_LABEL) as DilutionKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSolveFor(k)}
                    className={`rounded px-3 py-1 font-medium ${
                      solveFor === k ? "bg-accent-600 text-neutral-0" : "text-neutral-600"
                    }`}
                  >
                    {KEY_LABEL[k].short}
                  </button>
                ))}
              </div>
            </div>

            {(Object.keys(KEY_LABEL) as DilutionKey[])
              .filter((k) => k !== solveFor)
              .map((k) => (
                <Field
                  key={k}
                  label={`${KEY_LABEL[k].long} (${KEY_LABEL[k].short})`}
                  unit={KEY_LABEL[k].unit}
                >
                  <input
                    className={`${inputClass} num`}
                    inputMode="decimal"
                    value={values[k]}
                    onChange={(e) => setValues((v) => ({ ...v, [k]: e.target.value }))}
                  />
                </Field>
              ))}

            <div className="rounded-md bg-neutral-50 p-4">
              <div className="text-xs font-medium text-neutral-500">
                {KEY_LABEL[solved.key].long} ({KEY_LABEL[solved.key].short})
              </div>
              <UnitValue
                value={fmt(solved.value, solved.value < 10 ? 2 : 1)}
                unit={KEY_LABEL[solved.key].unit}
                size="xl"
              />
              <div className="mt-0.5 text-xs text-neutral-400">
                Concentration factor {cf === Infinity ? "—" : `${fmt(cf, 0)}×`}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Injector / Dosatron sizing" subtitle="Stock strength for a 1:R ratio" />
          <div className="space-y-4 p-5">
            <Field label="Working (target) concentration" unit="ppm / EC">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={working}
                onChange={(e) => setWorking(e.target.value)}
              />
            </Field>

            <Field label="Injector ratio (1 : R)">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
              />
            </Field>

            <Field label="Ratio convention" hint="This changes the math, not just the label.">
              <select
                className={inputClass}
                value={convention}
                onChange={(e) => setConvention(e.target.value as InjectorConvention)}
              >
                <option value="A">A — 1 part concentrate : R parts water</option>
                <option value="B">B — 1 : R of the final solution</option>
              </select>
            </Field>

            <div className="rounded-md bg-neutral-50 p-4">
              <div className="text-xs font-medium text-neutral-500">
                Required stock concentration
              </div>
              <UnitValue value={fmt(stockC, 0)} unit="ppm / EC" size="xl" />
              <div className="mt-0.5 text-xs text-neutral-400">
                = {injectorCf === Infinity ? "—" : `${fmt(injectorCf, 0)}×`} the working strength
              </div>
            </div>

            <Stat
              label="Convention difference at this ratio"
              value={fmt(Math.abs(workingC), 0)}
              unit="ppm / EC"
              tone="muted"
              hint="Mixing to the wrong convention misses by exactly one working-strength unit."
            />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <CaveatNote>
          Check which convention your injector&apos;s manual uses before mixing stock — “1:100”
          means different math on different brands (C×101 vs C×100). At high concentration
          factors, also watch salt solubility limits in the stock tank.
        </CaveatNote>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Need the recipe itself, not just the dilution?{" "}
        <Link
          href="/calculators/recipe-solver"
          className="font-medium text-accent-700 hover:underline"
        >
          Try the recipe solver →
        </Link>
      </p>
    </div>
  );
}
