// Global Vitest setup file — wired into `angular.json`'s
// `projects.angular-advanced-odontogram.architect.test.options.setupFiles`,
// NOT imported by individual spec files.
//
// Why this exists (test-stability defect, phase-2 close-out):
// `npm run test:ng` runs `@angular/build:unit-test`'s Vitest runner, which
// defaults `test.isolate` to `false` — see
// `node_modules/@angular/build/src/builders/unit-test/runners/vitest/plugins.js`
// (`projectDefaults.test.isolate = false`, commented "Default to `false` to
// align with the Karma/Jasmine experience."). With isolation off, every
// `*.spec.ts` file in this project's run shares ONE JS module registry, so
// `core/odontogram.ts`'s and `core/i18n/useI18n.ts`'s module-level singleton
// state (the two chart Maps, `caseMeta`, `chartMode`, the current i18n
// language, `perioViewMode`, the pending DualState confirm, …) is literally
// the same object across every spec file for the whole run — plus
// `document.documentElement`'s `dark` class, a jsdom-global side effect some
// specs toggle. Whichever spec file happens to run first leaves its state
// behind for the next one.
//
// Reproduction (before this fix): `npm run test:ng` failed roughly 9 of 13
// consecutive runs (39 spec files / 321 tests), always inside
// `lib/components/odontogram-shell/ported/*.spec.ts`, always because some
// file left non-default state behind:
//   - `ui-ar-rtl.spec.ts`'s last test sets the shell's `language` input to
//     "zh" and never restores it, so a later file with no i18n reset of its
//     own (e.g. `sp6-task2-caries-popup.spec.ts`) reads e.g.
//     `t("caries.cars.0")` as "健康" instead of "Sound".
//   - `lib/i18n/i18n.service.spec.ts`'s last test calls
//     `i18n.setLanguage("hu")` and never restores it — same class of leak.
//   - `sp18-periimplant-roundtrip.spec.ts` calls `__setToothStateForTest`
//     for teeth 16/17/26/36/46 (implant + peri-implant records) but its
//     `beforeEach` only resets i18n, never the chart via
//     `__resetChartStateForTest()` — so a later file expecting a clean chart
//     (e.g. `summary.spec.ts` asserting `implants: null`) can instead
//     observe a leftover tooth-46 implant record.
//   - `odontogram-shell.component.spec.ts`'s "dark mode: standalone toggle"
//     test used to leave `.dark` cleanup as the LAST line of the test body
//     (only reached if every earlier assertion passed), which is
//     order-fragile; fixed separately in that file to an `afterEach`.
//   - `ds1-confirm-revert.spec.ts` calls `__setActiveToothForTest(16)`
//     against a REAL mounted shell (so the `#mobilitySelect` etc. DOM that
//     `syncControlsFromState()` queries actually exists) and never clears
//     `activeTooth` afterward — `__resetChartStateForTest()` does not reset
//     it either. The alphabetically-adjacent `ds1-confirm.spec.ts` is a
//     DOM-less, engine-only file: when it calls `setChartMode(...)` with the
//     leaked `activeTooth = 16` still set, `setChartMode` unconditionally
//     calls `syncControlsFromState(toothState.get(16))`, which crashes with
//     `Cannot read properties of null (reading 'value')` querying a select
//     element that was never mounted in that file.
//
// Root-cause fix: reset every one of these singletons, via their exported
// public seams only, before AND after every test in every spec file — not
// just the files that happen to import this module. Vitest setup files
// behave like Angular's own generated TestBed-init virtual file (see
// `createTestBedInitVirtualFile` in
// `@angular/build`'s `unit-test/runners/vitest/build-options.js`, which
// registers its `beforeEach`/`afterEach` calls at the top level specifically
// "to ensure the hooks are always applied, even in non-isolated … environments"):
// a `beforeEach`/`afterEach` call made at a setup file's top level attaches
// to the run's single shared root suite, so it fires for every test in every
// spec file for the whole `npm run test:ng` run, regardless of file order.
//
// No file under `lib/core/` is modified by this fix — every reset below goes
// through an already-exported test seam or public setter.
import { afterEach, beforeEach } from "vitest";
import {
  __resetChartStateForTest,
  __setActiveToothForTest,
  closePerioOverlay,
  setFillingComplexity,
  setFillingDefectEnabled,
  setFillingMaterialAvailability,
  setFissureSealingEnabled,
  setNotesEnabled,
  setNumberingSystem,
  setPdfSettings,
  setPerioIndexNameMode,
  setPerioOverlayLayer,
  setPerioRowVisibility,
  setPerioViewMode,
  setReadOnly,
  setToothAnatomy,
  setWearDetailLevel,
  setDiscolorationDetailLevel,
  type PerioRowId,
} from "../core/odontogram";
import { setI18nLanguage } from "../core/i18n/useI18n";
import { DEFAULT_PDF_THEME } from "../core/perioPdf";

