# Angular Advanced Odontogram

*[English](../README.md) | Magyar*

A [react-advanced-odontogram](https://github.com/ZoliQua/React-Odontogram-Modul) Angular
portja — egy interaktív, SVG-alapú fogászati odontogram (fogstátusz-térkép) szerkesztő:
többfelszínű caries- és tömés-jelölés, endodonciai/protetikai/parodontális állapotok,
FDI/Universal/Palmer számozás, teljes parodontális (perio) diagram, HL7 FHIR R4
export/import, és ICDAS pontozás.

**Kompatibilitás:** Funkcionálisan egyenértékű a react-advanced-odontogram v2.2.0
verziójával (2.19-es payload verzió). A JSON és FHIR R4 exportok a React modullal
kölcsönösen kompatibilisek (round-trip). Az upstream v2.2.1 kiegészítéseinek átvétele
az 1.1.0-s verzióra van tervezve.

## Állapot

- [x] 1. fázis — motor mag (framework-független) + zöld teszt-korpusz
- [x] 2. fázis — `OdontogramShellComponent` (felső sáv/menük/összegzés/megerősítés) + demó alkalmazás
- [x] 3. fázis — Beállítások és párbeszédablakok
- [x] 4. fázis — Parodontális diagram és exportok
- [x] 5. fázis — dokumentáció, csomagolás, 1.0.0

## Telepítés

```bash
npm install angular-advanced-odontogram
```

A könyvtár stílusait még azelőtt le kell fordítani, hogy bármit lefordítanál vagy
kiszolgálnál, ami a komponenst használja (a demó alkalmazás ezt teszi — lásd
`projects/demo`):

    npm run build:styles && npx ng build angular-advanced-odontogram

A `npm run build:styles`-nek előbb kell lefutnia — ez állítja elő a
`projects/angular-advanced-odontogram/styles.css` fájlt a Tailwind forrásból,
amelyre a demó `angular.json` fájljának `styles` tömbje közvetlenül hivatkozik
(a forrás oldali artifact, nem a `dist/`-beli). Ha npm-ről telepítetted, helyette
a lefordított stíluslapot importáld:

```css
@import 'angular-advanced-odontogram/styles.css';
```

## Használat

### `<aao-odontogram-shell>`

A teljes alkalmazás-váz — felső sáv, fogászati diagram, vezérlőpanel, parodontális
diagram, beállítások/export/import párbeszédablakok.

```typescript
import { Component } from '@angular/core';
import { OdontogramShellComponent } from 'angular-advanced-odontogram';

@Component({
  selector: 'app-root',
  imports: [OdontogramShellComponent],
  template: `<aao-odontogram-shell [enableNotes]="true" />`,
})
export class AppComponent {}
```

Mind a 18 bemenet opcionális `input()` szignál; mindegyik beépített alapértékre
esik vissza, ha nincs kötve, tükrözve az eredeti React komponens "uncontrolled"
alapértékeit.

| Bemenet | Típus | Alapérték |
| --- | --- | --- |
| `language` | `Language` (`"hu" \| "en" \| "de" \| "es" \| "it" \| "sk" \| "pl" \| "ru" \| "pt-br" \| "zh" \| "ar" \| "fr"`) | vezérlés nélkül — `"en"`-nel indul, követi a felső sáv/Beállítások nyelvválasztóját |
| `numberingSystem` | `NumberingSystem` (`"FDI" \| "UNIVERSAL" \| "PALMER"`) | `"FDI"` (vezérlés nélkül) |
| `darkMode` | `boolean` | vezérlés nélkül — `false`-szal indul, hacsak a gazda dokumentumon már nincs `dark` osztály a `<html>`-en |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` (beépített színpaletta) |
| `plugins` | `OdontogramPlugin[]` | `[]` |
| `readOnly` | `boolean` | `false` |
| `enableNotes` | `boolean` | `false` |
| `enableIcdas` | `boolean` | `false` |
| `pulpDetailLevel` | `PulpDetailLevel` (`"simple" \| "aae" \| "latin"`) | `"aae"` |
| `secondaryCariesMode` | `SecondaryCariesMode` (`"simple" \| "standard" \| "full"`) | `"standard"` |
| `rootCariesMode` | `RootCariesMode` (`"simple" \| "severity"`) | `"simple"` |
| `radiographicDepthMode` | `RadiographicDepthMode` (`"off" \| "threeLevel" \| "detailed"`) | `"off"` |
| `cariesDepthEnabled` | `boolean` | `true` |
| `wearDetailLevel` | `ToothDetailLevel` (`"simple" \| "complex"`) | `"complex"` |
| `discolorationDetailLevel` | `ToothDetailLevel` (`"simple" \| "complex"`) | `"complex"` |
| `surfaceNotation` | `SurfaceNotation` (`"simple" \| "full"`) | `"full"` |
| `showStatusCard` | `boolean` | `true` |
| `showOrthoCard` | `boolean` | `true` |

| Kimenet | Payload | Kibocsátva |
| --- | --- | --- |
| `languageChange` | `Language` | minden nyelvváltáskor, vezérelt vagy vezérlés nélküli módban egyaránt |
| `numberingChange` | `NumberingSystem` | minden számozási rendszer -váltáskor, vezérelt vagy vezérlés nélküli módban egyaránt |
| `darkModeChange` | `boolean` | minden sötét mód -váltáskor, vezérelt vagy vezérlés nélküli módban egyaránt |

A `themeConfig`/`plugins` pontos felépítése és a fenti összes típus a typedoc
által generált dokumentációban van részletesen leírva — lásd lejjebb az
[API dokumentáció](#api-docs) szakaszt.

### `PerioChartComponent` önállóan

A parodontális diagram önállóan, a shell-en kívül is beágyazható — akár inline
(az oldalba ágyazva), akár vezérelt felugró ablakként.

```typescript
import { PerioChartComponent } from 'angular-advanced-odontogram';

@Component({
  imports: [PerioChartComponent],
  // inline, mindig megjelenítve:
  template: `<aao-perio-chart [inline]="true" />`,
  // — vagy — vezérelt felugró ablakként:
  // template: `<aao-perio-chart [open]="isOpen" (closeChart)="isOpen = false" />`,
})
export class MyComponent {}
```

- `open: boolean` (alapérték `false`) — a diagramot modális felugró ablakként jeleníti meg.
- `inline: boolean` (alapérték `false`) — a diagramot a helyén jeleníti meg, felugró ablak helyett.
- `(closeChart)` — akkor kerül kibocsátásra, amikor a felugró ablak bezárul (Escape, háttérre kattintás, vagy a bezárás gomb).

### Imperatív API

A két komponens alatt húzódó motor framework-független, és teljes egészében
exportálva van az `angular-advanced-odontogram` csomagból. A fő csoportok:

- **Export / import** — `exportStatus()`, `exportFhir(options?)`, `exportSvg()`,
  `exportImage(format)`, `exportPerioImage(format)`, `exportPdf(options)`
  (az `EXPORT_PDF_FN` tokenen keresztül is injektálható — lásd lejjebb a
  Tesztelés szakaszt), `importStatus(data)`, `importFhirBundle(input)`,
  `setImportFormat(format)`.
- **Diagram mód** — `getChartMode()` / `setChartMode(mode)` (státusz vs. terv).
- **Perio API** — `getPerioChart()`, `getToothPerio(toothNo)`,
  `setPerioSite(toothNo, site, patch)`, `getPerioSummary()`,
  `hasAnyPerioData()`, `getPerioClassification()`,
  `getPerioViewMode()` / `setPerioViewMode(mode)`,
  `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()`,
  `getPerioRowVisibility()` / `setPerioRowVisibility(id, visible)`,
  `getPerioIndexNameMode()` / `setPerioIndexNameMode(mode)`,
  `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)`.

Minden más exportált függvény, típus és komponens (beállítás-lekérdezők és
-beállítók, a teljes `OdontogramSummary` forma stb.) a generált API
dokumentációban található meg.

<a id="api-docs"></a>

    npm run docs         # API dokumentáció generálása a docs/api/ mappába

### Tesztelés

Két DI token létezik kifejezetten azért, hogy a gazda alkalmazások (és a
könyvtár saját tesztjei) modul-mockolás nélkül, `TestBed`-en keresztül tudják
helyettesíteni a mellékhatásos motor-belépési pontokat:

- `ODONTOGRAM_ENGINE_LIFECYCLE` — az `init()`/`destroy()` páros, amit az
  `OdontogramShellComponent` felcsatoláskor/leválasztáskor hív.
- `EXPORT_PDF_FN` — a függvény, amit az `ExportOptionsModalComponent` hív a
  PDF exporthoz (a valódi `exportPdf()` jsPDF/canvas műveleteket végez, amik
  jsdom alatt nem futnak le).

```typescript
TestBed.configureTestingModule({
  imports: [OdontogramShellComponent],
  providers: [
    { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: { init: initSpy, destroy: destroySpy } },
  ],
});
```

## Fejlesztés

    npm install
    npm run gen:assets   # SVG asset modulok újragenerálása egy SVG szerkesztése után
    npm test             # test:corpus (Vitest mag-teszt-készlet, beleértve a golden parity fixture-öket) + test:ng (Angular specek, ngtsc-fordítva az `ng test`-en keresztül)
    npm run test:corpus  # tiszta Vitest — csak a framework-független motor + az átemelt React-eredetű korpusz
    npm run test:ng      # Angular komponens-/szolgáltatás *.spec.ts fájlok, az `ng test`-en keresztül (szükséges a szignál input()/output() támogatásához)
    npm run build:styles && npx ng build angular-advanced-odontogram
    npm run docs         # API dokumentáció generálása a docs/api/ mappába

Az `npm test` mindkét futtatót lefuttatja, mert más-más dolgokat fednek le: a
`test:corpus` egy sima Vitest futás a framework-független motoron és a
React-eredetű golden/parity fixture-ökön (Angular fordítás nélkül), míg a
`test:ng` az `ng test`-en keresztül fut, hogy az ngtsc le tudja fordítani a
szignál `input()`/`output()`-ot használó komponens-speceket — ezeket egy sima
Vitest futás önmagában nem tudja feldolgozni.

Terv-specifikáció: `docs/superpowers/specs/2026-08-06-angular-odontogram-port-design.md`.

## Köszönet és licenc

A [react-advanced-odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)
Angular portja, készítette Zoltán Dul ([@ZoliQua](https://github.com/ZoliQua)).

[MIT](../LICENSE) © 2026 Zoltán Dul
