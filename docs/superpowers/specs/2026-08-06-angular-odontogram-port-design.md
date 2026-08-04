# Angular Advanced Odontogram — Port Design Spec

**Date:** 2026-08-06
**Status:** Approved approach A (core reuse + Angular shell); spec pending user review
**Source module:** `/Users/Zoli/Sites/DentalQuoteCreator/src/modules/odontogram/engine`
(`react-advanced-odontogram` v2.2.0, payload version 2.19)

## 1. Goal

Port the React Advanced Odontogram module to Angular as a **standalone,
publishable Angular library** — the Angular sibling of
`react-advanced-odontogram` — living in its own repository at
`/Users/Zoli/Sites/Angular-Advanced-Odontogram`.

- **Full feature parity** with the React module is the 1.0.0 goal: odontogram
  editor, dual-state Status/Plan charts, periodontal chart, Settings, exports
  (JSON / FHIR R4 / SVG / PNG / JPG / PDF), plugins, intro tour, 12 UI
  languages incl. RTL Arabic.
- **Data compatibility:** payload version 2.19; JSON and FHIR exports from the
  React module import cleanly and vice versa.
- **Provable behavioral parity:** the React repo's golden fixtures (SVG
  fingerprint parity, FHIR golden, roundtrip golden) are copied verbatim and
  must pass byte-identically in the Angular build.

### Non-goals

- No idiomatic-Angular rewrite of the engine internals (rejected as approach B
  — months of regression risk for zero user-visible gain).
- No shared-core npm package with the React repo (decided: **copy/fork**; the
  two repos evolve independently; future core fixes are ported manually).
- No multi-instance support (the engine is a module singleton — one odontogram
  per page — exactly as in the React version).
- No React runtime anywhere in the package (rejected approach C, web-component
  wrapper).

## 2. Source architecture (what we measured)

Total ~17,400 source lines. The decisive fact: **the engine core is already
framework-free.**

| Layer | Files | Lines | React? | Port action |
|---|---|---|---|---|
| Engine core | `odontogram.ts` | 9,461 | none (85 direct DOM calls) | copy verbatim¹ |
| Pure logic | `registry/` (9), `fhir/` (7), `perioClassification.ts`, `perioGraphic.ts`, `perioExport.ts`, `perioPdf.ts`, `bridgeOverlay.ts`, `status_extras.ts`, `theme.ts`, `plugin.ts`, `tour.ts`, `utils/numbering.ts`, `perioIndexNames.ts`, `i18n/translations.ts` | ~4,500 | none | copy verbatim |
| React shell | `App.tsx` (1,039), `PerioChart.tsx` (2,360), `PerioSidebar.tsx` (451), `SettingsModal.tsx` (652), `DualStateConfirm.tsx` (125), `ExportOptionsModal.tsx` (228), `i18n/useI18n.ts`, `main.tsx` | ~4,900 | yes | rewrite as Angular |
| Styling | `index.css` (Tailwind 3 + `--odon-*` CSS vars) | 80 KB | n/a | copy; prebuild to shipped `styles.css` |
| Assets | `assets/teeth-svgs/`, `assets/icon-svgs/` | — | n/a | copy + codegen (§5) |
| Tests | `src/__tests__/` — 152 entries incl. golden `parity/` fixtures | — | mixed | core tests copied; `.tsx` tests re-written (§7) |

¹ Sole permitted edit: the `?raw` SVG import block at the top of
`odontogram.ts` (and the icon `?raw` imports currently in `App.tsx`) is
replaced by imports from generated TS asset modules (§5). Everything else in
core files is byte-identical to the React repo.

**How the shell and engine couple:** the shell renders a static DOM skeleton
with fixed ids (`#toothGrid`, `#cariesChecks`, `#modsChecks`,
`#statusExtraSelect`, `#chartModeToggle`, …); `initOdontogram()` (async) wires
controls, builds the tooth grid, subscribes i18n, and paints; `destroyOdontogram()`
tears everything down and resets module state so re-init is clean. State flows
out through the `onStateChange(cb)` pub-sub. This contract is what the Angular
shell must reproduce exactly.

## 3. Target workspace

Angular CLI workspace (latest stable Angular, v21 line), two projects:

```
Angular-Advanced-Odontogram/
├── projects/
│   ├── angular-advanced-odontogram/     # the library (ng-packagr)
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── core/                # verbatim-copied engine (§2)
│   │       │   ├── generated/           # SVG asset TS modules (codegen, §5)
│   │       │   ├── components/
│   │       │   │   ├── odontogram-shell/
│   │       │   │   ├── perio-chart/
│   │       │   │   ├── perio-sidebar/
│   │       │   │   ├── settings-modal/
│   │       │   │   ├── dual-state-confirm/
│   │       │   │   └── export-options-modal/
│   │       │   └── i18n/i18n.service.ts
│   │       └── public-api.ts
│   └── demo/                            # dev playground / demo app
├── scripts/generate-svg-assets.mjs      # .svg → generated/*.ts
├── docs/superpowers/specs/              # this spec
└── (styles pipeline: Tailwind 3 → dist styles.css)
```