// Phase 3 Task 3: the Settings -> Periodontal tab's two module-level
// singletons (`core/odontogram.ts`'s `perioRowVisibility`/`perioIndexNameMode`)
// join the leak-prone list above once `SettingsModalComponent` lets a spec
// actually flip them — same class of defect the file-level comment documents:
// no test seam resets these, so a spec that toggles a row (or switches the
// index-name mode) leaks it to every later spec in the same
// `test.isolate: false` run. Neither singleton has a bulk-reset export, so
// this restores them via their own public setters: every row back to visible
// (the module's own default — see `defaultPerioRowVisibility()`) and the mode
// back to "translated" (the module's own default).
const ALL_PERIO_ROW_IDS: readonly PerioRowId[] = [
  "plaque", "bop", "cal", "gm", "pd", "furcation", "mobility", "cej",
  "rootConcavity", "pi", "gi", "mpi", "mbi", "kg", "gt", "miller",
];

// v2.4.0 resync (Task 2): the Fillings-tab session-config singletons
// (`core/odontogram.ts`'s `fillingDefectEnabled`/`fillingComplexity`/
// `fissureSealingEnabled`/`fillingMaterialAvail`) — same leak class as the
// perio-settings singletons above; each is a module-level flag with a public
// setter but no bulk-reset export, so a spec (e.g.
// `odontogram-shell.component.spec.ts`'s Task 3 describe block, or a future
// Settings -> Fillings tab spec) that flips one leaks it to every later spec
// in the same `test.isolate: false` run.
const ALL_FILLING_MATERIALS = ["amalgam", "composite", "gic", "temporary"] as const;

/** Resets every known core/odontogram + i18n singleton to its default state.
 *  Exported (not just used internally) so a spec file can call it mid-test
 *  if it ever needs an extra reset point beyond the automatic
 *  before/afterEach below. */
