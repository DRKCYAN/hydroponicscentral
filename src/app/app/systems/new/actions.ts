"use server";

import { createClient } from "@/lib/supabase/server";
import { CROP_TARGETS } from "@/lib/data/crops";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SystemType } from "@/lib/supabase/types";

export interface CreateSystemState {
  error?: string;
}

const SYSTEM_TYPES: SystemType[] = ["DWC", "NFT", "Drip", "Ebb & Flow"];

export async function createSystem(
  _prevState: CreateSystemState | null,
  formData: FormData
): Promise<CreateSystemState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to save your system: it needs an account to live in." };

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "") as SystemType;
  const reservoirL = parseFloat(String(formData.get("reservoirL")));
  const cropTargetId = String(formData.get("cropTargetId") ?? "");
  const ecTarget = parseFloat(String(formData.get("ecTarget")));
  const phLow = parseFloat(String(formData.get("phLow")));
  const phHigh = parseFloat(String(formData.get("phHigh")));
  const waterSourceId = String(formData.get("waterSourceId") ?? "");

  if (!name) return { error: "Give the system a name." };
  if (!SYSTEM_TYPES.includes(type)) return { error: "Pick a system type." };
  if (isNaN(reservoirL) || reservoirL <= 0)
    return { error: "Reservoir volume must be a positive number of liters." };
  if (isNaN(ecTarget) || ecTarget <= 0)
    return { error: "EC target must be a positive number." };
  if (isNaN(phLow) || isNaN(phHigh) || phLow >= phHigh)
    return { error: "The pH band needs a low value below the high value." };

  const crop = CROP_TARGETS.find((c) => c.id === cropTargetId);

  const { data, error } = await supabase
    .from("systems")
    .insert({
      user_id: user.id,
      name,
      type,
      reservoir_l: reservoirL,
      crop: crop?.name ?? "",
      crop_target_id: crop?.id ?? "",
      stage: crop?.stage ?? "",
      water_source_id: waterSourceId || null,
      ec_target: ecTarget,
      ph_target_low: phLow,
      ph_target_high: phHigh,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/app/dashboard");
  revalidatePath("/app/systems");
  redirect(`/app/systems/${data.id}`);
}
