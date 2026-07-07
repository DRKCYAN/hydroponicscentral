# Hydroponicity

Live at [hydroponicity.com](https://hydroponicity.com).

A desktop-first web app for hydroponics nutrient management, aimed at **side-hustle growers**.
It surfaces a deep calculation engine (recipe solving, EC/pH/dosing, reservoir management,
economics) through a clean, operational interface. Core principle: **don't simplify the engine,
simplify the surface.**

Built from two specs: `hydroponics-ui-build-spec.md` (structure/behavior) and
`hydroponics_calculations_by_page.md` (the ~235-calculation reference).

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (design tokens in `src/app/globals.css`)
- Type system: **Geist** (headings) · **Inter** (body) · **Geist Mono** (data/numerals)
- Pure-TypeScript calculation engine (no runtime math deps)

## Design system

- **Spacing** on a 4pt rhythm; **radius** on a 3-step scale (controls 8px · cards 12px · surfaces 16px); **elevation** in two subtle steps used consistently.
- **Color:** neutrals are ~90% of the UI, one muted teal accent, and green/amber/red are reserved strictly for status.
- **Loading states:** route-transition skeletons (`loading.tsx`), skeleton primitives for data areas, and button loading spinners on the Solve/Save actions.
- **Responsive:** persistent left rail on desktop, slide-in drawer on mobile; the marketing header collapses to a menu.
- **Metadata:** per-page titles + descriptions, canonical URLs on the free tools, OpenGraph/Twitter tags, an OG image (`public/og.svg`), and an SVG favicon (`src/app/icon.svg`).

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (type-check + lint)
npm run verify:calc  # engine smoke test (17 checks, incl. the multi-salt solve)
```

## Structure

```
src/
  app/
    (marketing)/                 # logged-out shell: top bar + footer
      page.tsx                   # homepage (hero → calculators → features → trust → pricing)
      pricing/ about/
      calculators/               # free tools, each at its own URL (SEO)
        ec-ppm/ label-decoder/ recipe-solver/
    app/                         # logged-in product shell: left rail + workspace
      dashboard/                 # Monitor — returning-user home
      systems/  systems/[id]/    # Configure — system list + detail (Recipe/Log/Schedule)
      water-sources/ fertilizers/ account/
      log/ harvest/              # Record — low-friction forms
      solver/ planning/          # Decide — Recipe Solver + Planning & Economics
      history/                   # Monitor — trends
  components/
    shell/    # MarketingHeader/Footer, LeftRail (workflow-verb nav), UtilityStrip
    ui/       # Card, Button, Field, StatusPill, UnitValue, CaveatNote, LockedPanel, ...
    solver/   # RecipeSolver (shared by the free calculator + the Pro app page)
    marketing/
  lib/
    calc/     # the engine (see below)
    data/     # fertilizer salt library, crop targets, recipe presets, demo systems
```

## Calculation engine (`src/lib/calc`)

Every function keeps its canonical `[Part-N.N]` ID from the reference in a comment.

| Module | Covers |
|---|---|
| `constants.ts` | molar masses, oxide factors, ion charges, EC scales, air/CO₂ constants |
| `units.ts` | SI conversions, ppm ↔ mmol ↔ meq, %↔ppm, molarity↔mass |
| `ecppm.ts` | EC ↔ ppm on any meter scale, EC temperature correction |
| `fertilizer.ts` | oxide→elemental label decoding, element contribution, chelated Fe |
| `water.ts` | hardness, alkalinity |
| `linalg.ts` + `solver.ts` | **the crown jewel** — multi-salt weighted NNLS solve, source-water correction, RO blend |
| `validation.ts` | cation–anion ion balance, EC estimate from composition |
| `stock.ts` | dilution, injector ratio (convention toggle changes the math), Stock A/B partition |
| `ph.ts` | pH↔[H⁺], acid/base dosing, top-off & accumulation, replenishment, refresh |
| `psychro.ts` | SVP, VPD, humidity ratio, dew point, enthalpy, VPD→RH, CO₂ |
| `biology.ts` | Michaelis–Menten, Q10, GDD, growth analysis, photosynthesis, efficiencies |
| `economics.ts` | cost structure, break-even, NPV/IRR/payback, LCOP, profit/m² |

The solver (`[II-3.3]`) is a constrained weighted least-squares problem solved with a
Lawson–Hanson NNLS active-set method. It guards the **100× trap**: the coefficient matrix must
hold elemental *fractions* in [0,1], never raw percentages.

## Design system

Per spec §9: neutrals are ~90% of the UI; a single **muted teal** accent carries brand/interactive
elements; **green/amber/red are reserved strictly for status** (in-range / caution / danger) and
never used decoratively. Numbers render monospaced with **units always adjacent**. Safety caveats
use one consistent amber treatment (`CaveatNote`) everywhere and are free on every tier.

## What's a skeleton vs. real

- **Real:** the full calculation engine, the two shells, all screens, the multi-salt solver
  (both free and Pro), the visible-but-locked gating pattern, and the provenance trace.
- **Stubbed:** persistence (demo data in `src/lib/data/mock.ts`), auth/billing, and the
  architecturally-inert Marketplace/About placeholders. No database yet — pages read demo state.
# hydroponicscentral
