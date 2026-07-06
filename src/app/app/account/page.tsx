import type { Metadata } from "next";
import Link from "next/link";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, Button, StatusPill } from "@/components/ui/primitives";
import { TIERS } from "@/lib/pricing";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <Workspace>
      <PageHeader
        verb="Configure"
        title="Account"
        description="Authentication, subscription, and billing. Feature-gating lives here; the paywalled computation itself is the Recipe Solver."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile" />
          <div className="space-y-3 p-5 text-sm">
            <Row label="Name" value="Side-hustle Grower" />
            <Row label="Email" value="cyaneboiplayz@gmail.com" />
            <Row label="Systems" value="3 configured" />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Subscription"
            subtitle="Current plan"
            right={<StatusPill status="ok">Pro</StatusPill>}
          />
          <div className="p-5">
            <p className="text-sm text-neutral-600">
              You&apos;re on <strong>Pro</strong> — the full multi-salt solver bundle with
              persistence. The reservoir add-on is available for recirculating setups.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/pricing">
                <Button variant="secondary">Compare plans</Button>
              </Link>
              <Button variant="secondary">Manage billing</Button>
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
