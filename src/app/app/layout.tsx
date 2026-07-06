import { LeftRail } from "@/components/shell/LeftRail";
import { UtilityStrip } from "@/components/shell/UtilityStrip";

/**
 * Logged-in product shell. Two zones: a persistent left rail (nav) + a
 * right-hand detail pane (workspace). A thin utility strip replaces the
 * marketing top bar (spec §2).
 */
export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      <UtilityStrip />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-neutral-0 md:block">
          <LeftRail />
        </aside>
        <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
