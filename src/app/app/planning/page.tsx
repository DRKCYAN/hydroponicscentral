"use client";

import { useState } from "react";
import { Workspace, PageHeader } from "@/components/ui/page";
import { Card, CardHeader, Stat, CaveatNote, StatusPill } from "@/components/ui/primitives";
import { Field, inputClass } from "@/components/ui/field";
import {
  cyclesPerYear,
  annualRevenue,
  contributionMargin,
  breakEvenUnits,
  npv,
  irr,
  paybackSimple,
  annualizedCapex,
  lcop,
  netProfit,
} from "@/lib/calc/economics";
import { fmt, fmtMoney, fmtPct } from "@/lib/format";

export default function PlanningPage() {
  const [capex, setCapex] = useState("18000");
  const [opexYear, setOpexYear] = useState("14500");
  const [price, setPrice] = useState("6.5");
  const [varCost, setVarCost] = useState("2.1");
  const [unitsCycle, setUnitsCycle] = useState("900");
  const [durationDays, setDurationDays] = useState("35");
  const [turnaround, setTurnaround] = useState("7");
  const [discount, setDiscount] = useState("10");
  const [horizon, setHorizon] = useState("5");
  const [salvage] = useState("2000");

  const n = (v: string) => parseFloat(v) || 0;
  const cycles = cyclesPerYear(n(durationDays), n(turnaround));
  const unitsYear = n(unitsCycle) * cycles;
  const revCycle = n(unitsCycle) * n(price);
  const revYear = annualRevenue(revCycle, cycles);
  const cm = contributionMargin(n(price), n(varCost));
  const fixedAnnual = annualizedCapex(n(capex), n(discount) / 100, n(horizon)) + n(opexYear) * 0.3;
  const beUnits = breakEvenUnits(fixedAnnual, cm.cm);
  const profit = netProfit(revYear, n(opexYear));
  const annualCash = profit.np + (n(capex) - n(salvage)) / n(horizon); // profit + depreciation add-back
  const cashFlows = Array.from({ length: Math.max(1, Math.round(n(horizon))) }, () => annualCash);
  const projectNpv = npv(n(capex), cashFlows, n(discount) / 100);
  const projectIrr = irr(n(capex), cashFlows);
  const payback = paybackSimple(n(capex), annualCash);
  const levelized = lcop(
    cashFlows.map(() => ({ costTotal: n(opexYear) + (n(capex) - n(salvage)) / n(horizon), output: unitsYear })),
    n(discount) / 100,
  );

  const npvGood = projectNpv > 0;

  return (
    <Workspace>
      <PageHeader
        verb="Decide"
        title="Planning & Economics"
        description="The facility-level decision page. Where the Recipe Solver decides how to mix this batch, Planning decides whether to build, which crop to run, and at what price."
        actions={<StatusPill status={npvGood ? "ok" : "danger"}>{npvGood ? "NPV positive" : "NPV negative"}</StatusPill>}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card>
          <CardHeader title="Assumptions" subtitle="All user inputs: no universal values" />
          <div className="grid grid-cols-2 gap-4 p-5">
            <Field label="CapEx" unit="$"><input className={`${inputClass} num`} value={capex} onChange={(e) => setCapex(e.target.value)} /></Field>
            <Field label="OpEx / year" unit="$"><input className={`${inputClass} num`} value={opexYear} onChange={(e) => setOpexYear(e.target.value)} /></Field>
            <Field label="Price / unit" unit="$"><input className={`${inputClass} num`} value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
            <Field label="Variable cost / unit" unit="$"><input className={`${inputClass} num`} value={varCost} onChange={(e) => setVarCost(e.target.value)} /></Field>
            <Field label="Units / cycle"><input className={`${inputClass} num`} value={unitsCycle} onChange={(e) => setUnitsCycle(e.target.value)} /></Field>
            <Field label="Crop duration" unit="days"><input className={`${inputClass} num`} value={durationDays} onChange={(e) => setDurationDays(e.target.value)} /></Field>
            <Field label="Turnaround" unit="days"><input className={`${inputClass} num`} value={turnaround} onChange={(e) => setTurnaround(e.target.value)} /></Field>
            <Field label="Discount rate" unit="%"><input className={`${inputClass} num`} value={discount} onChange={(e) => setDiscount(e.target.value)} /></Field>
            <Field label="Horizon" unit="years"><input className={`${inputClass} num`} value={horizon} onChange={(e) => setHorizon(e.target.value)} /></Field>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Throughput & revenue" />
            <div className="grid grid-cols-3 gap-4 p-5">
              <Stat label="Cycles / year" value={fmt(cycles, 1)} />
              <Stat label="Units / year" value={fmt(unitsYear, 0)} />
              <Stat label="Revenue / year" value={fmtMoney(revYear)} />
              <Stat label="Contribution margin" value={fmtMoney(cm.cm)} unit="/unit" hint={`${fmtPct(cm.ratio * 100)} of price`} />
              <Stat label="Break-even units/yr" value={fmt(beUnits, 0)} tone={beUnits < unitsYear ? "ok" : "danger"} />
              <Stat label="Net profit / year" value={fmtMoney(profit.np)} tone={profit.np > 0 ? "ok" : "danger"} hint={fmtPct(profit.marginPct) + " margin"} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Investment decision" subtitle="Time value of money: the metrics to actually trust" />
            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
              <Stat label="NPV" value={fmtMoney(projectNpv)} tone={npvGood ? "ok" : "danger"} hint={`@ ${discount}%`} />
              <Stat label="IRR" value={projectIrr != null ? fmtPct(projectIrr * 100, 1) : "-"} tone={projectIrr != null && projectIrr > n(discount) / 100 ? "ok" : "caution"} />
              <Stat label="Payback" value={fmt(payback, 1)} unit="yr" />
              <Stat label="LCOP" value={fmtMoney(levelized)} unit="/unit" hint="sell above this" />
            </div>
            <div className="px-5 pb-5">
              <CaveatNote>
                Simple payback and ROI ignore the time value of money: screening tools only. NPV and
                IRR are the metrics to trust for invest / don&apos;t-invest. CapEx is annualized via
                the capital recovery factor, not expensed in year one.
              </CaveatNote>
            </div>
          </Card>
        </div>
      </div>
    </Workspace>
  );
}
