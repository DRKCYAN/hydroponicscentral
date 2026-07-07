import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/primitives";
import { inputClass } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { createClient } from "@/lib/supabase/server";
import { signIn } from "./actions";

export const metadata: Metadata = { title: "Sign in — Hydroponicity" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/app/dashboard");

  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Sign in</h1>
      <p className="mt-2 text-sm text-neutral-500">
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-accent-700 hover:underline">
          Create one free
        </Link>
      </p>

      <Card className="mt-8">
        <div className="space-y-4 p-6 pb-0">
          <OAuthButtons from="/login" />
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <div className="h-px flex-1 bg-neutral-200" />
            or continue with email
            <div className="h-px flex-1 bg-neutral-200" />
          </div>
        </div>

        <form action={signIn} className="space-y-4 p-6">
          {error && (
            <div className="rounded-md bg-danger-50 px-4 py-3 text-sm text-danger-700">
              {error === "invalid_credentials"
                ? "Incorrect email or password."
                : error === "email_not_confirmed"
                  ? "Please confirm your email address before signing in — check your inbox for the confirmation link."
                  : error === "auth_error"
                    ? "Something went wrong. Please try again."
                    : "An error occurred. Please try again."}
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={inputClass}
              placeholder="••••••••"
            />
          </label>

          <SubmitButton pendingText="Signing in…" className="w-full">
            Sign in
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
