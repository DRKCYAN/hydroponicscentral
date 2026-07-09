"use client";

import { useState } from "react";
import Link from "next/link";
import { decodeLabel, elementContributionPpm } from "@/lib/calc/fertilizer";
import { Card, CardHeader, Kicker, CaveatNote, UnitValue } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { fmt } from "@/lib/format";

type Key = "N" | "P2O5" | "K2O" | "CaO" | "MgO" | "SO3";
const FIELDS: { key: Key; label: string; note: string }[] = [
  { key: "N", label: "N", note: "already elemental" },
  { key: "P2O5", label: "P₂O₅", note: "→ P × 0.4364" },
  { key: "K2O", label: "K₂O", note: "→ K × 0.8301" },
  { key: "CaO", label: "CaO", note: "→ Ca × 0.7147" },
  { key: "MgO", label: "MgO", note: "→ Mg × 0.6032" },
  { key: "SO3", label: "SO₃", note: "→ S × 0.4005" },
];

export function LabelDecoderClient() {
  const [vals, setVals] = useState<Record<Key, string>>({
    N: "4",
    P2O5: "18",
    K2O: "38",
    CaO: "0",
    MgO: "0",
    SO3: "0",
  });
  const [volume, setVolume] = useState("1");
  const [grams, setGrams] = useState("1");

  const num = (k: Key) => parseFloat(vals[k]) || 0;
  const decoded = decodeLabel({
    N: num("N"),
    P2O5: num("P2O5"),
    K2O: num("K2O"),
    CaO: num("CaO"),
    MgO: num("MgO"),
    SO3: num("SO3"),
  });
  const vol = parseFloat(volume) || 1;
  const g = parseFloat(grams) || 0;

  const rows: { el: string; label: string; pct: number }[] = [
    { el: "N", label: "Nitrogen (N)", pct: decoded.N },
    { el: "P", label: "Phosphorus (P)", pct: decoded.P },
    { el: "K", label: "Potassium (K)", pct: decoded.K },
    { el: "Ca", label: "Calcium (Ca)", pct: decoded.Ca },
    { el: "Mg", label: "Magnesium (Mg)", pct: decoded.Mg },
    { el: "S", label: "Sulfur (S)", pct: decoded.S },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Kicker>Free calculator</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        Fertilizer label decoder (oxide → elemental)
      </h1>
      <p className="mt-2 text-neutral-600">
        A guaranteed-analysis label reports P and K as oxides (P₂O₅, K₂O). Every ppm calculation
        needs the <em>elemental</em> fraction. Enter the label numbers to decode them. Do this
        first, before any dosing math.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Guaranteed analysis (label %)" />
          <div className="grid grid-cols-2 gap-4 p-5">
            {FIELDS.map((f) => (
              <Field key={f.key} label={f.label} unit="%" hint={f.note}>
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={vals[f.key]}
                  onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
                />
              </Field>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Elemental composition" subtitle="What the ppm engine actually uses" />
          <div className="p-5">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-neutral-100">
                {rows.map((r) => (
                  <tr key={r.el}>
                    <td className="py-2 text-neutral-600">{r.label}</td>
                    <td className="py-2 text-right">
                      <UnitValue value={fmt(r.pct, 2)} unit="%" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="ppm preview" subtitle="Concentration if you dissolve this product [II-3.1]" />
        <div className="flex flex-wrap items-end gap-4 p-5">
          <Field label="Mass" unit="g">
            <input
              className={`${inputClass} num w-28`}
              inputMode="decimal"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
          </Field>
          <Field label="Volume" unit="L">
            <input
              className={`${inputClass} num w-28`}
              inputMode="decimal"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            />
          </Field>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {rows
              .filter((r) => r.pct > 0)
              .map((r) => (
                <div key={r.el}>
                  <div className="text-xs text-neutral-500">{r.el}</div>
                  <UnitValue value={fmt(elementContributionPpm(g, r.pct, vol), 1)} unit="ppm" />
                </div>
              ))}
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <CaveatNote>
          Store %element for the <strong>actual product form you buy</strong> (the hydrated salt),
          not the anhydrous salt. Epsom salt is MgSO₄·7H₂O at 9.9% Mg: the anhydrous figure (20.2%)
          would halve your weigh-out. When the label and a table disagree, trust the label.
        </CaveatNote>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Ready to hit a target profile?{" "}
        <Link href="/calculators/recipe-solver" className="font-medium text-accent-700 hover:underline">
          Open the recipe solver →
        </Link>
      </p>
    </div>
  );
}
