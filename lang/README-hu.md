<p align="center">
  <img src="https://raw.githubusercontent.com/ZoliQua/Angular-Advanced-Odontogram/main/docs/angular-module-logo.png" alt="Angular Advanced Odontogram logó" width="160" />
</p>

# 🦷 Angular Advanced Odontogram

[![npm](https://img.shields.io/npm/v/angular-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/angular-advanced-odontogram)
[![Verzió](https://img.shields.io/badge/version-1.1.0-green?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/releases)
[![Licenc](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/LICENSE)

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**📖 Dokumentáció nyelvenként:** 🇬🇧 [English](../README.md) · 🇭🇺 Magyar (ez a fájl)

Interaktív, SVG-alapú **fogászati odontogram- (fogtérkép-) szerkesztő** **Angular + TypeScript** alapon — teljes **parodontális charting modullal**, többfelszínes caries/restaurációs jelöléssel, endodonciai/protetikai állapotokkal, FDI/Universal/Palmer számozással, **HL7 FHIR R4** exporttal/importtal, opcionális ICDAS-pontozással és 12 nyelvű felülettel.

> **Ez a [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul) hivatalos Angular portja** (npm: `react-advanced-odontogram`). Teljes funkcionális paritásban van a react-advanced-odontogram `main` ágának `934a911` commitjával (v2.4.0 utáni állapot, payload verzió 2.20) — a JSON- és FHIR R4-exportok oda-vissza kompatibilisek a két könyvtár között. A klinikai motor szó szerint közös (csak öt szűken dokumentált eltéréssel — lásd a portolási specifikációt); csak a komponens-héj Angular-natív.

🔗 **Élő demó:** https://angular-advanced-odontogram.vercel.app/ \
⚛️ **Eredeti React projekt:** https://github.com/ZoliQua/React-Odontogram-Modul

![Odontogram szerkesztő előnézet](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_hu_odontogram.png)
*Képernyőkép az eredeti React projektből — az Angular port ugyanezt a felületet jeleníti meg.*

---

## 📑 Tartalom

- [📦 Telepítés](#-telepítés)
- [🚀 Gyors kezdés](#-gyors-kezdés)
- [🦷 Parodontális charting](#-parodontális-charting)
- [✨ Főbb jellemzők](#-főbb-jellemzők)
- [📖 Dokumentáció](#-dokumentáció)
- [🛠️ Fejlesztés](#-fejlesztés)
- [📄 Licenc és hivatkozás](#-licenc-és-hivatkozás)
- [🙌 Köszönet](#-köszönet)

## 📦 Telepítés

```bash
npm install angular-advanced-odontogram
```

**Követelmények:** Angular **21.2+** (peer dependency); az `exports` mezőt és az ESM-et támogató bundler (az Angular CLI alapból megfelel). A csomag **csak ESM**.

## 🚀 Gyors kezdés

Renderelje az `OdontogramShellComponent`-et, és regisztrálja a stíluslapot **egyszer** (pl. az `angular.json`-ban):

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
  template: `<aao-odontogram-shell language="hu" numberingSystem="FDI" [darkMode]="false" />`,
})
export class ChartComponent {}
```

Az imperatív állapot-API, az önállóan is használható `PerioChartComponent`, a bemutató túra és minden publikus típus ugyanabból a belépési pontból importálható:

```ts
import {
  OdontogramShellComponent,
  PerioChartComponent,          // önálló parodontális chart
  getOdontogramSummary,
  exportStatus, importStatus,   // JSON állapot-szerializáció / -visszatöltés
  exportFhir, exportSvg, exportImage,
  setReadOnly, startIntroTour,
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,  // opcionális localStorage-perzisztencia (host által bekötve)
} from "angular-advanced-odontogram";
```

### 🧩 Összeállítható felületek (haladó)

Az `OdontogramShellComponent` a támogatott, egybeépített komponens, és nincs szüksége extra beállításra. Ha az odontogram régióit a saját elrendezésed különböző területein szeretnéd elhelyezni, a shell négy UI-felülete is exportálva van, és egyetlen `OdontogramUiService` alá szervezve összeállítható — mindegyik ugyanazt a példányhoz kötött munkamenetet osztja meg:

```ts
import { Component, inject } from "@angular/core";
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
  providers: [OdontogramUiService],   // egy példány = egy, ehhez a hosthoz kötött munkamenet
  template: `
    <my-header-area><aao-odontogram-topbar /></my-header-area>
    <my-main-area>
      <aao-odontogram-chart-surface />
      <aao-tooth-info-surface />
    </my-main-area>
    <my-side-panel><aao-tooth-controls-surface /></my-side-panel>
  `,
})
export class WorkspaceComponent {
  protected readonly ui = inject(OdontogramUiService);
  // Itt hívd meg a `ui.configure({ ...OdontogramUiConfig })`-ot (konstruktorban
  // vagy mezőinicializálóban), majd `ngAfterViewInit()`-ből `ui.init()`-et és
  // `ngOnDestroy()`-ból `ui.destroy()`-t — pontosan azt a sorrendet, amit maga
  // az `OdontogramShellComponent` forráskódja használ; a teljes, működő
  // referenciáért nézd meg ott (az `OdontogramUiConfig` minden mezője kötelező
  // `Signal`, így egy valódi host mindegyiket megadja, jellemzően a saját
  // `input()`-jaiként).
}
```

Az `OdontogramUiService` ugyanazt a konfigurációs alakot várja, mint az `OdontogramShellComponent` inputjai. Jelenlegi megkötés: oldalanként egy `OdontogramUiService`-példány (a motor modul-szintű singleton). A felületek igény szerint mountolhatók és unmountolhatók. Maga az `OdontogramShellComponent` változatlan — pontosan ez az összeállítás az alapértelmezett elrendezésben.

A még finomabb összeállításhoz az egyes vezérlőkártyák is exportálva vannak — `StatusesCardComponent`, `ToothDetailsCardComponent`, `CariesCardComponent`, `FillingsCardComponent`, `RootPeriodontiumCardComponent` és `OrthodonticsCardComponent` (plusz a caries- és fillings-kártyák által belsőleg használt, megosztott `SurfaceCrossComponent`) — mindegyik önálló, deklaratív komponens, amely az `inject(OdontogramUiService)` és az exportált `engineState()` segédfüggvény (egy tetszőleges motor-getter signalt visszaadó, a mag saját változás-értesítésein friss állapotban tartott olvasása) révén olvassa és írja a közös munkamenetet. Csak azokat a kártyákat mountold, amelyekre egy adott elrendezésnek szüksége van, tetszőleges elrendezésben, egyetlen `OdontogramUiService` alatt. A `CreditsModalComponent` (a topbar "Névjegy és köszönet" felugró ablaka) is exportálva van azoknak a hosteknak, akik a saját nyitás/zárás állapotukból szeretnék vezérelni.

> **SSR:** a komponens csak kliensoldali (mountoláskor a DOM-ot olvassa) — kizárólag böngészőoldalon renderelje.
> **Az assetek önhordók** — a fog- és ikon-SVG-k a bundle-be épülnek; nincs futásidejű asset-letöltés.
> **Oldalanként egy példány** ebben a kiadásban (a motor állapota modul-szintű singleton — akárcsak a React eredetiben).

## 🦷 Parodontális charting

![Teljes szájra kiterjedő parodontális chart](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_hu_perio.png)
*Képernyőkép az eredeti React projektből — az Angular port ugyanezt a felületet jeleníti meg.*

Helyenkénti szondázási mélység, ínyszél és szondázási vérzés (+ suppuráció) a hat standard mérési ponton, származtatott CAL-lal, recesszióval és teljes szájra vetített %BOP-pal; grafikus teljes-száj perio chart (CEJ-vonal, mm-es segédrács, tasak-/ínyszél-görbe, anatómiai gyémánt indexcsempék), 2017-es stádium-/fokozatbesorolás és helyenkénti FHIR-export (LOINC parodontális panel `74029-0`). Elérhető `Odontogram | Parodontális státusz` nézetváltóként és önállóan meghívható `PerioChartComponent`-ként.

## ✨ Főbb jellemzők

- 🦷 Maradó / tej- / implantátum- / hiányzó fogak; szubsztrátum, restaurációk (korona/inlay/onlay/héj/híd × anyagok), kivehető és implantátum-fogpótlások
- 🔍 Többfelszínes caries és tömések (ICDAS / CARS súlyosság, gyökér- és radiográfiai caries), endodoncia és AAE pulpadiagnózis, apikális diagnózis, periimplantális státusz, kopás, elszíneződés, fogszabályozás
- 🩺 Teljes parodontális modul (lásd fent) + 2017-es klasszifikáció
- 🔗 **HL7 FHIR R4** export/import; JSON export/import migrációkkal — oda-vissza kompatibilis a [`react-advanced-odontogram`](https://github.com/ZoliQua/React-Odontogram-Modul) csomaggal
- 🖼️ PNG / JPG / SVG chart-export és konfigurálható **PDF-riport** (jsPDF) — szekciónkénti elrendezés-/tartalombeállítások, többnyelvű PDF-fontok (arab shaping, CJK) és egyedi, fogankénti jegyzetek az exportokban
- 💾 Opcionális **localStorage-perzisztencia** API (host által bekötve, alapból kikapcsolva) · 🗂️ összecsukható panelkártyák · 🎛️ elérhetőség-vezérlők az export/import formátumokhoz, a Terv módhoz és a parodontális charthoz
- 🦴 Választható **fog-anatómia profil** — `classic` (alapértelmezett) vagy `measured` (kilenc, szakirodalmi méréseken alapuló fogsablon, két fogívre bontott, foganként eltérő szélességű elrendezésben), futásidőben átkapcsolható a Beállítások → Odontogram menüben
- 🧱 **Összeállítható UI** — az egybeépített shellen túl a négy megjelenítő felület és mind a hét deklaratív vezérlőkártya külön-külön is exportálva van egyéni host-elrendezésekhez (lásd az [Összeállítható felületek](#-összeállítható-felületek-haladó) szakaszt fentebb)
- ℹ️ Beépített **Névjegy/köszönet felugró ablak** (topbar) — feltünteti az alkotót, a közreműködőket és az eredeti React projektet, amelyre ez a port épül
- 🔢 FDI / Universal / Palmer számozás · 🌐 12 nyelvű felület (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR, arab RTL) · 🎨 témázás `--odon-*` CSS-változókkal · 🧩 plugin-rendszer · ⌨️ billentyűzetes akadálymentesség

## 📖 Dokumentáció

Az API-referencia TypeDoc-kal generálható — `npm run docs` (kimenet: `docs/api/`). A közös klinikai motor API-ját az eredeti projekt is dokumentálja:

📚 **https://zoliqua.github.io/React-Odontogram-Modul/**

Host-alkalmazások teszteléséhez két támogatott dependency-injection felülbírálási pont exportált: `ODONTOGRAM_ENGINE_LIFECYCLE` (motor init/destroy) és `EXPORT_PDF_FN` (PDF-export függvény).

## 🛠️ Fejlesztés

```bash
npm install
npm run gen:assets     # SVG asset-modulok újragenerálása SVG-módosítás után
npm test               # teljes futtatás: szó szerinti React motor-korpusz (sima Vitest) + Angular specek (ng test)
npm run build:styles && npx ng build angular-advanced-odontogram   # library build (előbb a stílusok)
npm run build:demo     # demó alkalmazás
```

## 📄 Licenc és hivatkozás

MIT © Dul Zoltán. Ez a könyvtár a [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul) portja; ha kutatásban használja, kérjük, az eredeti projektet idézze — lásd a [`CITATION.cff`](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/CITATION.cff) fájlt és a [Zenodo-rekordot](https://doi.org/10.5281/zenodo.21156787).

## 🙌 Köszönet

Az Angular Advanced Odontogramot Dul Zoltán ([@ZoliQua](https://github.com/ZoliQua)) készíti és tartja karban — ő ennek a portnak és az alatta futó klinikai motornak is az alkotója és vezető fejlesztője. Ugyanezeket a neveket sorolja fel az alkalmazáson belüli felugró ablak is (topbar → "Névjegy és köszönet").

**Eredeti projekt**

- [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul): az eredeti React implementáció, amelynek ez a csomag a portja — a klinikai motor (fogászati státusz-logika, parodontális charting, FHIR export/import, i18n-szövegek, bemutató túra, SVG-sablonok) szó szerint közös.

**Közreműködők** (a közös klinikai motorhoz — itt is felsorolva, mert a munkájuk változatlanul beépül ebbe a portba)

- [@odontodev](https://github.com/odontodev): állapot-hidratáció és életciklus-API, a tömések beállításai vezérelt propokként, idempotens setterek és összecsukható kártyák
- [@JulianoBazzi](https://github.com/JulianoBazzi): brazil portugál fordítás
- [@yassine-bhn](https://github.com/yassine-bhn): francia fordítás és a mért anatómia jelölt változata
- [@saegerdirk-star](https://github.com/saegerdirk-star): mért fog-anatómia és a foggenerátor, valamint az összeállítható felület javaslata

**Az alábbiakkal készült:** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [Angular](https://angular.dev), [Angular CLI](https://angular.dev/tools/cli), [TypeScript](https://www.typescriptlang.org) és [Tailwind CSS](https://tailwindcss.com).

A közreműködést szívesen fogadjuk — lásd a [`CONTRIBUTING.md`](../CONTRIBUTING.md) fájlt. Nyiss egy pull requestet, és itt és az alkalmazásban is fel leszel tüntetve. Ha hasznosnak találod a projektet, adj neki egy [csillagot a GitHubon](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
