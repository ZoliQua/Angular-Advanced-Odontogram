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
// Task 6 (Phase 2) ported the shell-scoped subset to running Angular specs
// under projects/.../components/odontogram-shell/ported/*.spec.ts (executed
// by `npm run test:ng`); the remainder stays excluded pending Phase 3
// (Settings/ExportOptions modal) or Phase 4 (PerioChart/PerioSidebar).
// Every entry below is annotated with its disposition.
const REACT_DEPENDENT = [
  "App.test.tsx", // ported: components/odontogram-shell/ported/App.spec.ts (settings/numbering-modal subset stays phase-3, noted in that spec's header)
  "ds1-confirm-revert.test.tsx", // ported: components/odontogram-shell/ported/ds1-confirm-revert.spec.ts
  "ds1-confirm.test.ts", // ported: components/odontogram-shell/ported/ds1-confirm.spec.ts (its <DualStateConfirm> component block was already ported earlier as dual-state-confirm.component.spec.ts)
  "p4a-case-meta.test.ts", // ported: components/odontogram-shell/ported/p4a-case-meta.spec.ts
  "p4a-case-panel.test.ts", // phase-4 (PerioChart-adjacent case panel markup)
  "p4b-classification-ui.test.ts", // phase-4 (renders <App/> together with PerioChart classification UI)
  "perio-graphic-rows.test.ts", // phase-4 (PerioChart markup)
  "perio-graphical-presentation.test.ts", // phase-4 (mounts <App, PerioChart> together)
  "perio-p1-core.test.ts", // phase-4 (perio-chart feature area)
  "perio-p1-ui.test.ts", // phase-4 (PerioChart markup)
  "perio-p2-grid.test.ts", // phase-4 (PerioChart markup)
  "perio-p2-keyboard.test.ts", // phase-4 (PerioChart markup)
  "perio-p2-overlay.test.ts", // phase-4 (PerioChart markup)
  "perio-p2b-rows.test.ts", // phase-4 (PerioChart markup)
  "perio-polish-diff.test.ts", // phase-4 (perio-chart feature area)
  "pgb-info-buttons.test.ts", // phase-4 (PerioChart markup)
  "pgb-mm-overlays.test.ts", // phase-4 (PerioChart markup)
  "pgb-switcher.test.ts", // phase-4 (PerioChart markup)
  "pgc-cairo.test.ts", // phase-4 (PerioChart markup)
  "pgc-rows.test.ts", // phase-4 (PerioChart markup)
  "pgd-rows.test.ts", // phase-4 (PerioChart markup)
  "pgd-summary.test.ts", // phase-4 (perio-chart feature area)
  "pge-rows.test.ts", // phase-4 (PerioChart markup)
  "pge-summary.test.ts", // phase-4 (perio-chart feature area)
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
  "ui1-dynamic-scale.test.ts", // phase-4 (PerioChart markup)
  "ui1-perio-sidebar.test.tsx", // phase-4 (PerioSidebar markup)
  "ui1-row-labels.test.ts", // phase-4 (PerioChart markup)
  "ui1-sidebar-style.test.tsx", // phase-4 (PerioSidebar markup)
  "ui2-index-names.test.ts", // phase-4 (PerioChart + PerioSidebar markup)
  "ui2-perio-settings.test.tsx", // ported: components/settings-modal/ported/ui2-perio-settings.spec.ts
  "ui2-row-visibility.test.ts", // phase-4 (PerioChart markup)
  "ui3a-central-band.test.ts", // phase-4 (PerioChart markup)
  "ui3a-diamond-tiles.test.ts", // phase-4 (PerioChart markup)
  "ui3b-build-perio-svg.test.ts", // phase-4 (perio-chart feature area)
  "ui3b-export-options-modal.test.ts", // phase-4 (ExportOptionsModal's perio SVG/PNG/JPG export controls — UI3 perio-graphical-presentation family)
  "ui3b-mpi-implant-gate.test.ts", // phase-4 (PerioChart markup)
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