export function resetEngineStateForTest(): void {
  // Chart Maps (status + plan), planInitialized, planEditedTeeth, the
  // pending DualState confirm, chartMode, and caseMeta.
  __resetChartStateForTest();
  // activeTooth is NOT touched by __resetChartStateForTest() above — reset
  // it separately via its own test seam (see ds1-confirm-revert leak above).
  __setActiveToothForTest(null);
  // i18n language bus.
  setI18nLanguage("en");
  // Phase 3 Task 4 fold-in (controller-mandated, from Task 3's review):
  // the tooth-numbering-system singleton (`core/odontogram.ts`'s module-level
  // `numberingSystem`, module default "FDI") has no reset seam of its own
  // either — same leak class as the perio-settings singletons below. No spec
  // in this suite currently flips it, but this is defense-in-depth against a
  // future one leaking it silently across files under `test.isolate: false`.
  setNumberingSystem("FDI");
  // Perio chart view-mode toggle (module default — see
  // `core/odontogram.ts`'s `let perioViewMode: PerioViewMode = "toggle"`).
  setPerioViewMode("toggle");
  // v2.4.0/1.2.0 resync (Task 4 fold-in): the Settings -> Odontogram tab's
  // tooth-anatomy profile (`core/odontogram.ts`'s `let toothAnatomy:
  // ToothAnatomy = "classic"`) is the exact same leak class as
  // `perioViewMode` above — module-level singleton, public setter, no
  // bulk-reset export. Task 4's own specs (and any future one) that call
  // `onToothAnatomy("measured")` would otherwise leak the profile to every
  // later spec file in this `test.isolate: false` run.
  setToothAnatomy("classic");
  // v2.4.0 resync (Task 3 fold-in, ledgered leak-class item): the Tooth
  // details -> Notes toggle's module-level singleton
  // (`core/odontogram.ts`'s `let notesEnabled = false`) has no reset seam of
  // its own either — same leak class as every other module flag reset in
  // this function. No spec in this suite currently leaves it flipped, but
  // this is defense-in-depth against a future Settings -> Tooth details spec
  // leaking it silently across files under `test.isolate: false`.
  setNotesEnabled(false);
  // T5 (composable-resync burn-down, Part B fold-in): the Tooth details ->
  // wear/discoloration detail-level singletons (`core/odontogram.ts`'s `let
  // wearDetailLevel`/`let discolorationDetailLevel`, module default
  // "complex") are pre-existing (not new this phase) but had NO reset seam
  // either — same leak class as every other module flag reset in this
  // function. `tooth-details-card.spec.ts` (new this task) is the FIRST spec
  // in the suite to flip either one (to exercise the select-vs-toggle swap),
  // so without this reset it would leak "simple" to every later spec file in
  // the same `test.isolate: false` run.
  setWearDetailLevel("complex");
  setDiscolorationDetailLevel("complex");
  // Perio-settings singletons (Task 3): every row back to visible, index-name
  // mode back to "translated" — both module defaults (see
  // `defaultPerioRowVisibility()` / `let perioIndexNameMode = "translated"`).
  for (const id of ALL_PERIO_ROW_IDS) setPerioRowVisibility(id, true);
  setPerioIndexNameMode("translated");
  // Fillings-tab session-config singletons (Task 2): every field back to its
  // own module default (see `core/odontogram.ts`'s `let fillingDefectEnabled
  // = true`, `let fillingComplexity: ... = "complex"`, etc.).
  setFillingDefectEnabled(true);
  setFillingComplexity("complex");
  setFissureSealingEnabled(true);
  for (const material of ALL_FILLING_MATERIALS) setFillingMaterialAvailability(material, true);
  // PDF export settings singleton (Task 2) — no bulk-reset export either, so
  // restore every field to its own module default (see
  // `core/odontogram.ts`'s `const pdfSettings: PdfSettings = {...}`).
  setPdfSettings({
    defaultName: "John Doe",
    defaultDob: "1980-01-01",
    showAge: true,
    dateFormat: "iso",
    colorTheme: DEFAULT_PDF_THEME,
    showBone: true,
    showHealthyPulp: true,
    toothSpacing: "medium",
    border: false,
    borderThickness: "medium",
    borderColor: "#000000",
    toothNumberSize: "normal",
    includeOdontogramText: true,
    includeOdontogramTable: true,
    perioToothSpacing: "medium",
    perioShowEmptyRows: false,
    perioLabelPlacement: "center",
    perioFontSize: "normal",
    includePerioTable: true,
    includePerioAbbrev: true,
    showDisclaimer: true,
    disclaimerText: "",
    showGenerator: true,
    summaryGrouping: "jaw",
  });
  // Dark-mode DOM class some shell specs flip on `document.documentElement`.
  document.documentElement.classList.remove("dark");
  // Perio overlay singletons (session-level, shared across specs).
  setPerioOverlayLayer("none");
  closePerioOverlay();
  setReadOnly(false);
}

beforeEach(resetEngineStateForTest);
afterEach(resetEngineStateForTest);
