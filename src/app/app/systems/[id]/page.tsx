import Link from "next/link";
import { notFound } from "next/navigation";
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
import {
  systemById,
  waterById,
  LOG_HISTORY,
  ecStatus,
  phStatus,
} from "@/lib/data/mock";
import { nextAction } from "@/lib/actions";
import { turnoverEstimate } from "@/lib/systems-calc";
import { fmt } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const s = systemById(id);
  return { title: s ? s.name : "System" };
}

export default async function SystemDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = systemById(id);
  if (!s) notFound();
  const water = waterById(s.waterSourceId);
  const logs = LOG_HISTORY[s.id] ?? [];
  const action = nextAction(s);
  const turnover = turnoverEstimate(s.type, s.reservoirL);

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

      {/* Overview */}
      <Card className="mb-6">
        <CardHeader title="Overview" subtitle="Standing parameters the operational pages read" />
        <div className="grid grid-cols-2 gap-6 p-5 sm:grid-cols-4">
          <Stat label="Reservoir" value={fmt(s.reservoirL, 0)} unit="L" />
          <Stat label="EC target" value={fmt(s.ecTarget, 1)} unit="mS/cm" />
          <Stat label="pH band" value={`${s.phTarget[0]}–${s.phTarget[1]}`} />
          <Stat label="Est. turnover" value={fmt(turnover.perHour, 2)} unit="/h" hint={turnover.note} />
        </div>
      </Card>

      {/* Sections on ONE page: Recipe / Log / Schedule (avoid deep nesting) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recipe */}
        <Card>
          <CardHeader
            title="Recipe"
            subtitle="This system's active nutrient target"
            right={
              <Link href="/app/solver" className="text-xs font-medium text-accent-700 hover:underline">
                Open Solver →
              </Link>
            }
          />
          <div className="p-5">
            {s.activeRecipeId ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-800">{s.activeRecipeId}</span>
                  <StatusPill status="ok">Active</StatusPill>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  Solved against {water?.name ?? "source water"}. Log Entries compare automatically
                  against this target; the Dashboard rolls it up.
                </p>
              </>
            ) : (
              <div className="text-sm text-neutral-500">
                No active recipe. <Link href="/app/solver" className="text-accent-700 hover:underline">Solve one →</Link>
              </div>
            )}
          </div>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader title="Schedule" subtitle="Top-off & turnover derived from geometry + demand" />
          <div className="grid grid-cols-2 gap-4 p-5">
            <Stat
              label="Reservoir level"
              value={s.last.reservoirPct}
              unit="%"
              tone={s.last.reservoirPct <= 30 ? "danger" : s.last.reservoirPct <= 50 ? "caution" : "default"}
            />
            <Stat label="Days since top-off" value={s.last.daysSinceTopOff} unit="d" />
            <Stat label="Turnover time" value={fmt(turnover.hours, 1)} unit="h" />
            <Stat label="DO" value={fmt(s.last.doMgL, 1)} unit="mg/L" tone={s.last.doMgL < 6 ? "caution" : "default"} />
          </div>
          <div className="px-5 pb-5">
            <CaveatNote>
              Keep daily uptake ≤ ~10–20% of reservoir volume for stable EC/pH between top-ups.
              Bigger reservoir = more buffered chemistry.
            </CaveatNote>
          </div>
        </Card>
      </div>

      {/* Log — recent readings for THIS system */}
      <Card className="mt-6">
        <CardHeader
          title="Log"
          subtitle="Recent readings for this system"
          right={
            <Link href="/app/log" className="text-xs font-medium text-accent-700 hover:underline">
              New reading →
            </Link>
          }
        />
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
              {logs
                .slice()
                .reverse()
                .map((r) => {
                  const ecS = ecStatus(r.ec, s.ecTarget);
                  const phS = phStatus(r.ph, s.phTarget);
                  return (
                    <tr key={r.at}>
                      <td className="px-5 py-2.5 text-neutral-600">{r.at}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`num ${ecS === "ok" ? "text-neutral-800" : ecS === "caution" ? "text-caution-700" : "text-danger-700"}`}>
                          {fmt(r.ec, 2)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`num ${phS === "ok" ? "text-neutral-800" : phS === "caution" ? "text-caution-700" : "text-danger-700"}`}>
                          {fmt(r.ph, 1)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right num text-neutral-600">{fmt(r.tempC, 1)}</td>
                      <td className="px-3 py-2.5 text-right num text-neutral-600">{fmt(r.doMgL, 1)}</td>
                      <td className="px-5 py-2.5 text-right num text-neutral-600">{r.topOffL} L</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </Workspace>
  );
}
