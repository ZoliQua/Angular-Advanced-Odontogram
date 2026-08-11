# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning: [SemVer](https://semver.org/).

## [Unreleased]

## [1.1.0] - 2026-08-11

Resync to `react-advanced-odontogram` v2.4.0 (payload version 2.20, superseding
the originally-scheduled v2.2.1 target — the source repo moved further before
this resync landed). Engine core + test corpus re-copied from upstream commit
`f9b45fc`; the five sanctioned core deviations (verbatim SVG-asset-import swap,
parity-capture path re-anchoring, the framework-free `useI18n` bus stripped of
its React hook, and the two branding edits below) were re-applied fresh. See
`docs/superpowers/specs/1.1.0-acceptance.md` for the acceptance evidence.

### Added
- Opt-in **localStorage persistence** API (`enablePersistence`,
  `disablePersistence`, `clearPersistedState`, `isPersistenceEnabled`,
  `PersistenceOptions`) exported from the public API; host-opt-in, off by
  default and not wired into the shell — same as upstream.
- Configurable **PDF report settings**: a new "export" Settings tab (23
  fields) covering odontogram section layout (bone/pulp visibility, tooth
  spacing/border/number size, text/table inclusion, summary grouping),
  periodontal section layout (tooth spacing, empty-row handling, label
  placement, font size, table/abbreviation inclusion), and footer options
  (disclaimer text, generator stamp), plus patient defaultName/defaultDob/
  showAge/dateFormat/colorTheme.
- **Multilingual PDF fonts**: dynamic-imported Arabic (with its own text
  shaper) and CJK (Noto SC) font modules alongside the existing Roboto
  Latin font, loaded on demand by `exportPdf()` based on report language —
  keeps the main bundle from carrying font payloads it doesn't need.
- **Individual per-tooth notes** now included in PDF/print exports and the
  tooth-info card's grouped dentition table (replacing the old flat
  permanent/missing-teeth paragraph lists).
- **Collapsible panel cards** (`collapsedCards` engine state, `ui4-collapsed-cards`
  corpus coverage) for the odontogram panel UI.
- **Availability controls**: per-feature toggles (Settings' new "general" tab
  and elsewhere) gating export format (PNG/JPG/SVG/PDF) and import format
  (JSON/FHIR) menu entries, Plan-mode availability (auto-reverts an active
  plan-mode chart to status when disabled), and periodontal-chart
  availability (auto-closes the perio overlay when disabled).
- A new **"fillings" Settings tab**: filling-defect enable, filling
  complexity, per-material availability (amalgam/composite/gic/temporary via
  `FILLING_MATERIAL_KEYS`), and fissure-sealing enable.
- Screen-display controls (tooth spacing, tooth-number size) and selection
  appearance controls (selection color, selection border style), reflected
  live on `#toothGrid` via data attributes and `--odon-select-*` CSS custom
  properties.
- Patient `patientDob`/`setPatientDob` (payload 2.20) threaded through case
  metadata, the PerioSidebar case-meta card, and the export/PDF-settings
  forms.
- `ExportOptionsModalComponent`: the single "odontogram" export checkbox
  split into `odontogramChart`/`odontogramDescription`/`individualNotes`,
  matching the upstream payload-2.20 export shape.
- 11 new corpus test files re-enabled under `test:corpus`
  (`icdas-fhir`, `import-status-replaces-state`, `iso3950-fhir`,
  `pdf-settings`, `persistence`, `plugin-sanitize`, `round2-arabic-shaper`,
  `round2-pdf-font-loader`, `round2-pdf-font`, `round2-perio-glossary`,
  `ui4-collapsed-cards`) plus dozens of ported/updated Angular `TestBed`
  specs across the shell, settings-modal, and export-options-modal
  components.
- `docs/superpowers/specs/1.1.0-acceptance.md`: the 1.1.0 acceptance
  evidence sheet, same discipline as 1.0.0's.

### Changed
- **Branding (sanctioned deviation, extended):** the PDF report footer's
  "generated with" stamp and repo link now read "Angular Advanced
  Odontogram" / `github.com/ZoliQua/Angular-Advanced-Odontogram` (extends
  the existing `app.title` branding deviation to the PDF export path;
  `odontogram.ts`'s core provenance header comment is untouched). Five
  sanctioned core deviations are now re-applied on every resync, up from
  three at 1.0.0.
- JSON/FHIR export payload version stamp bumped `2.19` → `2.20` across all
  export surfaces.
- FHIR, roundtrip, and SVG-fingerprint parity goldens regenerated upstream
  at v2.4.0 and re-copied verbatim; the Angular render continues to
  fingerprint byte-identically against them (see the corpus parity-test
  evidence in `1.1.0-acceptance.md`).

### Visual change
- **Lower-arch bridge saddle position**: upstream re-anchored
  `SADDLE_Y_FRACTION_LOWER` from a recon-measured `0.19` back to the true
  geometric mirror of the upper fraction (`1 - SADDLE_Y_FRACTION` ≈ `0.28`).
  This moves the lower-arch bridge-saddle bar's rendered vertical position
  and is upstream's own re-anchoring decision, not a defect introduced by
  this port.

### Known drift
- `$ENGINE` (the upstream source checkout this port reads from) continued
  advancing past the `f9b45fc` pin during this resync's execution window; a
  further resync will be due in a future release.

---

## [1.0.0] - 2026-08-08

Full feature parity with `react-advanced-odontogram` v2.2.0 (payload version
2.19): odontogram editor, dual-state Status/Plan charts, periodontal chart,
Settings, JSON/FHIR R4/SVG/PNG/JPG/PDF export-import, 12 UI languages incl.
RTL Arabic. See `docs/superpowers/specs/1.0.0-acceptance.md` for the
acceptance evidence.

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
- npm packaging: `dist/` ships a package-scoped README + LICENSE (via
  `ng-package.json` `assets`), `build:demo` script, and a trimmed root
  `package.json` (dropped the workspace-only `packageManager` pin).
- typedoc API docs pipeline (`npm run docs`, `typedoc.json`) generating
  reference docs to `docs/api/` from the core + public API, mirroring the
  source repo's docs tooling.
- Full root `README.md` (overview, parity statement, install, usage —
  `<aao-odontogram-shell>` full inputs/outputs table, `PerioChartComponent`
  standalone usage, imperative API, testing override points
  `ODONTOGRAM_ENGINE_LIFECYCLE`/`EXPORT_PDF_FN`, dual-runner dev workflow,
  credits/license) and its Hungarian translation (`lang/README-hu.md`); the
  remaining 10 language translations are deferred to a follow-up round.
- `docs/superpowers/specs/1.0.0-acceptance.md`: the 1.0.0 acceptance
  evidence sheet mapping every spec-§7 criterion to its run evidence.

### Known drift
- Pinned to upstream `react-advanced-odontogram` v2.2.0 (payload 2.19). The
  upstream v2.2.1 resync (payload 2.20 — patientDob + setPatientDob,
  individual notes, PDF-dialog DOB/split options, Plan-mode gating, bridge
  lower-arch) is deferred to 1.1.0.

---

[Unreleased]: https://github.com/ZoliQua/Angular-Advanced-Odontogram/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/ZoliQua/Angular-Advanced-Odontogram/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ZoliQua/Angular-Advanced-Odontogram/releases/tag/v1.0.0
