/**
 * System-detail derived figures. Turnover [III-2.1] from a type-appropriate
 * flow rule of thumb [III-10.6] (RDWC ~1 turnover / 1–2 h; NFT sized per channel).
 */
export interface TurnoverEstimate {
  perHour: number;
  hours: number;
  note: string;
}

const FLOW_LH: Record<string, { lh: number; note: string }> = {
  DWC: { lh: 80, note: "RDWC target ~1 turnover / 1–2 h" },
  "Ebb & Flow": { lh: 120, note: "sized to flood/drain cycle" },
  Drip: { lh: 60, note: "emitter total flow" },
  NFT: { lh: 90, note: "NFT sized per-channel (~1–2 L/min)" },
};

export function turnoverEstimate(type: string, reservoirL: number): TurnoverEstimate {
  const f = FLOW_LH[type] ?? { lh: 80, note: "generic estimate" };
  const perHour = f.lh / reservoirL; // [III-2.1]
  return { perHour, hours: perHour > 0 ? 1 / perHour : Infinity, note: f.note };
}
