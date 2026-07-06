/** Derive the single "next action" a system needs — the Dashboard's job. */
import { SYSTEMS, ecStatus, phStatus, type SystemContext, type Status } from "@/lib/data/mock";

export interface NextAction {
  status: Status;
  label: string;
  detail: string;
}

export function nextAction(s: SystemContext): NextAction {
  const ecS = ecStatus(s.last.ec, s.ecTarget);
  const phS = phStatus(s.last.ph, s.phTarget);

  if (s.last.reservoirPct <= 30) {
    return {
      status: "danger",
      label: "Top off / refill reservoir",
      detail: `Reservoir at ${s.last.reservoirPct}% — below the 30% pump-safety floor.`,
    };
  }
  if (ecS === "danger") {
    const high = s.last.ec > s.ecTarget;
    return {
      status: "danger",
      label: high ? "Partial refresh — EC high" : "Dose nutrients — EC low",
      detail: `EC ${s.last.ec} vs target ${s.ecTarget} mS/cm.`,
    };
  }
  if (phS === "danger") {
    const high = s.last.ph > s.phTarget[1];
    return {
      status: "danger",
      label: high ? "Dose pH-down (acid)" : "Dose pH-up (base)",
      detail: `pH ${s.last.ph} outside ${s.phTarget[0]}–${s.phTarget[1]}.`,
    };
  }
  if (ecS === "caution" || phS === "caution") {
    return {
      status: "caution",
      label: "Watch drift — small correction soon",
      detail:
        ecS === "caution"
          ? `EC drifting: ${s.last.ec} vs ${s.ecTarget}.`
          : `pH near the edge: ${s.last.ph}.`,
    };
  }
  if (s.last.reservoirPct <= 50) {
    return {
      status: "caution",
      label: "Plan a top-off",
      detail: `Reservoir at ${s.last.reservoirPct}%.`,
    };
  }
  return { status: "ok", label: "Holding — no action", detail: "All readings in range." };
}

export function allSystemsSummary() {
  const actions = SYSTEMS.map((s) => ({ system: s, action: nextAction(s) }));
  const needAttention = actions.filter((a) => a.action.status !== "ok").length;
  return { actions, needAttention, total: SYSTEMS.length };
}
