/** Formatting helpers. Numbers render monospaced with units adjacent (spec §9). */

export function fmt(value: number, digits = 1): string {
  if (!isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtInt(value: number): string {
  if (!isFinite(value)) return "—";
  return Math.round(value).toLocaleString();
}

export function fmtMoney(value: number, currency = "USD"): string {
  if (!isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

export function fmtPct(value: number, digits = 0): string {
  if (!isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function fmtSigned(value: number, digits = 1): string {
  if (!isFinite(value)) return "—";
  const s = value.toFixed(digits);
  return value > 0 ? `+${s}` : s;
}
