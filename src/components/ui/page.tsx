import type { ReactNode } from "react";

/** Consistent workspace page header: verb chip · title · description · actions. */
export function PageHeader({
  verb,
  title,
  description,
  actions,
}: {
  verb?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {verb && (
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-600">
            {verb}
          </span>
        )}
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Workspace content wrapper with a max width so tables stay readable. */
export function Workspace({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-6xl px-6 py-6">{children}</div>;
}
