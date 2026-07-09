"use client";

import { useState } from "react";
import Link from "next/link";
import { electricityCost } from "@/lib/calc/economics";
import {
  Card,
  CardHeader,
  Kicker,
  CaveatNote,
  Stat,
  UnitValue,
  Button,
} from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { fmt, fmtMoney } from "@/lib/format";

interface DeviceRow {
  id: number;
  name: string;
  watts: string;
  hours: string;
}

const STARTER_ROWS: DeviceRow[] = [
  { id: 1, name: "Grow light", watts: "600", hours: "12" },
  { id: 2, name: "Inline fan", watts: "60", hours: "24" },
  { id: 3, name: "Water pump", watts: "40", hours: "24" },
];

export function ElectricityClient() {
  const [rows, setRows] = useState<DeviceRow[]>(STARTER_ROWS);
  const [nextId, setNextId] = useState(4);
  const [rate, setRate] = useState("0.17");
  const [cycleDays, setCycleDays] = useState("60");
  const [includeAc, setIncludeAc] = useState(false);
  const [cop, setCop] = useState("3");

  function updateRow(id: number, patch: Partial<DeviceRow>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((rs) => [...rs, { id: nextId, name: "", watts: "", hours: "" }]);
    setNextId((n) => n + 1);
  }
  function removeRow(id: number) {
    setRows((rs) => rs.filter((r) => r.id !== id));
  }

  const ratePerKwh = parseFloat(rate) || 0;
  const days = parseFloat(cycleDays) || 0;
  const copV = parseFloat(cop) || 0;

  const dailyKwh = rows.reduce(
    (s, r) => s + ((parseFloat(r.watts) || 0) * (parseFloat(r.hours) || 0)) / 1000,
    0,
  );
  // Indoors, every watt the devices draw ends up as heat the AC must pump out.
  const coolingThermalKwh = includeAc ? dailyKwh : 0;
  const dailyCost = electricityCost(dailyKwh, coolingThermalKwh, copV, ratePerKwh);
  const acKwh = includeAc && copV > 0 ? coolingThermalKwh / copV : 0;
  const totalDailyKwh = dailyKwh + acKwh;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Kicker>Free calculator</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        Electricity cost calculator
      </h1>
      <p className="mt-2 text-neutral-600">
        List everything that draws power and how long it runs. Lights dominate, but the 24-hour
        small loads (fans, pumps, controllers) add up, and the AC pays again for every watt of
        heat the rest produce.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Devices" />
          <div className="space-y-4 p-5">
            <div className="space-y-3">
              {rows.map((r) => (
                <div key={r.id} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label="Device">
                      <input
                        className={inputClass}
                        placeholder="Name"
                        value={r.name}
                        onChange={(e) => updateRow(r.id, { name: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="w-20">
                    <Field label="Watts">
                      <input
                        className={`${inputClass} num`}
                        inputMode="decimal"
                        value={r.watts}
                        onChange={(e) => updateRow(r.id, { watts: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="w-16">
                    <Field label="h/day">
                      <input
                        className={`${inputClass} num`}
                        inputMode="decimal"
                        value={r.hours}
                        onChange={(e) => updateRow(r.id, { hours: e.target.value })}
                      />
                    </Field>
                  </div>
                  <button
                    onClick={() => removeRow(r.id)}
                    aria-label={`Remove ${r.name || "device"}`}
                    className="mb-1 rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-danger-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <Button variant="secondary" size="sm" onClick={addRow}>
              + Add device
            </Button>

            <Field label="Electricity rate" unit="$/kWh">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </Field>

            <Field label="Grow cycle length" unit="days">
              <input
                className={`${inputClass} num`}
                inputMode="decimal"
                value={cycleDays}
                onChange={(e) => setCycleDays(e.target.value)}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={includeAc}
                onChange={(e) => setIncludeAc(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-accent-600)]"
              />
              Include AC cost to remove device heat
            </label>
            {includeAc && (
              <Field
                label="AC efficiency (COP)"
                hint="Watts of heat moved per watt consumed. Window units ≈ 3, mini-splits ≈ 3.5–4."
              >
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={cop}
                  onChange={(e) => setCop(e.target.value)}
                />
              </Field>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Result" subtitle={`${rows.length} devices`} />
          <div className="space-y-5 p-5">
            <div>
              <div className="text-xs font-medium text-neutral-500">Cost per month</div>
              <UnitValue value={fmtMoney(dailyCost * 30.44)} size="xl" />
            </div>
            <Stat label="Cost per day" value={fmtMoney(dailyCost)} tone="muted" />
            <Stat
              label={`Cost per ${fmt(days, 0)}-day cycle`}
              value={fmtMoney(dailyCost * days)}
              tone="muted"
            />
            <Stat
              label="Energy per day"
              value={fmt(totalDailyKwh, 1)}
              unit="kWh"
              tone="muted"
              hint={
                includeAc
                  ? `${fmt(dailyKwh, 1)} kWh devices + ${fmt(acKwh, 1)} kWh AC`
                  : undefined
              }
            />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <CaveatNote>
          Uses nameplate wattage: drivers and ballasts often draw 5–10% above the lamp rating,
          and utilities may bill tiered or time-of-use rates rather than one flat $/kWh. Check a
          real bill for your marginal rate.
        </CaveatNote>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Wondering how much cooling that heat needs?{" "}
        <Link href="/calculators/ac-btu" className="font-medium text-accent-700 hover:underline">
          Size the AC in BTU →
        </Link>
      </p>
    </div>
  );
}
