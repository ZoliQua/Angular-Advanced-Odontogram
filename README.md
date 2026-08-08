# Angular Advanced Odontogram

*English | [Magyar](lang/README-hu.md)*

Angular port of [react-advanced-odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)
— an interactive, SVG-based dental odontogram (dental chart) editor: multi-surface
caries/filling charting, endodontic/prosthetic/periodontal states, FDI/Universal/Palmer
numbering, a full periodontal (perio) chart, HL7 FHIR R4 export/import, and ICDAS scoring.

**Parity:** Feature parity with react-advanced-odontogram v2.2.0 (payload version 2.19).
JSON and FHIR R4 exports round-trip with the React module. The upstream v2.2.1 additions
are planned for 1.1.0.

## Status

- [x] Phase 1 — engine core (framework-free) + test corpus green
- [x] Phase 2 — `OdontogramShellComponent` (topbar/menus/summary/confirm) + demo app
- [x] Phase 3 — Settings & dialogs
- [x] Phase 4 — Periodontal chart & exports
- [x] Phase 5 — docs, packaging, 1.0.0

## Installation

```bash
npm install angular-advanced-odontogram
```

Build the library styles before building/serving anything that consumes the
component (the demo app does this — see `projects/demo`):

    npm run build:styles && npx ng build angular-advanced-odontogram

`npm run build:styles` must run first — it emits
`projects/angular-advanced-odontogram/styles.css` from the Tailwind source,
which the demo's `angular.json` `styles` array references directly (the
source-side artifact, not `dist/`). Once installed from npm, import the
built stylesheet instead:

```css
@import 'angular-advanced-odontogram/styles.css';
```

## Usage

### `<aao-odontogram-shell>`

The full app shell — topbar, dental chart, controls panel, periodontal chart,
settings/export/import dialogs.

```typescript
import { Component } from '@angular/core';
import { OdontogramShellComponent } from 'angular-advanced-odontogram';

@Component({
  selector: 'app-root',
  imports: [OdontogramShellComponent],
  template: `<aao-odontogram-shell [enableNotes]="true" />`,
})
export class AppComponent {}
```

All 18 inputs are optional signal `input()`s; every one falls back to a
built-in default when left unbound, mirroring the original React component's
uncontrolled defaults.

| Input | Type | Default |
| --- | --- | --- |
| `language` | `Language` (`"hu" \| "en" \| "de" \| "es" \| "it" \| "sk" \| "pl" \| "ru" \| "pt-br" \| "zh" \| "ar" \| "fr"`) | uncontrolled — starts at `"en"`, tracks the topbar/Settings language picker |
| `numberingSystem` | `NumberingSystem` (`"FDI" \| "UNIVERSAL" \| "PALMER"`) | `"FDI"` (uncontrolled) |
| `darkMode` | `boolean` | uncontrolled — starts `false` unless the host document already has a `dark` class on `<html>` |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` (built-in color palette) |
| `plugins` | `OdontogramPlugin[]` | `[]` |
| `readOnly` | `boolean` | `false` |
| `enableNotes` | `boolean` | `false` |
| `enableIcdas` | `boolean` | `false` |
| `pulpDetailLevel` | `PulpDetailLevel` (`"simple" \| "aae" \| "latin"`) | `"aae"` |
| `secondaryCariesMode` | `SecondaryCariesMode` (`"simple" \| "standard" \| "full"`) | `"standard"` |
| `rootCariesMode` | `RootCariesMode` (`"simple" \| "severity"`) | `"simple"` |
| `radiographicDepthMode` | `RadiographicDepthMode` (`"off" \| "threeLevel" \| "detailed"`) | `"off"` |
| `cariesDepthEnabled` | `boolean` | `true` |
| `wearDetailLevel` | `ToothDetailLevel` (`"simple" \| "complex"`) | `"complex"` |
| `discolorationDetailLevel` | `ToothDetailLevel` (`"simple" \| "complex"`) | `"complex"` |
| `surfaceNotation` | `SurfaceNotation` (`"simple" \| "full"`) | `"full"` |
| `showStatusCard` | `boolean` | `true` |
| `showOrthoCard` | `boolean` | `true` |

| Output | Payload | Emitted |
| --- | --- | --- |
| `languageChange` | `Language` | on every language change, controlled or uncontrolled |
| `numberingChange` | `NumberingSystem` | on every numbering-system change, controlled or uncontrolled |
| `darkModeChange` | `boolean` | on every dark-mode toggle, controlled or uncontrolled |

`themeConfig`/`plugins` shapes and every other type above are documented in
full via typedoc — see [API docs](#api-docs) below.

### `PerioChartComponent` standalone

The periodontal chart can also be mounted on its own, outside the shell —
either inline (embedded in the page) or as a controlled popup:

```typescript
import { PerioChartComponent } from 'angular-advanced-odontogram';

