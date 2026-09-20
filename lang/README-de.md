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

> 🌐 **Languages:** 🇬🇧 [English](README-en.md) | 🇭🇺 [Magyar](README-hu.md) | 🇩🇪 Deutsch (diese Datei) | 🇪🇸 [Español](README-es.md) | 🇫🇷 [Français](README-fr.md) | 🇮🇹 [Italiano](README-it.md) | 🇵🇱 [Polski](README-pl.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇷🇺 [Русский](README-ru.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md)

---

## 📑 Inhaltsverzeichnis

- [📋 Übersicht](#-übersicht)
- [📦 Als npm-Paket verwenden](#-als-npm-paket-verwenden)
- [✨ Hauptmerkmale](#-hauptmerkmale)
- [📦 Module](#-module)
- [🛠️ UI-Steuerung](#-ui-steuerung)
- [🦷 Zahntypen und Zustände](#-zahntypen-und-zustände)
- [⚙️ Einstellungen](#-einstellungen)
- [🖼️ SVG-Vorlagensystem](#-svg-vorlagensystem)
- [🔢 Nummerierungssysteme](#-nummerierungssysteme)
- [🚀 Verwendung](#-verwendung)
- [🔗 Integration](#-integration)
- [🧪 Tests](#-tests)
- [📖 API-Dokumentation](#-api-dokumentation)
- [📡 Öffentliche API](#-öffentliche-api)
- [💾 Zustandspersistenz (localStorage)](#-zustandspersistenz-localstorage)
- [💾 Status Export-/Importformat](#-status-export-importformat)
- [🖨️ Export](#-export)
- [📁 Ordnerstruktur](#-ordnerstruktur)
- [⚙️ Technologie-Stack](#-technologie-stack)
- [📝 Hinweise](#-hinweise)
- [🔒 Sicherheitshinweise](#-sicherheitshinweise)
- [📖 Zitierung](#-zitierung)

## 🇩🇪 Deutsch

### 📋 Übersicht

Dieses Projekt ist ein interaktiver, browserbasierter Odontogramm-Editor für **Angular + TypeScript**, der eine schnelle Zahnstatuserfassung mit einer übersichtlichen Benutzeroberfläche unterstützt. Es rendert geschichtete SVG-Zahnvorlagen zur Darstellung von Restaurationen, Karies, endodontischem Status, Mobilität und anderen klinischen Details, und bietet Mehrfachauswahl, Auswahlfilter und vordefinierte Statusvorlagen.

**Dies ist der offizielle Angular-Port von [React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram)** (npm: [`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)). Funktionsparität mit react-advanced-odontogram **v2.6.0** (Engine-Commit `215c43a`), Payload-Version **2.22** — JSON- und FHIR-R4-Exporte sind zwischen beiden Bibliotheken wechselseitig kompatibel. Die klinische Engine (`projects/angular-advanced-odontogram/src/lib/core/`) wird wortwörtlich geteilt — die Zahnstatuslogik, die parodontale Erfassung, die Diagnosekodierung, der FHIR-Export/-Import, die i18n-Strings, die geführte Tour und die SVG-Vorlagen sind byte-identisch mit dem React-Original und werden bei jedem Resync erneut aus einem fixierten Upstream-Commit kopiert; lediglich die Komponentenhülle (`projects/angular-advanced-odontogram/src/lib/components/`) ist Angular-nativ. Es existiert eine kleine, explizit dokumentierte Menge an Abweichungen (nur Marken-/Identitätstexte — siehe die Port-Design-Spezifikation in diesem Repository). Die Versionierung läuft im Gleichschritt mit dem React-Modul.

---
![Odontogram editor preview](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_de_odontogram.png)
*Screenshot aus dem ursprünglichen React-Projekt — der Angular-Port rendert dieselbe Oberfläche.*

🔗 **Live-Demo:** https://angular-advanced-odontogram.vercel.app/

---

### 📦 Als npm-Paket verwenden

Das Odontogramm wird als eigenständige Angular-Komponentenbibliothek auf npm veröffentlicht:
[`angular-advanced-odontogram`](https://www.npmjs.com/package/angular-advanced-odontogram).

#### Voraussetzungen
- **Angular 21.2+** (als Peer-Dependency deklariert — wird von Ihrer App bereitgestellt).
- Ein **Bundler**, der das `exports`-Feld und ESM versteht — die Angular CLI (`@angular/build`) erfüllt dies nativ. Das Paket ist **nur ESM**.
- Node **≥ 20** für das Tooling.

#### Installation

```bash
npm install angular-advanced-odontogram
```

#### Grundlegende Verwendung

Registrieren Sie das Stylesheet **einmal**, wo auch immer die globalen Styles Ihrer App konfiguriert sind (z. B. `angular.json`):

```json
"styles": [
  "node_modules/angular-advanced-odontogram/styles.css",
  "src/styles.css"
]
```

Rendern Sie dann `OdontogramShellComponent`:

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

`language` akzeptiert `hu | en | de | es | it | sk | pl | ru | pt-br | zh | ar | fr`; `numberingSystem` akzeptiert `FDI | UNIVERSAL | PALMER`.

#### Komponenten-Eingaben

`OdontogramShellComponent` ist eine kontrollierte Komponente — jede Eingabe ist ein Angular-`input()`-Signal, alle optional, jede fällt auf den eigenen Standardwert der Engine zurück, wenn sie weggelassen wird. Die gebräuchlichsten:

| Input | Typ | Standard | Beschreibung |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | UI-Sprache (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`zh`/`ar`/`fr`). |
| `numberingSystem` | `"FDI" \| "UNIVERSAL" \| "PALMER"` | `"FDI"` | Zahnnummerierungssystem. |
| `darkMode` | `boolean` | `false` | Umschalter für dunkles Design. |
| `readOnly` | `boolean` | `false` | Deaktiviert jegliche Bearbeitung (nur Ansicht). |
| `themeConfig` | `OdontogramThemeConfig` | — | Überschreibt Theme-CSS-Variablen (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Registriert benutzerdefinierte Zustands-Plugins / zusätzliche Ebenen. |
| `enableNotes` | `boolean` | `false` | Aktiviert Notizen pro Zahn. |
| `enableIcdas` | `boolean` | `false` | Aktiviert ICDAS-II-Kariesbewertung. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Komplexität der Füllungs-Karte: `"simple"` (ein Material pro Zahn) oder `"complex"` (Materialien pro Fläche). |
| `fillingDefectEnabled` | `boolean` | `true` | Aktiviert Füllungsdefekt-Befunde auf der Füllungs-Karte. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | alle verfügbar | Verfügbare Füllungsmaterialien als boolesche Zuordnung über `amalgam`/`composite`/`gic`/`temporary` (unbekannte Schlüssel werden ignoriert). |
| `fissureSealingEnabled` | `boolean` | `true` | Aktiviert die Fissurenversiegelung auf der Füllungs-Karte. |
| `languageChange` / `numberingChange` / `darkModeChange` (Outputs) | `output<T>` | — | Werden ausgelöst, wenn der Benutzer die Einstellung über die UI ändert. |
| `fillingComplexityChange` / `fillingDefectEnabledChange` / `fillingMaterialAvailabilityChange` / `fissureSealingEnabledChange` (Outputs) | `output<T>` | — | Werden ausgelöst, wenn der Benutzer die entsprechende Einstellung über Einstellungen → Füllungen ändert. |

Feiner granulare Detailstufen-Eingaben (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `cariesDepthEnabled`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) werden ebenfalls akzeptiert — die vollständige, typisierte Liste finden Sie in `odontogram-shell.component.ts`.

Die vier Füllungs-Eingaben oben sind **reine Wiederherstellungs-Eingaben**: Eine weggelassene Eingabe schreibt nie in die Engine (ein imperativer `setFillingComplexity()`-Aufruf vor dem Mount bleibt erhalten), während eine bereitgestellte Eingabe Engine und Einstellungs-Modal-Zustand gemeinsam schreibt, sodass das Modal nie einen veralteten Wert anzeigt. `fillingMaterialAvailability` wird per Diff über einen kanonischen serialisierten Schlüssel angewendet — ein erneutes Rendern mit einem neuen Objekt-Literal identischen Inhalts schreibt die Engine nie neu. Die passenden `*Change`-Outputs werden über Einstellungen → Füllungen ausgelöst — der Rückschreibpfad für Hosts, die Präferenzen speichern.

#### Öffentliche API (benannte Exporte)

`OdontogramShellComponent` ist ein benannter Export. Die imperative Zustands-API, die eigenständige `PerioChartComponent`, die geführte Tour und alle öffentlichen Typen sind benannte Exporte desselben Einstiegspunkts:

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

Die vollständige Oberfläche (weit über 100 Funktionen und Typen — `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PdfSettings`, `PerioViewMode`, und viele mehr) ist in den mitgelieferten `.d.ts`-Deklarationen vollständig typisiert; die kuratierte Referenztabelle finden Sie unter [Öffentliche API](#-öffentliche-api) weiter unten.

#### Zusammensetzbare Oberflächen (fortgeschritten)

`OdontogramShellComponent` ist die unterstützte All-in-one-Komponente und benötigt keine zusätzliche Einrichtung. Wenn Sie die Bereiche des Odontogramms an verschiedenen Stellen Ihres eigenen Layouts platzieren müssen, werden die vier UI-Oberflächen der Shell ebenfalls exportiert und lassen sich unter einem einzigen `OdontogramUiService` zusammensetzen, wobei sie alle eine einzige, instanzeigene Sitzung teilen:

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

`OdontogramUiService` akzeptiert dieselbe Konfigurationsform wie die Eingaben von `OdontogramShellComponent` (die `configure()`-Methode akzeptiert ein `OdontogramUiConfig`-Objekt aus `Signal`s/Callbacks, jedes Feld optional mit demselben Upstream-Standardwert). Aktuelle Einschränkung: eine `OdontogramUiService`-Instanz pro Seite (die Engine ist ein Singleton auf Modulebene). Oberflächen können bei Bedarf ein- und ausgehängt werden. `OdontogramShellComponent` selbst ist unverändert — es ist genau diese Zusammensetzung in der Standardanordnung, wobei weiterhin jedes Feld explizit aus den eigenen Eingaben verdrahtet wird.

Für eine noch feinere Zusammensetzung werden auch die einzelnen Steuerungskarten exportiert:

| Komponente | Selektor | Deckt ab |
|---|---|---|
| `StatusesCardComponent` | `aao-statuses-card` | Ganzmund-Status-/Vorlagen-Steuerung (Zurücksetzen, Milch-/Wechselgebiss, zahnlos, Status-Extras) |
| `ToothDetailsCardComponent` | `aao-tooth-details-card` | Basis-Zeile (Zahnauswahl/-substrat), Checkboxen für gebrochene Krone, Umschalter „Krone erforderlich"/-wechsel |
| `CariesCardComponent` | `aao-caries-card` | Kariestiefe-Modus, Subkronal-Karies, Wurzelkaries-Schweregrad, Flächenauswähler für Karies |
| `FillingsCardComponent` | `aao-fillings-card` | Füllungsmaterial, Flächenauswähler für Füllungen + Defekte, Hinweise zu Sekundärkaries/Defekten |
| `RootPeriodontiumCardComponent` | `aao-root-periodontium-card` | Pulpa-/Endo-Status, apikale Diagnose, Resorption, Mobilität, periimplantärer Status |
| `OrthodonticsCardComponent` | `aao-orthodontics-card` | Apparatur, Drift, vertikale Bewegung, Rotation |
| `SurfaceCrossComponent` | `aao-surface-cross` | Das gemeinsame B/M/O/D/L-Kreuzauswahl-Widget, das intern von den Karies-/Füllungs-Karten verwendet wird |
| `DiagnosesCardComponent` | `aao-diagnoses-card` | Diagnosekodierung pro Zahn nach ICD-10/BNO-10/ICD-10-CM/SNOMED — die von einem Zahn abgeleiteten Diagnosen ansehen und kuratieren (eine abgeleitete unterdrücken, eine hinzufügen, die der Befund nicht abbildet) |

Jede Karte ist eine eigenständige deklarative Komponente, die die gemeinsame Sitzung über `inject(OdontogramUiService)` und den exportierten Helfer `engineState()` liest und schreibt (ein Signal-zurückgebendes Lesen eines beliebigen Engine-Getters, aktuell gehalten durch den eigenen Änderungsbenachrichtigungs-Bus des Kerns). Binden Sie nur die Karten ein, die ein bestimmtes Layout benötigt, in beliebiger Anordnung, unter einem einzigen `OdontogramUiService`. `CreditsModalComponent` (`aao-credits-modal`, das Popup „Über das Projekt und Danksagungen" der Kopfleiste) und `CaseDiagnosesModalComponent` (`aao-case-diagnoses-modal`, das Ganzmund-Popup für Fall-/Regionaldiagnosen) werden ebenfalls exportiert, für Hosts, die eines von beiden aus ihrem eigenen Öffnen-/Schließen-Zustand steuern möchten.

```ts
import { engineState, OdontogramUiService, getOdontogramSummary } from "angular-advanced-odontogram";

// Anywhere inside an injection context under an `OdontogramUiService`:
readonly summary = engineState(getOdontogramSummary); // Signal<OdontogramSummary>, kept fresh automatically
```

#### DI-Ansatzpunkte für Host-seitige Tests

Zwei `InjectionToken` ermöglichen es einer Host-App, seiteneffektbehaftete Engine-Aufrufe in ihren eigenen Tests zu überschreiben (beide fallen in Produktion standardmäßig auf den echten Engine-Aufruf zurück; beide sind `providedIn: "root"`):

| Token | Überschreibt | Form |
|---|---|---|
| `ODONTOGRAM_ENGINE_LIFECYCLE` | `initOdontogram()` / `destroyOdontogram()`, aufgerufen aus `ngAfterViewInit()`/`ngOnDestroy()` von `OdontogramShellComponent` | `{ init: () => Promise<void>; destroy: () => void }` |
| `EXPORT_PDF_FN` | `exportPdf(opts)`, aufgerufen aus `ExportOptionsModalComponent` beim Klick auf „Export" | `(opts: PdfExportOptions) => Promise<void>` |

Beide existieren, weil die echten Funktionen DOM/Canvas/`jsPDF`-Interna berühren, die eine headless Testumgebung nicht vollständig bereitstellen kann — überschreiben Sie sie über das Provider-Array des Angular-`TestBed` in den eigenen Komponententests einer Host-App.

#### Wichtige Hinweise & aktuelle Einschränkungen
- **Nur ESM** — das Paket veröffentlicht ein einzelnes ES-Modul (mit `ng-packagr` gebaut) plus seinen Typdeklarations-Einstiegspunkt. Es zielt auf die Bundler-Modulauflösung ab; es gibt keinen CommonJS-Build.
- **Das Stylesheet ist separat** — Sie **müssen** `angular-advanced-odontogram/styles.css` einmal registrieren; es wird nicht automatisch eingebunden. Das Styling ist globales CSS, das unter `.odontogram-root` skoped ist und von `--odon-*`-CSS-Variablen gesteuert wird.
- **SSR / nur clientseitig** — die Komponente liest beim Mounten das DOM, daher muss sie im Browser laufen; rendern Sie sie nur clientseitig.
- **Assets sind eigenständig** — die Zahn- und Icon-SVGs werden zur Build-Zeit in das Bundle eingebettet (generierte TypeScript-Module, `npm run gen:assets`); es gibt **keinen Laufzeit-Asset-Abruf**, den man konfigurieren müsste, und nichts Zusätzliches, das in den öffentlichen Ordner Ihrer App kopiert werden müsste.
- **Bedarfsgesteuertes Laden** — nur Englisch und die `classic`-Zahnanatomie-Grafik sind im initialen Bundle enthalten; die 11 anderen UI-Sprachtabellen und die Grafik des `measured`-Anatomieprofils sind separate Lazy-Chunks, die beim ersten Wechsel eines Hosts zu ihnen nachgeladen werden (`[language]` / `I18nService.setLanguage()`/das Sprachmenü bzw. `setToothAnatomy("measured")`/Einstellungen → Odontogramm → Zahnanatomie). Diese Aufteilung im Zuge des Resyncs hat den Haupt-Chunk der Demo von 3,12 MB auf 1,25 MB und die anfängliche Gesamtgröße von 3,21 MB auf 1,33 MB reduziert — nichts, das hostseitig konfiguriert werden müsste.
- **Eine Instanz pro Seite** in dieser Version — der Engine-Zustand ist ein Singleton auf Modulebene (wie im React-Original), daher würden zwei `<aao-odontogram-shell>`-Instanzen auf derselben Seite den Zustand eines einzigen Befunds gemeinsam nutzen.

---

### ✨ Hauptmerkmale
- 🖱️ Schnelle Auswahl und Mehrfachauswahl (CMD/CTRL + Klick)
- 🦷 Zahntypen: bleibend, Milchzahn, Implantat, subgingival, fehlend
- 🦷 Zahnsubstrat (unabhängig von jeder Restauration): natürlich, Radix (Wurzelrest), frakturiert, für Krone präpariert
- 👑 Restaurationen nach Typ × Material: Krone / Inlay / Onlay / Veneer / Brücke in e.max, Gold, Gradia, Zirkon, Metall, Metallkeramik, Teleskop oder provisorisch (Onlay nur okklusale Ansicht) — Auswahl über einen einzigen kombinierten „Fix: Krone – …"-Picker mit wenigen Klicks; bestehende `metal`-Kronen migrieren zu `metal-ceramic` (Metallkeramik); Implantate verwenden dasselbe Typ-×-Material-Modell, kombiniert mit einer Implantat-Verbinder-Ebene. Der Picker ist nach Zahnart gestaffelt: ein Implantat bietet nur Krone/Brücke (plus die fünf Attachment-Optionen weiter unten); ein fehlender/Lücken-Zahn bietet nur ein Brückenglied (plus herausnehmbare Teil-/Vollprothese); ein `radix`-Substrat blendet die Restaurationssteuerung vollständig aus (an einem Wurzelrest kann keine Restauration angelegt werden)
- 🦿 Herausnehmbare/Abutment-Prothetik auf der eigenen `prosthesis`-Achse („Kivehető:"-Einträge im kombinierten Picker): Implantat-Heilabutment, Locator, Locator mit Suprakonstruktion, Steg, Steg mit Suprakonstruktion; zahngetragene herausnehmbare Teil- oder Vollprothese
- 🌉 Brückenzähne rendern sowohl die Kronenkappe als auch den Sattel-Verbinder; ein Mehrzahn-Brückenspann-Overlay rendert einen durchgehenden, bogenbewussten Verbinder über aufeinanderfolgende Brückenzähne (Glieder + Pfeiler) sowie die dazwischenliegenden Zahnzwischenräume, im PNG/JPG/SVG-Export enthalten
- 🔍 Karieskartierung auf 6 Flächen: mesial, distal, bukkal, lingual, okklusal, subkronal
- 🪥 Füllungsmaterialien pro Fläche: Amalgam, Komposit, GIZ, provisorisch
- 🏥 Ein zusammengeführter „Pulpa-/Endo-Status"-Auswähler (gruppiert: vitale Pulpa vs. behandelt/endodontisch): endodontische Zustände (medikamentöse Füllung, Wurzelfüllung, inkomplette Wurzelfüllung, Glasfaserstift, Metallstift) und die AAE-Pulpadiagnose (`pulpDx`: normal / reversible / irreversible Pulpitis / Nekrose) schließen sich gegenseitig aus — ein wurzelbehandelter Zahn (`endo` gesetzt) kann nicht gleichzeitig eine vitale Pulpadiagnose tragen; bei einer Behandlung wird `pulpDx` auf `normal` normalisiert. Eine optionale 3-stufige Pulpa-Detailstufe (`pulpDetailLevel`: simple / AAE / praktisches Latein) zeigt über `pulpLatin` 9 praktische lateinische Pulpa-Subtypen an
- 🦴 Die apikale Diagnose (`apicalDx`: symptomatische/asymptomatische apikale Parodontitis, akuter/chronischer apikaler Abszess, kondensierende Osteitis) steuert direkt den periapikalen Glyphen; ein Granulom-/Zysten-Läsionssubtyp-Qualifikator wird nur unter symptomatischer/asymptomatischer apikaler Parodontitis angezeigt
- 🩹 Zusammengeführte Karte „Wurzel und Parodontium" (ein einzelner ausklappbarer Abschnitt für Wurzel-/periapikale und parodontale Befunde)
- ⚕️ Modifikationen: periapikale Entzündung (nur bei fehlenden/Extraktionsalveolen-Zähnen angezeigt; bei vorhandenen Zähnen und bei Implantaten ausgeblendet, wo `periImplant` dies übernimmt), Parodontalerkrankung, Mobilitätsgrade (M1/M2/M3, bei Implantaten ausgeblendet)
- 🦷🔩 Periimplantärer Status (`periImplant`: none / mucositis / peri-implantitis-mild / -moderate / -severe) — Staging nach dem World Workshop 2018, angezeigt als eigener Auswähler bei Implantaten
- 🏷️ Spezielle Indikatoren: Krone erforderlich, Kronenwechsel erforderlich, geschlossene Lücke nach Extraktion, Extraktionsplan, Fissurenversiegelung, Kontaktpunktverlust
- 👁️ Okklusionsansicht, Weisheitszähne, Knochen- und Pulpa-Sichtbarkeit umschaltbar
- 🔢 12 Auswahlfilter (alle, vorhandene, bleibende, Milch, Implantate, fehlende, Ober-/Unterkiefer, Front/Molaren)
- 📊 Vordefinierte Statusvorlagen (Zurücksetzen, Milchgebiss, Wechselgebiss, zahnlos)
- 📦 22 vordefinierte Restaurationsvorlagen (Brücken, herausnehmbare Prothesen, Stegprothesen mit Implantaten)
- 💾 Status-Export/Import in JSON (Version 2.22; Importe akzeptieren weiterhin die Legacy-Version 1.4 sowie 2.0 bis 2.21 und werden automatisch migriert, mit Plugin Custom States und Notizen pro Zahn)
- 💽 Opt-in localStorage-Persistenz (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — standardmäßig deaktiviert; speichert das Status-Chart (und optional das Plan-Chart) automatisch mit einer 4-MB-Größenbeschränkung, wobei Speicher-/Parse-Fehler an einen `onError`-Callback (oder `console.warn`) weitergeleitet werden, statt eine Exception auszulösen
- 🔗 HL7 FHIR R4 Export (Collection-Bundle aus Observations pro Zahn, ISO 3950 Zahnkodierung für das bleibende Gebiss **und** für Milchzähne (51-85, verlustfreier Rückweg beim Import), lokales Codesystem, zzgl. eines Opt-in-SNOMED-CT-Overlays (Einstellungen → Allgemein → SNOMED CT)); eine erfasste Kariesschwere trägt zusätzlich eine Bewertungssystem-Kodierung — ICDAS an einer primären (ungefüllten) Fläche, CARS an einer rezidivierenden (gefüllten) Fläche
- ✚ Kreuz-/Plus-Oberflächenauswahl (B/M/O/D/L) für Karies und Füllungen — `SurfaceCrossComponent`, exportiert für zusammensetzbare Layouts
- 🧱 Füllungsmaterialien pro Fläche (gemischte Füllungen, z. B. bukkal Amalgam + distal Komposit)
- 🖼️ PNG/JPG/SVG-Bildexport des Befunds (herunterladbar; PNG/JPG aus Vektor-SVG gerastert)
- 🦷 Karies/Sekundärkaries als Zustandsautomat pro Fläche: eine kariöse Fläche ohne Füllung wird als primäre Karies dargestellt (ICDAS-gestufte Deckkraft); sobald diese Fläche eine Füllung hat, wird sie stattdessen als Sekundärkaries dargestellt (CARS-bewertet) — beide sind nie gleichzeitig auf derselben Fläche aktiv
- 🎯 Vereinheitlichter Schweregrad pro Fläche (`cariesSeverity`, 0–6): wird auf einer primären Fläche als ICDAS-Tiefe gelesen, auf einer rezidivierenden Fläche als benannter CARS-Score (Gesund … Ausgedehnte Kavität), über ein kontextabhängiges Popup, das jeweils nur die zum aktuellen Zustand der Fläche passende Skala zeigt
- 🌱 Wurzelkaries (`rootCaries`: none / active / arrested / active-cavitated), steuert die dedizierte Wurzelkaries-Bildebene mit einer vom Schweregrad abhängigen Deckkraft
- 📡 Radiologische Kariestiefe (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 pro Fläche), unabhängig von der visuellen ICDAS-/CARS-Schweregradskala, dargestellt als Badge und über eine eigene FHIR-Observation rückführbar
- 🎚️ Drei Karies-Granularitätseinstellungen (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) sowie ein `cariesDepthEnabled`-Umschalter, die jede Skala auf eine einfachere Auswahlansicht reduzieren, ohne den gespeicherten Wert zu verlieren
- 🩹 Sekundärkaries-Zusammenfassung im Füllungspanel: listet jeden ausgewählten Zahn mit Sekundärkaries samt Flächen auf
- 🪛 Füllungsdefekte pro Fläche (`fillingDefect`: none / marginal / fracture / wear) an direkten Restaurationen, unabhängig von Sekundärkaries
- 🦷💥 Zahnabrieb typisiert nach klinischer Ursache und Lokalisation (`wearEdge`: none / attrition / erosion, inzisal/okklusal; `wearCervical`: none / abrasion / abfraction / erosion, zervikal)
- 🎨 Zahnverfärbung nach Ursache (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) bei bleibenden und Milchzähnen
- ✏️ Frontzähne (Schneide- und Eckzähne) beschriften ihre Kaufläche in der gesamten Oberfläche als „inzisal"; der gespeicherte Flächenschlüssel bleibt `occlusal`
- 🔤 Positionsbewusste Flächenbezeichnung (Einstellungen → Zahndetails → „Flächenbezeichnung", einfach/vollständig, Standard vollständig): im vollständigen Modus folgen der Kariologie-/Füllungs-Flächenbuchstabe und die -bezeichnung der Zahnanatomie — okklusal → I/inzisal bei Frontzähnen, bukkal → L/labial bei Frontzähnen, lingual → P/palatinal bei Oberkieferzähnen und L/lingual bei Unterkieferzähnen
- 🦷↕️ Kieferorthopädische Erfassung pro Zahn (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: boolean) an einem vorhandenen natürlichen Zahn (bleibend oder Milchzahn)
- 🪨 Zahnstein sowie Wurzelresorption, typisiert als intern oder extern-zervikal (`resorptionType`)
- 📏 Kariestiefe pro Fläche (oberflächlich / Dentin / tief), oder optionales ICDAS-II-Scoring (0–6) via `enableIcdas`
- 🩹 Kronenrand-Undichtigkeits-Umschalter, nur sichtbar bei Kronen- oder Brückenrestauration
- 🧬 Standardbasierte Diagnosekodierung (WHO-ICD-10, stets aktiv): jeder erfasste Befund leitet eine ICD-10-kodierte Diagnose ab — Karies (K02), Wurzel-/Zement- und arretierte Karies (K02.2/.3), Pulpitis und Pulpanekrose (K04.0/.1), apikale Parodontitis, periapikaler Abszess und radikuläre Zyste (K04.4–.9), Attrition/Abrasion/Erosion/Abfraktion (K03.0–.8), Zahnstein (K03.6), Resorption (K03.3), Verfärbung (K00.3/K00.8/K03.7), Zahnverlust (K08.1), Wurzelrest (K08.3) und Zahnfraktur (S02.5) — exportiert als FHIR Conditions
- 🩺 Diagnosen-Karte pro Zahn (`DiagnosesCardComponent`, `aao-diagnoses-card`): die von einem Zahn abgeleiteten ICD-10-Diagnosen ansehen und kuratieren — eine fälschlich abgeleitete unterdrücken oder eine hinzufügen, die der Befund nicht abbildet. Die effektive Menge (abgeleitet − unterdrückt + hinzugefügt) steuert den FHIR-Export; jede Zeile zeigt zuerst ihren Code (`K04.0 Pulpitis`), und die Zeilen sind nach Code sortiert; ein Ausschließen-Umschalter entfernt eine Diagnose aus dem FHIR-Export, ohne den Befund zu verändern, und ein Löschen (×) entfernt die Diagnose *und* den zugrunde liegenden Befund
- 🗂️ Fall-/Regionaldiagnosen (`CaseDiagnosesModalComponent`, `aao-case-diagnoses-modal`): Ganzmund-Diagnosen, die nicht an einen einzelnen Zahn gebunden sind — Okklusionsstörung & Kiefergelenk (K07), orale Zysten (K09), Speicheldrüsenerkrankung (K11), Stomatitis & Mundschleimhaut (K12/K13) sowie bogenweite Entwicklungsanomalien (K00) — jeweils optional lateralisiert (links/rechts/beidseitig), aufgerufen über den Button „Diagnosen" neben dem Odontogramm-/Parodontalstatus-Umschalter
- 🌍 Nationale Kodierungspakete (Einstellungen → Allgemein → Diagnose-Kodierungssystem): legt ein nationales Codesystem über die WHO-ICD-10-Basis — BNO-10 (ungarisch, offizielle NEAK-Bezeichnungen; behält den WHO-Code bei) oder US-ICD-10-CM (umgeschlüsselte Codes, z. B. der K07-Dentofazial-Bereich → M26)
- 🔬 SNOMED-CT-Overlay (Einstellungen → Allgemein → SNOMED CT, Opt-in, standardmäßig aus): fügt eine SNOMED-CT-Kodierung neben der WHO- und einer etwaigen nationalen Paket-Kodierung hinzu und kodiert die periimplantären Befunde, für die es keinen WHO-ICD-10-Code gibt. Die ICD-10-CM- und SNOMED-Konzept-IDs sind Referenz-/Best-Effort-Angaben — vor dem klinischen Einsatz gegen die offizielle ICD-10-CM-Tabellenliste / den SNOMED-CT-Browser prüfen
- 🔁 FHIR-Condition-Rückweg: Diagnosen werden als FHIR-`Condition`-Ressourcen exportiert (zahnbezogen, plus patientenbezogene Falldiagnosen mit einem Lateralitäts-bodySite) neben den Observations, und der Import rekonstruiert sie — Falldiagnosen direkt, und die Ergänzungs-/Unterdrückungs-Übersteuerungen pro Zahn durch Abgleich der importierten Conditions mit dem neu abgeleiteten Befund
- ✅ HL7-Validator-sauberer FHIR-Export: jeder Bundle-Eintrag trägt eine deterministische `id` und eine absolute `fullUrl` (keine `urn:uuid`-Platzhalter), und das Bundle bettet das eigene **CodeSystem** der Engine ein, damit dessen lokale Codes bei der Validierung aufgelöst werden können; dasselbe CodeSystem plus generierte ValueSets werden in diesem Repository unter `projects/angular-advanced-odontogram/src/lib/fhir/` veröffentlicht (übergeben Sie `includeCodeSystem: false` in den FHIR-Export-Optionen, um es aus dem Bundle wegzulassen)
- 🔄 Auch parodontale Daten durchlaufen einen Rückweg über den FHIR-Import, nicht nur über den JSON-Payload: der Importer liest die LOINC-74029-0-Parodontal-Panels zurück in jeden Zahn — Sondierungstiefe, Gingivarand (aus CAL rekonstruiert, sodass Pseudotaschen-Werte erhalten bleiben), BOP, Furkation, O'Leary-Plaque, die Indizes PI/GI und die Implantat-Indizes mPI/mBI sowie die Breite der keratinisierten Gingiva — zuzüglich der fallbezogenen Raucherstatus- und HbA1c-Evidenz-Observations; die Suppuration ist die einzige Ausnahme und bleibt JSON-only
- 🧰 Vereinheitlichte Topbar-Icon-Leiste mit einem tabbasierten Einstellungsdialog (7 Tabs — Allgemein / Odontogramm / Parodontalstatus-Chart / Zahndetails / Karies / Füllungen / Export — siehe [Einstellungen](#-einstellungen) weiter unten)
- 🦷🩺 Einstellungen → Tab „Parodontalstatus-Chart": ein Verfügbarkeits-Umschalter plus 16 Ein-/Ausblend-Umschalter pro Index für die Zeilen des Parodontalstatus-Charts, jeweils mit einer Beschreibung, sowie eine Option für übersetzte vs. kanonische Indexnamen-Anzeige
- 📋 Zahninformationen-Panel: textuelle Live-Zusammenfassung des gesamten Befunds (Zahnzahlen, vorhandene/fehlende Zähne, Karies inkl. Sekundärkaries, Füllungen, Wurzelbehandlungen, Zahnersatz, Implantate, Parodontalstatus) — standardmäßig sichtbar, in den Einstellungen umschaltbar
- 🗂️ Konsolidiertes Export-Dropdown (Status JSON / FHIR / PNG / JPG / SVG / PDF-Bericht), jedes Format unabhängig über Einstellungen → Allgemein ausblendbar
- 📥 Import-Dropdown mit FHIR-Import (liest exportierte Bundles zurück), pro Quelle unabhängig ausblendbar
- ⏳ Fortschrittsanzeige beim Bildexport
- 🎓 Interaktive Einführungstour (geführter Durchlauf durch die Steuerungen der Shell)
- 🔢 Drei Nummerierungssysteme (FDI, Universal, Palmer)
- 🌐 I18n — 12 UI-Sprachen (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) mit Sprachumschalter; Arabisch stellt die Oberfläche von rechts nach links dar, wobei die Zahn-/Parodontalstatus-Charts von links nach rechts fixiert bleiben; nur die aktive Sprache ist im Hauptbundle enthalten — jede andere Sprache ist ein separater Chunk, der beim ersten Auswählen nachgeladen wird
- 🌗 Dunkler Modus mit Umschalt-Button (eigenständig oder von der übergeordneten App gesteuert)
- 🎨 Benutzerdefinierte Theme-Konfiguration (`themeConfig`-Eingabe) mit CSS Custom Properties (`--odon-*`)
- 📱 Mobile Touch-UX: Tap-to-Zoom-Popover, Langes-Drücken-Kontextmenü, Pinch-to-Zoom, WCAG 44px Berührungsziele, Kieferbogen-Umschalter
- 🔌 Benutzerdefiniertes SVG-Plugin-System: visuelle Overlays, per-Zahn Custom State, JSON Export/Import-Unterstützung — die Rückgabe von `renderSvg()` eines Plugins wird vor dem Einfügen in den Live-Befund mit DOMPurify (SVG-Profil) bereinigt; Plugins laufen dennoch als vertrauenswürdiger Code, also nur Plugins aus vertrauenswürdigen Quellen einbinden
- ⚠️ Statusvalidierung mit Warnungen bei inkompatiblen Zahnzustandskombinationen
- 🏷️ Automatische Status-Tooltips auf Zahnkacheln (zeigt alle aktiven Zustände)
- 🩺 Tooltip pro Zahn und Ganzmund-Zusammenfassungspanel, die den vollständigen Satz klinischer Befunde zeigen (Pulpa-/apikale Diagnose, Wurzelresorption, periimplantärer Status, abgestufte Wurzelkaries, Zahnstein, Kronenrand-Undichtigkeit, Fraktur, Kontaktverlust, typisierter Kanten-/Zervikalabrieb)
- ♿ Tastaturzugänglichkeit (WCAG): ARIA listbox/option Rollen, Enter/Leertaste Auswahl, Pfeiltasten-Navigation, focus-visible Umrisse
- 🔒 Schreibgeschützter Modus: alle Interaktionen deaktivieren für Druck-/Berichts-/Ansichtsszenarien
- ✨ Auswahl-Animationen: pulsierende gestrichelte Umrandung und leuchtender Schatten auf ausgewählten Zähnen (mit Unterstützung für prefers-reduced-motion)
- 📝 Notizen pro Zahn: Doppelklick zum Hinzufügen/Bearbeiten, Notiz-Symbol neben der Zahnnummer, Hover-Tooltip mit Notiztext, eine „Individuelle Notizen"-Zeile im Ganzmund-Zusammenfassungspanel, Aufnahme in den PDF-Bericht, JSON Export/Import
- 🔀 Trennung Status- und Plan-Chart: ein `Status | Plan`-Umschalter wechselt zwischen einem aktuellen **Status**-Chart und einem **Plan**-Chart (beabsichtigte Behandlung), jeweils mit eigenen Zahnzuständen; Export/Import beziehen sich immer auf das Status-Chart, während das Plan-Chart über eine eigene API separat gelesen/geschrieben wird (siehe [Öffentliche API](#-öffentliche-api)) und — sofern es vom Status abweicht — als zusätzlicher `plan`-Abschnitt im JSON-Export enthalten ist
- 📝 „Was ändert sich"-Box: sobald sich der Plan vom aktuellen Status unterscheidet, listet sie jede Abweichung pro Zahn und pro Behandlungsachse auf; auch programmatisch über `getPlanChanges()` verfügbar
- 🅿️ Vorschlags-Darstellung: im Plan-Modus rendern Befunde, die der Plan gegenüber dem aktuellen Status **hinzufügt**, mit einer unterscheidbaren gestrichelten, eingefärbten „Vorschlags"-Umrandung
- 🚦 Plan-Modus-Gating: das Plan-Chart zeigt nur, was ein Zahnarzt *tun* kann — reine Statusbefunde (Karies, Zahnabrieb, Verfärbung sowie der gesamte parodontale Block) sind ausgeblendet; Restauration, Prothetik, Kieferorthopädie, Kronenbedarf/-wechsel und Extraktionsplan bleiben weiterhin planbar

![Full-mouth periodontal chart](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_de_perio.png)
*Screenshot aus dem ursprünglichen React-Projekt — der Angular-Port rendert dieselbe Oberfläche.*

- 🩺 Parodontale Erfassung: pro Messstelle **Sondierungstiefe**, **Gingivarand**, **Blutung bei Sondierung** (+ Suppuration) an den sechs Standardmessstellen je Zahn, mit abgeleitetem **klinischem Attachmentniveau (CAL = PD + Gingivarand)**, Rezession und Ganzmund-**%BOP**. Ein **grafisches Ganzmund-Parodontalstatus-Chart** — jeder Kieferbogen als zwei separate bukkale/palatinale(linguale) SVGs gezeichnet, mit einer roten **CEJ-Linie**, einem nummerierten Millimeter-Rasterraster und einer Gingivarand-/Taschentiefe-Kurve, unterteilt durch ein zentrales Parodontal-Index-Band, das die **Miller-Klasse** und **Plaque/PI/GI/mPI/mBI** als anatomische Rauten-Kachel pro Zahn trägt; mit automatischem Tastatur-Weitersprung bei der Eingabe; das Chart skaliert dynamisch auf die verfügbare Breite. Dargestellt als `Odontogram | Periodontal Status`-Ansichtsumschalter, und weiterhin eigenständig aufrufbar über die exportierte `PerioChartComponent`. Export pro Messstelle via **FHIR** über das LOINC-Parodontal-Panel (`74029-0`; PD `32910-2`, Rezession `32911-0`, CAL `32912-8`)
- 🧪 Eine umfangreiche automatisierte Testsuite (siehe [Tests](#-tests)) für Nummerierung, Übersetzungen, Vorlagen, i18n, die Shell, Theme, Touch, Plugins, Barrierefreiheit sowie Parität der klinischen Diagnose-/Befund-Achsen gegenüber dem eingefrorenen React-Korpus
- 📖 TypeDoc API-Dokumentation mit JSDoc-Kommentaren für alle öffentlichen Exporte (`npm run docs`)

### 📦 Module
- 🦷 Odontogramm-Raster und Zahngitter-UI (`OdontogramChartSurfaceComponent`)
- 🎛️ Steuerung und Statuspanel (`ToothControlsSurfaceComponent` + die 8 deklarativen Karten)
- 🎨 SVG-Schichtungsmotor und Vorlagen (frameworkfreier Kern, `core/odontogram.ts`)
- 🔢 Zahnnummerierung und Beschriftung (FDI/Universal/Palmer, `core/utils/numbering.ts`)
- 🌐 Lokalisierung — 12 UI-Sprachen (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), einschließlich Arabisch (RTL) (`core/i18n/`, `I18nService`)
- 💾 Status-Export/Import
- 📋 Status-Extras: vordefinierte Restaurationsvorlagen
- 🎨 Theme-Konfiguration: anpassbare Farbpalette über `--odon-*` CSS-Eigenschaften
- 📱 Mobile Touch-Interaktionen (Tap-to-Zoom, Langes Drücken, Pinch-to-Zoom, Kieferbogen-Umschalter)
- 🔌 Benutzerdefiniertes SVG-Plugin-System
- ⚠️ Statusvalidierung und Tooltip-System
- ♿ Tastaturzugänglichkeit und ARIA-Unterstützung
- 🔒 Schreibgeschützter Modus
- ✨ Auswahl-Animationen
- 📝 Notizen-System pro Zahn
- 🧱 **Zusammensetzbare UI** — `OdontogramUiService`, der Helfer `engineState()`, 4 präsentationale Oberflächen und 8 deklarative Steuerungskarten, alle unabhängig exportiert (siehe [Zusammensetzbare Oberflächen](#-als-npm-paket-verwenden) oben)
- 🧪 Automatisierte Testsuite (Vitest-Korpus + `ng test`, siehe [Tests](#-tests))

### 🛠️ UI-Steuerung

**🔝 Kopfleiste** (`OdontogramTopbarComponent`):
- Sprachumschalter (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR Dropdown)
- Dunkelmodus-Umschalter (Sonnen-/Mond-Symbol, wechselt zwischen hellem und dunklem Thema)
- Nummerierungssystem-Umschalter (FDI/Universal/Palmer Dropdown)
- Status exportieren / Status importieren Buttons
- Einstellungen (Zahnrad-Symbol), Danksagung/About (Info-Symbol), GitHub-Link

**📊 Diagramm-Kopfzeile:**
- Okklusionsansicht-Umschalter
- Weisheitszahn-Sichtbarkeit-Umschalter
- Knochen-Sichtbarkeit-Umschalter
- Pulpa-Sichtbarkeit-Umschalter
- Auswahl löschen Button

**🔍 Auswahlfilter:**
- Alle auswählen / Alle vorhandenen / Bleibende / Milch / Implantate / Alle fehlenden
- Oberkiefer / Oberkiefer Front 6 / Oberkiefer Molaren
- Unterkiefer / Unterkiefer Front 6 / Unterkiefer Molaren

**📋 Statusvorlagen:**
- Alles zurücksetzen (Mund zurücksetzen)
- Milchgebiss
- Wechselgebiss
- Zahnlos-Umschalter

**📦 Status-Extras Dropdown:**
- Obere/Untere Zirkon-Brücken (12-22, 13-23, 16-26, Vollbogen)
- Obere/Untere Metall-Brücken (12-22, 13-23, 16-26, Vollbogen)
- Obere/Untere Teilprothesen
- Obere/Untere Totalprothesen
- Obere/Untere Stegprothesen mit Implantaten

**🦷 Zahn-Editor-Panel** (`ToothControlsSurfaceComponent`, für den/die ausgewählten Zahn/Zähne, in ausklappbare Karten gruppiert):
- **Status-Karte:** Ganzmund-Vorlagen und Status-Extras (unabhängig über `showStatusCard` ein-/ausblendbar)
- **Zahndetails-Karte:** Zahnauswahl (Basistyp inkl. Varianten mit gebrochener Krone), Zahnsubstrat, das kombinierte „Fix: …"/„Kivehető: …"-Restaurations-Dropdown, Kronenrand-Undichtigkeits-Checkbox, Checkboxen für die Lage der gebrochenen Krone, Umschalter „Krone erforderlich"/„Kronenwechsel erforderlich"
- **Kieferorthopädie-Karte:** Apparatur, mesiale/distale Drift, vertikale Bewegung, Rotations-Umschalter — angezeigt bei einem vorhandenen natürlichen Zahn (unabhängig über `showOrthoCard` ein-/ausblendbar)
- **Karies-Karte:** Dropdown für den Kariestiefe-Modus, Subkronal-Karies-Checkbox, Dropdown für den Wurzelkaries-Schweregrad sowie der B/M/O/D/L-Flächenauswähler für Karies (`SurfaceCrossComponent`) mit einem kontextabhängigen ICDAS-Tiefe-/CARS-Popup und einem Badge für die radiologische Tiefe
- **Füllungen-Karte:** Dropdown für das Füllungsmaterial, Flächenauswähler für Füllungen, Flächenindikator für Füllungsdefekte, Hinweise zu Sekundärkaries und Füllungsdefekten
- **Wurzel-und-Parodontium-Karte:** zusammengeführter „Pulpa-/Endo-Status"-Auswähler, Auswähler für apikale Diagnose, Auswähler für periapikalen Läsionssubtyp, Auswähler für den Wurzelresorptionstyp, Auswähler für den Mobilitätsgrad, Auswähler für den periimplantären Status (nur Implantate)
- **Spezielle Indikatoren:** Extraktionsplan/-wunde, Lücke geschlossen, Fissurenversiegelung, Kontaktpunktverlust, Zahnstein, parapulpaler Stift, Endo-Resektion, Brückenpfeiler

### 🦷 Zahntypen und Zustände

**Zahnauswahl (Basistyp):**
| Wert | Beschreibung |
|---|---|
| `none` | Fehlender Zahn |
| `tooth-base` | Bleibender Zahn |
| `milktooth` | Milchzahn |
| `implant` | Zahnimplantat |
| `tooth-under-gum` | Subgingivaler (nicht durchgebrochener) Zahn |

**Gebrochene Zahnvarianten:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Zahnsubstrat (bleibende Zähne):**
`natural` (Standard), `radix` (Wurzelrest), `broken`, `crownprep` (für Krone präpariert)

**Restaurationstyp (bleibende Zähne):**
`none`, `crown`, `inlay`, `onlay` (nur okklusale Ansicht), `veneer`, `bridge`

**Restaurationsmaterial (bleibende Zähne):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (bestehende `metal`-Kronen migrieren hierher), `telescope`, `temporary`

**Restaurationsoptionen sind nach Zahnart gestaffelt** (`restorationOptions()` in `projects/angular-advanced-odontogram/src/lib/core/registry/restorations.ts`): ein Implantat bietet nur die Restaurationstypen `crown`/`bridge` (kombiniert mit einer Implantat-Verbinder-Ebene) plus die fünf `prosthesis`-Attachment-Einträge unten; ein fehlender/Lücken-Zahn bietet nur ein `bridge`-Brückenglied plus die zwei herausnehmbaren `prosthesis`-Prothesen-Einträge; ein `radix`-Substrat blendet die Restaurationssteuerung vollständig aus.

**Prothetik** (`prosthesis`; eigenständige herausnehmbare/Attachment-Achse, als „Kivehető:"-Einträge im kombinierten Restaurations-Dropdown dargestellt):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (Implantat-Attachments, mit oder ohne Suprakonstruktion), `removable-partial`, `removable-full` (zahngetragene Prothesen an einem fehlenden/Lücken-Zahn). Ein Zahn hat entweder eine feste Restauration oder eine Prothetik, nie beides — das Setzen des einen löscht das andere.

**Kronenrand-Undichtigkeit** (`crownLeakage`; boolean): nur sichtbar, wenn `restorationType` gleich `crown` oder `bridge` ist.

**Endodontische Optionen (bleibende Zähne):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodontische Optionen (Milchzähne):**
`none`, `endo-medical-filling`

`endo` und `pulpDx` werden über ein zusammengeführtes „Pulpa-/Endo-Status"-Auswähler dargestellt (gruppiert: vitale Pulpa vs. behandelt/endodontisch) und schließen sich gegenseitig aus — die Wahl einer behandelten Option (`endo != none`) setzt `pulpDx` auf `normal` zurück, und die Wahl einer Pulpadiagnose setzt `endo` auf `none` zurück.

**Füllungsmaterialien (bleibende Zähne):**
`amalgam`, `composite`, `gic`, `temporary`

**Füllungsmaterialien (Milchzähne):**
`composite`, `gic`, `temporary`

**Füllungs-/Kariesflächen:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (nur Karies)

**Modifikationen:**
`inflammation` (periapikale), `parodontal` (parodontale), `mobility` (M1/M2/M3)

**Periapikaler Läsionstyp** (`periapicalType`; qualifiziert den periapikalen Glyphen, nur unter symptomatischer/asymptomatischer apikaler Parodontitis angezeigt):
`none`, `granuloma`, `cyst` — der alte Wert `abscess` wird weiterhin akzeptiert/gespeichert, aber im Auswähler nicht mehr angeboten

**Pulpadiagnose** (AAE-Terminologie; `pulpDx`):
`normal`, `reversible-pulpitis`, `irreversible-pulpitis`, `necrosis` — schließt sich gegenseitig mit `endo` aus

**Pulpadiagnose, praktisches Latein** (`pulpLatin`; wird vom Pulpa-Auswähler nur angezeigt, wenn `pulpDetailLevel` gleich `latin` ist):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Pulpa-Detailstufe** (`pulpDetailLevel`, globale Einstellung): `simple`, `aae` (Standard), `latin`

**Apikale Diagnose** (`apicalDx`; steuert den periapikalen Glyphen):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Wurzelresorptionstyp** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Periimplantärer Status** (`periImplant`; nur Implantate, Staging nach dem World Workshop 2018):
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Kariesschweregrad** (`cariesSeverity`; vereinheitlichtes Feld pro Fläche, `0`–`6`): auf einer Fläche ohne Füllung wird er als ICDAS-Kariestiefenskala gelesen (`superficial` / `dentin` / `deep`, oder die rohen ICDAS-II-Codes `0–6` bei aktiviertem `enableIcdas`); auf einer Fläche mit Füllung wird er als benannter CARS-Score gelesen (`0` gesund … `6` ausgedehnte Kavität)

**Wurzelkaries** (`rootCaries`): `none`, `active`, `arrested`, `active-cavitated`

**Radiologische Kariestiefe** (`radiographicDepth`; pro Fläche): `none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Karies-Granularitätseinstellungen** (global): `secondaryCariesMode` (`simple`/`standard`/`full`, Standard `standard`), `rootCariesMode` (`simple`/`severity`, Standard `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, Standard `off`), `cariesDepthEnabled` (boolean, Standard `true`)

**Spezielle Indikatoren:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Zahnabrieb** (`wearEdge`, `wearCervical`; klinischer Typ je Lokalisation, gestaffelt auf Zahnbasis + keine Restauration + natürliches Substrat):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Verfärbung** (`discoloration`; Ursache pro Zahn, gestaffelt auf einen natürlichen Zahn (bleibend) oder Milchzahn + keine Restauration + natürliches Substrat):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Füllungsdefekt** (`fillingDefect`; pro Fläche, Befund an direkten Restaurationen unabhängig von Sekundärkaries):
`none`, `marginal`, `fracture`, `wear`

**Kieferorthopädie** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; pro Zahn, gestaffelt auf einen vorhandenen natürlichen Zahn):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion`, `intrusion` — `orthoRotation`: boolean

**Zahndetail-/Notationseinstellungen** (globale Sitzungseinstellungen, Einstellungen → Zahndetails): `wearDetailLevel` und `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, Standard `complex`) sowie `surfaceNotation` (`simple`/`full`, Standard `full`)

### ⚙️ Einstellungen

Wird über das Zahnrad-Symbol in der Kopfleiste geöffnet (`SettingsModalComponent`); ein fokus-gefangener, ARIA-`dialog` mit einem 7-Tab-Layout (Esc/Klick auf den Hintergrund zum Schließen, Pfeiltasten zum Wechseln der Tabs). Der Dialog ist eine reine Ansicht über einen vom Host bereitgestellten `SettingsState` — er besitzt selbst keinen Einstellungs-Zustand. Alle Einstellungen sind, sofern nicht anders angegeben, reiner Sitzungs-UI-Zustand — keine davon verändert Pro-Zahn-Daten oder den Export-Payload.

- **Allgemein:** Nummerierungssystem (FDI/Universal/Palmer), Sprache, dunkles/helles Theme, Export-Verfügbarkeit pro Format (PNG/JPG/SVG/PDF — blendet bei Deaktivierung den passenden Export-Menüpunkt aus und deaktiviert den Export-Tab, wenn PDF ausgeschaltet ist), Import-Verfügbarkeit pro Quelle (Status JSON/FHIR), Diagnose-Kodierungssystem (keine / BNO-10 / ICD-10-CM) und ein Opt-in-Umschalter für das SNOMED-CT-Overlay
- **Odontogramm:** Layout auf dem Bildschirm — Zahnabstand, Zahnnummer-Größe, Auswahlfarbe und Randstil; Sichtbarkeit des Zahninformationen-Panels; Verfügbarkeit des Plan-Modus; Zahnanatomie-Profil (`classic` Standard / `measured` — neun literaturvermessene Zahnvorlagen in einem Zwei-Kiefer-Layout mit zahnindividueller Breite, zur Laufzeit umschaltbar; die Grafik ist ein separater Lazy-Chunk, der erst beim Wechsel dorthin nachgeladen wird, sodass der klassische Standard nichts zusätzlich kostet); Sichtbarkeit der Status-Karte und der Kieferorthopädie-Karte
- **Parodontalstatus-Chart:** ein Verfügbarkeits-Umschalter, der den Rest des Tabs und die parodontalen Einstiegspunkte in der Shell begrenzt; Parodontal-Ansichtsmodus (`toggle`/`popup`); 16 Ein-/Ausblend-Umschalter pro Index in 5 Gruppen (Tasche: PD/GM/CAL/BOP · Hygiene: Plaque/PI/GI · Mukogingival: CEJ-Sichtbarkeit/Wurzelkonkavität/KG/GT · Halt: Furkation/Mobilität/Miller-Klasse · Periimplantär: mPI/mBI); ein Modus für übersetzte vs. kanonische Indexnamen (kanonisch = ein fester englisch-lateinischer wissenschaftlicher Name in jeder UI-Sprache; Tooltips bleiben stets lokalisiert)
- **Zahndetails:** Pulpa-Detailstufe (simple/AAE/praktisches Latein, Standard AAE), Abrieb-Detailstufe und Verfärbungs-Detailstufe (einfach/komplex, jeweils Standard komplex), Flächenbezeichnung (einfach/vollständig, Standard vollständig), Umschalter für Notizen pro Zahn
- **Karies:** ICDAS-II-Scoring-Umschalter, Kariestiefe-Umschalter, Wurzelkaries-Granularität (simple/severity), Sekundärkaries-/CARS-Granularität (simple/standard/full), Granularität der radiologischen Tiefe (off/threeLevel/detailed)
- **Füllungen:** Füllungskomplexität (complex/simple), Umschalter für Füllungsdefekt-Befunde, Verfügbarkeit pro Material (Amalgam/Komposit/GIZ/provisorisch), Umschalter für Fissurenversiegelung
- **Export:** die vollständige PDF-Berichtskonfiguration (`PdfSettings` — siehe [Export](#-export) weiter unten) — deaktiviert (fällt auf den Inhalt des Allgemein-Tabs zurück), wann immer der PDF-Export im Allgemein-Tab ausgeschaltet ist

### 🖼️ SVG-Vorlagensystem

**Zahnvorlagen** (in `projects/angular-advanced-odontogram/src/lib/core/assets/teeth-svgs/`):
| Vorlage | Verwendende Zähne |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (Schneidezähne) |
| `13.svg` | 13, 23, 33, 43 (Eckzähne) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (Prämolaren) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (Molaren) |

Vorlagen werden für den Unterkiefer um 180 Grad gedreht und für die linke Seite horizontal gespiegelt. Ein paralleler `measured/`-Unterordner enthält die neun literaturvermessenen Zahnvorlagen, die das `measured`-Anatomie-Profil in einem Zwei-Kiefer-Layout mit zahnindividueller Breite rendert (Einstellungen → Odontogramm → Zahnanatomie).

**Icon-SVGs** (in `projects/angular-advanced-odontogram/src/lib/core/assets/icon-svgs/`):
`icon_8.svg` (Weisheitszahn), `icon_gum.svg` (Knochen), `icon_no_selection.svg` (Auswahl löschen), `icon_occl.svg` (Okklusionsansicht), `icon_pulp.svg` (Pulpa)

Beide Ordner werden in generierte TypeScript-Module kompiliert (`core/generated/teeth-svgs.ts`, `core/generated/icon-svgs.ts`) via `npm run gen:assets` — führen Sie dies nach dem Bearbeiten einer Quell-SVG aus, damit die eingebetteten Inline-Strings synchron bleiben.

### 🔢 Nummerierungssysteme

**FDI (ISO 3950):** Erwachsenenzähne 11-18, 21-28, 31-38, 41-48. Milchzähne 51-55, 61-65, 71-75, 81-85. Wert: `"FDI"`.

**Universal (USA):** Erwachsenenzähne nummeriert 1-32. Milchzähne mit Buchstaben A-T. Wert: `"UNIVERSAL"`.

**Palmer (Zsigmondy-Palmer):** Quadrant + Positionsformat (z. B. UR-1, LL-5). Milchzähne verwenden Buchstaben A-E pro Quadrant. Wert: `"PALMER"`.

`NumberingSystem` (`core/utils/numbering.ts`) ist genau die Union `"FDI" | "UNIVERSAL" | "PALMER"`; die exportierte Funktion `toLabel(fdiTooth, system)` wandelt eine FDI-Zahnnummer in die Beschriftung des angeforderten Systems um (z. B. `toLabel(14, "PALMER")` → `"UR-4"`).

### 🚀 Verwendung
Entwicklung (führt die Demo-App aus):
```bash
npm install
npm start           # ng serve
```
Bibliothek bauen:
```bash
npm run build:styles && npx ng build angular-advanced-odontogram
```
Demo-App bauen:
```bash
npm run build:demo
```

### 🔗 Integration
Die Komponente kann in jede Angular-App eingebettet werden:
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

**Dunkelmodus-Integration:**
- **Eigenständiger Modus:** `darkMode` weglassen — die Komponente verwaltet ihren eigenen Theme-Zustand über den Umschalter in der Kopfleiste und fügt die `.dark`-Klasse auf dem Wurzelelement des Hosts hinzu bzw. entfernt sie.
- **Gesteuerter Modus:** `[darkMode]` und `(darkModeChange)` binden — die übergeordnete App steuert das Theme. Der Umschalter erscheint weiterhin, emittiert aber `darkModeChange`, anstatt den internen Zustand zu verwalten. Die übergeordnete App ist für das Hinzufügen/Entfernen der `.dark`-Klasse auf `<html>` verantwortlich.

**Benutzerdefiniertes Theme:**
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

**Plugin-Integration:**
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

Die Rückgabe von `renderSvg()` eines Plugins wird vor dem Einfügen in den Live-Befund mit DOMPurify (SVG-Profil) bereinigt — siehe [Sicherheitshinweise](#-sicherheitshinweise).

### 🧪 Tests

Die Testsuite ist auf **zwei Runner** aufgeteilt, und beide müssen bestehen (`npm test` führt beide aus, in dieser Reihenfolge):

```bash
npm run test:corpus   # plain Vitest — the shared clinical-engine core
npm run test:ng       # Angular's Vitest builder — the Angular shell (ng test)
npm test              # both, in order
npm run test:watch    # watch mode (corpus runner)
```

- **`test:corpus`** (`vitest run`) führt `projects/angular-advanced-odontogram/src/lib/core/` — den gemeinsamen klinischen Kern — gegen den portierten Testkorpus aus (über 100 Spec-Dateien unter `core/__tests__/`). Hier leben und werden byte-genau geprüft die **Golden Fixtures** für SVG-Rendering, FHIR-Export und JSON-Roundtrip: `parity/svg-fingerprints.json`, `parity/fhir-golden.json`, `parity/roundtrip-golden.json`, `parity/shell-dom-golden.html`.
- **`test:ng`** (`ng test angular-advanced-odontogram --watch=false`, die `@angular/build:unit-test`-Vitest-Integration von Angular) führt die eigenen `*.spec.ts`-Specs der Angular-Shell aus — Komponenten, Services, Direktiven — und prüft die DOM-Parität: Die Shell rendert dieselben IDs, Klassen und Markup wie die ursprünglichen React-Komponenten.

Da die Vitest-Integration dieses Builders `vi.mock()`/`vi.spyOn()` für das Mocking von Modulen über relative Pfade nicht unterstützt, werden DOM-berührende Seiteneffekte (`initOdontogram`/`destroyOdontogram`, `exportPdf`) stattdessen über die Injektionstokens `ODONTOGRAM_ENGINE_LIFECYCLE`/`EXPORT_PDF_FN` und das Provider-Array des Angular-`TestBed` überschrieben — siehe [DI-Ansatzpunkte für Host-seitige Tests](#-als-npm-paket-verwenden) oben.

### 📖 API-Dokumentation
```bash
npm run docs           # Generate TypeDoc docs in docs/api/
```
Die API des gemeinsamen klinischen Kerns ist auch im ursprünglichen Projekt dokumentiert:

📚 **https://zoliqua.github.io/React-Advanced-Odontogram/**

### 📡 Öffentliche API

**Komponenten-Eingaben/-Ausgaben:** siehe [Komponenten-Eingaben](#-als-npm-paket-verwenden) oben für die vollständige Tabelle.

**Exportierte Funktionen zur externen Steuerung** (kuratierte Teilmenge — die vollständige, typisierte Oberfläche befindet sich in der mitgelieferten `.d.ts`):

| Funktion | Beschreibung |
|---|---|
| `initOdontogram()` / `destroyOdontogram()` | Engine initialisieren/aufräumen (wird intern von `OdontogramShellComponent`/`OdontogramUiService` über das `ODONTOGRAM_ENGINE_LIFECYCLE`-Token aufgerufen) |
| `setNumberingSystem(system)` | Zwischen FDI, UNIVERSAL, PALMER wechseln |
| `clearSelection()` | Alle Zähne abwählen |
| `getSelectedTeeth()` | Aktuell ausgewählte Zähne (FDI-Nummern), in Auswahlreihenfolge |
| `registerPlugins(plugins)` | Benutzerdefinierte SVG-Plugins registrieren |
| `setPluginState(toothNo, pluginId, value)` / `getPluginState(toothNo, pluginId)` | Plugin Custom State für einen Zahn setzen/abrufen |
| `getToothStateSummary(toothNo)` | Lokalisierte Zusammenfassung aller aktiven Zustände abrufen |
| `getOdontogramSummary()` | Strukturierte, lokalisierte Textzusammenfassung des gesamten Befunds abrufen (Zählungen, Abschnitte, geplante Änderungen) |
| `onStateChange(callback)` | Auf Zustandsänderungen abonnieren; gibt eine Abmeldefunktion zurück |
| `setReadOnly(value)` / `getReadOnly()` | Schreibgeschützten Modus aktivieren/deaktivieren / abfragen |
| `setNotesEnabled(value)` / `getNotesEnabled()` | Notizen pro Zahn aktivieren/deaktivieren / abfragen |
| `setPulpDetailLevel(level)` / `getPulpDetailLevel()` | Vokabular des Pulpa-Auswählers setzen/abrufen — `"simple"`, `"aae"` oder `"latin"` |
| `getToothAnatomy()` / `setToothAnatomy(v)` | Das Zahnanatomie-Profil abrufen/setzen — `"classic"` oder `"measured"` |
| `getChartMode()` / `setChartMode(mode)` | Das aktive Chart abrufen/umschalten — `"status"` oder `"plan"` (das Plan-Chart wird beim ersten Betreten als Tiefenkopie des Status-Charts erstellt) |
| `getStatusChart()` / `getPlanChart()` / `setPlanChart(payload)` | Die Payloads des Status-/Plan-Charts unabhängig vom aktiven lesen, oder die Zähne des Plan-Charts ersetzen |
| `getPlanChanges()` | Den strukturierten Status→Plan-Diff abrufen (`{ toothNo, axis, from, to }[]`) |
| `setPerioSite(toothNo, site, patch)` / `getToothPerio(toothNo)` | Parodontale Daten für eine der sechs Messstellen setzen/abrufen (`patch` = `{ pd?, gm?, bop?, sup? }`) |
| `getToothCal(toothNo)` | Das abgeleitete CAL pro Messstelle für einen Zahn abrufen |
| `getPerioSummary()` | Ganzmund-parodontale Kennzahlen: Anzahl erfasster Messstellen, Anzahl blutender Stellen, %BOP, schlechtestes CAL, maximale PD |
| `getPerioChart()` | Die parodontalen Datensätze pro Zahn des aktiven Charts abrufen |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Das Parodontalstatus-Chart-Overlay programmgesteuert öffnen/schließen/abfragen |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Abrufen/Setzen, wie das Parodontalstatus-Chart dargestellt wird — `"toggle"` oder `"popup"` |
| `getPerioClassification()` | Die parodontale Klassifikation nach dem World Workshop 2017 abrufen (`{diagnosis, stage, grade, extent, derived, overridden}`) |
| `setDiagnosisOverride(v)` / `setStageOverride(v)` / `setGradeOverride(v)` / `setExtentOverride(v)` | Eine abgeleitete parodontale Klassifikationsachse übersteuern, oder `null` zum Zurücksetzen auf den abgeleiteten Wert |
| `getCaseMeta()` / `resetCaseMeta()` | Das fallbezogene Metadaten-Objekt abrufen/zurücksetzen (Alter, Raucher-/Diabetesstatus, Patientenidentität, Untersuchungsdatum, …) |
| `setPatientName(v)` / `setPatientDob(v)` / `setExamDate(v)` | Fall-Identitätsfelder setzen (nur PDF-Berichtskopfzeile — nie Teil des FHIR-Exports) |
| `getToothDiagnoses(toothNo)` | Die ICD-10-kodierten Diagnosen eines Zahns abrufen, wie sie von den klinischen Achsenregeln abgeleitet werden |
| `getActiveDiagnoses()` | Die effektiven Diagnosezeilen (abgeleitet − unterdrückt + hinzugefügt) für den aktuell ausgewählten Zahn abrufen, plus den Katalog hinzufügbarer Diagnosen — das View-Model von `DiagnosesCardComponent` |
| `addDiagnosisToSelection(key)` / `removeDiagnosisFromSelection(key)` | Eine Diagnose für die aktuelle Zahnauswahl hinzufügen/entfernen, indem der zugrunde liegende Befund geschrieben wird |
| `setDxOverrideForSelection(key, mode)` | Eine Diagnose-Übersteuerung für die aktuelle Auswahl erzwingen — `"add"`, `"suppress"` oder `null` zum Zurücksetzen |
| `getDiagnosisCodingPack()` / `setDiagnosisCodingPack(id)` | Das nationale Kodierungspaket-Overlay über der WHO-ICD-10 abrufen/setzen — `"none"`, `"bno10"` (ungarische NEAK-Bezeichnungen) oder `"icd10cm"` (USA) |
| `getSnomedEnabled()` / `setSnomedEnabled(v)` | Das Opt-in-SNOMED-CT-Kodierungs-Overlay abrufen/setzen |
| `getCaseConditions()` / `setCaseCondition(key, laterality)` | Ganzmund-Fall-/Regionaldiagnosen (Okklusionsstörung & Kiefergelenk, orale Zysten, Speicheldrüsenerkrankung, Stomatitis & Mundschleimhaut, bogenweite Entwicklungsanomalien) abrufen/setzen, jeweils mit einer Lateralität — `null` setzt zurück, oder `"left"`/`"right"`/`"bilateral"` |
| `exportFhir(options?)` | Befund als HL7 FHIR R4 Collection-Bundle exportieren (JSON-Download); optionale `{ subject }`-Referenz |
| `importFhirBundle(input)` | Ein von diesem Modul erzeugtes FHIR-R4-Bundle importieren (Objekt oder JSON-String) |
| `exportImage(format)` | Befund als Bild herunterladen — `"png"` oder `"jpg"` |
| `exportSvg()` | Befund als skalierbares SVG (Vektor) herunterladen |
| `hasAnyPerioData()` | `true`, sofern irgendeine parodontale Achse irgendwo im Mund erfasst ist |
| `exportPerioSvg()` / `exportPerioImage(format)` | Das vollständige Parodontalstatus-Chart als eigenständiges Vektor-SVG oder als gerastertes Bild herunterladen |
| `exportPdf(opts)` | Einen jsPDF-nativen PDF-Bericht herunterladen (siehe [Export](#-export) weiter unten) |
| `getPdfSettings()` / `setPdfSettings(patch)` | Die Konfiguration des PDF-Berichts abrufen/ändern (`PdfSettings`) |
| `exportStatus()` | Das Status-Chart als JSON herunterladen |
| `importStatus(data)` | Die Engine aus einem zuvor exportierten JSON-Payload hydrieren (siehe [Status Export-/Importformat](#-status-export-importformat)) |
| `setImportFormat(format)` | Parser für den nächsten Datei-Import festlegen — `"status"` oder `"fhir"` |
| `startIntroTour()` | Die interaktive Einführungstour starten |

### 💾 Zustandspersistenz (localStorage)

Opt-in `localStorage`-Persistenz für den Fallzustand des Odontogramms (`core/persistence.ts`, aus dem Paket-Einstiegspunkt re-exportiert). Standardmäßig deaktiviert — bestehende Integrationen sind nicht betroffen, solange eine Host-App sie nicht ausdrücklich aktiviert, und der Aufruf sollte **nach** dem Mounten des Odontogramms erfolgen (z. B. aus dem `ngAfterViewInit()` einer Komponente, nachdem `OdontogramShellComponent`/`OdontogramUiService` `init()` aufgerufen hat — die Wiederherstellung zeichnet das Live-DOM über `importStatus()` neu):

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

| Funktion | Beschreibung |
|---|---|
| `enablePersistence(options?)` | Stellt einen zuvor gespeicherten Fall (falls vorhanden) über `importStatus()` wieder her und speichert danach das Status-Chart bei jeder abgeschlossenen Zustandsänderung in `localStorage` (Bearbeitungen werden über ein Zeitfenster von ~400 ms entprellt (debounced), sodass eine Serie von Änderungen — z. B. eine Statusvorlage — einen einzigen Schreibvorgang erzeugt). Idempotent — ein erneuter Aufruf ersetzt die vorherige Subscription/Optionen. **Muss nach dem Mounten des Odontogramms aufgerufen werden.** |
| `disablePersistence()` | Beendet die Persistenz (leert zunächst einen eventuell ausstehenden entprellten (debounced) Speichervorgang); der gespeicherte Eintrag bleibt erhalten. |
| `clearPersistedState()` | Entfernt den gespeicherten Eintrag für den aktiven (oder Standard-)Schlüssel. |
| `isPersistenceEnabled()` | `true`, solange eine Zustandsänderungs-Subscription aktiv ist. |

**`PersistenceOptions`:**

| Feld | Typ | Standard | Beschreibung |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | Der `localStorage`-Schlüssel — dies ist der eigene, literale Standardwert des gemeinsamen Kernmoduls (unverändert durch den Angular-Port); übergeben Sie einen eigenen `key`, um eine Kollision mit einer React-seitigen Integration im selben Origin zu vermeiden oder um mehrere Hosts zu namensräumen. |
| `includePlan` | `boolean` | `false` | Auch das Plan-Chart speichern (das `plan`-Feld des Payloads). |
| `onError` | `(err: Error) => void` | — | Wird bei jedem Speicher-/Parse-Fehler aufgerufen, statt `console.warn` zu nutzen. |

Hinweise: Ohne Aufruf von `enablePersistence()` wird nichts aus `localStorage` gelesen oder dorthin geschrieben; eine 4-MB-Größenbeschränkung überspringt ein zu großes Speichern (gemeldet über `onError`/`console.warn`), statt eine Exception auszulösen; jeder Speicher-/JSON-Fehler — Kontingent überschritten, ein abgeschottetes iframe, beschädigte oder unbekannte gespeicherte Daten usw. — wird abgefangen und gemeldet. Dieses Modul löst nie eine Exception aus.

Hinweis: Das Aktivieren der Persistenz stellt den gespeicherten Fall über `importStatus()` wieder her, wodurch der aktuelle Fall ersetzt wird — einschließlich eines laufenden Plan-Charts, falls die gespeicherten Daten keinen enthalten. Aktivieren Sie die Persistenz beim Start (direkt nach dem Mounten), nicht während einer laufenden Sitzung.

Hinweis: Die gespeicherten Daten können patientenbezogene Falldaten (Patientenname, Untersuchungsdatum) im Klartext im `localStorage` enthalten. Wenn Sie solche Daten erfassen, sorgen Sie für einen geräteseitigen Schutz oder löschen Sie sie bei Bedarf mit `clearPersistedState()`.

### 💾 Status Export-/Importformat

Der Export erzeugt eine JSON-Datei (Version `2.22`; Importe akzeptieren weiterhin die Legacy-Version `1.4` sowie `2.0` bis `2.21` und werden automatisch migriert) mit folgenden Feldern:

**Globale Felder:**
- `wisdomVisible` - Weisheitszähne sichtbar
- `showBase` - Knochenschicht sichtbar
- `occlusalVisible` - Okklusionsansicht aktiv
- `showHealthyPulp` - Gesunde Pulpa sichtbar
- `edentulous` - Zahnloser Modus aktiv

**Pro-Zahn-Felder (32 Zähne):**
- `toothSelection` - Basiszahntyp
- `toothSubstrate` - Zahnsubstrat (natural/radix/broken/crownprep), unabhängig von jeder Restauration
- `restorationType` - Restaurationstyp (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - Restaurationsmaterial (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), gekoppelt an `restorationType`
- `prosthesis` - herausnehmbare/Attachment-Achse (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), schließt sich mit einer festen `restorationType` von Krone/Brücke gegenseitig aus
- `crownLeakage` - Kronenrand-Undichtigkeits-Flag, nur relevant, wenn `restorationType` gleich Krone oder Brücke ist
- `endo` - endodontischer Zustand; schließt sich mit `pulpDx` gegenseitig aus
- `mods` - Modifikations-Array (inflammation, parodontal); `inflammation` gilt nur für fehlende/Extraktionsalveolen-Zähne
- `caries` - aktive Kariesflächen
- `cariesActiveDepth` - der vom Kariestiefe-Auswähler vorgehaltene ICDAS-Tiefenwert beim Anwenden einer neuen Fläche
- `rootCaries` - Wurzelkaries-Schweregrad (none/active/arrested/active-cavitated)
- `cariesSeverity` - vereinheitlichter Schweregrad pro Fläche (0-6): ICDAS-Tiefe auf einer primären (ungefüllten) Fläche, CARS-Score auf einer rezidivierenden (gefüllten) Fläche
- `radiographicDepth` - radiologische Kariestiefe pro Fläche (none/E1/E2/D1/D2/D3), unabhängig von der visuellen ICDAS-/CARS-Skala
- `fillingMaterial` - Füllungsmaterial
- `fillingSurfaces` - gefüllte Flächen
- `fillingSurfaceMaterials` - Füllungsmaterial pro Fläche (gemischte Füllungen, z. B. bukkal Amalgam + distal Komposit)
- `fillingDefect` - Füllungsdefekt pro Fläche (none/marginal/fracture/wear), an gefüllte Flächen gebunden, unabhängig von Sekundärkaries
- `pulpDx` - AAE-Pulpadiagnose (normal/reversible-pulpitis/irreversible-pulpitis/necrosis)
- `pulpLatin` - praktischer lateinischer Pulpa-Subtyp (wird vom Pulpa-Auswähler nur angezeigt, wenn `pulpDetailLevel` gleich `latin` ist)
- `apicalDx` - apikale Diagnose, steuert den periapikalen Glyphen
- `periapicalType` - periapikaler Läsionssubtyp (none/granuloma/cyst); der alte Wert `abscess` wird beim Import weiterhin akzeptiert
- `resorptionType` - Wurzelresorptionstyp (none/internal/external-cervical)
- `periImplant` - periimplantärer Status nur bei Implantaten (none/mucositis/peri-implantitis-mild/-moderate/-severe), Staging nach dem World Workshop 2018
- `dxOverrides` - Diagnose-Kodierungs-Übersteuerungen pro Zahn (Version 2.21): ein nach ICD-10-Diagnoseschlüssel indiziertes Objekt → `add` | `suppress`, das eine kodierte Diagnose trotz fehlendem passenden Befund erzwingt oder trotz vorhandenem Befund unterdrückt; bestimmt die effektive kodierte Menge, die als FHIR-`Condition`s exportiert wird
- `endoResection` - Wurzelspitzenresektions-Flag
- `fissureSealing` - Fissurenversiegelungs-Flag
- `calculus` - Zahnstein-Flag
- `contactMesial` / `contactDistal` - mesialer/distaler Kontaktpunktverlust
- `wearEdge` - inzisaler/okklusaler Abriebtyp (none/attrition/erosion)
- `wearCervical` - zervikaler Abriebtyp (none/abrasion/abfraction/erosion)
- `discoloration` - Verfärbungsursache pro Zahn (none/tetracycline/fluorosis/nonvital/extrinsic/other)
- `orthoAppliance` - kieferorthopädische Apparatur (none/bracket/band)
- `orthoDrift` - kieferorthopädische Drift (none/mesial/distal)
- `orthoVertical` - kieferorthopädische vertikale Bewegung (none/extrusion/intrusion)
- `orthoRotation` - kieferorthopädisches Rotations-Flag
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - Fraktur-Lokalisierungen
- `extractionWound` - Post-Extraktionswunde
- `extractionPlan` - geplante Extraktion
- `parapulpalPin` - parapulpaler Stift-Flag
- `bridgePillar` - Brückenpfeilerzahn
- `mobility` - Mobilitätsgrad (none/m1/m2/m3)
- `crownNeeded` - Indikator „Krone erforderlich"
- `crownReplace` - Indikator „Kronenwechsel erforderlich"
- `missingClosed` - Lücke nach Extraktion geschlossen
- `customStates` - Plugin Custom States (Objekt, nach Plugin-ID indiziert)
- `note` - Textnotiz pro Zahn (String, optional — nur vorhanden, wenn nicht leer)

**Oberstes `plan`-Feld (ab Version 2.11):**
- `plan` - optionales Objekt, gleiche Struktur wie `teeth` (Pro-Zahn-Felder oben), enthält das **Plan**-Chart (beabsichtigte Behandlung). Nur vorhanden, wenn das Plan-Chart initialisiert wurde UND sich sein Inhalt vom Status-Chart unterscheidet. Beim Import löscht ein fehlendes `plan` das Plan-Chart bzw. macht es uninitialisiert; ein vorhandenes `plan` stellt das Plan-Chart neben dem Status wieder her. Kann auch unabhängig über `getPlanChart()`/`setPlanChart()` gelesen/geschrieben werden.

**Oberstes `case`-Feld (Version 2.17+, in 2.18, 2.19, 2.20 und 2.22 erweitert):**
- `case` - optionales Objekt mit fallbezogenen (nicht pro Zahn) Metadaten, gemeinsam genutzt vom Status- und vom Plan-Chart. Fehlt bei leeren Werten. Felder (jeweils weggelassen, wenn auf Standardwert): `age`; `smokingStatus` (+ `cigarettesPerDay`); `diabetesStatus` (+ `hba1c`); `toothLossPerio`; `maxRblPercent`; die vier klinischen Übersteuerungen der 2017-Klassifikation pro Achse `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`; `patientName` / `examDate`; `patientDob`; sowie (Version 2.22) `caseConditions` — Fall-/Regionaldiagnosen (Okklusionsstörung & Kiefergelenk K07, orale Zysten K09, Speicheldrüsenerkrankung K11, Stomatitis & Mundschleimhaut K12/K13, bogenweite Entwicklungsanomalien K00), jeweils einer Lateralität zugeordnet (nicht angegeben/links/rechts/beidseitig). Gelesen/geschrieben über `getCaseMeta()`/`getCaseConditions()` und die obigen `set*`-/`setCaseCondition()`-Setter. Patientenname, Geburtsdatum und Untersuchungsdatum sind reine Chart-Identitätsmetadaten — sie sind **nicht** Teil des FHIR-Exports.

### 🖨️ Export
`exportFhir()` ist HL7-Validator-sauber: jeder Bundle-Eintrag trägt eine deterministische `id` und eine absolute `fullUrl` (keine `urn:uuid`-Platzhalter), und das Bundle bettet das eigene CodeSystem der Engine ein, damit dessen lokale Codes bei der Validierung aufgelöst werden können (ebenfalls veröffentlicht unter `projects/angular-advanced-odontogram/src/lib/fhir/`; übergeben Sie `includeCodeSystem: false`, um es wegzulassen).

Auch parodontale Daten durchlaufen inzwischen einen Rückweg über den FHIR-Import, nicht nur über den JSON-Payload: `importFhirBundle()` liest die LOINC-`74029-0`-Parodontal-Panels zurück in den Parodontal-Datensatz jedes Zahns — Sondierungstiefe, Gingivarand (aus CAL rekonstruiert, sodass Pseudotaschen-Werte erhalten bleiben), BOP, Furkation, O'Leary-Plaque, die Indizes PI/GI und die Implantat-Indizes mPI/mBI sowie die Breite der keratinisierten Gingiva — zuzüglich der fallbezogenen Raucherstatus- und HbA1c-Evidenz-Observations. Die Suppuration ist die einzige Ausnahme: Sie bleibt JSON-only, da sie nicht Teil des FHIR-Exports ist.

Über den eigenen Status-JSON-/FHIR-/PNG-/JPG-/SVG-Export des Odontogramms hinaus hat das **Parodontalstatus-Chart** einen eigenen Exportpfad:
- **Parodontal-SVG/PNG/JPG:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` rendern das vollständige Parodontalstatus-Chart als ein eigenständiges Vektor-SVG, unabhängig vom gemounteten DOM der `PerioChartComponent`. Deaktiviert, sobald `hasAnyPerioData()` `false` ist.
- **PDF-Bericht:** der Menüpunkt „PDF-Bericht…" im Export-Menü öffnet `ExportOptionsModalComponent` — einen Einstellungsdialog (Felder für Patientenname + Geburtsdatum + Untersuchungsdatum, direkt mit den Fall-Metadaten verknüpft, wobei das Untersuchungsdatum standardmäßig auf heute gesetzt ist; Abschnitts-Checkboxen: Patientendaten, Odontogramm-Chart, Odontogramm-Beschreibung, individuelle Notizen — deaktiviert, wenn kein Zahn eine Notiz hat —, Parodontalstatus, Parodontal-Beschreibung), bevor `exportPdf(opts)` über das Injektionstoken `EXPORT_PDF_FN` aufgerufen wird. Leere Identitätsfelder fallen auf Platzhalter zurück (`"John Doe"` / `"1980-01-01"`, konfigurierbar über `PdfSettings.defaultName`/`defaultDob`), sodass der Export immer gelingt. Das PDF wird jsPDF-nativ zusammengestellt — Vektortext über `.text()`, gerasterte Zahn-/Parodontalstatus-Chart-Bilder über `.addImage()` — ohne Abhängigkeit von `svg2pdf.js`. Der Abschnitt der individuellen Notizen wird automatisch übersprungen, wenn kein Zahn eine Notiz hat, und die beiden Parodontal-Abschnitte werden automatisch übersprungen, sobald `hasAnyPerioData()` `false` ist, unabhängig von den Checkboxen des Dialogs.
- **mPI/mBI-Implantat-Gating:** die periimplantären Mombelli-Indizes (mPI/mBI) werden nur als Zeilen in einem Kieferbogen dargestellt, der mindestens einen Implantatzahn enthält — sowohl im laufenden Parodontalstatus-Chart als auch in den SVG-/PDF-Exporten.
- Patientenname, Geburtsdatum und Untersuchungsdatum sind reine chart-identitätsbezogene Metadaten (Payload `2.20`, additiv) — sie sind **nicht** Teil des FHIR-Exports.
- **Berichtskonfiguration (`PdfSettings`, Einstellungen → Export-Tab, abrufen/setzen über `getPdfSettings()`/`setPdfSettings(patch)`):** Standard-Patientenname/-Geburtsdatum, ob das Alter angezeigt wird, Datumsformat (ISO/DMY/MDY), Farbthema (Blau/Türkis/Bernstein/Schiefer), Knochen-/Pulpa-Sichtbarkeit des Odontogramms, Zahnabstand/Rand/Zahnnummer-Größe im Diagrammbild, ob die Prosa-Beschreibung und die Befundtabelle enthalten sind, entsprechende Abstands-/Beschriftungsplatzierungs-/Schriftgröße-Optionen des Parodontalstatus-Charts sowie ob die Tabelle der parodontalen Kennzahlen und das Abkürzungsglossar enthalten sind, ein medizinischer Haftungsausschluss (Standardtext oder individuell), ein Generator-/Versionsstempel sowie die Gruppierung der Gebiss-Zusammenfassung (ganzer Mund / Kiefer / Quadrant / Sextant — steuert auch die Tabelle des Zahninformationen-Panels auf dem Bildschirm).

### 📁 Ordnerstruktur
- `projects/angular-advanced-odontogram/src/public-api.ts` - der öffentliche Einstiegspunkt des Pakets (jeder Export wird von hier aus reexportiert)
- `projects/angular-advanced-odontogram/src/lib/core/odontogram.ts` - die frameworkfreie klinische Engine: SVG-Schichtung, Zahnstatusmanagement, Touch-Interaktionen, Plugin-Overlays, Einstellungen, Export/Import
- `projects/angular-advanced-odontogram/src/lib/core/persistence.ts` - Opt-in localStorage-Persistenz
- `projects/angular-advanced-odontogram/src/lib/core/theme.ts` - `OdontogramThemeConfig`-Typ und Hilfsfunktion `applyThemeConfig()`
- `projects/angular-advanced-odontogram/src/lib/core/plugin.ts` - `OdontogramPlugin`-Typ, `PluginLayer`, `getQuadrant()`, `LAYER_Z` Z-Index-Prioritäten
- `projects/angular-advanced-odontogram/src/lib/core/pluginSanitize.ts` - `sanitizePluginSvg()`, der DOMPurify-basierte Bereiniger, den die Ausgabe von `renderSvg()` eines Plugins durchläuft, bevor sie in den Live-Befund eingefügt wird
- `projects/angular-advanced-odontogram/src/lib/core/tour.ts` - die geführte Einführungstour
- `projects/angular-advanced-odontogram/src/lib/core/perioClassification.ts` - Ableitung der parodontalen Klassifikation nach dem World Workshop 2017
- `projects/angular-advanced-odontogram/src/lib/core/perioExport.ts` / `perioGraphic.ts` / `perioIndexNames.ts` - das SVG-Rendering des Ganzmund-Parodontalstatus-Charts
- `projects/angular-advanced-odontogram/src/lib/core/perioPdf.ts` - der reine jsPDF-Berichts-Assembler (`assemblePdf`)
- `projects/angular-advanced-odontogram/src/lib/core/status_extras.ts` - 22 vordefinierte Restaurationsvorlagen
- `projects/angular-advanced-odontogram/src/lib/core/i18n/` - Übersetzungen, ein pro Sprache lazy geladenes Modul unter `i18n/locales/` (Englisch statisch, die anderen 11 werden über `i18n/loader.ts` beim ersten Gebrauch nachgeladen) sowie der frameworkfreie i18n-Bus
- `projects/angular-advanced-odontogram/src/lib/core/dx/` - standardbasierte Diagnosekodierung: Ableitungsregeln (`derive.ts`), der ICD-10-Diagnosekatalog (`codes.ts`/`caseCodes.ts`), nationale Kodierungspakete — BNO-10/ICD-10-CM (`packs.ts`) — sowie die ICD-10-CM-/SNOMED-CT-Verfeinerungsschicht (`refine.ts`)
- `projects/angular-advanced-odontogram/src/lib/core/anatomy/` - Zahnanatomie-Profile (`classic`/`measured`); die literaturvermessenen `measured`-Vorlagen (`measured.ts`) werden als separater Lazy-Chunk geladen
- `projects/angular-advanced-odontogram/src/lib/core/utils/numbering.ts` - FDI-, Universal-, Palmer-Nummerierungskonvertierung
- `projects/angular-advanced-odontogram/src/lib/core/registry/` - deklaratives Register der klinischen Achsen: FHIR-Feldzuordnungen, SVG-Clear-Set/Boolean-Flag-Aktivierung, Restaurationstyp×Material-Matrix, UI-Optionslisten
- `projects/angular-advanced-odontogram/src/lib/core/fhir/` - HL7-FHIR-R4-Export/Import: `toFhir.ts`/`fromFhir.ts`, `toFhirDx.ts`/`importConditions.ts` (Diagnose-Conditions), `importPerio.ts` (parodontale Observations), Codesysteme, Feldzuordnungen, Primitive
- `projects/angular-advanced-odontogram/src/lib/fhir/` - das veröffentlichte `CodeSystem-odontogram.json` plus der generierte `ValueSet-odontogram-*.json`-Satz (eine pro klinischer Achsen-Wertegruppe, eine für Befundtypen, eine Gesamt-Codes-Menge)
- `projects/angular-advanced-odontogram/src/lib/core/bridgeOverlay.ts` - Mehrzahn-Brückenspann-Verbinder-Overlay
- `projects/angular-advanced-odontogram/src/lib/core/fonts/` - mitgelieferte PDF-Unicode-Schriften (arabische Formgebung, CJK) + der Schriftlader
- `projects/angular-advanced-odontogram/src/lib/core/assets/` - SVG-Zahn-/Icon-Quelldateien (`teeth-svgs/`, `teeth-svgs/measured/`, `icon-svgs/`)
- `projects/angular-advanced-odontogram/src/lib/core/generated/` - die zu Inline-TypeScript-Modulen kompilierten SVGs (`npm run gen:assets`)
- `projects/angular-advanced-odontogram/src/lib/core/__tests__/` + `registry/__tests__/` - der portierte Testkorpus, inkl. der `parity/`-Golden-Fixtures
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/` - `OdontogramShellComponent`, die All-in-one-Shell
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-ui.service.ts` - `OdontogramUiService`, die Zustands-/Effekt-Schicht der zusammensetzbaren UI
- `projects/angular-advanced-odontogram/src/lib/components/engine-state.ts` - der Signal-Helfer `engineState()`
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-engine-lifecycle.ts` - das DI-Token `ODONTOGRAM_ENGINE_LIFECYCLE`
- `projects/angular-advanced-odontogram/src/lib/components/surfaces/` - die vier präsentationalen Oberflächen (Kopfleiste, Chart, Zahninformationen, Zahnsteuerung) und, unter `surfaces/cards/`, die acht deklarativen Steuerungskarten (inkl. `DiagnosesCardComponent`)
- `projects/angular-advanced-odontogram/src/lib/components/settings-modal/` - `SettingsModalComponent` (7-Tab-Einstellungsdialog)
- `projects/angular-advanced-odontogram/src/lib/components/export-options-modal/` - `ExportOptionsModalComponent` und das DI-Token `EXPORT_PDF_FN`
- `projects/angular-advanced-odontogram/src/lib/components/credits-modal/` - `CreditsModalComponent`
- `projects/angular-advanced-odontogram/src/lib/components/case-diagnoses-modal/` - `CaseDiagnosesModalComponent`, das Ganzmund-Popup für Fall-/Regionaldiagnosen
- `projects/angular-advanced-odontogram/src/lib/components/perio-chart/` / `perio-sidebar/` - das eigenständige/inline Parodontalstatus-Chart und seine Kontext-Seitenleiste
- `projects/angular-advanced-odontogram/src/lib/components/dual-state-confirm/` - der gemeinsame Bestätigungsdialog (status↔plan-betreffende Bearbeitungen)
- `projects/angular-advanced-odontogram/src/lib/components/shared/dialog-focus.ts` - gemeinsame Modal-Fokusfalle-/Wiederherstellungs-Hilfsfunktionen
- `projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.ts` - `I18nService`, die reaktive Angular-Fassade über den i18n-Bus des Kerns
- `projects/demo/` - die Angular-Demo-Anwendung (`ng serve` / `npm run build:demo`)
- `scripts/generate-svg-assets.mjs` - der Generator von `npm run gen:assets`

### ⚙️ Technologie-Stack
- Angular 21 (Standalone-Komponenten, Signals) + Angular CLI (`@angular/build`) + TypeScript
- `ng-packagr` für den Bibliotheks-Build (`ng build angular-advanced-odontogram`)
- Tailwind CSS für das UI-Styling, einmal zu einem statischen Stylesheet kompiliert (`npm run build:styles` → `projects/angular-advanced-odontogram/styles.css`) — Konsumenten registrieren dieses Stylesheet, sie führen Tailwind nicht selbst aus
- SVG-Schichtung über DOM-Manipulation im frameworkfreien Kern (nicht-Angular-reaktiver Zustand für Performance — dieselbe Engine, die das React-Original verwendet)
- Ein leichtgewichtiges, frameworkfreies eigenes i18n-System (`core/i18n/`), von `I18nService` für reaktives Angular-Template-Binding umschlossen
- Zwei Test-Runner: reines Vitest für den Kern-Korpus (`vitest run`), die `@angular/build:unit-test`-Vitest-Integration von Angular für die Komponenten-Specs (`ng test`); `@testing-library/jest-dom` für DOM-Matcher
- TypeDoc für API-Dokumentation (`npm run docs`, Ausgabe `docs/api/`)
- jsPDF für den PDF-Bericht; DOMPurify für die Bereinigung der Plugin-Ausgabe

### 📝 Hinweise
- SVG-Vorlagen und Icons werden zur Build-Zeit in generierte TypeScript-Module kompiliert (`npm run gen:assets`) — es gibt keinen Laufzeit-Asset-Abruf und nichts, das aus einem öffentlichen Ordner bereitgestellt werden müsste.
- Die Odontogramm-Engine verwendet ihren eigenen internen, frameworkfreien Zustand (keine Angular-Signals) für das SVG-Raster, aus Performance-Gründen und um mit dem React-Original identisch zu bleiben; Angular-Komponenten lesen ihn reaktiv über `engineState()`/`I18nService`/`onStateChange()`, statt ihn selbst zu besitzen.
- Milchzähne verfügen über einen reduzierten Satz verfügbarer Materialien (kein Amalgam, kein stiftbasiertes Endo).
- Implantatzähne haben andere Kronen-/Abutment-Optionen als natürliche Zähne.

### 🔒 Sicherheitshinweise

- **Plugins laufen als vertrauenswürdiger Code.** Der Rückgabewert von `renderSvg()` eines Plugins wird in das SVG des Live-Befunds eingefügt. Diese Ausgabe wird vor dem Einfügen mit [DOMPurify](https://github.com/cure53/DOMPurify) (SVG-Profil, plus `svgFilters`) bereinigt — `<script>`, `<iframe>`, `<object>`, `<embed>` und `<foreignObject>` sind grundsätzlich verboten, und vollständig bösartige Ausgaben werden verworfen statt teilweise gerendert. Das verringert die Angriffsfläche eines kompromittierten oder fehlerhaften Plugins, aber Plugins sollten dennoch nur aus vertrauenswürdigen Quellen geladen werden — die Bereinigung ist ein Sicherheitsnetz, kein Ersatz für eine Prüfung.
- **Content-Security-Policy.** Dieses Paket fügt bei der Einbettung als Bibliothek keine eigene CSP ein. Host-Anwendungen, die `OdontogramShellComponent` rendern, sollten eine eigene, zu ihrem Einsatz passende CSP setzen; eine sinnvolle Grundlage spiegelt die Policy der Demo des ursprünglichen React-Projekts wider:

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

### 📖 Zitierung

Dieses Paket hat keinen eigenen Zitationseintrag — es ist ein Port, der seine klinische Engine wortwörtlich mit dem ursprünglichen Projekt teilt. Wenn Sie diese Software in Ihrer Forschung verwenden, zitieren Sie bitte das Original:

> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Alle Versionen (Konzept-DOI):** https://doi.org/10.5281/zenodo.21156787

Maschinenlesbare Zitationsmetadaten finden Sie in der [`CITATION.cff`](https://github.com/ZoliQua/React-Advanced-Odontogram/blob/main/CITATION.cff) des ursprünglichen Projekts.

## 🙌 Danksagung

Angular Advanced Odontogram wird von Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)) erstellt und gepflegt, dem Schöpfer und leitenden Entwickler dieses Ports und der zugrunde liegenden klinischen Engine. Dasselbe In-App-Popup (Kopfleiste → „Über das Projekt und Danksagungen") führt diese Namen auf.

**Ursprüngliches Projekt**

- [React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram) (npm: [`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)): die ursprüngliche React-Implementierung, deren Port dieses Paket ist — die klinische Engine (Zahnstatuslogik, parodontale Erfassung, Diagnosekodierung, FHIR-Export/-Import, i18n-Strings, Tour, SVG-Vorlagen) wird wortwörtlich geteilt.

**Erstellt mit** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [Angular](https://angular.dev), [Angular CLI](https://angular.dev/tools/cli), [TypeScript](https://www.typescriptlang.org) und [Tailwind CSS](https://tailwindcss.com).

Beiträge sind willkommen — siehe [`CONTRIBUTING.md`](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/CONTRIBUTING.md). Wenn Ihnen dieses Projekt nützt, geben Sie ihm bitte [einen Stern auf GitHub](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
