import { MarketingHeader } from "@/components/shell/MarketingHeader";
import { MarketingFooter } from "@/components/shell/MarketingFooter";

/** Logged-out marketing shell: top bar + footer, used for public pages. */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
