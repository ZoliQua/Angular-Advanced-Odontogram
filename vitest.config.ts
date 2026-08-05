import { defineConfig } from "vitest/config";

// React-dependent tests from the source repo, excluded until the Angular
// shell components land (Phases 2-4 re-enable them with an Angular mount
// helper). Generated in the source repo via:
//   grep -l -E "from [\"']react[\"']|@testing-library/react|from [\"']\.\./App[\"']|useI18n" *.ts *.tsx
// The grep was filename/keyword-based; useI18n.test.ts was a false positive
// (it only tests the framework-free i18n bus) and has been removed.
const REACT_DEPENDENT = [
  "App.test.tsx", "ds1-confirm-revert.test.tsx", "ds1-confirm.test.ts",
  "p4a-case-meta.test.ts", "p4a-case-panel.test.ts", "p4b-classification-ui.test.ts",
  "perio-graphic-rows.test.ts", "perio-graphical-presentation.test.ts",
  "perio-p1-core.test.ts", "perio-p1-ui.test.ts", "perio-p2-grid.test.ts",
  "perio-p2-keyboard.test.ts", "perio-p2-overlay.test.ts", "perio-p2b-rows.test.ts",
  "perio-polish-diff.test.ts", "pgb-info-buttons.test.ts", "pgb-mm-overlays.test.ts",
  "pgb-switcher.test.ts", "pgc-cairo.test.ts", "pgc-rows.test.ts",
  "pgd-rows.test.ts", "pgd-summary.test.ts", "pge-rows.test.ts", "pge-summary.test.ts",
  "public-api-exports.test.ts", "r2a-toggle-ui.test.ts", "r2b-changes-box.test.ts",
  "r2b-plan-diff.test.ts", "r2c-proposed-legend.test.ts", "restoration-summary.test.ts",
  "secondary-caries-parity.test.ts", "settings-modal-a11y.test.tsx",
  "sp10-filling-defect-summary.test.ts", "sp10-filling-defect.test.ts",
  "sp11-wear-summary.test.ts", "sp11-wear-ui.test.ts",
  "sp12-discoloration-summary.test.ts", "sp12-discoloration-ui.test.ts",
  "sp12-discoloration.test.ts", "sp13-settings-tab.test.ts", "sp13-wear-layout.test.ts",
  "sp14-ortho-summary.test.ts", "sp14-ortho-ui.test.ts", "sp14-orthodontics.test.ts",
  "sp15-filling-defect-summary.test.ts", "sp15-settings.test.ts",
  "sp15-stale-render.test.ts", "sp16-fillings-card.test.ts", "sp17-followups.test.ts",
  "sp18-periimplant-roundtrip.test.ts", "sp6-task2-caries-popup.test.ts",
  "sp6-task4-subcaries-summary-incisal.test.ts", "sp7-card-merge.test.ts",
  "sp8-peri-implant-ui.test.ts", "sp9-summary-tooltip.test.ts", "summary.test.ts",
  "ui-ar-rtl.test.tsx", "ui1-dynamic-scale.test.ts", "ui1-perio-sidebar.test.tsx",
  "ui1-row-labels.test.ts", "ui1-sidebar-style.test.tsx", "ui2-index-names.test.ts",
  "ui2-perio-settings.test.tsx", "ui2-row-visibility.test.ts",
  "ui3a-central-band.test.ts", "ui3a-diamond-tiles.test.ts",
  "ui3b-build-perio-svg.test.ts", "ui3b-export-options-modal.test.ts",
  "ui3b-mpi-implant-gate.test.ts", "warnings.test.ts",
];

const TESTS = "projects/angular-advanced-odontogram/src/lib/core/__tests__";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [
      `./${TESTS}/setup.ts`,
      "./projects/angular-advanced-odontogram/src/lib/testing/angular-test-setup.ts",
    ],
    include: [
      "projects/angular-advanced-odontogram/src/lib/core/**/__tests__/**/*.{test,spec}.{ts,tsx}",
      "projects/angular-advanced-odontogram/src/lib/**/*.spec.ts",
    ],
    exclude: [
      "**/node_modules/**",
      ...REACT_DEPENDENT.map((f) => `${TESTS}/${f}`),
    ],
  },
});
