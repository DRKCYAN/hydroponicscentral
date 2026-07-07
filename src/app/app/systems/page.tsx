import Link from "next/link";
import type { Metadata } from "next";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, Button, StatusPill, UnitValue } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/server";
import { DEMO_SYSTEMS } from "@/lib/data/demo";
import { nextAction } from "@/lib/actions";
import { fmt } from "@/lib/format";
import type { DbSystem } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Systems" };

export default async function SystemsPage() {
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

  return (
    <Workspace>
      <PageHeader
        verb="Configure"
        title="Systems"
        description="Each system is a physical setup that owns its own state — active recipe, water source, last reading."
        actions={<Button>+ New system</Button>}
      />

      <Card>
        {rows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-neutral-500">No systems yet. Add your first setup to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs text-neutral-400">
                  <th className="px-5 py-3 font-medium">System</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 text-right font-medium">Reservoir</th>
                  <th className="px-3 py-3 font-medium">Water source</th>
                  <th className="px-3 py-3 font-medium">Active recipe</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rows.map((s) => {
                  const action = nextAction(s);
                  return (
                    <tr key={s.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-3">
                        <Link
                          href={`/app/systems/${s.id}`}
                          className="font-medium text-neutral-800 hover:text-accent-700"
                        >
                          {s.name}
                        </Link>
                        <div className="text-xs text-neutral-400">
                          {s.crop} · {s.stage}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-neutral-600">{s.type}</td>
                      <td className="px-3 py-3 text-right">
                        <UnitValue value={fmt(s.reservoir_l, 0)} unit="L" />
                      </td>
                      <td className="px-3 py-3 text-neutral-600">
                        {s.water_sources?.name ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-neutral-600">
                        {s.active_recipe_id ? (
                          <span className="text-neutral-700">{s.active_recipe_id}</span>
                        ) : (
                          <span className="text-neutral-400">none set</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <StatusPill status={action.status}>
                          {action.status === "ok"
                            ? "OK"
                            : action.status === "caution"
                              ? "Watch"
                              : "Act"}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/app/systems/${s.id}`}
                          className="text-xs font-medium text-accent-700 hover:underline"
                        >
                          Open →
                        </Link>
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
