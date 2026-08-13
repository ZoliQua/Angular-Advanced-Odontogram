<p align="center">
  <img src="https://raw.githubusercontent.com/ZoliQua/Angular-Advanced-Odontogram/main/docs/angular-module-logo.png" alt="Angular Advanced Odontogram logo" width="160" />
</p>

# 🦷 Angular Advanced Odontogram

[![npm](https://img.shields.io/npm/v/angular-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/angular-advanced-odontogram)
[![Version](https://img.shields.io/badge/version-2.4.0-green?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/releases)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/LICENSE)

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:** 🇬🇧 [English](README-en.md) | 🇭🇺 [Magyar](README-hu.md) | 🇩🇪 [Deutsch](README-de.md) | 🇪🇸 [Español](README-es.md) | 🇫🇷 [Français](README-fr.md) | 🇮🇹 Italiano (questo file) | 🇵🇱 [Polski](README-pl.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇷🇺 [Русский](README-ru.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md)

---

## 📑 Indice

- [📋 Panoramica](#-panoramica)
- [📦 Utilizzo come pacchetto npm](#-utilizzo-come-pacchetto-npm)
- [✨ Funzionalità principali](#-funzionalità-principali)
- [📦 Moduli](#-moduli)
- [🛠️ Controlli dell'interfaccia](#-controlli-dellinterfaccia)
- [🦷 Tipi di dente e stati](#-tipi-di-dente-e-stati)
- [⚙️ Impostazioni](#-impostazioni)
- [🖼️ Sistema di template SVG](#-sistema-di-template-svg)
- [🔢 Sistemi di numerazione](#-sistemi-di-numerazione)
- [🚀 Utilizzo](#-utilizzo)
- [🔗 Integrazione](#-integrazione)
- [🧪 Test](#-test)
- [📖 Documentazione API](#-documentazione-api)
- [📡 API pubblica](#-api-pubblica)
- [💾 Persistenza dello stato (localStorage)](#-persistenza-dello-stato-localstorage)
- [💾 Formato di esportazione/importazione dello stato](#-formato-di-esportazioneimportazione-dello-stato)
- [🖨️ Esportazione](#-esportazione)
- [📁 Struttura delle cartelle](#-struttura-delle-cartelle)
- [⚙️ Stack tecnologico](#-stack-tecnologico)
- [📝 Note](#-note)
- [🔒 Note sulla sicurezza](#-note-sulla-sicurezza)
- [📖 Come citare](#-come-citare)

## 🇮🇹 Italiano

### 📋 Panoramica

Questo progetto è un editor di odontogramma interattivo basato su browser per **Angular + TypeScript**, che supporta una registrazione rapida dello stato dentale con un'interfaccia pulita. Renderizza template SVG dentali a strati per rappresentare restauri, carie, stato endodontico, mobilità e altri dettagli clinici, offrendo selezione multipla, filtri di selezione e preset di stato predefiniti.

**Questo è il port ufficiale in Angular di [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)** (npm: `react-advanced-odontogram`). Parità funzionale con react-advanced-odontogram main @ commit `934a911` (successivo alla v2.4.0; versione del payload invariata a 2.20) — le esportazioni JSON e FHIR R4 sono interscambiabili tra le due librerie. Il motore clinico (`projects/angular-advanced-odontogram/src/lib/core/`) è condiviso, testualmente identico — la logica dello stato dentale, la registrazione parodontale, l'esportazione/importazione FHIR, le stringhe i18n, il tour guidato e i template SVG sono identici byte per byte all'originale React, ricopiati da un commit upstream fissato a ogni risincronizzazione; solo il guscio dei componenti (`projects/angular-advanced-odontogram/src/lib/components/`) è nativo Angular. Esiste un piccolo insieme di deviazioni esplicitamente documentate (solo stringhe di branding/identità — vedi la specifica di progettazione del port in questo repository). Il versionamento procede in lockstep con quello del modulo React.

---
![Odontogram editor preview](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_en_odontogram.png)
*Screenshot dal progetto React originale — il port Angular visualizza un'interfaccia identica.*

🔗 **Demo live:** https://angular-advanced-odontogram.vercel.app/

---

### 📦 Utilizzo come pacchetto npm

L'odontogramma è distribuito come libreria di componenti Angular autonoma su npm:
[`angular-advanced-odontogram`](https://www.npmjs.com/package/angular-advanced-odontogram).

#### Requisiti
- **Angular 21.2+** (dichiarato come peer dependency — fornito dalla tua app).
- Un **bundler** che comprenda il campo `exports` ed ESM — la Angular CLI (`@angular/build`) è adatta già pronta all'uso. Il pacchetto è **solo ESM**.
- Node **≥ 20** per gli strumenti di build.

#### Installazione

```bash
npm install angular-advanced-odontogram
```

#### Utilizzo di base

Registra il foglio di stile **una sola volta**, ovunque siano configurati gli stili globali della tua app (es. `angular.json`):

```json
"styles": [
  "node_modules/angular-advanced-odontogram/styles.css",
  "src/styles.css"
]
```

Poi renderizza `OdontogramShellComponent`:

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

`language` accetta `hu | en | de | es | it | sk | pl | ru | pt-br | zh | ar | fr`; `numberingSystem` accetta `FDI | UNIVERSAL | PALMER`.

#### Input del componente

`OdontogramShellComponent` è un componente controllato — ogni input è un signal `input()` di Angular, tutti opzionali, ciascuno ricade sul valore predefinito del motore stesso quando omesso. I più comuni:

| Input | Tipo | Predefinito | Descrizione |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | Lingua dell'interfaccia (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`zh`/`ar`/`fr`). |
| `numberingSystem` | `"FDI" \| "UNIVERSAL" \| "PALMER"` | `"FDI"` | Sistema di numerazione dei denti. |
| `darkMode` | `boolean` | `false` | Attivazione del tema scuro. |
| `readOnly` | `boolean` | `false` | Disabilita tutte le modifiche (sola visualizzazione). |
| `themeConfig` | `OdontogramThemeConfig` | — | Sovrascrive le variabili CSS del tema (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Registra plugin di stato personalizzati / livelli aggiuntivi. |
| `enableNotes` | `boolean` | `false` | Abilita le note per dente. |
| `enableIcdas` | `boolean` | `false` | Abilita il punteggio delle carie ICDAS II. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Complessità della scheda otturazioni: `"simple"` (un materiale per dente) o `"complex"` (materiali per superficie). |
| `fillingDefectEnabled` | `boolean` | `true` | Abilita i riscontri di difetti dell'otturazione sulla scheda Otturazioni. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | tutti disponibili | Materiali di otturazione disponibili come mappa booleana su `amalgam`/`composite`/`gic`/`temporary` (le chiavi sconosciute vengono ignorate). |
| `fissureSealingEnabled` | `boolean` | `true` | Abilita la sigillatura dei solchi sulla scheda Otturazioni. |
| `languageChange` / `numberingChange` / `darkModeChange` (output) | `output<T>` | — | Emesso quando l'utente modifica l'impostazione dall'interfaccia. |
| `fillingComplexityChange` / `fillingDefectEnabledChange` / `fillingMaterialAvailabilityChange` / `fissureSealingEnabledChange` (output) | `output<T>` | — | Emesso quando l'utente modifica l'impostazione corrispondente da Impostazioni → Otturazioni. |

Sono accettati anche input più granulari a livello di dettaglio (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `cariesDepthEnabled`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) — consulta `odontogram-shell.component.ts` per l'elenco completo e tipizzato.

I quattro input di otturazione sopra sono **solo di ripristino**: un input omesso non scrive mai nel motore (una chiamata imperativa a `setFillingComplexity()` prima del montaggio viene preservata), mentre un input fornito scrive insieme il motore e lo stato del modal Impostazioni, così il modal non mostra mai un valore obsoleto. `fillingMaterialAvailability` viene applicata per diff rispetto a una chiave serializzata canonica, cosicché un nuovo render con un letterale oggetto di contenuto identico non riscriva mai il motore. I corrispondenti output `*Change` scattano da Impostazioni → Otturazioni — il percorso di riscrittura per gli host che persistono le preferenze.

#### API pubblica (export con nome)

`OdontogramShellComponent` è un export con nome. L'API di stato imperativa, il componente autonomo `PerioChartComponent`, il tour guidato e tutti i tipi pubblici sono export con nome dallo stesso punto di ingresso:

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
  clearSelection,
  registerPlugins, setPluginState, getPluginState,
  startIntroTour,               // launch the onboarding tour
  // …and many more setX/getX settings functions
} from "angular-advanced-odontogram";
```

La superficie completa (ben oltre 100 funzioni e tipi — `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PdfSettings`, `PerioViewMode`, e molti altri) è completamente tipizzata nelle dichiarazioni `.d.ts` incluse nel bundle; vedi [API pubblica](#-api-pubblica) di seguito per la tabella di riferimento selezionata.

#### Superfici componibili (avanzato)

`OdontogramShellComponent` è il componente all-in-one supportato e non richiede alcuna configurazione aggiuntiva. Se hai bisogno di collocare le regioni dell'odontogramma in aree diverse del tuo layout, anche le quattro superfici dell'interfaccia della shell vengono esportate e possono essere composte sotto un unico `OdontogramUiService`, tutte condividendo un'unica sessione di proprietà dell'istanza:

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

`OdontogramUiService` accetta la stessa forma di configurazione degli input di `OdontogramShellComponent` (il suo metodo `configure()` accetta un oggetto `OdontogramUiConfig` di `Signal`/callback, ogni campo opzionale con lo stesso valore predefinito upstream). Vincolo attuale: un'istanza di `OdontogramUiService` per pagina (il motore è un singleton a livello di modulo). Le superfici possono essere montate e smontate su richiesta. `OdontogramShellComponent` stesso è invariato — è esattamente questa composizione nella disposizione predefinita, che continua a collegare esplicitamente ogni campo dai propri input.

Per una composizione ancora più fine, vengono esportate anche le singole schede di controllo:

| Componente | Selettore | Copre |
|---|---|---|
| `StatusesCardComponent` | `aao-statuses-card` | Controlli di stato/preset per l'intera bocca (Reset, dentizione primaria/mista, edentulo, extra di stato) |
| `ToothDetailsCardComponent` | `aao-tooth-details-card` | Riga base (selezione/substrato del dente), caselle di spunta corona fratturata, interruttori corona necessaria/sostituzione |
| `CariesCardComponent` | `aao-caries-card` | Modalità profondità carie, carie sottocoronale, gravità carie radicolare, selettore carie per superficie |
| `FillingsCardComponent` | `aao-fillings-card` | Materiale otturazione, selettore otturazione per superficie + difetti, note di suggerimento carie secondaria/difetto |
| `RootPeriodontiumCardComponent` | `aao-root-periodontium-card` | Stato polpa/endodonzia, diagnosi apicale, riassorbimento, mobilità, stato peri-implantare |
| `OrthodonticsCardComponent` | `aao-orthodontics-card` | Apparecchio, deriva, movimento verticale, rotazione |
| `SurfaceCrossComponent` | `aao-surface-cross` | Il widget condiviso di selezione a croce B/M/O/D/L usato internamente dalle schede Carie/Otturazioni |

Ogni scheda è un componente dichiarativo autonomo che legge e scrive la sessione condivisa tramite `inject(OdontogramUiService)` e l'helper esportato `engineState()` (una lettura, restituita come signal, di un qualsiasi getter del motore, mantenuta aggiornata tramite il bus di notifica dei cambiamenti del core). Monta solo le schede di cui un determinato layout ha bisogno, in qualsiasi disposizione, sotto un unico `OdontogramUiService`. Viene esportato anche `CreditsModalComponent` (`aao-credits-modal`, il popup "Informazioni e crediti" della barra superiore), per gli host che vogliono pilotarlo dal proprio stato di apertura/chiusura.

```ts
import { engineState, OdontogramUiService, getOdontogramSummary } from "angular-advanced-odontogram";

// Anywhere inside an injection context under an `OdontogramUiService`:
readonly summary = engineState(getOdontogramSummary); // Signal<OdontogramSummary>, kept fresh automatically
```

#### Punti di iniezione DI per il test lato host

Due `InjectionToken` permettono a un'app ospitante di sovrascrivere, nei propri test, le chiamate al motore che producono effetti collaterali (entrambi ricadono sulla chiamata reale del motore in produzione; entrambi sono `providedIn: "root"`):

| Token | Sovrascrive | Forma |
|---|---|---|
| `ODONTOGRAM_ENGINE_LIFECYCLE` | `initOdontogram()` / `destroyOdontogram()`, richiamate da `ngAfterViewInit()`/`ngOnDestroy()` di `OdontogramShellComponent` | `{ init: () => Promise<void>; destroy: () => void }` |
| `EXPORT_PDF_FN` | `exportPdf(opts)`, richiamata da `ExportOptionsModalComponent` su "Export" | `(opts: PdfExportOptions) => Promise<void>` |

Entrambi esistono perché le funzioni reali toccano il DOM/canvas/gli interni di `jsPDF`, che un ambiente di test headless non può fornire pienamente — sovrascrivili tramite l'array dei provider di `TestBed` di Angular nei test dei componenti della propria app ospitante.

#### Note importanti e limitazioni attuali
- **Solo ESM** — il pacchetto pubblica un singolo modulo ES (compilato con `ng-packagr`) più la relativa voce di dichiarazione dei tipi. È destinato alla risoluzione dei moduli tramite bundler; non esiste una build CommonJS.
- **Il foglio di stile è separato** — **devi** registrare `angular-advanced-odontogram/styles.css` una sola volta; non viene iniettato automaticamente. Lo stile è CSS globale ambito sotto `.odontogram-root` e guidato dalle variabili CSS `--odon-*`.
- **SSR / solo client** — il componente legge il DOM al montaggio, quindi deve essere eseguito nel browser; renderizzalo solo lato browser.
- **Le risorse sono autonome** — gli SVG dei denti e delle icone sono incorporati inline nel bundle in fase di build (moduli TypeScript generati, `npm run gen:assets`); non c'è **nessuna richiesta di risorse a runtime** da configurare e nulla di aggiuntivo da copiare nella cartella pubblica della tua app.
- **Un'istanza per pagina** in questa release — lo stato del motore è un singleton a livello di modulo (come nell'originale React), quindi renderizzare due istanze di `<aao-odontogram-shell>` sulla stessa pagina le farebbe condividere lo stato di un unico grafico.

---

### ✨ Funzionalità principali
- 🖱️ Selezione rapida e selezione multipla (CMD/CTRL + clic)
- 🦷 Tipi di dente: permanente, deciduo (da latte), impianto, sottogengivale, mancante
- 🦷 Substrato dentale (ortogonale a qualsiasi restauro): naturale, radix (residuo radicolare), fratturato, preparato per corona
- 👑 Restauri per tipo × materiale: corona / inlay / onlay / faccetta / ponte in e.max, oro, gradia, zirconio, metallo, metalloceramica, telescopico o provvisorio (l'onlay è disponibile solo in vista occlusale) — scelti da un unico selettore combinato a basso numero di clic "Fix: Corona – …"; le corone `metal` esistenti migrano a `metal-ceramic` (metalloceramica, PFM); gli impianti utilizzano lo stesso modello tipo × materiale, composto con un livello connettore per impianto. Il selettore è delimitato in base al tipo di dente: un impianto offre solo corona/ponte (più le sue cinque opzioni di attacco, di seguito); un dente mancante/spazio offre solo un elemento intermedio di ponte (più protesi parziale/totale rimovibile); un substrato `radix` nasconde interamente il controllo del restauro (nessun restauro può essere assegnato a un residuo radicolare)
- 🦿 Protesi rimovibili/su attacco sull'asse dedicato `prosthesis` (voci "Kivehető:" nel selettore combinato): abutment di guarigione dell'impianto, locator, locator con overdenture, barra, barra con overdenture; protesi parziale o totale rimovibile supportata dai denti
- 🌉 I denti di ponte visualizzano sia la cappa della corona sia il connettore a sella; un overlay del tratto di ponte multi-dente disegna un unico connettore continuo, sensibile all'arcata, attraverso i denti di ponte consecutivi (elementi intermedi + pilastri) e gli spazi tra i denti, incluso nell'esportazione PNG/JPG/SVG
- 🔍 Registrazione delle carie su 6 superfici: mesiale, distale, buccale, linguale, occlusale, sottocoronale
- 🪥 Materiali di otturazione per superficie: amalgama, composito, GIC, provvisorio
- 🏥 Un unico selettore combinato "Stato polpa / endodonzia" (raggruppato: polpa vitale vs. trattata/endodonzia): gli stati endodontici (otturazione medicinale, otturazione canalare, otturazione canalare incompleta, perno in fibra di vetro, perno metallico) e la diagnosi pulpare AAE (`pulpDx`: normale / pulpite reversibile / irreversibile / necrosi) si escludono a vicenda — un dente trattato endodonticamente (`endo` impostato) non può avere anche una diagnosi di polpa vitale; al momento del trattamento, `pulpDx` viene normalizzato a `normal`. Un'impostazione opzionale a 3 livelli di dettaglio pulpare (`pulpDetailLevel`: simple / AAE / latino pratico) mostra 9 sottotipi in latino pratico tramite `pulpLatin`
- 🦴 La diagnosi apicale (`apicalDx`: parodontite apicale sintomatica/asintomatica, ascesso apicale acuto/cronico, osteite condensante) determina direttamente il glifo periapicale; un qualificatore di sottotipo di lesione granuloma/cisti viene mostrato solo in presenza di parodontite apicale sintomatica/asintomatica
- 🩹 Scheda unificata "Radice e parodonto" (un'unica sezione a comparsa per i reperti radicolari/periapicali e parodontali)
- ⚕️ Modifiche: infiammazione periapicale (mostrata solo sui denti mancanti/con alveolo post-estrattivo; nascosta sui denti presenti e sugli impianti, dove se ne occupa `periImplant`), malattia parodontale, gradi di mobilità (M1/M2/M3, nascosti sugli impianti)
- 🦷🔩 Stato peri-implantare (`periImplant`: none / mucositis / peri-implantitis-mild / -moderate / -severe) — stadiazione del World Workshop 2018, mostrata come selettore dedicato sugli impianti
- 🏷️ Indicatori speciali: corona necessaria, sostituzione corona necessaria, spazio chiuso dopo estrazione, estrazione pianificata, sigillatura dei solchi, perdita del punto di contatto
- 👁️ Vista occlusale, denti del giudizio, attivazione/disattivazione visibilità di osso e polpa
- 🔢 12 filtri di selezione (tutti, presenti, permanenti, decidui, impianti, mancanti, superiori/inferiori, frontali/molari)
- 📊 Preset di stato predefiniti (ripristino, dentizione primaria, dentizione mista, edentulo)
- 📦 22 template di restauro predefiniti (ponti, protesi rimovibili, protesi su barra con impianti)
- 💾 Esportazione/importazione dello stato in JSON (versione 2.20; le importazioni continuano ad accettare le versioni legacy 1.4 e da 2.0 a 2.19 e vengono migrate automaticamente, con stati personalizzati dei plugin e note per dente)
- 💽 Persistenza opzionale su localStorage (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — disattivata per impostazione predefinita; salva automaticamente l'odontogramma di stato (e, opzionalmente, il piano) con un limite di sicurezza di 4 MB e gli errori di archiviazione/parsing instradati a un callback `onError` (o a `console.warn`) invece di generare un'eccezione
- 🔗 Esportazione HL7 FHIR R4 (Bundle di raccolta di Observation per dente, codifica dentale ISO 3950 per la dentizione permanente **e** per i denti decidui (51-85, con corrispondenza senza perdita di dati in importazione), sistema di codici locale); un componente di carie con una gravità registrata riporta anche una codifica del sistema di punteggio — ICDAS su una superficie primaria (non otturata), CARS su una ricorrente (otturata)
- ✚ Interfaccia di selezione superfici a croce (B/M/O/D/L) per carie e otturazioni — `SurfaceCrossComponent`, esportato per layout componibili
- 🧱 Materiali di restauro per superficie (otturazioni miste, es. buccale amalgama + distale composito)
- 🖼️ Esportazione immagine PNG/JPG/SVG dell'odontogramma (scaricabile; PNG/JPG rasterizzato da SVG vettoriale)
- 🦷 Carie/carie secondaria è una macchina a stati per superficie: una superficie cariata senza otturazione viene visualizzata come carie primaria (opacità a livelli ICDAS); non appena quella superficie ha un'otturazione, viene visualizzata invece come carie secondaria (ricorrente, punteggio CARS) — le due non sono mai attive contemporaneamente sulla stessa superficie
- 🎯 Gravità unificata per superficie (`cariesSeverity`, 0–6): letta come profondità ICDAS su una superficie primaria, come punteggio CARS con nome (Sano … Cavità estesa) su una ricorrente, tramite un popup contestuale che mostra solo la scala pertinente allo stato attuale della superficie
- 🌱 Carie radicolare (`rootCaries`: none / active / arrested / active-cavitated), che attiva il livello grafico dedicato alla carie radicolare con un'opacità determinata dalla gravità
- 📡 Profondità radiografica della carie (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 per superficie), indipendente dalla scala di gravità visiva ICDAS/CARS, mostrata come badge e sincronizzata tramite una propria Observation FHIR
- 🎚️ Tre impostazioni di granularità della carie (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) più un interruttore `cariesDepthEnabled`, che riducono ciascuna scala a una selezione più semplice senza perdere il valore memorizzato
- 🩹 Riga di riepilogo delle carie secondarie nel pannello otturazioni: elenca ogni dente selezionato con carie secondaria e le relative superfici
- 🪛 Difetti di otturazione per superficie (`fillingDefect`: none / marginal / fracture / wear) sui restauri diretti, indipendenti dalla carie ricorrente
- 🦷💥 Usura dentale tipizzata per causa clinica e localizzazione (`wearEdge`: none / attrition / erosion, incisale/occlusale; `wearCervical`: none / abrasion / abfraction / erosion, cervicale)
- 🎨 Discromia dentale per causa (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) su denti permanenti e decidui
- ✏️ I denti anteriori (incisivi/canini) etichettano la loro superficie occlusale come "incisale" in tutta l'interfaccia; la chiave di superficie memorizzata resta `occlusal`
- 🔤 Notazione delle superfici sensibile alla posizione (Impostazioni → Dettagli dentali → "Notazione superfici", simple/full, predefinito full): in modalità full la lettera e l'etichetta della superficie di carie/otturazione seguono l'anatomia del dente — occlusale → I/incisale sui denti anteriori, buccale → L/labiale sui denti anteriori, linguale → P/palatale sui denti superiori e L/linguale sui denti inferiori
- 🦷↕️ Registrazione ortodontica per dente (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: booleano) su un dente naturale presente (permanente o deciduo)
- 🪨 Tartaro, e riassorbimento radicolare tipizzato come interno o cervicale esterno (`resorptionType`)
- 📏 Profondità della carie per superficie (superficiale / dentina / profonda), o punteggio ICDAS II opzionale (0–6) tramite `enableIcdas`
- 🩹 Interruttore di microinfiltrazione marginale della corona, mostrato solo per un restauro a corona o ponte
- 🧰 Barra superiore di icone unificata con una finestra modale Impostazioni a schede (7 schede — Generale / Odontogramma / Grafico parodontale / Dettagli dentali / Carie / Otturazioni / Esportazione — vedi [Impostazioni](#-impostazioni) di seguito)
- 🦷🩺 Impostazioni → scheda "Grafico parodontale": un interruttore di disponibilità più 16 interruttori mostra/nascondi per indice per le righe del grafico parodontale, ciascuno con una descrizione, più un'opzione di visualizzazione del nome degli indici tradotta-vs-canonica
- 📋 Pannello informazioni dentali: riepilogo testuale in tempo reale dell'intero odontogramma (conteggio denti, elenchi presenti/mancanti, carie incl. secondaria, otturazioni, trattamenti canalari, protesi, impianti, stato parodontale) — visibile per impostazione predefinita, attivabile/disattivabile nelle Impostazioni
- 🗂️ Menu di esportazione unificato (Stato JSON / FHIR / PNG / JPG / SVG / report PDF), ciascun formato nascondibile in modo indipendente tramite Impostazioni → Generale
- 📥 Menu di importazione con importazione FHIR (ricarica i Bundle esportati), nascondibile in modo indipendente per fonte
- ⏳ Overlay di avanzamento durante l'esportazione delle immagini
- 🎓 Tour introduttivo interattivo (percorso guidato tra i controlli della shell)
- 🔢 Tre sistemi di numerazione (FDI, Universal, Palmer)
- 🌐 I18n — 12 lingue dell'interfaccia (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) con selettore di lingua; l'arabo visualizza l'interfaccia da destra a sinistra, con i grafici dentale e parodontale fissati da sinistra a destra
- 🌗 Supporto modalità scura con pulsante di attivazione (autonoma o controllata dall'app principale)
- 🎨 Configurazione tema personalizzato (input `themeConfig`) con proprietà CSS personalizzate (`--odon-*`)
- 📱 UX touch su mobile: popover zoom al tocco, menu contestuale con pressione prolungata, zoom a pizzico, target touch WCAG 44px, navigazione per arcata
- 🔌 Sistema di plugin SVG personalizzati: overlay visivi, stato personalizzato per dente, supporto esportazione/importazione JSON — l'output di `renderSvg()` dei plugin viene sanificato con DOMPurify (profilo SVG) prima di essere inserito nell'odontogramma live; i plugin continuano comunque a essere eseguiti come codice fidato, quindi vanno caricati solo da fonti attendibili
- ⚠️ Avvisi di validazione dello stato per combinazioni di stati dentali incompatibili
- 🏷️ Tooltip automatico dello stato sui riquadri dentali (mostra tutti gli stati attivi)
- 🩺 Tooltip per dente e pannello di riepilogo per l'intera bocca che mostrano l'intero set di reperti clinici (diagnosi pulpare/apicale, riassorbimento radicolare, stato peri-implantare, carie radicolare graduata, tartaro, microinfiltrazione marginale della corona, frattura, perdita di contatto, usura tipizzata del bordo/cervicale)
- ♿ Accessibilità da tastiera (WCAG): ruoli ARIA listbox/option, selezione con Invio/Spazio, navigazione con tasti freccia, contorni focus-visible
- 🔒 Modalità sola lettura: disabilita tutte le interazioni per casi d'uso di stampa/report/visualizzazione
- ✨ Animazioni di selezione: bordo tratteggiato pulsante e ombra luminosa sui denti selezionati (con supporto prefers-reduced-motion)
- 📝 Note per dente: doppio clic per aggiungere/modificare note, icona nota accanto al numero del dente, tooltip al passaggio del cursore con il testo della nota, una riga "Note individuali" nel pannello di riepilogo dell'intera bocca, inclusione nel report PDF, esportazione/importazione JSON
- 🔀 Divisione tra grafico Stato e Piano: un interruttore `Status | Plan` passa tra un grafico dello **stato** attuale e un grafico del **piano** (trattamento post-operatorio previsto), ciascuno con i propri stati dentali; esportazione/importazione hanno sempre come destinazione il grafico dello stato, mentre il grafico del piano viene letto/scritto separatamente tramite la propria API (vedi [API pubblica](#-api-pubblica)) e — quando differisce dallo stato — viene incluso come sezione aggiuntiva `plan` nell'esportazione JSON
- 📝 Riquadro "Cosa cambia": ogni volta che il piano differisce dallo stato attuale, elenca ogni differenza per dente e per asse di trattamento; disponibile anche a livello di programmazione tramite `getPlanChanges()`
- 🅿️ Stile "proposto": in modalità Piano, i reperti che il piano **aggiunge** rispetto allo stato attuale vengono visualizzati con un distinto contorno tratteggiato e colorato "proposto"
- 🚦 Restrizioni in modalità Piano: il grafico del Piano mostra solo ciò che un dentista può *fare* — i reperti di sola diagnosi (carie, usura dentale, discromia, l'intero blocco parodontale) sono nascosti; restauro, protesi, ortodonzia, necessità/sostituzione della corona e piano di estrazione restano pianificabili

![Full-mouth periodontal chart](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_en_perio.png)
*Screenshot dal progetto React originale — il port Angular visualizza un'interfaccia identica.*

- 🩺 Registrazione parodontale: per sito, **profondità di sondaggio**, **margine gengivale**, **sanguinamento al sondaggio** (+ suppurazione) nei sei siti standard per dente, con **livello di attacco clinico derivato (CAL = PD + margine gengivale)**, recessione e **%BOP** per l'intera bocca. Un **grafico parodontale per l'intera bocca** — ogni arcata disegnata come due SVG separati, buccale e palatale/linguale, con una **linea CEJ** rossa, una griglia guida in millimetri numerata e una curva margine gengivale/profondità della tasca, divisa da una fascia centrale degli indici parodontali che riporta la **classe di Miller** e **Placca/PI/GI/mPI/mBI** come tessere a diamante anatomiche per dente; inserimento con avanzamento automatico da tastiera; il grafico si adatta dinamicamente riempiendo la larghezza disponibile. Presentato come un interruttore di visualizzazione `Odontogram | Periodontal Status`, e comunque richiamabile separatamente tramite l'esportato `PerioChartComponent`. Esportazione **FHIR** per sito tramite il pannello parodontale LOINC (`74029-0`; PD `32910-2`, recessione `32911-0`, CAL `32912-8`)
- 🧪 Un'ampia suite di test automatizzati (vedi [Test](#-test)) che copre numerazione, traduzioni, preset, i18n, la shell, tema, touch, plugin, accessibilità e la parità degli assi clinici/diagnosi rispetto al corpus React congelato
- 📖 Documentazione API TypeDoc con commenti JSDoc su tutti gli export pubblici (`npm run docs`)

### 📦 Moduli
- 🦷 Griglia dell'odontogramma e interfaccia dei riquadri dentali (`OdontogramChartSurfaceComponent`)
- 🎛️ Pannello di controllo e stato (`ToothControlsSurfaceComponent` + le 7 schede dichiarative)
- 🎨 Motore di stratificazione SVG e template (core indipendente dal framework, `core/odontogram.ts`)
- 🔢 Numerazione dentale e mappatura delle etichette (FDI/Universal/Palmer, `core/utils/numbering.ts`)
- 🌐 Localizzazione — 12 lingue dell'interfaccia (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), incluso l'arabo (RTL) (`core/i18n/`, `I18nService`)
- 💾 Esportazione/importazione dello stato
- 📋 Extra di stato: template di restauro predefiniti
- 🎨 Configurazione del tema: palette di colori personalizzabile tramite proprietà CSS `--odon-*`
- 📱 Interazioni touch su mobile (zoom al tocco, pressione prolungata, zoom a pizzico, selettore arcata)
- 🔌 Sistema di plugin SVG personalizzati
- ⚠️ Sistema di validazione dello stato e tooltip
- ♿ Accessibilità da tastiera e supporto ARIA
- 🔒 Modalità sola lettura
- ✨ Animazioni di selezione
- 📝 Sistema di note per dente
- 🧱 **Interfaccia componibile** — `OdontogramUiService`, l'helper `engineState()`, 4 superfici presentazionali e 7 schede di controllo dichiarative, tutte esportate in modo indipendente (vedi [Superfici componibili](#-utilizzo-come-pacchetto-npm) sopra)
- 🧪 Suite di test automatizzati (corpus Vitest + `ng test`, vedi [Test](#-test))

### 🛠️ Controlli dell'interfaccia

**🔝 Barra superiore** (`OdontogramTopbarComponent`):
- Selettore di lingua (menu a tendina HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR)
- Pulsante modalità scura (icona sole/luna, alterna tra tema chiaro e scuro)
- Selettore del sistema di numerazione (menu a tendina FDI/Universal/Palmer)
- Pulsanti Esporta stato / Importa stato
- Impostazioni (icona ingranaggio), Informazioni e crediti (icona informazioni), link GitHub

**📊 Intestazione del grafico:**
- Attivazione/disattivazione vista occlusale
- Attivazione/disattivazione visibilità denti del giudizio
- Attivazione/disattivazione visibilità osso
- Attivazione/disattivazione visibilità polpa
- Pulsante cancella selezione

**🔍 Filtri di selezione:**
- Seleziona tutti / Tutti i presenti / Permanenti / Decidui / Impianti / Tutti i mancanti
- Seleziona superiori / Superiori 6 frontali / Molari superiori
- Seleziona inferiori / Inferiori 6 frontali / Molari inferiori

**📋 Preset di stato:**
- Ripristina tutto (ripristina bocca)
- Dentizione primaria
- Dentizione mista
- Attivazione/disattivazione edentulo

**📦 Menu a tendina extra di stato:**
- Ponti in zirconio superiori/inferiori (12-22, 13-23, 16-26, arcata completa)
- Ponti in metallo superiori/inferiori (12-22, 13-23, 16-26, arcata completa)
- Protesi parziali rimovibili superiori/inferiori
- Protesi totali rimovibili superiori/inferiori
- Protesi su barra superiori/inferiori con impianti

**🦷 Pannello editor dente** (`ToothControlsSurfaceComponent`, per il dente/i denti selezionati, raggruppato in schede a comparsa):
- **Scheda Stati:** preset per l'intera bocca ed extra di stato (mostrata/nascosta in modo indipendente tramite `showStatusCard`)
- **Scheda Dettagli dentali:** selezione del dente (tipo base incl. varianti di corona fratturata), substrato dentale, il menu a tendina di restauro combinato "Fix: …" / "Kivehető: …", casella di spunta microinfiltrazione marginale della corona, caselle di spunta per la localizzazione della corona fratturata, interruttori corona necessaria / sostituzione corona necessaria
- **Scheda Ortodonzia:** apparecchio, deriva mesiale/distale, movimento verticale, interruttore rotazione — mostrata su un dente naturale presente (mostrata/nascosta in modo indipendente tramite `showOrthoCard`)
- **Scheda Carie:** menu a tendina modalità profondità carie, casella di spunta carie sottocoronale, menu a tendina gravità carie radicolare, e il selettore di carie per superficie B/M/O/D/L (`SurfaceCrossComponent`) con un popup contestuale profondità ICDAS/CARS e un badge di profondità radiografica
- **Scheda Otturazioni:** menu a tendina materiale otturazione, selettore otturazione per superficie, indicatore di difetto di otturazione per superficie, note di suggerimento per carie secondaria e difetto di otturazione
- **Scheda Radice e parodonto:** selettore combinato "Stato polpa / endodonzia", selettore diagnosi apicale, selettore sottotipo di lesione periapicale, selettore tipo di riassorbimento radicolare, selettore grado di mobilità, selettore stato peri-implantare (solo impianti)
- **Indicatori speciali:** piano/ferita di estrazione, spazio chiuso, sigillatura dei solchi, perdita del punto di contatto, tartaro, perno parapulpale, resezione endodontica, pilastro di ponte

### 🦷 Tipi di dente e stati

**Selezione del dente (tipo base):**
| Valore | Descrizione |
|---|---|
| `none` | Dente mancante |
| `tooth-base` | Dente permanente |
| `milktooth` | Dente deciduo (da latte) |
| `implant` | Impianto dentale |
| `tooth-under-gum` | Dente sottogengivale (non erotto) |

**Varianti di dente fratturato:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Substrato dentale (denti permanenti):**
`natural` (predefinito), `radix` (residuo radicolare), `broken`, `crownprep` (preparato per corona)

**Tipo di restauro (denti permanenti):**
`none`, `crown`, `inlay`, `onlay` (solo vista occlusale), `veneer`, `bridge`

**Materiale del restauro (denti permanenti):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (le corone `metal` esistenti migrano qui), `telescope`, `temporary`

**Le opzioni di restauro sono filtrate in base al tipo di dente** (`restorationOptions()` in `projects/angular-advanced-odontogram/src/lib/core/registry/restorations.ts`): un impianto offre solo i tipi di restauro `crown`/`bridge` (composti con un livello connettore per impianto) più le cinque voci di attacco `prosthesis` di seguito; un dente mancante/spazio offre solo un elemento intermedio `bridge` più le due voci di protesi rimovibile `prosthesis`; un substrato `radix` nasconde interamente il controllo del restauro.

**Protesi** (`prosthesis`; asse ortogonale rimovibile/attacco, mostrato come voci "Kivehető:" nel menu a tendina di restauro combinato):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (attacchi implantari, con o senza overdenture), `removable-partial`, `removable-full` (protesi supportate dai denti su un dente mancante/spazio). Un dente ha o un restauro fisso o una protesi, mai entrambi — impostarne uno cancella l'altro.

**Microinfiltrazione marginale della corona** (`crownLeakage`; booleano): mostrata solo quando `restorationType` è `crown` o `bridge`.

**Opzioni endodontiche (denti permanenti):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opzioni endodontiche (denti decidui):**
`none`, `endo-medical-filling`

`endo` e `pulpDx` vengono presentati tramite un unico selettore combinato "Stato polpa / endodonzia" (raggruppato: polpa vitale vs. trattata/endodonzia) e si escludono a vicenda — scegliendo un'opzione trattata (`endo != none`) `pulpDx` viene reimpostato a `normal`, e scegliendo una diagnosi pulpare `endo` viene reimpostato a `none`.

**Materiali di otturazione (denti permanenti):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiali di otturazione (denti decidui):**
`composite`, `gic`, `temporary`

**Superfici di otturazione/carie:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (solo carie)

**Modifiche:**
`inflammation` (periapicale), `parodontal` (parodontale), `mobility` (M1/M2/M3)

**Tipo di lesione periapicale** (`periapicalType`; qualifica il glifo periapicale, mostrato solo in presenza di parodontite apicale sintomatica/asintomatica):
`none`, `granuloma`, `cyst` — il vecchio valore `abscess` è ancora accettato/memorizzato ma non più offerto nel selettore

**Diagnosi pulpare** (terminologia AAE; `pulpDx`):
`normal`, `reversible-pulpitis`, `irreversible-pulpitis`, `necrosis` — si esclude reciprocamente con `endo`

**Diagnosi pulpare, latino pratico** (`pulpLatin`; mostrata dal selettore di pulpa solo quando `pulpDetailLevel` è `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Livello di dettaglio pulpare** (`pulpDetailLevel`, impostazione globale): `simple`, `aae` (predefinito), `latin`

**Diagnosi apicale** (`apicalDx`; determina il glifo periapicale):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Tipo di riassorbimento radicolare** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Stato peri-implantare** (`periImplant`; solo impianti, stadiazione del World Workshop 2018):
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Gravità della carie** (`cariesSeverity`; campo unificato per superficie, `0`–`6`): su una superficie senza otturazione viene letta come scala di profondità ICDAS (`superficial` / `dentin` / `deep`, oppure i codici ICDAS II grezzi `0–6` quando `enableIcdas` è attivo); su una superficie con otturazione viene letta come punteggio CARS con nome (`0` sano … `6` cavità estesa)

**Carie radicolare** (`rootCaries`): `none`, `active`, `arrested`, `active-cavitated`

**Profondità radiografica della carie** (`radiographicDepth`; per superficie): `none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Impostazioni di granularità della carie** (globali): `secondaryCariesMode` (`simple`/`standard`/`full`, predefinito `standard`), `rootCariesMode` (`simple`/`severity`, predefinito `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, predefinito `off`), `cariesDepthEnabled` (booleano, predefinito `true`)

**Indicatori speciali:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Usura dentale** (`wearEdge`, `wearCervical`; tipo clinico per localizzazione, condizionato a dente-base + nessun restauro + substrato naturale):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Discromia** (`discoloration`; causa per dente, condizionata a un dente-base naturale o dente deciduo + nessun restauro + substrato naturale):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Difetto di otturazione** (`fillingDefect`; per superficie, reperto su restauro diretto indipendente dalla carie ricorrente):
`none`, `marginal`, `fracture`, `wear`

**Ortodonzia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; per dente, condizionata a un dente naturale presente):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion`, `intrusion` — `orthoRotation`: booleano

**Impostazioni di dettaglio/notazione dentale** (impostazioni globali di sessione, Impostazioni → Dettagli dentali): `wearDetailLevel` e `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, predefinito `complex`) e `surfaceNotation` (`simple`/`full`, predefinito `full`)

### ⚙️ Impostazioni

Si apre dall'icona a ingranaggio nella barra superiore (`SettingsModalComponent`); un `dialog` ARIA con focus intrappolato e layout a 7 schede (Esc/clic sullo sfondo per chiudere, tasti freccia per cambiare scheda). La finestra di dialogo è una vista pura su uno `SettingsState` fornito dall'host — non possiede alcuno stato di impostazione proprio. Tutte le impostazioni sono stato dell'interfaccia a livello di sessione, salvo diversa indicazione — nessuna di esse modifica i dati per dente o il payload di esportazione.

- **Generale:** sistema di numerazione (FDI/Universal/Palmer), lingua, tema chiaro/scuro, disponibilità di esportazione per formato (PNG/JPG/SVG/PDF — nasconde la voce di menu Esportazione corrispondente quando disattivata, e disabilita la scheda Esportazione quando il PDF è disattivato), disponibilità di importazione per fonte (Stato JSON/FHIR)
- **Odontogramma:** disposizione a schermo — spaziatura dei denti, dimensione del numero del dente, colore di selezione e stile del bordo; visibilità del pannello informazioni dentali; disponibilità della modalità Piano; profilo di anatomia dentale (`classic` predefinito / `measured` — nove template dentali misurati dalla letteratura in un layout a due arcate con larghezza per dente, commutabile a runtime); visibilità della scheda Stati e della scheda Ortodonzia
- **Grafico parodontale:** un interruttore di disponibilità che condiziona il resto della scheda e i punti di accesso parodontali nella shell; modalità di visualizzazione parodontale (`toggle`/`popup`); 16 interruttori mostra/nascondi per indice suddivisi in 5 gruppi (Tasca: PD/GM/CAL/BOP · Igiene: Placca/PI/GI · Mucogengivale: visibilità CEJ/concavità radicolare/KG/GT · Supporto: Forcazione/Mobilità/Classe di Miller · Peri-implantare: mPI/mBI); una modalità di visualizzazione del nome degli indici tradotta-vs-canonica (canonica = un nome scientifico fisso in inglese/latino in ogni lingua dell'interfaccia; i tooltip restano sempre localizzati)
- **Dettagli dentali:** livello di dettaglio pulpare (simple/AAE/latino pratico, predefinito AAE), livello di dettaglio dell'usura e livello di dettaglio della discromia (simple/complex, ciascuno predefinito complex), notazione delle superfici (simple/full, predefinito full), interruttore note per dente
- **Carie:** interruttore punteggio ICDAS II, interruttore profondità carie, granularità carie radicolare (simple/severity), granularità secondaria/CARS (simple/standard/full), granularità profondità radiografica (off/threeLevel/detailed)
- **Otturazioni:** complessità dell'otturazione (complex/simple), interruttore dei reperti di difetto dell'otturazione, disponibilità per materiale (amalgam/composite/gic/temporary), interruttore sigillatura dei solchi
- **Esportazione:** la configurazione completa del report PDF (`PdfSettings` — vedi [Esportazione](#-esportazione) di seguito) — disabilitata (ricade sul contenuto della scheda Generale) ogni volta che l'esportazione PDF è disattivata nella scheda Generale

### 🖼️ Sistema di template SVG

**Template dentali** (in `projects/angular-advanced-odontogram/src/lib/core/assets/teeth-svgs/`):
| Template | Denti che lo utilizzano |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisivi) |
| `13.svg` | 13, 23, 33, 43 (canini) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (premolari) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molari) |

I template vengono ruotati di 180 gradi per la mascella inferiore e specchiati orizzontalmente per il lato sinistro. Una sottocartella parallela `measured/` contiene i nove template dentali misurati dalla letteratura che il profilo di anatomia `measured` renderizza in un layout a due arcate con larghezza per dente (Impostazioni → Odontogramma → anatomia dentale).

**SVG icone** (in `projects/angular-advanced-odontogram/src/lib/core/assets/icon-svgs/`):
`icon_8.svg` (giudizio), `icon_gum.svg` (osso), `icon_no_selection.svg` (cancella), `icon_occl.svg` (vista occlusale), `icon_pulp.svg` (polpa)

Entrambe le cartelle vengono compilate in moduli TypeScript generati (`core/generated/teeth-svgs.ts`, `core/generated/icon-svgs.ts`) tramite `npm run gen:assets` — eseguilo dopo aver modificato un SVG sorgente, in modo che le stringhe inline incluse nel bundle restino sincronizzate.

### 🔢 Sistemi di numerazione

**FDI (ISO 3950):** Denti adulti 11-18, 21-28, 31-38, 41-48. Denti decidui 51-55, 61-65, 71-75, 81-85. Valore: `"FDI"`.

**Universal (USA):** Denti adulti numerati 1-32. Denti decidui con lettere A-T. Valore: `"UNIVERSAL"`.

**Palmer (Zsigmondy-Palmer):** Formato quadrante + posizione (es. UR-1, LL-5). I denti decidui usano le lettere A-E per quadrante. Valore: `"PALMER"`.

`NumberingSystem` (`core/utils/numbering.ts`) è esattamente l'unione `"FDI" | "UNIVERSAL" | "PALMER"`; la funzione esportata `toLabel(fdiTooth, system)` converte un numero di dente FDI nell'etichetta del sistema richiesto (es. `toLabel(14, "PALMER")` → `"UR-4"`).

### 🚀 Utilizzo
Sviluppo (avvia l'app demo):
```bash
npm install
npm start           # ng serve
```
Compilazione della libreria:
```bash
npm run build:styles && npx ng build angular-advanced-odontogram
```
Compilazione dell'app demo:
```bash
npm run build:demo
```

### 🔗 Integrazione
Il componente può essere incorporato in qualsiasi app Angular:
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

**Integrazione modalità scura:**
- **Modalità autonoma:** Omettere `darkMode` — il componente gestisce il proprio stato del tema tramite il pulsante di attivazione nella barra superiore e aggiunge/rimuove la classe `.dark` sull'elemento radice dell'host.
- **Modalità controllata:** Effettuare il binding di `[darkMode]` e `(darkModeChange)` — l'app principale controlla il tema. Il pulsante di attivazione continua ad apparire, ma emette `darkModeChange` invece di gestire lo stato interno. L'app principale è responsabile dell'aggiunta/rimozione della classe `.dark` su `<html>`.

**Tema personalizzato:**
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

**Integrazione plugin:**
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

L'output di `renderSvg()` dei plugin viene sanificato con DOMPurify (profilo SVG) prima di essere inserito nell'odontogramma live — vedi [Note sulla sicurezza](#-note-sulla-sicurezza).

### 🧪 Test

La suite è suddivisa su **due runner**, ed entrambi devono passare (`npm test` li esegue entrambi, in ordine):

```bash
npm run test:corpus   # plain Vitest — the shared clinical-engine core
npm run test:ng       # Angular's Vitest builder — the Angular shell (ng test)
npm test              # both, in order
npm run test:watch    # watch mode (corpus runner)
```

- **`test:corpus`** (`vitest run`) esercita `projects/angular-advanced-odontogram/src/lib/core/` — il core del motore clinico condiviso — rispetto al corpus di test portato (oltre 100 file di spec sotto `core/__tests__/`). È qui che risiedono e vengono verificate byte per byte le **golden fixture** del rendering SVG, dell'esportazione FHIR e del round-trip JSON: `parity/svg-fingerprints.json`, `parity/fhir-golden.json`, `parity/roundtrip-golden.json`, `parity/shell-dom-golden.html`.
- **`test:ng`** (`ng test angular-advanced-odontogram --watch=false`, l'integrazione Vitest `@angular/build:unit-test` di Angular) esegue le proprie spec `*.spec.ts` della shell Angular — componenti, servizi, direttive — verificando la parità del DOM: la shell renderizza gli stessi id, le stesse classi e lo stesso markup dei componenti React originali.

Poiché l'integrazione Vitest di questo builder non supporta `vi.mock()`/`vi.spyOn()` per il mocking di moduli con percorso relativo, gli effetti collaterali che toccano il DOM (`initOdontogram`/`destroyOdontogram`, `exportPdf`) vengono invece sovrascritti tramite gli injection token `ODONTOGRAM_ENGINE_LIFECYCLE`/`EXPORT_PDF_FN` e l'array dei provider di `TestBed` di Angular — vedi [Punti di iniezione DI per il test lato host](#-utilizzo-come-pacchetto-npm) sopra.

### 📖 Documentazione API
```bash
npm run docs           # Generate TypeDoc docs in docs/api/
```
L'API del motore clinico condiviso è documentata anche nel progetto originale:

📚 **https://zoliqua.github.io/React-Odontogram-Modul/**

### 📡 API pubblica

**Input/output del componente:** vedi [Input del componente](#-utilizzo-come-pacchetto-npm) sopra per la tabella completa.

**Funzioni esportate per il controllo esterno** (sottoinsieme selezionato — la superficie completa e tipizzata si trova nei file `.d.ts` inclusi):

| Funzione | Descrizione |
|---|---|
| `initOdontogram()` / `destroyOdontogram()` | Inizializza/ripulisce il motore (richiamata internamente da `OdontogramShellComponent`/`OdontogramUiService` tramite il token `ODONTOGRAM_ENGINE_LIFECYCLE`) |
| `setNumberingSystem(system)` | Passa tra FDI, UNIVERSAL, PALMER |
| `clearSelection()` | Deseleziona tutti i denti |
| `registerPlugins(plugins)` | Registra plugin SVG personalizzati |
| `setPluginState(toothNo, pluginId, value)` / `getPluginState(toothNo, pluginId)` | Imposta/ottiene lo stato personalizzato di un plugin per un dente |
| `getToothStateSummary(toothNo)` | Ottiene un riepilogo localizzato di tutti gli stati attivi |
| `getOdontogramSummary()` | Ottiene un riepilogo testuale strutturato e localizzato dell'intero odontogramma (conteggi, sezioni, modifiche pianificate) |
| `onStateChange(callback)` | Sottoscrive le modifiche di stato; restituisce una funzione di annullamento |
| `setReadOnly(value)` / `getReadOnly()` | Abilita/disabilita / interroga la modalità sola lettura |
| `setNotesEnabled(value)` / `getNotesEnabled()` | Abilita/disabilita / interroga le note per dente |
| `setPulpDetailLevel(level)` / `getPulpDetailLevel()` | Imposta/ottiene il vocabolario del selettore di pulpa — `"simple"`, `"aae"` o `"latin"` |
| `getToothAnatomy()` / `setToothAnatomy(v)` | Ottiene/imposta il profilo di anatomia dentale — `"classic"` o `"measured"` |
| `getChartMode()` / `setChartMode(mode)` | Ottiene/passa il grafico attivo — `"status"` o `"plan"` (il grafico del piano viene copiato in profondità dallo stato la prima volta che viene attivato) |
| `getStatusChart()` / `getPlanChart()` / `setPlanChart(payload)` | Legge i payload del grafico di stato/piano indipendentemente dal grafico attivo, o sostituisce i denti del grafico del piano |
| `getPlanChanges()` | Ottiene il diff strutturato stato→piano (`{ toothNo, axis, from, to }[]`) |
| `setPerioSite(toothNo, site, patch)` / `getToothPerio(toothNo)` | Imposta/ottiene i dati parodontali per uno dei sei siti (`patch` = `{ pd?, gm?, bop?, sup? }`) |
| `getToothCal(toothNo)` | Ottiene il CAL derivato per sito di un dente |
| `getPerioSummary()` | Aggregati parodontali per l'intera bocca: numero di siti registrati, numero di siti sanguinanti, %BOP, CAL peggiore, PD massimo |
| `getPerioChart()` | Ottiene i record parodontali per dente del grafico attivo |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Apre/chiude/interroga a livello di programmazione l'overlay del grafico parodontale |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Ottiene/imposta come viene presentato il grafico parodontale — `"toggle"` o `"popup"` |
| `getPerioClassification()` | Ottiene la classificazione parodontale del World Workshop 2017 (`{diagnosis, stage, grade, extent, derived, overridden}`) |
| `setDiagnosisOverride(v)` / `setStageOverride(v)` / `setGradeOverride(v)` / `setExtentOverride(v)` | Sovrascrive un asse della classificazione parodontale derivata, oppure `null` per ripristinare il valore derivato |
| `getCaseMeta()` / `resetCaseMeta()` | Ottiene/ripristina l'oggetto di metadati a livello di caso (età, stato di fumatore/diabetico, identità del paziente, data dell'esame, …) |
| `setPatientName(v)` / `setPatientDob(v)` / `setExamDate(v)` | Imposta i campi di identità del caso (solo intestazione del report PDF — mai parte dell'esportazione FHIR) |
| `exportFhir(options?)` | Esporta l'odontogramma come Bundle di raccolta HL7 FHIR R4 (download JSON); riferimento `{ subject }` opzionale |
| `importFhirBundle(input)` | Importa un Bundle FHIR R4 (oggetto o stringa JSON) prodotto da questo modulo |
| `exportImage(format)` | Scarica l'odontogramma come immagine — `"png"` o `"jpg"` |
| `exportSvg()` | Scarica l'odontogramma come SVG scalabile (vettoriale) |
| `hasAnyPerioData()` | `true` se e solo se è registrato qualsiasi asse parodontale in un punto qualsiasi della bocca |
| `exportPerioSvg()` / `exportPerioImage(format)` | Scarica il grafico parodontale completo come un SVG vettoriale autonomo o come immagine rasterizzata |
| `exportPdf(opts)` | Scarica un report PDF nativo jsPDF (vedi [Esportazione](#-esportazione) di seguito) |
| `getPdfSettings()` / `setPdfSettings(patch)` | Ottiene/aggiorna la configurazione del report PDF (`PdfSettings`) |
| `exportStatus()` | Scarica il grafico dello stato come JSON |
| `importStatus(data)` | Idrata il motore a partire da un payload JSON esportato in precedenza (vedi [Formato di esportazione/importazione dello stato](#-formato-di-esportazioneimportazione-dello-stato)) |
| `setImportFormat(format)` | Imposta il parser per la prossima importazione file — `"status"` o `"fhir"` |
| `startIntroTour()` | Avvia il tour introduttivo interattivo |

### 💾 Persistenza dello stato (localStorage)

Persistenza opzionale su `localStorage` per lo stato del caso dell'odontogramma (`core/persistence.ts`, ri-esportata dal punto di ingresso del pacchetto). Disattivata per impostazione predefinita — le integrazioni esistenti non sono interessate a meno che un'applicazione ospitante non la attivi esplicitamente, e va richiamata **dopo** che l'odontogramma è stato montato (es. dall'`ngAfterViewInit()` di un componente, dopo che `OdontogramShellComponent`/`OdontogramUiService` ha richiamato `init()` — il ripristino ridisegna il DOM live tramite `importStatus()`):

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

| Funzione | Descrizione |
|---|---|
| `enablePersistence(options?)` | Ripristina un caso salvato in precedenza (se presente) tramite `importStatus()`, quindi salva l'odontogramma di stato su `localStorage` a ogni cambiamento di stato consolidato (le modifiche vengono raggruppate e differite di circa 400 ms — tecnica nota come *debounce* — cosicché una raffica di cambiamenti, ad es. un preset di stato, produca un'unica scrittura). Idempotente — richiamarla di nuovo sostituisce la sottoscrizione/le opzioni precedenti. **Deve essere richiamata dopo che l'odontogramma è stato montato.** |
| `disablePersistence()` | Interrompe la persistenza (scrivendo prima ogni salvataggio differito ancora in sospeso); la voce salvata resta invariata. |
| `clearPersistedState()` | Rimuove la voce salvata per la chiave attiva (o predefinita). |
| `isPersistenceEnabled()` | `true` mentre una sottoscrizione ai cambiamenti di stato è attiva. |

**`PersistenceOptions`:**

| Campo | Tipo | Predefinito | Descrizione |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | La chiave `localStorage` — è il valore predefinito letterale proprio del modulo core condiviso (invariato dal port Angular); passa una tua `key` per evitare collisioni con un'integrazione lato React sulla stessa origine, o per distinguere più host. |
| `includePlan` | `boolean` | `false` | Persiste anche il grafico del piano (il campo `plan` del payload). |
| `onError` | `(err: Error) => void` | — | Richiamata su qualsiasi errore di archiviazione/parsing invece di `console.warn`. |

Note: non viene letto né scritto nulla su `localStorage` a meno che `enablePersistence()` non venga richiamata; un limite di sicurezza di 4 MB salta un salvataggio troppo grande (segnalato tramite `onError`/`console.warn`) invece di generare un'eccezione; ogni errore di archiviazione/JSON — quota superata, un iframe bloccato, dati salvati corrotti o non riconosciuti, ecc. — viene intercettato e segnalato. Questo modulo non genera mai eccezioni.

Nota: l'attivazione della persistenza ripristina il caso salvato tramite `importStatus()`, sostituendo il caso corrente — incluso un piano in corso se il payload salvato non ne contiene uno. Attivare la persistenza all'avvio (subito dopo il montaggio), non a metà sessione.

Nota: il payload persistito può includere dati identificativi del paziente (nome del paziente, data dell'esame) in chiaro nel `localStorage`. Se si registrano tali dati, assicurarsi di una protezione a livello di dispositivo o cancellarli con `clearPersistedState()` quando opportuno.

### 💾 Formato di esportazione/importazione dello stato
L'esportazione crea un file JSON (versione `2.20`; le importazioni accettano anche le versioni legacy `1.4` e da `2.0` a `2.19` e vengono migrate automaticamente) contenente:

**Campi globali:**
- `wisdomVisible` - denti del giudizio visibili
- `showBase` - livello osseo visibile
- `occlusalVisible` - vista occlusale attiva
- `showHealthyPulp` - polpa sana visibile
- `edentulous` - modalità edentulo attiva

**Campi per dente (32 denti):**
- `toothSelection` - tipo base del dente
- `toothSubstrate` - substrato dentale (natural/radix/broken/crownprep), ortogonale a qualsiasi restauro
- `restorationType` - tipo di restauro (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - materiale del restauro (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), abbinato a `restorationType`
- `prosthesis` - asse rimovibile/attacco (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), si esclude reciprocamente con un `restorationType` fisso di crown/bridge
- `crownLeakage` - flag di microinfiltrazione marginale della corona, significativo solo quando `restorationType` è crown o bridge
- `endo` - stato endodontico; si esclude reciprocamente con `pulpDx`
- `mods` - array di modifiche (inflammation, parodontal); `inflammation` si applica solo ai denti mancanti/con alveolo post-estrattivo
- `caries` - superfici con carie attiva
- `cariesActiveDepth` - il valore di profondità ICDAS predisposto dal selettore di profondità carie quando viene applicata una nuova superficie
- `rootCaries` - gravità della carie radicolare (none/active/arrested/active-cavitated)
- `cariesSeverity` - gravità unificata per superficie (0-6): profondità ICDAS su una superficie primaria (senza otturazione), punteggio CARS su una superficie ricorrente (con otturazione)
- `radiographicDepth` - profondità radiografica della carie per superficie (none/E1/E2/D1/D2/D3), indipendente dalla scala visiva ICDAS/CARS
- `fillingMaterial` - materiale dell'otturazione
- `fillingSurfaces` - superfici otturate
- `fillingSurfaceMaterials` - materiale dell'otturazione per superficie (otturazioni miste, es. buccale amalgama + distale composito)
- `fillingDefect` - difetto di otturazione per superficie (none/marginal/fracture/wear), condizionato alla presenza di una superficie otturata, indipendente dalla carie ricorrente
- `pulpDx` - diagnosi pulpare AAE (normal/reversible-pulpitis/irreversible-pulpitis/necrosis)
- `pulpLatin` - sottotipo pulpare in latino pratico (mostrato dal selettore di pulpa solo quando `pulpDetailLevel` è `latin`)
- `apicalDx` - diagnosi apicale che determina il glifo periapicale
- `periapicalType` - sottotipo di lesione periapicale (none/granuloma/cyst); il vecchio valore `abscess` è ancora accettato in importazione
- `resorptionType` - tipo di riassorbimento radicolare (none/internal/external-cervical)
- `periImplant` - stato peri-implantare solo per impianti (none/mucositis/peri-implantitis-mild/-moderate/-severe), stadiazione del World Workshop 2018
- `endoResection` - flag apicectomia
- `fissureSealing` - flag sigillante per solchi
- `calculus` - flag tartaro
- `contactMesial` / `contactDistal` - perdita del punto di contatto mesiale/distale
- `wearEdge` - tipo di usura incisale/occlusale (none/attrition/erosion)
- `wearCervical` - tipo di usura cervicale (none/abrasion/abfraction/erosion)
- `discoloration` - causa di discromia per dente (none/tetracycline/fluorosis/nonvital/extrinsic/other)
- `orthoAppliance` - apparecchio ortodontico (none/bracket/band)
- `orthoDrift` - deriva ortodontica (none/mesial/distal)
- `orthoVertical` - movimento verticale ortodontico (none/extrusion/intrusion)
- `orthoRotation` - flag di rotazione ortodontica
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - posizioni delle fratture
- `extractionWound` - ferita post-estrazione
- `extractionPlan` - estrazione pianificata
- `parapulpalPin` - flag perno parapulpale
- `bridgePillar` - dente pilastro del ponte
- `mobility` - grado di mobilità (none/m1/m2/m3)
- `crownNeeded` - indicatore corona necessaria
- `crownReplace` - indicatore sostituzione corona necessaria
- `missingClosed` - spazio chiuso dopo estrazione
- `customStates` - stati personalizzati del plugin (oggetto, indicizzato per ID plugin)
- `note` - nota testuale per dente (stringa, opzionale — presente solo se non vuota)

**Campo di livello superiore `plan` (versione 2.11+):**
- `plan` - oggetto opzionale, con la stessa forma di `teeth` (i campi per dente sopra), che contiene il grafico del **piano** (trattamento post-operatorio previsto). Presente solo quando il grafico del piano è stato inizializzato E il suo contenuto differisce dal grafico dello stato. In importazione, un `plan` assente cancella/deinizializza il grafico del piano; un `plan` presente ripristina il grafico del piano insieme allo stato. Può anche essere letto/scritto indipendentemente tramite `getPlanChart()`/`setPlanChart()`.

**Oggetto di livello superiore `case` (versione 2.17+, ampliato in 2.18, 2.19 e 2.20):**
- `case` - oggetto opzionale di metadati a livello di caso (non per dente), condiviso sia dal grafico dello stato sia da quello del piano. Omesso quando vuoto. Campi (ciascuno omesso quando al suo valore predefinito): `age`; `smokingStatus` (+ `cigarettesPerDay`); `diabetesStatus` (+ `hba1c`); `toothLossPerio`; `maxRblPercent`; le quattro sovrascritture cliniche per asse della classificazione 2017 `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`; `patientName` / `examDate`; e `patientDob`. Letti/scritti tramite `getCaseMeta()` e i setter `set*` sopra. Il nome del paziente, la data di nascita e la data dell'esame sono solo metadati di identità dell'odontogramma — **non** fanno parte dell'esportazione FHIR.

### 🖨️ Esportazione
Oltre all'esportazione propria dell'odontogramma in Stato JSON / FHIR / PNG / JPG / SVG, il **grafico parodontale** ha un proprio percorso di esportazione:
- **SVG/PNG/JPG parodontale:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` renderizzano il grafico parodontale completo come un unico SVG vettoriale autonomo, indipendente dal DOM montato di `PerioChartComponent`. Disabilitato ogni volta che `hasAnyPerioData()` è falso.
- **Report PDF:** la voce "PDF report…" del menu di esportazione apre `ExportOptionsModalComponent` — una finestra di dialogo delle impostazioni (campi nome paziente + data di nascita + data esame, collegati direttamente ai metadati del caso, con la data esame che ha come valore predefinito la data odierna; caselle di spunta per sezione: dati paziente, odontogramma, descrizione odontogramma, note individuali — disabilitata quando nessun dente ha una nota — stato parodontale, descrizione parodontale) prima di chiamare `exportPdf(opts)` tramite il token di iniezione `EXPORT_PDF_FN`. I campi di identità vuoti ricadono su valori segnaposto (`"John Doe"` / `"1980-01-01"`, configurabili tramite `PdfSettings.defaultName`/`defaultDob`) in modo che l'esportazione riesca sempre. Il PDF viene assemblato in modo nativo jsPDF — testo vettoriale tramite `.text()`, immagini rasterizzate di denti/grafico parodontale tramite `.addImage()` — senza alcuna dipendenza da `svg2pdf.js`. La sezione delle note individuali viene saltata automaticamente quando nessun dente ha una nota, e le due sezioni parodontali ogni volta che `hasAnyPerioData()` è falso, indipendentemente dalle caselle di spunta della finestra di dialogo.
- **Configurazione del report (`PdfSettings`, Impostazioni → scheda Esportazione, lettura/scrittura tramite `getPdfSettings()`/`setPdfSettings(patch)`):** nome/data di nascita del paziente predefiniti, se mostrare l'età, formato data (ISO/DMY/MDY), tema colore (blue/teal/amber/slate), visibilità di osso/polpa dell'odontogramma, spaziatura/bordo/dimensione del numero del dente sull'immagine del grafico, se includere la descrizione testuale e la tabella dei reperti, le corrispondenti opzioni di spaziatura/posizionamento etichette/dimensione font del grafico parodontale e se includere la tabella delle metriche parodontali e il glossario delle abbreviazioni, un disclaimer medico (testo predefinito o personalizzato), un timbro di generatore/versione, e il raggruppamento del riepilogo dentizione (intera bocca / mascella / quadrante / sestante — determina anche la tabella del pannello informazioni dentali a schermo).
- **Gating implantare mPI/mBI:** gli indici peri-implantari di Mombelli (mPI/mBI) vengono renderizzati come righe solo in un'arcata che contiene almeno un dente con impianto — sia nel grafico parodontale dal vivo sia nelle esportazioni SVG/PDF.
- Il nome del paziente, la data di nascita e la data dell'esame sono solo metadati di identità dell'odontogramma (payload `2.20`, additivi) — **non** fanno parte dell'esportazione FHIR.

### 📁 Struttura delle cartelle
- `projects/angular-advanced-odontogram/src/public-api.ts` - il punto di ingresso pubblico del pacchetto (ogni export viene ri-esportato da qui)
- `projects/angular-advanced-odontogram/src/lib/core/odontogram.ts` - il motore clinico indipendente dal framework: stratificazione SVG, gestione dello stato dentale, interazioni touch, overlay plugin, impostazioni, esportazione/importazione
- `projects/angular-advanced-odontogram/src/lib/core/persistence.ts` - persistenza opzionale su localStorage
- `projects/angular-advanced-odontogram/src/lib/core/theme.ts` - il tipo `OdontogramThemeConfig` e l'utilità `applyThemeConfig()`
- `projects/angular-advanced-odontogram/src/lib/core/plugin.ts` - il tipo `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, le priorità z-index `LAYER_Z`
- `projects/angular-advanced-odontogram/src/lib/core/pluginSanitize.ts` - `sanitizePluginSvg()`, il sanificatore basato su DOMPurify attraverso cui passa l'output di `renderSvg()` di un plugin prima dell'inserimento nell'odontogramma live
- `projects/angular-advanced-odontogram/src/lib/core/tour.ts` - il tour introduttivo guidato
- `projects/angular-advanced-odontogram/src/lib/core/perioClassification.ts` - la derivazione della classificazione parodontale del World Workshop 2017
- `projects/angular-advanced-odontogram/src/lib/core/perioExport.ts` / `perioGraphic.ts` / `perioIndexNames.ts` - il rendering SVG del grafico parodontale per l'intera bocca
- `projects/angular-advanced-odontogram/src/lib/core/perioPdf.ts` - l'assemblatore puro jsPDF del report PDF (`assemblePdf`)
- `projects/angular-advanced-odontogram/src/lib/core/status_extras.ts` - 22 template di restauro predefiniti
- `projects/angular-advanced-odontogram/src/lib/core/i18n/` - le traduzioni (12 lingue) e il bus i18n indipendente dal framework
- `projects/angular-advanced-odontogram/src/lib/core/utils/numbering.ts` - la conversione della numerazione FDI, Universal, Palmer
- `projects/angular-advanced-odontogram/src/lib/core/registry/` - il registro dichiarativo degli assi clinici: mappature dei campi FHIR, attivazione di clear-set SVG/flag booleani, matrice tipo×materiale del restauro, elenchi di opzioni dell'interfaccia
- `projects/angular-advanced-odontogram/src/lib/core/fhir/` - esportazione/importazione HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, sistemi di codici, mappature dei campi, primitive
- `projects/angular-advanced-odontogram/src/lib/core/bridgeOverlay.ts` - l'overlay connettore del tratto di ponte multi-dente
- `projects/angular-advanced-odontogram/src/lib/core/fonts/` - i font Unicode per PDF inclusi nel bundle (formattazione araba, CJK) + il caricatore dei font
- `projects/angular-advanced-odontogram/src/lib/core/assets/` - i file sorgente SVG di denti/icone (`teeth-svgs/`, `teeth-svgs/measured/`, `icon-svgs/`)
- `projects/angular-advanced-odontogram/src/lib/core/generated/` - gli SVG compilati in moduli TypeScript inline (`npm run gen:assets`)
- `projects/angular-advanced-odontogram/src/lib/core/__tests__/` + `registry/__tests__/` - il corpus di test portato, incluse le golden fixture in `parity/`
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/` - `OdontogramShellComponent`, la shell all-in-one
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-ui.service.ts` - `OdontogramUiService`, il livello di stato/effetti dell'interfaccia componibile
- `projects/angular-advanced-odontogram/src/lib/components/engine-state.ts` - l'helper di signal `engineState()`
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-engine-lifecycle.ts` - il token DI `ODONTOGRAM_ENGINE_LIFECYCLE`
- `projects/angular-advanced-odontogram/src/lib/components/surfaces/` - le quattro superfici presentazionali (topbar, grafico, informazioni dente, controlli dente) e, sotto `surfaces/cards/`, le sette schede di controllo dichiarative
- `projects/angular-advanced-odontogram/src/lib/components/settings-modal/` - `SettingsModalComponent` (finestra di dialogo Impostazioni a 7 schede)
- `projects/angular-advanced-odontogram/src/lib/components/export-options-modal/` - `ExportOptionsModalComponent` e il token DI `EXPORT_PDF_FN`
- `projects/angular-advanced-odontogram/src/lib/components/credits-modal/` - `CreditsModalComponent`
- `projects/angular-advanced-odontogram/src/lib/components/perio-chart/` / `perio-sidebar/` - il grafico parodontale autonomo/inline e la sua barra laterale di contesto
- `projects/angular-advanced-odontogram/src/lib/components/dual-state-confirm/` - la finestra di dialogo di conferma condivisa (modifiche che riguardano stato↔piano)
- `projects/angular-advanced-odontogram/src/lib/components/shared/dialog-focus.ts` - gli helper condivisi per l'intrappolamento/ripristino del focus delle finestre modali
- `projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.ts` - `I18nService`, la facciata reattiva Angular sul bus i18n del core
- `projects/demo/` - l'applicazione Angular demo (`ng serve` / `npm run build:demo`)
- `scripts/generate-svg-assets.mjs` - il generatore di `npm run gen:assets`

### ⚙️ Stack tecnologico
- Angular 21 (componenti standalone, signal) + Angular CLI (`@angular/build`) + TypeScript
- `ng-packagr` per la build della libreria (`ng build angular-advanced-odontogram`)
- Tailwind CSS per lo stile dell'interfaccia, compilato una sola volta in un foglio di stile statico (`npm run build:styles` → `projects/angular-advanced-odontogram/styles.css`) — i consumatori registrano quel foglio di stile, non eseguono Tailwind autonomamente
- Stratificazione SVG tramite manipolazione del DOM nel core indipendente dal framework (stato non reattivo Angular per le prestazioni — lo stesso motore usato dall'originale React)
- Un sistema i18n personalizzato leggero e indipendente dal framework (`core/i18n/`), racchiuso da `I18nService` per il binding reattivo nei template Angular
- Doppio runner di test: Vitest puro per il corpus core (`vitest run`), l'integrazione Vitest `@angular/build:unit-test` di Angular per le spec dei componenti (`ng test`); `@testing-library/jest-dom` per i matcher del DOM
- TypeDoc per la documentazione API (`npm run docs`, output `docs/api/`)
- jsPDF per il report PDF; DOMPurify per la sanificazione dell'output dei plugin

### 📝 Note
- I template SVG e le icone vengono compilati in moduli TypeScript generati in fase di build (`npm run gen:assets`) — non c'è alcuna richiesta di risorse a runtime e nulla da servire da una cartella pubblica.
- Il motore dell'odontogramma utilizza un proprio stato interno, indipendente dal framework (non signal Angular) per la griglia SVG, per le prestazioni e per restare identico all'originale React; i componenti Angular lo leggono in modo reattivo tramite `engineState()`/`I18nService`/`onStateChange()` invece di possederlo direttamente.
- I denti decidui dispongono di un set ridotto di materiali disponibili (nessuna otturazione in amalgama, nessun trattamento endodontico con perni).
- I denti con impianto dispongono di un diverso set di opzioni per corona/abutment rispetto ai denti naturali.

### 🔒 Note sulla sicurezza

- **I plugin vengono eseguiti come codice fidato.** Il valore restituito da `renderSvg()` di un plugin viene inserito nell'SVG dell'odontogramma live. Quell'output viene sanificato con [DOMPurify](https://github.com/cure53/DOMPurify) (profilo SVG, più `svgFilters`) prima dell'inserimento — `<script>`, `<iframe>`, `<object>`, `<embed>` e `<foreignObject>` sono vietati a priori, e un output completamente malevolo viene scartato invece di essere renderizzato parzialmente. Questo riduce il raggio d'azione di un plugin compromesso o difettoso, ma i plugin dovrebbero comunque essere caricati solo da fonti attendibili — la sanificazione è una rete di sicurezza, non un sostituto della verifica.
- **Content-Security-Policy.** Questo pacchetto non inserisce una propria CSP quando viene incorporato come libreria. Le applicazioni ospitanti che renderizzano `OdontogramShellComponent` dovrebbero impostare la propria CSP adatta al loro deployment; una base ragionevole rispecchia la policy della demo del progetto React originale:

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

### 📖 Come citare

Questo pacchetto non ha un proprio record di citazione — è un port che condivide, testualmente, il proprio motore clinico con il progetto originale. Se utilizzi questo software nella tua ricerca, cita l'originale:

> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Tutte le versioni (DOI concettuale):** https://doi.org/10.5281/zenodo.21156787

I metadati di citazione leggibili dalla macchina si trovano nel [`CITATION.cff`](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/CITATION.cff) del progetto originale.

## 🙌 Crediti

Angular Advanced Odontogram è creato e mantenuto da Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), creatore e sviluppatore principale di questo port e del motore clinico sottostante. Lo stesso popup in-app (barra superiore → "Informazioni e crediti") elenca questi nomi.

**Progetto originale**

- [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul): l'implementazione React originale di cui questo pacchetto è il port — il motore clinico (logica dello stato dentale, registrazione parodontale, esportazione/importazione FHIR, stringhe i18n, tour, template SVG) è condiviso testualmente.

**Realizzato con** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [Angular](https://angular.dev), [Angular CLI](https://angular.dev/tools/cli), [TypeScript](https://www.typescriptlang.org) e [Tailwind CSS](https://tailwindcss.com).

I contributi sono benvenuti — vedi [`CONTRIBUTING.md`](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/CONTRIBUTING.md). Se questo progetto ti è utile, lascia una [stella su GitHub](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
