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
| React shell | `App.tsx` (1,039), `PerioChart.tsx` (2,360), `PerioSidebar.tsx` (451), `SettingsModal.tsx` (652), `DualStateConfirm.tsx` (125), `ExportOptionsModal.tsx` (228), `main.tsx` | ~4,900 | yes | rewrite as Angular |
| Styling | `index.css` (Tailwind 3 + `--odon-*` CSS vars) | 80 KB | n/a | copy; prebuild to shipped `styles.css` |
| Assets | `assets/teeth-svgs/`, `assets/icon-svgs/` | — | n/a | copy + codegen (§5) |
| Tests | `src/__tests__/` — 152 entries incl. golden `parity/` fixtures | — | mixed | core tests copied; `.tsx` tests re-written (§7) |

¹ Five sanctioned deviations (re-applied fresh on every core re-sync,
including the 1.1.0/v2.4.0 resync — Phase 6 Task 1, 2026-08-11): (1) the
`?raw` SVG import block at the top of `odontogram.ts` (and the icon `?raw`
imports currently in `App.tsx`) is replaced by imports from generated TS
asset modules (§5); (2) the copied test-infra `core/__tests__/parity/capture.ts`
has its `src/assets/…`/`src/__tests__/…` path anchors re-pointed at
`assets/…`/`__tests__/…` (the frozen corpus assumes the React repo's
`src/`-rooted layout; this package's `core/` is already the root); (3)
`i18n/useI18n.ts` is copied WITH its framework-free i18n bus (`t`,
`getI18nLanguage`, `setI18nLanguage`, `onI18nChange`) byte-identical, but with
the React-only `useI18n()` hook and its `react` import removed — the hook's
role moves to the Phase-2 `I18nService`; (4) **branding** (owner decision,
2026-08-11): every language's `"app.title"` value in `i18n/translations.ts` is
overwritten from `"React Advanced Odontogram"` to `"Angular Advanced
Odontogram"` (12 languages, `app.title` only — no other string touched); (5)
**branding, PDF footer** (controller-ruled extension of the same owner
decision, 2026-08-18): in `odontogram.ts`'s `exportPdf()` footer assembly, the
hardcoded `app: "React Advanced Odontogram"` string passed to
`t("pdf.generatedWith", …)` becomes `app: "Angular Advanced Odontogram"`, and
the adjacent `repoUrl: "https://github.com/ZoliQua/React-Odontogram-Modul"`
becomes `repoUrl: "https://github.com/ZoliQua/Angular-Advanced-Odontogram"`
— two literal-string edits only (~line 8217-8218); the file's line-1
`// Part of React Advanced Odontogram - …` header comment is untouched, and
stays untouched on every future resync (it documents provenance, not branding
shown to end users). Everything else in core files is byte-identical to the
React repo.

**How the shell and engine couple:** the shell renders a static DOM skeleton
with fixed ids (`#toothGrid`, `#cariesChecks`, `#modsChecks`,
`#statusExtraSelect`, `#chartModeToggle`, …); `initOdontogram()` (async) wires
controls, builds the tooth grid, subscribes i18n, and paints; `destroyOdontogram()`
tears everything down and resets module state so re-init is clean. State flows
out through the `onStateChange(cb)` pub-sub. This contract is what the Angular
shell must reproduce exactly.

### Known upstream drift

The Phase-1 snapshot of `$ENGINE`
(`/Users/Zoli/Sites/DentalQuoteCreator/src/modules/odontogram/engine`) is a
point-in-time copy; the source repo keeps evolving after that copy was taken,
and the frozen `__tests__/` corpus this port transcribes from does not track
those later edits. Two drift events were found and verified (3-leg: frozen
corpus vs. live `$ENGINE` source vs. live `$ENGINE` test) while porting
Phase 4's periodontal specs — in both cases the port follows the **live**
`$ENGINE` source/tests, not the frozen corpus text, with the deviation
documented in the affected spec's own header comment:

1. **`ui1-perio-sidebar.test.tsx` (Task 5, shell view-gate).** The frozen
   corpus copy asserts the perio-view housing fully unmounts the odontogram
   controls (`#statusCard`/`#toothSelect` null). The live `App.tsx`
   (743-756) keeps them mounted with `display:none` instead — unmounting
   would break `wireControls()`'s one-time listeners on toggle-back. The live
   `$ENGINE/src/__tests__/ui1-perio-sidebar.test.tsx` asserts the corrected,
   keep-mounted shape (verified 10/10 green against the read-only $ENGINE
   checkout). Ported using the corrected assertions.
2. **`ui3a-central-band.test.ts` (Task 6, PerioChart band labels).** The
   frozen corpus copy asserts a single `.perio-fullgrid-band-label` element
   containing both buccal and lingual/palatal text. The live
   `$ENGINE/src/PerioChart.tsx` (1291-1353) builds two separate label
   elements instead (one above the band, one below), matching this repo's
   `perio-grid-dom.ts` exactly; the live test asserts the two-label shape.
   Ported using the corrected assertions.

The core re-sync decision has been made (owner decision 2026-08-07): 1.0.0
pinned v2.2.0. **Resync delivered (owner decision 2026-08-11, Phase 6): 1.1.0
resyncs to v2.4.0** (`$ENGINE` HEAD `f9b45fc`, superseding the originally
scheduled v2.2.1 target — the source repo moved further before this resync
landed). Payload is 2.20; FHIR/roundtrip/SVG-fingerprint goldens were
regenerated upstream and re-copied verbatim (Phase 6 Task 1, 2026-08-11) and
re-verified green through the full Phase 6 burn-down (Task 5) — see
`docs/superpowers/specs/1.1.0-acceptance.md` for the evidence and §10 for
what remains deferred beyond this release.

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
toothDetails | caries | pulpa | notes | periodontal), `ExportOptionsModalComponent`
— each a direct port of its React counterpart, keeping DOM ids/classes and the
dialog contracts (focus trap, Esc/click-away, z-index layering) identical.
(`DualStateConfirmComponent`, originally listed here, shipped in Phase 2
instead — see §8.)

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
- **Acceptance evidence:** `docs/superpowers/specs/1.0.0-acceptance.md` maps
  every criterion above to its concrete run evidence (test names + run
  counts, `npm pack --dry-run` file list, consumer-resolution proof), cut
  2026-08-08.

