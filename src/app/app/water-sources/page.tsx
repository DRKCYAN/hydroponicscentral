import type { Metadata } from "next";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, Button, UnitValue, CaveatNote } from "@/components/ui/primitives";
import { WATER_PROFILES } from "@/lib/data/mock";
import { waterHardness, alkalinityToMeqL } from "@/lib/calc/water";
import { fmt } from "@/lib/format";

export const metadata: Metadata = { title: "Water Source Profiles" };

export default function WaterSourcesPage() {
  return (
    <Workspace>
      <PageHeader
        verb="Configure"
        title="Water Source Profiles"
        description="Characterize your source water so the Recipe Solver can correct for what's already in it."
        actions={<Button>+ Add profile</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {WATER_PROFILES.map((w) => {
          const hardness = waterHardness(w.Ca, w.Mg);
          const alkMeq = alkalinityToMeqL(w.alkalinity);
          const hard = hardness > 150;
          return (
            <Card key={w.id}>
              <CardHeader
                title={w.name}
                subtitle={`EC ${w.ec} mS/cm · pH ${w.ph}`}
              />
              <div className="grid grid-cols-2 gap-3 p-5 text-sm">
                {(["Ca", "Mg", "Na", "Cl", "S", "K", "N"] as const).map((k) => (
                  <div key={k} className="flex items-center justify-between rounded bg-neutral-50 px-2.5 py-1.5">
                    <span className="text-xs text-neutral-500">{k}</span>
                    <UnitValue value={fmt(w[k], 0)} unit="ppm" size="sm" />
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-200 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-neutral-500">Total hardness</div>
                    <UnitValue value={fmt(hardness, 0)} unit="mg/L CaCO₃" tone={hard ? "caution" : "default"} />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">Alkalinity</div>
                    <UnitValue value={fmt(alkMeq, 2)} unit="meq/L" />
                    <div className="text-xs text-neutral-400">{w.alkalinity} mg/L CaCO₃</div>
                  </div>
                </div>
                {hard && (
                  <div className="mt-3">
                    <CaveatNote>
                      Hard water: several ions (Ca, Mg, S, Na) may already exceed target. You
                      can&apos;t remove them by adding fertilizer — blend with RO water instead.
                    </CaveatNote>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </Workspace>
  );
}