- **Package name:** `angular-advanced-odontogram`. License MIT. Versioning
  starts at 0.1.0; **1.0.0 = full parity** with react-advanced-odontogram 2.2.0.
- **Test runner:** Vitest (Angular 21 default) — keeps the copied core test
  suite nearly source-compatible (jsdom, same assertion style).
- **Styling:** Tailwind 3 + `index.css` copied; the library ships a prebuilt
  `styles.css` consumers import once (same contract as the React package's
  `react-advanced-odontogram/style.css`).
- Peer dependency: `@angular/core`/`common` (v21+). Runtime dependency:
  `jspdf` (unchanged, PDF export).

## 4. Component architecture

### OdontogramShellComponent (port of `App.tsx`)

Standalone component, `ChangeDetectionStrategy.OnPush`, zoneless-compatible
(the engine runs outside Angular; components mirror engine state into signals
via `onStateChange`).

- **Template** reproduces the App.tsx JSX skeleton with identical ids/classes —
  the engine's `initOdontogram()` binds to it unchanged.
- **Lifecycle:** `ngAfterViewInit` → `initOdontogram()`; `ngOnDestroy` →
  `destroyOdontogram()` (+ unsubscribe `onStateChange`).
- **Inputs** (signal `input()`s) mirror the 21 React props 1:1: `language`,
  `numberingSystem`, `darkMode`, `themeConfig`, `plugins`, `readOnly`,
  `enableNotes`, `enableIcdas`, `pulpDetailLevel`, `secondaryCariesMode`,
  `rootCariesMode`, `radiographicDepthMode`, `cariesDepthEnabled`,
  `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`,
  `showStatusCard`, `showOrthoCard`.
- **Outputs** replace React callbacks: `languageChange`, `numberingChange`,
  `darkModeChange`.
- Each React `useEffect` prop-sync becomes an `effect()` invoking the same
  engine setter. Local `useState` mirrors (summary, confirmOpen, viewMode,
  perioRowVisibility, …) become signals updated inside the single
  `onStateChange` subscription.
- Controlled/standalone dual mode is preserved: every input optional; when
  omitted the component runs on internal state, when provided the host drives it.
- The shell root's `dir` stays reactive to language (`rtl` for `ar`), with
  `#toothGrid` and perio charts pinned `dir="ltr"` — same as React.

### PerioChartComponent (port of `PerioChart.tsx` — the largest rewrite)

Same `{open, close}` dialog contract plus `inline` housing; renders the perio
grid (arch bands × 6 sites, PD/GM/CAL/BOP + all graded index rows), the
graphical arch SVGs (via the already framework-free `perioGraphic.ts`
builders), keyboard auto-advance, diamond tiles, case-meta panel and
classification panel. All mutations keep going through the engine API
(`setPerioSite` etc.) — the component is view + event wiring only. Stays a
separately invocable **named export** of the library so a host can mount it
independently; `openPerioOverlay()`/`closePerioOverlay()` keep working.

### Remaining components

`PerioSidebarComponent`, `SettingsModalComponent` (tabs: general | panels |
toothDetails | caries | pulpa | periodontal | notes), `DualStateConfirmComponent`
(focus-trapped blocking confirm; DS-1 gate), `ExportOptionsModalComponent` —
each a direct port of its React counterpart, keeping DOM ids/classes and the
dialog contracts (focus trap, Esc/click-away, z-index layering) identical.

### I18nService (replaces `useI18n`)

Signal-based service: `lang` signal, `t()` lookup into the copied
`translations.ts`, wired to the engine's existing `onI18nChange` bus.
Components read `t` through the service; the engine's own localized repaints
continue to work untouched. 12 languages: hu, en, de, es, it, sk, pl, ru,
pt-br, zh, ar, fr.

### Public API (`public-api.ts`, mirror of `src/index.ts`)

- `OdontogramShellComponent` (default entry) + `PerioChartComponent`.
- Every imperative engine function currently re-exported by `App.tsx`
  (`initOdontogram`, `exportStatus`, `importStatus`, `exportFhir`, `getStatusChart`,
  `getPlanChart`, `setChartMode`, `onStateChange`, `setPerioSite`, … the full list)
  re-exported unchanged.