@Component({
  imports: [PerioChartComponent],
  // inline, always mounted:
  template: `<aao-perio-chart [inline]="true" />`,
  // — or — a controlled popup:
  // template: `<aao-perio-chart [open]="isOpen" (closeChart)="isOpen = false" />`,
})
export class MyComponent {}
```

- `open: boolean` (default `false`) — shows the chart as a modal overlay.
- `inline: boolean` (default `false`) — renders the chart in place instead of a popup.
- `(closeChart)` — emitted when the popup is dismissed (Escape, backdrop click, or the close button).

### Imperative API

The engine underneath both components is framework-free and fully exported
from `angular-advanced-odontogram`. The main groups:

- **Export / import** — `exportStatus()`, `exportFhir(options?)`, `exportSvg()`,
  `exportImage(format)`, `exportPerioImage(format)`, `exportPdf(options)`
  (also injectable via the `EXPORT_PDF_FN` token — see Testing below),
  `importStatus(data)`, `importFhirBundle(input)`, `setImportFormat(format)`.
- **Chart mode** — `getChartMode()` / `setChartMode(mode)` (status vs. plan).
- **Perio API** — `getPerioChart()`, `getToothPerio(toothNo)`,
  `setPerioSite(toothNo, site, patch)`, `getPerioSummary()`,
  `hasAnyPerioData()`, `getPerioClassification()`,
  `getPerioViewMode()` / `setPerioViewMode(mode)`,
  `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()`,
  `getPerioRowVisibility()` / `setPerioRowVisibility(id, visible)`,
  `getPerioIndexNameMode()` / `setPerioIndexNameMode(mode)`,
  `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)`.

Every other exported function, type, and component (settings/state getters
and setters, the full `OdontogramSummary` shape, etc.) is covered in the
generated API docs.

<a id="api-docs"></a>

    npm run docs         # generate API docs to docs/api/

### Testing

Two DI tokens exist specifically so host apps (and this library's own specs)
can swap out side-effecting engine seams in `TestBed`, without module mocking:

- `ODONTOGRAM_ENGINE_LIFECYCLE` — the `init()`/`destroy()` pair
  `OdontogramShellComponent` calls on mount/unmount.
- `EXPORT_PDF_FN` — the function `ExportOptionsModalComponent` calls for the
  PDF export (real `exportPdf()` does jsPDF/canvas work that doesn't run
  under jsdom).

```typescript
TestBed.configureTestingModule({
  imports: [OdontogramShellComponent],
  providers: [
    { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: { init: initSpy, destroy: destroySpy } },
  ],
});
```

## Development

    npm install
    npm run gen:assets   # regenerate SVG asset modules after editing an SVG
    npm test             # test:corpus (Vitest core suite, incl. golden parity fixtures) + test:ng (Angular specs, ngtsc-compiled via `ng test`)
    npm run test:corpus  # plain Vitest — the framework-free engine + copied React-derived corpus only
    npm run test:ng      # Angular component/service *.spec.ts files, via `ng test` (needed for signal input()/output() support)
    npm run build:styles && npx ng build angular-advanced-odontogram
    npm run docs         # generate API docs to docs/api/

`npm test` runs both runners because they cover different things: `test:corpus`
is a plain Vitest run over the framework-free engine and the React-derived
golden/parity fixtures (no Angular compilation involved), while `test:ng`
runs through `ng test` so ngtsc can compile the signal `input()`/`output()`
component specs — a plain Vitest run can't process those on its own.

Design spec: `docs/superpowers/specs/2026-08-06-angular-odontogram-port-design.md`.

## Credits & License

Angular port of [react-advanced-odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)
by Zoltán Dul ([@ZoliQua](https://github.com/ZoliQua)).

[MIT](LICENSE) © 2026 Zoltán Dul
