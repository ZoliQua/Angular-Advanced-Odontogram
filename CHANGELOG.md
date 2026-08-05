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
