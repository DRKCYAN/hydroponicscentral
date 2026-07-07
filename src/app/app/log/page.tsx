import { createClient } from "@/lib/supabase/server";
import { DEMO_SYSTEMS } from "@/lib/data/demo";
import { LogClient } from "./LogClient";
import type { DbSystem } from "@/lib/supabase/types";

export const metadata = { title: "Log Entry" };

export default async function LogEntryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let systems: DbSystem[];
  if (user) {
    const { data } = await supabase
      .from("systems")
      .select("id, name, ec_target, ph_target_low, ph_target_high")
      .order("created_at");
    systems = (data ?? []) as DbSystem[];
  } else {
    systems = DEMO_SYSTEMS;
  }

  return <LogClient systems={systems} isAuthed={!!user} />;
}
