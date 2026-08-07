# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning: [SemVer](https://semver.org/).

## [Unreleased]

### Added
- Angular 21 workspace: `angular-advanced-odontogram` library + `demo` app.
- Framework-free engine core copied verbatim from react-advanced-odontogram
  v2.2.0 (payload 2.19); sole change: generated SVG asset modules replace
  Vite `?raw` imports.
- Vitest suite: the source repo's non-React tests incl. SVG-fingerprint,
  FHIR-golden and roundtrip-golden parity fixtures.
- Tailwind 3 pipeline; ng-packagr ships the built styles.css with the package.
- `OdontogramShellComponent` (`aao-odontogram-shell`, standalone): the full
  React `App.tsx` shell ported to Angular — topbar (language/theme/export/
  import menus), tooth-info/status/ortho/caries/filling/root-periodontium
  panel cards, summary card, and view-bar. PerioChart/PerioSidebar are
  deferred to Phase 4.
- `I18nService`: an injectable facade over the engine's existing i18n
  pub/sub bus (`core/i18n/useI18n`), for Angular consumers.
- `DualStateConfirmComponent`: the plan/status dual-edit confirmation dialog,
  wired to the engine's real `isDualStateConfirmPending`/`acceptDualStateConfirm`/
  `cancelDualStateConfirm` seam. Originally scoped to Phase 3 in the design
  spec; pulled forward into Phase 2 because the shell's topbar/panel wiring
  depends on it directly.
- Angular `TestBed`-under-Vitest infrastructure (`ng test`, ngtsc-compiled)
  for specs that need signal `input()`/`output()` support, alongside the
  existing framework-free `test:corpus` suite.
- 35 shell-scoped specs ported from the source repo's React/Testing-Library
  corpus to Angular `TestBed` specs under
  `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/ported/`.
- `demo` app: renders `<aao-odontogram-shell [enableNotes]="true" />`
  full-page, consuming the library through the workspace path alias.
- `SettingsModalComponent` (`aao-settings-modal`): the app's Settings dialog,
  7 declaratively-registered tabs (general/panels/toothDetails/caries/pulpa/
  notes/periodontal) driving every live setting the app exposes, with the
  `SETTINGS_TABS` registry + `SettingsState` view-model exported for
  consumers; the `role="tablist"` tab strip implements the APG tabs pattern
  (roving tabindex, Arrow Left/Right/Up/Down wrap, Home/End,
  activation-follows-focus). Wired into `OdontogramShellComponent` via a
  `settingsState` computed.
- `ExportOptionsModalComponent` (`aao-export-options-modal`): the PDF/image
  export options dialog, driven by a DI-injected `EXPORT_PDF_FN` token so
  hosts can substitute the PDF export implementation (and tests can spy on
  it without `vi.mock`).
- Shared dialog-focus-trap helpers (`components/shared/dialog-focus.ts`):
  `trapTabKey`/`focusFirst`/`nextDialogTitleId`, extracted from
  `DualStateConfirmComponent`'s inline focus-trap logic and reused by
  `SettingsModalComponent`/`ExportOptionsModalComponent`.
- `I18nService`: fixed a listener leak — the `onI18nChange` subscription is
  now unsubscribed via `DestroyRef.onDestroy`, instead of living for the
  lifetime of the module.
- 4 more tests ported from the source repo's React/Testing-Library corpus to
  Angular `TestBed` specs, under
  `projects/angular-advanced-odontogram/src/lib/components/settings-modal/ported/`:
  `sp13-settings-tab`, `settings-modal-a11y`, `ui2-perio-settings`,
  `sp15-settings`.
- `PerioSidebarComponent` (`aao-perio-sidebar`): the periodontal-view side
  panel — case-meta summary, classification badges, and the summary card —
  ported from `PerioSidebar.tsx` (not "App.tsx's PerioSidebar mount").
- Framework-free periodontal-grid DOM builders
  (`components/perio-chart/perio-grid-dom.ts`): the framework-free, imperative DOM
  construction for the periodontal full-grid (rows, band labels, overlays),
  ported as machine-verified near-verbatim transcription from the live `$ENGINE/src/PerioChart.tsx`.
- `PerioChartComponent` (`aao-perio-chart`): the periodontal chart itself —
  grid rendering, keyboard navigation, mm/overlay switching — mounted in all
  three of the app's housings: the toggle-mode inline panel
  (`.dental-chart-column`, `#perioInlinePanel`), the popup overlay
  (`#perioOverlay`), and `OdontogramShellComponent`'s `PerioSidebarComponent`
  pairing, wired to the real `closePerioOverlay()`/`openPerioOverlay()`
  engine seam.
- 5 framework-free perio tests re-enabled in the `test:corpus` suite
  (`perio-p1-core`, `perio-polish-diff`, `pgd-summary`, `pge-summary`,
  `ui3b-build-perio-svg`), previously excluded pending the Phase-4 port.
- 26 more tests ported from the source repo's React/Testing-Library corpus to
  Angular `TestBed` specs: 2 under
  `components/perio-sidebar/ported/` (`ui1-perio-sidebar`,
  `ui1-sidebar-style`); 3 under `components/perio-chart/ported/`
  (`perio-graphic-rows`, `perio-p2-grid`, `perio-p2-keyboard`); 6 under
  `components/odontogram-shell/ported/` covering the App-level perio
  integration (`perio-graphical-presentation`, `perio-p2-overlay`,
  `p4a-case-panel`, `p4b-classification-ui`, `perio-p1-ui`, plus the
  App-view-gate cases of `ui1-perio-sidebar`); and 15 more under
  `components/perio-chart/ported/` covering the remaining PerioChart-direct
  behavior (`perio-p2b-rows`, `pgb-info-buttons`, `pgb-mm-overlays`,
  `pgb-switcher`, `pgc-cairo`, `pgc-rows`, `pgd-rows`, `pge-rows`,
  `ui1-dynamic-scale`, `ui1-row-labels`, `ui2-index-names`,
  `ui2-row-visibility`, `ui3a-central-band`, `ui3a-diamond-tiles`,
  `ui3b-mpi-implant-gate`).
- `ExportOptionsModalComponent` coverage additions: 4 new test cases
  (Cancel-closes-without-export, Escape-closes, backdrop-click-closes, and
  `exportPdf` called with all 4 perio options `true` when perio data is
  present) closing the gaps found while adjudicating
  `ui3b-export-options-modal.test.ts` against the existing spec.
