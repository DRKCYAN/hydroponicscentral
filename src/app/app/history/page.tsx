import type { Metadata } from "next";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, Stat, UnitValue, CaveatNote } from "@/components/ui/primitives";
import { Sparkline } from "@/components/ui/Sparkline";
import { createClient } from "@/lib/supabase/server";
import { DEMO_SYSTEMS, DEMO_LOG_ENTRIES } from "@/lib/data/demo";
import { rgr, doublingTime, agr, cgr, nar, lai, wue } from "@/lib/calc/biology";
import { accumulateIon } from "@/lib/calc/ph";
import { fmt } from "@/lib/format";
import type { DbSystem, DbLogEntry } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "System History & Trends" };

// Illustrative sequential growth samples (dry weight g, leaf area m², days).
const GROWTH = {
  w1: 2.1,
  w2: 8.4,
  a1: 0.02,
  a2: 0.09,
  t1: 0,
  t2: 21,
  groundM2: 1.2,
  waterL: 46,
};

// Illustrative Na accumulation example — 25 ppm in source water, 100L reservoir.
const NA_PPM_ILLUSTRATIVE = 25;

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let systems: Pick<DbSystem, "id" | "name">[];
  const logsMap: Record<string, DbLogEntry[]> = {};
  if (user) {
    const { data: systemsData } = await supabase
      .from("systems")
      .select("id, name")
      .order("created_at");
    systems = (systemsData ?? []) as Pick<DbSystem, "id" | "name">[];

    // Fetch log entries for each system
    if (systems.length > 0) {
      const { data: logsData } = await supabase
        .from("log_entries")
        .select("*")
        .in(
          "system_id",
          systems.map((s) => s.id)
        )
        .order("logged_at");
      const logs = (logsData ?? []) as DbLogEntry[];
      for (const log of logs) {
        (logsMap[log.system_id] ??= []).push(log);
      }
    }
  } else {
    systems = DEMO_SYSTEMS.map((s) => ({ id: s.id, name: s.name }));
    for (const log of DEMO_LOG_ENTRIES) {
      (logsMap[log.system_id] ??= []).push(log);
    }
  }

  const rgrVal = rgr(GROWTH.w1, GROWTH.w2, GROWTH.t1, GROWTH.t2);
  const agrVal = agr(GROWTH.w1, GROWTH.w2, GROWTH.t1, GROWTH.t2);
  const laiVal = lai(GROWTH.a2, GROWTH.groundM2);
  const narVal = nar(GROWTH.w1, GROWTH.w2, GROWTH.a1, GROWTH.a2, GROWTH.t1, GROWTH.t2);
  const cgrVal = cgr(narVal, laiVal);
  const wueVal = wue(GROWTH.w2 - GROWTH.w1, GROWTH.waterL);

  const naSeries = accumulateIon(NA_PPM_ILLUSTRATIVE, 20, 100, 12, NA_PPM_ILLUSTRATIVE);

  return (
    <Workspace>
      <PageHeader
        verb="Monitor"
        title="System History & Trends"
        description="Retrospective analysis across cycles. Growth rates, efficiency, and salt accumulation over time."
      />

      <Card className="mb-6">
        <CardHeader
          title="Growth analysis"
          subtitle="From sequential dry-weight & leaf-area samples"
        />
        <div className="grid grid-cols-2 gap-6 p-5 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="AGR" value={fmt(agrVal, 2)} unit="g/day" />
          <Stat label="RGR" value={fmt(rgrVal, 3)} unit="g/g/day" />
          <Stat label="Doubling time" value={fmt(doublingTime(rgrVal), 1)} unit="days" />
          <Stat label="LAI" value={fmt(laiVal, 2)} />
          <Stat label="CGR" value={fmt(cgrVal, 1)} unit="g/m²/day" />
          <Stat label="WUE" value={fmt(wueVal, 3)} unit="g/L" />
        </div>
      </Card>

      {systems.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-neutral-500">
            Add systems and log readings to see EC trends here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {systems.map((s) => {
            const logs = logsMap[s.id] ?? [];
            const ecSeries = logs.map((l) => l.ec);
            const trend =
              ecSeries.length >= 2 ? ecSeries[ecSeries.length - 1] - ecSeries[0] : 0;
            const tone =
              Math.abs(trend) < 0.05
                ? "ok"
                : Math.abs(trend) < 0.2
                  ? "caution"
                  : "danger";
            return (
              <Card key={s.id}>
                <CardHeader title={s.name} subtitle="EC trend (this cycle)" />
                <div className="flex items-end justify-between p-5">
                  <div>
                    <UnitValue
                      value={ecSeries.length > 0 ? fmt(ecSeries[ecSeries.length - 1], 2) : "-"}
                      unit="mS/cm"
                      size="lg"
                    />
                    <div
                      className={`mt-0.5 text-xs ${
                        tone === "ok"
                          ? "text-ok-700"
                          : tone === "caution"
                            ? "text-caution-700"
                            : "text-danger-700"
                      }`}
                    >
                      {ecSeries.length >= 2
                        ? `${trend >= 0 ? "+" : ""}${fmt(trend, 2)} over ${logs.length} readings`
                        : "not enough data yet"}
                    </div>
                  </div>
                  {ecSeries.length > 0 && <Sparkline values={ecSeries} tone={tone} />}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader
          title="Sodium accumulation (illustrative)"
          subtitle="Na climbs across top-off cycles even when EC looks managed [II-6.2]"
        />
        <div className="flex items-end justify-between p-5">
          <div>
            <UnitValue
              value={fmt(naSeries[naSeries.length - 1], 0)}
              unit="ppm Na"
              size="lg"
              tone="caution"
            />
            <div className="mt-0.5 text-xs text-neutral-400">
              from {fmt(naSeries[0], 0)} ppm over {naSeries.length - 1} top-off cycles (25 ppm
              source water, 100 L reservoir)
            </div>
          </div>
          <Sparkline values={naSeries} tone="caution" width={280} height={48} />
        </div>
        <div className="px-5 pb-5">
          <CaveatNote>
            Plants remove water faster than Na/Cl, so these ions concentrate over time. Trigger a
            partial reservoir dump when accumulation crosses your crop&apos;s threshold.
          </CaveatNote>
        </div>
      </Card>
    </Workspace>
  );
}
