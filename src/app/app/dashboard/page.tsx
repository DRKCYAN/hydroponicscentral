import Link from "next/link";
import type { Metadata } from "next";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, StatusPill, UnitValue, Stat } from "@/components/ui/primitives";
import { ProvenanceTrace } from "@/components/ui/feature";
import { createClient } from "@/lib/supabase/server";
import { DEMO_SYSTEMS } from "@/lib/data/demo";
import { ecStatus, phStatus } from "@/lib/data/mock";
import { nextAction } from "@/lib/actions";
import { vpd } from "@/lib/calc/psychro";
import { costPerKg, profitPerArea } from "@/lib/calc/economics";
import { fmt, fmtMoney } from "@/lib/format";
import type { DbSystem } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rows: DbSystem[];
  if (user) {
    const { data: systems } = await supabase
      .from("systems")
      .select("*, water_sources(*)")
      .order("created_at");
    rows = (systems ?? []) as DbSystem[];
  } else {
    rows = DEMO_SYSTEMS;
  }
  const needAttention = rows.filter((s) => nextAction(s).status !== "ok").length;
  const total = rows.length;

  const cpk = costPerKg(842, 52.8);
  const ppa = profitPerArea(268, 121);

  return (
    <Workspace>
      <PageHeader
        verb="Monitor"
        title="Dashboard"
        description="One card per system — am I okay, in about three seconds?"
        actions={
          total > 0 ? (
            <StatusPill
              status={needAttention === 0 ? "ok" : needAttention > 1 ? "danger" : "caution"}
            >
              {needAttention === 0
                ? "All systems holding"
                : `${needAttention} of ${total} need attention`}
            </StatusPill>
          ) : null
        }
      />

      {rows.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm font-medium text-neutral-700">No systems yet</p>
          <p className="mt-1 text-sm text-neutral-500">
            Add your first hydroponic setup to start tracking.
          </p>
          <Link
            href="/app/systems"
            className="mt-4 inline-block rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700"
          >
            + Add system
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((s) => (
            <SystemCard key={s.id} system={s} />
          ))}
        </div>
      )}

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Running cost & profit — this cycle"
            subtitle="Tracking only. Investment analysis lives in Decide › Planning & Economics."
            right={
              <Link
                href="/app/planning"
                className="text-xs font-medium text-accent-700 hover:underline"
              >
                Open Planning →
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-6 p-5 sm:grid-cols-4">
            <Stat label="Cost / kg" value={fmtMoney(cpk)} hint="incl. amortized CapEx" />
            <Stat label="Profit / m² / yr" value={fmtMoney(ppa)} tone={ppa > 0 ? "ok" : "danger"} />
            <Stat label="Yield this cycle" value={fmt(52.8, 1)} unit="kg" />
            <Stat label="Utilization" value="84" unit="%" />
          </div>
        </Card>
      </div>
    </Workspace>
  );
}

function SystemCard({ system: s }: { system: DbSystem }) {
  const action = nextAction(s);
  const ec = s.last_ec;
  const ph = s.last_ph;
  const ecS = ec != null ? ecStatus(ec, s.ec_target) : null;
  const phS = ph != null ? phStatus(ph, [s.ph_target_low, s.ph_target_high]) : null;
  const airVpd = s.last_temp_c != null ? vpd(s.last_temp_c, 60) : null;
  const daysSince =
    s.last_at != null
      ? Math.floor((Date.now() - new Date(s.last_at).getTime()) / 86_400_000)
      : null;

  return (
    <Card>
      <CardHeader
        title={
          <Link href={`/app/systems/${s.id}`} className="hover:text-accent-700">
            {s.name}
          </Link>
        }
        subtitle={`${s.type} · ${s.crop} · ${s.stage} · ${s.reservoir_l} L`}
        right={
          <StatusPill status={action.status}>
            {action.status === "ok" ? "OK" : action.status === "caution" ? "Watch" : "Act"}
          </StatusPill>
        }
      />
      <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
        <div>
          <div className="text-xs font-medium text-neutral-500">EC</div>
          <UnitValue
            value={ec != null ? fmt(ec, 2) : "—"}
            unit="mS/cm"
            size="lg"
            tone={ecS ?? "default"}
          />
          <div className="mt-0.5 text-xs text-neutral-400">target {fmt(s.ec_target, 1)}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-neutral-500">pH</div>
          <UnitValue value={ph != null ? fmt(ph, 1) : "—"} unit="" size="lg" tone={phS ?? "default"} />
          <div className="mt-0.5 text-xs text-neutral-400">
            band {s.ph_target_low}–{s.ph_target_high}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-neutral-500">Reservoir</div>
          <UnitValue
            value={s.last_reservoir_pct != null ? s.last_reservoir_pct : "—"}
            unit="%"
            size="lg"
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
          <div className="mt-0.5 text-xs text-neutral-400">
            {daysSince != null ? `${daysSince} d since top-off` : "no readings yet"}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-neutral-500">DO · VPD</div>
          <UnitValue
            value={s.last_do_mg_l != null ? fmt(s.last_do_mg_l, 1) : "—"}
            unit="mg/L"
            size="lg"
            tone={s.last_do_mg_l != null && s.last_do_mg_l < 6 ? "caution" : "default"}
          />
          <div className="mt-0.5 text-xs text-neutral-400">
            VPD {airVpd != null ? `${fmt(airVpd, 2)} kPa` : "—"}
          </div>
        </div>
      </div>

      <div
        className={`flex items-start gap-3 border-t px-5 py-3 ${
          action.status === "ok"
            ? "border-ok-200 bg-ok-50"
            : action.status === "caution"
              ? "border-caution-200 bg-caution-50"
              : "border-danger-200 bg-danger-50"
        }`}
      >
        <span className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Next
        </span>
        <div className="min-w-0">
          <div
            className={`text-sm font-medium ${
              action.status === "ok"
                ? "text-ok-700"
                : action.status === "caution"
                  ? "text-caution-700"
                  : "text-danger-700"
            }`}
          >
            {action.label}
          </div>
          <div className="text-xs text-neutral-500">{action.detail}</div>
        </div>
      </div>

      <div className="px-5 pb-4 pt-3">
        <ProvenanceTrace
          summary={`vs active recipe · water ${s.water_sources?.name ?? "—"}`}
          steps={[
            s.last_at
              ? `last log ${new Date(s.last_at).toLocaleString()}`
              : "no readings yet",
            `active recipe: ${s.active_recipe_id ?? "none set"}`,
            `water source: ${s.water_sources?.name ?? "—"} (EC ${s.water_sources?.ec ?? "—"})`,
            `EC/pH compared against this system's target`,
          ]}
        />
      </div>
    </Card>
  );
}
