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
// v2.6.0 resync: `core/i18n/translations.ts` is now a TEST-ONLY aggregator
// that statically imports all 12 locale tables (see its own header comment) —
// re-exporting it here (as this line did pre-resync, when translations.ts WAS
// the single runtime i18n module) would pull every UI language back into the
// main bundle for every consumer, exactly the regression the lazy `loader.ts`
// split exists to avoid. `Language`/`LANGUAGES`/`FALLBACK_LANGUAGE` are the
// framework-free, load-nothing replacement for what this line used to expose.
export type { Language } from "./lib/core/i18n/languages";
export { LANGUAGES, FALLBACK_LANGUAGE } from "./lib/core/i18n/languages";
export * from "./lib/i18n/i18n.service";
export * from "./lib/components/dual-state-confirm/dual-state-confirm.component";
export * from "./lib/components/settings-modal/settings-modal.component";
export * from "./lib/components/export-options-modal/export-options-modal.component";
export * from "./lib/components/odontogram-shell/odontogram-shell.component";
export * from "./lib/components/perio-sidebar/perio-sidebar.component";
export * from "./lib/components/perio-chart/perio-chart.component";
export * from "./lib/components/credits-modal/credits-modal.component";
// Composable UI (1.2.0 resync): the provider port, the engine-state
// subscription helper, the four presentational surfaces, and the seven
// declarative control cards — mirrors upstream App.tsx/index.ts's
// Composable-UI export list (`OdontogramProvider`/`useOdontogramUi`,
// `useEngineState`, the four surfaces, the seven cards).
export * from "./lib/components/odontogram-ui.service";
export * from "./lib/components/engine-state";
export * from "./lib/components/surfaces/odontogram-topbar.component";
export * from "./lib/components/surfaces/odontogram-chart-surface.component";
export * from "./lib/components/surfaces/tooth-info-surface.component";
export * from "./lib/components/surfaces/tooth-controls-surface.component";
export * from "./lib/components/surfaces/cards/statuses-card.component";
export * from "./lib/components/surfaces/cards/tooth-details-card.component";
export * from "./lib/components/surfaces/cards/caries-card.component";
export * from "./lib/components/surfaces/cards/fillings-card.component";
export * from "./lib/components/surfaces/cards/root-periodontium-card.component";
export * from "./lib/components/surfaces/cards/orthodontics-card.component";
export * from "./lib/components/surfaces/cards/surface-cross.component";
