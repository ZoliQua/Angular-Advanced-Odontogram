<p align="center">
  <img src="https://raw.githubusercontent.com/ZoliQua/Angular-Advanced-Odontogram/main/docs/angular-module-logo.png" alt="Angular Advanced Odontogram logo" width="160" />
</p>

# 🦷 Angular Advanced Odontogram

[![npm](https://img.shields.io/npm/v/angular-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/angular-advanced-odontogram)
[![Version](https://img.shields.io/badge/version-1.1.0-green?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/releases)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/LICENSE)

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**📖 Documentation per language:** 🇬🇧 English (this file) · 🇭🇺 [Magyar](lang/README-hu.md)

An interactive, SVG-based **dental odontogram (dental chart) editor** for **Angular + TypeScript** — with a full **periodontal charting module**, multi-surface caries/restorations, endodontic/prosthetic states, FDI/Universal/Palmer numbering, **HL7 FHIR R4** export/import, optional ICDAS scoring, and a 12-language UI.

> **This is the official Angular port of [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)** (npm: `react-advanced-odontogram`). Feature parity with react-advanced-odontogram main @ `934a911` (post-v2.4.0) (payload version 2.20) — JSON and FHIR R4 exports round-trip between the two libraries. The clinical engine is shared, verbatim (five narrow, documented deviations only — see the port design spec); only the component shell is Angular-native.

🔗 **Live demo:** https://angular-advanced-odontogram.vercel.app/ \
⚛️ **Original React project:** https://github.com/ZoliQua/React-Odontogram-Modul

![Odontogram editor preview](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_en_odontogram.png)
*Screenshot from the original React project — the Angular port renders the identical UI.*

---

## 📑 Contents

- [📦 Installation](#-installation)
- [🚀 Quick start](#-quick-start)
- [🦷 Periodontal charting](#-periodontal-charting)
- [✨ Highlights](#-highlights)
- [📖 Documentation](#-documentation)
- [🛠️ Development](#-development)
- [📄 License & citation](#-license--citation)
- [🙌 Credits](#-credits)

## 📦 Installation

```bash
npm install angular-advanced-odontogram
```

**Requirements:** Angular **21.2+** (peer dependency); a bundler that supports the `exports` field and ESM (the Angular CLI qualifies out of the box). The package is **ESM-only**.

## 🚀 Quick start

Render `OdontogramShellComponent` and register the stylesheet **once** (e.g. in `angular.json`):

```json
"styles": [
  "node_modules/angular-advanced-odontogram/styles.css",
  "src/styles.css"
]
```

```ts
import { Component } from "@angular/core";
import { OdontogramShellComponent } from "angular-advanced-odontogram";

@Component({
  selector: "app-chart",
  imports: [OdontogramShellComponent],
  template: `<aao-odontogram-shell language="en" numberingSystem="FDI" [darkMode]="false" />`,
})
export class ChartComponent {}
```

The imperative state API, the standalone `PerioChartComponent`, the guided tour, and all public types are named exports from the same entry point:

```ts
import {
  OdontogramShellComponent,
  PerioChartComponent,          // standalone periodontal chart
  getOdontogramSummary,
  exportStatus, importStatus,   // JSON state serialization / hydration
  exportFhir, exportSvg, exportImage,
  setReadOnly, startIntroTour,
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,  // opt-in localStorage persistence (host-wired)
} from "angular-advanced-odontogram";
```

### 🧩 Composable surfaces (advanced)

`OdontogramShellComponent` is the supported all-in-one component and needs no extra setup. If you need to place the odontogram's regions in different areas of your own layout, the shell's four UI surfaces are also exported and can be composed under one `OdontogramUiService`, all sharing one instance-owned session:

```ts
import { AfterViewInit, Component, OnDestroy, inject } from "@angular/core";
import {
  OdontogramUiService,
  OdontogramTopbarComponent,
  OdontogramChartSurfaceComponent,
  ToothInfoSurfaceComponent,
  ToothControlsSurfaceComponent,
} from "angular-advanced-odontogram";

@Component({
  selector: "app-workspace",
  imports: [
    OdontogramTopbarComponent,
    OdontogramChartSurfaceComponent,
    ToothInfoSurfaceComponent,
    ToothControlsSurfaceComponent,
  ],
  providers: [OdontogramUiService],   // one instance = one session, scoped to this host
  template: `
    <my-header-area><aao-odontogram-topbar /></my-header-area>
    <my-main-area>
      <aao-odontogram-chart-surface />
      <aao-tooth-info-surface />
    </my-main-area>
    <my-side-panel><aao-tooth-controls-surface /></my-side-panel>
  `,
})
export class WorkspaceComponent implements AfterViewInit, OnDestroy {
  protected readonly ui = inject(OdontogramUiService);

  constructor() {
    // Every `OdontogramUiConfig` field is optional — `configure()` with no
    // arguments gives a standalone session with the same defaults
    // `OdontogramShellComponent` itself falls back to (language "en", "FDI"
    // numbering, light mode, ...). Pass only the Signals/callbacks you want
    // to override, e.g. `{ darkMode: this.darkMode, onDarkModeChange: ... }`.
    this.ui.configure();
  }

  ngAfterViewInit(): void { this.ui.init(); }
  ngOnDestroy(): void { this.ui.destroy(); }
}
```

`OdontogramUiService` takes the same configuration shape as `OdontogramShellComponent`'s inputs, every field optional with the same upstream default. Current constraint: one `OdontogramUiService` instance per page (the engine is a module-level singleton). Surfaces can be mounted and unmounted on demand. `OdontogramShellComponent` itself is unchanged — it is exactly this composition in the default arrangement, still wiring every field explicitly from its own inputs.

For even finer composition, the individual control cards are exported as well — `StatusesCardComponent`, `ToothDetailsCardComponent`, `CariesCardComponent`, `FillingsCardComponent`, `RootPeriodontiumCardComponent`, and `OrthodonticsCardComponent` (plus the shared `SurfaceCrossComponent` the caries/fillings cards use internally) — each a self-contained declarative component that reads and writes the shared session through `inject(OdontogramUiService)` and the exported `engineState()` helper (a signal-returning read of any engine getter, kept fresh via the core's own change notifications). Mount only the cards a given layout needs, in any arrangement, under one `OdontogramUiService`. `CreditsModalComponent` (the topbar's "About and credits" popup) is exported too, for hosts that want to drive it from their own open/close state.

> **SSR:** the component is client-only (reads the DOM on mount) — render it browser-side only.
> **Assets are self-contained** — tooth/icon SVGs are inlined into the bundle; there is no runtime asset fetch to configure.
> **One instance per page** in this release (engine state is a module-level singleton — same as the React original).

## 🦷 Periodontal charting

![Full-mouth periodontal chart](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_en_perio.png)
*Screenshot from the original React project — the Angular port renders the identical UI.*

Per-site probing depth, gingival margin, bleeding on probing (+ suppuration) at the six standard sites, with derived CAL, recession and whole-mouth %BOP; a graphical full-mouth perio chart (CEJ line, mm guide grid, pocket/margin curve, anatomical diamond index tiles), 2017 staging/grading, and per-site FHIR export (LOINC periodontal panel `74029-0`). Available as an `Odontogram | Periodontal Status` view toggle and as a separately-invocable `PerioChartComponent`.

## ✨ Highlights

- 🦷 Permanent / primary / implant / missing teeth; substrate, restorations (crown/inlay/onlay/veneer/bridge × materials), removable & implant prosthetics
- 🔍 Multi-surface caries & fillings (ICDAS / CARS severity, root & radiographic caries), endo & AAE pulp diagnosis, apical diagnosis, peri-implant status, wear, discoloration, orthodontics
- 🩺 Full periodontal module (see above) + 2017 classification
- 🔗 **HL7 FHIR R4** export/import; JSON export/import with migrations — round-trip compatible with [`react-advanced-odontogram`](https://github.com/ZoliQua/React-Odontogram-Modul)
- 🖼️ PNG / JPG / SVG chart export and a configurable **PDF report** (jsPDF) — per-section layout/content settings, multilingual PDF fonts (Arabic shaping, CJK), and individual per-tooth notes in exports
- 💾 Opt-in **localStorage persistence** API (host-wired, off by default) · 🗂️ collapsible panel cards · 🎛️ availability controls for export/import formats, Plan mode, and the periodontal chart
- 🦴 Selectable **tooth anatomy profile** — `classic` (default) or `measured` (nine literature-measured tooth templates in a two-arch, per-tooth-width layout), switchable at runtime from Settings → Odontogram
- 🧱 **Composable UI** — beyond the all-in-one shell, the four presentational surfaces and all seven declarative control cards are individually exported for custom host layouts (see [Composable surfaces](#-composable-surfaces-advanced) above)
- ℹ️ Built-in **About/Credits popup** (topbar) — credits the creator, the contributors, and the original React project this port is built on
- 🔢 FDI / Universal / Palmer numbering · 🌐 12 UI languages (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR, Arabic RTL) · 🎨 theming via `--odon-*` CSS variables · 🧩 plugin system · ⌨️ keyboard accessibility

## 📖 Documentation

API reference is generated with TypeDoc — run `npm run docs` (output in `docs/api/`). The shared clinical-engine API is also documented in the original project:

📚 **https://zoliqua.github.io/React-Odontogram-Modul/**

For host-app testing, two supported dependency-injection override points are exported: `ODONTOGRAM_ENGINE_LIFECYCLE` (engine init/destroy) and `EXPORT_PDF_FN` (PDF export function).

## 🛠️ Development

```bash
npm install
npm run gen:assets     # regenerate SVG asset modules after editing an SVG
npm test               # full suite: verbatim React engine corpus (plain Vitest) + Angular specs (ng test)
npm run build:styles && npx ng build angular-advanced-odontogram   # library build (styles first)
npm run build:demo     # demo app
```

## 📄 License & citation

MIT © Zoltán Dul. This library is a port of [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul); if you use it in research, please cite the original project — see its [`CITATION.cff`](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/CITATION.cff) and the [Zenodo record](https://doi.org/10.5281/zenodo.21156787).

## 🙌 Credits

Angular Advanced Odontogram is created and maintained by Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), the creator and lead developer of this port and of the underlying clinical engine. The same in-app popup (topbar → "About and credits") lists these names.

**Original project**

- [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul): the original React implementation this package is a port of — the clinical engine (dental status logic, periodontal charting, FHIR export/import, i18n strings, tour, SVG templates) is shared, verbatim.

**Contributors** (to the shared clinical engine, credited here too since their work ships in this port unchanged)

- [@odontodev](https://github.com/odontodev): state hydration and lifecycle API, fillings settings as controlled props, idempotent setters and collapsible cards
- [@JulianoBazzi](https://github.com/JulianoBazzi): Brazilian Portuguese translation
- [@yassine-bhn](https://github.com/yassine-bhn): French translation and the candidate measured anatomy
- [@saegerdirk-star](https://github.com/saegerdirk-star): measured tooth anatomy and the tooth generator, plus the composable interface proposal

**Built with** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [Angular](https://angular.dev), [Angular CLI](https://angular.dev/tools/cli), [TypeScript](https://www.typescriptlang.org) and [Tailwind CSS](https://tailwindcss.com).

Contributions are welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md). Open a pull request and you will be credited here and in the app. If this project is useful to you, please [star it on GitHub](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
