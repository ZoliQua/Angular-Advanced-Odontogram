# Angular Odontogram Port — Phase 6: 1.1.0 Upstream Resync (v2.4.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resync the Angular port to `react-advanced-odontogram` v2.4.0 (engine commit `f9b45fc`, payload 2.20) — core+corpus re-copy, all shell deltas ported (Settings reorg, PDF settings, export modal split, notes, collapsible cards, availability gating, persistence API), regenerated goldens adopted — released as 1.1.0.

**Architecture:** Same resync discipline as Phase 1, now with FOUR sanctioned core deviations: (1) `?raw` teeth-SVG import swap → `generated/teeth-svgs`; (2) `src/assets`→`assets` path anchors in copied tests; (3) `i18n/useI18n.ts` React hook + react import stripped (bus kept); (4) BRANDING (owner decision 2026-08-11): `"app.title"` value → `"Angular Advanced Odontogram"` in ALL 12 languages of `i18n/translations.ts` (only the app.title values — everything else byte-identical). Shell deltas are transcribed from the pinned engine commit exactly as in Phases 2-4. The resync makes `test:ng` transiently red (core behavior changed under the ported specs — summary shape, idempotent setters); Tasks 2-5 burn it back to green.

**Tech Stack:** unchanged + new runtime dep `dompurify ^3.4.13` (plugin-SVG sanitization, upstream security fix).

**Source pin:** `/Users/Zoli/Sites/DentalQuoteCreator/src/modules/odontogram/engine` at commit **`f9b45fc`** = `$ENGINE`. Read-only. If the engine checkout is NOT at f9b45fc when a task starts, STOP and report (do not resync to a moving target).

## Global Constraints

