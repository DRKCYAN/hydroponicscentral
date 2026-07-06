"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAuthApiError } from "@supabase/supabase-js";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    const code = isAuthApiError(error) ? error.code : undefined;
    if (code === "email_not_confirmed") redirect("/login?error=email_not_confirmed");
    if (code === "invalid_credentials") redirect("/login?error=invalid_credentials");
    redirect("/login?error=auth_error");
  }

  redirect("/app/dashboard");
}
