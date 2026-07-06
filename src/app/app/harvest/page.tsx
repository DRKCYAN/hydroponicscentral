import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, Button, UnitValue } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/server";
import { priceRealization } from "@/lib/calc/economics";
import { fmt, fmtMoney } from "@/lib/format";
import type { DbHarvestEntry } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Harvest Log" };

const PRICE_A = 6.5;
const PRICE_B = 3.2;

export default async function HarvestLogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: harvests } = await supabase
    .from("harvest_entries")
    .select("*, systems(name)")
    .order("harvested_at", { ascending: false });

  const rows = (harvests ?? []) as DbHarvestEntry[];

  return (
    <Workspace>
      <PageHeader
        verb="Record"
        title="Harvest Log"
        description="Record a harvest and resolve it into marketable yield and realized revenue."
        actions={<Button>+ Log harvest</Button>}
      />

      <Card>
        <CardHeader
          title="Harvests"
          subtitle="Marketable yield < gross yield — culls aren't revenue"
        />
        {rows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-neutral-500">No harvests recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs text-neutral-400">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">System / crop</th>
                  <th className="px-3 py-3 text-right font-medium">Fresh</th>
                  <th className="px-3 py-3 text-right font-medium">Units</th>
                  <th className="px-3 py-3 text-right font-medium">Grade A</th>
                  <th className="px-3 py-3 text-right font-medium">Realized price</th>
                  <th className="px-5 py-3 text-right font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rows.map((h) => {
                  const gradeA = h.grade_a_fraction ?? 1;
                  const effPrice = priceRealization([
                    { price: PRICE_A, fraction: gradeA },
                    { price: PRICE_B, fraction: 1 - gradeA },
                  ]);
                  const revenue = effPrice * h.fresh_kg;
                  return (
                    <tr key={h.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 text-neutral-600">{h.harvested_at}</td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-neutral-800">{h.crop}</div>
                        <div className="text-xs text-neutral-400">{h.systems?.name ?? "—"}</div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <UnitValue value={fmt(h.fresh_kg, 1)} unit="kg" />
                      </td>
                      <td className="px-3 py-3 text-right num text-neutral-600">
                        {h.units ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-right num text-neutral-600">
                        {fmt(gradeA * 100, 0)}%
                      </td>
                      <td className="px-3 py-3 text-right">
                        <UnitValue value={fmtMoney(effPrice)} unit="/kg" size="sm" />
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-neutral-800">
                        {fmtMoney(revenue)}
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