- Core byte-identical to `$ENGINE@f9b45fc` except the FOUR deviations above. NEW core files ship too: `persistence.ts`, `fonts/` (loader + roboto + notoArabic + arabicShaper + notoSC — large base64 TS modules, copied verbatim), `fhir/iso3950.ts`. Diff-discipline check extended accordingly.
- Regenerated goldens (fhir-golden.json, roundtrip-golden.json, svg-fingerprints.json) are adopted from upstream — parity target is now v2.4.0.
- `dompurify` added to root deps + library `package.json` dependencies + ng-package `allowedNonPeerDependencies` (same treatment as jspdf).
- The engine's `setCollapsedCard`/`toggleCollapsedCard` are deliberately non-idempotent; every other new setter no-ops silently on unchanged values — ported specs must mirror upstream's assertions, never "fix" them.
- The brand logo: copy `$ENGINE/src/assets/react-module-logo.png` into the Angular assets + `gen:assets` pipeline (as a data-URI export like `iconNoSelectionUrl`); if the artwork is visibly React-branded, flag in the report for the owner — do NOT swap artwork on your own.
- `panel-odontogram-controls` always-mounted wrapper: the Angular shell ALREADY does this (Phase-2 fix predates upstream's identical fix) — verify convergence, don't duplicate.
- Commit policy (repo-root `CLAUDE.md`, untracked): sole author `Zoltán Dul <zoltan.dul@gmail.com>`, no Co-Authored-By/AI attribution ever, controller-assigned backdated dates (day 2026-08-11, max 10/day, +02:00, both date vars), one commit per task unless the dispatch says otherwise.

---

### Task 1: Core + corpus resync to f9b45fc

**Files:**
- Modify/Create: everything under `projects/angular-advanced-odontogram/src/lib/core/` (re-copy incl. NEW `persistence.ts`, `fonts/*`, `fhir/iso3950.ts`, regenerated `__tests__/parity/*.json`, 11 new test files, updated `index.css` + `translations.ts` + assets if changed)
- Modify: root `package.json` + library `package.json` + `ng-package.json` (dompurify), `vitest.config.ts` (exclusion-list audit for new corpus files), `projects/angular-advanced-odontogram/src/lib/core/generated/*` (re-run `gen:assets` if SVG assets changed upstream)
- Modify: `docs/superpowers/specs/2026-08-06-angular-odontogram-port-design.md` (§2 deviations list gains #4 branding; parity target v2.4.0)

**Interfaces:**
- Produces: the v2.4.0 core surface Tasks 2-4 consume (new exports: `setPatientDob/getPatientDob`, `getPdfSettings/setPdfSettings` + `PdfSettings` types, `getFillingComplexity/setFillingComplexity`, `getFillingDefectEnabled/setFillingDefectEnabled`, `getFissureSealingEnabled/setFissureSealingEnabled`, `getFillingMaterialAvailability/setFillingMaterialAvailability`, `getCollapsedCards/isCardCollapsed/setCollapsedCard/toggleCollapsedCard`, `hasAnyToothNote`, `getPerioToothKind`, `OdontogramToothTable` types; `persistence.ts`: `enablePersistence/disablePersistence/clearPersistedState/isPersistenceEnabled` + `PersistenceOptions`).

- [ ] **Step 1:** Verify `$ENGINE` is at f9b45fc (`git -C $ENGINE rev-parse HEAD`). Re-copy the core set (same file list as Phase 1 + the new files) and the FULL `src/__tests__` corpus over the existing copies; re-apply deviations (1) import swap in odontogram.ts, (2) re-apply the `src/assets`→`assets` anchors in `parity/capture.ts` (re-copied fresh — re-edit), (3) strip the React hook from `i18n/useI18n.ts`, (4) app.title → "Angular Advanced Odontogram" in all 12 language tables. Run `npm run gen:assets` if `$ENGINE/src/assets` changed (diff first).
- [ ] **Step 2:** `npm i dompurify@^3.4.13`; add to library deps + allowedNonPeerDependencies.
- [ ] **Step 3:** Diff-discipline check (extended): every core file diffs empty against `$ENGINE/src/` except the four sanctioned hunks; the corpus diffs empty except the two test-infra anchors. Record the full output.
- [ ] **Step 4:** Exclusion-list audit: for each of the 11 new corpus files, verify imports (React/App/PerioChart?) — framework-free ones RUN in the corpus; React-dependent ones join `REACT_DEPENDENT` with a `phase-6` annotation (Task 5 ports them). Also RE-AUDIT the two Phase-4 drift-corrected ported specs (`ui1-perio-sidebar`, `ui3a-central-band`) — upstream now matches them natively.
- [ ] **Step 5:** Gates: `npm run test:corpus` GREEN with the new baseline (record counts — expect growth from the new tests); `npx ng build angular-advanced-odontogram` green; `npm run test:ng` run ONCE and its failures INVENTORIED per file with root cause (summary-shape change, idempotent setters, new DOM…) — this red list is Task 2-5's burn-down contract, recorded in the report.
- [ ] **Step 6:** Commit — `feat: resync core and corpus to react-advanced-odontogram v2.4.0`

---

### Task 2: App.tsx delta port (shell)

**Files:**
- Modify: `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/odontogram-shell.component.ts`, `lib/testing/reset-engine-state.ts` (new singleton channels), `projects/angular-advanced-odontogram/src/public-api.ts` (persistence re-exports), shell spec + affected ported specs in `odontogram-shell/ported/`

**Interfaces:**
- Consumes: Task 1's new core exports.
- Produces: the shell at v2.4.0 parity — transcription source `$ENGINE/src/App.tsx@f9b45fc` (1200 lines; diff-driven: port the delta regions). New signals for the ~10 new session states (export/import availability ×6, planModeAvailable, perioChartAvailable, screenSpacing, screenNumberSize, selectionColor `#3b7bff`, selectionBorderStyle `"dashed"`, fillings-settings mirrors, pdfSettings mirror); `settingsState` computed extended ~24 fields incl. `onPlanModeAvailable` (auto-revert to status mode) and `onPerioChartAvailable` (auto-close overlay); brand logo `<img class="brand-logo">` from the new generated data-URI; `#toothGrid` `data-screen-spacing`/`data-tooth-num` + `--odon-select-rgb`/`--odon-select-border-style` inline custom props (port `hexToRgbCss`); `#fillingSimpleRow`/`#fillingSimpleToggle`/`#fillingSimpleDefectRow`/`#fillingSimpleDefectSelect` skeleton rows; tooth-info card: grouped dentition `tooth-info-table` (from `summary.toothTable`) + `#toothInfoNotes` (from `summary.individualNotes`) replacing the old permanentList/missingList paragraphs; `.perio-launch-bar` + `#chartModeToggle` availability-gated `hidden` classes; persistence functions re-exported through public-api (NOT wired — host-opt-in, like upstream).

- [ ] **Step 1:** Port the deltas region-by-region against the App.tsx diff; extend `MUST_HAVE_IDS` with every new id; update the shell spec + fix the Task-1-inventoried shell-spec reds that belong to App-level changes (summary shape etc.). Fold new spec-mutated singletons (pdfSettings, availability flags, collapsed cards, filling settings, patientDob already via caseMeta) into `reset-engine-state.ts`.
- [ ] **Step 2:** Gates: shell spec + its ported specs green under test:ng; corpus untouched; build green. Record remaining test:ng red (should now be Settings/Export/Perio-scoped only).
- [ ] **Step 3:** Commit — `feat: port App shell deltas from v2.4.0`

---

### Task 3: SettingsModal reorg port

**Files:**
- Modify: `lib/components/settings-modal/settings-modal.component.ts` (+ its `testing/make-settings.ts` fixture), settings specs + ported settings specs

**Interfaces:**
- Consumes: Task 2's extended `settingsState`.
- Produces: the reorganized 7-tab structure per `$ENGINE/src/SettingsModal.tsx@f9b45fc` (1171 lines): `SETTINGS_TABS` = `general, odontogram, periodontalChart, toothDetails, caries, fillings, export` (ids verbatim); `SettingsState` extended ~30 fields (exact list from the TSX 29-…); tab contents transcribed (general + export/import availability toggles; odontogram tab; periodontalChart availability-gated; toothDetails absorbing pulpa+notes + selection colour/border rows; fillings tab with `FILLING_MATERIAL_KEYS` toggles; export tab = the full PDF Settings form incl. date input, color theme, three sections, disclaimer textarea). APG tablist logic unchanged.

- [ ] **Step 1:** Transcribe the reorg; update `make-settings.ts` (all new fields with upstream defaults); fix the settings-scoped ported specs per upstream's own updated test expectations (`sp13-settings-tab`, `sp15-settings`, `ui2-perio-settings`, `settings-modal-a11y` — their corpus sources changed in the resync; re-diff each ported spec against its updated source and port the deltas, drift-noted).
- [ ] **Step 2:** Gates: settings specs green ×2; corpus untouched; build green.
- [ ] **Step 3:** Commit — `feat: port SettingsModal reorganization from v2.4.0`

---

### Task 4: ExportOptionsModal + Perio component deltas

**Files:**
- Modify: `lib/components/export-options-modal/export-options-modal.component.ts` (+ spec + ported additions), `lib/components/perio-chart/perio-grid-dom.ts`, `perio-chart.component.ts`, `lib/components/perio-sidebar/perio-sidebar.component.ts`, affected perio ported specs

**Interfaces:**
- Consumes: Tasks 1-2.
- Produces: ExportOptionsModal per `$ENGINE/src/ExportOptionsModal.tsx@f9b45fc` (285 lines): DOB date input → `setPatientDob`; name-input local buffer (blur/export commit); exam-date defaults to today on open when null; checkbox split `odontogramChart`+`odontogramDescription`; `individualNotes` checkbox gated on `hasAnyToothNote()`; `PdfExportOptions` shape updated. Perio: `perio-grid-dom.ts` re-transcribed deltas (collectCurveInput continuity fix, `getPerioToothKind` threading, `SURFACE_LETTER` watermark tags); `perio-chart.component.ts` component-body deltas (2339-line source — diff-driven); PerioSidebar `EMPTY_CASE_META` + patientDob.

- [ ] **Step 1:** Port each delta against the respective diffs; update specs (incl. upstream's updated corpus expectations for the perio ported batch — re-diff each affected ported spec's source).
- [ ] **Step 2:** Gates: export-modal + perio specs green ×2; corpus untouched; build green.
- [ ] **Step 3:** Commit — `feat: port export modal and perio deltas from v2.4.0`

---

### Task 5: Test burn-down to full green + new test ports

**Files:**
- Modify: `vitest.config.ts` annotations; remaining ported specs; Create: ports for any React-dependent NEW corpus tests (per Task 1's audit — e.g. `ui4-collapsed-cards` if it mounts App)

**Interfaces:**
- Consumes: everything above.
- Produces: `npm run test:ng` FULLY GREEN ×3 consecutive; every Task-1-inventoried red resolved (fixed by Tasks 2-4 or explicitly ported here); the idempotent-setter assertion updates mirrored into ported specs whose sources gained them (`sp16-surface-notation`, `sp17-followups`, `ui2-index-names`, `ui2-row-visibility` ported counterparts); every new corpus file dispositioned (runs in corpus | `ported:` | `stays-excluded:` with reason).

- [ ] **Step 1:** Burn down file-by-file; never weaken assertions; drift notes where upstream changed behavior.
- [ ] **Step 2:** Gates: test:ng ×3 all green; corpus green; build green.
- [ ] **Step 3:** Commit — `test: burn down resync test suite to green; port new v2.4.0 tests`

---

### Task 6: Docs + 1.1.0 cut

**Files:**
- Modify: `README.md`, `lang/README-hu.md` (parity statement → v2.4.0/payload 2.20 + version 1.1.0; new-feature mentions: persistence, PDF settings, collapsible cards), `CHANGELOG.md` (`[1.1.0]` cut + links), both `package.json` (1.1.0), spec (§2 drift subsection closed — resync DONE; §10 updated), `docs/superpowers/specs/1.1.0-acceptance.md` (same evidence discipline as 1.0.0: regenerated-golden suite runs, pack dry-run, consumer resolution)
- Check: demo bundle size (the font modules are dynamic-imported — verify the main bundle did NOT balloon; if lazy chunks appear, record their sizes; adjust budgets ONLY if the main bundle genuinely grew and justify)

**Interfaces:**
- Produces: release-ready 1.1.0. (Controller close-out after merge: browser smoke incl. the new title "Angular Advanced Odontogram", Settings reorg tabs, export modal DOB; tag v1.1.0; push; npm publish handover.)

- [ ] **Step 1:** Docs + versions + acceptance sheet with real run evidence.
- [ ] **Step 2:** FULL GATE: corpus && test:ng ×3 && build:styles && ng build lib && build:demo — all green, recorded; bundle-size note.
- [ ] **Step 3:** Commit — `release: 1.1.0 — resync to react-advanced-odontogram 2.4.0`

---

## Deferred (explicit)

- Persistence demo wiring (upstream doesn't wire it into the shell either — host-opt-in; a demo toggle could come later if Zoli wants).
- Remaining README translations; typedoc link warnings; the logo artwork question if flagged.
