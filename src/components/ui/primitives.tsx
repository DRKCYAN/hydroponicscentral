/**
 * Core UI primitives. Server-component-safe (no client hooks). Encodes the
 * design direction: neutrals dominate, one muted teal accent, status colors
 * reserved, monospaced numerals, and units rendered adjacent to every number.
 */
import type { ReactNode } from "react";
import { WarningIcon, InfoIcon, Spinner } from "./icons";

type Status = "ok" | "caution" | "danger" | "info";

// ---- Card ----
export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={`rounded-xl border border-neutral-200 bg-neutral-0 shadow-xs ${className}`}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

// ---- UnitValue — a number with its unit adjacent (never unit-in-label only) ----
export function UnitValue({
  value,
  unit,
  className = "",
  size = "md",
  tone = "default",
}: {
  value: ReactNode;
  unit?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "default" | "muted" | Status;
}) {
  const sizeCls = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
    xl: "text-4xl",
  }[size];
  const toneCls = {
    default: "text-neutral-900",
    muted: "text-neutral-500",
    ok: "text-ok-700",
    caution: "text-caution-700",
    danger: "text-danger-700",
    info: "text-info-700",
  }[tone];
  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className={`num font-semibold ${sizeCls} ${toneCls}`}>{value}</span>
      {unit && <span className="text-xs font-medium text-neutral-500">{unit}</span>}
    </span>
  );
}

// ---- StatusPill — green/amber/red reserved strictly for status ----
const STATUS_STYLE: Record<Status, string> = {
  ok: "bg-ok-50 text-ok-700 border-ok-200",
  caution: "bg-caution-50 text-caution-700 border-caution-200",
  danger: "bg-danger-50 text-danger-700 border-danger-200",
  info: "bg-info-50 text-info-700 border-info-200",
};
export function StatusPill({
  status,
  children,
}: {
  status: Status;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "ok"
            ? "bg-ok-500"
            : status === "caution"
              ? "bg-caution-500"
              : status === "danger"
                ? "bg-danger-500"
                : "bg-info-500"
        }`}
      />
      {children}
    </span>
  );
}

// ---- CaveatNote — ONE consistent muted-amber inline treatment (spec §9) ----
export function CaveatNote({
  children,
  tone = "caution",
}: {
  children: ReactNode;
  tone?: "caution" | "danger" | "info";
}) {
  const style = {
    caution: "border-caution-200 bg-caution-50 text-caution-700",
    danger: "border-danger-200 bg-danger-50 text-danger-700",
    info: "border-info-200 bg-info-50 text-info-700",
  }[tone];
  const Icon = tone === "info" ? InfoIcon : WarningIcon;
  return (
    <p
      className={`flex gap-2 rounded-lg border px-3 py-2.5 text-xs leading-relaxed ${style}`}
      role="note"
    >
      <Icon size={15} className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}

// ---- Button ----
export function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  loading = false,
  loadingText,
  disabled,
  ...rest
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit";
  className?: string;
  loading?: boolean;
  loadingText?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[background-color,border-color,transform] duration-150 ease-[var(--ease-standard)] active:translate-y-px disabled:opacity-55 disabled:pointer-events-none";
  const variants = {
    primary: "bg-accent-600 text-neutral-0 hover:bg-accent-700",
    secondary: "border border-neutral-300 bg-neutral-0 text-neutral-700 hover:bg-neutral-100",
    ghost: "text-accent-700 hover:bg-accent-50",
  }[variant];
  const sizes = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  }[size];
  return (
    <button
      type={type}
      className={`${base} ${variants} ${sizes} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size={size === "sm" ? 13 : 15} />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}

// ---- Section label ----
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-accent-600">
      {children}
    </span>
  );
}

// ---- Stat block ----
export function Stat({
  label,
  value,
  unit,
  tone,
  hint,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  tone?: "default" | "muted" | Status;
  hint?: ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-neutral-500">{label}</div>
      <div className="mt-1">
        <UnitValue value={value} unit={unit} size="lg" tone={tone} />
      </div>
      {hint && <div className="mt-0.5 text-xs text-neutral-400">{hint}</div>}
    </div>
  );
}
