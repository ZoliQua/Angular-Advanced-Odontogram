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

> 🌐 **Languages:** 🇬🇧 [English](README-en.md) | 🇭🇺 [Magyar](README-hu.md) | 🇩🇪 [Deutsch](README-de.md) | 🇪🇸 [Español](README-es.md) | 🇫🇷 [Français](README-fr.md) | 🇮🇹 [Italiano](README-it.md) | 🇵🇱 [Polski](README-pl.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇰 Slovenčina (tento súbor) | 🇷🇺 [Русский](README-ru.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md)

---

## 📑 Obsah

- [📋 Prehľad](#-prehľad)
- [📦 Použitie ako npm balík](#-použitie-ako-npm-balík)
- [✨ Kľúčové funkcie](#-kľúčové-funkcie)
- [📦 Moduly](#-moduly)
- [🛠️ Ovládacie prvky rozhrania](#-ovládacie-prvky-rozhrania)
- [🦷 Typy a stavy zubov](#-typy-a-stavy-zubov)
- [⚙️ Nastavenia](#-nastavenia)
- [🖼️ Systém SVG šablón](#-systém-svg-šablón)
- [🔢 Systémy číslovania](#-systémy-číslovania)
- [🚀 Použitie](#-použitie)
- [🔗 Integrácia](#-integrácia)
- [🧪 Testovanie](#-testovanie)
- [📖 Dokumentácia API](#-dokumentácia-api)
- [📡 Verejné API](#-verejné-api)
- [💾 Perzistencia stavu (localStorage)](#-perzistencia-stavu-localstorage)
- [💾 Formát exportu/importu stavu](#-formát-exportuimportu-stavu)
- [🖨️ Export](#-export)
- [📁 Štruktúra priečinkov](#-štruktúra-priečinkov)
- [⚙️ Technologický zásobník](#-technologický-zásobník)
- [📝 Poznámky](#-poznámky)
- [🔒 Bezpečnostné poznámky](#-bezpečnostné-poznámky)
- [📖 Ako citovať](#-ako-citovať)

## 🇸🇰 Slovenčina

### 📋 Prehľad

Tento projekt je interaktívny editor odontogramu v prehliadači pre **Angular + TypeScript**, ktorý umožňuje rýchle zaznamenávanie zubného statusu s prehľadným rozhraním. Vykresľuje vrstvené SVG šablóny zubov na reprezentáciu náhrad, kazu, endodontického stavu, mobility a ďalších klinických detailov, pričom poskytuje viacnásobný výber, filtre výberu a preddefinované stavové predvoľby.

**Toto je oficiálny Angular port projektu [React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram)** (npm: [`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)). Funkčná parita s `react-advanced-odontogram` **v2.6.0** (engine commit `215c43a`), verzia payloadu **2.22** — exporty JSON a FHIR R4 sú medzi oboma knižnicami obojsmerne kompatibilné (round-trip). Klinický engine (`projects/angular-advanced-odontogram/src/lib/core/`) je zdieľaný doslovne — logika zubného statusu, parodontálne zaznamenávanie, diagnostické kódovanie, export/import FHIR, i18n reťazce, sprievodná prehliadka a SVG šablóny sú bajtovo identické s pôvodným React projektom, pri každej synchronizácii znovu skopírované z pripnutého upstream commitu; iba shell komponentov (`projects/angular-advanced-odontogram/src/lib/components/`) je natívne Angular riešenie. Existuje malá, explicitne zdokumentovaná sada odchýlok (iba reťazce brandingu/identity — pozri špecifikáciu návrhu portu v tomto repozitári). Verzovanie prebieha v lockstepe s React modulom.

---
![Náhľad editora odontogramu](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_en_odontogram.png)
*Snímka obrazovky z pôvodného React projektu — Angular port vykresľuje identické rozhranie.*

🔗 **Živé demo:** https://angular-advanced-odontogram.vercel.app/

---

### 📦 Použitie ako npm balík

Odontogram sa distribuuje ako samostatná knižnica Angular komponentov na npm:
[`angular-advanced-odontogram`](https://www.npmjs.com/package/angular-advanced-odontogram).

#### Požiadavky
- **Angular 21.2+** (deklarovaný ako peer dependency — zabezpečuje ho vaša aplikácia).
- **Bundler**, ktorý rozumie poľu `exports` a formátu ESM — Angular CLI (`@angular/build`) to spĺňa bez ďalšej konfigurácie. Balík je **iba ESM**.
- Node **≥ 20** pre nástroje.

#### Inštalácia

```bash
npm install angular-advanced-odontogram
```

#### Základné použitie

Zaregistrujte hárok štýlov **raz**, kdekoľvek sú nakonfigurované globálne štýly vašej aplikácie (napr. `angular.json`):

```json
"styles": [
  "node_modules/angular-advanced-odontogram/styles.css",
  "src/styles.css"
]
```

Potom vykreslite `OdontogramShellComponent`:

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

`language` akceptuje `hu | en | de | es | it | sk | pl | ru | pt-br | zh | ar | fr`; `numberingSystem` akceptuje `FDI | UNIVERSAL | PALMER`.

#### Vstupy komponentu

`OdontogramShellComponent` je riadený (controlled) komponent — každý vstup je signál Angular `input()`, všetky voliteľné, každý sa v prípade vynechania vráti k vlastnej predvolenej hodnote enginu. Najbežnejšie:

| Vstup | Typ | Predvolená hodnota | Popis |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | Jazyk používateľského rozhrania (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`zh`/`ar`/`fr`). |
| `numberingSystem` | `"FDI" \| "UNIVERSAL" \| "PALMER"` | `"FDI"` | Systém číslovania zubov. |
| `darkMode` | `boolean` | `false` | Prepínač tmavého motívu. |
| `readOnly` | `boolean` | `false` | Vypne všetky úpravy (iba na zobrazenie). |
| `themeConfig` | `OdontogramThemeConfig` | — | Prepíše CSS premenné motívu (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Registrácia vlastných stavových pluginov / ďalších vrstiev. |
| `enableNotes` | `boolean` | `false` | Povolí poznámky pre jednotlivé zuby. |
| `enableIcdas` | `boolean` | `false` | Povolí hodnotenie kazu podľa ICDAS II. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Zložitosť karty výplní: `"simple"` (jeden materiál na zub) alebo `"complex"` (materiály podľa plôch). |
| `fillingDefectEnabled` | `boolean` | `true` | Zapína záchyt nálezov poruchy výplne na karte Výplne. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | všetky dostupné | Dostupné výplňové materiály ako boolovská mapa nad `amalgam`/`composite`/`gic`/`temporary` (neznáme kľúče sa ignorujú). |
| `fissureSealingEnabled` | `boolean` | `true` | Zapína zapečatenie fisúr na karte Výplne. |
| `languageChange` / `numberingChange` / `darkModeChange` (výstupy) | `output<T>` | — | Vyšlú udalosť, keď používateľ zmení nastavenie z rozhrania. |
| `fillingComplexityChange` / `fillingDefectEnabledChange` / `fillingMaterialAvailabilityChange` / `fissureSealingEnabledChange` (výstupy) | `output<T>` | — | Vyšlú udalosť, keď používateľ zmení príslušné nastavenie v Nastavenia → Výplne. |

Akceptujú sa aj jemnejšie vstupy úrovne detailu (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `cariesDepthEnabled`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) — úplný, typovaný zoznam nájdete v `odontogram-shell.component.ts`.

Vyššie uvedené štyri vstupy výplní slúžia **iba na obnovenie**: vynechaný vstup nikdy nezapisuje do enginu (imperatívne volanie `setFillingComplexity()` pred pripojením sa zachová), zatiaľ čo dodaný vstup zapisuje engine aj stav modalu Nastavenia súčasne, takže modal nikdy nezobrazuje zastaranú hodnotu. `fillingMaterialAvailability` sa aplikuje rozdielovo cez kanonický serializovaný kľúč, takže opätovné vykreslenie s novým objektovým literálom rovnakého obsahu nikdy neprepisuje engine. Príslušné výstupy `*Change` sa spúšťajú z Nastavenia → Výplne — cesta spätného zápisu pre hostiteľov ukladajúcich preferencie.

#### Verejné API (pomenované exporty)

`OdontogramShellComponent` je pomenovaný export. Imperatívne stavové API, samostatný komponent `PerioChartComponent`, sprievodná prehliadka a všetky verejné typy sú pomenované exporty z rovnakého vstupného bodu:

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

Celý rozsah (výrazne cez 100 funkcií a typov — `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PdfSettings`, `PerioViewMode` a mnoho ďalších) je plne typovaný v priložených deklaráciách `.d.ts`; kurátorovanú referenčnú tabuľku nájdete nižšie v sekcii [Verejné API](#-verejné-api).

#### Skladateľné povrchy (pokročilé)

`OdontogramShellComponent` je podporovaný komponent všetko v jednom a nevyžaduje žiadne ďalšie nastavenie. Ak potrebujete umiestniť oblasti odontogramu do rôznych častí vlastného rozloženia, štyri používateľské povrchy shellu sú tiež exportované a možno ich poskladať pod jedinou službou `OdontogramUiService`, pričom všetky zdieľajú jednu reláciu spravovanú danou inštanciou:

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

`OdontogramUiService` prijíma rovnaký tvar konfigurácie ako vstupy `OdontogramShellComponent` (jej metóda `configure()` akceptuje objekt `OdontogramUiConfig` zložený zo signálov/callbackov, každé pole voliteľné, s rovnakou upstream predvolenou hodnotou). Súčasné obmedzenie: jedna inštancia `OdontogramUiService` na stránku (engine je singleton na úrovni modulu). Povrchy možno pripájať a odpájať podľa potreby. Samotný `OdontogramShellComponent` je nezmenený — je to presne táto kompozícia v predvolenom usporiadaní, ktorá stále naväzuje každé pole explicitne z vlastných vstupov.

Pre ešte jemnejšie skladanie sú exportované aj jednotlivé ovládacie karty:

| Komponent | Selektor | Pokrýva |
|---|---|---|
| `StatusesCardComponent` | `aao-statuses-card` | Ovládacie prvky stavu/predvolieb za celé ústa (Obnoviť, mliečny/zmiešaný chrup, bezzubý, doplnky stavu) |
| `ToothDetailsCardComponent` | `aao-tooth-details-card` | Základný riadok (výber zuba/substrát), zaškrtávacie políčka zlomenej korunky, prepínače potreby/výmeny korunky |
| `CariesCardComponent` | `aao-caries-card` | Režim hĺbky kazu, subkoronálny kaz, závažnosť kazu koreňa, výber kazu podľa plôch |
| `FillingsCardComponent` | `aao-fillings-card` | Materiál výplne, výber výplní podľa plôch + poruchy, poznámky k sekundárnemu kazu/poruche výplne |
| `RootPeriodontiumCardComponent` | `aao-root-periodontium-card` | Stav drene/endo, apikálna diagnóza, resorpcia, mobilita, stav peri-implantátu |
| `OrthodonticsCardComponent` | `aao-orthodontics-card` | Pomôcka, drift, vertikálny pohyb, rotácia |
| `SurfaceCrossComponent` | `aao-surface-cross` | Zdieľaný krížový výberový prvok B/M/O/D/L, ktorý interne používajú karty Kaz/Výplne |
| `DiagnosesCardComponent` | `aao-diagnoses-card` | Diagnostické kódovanie ICD-10/BNO-10/ICD-10-CM/SNOMED pre každý zub — zobrazenie odvodených diagnóz zuba a ich úprava (potlačenie odvodenej diagnózy, pridanie takej, ktorú graf nezaznamenáva) |

Každá karta je samostatný deklaratívny komponent, ktorý číta a zapisuje zdieľanú reláciu cez `inject(OdontogramUiService)` a exportovanú pomôcku `engineState()` (čítanie ľubovoľného getteru enginu vracajúce signál, udržiavané aktuálne cez vlastnú zbernicu zmien jadra). Pripojte len tie karty, ktoré dané rozloženie potrebuje, v ľubovoľnom usporiadaní, pod jedinou službou `OdontogramUiService`. Exportované sú aj `CreditsModalComponent` (`aao-credits-modal`, vyskakovacie okno hornej lišty „O aplikácii a poďakovania") a `CaseDiagnosesModalComponent` (`aao-case-diagnoses-modal`, vyskakovacie okno diagnóz za celé ústa/oblasť), pre hostiteľov, ktorí ich chcú riadiť z vlastného stavu otvorenia/zatvorenia.

```ts
import { engineState, OdontogramUiService, getOdontogramSummary } from "angular-advanced-odontogram";

// Anywhere inside an injection context under an `OdontogramUiService`:
readonly summary = engineState(getOdontogramSummary); // Signal<OdontogramSummary>, kept fresh automatically
```

#### DI body na testovanie hostiteľskej aplikácie

Dva `InjectionToken` umožňujú hostiteľskej aplikácii vo vlastných testoch prepísať volania enginu so stranovými efektmi (obidva sa v produkcii predvolene vracajú na skutočné volanie enginu; obidva sú `providedIn: "root"`):

| Token | Prepisuje | Tvar |
|---|---|---|
| `ODONTOGRAM_ENGINE_LIFECYCLE` | `initOdontogram()` / `destroyOdontogram()`, volané z `ngAfterViewInit()`/`ngOnDestroy()` komponentu `OdontogramShellComponent` | `{ init: () => Promise<void>; destroy: () => void }` |
| `EXPORT_PDF_FN` | `exportPdf(opts)`, volané z `ExportOptionsModalComponent` pri stlačení „Exportovať" | `(opts: PdfExportOptions) => Promise<void>` |

Obidva existujú preto, lebo skutočné funkcie pristupujú k internej implementácii DOM/canvas/`jsPDF`, ktorú bezhlavé (headless) testovacie prostredie nedokáže plne poskytnúť — prepíšte ich cez pole poskytovateľov Angular `TestBed` vo vlastných testoch komponentov hostiteľskej aplikácie.

#### Dôležité poznámky a súčasné obmedzenia
- **Iba ESM** — balík publikuje jeden ES modul (zostavený pomocou `ng-packagr`) plus vstupný bod deklarácie typov. Je cielený na rozlíšenie modulov bundlerom; neexistuje CommonJS zostavenie.
- **Hárok štýlov je samostatný** — **musíte** raz zaregistrovať `angular-advanced-odontogram/styles.css`; nevkladá sa automaticky. Štýlovanie je globálne CSS ohraničené pod `.odontogram-root` a riadené CSS premennými `--odon-*`.
- **SSR / iba klient** — komponent pri pripojení číta DOM, preto musí bežať v prehliadači; vykresľujte ho iba na strane prehliadača.
- **Zdroje sú samostatné** — SVG súbory zubov a ikon sú pri zostavení vložené priamo do balíka (generované moduly TypeScript, `npm run gen:assets`); **nie je potrebné konfigurovať žiadne získavanie zdrojov za behu** a nič netreba kopírovať do verejného priečinka vašej aplikácie.
- **Načítanie na požiadanie** — v úvodnom balíku je zabudovaná iba angličtina a grafika anatómie zubov profilu `classic`; ostatných 11 tabuliek jazykov rozhrania a grafika profilu anatómie `measured` sú samostatné, lenivo (lazy) načítavané časti, ktoré sa načítajú až vtedy, keď na ne hostiteľ prvýkrát prepne (`[language]` / `I18nService.setLanguage()`/ponuka jazykov, resp. `setToothAnatomy("measured")`/Nastavenia → Odontogram → anatómia zubov). Toto rozdelenie pri tejto synchronizácii znížilo hlavnú časť dema z 3,12 MB na 1,25 MB a úvodný súčet z 3,21 MB na 1,33 MB — na strane hostiteľa nie je potrebné nič konfigurovať.
- **Jedna inštancia na stránku** v tomto vydaní — stav enginu je singleton na úrovni modulu (rovnako ako v pôvodnom React projekte), takže vykreslenie dvoch inštancií `<aao-odontogram-shell>` na tej istej stránke by spôsobilo, že by zdieľali stav jednej karty.

---

### ✨ Kľúčové funkcie
- 🖱️ Rýchly výber a viacnásobný výber (CMD/CTRL + klik)
- 🦷 Typy zubov: trvalý, mliečny, implantát, subgingiválny, chýbajúci
- 🦷 Substrát zuba (nezávislý od akejkoľvek náhrady): prirodzený, radix (zvyšok koreňa), zlomený, preparovaný na korunku
- 👑 Náhrady podľa typu × materiálu: korunka / inlay / onlay / fazeta / mostík z e.max, zlata, gradie, zirkónu, kovu, kovovo-keramického materiálu, teleskopu alebo dočasného materiálu (onlay je dostupný len v okluzálnom zobrazení) — vyberané z jedného kombinovaného výberu s nízkym počtom klikov „Fix: Korunka – …"; staršie korunky `metal` sa automaticky migrujú na `metal-ceramic` (kovovo-keramickú); implantáty používajú rovnaký model typ × materiál, doplnený o vrstvu konektora implantátu. Výber je obmedzený podľa druhu zuba: implantát ponúka iba korunku/mostík (plus svojich päť možností upevnenia, pozri nižšie); chýbajúci/medzerový zub ponúka iba článok mostíka (plus snímateľnú čiastočnú/celkovú protézu); substrát `radix` úplne skrýva ovládací prvok náhrady (na zvyšku koreňa nemožno zaznamenať žiadnu náhradu)
- 🦿 Snímateľná/náustavcová protetika na vyhradenej osi `prosthesis` (položky „Kivehető:" v kombinovanom výbere): hojivý abutment implantátu, lokátor, lokátor s protézou (overdenture), steg, steg s protézou; zubami podopretá snímateľná čiastočná alebo celková náhrada
- 🌉 Zuby mostíka vykresľujú súčasne korunkový uzáver aj sedlový konektor; prekrytie viaczubového mostíkového úseku vykresľuje jeden súvislý, oblúku prispôsobený konektor cez po sebe idúce zuby mostíka (články + piliere) a medzizubné medzery medzi nimi, zahrnuté v exporte PNG/JPG/SVG
- 🔍 Zaznamenávanie kazu na 6 plochách: meziálne, distálne, bukálne, linguálne, oklúzne, subkoronálne
- 🪥 Materiály výplní na každú plochu: amalgám, kompozit, GIC, dočasný
- 🏥 Jeden zlúčený výber „Stav drene / endo" (zoskupený: vitálna dreň vs. liečená/endo): endodontické stavy (liečivá výplň, koreňová výplň, nekompletná koreňová výplň, sklený kolík, kovový kolík) a AAE diagnóza drene (`pulpDx`: normálna / reverzibilná / ireverzibilná pulpitída / nekróza) sa navzájom vylučujú — zub s ošetreným koreňovým kanálikom (nastavené `endo`) nemôže mať zároveň diagnózu vitálnej drene; pri ošetrení sa `pulpDx` normalizuje na `normal`. Voliteľné 3-úrovňové nastavenie podrobnosti drene (`pulpDetailLevel`: simple / AAE / praktická latinčina) cez `pulpLatin` sprístupňuje 9 praktických latinských podtypov drene
- 🦴 Apikálna diagnóza (`apicalDx`: symptomatická/asymptomatická apikálna parodontitída, akútny/chronický apikálny absces, kondenzujúca osteitída) priamo určuje periapikálny glyf; kvalifikátor podtypu lézie granulóm/cysta sa zobrazuje iba pri symptomatickej/asymptomatickej apikálnej parodontitíde
- 🩹 Zlúčená karta „Koreň a parodont" (jedna zbaliteľná sekcia pre nálezy koreňa/periapikálnej oblasti a parodontu)
- ⚕️ Modifikácie: periapikálny zápal (zobrazený iba na chýbajúcich zuboch/zuboch s extrakčnou ranou; skrytý na prítomných zuboch a na implantátoch, kde ho pokrýva `periImplant`), parodontálne ochorenie, stupne mobility (M1/M2/M3, skryté na implantátoch)
- 🦷🔩 Stav peri-implantátu (`periImplant`: none / mucositis / peri-implantitis-mild / -moderate / -severe) — stagingovanie podľa 2018 World Workshop, zobrazené ako vyhradený výber na implantátoch
- 🏷️ Špeciálne indikátory: potrebná korunka, potrebná výmena korunky, uzavretá medzera po strate zuba, plán extrakcie, zapečatenie fisúr, strata kontaktného bodu
- 👁️ Oklúzny pohľad, zuby múdrosti, prepínače viditeľnosti kosti a drene
- 🔢 12 filtrov výberu (všetky, prítomné, trvalé, mliečne, implantáty, chýbajúce, horné/dolné, predné/moláre)
- 📊 Preddefinované stavové predvoľby (obnoviť, mliečny chrup, zmiešaný chrup, bezzubý)
- 📦 22 preddefinovaných šablón reštaurácií (mostíky, snímateľné protézy, stegové protézy s implantátmi)
- 💾 Export/import stavu v JSON (verzia 2.22; import stále akceptuje staršie verzie 1.4 a 2.0 až 2.21 a automaticky ich migruje, s vlastnými stavmi pluginov a poznámkami ku každému zubu)
- 💽 Voliteľná (opt-in) perzistencia v `localStorage` (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — predvolene vypnutá; automaticky ukladá stavový graf (a voliteľne aj plánovací graf) so zoskupeným a oneskoreným zápisom (~400 ms; tzv. „debouncing", anglický technický termín pre zoskupenie rýchlo po sebe idúcich zmien do jedného zápisu) a limitom veľkosti 4 MB, pričom chyby ukladania/parsovania sú smerované do callbacku `onError` (alebo `console.warn`) namiesto vyhodenia výnimky
- 🔗 Export HL7 FHIR R4 (kolekcia Bundle s Observations pre každý zub, kódovanie zubov ISO 3950 pre trvalý chrup **aj** mliečne zuby (51-85, obojsmerne bezstratovo pri importe), lokálny systém kódov, plus voliteľné (opt-in) prekrytie SNOMED CT (Nastavenia → Všeobecné → SNOMED CT)); komponent kazu so zaznamenanou závažnosťou nesie aj kódovanie skórovacieho systému — ICDAS na primárnej (nevyplnenej) ploche, CARS na rekurentnej (vyplnenej)
- ✚ Krížový/plusový výber plôch (B/M/O/D/L) pre kaz a výplne — `SurfaceCrossComponent`, exportovaný pre skladateľné rozloženia
- 🧱 Materiály reštaurácie pre každú plochu (zmiešané výplne, napr. bukálny amalgám + distálny kompozit)
- 🖼️ Export obrázka odontogramu vo formáte PNG/JPG/SVG (na stiahnutie; PNG/JPG rastrovaný z vektorového SVG)
- 🦷 Kaz/sekundárny kaz ako stavový automat na každú plochu: kazivá plocha bez výplne sa zobrazuje ako primárny kaz (priehľadnosť odstupňovaná podľa ICDAS); hneď ako má táto plocha výplň, zobrazuje sa namiesto toho ako sekundárny (rekurentný) kaz (skóre CARS) — obidva nikdy nie sú aktívne súčasne na tej istej ploche
- 🎯 Zjednotená závažnosť na plochu (`cariesSeverity`, 0–6): na primárnej ploche sa číta ako hĺbka ICDAS, na rekurentnej ako pomenované skóre CARS (Zdravý … Rozsiahla kavita), prostredníctvom kontextového popupu, ktorý zobrazuje iba škálu relevantnú pre aktuálny stav plochy
- 🌱 Kaz koreňa (`rootCaries`: none / active / arrested / active-cavitated), aktivujúci vyhradenú vrstvu ilustrácie kazu koreňa s priehľadnosťou závislou od závažnosti
- 📡 Rádiografická hĺbka kazu (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 na plochu), nezávislá od vizuálnej škály závažnosti ICDAS/CARS, zobrazená ako odznak a obojsmerne prenášaná cez vlastný FHIR Observation
- 🎚️ Tri nastavenia podrobnosti kazu (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) plus prepínač `cariesDepthEnabled`, ktoré zbaľujú každú škálu do jednoduchšieho výberu bez straty uloženej hodnoty
- 🩹 Súhrnný riadok sekundárneho kazu v paneli výplní: vypíše každý vybraný zub so sekundárnym kazom a jeho plochy
- 🪛 Poruchy výplne na každú plochu (`fillingDefect`: none / marginal / fracture / wear) na priamych náhradách, nezávislé od sekundárneho kazu
- 🦷💥 Opotrebenie zuba typizované podľa klinickej príčiny a miesta (`wearEdge`: none / attrition / erosion, incizálne/oklúzne; `wearCervical`: none / abrasion / abfraction / erosion, cervikálne)
- 🎨 Zafarbenie zuba podľa príčiny (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) na trvalých aj mliečnych zuboch
- ✏️ Predné zuby (rezáky/špičáky) označujú svoju oklúznu plochu v celom rozhraní ako „incizálnu"; uložený kľúč plochy zostáva `occlusal`
- 🔤 Notácia plôch citlivá na polohu zuba (Nastavenia → Detaily zuba → „Notácia plôch", simple/full, predvolené full): v režime full sa písmeno a popisok plochy kazu/výplne riadia zubnou anatómiou — okluzálna → I/incizálna na predných zuboch, bukálna → L/labiálna na predných zuboch, linguálna → P/palatinálna na horných zuboch a L/linguálna na dolných zuboch
- 🦷↕️ Ortodontické zaznamenávanie na každý zub (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: boolean) na prítomnom prirodzenom zube (trvalom alebo mliečnom)
- 🪨 Zubný kameň a resorpcia koreňa typizovaná ako interná alebo externá cervikálna (`resorptionType`)
- 📏 Hĺbka kazu na každú plochu (povrchový / dentín / hlboký), alebo voliteľné skórovanie ICDAS II (0–6) cez `enableIcdas`
- 🩹 Prepínač okrajovej netesnosti korunky, zobrazený len pri korunkovej alebo mostíkovej náhrade
- 🧬 Diagnostické kódovanie podľa štandardov (WHO ICD-10, vždy zapnuté): každý zaznamenaný nález odvodí diagnózu s kódom ICD-10 — kaz (K02), kaz koreňa/cementu a zastavený kaz (K02.2/.3), pulpitída a nekróza drene (K04.0/.1), apikálna parodontitída, periapikálny absces a radikulárna cysta (K04.4–.9), atrícia/abrázia/erózia/abfrakcia (K03.0–.8), zubný kameň (K03.6), resorpcia (K03.3), zafarbenie (K00.3/K00.8/K03.7), strata zuba (K08.1), zvyšok koreňa (K08.3) a zlomenina zuba (S02.5) — exportované ako FHIR Conditions
- 🩺 Karta **Diagnózy** pre každý zub (`DiagnosesCardComponent`, `aao-diagnoses-card`): zobrazenie odvodených diagnóz ICD-10 daného zuba a ich úprava — potlačenie nesprávne odvodenej diagnózy alebo pridanie takej, ktorú graf nezaznamenáva. Efektívna sada (odvodené − potlačené + pridané) riadi export FHIR; každý riadok zobrazuje najprv svoj kód (`K04.0 Pulpitis`) a riadky sú zoradené podľa kódu; prepínač **vylúčiť** odstráni diagnózu z exportu FHIR bez zásahu do grafu a **zmazanie** (×) odstráni diagnózu *aj* jej podkladový nález
- 🗂️ **Diagnózy prípadu / regionálne diagnózy** (`CaseDiagnosesModalComponent`, `aao-case-diagnoses-modal`): diagnózy za celé ústa, ktoré nie sú viazané na jeden zub — malokluzia a TMJ (K07), cysty dutiny ústnej (K09), ochorenie slinných žliaz (K11), stomatitída a sliznica dutiny ústnej (K12/K13) a vývojové anomálie na úrovni oblúka (K00) — každá voliteľne lateralizovaná (vľavo/vpravo/obojstranne), otváraná z tlačidla **Diagnózy** vedľa prepínača Odontogram/Parodontálny stav
- 🌍 Národné kódovacie balíčky (Nastavenia → Všeobecné → Systém kódovania diagnóz): prekrytie národného systému kódov nad základom WHO ICD-10 — BNO-10 (maďarský, oficiálne názvy NEAK; zachováva kód WHO) alebo americký ICD-10-CM (prekódované kódy, napr. rozsah K07 dentofaciálnych anomálií → M26)
- 🔬 Prekrytie SNOMED CT (Nastavenia → Všeobecné → SNOMED CT, voliteľné/opt-in, predvolene vypnuté): pridáva kódovanie SNOMED CT popri kódovaní WHO a prípadnom národnom balíčku, a kóduje nálezy peri-implantátu, ktoré nemajú kód WHO ICD-10. Identifikátory konceptov ICD-10-CM a SNOMED sú referenčné/orientačné — pred klinickým použitím ich overte podľa oficiálneho tabuľkového zoznamu ICD-10-CM / prehliadača SNOMED CT
- 🔁 Obojsmerný prevod (round-trip) FHIR Condition: diagnózy sa exportujú ako zdroje FHIR `Condition` (viazané na zub, plus diagnózy prípadu na úrovni pacienta s lateralitou v bodySite) popri Observations, a import ich rekonštruuje — diagnózy prípadu priamo a prepísania pridania/potlačenia pre každý zub porovnaním importovaných Conditions s novo odvodeným grafom
- ✅ Export FHIR bez chýb validátora HL7: každá položka Bundle nesie deterministické `id` a absolútnu `fullUrl` (bez zástupných `urn:uuid`) a Bundle vkladá vlastný **CodeSystem** enginu, aby sa jeho lokálne kódy pri validácii dali vyriešiť; ten istý CodeSystem spolu s generovanými ValueSets je publikovaný v tomto repozitári pod `projects/angular-advanced-odontogram/src/lib/fhir/` (odovzdaním `includeCodeSystem: false` v možnostiach exportu FHIR ho možno z Bundle vynechať)
- 🔄 Parodontálne dáta sa teraz obojsmerne prenášajú aj cez import FHIR, nielen cez JSON payload: importér načíta parodontálne panely LOINC 74029-0 späť do každého zuba — hĺbku sondáže, gingiválny okraj (rekonštruovaný z CAL, takže pseudovačkové hodnoty sa zachovajú), BOP, furkáciu, plak O'Leary, indexy PI/GI a implantátové mPI/mBI a šírku keratinizovanej gingívy — plus dôkazové Observations fajčiarskeho stavu a HbA1c na úrovni prípadu; jedinou výnimkou je supurácia, ktorá zostáva iba v JSON
- 🧰 Zjednotená lišta ikon v hornej časti so záložkovým modálnym oknom Nastavenia (7 záložiek — Všeobecné / Odontogram / Parodontálny graf / Detaily zuba / Kaz / Výplne / Export — pozri [Nastavenia](#-nastavenia) nižšie)
- 🦷🩺 Nastavenia → záložka „Parodontálny graf": prepínač dostupnosti plus 16 prepínačov zobraziť/skryť pre jednotlivé indexy riadkov parodontálneho grafu, každý s popisom, plus možnosť zobrazenia názvov indexov preložené vs. kanonické
- 📋 Panel informácií o zuboch: živý textový súhrn celého grafu (počty zubov, zoznamy prítomných/chýbajúcich, kaz vrátane sekundárneho, výplne, koreňové kanáliky, protetika, implantáty, stav parodontu) — zobrazený predvolene, prepínateľný v Nastaveniach
- 🗂️ Konsolidovaný rozbaľovací zoznam Exportu (Stav JSON / FHIR / PNG / JPG / SVG / PDF správa), každý formát nezávisle skrývateľný cez Nastavenia → Všeobecné
- 📥 Rozbaľovací zoznam Importu s importom FHIR (spätne načítava exportované Bundles), nezávisle skrývateľný podľa zdroja
- ⏳ Prekrytie priebehom počas exportu obrázka
- 🎓 Interaktívna úvodná prehliadka (sprievodné predstavenie ovládacích prvkov shellu)
- 🔢 Tri systémy číslovania (FDI, Universal, Palmer)
- 🌐 I18n — 12 jazykov rozhrania (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) s prepínačom jazyka; arabčina vykresľuje rozhranie sprava doľava, pričom zubné/parodontálne grafy zostávajú zľava doprava; v hlavnom balíku je zabudovaný iba aktívny jazyk — každý ďalší jazyk je samostatná časť, ktorá sa načíta pri prvom výbere
- 🌗 Podpora tmavého režimu s prepínacím tlačidlom (samostatný alebo riadený nadradenou aplikáciou)
- 🎨 Vlastná konfigurácia témy (vstup `themeConfig`) s CSS vlastnými vlastnosťami (`--odon-*`)
- 📱 Mobilné dotykové UX: vyskakovacie okno pre priblíženie kliknutím, kontextová ponuka dlhým stlačením, priblíženie štipnutím, WCAG 44px dotykové ciele, navigácia prepínania oblúka
- 🔌 Vlastný SVG systém pluginov: vkladanie vizuálnych prekrytí, vlastný stav pre každý zub, podpora exportu/importu JSON — výstup `renderSvg()` pluginu je pred vložením do živého grafu sanitizovaný knižnicou DOMPurify (SVG profil); pluginy naďalej bežia ako dôveryhodný kód, preto načítavajte iba pluginy zo zdrojov, ktorým dôverujete
- ⚠️ Varovania validácie stavu pre nekompatibilné kombinácie zubných stavov
- 🏷️ Automatický tooltip stavu na dlaždiciach zubov (zobrazuje všetky aktívne stavy)
- 🩺 Tooltip pre každý zub a panel súhrnu za celé ústa zobrazujúci celú sadu klinických nálezov (diagnóza drene/apikálna, resorpcia koreňa, stav peri-implantátu, odstupňovaný kaz koreňa, zubný kameň, okrajová netesnosť korunky, zlomenina, strata kontaktu, typizované okrajové/cervikálne opotrebenie)
- ♿ Klávesnicová prístupnosť (WCAG): ARIA role listbox/option, výber klávesmi Enter/Medzera, navigácia šípkami, obrysy focus-visible
- 🔒 Režim iba na čítanie: zakázanie všetkých interakcií pre prípady tlače/správ/prezerania
- ✨ Animácie výberu: pulzujúci prerušovaný okraj a žiariaci tieň na vybraných zuboch (s podporou prefers-reduced-motion)
- 📝 Poznámky ku každému zubu: dvojklik pre pridanie/úpravu poznámok, ikona poznámky vedľa čísla zuba, tooltip pri najetí s textom poznámky, riadok „Individuálne poznámky" v súhrnnom paneli za celé ústa, zahrnutie do PDF správy, export/import JSON
- 🔀 Rozdelenie grafu Stav ↔ Plán: prepínač `Status | Plan` prepína medzi grafom aktuálneho **stavu** a grafom **plánu** (zamýšľaný stav po ošetrení), pričom každý má vlastné stavy zubov; export/import sa vždy vzťahuje na graf stavu, zatiaľ čo graf plánu sa číta/zapisuje samostatne cez vlastné API (pozri [Verejné API](#-verejné-api)) a — keď sa líši od stavu — je zahrnutý ako doplnková sekcia `plan` v exporte JSON
- 📝 Rámček „Čo sa zmenilo": kedykoľvek sa plán líši od aktuálneho stavu, vypíše každý rozdiel podľa zuba a osi ošetrenia; dostupné aj programovo cez `getPlanChanges()`
- 🅿️ Navrhovaný štýl: v režime Plán sa nálezy, ktoré plán **pridáva** oproti aktuálnemu stavu, vykresľujú s výrazným prerušovaným, tónovaným „navrhovaným" obrysom
- 🚦 Obmedzenie v režime Plán: graf Plán zobrazuje iba to, čo zubár môže *vykonať* — nálezy iba pre stav (kaz, opotrebenie, zafarbenie, celý parodontálny blok) sú skryté; náhrada, protetika, ortodoncia, potreba/výmena korunky a plán extrakcie zostávajú plánovateľné

![Parodontologická karta celých úst](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_en_perio.png)
*Snímka obrazovky z pôvodného React projektu — Angular port vykresľuje identické rozhranie.*

- 🩺 Parodontálne vyšetrenie: pre každé miesto **hĺbka sondáže**, **gingiválny okraj**, **krvácanie pri sondáži** (+ supurácia) na šiestich štandardných miestach na zub, s odvodenou **klinickou úrovňou prichytenia (CAL = PD + gingiválny okraj)**, recesiou a celoústnym **%BOP**. **Grafický parodontálny graf pre celé ústa** — každý oblúk je vykreslený ako dve samostatné bukálne/palatinálne(linguálne) SVG s červenou **CEJ čiarou**, číslovanou milimetrovou vodiacou mriežkou a krivkou gingiválneho okraja/hĺbky vačku, oddelenou centrálnym pásom parodontálnych indexov nesúcim **Millerovu triedu** a **Plak/PI/GI/mPI/mBI** ako anatomické dlaždice v tvare diamantu pre každý zub; zadávanie s automatickým posunom klávesnicou; graf sa dynamicky prispôsobuje dostupnej šírke. Prezentovaný ako prepínač zobrazenia `Odontogram | Periodontal Status`, a stále ide o samostatne vyvolateľný komponent cez export `PerioChartComponent`. Export **FHIR** pre každé miesto cez parodontálny panel LOINC (`74029-0`; PD `32910-2`, recesia `32911-0`, CAL `32912-8`)
- 🧪 Rozsiahly automatizovaný testovací balík (pozri [Testovanie](#-testovanie)) pokrývajúci číslovanie, preklady, predvoľby, i18n, shell, tému, dotyk, pluginy, prístupnosť a paritu klinických osí/diagnóz oproti zamrazenému React korpusu
- 📖 Dokumentácia API TypeDoc s komentármi JSDoc pre všetky verejné exporty (`npm run docs`)

### 📦 Moduly
- 🦷 Mriežka odontogramu a rozhranie dlaždíc zubov (`OdontogramChartSurfaceComponent`)
- 🎛️ Ovládacie prvky a stavový panel (`ToothControlsSurfaceComponent` + 8 deklaratívnych kariet)
- 🎨 SVG vrstevnací modul a šablóny (jadro nezávislé od frameworku, `core/odontogram.ts`)
- 🔢 Číslovanie zubov a mapovanie popiskov (FDI/Universal/Palmer, `core/utils/numbering.ts`)
- 🌐 Lokalizácia — 12 jazykov rozhrania (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), vrátane arabčiny (RTL) (`core/i18n/`, `I18nService`)
- 💾 Export/import stavu
- 📋 Doplnky stavu: preddefinované šablóny reštaurácií
- 🎨 Konfigurácia témy: prispôsobiteľná farebná paleta cez CSS vlastnosti `--odon-*`
- 📱 Mobilné dotykové interakcie (priblíženie kliknutím, dlhé stlačenie, priblíženie štipnutím, prepínanie oblúka)
- 🔌 Vlastný SVG systém pluginov
- ⚠️ Systém validácie stavu a tooltipov
- ♿ Klávesnicová prístupnosť a podpora ARIA
- 🔒 Režim iba na čítanie
- ✨ Animácie výberu
- 📝 Systém poznámok ku každému zubu
- 🧱 **Skladateľné rozhranie** — `OdontogramUiService`, pomôcka `engineState()`, 4 prezentačné povrchy a 8 deklaratívnych ovládacích kariet, všetky nezávisle exportované (pozri [Skladateľné povrchy](#-použitie-ako-npm-balík) vyššie)
- 🧪 Automatizovaná testovacia sada (korpus Vitest + `ng test`, pozri [Testovanie](#-testovanie))

### 🛠️ Ovládacie prvky rozhrania

**🔝 Horná lišta** (`OdontogramTopbarComponent`):
- Prepínač jazyka (rozbaľovací zoznam HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR)
- Prepínacie tlačidlo tmavého režimu (ikona slnka/mesiaca, prepína medzi svetlou a tmavou témou)
- Prepínač systému číslovania (rozbaľovací zoznam FDI/Universal/Palmer)
- Tlačidlá Exportovať stav / Importovať stav
- Nastavenia (ikona ozubeného kolieska), O aplikácii/Poďakovania (ikona informácie), odkaz na GitHub

**📊 Hlavička grafu:**
- Prepínač oklúzneho pohľadu
- Prepínač viditeľnosti zubov múdrosti
- Prepínač viditeľnosti kosti
- Prepínač viditeľnosti drene
- Tlačidlo zrušiť výber

**🔍 Filtre výberu:**
- Vybrať všetky / Všetky prítomné / Trvalé / Mliečne / Implantáty / Všetky chýbajúce
- Vybrať horné / Horné 6 predných / Horné moláre
- Vybrať dolné / Dolné 6 predných / Dolné moláre

**📋 Stavové predvoľby:**
- Obnoviť všetko (obnoviť ústa)
- Mliečny chrup
- Zmiešaný chrup
- Prepínač bezzubého

**📦 Rozbaľovací zoznam doplnkov stavu:**
- Horné/dolné zirkónové mostíky (12-22, 13-23, 16-26, celý oblúk)
- Horné/dolné kovové mostíky (12-22, 13-23, 16-26, celý oblúk)
- Horné/dolné čiastočné snímateľné protézy
- Horné/dolné celkové snímateľné protézy
- Horné/dolné stegové protézy s implantátmi

**🦷 Panel editora zuba** (`ToothControlsSurfaceComponent`, pre vybraný zub/zuby, zoskupené do zbaliteľných kariet):
- **Karta Stavy:** predvoľby a doplnky stavu za celé ústa (zobrazenie/skrytie nezávisle cez `showStatusCard`)
- **Karta Detaily zuba:** výber zuba (základný typ vrátane variantov zlomenej korunky), substrát zuba, kombinovaný rozbaľovací zoznam náhrady „Fix: …" / „Kivehető: …", zaškrtávacie políčko okrajovej netesnosti korunky, zaškrtávacie políčka miesta zlomenej korunky, prepínače potrebná korunka / potrebná výmena korunky
- **Karta Ortodoncia:** pomôcka, meziálny/distálny drift, vertikálny pohyb, prepínač rotácie — zobrazená na prítomnom prirodzenom zube (zobrazenie/skrytie nezávisle cez `showOrthoCard`)
- **Karta Kaz:** rozbaľovací zoznam režimu hĺbky kazu, zaškrtávacie políčko subkoronálneho kazu, rozbaľovací zoznam závažnosti kazu koreňa a výber plôch kazu B/M/O/D/L (`SurfaceCrossComponent`) s kontextovým popupom hĺbky ICDAS/CARS a odznakom rádiografickej hĺbky
- **Karta Výplne:** rozbaľovací zoznam materiálu výplne, výber výplní na každú plochu, indikátor poruchy výplne pre každú plochu, poznámky k sekundárnemu kazu a poruche výplne
- **Karta Koreň a parodont:** zlúčený výber „Stav drene / endo", výber apikálnej diagnózy, výber podtypu periapikálnej lézie, výber typu resorpcie koreňa, výber stupňa mobility, výber stavu peri-implantátu (iba implantáty)
- **Špeciálne indikátory:** plán extrakcie/rana, uzavretá medzera, zapečatenie fisúr, strata kontaktného bodu, zubný kameň, parapulpálny kolík, endo resekcia, pilier mostíka

### 🦷 Typy a stavy zubov

**Výber zuba (základný typ):**
| Hodnota | Popis |
|---|---|
| `none` | Chýbajúci zub |
| `tooth-base` | Trvalý zub |
| `milktooth` | Mliečny (dočasný) zub |
| `implant` | Dentálny implantát |
| `tooth-under-gum` | Subgingiválny (nevyrastený) zub |

**Varianty zlomeného zuba:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Substrát zuba (trvalé zuby):**
`natural` (predvolené), `radix` (zvyšok koreňa), `broken`, `crownprep` (preparovaná na korunku)

**Typ náhrady (trvalé zuby):**
`none`, `crown`, `inlay`, `onlay` (len okluzálne zobrazenie), `veneer`, `bridge`

**Materiál náhrady (trvalé zuby):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (staršie korunky `metal` sa migrujú sem), `telescope`, `temporary`

**Možnosti náhrady sú obmedzené podľa druhu zuba** (`restorationOptions()` v `projects/angular-advanced-odontogram/src/lib/core/registry/restorations.ts`): implantát ponúka iba typy náhrady `crown`/`bridge` (doplnené o vrstvu konektora implantátu) plus päť nižšie uvedených položiek upevnenia `prosthesis`; chýbajúci/medzerový zub ponúka iba článok `bridge` plus dve položky snímateľnej protézy `prosthesis`; substrát `radix` úplne skrýva ovládací prvok náhrady.

**Prosthesis** (`prosthesis`; nezávislá os snímateľnej protetiky/upevnenia, zobrazovaná ako položky „Kivehető:" v kombinovanom rozbaľovacom zozname náhrady):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (upevnenia implantátu, s protézou alebo bez nej), `removable-partial`, `removable-full` (zubami podopreté protézy na chýbajúcom/medzerovom zube). Zub má buď pevnú náhradu, alebo protetiku, nikdy oboje — nastavenie jednej vynuluje druhú.

**Okrajová netesnosť korunky** (`crownLeakage`; boolean): zobrazená iba keď je `restorationType` typu `crown` alebo `bridge`.

**Endodontické možnosti (trvalé zuby):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodontické možnosti (mliečne zuby):**
`none`, `endo-medical-filling`

`endo` a `pulpDx` sa zobrazujú cez jeden zlúčený výber „Stav drene / endo" (zoskupený: vitálna dreň vs. liečená/endo) a navzájom sa vylučujú — výber ošetreného stavu (`endo != none`) vynuluje `pulpDx` na `normal` a výber diagnózy drene vynuluje `endo` na `none`.

**Materiály výplní (trvalé zuby):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiály výplní (mliečne zuby):**
`composite`, `gic`, `temporary`

**Plochy výplní/kazu:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (iba kaz)

**Modifikácie:**
`inflammation` (periapikálny), `parodontal` (parodontálny), `mobility` (M1/M2/M3)

**Typ periapikálnej lézie** (`periapicalType`; upresňuje periapikálny glyf, zobrazený iba pri symptomatickej/asymptomatickej apikálnej parodontitíde):
`none`, `granuloma`, `cyst` — staršia hodnota `abscess` sa stále akceptuje/ukladá, ale vo výbere sa už neponúka

**Diagnóza drene** (terminológia AAE; `pulpDx`):
`normal`, `reversible-pulpitis`, `irreversible-pulpitis`, `necrosis` — navzájom sa vylučuje s `endo`

**Diagnóza drene, praktická latinčina** (`pulpLatin`; výber drene ju zobrazuje iba keď je `pulpDetailLevel` nastavené na `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Úroveň podrobnosti drene** (`pulpDetailLevel`, globálne nastavenie): `simple`, `aae` (predvolené), `latin`

**Apikálna diagnóza** (`apicalDx`; určuje periapikálny glyf):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Typ resorpcie koreňa** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Stav peri-implantátu** (`periImplant`; iba implantáty, stagingovanie podľa 2018 World Workshop):
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Závažnosť kazu** (`cariesSeverity`; zjednotené pole na plochu, `0`–`6`): na ploche bez výplne sa číta ako škála hĺbky ICDAS (`superficial` / `dentin` / `deep`, alebo surové kódy ICDAS II `0–6`, keď je zapnuté `enableIcdas`); na ploche s výplňou sa číta ako pomenované skóre CARS (`0` zdravý … `6` rozsiahla kavita)

**Kaz koreňa** (`rootCaries`): `none`, `active`, `arrested`, `active-cavitated`

**Rádiografická hĺbka kazu** (`radiographicDepth`; na plochu): `none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Nastavenia podrobnosti kazu** (globálne): `secondaryCariesMode` (`simple`/`standard`/`full`, predvolené `standard`), `rootCariesMode` (`simple`/`severity`, predvolené `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, predvolené `off`), `cariesDepthEnabled` (boolean, predvolené `true`)

**Špeciálne indikátory:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Opotrebenie zuba** (`wearEdge`, `wearCervical`; klinický typ na každé miesto, obmedzené na tooth-base + bez náhrady + prirodzený substrát):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Zafarbenie** (`discoloration`; príčina na každý zub, obmedzené na prirodzený tooth-base alebo mliečny zub + bez náhrady + prirodzený substrát):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Porucha výplne** (`fillingDefect`; na každú plochu, nález priamej náhrady nezávislý od sekundárneho kazu):
`none`, `marginal`, `fracture`, `wear`

**Ortodoncia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; na každý zub, obmedzené na prítomný prirodzený zub):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion`, `intrusion` — `orthoRotation`: boolean

**Nastavenia detailov zuba / notácie** (globálne nastavenia relácie, Nastavenia → Detaily zuba): `wearDetailLevel` a `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, predvolené `complex`) a `surfaceNotation` (`simple`/`full`, predvolené `full`)

### ⚙️ Nastavenia

Otvárané cez ikonu ozubeného kolieska na hornej lište (`SettingsModalComponent`); dialóg s uzamknutým fokusom, ARIA `dialog` so 7-záložkovým rozložením (Esc/klik mimo okna na zatvorenie, šípky na prepínanie záložiek). Dialóg je čistý pohľad nad `SettingsState` dodaným hostiteľom — sám žiadny stav nastavení nevlastní. Všetky nastavenia sú, pokiaľ nie je uvedené inak, iba stav rozhrania na úrovni relácie — žiadne z nich nemenia dáta jednotlivých zubov ani exportný payload.

- **Všeobecné:** systém číslovania (FDI/Universal/Palmer), jazyk, tmavá/svetlá téma, dostupnosť exportu podľa formátu (PNG/JPG/SVG/PDF — pri vypnutí skryje príslušnú položku ponuky Export a deaktivuje záložku Export, keď je PDF vypnuté), dostupnosť importu podľa zdroja (Status JSON/FHIR), systém kódovania diagnóz (žiadny / BNO-10 / ICD-10-CM) a voliteľný (opt-in) prepínač prekrytia SNOMED CT
- **Odontogram:** rozloženie na obrazovke — rozostup zubov, veľkosť čísla zuba, farba a štýl orámovania výberu; viditeľnosť panela informácií o zuboch; dostupnosť režimu Plán; profil anatómie zubov (`classic` predvolený / `measured` — deväť zubných šablón odmeraných podľa literatúry v rozložení dvoch oblúkov so šírkou na zub, prepínateľné za behu; jeho grafika je samostatná lenivo (lazy) načítavaná časť, ktorá sa načíta až pri prepnutí naň, takže predvolený `classic` nič naviac nestojí); viditeľnosť karty Stavy a karty Ortodoncia
- **Parodontálny graf:** prepínač dostupnosti, ktorý riadi zvyšok záložky a vstupné body parodontálneho grafu v shelli; režim zobrazenia parodontálneho grafu (`toggle`/`popup`); 16 prepínačov zobraziť/skryť pre jednotlivé indexy naprieč 5 skupinami (Vrecko: PD/GM/CAL/BOP · Hygiena: Plak/PI/GI · Mukogingválne: viditeľnosť CEJ/koreňová konkavita/KG/GT · Podpora: Furkácia/Mobilita/Millerova trieda · Peri-implantátové: mPI/mBI); režim zobrazenia názvov indexov preložené vs. kanonické (kanonický = pevný anglicko-latinský vedecký názov vo všetkých jazykoch rozhrania; tooltipy zostávajú vždy lokalizované)
- **Detaily zuba:** úroveň podrobnosti drene (simple/AAE/praktická latinčina, predvolené AAE), úroveň podrobnosti opotrebenia a úroveň podrobnosti zafarbenia (simple/complex, obe predvolene complex), notácia plôch (simple/full, predvolené full), prepínač poznámok ku každému zubu
- **Kaz:** prepínač skórovania ICDAS II, prepínač hĺbky kazu, podrobnosť kazu koreňa (simple/severity), podrobnosť sekundárneho kazu/CARS (simple/standard/full), podrobnosť rádiografickej hĺbky (off/threeLevel/detailed)
- **Výplne:** zložitosť výplne (complex/simple), prepínač nálezov poruchy výplne, dostupnosť podľa materiálu (amalgam/composite/gic/temporary), prepínač zapečatenia fisúr
- **Export:** kompletná konfigurácia PDF správy (`PdfSettings` — pozri [Export](#-export) nižšie) — deaktivovaná (vráti sa k obsahu záložky Všeobecné), kedykoľvek je export PDF v záložke Všeobecné vypnutý

### 🖼️ Systém SVG šablón

**Šablóny zubov** (v `projects/angular-advanced-odontogram/src/lib/core/assets/teeth-svgs/`):
| Šablóna | Zuby, ktoré ju používajú |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (rezáky) |
| `13.svg` | 13, 23, 33, 43 (špičáky) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (premoláre) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (moláre) |

Šablóny sú pre dolnú čeľusť otočené o 180 stupňov a pre ľavú stranu horizontálne zrkadlové. Paralelný podpriečinok `measured/` obsahuje deväť zubných šablón odmeraných podľa literatúry, ktoré profil anatómie `measured` vykresľuje v rozložení dvoch oblúkov so šírkou na zub (Nastavenia → Odontogram → anatómia zubov).

**Ikony SVG** (v `projects/angular-advanced-odontogram/src/lib/core/assets/icon-svgs/`):
`icon_8.svg` (múdrosť), `icon_gum.svg` (kosť), `icon_no_selection.svg` (zrušiť), `icon_occl.svg` (oklúzny pohľad), `icon_pulp.svg` (dreň)

Obidva priečinky sú skompilované do generovaných modulov TypeScript (`core/generated/teeth-svgs.ts`, `core/generated/icon-svgs.ts`) pomocou `npm run gen:assets` — spustite tento príkaz po úprave zdrojového SVG, aby vložené reťazce v balíku zostali synchronizované.

### 🔢 Systémy číslovania

**FDI (ISO 3950):** Trvalé zuby 11-18, 21-28, 31-38, 41-48. Mliečne zuby 51-55, 61-65, 71-75, 81-85. Hodnota: `"FDI"`.

**Universal (USA):** Trvalé zuby číslované 1-32. Mliečne zuby označené písmenami A-T. Hodnota: `"UNIVERSAL"`.

**Palmer (Zsigmondy-Palmer):** Formát kvadrant + pozícia (napr. UR-1, LL-5). Mliečne zuby používajú písmená A-E na kvadrant. Hodnota: `"PALMER"`.

`NumberingSystem` (`core/utils/numbering.ts`) je presne úniový typ `"FDI" | "UNIVERSAL" | "PALMER"`; exportovaná funkcia `toLabel(fdiTooth, system)` prevedie číslo zuba FDI na popisok požadovaného systému (napr. `toLabel(14, "PALMER")` → `"UR-4"`).

### 🚀 Použitie
Vývoj (spustí demo aplikáciu):
```bash
npm install
npm start           # ng serve
```
Zostavenie knižnice:
```bash
npm run build:styles && npx ng build angular-advanced-odontogram
```
Zostavenie demo aplikácie:
```bash
npm run build:demo
```

### 🔗 Integrácia
Komponent je možné vložiť do ľubovoľnej Angular aplikácie:
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

**Integrácia tmavého režimu:**
- **Samostatný režim:** Vynechajte `darkMode` — komponent spravuje vlastný stav témy cez prepínacie tlačidlo v hornej lište a pridáva/odstraňuje triedu `.dark` na koreňovom prvku hostiteľa.
- **Riadený režim:** Naviažte `[darkMode]` a `(darkModeChange)` — nadradená aplikácia riadi tému. Prepínacie tlačidlo sa stále zobrazuje, ale namiesto správy interného stavu vysiela `darkModeChange`. Nadradená aplikácia je zodpovedná za pridávanie/odstraňovanie triedy `.dark` na `<html>`.

**Vlastná téma:**
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

**Integrácia pluginu:**
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

Výstup `renderSvg()` pluginu je pred vložením do živého grafu sanitizovaný knižnicou DOMPurify (SVG profil) — pozri [Bezpečnostné poznámky](#-bezpečnostné-poznámky).

### 🧪 Testovanie

Testovacia sada je rozdelená na **dva behy (runnery)** a obidva musia prejsť (`npm test` spustí obidva, v poradí):

```bash
npm run test:corpus   # plain Vitest — the shared clinical-engine core
npm run test:ng       # Angular's Vitest builder — the Angular shell (ng test)
npm test              # both, in order
npm run test:watch    # watch mode (corpus runner)
```

- **`test:corpus`** (`vitest run`) preveruje `projects/angular-advanced-odontogram/src/lib/core/` — zdieľané jadro klinického enginu — oproti portovanému testovaciemu korpusu (100+ súborov so špecifikáciami pod `core/__tests__/`). Tu žijú **zlaté (golden) fixture** pre vykresľovanie SVG, export FHIR a obojsmerný prevod JSON, kontrolované bajt po bajte: `parity/svg-fingerprints.json`, `parity/fhir-golden.json`, `parity/roundtrip-golden.json`, `parity/shell-dom-golden.html`.
- **`test:ng`** (`ng test angular-advanced-odontogram --watch=false`, integrácia Vitest v `@angular/build:unit-test` Angularu) spúšťa vlastné špecifikácie `*.spec.ts` shellu Angular — komponenty, služby, direktívy — a overuje paritu DOM: shell vykresľuje rovnaké id, triedy a značkovanie ako pôvodné React komponenty.

Keďže integrácia Vitest tohto builderu nepodporuje `vi.mock()`/`vi.spyOn()` na mockovanie modulov cez relatívnu cestu, stranové efekty dotýkajúce sa DOM (`initOdontogram`/`destroyOdontogram`, `exportPdf`) sú namiesto toho prepísané cez injekčné tokeny `ODONTOGRAM_ENGINE_LIFECYCLE`/`EXPORT_PDF_FN` a pole poskytovateľov Angular `TestBed` — pozri [DI body na testovanie hostiteľskej aplikácie](#-použitie-ako-npm-balík) vyššie.

### 📖 Dokumentácia API
```bash
npm run docs           # Generate TypeDoc docs in docs/api/
```
Zdieľané API klinického enginu je zdokumentované aj v pôvodnom projekte:

📚 **https://zoliqua.github.io/React-Advanced-Odontogram/**

### 📡 Verejné API

**Vstupy/výstupy komponentu:** pozri [Vstupy komponentu](#-použitie-ako-npm-balík) vyššie pre úplnú tabuľku.

**Exportované funkcie pre externú kontrolu** (kurátorovaná podmnožina — úplný, typovaný rozsah je v priložených `.d.ts`):

| Funkcia | Popis |
|---|---|
| `initOdontogram()` / `destroyOdontogram()` | Inicializovať/vyčistiť engine (interne volané cez `OdontogramShellComponent`/`OdontogramUiService` prostredníctvom tokenu `ODONTOGRAM_ENGINE_LIFECYCLE`) |
| `setNumberingSystem(system)` | Prepínanie medzi FDI, UNIVERSAL, PALMER |
| `clearSelection()` | Zrušiť výber všetkých zubov |
| `getSelectedTeeth()` | Aktuálne vybrané zuby (čísla FDI), v poradí výberu |
| `registerPlugins(plugins)` | Registrovať vlastné SVG pluginy |
| `setPluginState(toothNo, pluginId, value)` / `getPluginState(toothNo, pluginId)` | Nastaviť/získať vlastný stav pluginu pre zub |
| `getToothStateSummary(toothNo)` | Získať lokalizovaný súhrn všetkých aktívnych stavov |
| `getOdontogramSummary()` | Získať štruktúrovaný, lokalizovaný textový súhrn celého grafu (počty, sekcie, plánované zmeny) |
| `onStateChange(callback)` | Prihlásiť sa na odber zmien stavu; vracia funkciu na odhlásenie |
| `setReadOnly(value)` / `getReadOnly()` | Povoliť/zakázať / zistiť režim iba na čítanie |
| `setNotesEnabled(value)` / `getNotesEnabled()` | Povoliť/zakázať / zistiť poznámky ku každému zubu |
| `setPulpDetailLevel(level)` / `getPulpDetailLevel()` | Nastaviť/získať slovník výberu drene — `"simple"`, `"aae"` alebo `"latin"` |
| `getToothAnatomy()` / `setToothAnatomy(v)` | Získať/nastaviť profil anatómie zubov — `"classic"` alebo `"measured"` |
| `getChartMode()` / `setChartMode(mode)` | Získať/prepnúť aktívny graf — `"status"` alebo `"plan"` (graf plánu sa pri prvom vstupe hĺbkovo skopíruje zo stavu) |
| `getStatusChart()` / `getPlanChart()` / `setPlanChart(payload)` | Čítať payload grafu stavu/plánu nezávisle od aktívneho grafu, alebo nahradiť zuby grafu plánu |
| `getPlanChanges()` | Získať štruktúrovaný rozdiel stav→plán (`{ toothNo, axis, from, to }[]`) |
| `setPerioSite(toothNo, site, patch)` / `getToothPerio(toothNo)` | Nastaviť/získať parodontálne údaje pre jedno zo šiestich miest (`patch` = `{ pd?, gm?, bop?, sup? }`) |
| `getToothCal(toothNo)` | Získať odvodenú CAL pre jednotlivé miesta daného zuba |
| `getPerioSummary()` | Súhrnné parodontálne údaje za celé ústa: počet zaznamenaných miest, počet krvácajúcich miest, %BOP, najhoršia CAL, max. PD |
| `getPerioChart()` | Získať parodontálne záznamy aktívneho grafu pre jednotlivé zuby |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Programové otvorenie/zatvorenie/zistenie stavu prekrytia parodontálneho grafu |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Získať/nastaviť spôsob zobrazenia parodontálneho grafu — `"toggle"` alebo `"popup"` |
| `getPerioClassification()` | Získať parodontálnu klasifikáciu podľa 2017 World Workshop (`{diagnosis, stage, grade, extent, derived, overridden}`) |
| `setDiagnosisOverride(v)` / `setStageOverride(v)` / `setGradeOverride(v)` / `setExtentOverride(v)` | Prepísať odvodenú os parodontálnej klasifikácie, alebo `null` na návrat k odvodenej hodnote |
| `getCaseMeta()` / `resetCaseMeta()` | Získať/resetovať objekt metadát na úrovni prípadu (vek, fajčiarsky/diabetický stav, identita pacienta, dátum vyšetrenia, …) |
| `setPatientName(v)` / `setPatientDob(v)` / `setExamDate(v)` | Nastaviť identifikačné polia prípadu (iba hlavička PDF správy — nikdy nie sú súčasťou exportu FHIR) |
| `getToothDiagnoses(toothNo)` | Získať diagnózy zuba kódované podľa ICD-10, odvodené pravidlami klinických osí |
| `getActiveDiagnoses()` | Získať efektívne riadky diagnóz (odvodené − potlačené + pridané) pre aktuálne vybraný zub, plus katalóg diagnóz, ktoré možno pridať — view-model komponentu `DiagnosesCardComponent` |
| `addDiagnosisToSelection(key)` / `removeDiagnosisFromSelection(key)` | Pridať/odstrániť diagnózu pre aktuálny výber zubov zápisom jej podkladového nálezu v grafe |
| `setDxOverrideForSelection(key, mode)` | Vynútiť prepísanie diagnózy pre aktuálny výber — `"add"`, `"suppress"`, alebo `null` na zrušenie |
| `getDiagnosisCodingPack()` / `setDiagnosisCodingPack(id)` | Získať/nastaviť národné prekrytie kódovacieho balíčka nad WHO ICD-10 — `"none"`, `"bno10"` (maďarské názvy NEAK) alebo `"icd10cm"` (USA) |
| `getSnomedEnabled()` / `setSnomedEnabled(v)` | Získať/nastaviť voliteľné (opt-in) prekrytie kódovania SNOMED CT |
| `getCaseConditions()` / `setCaseCondition(key, laterality)` | Získať/nastaviť diagnózy prípadu/regionálne diagnózy za celé ústa (malokluzia a TMJ, cysty dutiny ústnej, ochorenie slinných žliaz, stomatitída a sliznica dutiny ústnej, vývojové anomálie na úrovni oblúka), každú s lateralitou — `null` zruší, alebo `"left"`/`"right"`/`"bilateral"` |
| `exportFhir(options?)` | Exportovať graf ako kolekciu HL7 FHIR R4 Bundle (stiahnutie JSON); voliteľná referencia `{ subject }` |
| `importFhirBundle(input)` | Importovať FHIR R4 Bundle (objekt alebo reťazec JSON) produkovaný týmto modulom |
| `exportImage(format)` | Stiahnuť graf ako obrázok — `"png"` alebo `"jpg"` |
| `exportSvg()` | Stiahnuť graf ako škálovateľný SVG (vektor) |
| `hasAnyPerioData()` | `true`, ak je v ústach kdekoľvek zaznamenaná aspoň jedna parodontálna os |
| `exportPerioSvg()` / `exportPerioImage(format)` | Stiahnuť celý parodontálny graf ako samostatný vektorový SVG alebo rastrovaný obrázok |
| `exportPdf(opts)` | Stiahnuť PDF správu natívne cez jsPDF (pozri [Export](#-export) nižšie) |
| `getPdfSettings()` / `setPdfSettings(patch)` | Získať/upraviť konfiguráciu PDF správy (`PdfSettings`) |
| `exportStatus()` | Stiahnuť graf stavu ako JSON |
| `importStatus(data)` | Hydratovať engine z predtým exportovaného payloadu JSON (pozri [Formát exportu/importu stavu](#-formát-exportuimportu-stavu)) |
| `setImportFormat(format)` | Nastaviť analyzátor pre nasledujúci import súboru — `"status"` alebo `"fhir"` |
| `startIntroTour()` | Spustiť interaktívnu úvodnú prehliadku |

### 💾 Perzistencia stavu (localStorage)

Voliteľná (opt-in) perzistencia stavu prípadu odontogramu v `localStorage` (`core/persistence.ts`, reexportované z hlavného vstupného bodu balíka). Predvolene vypnutá — existujúce integrácie nie sú ovplyvnené, pokiaľ ju hostiteľská aplikácia explicitne nezapne, a mala by sa volať **až po** pripojení odontogramu (napr. z `ngAfterViewInit()` komponentu, po tom, čo `OdontogramShellComponent`/`OdontogramUiService` zavolal `init()` — obnova prekreslí živý DOM cez `importStatus()`):

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

| Funkcia | Popis |
|---|---|
| `enablePersistence(options?)` | Obnoví predtým uložený prípad (ak existuje) cez `importStatus()`, potom pri každej ustálenej zmene stavu uloží stavový graf do `localStorage` (úpravy sú zoskupené a oneskorené o ~400 ms, tzv. „debouncing", takže séria rýchlo po sebe idúcich zmien — napr. stavová predvoľba — vyprodukuje jeden zápis). Idempotentné — opätovné volanie nahradí predchádzajúci odber/možnosti. **Musí sa volať až po pripojení odontogramu.** |
| `disablePersistence()` | Zastaví perzistenciu (najprv odošle akékoľvek čakajúce oneskorené uloženie); uložená položka zostáva zachovaná. |
| `clearPersistedState()` | Odstráni uloženú položku pre aktívny (alebo predvolený) kľúč. |
| `isPersistenceEnabled()` | `true`, kým je aktívny odber zmien stavu. |

**`PersistenceOptions`:**

| Pole | Typ | Predvolená hodnota | Popis |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | Kľúč v `localStorage` — ide o vlastnú literálnu predvolenú hodnotu zdieľaného jadrového modulu (nezmenenú Angular portom); odovzdajte vlastný `key`, aby ste sa vyhli kolízii s integráciou na React strane na tej istej doméne, alebo pre oddelenie viacerých hostiteľov do samostatných menných priestorov. |
| `includePlan` | `boolean` | `false` | Uložiť aj graf plánu (pole `plan` v payloade). |
| `onError` | `(err: Error) => void` | — | Volané pri akejkoľvek chybe ukladania/parsovania namiesto `console.warn`. |

Poznámky: pokiaľ nie je zavolané `enablePersistence()`, do `localStorage` sa nič nezapisuje ani z neho nečíta; limit veľkosti 4 MB preskočí príliš veľké uloženie (nahlásené cez `onError`/`console.warn`) namiesto vyhodenia výnimky; každá chyba ukladania/JSON — prekročená kvóta, uzamknutý iframe, poškodené alebo nerozpoznané uložené dáta atď. — je zachytená a nahlásená. Tento modul nikdy nevyhadzuje výnimku.

Poznámka: zapnutie perzistencie obnoví uložený prípad cez `importStatus()`, čím sa nahradí aktuálny prípad — vrátane rozpracovaného grafu plánu, ak uložený payload žiadny neobsahuje. Zapnite perzistenciu pri štarte (hneď po pripojení), nie uprostred relácie.

Poznámka: uložený payload môže obsahovať identifikačné údaje pacienta (meno pacienta, dátum vyšetrenia) v čistom texte v `localStorage`. Ak zaznamenávate takéto údaje, zabezpečte ochranu na úrovni zariadenia alebo ich podľa potreby vymažte pomocou `clearPersistedState()`.

### 💾 Formát exportu/importu stavu
Export vytvorí súbor JSON (verzia `2.22`; import tiež akceptuje staršie verzie `1.4` a `2.0` až `2.21` a automaticky ich migruje) obsahujúci:

**Globálne polia:**
- `wisdomVisible` - zuby múdrosti viditeľné
- `showBase` - vrstva kosti viditeľná
- `occlusalVisible` - oklúzny pohľad aktívny
- `showHealthyPulp` - zdravá dreň viditeľná
- `edentulous` - bezzubý režim aktívny

**Polia pre každý zub (32 zubov):**
- `toothSelection` - základný typ zuba
- `toothSubstrate` - substrát zuba (natural/radix/broken/crownprep), nezávislý od akejkoľvek náhrady
- `restorationType` - typ náhrady (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - materiál náhrady (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), spárovaný s `restorationType`
- `prosthesis` - os snímateľnej protetiky/upevnenia (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), navzájom sa vylučuje s pevným `restorationType` typu korunka/mostík
- `crownLeakage` - príznak okrajovej netesnosti korunky, zmysluplný iba keď je `restorationType` typu korunka alebo mostík
- `endo` - endodontický stav; navzájom sa vylučuje s `pulpDx`
- `mods` - pole modifikácií (zápal, parodontálny); `inflammation` sa vzťahuje iba na chýbajúce zuby/zuby s extrakčnou ranou
- `caries` - aktívne plochy kazu
- `cariesActiveDepth` - hodnota hĺbky ICDAS pripravená výberom hĺbky kazu pri aplikovaní novej plochy
- `rootCaries` - závažnosť kazu koreňa (none/active/arrested/active-cavitated)
- `cariesSeverity` - zjednotená závažnosť na každú plochu (0-6): hĺbka ICDAS na primárnej (bez výplne) ploche, skóre CARS na rekurentnej (s výplňou) ploche
- `radiographicDepth` - rádiografická hĺbka kazu na každú plochu (none/E1/E2/D1/D2/D3), nezávislá od vizuálnej škály ICDAS/CARS
- `fillingMaterial` - materiál výplne
- `fillingSurfaces` - plombované plochy
- `fillingSurfaceMaterials` - materiál výplne pre každú plochu (zmiešané výplne, napr. bukálny amalgám + distálny kompozit)
- `fillingDefect` - porucha výplne pre každú plochu (none/marginal/fracture/wear), obmedzená na plombované plochy, nezávislá od sekundárneho kazu
- `pulpDx` - AAE diagnóza drene (normal/reversible-pulpitis/irreversible-pulpitis/necrosis)
- `pulpLatin` - praktický latinský podtyp drene (zobrazený vo výbere drene iba keď je `pulpDetailLevel` nastavené na `latin`)
- `apicalDx` - apikálna diagnóza určujúca periapikálny glyf
- `periapicalType` - podtyp periapikálnej lézie (none/granuloma/cyst); staršia hodnota `abscess` je pri importe stále akceptovaná
- `resorptionType` - typ resorpcie koreňa (none/internal/external-cervical)
- `periImplant` - stav peri-implantátu iba pre implantáty (none/mucositis/peri-implantitis-mild/-moderate/-severe), stagingovanie podľa 2018 World Workshop
- `dxOverrides` - prepísania diagnostického kódovania pre každý zub (verzia 2.21): objekt kľúčovaný diagnostickým kľúčom ICD-10 → `add` | `suppress`, ktorý vynúti zapnutie kódovanej diagnózy napriek chýbajúcemu zodpovedajúcemu nálezu v grafe, alebo jej vypnutie napriek existujúcemu; formuje efektívnu kódovanú sadu exportovanú ako FHIR `Condition`
- `endoResection` - príznak apikektómie
- `fissureSealing` - príznak zapečatenia fisúr
- `calculus` - príznak zubného kameňa
- `contactMesial` / `contactDistal` - strata meziálneho/distálneho kontaktného bodu
- `wearEdge` - typ incizálneho/oklúzneho opotrebenia (none/attrition/erosion)
- `wearCervical` - typ cervikálneho opotrebenia (none/abrasion/abfraction/erosion)
- `discoloration` - príčina zafarbenia zuba pre každý zub (none/tetracycline/fluorosis/nonvital/extrinsic/other)
- `orthoAppliance` - ortodontická pomôcka (none/bracket/band)
- `orthoDrift` - ortodontický drift (none/mesial/distal)
- `orthoVertical` - ortodontický vertikálny pohyb (none/extrusion/intrusion)
- `orthoRotation` - príznak ortodontickej rotácie
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - miesta zlomenín
- `extractionWound` - poextrakčná rana
- `extractionPlan` - plánovaná extrakcia
- `parapulpalPin` - príznak parapulpálneho kolíka
- `bridgePillar` - pilierový zub mostíka
- `mobility` - stupeň mobility (none/m1/m2/m3)
- `crownNeeded` - indikátor potreby korunky
- `crownReplace` - indikátor potreby výmeny korunky
- `missingClosed` - uzavretá medzera po extrakcii
- `customStates` - vlastné stavy pluginov (objekt, kľúčovaný ID pluginu)
- `note` - textová poznámka ku každému zubu (reťazec, voliteľný — prítomný iba keď nie je prázdny)

**Pole `plan` na najvyššej úrovni (verzia 2.11+):**
- `plan` - voliteľný objekt s rovnakým tvarom ako `teeth` (polia pre každý zub vyššie), obsahujúci graf **plánu** (zamýšľaný stav po ošetrení). Prítomný iba vtedy, keď bol graf plánu inicializovaný A jeho obsah sa líši od grafu stavu. Pri importe chýbajúce `plan` vymaže/zruší inicializáciu grafu plánu; prítomné `plan` obnoví graf plánu popri stave. Je možné ho čítať/zapisovať aj nezávisle cez `getPlanChart()`/`setPlanChart()`.

**Pole `case` na najvyššej úrovni (verzia 2.17+, rozšírené vo verziách 2.18, 2.19, 2.20 a 2.22):**
- `case` - voliteľný objekt s metadátami na úrovni prípadu (nie na úrovni zuba), zdieľaný grafom stavu aj plánu. Vynechaný, keď je prázdny. Polia (každé vynechané pri predvolenej hodnote): `age`; `smokingStatus` (+ `cigarettesPerDay`); `diabetesStatus` (+ `hba1c`); `toothLossPerio`; `maxRblPercent`; štyri klinické prepísania podľa jednotlivých osí klasifikácie 2017 `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`; `patientName` / `examDate`; `patientDob`; a (verzia 2.22) `caseConditions` — diagnózy prípadu/regionálne diagnózy (malokluzia a TMJ K07, cysty dutiny ústnej K09, ochorenie slinných žliaz K11, stomatitída a sliznica dutiny ústnej K12/K13, vývojové anomálie na úrovni oblúka K00), každá priradená k lateralite (nešpecifikovaná/vľavo/vpravo/obojstranne). Čítaný/zapisovaný cez `getCaseMeta()`/`getCaseConditions()` a settery `set*`/`setCaseCondition()` vyššie. Meno pacienta, dátum narodenia a dátum vyšetrenia sú iba identifikačné metadáta grafu — **nie sú** súčasťou exportu FHIR.

### 🖨️ Export
`exportFhir()` je bez chýb validátora HL7: každá položka Bundle nesie deterministické `id` a absolútnu `fullUrl` (bez zástupných `urn:uuid`) a Bundle vkladá vlastný CodeSystem enginu, aby sa jeho lokálne kódy pri validácii dali vyriešiť (publikovaný aj pod `projects/angular-advanced-odontogram/src/lib/fhir/`; odovzdaním `includeCodeSystem: false` ho možno vynechať).

Parodontálne dáta sa teraz obojsmerne prenášajú aj cez import FHIR, nielen cez JSON payload: `importFhirBundle()` načíta parodontálne panely LOINC `74029-0` späť do parodontálneho záznamu každého zuba — hĺbku sondáže, gingiválny okraj (rekonštruovaný z CAL, takže pseudovačkové hodnoty sa zachovajú), BOP, furkáciu, plak O'Leary, indexy PI/GI a implantátové mPI/mBI a šírku keratinizovanej gingívy — plus dôkazové Observations fajčiarskeho stavu a HbA1c na úrovni prípadu. Supurácia je jedinou výnimkou: zostáva iba v JSON, keďže nie je súčasťou exportu FHIR.

Okrem vlastného exportu odontogramu Stav JSON / FHIR / PNG / JPG / SVG má **parodontálny graf** vlastnú exportnú cestu:
- **Parodontálny SVG/PNG/JPG:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` vykresľujú celý parodontálny graf ako jeden samostatný vektorový SVG, nezávisle od pripojeného DOM komponentu `PerioChartComponent`. Deaktivované, kedykoľvek je `hasAnyPerioData()` false.
- **PDF správa:** položka „Správa PDF…" v exportnej ponuke otvorí `ExportOptionsModalComponent` — nastavovací dialóg (polia mena pacienta + dátumu narodenia + dátumu vyšetrenia, priamo prepojené s metadátami prípadu, pričom dátum vyšetrenia je predvolene nastavený na dnešný deň; zaškrtávacie políčka sekcií: údaje pacienta, graf odontogramu, popis odontogramu, individuálne poznámky — deaktivované, ak žiadny zub nemá poznámku — parodontálny stav, parodontálny popis) pred volaním `exportPdf(opts)` cez injekčný token `EXPORT_PDF_FN`. Prázdne identifikačné polia sa vrátia k zástupným hodnotám (`"John Doe"` / `"1980-01-01"`, konfigurovateľným cez `PdfSettings.defaultName`/`defaultDob`), takže export vždy prebehne úspešne. PDF sa zostavuje natívne cez jsPDF — vektorový text cez `.text()`, rastrové obrázky zuba/parodontálneho grafu cez `.addImage()` — bez závislosti na `svg2pdf.js`. Sekcia individuálnych poznámok sa automaticky preskočí, keď žiadny zub nemá poznámku, a obe parodontálne sekcie sa preskočia, keď je `hasAnyPerioData()` false, bez ohľadu na zaškrtávacie políčka dialógu.
- **Konfigurácia správy (`PdfSettings`, Nastavenia → záložka Export, získanie/nastavenie cez `getPdfSettings()`/`setPdfSettings(patch)`):** predvolené meno/dátum narodenia pacienta, či zobraziť vek, formát dátumu (ISO/DMY/MDY), farebná téma (blue/teal/amber/slate), viditeľnosť kosti/drene odontogramu, rozostup zubov/orámovanie/veľkosť čísla zuba na obrázku grafu, či zahrnúť textový popis a tabuľku nálezov, zodpovedajúce možnosti rozostupu/umiestnenia popiskov/veľkosti písma parodontálneho grafu a či zahrnúť tabuľku parodontálnych metrík a glosár skratiek, lekárske upozornenie (predvolený alebo vlastný text), pečiatku generátora/verzie a zoskupenie súhrnu chrupu (celé ústa / čeľusť / kvadrant / sextant — riadi aj tabuľku panela informácií o zuboch na obrazovke).
- **Obmedzenie mPI/mBI na implantáty:** peri-implantátové Mombelliho indexy (mPI/mBI) sa vykresľujú ako riadky iba v oblúku, ktorý obsahuje aspoň jeden implantátový zub — platí to pre živý parodontálny graf aj pre exporty SVG/PDF.
- Meno pacienta, dátum narodenia a dátum vyšetrenia sú iba identifikačné metadáta grafu (payload `2.20`, doplnkové) — **nie sú** súčasťou exportu FHIR.

### 📁 Štruktúra priečinkov
- `projects/angular-advanced-odontogram/src/public-api.ts` - verejný vstupný bod balíka (odtiaľto sú reexportované všetky exporty)
- `projects/angular-advanced-odontogram/src/lib/core/odontogram.ts` - klinický engine nezávislý od frameworku: SVG vrstvenie, správa stavu zubov, dotykové interakcie, prekrytia pluginov, nastavenia, export/import
- `projects/angular-advanced-odontogram/src/lib/core/persistence.ts` - voliteľná (opt-in) perzistencia v localStorage
- `projects/angular-advanced-odontogram/src/lib/core/theme.ts` - typ `OdontogramThemeConfig` a pomôcka `applyThemeConfig()`
- `projects/angular-advanced-odontogram/src/lib/core/plugin.ts` - typ `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, priority z-indexu `LAYER_Z`
- `projects/angular-advanced-odontogram/src/lib/core/pluginSanitize.ts` - `sanitizePluginSvg()`, sanitizátor postavený na DOMPurify, cez ktorý prechádza výstup `renderSvg()` pluginu pred vložením do živého grafu
- `projects/angular-advanced-odontogram/src/lib/core/tour.ts` - sprievodná úvodná prehliadka
- `projects/angular-advanced-odontogram/src/lib/core/perioClassification.ts` - odvodenie parodontálnej klasifikácie 2017 World Workshop
- `projects/angular-advanced-odontogram/src/lib/core/perioExport.ts` / `perioGraphic.ts` / `perioIndexNames.ts` - SVG vykresľovanie parodontálneho grafu za celé ústa
- `projects/angular-advanced-odontogram/src/lib/core/perioPdf.ts` - čistý zostavovač PDF správy postavený na jsPDF (`assemblePdf`)
- `projects/angular-advanced-odontogram/src/lib/core/status_extras.ts` - 22 preddefinovaných šablón reštaurácií
- `projects/angular-advanced-odontogram/src/lib/core/i18n/` - preklady, po jednom lenivo (lazy) načítavanom module na jazyk pod `i18n/locales/` (angličtina statická, ostatných 11 sa načíta cez `i18n/loader.ts` pri prvom použití) a zbernica i18n nezávislá od frameworku
- `projects/angular-advanced-odontogram/src/lib/core/dx/` - diagnostické kódovanie podľa štandardov: pravidlá odvodenia (`derive.ts`), katalóg diagnóz ICD-10 (`codes.ts`/`caseCodes.ts`), národné kódovacie balíčky — BNO-10/ICD-10-CM (`packs.ts`) — a vrstva spresnenia ICD-10-CM/SNOMED CT (`refine.ts`)
- `projects/angular-advanced-odontogram/src/lib/core/anatomy/` - profily anatómie zubov (`classic`/`measured`); literatúrou odmerané šablóny `measured` (`measured.ts`) sa načítavajú ako samostatná lenivá (lazy) časť
- `projects/angular-advanced-odontogram/src/lib/core/utils/numbering.ts` - konverzia číslovania FDI, Universal, Palmer
- `projects/angular-advanced-odontogram/src/lib/core/registry/` - deklaratívny register klinických osí: mapovania polí FHIR, aktivácia SVG-clear-set/boolean príznakov, matica typ×materiál náhrady, zoznamy možností rozhrania
- `projects/angular-advanced-odontogram/src/lib/core/fhir/` - export/import HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, `toFhirDx.ts`/`importConditions.ts` (diagnostické Conditions), `importPerio.ts` (parodontálne Observations), systémy kódov, mapovania polí, primitíva
- `projects/angular-advanced-odontogram/src/lib/fhir/` - publikovaný `CodeSystem-odontogram.json` plus generovaná sada `ValueSet-odontogram-*.json` (jedna pre každú skupinu hodnôt klinickej osi, jedna pre typy nálezov, jedna pre všetky kódy)
- `projects/angular-advanced-odontogram/src/lib/core/bridgeOverlay.ts` - prekrytie konektora viaczubového mostíkového úseku
- `projects/angular-advanced-odontogram/src/lib/core/fonts/` - vložené Unicode fonty pre PDF (tvarovanie arabčiny, CJK) + loader fontov
- `projects/angular-advanced-odontogram/src/lib/core/assets/` - zdrojové súbory SVG zubov/ikon (`teeth-svgs/`, `teeth-svgs/measured/`, `icon-svgs/`)
- `projects/angular-advanced-odontogram/src/lib/core/generated/` - SVG skompilované do vložených modulov TypeScript (`npm run gen:assets`)
- `projects/angular-advanced-odontogram/src/lib/core/__tests__/` + `registry/__tests__/` - portovaný testovací korpus, vrátane zlatých (golden) fixture v `parity/`
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/` - `OdontogramShellComponent`, shell všetko v jednom
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-ui.service.ts` - `OdontogramUiService`, vrstva stavu/efektov skladateľného rozhrania
- `projects/angular-advanced-odontogram/src/lib/components/engine-state.ts` - pomôcka signálu `engineState()`
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-engine-lifecycle.ts` - injekčný token `ODONTOGRAM_ENGINE_LIFECYCLE`
- `projects/angular-advanced-odontogram/src/lib/components/surfaces/` - štyri prezentačné povrchy (horná lišta, graf, informácie o zube, ovládacie prvky zuba) a pod `surfaces/cards/` osem deklaratívnych ovládacích kariet (vrátane `DiagnosesCardComponent`)
- `projects/angular-advanced-odontogram/src/lib/components/settings-modal/` - `SettingsModalComponent` (7-záložkový dialóg nastavení)
- `projects/angular-advanced-odontogram/src/lib/components/export-options-modal/` - `ExportOptionsModalComponent` a injekčný token `EXPORT_PDF_FN`
- `projects/angular-advanced-odontogram/src/lib/components/credits-modal/` - `CreditsModalComponent`
- `projects/angular-advanced-odontogram/src/lib/components/case-diagnoses-modal/` - `CaseDiagnosesModalComponent`, vyskakovacie okno diagnóz za celé ústa/oblasť
- `projects/angular-advanced-odontogram/src/lib/components/perio-chart/` / `perio-sidebar/` - samostatný/vložený parodontálny graf a jeho kontextový bočný panel
- `projects/angular-advanced-odontogram/src/lib/components/dual-state-confirm/` - zdieľaný potvrdzovací dialóg (úpravy ovplyvňujúce stav↔plán)
- `projects/angular-advanced-odontogram/src/lib/components/shared/dialog-focus.ts` - zdieľané pomôcky pre uzamknutie/obnovenie fokusu modálneho okna
- `projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.ts` - `I18nService`, reaktívna Angular fasáda nad jadrovou zbernicou i18n
- `projects/demo/` - demo Angular aplikácia (`ng serve` / `npm run build:demo`)
- `scripts/generate-svg-assets.mjs` - generátor pre `npm run gen:assets`

### ⚙️ Technologický zásobník
- Angular 21 (samostatné komponenty, signály) + Angular CLI (`@angular/build`) + TypeScript
- `ng-packagr` pre zostavenie knižnice (`ng build angular-advanced-odontogram`)
- Tailwind CSS pre štýlovanie rozhrania, skompilovaný raz do statického hárku štýlov (`npm run build:styles` → `projects/angular-advanced-odontogram/styles.css`) — konzumenti registrujú tento hárok štýlov, sami Tailwind nespúšťajú
- Vrstvenie SVG cez manipuláciu DOM v jadre nezávislom od frameworku (stav nereaktívny cez Angular kvôli výkonu — rovnaký engine, aký používa pôvodný React projekt)
- Odľahčený, na frameworku nezávislý vlastný systém i18n (`core/i18n/`), obalený `I18nService` pre reaktívne naväzovanie na Angular šablóny
- Dvojica testovacích behov: čistý Vitest pre jadrový korpus (`vitest run`), Angularova integrácia Vitest v `@angular/build:unit-test` pre špecifikácie komponentov (`ng test`); `@testing-library/jest-dom` pre DOM matchers
- TypeDoc pre dokumentáciu API (`npm run docs`, výstup `docs/api/`)
- jsPDF pre PDF správu; DOMPurify pre sanitizáciu výstupu pluginov

### 📝 Poznámky
- SVG šablóny a ikony sú pri zostavení skompilované do generovaných modulov TypeScript (`npm run gen:assets`) — nie je potrebné žiadne získavanie zdrojov za behu a nič netreba obsluhovať z verejného priečinka.
- Engine odontogramu používa vlastný interný stav nezávislý od frameworku (nie Angular signály) pre SVG mriežku, kvôli výkonu a aby zostal identický s pôvodným React projektom; Angular komponenty ho čítajú reaktívne cez `engineState()`/`I18nService`/`onStateChange()` namiesto toho, aby ho vlastnili samy.
- Mliečne zuby majú obmedzenú sadu dostupných materiálov (žiadne amalgámové výplne, žiadne endodontické kolíky).
- Implantátové zuby majú inú sadu možností korunky/abutmentu ako prirodzené zuby.

### 🔒 Bezpečnostné poznámky

- **Pluginy bežia ako dôveryhodný kód.** Návratová hodnota `renderSvg()` pluginu sa vkladá do SVG živého grafu. Tento výstup je pred vložením sanitizovaný knižnicou [DOMPurify](https://github.com/cure53/DOMPurify) (SVG profil plus `svgFilters`) — `<script>`, `<iframe>`, `<object>`, `<embed>` a `<foreignObject>` sú úplne zakázané a úplne škodlivý výstup je zahodený namiesto čiastočného vykreslenia. Toto znižuje dosah kompromitovaného alebo chybného pluginu, no pluginy by sa mali naďalej načítavať iba zo zdrojov, ktorým dôverujete — sanitizácia je poistka, nie náhrada za preverenie.
- **Content-Security-Policy.** Tento balík pri vložení ako knižnica nevkladá vlastnú CSP. Hostiteľské aplikácie vykresľujúce `OdontogramShellComponent` by si mali nastaviť vlastnú CSP zodpovedajúcu ich nasadeniu; rozumným základom je politika zrkadliaca demo pôvodného React projektu:

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

### 📖 Ako citovať

Tento balík nemá vlastný citačný záznam — ide o port, ktorý zdieľa svoj klinický engine doslovne s pôvodným projektom. Ak toto softvérové dielo použijete vo výskume, prosím, citujte pôvodný projekt:

> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Všetky verzie (konceptové DOI):** https://doi.org/10.5281/zenodo.21156787

Strojovo čitateľné citačné metadáta sú v súbore [`CITATION.cff`](https://github.com/ZoliQua/React-Advanced-Odontogram/blob/main/CITATION.cff) pôvodného projektu.

## 🙌 Poďakovanie

Angular Advanced Odontogram vytvára a spravuje Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), tvorca a hlavný vývojár tohto portu aj podkladového klinického enginu. Rovnaké vyskakovacie okno v aplikácii (horná lišta → „O aplikácii a poďakovania") uvádza tie isté mená.

**Pôvodný projekt**

- [React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram) (npm: [`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)): pôvodná React implementácia, ktorej je tento balík portom — klinický engine (logika zubného statusu, parodontálne zaznamenávanie, diagnostické kódovanie, export/import FHIR, i18n reťazce, prehliadka, SVG šablóny) je zdieľaný doslovne.

**Vytvorené pomocou** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [Angular](https://angular.dev), [Angular CLI](https://angular.dev/tools/cli), [TypeScript](https://www.typescriptlang.org) a [Tailwind CSS](https://tailwindcss.com).

Príspevky sú vítané — pozri [`CONTRIBUTING.md`](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/CONTRIBUTING.md). Ak je pre vás tento projekt užitočný, [pridajte mu hviezdu na GitHub](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