## 8. Phasing

1. **Scaffold + core.** Workspace, library + demo projects, Tailwind/Vitest
   wiring, SVG codegen, core copied, pure-logic test suite green.
2. **Odontogram shell — DELIVERED (2026-08-06).** OdontogramShellComponent
   template + lifecycle + inputs/outputs; engine boots; SVG-fingerprint
   parity fixtures green. Demo app shows the working odontogram. Scope note:
   `DualStateConfirmComponent` was pulled forward from Phase 3 into this
   phase — the shell's topbar/panel wiring (the DS-1 gate on plan→status
   edits) depends on it directly, so it shipped alongside the shell rather
   than waiting for the Phase 3 modals batch. `I18nService` and the 35
   shell-scoped ported specs also landed in this phase (see CHANGELOG).
3. **Modals & settings — DELIVERED (2026-08-06).** SettingsModal (7 tabs,
   `SETTINGS_TABS`/`SettingsState`, APG tablist), ExportOptionsModal
   (DI-injected `EXPORT_PDF_FN`; DualStateConfirm moved to Phase 2 — see
   above); shared dialog-focus helper extracted for both modals; `I18nService`
   listener-dispose fix; 4 settings-dependent tests ported to Angular specs
   (`sp13-settings-tab`, `settings-modal-a11y`, `ui2-perio-settings`,
   `sp15-settings`).
4. **Perio & exports — DELIVERED (2026-08-07).** PerioSidebarComponent
   (summary/case-meta/classification); framework-free `perio-grid-dom.ts`
   builders; PerioChartComponent (grid, keyboard, mm/overlay switching)
   mounted in all three app housings (toggle-mode inline panel, popup
   overlay, shell pairing with PerioSidebarComponent) via the real
   `openPerioOverlay()`/`closePerioOverlay()` engine seam; 5 framework-free
   perio tests re-enabled in `test:corpus`; 26 tests ported from the source
   corpus to Angular `TestBed` specs (2 sidebar + 3 chart-core + 6 App-level
   + 15 PerioChart-direct batch); 4 `ExportOptionsModalComponent` coverage
   additions closing gaps found while adjudicating
   `ui3b-export-options-modal.test.ts` (see CHANGELOG). JSON/FHIR/SVG/PNG/
   JPG/PDF export-import and `fr`/RTL smoke checks were already covered by
   prior phases' shell/export work; no additional scope needed here.
5. **Release — DELIVERED (2026-08-08).** npm packaging (`ng-packagr` dist
   README/LICENSE, `build:demo` script, trimmed root `package.json`); typedoc
   API docs pipeline (`npm run docs` → `docs/api/`); full root README (EN)
   + Hungarian translation (remaining 10 languages deferred to a follow-up
   round, per §10); 1.0.0 acceptance evidence sheet
   (`docs/superpowers/specs/1.0.0-acceptance.md`) with every §7 criterion
   backed by an actual run; version cut 0.1.0 → 1.0.0 (root + library
   `package.json`, `CHANGELOG.md`). CI was not part of this phase's scope.

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

- **1.1.0 — DELIVERED (Phase 6, 2026-08-11):** resync to
  react-advanced-odontogram v2.4.0 (payload 2.20 — patientDob, individual
  notes, PDF-dialog DOB/split options, Plan-mode/perio-chart availability
  gating, filling-material/fissure-sealing settings, PDF-report settings +
  multilingual PDF fonts, collapsible panel cards, and the bridge lower-arch
  saddle re-anchoring); closed §2's deferred core re-sync decision (owner
  decision 2026-08-07: 1.0.0 pinned v2.2.0; owner decision 2026-08-11:
  target moved to v2.4.0 since the source repo advanced past v2.2.1 before
  this resync landed). See `docs/superpowers/specs/1.1.0-acceptance.md`.
- A further resync beyond v2.4.0 will be due in a future release — `$ENGINE`
  kept advancing past the `f9b45fc` pin during Phase 6's execution window
  (see §2's known-drift note).
- Persistence demo wiring: the new opt-in `enablePersistence` API is not
  wired into the `demo` app shell (upstream doesn't wire it into its shell
  either — host-opt-in by design); a demo toggle could come later if wanted.
- Remaining 10 README translations (after 1.0.0 content settles).
- Any shared-core extraction with the React repo (revisit only if dual
  maintenance becomes painful).
- FHIR *import* of perio data — deferred in the React module too; parity means
  deferring it here as well.
