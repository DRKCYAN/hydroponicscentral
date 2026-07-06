import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, Button, StatusPill } from "@/components/ui/primitives";
import { TIERS } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, subscription_tier")
    .eq("id", user.id)
    .single();

  const { count: systemCount } = await supabase
    .from("systems")
    .select("*", { count: "exact", head: true });

  const tier = profile?.subscription_tier ?? "free";
  const tierLabel = tier === "pro_reservoir" ? "Pro + Reservoir" : tier === "pro" ? "Pro" : "Free";

  return (
    <Workspace>
      <PageHeader
        verb="Configure"
        title="Account"
        description="Authentication, subscription, and billing."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile" />
          <div className="space-y-3 p-5 text-sm">
            <Row label="Name" value={profile?.display_name ?? user.email?.split("@")[0] ?? "—"} />
            <Row label="Email" value={user.email ?? "—"} />
            <Row label="Systems" value={`${systemCount ?? 0} configured`} />
          </div>
          <div className="border-t border-neutral-100 px-5 pb-5 pt-4">
            <form action={signOut}>
              <Button variant="secondary" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Subscription"
            subtitle="Current plan"
            right={<StatusPill status={tier === "free" ? "caution" : "ok"}>{tierLabel}</StatusPill>}
          />
          <div className="p-5">
            <p className="text-sm text-neutral-600">
              {tier === "free"
                ? "You're on the Free plan. Upgrade to Pro to unlock the multi-salt recipe solver and persistence."
                : tier === "pro"
                  ? "You're on Pro — the full multi-salt solver bundle with persistence."
                  : "You're on Pro + Reservoir — the full solver bundle plus reservoir management."}
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/pricing">
                <Button variant="secondary">Compare plans</Button>
              </Link>
              {tier === "free" && <Button>Upgrade to Pro</Button>}
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Plan features" />
        <div className="grid gap-4 p-5 md:grid-cols-3">
          {TIERS.map((t) => (
            <div key={t.id} className="rounded-md border border-neutral-200 p-4">
              <div className="text-sm font-semibold text-neutral-800">{t.name}</div>
              <div className="mt-1 text-xs text-neutral-500">{t.tagline}</div>
            </div>
          ))}
        </div>
      </Card>
    </Workspace>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-800">{value}</span>
    </div>
  );
}
