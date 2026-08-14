<p align="center">
  <img src="https://raw.githubusercontent.com/ZoliQua/Angular-Advanced-Odontogram/main/docs/angular-module-logo.png" alt="Angular Advanced Odontogram logo" width="160" />
</p>

# 🦷 Angular Advanced Odontogram

[![npm](https://img.shields.io/npm/v/angular-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/angular-advanced-odontogram)
[![Version](https://img.shields.io/badge/version-2.4.1-green?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/releases)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/LICENSE)

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**📖 Documentation per language:** 🇬🇧 [English](lang/README-en.md) · 🇭🇺 [Magyar](lang/README-hu.md) · 🇩🇪 [Deutsch](lang/README-de.md) · 🇪🇸 [Español](lang/README-es.md) · 🇫🇷 [Français](lang/README-fr.md) · 🇮🇹 [Italiano](lang/README-it.md) · 🇵🇱 [Polski](lang/README-pl.md) · 🇧🇷 [Português (BR)](lang/README-pt-br.md) · 🇸🇰 [Slovenčina](lang/README-sk.md) · 🇷🇺 [Русский](lang/README-ru.md) · 🇸🇦 [العربية](lang/README-ar.md) · 🇨🇳 [简体中文](lang/README-zh.md)

An interactive, SVG-based **dental odontogram (dental chart) editor** for **Angular + TypeScript** — with a full **periodontal charting module**, multi-surface caries/restorations, endodontic/prosthetic states, FDI/Universal/Palmer numbering, **HL7 FHIR R4** export/import, optional ICDAS scoring, and a 12-language UI.

> **This is the official Angular port of [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)** (npm: `react-advanced-odontogram`). Feature parity with react-advanced-odontogram main @ `934a911` (post-v2.4.0) (payload version 2.20) — JSON and FHIR R4 exports round-trip between the two libraries. The clinical engine is shared, verbatim; only the component shell is Angular-native. Versioned in lockstep with the React module.

🔗 **Live demo:** https://angular-advanced-odontogram.vercel.app/ \
⚛️ **Original React project:** https://github.com/ZoliQua/React-Odontogram-Modul

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
- 🔗 **HL7 FHIR R4** export/import; JSON export/import with migrations — round-trip compatible with [`react-advanced-odontogram`](https://github.com/ZoliQua/React-Odontogram-Modul)
- 🖼️ PNG / JPG / SVG chart export and a configurable **PDF report** (jsPDF) — multilingual PDF fonts (Arabic shaping, CJK), per-tooth notes
- 🧱 **Composable UI** — beyond the all-in-one shell, `OdontogramUiService`, the four presentational surfaces and all seven declarative control cards are individually exported for custom host layouts
- 🦴 Selectable **tooth anatomy profile** — `classic` (default) or `measured` (nine literature-measured tooth templates), switchable at runtime
- 💾 Opt-in **localStorage persistence** API (host-wired, off by default)
- 🔢 FDI / Universal / Palmer numbering · 🌐 12 UI languages (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR, Arabic RTL) · 🎨 theming via `--odon-*` CSS variables · 🧩 plugin system · ⌨️ keyboard accessibility

**📖 Full documentation, the composable API, DI seams, testing and the public API reference:** [`lang/README-en.md`](lang/README-en.md)

## 📄 License & citation

MIT © Zoltán Dul. This library is a port of [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul); if you use it in research, please cite the original project — see its [`CITATION.cff`](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/CITATION.cff) and the [Zenodo record](https://doi.org/10.5281/zenodo.21156787).

## 🙌 Credits

Angular Advanced Odontogram is created and maintained by Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), the creator and lead developer of this port and of the underlying clinical engine.

**Original project:** [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul) — the original React implementation this package is a port of; the clinical engine (dental status logic, periodontal charting, FHIR export/import, i18n strings, tour, SVG templates) is shared, verbatim.

**Built with** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [Angular](https://angular.dev), [Angular CLI](https://angular.dev/tools/cli), [TypeScript](https://www.typescriptlang.org) and [Tailwind CSS](https://tailwindcss.com).

If this project is useful to you, please [star it on GitHub](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
