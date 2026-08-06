# Angular Odontogram Port — Phase 4: Periodontal Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port `PerioChart.tsx` (2,370 lines) and `PerioSidebar.tsx` (452 lines) to Angular, wire all three shell mount points (inline column, sidebar branch, popup), and re-enable the 31 perio-dependent tests — completing spec §8 Phase 4.

**Architecture:** The decisive structural fact (verified): PerioChart's grid is built by MODULE-LEVEL plain-DOM functions (`buildArch`, per-row cell builders, `applyArchColumns`, overlay/curve painters — TSX lines 141-1517) that call the engine API directly; React only supplies housing, refs, and two state mirrors. The port therefore extracts those builders near-verbatim into a framework-free `perio-grid-dom.ts` module, and `PerioChartComponent` becomes effect-wiring around them (same shape as the React component body 1518-2369). Everything below (perioGraphic.ts, perioIndexNames.ts, nextPerioCell in core) is already framework-free and ships since Phase 1. `PerioSidebarComponent` is a small self-contained port. Five excluded tests are actually framework-free and re-enable in the CORPUS with zero new code.

**Tech Stack:** Angular 21 standalone/OnPush/inline-template components; dual-runner tests; Phase-1 core untouched.

**Source repo (read-only reference):** `/Users/Zoli/Sites/DentalQuoteCreator/src/modules/odontogram/engine` = `$ENGINE`. Transcription sources: `$ENGINE/src/PerioChart.tsx`, `$ENGINE/src/PerioSidebar.tsx`, `$ENGINE/src/App.tsx` (mount wiring 743-755, 1029).

## Global Constraints

