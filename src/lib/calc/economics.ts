/**
 * Planning & Economics + Dashboard running cost/profit.
 * Cost structure [V-1.x], yield/throughput [I-6.x], revenue [V-4.x],
 * break-even [V-5/6], investment [V-7.x], risk [V-8.x], running lines [V-2/3].
 */

// ---- Yield / harvest ----
/** [I-6.1] Harvest index. */
export const harvestIndex = (wEconomic: number, wTotal: number) => wEconomic / wTotal;
/** [I-6.3] Fresh weight from dry weight. */
export const freshFromDry = (dw: number, moistureFraction: number) => dw / (1 - moistureFraction);
/** [I-6.4] Yield density (per footprint) and volumetric (per stacked area). */
export const yieldDensity = (yieldTotal: number, footprintM2: number) => yieldTotal / footprintM2;
export const yieldVolumetric = (yieldTotal: number, footprintM2: number, layers: number) =>
  yieldTotal / (footprintM2 * layers);
/** [V-8.2] Effective yield after loss + utilization. */
export const effectiveYield = (nominal: number, lossRate: number, utilization: number) =>
  nominal * (1 - lossRate) * utilization;
/** [I-6.2] Predicted economic yield (dry). */
export const predictedYield = (cgr: number, durationDays: number, areaM2: number, hi: number) =>
  cgr * durationDays * areaM2 * hi;
/** [I-6.5] Cycles per year + annual yield. */
export const cyclesPerYear = (durationDays: number, turnaroundDays: number) =>
  365 / (durationDays + turnaroundDays);

// ---- Revenue ----
/** [V-4.1] Revenue per cycle. */
export const revenueCycle = (yieldOrUnits: number, price: number) => yieldOrUnits * price;
/** [V-4.2] Annual revenue. */
export const annualRevenue = (revCycle: number, cyclesYr: number) => revCycle * cyclesYr;
/** [V-4.4] Blended realized price across grades. */
export function priceRealization(grades: { price: number; fraction: number }[]): number {
  return grades.reduce((s, g) => s + g.price * g.fraction, 0);
}

// ---- Cost structure ----
/** [V-1.4] Straight-line depreciation. */
export const depreciationSL = (capex: number, salvage: number, lifeYears: number) =>
  (capex - salvage) / lifeYears;
/** [V-1.1] Total cost. */
export const totalCost = (fixed: number, variable: number) => fixed + variable;

// ---- Break-even & margins ----
/** [V-5.3] Contribution margin per unit + ratio. */
export function contributionMargin(price: number, variableCostPerUnit: number) {
  const cm = price - variableCostPerUnit;
  return { cm, ratio: price === 0 ? 0 : cm / price };
}
/** [V-6.1] Break-even units. */
export const breakEvenUnits = (fixedCost: number, cmPerUnit: number) =>
  cmPerUnit === 0 ? Infinity : fixedCost / cmPerUnit;
/** [V-6.2] Break-even price. */
export const breakEvenPrice = (varCostPerUnit: number, fixedCost: number, units: number) =>
  varCostPerUnit + (units === 0 ? Infinity : fixedCost / units);
/** [V-6.4] Margin of safety (%). */
export const marginOfSafety = (actual: number, breakEven: number) =>
  actual === 0 ? 0 : ((actual - breakEven) / actual) * 100;

// ---- Profit ----
/** [V-5.1] Gross profit + margin. */
export function grossProfit(revenue: number, cogs: number) {
  const gp = revenue - cogs;
  return { gp, marginPct: revenue === 0 ? 0 : (gp / revenue) * 100 };
}
/** [V-5.2] Net profit + margin. */
export function netProfit(revenue: number, totalCostV: number) {
  const np = revenue - totalCostV;
  return { np, marginPct: revenue === 0 ? 0 : (np / revenue) * 100 };
}
/** [V-5.4] Profit per m² per year — the decision metric. */
export const profitPerArea = (revPerAreaYr: number, costPerAreaYr: number) =>
  revPerAreaYr - costPerAreaYr;

// ---- Running cost lines (Dashboard) ----
/** [V-2.1] Electricity cost. Includes HVAC via load/COP (thermal ≠ electrical). */
export function electricityCost(
  directKwh: number,
  coolingThermalKwh: number,
  cop: number,
  ratePerKwh: number,
): number {
  const hvacKwh = cop > 0 ? coolingThermalKwh / cop : 0;
  return (directKwh + hvacKwh) * ratePerKwh;
}
/** [V-3.1] Cost per kg — include ALL costs (fixed + amortized capex), not variable only. */
export const costPerKg = (totalCostPeriod: number, yieldKg: number) =>
  yieldKg === 0 ? Infinity : totalCostPeriod / yieldKg;

// ---- Investment (time value of money) ----
/** [V-7.1] Simple payback (years). */
export const paybackSimple = (capex: number, annualNetCashFlow: number) =>
  annualNetCashFlow === 0 ? Infinity : capex / annualNetCashFlow;
/** [V-7.2] ROI (%). */
export const roi = (netProfitV: number, investment: number) =>
  investment === 0 ? 0 : (netProfitV / investment) * 100;

/** [V-7.3] Net present value. cashFlows are years 1..n. */
export function npv(capex: number, cashFlows: number[], r: number): number {
  return cashFlows.reduce((s, cf, i) => s + cf / Math.pow(1 + r, i + 1), -capex);
}

/** [V-7.4] Internal rate of return via bisection. Returns null if no sign change. */
export function irr(capex: number, cashFlows: number[]): number | null {
  const f = (r: number) => npv(capex, cashFlows, r);
  let lo = -0.9;
  let hi = 1.0;
  let flo = f(lo);
  let fhi = f(hi);
  // expand hi if needed
  let tries = 0;
  while (flo * fhi > 0 && tries++ < 100) {
    hi += 0.5;
    fhi = f(hi);
    if (hi > 100) return null;
  }
  if (flo * fhi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fmid = f(mid);
    if (Math.abs(fmid) < 1e-7) return mid;
    if (flo * fmid < 0) {
      hi = mid;
      fhi = fmid;
    } else {
      lo = mid;
      flo = fmid;
    }
  }
  return (lo + hi) / 2;
}

/** [V-7.6] Capital recovery factor + annualized capex. */
export function capitalRecoveryFactor(r: number, n: number): number {
  if (r === 0) return 1 / n;
  const p = Math.pow(1 + r, n);
  return (r * p) / (p - 1);
}
export const annualizedCapex = (capex: number, r: number, n: number) =>
  capex * capitalRecoveryFactor(r, n);

/** [V-7.7] Levelized cost of production over the project life. */
export function lcop(
  yearly: { costTotal: number; output: number }[],
  r: number,
): number {
  let dc = 0;
  let dout = 0;
  yearly.forEach((y, t) => {
    const df = Math.pow(1 + r, t);
    dc += y.costTotal / df;
    dout += y.output / df;
  });
  return dout === 0 ? Infinity : dc / dout;
}

/** [V-8.3] Downtime cost. */
export const downtimeCost = (fixedPerDay: number, days: number, lostContribution: number) =>
  fixedPerDay * days + lostContribution;
/** [V-8.1] Facility utilization (%). */
export const utilization = (actual: number, theoreticalMax: number) =>
  theoreticalMax === 0 ? 0 : (actual / theoreticalMax) * 100;
/** [V-8.4] Risk-adjusted expected return. */
export const expectedProfit = (scenarios: { p: number; profit: number }[]) =>
  scenarios.reduce((s, sc) => s + sc.p * sc.profit, 0);
