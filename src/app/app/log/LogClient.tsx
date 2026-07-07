"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, Button, StatusPill, UnitValue, CaveatNote } from "@/components/ui/primitives";
import { CheckIcon } from "@/components/ui/icons";
import { Field, inputClass } from "@/components/ui/field";
import { ecStatus, phStatus } from "@/lib/data/mock";
import { ecTempCorrect } from "@/lib/calc/ecppm";
import { fmt } from "@/lib/format";
import { saveLogEntry, type SaveLogState } from "./actions";
import type { DbSystem } from "@/lib/supabase/types";

export function LogClient({
  systems,
  isAuthed,
}: {
  systems: DbSystem[];
  isAuthed: boolean;
}) {
  const [systemId, setSystemId] = useState(systems[0]?.id ?? "");
  const [ec, setEc] = useState("");
  const [ph, setPh] = useState("");
  const [temp, setTemp] = useState("");
  const [doVal, setDoVal] = useState("");
  const [topOff, setTopOff] = useState("");

  const [state, formAction, pending] = useActionState<SaveLogState | null, FormData>(
    saveLogEntry,
    null
  );

  const system = systems.find((s) => s.id === systemId) ?? systems[0];
  const ecNum = parseFloat(ec);
  const phNum = parseFloat(ph);
  const tempNum = parseFloat(temp);

  const ecCorrected =
    !isNaN(ecNum) && !isNaN(tempNum)
      ? ecTempCorrect(ecNum, tempNum)
      : !isNaN(ecNum)
        ? ecNum
        : null;
  const ecS = ecCorrected != null && system ? ecStatus(ecCorrected, system.ec_target) : null;
  const phS =
    !isNaN(phNum) && system
      ? phStatus(phNum, [system.ph_target_low, system.ph_target_high])
      : null;

  if (systems.length === 0) {
    return (
      <Workspace>
        <PageHeader
          verb="Record"
          title="Log Entry"
          description="A routine reading — used constantly, so it stays a few-second interaction."
        />
        <Card className="p-10 text-center">
          <p className="text-sm text-neutral-500">
            Add a system before logging readings.
          </p>
        </Card>
      </Workspace>
    );
  }

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
          <form action={formAction} className="space-y-4 p-5">
            <input type="hidden" name="systemId" value={systemId} />
            <input type="hidden" name="ec" value={ec} />
            <input type="hidden" name="ph" value={ph} />
            <input type="hidden" name="temp" value={temp} />
            <input type="hidden" name="do" value={doVal} />
            <input type="hidden" name="topOff" value={topOff} />

            <Field label="System">
              <select
                className={inputClass}
                value={systemId}
                onChange={(e) => setSystemId(e.target.value)}
              >
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="EC" unit="mS/cm">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  placeholder={system ? String(system.ec_target) : "2.0"}
                  value={ec}
                  onChange={(e) => setEc(e.target.value)}
                />
              </Field>
              <Field label="pH">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  placeholder={system ? String(system.ph_target_low) : "5.8"}
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                />
              </Field>
              <Field label="Solution temp" unit="°C">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  placeholder="20"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                />
              </Field>
              <Field label="Dissolved O₂" unit="mg/L">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  placeholder="7"
                  value={doVal}
                  onChange={(e) => setDoVal(e.target.value)}
                />
              </Field>
              <Field label="Top-off added" unit="L">
                <input
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  placeholder="0"
                  value={topOff}
                  onChange={(e) => setTopOff(e.target.value)}
                />
              </Field>
            </div>

            {state?.error && (
              <p className="text-sm text-danger-700">{state.error}</p>
            )}

            <div className="flex items-center gap-3 pt-2">
              {isAuthed ? (
                <Button type="submit" loading={pending} loadingText="Saving…">
                  Save reading
                </Button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700"
                  >
                    Sign in to save
                  </Link>
                  <span className="text-xs text-neutral-500">
                    Everything above works without an account — an account is
                    only needed to keep your readings.
                  </span>
                </>
              )}
              {state?.success && !pending && (
                <span className="inline-flex items-center gap-1.5 text-sm text-ok-700">
                  <CheckIcon size={15} /> Logged to {state.systemName}
                </span>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader
            title="Against target"
            subtitle={system ? `${system.name} · active target` : ""}
          />
          <div className="space-y-5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-neutral-500">EC (corrected to 25 °C)</div>
                <UnitValue
                  value={ecCorrected != null ? fmt(ecCorrected, 2) : "—"}
                  unit="mS/cm"
                  size="lg"
                  tone={ecS ?? "muted"}
                />
                {system && (
                  <div className="text-xs text-neutral-400">target {fmt(system.ec_target, 1)}</div>
                )}
              </div>
              {ecS && (
                <StatusPill status={ecS}>
                  {ecS === "ok" ? "In range" : ecS === "caution" ? "Drifting" : "Out of range"}
                </StatusPill>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
              <div>
                <div className="text-xs text-neutral-500">pH</div>
                <UnitValue
                  value={!isNaN(phNum) ? fmt(phNum, 1) : "—"}
                  unit=""
                  size="lg"
                  tone={phS ?? "muted"}
                />
                {system && (
                  <div className="text-xs text-neutral-400">
                    band {system.ph_target_low}–{system.ph_target_high}
                  </div>
                )}
              </div>
              {phS && (
                <StatusPill status={phS}>
                  {phS === "ok" ? "In band" : phS === "caution" ? "Near edge" : "Out of band"}
                </StatusPill>
              )}
            </div>

            {!isNaN(tempNum) && !isNaN(ecNum) && (
              <CaveatNote tone="info">
                Raw EC {fmt(ecNum, 2)} at {fmt(tempNum, 0)} °C corrects to{" "}
                {fmt(ecCorrected!, 2)} mS/cm at 25 °C (~2%/°C). If your meter
                auto-compensates, enter the already-corrected value and skip temperature.
              </CaveatNote>
            )}
          </div>
        </Card>
      </div>
    </Workspace>
  );
}
