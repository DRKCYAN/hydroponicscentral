"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SaveLogState {
  success?: boolean;
  systemName?: string;
  error?: string;
}

export async function saveLogEntry(
  _prevState: SaveLogState | null,
  formData: FormData
): Promise<SaveLogState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const systemId = formData.get("systemId") as string;
  const ec = parseFloat(formData.get("ec") as string);
  const ph = parseFloat(formData.get("ph") as string);
  const temp = parseFloat(formData.get("temp") as string);
  const doVal = parseFloat(formData.get("do") as string);
  const topOff = parseFloat(formData.get("topOff") as string);

  if (isNaN(ec) || isNaN(ph)) return { error: "EC and pH are required" };

  const { data: sys } = await supabase
    .from("systems")
    .select("name")
    .eq("id", systemId)
    .single();

  const { error } = await supabase.from("log_entries").insert({
    system_id: systemId,
    user_id: user.id,
    ec,
    ph,
    temp_c: isNaN(temp) ? null : temp,
    do_mg_l: isNaN(doVal) ? null : doVal,
    top_off_l: isNaN(topOff) ? 0 : topOff,
  });

  if (error) return { error: error.message };

  revalidatePath("/app/dashboard");
  revalidatePath("/app/history");
  revalidatePath(`/app/systems/${systemId}`);

  return { success: true, systemName: sys?.name ?? "system" };
}
