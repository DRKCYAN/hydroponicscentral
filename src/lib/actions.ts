import { ecStatus, phStatus } from "@/lib/data/mock";
import type { DbSystem, Status } from "@/lib/supabase/types";

export interface NextAction {
  status: Status;
  label: string;
  detail: string;
}

export function nextAction(s: DbSystem): NextAction {
  const ec = s.last_ec;
  const ph = s.last_ph;
  const reservoirPct = s.last_reservoir_pct;

  if (ec === null || ph === null) {
    return { status: "caution", label: "Log first reading", detail: "No readings recorded yet for this system." };
  }

  const ecS = ecStatus(ec, s.ec_target);
  const phS = phStatus(ph, [s.ph_target_low, s.ph_target_high]);

  if (reservoirPct !== null && reservoirPct <= 30) {
    return {
      status: "danger",
      label: "Top off / refill reservoir",
      detail: `Reservoir at ${reservoirPct}% — below the 30% pump-safety floor.`,
    };
  }
  if (ecS === "danger") {
    const high = ec > s.ec_target;
    return {
      status: "danger",
      label: high ? "Partial refresh — EC high" : "Dose nutrients — EC low",
      detail: `EC ${ec} vs target ${s.ec_target} mS/cm.`,
    };
  }
  if (phS === "danger") {
    const high = ph > s.ph_target_high;
    return {
      status: "danger",
      label: high ? "Dose pH-down (acid)" : "Dose pH-up (base)",
      detail: `pH ${ph} outside ${s.ph_target_low}–${s.ph_target_high}.`,
    };
  }
  if (ecS === "caution" || phS === "caution") {
    return {
      status: "caution",
      label: "Watch drift — small correction soon",
      detail:
        ecS === "caution"
          ? `EC drifting: ${ec} vs ${s.ec_target}.`
          : `pH near the edge: ${ph}.`,
    };
  }
  if (reservoirPct !== null && reservoirPct <= 50) {
    return {
      status: "caution",
      label: "Plan a top-off",
      detail: `Reservoir at ${reservoirPct}%.`,
    };
  }
  return { status: "ok", label: "Holding — no action", detail: "All readings in range." };
}