- All public types (`OdontogramThemeConfig`, `OdontogramPlugin`,
  `OdontogramSummary`, `FhirExportOptions`, enum/detail-level types, …).
- `startIntroTour` (tour port — the tour manipulates DOM directly, so it copies
  over; only its trigger button lives in the Angular shell).

## 5. Asset strategy (the one core edit)

Vite `?raw` imports are not supported by ng-packagr. Replacement:

- `scripts/generate-svg-assets.mjs` reads `assets/teeth-svgs/*.svg` and
  `assets/icon-svgs/*.svg` and emits `lib/generated/teeth-svgs.ts` /
  `icon-svgs.ts` — each SVG's markup as an exported string constant, plus the
  small `icon_no_selection.svg` as a data-URI constant (it is rendered via
  `<img src>`).
- The `?raw` import block in `odontogram.ts` (and icon imports in the shell)
  switch to these modules. Markup content is identical → SVG fingerprint
  parity unaffected.
- The script runs on demand (`npm run gen:assets`) and output is committed, so
  builds need no custom loader anywhere (library, demo, tests all agree).

## 6. Styling & theming

- `index.css` copied as the library's source stylesheet; Tailwind 3 + PostCSS
  build emits the shipped `styles.css` (consumers: one global import, e.g. in
  `angular.json` styles or `styles.css` `@import`).
- `--odon-*` CSS custom-property theme and `themeConfig` input
  (`applyThemeConfig`) unchanged.
- Dark mode: `dark` class contract preserved; `darkMode` input mirrors the
  React prop.

## 7. Testing & parity proof

- **Copied as-is (target: green without semantic edits):** all core tests that
  exercise `odontogram.ts`/registry/fhir/perio logic through jsdom + the DOM
  skeleton. Where a test mounts the React `<App/>` only as scaffolding, a small
  shared helper mounts the Angular shell instead.
- **Rewritten:** `.tsx` component tests (App.test.tsx, ds1-confirm-revert,
  perio chart interaction tests, …) using Angular TestBed/Testing Library
  equivalents, asserting the same behaviors.
- **Golden fixtures copied verbatim — the parity proof:**
  - SVG-fingerprint parity fixtures → the Angular render must fingerprint
    byte-identically;
  - FHIR golden bundle → `exportFhir` output byte-identical;
  - roundtrip golden → JSON export/import stable (version string aside).
- **Acceptance criteria for 1.0.0:** all copied fixtures pass; a JSON payload
  exported from React 2.2.0 imports into Angular and re-exports equal
  (modulo version metadata); and vice versa.

## 8. Phasing

1. **Scaffold + core.** Workspace, library + demo projects, Tailwind/Vitest
   wiring, SVG codegen, core copied, pure-logic test suite green.
2. **Odontogram shell.** OdontogramShellComponent template + lifecycle +
   inputs/outputs; engine boots; SVG-fingerprint parity fixtures green.
   Demo app shows the working odontogram.
3. **Modals & settings.** SettingsModal, DualStateConfirm, ExportOptionsModal;
   DS-1 confirm flow tests green.
4. **Perio & exports.** PerioChart + PerioSidebar; JSON/FHIR/SVG/PNG/JPG/PDF
   export-import; FHIR + roundtrip goldens green; `fr`/RTL smoke checks.
5. **Release.** Demo polish, README (EN + HU first; remaining 10 languages in a
   follow-up round), API docs via typedoc over the core + public API (same
   tool as the React repo), npm packaging (`ng-packagr` dist), CI,
   0.x → 1.0.0 when §7 acceptance holds.

## 9. Risks & mitigations

- **DOM-id contract drift** between Angular template and engine expectations →
  caught immediately by the copied jsdom tests + parity fixtures (they fail
  loudly if an id/class is missing).
- **Angular sanitization/interpolation of SVG markup** — the engine injects
  SVG imperatively (outside Angular templates), so `DomSanitizer` is not in
  the path; icon injection in the shell uses the same `data-icon-src` +
  `loadInlineIcon` mechanism as React.
- **Zoneless/OnPush staleness** — all engine→UI updates funnel through one
  `onStateChange` → signal write; no reliance on zone patching.
- **ng-packagr side-effect CSS** — CSS ships as a plain dist asset (not an
  Angular style), avoiding tree-shaking/`sideEffects` pitfalls; documented in
  README install steps.
- **PerioChart size (2,360 lines React)** — largest single rewrite; mitigated
  by porting row-group by row-group against its copied interaction tests.

## 10. Later / explicitly deferred

- Remaining 10 README translations (after 1.0.0 content settles).
- Any shared-core extraction with the React repo (revisit only if dual
  maintenance becomes painful).
- FHIR *import* of perio data — deferred in the React module too; parity means
  deferring it here as well.
