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

**Deviation (4), extended (Phase 7 Task 4, 2026-08-12 — credits i18n).** The
1.2.0 resync ported upstream's Credits/About popup (`CreditsModal.tsx` →
`CreditsModalComponent`), whose intro text and new keys live in the SAME core
file as deviation (4), `i18n/translations.ts`, so the branding-string
deviation is extended rather than given a new number: (a) `credits.intro`'s
existing "React Advanced Odontogram" app-name mention is swapped to "Angular
Advanced Odontogram" in all 12 languages, the same proper-noun substitution
already applied to `app.title`; (b) two NEW keys,
`credits.originalProjectTitle` and `credits.originalProjectDesc`, are added
(not upstream keys — upstream has no equivalent, since upstream IS the
original project and never credits itself) and translated in all 12
languages, register-matched against the neighbouring `credits.creatorTitle`/
`credits.contributorsTitle`/`credits.contrib.*` keys.

**CreditsModal identity adaptations (non-core, same task) — the owner-veto
note.** `CreditsModalComponent` itself is a transcription-source component (like
every other `.tsx`-sourced shell component — see the "React shell" row of
this section's own port-action table above), not a verbatim core copy, so
its own identity adaptations
(`REPO_URL` — the "Star on GitHub" link — repointed from the original repo to
this package's repo; the `LIBRARIES` list's `React`/`Vite` entries replaced
with `Angular`/`Angular CLI`) are ordinary shell-port adaptations, not
"core deviations" in the strict §2 sense. They are recorded here because a
review round vetoed the FIRST version of this adaptation: identity-swapping
`REPO_URL`/`LIBRARIES`/`credits.intro` to this package's own branding, on its
own, left the rendered modal with NO visible attribution to the original
React project at all. The ruling (binding on any future identity adaptation
of this modal, or of the README Credits section it mirrors): adapting a
component's own app-identity touchpoints must never remove the original
project's own attribution from what end users actually see. The fix that
satisfied the ruling — kept, and not to be reverted — added a new "Original
Project" section to the modal (mirroring the Creator section's own heading +
linked-entry + description shape), linking
`https://github.com/ZoliQua/React-Odontogram-Modul`, immediately after the
Creator section. See the Phase 7 Task 4 report §2 for the full adapted-string
table and rationale.

**Deviation (4), extended again (Phase 8 Task 1, 2026-08-19 owner directive,
post-1.2.0 test approval).** CreditsModal renders no Contributors section
(upstream lists the React project's contributors — a heading plus
per-contributor GitHub-handle links and descriptions); Creator, Original
Project, Built with (Libraries) and the "Star on GitHub" CTA are unaffected.
The `credits.contributorsTitle`/`credits.contrib.*` i18n keys are retained in
core `i18n/translations.ts` (core-verbatim discipline — this is a
component-only rendering change, not a core edit) even though the Angular
`CreditsModalComponent` no longer references them.

**Deviation (4), extended again (Phase 9 Task 1, 2026-08-19 owner
directive: credits.welcome reworded ×12 (contributors clause removed)).**
The `credits.welcome` string in all 12 language tables of
`i18n/translations.ts` closed with a clause promising the contributor
("…you will be credited here" / its per-language equivalent) that stopped
being true once the Contributors section was removed from the modal (see
the Phase 8 Task 1 note immediately above). Reworded in all 12 languages to
drop the now-false promise while keeping the "open a pull request on
GitHub" invitation; EN: "Contributions are welcome — open a pull request on
GitHub." No other `credits.*` key was touched.

**Deviations (1) and (4), relocated (Phase 11 Task 1, 2026-08-17, v2.6.0
resync to engine `215c43a`).** Upstream's own 2.5.0/2.6.0 work split the
single `i18n/translations.ts` aggregator into per-language modules under
`i18n/locales/<lang>.ts` (12 files, English static/bundled, the other 11
lazily `import()`ed via the new framework-free `i18n/loader.ts`);
`translations.ts` itself is now a test-only aggregator, re-copied verbatim
and guarded by a test that fails if any non-test module imports it. Deviation
(4) (branding: `"app.title"`; the Phase 7/9 credits adaptations:
`credits.intro`, `credits.originalProjectTitle`/`Desc`, `credits.welcome`)
now applies **in each of the 12 `locales/*.ts` files** instead of the one
retired aggregator — same strings, same 12 languages, new file boundary; the
Angular shell (`I18nService`/`ODONTOGRAM_I18N_LOADER`) must preload all 12
languages before tests run, same as production lazy-loads them on demand.
Deviation (1) (the `?raw` SVG-import swap) now applies on a SECOND path too:
upstream split the tooth-anatomy artwork into `anatomy/profiles.ts` (dispatch)
and a lazy `anatomy/measured.ts` (the nine measured templates, `import()`ed
only when the `measured` profile is selected) — the generated-asset swap
covers both `odontogram.ts`'s classic templates and this new lazy module,
and the codegen pipeline (`scripts/generate-svg-assets.mjs`) preserves the
laziness rather than folding the measured SVGs into the main chunk. See the
Phase 11 Task 1/Task 2 reports for the file-by-file verification.

