import Link from "next/link";
import { LeftRail } from "@/components/shell/LeftRail";
import { UtilityStrip } from "@/components/shell/UtilityStrip";
import { createClient } from "@/lib/supabase/server";

/**
 * Logged-in product shell. Two zones: a persistent left rail (nav) + a
 * right-hand detail pane (workspace). A thin utility strip replaces the
 * marketing top bar (spec §2).
 *
 * The shell also works signed-out: pages render demo data and a banner
 * explains that sign-in is only needed to save your own data.
 */
export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      <UtilityStrip email={user?.email ?? null} />
      {!user && (
        <div className="flex items-center justify-center gap-2 border-b border-accent-200 bg-accent-50 px-4 py-2 text-center text-sm text-accent-800">
          <span>
            You&apos;re exploring with demo data.{" "}
            <Link href="/login" className="font-semibold underline underline-offset-2">
              Sign in
            </Link>{" "}
            only when you want to save your own readings.
          </span>
        </div>
      )}
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-neutral-0 md:block">
          <LeftRail />
        </aside>
        <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
