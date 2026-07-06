"use client";

import { useState } from "react";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, Button, CaveatNote, UnitValue } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { FERTILIZERS } from "@/lib/data/fertilizers";
import { decodeLabel } from "@/lib/calc/fertilizer";
import { fmt } from "@/lib/format";

const ELS = ["N", "P", "K", "Ca", "Mg", "S", "Cl"] as const;

export default function FertilizerLibraryPage() {
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const rows = FERTILIZERS.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Workspace>
      <PageHeader
        verb="Configure"
        title="Fertilizer Library"
        description="Define the salts available to the solver. The critical job: decode a label (oxides) into the elemental fractions every ppm calc needs."
        actions={<Button onClick={() => setShowAdd((s) => !s)}>{showAdd ? "Close" : "+ Add custom"}</Button>}
      />

      {showAdd && <AddCustomForm />}

      <div className="mb-4">
        <input
          className={`${inputClass} max-w-sm`}
          placeholder="Search fertilizers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs text-neutral-400">
                <th className="px-5 py-3 font-medium">Fertilizer</th>
                <th className="px-3 py-3 font-medium">Label</th>
                <th className="px-3 py-3 font-medium">Form</th>
                {ELS.map((e) => (
                  <th key={e} className="px-2 py-3 text-right font-medium">
                    {e}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((f) => (
                <tr key={f.id} className="align-top hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-neutral-800">{f.name}</div>
                    <div className="text-xs text-neutral-400">{f.formula}</div>
                  </td>
                  <td className="px-3 py-3 text-neutral-600">{f.label}</td>
                  <td className="px-3 py-3">
                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                      {f.hydration}
                    </span>
                  </td>
                  {ELS.map((e) => (
                    <td key={e} className="px-2 py-3 text-right num text-neutral-700">
                      {(f.fractions[e] ?? 0) > 0 ? fmt((f.fractions[e] ?? 0) * 100, 1) : "·"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Safety notes travel with the library, always visible */}
      <div className="mt-4 space-y-2">
        {FERTILIZERS.filter((f) => f.safety).slice(0, 3).map((f) => (
          <CaveatNote key={f.id}>
            <strong>{f.name.split(" (")[0]}:</strong> {f.safety}
          </CaveatNote>
        ))}
      </div>
    </Workspace>
  );
}

function AddCustomForm() {
  const [vals, setVals] = useState({ name: "", N: "", P2O5: "", K2O: "", CaO: "", MgO: "", SO3: "" });
  const num = (k: keyof typeof vals) => parseFloat(vals[k] as string) || 0;
  const decoded = decodeLabel({
    N: num("N"),
    P2O5: num("P2O5"),
    K2O: num("K2O"),
    CaO: num("CaO"),
    MgO: num("MgO"),
    SO3: num("SO3"),
  });

  return (
    <Card className="mb-6">
      <CardHeader title="Add a custom fertilizer" subtitle="Enter the label; we decode oxides → elemental" />
      <div className="p-5">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Product name">
            <input className={inputClass} value={vals.name} onChange={(e) => setVals({ ...vals, name: e.target.value })} />
          </Field>
          {(["N", "P2O5", "K2O", "CaO", "MgO", "SO3"] as const).map((k) => (
            <Field key={k} label={k.replace("2O5", "₂O₅").replace("2O", "₂O").replace("O3", "O₃")} unit="%">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={vals[k]}
                onChange={(e) => setVals({ ...vals, [k]: e.target.value })}
              />
            </Field>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2 rounded-md bg-neutral-50 p-3">
          <span className="text-xs font-medium text-neutral-500">Decoded elemental:</span>
          {(["N", "P", "K", "Ca", "Mg", "S"] as const).map((e) => (
            <div key={e}>
              <span className="text-xs text-neutral-400">{e} </span>
              <UnitValue value={fmt(decoded[e], 2)} unit="%" size="sm" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <CaveatNote>
            Enter %element for the <strong>actual product form you buy</strong> (hydrated salt), not
            the anhydrous salt. When the label and a reference table disagree, trust the label.
          </CaveatNote>
        </div>
        <div className="mt-4">
          <Button>Save to library</Button>
        </div>
      </div>
    </Card>
  );
}
