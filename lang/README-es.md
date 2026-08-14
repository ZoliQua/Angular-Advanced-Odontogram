<p align="center">
  <img src="https://raw.githubusercontent.com/ZoliQua/Angular-Advanced-Odontogram/main/docs/angular-module-logo.png" alt="Angular Advanced Odontogram logo" width="160" />
</p>

# 🦷 Angular Advanced Odontogram

[![npm](https://img.shields.io/npm/v/angular-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/angular-advanced-odontogram)
[![Version](https://img.shields.io/badge/version-2.4.1-green?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/releases)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/LICENSE)

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:** 🇬🇧 [English](README-en.md) | 🇭🇺 [Magyar](README-hu.md) | 🇩🇪 [Deutsch](README-de.md) | 🇪🇸 Español (este archivo) | 🇫🇷 [Français](README-fr.md) | 🇮🇹 [Italiano](README-it.md) | 🇵🇱 [Polski](README-pl.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇷🇺 [Русский](README-ru.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md)

---

## 📑 Contenido

- [📋 Descripción general](#-descripción-general)
- [📦 Uso como paquete npm](#-uso-como-paquete-npm)
- [✨ Características principales](#-características-principales)
- [📦 Módulos](#-módulos)
- [🛠️ Controles de interfaz](#-controles-de-interfaz)
- [🦷 Tipos de dientes y estados](#-tipos-de-dientes-y-estados)
- [⚙️ Ajustes](#-ajustes)
- [🖼️ Sistema de plantillas SVG](#-sistema-de-plantillas-svg)
- [🔢 Sistemas de numeración](#-sistemas-de-numeración)
- [🚀 Uso](#-uso)
- [🔗 Integración](#-integración)
- [🧪 Pruebas](#-pruebas)
- [📖 Documentación API](#-documentación-api)
- [📡 API pública](#-api-pública)
- [💾 Persistencia de estado (localStorage)](#-persistencia-de-estado-localstorage)
- [💾 Formato de exportación/importación de estado](#-formato-de-exportaciónimportación-de-estado)
- [🖨️ Exportación](#-exportación)
- [📁 Estructura de carpetas](#-estructura-de-carpetas)
- [⚙️ Stack tecnológico](#-stack-tecnológico)
- [📝 Notas](#-notas)
- [🔒 Notas de seguridad](#-notas-de-seguridad)
- [📖 Cómo citar](#-cómo-citar)

## 🇪🇸 Español

### 📋 Descripción general

Este proyecto es un editor de odontograma interactivo basado en navegador para **Angular + TypeScript** que permite un registro rápido del estado dental con una interfaz limpia. Renderiza plantillas SVG de dientes en capas para representar restauraciones, caries, estado endodóntico, movilidad y otros detalles clínicos, además de ofrecer selección múltiple, filtros de selección y estados predefinidos.

**Este es el port oficial a Angular de [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)** (npm: `react-advanced-odontogram`). Paridad de funcionalidades con react-advanced-odontogram main en el commit `934a911` (posterior a v2.4.0; versión del payload sin cambios en 2.20) — las exportaciones JSON y FHIR R4 son intercambiables entre ambas bibliotecas. El motor clínico (`projects/angular-advanced-odontogram/src/lib/core/`) se comparte de forma literal — la lógica del estado dental, el registro periodontal, la exportación/importación FHIR, las cadenas i18n, el tour guiado y las plantillas SVG son idénticos byte a byte al original de React, y se vuelven a copiar desde un commit ascendente fijado en cada resincronización; solo la capa de componentes (`projects/angular-advanced-odontogram/src/lib/components/`) es nativa de Angular. Existe un pequeño conjunto de desviaciones, explícitamente documentado (solo cadenas de marca/identidad — ver la especificación de diseño del port en este repositorio). El versionado avanza en paralelo (lockstep) con el del módulo de React.

---
![Odontogram editor preview](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_es_odontogram.png)
*Captura de pantalla del proyecto React original — el port de Angular renderiza la misma interfaz.*

🔗 **Demo en vivo:** https://angular-advanced-odontogram.vercel.app/

---

### 📦 Uso como paquete npm

El odontograma se publica como una biblioteca de componentes Angular autocontenida en npm:
[`angular-advanced-odontogram`](https://www.npmjs.com/package/angular-advanced-odontogram).

#### Requisitos
- **Angular 21.2+** (declarado como dependencia peer — la proporciona tu aplicación).
- Un **bundler** que entienda el campo `exports` y ESM — el Angular CLI (`@angular/build`) cumple esto de forma nativa. El paquete es **solo ESM**.
- Node **≥ 20** para las herramientas.

#### Instalación

```bash
npm install angular-advanced-odontogram
```

#### Uso básico

Registra la hoja de estilos **una sola vez**, donde sea que se configuren los estilos globales de tu aplicación (p. ej. `angular.json`):

```json
"styles": [
  "node_modules/angular-advanced-odontogram/styles.css",
  "src/styles.css"
]
```

Luego renderiza `OdontogramShellComponent`:

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

`language` acepta `hu | en | de | es | it | sk | pl | ru | pt-br | zh | ar | fr`; `numberingSystem` acepta `FDI | UNIVERSAL | PALMER`.

#### Entradas del componente

`OdontogramShellComponent` es un componente controlado — cada entrada es una señal `input()` de Angular, todas opcionales, cada una recurriendo al valor por defecto del propio motor cuando se omite. Las más habituales:

| Input | Tipo | Por defecto | Descripción |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | Idioma de la interfaz (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`zh`/`ar`/`fr`). |
| `numberingSystem` | `"FDI" \| "UNIVERSAL" \| "PALMER"` | `"FDI"` | Sistema de numeración dental. |
| `darkMode` | `boolean` | `false` | Interruptor de tema oscuro. |
| `readOnly` | `boolean` | `false` | Desactiva toda edición (solo lectura). |
| `themeConfig` | `OdontogramThemeConfig` | — | Sobrescribe las variables CSS del tema (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Registra plugins de estado personalizados / capas adicionales. |
| `enableNotes` | `boolean` | `false` | Habilita las notas por diente. |
| `enableIcdas` | `boolean` | `false` | Habilita la puntuación de caries ICDAS II. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Complejidad de la tarjeta de Obturaciones: `"simple"` (un material por diente) o `"complex"` (materiales por superficie). |
| `fillingDefectEnabled` | `boolean` | `true` | Habilita los hallazgos de defectos de obturación en la tarjeta de Obturaciones. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | todos disponibles | Materiales de obturación disponibles como un mapa booleano sobre `amalgam`/`composite`/`gic`/`temporary` (las claves desconocidas se ignoran). |
| `fissureSealingEnabled` | `boolean` | `true` | Habilita el sellado de fisuras en la tarjeta de Obturaciones. |
| `languageChange` / `numberingChange` / `darkModeChange` (outputs) | `output<T>` | — | Se emiten cuando el usuario cambia el ajuste desde la interfaz. |
| `fillingComplexityChange` / `fillingDefectEnabledChange` / `fillingMaterialAvailabilityChange` / `fissureSealingEnabledChange` (outputs) | `output<T>` | — | Se emiten cuando el usuario cambia el ajuste correspondiente desde Ajustes → Obturaciones. |

Las entradas de nivel de detalle más finas (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `cariesDepthEnabled`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) también se aceptan — consulta `odontogram-shell.component.ts` para la lista completa y tipada.

Las cuatro entradas de obturaciones anteriores son **solo de restauración**: una entrada omitida nunca escribe en el motor (se conserva una llamada imperativa a `setFillingComplexity()` previa al montaje), mientras que una entrada proporcionada escribe el motor y el estado del modal de Ajustes a la vez, de modo que el modal nunca muestra un valor obsoleto. `fillingMaterialAvailability` se aplica como diff frente a una clave serializada canónica, de modo que volver a renderizar con un nuevo literal de objeto de contenido idéntico nunca reescribe el motor. Los outputs `*Change` correspondientes se emiten desde Ajustes → Obturaciones — la vía de escritura para los hosts que persisten preferencias.

#### API pública (exports con nombre)

`OdontogramShellComponent` es un export con nombre. La API de estado imperativa, el `PerioChartComponent` independiente, el tour guiado y todos los tipos públicos son exports con nombre del mismo punto de entrada:

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

La superficie completa (más de 100 funciones y tipos — `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PdfSettings`, `PerioViewMode`, y muchos más) está completamente tipada en las declaraciones `.d.ts` incluidas; consulta [API pública](#-api-pública) más abajo para la tabla de referencia seleccionada.

#### Superficies componibles (avanzado)

`OdontogramShellComponent` es el componente todo en uno compatible y no requiere configuración adicional. Si necesitas colocar las regiones del odontograma en distintas áreas de tu propio diseño, las cuatro superficies de interfaz de la shell también se exportan y pueden componerse bajo un único `OdontogramUiService`, todas compartiendo una sesión propiedad de una instancia:

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

`OdontogramUiService` acepta la misma forma de configuración que las entradas de `OdontogramShellComponent` (su método `configure()` acepta un objeto `OdontogramUiConfig` de `Signal`s/callbacks, cada campo opcional con el mismo valor por defecto ascendente). Restricción actual: una instancia de `OdontogramUiService` por página (el motor es un singleton a nivel de módulo). Las superficies se pueden montar y desmontar bajo demanda. `OdontogramShellComponent` en sí no ha cambiado — es exactamente esta composición en la disposición predeterminada, cableando explícitamente cada campo desde sus propias entradas.

Para una composición aún más fina, las tarjetas de control individuales también se exportan:

| Componente | Selector | Cubre |
|---|---|---|
| `StatusesCardComponent` | `aao-statuses-card` | Controles de estado/estados predefinidos de toda la boca (Restablecer, dentición primaria/mixta, edéntulo, extras de estado) |
| `ToothDetailsCardComponent` | `aao-tooth-details-card` | Fila base (selección de diente/sustrato), casillas de corona fracturada, interruptores de corona necesaria/reemplazo |
| `CariesCardComponent` | `aao-caries-card` | Modo de profundidad de caries, caries subcoronal, severidad de caries radicular, selector de caries por superficie |
| `FillingsCardComponent` | `aao-fillings-card` | Material de obturación, selector de obturación por superficie + defectos, notas de subcaries/defecto |
| `RootPeriodontiumCardComponent` | `aao-root-periodontium-card` | Estado pulpar/endo, diagnóstico apical, reabsorción, movilidad, estado periimplantario |
| `OrthodonticsCardComponent` | `aao-orthodontics-card` | Aparato, desplazamiento, movimiento vertical, rotación |
| `SurfaceCrossComponent` | `aao-surface-cross` | El widget compartido de selección en cruz B/M/O/D/L que usan internamente las tarjetas de Caries/Obturaciones |

Cada tarjeta es un componente declarativo autocontenido que lee y escribe la sesión compartida mediante `inject(OdontogramUiService)` y el helper exportado `engineState()` (una lectura de cualquier getter del motor que devuelve una signal, mantenida actualizada por el propio bus de notificación de cambios del núcleo). Monta solo las tarjetas que necesite un diseño dado, en cualquier disposición, bajo un único `OdontogramUiService`. `CreditsModalComponent` (`aao-credits-modal`, el popup "Acerca de y créditos" de la barra superior) también se exporta, para los hosts que quieran controlarlo desde su propio estado de apertura/cierre.

```ts
import { engineState, OdontogramUiService, getOdontogramSummary } from "angular-advanced-odontogram";

// Anywhere inside an injection context under an `OdontogramUiService`:
readonly summary = engineState(getOdontogramSummary); // Signal<OdontogramSummary>, kept fresh automatically
```

#### Puntos de inyección de dependencias para pruebas del host

Dos `InjectionToken` permiten que una aplicación host sobrescriba llamadas del motor con efectos secundarios en sus propias pruebas (ambos recurren por defecto a la llamada real del motor en producción; ambos son `providedIn: "root"`):

| Token | Sobrescribe | Forma |
|---|---|---|
| `ODONTOGRAM_ENGINE_LIFECYCLE` | `initOdontogram()` / `destroyOdontogram()`, llamados desde `ngAfterViewInit()`/`ngOnDestroy()` de `OdontogramShellComponent` | `{ init: () => Promise<void>; destroy: () => void }` |
| `EXPORT_PDF_FN` | `exportPdf(opts)`, llamado desde `ExportOptionsModalComponent` al pulsar "Exportar" | `(opts: PdfExportOptions) => Promise<void>` |

Ambos existen porque las funciones reales tocan internamente el DOM/canvas/`jsPDF`, algo que un entorno de pruebas sin interfaz no puede proporcionar por completo — sobrescríbelos mediante el array de providers de `TestBed` de Angular en las pruebas de componentes de una aplicación host.

#### Notas importantes y limitaciones actuales
- **Solo ESM** — el paquete publica un único módulo ES (compilado con `ng-packagr`) más su punto de entrada de declaración de tipos. Está orientado a la resolución de módulos de un bundler; no hay build CommonJS.
- **La hoja de estilos es aparte** — **debes** registrar `angular-advanced-odontogram/styles.css` una vez; no se inyecta automáticamente. Los estilos son CSS global, delimitados bajo `.odontogram-root` y gobernados por variables CSS `--odon-*`.
- **SSR / solo cliente** — el componente lee el DOM al montarse, por lo que debe ejecutarse en el navegador; renderízalo solo del lado del cliente.
- **Los recursos son autocontenidos** — los SVG de dientes e iconos se incrustan en el bundle en tiempo de compilación (módulos TypeScript generados, `npm run gen:assets`); **no hay ninguna descarga de recursos en tiempo de ejecución** que configurar y nada extra que copiar a la carpeta pública de tu aplicación.
- **Una instancia por página** en esta versión — el estado del motor es un singleton a nivel de módulo (igual que el original de React), por lo que renderizar dos instancias de `<aao-odontogram-shell>` en la misma página haría que compartieran el estado de un único odontograma.

---

### ✨ Características principales
- 🖱️ Selección rápida y selección múltiple (CMD/CTRL + clic)
- 🦷 Tipos de dientes: permanente, primario (de leche), implante, subgingival, ausente
- 🦷 Sustrato dental (ortogonal a cualquier restauración): natural, radix (resto radicular), fracturado, preparado para corona
- 👑 Restauraciones por tipo × material: corona / inlay / onlay / carilla (veneer) / puente en e.max, oro, gradia, circonio, metal, metal-cerámica, telescópica o temporal (el onlay es solo de vista oclusal) — elegidas desde un único selector combinado de pocos clics "Fix: Corona – …"; las coronas `metal` heredadas migran a `metal-ceramic` (metal-cerámica); los implantes usan el mismo modelo tipo × material, compuesto con una capa de conector de implante. El selector se acota según el tipo de diente: un implante solo ofrece corona/puente (más sus cinco opciones de anclaje, ver abajo); un diente ausente/con hueco solo ofrece un póntico de puente (más removible parcial/completa); un sustrato `radix` oculta por completo el control de restauración (no se puede registrar ninguna restauración sobre un resto radicular)
- 🦿 Prótesis removibles/de anclaje en el eje dedicado `prosthesis` (entradas "Kivehető:" en el selector combinado): pilar de cicatrización de implante, localizador, localizador con sobredentadura, barra, barra con sobredentadura; prótesis parcial o completa removible soportada por dientes
- 🌉 Los dientes de puente renderizan tanto la corona como el conector de silla de montar; una superposición de tramo de puente multidiente renderiza un conector continuo y adaptado a la arcada a través de los dientes de puente consecutivos (pónticos + pilares) y los espacios entre ellos, incluido en la exportación PNG/JPG/SVG
- 🔍 Registro de caries en 6 superficies: mesial, distal, bucal, lingual, oclusal, subcoronal
- 🪥 Materiales de obturación por superficie: amalgama, composite, ionómero de vidrio (GIC), temporal
- 🏥 Un único selector combinado "Estado pulpar / endo" (agrupado: pulpa vital vs. tratada/endo): los estados endodónticos (obturación medicinal, tratamiento de conductos, obturación incompleta, poste de fibra de vidrio, poste metálico) y el diagnóstico pulpar AAE (`pulpDx`: normal / pulpitis reversible / irreversible / necrosis) son mutuamente excluyentes — un diente con tratamiento de conducto (`endo` establecido) no puede tener a la vez un diagnóstico pulpar vital; al tratarlo, `pulpDx` se normaliza a `normal`. Un ajuste opcional de 3 niveles de detalle pulpar (`pulpDetailLevel`: simple / AAE / latín práctico) muestra 9 subtipos en latín práctico mediante `pulpLatin`
- 🦴 El diagnóstico apical (`apicalDx`: periodontitis apical sintomática/asintomática, absceso apical agudo/crónico, osteítis condensante) determina directamente el glifo periapical; el subtipo de lesión granuloma/quiste solo se muestra bajo periodontitis apical sintomática/asintomática
- 🩹 Tarjeta combinada "Raíz y periodonto" (sección colapsable única para hallazgos radiculares/periapicales y periodontales)
- ⚕️ Modificaciones: inflamación periapical (visible solo en dientes ausentes/alvéolo de extracción; oculta en dientes presentes y en implantes, donde lo cubre `periImplant`), enfermedad periodontal, grados de movilidad (M1/M2/M3, ocultos en implantes)
- 🦷🔩 Estado periimplantario (`periImplant`: none / mucositis / peri-implantitis-mild / -moderate / -severe) — clasificación del World Workshop 2018, mostrado como un selector dedicado en los implantes
- 🏷️ Indicadores especiales: corona necesaria, reemplazo de corona necesario, espacio cerrado, plan de extracción, sellado de fisuras, pérdida de punto de contacto
- 👁️ Interruptores de vista oclusal, muelas del juicio, visibilidad de hueso y pulpa
- 🔢 12 filtros de selección (todos, presentes, permanentes, de leche, implantes, ausentes, superior/inferior, frontales/molares)
- 📊 Estados predefinidos (restablecer, dentición primaria, dentición mixta, edéntulo)
- 📦 22 plantillas de restauración predefinidas (puentes, prótesis removibles, prótesis con barra e implantes)
- 💾 Exportación/importación de estado en JSON (versión 2.20; las importaciones siguen aceptando las versiones heredadas 1.4 y de 2.0 a 2.19, migrando automáticamente, con estados personalizados de plugins y notas por diente)
- 💽 Persistencia opcional (opt-in) en localStorage (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — desactivada por defecto; guarda automáticamente el odontograma de estado (y, opcionalmente, el de plan) con un límite de tamaño de 4 MB, enviando los errores de almacenamiento/análisis a un callback `onError` (o `console.warn`) en lugar de lanzar una excepción
- 🔗 Exportación HL7 FHIR R4 (Bundle de colección con Observations por diente, codificación dental ISO 3950 para dentición permanente **y** dientes de leche deciduos (51-85, con importación sin pérdida de datos), sistema de códigos local); un componente de caries con severidad registrada también incluye una codificación del sistema de puntuación — ICDAS en una superficie primaria (sin obturar), CARS en una recurrente (obturada)
- ✚ Selección de superficies en cruz/más (B/M/O/D/L) para caries y obturaciones — `SurfaceCrossComponent`, exportado para diseños componibles
- 🧱 Materiales de obturación por superficie (obturaciones mixtas, p. ej. bucal amalgama + distal composite)
- 🖼️ Exportación de imagen PNG/JPG/SVG del odontograma (descargable; PNG/JPG rasterizado desde SVG vectorial)
- 🦷 Caries/subcaries como máquina de estados por superficie: una superficie cariada sin obturación se renderiza como caries primaria (opacidad por niveles ICDAS); en cuanto esa superficie tiene una obturación, se renderiza en su lugar como caries recurrente (puntuada con CARS) — ambas nunca están activas a la vez en la misma superficie
- 🎯 Severidad unificada por superficie (`cariesSeverity`, 0–6): se lee como profundidad ICDAS en una superficie primaria, como una puntuación CARS con nombre (Sana … Cavidad extensa) en una recurrente, mediante un popup contextual que muestra solo la escala relevante para el estado actual de la superficie
- 🌱 Caries radicular (`rootCaries`: none / active / arrested / active-cavitated), que activa la capa gráfica dedicada de caries radicular con una opacidad según la severidad
- 📡 Profundidad radiográfica de caries (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 por superficie), independiente de la escala visual ICDAS/CARS, mostrada como una insignia y recuperable mediante su propia Observation FHIR
- 🎚️ Tres ajustes de granularidad de caries (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) más un interruptor `cariesDepthEnabled`, que reducen cada escala a una vista de selector más simple sin perder el valor almacenado
- 🩹 Línea de resumen de subcaries en el panel de Obturaciones: enumera cualquier diente seleccionado con caries recurrente y sus superficies
- 🪛 Defectos de obturación por superficie (`fillingDefect`: none / marginal / fracture / wear) en restauraciones directas, independientes de la caries recurrente
- 🦷💥 Desgaste dental tipificado por causa clínica y localización (`wearEdge`: none / attrition / erosion, incisal/oclusal; `wearCervical`: none / abrasion / abfraction / erosion, cervical)
- 🎨 Decoloración dental por causa (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) en dientes permanentes y de leche
- ✏️ Los dientes anteriores (incisivos/caninos) rotulan su superficie oclusal como "incisal" en toda la interfaz; la clave de superficie almacenada sigue siendo `occlusal`
- 🔤 Notación de superficie según la posición del diente (Ajustes → Detalles del diente → "Notación de superficie", simple/completa, por defecto completa): en modo completo, la letra y la etiqueta de superficie de caries/obturación siguen la anatomía dental — oclusal → I/incisal en dientes anteriores, bucal → L/labial en dientes anteriores, lingual → P/palatino en dientes superiores y L/lingual en dientes inferiores
- 🦷↕️ Registro ortodóntico por diente (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: booleano) en un diente natural presente (permanente o de leche)
- 🪨 Cálculo, y reabsorción radicular tipificada como interna o cervical externa (`resorptionType`)
- 📏 Profundidad de caries por superficie (superficial / dentina / profunda), o puntuación ICDAS II opcional (0–6) mediante `enableIcdas`
- 🩹 Interruptor de filtración marginal de corona, visible solo con una restauración de corona o puente
- 🧰 Barra superior unificada de iconos con un diálogo de Ajustes por pestañas (7 pestañas — General / Odontograma / Gráfico periodontal / Detalles del diente / Caries / Obturaciones / Exportación — ver [Ajustes](#-ajustes) abajo)
- 🦷🩺 Ajustes → pestaña "Gráfico periodontal": un interruptor de disponibilidad más 16 interruptores de mostrar/ocultar por índice para las filas del gráfico periodontal, cada uno con su descripción, más una opción de nombre de índice traducido frente a canónico
- 📋 Panel de información dental: resumen de texto en vivo de todo el odontograma (recuentos de dientes, listas presentes/ausentes, caries incl. secundaria, obturaciones, endodoncias, prótesis, implantes, estado periodontal) — visible por defecto, conmutable en Ajustes
- 🗂️ Menú desplegable de exportación consolidado (Estado JSON / FHIR / PNG / JPG / SVG / informe PDF), cada formato ocultable de forma independiente desde Ajustes → General
- 📥 Menú desplegable de importación con importación FHIR (recupera Bundles exportados), ocultable de forma independiente por fuente
- ⏳ Superposición de progreso durante la exportación de imagen
- 🎓 Tour de introducción interactivo (recorrido guiado por los controles de la shell)
- 🔢 Tres sistemas de numeración (FDI, Universal, Palmer)
- 🌐 I18n — 12 idiomas de interfaz (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) con selector de idioma; el árabe renderiza la interfaz de derecha a izquierda, con los odontogramas dental/periodontal fijados de izquierda a derecha
- 🌗 Soporte de modo oscuro con botón de alternancia (independiente o controlado por la aplicación principal)
- 🎨 Configuración de tema personalizado (entrada `themeConfig`) con propiedades CSS personalizadas (`--odon-*`)
- 📱 UX táctil móvil: popover de zoom al tocar, menú contextual con pulsación larga, zoom con pellizco, áreas táctiles WCAG de 44px, navegación por alternador de arcada
- 🔌 Sistema de plugins SVG personalizados: inyecta superposiciones visuales, estado personalizado por diente, soporte de exportación/importación JSON — la salida de `renderSvg()` de los plugins se sanea con DOMPurify (perfil SVG) antes de insertarse en el odontograma en vivo; los plugins siguen ejecutándose como código de confianza, así que solo deben cargarse desde fuentes fiables
- ⚠️ Advertencias de validación de estado para combinaciones incompatibles de estado dental
- 🏷️ Tooltip de estado automático en las losetas dentales (muestra todos los estados activos)
- 🩺 Tooltip por diente y panel de resumen de toda la boca que muestran el conjunto completo de hallazgos clínicos (diagnóstico pulpar/apical, reabsorción radicular, estado periimplantario, caries radicular graduada, cálculo, filtración marginal de corona, fractura, pérdida de contacto, desgaste incisal/oclusal y cervical tipificado)
- ♿ Accesibilidad por teclado (WCAG): roles ARIA listbox/option, selección con Intro/Espacio, navegación con flechas, contornos focus-visible
- 🔒 Modo de solo lectura: desactiva todas las interacciones para casos de uso de impresión/informe/visualización
- ✨ Animaciones de selección: borde punteado pulsante y sombra brillante en los dientes seleccionados (compatible con prefers-reduced-motion)
- 📝 Notas por diente: doble clic para añadir/editar notas, icono de nota junto al número de diente, tooltip al pasar el cursor con el texto de la nota, una línea "Notas individuales" en el panel de resumen de toda la boca, inclusión en el informe PDF, exportación/importación JSON
- 🔀 División de odontograma Estado ↔ Plan: un selector `Status | Plan` alterna entre un odontograma de **estado** actual y uno de **plan** (tratamiento propuesto), cada uno con sus propios estados por diente; la exportación/importación siempre opera sobre el odontograma de estado, mientras que el odontograma de plan se lee/escribe por separado mediante su propia API (ver [API pública](#-api-pública)) y — cuando difiere del estado — se incluye como sección adicional `plan` en la exportación JSON
- 📝 Cuadro "Qué cambia": cuando el plan difiere del estado actual, enumera cada diferencia por diente y por eje de tratamiento; también disponible mediante programación a través de `getPlanChanges()`
- 🅿️ Estilo de propuesta: en modo Plan, los hallazgos que el plan **añade** respecto al estado actual se renderizan con un contorno "propuesto" distintivo, punteado y con tinte
- 🚦 Restricción del modo Plan: el odontograma de Plan solo muestra lo que un dentista puede *hacer* — los hallazgos de solo estado (caries, desgaste, decoloración, todo el bloque periodontal) quedan ocultos; la restauración, la prótesis, la ortodoncia, la necesidad/reemplazo de corona y el plan de extracción siguen siendo planificables

![Full-mouth periodontal chart](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_es_perio.png)
*Captura de pantalla del proyecto React original — el port de Angular renderiza la misma interfaz.*

- 🩺 Registro periodontal: **profundidad de sondaje**, **margen gingival** y **sangrado al sondaje** (+ supuración) por sitio, en los seis sitios estándar de cada diente, con un **nivel de inserción clínica derivado (CAL = PD + margen gingival)**, recesión y **%BOP** de toda la boca. Un **gráfico periodontal gráfico de boca completa** — cada arcada se dibuja como dos SVG independientes, bucal y palatino/lingual, con una **línea CEJ** roja, una cuadrícula numerada en milímetros y una curva de margen gingival/profundidad de bolsa, dividida por una banda central de índices periodontales que agrupa la **clase de Miller** y **Placa/PI/GI/mPI/mBI** como losetas romboidales anatómicas por diente; entrada con avance automático de teclado; el gráfico se escala dinámicamente para llenar el ancho disponible. Se presenta como un selector de vista `Odontogram | Periodontal Status`, y sigue siendo invocable por separado mediante el `PerioChartComponent` exportado. Exportación **FHIR** por sitio mediante el panel periodontal LOINC (`74029-0`; PD `32910-2`, recesión `32911-0`, CAL `32912-8`)
- 🧪 Una amplia suite de pruebas automatizadas (ver [Pruebas](#-pruebas)) que cubre numeración, traducciones, estados predefinidos, i18n, la shell, tema, táctil, plugins, accesibilidad y paridad de ejes clínicos/diagnósticos frente al corpus congelado de React
- 📖 Documentación API TypeDoc con comentarios JSDoc en todas las exportaciones públicas (`npm run docs`)

### 📦 Módulos
- 🦷 Cuadrícula del odontograma e interfaz de mosaicos dentales (`OdontogramChartSurfaceComponent`)
- 🎛️ Controles y panel de estado (`ToothControlsSurfaceComponent` + las 7 tarjetas declarativas)
- 🎨 Motor de capas SVG y plantillas (núcleo sin dependencia de framework, `core/odontogram.ts`)
- 🔢 Numeración dental y mapeo de etiquetas (FDI/Universal/Palmer, `core/utils/numbering.ts`)
- 🌐 Localización — 12 idiomas de interfaz (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), incluyendo árabe (RTL) (`core/i18n/`, `I18nService`)
- 💾 Exportación/importación de estado
- 📋 Extras de estado: plantillas de restauración predefinidas
- 🎨 Configuración de tema: paleta de colores personalizable mediante propiedades CSS `--odon-*`
- 📱 Interacciones táctiles móviles (zoom al tocar, pulsación larga, zoom con pellizco, alternador de arcada)
- 🔌 Sistema de plugins SVG personalizados
- ⚠️ Sistema de validación de estado y tooltips
- ♿ Accesibilidad por teclado y soporte ARIA
- 🔒 Modo de solo lectura
- ✨ Animaciones de selección
- 📝 Sistema de notas por diente
- 🧱 **UI componible** — `OdontogramUiService`, el helper `engineState()`, 4 superficies presentacionales y 7 tarjetas de control declarativas, todas exportadas de forma independiente (ver [Superficies componibles](#-uso-como-paquete-npm) arriba)
- 🧪 Suite de pruebas automatizadas (corpus Vitest + `ng test`, ver [Pruebas](#-pruebas))

### 🛠️ Controles de interfaz

**🔝 Barra superior** (`OdontogramTopbarComponent`):
- Selector de idioma (desplegable HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR)
- Botón de modo oscuro (icono sol/luna, alterna entre tema claro y oscuro)
- Selector de sistema de numeración (desplegable FDI/Universal/Palmer)
- Botones Exportar estado / Importar estado
- Ajustes (icono de engranaje), Créditos/Acerca de (icono de información), enlace a GitHub

**📊 Encabezado del gráfico:**
- Alternador de vista oclusal
- Alternador de visibilidad de muelas del juicio
- Alternador de visibilidad de hueso
- Alternador de visibilidad de pulpa
- Botón de borrar selección

**🔍 Filtros de selección:**
- Seleccionar todos / Todos presentes / Permanentes / De leche / Implantes / Todos ausentes
- Seleccionar superior / Superior 6 frontales / Molares superiores
- Seleccionar inferior / Inferior 6 frontales / Molares inferiores

**📋 Estados predefinidos:**
- Restablecer todo (restablecer boca)
- Dentición primaria
- Dentición mixta
- Alternador edéntulo

**📦 Desplegable de extras de estado:**
- Puentes de circonio superiores/inferiores (12-22, 13-23, 16-26, arco completo)
- Puentes metálicos superiores/inferiores (12-22, 13-23, 16-26, arco completo)
- Prótesis parciales removibles superiores/inferiores
- Prótesis completas removibles superiores/inferiores
- Prótesis con barra superiores/inferiores con implantes

**🦷 Panel editor de diente** (`ToothControlsSurfaceComponent`, para el diente/dientes seleccionados, agrupado en tarjetas colapsables):
- **Tarjeta de estados:** estados predefinidos y extras de estado de toda la boca (mostrable/ocultable de forma independiente mediante `showStatusCard`)
- **Tarjeta de detalles del diente:** selección de diente (tipo base incl. variantes de corona fracturada), sustrato dental, el menú desplegable de restauración combinado "Fix: …" / "Kivehető: …", casilla de filtración marginal de corona, casillas de ubicación de corona fracturada, interruptores de corona necesaria / reemplazo de corona necesario
- **Tarjeta de ortodoncia:** aparato, desplazamiento mesial/distal, movimiento vertical, interruptor de rotación — visible en un diente natural presente (mostrable/ocultable de forma independiente mediante `showOrthoCard`)
- **Tarjeta de caries:** menú desplegable de modo de profundidad de caries, casilla de caries subcoronal, menú desplegable de severidad de caries radicular, y el selector de caries por superficie B/M/O/D/L (`SurfaceCrossComponent`) con un popup contextual de profundidad ICDAS/CARS y una insignia de profundidad radiográfica
- **Tarjeta de obturaciones:** menú desplegable de material de obturación, selector de obturación por superficie, indicador de defecto de obturación por superficie, notas de subcaries y de defecto de obturación
- **Tarjeta de raíz y periodonto:** selector combinado "Estado pulpar / endo", selector de diagnóstico apical, selector de subtipo de lesión periapical, selector de tipo de reabsorción radicular, selector de grado de movilidad, selector de estado periimplantario (solo implantes)
- **Indicadores especiales:** plan/herida de extracción, espacio cerrado, sellado de fisuras, pérdida de punto de contacto, cálculo, pin parapulpar, resección endodóntica, pilar de puente

### 🦷 Tipos de dientes y estados

**Selección de diente (tipo base):**
| Valor | Descripción |
|---|---|
| `none` | Diente ausente |
| `tooth-base` | Diente permanente |
| `milktooth` | Diente primario (deciduo) |
| `implant` | Implante dental |
| `tooth-under-gum` | Diente subgingival (no erupcionado) |

**Variantes de diente fracturado:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Sustrato dental (dientes permanentes):**
`natural` (por defecto), `radix` (resto radicular), `broken`, `crownprep` (preparado para corona)

**Tipo de restauración (dientes permanentes):**
`none`, `crown`, `inlay`, `onlay` (solo vista oclusal), `veneer`, `bridge`

**Material de restauración (dientes permanentes):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (las coronas `metal` heredadas migran aquí), `telescope`, `temporary`

**Las opciones de restauración están acotadas según el tipo de diente** (`restorationOptions()` en `projects/angular-advanced-odontogram/src/lib/core/registry/restorations.ts`): un implante solo ofrece los tipos de restauración `crown`/`bridge` (compuestos con una capa de conector de implante) más las cinco entradas de anclaje `prosthesis` de abajo; un diente ausente/con hueco solo ofrece un póntico `bridge` más las dos entradas de prótesis removible de `prosthesis`; un sustrato `radix` oculta por completo el control de restauración.

**Prótesis** (`prosthesis`; eje ortogonal removible/de anclaje, mostrado como entradas "Kivehető:" en el menú desplegable de restauración combinado):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (anclajes de implante, con o sin sobredentadura), `removable-partial`, `removable-full` (prótesis soportadas por dientes en un diente ausente/con hueco). Un diente tiene una restauración fija o una prótesis, nunca ambas — establecer una borra la otra.

**Filtración marginal de corona** (`crownLeakage`; booleano): solo se muestra cuando `restorationType` es `crown` o `bridge`.

**Opciones endodónticas (dientes permanentes):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opciones endodónticas (dientes de leche):**
`none`, `endo-medical-filling`

`endo` y `pulpDx` se presentan mediante un único selector combinado "Estado pulpar / endo" (agrupado: pulpa vital vs. tratada/endo) y son mutuamente excluyentes — elegir una opción tratada (`endo != none`) restablece `pulpDx` a `normal`, y elegir un diagnóstico pulpar restablece `endo` a `none`.

**Materiales de obturación (dientes permanentes):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiales de obturación (dientes de leche):**
`composite`, `gic`, `temporary`

**Superficies de obturación/caries:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (solo caries)

**Modificaciones:**
`inflammation` (periapical), `parodontal` (periodontal), `mobility` (M1/M2/M3)

**Tipo de lesión periapical** (`periapicalType`; califica el glifo periapical, solo se muestra bajo periodontitis apical sintomática/asintomática):
`none`, `granuloma`, `cyst` — el valor heredado `abscess` sigue aceptándose/almacenándose pero ya no se ofrece en el selector

**Diagnóstico pulpar** (terminología AAE; `pulpDx`):
`normal`, `reversible-pulpitis`, `irreversible-pulpitis`, `necrosis` — mutuamente excluyente con `endo`

**Diagnóstico pulpar, latín práctico** (`pulpLatin`; el selector de pulpa solo lo muestra cuando `pulpDetailLevel` es `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Nivel de detalle pulpar** (`pulpDetailLevel`, ajuste global): `simple`, `aae` (por defecto), `latin`

**Diagnóstico apical** (`apicalDx`; determina el glifo periapical):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Tipo de reabsorción radicular** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Estado periimplantario** (`periImplant`; solo implantes, clasificación del World Workshop 2018):
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Severidad de caries** (`cariesSeverity`; campo unificado por superficie, `0`–`6`): en una superficie sin obturación se lee como escala de profundidad ICDAS (`superficial` / `dentin` / `deep`, o los códigos ICDAS II sin procesar `0–6` cuando `enableIcdas` está activado); en una superficie con obturación se lee como una puntuación CARS con nombre (`0` sana … `6` cavidad extensa)

**Caries radicular** (`rootCaries`): `none`, `active`, `arrested`, `active-cavitated`

**Profundidad radiográfica de caries** (`radiographicDepth`; por superficie): `none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Ajustes de granularidad de caries** (globales): `secondaryCariesMode` (`simple`/`standard`/`full`, por defecto `standard`), `rootCariesMode` (`simple`/`severity`, por defecto `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, por defecto `off`), `cariesDepthEnabled` (booleano, por defecto `true`)

**Indicadores especiales:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Desgaste dental** (`wearEdge`, `wearCervical`; tipo clínico por localización, condicionado a tooth-base + sin restauración + sustrato natural):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Decoloración** (`discoloration`; causa por diente, condicionada a un tooth-base natural o diente de leche + sin restauración + sustrato natural):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Defecto de obturación** (`fillingDefect`; por superficie, hallazgo de restauración directa independiente de la caries recurrente):
`none`, `marginal`, `fracture`, `wear`

**Ortodoncia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; por diente, condicionado a un diente natural presente):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion`, `intrusion` — `orthoRotation`: booleano

**Ajustes de detalle / notación dental** (ajustes de sesión globales, Ajustes → Detalles del diente): `wearDetailLevel` y `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, por defecto `complex`) y `surfaceNotation` (`simple`/`full`, por defecto `full`)

### ⚙️ Ajustes

Se abre desde el icono de engranaje de la barra superior (`SettingsModalComponent`); un `dialog` ARIA con foco atrapado y un diseño de 7 pestañas (Esc/clic en el fondo para cerrar, flechas para cambiar de pestaña). El diálogo es una vista pura sobre un `SettingsState` proporcionado por el host — no posee ningún estado de ajustes por sí mismo. Todos los ajustes son solo estado de UI a nivel de sesión, salvo que se indique lo contrario — ninguno modifica los datos por diente ni el payload de exportación.

- **General:** sistema de numeración (FDI/Universal/Palmer), idioma, tema claro/oscuro, disponibilidad de exportación por formato (PNG/JPG/SVG/PDF — oculta el elemento de menú de Exportación correspondiente cuando está desactivado, y desactiva la pestaña de Exportación cuando el PDF está desactivado), disponibilidad de importación por fuente (Estado JSON/FHIR)
- **Odontograma:** diseño en pantalla — espaciado de dientes, tamaño del número de diente, color de selección y estilo de borde; visibilidad del panel de información dental; disponibilidad del modo Plan; perfil de anatomía dental (`classic` por defecto / `measured` — nueve plantillas dentales medidas según la literatura en una disposición de dos arcadas con ancho por diente, conmutable en tiempo de ejecución); visibilidad de la tarjeta de Estados y de la tarjeta de Ortodoncia
- **Gráfico periodontal:** un interruptor de disponibilidad que acota el resto de la pestaña y los puntos de entrada periodontales en la shell; modo de vista periodontal (`toggle`/`popup`); 16 interruptores de mostrar/ocultar por índice en 5 grupos (Bolsa: PD/GM/CAL/BOP · Higiene: Placa/PI/GI · Mucogingival: visibilidad de CEJ/concavidad radicular/KG/GT · Soporte: furcación/movilidad/clase de Miller · Periimplantario: mPI/mBI); un modo de nombre de índice traducido frente a canónico (canónico = un nombre científico fijo en inglés/latín en todos los idiomas de la interfaz; los tooltips siempre permanecen localizados)
- **Detalles del diente:** nivel de detalle pulpar (simple/AAE/latín práctico, por defecto AAE), nivel de detalle de desgaste y nivel de detalle de decoloración (simple/complejo, cada uno por defecto complejo), notación de superficie (simple/completa, por defecto completa), interruptor de notas por diente
- **Caries:** interruptor de puntuación ICDAS II, interruptor de profundidad de caries, granularidad de caries radicular (simple/severidad), granularidad secundaria/CARS (simple/estándar/completa), granularidad de profundidad radiográfica (desactivada/tresNiveles/detallada)
- **Obturaciones:** complejidad de obturación (compleja/simple), interruptor de hallazgos de defecto de obturación, disponibilidad por material (amalgama/composite/ionómero de vidrio/temporal), interruptor de sellado de fisuras
- **Exportación:** la configuración completa del informe PDF (`PdfSettings` — ver [Exportación](#-exportación) abajo) — desactivada (recurre al contenido de la pestaña General) siempre que la exportación PDF esté desactivada en la pestaña General

### 🖼️ Sistema de plantillas SVG

**Plantillas dentales** (en `projects/angular-advanced-odontogram/src/lib/core/assets/teeth-svgs/`):
| Plantilla | Dientes que la usan |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisivos) |
| `13.svg` | 13, 23, 33, 43 (caninos) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (premolares) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molares) |

Las plantillas se rotan 180 grados para la mandíbula inferior y se reflejan horizontalmente para el lado izquierdo. Una subcarpeta paralela `measured/` contiene las nueve plantillas dentales medidas según la literatura que renderiza el perfil de anatomía `measured` en una disposición de dos arcadas con ancho por diente (Ajustes → Odontograma → anatomía dental).

**SVGs de iconos** (en `projects/angular-advanced-odontogram/src/lib/core/assets/icon-svgs/`):
`icon_8.svg` (muela del juicio), `icon_gum.svg` (hueso), `icon_no_selection.svg` (borrar), `icon_occl.svg` (vista oclusal), `icon_pulp.svg` (pulpa)

Ambas carpetas se compilan en módulos TypeScript generados (`core/generated/teeth-svgs.ts`, `core/generated/icon-svgs.ts`) mediante `npm run gen:assets` — ejecuta esto tras editar un SVG de origen para mantener sincronizadas las cadenas en línea incrustadas.

### 🔢 Sistemas de numeración

**FDI (ISO 3950):** Dientes adultos 11-18, 21-28, 31-38, 41-48. Dientes primarios 51-55, 61-65, 71-75, 81-85. Valor: `"FDI"`.

**Universal (EE. UU.):** Dientes adultos numerados 1-32. Dientes primarios con letras A-T. Valor: `"UNIVERSAL"`.

**Palmer (Zsigmondy-Palmer):** Formato cuadrante + posición (p. ej. UR-1, LL-5). Dientes primarios usan letras A-E por cuadrante. Valor: `"PALMER"`.

`NumberingSystem` (`core/utils/numbering.ts`) es la unión exacta `"FDI" | "UNIVERSAL" | "PALMER"`; la función exportada `toLabel(fdiTooth, system)` convierte un número de diente FDI a la etiqueta del sistema solicitado (p. ej. `toLabel(14, "PALMER")` → `"UR-4"`).

### 🚀 Uso
Desarrollo (ejecuta la aplicación de demostración):
```bash
npm install
npm start           # ng serve
```
Compilar la biblioteca:
```bash
npm run build:styles && npx ng build angular-advanced-odontogram
```
Compilar la aplicación de demostración:
```bash
npm run build:demo
```

### 🔗 Integración
El componente se puede integrar en cualquier aplicación Angular:
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

**Integración del modo oscuro:**
- **Modo independiente:** Omite `darkMode` — el componente gestiona su propio estado de tema mediante el botón de la barra superior y añade/elimina la clase `.dark` en el elemento raíz del host.
- **Modo controlado:** Vincula `[darkMode]` y `(darkModeChange)` — la aplicación principal controla el tema. El botón de alternancia sigue apareciendo pero emite `darkModeChange` en lugar de gestionar el estado interno. La aplicación principal es responsable de añadir/eliminar la clase `.dark` en `<html>`.

**Tema personalizado:**
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

**Integración de plugins:**
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

La salida de `renderSvg()` de los plugins se sanea con DOMPurify (perfil SVG) antes de insertarse en el odontograma en vivo — ver [Notas de seguridad](#-notas-de-seguridad).

### 🧪 Pruebas

La suite se divide en **dos runners**, y ambos deben pasar (`npm test` ejecuta los dos, en orden):

```bash
npm run test:corpus   # plain Vitest — the shared clinical-engine core
npm run test:ng       # Angular's Vitest builder — the Angular shell (ng test)
npm test              # both, in order
npm run test:watch    # watch mode (corpus runner)
```

- **`test:corpus`** (`vitest run`) ejecuta `projects/angular-advanced-odontogram/src/lib/core/` — el núcleo clínico compartido — frente al corpus de pruebas portado (más de 100 archivos de spec en `core/__tests__/`). Aquí es donde viven y se verifican byte a byte los **fixtures dorados** de renderizado SVG, exportación FHIR y round-trip JSON: `parity/svg-fingerprints.json`, `parity/fhir-golden.json`, `parity/roundtrip-golden.json`, `parity/shell-dom-golden.html`.
- **`test:ng`** (`ng test angular-advanced-odontogram --watch=false`, la integración Vitest de `@angular/build:unit-test` de Angular) ejecuta los propios specs `*.spec.ts` de la shell de Angular — componentes, servicios, directivas — verificando la paridad del DOM: la shell renderiza los mismos ids, clases y marcado que los componentes originales de React.

Como la integración Vitest de este builder no admite `vi.mock()`/`vi.spyOn()` para el mockeo de módulos por ruta relativa, los efectos secundarios que tocan el DOM (`initOdontogram`/`destroyOdontogram`, `exportPdf`) se sobrescriben mediante los tokens de inyección `ODONTOGRAM_ENGINE_LIFECYCLE`/`EXPORT_PDF_FN` y el array de providers de `TestBed` de Angular — ver [Puntos de inyección de dependencias para pruebas del host](#-uso-como-paquete-npm) arriba.

### 📖 Documentación API
```bash
npm run docs           # Generate TypeDoc docs in docs/api/
```
La API del núcleo clínico compartido también está documentada en el proyecto original:

📚 **https://zoliqua.github.io/React-Odontogram-Modul/**

### 📡 API pública

**Entradas/salidas del componente:** ver [Entradas del componente](#-uso-como-paquete-npm) arriba para la tabla completa.

**Funciones exportadas para control externo** (subconjunto seleccionado — la superficie completa y tipada está en el `.d.ts` incluido):

| Función | Descripción |
|---|---|
| `initOdontogram()` / `destroyOdontogram()` | Inicializar/limpiar el motor (llamado internamente por `OdontogramShellComponent`/`OdontogramUiService` mediante el token `ODONTOGRAM_ENGINE_LIFECYCLE`) |
| `setNumberingSystem(system)` | Cambiar entre FDI, UNIVERSAL, PALMER |
| `clearSelection()` | Deseleccionar todos los dientes |
| `registerPlugins(plugins)` | Registrar plugins SVG personalizados |
| `setPluginState(toothNo, pluginId, value)` / `getPluginState(toothNo, pluginId)` | Establecer/obtener el estado personalizado de un plugin para un diente |
| `getToothStateSummary(toothNo)` | Obtener el resumen localizado de todos los estados activos |
| `getOdontogramSummary()` | Obtener un resumen de texto estructurado y localizado de todo el odontograma (recuentos, secciones, cambios planificados) |
| `onStateChange(callback)` | Suscribirse a los cambios de estado; devuelve una función para cancelar la suscripción |
| `setReadOnly(value)` / `getReadOnly()` | Activar/desactivar / consultar el modo de solo lectura |
| `setNotesEnabled(value)` / `getNotesEnabled()` | Activar/desactivar / consultar las notas por diente |
| `setPulpDetailLevel(level)` / `getPulpDetailLevel()` | Definir/obtener el vocabulario del selector de pulpa — `"simple"`, `"aae"` o `"latin"` |
| `getToothAnatomy()` / `setToothAnatomy(v)` | Obtener/definir el perfil de anatomía dental — `"classic"` o `"measured"` |
| `getChartMode()` / `setChartMode(mode)` | Obtener/cambiar el odontograma activo — `"status"` o `"plan"` (el odontograma de plan se copia del de estado la primera vez que se activa) |
| `getStatusChart()` / `getPlanChart()` / `setPlanChart(payload)` | Leer los payloads de los odontogramas de estado/plan de forma independiente al activo, o reemplazar los dientes del odontograma de plan |
| `getPlanChanges()` | Obtener el diff estructurado estado→plan (`{ toothNo, axis, from, to }[]`) |
| `setPerioSite(toothNo, site, patch)` / `getToothPerio(toothNo)` | Establecer/obtener los datos periodontales de uno de los seis sitios (`patch` = `{ pd?, gm?, bop?, sup? }`) |
| `getToothCal(toothNo)` | Obtener el CAL derivado por sitio de un diente |
| `getPerioSummary()` | Agregados periodontales de toda la boca: recuento de sitios registrados, recuento de sangrado, %BOP, peor CAL, PD máxima |
| `getPerioChart()` | Obtener los registros periodontales por diente del odontograma activo |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Abrir/cerrar/consultar programáticamente la superposición del gráfico periodontal |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Obtener/definir cómo se presenta el gráfico periodontal — `"toggle"` o `"popup"` |
| `getPerioClassification()` | Obtener la clasificación periodontal del World Workshop 2017 (`{diagnosis, stage, grade, extent, derived, overridden}`) |
| `setDiagnosisOverride(v)` / `setStageOverride(v)` / `setGradeOverride(v)` / `setExtentOverride(v)` | Anular un eje derivado de la clasificación periodontal, o `null` para revertir al derivado |
| `getCaseMeta()` / `resetCaseMeta()` | Obtener/restablecer el objeto de metadatos a nivel de caso (edad, estado de tabaquismo/diabetes, identidad del paciente, fecha de examen, …) |
| `setPatientName(v)` / `setPatientDob(v)` / `setExamDate(v)` | Establecer los campos de identidad del caso (solo encabezado del informe PDF — nunca forman parte de la exportación FHIR) |
| `exportFhir(options?)` | Exportar el odontograma como Bundle de colección HL7 FHIR R4 (descarga JSON); referencia `{ subject }` opcional |
| `importFhirBundle(input)` | Importar un Bundle FHIR R4 (objeto o cadena JSON) producido por este módulo |
| `exportImage(format)` | Descargar el odontograma como imagen — `"png"` o `"jpg"` |
| `exportSvg()` | Descargar el odontograma como SVG escalable (vectorial) |
| `hasAnyPerioData()` | `true` si hay algún eje periodontal registrado en cualquier parte de la boca |
| `exportPerioSvg()` / `exportPerioImage(format)` | Descargar el gráfico periodontal completo como un SVG vectorial independiente o una imagen rasterizada |
| `exportPdf(opts)` | Descargar un informe PDF nativo de jsPDF (ver [Exportación](#-exportación) abajo) |
| `getPdfSettings()` / `setPdfSettings(patch)` | Obtener/modificar la configuración del informe PDF (`PdfSettings`) |
| `exportStatus()` | Descargar el odontograma de estado como JSON |
| `importStatus(data)` | Hidratar el motor a partir de un payload JSON exportado previamente (ver [Formato de exportación/importación de estado](#-formato-de-exportaciónimportación-de-estado)) |
| `setImportFormat(format)` | Definir el parser de la próxima importación de archivo — `"status"` o `"fhir"` |
| `startIntroTour()` | Iniciar el tour de introducción interactivo |

### 💾 Persistencia de estado (localStorage)

Persistencia opcional (opt-in) en `localStorage` para el estado del caso del odontograma (`core/persistence.ts`, reexportado desde el punto de entrada del paquete). Desactivada por defecto — las integraciones existentes no se ven afectadas a menos que una aplicación host la active explícitamente, y debe llamarse **después** de que el odontograma se haya montado (p. ej. desde el `ngAfterViewInit()` de un componente, después de que `OdontogramShellComponent`/`OdontogramUiService` haya llamado a `init()` — la restauración repinta el DOM en vivo mediante `importStatus()`):

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

| Función | Descripción |
|---|---|
| `enablePersistence(options?)` | Restaura un caso previamente guardado (si existe) mediante `importStatus()`, y a partir de ahí guarda el odontograma de estado en `localStorage` en cada cambio de estado asentado (las ediciones se agrupan con un debounce de ~400 ms, de modo que una ráfaga de cambios — p. ej. un estado predefinido — produce una sola escritura). Idempotente — llamarla de nuevo reemplaza la suscripción/opciones anterior. **Debe llamarse después de que el odontograma se haya montado.** |
| `disablePersistence()` | Detiene la persistencia (primero descarga cualquier guardado con debounce pendiente); la entrada guardada permanece intacta. |
| `clearPersistedState()` | Elimina la entrada guardada para la clave activa (o la predeterminada). |
| `isPersistenceEnabled()` | `true` mientras haya una suscripción a cambios de estado activa. |

**`PersistenceOptions`:**

| Campo | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | La clave de `localStorage` — este es el valor por defecto literal del propio módulo del núcleo compartido (sin cambios por el port de Angular); pasa tu propia `key` para evitar colisionar con una integración del lado React en el mismo origen, o para dar espacio de nombres a varios hosts. |
| `includePlan` | `boolean` | `false` | También persiste el odontograma de plan (el campo `plan` del payload). |
| `onError` | `(err: Error) => void` | — | Se invoca ante cualquier error de almacenamiento/análisis en lugar de `console.warn`. |

Notas: no se lee ni se escribe nada en `localStorage` a menos que se llame a `enablePersistence()`; un límite de tamaño de 4 MB omite un guardado demasiado grande (reportado vía `onError`/`console.warn`) en lugar de lanzar una excepción; cualquier fallo de almacenamiento/JSON — cuota excedida, un iframe restringido, datos guardados corruptos o no reconocidos, etc. — se captura y se reporta. Este módulo nunca lanza excepciones.

Nota: activar la persistencia restaura el caso guardado mediante `importStatus()`, lo que reemplaza el caso actual — incluyendo un odontograma de plan en curso si el payload guardado no tiene ninguno. Activa la persistencia al iniciar (justo después del montaje), no a mitad de sesión.

Nota: el payload persistido puede incluir datos identificativos del paciente (nombre del paciente, fecha de examen) en texto plano en `localStorage`. Si registras dichos datos, asegúrate de contar con protección a nivel de dispositivo o bórralos con `clearPersistedState()` cuando corresponda.

### 💾 Formato de exportación/importación de estado

La exportación genera un archivo JSON (versión `2.20`; las importaciones también aceptan las versiones heredadas `1.4` y de `2.0` a `2.19`, migrando automáticamente) que contiene:

**Campos globales:**
- `wisdomVisible` - muelas del juicio visibles
- `showBase` - capa de hueso visible
- `occlusalVisible` - vista oclusal activa
- `showHealthyPulp` - pulpa sana visible
- `edentulous` - modo edéntulo activo

**Campos por diente (32 dientes):**
- `toothSelection` - tipo base del diente
- `toothSubstrate` - sustrato dental (natural/radix/broken/crownprep), ortogonal a cualquier restauración
- `restorationType` - tipo de restauración (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - material de restauración (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), emparejado con `restorationType`
- `prosthesis` - eje removible/de anclaje (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), mutuamente excluyente con un `restorationType` fijo de crown/bridge
- `crownLeakage` - indicador de filtración marginal de corona, significativo solo cuando `restorationType` es crown o bridge
- `endo` - estado endodóntico; mutuamente excluyente con `pulpDx`
- `mods` - array de modificaciones (inflammation, parodontal); `inflammation` aplica solo a dientes ausentes/alvéolo de extracción
- `caries` - superficies con caries activa
- `cariesActiveDepth` - el valor de profundidad ICDAS preparado por el selector de profundidad de caries al aplicar una nueva superficie
- `rootCaries` - severidad de la caries radicular (none/active/arrested/active-cavitated)
- `cariesSeverity` - severidad unificada por superficie (0-6): profundidad ICDAS en una superficie primaria (sin obturar), puntuación CARS en una superficie recurrente (obturada)
- `radiographicDepth` - profundidad radiográfica de caries por superficie (none/E1/E2/D1/D2/D3), independiente de la escala visual ICDAS/CARS
- `fillingMaterial` - material de obturación
- `fillingSurfaces` - superficies obturadas
- `fillingSurfaceMaterials` - material de obturación por superficie (obturaciones mixtas, p. ej. bucal amalgama + distal composite)
- `fillingDefect` - defecto de obturación por superficie (none/marginal/fracture/wear), acotado a superficie obturada, independiente de la caries recurrente
- `pulpDx` - diagnóstico pulpar AAE (normal/reversible-pulpitis/irreversible-pulpitis/necrosis)
- `pulpLatin` - subtipo pulpar en latín práctico (el selector de pulpa solo lo muestra cuando `pulpDetailLevel` es `latin`)
- `apicalDx` - diagnóstico apical que determina el glifo periapical
- `periapicalType` - subtipo de lesión periapical (none/granuloma/cyst); el valor heredado `abscess` sigue aceptándose al importar
- `resorptionType` - tipo de reabsorción radicular (none/internal/external-cervical)
- `periImplant` - estado periimplantario, solo implantes (none/mucositis/peri-implantitis-mild/-moderate/-severe), clasificación del World Workshop 2018
- `endoResection` - indicador de apicectomía
- `fissureSealing` - indicador de sellado de fisuras
- `calculus` - indicador de cálculo
- `contactMesial` / `contactDistal` - pérdida de punto de contacto mesial/distal
- `wearEdge` - tipo de desgaste incisal/oclusal (none/attrition/erosion)
- `wearCervical` - tipo de desgaste cervical (none/abrasion/abfraction/erosion)
- `discoloration` - causa de decoloración por diente (none/tetracycline/fluorosis/nonvital/extrinsic/other)
- `orthoAppliance` - aparato de ortodoncia (none/bracket/band)
- `orthoDrift` - desplazamiento ortodóntico (none/mesial/distal)
- `orthoVertical` - movimiento vertical ortodóntico (none/extrusion/intrusion)
- `orthoRotation` - indicador de rotación ortodóntica
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - ubicaciones de fractura
- `extractionWound` - herida post-extracción
- `extractionPlan` - extracción planificada
- `parapulpalPin` - indicador de pin parapulpar
- `bridgePillar` - diente pilar de puente
- `mobility` - grado de movilidad (none/m1/m2/m3)
- `crownNeeded` - indicador de corona necesaria
- `crownReplace` - indicador de reemplazo de corona necesario
- `missingClosed` - espacio cerrado tras extracción
- `customStates` - estados personalizados de plugins (objeto, indexado por ID de plugin)
- `note` - nota de texto por diente (cadena, opcional — presente solo cuando no está vacía)

**Campo de nivel superior `plan` (versión 2.11+):**
- `plan` - objeto opcional, con la misma forma que `teeth` (campos por diente arriba), que contiene el odontograma de **plan** (tratamiento propuesto). Presente solo cuando el odontograma de plan se ha inicializado Y su contenido difiere del odontograma de estado. Al importar, la ausencia de `plan` limpia/desinicializa el odontograma de plan; un `plan` presente restaura el odontograma de plan junto con el de estado. También legible/escribible de forma independiente mediante `getPlanChart()`/`setPlanChart()`.

**Campo de nivel superior `case` (versión 2.17+, ampliado en 2.18, 2.19 y 2.20):**
- `case` - objeto opcional con metadatos a nivel de caso (no por diente), compartido por los odontogramas de estado y de plan. Se omite cuando está vacío. Campos (cada uno omitido cuando está en su valor por defecto): `age`; `smokingStatus` (+ `cigarettesPerDay`); `diabetesStatus` (+ `hba1c`); `toothLossPerio`; `maxRblPercent`; las cuatro anulaciones clínicas por eje de la clasificación 2017 `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`; `patientName` / `examDate`; y `patientDob`. Se lee/escribe mediante `getCaseMeta()` y los setters `set*` de arriba. El nombre del paciente, la fecha de nacimiento y la fecha de examen son solo metadatos de identidad del odontograma — **no** forman parte de la exportación FHIR.

### 🖨️ Exportación
Más allá de la propia exportación de Estado JSON / FHIR / PNG / JPG / SVG del odontograma, el **gráfico periodontal** cuenta con su propia vía de exportación:
- **SVG/PNG/JPG periodontal:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` renderizan el gráfico periodontal completo como un único SVG vectorial independiente, sin depender del DOM montado del `PerioChartComponent`. Desactivado siempre que `hasAnyPerioData()` sea `false`.
- **Informe PDF:** el elemento "Informe PDF…" del menú de exportación abre `ExportOptionsModalComponent` — un diálogo de ajustes (campos de nombre del paciente + fecha de nacimiento + fecha de examen, conectados directamente a los metadatos del caso, con la fecha de examen predeterminada al día de hoy; casillas de sección: datos del paciente, gráfico del odontograma, descripción del odontograma, notas individuales — desactivada cuando ningún diente tiene una nota — estado periodontal, descripción periodontal) antes de llamar a `exportPdf(opts)` mediante el token de inyección `EXPORT_PDF_FN`. Los campos de identidad vacíos recurren a valores de marcador (`"John Doe"` / `"1980-01-01"`, configurables mediante `PdfSettings.defaultName`/`defaultDob`) para que la exportación siempre se complete. El PDF se ensambla de forma nativa con jsPDF — texto vectorial mediante `.text()`, imágenes rasterizadas del odontograma/gráfico periodontal mediante `.addImage()` — sin dependencia de `svg2pdf.js`. La sección de notas individuales se omite automáticamente cuando ningún diente tiene una nota, y las dos secciones periodontales siempre que `hasAnyPerioData()` sea `false`, independientemente de las casillas del diálogo.
- **Restricción de implante para mPI/mBI:** los índices de Mombelli periimplantarios (mPI/mBI) solo se renderizan como filas en una arcada que contenga al menos un diente con implante — tanto en el gráfico periodontal en vivo como en las exportaciones SVG/PDF.
- El nombre del paciente, la fecha de nacimiento y la fecha de examen son solo metadatos de identidad del odontograma (payload `2.20`, aditivo) — **no** forman parte de la exportación FHIR.
- **Configuración del informe (`PdfSettings`, Ajustes → pestaña Exportación, obtener/definir mediante `getPdfSettings()`/`setPdfSettings(patch)`):** nombre/fecha de nacimiento del paciente por defecto, si se muestra la edad, formato de fecha (ISO/DMY/MDY), tema de color (azul/verde azulado/ámbar/pizarra), visibilidad de hueso/pulpa del odontograma, espaciado de dientes/borde/tamaño del número de diente en la imagen del gráfico, si se incluye la descripción en prosa y la tabla de hallazgos, opciones equivalentes de espaciado/ubicación de etiquetas/tamaño de fuente del gráfico periodontal y si se incluye la tabla de métricas periodontales y el glosario de abreviaturas, un descargo de responsabilidad médico (texto por defecto o personalizado), una marca de generador/versión, y la agrupación del resumen de dentición (toda la boca / maxilar / cuadrante / sextante — también controla la tabla del panel de información dental en pantalla).

### 📁 Estructura de carpetas
- `projects/angular-advanced-odontogram/src/public-api.ts` - el punto de entrada público del paquete (cada export se reexporta desde aquí)
- `projects/angular-advanced-odontogram/src/lib/core/odontogram.ts` - el motor clínico sin dependencia de framework: capas SVG, gestión de estado dental, interacciones táctiles, superposiciones de plugins, ajustes, exportación/importación
- `projects/angular-advanced-odontogram/src/lib/core/persistence.ts` - persistencia opcional en localStorage
- `projects/angular-advanced-odontogram/src/lib/core/theme.ts` - tipo `OdontogramThemeConfig` y utilidad `applyThemeConfig()`
- `projects/angular-advanced-odontogram/src/lib/core/plugin.ts` - tipo `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, prioridades de z-index `LAYER_Z`
- `projects/angular-advanced-odontogram/src/lib/core/pluginSanitize.ts` - `sanitizePluginSvg()`, el saneador respaldado por DOMPurify por el que pasa la salida de `renderSvg()` de un plugin antes de insertarse en el odontograma en vivo
- `projects/angular-advanced-odontogram/src/lib/core/tour.ts` - el tour de introducción guiado
- `projects/angular-advanced-odontogram/src/lib/core/perioClassification.ts` - derivación de la clasificación periodontal del World Workshop 2017
- `projects/angular-advanced-odontogram/src/lib/core/perioExport.ts` / `perioGraphic.ts` / `perioIndexNames.ts` - el renderizado SVG del gráfico periodontal de boca completa
- `projects/angular-advanced-odontogram/src/lib/core/perioPdf.ts` - el ensamblador puro jsPDF del informe PDF (`assemblePdf`)
- `projects/angular-advanced-odontogram/src/lib/core/status_extras.ts` - 22 plantillas de restauración predefinidas
- `projects/angular-advanced-odontogram/src/lib/core/i18n/` - traducciones (12 idiomas) y el bus i18n sin dependencia de framework
- `projects/angular-advanced-odontogram/src/lib/core/utils/numbering.ts` - conversión de numeración FDI, Universal, Palmer
- `projects/angular-advanced-odontogram/src/lib/core/registry/` - registro declarativo de ejes clínicos: mapeos de campos FHIR, activación de conjunto-de-limpieza-SVG/indicador booleano, matriz tipo×material de restauración, listas de opciones de UI
- `projects/angular-advanced-odontogram/src/lib/core/fhir/` - exportación/importación HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, sistemas de códigos, mapeos de campos, primitivas
- `projects/angular-advanced-odontogram/src/lib/core/bridgeOverlay.ts` - superposición de conector de tramo de puente multidiente
- `projects/angular-advanced-odontogram/src/lib/core/fonts/` - fuentes Unicode para PDF incluidas (composición árabe, CJK) + el cargador de fuentes
- `projects/angular-advanced-odontogram/src/lib/core/assets/` - archivos SVG de origen de dientes/iconos (`teeth-svgs/`, `teeth-svgs/measured/`, `icon-svgs/`)
- `projects/angular-advanced-odontogram/src/lib/core/generated/` - los SVG compilados en módulos TypeScript en línea (`npm run gen:assets`)
- `projects/angular-advanced-odontogram/src/lib/core/__tests__/` + `registry/__tests__/` - el corpus de pruebas portado, incl. los fixtures dorados de `parity/`
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/` - `OdontogramShellComponent`, la shell todo en uno
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-ui.service.ts` - `OdontogramUiService`, la capa de estado/efectos de la UI componible
- `projects/angular-advanced-odontogram/src/lib/components/engine-state.ts` - el helper de señal `engineState()`
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-engine-lifecycle.ts` - el token de inyección `ODONTOGRAM_ENGINE_LIFECYCLE`
- `projects/angular-advanced-odontogram/src/lib/components/surfaces/` - las cuatro superficies presentacionales (barra superior, gráfico, información de diente, controles de diente) y, bajo `surfaces/cards/`, las siete tarjetas de control declarativas
- `projects/angular-advanced-odontogram/src/lib/components/settings-modal/` - `SettingsModalComponent` (diálogo de ajustes de 7 pestañas)
- `projects/angular-advanced-odontogram/src/lib/components/export-options-modal/` - `ExportOptionsModalComponent` y el token de inyección `EXPORT_PDF_FN`
- `projects/angular-advanced-odontogram/src/lib/components/credits-modal/` - `CreditsModalComponent`
- `projects/angular-advanced-odontogram/src/lib/components/perio-chart/` / `perio-sidebar/` - el gráfico periodontal independiente/en línea y su barra lateral de contexto
- `projects/angular-advanced-odontogram/src/lib/components/dual-state-confirm/` - el diálogo de confirmación compartido (ediciones que afectan a estado↔plan)
- `projects/angular-advanced-odontogram/src/lib/components/shared/dialog-focus.ts` - helpers compartidos de captura/restauración de foco modal
- `projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.ts` - `I18nService`, la fachada reactiva de Angular sobre el bus i18n del núcleo
- `projects/demo/` - la aplicación Angular de demostración (`ng serve` / `npm run build:demo`)
- `scripts/generate-svg-assets.mjs` - el generador de `npm run gen:assets`

### ⚙️ Stack tecnológico
- Angular 21 (componentes standalone, signals) + Angular CLI (`@angular/build`) + TypeScript
- `ng-packagr` para la compilación de la biblioteca (`ng build angular-advanced-odontogram`)
- Tailwind CSS para el estilo de la UI, compilado una vez a una hoja de estilos estática (`npm run build:styles` → `projects/angular-advanced-odontogram/styles.css`) — los consumidores registran esa hoja de estilos, no ejecutan Tailwind ellos mismos
- Capas SVG mediante manipulación del DOM en el núcleo sin dependencia de framework (estado no reactivo de Angular, por rendimiento — el mismo motor que usa el original de React)
- Un sistema i18n ligero, propio y sin dependencia de framework (`core/i18n/`), envuelto por `I18nService` para el binding reactivo en plantillas de Angular
- Dos runners de prueba: Vitest simple para el corpus del núcleo (`vitest run`), la integración Vitest de `@angular/build:unit-test` de Angular para los specs de componentes (`ng test`); `@testing-library/jest-dom` para matchers de DOM
- TypeDoc para documentación de API (`npm run docs`, salida en `docs/api/`)
- jsPDF para el informe PDF; DOMPurify para el saneamiento de la salida de plugins

### 📝 Notas
- Las plantillas SVG y los iconos se compilan en módulos TypeScript generados en tiempo de compilación (`npm run gen:assets`) — no hay descarga de recursos en tiempo de ejecución ni nada que servir desde una carpeta pública.
- El motor del odontograma usa su propio estado interno, sin dependencia de framework (no signals de Angular), para la cuadrícula SVG, por rendimiento y para mantenerse idéntico al original de React; los componentes de Angular lo leen de forma reactiva mediante `engineState()`/`I18nService`/`onStateChange()` en lugar de poseerlo ellos mismos.
- Los dientes de leche tienen un conjunto reducido de materiales disponibles (sin obturaciones de amalgama, sin endodoncia con pines).
- Los dientes con implante tienen un conjunto diferente de opciones de corona/pilar que los dientes naturales.

### 🔒 Notas de seguridad

- **Los plugins se ejecutan como código de confianza.** El valor devuelto por el `renderSvg()` de un plugin se inyecta en el SVG del odontograma en vivo. Esa salida se sanea con [DOMPurify](https://github.com/cure53/DOMPurify) (perfil SVG, más `svgFilters`) antes de insertarse — `<script>`, `<iframe>`, `<object>`, `<embed>` y `<foreignObject>` están prohibidos por completo, y una salida totalmente maliciosa se descarta en lugar de renderizarse parcialmente. Esto reduce el radio de impacto de un plugin comprometido o con errores, pero los plugins solo deben cargarse desde fuentes de confianza — el saneamiento es una red de seguridad, no un sustituto de la verificación.
- **Content-Security-Policy.** Este paquete no inyecta su propia CSP cuando se integra como biblioteca. Las aplicaciones host que renderizan `OdontogramShellComponent` deben establecer su propia CSP adecuada a su despliegue; una base razonable refleja la política de la demo del proyecto original de React:

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

### 📖 Cómo citar

Este paquete no tiene un registro de citación propio — es un port que comparte su motor clínico, de forma literal, con el proyecto original. Si utilizas este software en tu investigación, cita el original:

> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Todas las versiones (DOI de concepto):** https://doi.org/10.5281/zenodo.21156787

Los metadatos de citación legibles por máquina están en el [`CITATION.cff`](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/CITATION.cff) del proyecto original.

## 🙌 Créditos

Angular Advanced Odontogram está creado y mantenido por Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), creador y desarrollador principal de este port y del motor clínico subyacente. El mismo popup dentro de la aplicación (barra superior → "Acerca de y créditos") muestra estos nombres.

**Proyecto original**

- [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul): la implementación original en React de la que este paquete es un port — el motor clínico (lógica del estado dental, registro periodontal, exportación/importación FHIR, cadenas i18n, tour, plantillas SVG) se comparte de forma literal.

**Construido con** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [Angular](https://angular.dev), [Angular CLI](https://angular.dev/tools/cli), [TypeScript](https://www.typescriptlang.org) y [Tailwind CSS](https://tailwindcss.com).

Las contribuciones son bienvenidas — ver [`CONTRIBUTING.md`](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/CONTRIBUTING.md). Si este proyecto te resulta útil, por favor [dale una estrella en GitHub](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