**Public API — deliberate superset of upstream (pre-existing, formally
recorded Phase 11 Task 5, ledger ruling #2).** `public-api.ts`'s
`export * from "./lib/core/odontogram"` has, since the first core copy,
re-exported every symbol `odontogram.ts` itself exports — which is a
strictly WIDER surface than upstream's own curated `App.tsx`/`index.ts`
re-export list. Task 5's v2.6.0 public-API sweep confirmed and named a
concrete instance: `getCaseConditions()`/`setCaseCondition()` (new in
2.6.0) reach this package's public entry point automatically through that
wildcard, even though upstream's own `App.tsx` does not re-export them
(verified by grepping the pinned `215c43a:src/App.tsx`/`src/index.ts`
directly — zero hits for either name). This is accepted as pre-existing
precedent, not a bug introduced by this resync: narrowing the surface now
risks breaking consumers who may already depend on it since 1.0.0. Recorded
here for visibility; revisit deliberately (curate `public-api.ts` down to
upstream's own list, with a major-version note) in a future phase if
desired — see §10.

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
what remains deferred beyond this release. **Resynced again (Phase 7,
2026-08-12): 1.2.0 resyncs to `$ENGINE` main @ `934a911`** (post-v2.4.0;
payload version unchanged at 2.20) — see §8 item 6 and §10 for the delivered
scope and the current drift note. **Resynced again (Phase 11, 2026-08-17):
2.6.0 resyncs to `$ENGINE` main @ `215c43a`** (108 commits past `934a911`;
payload 2.22 — the ICD-10/BNO-10/ICD-10-CM/SNOMED diagnosis-coding layer,
lazy i18n + lazy measured anatomy, `getSelectedTeeth()`, and the upstream
repository rename to `React-Advanced-Odontogram`) — see §8 item 7 and §10 for
the delivered scope.

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
6. **Composable UI + anatomy resync — DELIVERED (Phase 7, 2026-08-12).**
   Resync to `react-advanced-odontogram` main @ `934a911` (post-v2.4.0;
   1.1.0's v2.4.0 resync superseded — see §2/§10). Core + full test corpus
   re-copied, all five sanctioned deviations re-applied (Task 1), plus 13
   new `measured/` anatomy SVGs folded into `gen:assets` and the header-logo
   source swapped to the owner-directed `docs/angular-module-logo.png`
   (Task 1). `OdontogramUiService` (the `OdontogramProvider` port) +
   `engineState()` + the four presentational surfaces
   (`OdontogramTopbarComponent`, `OdontogramChartSurfaceComponent`,
   `ToothInfoSurfaceComponent`, `ToothControlsSurfaceComponent`) shipped as
   PUBLIC exports (Task 2); the seven declarative control cards
   (`StatusesCardComponent`, `ToothDetailsCardComponent`, `CariesCardComponent`,
   `FillingsCardComponent`, `RootPeriodontiumCardComponent`,
   `OrthodonticsCardComponent`, `SurfaceCrossComponent`) ported, replacing the
   removed imperative per-card `wireControls()` blocks with declarative
   template bindings (Task 3). `CreditsModalComponent` (the "About and
   credits" popup) ported, including the review-round-1 "Original Project"
   section fix (see §2's owner-veto note); the selectable tooth-anatomy
   setting (`classic`/`measured`) wired into `SettingsModalComponent`; the
   extended guided tour and perio-graphic deltas verified as needing no
   shell-side change (Task 4). Test hardening: a real, previously-silent
   `[aaoForceValue]`/`[aaoForceChecked]` directive bug fixed
   (`effect()` → `afterRenderEffect()`, so pick-then-cancel restores land
   after `@for`-generated `<option>` children commit); the full public-API
   sweep exporting every Task 2-4 symbol; 12 phase-7 `vitest.config.ts`
   exclusion annotations closing out the resync's own test-inventory audit
   (Task 5). README structure port (table of contents, Credits section with
   creator/original-project/contributors split, the Composable-surfaces
   usage section, the anatomy-profile highlight), a full claim-by-claim
   accuracy review of both language READMEs, the three community health
   files (`SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`), and this
   spec update (Task 6). Released as 1.2.0 (version cut is Task 7's own
   scope, not this task's).
7. **2.6.0 upstream resync — DELIVERED (Phase 11, 2026-08-17).** Resync to
   `react-advanced-odontogram` v2.6.0 (`$ENGINE` @ `215c43a`, payload 2.22,
   108 commits past the `934a911` pin) plus the upstream repository rename
   (`React-Odontogram-Modul` → `React-Advanced-Odontogram`) adopted
   everywhere outside core-verbatim historical text (Task 6). Core + full
   test corpus re-copied (Task 1: new `dx/*` diagnosis layer, `state/*` split
   of `odontogram.ts`, `anatomy/{profiles,measured}.ts`, `i18n/locales/*.ts`,
   the three inherited bug fixes — PDF invented identity, perio lower-arch
   `mirror XOR rot180`, one-pass control-label gathering). i18n and measured
   anatomy made lazy end-to-end, cutting the demo's main bundle 3.12 MB →
   1.23 MB and the initial total 3.21 MB → 1.32 MB, with `angular.json`
   budgets lowered accordingly (Task 2). The diagnosis-coding UI ported —
   `DiagnosesCardComponent`/`aao-diagnoses-card` and
   `CaseDiagnosesModalComponent`/`aao-case-diagnoses-modal`, both new public
   exports (Task 3). Shell/tour/perio deltas plus two more bug fixes found
   while porting — a stale perio-chart anatomy-switch effect and pre-fix PDF
   test fixtures (Task 4). The full v2.6.0 test-inventory burn-down
   (`test:ng` 900/900 ×2 identical; `test:corpus` 1428/1429 unchanged) and
   public-API sweep — `getSelectedTeeth`, the dx/case-condition functions,
   and the two new components (Task 5). This rename sweep + 13-document
   refresh (Task 6). See §2's new deviation-relocation and superset-API
   notes above and the Phase 11 task reports
   (`.superpowers/sdd/2026-08-17-phase11-resync-260/`) for evidence. Version
   cut to 2.6.0 (root + library `package.json`, `CHANGELOG.md`) is Task 7's
   own scope, not this task's.

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
- **1.2.0 — DELIVERED (Phase 7, 2026-08-12):** resync to
  `react-advanced-odontogram` main @ engine commit `934a911` (post-v2.4.0 —
  fillings controlled props, Composable UI's `OdontogramProvider`/surfaces/
  control-card exports, anatomy profiles (`classic`/`measured`), the extended
  guided tour, the Credits/About popup + GitHub toolbar link, and the README
  restructure + community health files upstream itself added between the
  `f9b45fc` and `934a911` pins). Closes the "further resync beyond v2.4.0"
  note this bullet previously carried. See §8 item 6 for the full delivered
  scope and the Phase 7 task reports
  (`.superpowers/sdd/2026-08-12-phase7-composable-resync/`) for evidence.
- **2.6.0 — DELIVERED (Phase 11, 2026-08-17):** resync to
  `react-advanced-odontogram` v2.6.0 (`$ENGINE` @ engine commit `215c43a`,
  payload 2.22, 108 commits past `934a911` — the ICD-10/BNO-10/ICD-10-CM
  diagnosis-coding layer flagged by the drift note below, an opt-in SNOMED
  CT overlay, per-tooth `dxOverrides` + whole-mouth `caseConditions`, FHIR
  `Condition` export **and import**, the published CodeSystem + ValueSets,
  lazy-loaded i18n + lazy-loaded measured anatomy, `getSelectedTeeth()`, and
  the upstream repository rename to `React-Advanced-Odontogram`). Closes the
  drift note below. See §8 item 7 for the full delivered scope and the
  Phase 11 task reports (`.superpowers/sdd/2026-08-17-phase11-resync-260/`)
  for evidence.
- **Drift note (superseding §2's Phase-6-era note; CLOSED by the 2.6.0
  resync above):** `$ENGINE` kept moving after the `934a911` pin — the
  commit this note originally flagged (`3bfc98c`, ICD-10 diagnosis coding)
  landed in full as part of the 215c43a pin the 2.6.0 resync copied from.
  `$ENGINE` will keep advancing past `215c43a` too; a further resync beyond
  this pin will be due in a future release.
- Persistence demo wiring: the new opt-in `enablePersistence` API is not
  wired into the `demo` app shell (upstream doesn't wire it into its shell
  either — host-opt-in by design); a demo toggle could come later if wanted.
- Any shared-core extraction with the React repo (revisit only if dual
  maintenance becomes painful).
- **Public API superset (see §2's Phase 11 Task 5 note):** `public-api.ts`'s
  wildcard re-export of `core/odontogram` exposes symbols (e.g.
  `getCaseConditions`/`setCaseCondition`) that upstream's own curated
  `App.tsx`/`index.ts` does not re-export. Accepted as pre-existing
  precedent for this release; curating `public-api.ts` down to an explicit,
  upstream-matching allow-list is a deliberate future revisit, not a defect
  to silently fix mid-resync.
