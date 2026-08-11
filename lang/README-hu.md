# 🦷 Angular Advanced Odontogram

[![npm](https://img.shields.io/npm/v/angular-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/angular-advanced-odontogram)
[![Verzió](https://img.shields.io/badge/version-1.1.0-green?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/releases)
[![Licenc](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/LICENSE)

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**📖 Dokumentáció nyelvenként:** 🇬🇧 [English](../README.md) · 🇭🇺 Magyar (ez a fájl)

Interaktív, SVG-alapú **fogászati odontogram- (fogtérkép-) szerkesztő** **Angular + TypeScript** alapon — teljes **parodontális charting modullal**, többfelszínes caries/restaurációs jelöléssel, endodonciai/protetikai állapotokkal, FDI/Universal/Palmer számozással, **HL7 FHIR R4** exporttal/importtal, opcionális ICDAS-pontozással és 12 nyelvű felülettel.

> **Ez a [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul) hivatalos Angular portja** (npm: `react-advanced-odontogram`). Teljes funkcionális paritásban van a react-advanced-odontogram v2.4.0-jával (payload verzió 2.20) — a JSON- és FHIR R4-exportok oda-vissza kompatibilisek a két könyvtár között. A klinikai motor szó szerint közös; csak a komponens-héj Angular-natív.

🔗 **Élő demó:** https://angular-advanced-odontogram.vercel.app/ \
⚛️ **Eredeti React projekt:** https://github.com/ZoliQua/React-Odontogram-Modul

![Odontogram szerkesztő előnézet](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_hu_odontogram.png)
*Képernyőkép az eredeti React projektből — az Angular port ugyanezt a felületet jeleníti meg.*

---

## 📦 Telepítés

```bash
npm install angular-advanced-odontogram
```

**Követelmények:** Angular **21+**; az `exports` mezőt és az ESM-et támogató bundler (az Angular CLI alapból megfelel). A csomag **csak ESM**.

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
