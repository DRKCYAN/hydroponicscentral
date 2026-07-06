import Link from "next/link";
import type { Metadata } from "next";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, StatusPill, UnitValue, Stat } from "@/components/ui/primitives";
import { ProvenanceTrace } from "@/components/ui/feature";
import { SYSTEMS, ecStatus, phStatus, waterById, type SystemContext } from "@/lib/data/mock";
import { allSystemsSummary, nextAction } from "@/lib/actions";
import { vpd } from "@/lib/calc/psychro";
import { costPerKg, profitPerArea } from "@/lib/calc/economics";
import { fmt, fmtMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const { needAttention, total } = allSystemsSummary();

  // Illustrative running economics (Dashboard = cost/profit tracking, [V-3.1/5.4]).
  const cpk = costPerKg(842, 52.8); // total period cost / yield kg
  const ppa = profitPerArea(268, 121); // revenue/m²/yr − cost/m²/yr

  return (
    <Workspace>
      <PageHeader
        verb="Monitor"
        title="Dashboard"
        description="The returning-user home. One card per system — am I okay, in about three seconds?"
        actions={
          <StatusPill status={needAttention === 0 ? "ok" : needAttention > 1 ? "danger" : "caution"}>
            {needAttention === 0 ? "All systems holding" : `${needAttention} of ${total} need attention`}
          </StatusPill>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {SYSTEMS.map((s) => (
          <SystemCard key={s.id} system={s} />
        ))}
      </div>

      {/* Running cost / profit (tracking lives on the Dashboard; strategy on Planning) */}
      <div className="mt-6">
        <Card>
          <CardHeader
            title="Running cost & profit — this cycle"
            subtitle="Tracking only. Investment analysis lives in Decide › Planning & Economics."
            right={
              <Link href="/app/planning" className="text-xs font-medium text-accent-700 hover:underline">
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

function SystemCard({ system: s }: { system: SystemContext }) {
  const ecS = ecStatus(s.last.ec, s.ecTarget);
  const phS = phStatus(s.last.ph, s.phTarget);
  const action = nextAction(s);
  const water = waterById(s.waterSourceId);
  const airVpd = vpd(s.last.tempC, 60); // nominal 60% RH for the environmental read

  return (
    <Card>
      <CardHeader
        title={
          <Link href={`/app/systems/${s.id}`} className="hover:text-accent-700">
            {s.name}
          </Link>
        }
        subtitle={`${s.type} · ${s.crop} · ${s.stage} · ${s.reservoirL} L`}
        right={<StatusPill status={action.status}>{action.status === "ok" ? "OK" : action.status === "caution" ? "Watch" : "Act"}</StatusPill>}
      />
      <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
        <div>
          <div className="text-xs font-medium text-neutral-500">EC</div>
          <UnitValue value={fmt(s.last.ec, 2)} unit="mS/cm" size="lg" tone={ecS} />
          <div className="mt-0.5 text-xs text-neutral-400">target {fmt(s.ecTarget, 1)}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-neutral-500">pH</div>
          <UnitValue value={fmt(s.last.ph, 1)} unit="" size="lg" tone={phS} />
          <div className="mt-0.5 text-xs text-neutral-400">
            band {s.phTarget[0]}–{s.phTarget[1]}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-neutral-500">Reservoir</div>
          <UnitValue
            value={s.last.reservoirPct}
            unit="%"
            size="lg"
            tone={s.last.reservoirPct <= 30 ? "danger" : s.last.reservoirPct <= 50 ? "caution" : "default"}
          />
          <div className="mt-0.5 text-xs text-neutral-400">{s.last.daysSinceTopOff} d since top-off</div>
        </div>
        <div>
          <div className="text-xs font-medium text-neutral-500">DO · VPD</div>
          <UnitValue value={fmt(s.last.doMgL, 1)} unit="mg/L" size="lg" tone={s.last.doMgL < 6 ? "caution" : "default"} />
          <div className="mt-0.5 text-xs text-neutral-400">VPD {fmt(airVpd, 2)} kPa</div>
        </div>
      </div>

      {/* Next action — the single most important line on the card */}
      <div
        className={`flex items-start gap-3 border-t px-5 py-3 ${
          action.status === "ok"
            ? "border-ok-200 bg-ok-50"
            : action.status === "caution"
              ? "border-caution-200 bg-caution-50"
              : "border-danger-200 bg-danger-50"
        }`}
      >
        <span className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Next</span>
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
          summary={`vs active recipe · water ${water?.name ?? "—"}`}
          steps={[
            `last log ${new Date(s.last.at).toLocaleString()}`,
            `active recipe: ${s.activeRecipeId ?? "none set"}`,
            `water source: ${water?.name ?? "—"} (EC ${water?.ec ?? "—"})`,
            `EC/pH compared against this system's target`,
          ]}
        />
      </div>
    </Card>
  );
}
