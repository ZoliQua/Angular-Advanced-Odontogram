<p align="center">
  <img src="https://raw.githubusercontent.com/ZoliQua/Angular-Advanced-Odontogram/main/docs/angular-module-logo.png" alt="Angular Advanced Odontogram logo" width="160" />
</p>

# 🦷 Angular Advanced Odontogram

[![npm](https://img.shields.io/npm/v/angular-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/angular-advanced-odontogram)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

An interactive, SVG-based **dental odontogram (dental chart) editor** for **Angular + TypeScript** — with a full **periodontal charting module**, multi-surface caries/restorations, endodontic/prosthetic states, FDI/Universal/Palmer numbering, **HL7 FHIR R4** export/import, optional ICDAS scoring, and a 12-language UI.

This is the official Angular port of **[React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)**, also published on npm as **[react-advanced-odontogram](https://www.npmjs.com/package/react-advanced-odontogram)**. The clinical engine is shared, verbatim, between the two libraries — only the component shell is framework-native — so JSON and FHIR R4 exports round-trip cleanly between an Angular app using this package and a React app using the original.

🔗 **Live demo:** https://angular-advanced-odontogram.vercel.app/ \
📖 **Full documentation:** https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/lang/README-en.md (11 more languages linked from there) \
⚛️ **Original React project:** https://github.com/ZoliQua/React-Odontogram-Modul \
📦 **Original npm package:** https://www.npmjs.com/package/react-advanced-odontogram

![Odontogram editor preview](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_en_odontogram.png)
*Screenshot from the original React project — the Angular port renders the identical UI.*

## 📦 Installation

```bash
npm install angular-advanced-odontogram
```

**Requirements:** Angular **21.2+** (peer dependency); a bundler that supports the `exports` field and ESM (the Angular CLI qualifies out of the box). The package is **ESM-only**.

## 🚀 Quick start

Register the stylesheet **once** (e.g. in `angular.json`) and render `OdontogramShellComponent`:

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

## ✨ Highlights

- 🦷 Permanent / primary / implant / missing teeth; substrate, restorations (crown/inlay/onlay/veneer/bridge × materials), removable & implant prosthetics
- 🔍 Multi-surface caries & fillings (ICDAS / CARS severity, root & radiographic caries), endo & AAE pulp diagnosis, apical diagnosis, peri-implant status, wear, discoloration, orthodontics
- 🩺 Full periodontal module — per-site probing, CAL/recession/%BOP, a graphical full-mouth perio chart, 2017 staging/grading
- 🔗 **HL7 FHIR R4** export/import; JSON export/import with migrations
- 🖼️ PNG / JPG / SVG chart export and a configurable **PDF report** (jsPDF) — multilingual PDF fonts (Arabic shaping, CJK), per-tooth notes
- 🧱 **Composable UI** — beyond the all-in-one shell, `OdontogramUiService`, the four presentational surfaces and all seven declarative control cards are individually exported for custom host layouts
- 🦴 Selectable **tooth anatomy profile** — `classic` (default) or `measured` (nine literature-measured tooth templates), switchable at runtime
- 💾 Opt-in **localStorage persistence** API (host-wired, off by default)
- 🔢 FDI / Universal / Palmer numbering · 🌐 12 UI languages (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR, Arabic RTL) · 🎨 theming via `--odon-*` CSS variables · 🧩 plugin system · ⌨️ keyboard accessibility

## 📡 Public API (named exports)

`OdontogramShellComponent` is a named export. The imperative state API, the standalone `PerioChartComponent`, the guided tour, and all public types are named exports from the same entry point:

```ts
import {
  OdontogramShellComponent,
  PerioChartComponent,          // standalone periodontal chart
  getOdontogramSummary,         // read state
  onStateChange,                // subscribe to state changes
  exportFhir,                   // HL7 FHIR R4 bundle
  exportSvg, exportImage,       // vector / raster chart export
  setReadOnly, clearSelection,
  registerPlugins,              // custom SVG plugin system
  startIntroTour,               // launch the onboarding tour
  // …and well over 100 more functions and types, fully typed in the bundled .d.ts
} from "angular-advanced-odontogram";
```

## 🧩 Composable API (advanced)

`OdontogramShellComponent` is the supported all-in-one component and needs no extra setup. For custom layouts, `OdontogramUiService`, the four presentational surfaces (`OdontogramTopbarComponent`, `OdontogramChartSurfaceComponent`, `ToothInfoSurfaceComponent`, `ToothControlsSurfaceComponent`) and all seven declarative control cards (`StatusesCardComponent`, `ToothDetailsCardComponent`, `CariesCardComponent`, `FillingsCardComponent`, `RootPeriodontiumCardComponent`, `OrthodonticsCardComponent`, `SurfaceCrossComponent`) are individually named exports, composable under one `OdontogramUiService` instance. A zero-config `ui.configure()` call falls back to the same defaults `OdontogramShellComponent` itself uses — see the full [Composable surfaces](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/lang/README-en.md#-use-as-an-npm-package) section in the documentation for the wiring.

## 🔗 FHIR & JSON round-trip

Status charts export to **HL7 FHIR R4** (a collection Bundle of per-tooth Observations, ISO 3950 tooth coding) and to a versioned JSON format with automatic migration from older payload versions. Because the clinical engine is shared verbatim with the original React library, both formats round-trip losslessly between this package and **[react-advanced-odontogram](https://www.npmjs.com/package/react-advanced-odontogram)** — export from one, import into the other.

## 🖥️ SSR / singleton notes

- The component reads the DOM on mount, so it must run **browser-side only** — guard it out of any server-rendered pass (e.g. Angular Universal) and let it hydrate/mount on the client.
- Engine state is a **module-level singleton** (matching the original React engine), so render only **one** `<aao-odontogram-shell>` (or one `OdontogramUiService`-scoped session) per page — two instances would share a single chart's state.

**📖 Full documentation, the composable API, DI seams, testing and the public API reference:** https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/lang/README-en.md

## 📄 License & citation

MIT © Zoltán Dul. This library is a port of [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul); if you use it in research, please cite the original project — see its [`CITATION.cff`](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/CITATION.cff) and the [Zenodo record](https://doi.org/10.5281/zenodo.21156787).

## 🙌 Credits

**Creator:** Angular Advanced Odontogram is created and maintained by Zoltán Dul ([@ZoliQua](https://github.com/ZoliQua)), the creator and lead developer of this port and of the underlying clinical engine.

**Original project:** [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul) (npm: [`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)) — the original React implementation this package is a port of; the clinical engine (dental status logic, periodontal charting, FHIR export/import, i18n strings, tour, SVG templates) is shared, verbatim.

**Built with** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [Angular](https://angular.dev), [Angular CLI](https://angular.dev/tools/cli), [TypeScript](https://www.typescriptlang.org) and [Tailwind CSS](https://tailwindcss.com).

If this project is useful to you, please [star it on GitHub](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
