"use client";

import { useState } from "react";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, Button, StatusPill, UnitValue, CaveatNote } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { SYSTEMS, ecStatus, phStatus, systemById } from "@/lib/data/mock";
import { ecTempCorrect } from "@/lib/calc/ecppm";
import { fmt } from "@/lib/format";

export default function LogEntryPage() {
  const [systemId, setSystemId] = useState(SYSTEMS[0].id);
  const [ec, setEc] = useState("");
  const [ph, setPh] = useState("");
  const [temp, setTemp] = useState("");
  const [doVal, setDoVal] = useState("");
  const [topOff, setTopOff] = useState("");
  const [saved, setSaved] = useState(false);

  const system = systemById(systemId)!;
  const ecNum = parseFloat(ec);
  const phNum = parseFloat(ph);
  const tempNum = parseFloat(temp);

  const ecCorrected =
    !isNaN(ecNum) && !isNaN(tempNum) ? ecTempCorrect(ecNum, tempNum) : !isNaN(ecNum) ? ecNum : null;
  const ecS = ecCorrected != null ? ecStatus(ecCorrected, system.ecTarget) : null;
  const phS = !isNaN(phNum) ? phStatus(phNum, system.phTarget) : null;

  return (
    <Workspace>
      <PageHeader
        verb="Record"
        title="Log Entry"
        description="A routine reading — used constantly, so it stays a few-second interaction. Derived values compute as you type."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader title="New reading" />
          <div className="space-y-4 p-5">
            <Field label="System">
              <select
                className={inputClass}
                value={systemId}
                onChange={(e) => {
                  setSystemId(e.target.value);
                  setSaved(false);
                }}
              >
                {SYSTEMS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="EC" unit="mS/cm">
                <input className={`${inputClass} num`} inputMode="decimal" placeholder={String(system.ecTarget)} value={ec} onChange={(e) => setEc(e.target.value)} />
              </Field>
              <Field label="pH">
                <input className={`${inputClass} num`} inputMode="decimal" placeholder={String(system.phTarget[0])} value={ph} onChange={(e) => setPh(e.target.value)} />
              </Field>
              <Field label="Solution temp" unit="°C">
                <input className={`${inputClass} num`} inputMode="decimal" placeholder="20" value={temp} onChange={(e) => setTemp(e.target.value)} />
              </Field>
              <Field label="Dissolved O₂" unit="mg/L">
                <input className={`${inputClass} num`} inputMode="decimal" placeholder="7" value={doVal} onChange={(e) => setDoVal(e.target.value)} />
              </Field>
              <Field label="Top-off added" unit="L">
                <input className={`${inputClass} num`} inputMode="decimal" placeholder="0" value={topOff} onChange={(e) => setTopOff(e.target.value)} />
              </Field>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={() => setSaved(true)}>Save reading</Button>
              {saved && <span className="text-sm text-ok-700">✓ Logged to {system.name}</span>}
            </div>
          </div>
        </Card>

        {/* Live derived read-out — compares against THIS system's target */}
        <Card>
          <CardHeader title="Against target" subtitle={`${system.name} · active target`} />
          <div className="space-y-5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-neutral-500">EC (corrected to 25 °C)</div>
                <UnitValue value={ecCorrected != null ? fmt(ecCorrected, 2) : "—"} unit="mS/cm" size="lg" tone={ecS ?? "muted"} />
                <div className="text-xs text-neutral-400">target {fmt(system.ecTarget, 1)}</div>
              </div>
              {ecS && <StatusPill status={ecS}>{ecS === "ok" ? "In range" : ecS === "caution" ? "Drifting" : "Out of range"}</StatusPill>}
            </div>

            <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
              <div>
                <div className="text-xs text-neutral-500">pH</div>
                <UnitValue value={!isNaN(phNum) ? fmt(phNum, 1) : "—"} unit="" size="lg" tone={phS ?? "muted"} />
                <div className="text-xs text-neutral-400">band {system.phTarget[0]}–{system.phTarget[1]}</div>
              </div>
              {phS && <StatusPill status={phS}>{phS === "ok" ? "In band" : phS === "caution" ? "Near edge" : "Out of band"}</StatusPill>}
            </div>

            {!isNaN(tempNum) && !isNaN(ecNum) && (
              <CaveatNote tone="info">
                Raw EC {fmt(ecNum, 2)} at {fmt(tempNum, 0)} °C corrects to {fmt(ecCorrected!, 2)}{" "}
                mS/cm at 25 °C (~2%/°C). If your meter auto-compensates, enter the already-corrected
                value and skip temperature.
              </CaveatNote>
            )}
          </div>
        </Card>
      </div>
    </Workspace>
  );
}
