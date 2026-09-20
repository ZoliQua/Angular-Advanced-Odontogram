<p align="center">
  <img src="https://raw.githubusercontent.com/ZoliQua/Angular-Advanced-Odontogram/main/docs/angular-module-logo.png" alt="Angular Advanced Odontogram logo" width="160" />
</p>

# 🦷 Angular Advanced Odontogram

[![npm](https://img.shields.io/npm/v/angular-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/angular-advanced-odontogram)
[![Version](https://img.shields.io/badge/version-2.6.0-green?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/releases)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/LICENSE)

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:** 🇬🇧 English (this file) | 🇭🇺 [Magyar](README-hu.md) | 🇩🇪 [Deutsch](README-de.md) | 🇪🇸 [Español](README-es.md) | 🇫🇷 [Français](README-fr.md) | 🇮🇹 [Italiano](README-it.md) | 🇵🇱 [Polski](README-pl.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇷🇺 [Русский](README-ru.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md)

---

## 📑 Contents

- [📋 Overview](#-overview)
- [📦 Use as an npm package](#-use-as-an-npm-package)
- [✨ Key Features](#-key-features)
- [📦 Modules](#-modules)
- [🛠️ UI Controls](#-ui-controls)
- [🦷 Tooth Types and States](#-tooth-types-and-states)
- [⚙️ Settings](#-settings)
- [🖼️ SVG Template System](#-svg-template-system)
- [🔢 Numbering Systems](#-numbering-systems)
- [🚀 Usage](#-usage)
- [🔗 Integration](#-integration)
- [🧪 Testing](#-testing)
- [📖 API Documentation](#-api-documentation)
- [📡 Public API](#-public-api)
- [💾 State persistence (localStorage)](#-state-persistence-localstorage)
- [💾 Status Export/Import Format](#-status-exportimport-format)
- [🖨️ Export](#-export)
- [📁 Folder Structure](#-folder-structure)
- [⚙️ Tech Stack](#-tech-stack)
- [📝 Notes](#-notes)
- [🔒 Security notes](#-security-notes)
- [📖 How to cite](#-how-to-cite)

## 🇬🇧 English

### 📋 Overview

This project is an interactive, browser-based odontogram editor for **Angular + TypeScript** that supports fast dental charting with a clean UI. It renders layered SVG tooth templates to represent restorations, caries, endodontic status, mobility, and other clinical details, while providing multi-select, selection filters, and predefined status presets.

**This is the official Angular port of [React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram)** (npm: [`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)). Feature parity with react-advanced-odontogram **v2.6.0** (engine commit `215c43a`), payload version **2.22** — JSON and FHIR R4 exports round-trip between the two libraries. The clinical engine (`projects/angular-advanced-odontogram/src/lib/core/`) is shared, verbatim — dental status logic, periodontal charting, diagnosis coding, FHIR export/import, i18n strings, the guided tour and the SVG templates are byte-identical to the React original, re-copied from a pinned upstream commit on every resync; only the component shell (`projects/angular-advanced-odontogram/src/lib/components/`) is Angular-native. A small, explicitly documented set of deviations exists (branding/identity strings only — see the port design spec in this repository). Versioned in lockstep with the React module.

---
![Odontogram editor preview](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_en_odontogram.png)
*Screenshot from the original React project — the Angular port renders the identical UI.*

🔗 **Live demo:** https://angular-advanced-odontogram.vercel.app/

---

### 📦 Use as an npm package

The odontogram ships as a self-contained Angular component library on npm:
[`angular-advanced-odontogram`](https://www.npmjs.com/package/angular-advanced-odontogram).

#### Requirements
- **Angular 21.2+** (declared as a peer dependency — provided by your app).
- A **bundler** that understands the `exports` field and ESM — the Angular CLI (`@angular/build`) qualifies out of the box. The package is **ESM-only**.
- Node **≥ 20** for tooling.

#### Installation

```bash
npm install angular-advanced-odontogram
```

#### Basic usage

Register the stylesheet **once**, anywhere your app's global styles are configured (e.g. `angular.json`):

```json
"styles": [
  "node_modules/angular-advanced-odontogram/styles.css",
  "src/styles.css"
]
```

Then render `OdontogramShellComponent`:

```ts
import { Component } from "@angular/core";
import { OdontogramShellComponent } from "angular-advanced-odontogram";

@Component({
  selector: "app-chart",
  imports: [OdontogramShellComponent],
  template: `
    <aao-odontogram-shell
      language="en"           
      numberingSystem="FDI"   
      [darkMode]="false"
    />
  `,
})
export class ChartComponent {}
```

`language` accepts `hu | en | de | es | it | sk | pl | ru | pt-br | zh | ar | fr`; `numberingSystem` accepts `FDI | UNIVERSAL | PALMER`.

#### Component inputs

`OdontogramShellComponent` is a controlled component — every input is an Angular `input()` signal, all optional, each falling back to the engine's own default when omitted. The most common:

| Input | Type | Default | Description |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | UI language (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`zh`/`ar`/`fr`). |
| `numberingSystem` | `"FDI" \| "UNIVERSAL" \| "PALMER"` | `"FDI"` | Tooth numbering system. |
| `darkMode` | `boolean` | `false` | Dark theme toggle. |
| `readOnly` | `boolean` | `false` | Disable all editing (view-only). |
| `themeConfig` | `OdontogramThemeConfig` | — | Override theme CSS variables (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Register custom state plugins / extra layers. |
| `enableNotes` | `boolean` | `false` | Enable per-tooth notes. |
| `enableIcdas` | `boolean` | `false` | Enable ICDAS II caries scoring. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Filling-card complexity: `"simple"` (one material per tooth) or `"complex"` (per-surface materials). |
| `fillingDefectEnabled` | `boolean` | `true` | Enable filling-defect findings on the Fillings card. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | all available | Available filling materials as a boolean map over `amalgam`/`composite`/`gic`/`temporary` (unknown keys ignored). |
| `fissureSealingEnabled` | `boolean` | `true` | Enable fissure sealing on the Fillings card. |
| `languageChange` / `numberingChange` / `darkModeChange` (outputs) | `output<T>` | — | Emit when the user changes the setting from the UI. |
| `fillingComplexityChange` / `fillingDefectEnabledChange` / `fillingMaterialAvailabilityChange` / `fissureSealingEnabledChange` (outputs) | `output<T>` | — | Emit when the user changes the matching setting from Settings → Fillings. |

Finer-grained detail-level inputs (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `cariesDepthEnabled`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) are also accepted — see `odontogram-shell.component.ts` for the full, typed list.

The four fillings inputs above are **restore-only**: an omitted input never writes the engine (an imperative `setFillingComplexity()` call before mount is preserved), while a provided input writes the engine and the Settings-modal state together, so the modal never shows a stale value. `fillingMaterialAvailability` is applied diff-wise against a canonical serialized key, so re-rendering with a new object literal of identical content never re-writes the engine. The matching `*Change` outputs fire from Settings → Fillings — the write-back path for hosts persisting preferences.

#### Public API (named exports)

`OdontogramShellComponent` is a named export. The imperative state API, the standalone `PerioChartComponent`, the guided tour, and all public types are named exports from the same entry point:

```ts
import {
  OdontogramShellComponent,
  PerioChartComponent,          // standalone periodontal chart
  // read state
  getOdontogramSummary,
  getToothStateSummary,
  onStateChange,                // subscribe to state changes
  // export / import
  exportFhir,                   // HL7 FHIR R4 bundle
  exportSvg, exportImage,       // vector / raster chart export
  setImportFormat,
  // control
  setReadOnly, getReadOnly,
  clearSelection, getSelectedTeeth,
  registerPlugins, setPluginState, getPluginState,
  startIntroTour,               // launch the onboarding tour
  // …and many more setX/getX settings functions
} from "angular-advanced-odontogram";
```

The full surface (well over 100 functions and types — `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PdfSettings`, `PerioViewMode`, and many more) is fully typed in the bundled `.d.ts` declarations; see [Public API](#-public-api) below for the curated reference table.

#### Composable surfaces (advanced)

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
    // Every `OdontogramUiConfig` field is optional — a zero-config
    // `configure()` call gives a standalone session with the same defaults
    // `OdontogramShellComponent` itself falls back to (language "en"/"hu"
    // depending on host document, "FDI" numbering, light mode, ...). Pass
    // only the Signals/callbacks you want to override, e.g.
    // `{ darkMode: this.darkMode, onDarkModeChange: (v) => ... }`.
    this.ui.configure();
  }

  ngAfterViewInit(): void { this.ui.init(); }
  ngOnDestroy(): void { this.ui.destroy(); }
}
```

`OdontogramUiService` takes the same configuration shape as `OdontogramShellComponent`'s inputs (its `configure()` method accepts an `OdontogramUiConfig` object of `Signal`s/callbacks, every field optional with the same upstream default). Current constraint: one `OdontogramUiService` instance per page (the engine is a module-level singleton). Surfaces can be mounted and unmounted on demand. `OdontogramShellComponent` itself is unchanged — it is exactly this composition in the default arrangement, still wiring every field explicitly from its own inputs.

For even finer composition, the individual control cards are exported as well:

| Component | Selector | Covers |
|---|---|---|
| `StatusesCardComponent` | `aao-statuses-card` | Whole-mouth status/preset controls (Reset, Primary/Mixed dentition, Edentulous, status extras) |
| `ToothDetailsCardComponent` | `aao-tooth-details-card` | Base row (tooth selection/substrate), broken-crown checkboxes, crown-need/replace toggles |
| `CariesCardComponent` | `aao-caries-card` | Caries-depth mode, subcrown caries, root-caries severity, per-surface caries picker |
| `FillingsCardComponent` | `aao-fillings-card` | Filling material, per-surface filling picker + defects, subcaries/defect hint notes |
| `RootPeriodontiumCardComponent` | `aao-root-periodontium-card` | Pulp/endo status, apical diagnosis, resorption, mobility, peri-implant status |
| `OrthodonticsCardComponent` | `aao-orthodontics-card` | Appliance, drift, vertical movement, rotation |
| `SurfaceCrossComponent` | `aao-surface-cross` | The shared B/M/O/D/L cross-selection widget the Caries/Fillings cards use internally |
| `DiagnosesCardComponent` | `aao-diagnoses-card` | Per-tooth ICD-10/BNO-10/ICD-10-CM/SNOMED diagnosis coding — view a tooth's derived diagnoses and curate them (suppress a derived one, add one the chart doesn't represent) |

Each card is a self-contained declarative component that reads and writes the shared session through `inject(OdontogramUiService)` and the exported `engineState()` helper (a signal-returning read of any engine getter, kept fresh via the core's own change-notification bus). Mount only the cards a given layout needs, in any arrangement, under one `OdontogramUiService`. `CreditsModalComponent` (`aao-credits-modal`, the topbar's "About and credits" popup) and `CaseDiagnosesModalComponent` (`aao-case-diagnoses-modal`, the whole-mouth case/regional diagnoses pop-up) are exported too, for hosts that want to drive either from their own open/close state.

```ts
import { engineState, OdontogramUiService, getOdontogramSummary } from "angular-advanced-odontogram";

// Anywhere inside an injection context under an `OdontogramUiService`:
readonly summary = engineState(getOdontogramSummary); // Signal<OdontogramSummary>, kept fresh automatically
```

#### DI seams for host testing

Two `InjectionToken`s let a host app override side-effecting engine calls in its own tests (both default to the real engine call in production; both are `providedIn: "root"`):

| Token | Overrides | Shape |
|---|---|---|
| `ODONTOGRAM_ENGINE_LIFECYCLE` | `initOdontogram()` / `destroyOdontogram()`, called from `OdontogramShellComponent`'s `ngAfterViewInit()`/`ngOnDestroy()` | `{ init: () => Promise<void>; destroy: () => void }` |
| `EXPORT_PDF_FN` | `exportPdf(opts)`, called from `ExportOptionsModalComponent` on "Export" | `(opts: PdfExportOptions) => Promise<void>` |

Both exist because the real functions touch the DOM/canvas/`jsPDF` internals a headless test environment can't fully provide — override them via Angular's `TestBed` provider array in a host app's own component tests.

#### Important notes & current limitations
- **ESM-only** — the package publishes a single ES module (built with `ng-packagr`) plus its type-declaration entry. It targets bundler module resolution; there is no CommonJS build.
- **The stylesheet is separate** — you **must** register `angular-advanced-odontogram/styles.css` once; it is not injected automatically. Styling is global CSS scoped under `.odontogram-root` and driven by `--odon-*` CSS variables.
- **SSR / client-only** — the component reads the DOM on mount, so it must run in the browser; render it browser-side only.
- **Assets are self-contained** — the tooth and icon SVGs are inlined into the bundle at build time (generated TypeScript modules, `npm run gen:assets`); there is **no runtime asset fetch** to configure and nothing extra to copy to your app's public folder.
- **On-demand loading** — only English and the `classic` tooth-anatomy artwork ship in the initial bundle; the 11 other UI-language tables and the `measured` anatomy profile's artwork are separate lazy chunks, fetched the first time a host switches to them (`setI18nLanguage`/the language menu, and `setToothAnatomy("measured")`/Settings → Odontogram → tooth anatomy, respectively). This resync's split cut the demo's main chunk from 3.12 MB to 1.23 MB and the initial total from 3.21 MB to 1.32 MB — nothing to configure on the host side.
- **One instance per page** in this release — engine state is a module-level singleton (same as the React original), so rendering two `<aao-odontogram-shell>` instances on the same page would make them share a single chart's state.

---

### ✨ Key Features
- 🖱️ Fast selection and multi-select (CMD/CTRL + click)
- 🦷 Tooth types: permanent, primary (milk), implant, subgingival, missing
- 🦷 Tooth substrate (orthogonal to any restoration): natural, radix (root remnant), broken, prepared for crown
- 👑 Restorations by type × material: crown / inlay / onlay / veneer / bridge in e.max, gold, gradia, zirconia, metal, metal-ceramic, telescope or temporary (onlay is occlusal-view only) — chosen from one combined low-click "Fix: Crown – …" picker; legacy `metal` crowns migrate to `metal-ceramic` (PFM); implants use the same type × material model, composed with an implant connector layer. The picker is scoped by tooth kind: an implant offers only crown/bridge (plus its five attachment options, below); a missing/gap tooth offers only a bridge pontic (plus removable-partial/-full); a `radix` substrate hides the restoration control entirely (no restoration can be authored on a root remnant)
- 🦿 Removable/attachment prosthetics on the dedicated `prosthesis` axis ("Kivehető:" entries in the combined picker): implant healing abutment, locator, locator with overdenture, bar, bar with overdenture; tooth-supported removable partial or full denture
- 🌉 Bridge teeth render both the crown cap and the saddle connector; a multi-tooth bridge-span overlay renders one continuous, arch-aware connector across consecutive bridge teeth (pontics + abutments) and the inter-tooth gaps between them, included in PNG/JPG/SVG export
- 🔍 Caries charting on 6 surfaces: mesial, distal, buccal, lingual, occlusal, subcrown
- 🪥 Filling materials per surface: amalgam, composite, GIC, temporary
- 🏥 One merged "Pulp / Endo status" selector (grouped: vital pulp vs. treated/endo): endodontic states (medicinal filling, root canal filling, incomplete root filling, glass fiber post, metal post) and AAE pulp diagnosis (`pulpDx`: normal / reversible / irreversible pulpitis / necrosis) are mutually exclusive — a root-treated tooth (`endo` set) cannot also carry a vital pulp diagnosis; on treatment, `pulpDx` is normalized to `normal`. An optional 3-level pulp detail setting (`pulpDetailLevel`: simple / AAE / practical-Latin) surfaces 9 practical-Latin pulp subtypes via `pulpLatin`
- 🦴 Apical diagnosis (`apicalDx`: symptomatic/asymptomatic apical periodontitis, acute/chronic apical abscess, condensing osteitis) drives the periapical glyph directly; a granuloma/cyst lesion-subtype qualifier is shown only under symptomatic/asymptomatic apical periodontitis
- 🩹 Merged "Root and periodontium" card (single collapsible section for root/periapical and periodontal findings)
- ⚕️ Modifications: periapical inflammation (shown only on missing/extraction-socket teeth; hidden on present teeth and on implants, where `periImplant` covers it), periodontal disease, mobility grades (M1/M2/M3, hidden on implants)
- 🦷🔩 Peri-implant status (`periImplant`: none / mucositis / peri-implantitis-mild / -moderate / -severe) — 2018 World Workshop staging, shown as a dedicated selector on implants
- 🏷️ Special indicators: crown needed, crown replacement needed, missing closed gap, extraction plan, fissure sealing, contact point loss
- 👁️ Occlusal view, wisdom teeth, bone and pulp visibility toggles
- 🔢 12 selection filters (all, present, permanent, milk, implants, missing, upper/lower, front/molars)
- 📊 Predefined status presets (reset, primary dentition, mixed dentition, edentulous)
- 📦 22 predefined restoration templates (bridges, removable dentures, bar dentures with implants)
- 💾 Status export/import in JSON (version 2.22; imports still accept legacy 1.4 and 2.0 through 2.21 and migrate automatically, with plugin custom states and per-tooth notes)
- 💽 Opt-in localStorage persistence (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — disabled by default; auto-saves the status chart (and, optionally, the plan chart) with a 4 MB size guard and storage/parse errors routed to an `onError` callback (or `console.warn`) instead of throwing
- 🔗 HL7 FHIR R4 export (collection Bundle of per-tooth Observations, ISO 3950 tooth coding for permanent dentition **and** deciduous milk teeth (51-85, lossless round-trip on import), local code system, plus an opt-in SNOMED CT overlay (Settings → General → SNOMED CT)); a caries component with a charted severity also carries a scoring-system coding — ICDAS on a primary (unfilled) surface, CARS on a recurrent (filled) one
- ✚ Cross/plus surface selection UI (B/M/O/D/L) for caries and fillings — `SurfaceCrossComponent`, exported for composable layouts
- 🧱 Per-surface restoration materials (mixed fillings, e.g. buccal amalgam + distal composite)
- 🖼️ PNG/JPG/SVG image export of the chart (downloadable; PNG/JPG rasterized from vector SVG)
- 🦷 Caries/subcaries is a per-surface state machine: a caried surface with no filling renders as primary caries (ICDAS-tiered opacity); once a filling is present on that surface it renders as recurrent caries instead (CARS-scored) — the two are never both active on the same surface
- 🎯 Unified per-surface severity (`cariesSeverity`, 0–6): read as ICDAS depth on a primary surface, as a named CARS score (Sound … Extensive cavity) on a recurrent one, via a contextual popup that shows only the scale relevant to the surface's current state
- 🌱 Root caries (`rootCaries`: none / active / arrested / active-cavitated), wiring the dedicated root-caries artwork layer at a severity-driven opacity
- 📡 Radiographic caries depth (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 per surface), independent of the visual ICDAS/CARS severity scale, surfaced as a badge and round-tripped through its own FHIR Observation
- 🎚️ Three caries granularity settings (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) plus a `cariesDepthEnabled` toggle, collapsing each scale to a simpler picker view without losing the stored value
- 🩹 Fillings-panel subcaries summary line: lists any selected tooth with recurrent caries and its surfaces
- 🪛 Per-surface filling defects (`fillingDefect`: none / marginal / fracture / wear) on direct restorations, independent of recurrent caries
- 🦷💥 Tooth wear typed by clinical cause and location (`wearEdge`: none / attrition / erosion, incisal/occlusal; `wearCervical`: none / abrasion / abfraction / erosion, cervical)
- 🎨 Tooth discoloration by cause (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) on permanent and milk teeth
- ✏️ Anterior teeth (incisors/canines) label their occlusal surface "incisal" throughout the UI; the stored surface key stays `occlusal`
- 🔤 Position-aware surface notation (Settings → Tooth details → "Surface notation", simple/full, default full): in full mode the caries/filling surface letter and label follow tooth anatomy — occlusal → I/incisal on anterior teeth, buccal → L/labial on anterior teeth, lingual → P/palatal on upper teeth and L/lingual on lower teeth
- 🦷↕️ Per-tooth orthodontic charting (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: boolean) on a present natural tooth (permanent or milk)
- 🪨 Calculus, and root resorption typed as internal or external-cervical (`resorptionType`)
- 📏 Per-surface caries depth (superficial / dentin / deep), or optional ICDAS II scoring (0–6) via `enableIcdas`
- 🩹 Crown marginal-leakage toggle, shown only for a crown or bridge restoration
- 🧬 Standards-based diagnosis coding (WHO ICD-10, always on): every charted finding derives an ICD-10-coded diagnosis — caries (K02), root/cementum & arrested caries (K02.2/.3), pulpitis & pulp necrosis (K04.0/.1), apical periodontitis, periapical abscess and radicular cyst (K04.4–.9), attrition/abrasion/erosion/abfraction (K03.0–.8), calculus (K03.6), resorption (K03.3), discoloration (K00.3/K00.8/K03.7), tooth loss (K08.1), retained root (K08.3) and tooth fracture (S02.5) — exported as FHIR Conditions
- 🩺 Per-tooth **Diagnoses card** (`DiagnosesCardComponent`, `aao-diagnoses-card`): view a tooth's derived ICD-10 diagnoses and curate them — suppress a wrongly-derived one or add one the chart does not represent. The effective set (derived − suppressed + added) drives the FHIR export; each row shows its code first (`K04.0 Pulpitis`) and rows are sorted by code; an **exclude** toggle drops a diagnosis from the FHIR export without touching the chart, and a **delete** (×) removes the diagnosis *and* its underlying finding
- 🗂️ **Case / regional diagnoses** (`CaseDiagnosesModalComponent`, `aao-case-diagnoses-modal`): whole-mouth diagnoses not tied to a single tooth — malocclusion & TMJ (K07), oral cysts (K09), salivary-gland disease (K11), stomatitis & oral mucosa (K12/K13), and arch-level developmental anomalies (K00) — each optionally lateralized (left/right/bilateral), opened from the **Diagnoses** button beside the Odontogram/Periodontal-status toggle
- 🌍 National coding packs (Settings → General → Diagnosis coding system): overlay a national code system on the WHO ICD-10 base — BNO-10 (Hungarian, official NEAK titles; keeps the WHO code) or US ICD-10-CM (remapped codes, e.g. the K07 dentofacial range → M26)
- 🔬 SNOMED CT overlay (Settings → General → SNOMED CT, opt-in, off by default): adds a SNOMED CT coding alongside the WHO and any national-pack coding, and codes the peri-implant findings that have no WHO ICD-10 code. The ICD-10-CM and SNOMED concept ids are reference/best-effort — verify against the official ICD-10-CM tabular list / SNOMED CT browser before clinical use
- 🔁 FHIR Condition round-trip: diagnoses export as FHIR `Condition` resources (tooth-linked, plus patient-level case conditions with a laterality bodySite) alongside the Observations, and import reconstructs them — case conditions directly, and the per-tooth add/suppress overrides by diffing the imported Conditions against the re-derived chart
- ✅ HL7-validator-clean FHIR export: every Bundle entry carries a deterministic `id` and an absolute `fullUrl` (no `urn:uuid` placeholders), and the Bundle embeds the engine's own **CodeSystem** so its local codes resolve during validation; the same CodeSystem plus generated ValueSets are published in this repository under `projects/angular-advanced-odontogram/src/lib/fhir/` (pass `includeCodeSystem: false` in the FHIR export options to omit it from the Bundle)
- 🔄 Periodontal data round-trips through FHIR import too, not only through the JSON payload: the importer reads the LOINC 74029-0 periodontal panels back into each tooth — probing depth, gingival margin (reconstructed from CAL, so pseudopocket values survive), BOP, furcation, O'Leary plaque, the PI/GI and implant mPI/mBI indices and keratinized-gingiva width — plus the case-level smoking-status and HbA1c evidence Observations; suppuration is the one exception and stays JSON-only
- 🧰 Unified topbar icon row with a tabbed Settings dialog (7 tabs — General / Odontogram / Periodontal Chart / Tooth details / Caries / Fillings / Export — see [Settings](#-settings) below)
- 🦷🩺 Settings → "Periodontal Chart" tab: an availability toggle plus 16 per-index show/hide toggles for the perio-chart rows, each with a description, plus a translated-vs-canonical index-name display option
- 📋 Tooth information panel: live text summary of the whole chart (tooth counts, present/missing lists, caries incl. secondary, fillings, root canals, prosthetics, implants, periodontal status) — shown by default, toggleable in Settings
- 🗂️ Consolidated Export dropdown (Status JSON / FHIR / PNG / JPG / SVG / PDF report), each format independently hideable via Settings → General
- 📥 Import dropdown with FHIR import (round-trips exported Bundles), independently hideable per source
- ⏳ Progress overlay during image export
- 🎓 Interactive intro tour (guided walkthrough of the shell's controls)
- 🔢 Three numbering systems (FDI, Universal, Palmer)
- 🌐 I18n — 12 UI languages (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) with a language switcher; Arabic renders the UI right-to-left with the dental/perio charts pinned left-to-right; only the active language ships in the main bundle — every other language is a separate chunk, fetched the first time it is selected
- 🌗 Dark mode support with toggle button (standalone or controlled by parent app)
- 🎨 Custom theme configuration (`themeConfig` input) with CSS custom properties (`--odon-*`)
- 📱 Mobile touch UX: tap-to-zoom popover, long-press context menu, pinch-to-zoom, WCAG 44px touch targets, arch toggle navigation
- 🔌 Custom SVG plugin system: inject visual overlays, per-tooth custom state, JSON export/import support — plugin `renderSvg()` output is sanitized with DOMPurify (SVG profile) before insertion into the live chart; plugins still run as trusted code, so only load plugins from sources you trust
- ⚠️ State validation warnings for incompatible tooth state combinations
- 🏷️ Automatic state tooltip on tooth tiles (shows all active states)
- 🩺 Per-tooth tooltip and whole-mouth summary panel surfacing the full set of clinical findings (pulp/apical diagnosis, root resorption, peri-implant status, graded root caries, calculus, crown marginal leakage, fracture, contact loss, typed edge/cervical wear)
- ♿ Keyboard accessibility (WCAG): ARIA listbox/option roles, Enter/Space selection, arrow key navigation, focus-visible outlines
- 🔒 Read-only mode: disable all interactions for print/report/view use cases
- ✨ Selection animations: pulsing dashed border and glowing drop-shadow on selected teeth (with prefers-reduced-motion support)
- 📝 Per-tooth notes: double-click to add/edit notes, note icon next to tooth number, hover tooltip with note text, an "Individual notes" line in the whole-mouth summary panel, inclusion in the PDF report, JSON export/import
- 🔀 Status ↔ Plan chart split: a `Status | Plan` toggle switches between a current-**status** chart and a **plan** (intended post-treatment) chart, each with its own tooth states; export/import always target the status chart, while the plan chart is read/written separately via its own API (see [Public API](#-public-api)) and — when it differs from status — is included as an additive `plan` section in the JSON export
- 📝 "What changes" box: whenever the plan differs from the current status, lists every difference per tooth and per treatment axis; also available programmatically via `getPlanChanges()`
- 🅿️ Proposed styling: in Plan mode, findings the plan **adds** vs the current status render with a distinct dashed, tinted "proposed" outline
- 🚦 Plan-mode gating: the Plan chart shows only what a dentist can *do* — status-only findings (caries, wear, discoloration, the whole periodontal block) are hidden; restoration, prosthesis, orthodontics, crown-need/replace and extraction-plan stay plannable

![Full-mouth periodontal chart](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_en_perio.png)
*Screenshot from the original React project — the Angular port renders the identical UI.*

- 🩺 Periodontal charting: per-site **probing depth**, **gingival margin**, **bleeding on probing** (+ suppuration) at the six standard sites per tooth, with derived **clinical attachment level (CAL = PD + gingival margin)**, recession, and whole-mouth **%BOP**. A **graphical full-mouth perio chart** — each arch drawn as two separate buccal/palatal(lingual) SVGs with a red **CEJ line**, a numbered millimeter guide grid, and a gingival-margin/pocket-depth curve, split by a central perio index band carrying **Miller class** and **Plaque/PI/GI/mPI/mBI** as anatomical diamond tiles per tooth; keyboard auto-advance entry; the chart dynamically scales to fill the available width. Presented as an `Odontogram | Periodontal Status` view toggle, and still separately invocable via the exported `PerioChartComponent`. Per-site **FHIR** export via the LOINC periodontal panel (`74029-0`; PD `32910-2`, recession `32911-0`, CAL `32912-8`)
- 🧪 An extensive automated test suite (see [Testing](#-testing)) covering numbering, translations, presets, i18n, the shell, theme, touch, plugins, accessibility and clinical-axis/diagnosis parity against the frozen React corpus
- 📖 TypeDoc API documentation with JSDoc comments on all public exports (`npm run docs`)

### 📦 Modules
- 🦷 Odontogram grid and tooth tile UI (`OdontogramChartSurfaceComponent`)
- 🎛️ Controls and status panel (`ToothControlsSurfaceComponent` + the 8 declarative cards)
- 🎨 SVG layering engine and templates (framework-free core, `core/odontogram.ts`)
- 🔢 Tooth numbering and label mapping (FDI/Universal/Palmer, `core/utils/numbering.ts`)
- 🌐 Localization — 12 UI languages (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), including Arabic (RTL) (`core/i18n/`, `I18nService`)
- 💾 Status export/import
- 📋 Status extras: predefined restoration templates
- 🎨 Theme configuration: customizable color palette via `--odon-*` CSS properties
- 📱 Mobile touch interactions (tap-to-zoom, long-press, pinch-to-zoom, arch toggle)
- 🔌 Custom SVG plugin system
- ⚠️ State validation and tooltip system
- ♿ Keyboard accessibility and ARIA support
- 🔒 Read-only mode
- ✨ Selection animations
- 📝 Per-tooth notes system
- 🧱 **Composable UI** — `OdontogramUiService`, the `engineState()` helper, 4 presentational surfaces, and 8 declarative control cards, all independently exported (see [Composable surfaces](#-use-as-an-npm-package) above)
- 🧪 Automated test suite (Vitest corpus + `ng test`, see [Testing](#-testing))

### 🛠️ UI Controls

**🔝 Topbar** (`OdontogramTopbarComponent`):
- Language switcher (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR dropdown)
- Dark mode toggle button (sun/moon icon, switches between light and dark theme)
- Numbering system switcher (FDI/Universal/Palmer dropdown)
- Export Status / Import Status buttons
- Settings (gear icon), Credits/About (info icon), GitHub link

**📊 Chart header:**
- Occlusal view toggle
- Wisdom teeth visibility toggle
- Bone visibility toggle
- Pulp visibility toggle
- Clear selection button

**🔍 Selection filters:**
- Select All / All Present / Permanent / Milk / Implants / All Missing
- Select Upper / Upper Front 6 / Upper Molars
- Select Lower / Lower Front 6 / Lower Molars

**📋 Status presets:**
- Reset All (reset mouth)
- Primary Dentition
- Mixed Dentition
- Edentulous toggle

**📦 Status extras dropdown:**
- Upper/Lower zircon bridges (12-22, 13-23, 16-26, full arch)
- Upper/Lower metal bridges (12-22, 13-23, 16-26, full arch)
- Upper/Lower partial removable dentures
- Upper/Lower full removable dentures
- Upper/Lower bar dentures with implants

**🦷 Tooth editor panel** (`ToothControlsSurfaceComponent`, for the selected tooth/teeth, grouped into collapsible cards):
- **Statuses card:** whole-mouth presets and status extras (shown/hidden independently via `showStatusCard`)
- **Tooth details card:** tooth selection (base type incl. broken-crown variants), tooth substrate, the combined "Fix: …" / "Kivehető: …" restoration dropdown, crown marginal-leakage checkbox, broken-crown location checkboxes, crown needed / crown replacement needed toggles
- **Orthodontics card:** appliance, mesial/distal drift, vertical movement, rotation toggle — shown on a present natural tooth (shown/hidden independently via `showOrthoCard`)
- **Caries card:** caries-depth mode dropdown, subcrown caries checkbox, root-caries severity dropdown, and the B/M/O/D/L per-surface caries picker (`SurfaceCrossComponent`) with a contextual ICDAS-depth/CARS popup and a radiographic-depth badge
- **Fillings card:** filling-material dropdown, per-surface filling picker, per-surface filling-defect indicator, subcaries and filling-defect hint notes
- **Root and periodontium card:** merged "Pulp / Endo status" selector, apical diagnosis selector, periapical lesion subtype selector, root resorption type selector, mobility grade selector, peri-implant status selector (implants only)
- **Special indicators:** extraction plan/wound, missing-closed, fissure sealing, contact-point loss, calculus, parapulpal pin, endo resection, bridge pillar

### 🦷 Tooth Types and States

**Tooth selection (base type):**
| Value | Description |
|---|---|
| `none` | Missing tooth |
| `tooth-base` | Permanent tooth |
| `milktooth` | Primary (deciduous) tooth |
| `implant` | Dental implant |
| `tooth-under-gum` | Subgingival (unerupted) tooth |

**Broken tooth variants:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Tooth substrate (permanent teeth):**
`natural` (default), `radix` (root remnant), `broken`, `crownprep` (prepared for crown)

**Restoration type (permanent teeth):**
`none`, `crown`, `inlay`, `onlay` (occlusal view only), `veneer`, `bridge`

**Restoration material (permanent teeth):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (legacy `metal` crowns migrate here), `telescope`, `temporary`

**Restoration options are gated by tooth kind** (`restorationOptions()` in `projects/angular-advanced-odontogram/src/lib/core/registry/restorations.ts`): an implant offers only `crown`/`bridge` restoration types (composed with an implant connector layer) plus the five `prosthesis` attachment entries below; a missing/gap tooth offers only a `bridge` pontic plus the two removable-denture `prosthesis` entries; a `radix` substrate hides the restoration control entirely.

**Prosthesis** (`prosthesis`; orthogonal removable/attachment axis, surfaced as "Kivehető:" entries in the combined restoration dropdown):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (implant attachments, with or without an overdenture), `removable-partial`, `removable-full` (tooth-supported dentures on a missing/gap tooth). A tooth has either a fixed restoration or a prosthesis, never both — setting one clears the other.

**Crown marginal leakage** (`crownLeakage`; boolean): shown only when `restorationType` is `crown` or `bridge`.

**Endodontic options (permanent teeth):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodontic options (milk teeth):**
`none`, `endo-medical-filling`

`endo` and `pulpDx` are surfaced through one merged "Pulp / Endo status" selector (grouped: vital pulp vs. treated/endo) and are mutually exclusive — choosing a treated (`endo != none`) option resets `pulpDx` to `normal` and choosing a pulp diagnosis resets `endo` to `none`.

**Filling materials (permanent teeth):**
`amalgam`, `composite`, `gic`, `temporary`

**Filling materials (milk teeth):**
`composite`, `gic`, `temporary`

**Filling/caries surfaces:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (caries only)

**Modifications:**
`inflammation` (periapical), `parodontal` (periodontal), `mobility` (M1/M2/M3)

**Periapical lesion type** (`periapicalType`; qualifies the periapical glyph, shown only under symptomatic/asymptomatic apical periodontitis):
`none`, `granuloma`, `cyst` — the legacy `abscess` value is still accepted/stored but no longer offered in the picker

**Pulp diagnosis** (AAE terminology; `pulpDx`):
`normal`, `reversible-pulpitis`, `irreversible-pulpitis`, `necrosis` — mutually exclusive with `endo`

**Pulp diagnosis, practical Latin** (`pulpLatin`; shown by the pulp picker only when `pulpDetailLevel` is `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Pulp detail level** (`pulpDetailLevel`, global setting): `simple`, `aae` (default), `latin`

**Apical diagnosis** (`apicalDx`; drives the periapical glyph):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Root resorption type** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Peri-implant status** (`periImplant`; implant-only, 2018 World Workshop staging):
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Caries severity** (`cariesSeverity`; unified per-surface field, `0`–`6`): on a surface with no filling it is read as the ICDAS caries-depth scale (`superficial` / `dentin` / `deep`, or the raw ICDAS II codes `0–6` when `enableIcdas` is set); on a surface with a filling it is read as a named CARS score (`0` sound … `6` extensive cavity)

**Root caries** (`rootCaries`): `none`, `active`, `arrested`, `active-cavitated`

**Radiographic caries depth** (`radiographicDepth`; per surface): `none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Caries granularity settings** (global): `secondaryCariesMode` (`simple`/`standard`/`full`, default `standard`), `rootCariesMode` (`simple`/`severity`, default `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, default `off`), `cariesDepthEnabled` (boolean, default `true`)

**Special indicators:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Tooth wear** (`wearEdge`, `wearCervical`; per-location clinical type, gated on tooth-base + no restoration + natural substrate):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Discoloration** (`discoloration`; per-tooth cause, gated on a natural tooth-base or milk tooth + no restoration + natural substrate):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Filling defect** (`fillingDefect`; per surface, direct-restoration finding independent of recurrent caries):
`none`, `marginal`, `fracture`, `wear`

**Orthodontics** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; per-tooth, gated on a present natural tooth):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion`, `intrusion` — `orthoRotation`: boolean

**Tooth detail / notation settings** (global session settings, Settings → Tooth details): `wearDetailLevel` and `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, default `complex`) and `surfaceNotation` (`simple`/`full`, default `full`)

### ⚙️ Settings

Opened from the topbar gear icon (`SettingsModalComponent`); a focus-trapped, ARIA `dialog` with a 7-tab layout (Esc/backdrop-click to close, arrow keys to switch tabs). The dialog is a pure view over a host-supplied `SettingsState` — it owns no setting state itself. All settings are session-level UI state only, unless noted — none of them mutate per-tooth data or the export payload.

- **General:** numbering system (FDI/Universal/Palmer), language, dark/light theme, per-format export availability (PNG/JPG/SVG/PDF — hides the matching Export menu item when off, and disables the Export tab when PDF is off), per-source import availability (Status JSON/FHIR), diagnosis coding system (none / BNO-10 / ICD-10-CM) and an opt-in SNOMED CT overlay toggle
- **Odontogram:** on-screen layout — tooth spacing, tooth-number size, selection color and border style; tooth-information panel visibility; Plan-mode availability; tooth anatomy profile (`classic` default / `measured` — nine literature-measured tooth templates in a two-arch, per-tooth-width layout, switchable at runtime; its artwork is a separate lazy chunk, fetched only when you switch to it, so the classic default costs nothing extra); Statuses-card and Orthodontics-card visibility
- **Periodontal Chart:** an availability toggle that gates the rest of the tab and the perio entry points in the shell; perio view mode (`toggle`/`popup`); 16 per-index show/hide toggles across 5 groups (Pocket: PD/GM/CAL/BOP · Hygiene: Plaque/PI/GI · Mucogingival: CEJ visibility/Root concavity/KG/GT · Support: Furcation/Mobility/Miller class · Peri-implant: mPI/mBI); a translated-vs-canonical index-name display mode (canonical = a fixed English/Latin scientific name in every UI language; tooltips always stay localized)
- **Tooth details:** pulp detail level (simple/AAE/practical-Latin, default AAE), wear detail level and discoloration detail level (simple/complex, each default complex), surface notation (simple/full, default full), per-tooth notes toggle
- **Caries:** ICDAS II scoring toggle, caries-depth toggle, root-caries granularity (simple/severity), secondary/CARS granularity (simple/standard/full), radiographic-depth granularity (off/threeLevel/detailed)
- **Fillings:** filling complexity (complex/simple), filling-defect findings toggle, per-material availability (amalgam/composite/gic/temporary), fissure-sealing toggle
- **Export:** the full PDF report configuration (`PdfSettings` — see [Export](#-export) below) — disabled (falls back to the General tab's content) whenever PDF export is turned off in the General tab

### 🖼️ SVG Template System

**Tooth templates** (in `projects/angular-advanced-odontogram/src/lib/core/assets/teeth-svgs/`):
| Template | Teeth using it |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisors) |
| `13.svg` | 13, 23, 33, 43 (canines) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (premolars) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molars) |

Templates are rotated 180 degrees for the lower jaw and mirrored horizontally for the left side. A parallel `measured/` subfolder holds the nine literature-measured tooth templates the `measured` anatomy profile renders in a two-arch, per-tooth-width layout (Settings → Odontogram → tooth anatomy).

**Icon SVGs** (in `projects/angular-advanced-odontogram/src/lib/core/assets/icon-svgs/`):
`icon_8.svg` (wisdom), `icon_gum.svg` (bone), `icon_no_selection.svg` (clear), `icon_occl.svg` (occlusal view), `icon_pulp.svg` (pulp)

Both folders are compiled into generated TypeScript modules (`core/generated/teeth-svgs.ts`, `core/generated/icon-svgs.ts`) via `npm run gen:assets` — run this after editing a source SVG so the bundled inline strings stay in sync.

### 🔢 Numbering Systems

**FDI (ISO 3950):** Adult teeth 11-18, 21-28, 31-38, 41-48. Primary teeth 51-55, 61-65, 71-75, 81-85. Value: `"FDI"`.

**Universal (USA):** Adult teeth numbered 1-32. Primary teeth lettered A-T. Value: `"UNIVERSAL"`.

**Palmer (Zsigmondy-Palmer):** Quadrant + position format (e.g. UR-1, LL-5). Primary teeth use letters A-E per quadrant. Value: `"PALMER"`.

`NumberingSystem` (`core/utils/numbering.ts`) is the exact union `"FDI" | "UNIVERSAL" | "PALMER"`; the exported `toLabel(fdiTooth, system)` converts an FDI tooth number to the requested system's label (e.g. `toLabel(14, "PALMER")` → `"UR-4"`).

### 🚀 Usage
Development (runs the demo app):
```bash
npm install
npm start           # ng serve
```
Build the library:
```bash
npm run build:styles && npx ng build angular-advanced-odontogram
```
Build the demo app:
```bash
npm run build:demo
```

### 🔗 Integration
The component can be embedded in any Angular app:
```ts
import { Component } from "@angular/core";
import { OdontogramShellComponent } from "angular-advanced-odontogram";
import type { Language } from "angular-advanced-odontogram";
import type { NumberingSystem } from "angular-advanced-odontogram";

@Component({
  selector: "app-host",
  imports: [OdontogramShellComponent],
  template: `
    <aao-odontogram-shell
      [language]="language"
      (languageChange)="onLanguageChange($event)"
      [numberingSystem]="numbering"
      (numberingChange)="onNumberingChange($event)"
      [darkMode]="darkMode"
      (darkModeChange)="onDarkModeChange($event)"
    />
  `,
})
export class HostComponent {
  language: Language = "en";
  numbering: NumberingSystem = "FDI";
  darkMode = false;

  onLanguageChange(lang: Language) { this.language = lang; console.log(lang); }
  onNumberingChange(system: NumberingSystem) { this.numbering = system; console.log(system); }
  onDarkModeChange(dark: boolean) { this.darkMode = dark; console.log(dark); }
}
```

**Dark mode integration:**
- **Standalone mode:** Omit `darkMode` — the component manages its own theme state via the topbar toggle button and adds/removes the `.dark` class on the host's root element.
- **Controlled mode:** Bind `[darkMode]` and `(darkModeChange)` — the parent app controls the theme. The toggle button still appears but emits `darkModeChange` instead of managing internal state. The parent is responsible for adding/removing the `.dark` class on `<html>`.

**Custom theme:**
```ts
@Component({
  template: `<aao-odontogram-shell [themeConfig]="theme" />`,
})
export class ThemedHostComponent {
  readonly theme = {
    colors: {
      accent: "#e74c3c",
      background: "#fafafa",
      text: "#222222",
    },
  };
}
```

**Plugin integration:**
```ts
import type { OdontogramPlugin } from "angular-advanced-odontogram";
import { setPluginState } from "angular-advanced-odontogram";

const myPlugin: OdontogramPlugin = {
  id: "implant-brand",
  label: { en: "Implant Brand", hu: "Implantátum márka" },
  layer: "overlay",
  renderSvg: (toothNo, _quadrant, state) => {
    if (!state) return null;
    return `<text x="16" y="60" font-size="6" fill="#3b7bff">${state}</text>`;
  },
};

// <aao-odontogram-shell [plugins]="[myPlugin]" />

// Set plugin state for a tooth:
setPluginState(11, "implant-brand", "Straumann");
```

Plugin `renderSvg()` output is sanitized with DOMPurify (SVG profile) before insertion into the live chart — see [Security notes](#-security-notes).

### 🧪 Testing

The suite is split across **two runners**, and both must pass (`npm test` runs both, in order):

```bash
npm run test:corpus   # plain Vitest — the shared clinical-engine core
npm run test:ng       # Angular's Vitest builder — the Angular shell (ng test)
npm test              # both, in order
npm run test:watch    # watch mode (corpus runner)
```

- **`test:corpus`** (`vitest run`) exercises `projects/angular-advanced-odontogram/src/lib/core/` — the shared clinical-engine core — against the ported test corpus (100+ spec files under `core/__tests__/`). This is where the SVG-rendering, FHIR-export and JSON-round-trip **golden fixtures** live and are checked byte for byte: `parity/svg-fingerprints.json`, `parity/fhir-golden.json`, `parity/roundtrip-golden.json`, `parity/shell-dom-golden.html`.
- **`test:ng`** (`ng test angular-advanced-odontogram --watch=false`, Angular's `@angular/build:unit-test` Vitest integration) runs the Angular shell's own `*.spec.ts` specs — components, services, directives — asserting DOM parity: the shell renders the same ids, classes and markup as the original React components.

Because this builder's Vitest integration doesn't support `vi.mock()`/`vi.spyOn()` for relative-path module mocking, DOM-touching side effects (`initOdontogram`/`destroyOdontogram`, `exportPdf`) are overridden via the `ODONTOGRAM_ENGINE_LIFECYCLE`/`EXPORT_PDF_FN` injection tokens and Angular `TestBed`'s provider array instead — see [DI seams for host testing](#-use-as-an-npm-package) above.

### 📖 API Documentation
```bash
npm run docs           # Generate TypeDoc docs in docs/api/
```
The shared clinical-engine API is also documented in the original project:

📚 **https://zoliqua.github.io/React-Advanced-Odontogram/**

### 📡 Public API

**Component inputs/outputs:** see [Component inputs](#-use-as-an-npm-package) above for the full table.

**Exported functions for external control** (curated subset — the full, typed surface is in the bundled `.d.ts`):

| Function | Description |
|---|---|
| `initOdontogram()` / `destroyOdontogram()` | Initialize/clean up the engine (called internally by `OdontogramShellComponent`/`OdontogramUiService` via the `ODONTOGRAM_ENGINE_LIFECYCLE` token) |
| `setNumberingSystem(system)` | Switch between FDI, UNIVERSAL, PALMER |
| `clearSelection()` | Deselect all teeth |
| `getSelectedTeeth()` | Currently selected teeth (FDI numbers), in selection order |
| `registerPlugins(plugins)` | Register custom SVG plugins |
| `setPluginState(toothNo, pluginId, value)` / `getPluginState(toothNo, pluginId)` | Set/get a plugin's custom state for a tooth |
| `getToothStateSummary(toothNo)` | Get localized summary of all active states |
| `getOdontogramSummary()` | Get a structured, localized text summary of the whole chart (counts, sections, planned changes) |
| `onStateChange(callback)` | Subscribe to state changes; returns an unsubscribe function |
| `setReadOnly(value)` / `getReadOnly()` | Enable/disable / query read-only mode |
| `setNotesEnabled(value)` / `getNotesEnabled()` | Enable/disable / query per-tooth notes |
| `setPulpDetailLevel(level)` / `getPulpDetailLevel()` | Set/get the pulp picker's vocabulary — `"simple"`, `"aae"`, or `"latin"` |
| `getToothAnatomy()` / `setToothAnatomy(v)` | Get/set the tooth anatomy profile — `"classic"` or `"measured"` |
| `getChartMode()` / `setChartMode(mode)` | Get/switch the active chart — `"status"` or `"plan"` (the plan chart is deep-copied from status the first time it's entered) |
| `getStatusChart()` / `getPlanChart()` / `setPlanChart(payload)` | Read the status/plan chart payloads independently of the active chart, or replace the plan chart's teeth |
| `getPlanChanges()` | Get the structured status→plan diff (`{ toothNo, axis, from, to }[]`) |
| `setPerioSite(toothNo, site, patch)` / `getToothPerio(toothNo)` | Set/get periodontal data for one of the six sites (`patch` = `{ pd?, gm?, bop?, sup? }`) |
| `getToothCal(toothNo)` | Get derived per-site CAL for a tooth |
| `getPerioSummary()` | Whole-mouth periodontal aggregates: charted-site count, bleeding count, %BOP, worst CAL, max PD |
| `getPerioChart()` | Get the active chart's per-tooth periodontal records |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Programmatically open/close/query the perio-chart overlay |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Get/set how the perio chart is surfaced — `"toggle"` or `"popup"` |
| `getPerioClassification()` | Get the 2017 World Workshop periodontal classification (`{diagnosis, stage, grade, extent, derived, overridden}`) |
| `setDiagnosisOverride(v)` / `setStageOverride(v)` / `setGradeOverride(v)` / `setExtentOverride(v)` | Override a derived periodontal classification axis, or `null` to revert to derived |
| `getCaseMeta()` / `resetCaseMeta()` | Get/reset the case-level metadata object (age, smoking/diabetes status, patient identity, exam date, …) |
| `setPatientName(v)` / `setPatientDob(v)` / `setExamDate(v)` | Set case identity fields (PDF-report header only — never part of the FHIR export) |
| `getToothDiagnoses(toothNo)` | Get a tooth's ICD-10-coded diagnoses, as derived by the clinical-axis rules |
| `getActiveDiagnoses()` | Get the effective diagnosis rows (derived − suppressed + added) for the currently selected tooth, plus the addable-diagnosis catalog — `DiagnosesCardComponent`'s view-model |
| `addDiagnosisToSelection(key)` / `removeDiagnosisFromSelection(key)` | Add/remove a diagnosis for the current tooth selection by writing its underlying chart finding |
| `setDxOverrideForSelection(key, mode)` | Force a diagnosis override on the current selection — `"add"`, `"suppress"`, or `null` to clear |
| `getDiagnosisCodingPack()` / `setDiagnosisCodingPack(id)` | Get/set the national coding-pack overlay on top of WHO ICD-10 — `"none"`, `"bno10"` (Hungarian NEAK titles) or `"icd10cm"` (US) |
| `getSnomedEnabled()` / `setSnomedEnabled(v)` | Get/set the opt-in SNOMED CT coding overlay |
| `getCaseConditions()` / `setCaseCondition(key, laterality)` | Get/set whole-mouth case/regional diagnoses (malocclusion & TMJ, oral cysts, salivary-gland disease, stomatitis & oral mucosa, arch-level developmental anomalies), each with a laterality — `null` clears, or `"left"`/`"right"`/`"bilateral"` |
| `exportFhir(options?)` | Export the chart as an HL7 FHIR R4 collection Bundle (JSON download); optional `{ subject }` reference |
| `importFhirBundle(input)` | Import a FHIR R4 Bundle (object or JSON string) produced by this module |
| `exportImage(format)` | Download the chart as an image — `"png"` or `"jpg"` |
| `exportSvg()` | Download the chart as a scalable SVG (vector) |
| `hasAnyPerioData()` | `true` iff any periodontal axis is charted anywhere in the mouth |
| `exportPerioSvg()` / `exportPerioImage(format)` | Download the full periodontal chart as a standalone vector SVG or a rasterized image |
| `exportPdf(opts)` | Download a jsPDF-native PDF report (see [Export](#-export) below) |
| `getPdfSettings()` / `setPdfSettings(patch)` | Get/patch the PDF report's configuration (`PdfSettings`) |
| `exportStatus()` | Download the status chart as JSON |
| `importStatus(data)` | Hydrate the engine from a previously exported JSON payload (see [Status Export/Import Format](#-status-exportimport-format)) |
| `setImportFormat(format)` | Set the next file import's parser — `"status"` or `"fhir"` |
| `startIntroTour()` | Launch the interactive intro tour |

### 💾 State persistence (localStorage)

Opt-in `localStorage` persistence for the odontogram's case state (`core/persistence.ts`, re-exported from the package entry point). Disabled by default — existing integrations are unaffected unless a host app explicitly enables it, and it should be called **after** the odontogram has mounted (e.g. from a component's `ngAfterViewInit()`, after `OdontogramShellComponent`/`OdontogramUiService` has called `init()` — restore repaints the live DOM via `importStatus()`):

```ts
import {
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,
} from "angular-advanced-odontogram";

enablePersistence({
  key: "my-app-odontogram",   // default: "react-advanced-odontogram" (the shared core's own default key)
  includePlan: true,          // also persist the plan chart; default: false
  onError: (err) => console.error("odontogram persistence:", err),
});
```

| Function | Description |
|---|---|
| `enablePersistence(options?)` | Restores a previously saved case (if any) via `importStatus()`, then saves the status chart to `localStorage` on every settled state change (edits are debounced ~400 ms so a burst of changes — e.g. a status preset — produces one write). Idempotent — calling it again replaces the previous subscription/options. **Must be called after the odontogram has mounted.** |
| `disablePersistence()` | Stops persisting (flushes any pending debounced save first); the stored entry is left in place. |
| `clearPersistedState()` | Removes the stored entry for the active (or default) key. |
| `isPersistenceEnabled()` | `true` while a state-change subscription is active. |

**`PersistenceOptions`:**

| Field | Type | Default | Description |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | The `localStorage` key — this is the shared core module's own literal default (unchanged by the Angular port); pass your own `key` to avoid colliding with a React-side integration on the same origin, or to namespace multiple hosts. |
| `includePlan` | `boolean` | `false` | Also persist the plan chart (the payload's `plan` field). |
| `onError` | `(err: Error) => void` | — | Called on any storage/parse error instead of `console.warn`. |

Notes: nothing is read from or written to `localStorage` unless `enablePersistence()` is called; a 4 MB size guard skips an oversized save (reported via `onError`/`console.warn`) rather than throwing; every storage/JSON failure — quota exceeded, a locked-down iframe, corrupt or unrecognized stored data, etc. — is caught and reported. This module never throws.

Note: enabling persistence restores the saved case via `importStatus()`, which replaces the current case — including an in-progress plan chart if the saved payload has none. Enable persistence at startup (right after mount), not mid-session.

Note: the persisted payload can include patient-identifying case data (patient name, exam date) in plaintext `localStorage`. If you chart such data, ensure device-level protection or clear it with `clearPersistedState()` when appropriate.

### 💾 Status Export/Import Format
The export creates a JSON file (version `2.22`; imports also accept legacy `1.4` and `2.0` through `2.21` and migrate automatically) containing:

**Global fields:**
- `wisdomVisible` - wisdom teeth visible
- `showBase` - bone layer visible
- `occlusalVisible` - occlusal view active
- `showHealthyPulp` - healthy pulp visible
- `edentulous` - edentulous mode active

**Per-tooth fields (32 teeth):**
- `toothSelection` - base tooth type
- `toothSubstrate` - tooth substrate (natural/radix/broken/crownprep), orthogonal to any restoration
- `restorationType` - restoration type (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - restoration material (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), paired with `restorationType`
- `prosthesis` - removable/attachment axis (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), mutually exclusive with a fixed `restorationType` of crown/bridge
- `crownLeakage` - crown marginal-leakage flag, meaningful only when `restorationType` is crown or bridge
- `endo` - endodontic state; mutually exclusive with `pulpDx`
- `mods` - modifications array (inflammation, parodontal); `inflammation` applies only to missing/extraction-socket teeth
- `caries` - active caries surfaces
- `cariesActiveDepth` - the ICDAS depth value staged by the caries-depth picker when a new surface is applied
- `rootCaries` - root caries severity (none/active/arrested/active-cavitated)
- `cariesSeverity` - unified per-surface severity (0-6): ICDAS depth on a primary (unfilled) surface, CARS score on a recurrent (filled) surface
- `radiographicDepth` - per-surface radiographic caries depth (none/E1/E2/D1/D2/D3), independent of the visual ICDAS/CARS scale
- `fillingMaterial` - filling material
- `fillingSurfaces` - filled surfaces
- `fillingSurfaceMaterials` - per-surface filling material (mixed fillings, e.g. buccal amalgam + distal composite)
- `fillingDefect` - per-surface filling defect (none/marginal/fracture/wear), filled-surface-gated, independent of recurrent caries
- `pulpDx` - AAE pulp diagnosis (normal/reversible-pulpitis/irreversible-pulpitis/necrosis)
- `pulpLatin` - practical-Latin pulp subtype (shown by the pulp picker only when `pulpDetailLevel` is `latin`)
- `apicalDx` - apical diagnosis driving the periapical glyph
- `periapicalType` - periapical lesion subtype (none/granuloma/cyst); legacy `abscess` still accepted on import
- `resorptionType` - root resorption type (none/internal/external-cervical)
- `periImplant` - implant-only peri-implant status (none/mucositis/peri-implantitis-mild/-moderate/-severe), 2018 World Workshop staging
- `dxOverrides` - per-tooth diagnosis-coding overrides (version 2.21): an object keyed by ICD-10 diagnosis key → `add` | `suppress`, forcing a coded diagnosis on despite no matching chart finding, or off despite one; shapes the effective coded set exported as FHIR `Condition`s
- `endoResection` - apicoectomy flag
- `fissureSealing` - fissure sealant flag
- `calculus` - calculus flag
- `contactMesial` / `contactDistal` - mesial/distal contact point loss
- `wearEdge` - incisal/occlusal wear type (none/attrition/erosion)
- `wearCervical` - cervical wear type (none/abrasion/abfraction/erosion)
- `discoloration` - per-tooth discoloration cause (none/tetracycline/fluorosis/nonvital/extrinsic/other)
- `orthoAppliance` - orthodontic appliance (none/bracket/band)
- `orthoDrift` - orthodontic drift (none/mesial/distal)
- `orthoVertical` - orthodontic vertical movement (none/extrusion/intrusion)
- `orthoRotation` - orthodontic rotation flag
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - fracture locations
- `extractionWound` - post-extraction wound
- `extractionPlan` - planned extraction
- `parapulpalPin` - parapulpal pin flag
- `bridgePillar` - bridge abutment tooth
- `mobility` - mobility grade (none/m1/m2/m3)
- `crownNeeded` - crown needed indicator
- `crownReplace` - crown replacement needed indicator
- `missingClosed` - gap closed after extraction
- `customStates` - plugin custom states (object, keyed by plugin ID)
- `note` - per-tooth text note (string, optional — only present when non-empty)

**Top-level `plan` field (version 2.11+):**
- `plan` - optional object, same shape as `teeth` (per-tooth fields above), holding the **plan** (intended post-treatment) chart. Present only when the plan chart has been initialized AND its content differs from the status chart. On import, an absent `plan` clears/uninitializes the plan chart; a present `plan` restores the plan chart alongside status. Also readable/writable independently via `getPlanChart()`/`setPlanChart()`.

**Top-level `case` field (version 2.17+, extended in 2.18, 2.19, 2.20 and 2.22):**
- `case` - optional object holding case-level (not per-tooth) metadata, shared by both the status and plan charts. Omit-when-empty. Fields (each omitted when at its default): `age`; `smokingStatus` (+ `cigarettesPerDay`); `diabetesStatus` (+ `hba1c`); `toothLossPerio`; `maxRblPercent`; the four 2017-classification per-axis clinician overrides `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`; `patientName` / `examDate`; `patientDob`; and (version 2.22) `caseConditions` — case/regional diagnoses (malocclusion & TMJ K07, oral cysts K09, salivary-gland disease K11, stomatitis & oral mucosa K12/K13, arch-level developmental K00), each mapped to a laterality (unspecified/left/right/bilateral). Read/written via `getCaseMeta()`/`getCaseConditions()` and the `set*`/`setCaseCondition()` setters above. Patient name, date of birth and exam date are chart-identity metadata only — they are **not** part of the FHIR export.

### 🖨️ Export
`exportFhir()` is HL7-validator-clean: every Bundle entry carries a deterministic `id` and an absolute `fullUrl` (no `urn:uuid` placeholders), and the Bundle embeds the engine's own CodeSystem so its local codes resolve during validation (also published under `projects/angular-advanced-odontogram/src/lib/fhir/`; pass `includeCodeSystem: false` to omit it).

Periodontal data now round-trips through FHIR import too, not only through the JSON payload: `importFhirBundle()` reads the LOINC `74029-0` periodontal panels back into each tooth's perio record — probing depth, gingival margin (reconstructed from CAL, so pseudopocket values survive), BOP, furcation, O'Leary plaque, the PI/GI and implant mPI/mBI indices and keratinized-gingiva width — plus the case-level smoking-status and HbA1c evidence Observations. Suppuration is the one exception: it stays JSON-only, since it is not part of the FHIR export.

Beyond the odontogram's own Status JSON / FHIR / PNG / JPG / SVG export, the **periodontal chart** has its own export path:
- **Perio SVG/PNG/JPG:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` render the full perio chart as one standalone vector SVG, independent of the mounted `PerioChartComponent` DOM. Disabled whenever `hasAnyPerioData()` is false.
- **PDF report:** the export menu's "PDF report…" item opens `ExportOptionsModalComponent` — a settings dialog (patient name + date of birth + exam date fields, wired straight to the case metadata, with exam date defaulting to today; section checkboxes: patient data, odontogram chart, odontogram description, individual notes — disabled when no tooth has a note — perio status, perio description) before calling `exportPdf(opts)` through the `EXPORT_PDF_FN` injection token. Empty identity fields fall back to placeholders (`"John Doe"` / `"1980-01-01"`, configurable via `PdfSettings.defaultName`/`defaultDob`) so export always succeeds. The PDF is assembled jsPDF-natively — vector text via `.text()`, raster tooth/perio-chart images via `.addImage()` — with no `svg2pdf.js` dependency. The individual-notes section is auto-skipped when no tooth has a note, and the two perio sections whenever `hasAnyPerioData()` is false, regardless of the dialog's checkboxes.
- **Report configuration (`PdfSettings`, Settings → Export tab, get/set via `getPdfSettings()`/`setPdfSettings(patch)`):** default patient name/DOB, whether to show age, date format (ISO/DMY/MDY), color theme (blue/teal/amber/slate), odontogram bone/pulp visibility, tooth spacing/border/tooth-number size on the chart image, whether to include the prose description and the findings table, matching perio-chart spacing/label-placement/font-size options and whether to include the perio metrics table and the abbreviation glossary, a medical disclaimer (default text or custom), a generator/version stamp, and the dentition-summary grouping (whole mouth / jaw / quadrant / sextant — also drives the on-screen Tooth-information panel table).
- **mPI/mBI implant-gating:** the peri-implant Mombelli indices (mPI/mBI) only render as rows in an arch that contains at least one implant tooth — on both the live perio chart and the SVG/PDF exports.
- Patient name, date of birth and exam date are chart-identity metadata only (payload `2.20`, additive) — they are **not** part of the FHIR export.

### 📁 Folder Structure
- `projects/angular-advanced-odontogram/src/public-api.ts` - the package's public entry point (every export re-exported from here)
- `projects/angular-advanced-odontogram/src/lib/core/odontogram.ts` - the framework-free clinical engine: SVG layering, tooth state management, touch interactions, plugin overlays, settings, export/import
- `projects/angular-advanced-odontogram/src/lib/core/persistence.ts` - opt-in localStorage persistence
- `projects/angular-advanced-odontogram/src/lib/core/theme.ts` - `OdontogramThemeConfig` type and `applyThemeConfig()` utility
- `projects/angular-advanced-odontogram/src/lib/core/plugin.ts` - `OdontogramPlugin` type, `PluginLayer`, `getQuadrant()`, `LAYER_Z` z-index priorities
- `projects/angular-advanced-odontogram/src/lib/core/pluginSanitize.ts` - `sanitizePluginSvg()`, the DOMPurify-backed sanitizer a plugin's `renderSvg()` output passes through before insertion into the live chart
- `projects/angular-advanced-odontogram/src/lib/core/tour.ts` - the guided intro tour
- `projects/angular-advanced-odontogram/src/lib/core/perioClassification.ts` - 2017 World Workshop periodontal classification derivation
- `projects/angular-advanced-odontogram/src/lib/core/perioExport.ts` / `perioGraphic.ts` / `perioIndexNames.ts` - the full-mouth perio chart's SVG rendering
- `projects/angular-advanced-odontogram/src/lib/core/perioPdf.ts` - the PDF report's pure jsPDF assembler (`assemblePdf`)
- `projects/angular-advanced-odontogram/src/lib/core/status_extras.ts` - 22 predefined restoration templates
- `projects/angular-advanced-odontogram/src/lib/core/i18n/` - translations, one lazily-loaded module per language under `i18n/locales/` (English static, the other 11 fetched via `i18n/loader.ts` on first use) and the framework-free i18n bus
- `projects/angular-advanced-odontogram/src/lib/core/dx/` - standards-based diagnosis coding: derivation rules (`derive.ts`), the ICD-10 diagnosis catalog (`codes.ts`/`caseCodes.ts`), national coding packs — BNO-10/ICD-10-CM (`packs.ts`) — and the ICD-10-CM/SNOMED CT refinement layer (`refine.ts`)
- `projects/angular-advanced-odontogram/src/lib/core/anatomy/` - tooth-anatomy profiles (`classic`/`measured`); the `measured` literature-measured templates (`measured.ts`) load as a separate lazy chunk
- `projects/angular-advanced-odontogram/src/lib/core/utils/numbering.ts` - FDI, Universal, Palmer numbering conversion
- `projects/angular-advanced-odontogram/src/lib/core/registry/` - declarative clinical-axis registry: FHIR field mappings, SVG-clear-set/boolean-flag activation, restoration type×material matrix, UI option lists
- `projects/angular-advanced-odontogram/src/lib/core/fhir/` - HL7 FHIR R4 export/import: `toFhir.ts`/`fromFhir.ts`, `toFhirDx.ts`/`importConditions.ts` (diagnosis Conditions), `importPerio.ts` (periodontal Observations), code systems, field mappings, primitives
- `projects/angular-advanced-odontogram/src/lib/fhir/` - the published `CodeSystem-odontogram.json` plus the generated `ValueSet-odontogram-*.json` set (one per clinical-axis value group, one for finding types, one all-codes set)
- `projects/angular-advanced-odontogram/src/lib/core/bridgeOverlay.ts` - multi-tooth bridge-span connector overlay
- `projects/angular-advanced-odontogram/src/lib/core/fonts/` - bundled PDF Unicode fonts (Arabic shaping, CJK) + the font loader
- `projects/angular-advanced-odontogram/src/lib/core/assets/` - SVG tooth/icon source files (`teeth-svgs/`, `teeth-svgs/measured/`, `icon-svgs/`)
- `projects/angular-advanced-odontogram/src/lib/core/generated/` - the SVGs compiled into inline TypeScript modules (`npm run gen:assets`)
- `projects/angular-advanced-odontogram/src/lib/core/__tests__/` + `registry/__tests__/` - the ported test corpus, incl. the `parity/` golden fixtures
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/` - `OdontogramShellComponent`, the all-in-one shell
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-ui.service.ts` - `OdontogramUiService`, the composable-UI state/effects layer
- `projects/angular-advanced-odontogram/src/lib/components/engine-state.ts` - the `engineState()` signal helper
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-engine-lifecycle.ts` - the `ODONTOGRAM_ENGINE_LIFECYCLE` DI token
- `projects/angular-advanced-odontogram/src/lib/components/surfaces/` - the four presentational surfaces (topbar, chart, tooth-info, tooth-controls) and, under `surfaces/cards/`, the eight declarative control cards (incl. `DiagnosesCardComponent`)
- `projects/angular-advanced-odontogram/src/lib/components/settings-modal/` - `SettingsModalComponent` (7-tab settings dialog)
- `projects/angular-advanced-odontogram/src/lib/components/export-options-modal/` - `ExportOptionsModalComponent` and the `EXPORT_PDF_FN` DI token
- `projects/angular-advanced-odontogram/src/lib/components/credits-modal/` - `CreditsModalComponent`
- `projects/angular-advanced-odontogram/src/lib/components/case-diagnoses-modal/` - `CaseDiagnosesModalComponent`, the whole-mouth case/regional diagnoses pop-up
- `projects/angular-advanced-odontogram/src/lib/components/perio-chart/` / `perio-sidebar/` - the standalone/inline periodontal chart and its context sidebar
- `projects/angular-advanced-odontogram/src/lib/components/dual-state-confirm/` - the shared confirm dialog (status↔plan-affecting edits)
- `projects/angular-advanced-odontogram/src/lib/components/shared/dialog-focus.ts` - shared modal focus-trap/restore helpers
- `projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.ts` - `I18nService`, the reactive Angular facade over the core i18n bus
- `projects/demo/` - the demo Angular application (`ng serve` / `npm run build:demo`)
- `scripts/generate-svg-assets.mjs` - the `npm run gen:assets` generator

### ⚙️ Tech Stack
- Angular 21 (standalone components, signals) + Angular CLI (`@angular/build`) + TypeScript
- `ng-packagr` for the library build (`ng build angular-advanced-odontogram`)
- Tailwind CSS for UI styling, compiled once to a static stylesheet (`npm run build:styles` → `projects/angular-advanced-odontogram/styles.css`) — consumers register that stylesheet, they do not run Tailwind themselves
- SVG layering via DOM manipulation in the framework-free core (non-Angular-reactive state for performance — the same engine the React original uses)
- A lightweight, framework-free custom i18n system (`core/i18n/`), wrapped by `I18nService` for reactive Angular template binding
- Dual test runners: plain Vitest for the core corpus (`vitest run`), Angular's `@angular/build:unit-test` Vitest integration for the component specs (`ng test`); `@testing-library/jest-dom` for DOM matchers
- TypeDoc for API documentation (`npm run docs`, output `docs/api/`)
- jsPDF for the PDF report; DOMPurify for plugin-output sanitization

### 📝 Notes
- SVG templates and icons are compiled into generated TypeScript modules at build time (`npm run gen:assets`) — there is no runtime asset fetch and nothing to serve from a public folder.
- The odontogram engine uses its own internal, framework-free state (not Angular signals) for the SVG grid, for performance and to stay identical to the React original; Angular components read it reactively through `engineState()`/`I18nService`/`onStateChange()` instead of owning it themselves.
- Milk teeth have a reduced set of available materials (no amalgam fillings, no pin-based endo).
- Implant teeth have a different set of crown/abutment options than natural teeth.

### 🔒 Security notes

- **Plugins run as trusted code.** A plugin's `renderSvg()` return value is injected into the live chart's SVG. That output is sanitized with [DOMPurify](https://github.com/cure53/DOMPurify) (SVG profile, plus `svgFilters`) before insertion — `<script>`, `<iframe>`, `<object>`, `<embed>` and `<foreignObject>` are forbidden outright, and wholly-malicious output is dropped rather than partially rendered. This reduces the blast radius of a compromised or buggy plugin, but plugins should still only be loaded from sources you trust — sanitization is a safety net, not a substitute for vetting.
- **Content-Security-Policy.** This package does not inject a CSP of its own when embedded as a library. Host applications rendering `OdontogramShellComponent` should set their own CSP appropriate to their deployment; a reasonable baseline mirrors the original React project's demo policy:

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

### 📖 How to cite

This package has no citation record of its own — it is a port that shares its clinical engine, verbatim, with the original project. If you use this software in research, please cite the original:

> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**All versions (concept DOI):** https://doi.org/10.5281/zenodo.21156787

Machine-readable citation metadata is in the original project's [`CITATION.cff`](https://github.com/ZoliQua/React-Advanced-Odontogram/blob/main/CITATION.cff).

## 🙌 Credits

Angular Advanced Odontogram is created and maintained by Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), the creator and lead developer of this port and of the underlying clinical engine. The same in-app popup (topbar → "About and credits") lists these names.

**Original project**

- [React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram) (npm: [`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)): the original React implementation this package is a port of — the clinical engine (dental status logic, periodontal charting, diagnosis coding, FHIR export/import, i18n strings, tour, SVG templates) is shared, verbatim.

**Built with** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [Angular](https://angular.dev), [Angular CLI](https://angular.dev/tools/cli), [TypeScript](https://www.typescriptlang.org) and [Tailwind CSS](https://tailwindcss.com).

Contributions are welcome — see [`CONTRIBUTING.md`](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/CONTRIBUTING.md). If this project is useful to you, please [star it on GitHub](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
