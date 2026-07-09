/**
 * Calculation-engine smoke test. Run with:  npm run verify:calc  (uses tsx)
 */
import { solveRecipe, forwardPpm } from "../src/lib/calc/solver";
import { ionBalance, ppmMapFromElements, ecFromCations } from "../src/lib/calc/validation";
import { ecToPpm, ecTempCorrect } from "../src/lib/calc/ecppm";
import { p2o5ToP, k2oToK, elementContributionPpm } from "../src/lib/calc/fertilizer";
import { npv, irr } from "../src/lib/calc/economics";
import { vpd, vpdToRh, leafVpd } from "../src/lib/calc/psychro";
import { wToBtuh } from "../src/lib/calc/units";
import {
  dehumGrowRoomLDay,
  dryingWaterLossL,
  dehumidifierSize,
  humidifierLoadLDay,
  acSizing,
  ventilationBaseCfm,
  ventilationRequiredCfm,
} from "../src/lib/calc/hvac";
import { ppfFromWattage, averagePpfd, wattageForPpfd } from "../src/lib/calc/lighting";
import { dli } from "../src/lib/calc/psychro";
import { pumpGphForTurnover, requiredPumpGph } from "../src/lib/calc/irrigation";
import { FERTILIZERS, MACRO_ELEMENTS } from "../src/lib/data/fertilizers";

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ ${name}  ${detail}`);
  }
}
const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol;

console.log("\nShared Foundations");
check("EC->ppm 1.5 mS/cm on 500 scale = 750", ecToPpm(1.5, "ppm500") === 750);
check("EC temp correct 2.0 @ 30°C -> ~1.82", near(ecTempCorrect(2.0, 30), 2.0 / 1.1, 1e-9));

console.log("\nFertilizer label decoding [II-2.x]");
check("P2O5 52% -> P ~22.7%", near(p2o5ToP(52), 22.6928, 1e-3));
check("K2O 34% -> K ~28.2%", near(k2oToK(34), 28.2234, 1e-3));
check("1 g 15.5-0-0 in 1 L -> 155 ppm N", elementContributionPpm(1, 15.5, 1) === 155);

console.log("\nRecipe Solver [II-3.3] — lettuce target, Well A source");
const elements = [...MACRO_ELEMENTS];
const targets = { N: 150, P: 45, K: 200, Ca: 160, Mg: 45, S: 60 };
const source = { N: 2, P: 0, K: 3, Ca: 62, Mg: 18, S: 22, Cl: 30, Na: 24 };
const res = solveRecipe({
  elements,
  targetsPpm: targets,
  sourcePpm: source,
  fertilizers: FERTILIZERS,
  weightScheme: "relative",
  volumeL: 120,
});
console.log(
  "  grams/L:",
  Object.fromEntries(
    Object.entries(res.gramsPerLiter)
      .filter(([, g]) => g > 1e-4)
      .map(([k, g]) => [k, +g.toFixed(4)]),
  ),
);
console.log(
  "  achieved ppm:",
  Object.fromEntries(elements.map((e) => [e, +res.achievedPpm[e].toFixed(1)])),
);
check("no solver warnings", res.warnings.length === 0, res.warnings.join(" | "));
check("all grams non-negative (x >= 0)", Object.values(res.gramsPerLiter).every((g) => g >= 0));
// N is the highest-weighted macro after Ca correction; expect close hit
check("N within 12 ppm of 150", Math.abs(res.achievedPpm.N - 150) < 12, `N=${res.achievedPpm.N}`);
check("K within 15 ppm of 200", Math.abs(res.achievedPpm.K - 200) < 15, `K=${res.achievedPpm.K}`);

console.log("\n100× trap guard");
const trap = solveRecipe({
  elements: ["N"],
  targetsPpm: { N: 150 },
  fertilizers: [{ id: "bad", name: "Bad (percent leaked)", fractions: { N: 15.5 } }],
});
check("percentage-in-A produces a warning", trap.warnings.some((w) => w.includes("÷100")));

console.log("\nIon balance [II-4.4] + EC estimate [II-4.5]");
const bal = ionBalance({ ppm: ppmMapFromElements(res.achievedPpm) });
console.log(
  `  cations=${bal.sumCationsMeq.toFixed(2)} anions=${bal.sumAnionsMeq.toFixed(2)} ` +
    `signed=${bal.imbalanceSignedPct.toFixed(1)}% dir=${bal.direction}`,
);
check("ion balance magnitude computed", isFinite(bal.imbalanceMagnitudePct));
check("EC estimate > 0", ecFromCations(bal.sumCationsMeq) > 0);

console.log("\nForward round-trip");
const fwd = forwardPpm(elements, res.gramsPerLiter, FERTILIZERS, source);
check("forwardPpm matches achievedPpm", elements.every((e) => near(fwd[e], res.achievedPpm[e], 1e-6)));

console.log("\nEconomics [V-7.3/7.4] + psychro [IV-1.3/7.2]");
check("NPV(-1000, [400,400,400,400], 0.1) > 0", npv(1000, [400, 400, 400, 400], 0.1) > 0);
const r = irr(1000, [400, 400, 400, 400]);
check("IRR ~21.9%", r != null && Math.abs(r - 0.2186) < 0.01, `irr=${r}`);
check("VPD(24°C, 60%) ~1.19 kPa", near(vpd(24, 60), 1.1897, 1e-2));
check("vpdToRh round-trips VPD", near(vpd(24, vpdToRh(1.19, 24)), 1.19, 1e-2));

console.log("\nHVAC sizing (hvac.ts)");
check("W->BTU/hr 1000 W ~3412", near(wToBtuh(1000), 3412, 1), `got=${wToBtuh(1000)}`);
const ac = acSizing(1000, 1);
check("AC 1000 W -> ~3412 BTU/hr, ~0.284 ton", near(ac.btuh, 3412, 1) && near(ac.tons, 0.2843, 1e-3));
check("dehum grow 10 L/day in @0.9 = 9", dehumGrowRoomLDay(10, 0.9) === 9);
check(
  "drying 10 kg wet 80%->10% sheds ~7.78 L",
  near(dryingWaterLossL(10, 0.8, 0.1), 7.7778, 1e-3),
  `got=${dryingWaterLossL(10, 0.8, 0.1)}`,
);
check("dehum size 9 L/day @SF1 ~19.02 pints", near(dehumidifierSize(9, 1).pintsDay, 19.02, 0.01));
check("humidifier load 40->65% RH is positive", humidifierLoadLDay(30, 1, 25, 40, 65) > 0);
check("humidifier load target below current = 0", humidifierLoadLDay(30, 1, 25, 65, 40) === 0);
check("ventilation base 240 ft³ / 3 min = 80 CFM", ventilationBaseCfm(240, 3) === 80);
check("ventilation +25% filter = 100 CFM", ventilationRequiredCfm(80, { filter: 1.25 }) === 100);

console.log("\nLighting (lighting.ts) + DLI [I-2.1]");
check("PPF 600 W x 2.7 µmol/J = 1620", ppfFromWattage(600, 2.7) === 1620);
check("avg PPFD 1620 over 1.2 m² @0.9 = 1215", near(averagePpfd(1620, 1.2, 0.9), 1215, 1e-9));
check(
  "wattageForPpfd round-trips averagePpfd",
  near(averagePpfd(ppfFromWattage(wattageForPpfd(800, 1.2, 2.7), 2.7), 1.2), 800, 1e-9),
);
check("DLI 600 PPFD x 18 h ~38.88", near(dli(600, 18), 38.88, 1e-9));

console.log("\nIrrigation (irrigation.ts) + leaf VPD");
check("turnover 50 gal x 1/h = 50 GPH", pumpGphForTurnover(50, 1) === 50);
check("required pump max(50,30) x1.2 = 60", requiredPumpGph(50, 30, 1.2) === 60);
check("leaf VPD (cooler leaf) < air VPD", leafVpd(25, 23, 60) < vpd(25, 60));

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