- Everything from Phases 1–3 binds: `lib/core/**` NEVER edited; payload 2.19; no React; no new runtime dependencies; specs under `npm run test:ng` (no `vi.mock`; TestBed DI overrides + real engine seams; `vi.fn`/`vi.spyOn`-on-objects fine); corpus under `npm run test:corpus`; dialog/housing classes + ids byte-identical to the TSX; i18n keys never invented.
- New singleton mutations in specs (perio sites, overlay layer, case meta, classification overrides…) are already covered by `lib/testing/reset-engine-state.ts` via `__resetChartStateForTest` — any NEW uncovered channel found during a task must be folded into the reset helper in that task.
- The `.perio-info-popover` is appended to `document.body` (TSX 608-632) — every spec that opens one must ensure teardown (the component's destroy path must close it, mirroring TSX 2028).
- Commit policy (repo-root `CLAUDE.md`, untracked): sole author `Zoltán Dul <zoltan.dul@gmail.com>`, no Co-Authored-By/AI attribution ever, controller-assigned backdated dates (remaining 2026-08-06 slots then 2026-08-07, max 10/day, +02:00, both date vars), one commit per task unless the dispatch says otherwise.

---

### Task 1: Re-enable the five framework-free perio tests (corpus)

**Files:**
- Modify: `vitest.config.ts` (remove 5 entries from `REACT_DEPENDENT`; update annotations)

**Interfaces:**
- Consumes: nothing new — these tests exercise core data-layer APIs only.
- Produces: corpus grows by 5 files. The 5: `perio-p1-core.test.ts`, `perio-polish-diff.test.ts`, `pgd-summary.test.ts`, `pge-summary.test.ts`, `ui3b-build-perio-svg.test.ts` (verified: no React import; they were swept into the Phase-1 exclusion by the `useI18n` grep term, and useI18n's bus has shipped in core since Phase 1).

- [ ] **Step 1:** For each of the 5, read its imports in `lib/core/__tests__/` and confirm nothing React/App/PerioChart is imported (the classification claim — verify, don't trust). Any file that DOES need a component stays excluded with a corrected annotation and goes back to the Task-6 batch; report it.
- [ ] **Step 2:** Remove the confirmed ones from the `REACT_DEPENDENT` array (these RUN now — unlike ported specs, the originals themselves execute in the corpus).
- [ ] **Step 3:** `npm run test:corpus` — expect ~100 passed files + 1 skipped, 0 failures (95 + up to 5). Run twice (module-state hygiene of the newcomers). If one fails on state leakage, fix via the corpus's own conventions (its `setup.ts`), never by editing the test.
- [ ] **Step 4:** Commit — `test: re-enable five framework-free perio tests in the corpus`

---

### Task 2: PerioSidebarComponent

**Files:**
- Create: `projects/angular-advanced-odontogram/src/lib/components/perio-sidebar/perio-sidebar.component.ts`
- Test: `perio-sidebar.component.spec.ts` + ported `perio-sidebar/ported/{ui1-sidebar-style,ui1-perio-sidebar}.spec.ts` (the standalone-render parts of the latter; its App-view-gate describe goes to Task 5)
- Modify: `projects/angular-advanced-odontogram/src/public-api.ts`

**Interfaces:**
- Consumes: engine reads (`getPerioSummary`, `getCaseMeta`, `getPerioClassification`, `getReadOnly`, `onStateChange`) + setters (`setPatientName`, `setExamDate`, `setCaseAge`, `setSmokingStatus`, `setCigarettesPerDay`, `setDiabetesStatus`, `setHba1c`, `setMaxRblPercent`, `setToothLossPerio`, `setDiagnosisOverride`, `setStageOverride`, `setGradeOverride`, `setExtentOverride`); `indexName` from core `perioIndexNames`; `I18nService`.
- Produces: `PerioSidebarComponent`, selector `aao-perio-sidebar`, NO inputs/outputs (self-contained like the TSX: own onStateChange subscription refreshing `summary`/`caseMeta`/`classification` signals together). Tasks 4-5 mount it.

**Transcription source:** `$ENGINE/src/PerioSidebar.tsx` in full (three cards: whole-mouth summary 186-238 with `indexName()`-driven translated↔canonical labels; `#caseMetaPanel` 239-373 with per-field engine setters and the gated cigarettes/HbA1c sub-fields; classification panel 374-448 with 4 derived read-outs + override selects). `readOnly` gates every input's disabled state. Classes/ids/keys byte-identical.

- [ ] **Step 1:** Failing specs: (a) renders the three cards with engine-default (empty) data; (b) typing patient name / picking smoking=current reveals cigarettes field and calls the engine (assert via `getCaseMeta()`); (c) classification override select calls `setStageOverride` and the derived read-out updates on notify; (d) readOnly=true disables inputs (drive via engine `setReadOnly` + notify).
- [ ] **Step 2:** RED; implement; GREEN under `npm run test:ng`; corpus untouched; `ng build` green. Port the two named test files (substance preserved; React-tree mechanics → DOM).
- [ ] **Step 3:** Export from public-api. Commit — `feat: PerioSidebar component (summary, case meta, classification)`

---

### Task 3: perio-grid-dom.ts — the framework-free grid builders

**Files:**
- Create: `projects/angular-advanced-odontogram/src/lib/components/perio-chart/perio-grid-dom.ts`
- Test: `perio-chart/perio-grid-dom.spec.ts`

**Interfaces:**
- Consumes: core (`getPerioRowVisibility`, `isPerioRowHidden`-equivalent gates via the getters the TSX uses, `getToothPerio`, `getToothCal`, `getPerioChart`, `furcationEntrances`, `isToothImplant`, `getReadOnly`, all graded-axis getters), core `perioIndexNames.indexName`, core `perioGraphic` (`archToothLayout`, `computeFillScale`, curve/overlay builders).
- Produces (near-verbatim ports of TSX module-scope 141-1517, same names): `mesialOnLeft(toothNo)`, `diamondGridArea(surface, toothNo)`, `mkEl`, `mkRowLabelCell`, `syncToothCells`, cell builders (`buildFieldCell`, `buildFurcationCell`, `buildPlaqueCell`, `buildCejVisibilityCell`, `buildRootConcavityCell`, `buildGradeCell`, `buildKgCell`, `buildGingivalThicknessCell`, `buildMillerClassCell`), `buildArch(teeth, registry, handlers)` with the exact `GridHandlers` type (onPd/onGm/onBop/onMobility/onFurcation/onPlaque/onCejVisibility/onRootConcavity/onPiSurface/onGiSurface/onMpiSurface/onMbiSurface/onKg/onGingivalThickness/onMillerClass — signatures transcribed from TSX 1797-1942), `applyArchColumns`, `collectCurveInput`, `drawArchCurves`, `collectOverlayInput`, `collectMmHeatInput`, `drawArchOverlay`, `overlaySwitchLabel`, info-popover pair (`toggleInfoPopover`, `hideInfoPopover`). Task 4 imports exactly these.

- [ ] **Step 1:** Failing unit specs against representative builders: `mesialOnLeft` quadrant truth table; `diamondGridArea` surface→area mapping; `buildArch` with a spy `GridHandlers` on a seeded engine (real seams: `setPerioSite(16,"MB",{pd:4})` etc.) renders the expected row set honoring `getPerioRowVisibility()` and clicking a BOP cell invokes `onBop` with the right args; `mkRowLabelCell` renders the `indexName()` label + info button.
- [ ] **Step 2:** RED; transcribe the TSX module-scope functions (keep names, structure, class names; TS-type the handler bag); GREEN under test:ng ×2 (popover body-teardown check in afterEach); corpus untouched; build green.
- [ ] **Step 3:** Commit — `feat: framework-free perio grid DOM builders`

---

### Task 4: PerioChartComponent

**Files:**
- Create: `projects/angular-advanced-odontogram/src/lib/components/perio-chart/perio-chart.component.ts`
- Test: `perio-chart.component.spec.ts` + ported `perio-chart/ported/{perio-p2-grid,perio-p2-keyboard,perio-graphic-rows}.spec.ts`
- Modify: `projects/angular-advanced-odontogram/src/public-api.ts`

**Interfaces:**
- Consumes: Task 3's builders; core `perioGraphic` (`loadTemplateCache`, `buildBuccalArchSvg`, `buildPalatalArchSvg`), core keyboard order (`nextPerioCell`/`prevPerioCell` from `odontogram`), the shared `dialog-focus.ts` helpers, `I18nService`, engine setters per the `GridHandlers` wiring (TSX 1797-1942), `getPerioSummary`, `getPerioOverlayLayer`/`setPerioOverlayLayer`, `onStateChange`.
- Produces: `PerioChartComponent`, selector `aao-perio-chart`, inputs `open = input<boolean>(false)`, `inline = input<boolean>(false)`, output `closeChart = output<void>()` (maps the TSX `onClose`; named to avoid colliding with DOM `close`). `active = computed(() => this.inline() || this.open())`; renders NOTHING while inactive and makes NO engine calls while inactive (the TSX's module-eval-safety contract). Both housings byte-identical to TSX 2301-2369 (`#perioInlinePanel` section vs `#perioOverlay` dialog; shared `gridBody` with `#perioInlineGrid`/`#perioOverlayGrid`; the popup renders `<aao-perio-sidebar/>` inside its panel). Keyboard handling per TSX 1644-1793 (digit commit+advance, tens composition, GM sign, arrows, Space/Enter BOP, focus-out dataset cleanup); grid rebuild on the `visibilitySig` snapshot diff (TSX 1954-1963); arch graphics effect with `loadTemplateCache()` + ResizeObserver debounced fitColumns (TSX 2062-2190); overlay switcher `#perioOverlaySwitch` + readout; Escape/backdrop/focus-trap in popup mode via shared helpers; destroy path hides any open info popover.
- jsdom note: `ResizeObserver` may be absent — feature-check before constructing (`typeof ResizeObserver !== "undefined"`), mirroring behavior loss-free in real browsers; specs drive `applyArchColumns` directly rather than through resize.

- [ ] **Step 1:** Failing specs: (a) inactive renders nothing and calls no engine getter (spy via a seeded sentinel — e.g. assert no grid DOM and no summary text); (b) `inline` housing renders `#perioInlinePanel` + grid with seeded PD values visible; (c) `open` housing renders the dialog + `<aao-perio-sidebar>`, Escape emits closeChart; (d) digit keystroke on a PD cell writes via real `setPerioSite` and advances focus per core `nextPerioCell`; (e) overlay switcher click sets the engine overlay layer.
- [ ] **Step 2:** RED; implement; GREEN; then port the three named test files (substance preserved). test:ng ×2; corpus untouched; build green.
- [ ] **Step 3:** Export from public-api. Commit — `feat: PerioChart component (grid, keyboard, overlays, both housings)`

---

### Task 5: Shell integration + App-level ported tests

**Files:**
- Modify: `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/odontogram-shell.component.ts` (3 markers → real mounts)
- Test: extend shell spec + ported `odontogram-shell/ported/{perio-graphical-presentation,perio-p2-overlay,p4a-case-panel,p4b-classification-ui,perio-p1-ui,ui1-perio-sidebar}.spec.ts` (the last: only its App-view-gate describe; its standalone parts landed in Task 2)
- Modify: `vitest.config.ts` annotations for the ported batch

**Interfaces:**
- Consumes: `PerioChartComponent` + `PerioSidebarComponent`; existing shell signals (`isPerioView`, `perioOpen`, `viewMode`).
- Produces: marker line ~318 → `<aao-perio-chart [inline]="true" />` inside the dental-chart column; marker ~324 → `<aao-perio-sidebar />`; marker ~598 → `@if (viewMode() === 'popup') { <aao-perio-chart [open]="perioOpen()" (closeChart)="onPerioClose()" /> }` where `onPerioClose()` calls the engine `closePerioOverlay()` (App.tsx 1029's `onClose={closePerioOverlay}`).

- [ ] **Step 1:** Failing shell spec cases: toggle to Dental Chart view → inline perio panel + sidebar render, odontogram column display:none but still mounted; popup mode → `openPerioOverlay()` (real engine) opens the dialog, close button closes it (engine flag false).
- [ ] **Step 2:** RED; implement mounts; GREEN; port the six App-level test files (mount = TestBed shell; engine-lifecycle DI override as before; real engine seams). test:ng ×2; corpus untouched; build green.
- [ ] **Step 3:** Commit — `feat: mount PerioChart and PerioSidebar in the shell (all three housings)`

---

### Task 6: Port the remaining PerioChart-direct test batch

**Files:**
- Create: ported specs under `perio-chart/ported/`: `perio-p2b-rows`, `pgb-info-buttons`, `pgb-mm-overlays`, `pgb-switcher`, `pgc-cairo`, `pgc-rows`, `pgd-rows`, `pge-rows`, `ui1-dynamic-scale`, `ui1-row-labels`, `ui2-index-names`, `ui2-row-visibility`, `ui3a-central-band`, `ui3a-diamond-tiles`, `ui3b-mpi-implant-gate` (15 files)
- Modify: `vitest.config.ts` annotations

**Interfaces:**
- Consumes: Tasks 3-5's components; the porting mechanics established in Phases 2-3 (mount PerioChartComponent open/inline instead of `render(createElement(PerioChart,...))`; assertions unchanged; real engine seams; mapping notes in headers).
- Produces: the full perio test surface green; every remaining `phase-4` annotation flipped to `ported:` (or `stays-excluded: <reason>` with report entry — never silently). `ui3b-export-options-modal`: adjudicate the explorer's redundancy claim — compare its assertion inventory against the existing `export-options-modal.component.spec.ts`; port any UNCOVERED assertion into that spec, then annotate `covered-by: <spec path>`.

- [ ] **Step 1:** Port one file at a time, each green before the next (this is the long task — same stop-at-clean-boundary rule as Phase 2's Task 6: if context runs low, commit what's green and report the remainder).
- [ ] **Step 2:** Full `npm run test:ng` ×2 green; corpus untouched; build green.
- [ ] **Step 3:** Commit — `test: port perio test batch to Angular specs` (controller pre-authorizes a second commit at the next slot if the batch needs splitting).

---

### Task 7: Docs, hygiene carry-overs, phase close

**Files:**
- Modify: `README.md`, `CHANGELOG.md`, `docs/superpowers/specs/2026-08-06-angular-odontogram-port-design.md` (§8 phase-4 DELIVERED)
- Modify: `export-options-modal.component.ts` (comment wording), `settings-modal` spec files (shared `makeSettings` fixture) — the two Phase-3 final-review hygiene items

**Interfaces:**
- Consumes: everything delivered.
- Produces: Phase 4 closed; Phase-3 hygiene items landed (tighten the "vi.mock unavailable" comment wording per the Phase-3 review; extract the duplicated `makeSettings()` fixture to `lib/components/settings-modal/testing/make-settings.ts`, NOT exported from public-api, imported by the 4 spec files).

- [ ] **Step 1:** Hygiene items + docs (README Phase-4 checkbox; CHANGELOG entries: PerioSidebar, perio-grid-dom, PerioChart, 3 shell mounts, 5 corpus re-enables + ported batch counts; spec §8 DELIVERED note).
- [ ] **Step 2:** FULL PHASE GATE (record outputs): `npm run test:corpus` && `npm run test:ng` ×3 consecutive && `npm run build:styles` && `npx ng build angular-advanced-odontogram` && `npx ng build demo`.
- [ ] **Step 3:** Commit — `test: perio phase docs and hygiene; phase 4 close`

---

## Deferred (explicit)

- Phase 5: packaging (dist README/LICENSE, explicit public-API ruling on `ODONTOGRAM_ENGINE_LIFECYCLE` + `EXPORT_PDF_FN`, packageManager pin, CHANGELOG links, `pre` script for build:styles), typedoc, README translations, browser-level smoke of the full app, 1.0.0 acceptance per spec §7.
