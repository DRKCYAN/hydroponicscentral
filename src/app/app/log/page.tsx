import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogClient } from "./LogClient";
import type { DbSystem } from "@/lib/supabase/types";

export const metadata = { title: "Log Entry" };

export default async function LogEntryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: systems } = await supabase
    .from("systems")
    .select("id, name, ec_target, ph_target_low, ph_target_high")
    .order("created_at");

  return <LogClient systems={(systems ?? []) as DbSystem[]} />;
}
