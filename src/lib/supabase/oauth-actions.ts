"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Provider } from "@supabase/supabase-js";

const SUPPORTED_PROVIDERS = ["google", "github"] as const;

export async function signInWithOAuth(formData: FormData) {
  const providerValue = formData.get("provider");
  const from = formData.get("from") === "/signup" ? "/signup" : "/login";

  if (
    typeof providerValue !== "string" ||
    !SUPPORTED_PROVIDERS.includes(providerValue as (typeof SUPPORTED_PROVIDERS)[number])
  ) {
    redirect(`${from}?error=auth_error`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: providerValue as Provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error || !data?.url) {
    redirect(`${from}?error=auth_error`);
  }

  redirect(data.url);
}
