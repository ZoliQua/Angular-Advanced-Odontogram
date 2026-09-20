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

> 🌐 **Languages:** 🇬🇧 [English](README-en.md) | 🇭🇺 [Magyar](README-hu.md) | 🇩🇪 [Deutsch](README-de.md) | 🇪🇸 [Español](README-es.md) | 🇫🇷 [Français](README-fr.md) | 🇮🇹 [Italiano](README-it.md) | 🇵🇱 Polski (ten plik) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇷🇺 [Русский](README-ru.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md)

---

## 📑 Spis treści

- [📋 Przegląd](#-przegląd)
- [📦 Użycie jako pakiet npm](#-użycie-jako-pakiet-npm)
- [✨ Kluczowe funkcje](#-kluczowe-funkcje)
- [📦 Moduły](#-moduły)
- [🛠️ Kontrolki interfejsu](#-kontrolki-interfejsu)
- [🦷 Typy zębów i stany](#-typy-zębów-i-stany)
- [⚙️ Ustawienia](#-ustawienia)
- [🖼️ System szablonów SVG](#-system-szablonów-svg)
- [🔢 Systemy numeracji](#-systemy-numeracji)
- [🚀 Użycie](#-użycie)
- [🔗 Integracja](#-integracja)
- [🧪 Testowanie](#-testowanie)
- [📖 Dokumentacja API](#-dokumentacja-api)
- [📡 Publiczne API](#-publiczne-api)
- [💾 Trwałość stanu (localStorage)](#-trwałość-stanu-localstorage)
- [💾 Format eksportu/importu statusu](#-format-eksportuimportu-statusu)
- [🖨️ Eksport](#-eksport)
- [📁 Struktura folderów](#-struktura-folderów)
- [⚙️ Stos technologiczny](#-stos-technologiczny)
- [📝 Uwagi](#-uwagi)
- [🔒 Uwagi dotyczące bezpieczeństwa](#-uwagi-dotyczące-bezpieczeństwa)
- [📖 Jak cytować](#-jak-cytować)

## 🇵🇱 Polski

### 📋 Przegląd

Ten projekt to interaktywny, przeglądarkowy edytor odontogramu dla **Angulara + TypeScriptu**, który umożliwia szybkie dokumentowanie statusu stomatologicznego w przejrzystym interfejsie. Renderuje warstwowe szablony SVG zębów, aby przedstawić uzupełnienia, próchnicę, stan endodontyczny, ruchomość i inne szczegóły kliniczne, oferując przy tym wielokrotne zaznaczanie, filtry wyboru i predefiniowane presety statusu.

**To oficjalny port Angular biblioteki [React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram)** (npm: [`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)). Parytet funkcjonalny z react-advanced-odontogram **v2.6.0** (commit silnika `215c43a`), wersja ładunku **2.22** — eksporty JSON i FHIR R4 są w pełni wymienne między obiema bibliotekami. Silnik kliniczny (`projects/angular-advanced-odontogram/src/lib/core/`) jest współdzielony dosłownie — logika statusu zębów, wykres periodontalny, kodowanie diagnoz, eksport/import FHIR, ciągi i18n, prowadzona wycieczka wprowadzająca i szablony SVG są identyczne co do bajtu z oryginałem w React, ponownie kopiowane z przypiętego commita upstream przy każdej resynchronizacji; wyłącznie powłoka komponentu (`projects/angular-advanced-odontogram/src/lib/components/`) jest natywna dla Angulara. Istnieje niewielki, jawnie udokumentowany zestaw odchyleń (wyłącznie ciągi znakowe związane z marką/tożsamością — zob. specyfikację projektu portu w tym repozytorium). Wersjonowanie przebiega w lockstepie z modułem React.

---
![Podgląd edytora odontogramu](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_en_odontogram.png)
*Zrzut ekranu z oryginalnego projektu React — port dla Angulara renderuje identyczny interfejs.*

🔗 **Wersja demo (live):** https://angular-advanced-odontogram.vercel.app/

---

### 📦 Użycie jako pakiet npm

Odontogram jest dostępny jako samodzielna biblioteka komponentów Angular na npm:
[`angular-advanced-odontogram`](https://www.npmjs.com/package/angular-advanced-odontogram).

#### Wymagania
- **Angular 21.2+** (zadeklarowany jako peer dependency — dostarczany przez Twoją aplikację).
- **Bundler** rozumiejący pole `exports` oraz ESM — Angular CLI (`@angular/build`) spełnia ten wymóg od razu. Pakiet jest dostępny **wyłącznie jako ESM**.
- Node **≥ 20** do narzędzi deweloperskich.

#### Instalacja

```bash
npm install angular-advanced-odontogram
```

#### Podstawowe użycie

Zarejestruj arkusz stylów **raz**, w dowolnym miejscu, gdzie skonfigurowane są globalne style Twojej aplikacji (np. `angular.json`):

```json
"styles": [
  "node_modules/angular-advanced-odontogram/styles.css",
  "src/styles.css"
]
```

Następnie wyrenderuj `OdontogramShellComponent`:

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

#### Właściwości wejściowe komponentu

`OdontogramShellComponent` jest komponentem kontrolowanym — każda właściwość wejściowa to sygnał Angulara `input()`, wszystkie opcjonalne, każda domyślnie wraca do własnej wartości domyślnej silnika, gdy zostanie pominięta. Najczęściej używane:

| Właściwość wejściowa | Typ | Domyślnie | Opis |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | Język interfejsu (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`zh`/`ar`/`fr`). |
| `numberingSystem` | `"FDI" \| "UNIVERSAL" \| "PALMER"` | `"FDI"` | System numeracji zębów. |
| `darkMode` | `boolean` | `false` | Przełącznik trybu ciemnego. |
| `readOnly` | `boolean` | `false` | Wyłącza całą edycję (tylko podgląd). |
| `themeConfig` | `OdontogramThemeConfig` | — | Nadpisuje zmienne CSS motywu (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Rejestruje niestandardowe wtyczki stanu / dodatkowe warstwy. |
| `enableNotes` | `boolean` | `false` | Włącza notatki dla poszczególnych zębów. |
| `enableIcdas` | `boolean` | `false` | Włącza punktowanie próchnicy wg ICDAS II. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Złożoność karty wypełnień: `"simple"` (jeden materiał na ząb) lub `"complex"` (materiały na powierzchnię). |
| `fillingDefectEnabled` | `boolean` | `true` | Włącza wyniki dotyczące wad wypełnienia na karcie Wypełnienia. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | wszystkie dostępne | Dostępne materiały wypełnień jako mapa wartości logicznych nad `amalgam`/`composite`/`gic`/`temporary` (nieznane klucze są ignorowane). |
| `fissureSealingEnabled` | `boolean` | `true` | Włącza lakowanie bruzd na karcie Wypełnienia. |
| `languageChange` / `numberingChange` / `darkModeChange` (wyjścia) | `output<T>` | — | Emitowane, gdy użytkownik zmieni ustawienie z poziomu interfejsu. |
| `fillingComplexityChange` / `fillingDefectEnabledChange` / `fillingMaterialAvailabilityChange` / `fissureSealingEnabledChange` (wyjścia) | `output<T>` | — | Emitowane, gdy użytkownik zmieni odpowiednie ustawienie w Ustawienia → Wypełnienia. |

Akceptowane są także bardziej szczegółowe właściwości wejściowe poziomu detali (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `cariesDepthEnabled`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) — pełną, otypowaną listę znajdziesz w `odontogram-shell.component.ts`.

Cztery powyższe właściwości wypełnień służą **wyłącznie do przywracania**: pominięta właściwość nigdy nie zapisuje do silnika (imperatywne wywołanie `setFillingComplexity()` przed montażem jest zachowane), natomiast dostarczona właściwość zapisuje silnik i stan modala Ustawienia razem, dzięki czemu modal nigdy nie pokazuje nieaktualnej wartości. `fillingMaterialAvailability` jest stosowana różnicowo za pomocą kanonicznego, serializowanego klucza, dzięki czemu ponowne renderowanie z nowym literałem obiektu o identycznej zawartości nigdy nie przepisuje silnika. Pasujące wyjścia `*Change` uruchamiają się z Ustawienia → Wypełnienia — to ścieżka zapisu zwrotnego dla hostów zapisujących preferencje.

#### Publiczne API (eksporty nazwane)

`OdontogramShellComponent` jest eksportem nazwanym. Imperatywne API stanu, samodzielny komponent `PerioChartComponent`, prowadzona wycieczka wprowadzająca oraz wszystkie publiczne typy są eksportami nazwanymi z tego samego punktu wejścia:

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

Pełny zakres API (znacznie ponad 100 funkcji i typów — `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PdfSettings`, `PerioViewMode` i wiele innych) jest w pełni otypowany w dołączonych deklaracjach `.d.ts`; zob. [Publiczne API](#-publiczne-api) poniżej — wyselekcjonowaną tabelę referencyjną.

#### Komponowalne powierzchnie (zaawansowane)

`OdontogramShellComponent` to obsługiwany komponent typu wszystko w jednym i nie wymaga dodatkowej konfiguracji. Jeśli chcesz umieścić regiony odontogramu w różnych obszarach własnego układu, cztery powierzchnie interfejsu powłoki są również eksportowane i można je komponować pod jednym `OdontogramUiService`, wszystkie współdzieląc jedną sesję zarządzaną przez pojedynczą instancję:

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

`OdontogramUiService` przyjmuje ten sam kształt konfiguracji, co właściwości wejściowe `OdontogramShellComponent` (jego metoda `configure()` akceptuje obiekt `OdontogramUiConfig` złożony z `Signal`i/wywołań zwrotnych, każde pole opcjonalne, z tą samą domyślną wartością upstream). Aktualne ograniczenie: jedna instancja `OdontogramUiService` na stronę (silnik jest singletonem na poziomie modułu). Powierzchnie można montować i odmontowywać na żądanie. Sam `OdontogramShellComponent` pozostaje niezmieniony — to dokładnie ta kompozycja w domyślnym układzie, wciąż jawnie okablowująca każde pole z własnych właściwości wejściowych.

Dla jeszcze bardziej precyzyjnej kompozycji eksportowane są również poszczególne karty sterujące:

| Komponent | Selektor | Zakres |
|---|---|---|
| `StatusesCardComponent` | `aao-statuses-card` | Kontrolki statusu/presetów dla całej jamy ustnej (Reset, uzębienie mleczne/mieszane, bezzębny, dodatki statusu) |
| `ToothDetailsCardComponent` | `aao-tooth-details-card` | Wiersz podstawowy (wybór zęba/podłoże), pola wyboru złamanej korony, przełączniki korona wymagana/wymiana korony |
| `CariesCardComponent` | `aao-caries-card` | Tryb głębokości próchnicy, próchnica podkoronowa, ciężkość próchnicy korzenia, selektor próchnicy na powierzchnię |
| `FillingsCardComponent` | `aao-fillings-card` | Materiał wypełnienia, selektor wypełnień na powierzchnię + wady, notatki pomocnicze próchnicy wtórnej/wady |
| `RootPeriodontiumCardComponent` | `aao-root-periodontium-card` | Stan miazgi/endo, diagnoza okołowierzchołkowa, resorpcja, ruchomość, stan okołowszczepowy |
| `OrthodonticsCardComponent` | `aao-orthodontics-card` | Aparat, przemieszczenie, ruch pionowy, rotacja |
| `SurfaceCrossComponent` | `aao-surface-cross` | Współdzielony widżet wyboru krzyżowego B/M/O/D/L, wykorzystywany wewnętrznie przez karty Próchnica/Wypełnienia |
| `DiagnosesCardComponent` | `aao-diagnoses-card` | Kodowanie diagnoz ICD-10/BNO-10/ICD-10-CM/SNOMED na ząb — przeglądaj wyprowadzone diagnozy zęba i kuruj je (pomiń wyprowadzoną, dodaj taką, której wykres nie odzwierciedla) |

Każda karta jest samodzielnym, deklaratywnym komponentem, który odczytuje i zapisuje współdzieloną sesję za pośrednictwem `inject(OdontogramUiService)` oraz eksportowanego helpera `engineState()` (zwracające sygnał odczytanie dowolnego gettera silnika, aktualizowane za pomocą własnej szyny powiadomień o zmianach rdzenia). Montuj tylko te karty, których potrzebuje dany układ, w dowolnej konfiguracji, pod jednym `OdontogramUiService`. `CreditsModalComponent` (`aao-credits-modal`, popup paska górnego „O aplikacji i podziękowania") oraz `CaseDiagnosesModalComponent` (`aao-case-diagnoses-modal`, popup diagnoz przypadku/regionalnych dla całej jamy ustnej) są również eksportowane, dla hostów, które chcą sterować którymkolwiek z nich z poziomu własnego stanu otwarcia/zamknięcia.

```ts
import { engineState, OdontogramUiService, getOdontogramSummary } from "angular-advanced-odontogram";

// Anywhere inside an injection context under an `OdontogramUiService`:
readonly summary = engineState(getOdontogramSummary); // Signal<OdontogramSummary>, kept fresh automatically
```

#### Punkty rozszerzeń DI dla testowania hosta

Dwa `InjectionToken` pozwalają aplikacji hosta nadpisać wywołania silnika powodujące efekty uboczne we własnych testach (oba domyślnie odwołują się do rzeczywistego wywołania silnika w produkcji; oba są `providedIn: "root"`):

| Token | Nadpisuje | Kształt |
|---|---|---|
| `ODONTOGRAM_ENGINE_LIFECYCLE` | `initOdontogram()` / `destroyOdontogram()`, wywoływane z `ngAfterViewInit()`/`ngOnDestroy()` komponentu `OdontogramShellComponent` | `{ init: () => Promise<void>; destroy: () => void }` |
| `EXPORT_PDF_FN` | `exportPdf(opts)`, wywoływane z `ExportOptionsModalComponent` przy kliknięciu „Eksport” | `(opts: PdfExportOptions) => Promise<void>` |

Oba istnieją, ponieważ rzeczywiste funkcje odwołują się do wewnętrznych mechanizmów DOM/canvas/`jsPDF`, których bezgłowe (headless) środowisko testowe nie jest w stanie w pełni zapewnić — nadpisz je za pomocą tablicy providerów `TestBed` Angulara we własnych testach komponentów aplikacji hosta.

#### Ważne uwagi i obecne ograniczenia
- **Wyłącznie ESM** — pakiet publikuje pojedynczy moduł ES (zbudowany za pomocą `ng-packagr`) wraz z punktem wejścia deklaracji typów. Jest przeznaczony dla rozwiązywania modułów przez bundler; nie ma builda CommonJS.
- **Arkusz stylów jest oddzielny** — **musisz** zarejestrować `angular-advanced-odontogram/styles.css` raz; nie jest on wstrzykiwany automatycznie. Stylowanie to globalny CSS ograniczony do `.odontogram-root` i sterowany zmiennymi CSS `--odon-*`.
- **SSR / tylko po stronie klienta** — komponent odczytuje DOM przy montowaniu, więc musi działać w przeglądarce; renderuj go wyłącznie po stronie klienta.
- **Zasoby są samodzielne** — pliki SVG zębów i ikon są osadzane w pakiecie w czasie budowania (generowane moduły TypeScript, `npm run gen:assets`); **nie ma żadnego pobierania zasobów w czasie działania** do konfigurowania ani niczego dodatkowego do skopiowania do folderu publicznego Twojej aplikacji.
- **Wczytywanie na żądanie** — tylko angielski oraz grafika anatomii zęba `classic` są dołączone do początkowego pakietu; pozostałe 11 tabel języków interfejsu oraz grafika profilu anatomii `measured` są osobnymi, leniwie ładowanymi fragmentami (chunkami), pobieranymi dopiero gdy host przełączy się na nie (`[language]` / `I18nService.setLanguage()`/menu języka oraz `setToothAnatomy("measured")`/Ustawienia → Odontogram → anatomia zęba, odpowiednio). Ten podział w ramach resynchronizacji zmniejszył główny chunk aplikacji demo z 3,12 MB do 1,25 MB, a początkowy rozmiar łączny z 3,21 MB do 1,33 MB — po stronie hosta nie ma nic do konfigurowania.
- **Jedna instancja na stronę** w tym wydaniu — stan silnika jest singletonem na poziomie modułu (tak jak w oryginale React), więc renderowanie dwóch instancji `<aao-odontogram-shell>` na tej samej stronie spowodowałoby współdzielenie przez nie stanu jednego wykresu.

---

### ✨ Kluczowe funkcje
- 🖱️ Szybkie zaznaczanie i wielokrotne zaznaczanie (CMD/CTRL + klik)
- 🦷 Typy zębów: stały, mleczny, implant, poddziąsłowy, brakujący
- 🦷 Podłoże zęba (niezależne od jakiejkolwiek odbudowy): naturalne, radix (pozostałość korzenia), złamane, przygotowane pod koronę
- 👑 Odbudowy według typu × materiału: korona / wkład (inlay) / nakład (onlay) / licówka / most z e.max, złota, gradii, cyrkonu, metalu, metalowo-ceramicznego, teleskopowego lub tymczasowego (nakład dostępny tylko w widoku okluzyjnym) — wybierane z jednego połączonego, niskoklikowego selektora „Fix: Korona – …”; istniejące korony `metal` migrują automatycznie do `metal-ceramic` (metalowo-ceramicznej); implanty korzystają z tego samego modelu typ × materiał, złożonego z warstwą łącznika implantu. Selektor jest zawężany wg rodzaju zęba: implant oferuje tylko koronę/most (plus pięć opcji łącznikowych opisanych poniżej); ząb brakujący/luka oferuje tylko przęsło mostowe (plus protezę ruchomą częściową/całkowitą); podłoże `radix` całkowicie ukrywa kontrolkę odbudowy (na pozostałości korzenia nie można zapisać żadnej odbudowy)
- 🦿 Protetyka ruchoma/na łącznikach na dedykowanej osi `prosthesis` (wpisy „Kivehető:” w połączonym selektorze): śruba gojąca implantu, lokator, lokator z protezą nakładaną, belka, belka z protezą nakładaną; ruchoma proteza częściowa lub całkowita wsparta na zębach
- 🌉 Zęby mostowe renderują zarówno koronę, jak i łącznik siodłowy; nakładka odcinka mostu wielozębowego renderuje jeden ciągły, uwzględniający łuk łącznik przez kolejne zęby mostu (przęsła + filary) oraz przerwy między nimi, uwzględniona w eksporcie PNG/JPG/SVG
- 🔍 Dokumentowanie próchnicy na 6 powierzchniach: mezjalnej, dystalnej, policzkowej, językowej, okluzyjnej, podkoronowej
- 🪥 Materiały wypełnień na powierzchnię: amalgamat, kompozyt, GIC, tymczasowe
- 🏥 Jeden połączony selektor „Stan miazgi / endodontyczny” (zgrupowany: żywa miazga vs. leczona/endo): stany endodontyczne (wypełnienie lecznicze, wypełnienie kanałowe, niekompletne wypełnienie kanałowe, wkład z włókna szklanego, wkład metalowy) i diagnoza miazgi wg AAE (`pulpDx`: normalna / odwracalne / nieodwracalne zapalenie miazgi / martwica) wykluczają się wzajemnie — ząb leczony kanałowo (ustawione `endo`) nie może jednocześnie mieć diagnozy żywej miazgi; przy leczeniu `pulpDx` jest normalizowane do wartości `normal`. Opcjonalne 3-poziomowe ustawienie szczegółowości miazgi (`pulpDetailLevel`: proste / AAE / praktyczna łacina) udostępnia 9 praktycznych łacińskich podtypów miazgi za pomocą `pulpLatin`
- 🦴 Diagnoza okołowierzchołkowa (`apicalDx`: objawowe/bezobjawowe zapalenie ozębnej wierzchołkowej, ostry/przewlekły ropień okołowierzchołkowy, osteoskleroza) bezpośrednio determinuje symbol okołowierzchołkowy; kwalifikator podtypu zmiany ziarniniak/torbiel jest pokazywany tylko przy objawowym/bezobjawowym zapaleniu ozębnej wierzchołkowej
- 🩹 Połączona karta „Korzeń i przyzębie” (jedna zwijana sekcja dla wyników dotyczących korzenia/okołowierzchołkowych i przyzębia)
- ⚕️ Modyfikacje: zapalenie okołowierzchołkowe (widoczne tylko przy zębach brakujących/w zębodole poekstrakcyjnym; ukryte przy zębach obecnych i przy implantach, gdzie pokrywa to `periImplant`), choroba przyzębia, stopnie ruchomości (M1/M2/M3, ukryte przy implantach)
- 🦷🔩 Stan okołowszczepowy (`periImplant`: none / mucositis / peri-implantitis-mild / -moderate / -severe) — klasyfikacja wg World Workshop 2018, pokazywana jako dedykowany selektor przy implantach
- 🏷️ Wskaźniki specjalne: korona wymagana, wymiana korony konieczna, zamknięta luka, plan ekstrakcji, lakowanie bruzd, utrata punktu stycznego
- 👁️ Przełączniki widoku okluzyjnego, zębów mądrości, widoczności kości i miazgi
- 🔢 12 filtrów wyboru (wszystkie, obecne, stałe, mleczne, implanty, brakujące, górne/dolne, przednie/trzonowe)
- 📊 Predefiniowane presety statusu (reset, uzębienie mleczne, uzębienie mieszane, bezzębny)
- 📦 22 predefiniowane szablony uzupełnień (mosty, protezy ruchome, protezy na belce z implantami)
- 💾 Eksport/import statusu w formacie JSON (wersja 2.22; import nadal akceptuje starsze wersje 1.4 oraz 2.0 do 2.21 i migruje je automatycznie, wraz z niestandardowymi stanami wtyczek i notatkami do zębów)
- 💽 Opcjonalna (wyłączona domyślnie) trwałość stanu w `localStorage` (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — automatycznie zapisuje wykres statusu (a opcjonalnie także wykres planu) z zabezpieczeniem rozmiaru 4 MB, a błędy zapisu/parsowania są przekazywane do wywołania zwrotnego `onError` (lub `console.warn`) zamiast rzucania wyjątku
- 🔗 Eksport HL7 FHIR R4 (kolekcja Bundle z obserwacjami na ząb, kodowanie zębów wg ISO 3950 dla uzębienia stałego **i** mlecznego (51-85, bezstratny odzwrotny import), lokalny system kodów, plus opcjonalna nakładka SNOMED CT (Ustawienia → Ogólne → SNOMED CT)); komponent próchnicy z zapisaną ciężkością niesie też kodowanie systemu punktacji — ICDAS na powierzchni pierwotnej (bez wypełnienia), CARS na powierzchni wtórnej (z wypełnieniem)
- ✚ Interfejs wyboru powierzchni w układzie krzyżowym/plus (B/M/O/D/L) dla próchnicy i wypełnień — `SurfaceCrossComponent`, eksportowany do układów komponowalnych
- 🧱 Materiały odbudowy na powierzchnię (mieszane wypełnienia, np. policzkowe amalgamat + dystalne kompozyt)
- 🖼️ Eksport obrazu PNG/JPG/SVG wykresu (do pobrania; PNG/JPG rastrowane z wektorowego SVG)
- 🦷 Próchnica/próchnica wtórna to maszyna stanów per powierzchnia: spróchniała powierzchnia bez wypełnienia jest renderowana jako próchnica pierwotna (nieprzezroczystość warstwowana wg ICDAS); gdy tylko ta powierzchnia ma wypełnienie, jest renderowana zamiast tego jako próchnica wtórna (nawracająca, punktowana wg CARS) — obie nigdy nie są aktywne jednocześnie na tej samej powierzchni
- 🎯 Ujednolicona ciężkość na powierzchnię (`cariesSeverity`, 0–6): odczytywana jako głębokość ICDAS na powierzchni pierwotnej, jako nazwany wynik CARS (Zdrowy … Rozległy ubytek) na powierzchni wtórnej, poprzez kontekstowy popup pokazujący tylko skalę odpowiednią dla aktualnego stanu powierzchni
- 🌱 Próchnica korzenia (`rootCaries`: none / active / arrested / active-cavitated), uruchamiająca dedykowaną warstwę grafiki próchnicy korzenia z nieprzezroczystością zależną od ciężkości
- 📡 Radiologiczna głębokość próchnicy (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 na powierzchnię), niezależna od wizualnej skali ciężkości ICDAS/CARS, prezentowana jako odznaka i zwrotnie zapisywana we własnej obserwacji FHIR
- 🎚️ Trzy ustawienia szczegółowości próchnicy (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) oraz przełącznik `cariesDepthEnabled`, zwijające każdą skalę do prostszego widoku wyboru bez utraty zapisanej wartości
- 🩹 Wiersz podsumowania próchnicy wtórnej w panelu wypełnień: wymienia każdy wybrany ząb z próchnicą wtórną i jego powierzchnie
- 🪛 Wady wypełnienia na powierzchnię (`fillingDefect`: none / marginal / fracture / wear) w bezpośrednich odbudowach, niezależne od próchnicy wtórnej
- 🦷💥 Starcie zęba typowane wg przyczyny klinicznej i lokalizacji (`wearEdge`: none / attrition / erosion, sieczne/okluzyjne; `wearCervical`: none / abrasion / abfraction / erosion, szyjkowe)
- 🎨 Przebarwienie zęba wg przyczyny (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) na zębach stałych i mlecznych
- ✏️ Zęby przednie (siekacze/kły) etykietują swoją powierzchnię żującą jako „sieczną” w całym interfejsie; przechowywany klucz powierzchni pozostaje `occlusal`
- 🔤 Notacja powierzchni zależna od pozycji zęba (Ustawienia → Szczegóły zęba → „Notacja powierzchni”, prosta/pełna, domyślnie pełna): w trybie pełnym litera i etykieta powierzchni próchnicy/wypełnienia podążają za anatomią zęba — okluzyjna → I/sieczna na zębach przednich, policzkowa → L/wargowa na zębach przednich, językowa → P/podniebienna na zębach górnych i L/językowa na zębach dolnych
- 🦷↕️ Dokumentowanie ortodontyczne na ząb (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: wartość logiczna) na obecnym, naturalnym zębie (stałym lub mlecznym)
- 🪨 Kamień nazębny oraz resorpcja korzenia typowana jako wewnętrzna lub zewnętrzna szyjkowa (`resorptionType`)
- 📏 Głębokość próchnicy na powierzchnię (powierzchowna / zębina / głęboka), lub opcjonalne punktowanie ICDAS II (0–6) za pomocą `enableIcdas`
- 🩹 Przełącznik nieszczelności brzeżnej korony, pokazywany tylko przy odbudowie koronowej lub mostowej
- 🧬 Kodowanie diagnoz oparte na standardach (WHO ICD-10, zawsze włączone): każdy udokumentowany wynik wyprowadza diagnozę kodowaną w ICD-10 — próchnica (K02), próchnica korzenia/cementu oraz zatrzymana (K02.2/.3), zapalenie miazgi i martwica miazgi (K04.0/.1), zapalenie ozębnej wierzchołkowej, ropień okołowierzchołkowy i torbiel korzeniowa (K04.4–.9), starcie/otarcie/erozja/abfrakcja (K03.0–.8), kamień nazębny (K03.6), resorpcja (K03.3), przebarwienie (K00.3/K00.8/K03.7), utrata zęba (K08.1), pozostałość korzenia (K08.3) i złamanie zęba (S02.5) — eksportowane jako FHIR Condition
- 🩺 Karta **Diagnozy** na ząb (`DiagnosesCardComponent`, `aao-diagnoses-card`): przeglądaj wyprowadzone diagnozy ICD-10 zęba i kuruj je — pomiń błędnie wyprowadzoną lub dodaj taką, której wykres nie odzwierciedla. Efektywny zestaw (wyprowadzone − pominięte + dodane) steruje eksportem FHIR; każdy wiersz pokazuje najpierw swój kod (`K04.0 Pulpitis`), a wiersze są sortowane wg kodu; przełącznik **wyklucz** usuwa diagnozę z eksportu FHIR bez ingerencji w wykres, a **usuń** (×) usuwa diagnozę *oraz* leżący u jej podstaw wynik
- 🗂️ **Diagnozy przypadku/regionalne** (`CaseDiagnosesModalComponent`, `aao-case-diagnoses-modal`): diagnozy dla całej jamy ustnej, niezwiązane z pojedynczym zębem — wady zgryzu i staw skroniowo-żuchwowy (K07), torbiele jamy ustnej (K09), choroby gruczołów ślinowych (K11), zapalenie jamy ustnej i błony śluzowej (K12/K13) oraz anomalie rozwojowe na poziomie łuku (K00) — każda opcjonalnie z lateralizacją (lewa/prawa/obustronna), otwierane z przycisku **Diagnozy** obok przełącznika Odontogram/Stan periodontalny
- 🌍 Krajowe pakiety kodowania (Ustawienia → Ogólne → System kodowania diagnoz): nakładka krajowego systemu kodów na bazę WHO ICD-10 — BNO-10 (węgierski, oficjalne nazwy NEAK; zachowuje kod WHO) lub amerykański ICD-10-CM (przemapowane kody, np. zakres dentofacjalny K07 → M26)
- 🔬 Nakładka SNOMED CT (Ustawienia → Ogólne → SNOMED CT, opcjonalna, domyślnie wyłączona): dodaje kodowanie SNOMED CT obok kodowania WHO i dowolnego krajowego pakietu, oraz koduje wyniki okołowszczepowe, które nie mają odpowiednika w WHO ICD-10. Identyfikatory pojęć ICD-10-CM i SNOMED są referencyjne/najlepszego przybliżenia — przed użyciem klinicznym zweryfikuj je względem oficjalnej listy tabelarycznej ICD-10-CM / przeglądarki SNOMED CT
- 🔁 Odzwrotny zapis diagnoz przez FHIR Condition: diagnozy są eksportowane jako zasoby FHIR `Condition` (powiązane z zębem, plus warunki przypadku na poziomie pacjenta z lateralizowanym bodySite) obok Observations, a import je odtwarza — warunki przypadku bezpośrednio, a nadpisania dodania/pominięcia na ząb przez porównanie zaimportowanych Condition z ponownie wyprowadzonym wykresem
- ✅ Eksport FHIR czysty wg walidatora HL7: każdy wpis Bundle niesie deterministyczny `id` i bezwzględny `fullUrl` (bez placeholderów `urn:uuid`), a Bundle osadza własny **CodeSystem** silnika, dzięki czemu jego lokalne kody rozwiązują się podczas walidacji; ten sam CodeSystem wraz z wygenerowanymi ValueSets są publikowane w tym repozytorium pod `projects/angular-advanced-odontogram/src/lib/fhir/` (przekaż `includeCodeSystem: false` w opcjach eksportu FHIR, aby pominąć go w Bundle)
- 🔄 Dane periodontalne odzwrotnie zapisują się teraz też przez import FHIR, nie tylko przez ładunek JSON: importer odczytuje panele periodontalne LOINC 74029-0 z powrotem do każdego zęba — głębokość sondowania, brzeg dziąsłowy (odtworzony z CAL, dzięki czemu wartości pseudokieszonki są zachowane), BOP, furkację, płytkę O'Leary, wskaźniki PI/GI oraz implantowe mPI/mBI i szerokość dziąsła skeratynizowanego — plus obserwacje dowodowe statusu palenia i HbA1c na poziomie przypadku; ropienie jest jedynym wyjątkiem i pozostaje wyłącznie w JSON
- 🧰 Ujednolicony wiersz ikon paska górnego z zakładkowym oknem dialogowym Ustawień (7 zakładek — Ogólne / Odontogram / Wykres periodontalny / Szczegóły zęba / Próchnica / Wypełnienia / Eksport — zob. [Ustawienia](#-ustawienia) poniżej)
- 🦷🩺 Zakładka Ustawienia → „Wykres periodontalny”: przełącznik dostępności plus 16 przełączników pokazywania/ukrywania na indeks dla wierszy wykresu periodontalnego, każdy z własnym opisem, plus opcja wyświetlania nazw indeksów przetłumaczonych vs. kanonicznych
- 📋 Panel informacji o zębach: na żywo tekstowe podsumowanie całego wykresu (liczba zębów, listy obecnych/brakujących, próchnica w tym wtórna, wypełnienia, kanały korzeniowe, protetyka, implanty, stan przyzębia) — wyświetlany domyślnie, przełączany w Ustawieniach
- 🗂️ Skonsolidowane menu rozwijane Eksportu (Status JSON / FHIR / PNG / JPG / SVG / raport PDF), każdy format niezależnie ukrywalny za pomocą Ustawienia → Ogólne
- 📥 Menu rozwijane Importu z importem FHIR (zwrotne wczytywanie wyeksportowanych Bundli), niezależnie ukrywalne dla każdego źródła
- ⏳ Nakładka postępu podczas eksportu obrazu
- 🎓 Interaktywna wycieczka wprowadzająca (prowadzony przegląd kontrolek powłoki)
- 🔢 Trzy systemy numeracji (FDI, Universal, Palmer)
- 🌐 I18n — 12 języków interfejsu (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) z przełącznikiem języka; arabski wyświetla interfejs od prawej do lewej, a wykresy zębowe/periodontologiczne pozostają od lewej do prawej; tylko aktywny język jest dołączony do głównego pakietu — każdy pozostały język to osobny chunk, pobierany przy pierwszym wybraniu
- 🌗 Obsługa trybu ciemnego z przyciskiem przełączania (samodzielny lub kontrolowany przez aplikację nadrzędną)
- 🎨 Konfiguracja niestandardowego motywu (właściwość wejściowa `themeConfig`) z niestandardowymi właściwościami CSS (`--odon-*`)
- 📱 Mobilny interfejs dotykowy: wyskakujące okno powiększenia przy dotknięciu, menu kontekstowe przy długim przytrzymaniu, powiększanie szczypnięciem, cele dotykowe WCAG 44px, nawigacja przełącznikiem łuku
- 🔌 Niestandardowy system wtyczek SVG: wstrzykiwanie nakładek wizualnych, niestandardowy stan na ząb, obsługa eksportu/importu JSON — dane wyjściowe `renderSvg()` wtyczki są oczyszczane przez DOMPurify (profil SVG) przed wstawieniem do aktywnego wykresu; wtyczki nadal działają jako zaufany kod, więc należy ładować wtyczki wyłącznie z zaufanych źródeł
- ⚠️ Ostrzeżenia walidacyjne stanu dla niezgodnych kombinacji stanów zębów
- 🏷️ Automatyczna etykietka stanu na kafelkach zębów (pokazuje wszystkie aktywne stany)
- 🩺 Etykietka na ząb i panel podsumowania całej jamy ustnej prezentujące pełny zestaw wyników klinicznych (diagnoza miazgi/okołowierzchołkowa, resorpcja korzenia, stan okołowszczepowy, stopniowana próchnica korzenia, kamień nazębny, nieszczelność brzeżna korony, złamanie, utrata punktu stycznego, typowane starcie sieczne/szyjkowe)
- ♿ Dostępność klawiaturowa (WCAG): role ARIA listbox/option, wybór Enter/Spacja, nawigacja strzałkami, kontury focus-visible
- 🔒 Tryb tylko do odczytu: wyłączenie wszystkich interakcji do przypadków użycia drukowania/raportowania/przeglądania
- ✨ Animacje zaznaczenia: pulsująca przerywana ramka i świecący cień na zaznaczonych zębach (z obsługą prefers-reduced-motion)
- 📝 Notatki do zębów: dwuklik, aby dodać/edytować notatki, ikona notatki obok numeru zęba, etykietka po najechaniu z tekstem notatki, wiersz „Notatki indywidualne” w panelu podsumowania całej jamy ustnej, uwzględnienie w raporcie PDF, eksport/import JSON
- 🔀 Podział wykresu Status ↔ Plan: przełącznik `Status | Plan` przełącza między wykresem bieżącego **statusu** a wykresem **planu** (zamierzonego leczenia), każdy z własnymi stanami zębów; eksport/import zawsze dotyczy wykresu statusu, natomiast wykres planu jest odczytywany/zapisywany osobno za pomocą własnego API (zob. [Publiczne API](#-publiczne-api)) i — gdy różni się od statusu — jest dołączany jako dodatkowa sekcja `plan` w eksporcie JSON
- 📝 Panel „Co się zmienia”: gdy plan różni się od bieżącego statusu, wymienia każdą różnicę na ząb i oś leczenia; dostępne również programowo za pomocą `getPlanChanges()`
- 🅿️ Stylizacja propozycji: w trybie Plan wyniki, które plan **dodaje** względem bieżącego statusu, są renderowane z wyraźnym przerywanym, zabarwionym konturem „propozycji”
- 🚦 Blokowanie trybu Plan: wykres Planu pokazuje tylko to, co dentysta może *zrobić* — wyniki dotyczące wyłącznie statusu (próchnica, starcie zęba, przebarwienie, cały blok periodontologiczny) są ukryte; odbudowa, protetyka, ortodoncja, potrzeba/wymiana korony oraz plan ekstrakcji pozostają możliwe do zaplanowania

![Pełny wykres periodontalny całej jamy ustnej](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_en_perio.png)
*Zrzut ekranu z oryginalnego projektu React — port dla Angulara renderuje identyczny interfejs.*

- 🩺 Dokumentowanie periodontologiczne: na miejsce **głębokość sondowania**, **brzeg dziąsłowy**, **krwawienie przy sondowaniu** (+ ropienie) w sześciu standardowych miejscach na ząb, z pochodnym **klinicznym poziomem przyczepu (CAL = PD + brzeg dziąsłowy)**, recesją i **%BOP** dla całej jamy ustnej. **Graficzny wykres periodontalny całej jamy ustnej** — każdy łuk rysowany jako dwa osobne SVG, policzkowy i podniebienny/językowy, z czerwoną **linią CEJ**, numerowaną siatką milimetrową i krzywą brzegu dziąsłowego/głębokości kieszonki, rozdzielony centralnym pasmem indeksów periodontalnych niosącym **klasę Millera** oraz **Płytkę/PI/GI/mPI/mBI** jako anatomiczne romboidalne kafelki na ząb; wprowadzanie danych z automatycznym przechodzeniem klawiaturą; wykres dynamicznie skaluje się, aby wypełnić dostępną szerokość. Prezentowany jako przełącznik widoku `Odontogram | Periodontal Status`, wciąż też osobno wywoływalny za pomocą eksportowanego `PerioChartComponent`. Eksport **FHIR** na miejsce za pomocą panelu periodontalnego LOINC (`74029-0`; PD `32910-2`, recesja `32911-0`, CAL `32912-8`)
- 🧪 Obszerny zautomatyzowany zestaw testów (zob. [Testowanie](#-testowanie)) obejmujący numerację, tłumaczenia, presety, i18n, powłokę, motyw, dotyk, wtyczki, dostępność oraz parytet osi klinicznych/diagnostycznych względem zamrożonego korpusu React
- 📖 Dokumentacja API TypeDoc z komentarzami JSDoc dla wszystkich publicznych eksportów (`npm run docs`)

### 📦 Moduły
- 🦷 Siatka odontogramu i interfejs kafelków zębów (`OdontogramChartSurfaceComponent`)
- 🎛️ Kontrolki i panel statusu (`ToothControlsSurfaceComponent` + 8 kart deklaratywnych)
- 🎨 Silnik warstwowania SVG i szablony (rdzeń bez zależności od frameworka, `core/odontogram.ts`)
- 🔢 Numeracja zębów i mapowanie etykiet (FDI/Universal/Palmer, `core/utils/numbering.ts`)
- 🌐 Lokalizacja — 12 języków interfejsu (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), w tym arabski (RTL) (`core/i18n/`, `I18nService`)
- 💾 Eksport/import statusu
- 📋 Dodatki statusu: predefiniowane szablony uzupełnień
- 🎨 Konfiguracja motywu: konfigurowalna paleta kolorów za pomocą właściwości CSS `--odon-*`
- 📱 Mobilne interakcje dotykowe (powiększenie przy dotknięciu, długie przytrzymanie, powiększanie szczypnięciem, przełącznik łuku)
- 🔌 Niestandardowy system wtyczek SVG
- ⚠️ System walidacji stanu i etykietek
- ♿ Dostępność klawiaturowa i obsługa ARIA
- 🔒 Tryb tylko do odczytu
- ✨ Animacje zaznaczenia
- 📝 System notatek do zębów
- 🧱 **Komponowalny interfejs** — `OdontogramUiService`, helper `engineState()`, 4 powierzchnie prezentacyjne oraz 8 deklaratywnych kart sterujących, wszystkie eksportowane niezależnie (zob. [Komponowalne powierzchnie](#-użycie-jako-pakiet-npm) powyżej)
- 🧪 Zautomatyzowany zestaw testów (korpus Vitest + `ng test`, zob. [Testowanie](#-testowanie))

### 🛠️ Kontrolki interfejsu

**🔝 Pasek górny** (`OdontogramTopbarComponent`):
- Przełącznik języka (lista rozwijana HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR)
- Przycisk przełączania trybu ciemnego (ikona słońca/księżyca, przełącza między jasnym i ciemnym motywem)
- Przełącznik systemu numeracji (lista rozwijana FDI/Universal/Palmer)
- Przyciski Eksportuj status / Importuj status
- Ustawienia (ikona trybika), Podziękowania/O aplikacji (ikona informacji), link do GitHub

**📊 Nagłówek wykresu:**
- Przełącznik widoku okluzyjnego
- Przełącznik widoczności zębów mądrości
- Przełącznik widoczności kości
- Przełącznik widoczności miazgi
- Przycisk wyczyść zaznaczenie

**🔍 Filtry wyboru:**
- Zaznacz wszystkie / Wszystkie obecne / Stałe / Mleczne / Implanty / Wszystkie brakujące
- Zaznacz górne / Górne 6 przednich / Trzonowce górne
- Zaznacz dolne / Dolne 6 przednich / Trzonowce dolne

**📋 Presety statusu:**
- Resetuj wszystko (resetuj jamę ustną)
- Uzębienie mleczne
- Uzębienie mieszane
- Przełącznik bezzębności

**📦 Lista rozwijana Dodatki statusu:**
- Górne/dolne mosty cyrkonowe (12-22, 13-23, 16-26, pełny łuk)
- Górne/dolne mosty metalowe (12-22, 13-23, 16-26, pełny łuk)
- Górne/dolne częściowe protezy ruchome
- Górne/dolne całkowite protezy ruchome
- Górne/dolne protezy na belce z implantami

**🦷 Panel edycji zęba** (`ToothControlsSurfaceComponent`, dla wybranego zęba/zębów, pogrupowany w zwijane karty):
- **Karta Statusy:** presety i dodatki statusu dla całej jamy ustnej (pokazywane/ukrywane niezależnie za pomocą `showStatusCard`)
- **Karta Szczegóły zęba:** wybór zęba (typ podstawowy wraz z wariantami złamanej korony), podłoże zęba, połączona lista rozwijana odbudowy „Fix: …” / „Kivehető: …”, pole wyboru nieszczelności brzeżnej korony, pola wyboru lokalizacji złamanej korony, przełączniki korona wymagana / wymiana korony konieczna
- **Karta Ortodoncja:** aparat, przemieszczenie mezjalne/dystalne, ruch pionowy, przełącznik rotacji — pokazywana przy obecnym, naturalnym zębie (pokazywana/ukrywana niezależnie za pomocą `showOrthoCard`)
- **Karta Próchnica:** lista rozwijana trybu głębokości próchnicy, pole wyboru próchnicy podkoronowej, lista rozwijana ciężkości próchnicy korzenia oraz selektor powierzchni próchnicy B/M/O/D/L (`SurfaceCrossComponent`) z kontekstowym popupem ICDAS-głębokość/CARS i odznaką głębokości radiologicznej
- **Karta Wypełnienia:** lista rozwijana materiału wypełnienia, selektor wypełnień na powierzchnię, wskaźnik wady wypełnienia na powierzchnię, notatki pomocnicze dot. próchnicy wtórnej i wady wypełnienia
- **Karta Korzeń i przyzębie:** połączony selektor „Stan miazgi / endodontyczny”, selektor diagnozy okołowierzchołkowej, selektor podtypu zmiany okołowierzchołkowej, selektor typu resorpcji korzenia, selektor stopnia ruchomości, selektor stanu okołowszczepowego (tylko implanty)
- **Wskaźniki specjalne:** plan ekstrakcji/rana, luka zamknięta, lakowanie bruzd, utrata punktu stycznego, kamień nazębny, wkład parapulpalny, resekcja endodontyczna, filar mostu

### 🦷 Typy zębów i stany

**Wybór zęba (typ podstawowy):**
| Wartość | Opis |
|---|---|
| `none` | Ząb brakujący |
| `tooth-base` | Ząb stały |
| `milktooth` | Ząb mleczny (mleczak) |
| `implant` | Implant stomatologiczny |
| `tooth-under-gum` | Ząb poddziąsłowy (niewyrznięty) |

**Warianty zęba złamanego:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Podłoże zęba (zęby stałe):**
`natural` (domyślne), `radix` (pozostałość korzenia), `broken`, `crownprep` (przygotowany pod koronę)

**Typ odbudowy (zęby stałe):**
`none`, `crown`, `inlay`, `onlay` (tylko widok okluzyjny), `veneer`, `bridge`

**Materiał odbudowy (zęby stałe):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (istniejące korony `metal` migrują tutaj), `telescope`, `temporary`

**Opcje odbudowy są zawężane wg rodzaju zęba** (`restorationOptions()` w `projects/angular-advanced-odontogram/src/lib/core/registry/restorations.ts`): implant oferuje tylko typy odbudowy `crown`/`bridge` (złożone z warstwą łącznika implantu) plus pięć poniższych wpisów łącznikowych `prosthesis`; ząb brakujący/luka oferuje tylko przęsło `bridge` plus dwa wpisy protez ruchomych `prosthesis`; podłoże `radix` całkowicie ukrywa kontrolkę odbudowy.

**Protetyka ruchoma** (`prosthesis`; niezależna oś ruchoma/łącznikowa, prezentowana jako wpisy „Kivehető:” w połączonej liście rozwijanej odbudowy):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (łączniki implantu, z protezą nakładaną lub bez), `removable-partial`, `removable-full` (protezy wsparte na zębach przy zębie brakującym/luce). Ząb ma albo stałą odbudowę, albo protezę ruchomą, nigdy jedno i drugie jednocześnie — ustawienie jednej opcji czyści drugą.

**Nieszczelność brzeżna korony** (`crownLeakage`; wartość logiczna): pokazywana tylko gdy `restorationType` to `crown` lub `bridge`.

**Opcje endodontyczne (zęby stałe):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opcje endodontyczne (zęby mleczne):**
`none`, `endo-medical-filling`

`endo` i `pulpDx` są prezentowane przez jeden połączony selektor „Stan miazgi / endodontyczny” (zgrupowany: żywa miazga vs. leczona/endo) i wykluczają się wzajemnie — wybór opcji leczonej (`endo != none`) resetuje `pulpDx` do `normal`, a wybór diagnozy miazgi resetuje `endo` do `none`.

**Materiały wypełnień (zęby stałe):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiały wypełnień (zęby mleczne):**
`composite`, `gic`, `temporary`

**Powierzchnie wypełnienia/próchnicy:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (tylko próchnica)

**Modyfikacje:**
`inflammation` (okołowierzchołkowe), `parodontal` (przyzębia), `mobility` (M1/M2/M3)

**Typ zmiany okołowierzchołkowej** (`periapicalType`; kwalifikuje symbol okołowierzchołkowy, pokazywany tylko przy objawowym/bezobjawowym zapaleniu ozębnej wierzchołkowej):
`none`, `granuloma`, `cyst` — dawna wartość `abscess` jest nadal akceptowana/przechowywana, ale nie jest już oferowana w selektorze

**Diagnoza miazgi** (terminologia AAE; `pulpDx`):
`normal`, `reversible-pulpitis`, `irreversible-pulpitis`, `necrosis` — wyklucza się wzajemnie z `endo`

**Diagnoza miazgi, praktyczna łacina** (`pulpLatin`; selektor miazgi pokazuje ją tylko wtedy, gdy `pulpDetailLevel` ma wartość `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Poziom szczegółowości miazgi** (`pulpDetailLevel`, ustawienie globalne): `simple`, `aae` (domyślne), `latin`

**Diagnoza okołowierzchołkowa** (`apicalDx`; determinuje symbol okołowierzchołkowy):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Typ resorpcji korzenia** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Stan okołowszczepowy** (`periImplant`; tylko przy implantach, klasyfikacja World Workshop 2018):
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Ciężkość próchnicy** (`cariesSeverity`; ujednolicone pole na powierzchnię, `0`–`6`): na powierzchni bez wypełnienia jest odczytywana jako skala głębokości ICDAS (`superficial` / `dentin` / `deep`, lub surowe kody ICDAS II `0–6` przy włączonym `enableIcdas`); na powierzchni z wypełnieniem jest odczytywana jako nazwany wynik CARS (`0` zdrowa … `6` rozległy ubytek)

**Próchnica korzenia** (`rootCaries`): `none`, `active`, `arrested`, `active-cavitated`

**Radiologiczna głębokość próchnicy** (`radiographicDepth`; na powierzchnię): `none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Ustawienia szczegółowości próchnicy** (globalne): `secondaryCariesMode` (`simple`/`standard`/`full`, domyślnie `standard`), `rootCariesMode` (`simple`/`severity`, domyślnie `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, domyślnie `off`), `cariesDepthEnabled` (wartość logiczna, domyślnie `true`)

**Wskaźniki specjalne:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Starcie zęba** (`wearEdge`, `wearCervical`; typ kliniczny wg lokalizacji, uwarunkowany obecnością zęba podstawowego + brakiem odbudowy + naturalnym podłożem):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Przebarwienie** (`discoloration`; przyczyna na ząb, uwarunkowana naturalnym zębem stałym lub mlecznym + brakiem odbudowy + naturalnym podłożem):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Wada wypełnienia** (`fillingDefect`; na powierzchnię, wynik dotyczący bezpośredniej odbudowy, niezależny od próchnicy wtórnej):
`none`, `marginal`, `fracture`, `wear`

**Ortodoncja** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; na ząb, uwarunkowane obecnym, naturalnym zębem):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion`, `intrusion` — `orthoRotation`: wartość logiczna

**Ustawienia szczegółów zęba / notacji** (globalne ustawienia sesji, Ustawienia → Szczegóły zęba): `wearDetailLevel` i `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, domyślnie `complex`) oraz `surfaceNotation` (`simple`/`full`, domyślnie `full`)

### ⚙️ Ustawienia

Otwierane za pomocą ikony trybika na pasku górnym (`SettingsModalComponent`); okno dialogowe ARIA `dialog` z pułapką fokusu i układem zakładkowym o 7 zakładkach (Esc/klik w tło zamyka, strzałki przełączają zakładki). Okno dialogowe jest czystym widokiem nad dostarczonym przez host obiektem `SettingsState` — samo nie posiada żadnego stanu ustawień. Wszystkie ustawienia są wyłącznie stanem interfejsu na poziomie sesji, chyba że zaznaczono inaczej — żadne z nich nie zmienia danych na ząb ani ładunku eksportu.

- **Ogólne:** system numeracji (FDI/Universal/Palmer), język, motyw jasny/ciemny, dostępność eksportu na format (PNG/JPG/SVG/PDF — wyłączenie ukrywa odpowiednią pozycję menu Eksportu i wyłącza zakładkę Eksport, gdy PDF jest wyłączony), dostępność importu na źródło (Status JSON/FHIR), system kodowania diagnoz (brak / BNO-10 / ICD-10-CM) oraz opcjonalny przełącznik nakładki SNOMED CT
- **Odontogram:** układ na ekranie — odstępy między zębami, rozmiar numeru zęba, kolor i styl obramowania zaznaczenia; widoczność panelu informacji o zębach; dostępność trybu Plan; profil anatomii zęba (`classic` domyślny / `measured` — dziewięć szablonów zębów zmierzonych na podstawie literatury w układzie dwułukowym z szerokością na ząb, przełączalny w czasie działania; jego grafika jest osobnym leniwie ładowanym chunkiem, pobieranym dopiero po przełączeniu, dzięki czemu domyślny `classic` nic dodatkowo nie kosztuje); widoczność karty Statusy i karty Ortodoncja
- **Wykres periodontalny:** przełącznik dostępności, który blokuje resztę zakładki oraz punkty wejścia periodontalne w powłoce; tryb widoku periodontalnego (`toggle`/`popup`); 16 przełączników pokazywania/ukrywania na indeks w 5 grupach (Kieszonka: PD/GM/CAL/BOP · Higiena: Płytka/PI/GI · Śluzówkowo-dziąsłowe: widoczność CEJ/konkawność korzenia/KG/GT · Podparcie: Furkacja/Ruchomość/klasa Millera · Okołowszczepowe: mPI/mBI); tryb wyświetlania nazw indeksów przetłumaczonych vs. kanonicznych (kanoniczna = stała naukowa nazwa angielska/łacińska w każdym języku interfejsu; etykietki zawsze pozostają zlokalizowane)
- **Szczegóły zęba:** poziom szczegółowości miazgi (prosty/AAE/praktyczna łacina, domyślnie AAE), poziom szczegółowości starcia i poziom szczegółowości przebarwienia (prosty/złożony, każdy domyślnie złożony), notacja powierzchni (prosta/pełna, domyślnie pełna), przełącznik notatek do zębów
- **Próchnica:** przełącznik punktowania ICDAS II, przełącznik głębokości próchnicy, szczegółowość próchnicy korzenia (prosty/ciężkość), szczegółowość wtórna/CARS (prosty/standardowy/pełny), szczegółowość głębokości radiologicznej (wył./trzypoziomowa/szczegółowa)
- **Wypełnienia:** złożoność wypełnienia (złożona/prosta), przełącznik wyników dot. wady wypełnienia, dostępność na materiał (amalgamat/kompozyt/GIC/tymczasowe), przełącznik lakowania bruzd
- **Eksport:** pełna konfiguracja raportu PDF (`PdfSettings` — zob. [Eksport](#-eksport) poniżej) — wyłączona (wraca do treści zakładki Ogólne), gdy tylko eksport PDF jest wyłączony w zakładce Ogólne

### 🖼️ System szablonów SVG

**Szablony zębów** (w `projects/angular-advanced-odontogram/src/lib/core/assets/teeth-svgs/`):
| Szablon | Zęby używające go |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (siekacze) |
| `13.svg` | 13, 23, 33, 43 (kły) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (zęby przedtrzonowe) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (trzonowce) |

Szablony są obracane o 180 stopni dla żuchwy i odbijane poziomo dla lewej strony. Równoległy podfolder `measured/` zawiera dziewięć szablonów zębów zmierzonych na podstawie literatury, które profil anatomii `measured` renderuje w układzie dwułukowym z szerokością na ząb (Ustawienia → Odontogram → anatomia zęba).

**Ikony SVG** (w `projects/angular-advanced-odontogram/src/lib/core/assets/icon-svgs/`):
`icon_8.svg` (mądrość), `icon_gum.svg` (kość), `icon_no_selection.svg` (wyczyść), `icon_occl.svg` (widok okluzyjny), `icon_pulp.svg` (miazga)

Oba foldery są kompilowane do generowanych modułów TypeScript (`core/generated/teeth-svgs.ts`, `core/generated/icon-svgs.ts`) za pomocą `npm run gen:assets` — uruchom to po edycji źródłowego pliku SVG, aby osadzone ciągi znakowe pozostały zsynchronizowane.

### 🔢 Systemy numeracji

**FDI (ISO 3950):** Zęby dorosłych 11-18, 21-28, 31-38, 41-48. Zęby mleczne 51-55, 61-65, 71-75, 81-85. Wartość: `"FDI"`.

**Universal (USA):** Zęby dorosłych numerowane 1-32. Zęby mleczne oznaczone literami A-T. Wartość: `"UNIVERSAL"`.

**Palmer (Zsigmondy-Palmer):** Format kwadrant + pozycja (np. UR-1, LL-5). Zęby mleczne używają liter A-E na kwadrant. Wartość: `"PALMER"`.

`NumberingSystem` (`core/utils/numbering.ts`) to dokładnie unia `"FDI" | "UNIVERSAL" | "PALMER"`; eksportowana funkcja `toLabel(fdiTooth, system)` przekształca numer zęba FDI na etykietę żądanego systemu (np. `toLabel(14, "PALMER")` → `"UR-4"`).

### 🚀 Użycie
Programowanie (uruchamia aplikację demo):
```bash
npm install
npm start           # ng serve
```
Kompilacja biblioteki:
```bash
npm run build:styles && npx ng build angular-advanced-odontogram
```
Kompilacja aplikacji demo:
```bash
npm run build:demo
```

### 🔗 Integracja
Komponent można osadzić w dowolnej aplikacji Angular:
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

**Integracja trybu ciemnego:**
- **Tryb samodzielny:** Pomiń `darkMode` — komponent zarządza własnym stanem motywu za pomocą przycisku przełączania na pasku górnym i dodaje/usuwa klasę `.dark` na głównym elemencie hosta.
- **Tryb kontrolowany:** Powiąż `[darkMode]` i `(darkModeChange)` — aplikacja nadrzędna kontroluje motyw. Przycisk przełączania nadal jest widoczny, ale emituje `darkModeChange` zamiast zarządzać stanem wewnętrznym. Aplikacja nadrzędna jest odpowiedzialna za dodawanie/usuwanie klasy `.dark` na `<html>`.

**Niestandardowy motyw:**
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

**Integracja wtyczki:**
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

Dane wyjściowe `renderSvg()` wtyczki są oczyszczane przez DOMPurify (profil SVG) przed wstawieniem do aktywnego wykresu — zob. [Uwagi dotyczące bezpieczeństwa](#-uwagi-dotyczące-bezpieczeństwa).

### 🧪 Testowanie

Zestaw testów jest podzielony na **dwa runnery**, oba muszą przejść (`npm test` uruchamia oba, po kolei):

```bash
npm run test:corpus   # plain Vitest — the shared clinical-engine core
npm run test:ng       # Angular's Vitest builder — the Angular shell (ng test)
npm test              # both, in order
npm run test:watch    # watch mode (corpus runner)
```

- **`test:corpus`** (`vitest run`) uruchamia `projects/angular-advanced-odontogram/src/lib/core/` — współdzielony rdzeń silnika klinicznego — względem przeniesionego korpusu testów (ponad 100 plików spec pod `core/__tests__/`). To tutaj znajdują się i są sprawdzane co do bajtu **złote fixtury** renderowania SVG, eksportu FHIR i odzwrotnego zapisu JSON: `parity/svg-fingerprints.json`, `parity/fhir-golden.json`, `parity/roundtrip-golden.json`, `parity/shell-dom-golden.html`.
- **`test:ng`** (`ng test angular-advanced-odontogram --watch=false`, integracja Vitest z `@angular/build:unit-test` Angulara) uruchamia własne specyfikacje `*.spec.ts` powłoki Angular — komponenty, serwisy, dyrektywy — sprawdzając parytet DOM: powłoka renderuje te same id-ki, klasy i znaczniki, co oryginalne komponenty React.

Ponieważ integracja Vitest tego buildera nie obsługuje `vi.mock()`/`vi.spyOn()` do mockowania modułów ze ścieżkami względnymi, efekty uboczne dotykające DOM (`initOdontogram`/`destroyOdontogram`, `exportPdf`) są zamiast tego nadpisywane za pomocą tokenów wstrzykiwania `ODONTOGRAM_ENGINE_LIFECYCLE`/`EXPORT_PDF_FN` oraz tablicy providerów `TestBed` Angulara — zob. [Punkty rozszerzeń DI dla testowania hosta](#-użycie-jako-pakiet-npm) powyżej.

### 📖 Dokumentacja API
```bash
npm run docs           # Generate TypeDoc docs in docs/api/
```
Współdzielone API silnika klinicznego jest udokumentowane również w projekcie oryginalnym:

📚 **https://zoliqua.github.io/React-Advanced-Odontogram/**

### 📡 Publiczne API

**Właściwości wejściowe/wyjściowe komponentu:** pełną tabelę zob. [Właściwości wejściowe komponentu](#-użycie-jako-pakiet-npm) powyżej.

**Eksportowane funkcje do kontroli zewnętrznej** (wyselekcjonowany podzbiór — pełny, otypowany zakres znajduje się w dołączonym `.d.ts`):

| Funkcja | Opis |
|---|---|
| `initOdontogram()` / `destroyOdontogram()` | Zainicjuj/wyczyść silnik (wywoływane wewnętrznie przez `OdontogramShellComponent`/`OdontogramUiService` za pomocą tokenu `ODONTOGRAM_ENGINE_LIFECYCLE`) |
| `setNumberingSystem(system)` | Przełącz między FDI, UNIVERSAL, PALMER |
| `clearSelection()` | Odznacz wszystkie zęby |
| `getSelectedTeeth()` | Aktualnie zaznaczone zęby (numery FDI), w kolejności zaznaczania |
| `registerPlugins(plugins)` | Zarejestruj niestandardowe wtyczki SVG |
| `setPluginState(toothNo, pluginId, value)` / `getPluginState(toothNo, pluginId)` | Ustaw/pobierz niestandardowy stan wtyczki dla zęba |
| `getToothStateSummary(toothNo)` | Pobierz zlokalizowane podsumowanie wszystkich aktywnych stanów |
| `getOdontogramSummary()` | Pobierz ustrukturyzowane, zlokalizowane tekstowe podsumowanie całego wykresu (liczby, sekcje, planowane zmiany) |
| `onStateChange(callback)` | Subskrybuj zmiany stanu; zwraca funkcję anulowania subskrypcji |
| `setReadOnly(value)` / `getReadOnly()` | Włącz/wyłącz / sprawdź tryb tylko do odczytu |
| `setNotesEnabled(value)` / `getNotesEnabled()` | Włącz/wyłącz / sprawdź notatki do zębów |
| `setPulpDetailLevel(level)` / `getPulpDetailLevel()` | Ustaw/pobierz słownictwo selektora miazgi — `"simple"`, `"aae"` lub `"latin"` |
| `getToothAnatomy()` / `setToothAnatomy(v)` | Pobierz/ustaw profil anatomii zęba — `"classic"` lub `"measured"` |
| `getChartMode()` / `setChartMode(mode)` | Pobierz/przełącz aktywny wykres — `"status"` lub `"plan"` (wykres planu jest głęboko kopiowany ze statusu przy pierwszym wejściu) |
| `getStatusChart()` / `getPlanChart()` / `setPlanChart(payload)` | Odczytaj ładunki wykresu statusu/planu niezależnie od aktywnego wykresu, lub zastąp zęby wykresu planu |
| `getPlanChanges()` | Pobierz ustrukturyzowaną różnicę status→plan (`{ toothNo, axis, from, to }[]`) |
| `setPerioSite(toothNo, site, patch)` / `getToothPerio(toothNo)` | Ustaw/pobierz dane periodontalne dla jednego z sześciu miejsc (`patch` = `{ pd?, gm?, bop?, sup? }`) |
| `getToothCal(toothNo)` | Pobierz pochodny CAL na miejsce dla zęba |
| `getPerioSummary()` | Zbiorcze dane periodontalne całej jamy ustnej: liczba udokumentowanych miejsc, liczba krwawień, %BOP, najgorszy CAL, maksymalne PD |
| `getPerioChart()` | Pobierz rekordy periodontalne na ząb aktywnego wykresu |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Programowo otwórz/zamknij/sprawdź nakładkę wykresu periodontalnego |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Pobierz/ustaw sposób prezentacji wykresu periodontalnego — `"toggle"` lub `"popup"` |
| `getPerioClassification()` | Pobierz klasyfikację periodontalną World Workshop 2017 (`{diagnosis, stage, grade, extent, derived, overridden}`) |
| `setDiagnosisOverride(v)` / `setStageOverride(v)` / `setGradeOverride(v)` / `setExtentOverride(v)` | Nadpisz wyprowadzoną oś klasyfikacji periodontalnej, lub `null`, aby powrócić do wyprowadzonej |
| `getCaseMeta()` / `resetCaseMeta()` | Pobierz/zresetuj obiekt metadanych na poziomie przypadku (wiek, status palenia/cukrzycy, tożsamość pacjenta, data badania, …) |
| `setPatientName(v)` / `setPatientDob(v)` / `setExamDate(v)` | Ustaw pola tożsamości przypadku (wyłącznie nagłówek raportu PDF — nigdy nie są częścią eksportu FHIR) |
| `getToothDiagnoses(toothNo)` | Pobierz diagnozy kodowane w ICD-10 dla zęba, wyprowadzone wg reguł osi klinicznych |
| `getActiveDiagnoses()` | Pobierz efektywne wiersze diagnoz (wyprowadzone − pominięte + dodane) dla aktualnie zaznaczonego zęba, plus katalog diagnoz możliwych do dodania — model widoku `DiagnosesCardComponent` |
| `addDiagnosisToSelection(key)` / `removeDiagnosisFromSelection(key)` | Dodaj/usuń diagnozę dla aktualnego zaznaczenia zęba, zapisując leżący u jej podstaw wynik na wykresie |
| `setDxOverrideForSelection(key, mode)` | Wymuś nadpisanie diagnozy na aktualnym zaznaczeniu — `"add"`, `"suppress"` lub `null`, aby wyczyścić |
| `getDiagnosisCodingPack()` / `setDiagnosisCodingPack(id)` | Pobierz/ustaw krajową nakładkę pakietu kodowania na bazie WHO ICD-10 — `"none"`, `"bno10"` (węgierskie nazwy NEAK) lub `"icd10cm"` (USA) |
| `getSnomedEnabled()` / `setSnomedEnabled(v)` | Pobierz/ustaw opcjonalną nakładkę kodowania SNOMED CT |
| `getCaseConditions()` / `setCaseCondition(key, laterality)` | Pobierz/ustaw diagnozy przypadku/regionalne dla całej jamy ustnej (wady zgryzu i staw skroniowo-żuchwowy, torbiele jamy ustnej, choroby gruczołów ślinowych, zapalenie jamy ustnej i błony śluzowej, anomalie rozwojowe na poziomie łuku), każda z lateralizacją — `null` czyści, lub `"left"`/`"right"`/`"bilateral"` |
| `exportFhir(options?)` | Eksportuj wykres jako kolekcję HL7 FHIR R4 Bundle (pobieranie JSON); opcjonalne odwołanie `{ subject }` |
| `importFhirBundle(input)` | Zaimportuj pakiet FHIR R4 Bundle (obiekt lub ciąg JSON) wygenerowany przez ten moduł |
| `exportImage(format)` | Pobierz wykres jako obraz — `"png"` lub `"jpg"` |
| `exportSvg()` | Pobierz wykres jako skalowalny SVG (wektorowy) |
| `hasAnyPerioData()` | `true`, jeśli jakakolwiek oś periodontalna jest udokumentowana gdziekolwiek w jamie ustnej |
| `exportPerioSvg()` / `exportPerioImage(format)` | Pobierz pełny wykres periodontalny jako samodzielny wektorowy SVG lub zrastrowany obraz |
| `exportPdf(opts)` | Pobierz raport PDF natywny dla jsPDF (zob. [Eksport](#-eksport) poniżej) |
| `getPdfSettings()` / `setPdfSettings(patch)` | Pobierz/zaktualizuj konfigurację raportu PDF (`PdfSettings`) |
| `exportStatus()` | Pobierz wykres statusu jako JSON |
| `importStatus(data)` | Zasil silnik wcześniej wyeksportowanym ładunkiem JSON (zob. [Format eksportu/importu statusu](#-format-eksportuimportu-statusu)) |
| `setImportFormat(format)` | Ustaw parser dla następnego importu pliku — `"status"` lub `"fhir"` |
| `startIntroTour()` | Uruchom interaktywną wycieczkę wprowadzającą |

### 💾 Trwałość stanu (localStorage)

Opcjonalna trwałość stanu przypadku odontogramu w `localStorage` (`core/persistence.ts`, reeksportowana z punktu wejścia pakietu). Domyślnie wyłączona — istniejące integracje nie są dotknięte, dopóki aplikacja hosta jej wyraźnie nie włączy, a wywołanie powinno nastąpić **po** zamontowaniu odontogramu (np. z `ngAfterViewInit()` komponentu, po tym jak `OdontogramShellComponent`/`OdontogramUiService` wywołał `init()` — przywrócenie odmalowuje aktywny DOM za pomocą `importStatus()`):

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

| Funkcja | Opis |
|---|---|
| `enablePersistence(options?)` | Przywraca wcześniej zapisany przypadek (jeśli istnieje) za pomocą `importStatus()`, a następnie zapisuje wykres statusu do `localStorage` przy każdej ustabilizowanej zmianie stanu (edycje są zbierane i zapisywane grupowo w krótkim, około 400-milisekundowym oknie czasowym — tzw. „debouncing” — dzięki czemu seria zmian, np. preset statusu, tworzy jeden zapis). Idempotentna — ponowne wywołanie zastępuje poprzednią subskrypcję/opcje. **Musi być wywołana po zamontowaniu odontogramu.** |
| `disablePersistence()` | Zatrzymuje zapisywanie (najpierw wymuszając zapis wszelkich oczekujących, zgrupowanych zmian); zapisany wpis pozostaje na miejscu. |
| `clearPersistedState()` | Usuwa zapisany wpis dla aktywnego (lub domyślnego) klucza. |
| `isPersistenceEnabled()` | `true`, gdy subskrypcja zmian stanu jest aktywna. |

**`PersistenceOptions`:**

| Pole | Typ | Domyślnie | Opis |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | Klucz `localStorage` — to własna, dosłowna wartość domyślna współdzielonego modułu rdzenia (niezmieniona przez port Angular); przekaż własny `key`, aby uniknąć kolizji z integracją po stronie React na tym samym originie, lub aby wyodrębnić przestrzeń nazw dla wielu hostów. |
| `includePlan` | `boolean` | `false` | Zapisuj też wykres planu (pole `plan` ładunku). |
| `onError` | `(err: Error) => void` | — | Wywoływana przy każdym błędzie zapisu/parsowania zamiast `console.warn`. |

Uwagi: nic nie jest odczytywane ani zapisywane w `localStorage`, dopóki nie zostanie wywołana `enablePersistence()`; zabezpieczenie rozmiaru 4 MB pomija zbyt duży zapis (zgłaszany przez `onError`/`console.warn`) zamiast rzucać wyjątek; każdy błąd zapisu/JSON — przekroczenie limitu, zablokowany iframe, uszkodzone lub nierozpoznane zapisane dane itd. — jest przechwytywany i zgłaszany. Ten moduł nigdy nie rzuca wyjątku.

Uwaga: włączenie trwałości przywraca zapisany przypadek za pomocą `importStatus()`, co zastępuje bieżący przypadek — łącznie z trwającym wykresem planu, jeśli zapisany ładunek go nie zawiera. Włączaj trwałość przy starcie (zaraz po zamontowaniu), a nie w trakcie sesji.

Uwaga: zapisany ładunek może zawierać dane identyfikujące pacjenta (imię i nazwisko pacjenta, data badania) w postaci jawnego tekstu w `localStorage`. Jeśli rejestrujesz takie dane, zapewnij ochronę na poziomie urządzenia lub usuń je za pomocą `clearPersistedState()`, gdy jest to właściwe.

### 💾 Format eksportu/importu statusu
Eksport tworzy plik JSON (wersja `2.22`; import akceptuje też starsze wersje `1.4` oraz `2.0` do `2.21` i migruje je automatycznie) zawierający:

**Pola globalne:**
- `wisdomVisible` - widoczność zębów mądrości
- `showBase` - widoczność warstwy kości
- `occlusalVisible` - aktywny widok okluzyjny
- `showHealthyPulp` - widoczność zdrowej miazgi
- `edentulous` - aktywny tryb bezzębności

**Pola na ząb (32 zęby):**
- `toothSelection` - podstawowy typ zęba
- `toothSubstrate` - podłoże zęba (naturalne/radix/złamane/crownprep), niezależne od jakiejkolwiek odbudowy
- `restorationType` - typ odbudowy (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - materiał odbudowy (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), powiązany z `restorationType`
- `prosthesis` - oś ruchoma/łącznikowa (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), wykluczająca się wzajemnie ze stałym `restorationType` korona/most
- `crownLeakage` - flaga nieszczelności brzeżnej korony, istotna tylko gdy `restorationType` to korona lub most
- `endo` - stan endodontyczny; wyklucza się wzajemnie z `pulpDx`
- `mods` - tablica modyfikacji (zapalenie, przyzębie); `inflammation` dotyczy wyłącznie zębów brakujących/w zębodole poekstrakcyjnym
- `caries` - aktywne powierzchnie z próchnicą
- `cariesActiveDepth` - wartość głębokości ICDAS przygotowywana przez selektor głębokości próchnicy przy zastosowaniu nowej powierzchni
- `rootCaries` - stopień zaawansowania próchnicy korzenia (none/active/arrested/active-cavitated)
- `cariesSeverity` - ujednolicona ciężkość na powierzchnię (0-6): głębokość ICDAS na powierzchni pierwotnej (bez wypełnienia), wynik CARS na powierzchni wtórnej (z wypełnieniem)
- `radiographicDepth` - radiologiczna głębokość próchnicy na powierzchnię (none/E1/E2/D1/D2/D3), niezależna od wizualnej skali ICDAS/CARS
- `fillingMaterial` - materiał wypełnienia
- `fillingSurfaces` - powierzchnie wypełnione
- `fillingSurfaceMaterials` - materiał wypełnienia na powierzchnię (mieszane wypełnienia, np. policzkowe amalgamat + dystalne kompozyt)
- `fillingDefect` - wada wypełnienia na powierzchnię (none/marginal/fracture/wear), uwarunkowana wypełnioną powierzchnią, niezależna od próchnicy wtórnej
- `pulpDx` - diagnoza miazgi wg AAE (normal/reversible-pulpitis/irreversible-pulpitis/necrosis)
- `pulpLatin` - praktyczny łaciński podtyp miazgi (pokazywany przez selektor miazgi tylko gdy `pulpDetailLevel` ma wartość `latin`)
- `apicalDx` - diagnoza okołowierzchołkowa determinująca symbol okołowierzchołkowy
- `periapicalType` - podtyp zmiany okołowierzchołkowej (none/granuloma/cyst); dawna wartość `abscess` nadal akceptowana przy imporcie
- `resorptionType` - typ resorpcji korzenia (none/internal/external-cervical)
- `periImplant` - stan okołowszczepowy tylko dla implantów (none/mucositis/peri-implantitis-mild/-moderate/-severe), klasyfikacja World Workshop 2018
- `dxOverrides` - nadpisania kodowania diagnoz na ząb (wersja 2.21): obiekt indeksowany kluczem diagnozy ICD-10 → `add` | `suppress`, wymuszający włączenie kodowanej diagnozy mimo braku pasującego wyniku na wykresie, lub jej wyłączenie mimo jego obecności; kształtuje efektywny zestaw kodowany eksportowany jako FHIR `Condition`
- `endoResection` - flaga apikoektomii
- `fissureSealing` - flaga lakowania bruzd
- `calculus` - flaga kamienia nazębnego
- `contactMesial` / `contactDistal` - utrata punktu stycznego mezjalnego/dystalnego
- `wearEdge` - typ starcia siecznego/okluzyjnego (none/attrition/erosion)
- `wearCervical` - typ starcia szyjkowego (none/abrasion/abfraction/erosion)
- `discoloration` - przyczyna przebarwienia na ząb (none/tetracycline/fluorosis/nonvital/extrinsic/other)
- `orthoAppliance` - aparat ortodontyczny (none/bracket/band)
- `orthoDrift` - przemieszczenie ortodontyczne (none/mesial/distal)
- `orthoVertical` - pionowy ruch ortodontyczny (none/extrusion/intrusion)
- `orthoRotation` - flaga rotacji ortodontycznej
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - lokalizacje złamań
- `extractionWound` - rana po ekstrakcji
- `extractionPlan` - planowana ekstrakcja
- `parapulpalPin` - flaga wkładu parapulpalnego
- `bridgePillar` - ząb jako filar mostu
- `mobility` - stopień ruchomości (none/m1/m2/m3)
- `crownNeeded` - wskaźnik wymaganej korony
- `crownReplace` - wskaźnik konieczności wymiany korony
- `missingClosed` - luka zamknięta po ekstrakcji
- `customStates` - niestandardowe stany wtyczek (obiekt, indeksowany po identyfikatorze wtyczki)
- `note` - tekstowa notatka do zęba (ciąg znakowy, opcjonalny — obecny tylko gdy niepusty)

**Pole najwyższego poziomu `plan` (wersja 2.11+):**
- `plan` - opcjonalny obiekt o tym samym kształcie co `teeth` (pola na ząb powyżej), przechowujący wykres **planu** (zamierzonego leczenia). Obecny tylko wtedy, gdy wykres planu został zainicjowany ORAZ jego zawartość różni się od wykresu statusu. Przy imporcie brak `plan` czyści/dezinicjalizuje wykres planu; obecność `plan` przywraca wykres planu obok statusu. Można go też odczytywać/zapisywać niezależnie za pomocą `getPlanChart()`/`setPlanChart()`.

**Pole najwyższego poziomu `case` (wersja 2.17+, rozszerzone w 2.18, 2.19, 2.20 i 2.22):**
- `case` - opcjonalny obiekt przechowujący metadane na poziomie przypadku (nie na ząb), współdzielone zarówno przez wykres statusu, jak i planu. Pomijany, gdy pusty. Pola (każde pomijane, gdy ma wartość domyślną): `age`; `smokingStatus` (+ `cigarettesPerDay`); `diabetesStatus` (+ `hba1c`); `toothLossPerio`; `maxRblPercent`; cztery przeceny klinicysty na oś klasyfikacji z 2017 r. — `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`; `patientName` / `examDate`; `patientDob`; oraz (wersja 2.22) `caseConditions` — diagnozy przypadku/regionalne (wady zgryzu i staw skroniowo-żuchwowy K07, torbiele jamy ustnej K09, choroby gruczołów ślinowych K11, zapalenie jamy ustnej i błony śluzowej K12/K13, anomalie rozwojowe na poziomie łuku K00), każda przypisana do lateralizacji (nieokreślona/lewa/prawa/obustronna). Odczytywane/zapisywane za pomocą `getCaseMeta()`/`getCaseConditions()` i powyższych metod `set*`/`setCaseCondition()`. Imię i nazwisko pacjenta, data urodzenia oraz data badania to wyłącznie metadane tożsamości wykresu — **nie** są częścią eksportu FHIR.

### 🖨️ Eksport
`exportFhir()` jest czysty wg walidatora HL7: każdy wpis Bundle niesie deterministyczny `id` i bezwzględny `fullUrl` (bez placeholderów `urn:uuid`), a Bundle osadza własny CodeSystem silnika, dzięki czemu jego lokalne kody rozwiązują się podczas walidacji (publikowany też pod `projects/angular-advanced-odontogram/src/lib/fhir/`; przekaż `includeCodeSystem: false`, aby go pominąć).

Dane periodontalne odzwrotnie zapisują się teraz też przez import FHIR, nie tylko przez ładunek JSON: `importFhirBundle()` odczytuje panele periodontalne LOINC `74029-0` z powrotem do rekordu periodontalnego każdego zęba — głębokość sondowania, brzeg dziąsłowy (odtworzony z CAL, dzięki czemu wartości pseudokieszonki są zachowane), BOP, furkację, płytkę O'Leary, wskaźniki PI/GI oraz implantowe mPI/mBI i szerokość dziąsła skeratynizowanego — plus obserwacje dowodowe statusu palenia i HbA1c na poziomie przypadku. Ropienie jest jedynym wyjątkiem: pozostaje wyłącznie w JSON, ponieważ nie jest częścią eksportu FHIR.

Poza własnym eksportem Status JSON / FHIR / PNG / JPG / SVG odontogramu, **wykres periodontalny** ma własną ścieżkę eksportu:
- **Perio SVG/PNG/JPG:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` renderują pełny wykres periodontalny jako jeden samodzielny wektorowy SVG, niezależnie od zamontowanego DOM `PerioChartComponent`. Wyłączone, gdy `hasAnyPerioData()` zwraca false.
- **Raport PDF:** pozycja menu eksportu „Raport PDF…” otwiera `ExportOptionsModalComponent` — okno dialogowe ustawień (pola imienia pacjenta, daty urodzenia i daty badania, połączone bezpośrednio z metadanymi przypadku, przy czym data badania domyślnie ustawiana jest na dzisiejszą; pola wyboru sekcji: dane pacjenta, wykres odontogramu, opis odontogramu, notatki indywidualne — wyłączone, gdy żaden ząb nie ma notatki — status periodontalny, opis periodontalny) przed wywołaniem `exportPdf(opts)` za pomocą tokenu wstrzykiwania `EXPORT_PDF_FN`. Puste pola tożsamości zastępowane są wartościami domyślnymi (`"John Doe"` / `"1980-01-01"`, konfigurowalnymi za pomocą `PdfSettings.defaultName`/`defaultDob`), dzięki czemu eksport zawsze się powiedzie. PDF jest składany natywnie w jsPDF — tekst wektorowy za pomocą `.text()`, rastrowe obrazy zęba/wykresu periodontalnego za pomocą `.addImage()` — bez zależności od `svg2pdf.js`. Sekcja notatek indywidualnych jest automatycznie pomijana, gdy żaden ząb nie ma notatki, a obie sekcje periodontalne — gdy `hasAnyPerioData()` zwraca false, niezależnie od pól wyboru w oknie dialogowym.
- **Konfiguracja raportu (`PdfSettings`, zakładka Ustawienia → Eksport, odczyt/zapis za pomocą `getPdfSettings()`/`setPdfSettings(patch)`):** domyślne imię pacjenta/data urodzenia, czy pokazywać wiek, format daty (ISO/DMY/MDY), motyw kolorystyczny (niebieski/turkusowy/bursztynowy/łupkowy), widoczność kości/miazgi odontogramu, odstępy między zębami/obramowanie/rozmiar numeru zęba na obrazie wykresu, czy dołączyć opis tekstowy i tabelę wyników, odpowiadające opcje odstępów/rozmieszczenia etykiet/rozmiaru czcionki wykresu periodontalnego oraz czy dołączyć tabelę metryk periodontalnych i słowniczek skrótów, zastrzeżenie medyczne (tekst domyślny lub niestandardowy), znacznik generatora/wersji oraz grupowanie podsumowania uzębienia (cała jama ustna / szczęka / kwadrant / sekstant — steruje też tabelą panelu informacji o zębach na ekranie).
- **Ograniczenie mPI/mBI do implantów:** wskaźniki Mombelli okołowszczepowe (mPI/mBI) są renderowane jako wiersze tylko w łuku zawierającym co najmniej jeden ząb z implantem — zarówno na żywym wykresie periodontalnym, jak i w eksportach SVG/PDF.
- Imię i nazwisko pacjenta, data urodzenia oraz data badania to wyłącznie metadane tożsamości wykresu (ładunek `2.20`, addytywny) — **nie** są częścią eksportu FHIR.

### 📁 Struktura folderów
- `projects/angular-advanced-odontogram/src/public-api.ts` - publiczny punkt wejścia pakietu (każdy eksport reeksportowany stąd)
- `projects/angular-advanced-odontogram/src/lib/core/odontogram.ts` - silnik kliniczny bez zależności od frameworka: warstwowanie SVG, zarządzanie stanem zębów, interakcje dotykowe, nakładki wtyczek, ustawienia, eksport/import
- `projects/angular-advanced-odontogram/src/lib/core/persistence.ts` - opcjonalna trwałość stanu w localStorage
- `projects/angular-advanced-odontogram/src/lib/core/theme.ts` - typ `OdontogramThemeConfig` i narzędzie `applyThemeConfig()`
- `projects/angular-advanced-odontogram/src/lib/core/plugin.ts` - typ `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, priorytety z-index `LAYER_Z`
- `projects/angular-advanced-odontogram/src/lib/core/pluginSanitize.ts` - `sanitizePluginSvg()`, sanitizer oparty na DOMPurify, przez który przechodzą dane wyjściowe `renderSvg()` wtyczki przed wstawieniem do aktywnego wykresu
- `projects/angular-advanced-odontogram/src/lib/core/tour.ts` - prowadzona wycieczka wprowadzająca
- `projects/angular-advanced-odontogram/src/lib/core/perioClassification.ts` - wyprowadzanie klasyfikacji periodontalnej World Workshop 2017
- `projects/angular-advanced-odontogram/src/lib/core/perioExport.ts` / `perioGraphic.ts` / `perioIndexNames.ts` - renderowanie SVG wykresu periodontalnego całej jamy ustnej
- `projects/angular-advanced-odontogram/src/lib/core/perioPdf.ts` - czysty składacz jsPDF raportu PDF (`assemblePdf`)
- `projects/angular-advanced-odontogram/src/lib/core/status_extras.ts` - 22 predefiniowane szablony uzupełnień
- `projects/angular-advanced-odontogram/src/lib/core/i18n/` - tłumaczenia, po jednym leniwie ładowanym module na język pod `i18n/locales/` (angielski statycznie, pozostałych 11 pobieranych przez `i18n/loader.ts` przy pierwszym użyciu) i szyna i18n bez zależności od frameworka
- `projects/angular-advanced-odontogram/src/lib/core/dx/` - kodowanie diagnoz oparte na standardach: reguły wyprowadzania (`derive.ts`), katalog diagnoz ICD-10 (`codes.ts`/`caseCodes.ts`), krajowe pakiety kodowania — BNO-10/ICD-10-CM (`packs.ts`) — oraz warstwa dopracowania ICD-10-CM/SNOMED CT (`refine.ts`)
- `projects/angular-advanced-odontogram/src/lib/core/anatomy/` - profile anatomii zęba (`classic`/`measured`); szablony `measured` zmierzone na podstawie literatury (`measured.ts`) ładują się jako osobny leniwy chunk
- `projects/angular-advanced-odontogram/src/lib/core/utils/numbering.ts` - konwersja numeracji FDI, Universal, Palmer
- `projects/angular-advanced-odontogram/src/lib/core/registry/` - deklaratywny rejestr osi klinicznych: mapowania pól FHIR, aktywacja zestawu czyszczenia SVG/flag logicznych, macierz typ×materiał odbudowy, listy opcji interfejsu
- `projects/angular-advanced-odontogram/src/lib/core/fhir/` - eksport/import HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, `toFhirDx.ts`/`importConditions.ts` (Condition diagnoz), `importPerio.ts` (Observations periodontalne), systemy kodów, mapowania pól, prymitywy
- `projects/angular-advanced-odontogram/src/lib/fhir/` - publikowany `CodeSystem-odontogram.json` wraz z wygenerowanym zestawem `ValueSet-odontogram-*.json` (po jednym na grupę wartości osi klinicznej, jeden dla typów wyników, jeden zestaw wszystkich kodów)
- `projects/angular-advanced-odontogram/src/lib/core/bridgeOverlay.ts` - nakładka łącznika odcinka mostu wielozębowego
- `projects/angular-advanced-odontogram/src/lib/core/fonts/` - dołączone czcionki Unicode PDF (kształtowanie arabskie, CJK) + loader czcionek
- `projects/angular-advanced-odontogram/src/lib/core/assets/` - źródłowe pliki SVG zębów/ikon (`teeth-svgs/`, `teeth-svgs/measured/`, `icon-svgs/`)
- `projects/angular-advanced-odontogram/src/lib/core/generated/` - pliki SVG skompilowane do wbudowanych modułów TypeScript (`npm run gen:assets`)
- `projects/angular-advanced-odontogram/src/lib/core/__tests__/` + `registry/__tests__/` - przeniesiony korpus testów, wraz ze złotymi fixturami `parity/`
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/` - `OdontogramShellComponent`, powłoka typu wszystko w jednym
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-ui.service.ts` - `OdontogramUiService`, warstwa stanu/efektów komponowalnego interfejsu
- `projects/angular-advanced-odontogram/src/lib/components/engine-state.ts` - helper sygnału `engineState()`
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-engine-lifecycle.ts` - token DI `ODONTOGRAM_ENGINE_LIFECYCLE`
- `projects/angular-advanced-odontogram/src/lib/components/surfaces/` - cztery powierzchnie prezentacyjne (pasek górny, wykres, informacje o zębie, kontrolki zęba) oraz, pod `surfaces/cards/`, osiem deklaratywnych kart sterujących (w tym `DiagnosesCardComponent`)
- `projects/angular-advanced-odontogram/src/lib/components/settings-modal/` - `SettingsModalComponent` (okno dialogowe ustawień o 7 zakładkach)
- `projects/angular-advanced-odontogram/src/lib/components/export-options-modal/` - `ExportOptionsModalComponent` i token DI `EXPORT_PDF_FN`
- `projects/angular-advanced-odontogram/src/lib/components/credits-modal/` - `CreditsModalComponent`
- `projects/angular-advanced-odontogram/src/lib/components/case-diagnoses-modal/` - `CaseDiagnosesModalComponent`, popup diagnoz przypadku/regionalnych dla całej jamy ustnej
- `projects/angular-advanced-odontogram/src/lib/components/perio-chart/` / `perio-sidebar/` - samodzielny/wbudowany wykres periodontalny i jego pasek boczny kontekstu
- `projects/angular-advanced-odontogram/src/lib/components/dual-state-confirm/` - współdzielone okno dialogowe potwierdzenia (edycje wpływające na status↔plan)
- `projects/angular-advanced-odontogram/src/lib/components/shared/dialog-focus.ts` - współdzielone helpery pułapki fokusu/przywracania okna modalnego
- `projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.ts` - `I18nService`, reaktywna fasada Angular nad szyną i18n rdzenia
- `projects/demo/` - aplikacja demo Angular (`ng serve` / `npm run build:demo`)
- `scripts/generate-svg-assets.mjs` - generator `npm run gen:assets`

### ⚙️ Stos technologiczny
- Angular 21 (komponenty standalone, sygnały) + Angular CLI (`@angular/build`) + TypeScript
- `ng-packagr` do budowania biblioteki (`ng build angular-advanced-odontogram`)
- Tailwind CSS do stylowania interfejsu, kompilowany raz do statycznego arkusza stylów (`npm run build:styles` → `projects/angular-advanced-odontogram/styles.css`) — konsumenci rejestrują ten arkusz stylów, sami nie uruchamiają Tailwinda
- Warstwowanie SVG przez manipulację DOM w rdzeniu bez zależności od frameworka (stan niereaktywny dla Angulara, ze względu na wydajność — ten sam silnik, którego używa oryginał w React)
- Lekki, niestandardowy system i18n bez zależności od frameworka (`core/i18n/`), owinięty przez `I18nService` do reaktywnego wiązania w szablonach Angular
- Dwa runnery testów: zwykły Vitest dla korpusu rdzenia (`vitest run`), integracja Vitest z `@angular/build:unit-test` Angulara dla specyfikacji komponentów (`ng test`); `@testing-library/jest-dom` do matcherów DOM
- TypeDoc do dokumentacji API (`npm run docs`, wynik w `docs/api/`)
- jsPDF do raportu PDF; DOMPurify do sanityzacji wyjścia wtyczek

### 📝 Uwagi
- Szablony SVG i ikony są kompilowane do generowanych modułów TypeScript w czasie budowania (`npm run gen:assets`) — nie ma żadnego pobierania zasobów w czasie działania ani niczego do serwowania z folderu publicznego.
- Silnik odontogramu używa własnego wewnętrznego stanu bez zależności od frameworka (nie sygnałów Angular) dla siatki SVG, ze względu na wydajność i aby pozostać identycznym z oryginałem w React; komponenty Angular odczytują go reaktywnie za pomocą `engineState()`/`I18nService`/`onStateChange()`, zamiast posiadać go samodzielnie.
- Zęby mleczne mają ograniczony zestaw dostępnych materiałów (bez wypełnień amalgamatowych, bez endodoncji opartej na wkładach).
- Zęby z implantami mają inny zestaw opcji korony/filara niż zęby naturalne.

### 🔒 Uwagi dotyczące bezpieczeństwa

- **Wtyczki działają jako zaufany kod.** Zwracana wartość `renderSvg()` wtyczki jest wstrzykiwana do SVG aktywnego wykresu. To wyjście jest oczyszczane przez [DOMPurify](https://github.com/cure53/DOMPurify) (profil SVG, plus `svgFilters`) przed wstawieniem — `<script>`, `<iframe>`, `<object>`, `<embed>` i `<foreignObject>` są całkowicie zabronione, a w pełni złośliwe dane wyjściowe są odrzucane zamiast częściowo renderowane. Zmniejsza to zasięg skutków skompromitowanej lub błędnej wtyczki, ale wtyczki nadal powinny być ładowane wyłącznie z zaufanych źródeł — sanityzacja to siatka bezpieczeństwa, a nie substytut weryfikacji.
- **Content-Security-Policy.** Ten pakiet nie wstrzykuje własnej polityki CSP, gdy jest osadzony jako biblioteka. Aplikacje hosta renderujące `OdontogramShellComponent` powinny ustawić własną politykę CSP odpowiednią dla swojego wdrożenia; rozsądny punkt wyjścia odzwierciedla politykę wersji demo oryginalnego projektu React:

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

### 📖 Jak cytować

Ten pakiet nie posiada własnego rekordu cytowania — jest to port, który współdzieli swój silnik kliniczny, dosłownie, z projektem oryginalnym. Jeśli używasz tego oprogramowania w badaniach, zacytuj oryginał:

> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Wszystkie wersje (DOI koncepcyjny):** https://doi.org/10.5281/zenodo.21156787

Metadane cytowania w formacie maszynowym znajdują się w pliku [`CITATION.cff`](https://github.com/ZoliQua/React-Advanced-Odontogram/blob/main/CITATION.cff) projektu oryginalnego.

## 🙌 Podziękowania

Angular Advanced Odontogram jest tworzony i utrzymywany przez Zoltana Dula ([@ZoliQua](https://github.com/ZoliQua)), twórcę i głównego programistę tego portu oraz leżącego u jego podstaw silnika klinicznego. To samo okno w aplikacji (pasek górny → „O aplikacji i podziękowania") wymienia te same nazwiska.

**Projekt oryginalny**

- [React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram) (npm: [`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)): oryginalna implementacja w React, której portem jest ten pakiet — silnik kliniczny (logika statusu zębów, wykres periodontalny, kodowanie diagnoz, eksport/import FHIR, ciągi i18n, wycieczka, szablony SVG) jest współdzielony dosłownie.

**Zbudowano przy użyciu** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [Angular](https://angular.dev), [Angular CLI](https://angular.dev/tools/cli), [TypeScript](https://www.typescriptlang.org) i [Tailwind CSS](https://tailwindcss.com).

Wkład jest mile widziany — zob. [`CONTRIBUTING.md`](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/CONTRIBUTING.md). Jeśli ten projekt jest dla Ciebie przydatny, [zostaw mu gwiazdkę na GitHub](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
