import type { Metadata } from "next";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, Button, UnitValue } from "@/components/ui/primitives";
import { HARVESTS } from "@/lib/data/mock";
import { priceRealization } from "@/lib/calc/economics";
import { fmt, fmtMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Harvest Log" };

// Illustrative grade prices for the realized-revenue read.
const PRICE_A = 6.5;
const PRICE_B = 3.2;

export default function HarvestLogPage() {
  return (
    <Workspace>
      <PageHeader
        verb="Record"
        title="Harvest Log"
        description="Record a harvest and resolve it into marketable yield and realized revenue. Same action as a Log Entry — writing a fact — just at a cycle milestone."
        actions={<Button>+ Log harvest</Button>}
      />

      <Card>
        <CardHeader title="Harvests" subtitle="Marketable yield < gross yield — culls aren't revenue" />
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
              {HARVESTS.map((h) => {
                const effPrice = priceRealization([
                  { price: PRICE_A, fraction: h.gradeA },
                  { price: PRICE_B, fraction: 1 - h.gradeA },
                ]);
                const revenue = effPrice * h.freshKg;
                return (
                  <tr key={h.at + h.system} className="hover:bg-neutral-50">
                    <td className="px-5 py-3 text-neutral-600">{h.at}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-neutral-800">{h.crop}</div>
                      <div className="text-xs text-neutral-400">{h.system}</div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <UnitValue value={fmt(h.freshKg, 1)} unit="kg" />
                    </td>
                    <td className="px-3 py-3 text-right num text-neutral-600">{h.units}</td>
                    <td className="px-3 py-3 text-right num text-neutral-600">{fmt(h.gradeA * 100, 0)}%</td>
                    <td className="px-3 py-3 text-right">
                      <UnitValue value={fmtMoney(effPrice)} unit="/kg" size="sm" />
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-neutral-800">{fmtMoney(revenue)}</td>
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
