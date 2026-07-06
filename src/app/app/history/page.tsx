import type { Metadata } from "next";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, Stat, UnitValue, CaveatNote } from "@/components/ui/primitives";
import { Sparkline } from "@/components/ui/Sparkline";
import { SYSTEMS, LOG_HISTORY, WATER_PROFILES } from "@/lib/data/mock";
import { rgr, doublingTime, agr, cgr, nar, lai, wue } from "@/lib/calc/biology";
import { accumulateIon } from "@/lib/calc/ph";
import { fmt } from "@/lib/format";

export const metadata: Metadata = { title: "System History & Trends" };

// Illustrative sequential growth samples (dry weight g, leaf area m², days).
const GROWTH = { w1: 2.1, w2: 8.4, a1: 0.02, a2: 0.09, t1: 0, t2: 21, groundM2: 1.2, waterL: 46 };

export default function HistoryPage() {
  const rgrVal = rgr(GROWTH.w1, GROWTH.w2, GROWTH.t1, GROWTH.t2);
  const agrVal = agr(GROWTH.w1, GROWTH.w2, GROWTH.t1, GROWTH.t2);
  const laiVal = lai(GROWTH.a2, GROWTH.groundM2);
  const narVal = nar(GROWTH.w1, GROWTH.w2, GROWTH.a1, GROWTH.a2, GROWTH.t1, GROWTH.t2);
  const cgrVal = cgr(narVal, laiVal);
  const wueVal = wue(GROWTH.w2 - GROWTH.w1, GROWTH.waterL);

  // Na accumulation over top-off cycles for the hardest water source (Well A).
  const wellA = WATER_PROFILES.find((w) => w.id === "well-a")!;
  const naSeries = accumulateIon(wellA.Na, 20, 100, 12, wellA.Na);

  return (
    <Workspace>
      <PageHeader
        verb="Monitor"
        title="System History & Trends"
        description="Retrospective analysis across cycles. These only become meaningful once history has accumulated — growth rates, efficiency, and salt accumulation over time."
      />

      {/* Growth analysis */}
      <Card className="mb-6">
        <CardHeader title="Growth analysis" subtitle="From sequential dry-weight & leaf-area samples" />
        <div className="grid grid-cols-2 gap-6 p-5 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="AGR" value={fmt(agrVal, 2)} unit="g/day" />
          <Stat label="RGR" value={fmt(rgrVal, 3)} unit="g/g/day" />
          <Stat label="Doubling time" value={fmt(doublingTime(rgrVal), 1)} unit="days" />
          <Stat label="LAI" value={fmt(laiVal, 2)} />
          <Stat label="CGR" value={fmt(cgrVal, 1)} unit="g/m²/day" />
          <Stat label="WUE" value={fmt(wueVal, 3)} unit="g/L" />
        </div>
      </Card>

      {/* EC trend per system */}
      <div className="grid gap-4 lg:grid-cols-3">
        {SYSTEMS.map((s) => {
          const logs = LOG_HISTORY[s.id] ?? [];
          const ecSeries = logs.map((l) => l.ec);
          const trend = ecSeries.length >= 2 ? ecSeries[ecSeries.length - 1] - ecSeries[0] : 0;
          const tone = Math.abs(trend) < 0.05 ? "ok" : Math.abs(trend) < 0.2 ? "caution" : "danger";
          return (
            <Card key={s.id}>
              <CardHeader title={s.name} subtitle="EC trend (this cycle)" />
              <div className="flex items-end justify-between p-5">
                <div>
                  <UnitValue value={fmt(ecSeries[ecSeries.length - 1] ?? 0, 2)} unit="mS/cm" size="lg" />
                  <div className={`mt-0.5 text-xs ${tone === "ok" ? "text-ok-700" : tone === "caution" ? "text-caution-700" : "text-danger-700"}`}>
                    {trend >= 0 ? "+" : ""}
                    {fmt(trend, 2)} over {logs.length} readings
                  </div>
                </div>
                <Sparkline values={ecSeries} tone={tone} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Accumulation trend */}
      <Card className="mt-6">
        <CardHeader
          title="Sodium accumulation — Well A"
          subtitle="Na climbs across top-off cycles even when EC looks managed [II-6.2]"
        />
        <div className="flex items-end justify-between p-5">
          <div>
            <UnitValue value={fmt(naSeries[naSeries.length - 1], 0)} unit="ppm Na" size="lg" tone="caution" />
            <div className="mt-0.5 text-xs text-neutral-400">
              from {fmt(naSeries[0], 0)} ppm over {naSeries.length - 1} top-off cycles
            </div>
          </div>
          <Sparkline values={naSeries} tone="caution" width={280} height={48} />
        </div>
        <div className="px-5 pb-5">
          <CaveatNote>
            Plants remove water faster than Na/Cl, so these ions concentrate over time. Trigger a
            partial reservoir dump when accumulation crosses your crop&apos;s threshold — rounding at
            the decision boundary keeps that trigger reproducible.
          </CaveatNote>
        </div>
      </Card>
    </Workspace>
  );
}
