/*
 * Public API Surface of angular-advanced-odontogram
 * Phase 1: the framework-free engine core (imperative API + types).
 * Phase 2 adds OdontogramShellComponent; Phase 4 adds PerioChartComponent.
 */
// Side-effect only: defines the `__APP_VERSION__` global core/odontogram.ts's
// PDF footer reads (Vite `define` in the upstream engine; no ng-packagr
// equivalent — see that file's header comment).
import "./lib/app-version";

export * from "./lib/core/odontogram";
export * from "./lib/core/persistence";
export * from "./lib/core/theme";
export * from "./lib/core/plugin";
export * from "./lib/core/tour";
export * from "./lib/core/perioClassification";
export * from "./lib/core/utils/numbering";
export type * from "./lib/core/fhir/types";
export * from "./lib/core/i18n/translations";
export * from "./lib/i18n/i18n.service";
export * from "./lib/components/dual-state-confirm/dual-state-confirm.component";
export * from "./lib/components/settings-modal/settings-modal.component";
export * from "./lib/components/export-options-modal/export-options-modal.component";
export * from "./lib/components/odontogram-shell/odontogram-shell.component";
export * from "./lib/components/perio-sidebar/perio-sidebar.component";
export * from "./lib/components/perio-chart/perio-chart.component";
