/** Form field building blocks. Markup only — state lives in the client pages. */
import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-100";

/** A labeled control with a unit suffix rendered adjacent to the input. */
export function Field({
  label,
  unit,
  hint,
  children,
  htmlFor,
}: {
  label: ReactNode;
  unit?: string;
  hint?: ReactNode;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-medium text-neutral-600">
        <span>{label}</span>
        {unit && <span className="text-neutral-400">{unit}</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-400">{hint}</span>}
    </label>
  );
}

/** An input with a fixed unit tag inside the control border. */
export function InputWithUnit({
  unit,
  ...rest
}: { unit?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className="flex items-stretch overflow-hidden rounded-md border border-neutral-300 bg-neutral-0 focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-100">
      <input
        {...rest}
        className="num w-full bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none"
      />
      {unit && (
        <span className="flex items-center border-l border-neutral-200 bg-neutral-50 px-2.5 text-xs font-medium text-neutral-500">
          {unit}
        </span>
      )}
    </span>
  );
}
