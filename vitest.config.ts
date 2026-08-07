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
  "ds1-confirm-revert.test.tsx", // ported: components/odontogram-shell/ported/ds1-confirm-revert.spec.ts
  "ds1-confirm.test.ts", // ported: components/odontogram-shell/ported/ds1-confirm.spec.ts (its <DualStateConfirm> component block was already ported earlier as dual-state-confirm.component.spec.ts)
  "p4a-case-meta.test.ts", // ported: components/odontogram-shell/ported/p4a-case-meta.spec.ts
  "p4a-case-panel.test.ts", // ported: components/odontogram-shell/ported/p4a-case-panel.spec.ts
  "p4b-classification-ui.test.ts", // ported: components/odontogram-shell/ported/p4b-classification-ui.spec.ts
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
  "secondary-caries-parity.test.ts", // ported: components/odontogram-shell/ported/secondary-caries-parity.spec.ts
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
  "sp16-fillings-card.test.ts", // ported: components/odontogram-shell/ported/sp16-fillings-card.spec.ts
  "sp17-followups.test.ts", // ported: components/odontogram-shell/ported/sp17-followups.spec.ts
  "sp18-periimplant-roundtrip.test.ts", // ported: components/odontogram-shell/ported/sp18-periimplant-roundtrip.spec.ts
  "sp6-task2-caries-popup.test.ts", // ported: components/odontogram-shell/ported/sp6-task2-caries-popup.spec.ts
  "sp6-task4-subcaries-summary-incisal.test.ts", // ported: components/odontogram-shell/ported/sp6-task4-subcaries-summary-incisal.spec.ts
  "sp7-card-merge.test.ts", // ported: components/odontogram-shell/ported/sp7-card-merge.spec.ts
  "sp8-peri-implant-ui.test.ts", // ported: components/odontogram-shell/ported/sp8-peri-implant-ui.spec.ts
  "sp9-summary-tooltip.test.ts", // ported: components/odontogram-shell/ported/sp9-summary-tooltip.spec.ts
  "summary.test.ts", // ported: components/odontogram-shell/ported/summary.spec.ts
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
