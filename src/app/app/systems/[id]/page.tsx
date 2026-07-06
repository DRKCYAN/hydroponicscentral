import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Workspace, PageHeader } from "@/components/ui/page";
import {
  Card,
  CardHeader,
  Button,
  StatusPill,
  Stat,
  CaveatNote,
} from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/server";
import { ecStatus, phStatus } from "@/lib/data/mock";
import { nextAction } from "@/lib/actions";
import { turnoverEstimate } from "@/lib/systems-calc";
import { fmt } from "@/lib/format";
import type { DbSystem, DbLogEntry } from "@/lib/supabase/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("systems").select("name").eq("id", id).single();
  return { title: data?.name ?? "System" };
}

export default async function SystemDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: systemData } = await supabase
    .from("systems")
    .select("*, water_sources(*)")
    .eq("id", id)
    .single();

  if (!systemData) notFound();

  const s = systemData as DbSystem;

  const { data: logData } = await supabase
    .from("log_entries")
    .select("*")
    .eq("system_id", id)
    .order("logged_at", { ascending: false })
    .limit(50);

  const logs = (logData ?? []) as DbLogEntry[];
  const action = nextAction(s);
  const turnover = turnoverEstimate(s.type, s.reservoir_l);
  const daysSince =
    s.last_at != null
      ? Math.floor((Date.now() - new Date(s.last_at).getTime()) / 86_400_000)
      : null;

  return (
    <Workspace>
      <PageHeader
        verb="Configure"
        title={s.name}
        description={
          <span>
            <Link href="/app/systems" className="text-accent-700 hover:underline">
              Systems
            </Link>{" "}
            / {s.type} · {s.crop} · {s.stage}
          </span>
        }
        actions={
          <>
            <StatusPill status={action.status}>{action.label}</StatusPill>
            <Button variant="secondary">Reconfigure</Button>
          </>
        }
      />

      <Card className="mb-6">
        <CardHeader title="Overview" subtitle="Standing parameters the operational pages read" />
        <div className="grid grid-cols-2 gap-6 p-5 sm:grid-cols-4">
          <Stat label="Reservoir" value={fmt(s.reservoir_l, 0)} unit="L" />
          <Stat label="EC target" value={fmt(s.ec_target, 1)} unit="mS/cm" />
          <Stat label="pH band" value={`${s.ph_target_low}–${s.ph_target_high}`} />
          <Stat
            label="Est. turnover"
            value={fmt(turnover.perHour, 2)}
            unit="/h"
            hint={turnover.note}
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recipe"
            subtitle="This system's active nutrient target"
            right={
              <Link
                href="/app/solver"
                className="text-xs font-medium text-accent-700 hover:underline"
              >
                Open Solver →
              </Link>
            }
          />
          <div className="p-5">
            {s.active_recipe_id ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-800">{s.active_recipe_id}</span>
                  <StatusPill status="ok">Active</StatusPill>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  Solved against {s.water_sources?.name ?? "source water"}. Log Entries compare
                  automatically against this target.
                </p>
              </>
            ) : (
              <div className="text-sm text-neutral-500">
                No active recipe.{" "}
                <Link href="/app/solver" className="text-accent-700 hover:underline">
                  Solve one →
                </Link>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Schedule"
            subtitle="Top-off & turnover derived from geometry + demand"
          />
          <div className="grid grid-cols-2 gap-4 p-5">
            <Stat
              label="Reservoir level"
              value={s.last_reservoir_pct != null ? s.last_reservoir_pct : "—"}
              unit="%"
              tone={
                s.last_reservoir_pct == null
                  ? "default"
                  : s.last_reservoir_pct <= 30
                    ? "danger"
                    : s.last_reservoir_pct <= 50
                      ? "caution"
                      : "default"
              }
            />
            <Stat
              label="Days since top-off"
              value={daysSince != null ? daysSince : "—"}
              unit={daysSince != null ? "d" : ""}
            />
            <Stat label="Turnover time" value={fmt(turnover.hours, 1)} unit="h" />
            <Stat
              label="DO"
              value={s.last_do_mg_l != null ? fmt(s.last_do_mg_l, 1) : "—"}
              unit={s.last_do_mg_l != null ? "mg/L" : ""}
              tone={s.last_do_mg_l != null && s.last_do_mg_l < 6 ? "caution" : "default"}
            />
          </div>
          <div className="px-5 pb-5">
            <CaveatNote>
              Keep daily uptake ≤ ~10–20% of reservoir volume for stable EC/pH between top-ups.
              Bigger reservoir = more buffered chemistry.
            </CaveatNote>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Log"
          subtitle="Recent readings for this system"
          right={
            <Link
              href="/app/log"
              className="text-xs font-medium text-accent-700 hover:underline"
            >
              New reading →
            </Link>
          }
        />
        {logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            No readings yet.{" "}
            <Link href="/app/log" className="text-accent-700 hover:underline">
              Log your first reading →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs text-neutral-400">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 text-right font-medium">EC</th>
                  <th className="px-3 py-3 text-right font-medium">pH</th>
                  <th className="px-3 py-3 text-right font-medium">Temp</th>
                  <th className="px-3 py-3 text-right font-medium">DO</th>
                  <th className="px-5 py-3 text-right font-medium">Top-off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {logs.map((r) => {
                  const ecS = ecStatus(r.ec, s.ec_target);
                  const phS = phStatus(r.ph, [s.ph_target_low, s.ph_target_high]);
                  return (
                    <tr key={r.id}>
                      <td className="px-5 py-2.5 text-neutral-600">
                        {new Date(r.logged_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span
                          className={`num ${
                            ecS === "ok"
                              ? "text-neutral-800"
                              : ecS === "caution"
                                ? "text-caution-700"
                                : "text-danger-700"
                          }`}
                        >
                          {fmt(r.ec, 2)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span
                          className={`num ${
                            phS === "ok"
                              ? "text-neutral-800"
                              : phS === "caution"
                                ? "text-caution-700"
                                : "text-danger-700"
                          }`}
                        >
                          {fmt(r.ph, 1)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right num text-neutral-600">
                        {r.temp_c != null ? fmt(r.temp_c, 1) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right num text-neutral-600">
                        {r.do_mg_l != null ? fmt(r.do_mg_l, 1) : "—"}
                      </td>
                      <td className="px-5 py-2.5 text-right num text-neutral-600">
                        {r.top_off_l} L
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Workspace>
  );
}
