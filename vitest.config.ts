import { defineConfig } from "vitest/config";

// React-dependent tests from the source repo. Originally generated in the
// source repo via:
//   grep -l -E "from [\"']react[\"']|@testing-library/react|from [\"']\.\./App[\"']|useI18n" *.ts *.tsx
// (filename/keyword-based — several entries below never actually import
// React/@testing-library/react/../App at all; they were swept in only by
// the "useI18n" substring matching their i18n import path. useI18n.test.ts
// itself was dropped from this list entirely in an earlier task — it is
// framework-free and already runs under `npm test`/test:corpus.)
//
// These verbatim `.test.ts(x)` files STAY in this exclusion list
// PERMANENTLY — they are the frozen React corpus, never executed directly.
// Every entry below is annotated with its disposition (`ported:` or
// `covered-by:`). The array keeps the frozen React originals excluded from
// the `test:corpus` run permanently.
const REACT_DEPENDENT = [
  "App.test.tsx", // ported: components/odontogram-shell/ported/App.spec.ts (settings/numbering-modal subset stays phase-3, noted in that spec's header)
  "case-conditions-ui.test.tsx", // phase-11: declarative-render test for the NEW <CaseDiagnosesModal/> — imports react/@testing-library/react and the React component directly. Port target: Task 3 (diagnosis-coding UI port).
  "caries-card.test.tsx", // covered-by: components/surfaces/cards/ported/caries-card.spec.ts (T5: render + write-through + section-visibility gate; the caries-depth-popup click assertion isn't ported — no Angular spec drives that popup interaction, same residual class as fillings-card.test.tsx's defect popup)
  "composable-surfaces.test.tsx", // covered-by: components/surfaces/ported/composable-surfaces.spec.ts (T5: "used outside its provider" ported 1:1 via Angular's own required-inject DI error). NOT ported: "custom host layout"/"shares one provider" — replicating OdontogramUiService.configure()'s full input-signal bundle outside OdontogramShellComponent is substantial setup for marginal proof value, since every shell spec already proves the 4 surfaces compose and share one service instance; the residual unverified claim is narrowly "in an ARBITRARY host layout/order", implied structurally by each surface being an independent standalone component. T5 report flags this as a residual gap.
  "credits-modal.test.tsx", // covered-by: components/credits-modal/credits-modal.component.spec.ts (open/close/Escape/backdrop/focus-trap/creator+libraries content — 14 tests) + components/odontogram-shell/odontogram-shell.component.spec.ts's new T5 "#btnCreditsMenu opens the mounted <aao-credits-modal>" integration test (shell-level wiring). "never credits Claude/the AI assistant" has no direct counterpart but is true by construction (the CREATOR const is a static hardcoded value with no such entry). 2026-08-19: the Contributors section (and its component-side CONTRIBUTORS array) was removed per owner directive — the credits-modal spec now also asserts its absence.
  "ds1-confirm-revert.test.tsx", // ported: components/odontogram-shell/ported/ds1-confirm-revert.spec.ts
  "ds1-confirm.test.ts", // ported: components/odontogram-shell/ported/ds1-confirm.spec.ts (its <DualStateConfirm> component block was already ported earlier as dual-state-confirm.component.spec.ts)
  "dx-card.test.tsx", // phase-11: declarative-render test for the NEW <DiagnosesCard/> (DX-2 Task 4 upstream) — mounts under <OdontogramProvider>, imports @testing-library/react. Port target: Task 3 (diagnosis-coding UI port).
  "fillings-card.test.tsx", // covered-by: components/surfaces/cards/ported/fillings-card.spec.ts (T5: render + write-through + simple/complex swap + fissure gating + section-visibility). NOT ported: the `.surf-defect` indicator's popup-open + fillingDefect write (openFillingDefectPopup's DOM popup interaction) — a residual gap, same class as the caries-depth popup no existing Angular spec exercises either.
  "get-selected-teeth.test.ts", // phase-11: NEW public getSelectedTeeth() read. Four of its five cases exercise ../odontogram directly (framework-free), but the file also statically imports "../App" for one "is part of the public entry point" assertion, so the whole file needs react. Port target: Task 5 (public API) — port an Angular-side getSelectedTeeth()/getSelectedTeeth-on-the-public-surface spec.
  "i18n-lazy-load.test.tsx", // phase-11: mixes two framework-free static-analysis guards (the loader code-split guard: no application module statically imports a non-English locale/translations.ts; the loader reaches every language via a literal dynamic import) with React render assertions (OdontogramProvider/useI18n via @testing-library/react) in ONE upstream file. The guards were manually verified against our copies for this task (see task-1-report.md); Task 2 (lazy i18n integration) ports an Angular-side guard test that runs permanently in test:corpus.
  "measured-anatomy.test.tsx", // covered-by: components/odontogram-shell/odontogram-shell.component.spec.ts's "#toothGrid's data-anatomy attribute follows the Settings -> Odontogram tooth-anatomy picker" test (Task 4) — SETTING WIRING ONLY (classic<->measured switch reaches core, `data-anatomy` attr flips). NOT ported: the corpus's actual grid/tile-structure assertions (flat-vs-two-arch grid, id-different measured tiles 15/17/46, a state edit activating the expected layer) — these need a REAL `initOdontogram()` + built SVG grid under jsdom (the corpus's own `tooth-details-selection.test.tsx`-class heavier harness no other Angular spec in this suite uses); flagged as a residual gap in the T5 report rather than risking a fragile ad hoc real-init spec.
  "orthodontics-card.test.tsx", // covered-by: components/odontogram-shell/ported/sp14-ortho-ui.spec.ts (render + write-through for appliance/drift/vertical/rotation + card gate, 7 tests) + components/odontogram-shell/ported/ds1b-force-value-orthodontics.spec.ts (pick-then-cancel snap-back)
  "p4a-case-meta.test.ts", // ported: components/odontogram-shell/ported/p4a-case-meta.spec.ts
  "p4a-case-panel.test.ts", // ported: components/odontogram-shell/ported/p4a-case-panel.spec.ts
  "p4b-classification-ui.test.ts", // ported: components/odontogram-shell/ported/p4b-classification-ui.spec.ts
  "parity/api-surface.test.ts", // phase-11: NEW upstream golden freezing EVERY runtime export of React's `../../App` and `../../odontogram` (>300/>100 entries) — a safety net for upstream's OWN odontogram.ts split, imports App directly. The golden shape (React's App.tsx surface) has no Angular analog; Task 5's own public-api-exports port is the equivalent safety net for this port.
  "parity/shell-dom.test.tsx", // phase-7: upstream's OWN self-parity harness (mounts <App> against parity/shell-dom-golden.html) — proves React's OdontogramProvider decomposition byte-identical to pre-decomposition markup; not a port target itself. Angular's DOM-parity discipline (Global Constraints) asserts the same ids independently in each surface/card's own spec.
  "perio-chart-anatomy-switch.test.tsx", // ported: components/perio-chart/ported/perio-chart-anatomy-switch.spec.ts (Task 4: PerioChartComponent's `anatomy` signal makes the tooth-row-graphic effect depend on the anatomy profile, not just `active`, fixing the same "stale template cache after a live anatomy switch" bug the pinned TSX test pins)
  "perio-graphic-rows.test.ts", // ported: components/perio-chart/ported/perio-graphic-rows.spec.ts (Task 4; annotation was left stale until Task 6)
  "perio-graphical-presentation.test.ts", // ported: components/odontogram-shell/ported/perio-graphical-presentation.spec.ts
  "perio-p1-ui.test.ts", // ported: components/odontogram-shell/ported/perio-p1-ui.spec.ts
  "perio-p2-grid.test.ts", // ported: components/perio-chart/ported/perio-p2-grid.spec.ts (Task 4; annotation was left stale until Task 6)
  "perio-p2-keyboard.test.ts", // ported: components/perio-chart/ported/perio-p2-keyboard.spec.ts (Task 4; annotation was left stale until Task 6)
  "perio-p2-overlay.test.ts", // ported: components/odontogram-shell/ported/perio-p2-overlay.spec.ts
  "perio-p2b-rows.test.ts", // ported: components/perio-chart/ported/perio-p2b-rows.spec.ts
  "pgb-info-buttons.test.ts", // ported: components/perio-chart/ported/pgb-info-buttons.spec.ts
  "pgb-mm-overlays.test.ts", // ported: components/perio-chart/ported/pgb-mm-overlays.spec.ts
  "pgb-switcher.test.ts", // ported: components/perio-chart/ported/pgb-switcher.spec.ts
  "pgc-cairo.test.ts", // ported: components/perio-chart/ported/pgc-cairo.spec.ts
  "pgc-rows.test.ts", // ported: components/perio-chart/ported/pgc-rows.spec.ts
  "pgd-rows.test.ts", // ported: components/perio-chart/ported/pgd-rows.spec.ts
  "pge-rows.test.ts", // ported: components/perio-chart/ported/pge-rows.spec.ts
  "public-api-exports.test.ts", // ported: components/odontogram-shell/ported/public-api-exports.spec.ts
  "r2a-toggle-ui.test.ts", // ported: components/odontogram-shell/ported/r2a-toggle-ui.spec.ts
  "r2b-changes-box.test.ts", // ported: components/odontogram-shell/ported/r2b-changes-box.spec.ts
  "r2b-plan-diff.test.ts", // ported: components/odontogram-shell/ported/r2b-plan-diff.spec.ts
  "r2c-proposed-legend.test.ts", // ported: components/odontogram-shell/ported/r2c-proposed-legend.spec.ts
  "restoration-summary.test.ts", // ported: components/odontogram-shell/ported/restoration-summary.spec.ts
  "root-periodontium-card.test.tsx", // covered-by: components/surfaces/cards/ported/root-periodontium-card.spec.ts (T5: render + pulp/endo + apical/resorption/mobility/periImplant writes + mods/calculus + endoResection + root/perio block gates + the imperative #perioGrid carve-out, 9 tests) + components/odontogram-shell/ported/ds1-confirm-revert.spec.ts (mobility cancel-revert) + ds1b-force-value-root-periodontium.spec.ts (calculus cancel-revert) + sp7-card-merge.spec.ts/sp8-peri-implant-ui.spec.ts (structure/gate statics)
  "secondary-caries-parity.test.ts", // ported: components/odontogram-shell/ported/secondary-caries-parity.spec.ts
  "selection-controls-enable.test.tsx", // covered-by: components/odontogram-shell/ported/selection-controls-enable.spec.ts (Task 4: real ODONTOGRAM_ENGINE_LIFECYCLE + real tooth-tile clicks, pinning core/odontogram.ts's one-pass `labelFor` Map control-panel enable/disable fix against the Angular shell's real DOM)
  "settings-modal-a11y.test.tsx", // ported: components/settings-modal/ported/settings-modal-a11y.spec.ts
  "sp10-filling-defect-summary.test.ts", // ported: components/odontogram-shell/ported/sp10-filling-defect-summary.spec.ts
  "sp10-filling-defect.test.ts", // ported: components/odontogram-shell/ported/sp10-filling-defect.spec.ts
  "sp11-wear-summary.test.ts", // ported: components/odontogram-shell/ported/sp11-wear-summary.spec.ts
  "sp11-wear-ui.test.ts", // ported: components/odontogram-shell/ported/sp11-wear-ui.spec.ts
  "sp12-discoloration-summary.test.ts", // ported: components/odontogram-shell/ported/sp12-discoloration-summary.spec.ts
  "sp12-discoloration-ui.test.ts", // ported: components/odontogram-shell/ported/sp12-discoloration-ui.spec.ts
  "sp12-discoloration.test.ts", // ported: components/odontogram-shell/ported/sp12-discoloration.spec.ts
  "sp13-settings-tab.test.ts", // ported: components/settings-modal/ported/sp13-settings-tab.spec.ts
  "sp13-wear-layout.test.ts", // ported: components/odontogram-shell/ported/sp13-wear-layout.spec.ts
  "sp14-ortho-summary.test.ts", // ported: components/odontogram-shell/ported/sp14-ortho-summary.spec.ts
  "sp14-ortho-ui.test.ts", // ported: components/odontogram-shell/ported/sp14-ortho-ui.spec.ts
  "sp14-orthodontics.test.ts", // ported: components/odontogram-shell/ported/sp14-orthodontics.spec.ts (framework-free; not in the task-6 brief's explicit list but satisfies the same rule)
  "sp15-filling-defect-summary.test.ts", // ported: components/odontogram-shell/ported/sp15-filling-defect-summary.spec.ts (framework-free; not in the task-6 brief's explicit list but satisfies the same rule)
  "sp15-settings.test.ts", // ported: components/settings-modal/ported/sp15-settings.spec.ts
  "sp15-stale-render.test.ts", // ported: components/odontogram-shell/ported/sp15-stale-render.spec.ts
  "sp16-filling-props.test.tsx", // covered-by: components/odontogram-shell/ported/sp16-filling-props.spec.ts (T5: restore-from-props on mount, re-sync on prop change, standalone-mode never-touches-engine, onFillingDefectEnabledChange fires from the Settings tab and NOT from a prop-driven restore). NOT ported: "an inline-literal material prop does not re-fire on identical content" + "an imperative setX call before mount is not clobbered" — both narrow effect-implementation-detail assertions already structurally guaranteed by odontogram-ui.service.ts's own DEFINED-GATED effects + serialized fillingMaterialsKey design (see that file's comments), not independently re-verified — a residual gap.
  "sp16-fillings-card.test.ts", // ported: components/odontogram-shell/ported/sp16-fillings-card.spec.ts
  "sp17-followups.test.ts", // ported: components/odontogram-shell/ported/sp17-followups.spec.ts
  "sp18-periimplant-roundtrip.test.ts", // ported: components/odontogram-shell/ported/sp18-periimplant-roundtrip.spec.ts
  "sp6-task2-caries-popup.test.ts", // ported: components/odontogram-shell/ported/sp6-task2-caries-popup.spec.ts
  "sp6-task4-subcaries-summary-incisal.test.ts", // ported: components/odontogram-shell/ported/sp6-task4-subcaries-summary-incisal.spec.ts
  "sp7-card-merge.test.ts", // ported: components/odontogram-shell/ported/sp7-card-merge.spec.ts
  "sp8-peri-implant-ui.test.ts", // ported: components/odontogram-shell/ported/sp8-peri-implant-ui.spec.ts
  "sp9-summary-tooltip.test.ts", // ported: components/odontogram-shell/ported/sp9-summary-tooltip.spec.ts
  "statuses-card.test.tsx", // covered-by: components/surfaces/cards/ported/statuses-card.spec.ts (T5: render + write-through for resetAll/primaryDentition/mixedDentition/edentulous/statusExtra, 5 tests) + components/odontogram-shell/ported/ds1b-force-value-statuses.spec.ts (proves #btnEdentulous's gated whole-mouth edit never shows stale aria-pressed around a cancel — see that spec's header for why the card structurally needs no force-value directive)
  "summary.test.ts", // ported: components/odontogram-shell/ported/summary.spec.ts
  "tier2-rewire.test.tsx", // react-only: the corpus tests defend against REACT's imperative wireControls()-on-remount double-binding a native `addEventListener` — a problem class Angular's declarative (change)/(click) template bindings don't share (each component instance owns exactly one bound listener, cleanly torn down on destroy, no manual dedup needed). The Angular port's architecture also sidesteps most of the corpus's specific remount scenario: verified (ui1-perio-sidebar.spec.ts) that toggling the Perio/odontogram view keeps ToothControlsSurfaceComponent MOUNTED (hidden via CSS, not destroyed/recreated), so #toothSelect/#restorationSelect never actually go through a remount cycle the way the corpus's React tree does. `rewireControls()`/`rebuildGrid()` themselves ARE ported and exercised (called from OdontogramChartSurfaceComponent's/ToothControlsSurfaceComponent's own constructors and OdontogramUiService — grep confirms real call sites, not dead code) — satisfying their Part D export/API-parity requirement — but a dedicated remount-stress spec isn't warranted given the above.
  "tooth-details-card.test.tsx", // covered-by: components/surfaces/cards/ported/tooth-details-card.spec.ts (T5: render + base/substrate/restoration writes incl. `${type}|${material}`/prosthesis decode + wear/discoloration select-vs-toggle swap + representative checkboxes + row-visibility gates + #extractionPlanRow reparenting + #btnResetTooth, 16 tests)
  "tooth-details-selection.test.tsx", // covered-by: components/surfaces/cards/ported/tooth-details-card.spec.ts's trailing 2 tests (folded in — "follows selection" row-visibility-per-active-tooth regressions). The corpus drives this via real tile clicks under a real initOdontogram() (a heavier real-grid harness no other Angular spec in this suite uses, since `__setSelectionForTest`/`__setToothStateForTest` intentionally skip notifyStateChange()); the folded-in tests prove the same invariant (getActiveToothDetails() re-derives from whichever tooth is active, not a stale/cached value) via fresh-mount-per-active-tooth instead.
  "ui-ar-rtl.test.tsx", // ported: components/odontogram-shell/ported/ui-ar-rtl.spec.ts
  "ui1-dynamic-scale.test.ts", // ported: components/perio-chart/ported/ui1-dynamic-scale.spec.ts
  "ui1-perio-sidebar.test.tsx", // ported: components/perio-sidebar/ported/ui1-perio-sidebar.spec.ts (standalone parts, Task 2) + components/odontogram-shell/ported/ui1-perio-sidebar.spec.ts (App view-gate, Task 5 — corrected assertions, see that file's header staleness note)
  "ui1-row-labels.test.ts", // ported: components/perio-chart/ported/ui1-row-labels.spec.ts
  "ui1-sidebar-style.test.tsx", // ported: components/perio-sidebar/ported/ui1-sidebar-style.spec.ts (Task 2; annotation was left stale until Task 6)
  "ui2-index-names.test.ts", // ported: components/perio-chart/ported/ui2-index-names.spec.ts (mounts both PerioChartComponent and PerioSidebarComponent)
  "ui2-perio-settings.test.tsx", // ported: components/settings-modal/ported/ui2-perio-settings.spec.ts
  "ui2-row-visibility.test.ts", // ported: components/perio-chart/ported/ui2-row-visibility.spec.ts
  "ui3a-central-band.test.ts", // ported: components/perio-chart/ported/ui3a-central-band.spec.ts (its "band-orientation legend" describe carries a corrected-vs-frozen-corpus staleness note in the spec's header — see that file)
  "ui3a-diamond-tiles.test.ts", // ported: components/perio-chart/ported/ui3a-diamond-tiles.spec.ts
  "ui3b-export-options-modal.test.ts", // covered-by: components/export-options-modal/export-options-modal.component.spec.ts (Task 6 adjudication: assertion-inventory diff found 4 uncovered cases — Escape/backdrop-close, Cancel-without-export, and export-with-perio-data-present-un-forced — ported into that spec as tests (e)-(h); the rest was already subsumed by tests (a)/(b)/(d))
  "ui3b-mpi-implant-gate.test.ts", // ported: components/perio-chart/ported/ui3b-mpi-implant-gate.spec.ts
  "warnings.test.ts", // ported: components/odontogram-shell/ported/warnings.spec.ts
];

