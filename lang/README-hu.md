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

> 🌐 **Languages:** 🇬🇧 [English](README-en.md) | 🇭🇺 Magyar (ez a fájl) | 🇩🇪 [Deutsch](README-de.md) | 🇪🇸 [Español](README-es.md) | 🇫🇷 [Français](README-fr.md) | 🇮🇹 [Italiano](README-it.md) | 🇵🇱 [Polski](README-pl.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇷🇺 [Русский](README-ru.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md)

---

## 📑 Tartalomjegyzék

- [📋 Áttekintés](#-áttekintés)
- [📦 Használat npm csomagként](#-használat-npm-csomagként)
- [✨ Főbb funkciók](#-főbb-funkciók)
- [📦 Modulok](#-modulok)
- [🛠️ UI vezérlők](#-ui-vezérlők)
- [🦷 Fogtípusok és állapotok](#-fogtípusok-és-állapotok)
- [⚙️ Beállítások](#-beállítások)
- [🖼️ SVG sablon rendszer](#-svg-sablon-rendszer)
- [🔢 Számozási rendszerek](#-számozási-rendszerek)
- [🚀 Használat](#-használat)
- [🔗 Integráció](#-integráció)
- [🧪 Tesztelés](#-tesztelés)
- [📖 API Dokumentáció](#-api-dokumentáció)
- [📡 Nyilvános API](#-nyilvános-api)
- [💾 Állapotmentés (localStorage)](#-állapotmentés-localstorage)
- [💾 Állapot Export/Import formátum](#-állapot-exportimport-formátum)
- [🖨️ Export](#-export)
- [📁 Mappastruktúra](#-mappastruktúra)
- [⚙️ Technológia](#-technológia)
- [📝 Megjegyzések](#-megjegyzések)
- [🔒 Biztonsági megjegyzések](#-biztonsági-megjegyzések)
- [📖 Hivatkozás](#-hivatkozás)

## 🇭🇺 Magyar

### 📋 Áttekintés

Ez a projekt egy interaktív, böngészőben futó odontogram szerkesztő **Angular + TypeScript** alapon, amely a fogazati státuszrögzítést áttekinthető kezelőfelülettel támogatja. A rendszer rétegzett SVG fogsablonok segítségével jeleníti meg a pótlásokat, szuvasodásokat, endodonciai állapotokat, mobilitást és egyéb klinikai jellemzőket, miközben többfogos kiválasztást, kiválasztási szűrőket és előre definiált státusz mintákat is biztosít.

**Ez a [React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram) hivatalos Angular portja** (npm: [`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)). Funkcionális paritás a react-advanced-odontogram **v2.6.0** kiadásával (`215c43a` motor commit), payload verzió **2.22** — a JSON és FHIR R4 exportok a két könyvtár között oda-vissza kompatibilisek. A klinikai motor (`projects/angular-advanced-odontogram/src/lib/core/`) szó szerint megosztott — a fogazati státusz logika, a parodontális rögzítés, a diagnóziskódolás, a FHIR export/import, az i18n szövegek, az irányított bemutató túra és az SVG sablonok byte-azonosak a React eredetivel, és minden egyes resync alkalmával egy rögzített upstream commitból kerülnek újramásolásra; kizárólag a komponens váz (`projects/angular-advanced-odontogram/src/lib/components/`) natív Angular. Egy kis, explicit módon dokumentált eltérés-halmaz létezik (kizárólag márka-/identitás-szövegek — lásd a port tervezési specifikációját ebben a repóban). A verziószámozás lépést tart a React modul verziószámozásával.

---
![Odontogram editor preview](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_hu_odontogram.png)
*Képernyőkép az eredeti React projektből — az Angular port ugyanazt a felületet jeleníti meg.*

🔗 **Élő demó:** https://angular-advanced-odontogram.vercel.app/

---

### 📦 Használat npm csomagként

Az odontogram önálló Angular komponenskönyvtárként érhető el az npm-en:
[`angular-advanced-odontogram`](https://www.npmjs.com/package/angular-advanced-odontogram).

#### Követelmények
- **Angular 21.2+** (peer dependency-ként deklarálva — az alkalmazásod biztosítja).
- Egy **bundler**, amely érti az `exports` mezőt és az ESM-et — az Angular CLI (`@angular/build`) ezt natívan teljesíti. A csomag **kizárólag ESM**.
- Node **≥ 20** az eszközökhöz.

#### Telepítés

```bash
npm install angular-advanced-odontogram
```

#### Alapvető használat

Regisztráld a stíluslapot **egyszer**, bárhol, ahol az alkalmazásod globális stílusai konfigurálva vannak (pl. `angular.json`):

```json
"styles": [
  "node_modules/angular-advanced-odontogram/styles.css",
  "src/styles.css"
]
```

Ezután rendereld az `OdontogramShellComponent`-et:

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

A `language` a `hu | en | de | es | it | sk | pl | ru | pt-br | zh | ar | fr` értékeket fogadja el; a `numberingSystem` a `FDI | UNIVERSAL | PALMER` értékeket.

#### Komponens bemenetek

Az `OdontogramShellComponent` egy vezérelt (controlled) komponens — minden bemenet egy Angular `input()` signal, mind opcionális, mindegyik a motor saját alapértelmezett értékére esik vissza, ha kihagyják. A leggyakoribbak:

| Input | Típus | Alapértelmezett | Leírás |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | UI nyelv (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`zh`/`ar`/`fr`). |
| `numberingSystem` | `"FDI" \| "UNIVERSAL" \| "PALMER"` | `"FDI"` | Fogszámozási rendszer. |
| `darkMode` | `boolean` | `false` | Sötét téma kapcsoló. |
| `readOnly` | `boolean` | `false` | Minden szerkesztés letiltása (csak megtekintés). |
| `themeConfig` | `OdontogramThemeConfig` | — | Téma CSS változók felülírása (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Egyedi állapot pluginek / extra rétegek regisztrálása. |
| `enableNotes` | `boolean` | `false` | Fogankénti megjegyzések engedélyezése. |
| `enableIcdas` | `boolean` | `false` | ICDAS II caries pontozás engedélyezése. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | A Tömések kártya komplexitása: `"simple"` (egy anyag foganként) vagy `"complex"` (anyagok felületenként). |
| `fillingDefectEnabled` | `boolean` | `true` | Bekapcsolja a tömési defektusok rögzítését a Tömések kártyán. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | mind elérhető | Elérhető tömőanyagok logikai leképezésként a `amalgam`/`composite`/`gic`/`temporary` kulcsokon (ismeretlen kulcsok figyelmen kívül hagyva). |
| `fissureSealingEnabled` | `boolean` | `true` | Bekapcsolja a barázdazárást a Tömések kártyán. |
| `languageChange` / `numberingChange` / `darkModeChange` (outputok) | `output<T>` | — | Akkor aktiválódnak, amikor a felhasználó módosítja a beállítást a felületen. |
| `fillingComplexityChange` / `fillingDefectEnabledChange` / `fillingMaterialAvailabilityChange` / `fissureSealingEnabledChange` (outputok) | `output<T>` | — | Akkor aktiválódnak, amikor a felhasználó módosítja az adott beállítást a Beállítások → Tömések menüben. |

Finomabb részletezettségi szintet meghatározó bemenetek (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `cariesDepthEnabled`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) is elfogadottak — a teljes, típusos listáért lásd az `odontogram-shell.component.ts` fájlt.

A fenti négy tömésekkel kapcsolatos bemenet **csak visszaállításra** szolgál: a kihagyott bemenet soha nem ír a motorba (a mount előtti imperatív `setFillingComplexity()` hívás megmarad), míg a megadott bemenet a motorba és a Beállítások modál állapotába egyszerre ír, így a modál soha nem mutat elavult értéket. A `fillingMaterialAvailability` diff-szerűen, kanonikus szerializált kulcson keresztül kerül alkalmazásra — az azonos tartalmú új objektum-literállal történő újrarenderelés soha nem írja újra a motort. A hozzá tartozó `*Change` outputok a Beállítások → Tömések menüből aktiválódnak: ez a visszaírási út a preferenciákat mentő hosztok számára.

#### Nyilvános API (elnevezett exportok)

Az `OdontogramShellComponent` egy elnevezett (named) export. Az imperatív állapot API, az önálló `PerioChartComponent`, az irányított bemutató túra, valamint az összes nyilvános típus ugyanabból a belépési pontból elérhető elnevezett exportként:

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

A teljes felület (jóval több mint 100 függvény és típus — `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PdfSettings`, `PerioViewMode`, és még sok más) teljesen típusosan szerepel a mellékelt `.d.ts` deklarációkban; a kurált referencia táblázatért lásd a [Nyilvános API](#-nyilvános-api) szakaszt lentebb.

#### Összeállítható felületek (haladó)

Az `OdontogramShellComponent` a támogatott, mindent egyben komponens, és nem igényel további beállítást. Ha az odontogram régióit a saját elrendezésének különböző területein szeretnéd elhelyezni, a shell négy felhasználói felületi felülete is exportálva van, és egyetlen `OdontogramUiService` alatt állítható össze, mindegyik egyetlen, instance-tulajdonú munkameneten osztozva:

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

Az `OdontogramUiService` ugyanazt a konfigurációs alakot fogadja el, mint az `OdontogramShellComponent` bemenetei (a `configure()` metódusa egy `OdontogramUiConfig` objektumot fogad `Signal`-okból/callbackekből, minden mező opcionális, ugyanazzal az upstream alapértelmezett értékkel). Jelenlegi korlát: oldalanként egy `OdontogramUiService` instance (a motor modul-szintű singleton). A felületek igény szerint fel- és leválaszthatók. Maga az `OdontogramShellComponent` változatlan — pontosan ez az összeállítás az alapértelmezett elrendezésben, továbbra is explicit módon kötve minden mezőt a saját bemeneteiből.

A még finomabb összeállításhoz az egyes vezérlőkártyák is exportálva vannak:

| Komponens | Szelektor | Lefedi |
|---|---|---|
| `StatusesCardComponent` | `aao-statuses-card` | Teljes szájüreg státusz/extra vezérlők (Alaphelyzet, tejfogazat/vegyes fogazat, fogatlan, státusz extrák) |
| `ToothDetailsCardComponent` | `aao-tooth-details-card` | Alap sor (fog kiválasztás/szubsztrátum), törött-korona jelölőnégyzetek, korona szükséges/csere kapcsolók |
| `CariesCardComponent` | `aao-caries-card` | Caries-mélység mód, korona alatti caries, gyökér-caries súlyosság, felületenkénti caries választó |
| `FillingsCardComponent` | `aao-fillings-card` | Tömőanyag, felületenkénti tömés választó + defektusok, subcaries/defektus figyelmeztető megjegyzések |
| `RootPeriodontiumCardComponent` | `aao-root-periodontium-card` | Pulpa/endo státusz, apikális diagnózis, reszorpció, mobilitás, peri-implantáris státusz |
| `OrthodonticsCardComponent` | `aao-orthodontics-card` | Készülék, elmozdulás, vertikális mozgás, rotáció |
| `SurfaceCrossComponent` | `aao-surface-cross` | A Caries/Tömések kártyák által belsőleg használt, megosztott B/M/O/D/L kereszt-kiválasztó widget |
| `DiagnosesCardComponent` | `aao-diagnoses-card` | Fogankénti ICD-10/BNO-10/ICD-10-CM/SNOMED diagnóziskódolás — egy fog levezetett diagnózisainak megtekintése és kurálása (egy levezetett diagnózis elnyomása, vagy olyan hozzáadása, amelyet a diagram nem képvisel) |

Minden kártya egy önálló, deklaratív komponens, amely a megosztott munkamenetet az `inject(OdontogramUiService)` és az exportált `engineState()` segédfüggvény segítségével olvassa és írja (a motor bármely getterének signal-t visszaadó olvasása, amelyet a mag saját változás-értesítési busza tart naprakészen). Csak azokat a kártyákat csatold, amelyekre az adott elrendezésnek szüksége van, tetszőleges elrendezésben, egyetlen `OdontogramUiService` alatt. A `CreditsModalComponent` (`aao-credits-modal`, a fejléc "Névjegy és köszönet" popupja) és a `CaseDiagnosesModalComponent` (`aao-case-diagnoses-modal`, a teljes szájüregre kiterjedő eset-/regionális diagnózisok popupja) egyaránt exportálva van, azoknak a hosztoknak, akik saját nyit/zár állapotukból szeretnék vezérelni.

```ts
import { engineState, OdontogramUiService, getOdontogramSummary } from "angular-advanced-odontogram";

// Anywhere inside an injection context under an `OdontogramUiService`:
readonly summary = engineState(getOdontogramSummary); // Signal<OdontogramSummary>, kept fresh automatically
```

#### DI csatlakozási pontok hoszt-oldali teszteléshez

Két `InjectionToken` teszi lehetővé, hogy egy hoszt alkalmazás a saját tesztjeiben felülírja a motor mellékhatásos hívásait (mindkettő alapértelmezetten a valódi motorhívásra esik vissza production környezetben; mindkettő `providedIn: "root"`):

| Token | Felülírja | Alak |
|---|---|---|
| `ODONTOGRAM_ENGINE_LIFECYCLE` | `initOdontogram()` / `destroyOdontogram()`, az `OdontogramShellComponent` `ngAfterViewInit()`/`ngOnDestroy()` metódusából hívva | `{ init: () => Promise<void>; destroy: () => void }` |
| `EXPORT_PDF_FN` | `exportPdf(opts)`, az `ExportOptionsModalComponent`-ből hívva "Export" gombra kattintáskor | `(opts: PdfExportOptions) => Promise<void>` |

Mindkettő azért létezik, mert a valódi függvények a DOM-ot/canvast/`jsPDF`-belsőségeket érintik, amit egy fejlécnélküli (headless) tesztkörnyezet nem tud teljes mértékben biztosítani — írd felül őket az Angular `TestBed` provider tömbjén keresztül egy hoszt alkalmazás saját komponens-teszteiben.

#### Fontos megjegyzések és jelenlegi korlátok
- **Kizárólag ESM** — a csomag egyetlen ES modult publikál (a `ng-packagr`-rel összeállítva), plusz a hozzá tartozó típusdeklarációs belépési pontot. A bundler modulfeloldást célozza; nincs CommonJS build.
- **A stíluslap külön van** — kötelező egyszer regisztrálnod az `angular-advanced-odontogram/styles.css` fájlt; ez nem töltődik be automatikusan. A stílus globális CSS, amely a `.odontogram-root` alá van skálázva, és `--odon-*` CSS változók vezérlik.
- **SSR / kizárólag kliensoldali** — a komponens csatoláskor (mount) olvassa a DOM-ot, ezért a böngészőben kell futnia; kizárólag kliensoldalon rendereld.
- **Az eszközök (assets) önállóak** — a fog- és ikon-SVG-k build időben be vannak ágyazva a bundle-be (generált TypeScript modulok, `npm run gen:assets`); **nincs futásidejű asset lekérés**, amit be kellene állítani, és semmi extrát nem kell átmásolni az alkalmazásod public mappájába.
- **Igény szerinti betöltés** — csak az angol nyelv és a `classic` fogazatanatómia grafikái szerepelnek a kezdeti bundle-ben; a másik 11 UI-nyelv táblázata és a `measured` anatómia-profil grafikái külön, lazán betöltött (lazy) chunkok, amelyek csak akkor töltődnek le, amikor egy hoszt először vált rájuk (`setI18nLanguage`/a nyelvválasztó menü, illetve `setToothAnatomy("measured")`/Beállítások → Odontogram → fogazatanatómia). Ez a resync-szétválasztás a demó fő chunkját 3,12 MB-ról 1,23 MB-ra, a kezdeti teljes méretet pedig 3,21 MB-ról 1,32 MB-ra csökkentette — a hoszt oldalán nincs mit beállítani.
- **Oldalanként egy példány** ebben a kiadásban — a motor állapota modul-szintű singleton (ugyanúgy, mint a React eredetiben), ezért ha ugyanazon az oldalon két `<aao-odontogram-shell>` példányt renderelsz, azok egyetlen diagram állapotát osztanák meg egymással.

---

### ✨ Főbb funkciók
- 🖱️ Gyors fogkijelölés és többfogos kiválasztás (CMD/CTRL + kattintás)
- 🦷 Fogtípusok: maradó, tejfog, implantátum, ínyalatti, hiányzó
- 🦷 Fogszubsztrátum (bármely pótlástól függetlenül): természetes, radix (gyökércsonk), törött, koronára előkészített
- 👑 Pótlások típus × anyag szerint: korona / inlay / onlay / héj (veneer) / híd e.max, arany, gradia, cirkon, fém, fémkerámia, teleszkópos vagy ideiglenes anyagból (az onlay csak okkluzális nézetben érhető el) — egyetlen kombinált, kevés kattintást igénylő "Fix: Korona – …" választóból kiválasztva; a korábbi `metal` koronák automatikusan `metal-ceramic` (fémkerámia) típusra migrálódnak; az implantátumok ugyanazt a típus × anyag modellt használják, kiegészítve egy implantátum-csatlakozó réteggel. A választó a fog típusától függően szűkül: implantátum esetén csak korona/híd választható (plusz az alábbi öt csatlakozási lehetőség), hiányzó/foghiány fog esetén csak híd-pontik (plusz kivehető részleges/teljes fogsor), `radix` szubsztrátum esetén a pótlás-választó teljesen elrejtve (gyökércsonkra nem rögzíthető pótlás)
- 🦿 Kivehető/csatlakozós protetika a dedikált `prosthesis` tengelyen (a kombinált választó "Kivehető:" bejegyzései): implantátum gyógyuló csavarja, lokátor, lokátor protézissel (overdenture), bár, bár protézissel; fogtámasztékú kivehető részleges vagy teljes fogsor
- 🌉 A hídtag fogak megjelenítik mind a koronát, mind a nyeregpántos (saddle) csatlakozót; egy több fogra kiterjedő híd-overlay egyetlen folytonos, ívhez igazodó csatlakozót jelenít meg az egymást követő hídtagokon (pontikok + pillérek) és a köztük lévő fogközi réseken keresztül, a PNG/JPG/SVG exportban is szerepel
- 🔍 Szuvasodás rögzítése 6 felületen: meziális, disztális, bukkális, linguális, okkluzális, korona alatti
- 🪥 Tömőanyagok felületenként: amalgám, kompozit, GIC, ideiglenes
- 🏥 Egyetlen összevont "Pulpa / Endo státusz" választó (csoportosítva: vitális pulpa vs. kezelt/endo): az endodonciai állapotok (gyógyszeres tömés, gyökértömés, nem teljes gyökértömés, üvegszálas csap, fémcsap) és az AAE pulpa diagnózis (`pulpDx`: normal / reverzibilis / irreverzibilis pulpitis / necrosis) kölcsönösen kizárják egymást — egy gyökérkezelt fogon (`endo` beállítva) nem szerepelhet egyidejűleg vitális pulpa diagnózis; kezelés esetén a `pulpDx` automatikusan `normal`-ra áll vissza. Az opcionális, 3 szintű pulpa részletezettségi beállítás (`pulpDetailLevel`: simple / AAE / gyakorlati latin) 9 gyakorlati latin pulpa altípust jelenít meg a `pulpLatin` mezőn keresztül
- 🦴 Apikális diagnózis (`apicalDx`: tünetekkel járó/tünetmentes apikális periodontitis, akut/krónikus apikális tályog, condensing osteitis) közvetlenül meghatározza a periapikális jelölést; a granuloma/ciszta lézió-altípus minősítő csak tünetekkel járó/tünetmentes apikális periodontitis esetén jelenik meg
- 🩹 Összevont "Gyökér és fogágy" kártya (egyetlen összecsukható szekció a gyökér-/periapikális és parodontális leletekhez)
- ⚕️ Módosítók: periapikális gyulladás (csak hiányzó/extrakciós alveolus fogakon jelenik meg; meglévő fogakon és implantátumokon rejtett, ahol a `periImplant` fedi le), parodontális betegség, mobilitási fokok (M1/M2/M3, implantátumokon rejtett)
- 🦷🔩 Peri-implantáris státusz (`periImplant`: none / mucositis / peri-implantitis-mild / -moderate / -severe) — 2018-as World Workshop staging, dedikált választóként jelenik meg implantátumokon
- 🏷️ Speciális jelzők: korona szükséges, koronacsere szükséges, zárt foghiány, fogeltávolítási terv, barázdazárás, kontaktpont veszteség
- 👁️ Okkluzális nézet, bölcsességfog, csont és pulpa láthatóság kapcsolók
- 🔢 12 kiválasztási szűrő (összes, jelenlévő, maradó, tej, implantátum, hiányzó, felső/alsó, front/molárisok)
- 📊 Előre definiált státusz minták (alaphelyzet, tejfogazat, vegyes fogazat, fogatlan)
- 📦 22 előre definiált restaurációs sablon (hidak, kivehető protézisek, bár protézisek implantátumokkal)
- 💾 Állapot export/import JSON formátumban (2.22 verzió; az importálás továbbra is elfogadja a korábbi 1.4 és 2.0–2.21 verziókat, és automatikusan migrálja, plugin egyedi állapotokkal és fogankénti megjegyzésekkel)
- 💽 Opcionálisan bekapcsolható localStorage-perzisztencia (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — alapértelmezetten kikapcsolva; automatikusan menti a státusz-diagramot (és opcionálisan a terv-diagramot) 4 MB-os méretkorláttal, a tárolási/feldolgozási hibákat pedig dobás helyett egy `onError` callbacknek (vagy a `console.warn`-nak) adja tovább
- 🔗 HL7 FHIR R4 export (collection Bundle fogankénti Observation-ökkel, ISO 3950 fogkódolás a maradó fogazatra **és** a tejfogakra (51–85, veszteségmentes oda-vissza konverzió importáláskor), lokális kódrendszer, plusz egy opcionálisan bekapcsolható SNOMED CT réteg (Beállítások → Általános → SNOMED CT)); egy rögzített súlyosságú caries komponens egy pontozási-rendszer kódolást is hordoz — ICDAS-t egy elsődleges (tömés nélküli) felületen, CARS-t egy szekunder (tömött) felületen
- ✚ Kereszt/plusz felület-választó UI (B/M/O/D/L) szuvasodáshoz és tömésekhez — `SurfaceCrossComponent`, exportálva összeállítható elrendezésekhez
- 🧱 Felületenkénti tömőanyagok (vegyes tömések, pl. bukkális amalgám + disztális kompozit)
- 🖼️ PNG/JPG/SVG képexport az odontogramról (letölthető; a PNG/JPG vektoros SVG-ből raszterizált)
- 🦷 A caries/subcaries felületenkénti állapotgép: egy tömés nélküli szuvas felület elsődleges caries-ként jelenik meg (ICDAS-szintezett átlátszósággal); amint a felületen tömés is van, helyette szekunder (visszatérő) caries-ként jelenik meg (CARS-pontszámmal) — a kettő soha nem lehet egyszerre aktív ugyanazon a felületen
- 🎯 Egységesített, felületenkénti súlyossági érték (`cariesSeverity`, 0–6): elsődleges felületen ICDAS mélységként, szekunder felületen elnevezett CARS pontszámként (Ép … Kiterjedt üreg) olvasandó, egy kontextusfüggő felugró ablakon keresztül, amely mindig csak a felület aktuális állapotához tartozó skálát mutatja
- 🌱 Gyökér szuvasodás (`rootCaries`: none / active / arrested / active-cavitated), amely bekapcsolja a dedikált gyökér-szuvasodás grafikai réteget, a súlyosságtól függő átlátszósággal
- 📡 Radiológiai szuvasodás mélység (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 felületenként), független a vizuális ICDAS/CARS súlyossági skálától, jelvényként (badge) jelenik meg, és saját FHIR Observation-jén keresztül is vissza-visszatölthető (round-trip)
- 🎚️ Három szuvasodás-részletezettségi beállítás (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`), valamint egy `cariesDepthEnabled` kapcsoló, amelyek mindegyike egyszerűbb választó nézetre egyszerűsíti a saját skáláját a tárolt érték elvesztése nélkül
- 🩹 Subcaries-összegző sor a tömés panelen: a tömés vezérlők alatt felsorolja a kijelölt fogak közül azokat, amelyeken szekunder caries van, a felületeikkel együtt
- 🪛 Felületenkénti tömésdefektus (`fillingDefect`: none / marginal / fracture / wear) közvetlen restaurációkon, függetlenül a szekunder caries-tól
- 🦷💥 Fogkopás klinikai ok és hely szerint típusolva (`wearEdge`: none / attrition / erosion, metszőéli/rágófelszíni; `wearCervical`: none / abrasion / abfraction / erosion, cervikális)
- 🎨 Fogelszíneződés ok szerint (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) maradó és tejfogakon
- ✏️ A frontfogak (metszőfogak/szemfogak) a teljes felületen "metszőéli"-ként ("incisal") jelölik a rágófelszínüket; a tárolt felület-kulcs továbbra is `occlusal` marad
- 🔤 Pozíciófüggő felület-jelölés (Beállítások → Fogadatok → "Felület-jelölés", egyszerű/teljes, alapértelmezett: teljes): teljes módban a caries/tömés felület betűjele és felirata a fog anatómiáját követi — okkluzális → I/metszőéli a frontfogakon, bukkális → L/labiális a frontfogakon, linguális → P/palatinális a felső fogakon és L/linguális az alsó fogakon
- 🦷↕️ Fogankénti ortodonciai rögzítés (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: logikai) egy meglévő természetes fogon (maradó vagy tejfog)
- 🪨 Fogkő, valamint belső vagy külső cervikális típusú gyökérreszorpció (`resorptionType`)
- 📏 Felületenkénti szuvasodás mélysége (felületes / dentin / mély), vagy opcionális ICDAS II pontozás (0–6) az `enableIcdas` beállítással
- 🩹 Korona szegélyi rés (leakage) kapcsoló, csak korona vagy híd pótlás esetén jelenik meg
- 🧬 Szabvány alapú diagnóziskódolás (WHO ICD-10, mindig aktív): minden rögzített lelet egy ICD-10-kódolt diagnózist von maga után — caries (K02), gyökér/cement- és megállt caries (K02.2/.3), pulpitis és pulpanecrosis (K04.0/.1), apikális periodontitis, periapikális tályog és radikuláris ciszta (K04.4–.9), attríció/abrázió/erózió/abfrakció (K03.0–.8), fogkő (K03.6), reszorpció (K03.3), elszíneződés (K00.3/K00.8/K03.7), fogvesztés (K08.1), visszamaradt gyökér (K08.3) és fogtörés (S02.5) — FHIR Condition-ökként exportálva
- 🩺 Fogankénti **Diagnózisok kártya** (`DiagnosesCardComponent`, `aao-diagnoses-card`): egy fog levezetett ICD-10 diagnózisainak megtekintése és kurálása — egy tévesen levezetett diagnózis elnyomása, vagy olyan hozzáadása, amelyet a diagram nem képvisel. A hatályos halmaz (levezetett − elnyomott + hozzáadott) vezérli a FHIR exportot; minden sor a kódjával kezdődik (`K04.0 Pulpitis`), és a sorok kód szerint vannak rendezve; egy **kizárás** kapcsoló eltávolít egy diagnózist a FHIR exportból anélkül, hogy a diagramhoz nyúlna, egy **törlés** (×) pedig eltávolítja a diagnózist *és* a mögötte álló leletet
- 🗂️ **Eset-/regionális diagnózisok** (`CaseDiagnosesModalComponent`, `aao-case-diagnoses-modal`): teljes szájüregre kiterjedő, egyetlen foghoz nem köthető diagnózisok — malokklúzió és TMJ (K07), szájüregi ciszták (K09), nyálmirigy-betegségek (K11), stomatitis és szájnyálkahártya (K12/K13), valamint fogív-szintű fejlődési rendellenességek (K00) — mindegyik opcionálisan lateralizálva (bal/jobb/kétoldali), az Odontogram/Parodontális állapot kapcsoló melletti **Diagnózisok** gombról nyitható
- 🌍 Nemzeti kódolási csomagok (Beállítások → Általános → Diagnóziskódolási csomag): egy nemzeti kódrendszer rárétegzése a WHO ICD-10 alapra — BNO-10 (magyar, hivatalos NEAK BNO-10 elnevezésekkel; megtartja a WHO kódot) vagy amerikai ICD-10-CM (átkódolt kódokkal, pl. a K07 dentofaciális tartomány → M26)
- 🔬 SNOMED CT réteg (Beállítások → Általános → SNOMED CT, opcionálisan bekapcsolható, alapértelmezetten kikapcsolva): egy SNOMED CT kódolást ad hozzá a WHO és bármely nemzeti csomag kódolása mellé, és kódolja azokat a peri-implantáris leleteket is, amelyeknek nincs WHO ICD-10 kódjuk. Az ICD-10-CM és SNOMED koncepció-azonosítók referencia jellegűek/legjobb-erőfeszítés alapúak — klinikai használat előtt ellenőrizd őket a hivatalos ICD-10-CM táblázatos listával / SNOMED CT böngészővel szemben
- 🔁 FHIR Condition oda-vissza konverzió: a diagnózisok FHIR `Condition` erőforrásokként exportálódnak (foghoz kötötten, plusz páciens-szintű, lateralitás bodySite-tal ellátott eset-diagnózisok) az Observation-ök mellett, és az import visszaállítja őket — az eset-diagnózisokat közvetlenül, a fogankénti hozzáadás/elnyomás felülbírálásokat pedig az importált Condition-ök és az újra-levezetett diagram összevetésével (diffelésével)
- ✅ HL7-validátor-tiszta FHIR export: minden Bundle-bejegyzés determinisztikus `id`-t és abszolút `fullUrl`-t hordoz (nincsenek `urn:uuid` helykitöltők), és a Bundle beágyazza a motor saját **CodeSystem**-jét, hogy a lokális kódjai validáláskor feloldhatók legyenek; ugyanez a CodeSystem, valamint a generált ValueSet-ek is publikálva vannak ebben a repóban a `projects/angular-advanced-odontogram/src/lib/fhir/` alatt (add meg az `includeCodeSystem: false`-t a FHIR export opciókban, hogy kihagyd a Bundle-ből)
- 🔄 A parodontális adatok a FHIR importon keresztül is oda-vissza konvertálhatók, nem csak a JSON payloadon keresztül: az importáló visszatölti a LOINC 74029-0 parodontális paneleket minden fogba — tasakmélység, ínyszél (a CAL-ból rekonstruálva, így a pszeudotasak-értékek is megmaradnak), BOP, furkáció, O'Leary plakk, a PI/GI és az implantátum mPI/mBI indexek, valamint a keratinizált íny szélessége — plusz az eset-szintű dohányzási státusz és HbA1c evidencia Observation-ök; a suppuráció az egyetlen kivétel, amely továbbra is csak JSON-only marad
- 🧰 Egységes ikon-fejléc sor lapozott (tabos) Beállítások ablakkal (7 fül — Általános / Odontogram / Parodontális diagram / Fogadatok / Caries / Tömések / Export — lásd a [Beállítások](#-beállítások) szakaszt lentebb)
- 🦷🩺 Beállítások → "Parodontális diagram" fül: egy elérhetőségi kapcsoló plusz 16 index-szintű mutatás/elrejtés kapcsoló a parodontális diagram soraihoz, mindegyik saját leírással, plusz egy fordított-vs-kanonikus index-név megjelenítési opcióval
- 📋 Fogadatok panel: élő szöveges összegzés a teljes státuszról (fogszámok, meglévő/hiányzó listák, szuvasodás beleértve a szekundert, tömések, gyökérkezelések, fogpótlások, implantátumok, parodontális státusz) — alaphelyzetben látszik, a Beállításokban kapcsolható
- 🗂️ Konszolidált Export legördülő menü (Státusz JSON / FHIR / PNG / JPG / SVG / PDF jelentés), minden formátum egymástól függetlenül elrejthető a Beállítások → Általános menüből
- 📥 Import legördülő menü FHIR importtal (visszatölti az exportált Bundle-öket), forrásonként egymástól függetlenül elrejthető
- ⏳ Folyamatjelző overlay a képexport alatt
- 🎓 Interaktív bemutató túra (irányított bejárás a shell vezérlőin)
- 🔢 Három számozási rendszer (FDI, Universal, Palmer)
- 🌐 I18n — 12 UI nyelv (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) nyelvváltóval; az arab a felületet jobbról balra rendereli, a fog-/parodontális diagramokat balról jobbra rögzítve; csak az aktív nyelv szerepel a fő bundle-ben — minden más nyelv külön chunk, amely csak az első kiválasztáskor töltődik le
- 🌗 Sötét mód támogatás váltógombbal (önálló vagy szülő alkalmazás által vezérelt)
- 🎨 Egyedi téma konfiguráció (`themeConfig` bemenet) CSS custom property-kkel (`--odon-*`)
- 📱 Mobil érintéses UX: koppintásos nagyítós felugró, hosszú nyomás helyi menü, csípéses zoom, WCAG 44px érintési célpontok, fogív navigáció
- 🔌 Egyedi SVG plugin rendszer: vizuális fedvények, foganként egyedi állapot, JSON export/import támogatás — a plugin `renderSvg()` kimenete DOMPurify-jal (SVG profil) van megtisztítva, mielőtt beszúrásra kerülne az élő diagramba; a pluginok továbbra is megbízható kódként futnak, ezért csak olyan forrásból származó pluginokat tölts be, amelyben megbízol
- ⚠️ Állapot validáció figyelmeztetésekkel inkompatibilis fogállapot-kombinációkra
- 🏷️ Automatikus állapot tooltip a fogcsempéken (összes aktív állapot megjelenítése)
- 🩺 Fogankénti tooltip és teljes szájüreg összegző panel, amely megjeleníti a klinikai leletek teljes körét (pulpa/apikális diagnózis, gyökérreszorpció, peri-implantáris státusz, fokozatos gyökér szuvasodás, fogkő, korona szegélyi rés, törés, kontaktpont veszteség, típusolt metszőéli/rágófelszíni és cervikális kopás)
- ♿ Billentyűzet akadálymentesítés (WCAG): ARIA listbox/option szerepkörök, Enter/Space kijelölés, nyílbillentyűs navigáció, focus-visible körvonalak
- 🔒 Csak olvasható mód: összes interakció letiltása nyomtatási/jelentés/megtekintési nézetekhez
- ✨ Kijelölési animációk: pulzáló szaggatott keret és ragyogó árnyék a kijelölt fogakon (prefers-reduced-motion támogatással)
- 📝 Fogankénti megjegyzések: dupla kattintás megjegyzés hozzáadásához/szerkesztéséhez, megjegyzés ikon a fogszám mellett, hover tooltip a megjegyzés szövegével, egy "Egyedi megjegyzések" sor a teljes szájüreg összegző panelen, szerepeltetés a PDF jelentésben, JSON export/import
- 🔀 Státusz ↔ Terv diagram-felosztás: egy `Status | Plan` kapcsoló egy aktuális **státusz** diagram és egy **terv** (tervezett, kezelés utáni állapot) diagram között vált, mindkettő saját fogállapotokkal; az export/import mindig a státusz diagramot célozza, míg a terv diagram külön, saját API-n keresztül olvasható/írható (lásd a [Nyilvános API](#-nyilvános-api) szakaszt), és — ha eltér a státusztól — kiegészítő `plan` szekcióként szerepel a JSON exportban
- 📝 "Mi változik" doboz: amikor a terv eltér az aktuális státusztól, felsorol minden eltérést fogankénti és kezelési tengelyenkénti bontásban; programozottan is elérhető a `getPlanChanges()` függvényen keresztül
- 🅿️ Javasolt (proposed) stílus: Terv módban azok a leletek, amelyeket a terv **hozzáad** az aktuális státuszhoz képest, egy jellegzetes szaggatott, színezett "javasolt" körvonallal jelennek meg
- 🚦 Terv módú szűrés (gating): a Terv diagram csak azt mutatja, amit a fogorvos *tenni* tud — a csak-státusz leletek (caries, fogkopás, elszíneződés, valamint a teljes parodontális blokk) rejtve vannak; a pótlás, protetika, ortodoncia, korona-szükséges/csere és a fogeltávolítási terv továbbra is tervezhető marad

![Full-mouth periodontal chart](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_hu_perio.png)
*Képernyőkép az eredeti React projektből — az Angular port ugyanazt a felületet jeleníti meg.*

- 🩺 Parodontális státuszrögzítés: fogankénti hat standard ponton mért **tasakmélység (probing depth)**, **ínyszél (gingival margin)**, **véreztethetőség szondázásra (bleeding on probing)** (+ suppuráció), levezetett **klinikai tapadásvesztéssel (CAL = PD + ínyszél)**, recesszióval és teljes szájüregi **%BOP**-pal. Egy **grafikus, teljes szájüregre kiterjedő parodontális diagram** — minden fogsor két külön, bukkális/palatinális(linguális) SVG-ként rajzolódik, piros **CEJ-vonallal**, egy számozott milliméteres segédráccsal, és egy ínyszél/tasakmélység görbével, amelyet egy központi parodontális index-sáv oszt ketté, és amely a **Miller-osztályt** és a **Plakk/PI/GI/mPI/mBI** értékeket anatómiai rombusz csempeként hordozza foganként; billentyűzetes automatikus továbblépéssel történő rögzítéssel; a diagram dinamikusan a rendelkezésre álló szélességhez igazodik. Egy `Odontogram | Periodontal Status` nézetváltóként jelenik meg, és továbbra is önállóan meghívható komponens az exportált `PerioChartComponent`-en keresztül. Fogankénti **FHIR** export a LOINC parodontális panelen keresztül (`74029-0`; PD `32910-2`, recesszió `32911-0`, CAL `32912-8`)
- 🧪 Kiterjedt automatizált tesztcsomag (lásd a [Tesztelés](#-tesztelés) szakaszt), amely lefedi a számozást, fordításokat, preseteket, i18n-t, a shellt, témát, érintést, plugineket, akadálymentesítést és a klinikai tengelyek/diagnózisok paritását a lefagyasztott React korpusszal szemben
- 📖 TypeDoc API dokumentáció JSDoc kommentekkel minden publikus exporton (`npm run docs`)

### 📦 Modulok
- 🦷 Odontogram rács és fogcsempe UI (`OdontogramChartSurfaceComponent`)
- 🎛️ Vezérlők és státusz panel (`ToothControlsSurfaceComponent` + a 8 deklaratív kártya)
- 🎨 SVG rétegelő motor és fogsablonok (framework-mentes mag, `core/odontogram.ts`)
- 🔢 Fogszámozás és címke generálás (FDI/Universal/Palmer, `core/utils/numbering.ts`)
- 🌐 Lokalizáció — 12 UI nyelv (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), beleértve az arabot (RTL) (`core/i18n/`, `I18nService`)
- 💾 Státusz export/import
- 📋 Státusz extrák: előre definiált restaurációs sablonok
- 🎨 Téma konfiguráció: testreszabható színpaletta `--odon-*` CSS property-kkel
- 📱 Mobil érintéses interakciók (koppintásos nagyító, hosszú nyomás, csípéses zoom, fogív váltó)
- 🔌 Egyedi SVG plugin rendszer
- ⚠️ Állapot validáció és tooltip rendszer
- ♿ Billentyűzet akadálymentesítés és ARIA támogatás
- 🔒 Csak olvasható mód
- ✨ Kijelölési animációk
- 📝 Fogankénti megjegyzés rendszer
- 🧱 **Összeállítható UI** — `OdontogramUiService`, az `engineState()` segédfüggvény, 4 megjelenítő felület és 8 deklaratív vezérlőkártya, mind egymástól függetlenül exportálva (lásd az [Összeállítható felületek](#-használat-npm-csomagként) szakaszt fentebb)
- 🧪 Automatizált tesztcsomag (Vitest korpusz + `ng test`, lásd a [Tesztelés](#-tesztelés) szakaszt)

### 🛠️ UI vezérlők

**🔝 Fejléc sáv** (`OdontogramTopbarComponent`):
- Nyelvválasztó (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR legördülő)
- Sötét mód váltógomb (nap/hold ikon, világos és sötét téma között vált)
- Számozási rendszer választó (FDI/Universal/Palmer legördülő)
- Státusz exportálás / Státusz importálás gombok
- Beállítások (fogaskerék ikon), Köszönet/About (info ikon), GitHub link

**📊 Diagram fejléc:**
- Okkluzális nézet kapcsoló
- Bölcsességfog láthatóság kapcsoló
- Csont láthatóság kapcsoló
- Pulpa láthatóság kapcsoló
- Kiválasztás törlése gomb

**🔍 Kiválasztási szűrők:**
- Összes kiválasztása / Összes jelenlévő / Maradó / Tej / Implantátumok / Összes hiányzó
- Felső / Felső front 6 / Felső molárisok
- Alsó / Alsó front 6 / Alsó molárisok

**📋 Státusz minták:**
- Összes visszaállítása (szájüreg alaphelyzet)
- Tejfogazat
- Vegyes fogazat
- Fogatlan kapcsoló

**📦 Státusz extrák legördülő:**
- Felső/Alsó cirkon hidak (12-22, 13-23, 16-26, teljes ív)
- Felső/Alsó fém hidak (12-22, 13-23, 16-26, teljes ív)
- Felső/Alsó részleges kivehető protézisek
- Felső/Alsó teljes kivehető protézisek
- Felső/Alsó bár protézisek implantátumokkal

**🦷 Fog szerkesztő panel** (`ToothControlsSurfaceComponent`, a kijelölt fog(ak)hoz, összecsukható kártyákba csoportosítva):
- **Státuszok kártya:** teljes szájüreg presetek és státusz extrák (egymástól függetlenül mutatható/rejthető a `showStatusCard`-on keresztül)
- **Fogadatok kártya:** fog kiválasztás (alaptípus, beleértve a törött-korona változatokat), fogszubsztrátum, a kombinált "Fix: …" / "Kivehető: …" pótlás legördülő menü, korona szegélyi rés jelölőnégyzet, törött-korona hely jelölőnégyzetek, korona szükséges / koronacsere szükséges kapcsolók
- **Ortodoncia kártya:** készülék, meziális/disztális elmozdulás, vertikális mozgás, rotáció kapcsoló — egy meglévő természetes fogon jelenik meg (egymástól függetlenül mutatható/rejthető a `showOrthoCard`-on keresztül)
- **Caries kártya:** caries-mélység mód legördülő menü, korona alatti caries jelölőnégyzet, gyökér-caries súlyosság legördülő menü, valamint a B/M/O/D/L felületenkénti caries választó (`SurfaceCrossComponent`) egy kontextusfüggő ICDAS-mélység/CARS felugró ablakkal és egy radiológiai-mélység jelvénnyel
- **Tömések kártya:** tömőanyag legördülő menü, felületenkénti tömés választó, felületenkénti tömésdefektus jelző, subcaries és tömésdefektus figyelmeztető megjegyzések
- **Gyökér és fogágy kártya:** összevont "Pulpa / Endo státusz" választó, apikális diagnózis választó, periapikális lézió altípus választó, gyökérreszorpció típus választó, mobilitási fok választó, peri-implantáris státusz választó (csak implantátumokon)
- **Speciális jelzők:** fogeltávolítási terv/seb, zárt foghiány, barázdazárás, kontaktpont veszteség, fogkő, parapulpális csap, endo rezekció, hídpillér

### 🦷 Fogtípusok és állapotok

**Fog kiválasztás (alaptípus):**
| Érték | Leírás |
|---|---|
| `none` | Hiányzó fog |
| `tooth-base` | Maradó fog |
| `milktooth` | Tejfog |
| `implant` | Fogimplantátum |
| `tooth-under-gum` | Íny alatti (előbújatlan) fog |

**Tört fog változatok:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Fogszubsztrátum (maradó fogak):**
`natural` (alapértelmezett), `radix` (gyökércsonk), `broken`, `crownprep` (koronaelőkészített)

**Pótlás típusa (maradó fogak):**
`none`, `crown`, `inlay`, `onlay` (csak okkluzális nézet), `veneer`, `bridge`

**Pótlás anyaga (maradó fogak):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (a korábbi `metal` koronák ide migrálódnak), `telescope`, `temporary`

**A pótlási opciókat a fog típusa szűkíti** (`restorationOptions()`, `projects/angular-advanced-odontogram/src/lib/core/registry/restorations.ts`): egy implantátum csak `crown`/`bridge` pótlás típusokat kínál (kiegészítve egy implantátum-csatlakozó réteggel), plusz az alábbi öt `prosthesis` csatlakozási bejegyzést; egy hiányzó/foghiány fog csak `bridge` pontikot kínál, plusz a két kivehető fogsor `prosthesis` bejegyzést; egy `radix` szubsztrátum teljesen elrejti a pótlás-vezérlőt.

**Protetika** (`prosthesis`; független kivehető/csatlakozós tengely, a kombinált pótlás legördülő menüben "Kivehető:" bejegyzésekként jelenik meg):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (implantátum csatlakozók, overdenture-rel vagy anélkül), `removable-partial`, `removable-full` (fogtámasztékú fogsorok egy hiányzó/foghiány fogon). Egy fognak vagy fix pótlása, vagy protetikája van, sosem mindkettő — az egyik beállítása törli a másikat.

**Korona szegélyi rés** (`crownLeakage`; logikai): csak akkor jelenik meg, ha a `restorationType` értéke `crown` vagy `bridge`.

**Endodonciai lehetőségek (maradó fogak):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodonciai lehetőségek (tejfogak):**
`none`, `endo-medical-filling`

Az `endo` és a `pulpDx` egyetlen összevont "Pulpa / Endo státusz" választón keresztül érhető el (csoportosítva: vitális pulpa vs. kezelt/endo), és kölcsönösen kizárják egymást — egy kezelt (`endo != none`) opció kiválasztása a `pulpDx` értékét `normal`-ra állítja vissza, egy pulpa diagnózis kiválasztása pedig az `endo` értékét `none`-ra állítja vissza.

**Tömőanyagok (maradó fogak):**
`amalgam`, `composite`, `gic`, `temporary`

**Tömőanyagok (tejfogak):**
`composite`, `gic`, `temporary`

**Tömés/szuvasodás felületek:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (csak szuvasodáshoz)

**Módosítók:**
`inflammation` (periapikális), `parodontal` (parodontális), `mobility` (M1/M2/M3)

**Periapikális lézió típusa** (`periapicalType`; a periapikális jelölést minősíti, csak tünetekkel járó/tünetmentes apikális periodontitis esetén jelenik meg):
`none`, `granuloma`, `cyst` — a korábbi `abscess` érték továbbra is elfogadott/tárolt, de a választóban már nem kínált fel

**Pulpa diagnózis** (AAE terminológia; `pulpDx`):
`normal`, `reversible-pulpitis`, `irreversible-pulpitis`, `necrosis` — kölcsönösen kizárja az `endo`-t

**Pulpa diagnózis, gyakorlati latin** (`pulpLatin`; a pulpa választó csak akkor jeleníti meg, ha a `pulpDetailLevel` értéke `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Pulpa részletezettségi szint** (`pulpDetailLevel`, globális beállítás): `simple`, `aae` (alapértelmezett), `latin`

**Apikális diagnózis** (`apicalDx`; a periapikális jelölést határozza meg):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Gyökérreszorpció típusa** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Peri-implantáris státusz** (`periImplant`; csak implantátumokon, 2018-as World Workshop staging):
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Caries súlyosság** (`cariesSeverity`; egységesített, felületenkénti mező, `0`–`6`): tömés nélküli felületen az ICDAS caries-mélység skálaként olvasandó (`superficial` / `dentin` / `deep`, vagy a nyers ICDAS II kódok `0–6`, ha az `enableIcdas` be van kapcsolva); tömött felületen elnevezett CARS pontszámként olvasandó (`0` ép … `6` kiterjedt üreg)

**Gyökér szuvasodás** (`rootCaries`): `none`, `active`, `arrested`, `active-cavitated`

**Radiológiai szuvasodás mélység** (`radiographicDepth`; felületenként): `none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Szuvasodás-részletezettségi beállítások** (globális): `secondaryCariesMode` (`simple`/`standard`/`full`, alapértelmezett `standard`), `rootCariesMode` (`simple`/`severity`, alapértelmezett `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, alapértelmezett `off`), `cariesDepthEnabled` (logikai, alapértelmezett `true`)

**Speciális jelzők:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Fogkopás** (`wearEdge`, `wearCervical`; hely szerinti klinikai típus, feltétele: tooth-base + nincs pótlás + természetes szubsztrátum):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Elszíneződés** (`discoloration`; fogankénti ok, feltétele: természetes tooth-base vagy tejfog + nincs pótlás + természetes szubsztrátum):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Tömésdefektus** (`fillingDefect`; felületenként, közvetlen restauráció lelet, függetlenül a szekunder caries-tól):
`none`, `marginal`, `fracture`, `wear`

**Ortodoncia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; fogankénti, feltétele egy meglévő természetes fog):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion`, `intrusion` — `orthoRotation`: logikai

**Fogadatok / jelölés beállítások** (globális munkamenet-beállítások, Beállítások → Fogadatok): `wearDetailLevel` és `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, alapértelmezett `complex`) és `surfaceNotation` (`simple`/`full`, alapértelmezett `full`)

### ⚙️ Beállítások

A fejléc fogaskerék ikonjával nyitható (`SettingsModalComponent`); egy focus-trapped, ARIA `dialog` 7 fülből álló elrendezéssel (Esc/háttérre kattintás a bezáráshoz, nyílbillentyűk a fülek közti váltáshoz). A modál egy tiszta nézet egy hoszt által biztosított `SettingsState` felett — saját maga nem birtokol semmilyen beállítás-állapotot. Minden beállítás csak munkamenet-szintű UI állapot, hacsak másképp nincs jelezve — egyik sem módosítja a fogankénti adatokat vagy az export payloadot.

- **Általános:** számozási rendszer (FDI/Universal/Palmer), nyelv, sötét/világos téma, formátumonkénti export elérhetőség (PNG/JPG/SVG/PDF — kikapcsolt állapotban elrejti a megfelelő Export menüpontot, és letiltja az Export fület, ha a PDF ki van kapcsolva), forrásonkénti import elérhetőség (Státusz JSON/FHIR), diagnóziskódolási csomag (nincs / BNO-10 / ICD-10-CM) és egy opcionálisan bekapcsolható SNOMED CT réteg kapcsoló
- **Odontogram:** on-screen elrendezés — fogtávolság, fogszám méret, kijelölés szín és keretstílus; fogadatok panel láthatósága; Terv mód elérhetősége; fogazatanatómia-profil (`classic` alapértelmezett / `measured` — kilenc, szakirodalom alapján bemért fogsablon két fogív, fogankénti szélesség elrendezésben, futásidőben váltható; a grafikái külön, lazán betöltött (lazy) chunkban vannak, amely csak akkor töltődik le, amikor átváltasz rá, így az alapértelmezett classic profil semmilyen extra terhelést nem jelent); Státuszok kártya és Ortodoncia kártya láthatósága
- **Parodontális diagram:** egy elérhetőségi kapcsoló, amely szűkíti a fül többi részét és a parodontális belépési pontokat a shellben; parodontális nézet mód (`toggle`/`popup`); 16 index-szintű mutatás/elrejtés kapcsoló 5 csoportban (Tasak: PD/GM/CAL/BOP · Higiénia: Plakk/PI/GI · Mukogingivális: CEJ láthatóság/gyökér-konkavitás/KG/GT · Tartás: furkáció/mobilitás/Miller-osztály · Peri-implantáris: mPI/mBI); egy fordított-vs-kanonikus index-név megjelenítési mód (kanonikus = egy rögzített angol/latin tudományos név minden UI-nyelven; a tooltipek mindig lokalizáltak maradnak)
- **Fogadatok:** pulpa részletezettségi szint (simple/AAE/gyakorlati latin, alapértelmezett AAE), kopás részletezettségi szint és elszíneződés részletezettségi szint (egyszerű/összetett, mindkettő alapértelmezetten összetett), felület-jelölés (egyszerű/teljes, alapértelmezett: teljes), fogankénti jegyzetek kapcsoló
- **Caries:** ICDAS II pontozás kapcsoló, caries-mélység kapcsoló, gyökér-caries részletezettség (simple/severity), szekunder/CARS részletezettség (simple/standard/full), radiológiai-mélység részletezettség (off/threeLevel/detailed)
- **Tömések:** tömés komplexitás (complex/simple), tömésdefektus lelet kapcsoló, anyagonkénti elérhetőség (amalgám/kompozit/GIC/ideiglenes), barázdazárás kapcsoló
- **Export:** a teljes PDF jelentés konfiguráció (`PdfSettings` — lásd az [Export](#-export) szakaszt lentebb) — letiltva (az Általános fül tartalmára esik vissza), amikor a PDF export ki van kapcsolva az Általános fülön

### 🖼️ SVG sablon rendszer

**Fogsablonok** (a `projects/angular-advanced-odontogram/src/lib/core/assets/teeth-svgs/` mappában):
| Sablon | Használó fogak |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (metszőfogak) |
| `13.svg` | 13, 23, 33, 43 (szemfogak) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (kis őrlőfogak) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (nagy őrlőfogak) |

A sablonok az alsó állcsontnál 180 fokkal elforgatva, a bal oldalnál vízszintesen tükrözve jelennek meg. Egy párhuzamos `measured/` almappa tartalmazza azt a kilenc, szakirodalom alapján bemért fogsablont, amelyet a `measured` anatómia-profil két fogív, fogankénti szélesség elrendezésben renderel (Beállítások → Odontogram → fogazatanatómia).

**Ikon SVG-k** (a `projects/angular-advanced-odontogram/src/lib/core/assets/icon-svgs/` mappában):
`icon_8.svg` (bölcsesség), `icon_gum.svg` (csont), `icon_no_selection.svg` (törlés), `icon_occl.svg` (okkluzális nézet), `icon_pulp.svg` (pulpa)

Mindkét mappa generált TypeScript modulokká van fordítva (`core/generated/teeth-svgs.ts`, `core/generated/icon-svgs.ts`) az `npm run gen:assets` segítségével — futtasd ezt egy forrás SVG szerkesztése után, hogy a becsomagolt inline sztringek szinkronban maradjanak.

### 🔢 Számozási rendszerek

**FDI (ISO 3950):** Felnőtt fogak 11-18, 21-28, 31-38, 41-48. Tejfogak 51-55, 61-65, 71-75, 81-85. Érték: `"FDI"`.

**Universal (USA):** Felnőtt fogak 1-32 számozással. Tejfogak A-T betűkkel. Érték: `"UNIVERSAL"`.

**Palmer (Zsigmondy-Palmer):** Kvadráns + pozíció formátum (pl. UR-1, LL-5). Tejfogak kvadránsonként A-E betűkkel. Érték: `"PALMER"`.

A `NumberingSystem` (`core/utils/numbering.ts`) a pontos `"FDI" | "UNIVERSAL" | "PALMER"` unió; az exportált `toLabel(fdiTooth, system)` egy FDI fogszámot alakít át a kért rendszer címkéjére (pl. `toLabel(14, "PALMER")` → `"UR-4"`).

### 🚀 Használat
Fejlesztés (a demó alkalmazást futtatja):
```bash
npm install
npm start           # ng serve
```
A könyvtár összeállítása:
```bash
npm run build:styles && npx ng build angular-advanced-odontogram
```
A demó alkalmazás összeállítása:
```bash
npm run build:demo
```

### 🔗 Integráció
A komponens bármely Angular alkalmazásba beágyazható:
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

**Sötét mód integráció:**
- **Önálló mód:** Hagyd ki a `darkMode`-ot — a komponens saját maga kezeli a téma állapotát a fejléc váltógombján keresztül, és hozzáadja/eltávolítja a `.dark` osztályt a hoszt gyökér elemén.
- **Vezérelt mód:** Kösd be a `[darkMode]`-ot és a `(darkModeChange)`-et — a szülő alkalmazás vezérli a témát. A váltógomb továbbra is megjelenik, de a `darkModeChange`-et emittálja a belső állapot kezelése helyett. A szülő alkalmazás felelős a `.dark` osztály hozzáadásáért/eltávolításáért a `<html>` elemen.

**Egyedi téma:**
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

**Plugin integráció:**
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

A plugin `renderSvg()` kimenete DOMPurify-jal (SVG profil) van megtisztítva, mielőtt beszúrásra kerülne az élő diagramba — lásd a [Biztonsági megjegyzések](#-biztonsági-megjegyzések) szakaszt.

### 🧪 Tesztelés

A tesztcsomag **két futtatóra** oszlik, és mindkettőnek le kell futnia (az `npm test` mindkettőt futtatja, sorrendben):

```bash
npm run test:corpus   # plain Vitest — the shared clinical-engine core
npm run test:ng       # Angular's Vitest builder — the Angular shell (ng test)
npm test              # both, in order
npm run test:watch    # watch mode (corpus runner)
```

- A **`test:corpus`** (`vitest run`) a `projects/angular-advanced-odontogram/src/lib/core/` mappát — a megosztott klinikai motort — futtatja a portolt tesztkorpusz ellen (100+ spec fájl a `core/__tests__/` alatt). Itt élnek és kerülnek byte-pontosan ellenőrzésre az SVG-renderelési, FHIR-export és JSON-round-trip **golden fixture-ök**: `parity/svg-fingerprints.json`, `parity/fhir-golden.json`, `parity/roundtrip-golden.json`, `parity/shell-dom-golden.html`.
- A **`test:ng`** (`ng test angular-advanced-odontogram --watch=false`, az Angular `@angular/build:unit-test` Vitest integrációja) az Angular shell saját `*.spec.ts` specjeit futtatja — komponensek, szolgáltatások, direktívák —, DOM paritást ellenőrizve: a shell ugyanazokat az id-ket, osztályokat és markupot rendereli, mint az eredeti React komponensek.

Mivel ez a builder Vitest integrációja nem támogatja a `vi.mock()`/`vi.spyOn()`-t relatív útvonalú modul mockoláshoz, a DOM-ot érintő mellékhatások (`initOdontogram`/`destroyOdontogram`, `exportPdf`) az `ODONTOGRAM_ENGINE_LIFECYCLE`/`EXPORT_PDF_FN` injekciós tokeneken és az Angular `TestBed` provider tömbjén keresztül vannak felülírva — lásd a [DI csatlakozási pontok hoszt-oldali teszteléshez](#-használat-npm-csomagként) szakaszt fentebb.

### 📖 API Dokumentáció
```bash
npm run docs           # Generate TypeDoc docs in docs/api/
```
A megosztott klinikai motor API-ja az eredeti projektben is dokumentálva van:

📚 **https://zoliqua.github.io/React-Advanced-Odontogram/**

### 📡 Nyilvános API

**Komponens bemenetek/outputok:** a teljes táblázatért lásd a [Komponens bemenetek](#-használat-npm-csomagként) szakaszt fentebb.

**Exportált függvények külső vezérléshez** (kurált részhalmaz — a teljes, típusos felület a mellékelt `.d.ts`-ben van):

| Függvény | Leírás |
|---|---|
| `initOdontogram()` / `destroyOdontogram()` | Motor inicializálása/leállítása (belsőleg az `OdontogramShellComponent`/`OdontogramUiService` hívja az `ODONTOGRAM_ENGINE_LIFECYCLE` tokenen keresztül) |
| `setNumberingSystem(system)` | Váltás FDI, UNIVERSAL, PALMER között |
| `clearSelection()` | Összes fog kiválasztásának törlése |
| `getSelectedTeeth()` | Az aktuálisan kijelölt fogak (FDI számok), a kijelölés sorrendjében |
| `registerPlugins(plugins)` | Egyedi SVG pluginek regisztrálása |
| `setPluginState(toothNo, pluginId, value)` / `getPluginState(toothNo, pluginId)` | Plugin egyedi állapotának beállítása/lekérdezése egy foghoz |
| `getToothStateSummary(toothNo)` | Lokalizált összesítés az összes aktív állapotról |
| `getOdontogramSummary()` | Strukturált, lokalizált szöveges összegzés a teljes diagramról (fogszámok, szekciók, tervezett változások) |
| `onStateChange(callback)` | Feliratkozás állapotváltozásra; leiratkozó függvényt ad vissza |
| `setReadOnly(value)` / `getReadOnly()` | Csak olvasható mód be/kikapcsolása / lekérdezése |
| `setNotesEnabled(value)` / `getNotesEnabled()` | Fogankénti megjegyzések be/kikapcsolása / lekérdezése |
| `setPulpDetailLevel(level)` / `getPulpDetailLevel()` | A pulpa választó terminológiájának beállítása/lekérdezése — `"simple"`, `"aae"` vagy `"latin"` |
| `getToothAnatomy()` / `setToothAnatomy(v)` | A fogazatanatómia-profil lekérdezése/beállítása — `"classic"` vagy `"measured"` |
| `getChartMode()` / `setChartMode(mode)` | Az aktív diagram lekérdezése/váltása — `"status"` vagy `"plan"` (a terv diagram az első belépéskor mélymásolatként jön létre a státuszból) |
| `getStatusChart()` / `getPlanChart()` / `setPlanChart(payload)` | A státusz/terv diagram payloadjainak olvasása az aktívtól függetlenül, vagy a terv diagram fogainak cseréje |
| `getPlanChanges()` | A strukturált státusz→terv eltérés lekérdezése (`{ toothNo, axis, from, to }[]`) |
| `setPerioSite(toothNo, site, patch)` / `getToothPerio(toothNo)` | Parodontális adat beállítása/lekérdezése a hat pont egyikén (`patch` = `{ pd?, gm?, bop?, sup? }`) |
| `getToothCal(toothNo)` | Egy fog pontonkénti, levezetett CAL értékének lekérdezése |
| `getPerioSummary()` | Teljes szájüregi parodontális összesítők: rögzített pontok száma, vérzések száma, %BOP, legrosszabb CAL, max PD |
| `getPerioChart()` | Az aktív diagram fogankénti parodontális rekordjainak lekérdezése |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | A parodontális diagram overlay programozott megnyitása/bezárása/lekérdezése |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | A parodontális diagram megjelenítési módjának lekérdezése/beállítása — `"toggle"` vagy `"popup"` |
| `getPerioClassification()` | A 2017-es World Workshop parodontális klasszifikáció lekérdezése (`{diagnosis, stage, grade, extent, derived, overridden}`) |
| `setDiagnosisOverride(v)` / `setStageOverride(v)` / `setGradeOverride(v)` / `setExtentOverride(v)` | Egy levezetett parodontális klasszifikációs tengely felülbírálása, vagy `null` a levezetettre való visszaálláshoz |
| `getCaseMeta()` / `resetCaseMeta()` | Az eset-szintű metaadat objektum lekérdezése/visszaállítása (életkor, dohányzási/diabétesz-státusz, páciens identitás, vizsgálati dátum, …) |
| `setPatientName(v)` / `setPatientDob(v)` / `setExamDate(v)` | Eset-identitási mezők beállítása (csak a PDF jelentés fejlécéhez — sosem része a FHIR exportnak) |
| `getToothDiagnoses(toothNo)` | Egy fog ICD-10-kódolt diagnózisainak lekérdezése, ahogyan azokat a klinikai-tengely szabályok levezetik |
| `getActiveDiagnoses()` | A jelenleg kijelölt fog hatályos diagnózis-sorainak (levezetett − elnyomott + hozzáadott) és a hozzáadható diagnózis-katalógusnak a lekérdezése — a `DiagnosesCardComponent` nézetmodellje |
| `addDiagnosisToSelection(key)` / `removeDiagnosisFromSelection(key)` | Diagnózis hozzáadása/eltávolítása az aktuális fogkijelöléshez, a mögötte álló diagram-lelet írásával |
| `setDxOverrideForSelection(key, mode)` | Diagnózis-felülbírálás kényszerítése az aktuális kijelölésre — `"add"`, `"suppress"`, vagy `null` a törléshez |
| `getDiagnosisCodingPack()` / `setDiagnosisCodingPack(id)` | A WHO ICD-10 fölé rétegzett nemzeti kódolási csomag lekérdezése/beállítása — `"none"`, `"bno10"` (magyar NEAK elnevezések) vagy `"icd10cm"` (amerikai) |
| `getSnomedEnabled()` / `setSnomedEnabled(v)` | Az opcionálisan bekapcsolható SNOMED CT kódolási réteg lekérdezése/beállítása |
| `getCaseConditions()` / `setCaseCondition(key, laterality)` | Teljes szájüregre kiterjedő eset-/regionális diagnózisok lekérdezése/beállítása (malokklúzió és TMJ, szájüregi ciszták, nyálmirigy-betegségek, stomatitis és szájnyálkahártya, fogív-szintű fejlődési rendellenességek), mindegyik egy lateralitással — `null` törli, vagy `"left"`/`"right"`/`"bilateral"` |
| `exportFhir(options?)` | Az odontogram exportálása HL7 FHIR R4 collection Bundle-ként (JSON letöltés); opcionális `{ subject }` referencia |
| `importFhirBundle(input)` | A modul által készített FHIR R4 Bundle importálása (objektum vagy JSON szöveg) |
| `exportImage(format)` | Az odontogram letöltése képként — `"png"` vagy `"jpg"` |
| `exportSvg()` | Az odontogram letöltése méretezhető SVG-ként (vektoros) |
| `hasAnyPerioData()` | `true`, ha bármely parodontális tengely rögzítve van bárhol a szájüregben |
| `exportPerioSvg()` / `exportPerioImage(format)` | A teljes parodontális diagram letöltése önálló vektoros SVG-ként vagy raszterizált képként |
| `exportPdf(opts)` | Egy jsPDF-natív PDF jelentés letöltése (lásd az [Export](#-export) szakaszt lentebb) |
| `getPdfSettings()` / `setPdfSettings(patch)` | A PDF jelentés konfigurációjának lekérdezése/módosítása (`PdfSettings`) |
| `exportStatus()` | A státusz diagram letöltése JSON-ként |
| `importStatus(data)` | A motor hidratálása egy korábban exportált JSON payloadból (lásd az [Állapot Export/Import formátum](#-állapot-exportimport-formátum) szakaszt) |
| `setImportFormat(format)` | A következő fájlimport értelmezőjének beállítása — `"status"` vagy `"fhir"` |
| `startIntroTour()` | Az interaktív bemutató túra indítása |

### 💾 Állapotmentés (localStorage)

Opcionálisan bekapcsolható `localStorage`-perzisztencia az odontogram eset-állapotához (`core/persistence.ts`, a csomag belépési pontjáról újraexportálva). Alapértelmezetten kikapcsolva — a meglévő integrációkat nem érinti, amíg egy hoszt alkalmazás explicit módon be nem kapcsolja, és a bekapcsolást az odontogram mountolása **után** kell meghívni (pl. egy komponens `ngAfterViewInit()`-jéből, azután, hogy az `OdontogramShellComponent`/`OdontogramUiService` meghívta az `init()`-et — a visszaállítás az `importStatus()`-on keresztül újrarajzolja az élő DOM-ot):

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

| Függvény | Leírás |
|---|---|
| `enablePersistence(options?)` | Visszaállít egy korábban mentett esetet (ha van) az `importStatus()`-on keresztül, majd minden lezárt állapotváltozáskor elmenti a státusz-diagramot a `localStorage`-ba (a szerkesztések ~400 ms debounce-szal vannak csoportosítva, így egy változás-sorozat — pl. egy státusz preset — egyetlen írást eredményez). Idempotens — ismételt hívása lecseréli az előző feliratkozást/beállításokat. **Az odontogram mountolása után kell meghívni.** |
| `disablePersistence()` | Leállítja a mentést (előbb kiüríti a folyamatban lévő debounce-olt mentést); a tárolt bejegyzés a helyén marad. |
| `clearPersistedState()` | Törli az aktív (vagy alapértelmezett) kulcshoz tartozó tárolt bejegyzést. |
| `isPersistenceEnabled()` | `true`, amíg egy állapotváltozás-feliratkozás aktív. |

**`PersistenceOptions`:**

| Mező | Típus | Alapértelmezett | Leírás |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | A `localStorage` kulcs — ez a megosztott mag modul saját literál alapértelmezett értéke (az Angular port nem változtatta meg); adj meg saját `key`-t, hogy elkerüld az ütközést egy React-oldali integrációval ugyanazon az originon, vagy hogy névterekbe rendezd a több hosztot. |
| `includePlan` | `boolean` | `false` | A terv-diagram (a payload `plan` mezője) mentése is. |
| `onError` | `(err: Error) => void` | — | Bármilyen tárolási/feldolgozási hiba esetén ez hívódik meg a `console.warn` helyett. |

Megjegyzések: a `localStorage`-ba semmi nem kerül beolvasásra vagy kiírásra, amíg meg nem hívod az `enablePersistence()`-t; egy 4 MB-os méretkorlát dobás helyett kihagyja a túl nagy mentést (az `onError`/`console.warn`-on keresztül jelezve); minden tárolási/JSON hiba — kvóta túllépés, lezárt iframe, sérült vagy fel nem ismert tárolt adat stb. — el van kapva és jelentve. Ez a modul soha nem dob kivételt.

Megjegyzés: a perzisztencia bekapcsolása az `importStatus()`-on keresztül visszaállítja a mentett esetet, ami lecseréli az aktuális esetet — beleértve egy folyamatban lévő terv-diagramot is, ha a mentett payloadban nincs terv. A perzisztenciát induláskor (közvetlenül a mountolás után) kapcsold be, ne munkamenet közben.

Megjegyzés: a mentett payload tartalmazhat beteg-azonosító eset-adatokat (betegnév, vizsgálat dátuma) egyszerű szövegként a `localStorage`-ban. Ha ilyen adatokat rögzítesz, gondoskodj eszközszintű védelemről, vagy töröld a `clearPersistedState()` függvénnyel, amikor szükséges.

### 💾 Állapot Export/Import formátum

Az export egy JSON fájlt hoz létre (`2.22` verziójú; az importálás továbbra is elfogadja a korábbi `1.4` és `2.0`–`2.21` verziókat, és automatikusan migrálja őket), amely tartalmazza:

**Globális mezők:**
- `wisdomVisible` - bölcsességfogak láthatók
- `showBase` - csont réteg látható
- `occlusalVisible` - okkluzális nézet aktív
- `showHealthyPulp` - egészséges pulpa látható
- `edentulous` - fogatlan mód aktív

**Fogankénti mezők (32 fog):**
- `toothSelection` - alap fog típusa
- `toothSubstrate` - fogszubsztrátum (natural/radix/broken/crownprep), bármely pótlástól függetlenül
- `restorationType` - pótlás típusa (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - pótlás anyaga (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), a `restorationType`-hoz párosítva
- `prosthesis` - kivehető/csatlakozós tengely (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), kölcsönösen kizárja a fix korona/híd `restorationType`-ot
- `crownLeakage` - korona szegélyi rés jelző, csak akkor releváns, ha a `restorationType` korona vagy híd
- `endo` - endodonciai állapot; kölcsönösen kizárja a `pulpDx`-et
- `mods` - módosítók tömbje (inflammation, parodontal); az `inflammation` csak hiányzó/extrakciós alveolus fogaknál érvényes
- `caries` - aktív szuvasodási felületek
- `cariesActiveDepth` - a caries-mélység választó által ideiglenesen tárolt ICDAS-mélység érték új felület alkalmazásakor
- `rootCaries` - gyökér szuvasodás súlyossága (none/active/arrested/active-cavitated)
- `cariesSeverity` - egységesített, felületenkénti súlyossági érték (0-6): ICDAS mélység egy elsődleges (tömés nélküli) felületen, CARS pontszám egy szekunder (tömött) felületen
- `radiographicDepth` - felületenkénti radiológiai szuvasodás mélység (none/E1/E2/D1/D2/D3), független a vizuális ICDAS/CARS skálától
- `fillingMaterial` - tömőanyag
- `fillingSurfaces` - tömött felületek
- `fillingSurfaceMaterials` - felületenkénti tömőanyag (vegyes tömések, pl. bukkális amalgám + disztális kompozit)
- `fillingDefect` - felületenkénti tömésdefektus (none/marginal/fracture/wear), feltétele egy tömött felület, függetlenül a szekunder caries-tól
- `pulpDx` - AAE pulpa diagnózis (normal/reversible-pulpitis/irreversible-pulpitis/necrosis)
- `pulpLatin` - gyakorlati latin pulpa altípus (a pulpa választó csak akkor jeleníti meg, ha a `pulpDetailLevel` értéke `latin`)
- `apicalDx` - apikális diagnózis, amely meghatározza a periapikális jelölést
- `periapicalType` - periapikális lézió altípus (none/granuloma/cyst); a korábbi `abscess` érték importáláskor még elfogadott
- `resorptionType` - gyökérreszorpció típusa (none/internal/external-cervical)
- `periImplant` - csak implantátumon értelmezett peri-implantáris státusz (none/mucositis/peri-implantitis-mild/-moderate/-severe), 2018-as World Workshop staging
- `dxOverrides` - fogankénti diagnóziskódolási felülbírálások (2.21-es verzió): egy objektum, ICD-10 diagnózis-kulcs → `add` | `suppress` kulcsolással, amely egy kódolt diagnózist bekapcsol egy megfelelő diagram-lelet hiányában is, vagy kikapcsol annak jelenléte ellenére; ez alakítja ki a FHIR `Condition`-ökként exportált hatályos kódolt halmazt
- `endoResection` - rezekció jelzője
- `fissureSealing` - barázdazárás jelzője
- `calculus` - fogkő jelzője
- `contactMesial` / `contactDistal` - meziális/disztális kontaktpont veszteség
- `wearEdge` - metszőéli/rágófelszíni kopás típusa (none/attrition/erosion)
- `wearCervical` - cervikális kopás típusa (none/abrasion/abfraction/erosion)
- `discoloration` - fogankénti elszíneződés oka (none/tetracycline/fluorosis/nonvital/extrinsic/other)
- `orthoAppliance` - ortodonciai készülék (none/bracket/band)
- `orthoDrift` - ortodonciai elmozdulás (none/mesial/distal)
- `orthoVertical` - ortodonciai vertikális mozgás (none/extrusion/intrusion)
- `orthoRotation` - ortodonciai rotáció jelző
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - törési helyek
- `extractionWound` - fogeltávolítás utáni seb
- `extractionPlan` - tervezett fogeltávolítás
- `parapulpalPin` - parapulpális csap jelzője
- `bridgePillar` - hídpillér fog
- `mobility` - mobilitási fok (none/m1/m2/m3)
- `crownNeeded` - korona szükséges jelzője
- `crownReplace` - koronacsere szükséges jelzője
- `missingClosed` - záródott foghiány a fogeltávolítás után
- `customStates` - plugin egyedi állapotok (objektum, plugin azonosító szerint kulcsozva)
- `note` - fogankénti szöveges megjegyzés (szöveg, opcionális — csak ha nem üres)

**Felső szintű `plan` mező (2.11-es verziótól):**
- `plan` - opcionális objektum, ugyanolyan alakú, mint a `teeth` (a fenti fogankénti mezők), amely a **terv** (tervezett, kezelés utáni állapot) diagramot tartalmazza. Csak akkor jelenik meg, ha a terv diagram inicializálva lett ÉS tartalma eltér a státusz diagramtól. Importáláskor a `plan` hiánya törli/deinicializálja a terv diagramot; a jelenlévő `plan` a státusszal együtt visszaállítja a terv diagramot is. A `getPlanChart()`/`setPlanChart()`-on keresztül is olvasható/írható.

**Felső szintű `case` objektum (2.17-es verziótól, bővítve 2.18-ban, 2.19-ben, 2.20-ban és 2.22-ben):**
- `case` - opcionális, eset-szintű (nem fogankénti) metaadat objektum, amelyen a státusz és a terv diagram osztozik. Üresen kihagyva. Mezők (mindegyik kihagyva, ha az alapértékén van): `age`; `smokingStatus` (+ `cigarettesPerDay`); `diabetesStatus` (+ `hba1c`); `toothLossPerio`; `maxRblPercent`; a 2017-es klasszifikáció négy tengelyenkénti klinikusi felülbírálása `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`; `patientName` / `examDate`; `patientDob`; és (2.22-es verzió) `caseConditions` — eset-/regionális diagnózisok (malokklúzió és TMJ K07, szájüregi ciszták K09, nyálmirigy-betegségek K11, stomatitis és szájnyálkahártya K12/K13, fogív-szintű fejlődési rendellenességek K00), mindegyik egy lateralitáshoz rendelve (nem meghatározott/bal/jobb/kétoldali). A `getCaseMeta()`/`getCaseConditions()` és a fenti `set*`/`setCaseCondition()` setterek kezelik. A páciensnév, a születési dátum és a vizsgálati dátum csak diagram-azonosító metaadat — **nem** része a FHIR exportnak.

### 🖨️ Export
Az `exportFhir()` HL7-validátor-tiszta: minden Bundle-bejegyzés determinisztikus `id`-t és abszolút `fullUrl`-t hordoz (nincsenek `urn:uuid` helykitöltők), és a Bundle beágyazza a motor saját CodeSystem-jét, hogy a lokális kódjai validáláskor feloldhatók legyenek (ez is publikálva van a `projects/angular-advanced-odontogram/src/lib/fhir/` alatt; az `includeCodeSystem: false` megadásával kihagyható).

A parodontális adatok mostantól a FHIR importon keresztül is oda-vissza konvertálhatók, nem csak a JSON payloadon keresztül: az `importFhirBundle()` visszatölti a LOINC `74029-0` parodontális paneleket minden fog parodontális rekordjába — tasakmélység, ínyszél (a CAL-ból rekonstruálva, így a pszeudotasak-értékek is megmaradnak), BOP, furkáció, O'Leary plakk, a PI/GI és az implantátum mPI/mBI indexek, valamint a keratinizált íny szélessége — plusz az eset-szintű dohányzási státusz és HbA1c evidencia Observation-ök. A suppuráció az egyetlen kivétel: az továbbra is csak JSON-only, mivel nem része a FHIR exportnak.

Az odontogram saját Státusz JSON / FHIR / PNG / JPG / SVG exportján túl a **parodontális diagramnak** saját export útvonala van:
- **Parodontális SVG/PNG/JPG:** az `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` a teljes parodontális diagramot egyetlen önálló vektoros SVG-ként rendereli, a beágyazott `PerioChartComponent` DOM-tól függetlenül. Letiltva, amikor a `hasAnyPerioData()` hamis.
- **PDF jelentés:** az export menü "PDF report…" pontja megnyitja az `ExportOptionsModalComponent`-et — egy beállítás-ablakot (páciensnév + születési dátum + vizsgálati dátum mezők, közvetlenül az eset metaadatokhoz kötve, a vizsgálati dátum alapértelmezetten a mai napra áll; szekció-jelölőnégyzetek: páciens adatok, odontogram diagram, odontogram leírás, egyedi megjegyzések — letiltva, ha egyetlen fogon sincs megjegyzés —, parodontális státusz, parodontális leírás), mielőtt meghívná az `exportPdf(opts)`-ot az `EXPORT_PDF_FN` injekciós tokenen keresztül. Az üres azonosító mezők helyettesítő értékre esnek vissza (`"John Doe"` / `"1980-01-01"`, a `PdfSettings.defaultName`/`defaultDob` révén konfigurálható), így az export mindig sikeres. A PDF jsPDF-natívan épül fel — vektoros szöveg `.text()`-tel, raszterizált fog-/parodontális diagram képek `.addImage()`-dzsel — `svg2pdf.js` függőség nélkül. Az egyedi megjegyzések szekció automatikusan kimarad, ha egyetlen fogon sincs megjegyzés, a két parodontális szekció pedig akkor, amikor a `hasAnyPerioData()` hamis, függetlenül az ablak jelölőnégyzeteitől.
- **mPI/mBI implantátum-szűrés:** a peri-implantáris Mombelli indexek (mPI/mBI) csak olyan fogsorban jelennek meg sorként, amely tartalmaz legalább egy implantátum fogat — mind az élő parodontális diagramon, mind az SVG/PDF exportokban.
- A páciensnév, a születési dátum és a vizsgálati dátum csak diagram-azonosító metaadat (payload `2.20`, additív) — **nem** része a FHIR exportnak.
- **Jelentés konfiguráció (`PdfSettings`, Beállítások → Export fül, lekérdezés/beállítás a `getPdfSettings()`/`setPdfSettings(patch)`-en keresztül):** alapértelmezett páciensnév/születési dátum, életkor megjelenítése-e, dátumformátum (ISO/DMY/MDY), szín téma (kék/türkiz/borostyán/palaszürke), odontogram csont/pulpa láthatóság, fogtávolság/keret/fogszám méret a diagram képen, hogy szerepeljen-e a prózai leírás és a leletek táblázat, a parodontális diagram megfelelő távolság/címke-elhelyezés/betűméret opciói és hogy szerepeljen-e a parodontális metrikák táblázat és a rövidítés-glosszárium, egy orvosi felelősség-kizárás (alapértelmezett vagy egyedi szöveg), egy generátor/verzió bélyeg, valamint a fogazat-összegzés csoportosítása (teljes szájüreg / állcsont / kvadráns / szextáns — a képernyőn megjelenő Fogadatok panel táblázatát is vezérli).

### 📁 Mappastruktúra
- `projects/angular-advanced-odontogram/src/public-api.ts` - a csomag nyilvános belépési pontja (minden export innen van újraexportálva)
- `projects/angular-advanced-odontogram/src/lib/core/odontogram.ts` - a framework-mentes klinikai motor: SVG rétegelés, fog állapotkezelés, érintéses interakciók, plugin fedvények, beállítások, export/import
- `projects/angular-advanced-odontogram/src/lib/core/persistence.ts` - opcionálisan bekapcsolható localStorage perzisztencia
- `projects/angular-advanced-odontogram/src/lib/core/theme.ts` - `OdontogramThemeConfig` típus és `applyThemeConfig()` segédfüggvény
- `projects/angular-advanced-odontogram/src/lib/core/plugin.ts` - `OdontogramPlugin` típus, `PluginLayer`, `getQuadrant()`, `LAYER_Z` z-index prioritások
- `projects/angular-advanced-odontogram/src/lib/core/pluginSanitize.ts` - `sanitizePluginSvg()`, a DOMPurify-alapú tisztító, amelyen egy plugin `renderSvg()` kimenete átmegy, mielőtt beszúrásra kerülne az élő diagramba
- `projects/angular-advanced-odontogram/src/lib/core/tour.ts` - az irányított bemutató túra
- `projects/angular-advanced-odontogram/src/lib/core/perioClassification.ts` - a 2017-es World Workshop parodontális klasszifikáció levezetése
- `projects/angular-advanced-odontogram/src/lib/core/perioExport.ts` / `perioGraphic.ts` / `perioIndexNames.ts` - a teljes szájüreg parodontális diagram SVG renderelése
- `projects/angular-advanced-odontogram/src/lib/core/perioPdf.ts` - a PDF jelentés tiszta jsPDF összeállítója (`assemblePdf`)
- `projects/angular-advanced-odontogram/src/lib/core/status_extras.ts` - 22 előre definiált restaurációs sablon
- `projects/angular-advanced-odontogram/src/lib/core/i18n/` - fordítások, nyelvenként egy lazán betöltött (lazy) modulként az `i18n/locales/` alatt (az angol statikus, a másik 11 az `i18n/loader.ts`-en keresztül, első használatkor töltődik le) és a framework-mentes i18n busz
- `projects/angular-advanced-odontogram/src/lib/core/dx/` - szabvány alapú diagnóziskódolás: levezetési szabályok (`derive.ts`), az ICD-10 diagnózis-katalógus (`codes.ts`/`caseCodes.ts`), nemzeti kódolási csomagok — BNO-10/ICD-10-CM (`packs.ts`) — és az ICD-10-CM/SNOMED CT finomító réteg (`refine.ts`)
- `projects/angular-advanced-odontogram/src/lib/core/anatomy/` - fogazatanatómia-profilok (`classic`/`measured`); a `measured` szakirodalom alapján bemért sablonjai (`measured.ts`) külön lazán betöltött (lazy) chunkként töltődnek be
- `projects/angular-advanced-odontogram/src/lib/core/utils/numbering.ts` - FDI, Universal, Palmer számozási konverzió
- `projects/angular-advanced-odontogram/src/lib/core/registry/` - deklaratív klinikai-tengely registry: FHIR mezőmegfeleltetések, SVG-törlési-halmaz/logikai-jelző aktiválás, pótlás típus×anyag mátrix, UI opciólisták
- `projects/angular-advanced-odontogram/src/lib/core/fhir/` - HL7 FHIR R4 export/import: `toFhir.ts`/`fromFhir.ts`, `toFhirDx.ts`/`importConditions.ts` (diagnózis Condition-ök), `importPerio.ts` (parodontális Observation-ök), kódrendszerek, mezőmegfeleltetések, primitívek
- `projects/angular-advanced-odontogram/src/lib/fhir/` - a publikált `CodeSystem-odontogram.json`, valamint a generált `ValueSet-odontogram-*.json` készlet (egy-egy klinikai-tengely érték-csoportonként, egy a lelettípusokhoz, egy az összes-kód készlethez)
- `projects/angular-advanced-odontogram/src/lib/core/bridgeOverlay.ts` - több fogra kiterjedő híd-csatlakozó overlay
- `projects/angular-advanced-odontogram/src/lib/core/fonts/` - becsomagolt PDF Unicode betűtípusok (arab írásmódozás, CJK) + a betűtípus-betöltő
- `projects/angular-advanced-odontogram/src/lib/core/assets/` - SVG fog-/ikon forrásfájlok (`teeth-svgs/`, `teeth-svgs/measured/`, `icon-svgs/`)
- `projects/angular-advanced-odontogram/src/lib/core/generated/` - a generált TypeScript modulokká fordított SVG-k (`npm run gen:assets`)
- `projects/angular-advanced-odontogram/src/lib/core/__tests__/` + `registry/__tests__/` - a portolt tesztkorpusz, beleértve a `parity/` golden fixture-öket
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/` - `OdontogramShellComponent`, a mindent egyben shell
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-ui.service.ts` - `OdontogramUiService`, az összeállítható UI állapot/effekt rétege
- `projects/angular-advanced-odontogram/src/lib/components/engine-state.ts` - az `engineState()` signal segédfüggvény
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-engine-lifecycle.ts` - az `ODONTOGRAM_ENGINE_LIFECYCLE` DI token
- `projects/angular-advanced-odontogram/src/lib/components/surfaces/` - a négy megjelenítő felület (fejléc, diagram, fogadatok, fogvezérlők) és, a `surfaces/cards/` alatt, a nyolc deklaratív vezérlőkártya (beleértve a `DiagnosesCardComponent`-et)
- `projects/angular-advanced-odontogram/src/lib/components/settings-modal/` - `SettingsModalComponent` (7 fülből álló Beállítások ablak)
- `projects/angular-advanced-odontogram/src/lib/components/export-options-modal/` - `ExportOptionsModalComponent` és az `EXPORT_PDF_FN` DI token
- `projects/angular-advanced-odontogram/src/lib/components/credits-modal/` - `CreditsModalComponent`
- `projects/angular-advanced-odontogram/src/lib/components/case-diagnoses-modal/` - `CaseDiagnosesModalComponent`, a teljes szájüregre kiterjedő eset-/regionális diagnózisok popupja
- `projects/angular-advanced-odontogram/src/lib/components/perio-chart/` / `perio-sidebar/` - az önálló/beágyazott parodontális diagram és a kontextus oldalsávja
- `projects/angular-advanced-odontogram/src/lib/components/dual-state-confirm/` - a megosztott megerősítő párbeszédablak (státusz↔terv-et érintő szerkesztésekhez)
- `projects/angular-advanced-odontogram/src/lib/components/shared/dialog-focus.ts` - megosztott modál fókusz-csapda/visszaállítás segédfüggvények
- `projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.ts` - `I18nService`, az Angular reaktív fasadja a mag i18n busza felett
- `projects/demo/` - a demó Angular alkalmazás (`ng serve` / `npm run build:demo`)
- `scripts/generate-svg-assets.mjs` - az `npm run gen:assets` generátor

### ⚙️ Technológia
- Angular 21 (standalone komponensek, signalok) + Angular CLI (`@angular/build`) + TypeScript
- `ng-packagr` a könyvtár összeállításához (`ng build angular-advanced-odontogram`)
- Tailwind CSS a UI stílusokhoz, egyszer lefordítva egy statikus stíluslapba (`npm run build:styles` → `projects/angular-advanced-odontogram/styles.css`) — a fogyasztók regisztrálják ezt a stíluslapot, ők maguk nem futtatják a Tailwindet
- SVG rétegelés DOM manipulációval a framework-mentes magban (nem Angular-reaktív állapot a teljesítmény érdekében — ugyanaz a motor, amit a React eredeti használ)
- Egy könnyűsúlyú, framework-mentes egyedi i18n rendszer (`core/i18n/`), az `I18nService`-be csomagolva a reaktív Angular sablon-kötéshez
- Két teszt futtató: sima Vitest a mag korpuszhoz (`vitest run`), az Angular `@angular/build:unit-test` Vitest integrációja a komponens specekhez (`ng test`); `@testing-library/jest-dom` a DOM matcherekhez
- TypeDoc az API dokumentációhoz (`npm run docs`, kimenet `docs/api/`)
- jsPDF a PDF jelentéshez; DOMPurify a plugin kimenet tisztításához

### 📝 Megjegyzések
- Az SVG sablonok és ikonok build időben generált TypeScript modulokká vannak fordítva (`npm run gen:assets`) — nincs futásidejű asset lekérés, és semmit sem kell kiszolgálni egy public mappából.
- Az odontogram motor saját, framework-mentes belső állapotot használ (nem Angular signalokat) az SVG rácshoz, a teljesítmény érdekében és azért, hogy a React eredetivel azonos maradjon; az Angular komponensek reaktívan olvassák az `engineState()`/`I18nService`/`onStateChange()`-en keresztül, ahelyett hogy maguk birtokolnák.
- A tejfogaknál szűkebb anyagválaszték áll rendelkezésre (nincs amalgám tömés, nincs csapos endodonciai kezelés).
- Az implantátum fogaknál a korona/felépítmény lehetőségek eltérnek a természetes fogakétól.

### 🔒 Biztonsági megjegyzések

- **A pluginok megbízható kódként futnak.** Egy plugin `renderSvg()` visszatérési értéke bekerül az élő diagram SVG-jébe. Ez a kimenet a beszúrás előtt [DOMPurify](https://github.com/cure53/DOMPurify)-jal van megtisztítva (SVG profil, plusz `svgFilters`) — a `<script>`, `<iframe>`, `<object>`, `<embed>` és `<foreignObject>` elemek eleve tiltottak, és egy teljesen rosszindulatú kimenet inkább eldobásra kerül, mintsem részlegesen renderelődjön. Ez csökkenti egy kompromittált vagy hibás plugin okozta kárt, de a pluginokat továbbra is csak megbízható forrásból szabad betölteni — a tisztítás egy biztonsági háló, nem az ellenőrzés helyettesítője.
- **Content-Security-Policy.** Ez a csomag nem szúr be saját CSP-t, amikor könyvtárként van beágyazva. Az `OdontogramShellComponent`-et rendereló hoszt alkalmazásoknak a saját telepítésükhöz illő CSP-t kell beállítaniuk; egy ésszerű alapot az eredeti React projekt demójának szabályzata tükröz:

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

### 📖 Hivatkozás

Ennek a csomagnak nincs saját hivatkozási rekordja — ez egy port, amely szó szerint osztozik a klinikai motorján az eredeti projekttel. Ha ezt a szoftvert felhasználod a kutatásodban, kérlek hivatkozz az eredetire:

> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Összes verzió (koncepció DOI):** https://doi.org/10.5281/zenodo.21156787

A géppel olvasható hivatkozási metaadatok az eredeti projekt [`CITATION.cff`](https://github.com/ZoliQua/React-Advanced-Odontogram/blob/main/CITATION.cff) fájljában találhatók.

## 🙌 Köszönet

Az Angular Advanced Odontogramot Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)) készíti és tartja karban, ő e port és az alapul szolgáló klinikai motor megalkotója és vezető fejlesztője. Ugyanez a beépített popup (fejléc → "Névjegy és köszönet") sorolja fel ezeket a neveket.

**Eredeti projekt**

- [React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram) (npm: [`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)): az eredeti React implementáció, amelynek ez a csomag a portja — a klinikai motor (fogazati státusz logika, parodontális rögzítés, diagnóziskódolás, FHIR export/import, i18n szövegek, túra, SVG sablonok) szó szerint megosztott.

**Felhasznált eszközök:** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [Angular](https://angular.dev), [Angular CLI](https://angular.dev/tools/cli), [TypeScript](https://www.typescriptlang.org) és [Tailwind CSS](https://tailwindcss.com).

A hozzájárulásokat szívesen fogadjuk — lásd a [`CONTRIBUTING.md`](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/CONTRIBUTING.md) fájlt. Ha hasznosnak találod a projektet, kérlek [csillagozd a GitHubon](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
