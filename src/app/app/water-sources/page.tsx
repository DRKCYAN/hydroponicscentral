import type { Metadata } from "next";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, Button, UnitValue, CaveatNote } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/server";
import { DEMO_WATER_SOURCES } from "@/lib/data/demo";
import { waterHardness, alkalinityToMeqL } from "@/lib/calc/water";
import { fmt } from "@/lib/format";
import type { DbWaterSource } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Water Source Profiles" };

export default async function WaterSourcesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rows: DbWaterSource[];
  if (user) {
    const { data: sources } = await supabase
      .from("water_sources")
      .select("*")
      .order("created_at");
    rows = (sources ?? []) as DbWaterSource[];
  } else {
    rows = DEMO_WATER_SOURCES;
  }

  return (
    <Workspace>
      <PageHeader
        verb="Configure"
        title="Water Source Profiles"
        description="Characterize your source water so the Recipe Solver can correct for what's already in it."
        actions={<Button>+ Add profile</Button>}
      />

      {rows.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-neutral-500">
            No water profiles yet. Add your source water to enable solver corrections.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {rows.map((w) => {
            const hardness = waterHardness(w.ca_ppm, w.mg_ppm);
            const alkMeq = alkalinityToMeqL(w.alkalinity);
            const hard = hardness > 150;
            return (
              <Card key={w.id}>
                <CardHeader title={w.name} subtitle={`EC ${w.ec} mS/cm · pH ${w.ph}`} />
                <div className="grid grid-cols-2 gap-3 p-5 text-sm">
                  {(
                    [
                      ["Ca", w.ca_ppm],
                      ["Mg", w.mg_ppm],
                      ["Na", w.na_ppm],
                      ["Cl", w.cl_ppm],
                      ["S", w.s_ppm],
                      ["K", w.k_ppm],
                      ["N", w.n_ppm],
                    ] as const
                  ).map(([label, val]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded bg-neutral-50 px-2.5 py-1.5"
                    >
                      <span className="text-xs text-neutral-500">{label}</span>
                      <UnitValue value={fmt(val, 0)} unit="ppm" size="sm" />
                    </div>
                  ))}
                </div>
                <div className="border-t border-neutral-200 p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-neutral-500">Total hardness</div>
                      <UnitValue
                        value={fmt(hardness, 0)}
                        unit="mg/L CaCO₃"
                        tone={hard ? "caution" : "default"}
                      />
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
                        Hard water: several ions (Ca, Mg, S, Na) may already exceed target. Blend
                        with RO water instead of adding fertilizer.
                      </CaveatNote>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Workspace>
  );
}
