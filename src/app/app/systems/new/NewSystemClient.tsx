"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, Button, CaveatNote } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import { CROP_TARGETS } from "@/lib/data/crops";
import { createSystem, type CreateSystemState } from "./actions";

const SYSTEM_TYPES = ["DWC", "NFT", "Drip", "Ebb & Flow"] as const;

export function NewSystemClient({
  waterSources,
  isAuthed,
}: {
  waterSources: { id: string; name: string }[];
  isAuthed: boolean;
}) {
  const defaultCrop = CROP_TARGETS[0];
  const [cropTargetId, setCropTargetId] = useState(defaultCrop.id);
  const [ecTarget, setEcTarget] = useState(String(defaultCrop.ecTarget));
  const [phLow, setPhLow] = useState("5.8");
  const [phHigh, setPhHigh] = useState("6.2");

  const [state, formAction, pending] = useActionState<CreateSystemState | null, FormData>(
    createSystem,
    null
  );

  const crop = CROP_TARGETS.find((c) => c.id === cropTargetId);

  return (
    <Workspace>
      <PageHeader
        verb="Configure"
        title="New System"
        description="A system is one physical setup — it owns its reservoir, targets, and readings. Crop presets prefill sensible targets; tune them to your setup."
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader
            title="System details"
            subtitle="Everything here can be changed later"
          />
          <form action={formAction} className="space-y-4 p-5">
            <Field label="Name">
              <input
                name="name"
                className={inputClass}
                placeholder="e.g. Tent 1 — Lettuce raft"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="System type">
                <select name="type" className={inputClass} defaultValue="DWC">
                  {SYSTEM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Reservoir volume" unit="L">
                <input
                  name="reservoirL"
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  placeholder="120"
                  required
                />
              </Field>
            </div>

            <Field label="Crop & stage">
              <select
                name="cropTargetId"
                className={inputClass}
                value={cropTargetId}
                onChange={(e) => {
                  setCropTargetId(e.target.value);
                  const preset = CROP_TARGETS.find((c) => c.id === e.target.value);
                  if (preset) setEcTarget(String(preset.ecTarget));
                }}
              >
                {CROP_TARGETS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.stage}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field label="EC target" unit="mS/cm">
                <input
                  name="ecTarget"
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={ecTarget}
                  onChange={(e) => setEcTarget(e.target.value)}
                  required
                />
              </Field>
              <Field label="pH low">
                <input
                  name="phLow"
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={phLow}
                  onChange={(e) => setPhLow(e.target.value)}
                  required
                />
              </Field>
              <Field label="pH high">
                <input
                  name="phHigh"
                  className={`${inputClass} num`}
                  inputMode="decimal"
                  value={phHigh}
                  onChange={(e) => setPhHigh(e.target.value)}
                  required
                />
              </Field>
            </div>

            <Field label="Water source (optional)">
              <select name="waterSourceId" className={inputClass} defaultValue="">
                <option value="">None yet</option>
                {waterSources.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </Field>

            {crop && (
              <CaveatNote tone="info">
                Preset for {crop.name} ({crop.stage.toLowerCase()}): EC {crop.ecTarget} mS/cm.
                These are representative starting points — real growers tune them per cultivar
                and environment.
              </CaveatNote>
            )}

            {state?.error && <p className="text-sm text-danger-700">{state.error}</p>}

            <div className="flex items-center gap-3 pt-2">
              {isAuthed ? (
                <Button type="submit" loading={pending} loadingText="Creating…">
                  Create system
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
                    Creating a system stores your data — that&apos;s the one part that
                    needs an account.
                  </span>
                </>
              )}
            </div>
          </form>
        </Card>
      </div>
    </Workspace>
  );
}
