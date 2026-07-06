import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/primitives";
import { inputClass } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { PasswordConfirmField } from "@/components/auth/PasswordConfirmField";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { createClient } from "@/lib/supabase/server";
import { signUp } from "./actions";

export const metadata: Metadata = { title: "Create account — Hydroponics Hub" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/app/dashboard");

  const { error, message } = await searchParams;

  if (message === "check_email") {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <Card className="p-8 text-center">
          <div className="text-2xl">📬</div>
          <h1 className="mt-3 text-lg font-semibold text-neutral-900">Check your email</h1>
          <p className="mt-2 text-sm text-neutral-500">
            We sent a confirmation link to your inbox. Click it to activate your account and get
            started.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-accent-700 hover:underline"
          >
            Back to sign in
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Create account</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Already have one?{" "}
        <Link href="/login" className="font-medium text-accent-700 hover:underline">
          Sign in
        </Link>
      </p>

      <Card className="mt-8">
        <div className="space-y-4 p-6 pb-0">
          <OAuthButtons from="/signup" />
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <div className="h-px flex-1 bg-neutral-200" />
            or continue with email
            <div className="h-px flex-1 bg-neutral-200" />
          </div>
        </div>

        <form action={signUp} className="space-y-4 p-6">
          {error && (
            <div className="rounded-md bg-danger-50 px-4 py-3 text-sm text-danger-700">
              {decodeURIComponent(error)}
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

          <PasswordConfirmField />

          <SubmitButton pendingText="Creating account…" className="w-full">
            Create account
          </SubmitButton>

          <p className="text-center text-xs text-neutral-400">
            Free forever. No credit card required.
          </p>
        </form>
      </Card>
    </div>
  );
}