const TESTS = "projects/angular-advanced-odontogram/src/lib/core/__tests__";

export default defineConfig({
  // Phase 11 resync: upstream's `fhir/codeSystemResource.ts`/`valueSetResources.ts`
  // read the Vite build-time global `__APP_VERSION__` as a DEFAULT PARAMETER value
  // (evaluated unconditionally on every call, unlike the PDF-footer's existing
  // ternary-gated read of the same global) — `buildFhirBundle()` now always embeds
  // the odontogram CodeSystem, so every FHIR-export test hits it. Upstream gets
  // this from its own Vite `define`, which Vitest (built on Vite) also applies;
  // ng-packagr has no such step, so the SHIPPED library instead sets the global
  // explicitly (`projects/angular-advanced-odontogram/src/lib/app-version.ts`,
  // imported once from `public-api.ts`) — but the corpus test harness here runs
  // core files directly, never through that shim.
  //
  // The value here is "2.6.0" — the PINNED ENGINE version this resync adopts
  // (matches the CodeSystem.version baked into the adopted upstream goldens,
  // e.g. `__tests__/parity/fhir-golden.json`) — NOT this package's own
  // package.json/app-version.ts version, which stays 2.4.1 until Task 7's
  // version cut. The two are independent: this define only has to make the
  // corpus's FHIR-export goldens (captured against the pinned engine) match;
  // it does not change anything the built library ships.
  define: { __APP_VERSION__: JSON.stringify("2.6.0") },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [`./${TESTS}/setup.ts`],
    include: [
      "projects/angular-advanced-odontogram/src/lib/core/**/__tests__/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      ...REACT_DEPENDENT.map((f) => `${TESTS}/${f}`),
    ],
  },
});
