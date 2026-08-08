# 🦷 Angular Advanced Odontogram

[![npm](https://img.shields.io/npm/v/angular-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/angular-advanced-odontogram)
[![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/releases)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/LICENSE)

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**📖 Documentation per language:** 🇬🇧 English (this file) · 🇭🇺 [Magyar](lang/README-hu.md)

An interactive, SVG-based **dental odontogram (dental chart) editor** for **Angular + TypeScript** — with a full **periodontal charting module**, multi-surface caries/restorations, endodontic/prosthetic states, FDI/Universal/Palmer numbering, **HL7 FHIR R4** export/import, optional ICDAS scoring, and a 12-language UI.

> **This is the official Angular port of [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)** (npm: `react-advanced-odontogram`). Version 1.0.0 has full feature parity with the React module v2.2.0 (payload version 2.19) — JSON and FHIR R4 exports round-trip between the two libraries. The clinical engine is shared, verbatim; only the component shell is Angular-native.

🔗 **Live demo:** https://angular-advanced-odontogram.vercel.app/ \
⚛️ **Original React project:** https://github.com/ZoliQua/React-Odontogram-Modul

![Odontogram editor preview](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_en_odontogram.png)
*Screenshot from the original React project — the Angular port renders the identical UI.*

---

## 📦 Installation

```bash
npm install angular-advanced-odontogram
```

**Requirements:** Angular **21+**; a bundler that supports the `exports` field and ESM (the Angular CLI qualifies out of the box). The package is **ESM-only**.

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
} from "angular-advanced-odontogram";
```

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
- 🖼️ PNG / JPG / SVG chart export and a **PDF report** (jsPDF)
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
