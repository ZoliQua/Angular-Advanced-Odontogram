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

> 🌐 **Languages:** 🇬🇧 [English](README-en.md) | 🇭🇺 [Magyar](README-hu.md) | 🇩🇪 [Deutsch](README-de.md) | 🇪🇸 [Español](README-es.md) | 🇫🇷 Français (ce fichier) | 🇮🇹 [Italiano](README-it.md) | 🇵🇱 [Polski](README-pl.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇷🇺 [Русский](README-ru.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md)

---

## 📑 Sommaire

- [📋 Aperçu général](#-aperçu-général)
- [📦 Utilisation comme paquet npm](#-utilisation-comme-paquet-npm)
- [✨ Fonctionnalités clés](#-fonctionnalités-clés)
- [📦 Modules](#-modules)
- [🛠️ Contrôles de l'interface](#-contrôles-de-linterface)
- [🦷 Types et états de dents](#-types-et-états-de-dents)
- [⚙️ Paramètres](#-paramètres)
- [🖼️ Système de modèles SVG](#-système-de-modèles-svg)
- [🔢 Systèmes de numérotation](#-systèmes-de-numérotation)
- [🚀 Utilisation](#-utilisation)
- [🔗 Intégration](#-intégration)
- [🧪 Tests](#-tests)
- [📖 Documentation d'API](#-documentation-dapi)
- [📡 API publique](#-api-publique)
- [💾 Persistance de l'état (localStorage)](#-persistance-de-létat-localstorage)
- [💾 Format d'export/import de l'état](#-format-dexportimport-de-létat)
- [🖨️ Export](#-export)
- [📁 Structure des dossiers](#-structure-des-dossiers)
- [⚙️ Pile technique](#-pile-technique)
- [📝 Notes](#-notes)
- [🔒 Notes de sécurité](#-notes-de-sécurité)
- [📖 Comment citer](#-comment-citer)

## 🇫🇷 Français

### 📋 Aperçu général

Ce projet est un éditeur d'odontogramme interactif fonctionnant dans le navigateur, pour **Angular + TypeScript**, qui prend en charge une saisie rapide du schéma dentaire au moyen d'une interface épurée. Il génère des modèles de dents SVG superposés pour représenter les restaurations, les caries, le statut endodontique, la mobilité et d'autres détails cliniques, tout en offrant la sélection multiple, des filtres de sélection et des préréglages d'état prédéfinis.

**Ceci est le portage officiel en Angular de [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)** (npm : `react-advanced-odontogram`). Parité fonctionnelle avec la branche principale de react-advanced-odontogram au commit `934a911` (post-v2.4.0 ; version de la charge utile inchangée à 2.20) — les exports JSON et FHIR R4 sont interopérables (aller-retour) entre les deux bibliothèques. Le moteur clinique (`projects/angular-advanced-odontogram/src/lib/core/`) est partagé à l'identique — la logique de statut dentaire, le bilan parodontal, l'export/import FHIR, les chaînes i18n, la visite guidée et les modèles SVG sont octet pour octet identiques à l'original React, recopiés depuis un commit amont figé à chaque resynchronisation ; seule la coquille de composants (`projects/angular-advanced-odontogram/src/lib/components/`) est native à Angular. Un petit ensemble de divergences, explicitement documenté, existe (uniquement des chaînes de marque/identité — voir la spécification de conception du portage dans ce dépôt). Le versionnement évolue en lockstep avec celui du module React.

---
![Aperçu de l'éditeur d'odontogramme](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_en_odontogram.png)
*Capture d'écran issue du projet React d'origine — le portage Angular affiche une interface identique.*

🔗 **Démo en ligne :** https://angular-advanced-odontogram.vercel.app/

---

### 📦 Utilisation comme paquet npm

L'odontogramme est fourni sous forme de bibliothèque de composants Angular autonome sur npm :
[`angular-advanced-odontogram`](https://www.npmjs.com/package/angular-advanced-odontogram).

#### Prérequis
- **Angular 21.2+** (déclaré comme dépendance de pair — fournie par votre application).
- Un **bundler** comprenant le champ `exports` et ESM — l'Angular CLI (`@angular/build`) convient d'emblée. Le paquet est **ESM uniquement**.
- Node **≥ 20** pour les outils de développement.

#### Installation

```bash
npm install angular-advanced-odontogram
```

#### Utilisation de base

Enregistrez la feuille de style **une seule fois**, partout où les styles globaux de votre application sont configurés (p. ex. `angular.json`) :

```json
"styles": [
  "node_modules/angular-advanced-odontogram/styles.css",
  "src/styles.css"
]
```

Affichez ensuite `OdontogramShellComponent` :

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

`language` accepte `hu | en | de | es | it | sk | pl | ru | pt-br | zh | ar | fr` ; `numberingSystem` accepte `FDI | UNIVERSAL | PALMER`.

#### Entrées du composant

`OdontogramShellComponent` est un composant contrôlé — chaque entrée est un signal Angular `input()`, toutes optionnelles, chacune retombant sur la valeur par défaut du moteur lorsqu'elle est omise. Les plus courantes :

| Entrée | Type | Par défaut | Description |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | Langue de l'interface (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`zh`/`ar`/`fr`). |
| `numberingSystem` | `"FDI" \| "UNIVERSAL" \| "PALMER"` | `"FDI"` | Système de numérotation dentaire. |
| `darkMode` | `boolean` | `false` | Bascule du thème sombre. |
| `readOnly` | `boolean` | `false` | Désactive toute modification (lecture seule). |
| `themeConfig` | `OdontogramThemeConfig` | — | Surcharge des variables CSS du thème (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Enregistre des plugins d'état personnalisés / des calques supplémentaires. |
| `enableNotes` | `boolean` | `false` | Active les notes par dent. |
| `enableIcdas` | `boolean` | `false` | Active le système d'évaluation des caries ICDAS II. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Complexité de la carte Obturations : `"simple"` (un matériau par dent) ou `"complex"` (matériaux par surface). |
| `fillingDefectEnabled` | `boolean` | `true` | Active les constats de défaut d'obturation sur la carte Obturations. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | tous disponibles | Matériaux d'obturation disponibles sous forme de mappage booléen sur `amalgam`/`composite`/`gic`/`temporary` (les clés inconnues sont ignorées). |
| `fissureSealingEnabled` | `boolean` | `true` | Active le scellement des sillons sur la carte Obturations. |
| `languageChange` / `numberingChange` / `darkModeChange` (sorties) | `output<T>` | — | Émis lorsque l'utilisateur modifie le paramètre depuis l'interface. |
| `fillingComplexityChange` / `fillingDefectEnabledChange` / `fillingMaterialAvailabilityChange` / `fissureSealingEnabledChange` (sorties) | `output<T>` | — | Émis lorsque l'utilisateur modifie le paramètre correspondant depuis Paramètres → Obturations. |

Des entrées de niveau de détail plus fines (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `cariesDepthEnabled`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) sont également acceptées — voir `odontogram-shell.component.ts` pour la liste complète et typée.

Les quatre entrées d'obturation ci-dessus sont de type **« restauration uniquement »** : une entrée omise n'écrit jamais dans le moteur (un appel impératif à `setFillingComplexity()` avant le montage est préservé), tandis qu'une entrée fournie écrit à la fois le moteur et l'état du modal Paramètres, de sorte que le modal n'affiche jamais de valeur obsolète. `fillingMaterialAvailability` est appliquée par diff via une clé sérialisée canonique, si bien qu'un re-rendu avec un nouveau littéral objet de contenu identique ne réécrit jamais le moteur. Les sorties `*Change` correspondantes se déclenchent depuis Paramètres → Obturations — le chemin d'écriture en retour pour les hôtes qui persistent les préférences.

#### API publique (exports nommés)

`OdontogramShellComponent` est un export nommé. L'API d'état impérative, le composant autonome `PerioChartComponent`, la visite guidée et tous les types publics sont des exports nommés depuis le même point d'entrée :

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

La surface complète (bien plus de 100 fonctions et types — `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PdfSettings`, `PerioViewMode`, et bien d'autres) est entièrement typée dans les déclarations `.d.ts` fournies ; voir [API publique](#-api-publique) ci-dessous pour le tableau de référence sélectionné.

#### Surfaces composables (avancé)

`OdontogramShellComponent` est le composant tout-en-un pris en charge et ne nécessite aucune configuration supplémentaire. Si vous devez placer les régions de l'odontogramme à différents endroits de votre propre mise en page, les quatre surfaces d'interface de la shell sont également exportées et peuvent être composées sous un unique `OdontogramUiService`, partageant toutes une seule session possédée par l'instance :

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

`OdontogramUiService` prend la même forme de configuration que les entrées d'`OdontogramShellComponent` (sa méthode `configure()` accepte un objet `OdontogramUiConfig` de `Signal`s/callbacks, chaque champ optionnel avec la même valeur par défaut en amont). Contrainte actuelle : une seule instance d'`OdontogramUiService` par page (le moteur est un singleton au niveau du module). Les surfaces peuvent être montées et démontées à la demande. `OdontogramShellComponent` lui-même est inchangé — il s'agit exactement de cette composition dans la disposition par défaut, câblant toujours explicitement chaque champ depuis ses propres entrées.

Pour une composition encore plus fine, les cartes de contrôle individuelles sont également exportées :

| Composant | Sélecteur | Couvre |
|---|---|---|
| `StatusesCardComponent` | `aao-statuses-card` | Contrôles de préréglages/état bucco-dentaire (Réinitialiser, denture temporaire/mixte, édenté, extras d'état) |
| `ToothDetailsCardComponent` | `aao-tooth-details-card` | Rangée de base (sélection de dent/substrat), cases à cocher de couronne fracturée, bascules couronne à réaliser/remplacer |
| `CariesCardComponent` | `aao-caries-card` | Mode de profondeur de carie, carie sous-coronaire, sévérité de carie radiculaire, sélecteur de carie par surface |
| `FillingsCardComponent` | `aao-fillings-card` | Matériau d'obturation, sélecteur d'obturation par surface + défauts, notes d'indication de sous-carie/défaut |
| `RootPeriodontiumCardComponent` | `aao-root-periodontium-card` | Statut pulpe/endo, diagnostic apical, résorption, mobilité, statut péri-implantaire |
| `OrthodonticsCardComponent` | `aao-orthodontics-card` | Appareil, dérive, mouvement vertical, rotation |
| `SurfaceCrossComponent` | `aao-surface-cross` | Le widget partagé de sélection en croix V/M/O/D/L qu'utilisent en interne les cartes Caries/Obturations |

Chaque carte est un composant déclaratif autonome qui lit et écrit la session partagée via `inject(OdontogramUiService)` et l'assistant exporté `engineState()` (une lecture d'un getter du moteur retournée sous forme de signal, tenue à jour via le bus de notification de changement du cœur lui-même). Ne montez que les cartes dont une mise en page donnée a besoin, dans n'importe quel agencement, sous un seul `OdontogramUiService`. `CreditsModalComponent` (`aao-credits-modal`, la fenêtre contextuelle « À propos et remerciements » de la barre supérieure) est également exporté, pour les hôtes qui souhaitent le piloter depuis leur propre état d'ouverture/fermeture.

```ts
import { engineState, OdontogramUiService, getOdontogramSummary } from "angular-advanced-odontogram";

// Anywhere inside an injection context under an `OdontogramUiService`:
readonly summary = engineState(getOdontogramSummary); // Signal<OdontogramSummary>, kept fresh automatically
```

#### Points d'accès DI pour les tests hôte

Deux `InjectionToken` permettent à une application hôte de surcharger les appels du moteur à effets de bord dans ses propres tests (les deux ont pour valeur par défaut l'appel moteur réel en production ; les deux sont `providedIn: "root"`) :

| Jeton | Surcharge | Forme |
|---|---|---|
| `ODONTOGRAM_ENGINE_LIFECYCLE` | `initOdontogram()` / `destroyOdontogram()`, appelés depuis `ngAfterViewInit()`/`ngOnDestroy()` d'`OdontogramShellComponent` | `{ init: () => Promise<void>; destroy: () => void }` |
| `EXPORT_PDF_FN` | `exportPdf(opts)`, appelé depuis `ExportOptionsModalComponent` sur « Exporter » | `(opts: PdfExportOptions) => Promise<void>` |

Les deux existent parce que les fonctions réelles touchent au DOM/canvas/aux mécanismes internes de `jsPDF`, qu'un environnement de test sans affichage ne peut pas pleinement fournir — surchargez-les via le tableau de fournisseurs du `TestBed` d'Angular dans les tests de composants propres à une application hôte.

#### Remarques importantes et limitations actuelles
- **ESM uniquement** — le paquet publie un unique module ES (construit avec `ng-packagr`) ainsi que son point d'entrée de déclarations de types. Il cible la résolution de modules par bundler ; il n'existe pas de build CommonJS.
- **La feuille de style est séparée** — vous **devez** enregistrer `angular-advanced-odontogram/styles.css` une seule fois ; elle n'est pas injectée automatiquement. La mise en forme est du CSS global délimité sous `.odontogram-root` et pilotée par les variables CSS `--odon-*`.
- **SSR / côté client uniquement** — le composant lit le DOM au montage, il doit donc s'exécuter dans le navigateur ; affichez-le uniquement côté navigateur.
- **Les ressources sont autonomes** — les SVG des dents et des icônes sont incorporés dans le bundle au moment du build (modules TypeScript générés, `npm run gen:assets`) ; il n'y a **aucune récupération de ressource à l'exécution** à configurer et rien de plus à copier dans le dossier public de votre application.
- **Une seule instance par page** dans cette version — l'état du moteur est un singleton au niveau du module (comme dans l'original React), donc afficher deux instances `<aao-odontogram-shell>` sur la même page les ferait partager l'état d'un même schéma.

---

### ✨ Fonctionnalités clés
- 🖱️ Sélection rapide et multi-sélection (CMD/CTRL + clic)
- 🦷 Types de dents : permanente, temporaire (lactéale), implant, sous-gingivale, absente
- 🦷 Substrat dentaire (orthogonal à toute restauration) : naturel, radix (reste radiculaire), fracturé, préparé pour couronne
- 👑 Restaurations par type × matériau : couronne / inlay / onlay / facette / pont en e.max, or, gradia, zircone, métal, céramo-métallique, télescope ou temporaire (l'onlay n'existe qu'en vue occlusale) — choisi à partir d'un unique sélecteur combiné à faible nombre de clics « Fix : Couronne – … » ; les couronnes `metal` héritées migrent vers `metal-ceramic` (PFM) ; les implants utilisent le même modèle type × matériau, composé avec un calque de connecteur d'implant. Le sélecteur est délimité par le type de dent : un implant ne propose que couronne/pont (plus ses cinq options d'attachement, ci-dessous) ; une dent absente/édentée ne propose qu'un intermédiaire de pont (plus prothèse amovible partielle/complète) ; un substrat `radix` masque entièrement le contrôle de restauration (aucune restauration ne peut être saisie sur un reste radiculaire)
- 🦿 Prothèses amovibles/à attachements sur l'axe dédié `prosthesis` (entrées « Kivehető : » dans le sélecteur combiné) : pilier de cicatrisation d'implant, locator, locator avec prothèse supra-implantaire, barre, barre avec prothèse supra-implantaire ; prothèse amovible partielle ou complète dento-portée
- 🌉 Les dents d'un pont affichent à la fois la coiffe de la couronne et le connecteur de selle ; une superposition d'étendue de pont multi-dents génère un connecteur continu et adapté à l'arcade sur les dents de pont consécutives (intermédiaires + piliers) et les espaces inter-dentaires entre elles, incluse dans l'export PNG/JPG/SVG
- 🔍 Détection des caries sur 6 surfaces : mésiale, distale, vestibulaire, linguale, occlusale, sous-coronaire
- 🪥 Matériaux d'obturation par surface : amalgame, composite, CVI, temporaire
- 🏥 Un unique sélecteur fusionné « Statut pulpe / endo » (regroupé : pulpe vitale vs traitée/endo) : les états endodontiques (obturation médicamenteuse, obturation canalaire, obturation canalaire incomplète, tenon fibre de verre, tenon métallique) et le diagnostic pulpaire AAE (`pulpDx` : normal / pulpite réversible / irréversible / nécrose) sont mutuellement exclusifs — une dent traitée endodontiquement (`endo` renseigné) ne peut pas porter en plus un diagnostic de pulpe vitale ; lors du traitement, `pulpDx` est normalisé à `normal`. Un paramètre optionnel de niveau de détail pulpaire à 3 niveaux (`pulpDetailLevel` : simple / AAE / latin pratique) fait apparaître 9 sous-types pulpaires en latin pratique via `pulpLatin`
- 🦴 Le diagnostic apical (`apicalDx` : parodontite apicale symptomatique/asymptomatique, abcès apical aigu/chronique, ostéite condensante) pilote directement le symbole périapical ; un qualificatif de sous-type de lésion granulome/kyste n'est affiché que sous parodontite apicale symptomatique/asymptomatique
- 🩹 Carte fusionnée « Racine et parodonte » (une seule section repliable pour les observations radiculaires/périapicales et parodontales)
- ⚕️ Modifications : inflammation périapicale (affichée uniquement sur les dents absentes/alvéole d'extraction ; masquée sur les dents présentes et sur les implants, où `periImplant` la couvre), maladie parodontale, degrés de mobilité (M1/M2/M3, masqués sur les implants)
- 🦷🔩 Statut péri-implantaire (`periImplant` : aucun / mucosite / péri-implantite légère / modérée / sévère) — classification du World Workshop 2018, présenté comme un sélecteur dédié sur les implants
- 🏷️ Indicateurs spéciaux : couronne à réaliser, remplacement de couronne nécessaire, espace fermé, plan d'extraction, scellement de sillon, perte de point de contact
- 👁️ Vue occlusale, dents de sagesse, bascules de visibilité de l'os et de la pulpe
- 🔢 12 filtres de sélection (toutes, présentes, permanentes, lactéales, implants, absentes, supérieures/inférieures, antérieures/molaires)
- 📊 Préréglages d'état prédéfinis (réinitialiser, denture temporaire, denture mixte, édenté)
- 📦 22 modèles de restauration prédéfinis (ponts, prothèses amovibles, prothèses sur barre avec implants)
- 💾 Export/import de l'état en JSON (version 2.20 ; les imports acceptent encore les formats hérités 1.4 et 2.0 à 2.19 et migrent automatiquement, avec les états personnalisés des plugins et les notes par dent)
- 💽 Persistance localStorage optionnelle (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — désactivée par défaut ; sauvegarde automatiquement le schéma d'état (et, en option, le schéma de plan) avec une protection de taille de 4 Mo et les erreurs de stockage/analyse dirigées vers un callback `onError` (ou `console.warn`) au lieu de lever une exception
- 🔗 Export HL7 FHIR R4 (Bundle de collection d'Observations par dent, codage dentaire ISO 3950 pour la dentition permanente **et** les dents temporaires (51-85, aller-retour sans perte à l'import), système de codes local) ; un composant de carie porteur d'une sévérité renseignée porte aussi le codage d'un système d'évaluation — ICDAS sur une surface primaire (non obturée), CARS sur une surface récidivante (obturée)
- ✚ Interface de sélection de surface en croix/plus (V/M/O/D/L) pour les caries et les obturations — `SurfaceCrossComponent`, exporté pour les mises en page composables
- 🧱 Matériaux de restauration par surface (obturations mixtes, p. ex. amalgame vestibulaire + composite distal)
- 🖼️ Export d'image PNG/JPG/SVG du schéma (téléchargeable ; PNG/JPG matricés à partir du SVG vectoriel)
- 🦷 La carie/sous-carie est une machine à états par surface : une surface cariée sans obturation s'affiche en carie primaire (opacité graduée ICDAS) ; dès qu'une obturation est présente sur cette surface, elle s'affiche en carie récidivante à la place (scorée CARS) — les deux ne sont jamais actives simultanément sur une même surface
- 🎯 Sévérité par surface unifiée (`cariesSeverity`, 0–6) : lue comme profondeur ICDAS sur une surface primaire, comme un score CARS nommé (Saine … Cavité étendue) sur une surface récidivante, via une fenêtre contextuelle qui n'affiche que l'échelle pertinente pour l'état actuel de la surface
- 🌱 Carie radiculaire (`rootCaries` : aucune / active / arrêtée / active-cavitaire), câblant le calque d'illustration dédié de carie radiculaire à une opacité pilotée par la sévérité
- 📡 Profondeur de carie radiographique (`radiographicDepth` : aucune / E1 / E2 / D1 / D2 / D3 par surface), indépendante de l'échelle visuelle de sévérité ICDAS/CARS, présentée comme un badge et transitant par sa propre Observation FHIR
- 🎚️ Trois paramètres de granularité des caries (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) plus une bascule `cariesDepthEnabled`, réduisant chaque échelle à une vue de sélecteur plus simple sans perdre la valeur stockée
- 🩹 Ligne de résumé sous-carie du panneau Obturations : liste toute dent sélectionnée présentant une carie récidivante et ses surfaces
- 🪛 Défauts d'obturation par surface (`fillingDefect` : aucun / marginal / fracture / usure) sur les restaurations directes, indépendants de la carie récidivante
- 🦷💥 Usure dentaire typée par cause clinique et localisation (`wearEdge` : aucune / attrition / érosion, incisale/occlusale ; `wearCervical` : aucune / abrasion / abfraction / érosion, cervicale)
- 🎨 Coloration dentaire par cause (`discoloration` : aucune / tétracycline / fluorose / dent dévitalisée / extrinsèque / autre) sur les dents permanentes et temporaires
- ✏️ Les dents antérieures (incisives/canines) étiquettent leur surface occlusale « incisale » dans toute l'interface ; la clé de surface stockée reste `occlusal`
- 🔤 Notation de surface tenant compte de la position (Paramètres → Détails de la dent → « Notation de surface », simple/complète, complète par défaut) : en mode complet, la lettre et l'étiquette de surface de carie/obturation suivent l'anatomie dentaire — occlusale → I/incisale sur les dents antérieures, vestibulaire → L/labiale sur les dents antérieures, linguale → P/palatine sur les dents supérieures et L/linguale sur les dents inférieures
- 🦷↕️ Schéma orthodontique par dent (`orthoAppliance` : aucun / bracket / bague ; `orthoDrift` : aucune / mésiale / distale ; `orthoVertical` : aucun / égression / ingression ; `orthoRotation` : booléen) sur une dent naturelle présente (permanente ou temporaire)
- 🪨 Tartre, et résorption radiculaire typée interne ou externe-cervicale (`resorptionType`)
- 📏 Profondeur de carie par surface (superficielle / dentine / profonde), ou score optionnel ICDAS II (0–6) via `enableIcdas`
- 🩹 Bascule de percolation marginale de couronne, affichée uniquement pour une restauration de type couronne ou pont
- 🧰 Rangée d'icônes de barre supérieure unifiée avec une fenêtre modale de Paramètres à onglets (7 onglets — Général / Odontogramme / Bilan parodontal / Détails de la dent / Caries / Obturations / Export — voir [Paramètres](#-paramètres) ci-dessous)
- 🦷🩺 Paramètres → onglet « Bilan parodontal » : une bascule de disponibilité plus 16 bascules d'affichage/masquage par indice pour les lignes du bilan parodontal, chacune avec une description, plus une option d'affichage du nom d'indice traduit vs canonique
- 📋 Panneau d'informations sur la dent : résumé textuel en direct de l'ensemble du schéma (nombre de dents, listes présentes/absentes, caries y compris secondaires, obturations, traitements canalaires, prothèses, implants, statut parodontal) — affiché par défaut, activable dans les Paramètres
- 🗂️ Menu déroulant Export consolidé (JSON d'état / FHIR / PNG / JPG / SVG / rapport PDF), chaque format masquable indépendamment via Paramètres → Général
- 📥 Menu déroulant Import avec import FHIR (aller-retour des Bundles exportés), masquable indépendamment par source
- ⏳ Superposition de progression pendant l'export d'image
- 🎓 Visite guidée interactive (parcours guidé des contrôles de la shell)
- 🔢 Trois systèmes de numérotation (FDI, Universel, Palmer)
- 🌐 I18n — 12 langues d'interface (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) avec un sélecteur de langue ; l'arabe affiche l'interface de droite à gauche avec les schémas dentaire/parodontal épinglés de gauche à droite
- 🌗 Prise en charge du mode sombre avec bouton de bascule (autonome ou contrôlé par l'application parente)
- 🎨 Configuration de thème personnalisée (entrée `themeConfig`) avec des propriétés CSS personnalisées (`--odon-*`)
- 📱 UX tactile mobile : popover tap-to-zoom, menu contextuel par appui long, pincer pour zoomer, cibles tactiles WCAG de 44 px, navigation par bascule d'arcade
- 🔌 Système de plugins SVG personnalisés : injecter des superpositions visuelles, un état personnalisé par dent, la prise en charge de l'export/import JSON — la sortie de `renderSvg()` d'un plugin est désinfectée avec DOMPurify (profil SVG) avant insertion dans le schéma en direct ; les plugins s'exécutent toujours comme du code de confiance, ne chargez donc que des plugins provenant de sources fiables
- ⚠️ Avertissements de validation d'état pour les combinaisons d'états dentaires incompatibles
- 🏷️ Infobulle d'état automatique sur les tuiles de dent (affiche tous les états actifs)
- 🩺 Infobulle par dent et panneau de résumé bucco-dentaire faisant apparaître l'ensemble complet des observations cliniques (diagnostic pulpaire/apical, résorption radiculaire, statut péri-implantaire, carie radiculaire graduée, tartre, percolation marginale de couronne, fracture, perte de contact, usure de bord/cervicale typée)
- ♿ Accessibilité au clavier (WCAG) : rôles ARIA listbox/option, sélection par Entrée/Espace, navigation par touches fléchées, contours focus-visible
- 🔒 Mode lecture seule : désactive toutes les interactions pour les cas d'usage impression/rapport/consultation
- ✨ Animations de sélection : bordure en pointillés pulsée et ombre portée lumineuse sur les dents sélectionnées (avec prise en charge de prefers-reduced-motion)
- 📝 Notes par dent : double-clic pour ajouter/modifier des notes, icône de note à côté du numéro de dent, infobulle au survol avec le texte de la note, une ligne « Notes individuelles » dans le panneau de résumé bucco-dentaire, inclusion dans le rapport PDF, export/import JSON
- 🔀 Séparation schéma État ↔ Plan : une bascule `État | Plan` commute entre un schéma d'**état** courant et un schéma de **plan** (post-traitement prévu), chacun avec ses propres états de dents ; l'export/import cible toujours le schéma d'état, tandis que le schéma de plan est lu/écrit séparément via sa propre API (voir [API publique](#-api-publique)) et — lorsqu'il diffère de l'état — est inclus comme section additive `plan` dans l'export JSON
- 📝 Encadré « Ce qui change » : chaque fois que le plan diffère de l'état courant, liste chaque différence par dent et par axe de traitement ; également disponible par programmation via `getPlanChanges()`
- 🅿️ Style de proposition : en mode Plan, les observations que le plan **ajoute** par rapport à l'état courant s'affichent avec un contour « proposé » distinct en pointillés et teinté
- 🚦 Verrouillage du mode Plan : le schéma de Plan n'affiche que ce qu'un dentiste peut *faire* — les observations propres à l'état (caries, usure, coloration, et tout le bloc parodontal) sont masquées ; la restauration, la prothèse, l'orthodontie, le besoin/remplacement de couronne et le plan d'extraction restent planifiables

![Bilan parodontal bouche complète](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_en_perio.png)
*Capture d'écran issue du projet React d'origine — le portage Angular affiche une interface identique.*

- 🩺 Bilan parodontal : **profondeur de sondage**, **marge gingivale**, **saignement au sondage** (+ suppuration) par site aux six sites standard par dent, avec **niveau d'attache clinique dérivé (CAL = PD + marge gingivale)**, récession, et **%BOP** bucco-dentaire. Un **bilan parodontal graphique bouche complète** — chaque arcade dessinée en deux SVG vestibulaire/palatin(lingual) distincts avec une **ligne JEC** rouge, une **grille repère millimétrée numérotée**, et une **courbe marge gingivale / profondeur de poche**, séparée par une bande centrale d'indices parodontaux portant la **classe de Miller** et **Plaque/PI/GI/mPI/mBI** sous forme de tuiles en losange anatomique par dent ; saisie à avancée automatique au clavier ; le schéma s'adapte dynamiquement pour remplir la largeur disponible. Présenté comme une bascule de vue `Odontogramme | Statut parodontal`, et toujours invocable séparément via le composant exporté `PerioChartComponent`. Export **FHIR** par site via le panel parodontal LOINC (`74029-0` ; PD `32910-2`, récession `32911-0`, CAL `32912-8`)
- 🧪 Une vaste suite de tests automatisés (voir [Tests](#-tests)) couvrant la numérotation, les traductions, les préréglages, l'i18n, la shell, le thème, le tactile, les plugins, l'accessibilité et la parité des axes cliniques/diagnostics par rapport au corpus React figé
- 📖 Documentation d'API TypeDoc avec des commentaires JSDoc sur tous les exports publics (`npm run docs`)

### 📦 Modules
- 🦷 Grille d'odontogramme et interface des tuiles de dent (`OdontogramChartSurfaceComponent`)
- 🎛️ Contrôles et panneau d'état (`ToothControlsSurfaceComponent` + les 7 cartes déclaratives)
- 🎨 Moteur de superposition SVG et modèles (cœur sans dépendance à un framework, `core/odontogram.ts`)
- 🔢 Numérotation des dents et mappage des étiquettes (FDI/Universel/Palmer, `core/utils/numbering.ts`)
- 🌐 Localisation — 12 langues d'interface (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), y compris l'arabe (RTL) (`core/i18n/`, `I18nService`)
- 💾 Export/import d'état
- 📋 Extras d'état : modèles de restauration prédéfinis
- 🎨 Configuration du thème : palette de couleurs personnalisable via les propriétés CSS `--odon-*`
- 📱 Interactions tactiles mobiles (tap-to-zoom, appui long, pincer pour zoomer, bascule d'arcade)
- 🔌 Système de plugins SVG personnalisés
- ⚠️ Système de validation d'état et d'infobulles
- ♿ Accessibilité au clavier et prise en charge ARIA
- 🔒 Mode lecture seule
- ✨ Animations de sélection
- 📝 Système de notes par dent
- 🧱 **Interface composable** — `OdontogramUiService`, l'assistant `engineState()`, 4 surfaces de présentation et 7 cartes de contrôle déclaratives, toutes exportées indépendamment (voir [Surfaces composables](#-utilisation-comme-paquet-npm) ci-dessus)
- 🧪 Suite de tests automatisés (corpus Vitest + `ng test`, voir [Tests](#-tests))

### 🛠️ Contrôles de l'interface

**🔝 Barre supérieure** (`OdontogramTopbarComponent`) :
- Sélecteur de langue (liste déroulante HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR)
- Bouton de bascule du mode sombre (icône soleil/lune, commute entre thème clair et sombre)
- Sélecteur de système de numérotation (liste déroulante FDI/Universel/Palmer)
- Boutons Exporter l'état / Importer l'état
- Paramètres (icône engrenage), Remerciements/À propos (icône info), lien GitHub

**📊 En-tête du schéma :**
- Bascule de vue occlusale
- Bascule de visibilité des dents de sagesse
- Bascule de visibilité de l'os
- Bascule de visibilité de la pulpe
- Bouton d'effacement de la sélection

**🔍 Filtres de sélection :**
- Tout sélectionner / Toutes présentes / Permanentes / Lactéales / Implants / Toutes absentes
- Sélectionner Supérieures / 6 antérieures supérieures / Molaires supérieures
- Sélectionner Inférieures / 6 antérieures inférieures / Molaires inférieures

**📋 Préréglages d'état :**
- Tout réinitialiser (réinitialiser la bouche)
- Denture temporaire
- Denture mixte
- Bascule Édenté

**📦 Menu déroulant Extras d'état :**
- Ponts en zircone supérieurs/inférieurs (12-22, 13-23, 16-26, arcade complète)
- Ponts métalliques supérieurs/inférieurs (12-22, 13-23, 16-26, arcade complète)
- Prothèses amovibles partielles supérieures/inférieures
- Prothèses amovibles complètes supérieures/inférieures
- Prothèses sur barre avec implants supérieures/inférieures

**🦷 Panneau d'édition de la dent** (`ToothControlsSurfaceComponent`, pour la/les dent(s) sélectionnée(s), regroupé en cartes repliables) :
- **Carte États :** préréglages bucco-dentaires et extras d'état (affichée/masquée indépendamment via `showStatusCard`)
- **Carte Détails de la dent :** sélection de la dent (type de base y compris les variantes de couronne fracturée), substrat dentaire, la liste déroulante de restauration combinée « Fix : … » / « Kivehető : … », case à cocher de percolation marginale de couronne, cases à cocher de localisation de couronne fracturée, bascules couronne à réaliser / remplacement de couronne nécessaire
- **Carte Orthodontie :** appareil, dérive mésiale/distale, mouvement vertical, bascule de rotation — affichée sur une dent naturelle présente (affichée/masquée indépendamment via `showOrthoCard`)
- **Carte Caries :** liste déroulante de mode de profondeur de carie, case à cocher de carie sous-coronaire, liste déroulante de sévérité de carie radiculaire, et le sélecteur de carie par surface V/M/O/D/L (`SurfaceCrossComponent`) avec une fenêtre contextuelle de profondeur ICDAS/CARS et un badge de profondeur radiographique
- **Carte Obturations :** liste déroulante de matériau d'obturation, sélecteur d'obturation par surface, indicateur de défaut d'obturation par surface, notes d'indication de sous-carie et de défaut d'obturation
- **Carte Racine et parodonte :** sélecteur fusionné « Statut pulpe / endo », sélecteur de diagnostic apical, sélecteur de sous-type de lésion périapicale, sélecteur de type de résorption radiculaire, sélecteur de degré de mobilité, sélecteur de statut péri-implantaire (implants uniquement)
- **Indicateurs spéciaux :** plan/plaie d'extraction, espace fermé, scellement de sillon, perte de point de contact, tartre, tenon parapulpaire, résection endodontique, pilier de pont

### 🦷 Types et états de dents

**Sélection de la dent (type de base) :**
| Valeur | Description |
|---|---|
| `none` | Dent absente |
| `tooth-base` | Dent permanente |
| `milktooth` | Dent temporaire (lactéale) |
| `implant` | Implant dentaire |
| `tooth-under-gum` | Dent sous-gingivale (non éruptée) |

**Variantes de dent fracturée :**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Substrat dentaire (dents permanentes) :**
`natural` (par défaut), `radix` (reste radiculaire), `broken`, `crownprep` (préparé pour couronne)

**Type de restauration (dents permanentes) :**
`none`, `crown`, `inlay`, `onlay` (vue occlusale uniquement), `veneer`, `bridge`

**Matériau de restauration (dents permanentes) :**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (les couronnes `metal` héritées migrent ici), `telescope`, `temporary`

**Les options de restauration sont délimitées par le type de dent** (`restorationOptions()` dans `projects/angular-advanced-odontogram/src/lib/core/registry/restorations.ts`) : un implant ne propose que les types de restauration `crown`/`bridge` (composés avec un calque de connecteur d'implant) plus les cinq entrées d'attachement `prosthesis` ci-dessous ; une dent absente/édentée ne propose qu'un intermédiaire de `bridge` plus les deux entrées `prosthesis` de prothèse amovible ; un substrat `radix` masque entièrement le contrôle de restauration.

**Prothèse** (`prosthesis` ; axe orthogonal amovible/à attachements, présenté comme des entrées « Kivehető : » dans la liste déroulante de restauration combinée) :
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (attachements sur implant, avec ou sans prothèse supra-implantaire), `removable-partial`, `removable-full` (prothèses dento-portées sur une dent absente/édentée). Une dent a soit une restauration fixe, soit une prothèse, jamais les deux — définir l'une efface l'autre.

**Percolation marginale de couronne** (`crownLeakage` ; booléen) : affichée uniquement lorsque `restorationType` est `crown` ou `bridge`.

**Options endodontiques (dents permanentes) :**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Options endodontiques (dents temporaires) :**
`none`, `endo-medical-filling`

`endo` et `pulpDx` sont présentés via un unique sélecteur fusionné « Statut pulpe / endo » (regroupé : pulpe vitale vs traitée/endo) et sont mutuellement exclusifs — choisir une option traitée (`endo != none`) réinitialise `pulpDx` à `normal` et choisir un diagnostic pulpaire réinitialise `endo` à `none`.

**Matériaux d'obturation (dents permanentes) :**
`amalgam`, `composite`, `gic`, `temporary`

**Matériaux d'obturation (dents temporaires) :**
`composite`, `gic`, `temporary`

**Surfaces d'obturation/carie :**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (carie uniquement)

**Modifications :**
`inflammation` (périapicale), `parodontal` (parodontale), `mobility` (M1/M2/M3)

**Type de lésion périapicale** (`periapicalType` ; qualifie le symbole périapical, affiché uniquement sous parodontite apicale symptomatique/asymptomatique) :
`none`, `granuloma`, `cyst` — la valeur héritée `abscess` est encore acceptée/stockée mais n'est plus proposée dans le sélecteur

**Diagnostic pulpaire** (terminologie AAE ; `pulpDx`) :
`normal`, `reversible-pulpitis`, `irreversible-pulpitis`, `necrosis` — mutuellement exclusif avec `endo`

**Diagnostic pulpaire, latin pratique** (`pulpLatin` ; affiché par le sélecteur pulpaire uniquement lorsque `pulpDetailLevel` est `latin`) :
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Niveau de détail pulpaire** (`pulpDetailLevel`, paramètre global) : `simple`, `aae` (par défaut), `latin`

**Diagnostic apical** (`apicalDx` ; pilote le symbole périapical) :
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Type de résorption radiculaire** (`resorptionType`) :
`none`, `internal`, `external-cervical`

**Statut péri-implantaire** (`periImplant` ; implants uniquement, classification du World Workshop 2018) :
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Sévérité de carie** (`cariesSeverity` ; champ unifié par surface, `0`–`6`) : sur une surface sans obturation, elle est lue comme l'échelle de profondeur de carie ICDAS (`superficial` / `dentin` / `deep`, ou les codes bruts ICDAS II `0–6` lorsque `enableIcdas` est activé) ; sur une surface avec obturation, elle est lue comme un score CARS nommé (`0` saine … `6` cavité étendue)

**Carie radiculaire** (`rootCaries`) : `none`, `active`, `arrested`, `active-cavitated`

**Profondeur de carie radiographique** (`radiographicDepth` ; par surface) : `none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Paramètres de granularité des caries** (globaux) : `secondaryCariesMode` (`simple`/`standard`/`full`, par défaut `standard`), `rootCariesMode` (`simple`/`severity`, par défaut `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, par défaut `off`), `cariesDepthEnabled` (booléen, par défaut `true`)

**Indicateurs spéciaux :**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Usure dentaire** (`wearEdge`, `wearCervical` ; type clinique par localisation, délimité sur tooth-base + aucune restauration + substrat naturel) :
`wearEdge` : `none`, `attrition`, `erosion` — `wearCervical` : `none`, `abrasion`, `abfraction`, `erosion`

**Coloration** (`discoloration` ; cause par dent, délimitée sur une dent naturelle tooth-base ou une dent temporaire + aucune restauration + substrat naturel) :
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Défaut d'obturation** (`fillingDefect` ; par surface, observation sur restauration directe indépendante de la carie récidivante) :
`none`, `marginal`, `fracture`, `wear`

**Orthodontie** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation` ; par dent, délimité sur une dent naturelle présente) :
`orthoAppliance` : `none`, `bracket`, `band` — `orthoDrift` : `none`, `mesial`, `distal` — `orthoVertical` : `none`, `extrusion`, `intrusion` — `orthoRotation` : booléen

**Paramètres de détail de la dent / de notation** (paramètres de session globaux, Paramètres → Détails de la dent) : `wearDetailLevel` et `discolorationDetailLevel` (`ToothDetailLevel` : `simple`/`complex`, par défaut `complex`) et `surfaceNotation` (`simple`/`full`, par défaut `full`)

### ⚙️ Paramètres

Ouverts depuis l'icône d'engrenage de la barre supérieure (`SettingsModalComponent`) ; un `dialog` ARIA à piège de focus avec une disposition à 7 onglets (Échap/clic sur le fond pour fermer, touches fléchées pour changer d'onglet). La boîte de dialogue est une vue pure sur un `SettingsState` fourni par l'hôte — elle ne possède elle-même aucun état de paramètre. Tous les paramètres ne concernent que l'état de l'interface au niveau de la session, sauf mention contraire — aucun d'eux ne mute les données par dent ni la charge utile d'export.

- **Général :** système de numérotation (FDI/Universel/Palmer), langue, thème sombre/clair, disponibilité d'export par format (PNG/JPG/SVG/PDF — masque l'élément de menu Export correspondant lorsqu'il est désactivé, et désactive l'onglet Export lorsque le PDF est désactivé), disponibilité d'import par source (JSON d'état/FHIR)
- **Odontogramme :** disposition à l'écran — espacement des dents, taille du numéro de dent, couleur et style de bordure de sélection ; visibilité du panneau d'informations sur la dent ; disponibilité du mode Plan ; profil d'anatomie dentaire (`classic` par défaut / `measured` — neuf modèles dentaires mesurés d'après la littérature dans une disposition à deux arcades avec largeur par dent, commutable à l'exécution) ; visibilité de la carte États et de la carte Orthodontie
- **Bilan parodontal :** une bascule de disponibilité qui conditionne le reste de l'onglet et les points d'entrée parodontaux de la shell ; mode d'affichage du bilan parodontal (`toggle`/`popup`) ; 16 bascules d'affichage/masquage par indice réparties en 5 groupes (Poche : PD/GM/CAL/BOP · Hygiène : Plaque/PI/GI · Muco-gingival : visibilité JEC/Concavité radiculaire/KG/GT · Soutien : Furcation/Mobilité/Classe de Miller · Péri-implantaire : mPI/mBI) ; un mode d'affichage du nom d'indice traduit vs canonique (canonique = un nom scientifique fixe en anglais/latin dans toutes les langues de l'interface ; les infobulles restent toujours localisées)
- **Détails de la dent :** niveau de détail pulpaire (simple/AAE/latin pratique, par défaut AAE), niveau de détail de l'usure et niveau de détail de la coloration (simple/complexe, chacun complexe par défaut), notation de surface (simple/complète, complète par défaut), bascule des notes par dent
- **Caries :** bascule de score ICDAS II, bascule de profondeur de carie, granularité de la carie radiculaire (simple/severity), granularité secondaire/CARS (simple/standard/full), granularité de la profondeur radiographique (off/threeLevel/detailed)
- **Obturations :** complexité d'obturation (complex/simple), bascule des constats de défaut d'obturation, disponibilité par matériau (amalgame/composite/CVI/temporaire), bascule de scellement de sillon
- **Export :** la configuration complète du rapport PDF (`PdfSettings` — voir [Export](#-export) ci-dessous) — désactivé (retombe sur le contenu de l'onglet Général) chaque fois que l'export PDF est désactivé dans l'onglet Général

### 🖼️ Système de modèles SVG

**Modèles de dents** (dans `projects/angular-advanced-odontogram/src/lib/core/assets/teeth-svgs/`) :
| Modèle | Dents l'utilisant |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisives) |
| `13.svg` | 13, 23, 33, 43 (canines) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (prémolaires) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molaires) |

Les modèles sont pivotés de 180 degrés pour la mâchoire inférieure et reflétés horizontalement pour le côté gauche. Un sous-dossier parallèle `measured/` contient les neuf modèles dentaires mesurés d'après la littérature que le profil d'anatomie `measured` affiche dans une disposition à deux arcades avec largeur par dent (Paramètres → Odontogramme → anatomie dentaire).

**SVG d'icônes** (dans `projects/angular-advanced-odontogram/src/lib/core/assets/icon-svgs/`) :
`icon_8.svg` (sagesse), `icon_gum.svg` (os), `icon_no_selection.svg` (effacer), `icon_occl.svg` (vue occlusale), `icon_pulp.svg` (pulpe)

Les deux dossiers sont compilés en modules TypeScript générés (`core/generated/teeth-svgs.ts`, `core/generated/icon-svgs.ts`) via `npm run gen:assets` — exécutez cette commande après avoir modifié un SVG source afin que les chaînes inline embarquées restent synchronisées.

### 🔢 Systèmes de numérotation

**FDI (ISO 3950) :** Dents permanentes 11-18, 21-28, 31-38, 41-48. Dents temporaires 51-55, 61-65, 71-75, 81-85. Valeur : `"FDI"`.

**Universel (USA) :** Dents permanentes numérotées 1-32. Dents temporaires lettrées A-T. Valeur : `"UNIVERSAL"`.

**Palmer (Zsigmondy-Palmer) :** Format quadrant + position (p. ex. UR-1, LL-5). Les dents temporaires utilisent les lettres A-E par quadrant. Valeur : `"PALMER"`.

`NumberingSystem` (`core/utils/numbering.ts`) est exactement l'union `"FDI" | "UNIVERSAL" | "PALMER"` ; la fonction exportée `toLabel(fdiTooth, system)` convertit un numéro de dent FDI vers l'étiquette du système demandé (p. ex. `toLabel(14, "PALMER")` → `"UR-4"`).

### 🚀 Utilisation
Développement (exécute l'application de démo) :
```bash
npm install
npm start           # ng serve
```
Construire la bibliothèque :
```bash
npm run build:styles && npx ng build angular-advanced-odontogram
```
Construire l'application de démo :
```bash
npm run build:demo
```

### 🔗 Intégration
Le composant peut être intégré dans n'importe quelle application Angular :
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

**Intégration du mode sombre :**
- **Mode autonome :** Omettez `darkMode` — le composant gère son propre état de thème via le bouton de bascule de la barre supérieure et ajoute/retire la classe `.dark` sur l'élément racine de l'hôte.
- **Mode contrôlé :** Liez `[darkMode]` et `(darkModeChange)` — l'application parente contrôle le thème. Le bouton de bascule apparaît toujours mais émet `darkModeChange` au lieu de gérer un état interne. Le parent est responsable de l'ajout/retrait de la classe `.dark` sur `<html>`.

**Thème personnalisé :**
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

**Intégration de plugins :**
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

La sortie de `renderSvg()` d'un plugin est désinfectée avec DOMPurify (profil SVG) avant insertion dans le schéma en direct — voir [Notes de sécurité](#-notes-de-sécurité).

### 🧪 Tests

La suite est répartie sur **deux runners**, et les deux doivent réussir (`npm test` exécute les deux, dans l'ordre) :

```bash
npm run test:corpus   # plain Vitest — the shared clinical-engine core
npm run test:ng       # Angular's Vitest builder — the Angular shell (ng test)
npm test              # both, in order
npm run test:watch    # watch mode (corpus runner)
```

- **`test:corpus`** (`vitest run`) exerce `projects/angular-advanced-odontogram/src/lib/core/` — le cœur du moteur clinique partagé — contre le corpus de tests porté (plus de 100 fichiers de spec sous `core/__tests__/`). C'est là que vivent les **fixtures de référence (« golden »)** du rendu SVG, de l'export FHIR et de l'aller-retour JSON, vérifiées octet pour octet : `parity/svg-fingerprints.json`, `parity/fhir-golden.json`, `parity/roundtrip-golden.json`, `parity/shell-dom-golden.html`.
- **`test:ng`** (`ng test angular-advanced-odontogram --watch=false`, l'intégration Vitest `@angular/build:unit-test` d'Angular) exécute les propres specs `*.spec.ts` de la shell Angular — composants, services, directives — en vérifiant la parité DOM : la shell affiche les mêmes ids, classes et balisage que les composants React d'origine.

Comme l'intégration Vitest de ce builder ne prend pas en charge `vi.mock()`/`vi.spyOn()` pour le mock de modules par chemin relatif, les effets de bord touchant au DOM (`initOdontogram`/`destroyOdontogram`, `exportPdf`) sont surchargés via les jetons d'injection `ODONTOGRAM_ENGINE_LIFECYCLE`/`EXPORT_PDF_FN` et le tableau de fournisseurs du `TestBed` d'Angular à la place — voir [Points d'accès DI pour les tests hôte](#-utilisation-comme-paquet-npm) ci-dessus.

### 📖 Documentation d'API
```bash
npm run docs           # Generate TypeDoc docs in docs/api/
```
L'API du moteur clinique partagé est également documentée dans le projet d'origine :

📚 **https://zoliqua.github.io/React-Odontogram-Modul/**

### 📡 API publique

**Entrées/sorties du composant :** voir [Entrées du composant](#-utilisation-comme-paquet-npm) ci-dessus pour le tableau complet.

**Fonctions exportées pour le contrôle externe** (sous-ensemble sélectionné — la surface complète et typée se trouve dans le `.d.ts` fourni) :

| Fonction | Description |
|---|---|
| `initOdontogram()` / `destroyOdontogram()` | Initialise/nettoie le moteur (appelé en interne par `OdontogramShellComponent`/`OdontogramUiService` via le jeton `ODONTOGRAM_ENGINE_LIFECYCLE`) |
| `setNumberingSystem(system)` | Bascule entre FDI, UNIVERSAL, PALMER |
| `clearSelection()` | Désélectionne toutes les dents |
| `registerPlugins(plugins)` | Enregistre des plugins SVG personnalisés |
| `setPluginState(toothNo, pluginId, value)` / `getPluginState(toothNo, pluginId)` | Définit/obtient l'état personnalisé d'un plugin pour une dent |
| `getToothStateSummary(toothNo)` | Obtient un résumé localisé de tous les états actifs |
| `getOdontogramSummary()` | Obtient un résumé textuel structuré et localisé de l'ensemble du schéma (comptages, sections, changements planifiés) |
| `onStateChange(callback)` | S'abonne aux changements d'état ; renvoie une fonction de désabonnement |
| `setReadOnly(value)` / `getReadOnly()` | Active/désactive / interroge le mode lecture seule |
| `setNotesEnabled(value)` / `getNotesEnabled()` | Active/désactive / interroge les notes par dent |
| `setPulpDetailLevel(level)` / `getPulpDetailLevel()` | Définit/obtient le vocabulaire du sélecteur pulpaire — `"simple"`, `"aae"`, ou `"latin"` |
| `getToothAnatomy()` / `setToothAnatomy(v)` | Obtient/définit le profil d'anatomie dentaire — `"classic"` ou `"measured"` |
| `getChartMode()` / `setChartMode(mode)` | Obtient/bascule le schéma actif — `"status"` ou `"plan"` (le schéma de plan est copié en profondeur depuis l'état la première fois qu'on y entre) |
| `getStatusChart()` / `getPlanChart()` / `setPlanChart(payload)` | Lit les charges utiles du schéma d'état/de plan indépendamment du schéma actif, ou remplace les dents du schéma de plan |
| `getPlanChanges()` | Obtient le diff structuré état→plan (`{ toothNo, axis, from, to }[]`) |
| `setPerioSite(toothNo, site, patch)` / `getToothPerio(toothNo)` | Définit/obtient les données parodontales pour l'un des six sites (`patch` = `{ pd?, gm?, bop?, sup? }`) |
| `getToothCal(toothNo)` | Obtient le CAL dérivé par site pour une dent |
| `getPerioSummary()` | Agrégats parodontaux bucco-dentaires : nombre de sites chartés, nombre de saignements, %BOP, pire CAL, PD max |
| `getPerioChart()` | Obtient les enregistrements parodontaux par dent du schéma actif |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Ouvre/ferme/interroge par programmation la superposition du bilan parodontal |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Obtient/définit la manière dont le bilan parodontal est présenté — `"toggle"` ou `"popup"` |
| `getPerioClassification()` | Obtient la classification parodontale du World Workshop 2017 (`{diagnosis, stage, grade, extent, derived, overridden}`) |
| `setDiagnosisOverride(v)` / `setStageOverride(v)` / `setGradeOverride(v)` / `setExtentOverride(v)` | Surcharge un axe dérivé de la classification parodontale, ou `null` pour revenir à la valeur dérivée |
| `getCaseMeta()` / `resetCaseMeta()` | Obtient/réinitialise l'objet de métadonnées au niveau du cas (âge, statut tabagique/diabétique, identité du patient, date d'examen, …) |
| `setPatientName(v)` / `setPatientDob(v)` / `setExamDate(v)` | Définit les champs d'identité du cas (en-tête du rapport PDF uniquement — jamais dans l'export FHIR) |
| `exportFhir(options?)` | Exporte le schéma sous forme de Bundle de collection HL7 FHIR R4 (téléchargement JSON) ; référence `{ subject }` optionnelle |
| `importFhirBundle(input)` | Importe un Bundle FHIR R4 (objet ou chaîne JSON) produit par ce module |
| `exportImage(format)` | Télécharge le schéma sous forme d'image — `"png"` ou `"jpg"` |
| `exportSvg()` | Télécharge le schéma sous forme de SVG évolutif (vectoriel) |
| `hasAnyPerioData()` | `true` si et seulement si un axe parodontal est charté quelque part dans la bouche |
| `exportPerioSvg()` / `exportPerioImage(format)` | Télécharge le bilan parodontal complet sous forme d'un SVG vectoriel autonome ou d'une image matricée |
| `exportPdf(opts)` | Télécharge un rapport PDF natif jsPDF (voir [Export](#-export) ci-dessous) |
| `getPdfSettings()` / `setPdfSettings(patch)` | Obtient/modifie la configuration du rapport PDF (`PdfSettings`) |
| `exportStatus()` | Télécharge le schéma d'état sous forme de JSON |
| `importStatus(data)` | Hydrate le moteur à partir d'une charge utile JSON précédemment exportée (voir [Format d'export/import de l'état](#-format-dexportimport-de-létat)) |
| `setImportFormat(format)` | Définit l'analyseur du prochain import de fichier — `"status"` ou `"fhir"` |
| `startIntroTour()` | Lance la visite guidée interactive |

### 💾 Persistance de l'état (localStorage)

Persistance `localStorage` optionnelle pour l'état de cas de l'odontogramme (`core/persistence.ts`, réexporté depuis le point d'entrée du paquet). Désactivée par défaut — les intégrations existantes ne sont pas affectées tant qu'une application hôte ne l'active pas explicitement, et elle doit être appelée **après** que l'odontogramme a été monté (p. ex. depuis le `ngAfterViewInit()` d'un composant, après que `OdontogramShellComponent`/`OdontogramUiService` a appelé `init()` — la restauration repeint le DOM en direct via `importStatus()`) :

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

| Fonction | Description |
|---|---|
| `enablePersistence(options?)` | Restaure un cas précédemment sauvegardé (le cas échéant) via `importStatus()`, puis sauvegarde le schéma d'état dans `localStorage` à chaque changement d'état stabilisé (les modifications sont temporisées sur une fenêtre d'environ 400 ms — *debounced*, en anglais technique — de sorte qu'une rafale de changements, p. ex. un préréglage d'état, ne produit qu'une seule écriture). Idempotente — l'appeler à nouveau remplace l'abonnement/les options précédents. **Doit être appelée après que l'odontogramme a été monté.** |
| `disablePersistence()` | Arrête la persistance (purge d'abord toute sauvegarde temporisée en attente) ; l'entrée stockée est laissée en place. |
| `clearPersistedState()` | Supprime l'entrée stockée pour la clé active (ou par défaut). |
| `isPersistenceEnabled()` | `true` tant qu'un abonnement au changement d'état est actif. |

**`PersistenceOptions` :**

| Champ | Type | Par défaut | Description |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | La clé `localStorage` — il s'agit de la valeur par défaut littérale du module de cœur partagé lui-même (inchangée par le portage Angular) ; passez votre propre `key` pour éviter toute collision avec une intégration côté React sur la même origine, ou pour cloisonner plusieurs hôtes. |
| `includePlan` | `boolean` | `false` | Persiste aussi le schéma de plan (le champ `plan` de la charge utile). |
| `onError` | `(err: Error) => void` | — | Appelée en cas d'erreur de stockage/analyse au lieu de `console.warn`. |

Remarques : rien n'est lu ni écrit dans `localStorage` tant que `enablePersistence()` n'est pas appelée ; une protection de taille de 4 Mo saute une sauvegarde surdimensionnée (signalée via `onError`/`console.warn`) au lieu de lever une exception ; chaque échec de stockage/JSON — quota dépassé, iframe verrouillée, données stockées corrompues ou non reconnues, etc. — est intercepté et signalé. Ce module ne lève jamais d'exception.

Remarque : activer la persistance restaure le cas sauvegardé via `importStatus()`, qui remplace le cas courant — y compris un schéma de plan en cours si la charge utile sauvegardée n'en contient pas. Activez la persistance au démarrage (juste après le montage), pas en cours de session.

Remarque : la charge utile persistée peut inclure des données de cas identifiant le patient (nom du patient, date d'examen) en clair dans `localStorage`. Si vous chartez de telles données, assurez une protection au niveau de l'appareil ou effacez-les avec `clearPersistedState()` le cas échéant.

### 💾 Format d'export/import de l'état
L'export crée un fichier JSON (version `2.20` ; les imports acceptent aussi les formats hérités `1.4` et `2.0` à `2.19` et migrent automatiquement) contenant :

**Champs globaux :**
- `wisdomVisible` - dents de sagesse visibles
- `showBase` - calque d'os visible
- `occlusalVisible` - vue occlusale active
- `showHealthyPulp` - pulpe saine visible
- `edentulous` - mode édenté actif

**Champs par dent (32 dents) :**
- `toothSelection` - type de dent de base
- `toothSubstrate` - substrat dentaire (natural/radix/broken/crownprep), orthogonal à toute restauration
- `restorationType` - type de restauration (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - matériau de restauration (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), apparié à `restorationType`
- `prosthesis` - axe amovible/à attachements (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), mutuellement exclusif avec un `restorationType` fixe de couronne/pont
- `crownLeakage` - indicateur de percolation marginale de couronne, pertinent uniquement lorsque `restorationType` est couronne ou pont
- `endo` - état endodontique ; mutuellement exclusif avec `pulpDx`
- `mods` - tableau de modifications (inflammation, parodontal) ; `inflammation` s'applique uniquement aux dents absentes/alvéole d'extraction
- `caries` - surfaces à carie active
- `cariesActiveDepth` - la valeur de profondeur ICDAS mise en attente par le sélecteur de profondeur de carie lorsqu'une nouvelle surface est appliquée
- `rootCaries` - sévérité de carie radiculaire (none/active/arrested/active-cavitated)
- `cariesSeverity` - sévérité unifiée par surface (0-6) : profondeur ICDAS sur une surface primaire (non obturée), score CARS sur une surface récidivante (obturée)
- `radiographicDepth` - profondeur de carie radiographique par surface (none/E1/E2/D1/D2/D3), indépendante de l'échelle visuelle ICDAS/CARS
- `fillingMaterial` - matériau d'obturation
- `fillingSurfaces` - surfaces obturées
- `fillingSurfaceMaterials` - matériau d'obturation par surface (obturations mixtes, p. ex. amalgame vestibulaire + composite distal)
- `fillingDefect` - défaut d'obturation par surface (none/marginal/fracture/wear), délimité aux surfaces obturées, indépendant de la carie récidivante
- `pulpDx` - diagnostic pulpaire AAE (normal/reversible-pulpitis/irreversible-pulpitis/necrosis)
- `pulpLatin` - sous-type pulpaire en latin pratique (affiché par le sélecteur pulpaire uniquement lorsque `pulpDetailLevel` est `latin`)
- `apicalDx` - diagnostic apical pilotant le symbole périapical
- `periapicalType` - sous-type de lésion périapicale (none/granuloma/cyst) ; `abscess` hérité encore accepté à l'import
- `resorptionType` - type de résorption radiculaire (none/internal/external-cervical)
- `periImplant` - statut péri-implantaire implants uniquement (none/mucositis/peri-implantitis-mild/-moderate/-severe), classification du World Workshop 2018
- `endoResection` - indicateur d'apicectomie
- `fissureSealing` - indicateur de scellement de sillon
- `calculus` - indicateur de tartre
- `contactMesial` / `contactDistal` - perte de point de contact mésial/distal
- `wearEdge` - type d'usure incisale/occlusale (none/attrition/erosion)
- `wearCervical` - type d'usure cervicale (none/abrasion/abfraction/erosion)
- `discoloration` - cause de coloration par dent (none/tetracycline/fluorosis/nonvital/extrinsic/other)
- `orthoAppliance` - appareil orthodontique (none/bracket/band)
- `orthoDrift` - dérive orthodontique (none/mesial/distal)
- `orthoVertical` - mouvement vertical orthodontique (none/extrusion/intrusion)
- `orthoRotation` - indicateur de rotation orthodontique
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - localisations de fracture
- `extractionWound` - plaie post-extraction
- `extractionPlan` - extraction planifiée
- `parapulpalPin` - indicateur de tenon parapulpaire
- `bridgePillar` - dent pilier de pont
- `mobility` - degré de mobilité (none/m1/m2/m3)
- `crownNeeded` - indicateur couronne à réaliser
- `crownReplace` - indicateur remplacement de couronne nécessaire
- `missingClosed` - espace fermé après extraction
- `customStates` - états personnalisés des plugins (objet, indexé par ID de plugin)
- `note` - note textuelle par dent (chaîne, optionnelle — présente uniquement lorsque non vide)

**Champ `plan` de premier niveau (version 2.11+) :**
- `plan` - objet optionnel, de même forme que `teeth` (champs par dent ci-dessus), contenant le schéma de **plan** (post-traitement prévu). Présent uniquement lorsque le schéma de plan a été initialisé ET que son contenu diffère du schéma d'état. À l'import, un `plan` absent efface/désinitialise le schéma de plan ; un `plan` présent restaure le schéma de plan aux côtés de l'état. Également lisible/inscriptible indépendamment via `getPlanChart()`/`setPlanChart()`.

**Champ `case` de premier niveau (version 2.17+, étendu en 2.18, 2.19 et 2.20) :**
- `case` - objet optionnel contenant des métadonnées au niveau du cas (non par dent), partagées par les schémas d'état et de plan. Omis quand vide. Champs (chacun omis lorsqu'à sa valeur par défaut) : `age` ; `smokingStatus` (+ `cigarettesPerDay`) ; `diabetesStatus` (+ `hba1c`) ; `toothLossPerio` ; `maxRblPercent` ; les quatre surcharges par axe du clinicien de la classification 2017 `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride` ; `patientName` / `examDate` ; et `patientDob`. Lu/écrit via `getCaseMeta()` et les setters `set*` ci-dessus. Le nom du patient, la date de naissance et la date d'examen ne sont que des métadonnées d'identité du schéma — ils ne font **pas** partie de l'export FHIR.

### 🖨️ Export
Au-delà de l'export propre à l'odontogramme (JSON d'état / FHIR / PNG / JPG / SVG), le **bilan parodontal** dispose de son propre chemin d'export :
- **Perio SVG/PNG/JPG :** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` rendent le bilan parodontal complet sous forme d'un unique SVG vectoriel autonome, indépendamment du DOM `PerioChartComponent` monté. Désactivé chaque fois que `hasAnyPerioData()` est faux.
- **Rapport PDF :** l'élément « Rapport PDF… » du menu d'export ouvre `ExportOptionsModalComponent` — une boîte de dialogue de paramètres (champs nom du patient + date de naissance + date d'examen, câblés directement aux métadonnées du cas, avec la date d'examen par défaut à aujourd'hui ; cases à cocher de section : données patient, schéma d'odontogramme, description de l'odontogramme, notes individuelles — désactivée lorsqu'aucune dent n'a de note — statut parodontal, description parodontale) avant d'appeler `exportPdf(opts)` via le jeton d'injection `EXPORT_PDF_FN`. Les champs d'identité vides retombent sur des valeurs de substitution (`"John Doe"` / `"1980-01-01"`, configurables via `PdfSettings.defaultName`/`defaultDob`) afin que l'export réussisse toujours. Le PDF est assemblé nativement en jsPDF — texte vectoriel via `.text()`, images matricées des dents/bilan parodontal via `.addImage()` — sans dépendance à `svg2pdf.js`. La section des notes individuelles est auto-sautée lorsqu'aucune dent n'a de note, et les deux sections parodontales chaque fois que `hasAnyPerioData()` est faux, indépendamment des cases à cocher de la boîte de dialogue.
- **Configuration du rapport (`PdfSettings`, Paramètres → onglet Export, obtenue/définie via `getPdfSettings()`/`setPdfSettings(patch)`) :** nom/date de naissance par défaut du patient, affichage ou non de l'âge, format de date (ISO/JMA/MJA), thème de couleur (bleu/sarcelle/ambre/ardoise), visibilité de l'os/de la pulpe sur l'odontogramme, espacement des dents/bordure/taille du numéro de dent sur l'image du schéma, inclusion ou non de la description textuelle et du tableau des observations, options correspondantes d'espacement/placement d'étiquette/taille de police du bilan parodontal et inclusion ou non du tableau des indices parodontaux et du glossaire des abréviations, un avertissement médical (texte par défaut ou personnalisé), un cachet de générateur/version, et le regroupement du résumé de dentition (bouche entière / mâchoire / quadrant / sextant — pilote également le tableau du panneau d'informations sur la dent à l'écran).
- **Verrouillage implantaire mPI/mBI :** les indices de Mombelli péri-implantaires (mPI/mBI) ne s'affichent en tant que rangées que dans une arcade contenant au moins une dent sur implant — à la fois sur le bilan parodontal en direct et sur les exports SVG/PDF.
- Le nom du patient, la date de naissance et la date d'examen ne sont que des métadonnées d'identité du schéma (charge utile `2.20`, additif) — ils ne font **pas** partie de l'export FHIR.

### 📁 Structure des dossiers
- `projects/angular-advanced-odontogram/src/public-api.ts` - le point d'entrée public du paquet (chaque export réexporté depuis ici)
- `projects/angular-advanced-odontogram/src/lib/core/odontogram.ts` - le moteur clinique sans dépendance à un framework : superposition SVG, gestion de l'état des dents, interactions tactiles, superpositions de plugins, paramètres, export/import
- `projects/angular-advanced-odontogram/src/lib/core/persistence.ts` - persistance localStorage optionnelle
- `projects/angular-advanced-odontogram/src/lib/core/theme.ts` - le type `OdontogramThemeConfig` et l'utilitaire `applyThemeConfig()`
- `projects/angular-advanced-odontogram/src/lib/core/plugin.ts` - le type `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, les priorités d'index-z `LAYER_Z`
- `projects/angular-advanced-odontogram/src/lib/core/pluginSanitize.ts` - `sanitizePluginSvg()`, le désinfecteur adossé à DOMPurify que traverse la sortie `renderSvg()` d'un plugin avant insertion dans le schéma en direct
- `projects/angular-advanced-odontogram/src/lib/core/tour.ts` - la visite guidée interactive
- `projects/angular-advanced-odontogram/src/lib/core/perioClassification.ts` - dérivation de la classification parodontale du World Workshop 2017
- `projects/angular-advanced-odontogram/src/lib/core/perioExport.ts` / `perioGraphic.ts` / `perioIndexNames.ts` - le rendu SVG du bilan parodontal bouche complète
- `projects/angular-advanced-odontogram/src/lib/core/perioPdf.ts` - l'assembleur pur jsPDF du rapport PDF (`assemblePdf`)
- `projects/angular-advanced-odontogram/src/lib/core/status_extras.ts` - 22 modèles de restauration prédéfinis
- `projects/angular-advanced-odontogram/src/lib/core/i18n/` - les traductions (12 langues) et le bus i18n sans dépendance à un framework
- `projects/angular-advanced-odontogram/src/lib/core/utils/numbering.ts` - conversion de numérotation FDI, Universel, Palmer
- `projects/angular-advanced-odontogram/src/lib/core/registry/` - registre déclaratif des axes cliniques : mappages de champs FHIR, activation par clear-set SVG/indicateur booléen, matrice type×matériau de restauration, listes d'options d'interface
- `projects/angular-advanced-odontogram/src/lib/core/fhir/` - export/import HL7 FHIR R4 : `toFhir.ts`/`fromFhir.ts`, systèmes de codes, mappages de champs, primitives
- `projects/angular-advanced-odontogram/src/lib/core/bridgeOverlay.ts` - superposition de connecteur d'étendue de pont multi-dents
- `projects/angular-advanced-odontogram/src/lib/core/fonts/` - polices Unicode PDF embarquées (façonnage arabe, CJK) + le chargeur de police
- `projects/angular-advanced-odontogram/src/lib/core/assets/` - fichiers source SVG des dents/icônes (`teeth-svgs/`, `teeth-svgs/measured/`, `icon-svgs/`)
- `projects/angular-advanced-odontogram/src/lib/core/generated/` - les SVG compilés en modules TypeScript inline (`npm run gen:assets`)
- `projects/angular-advanced-odontogram/src/lib/core/__tests__/` + `registry/__tests__/` - le corpus de tests porté, y compris les fixtures de référence sous `parity/`
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/` - `OdontogramShellComponent`, la shell tout-en-un
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-ui.service.ts` - `OdontogramUiService`, la couche d'état/effets de l'interface composable
- `projects/angular-advanced-odontogram/src/lib/components/engine-state.ts` - l'assistant de signal `engineState()`
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-engine-lifecycle.ts` - le jeton DI `ODONTOGRAM_ENGINE_LIFECYCLE`
- `projects/angular-advanced-odontogram/src/lib/components/surfaces/` - les quatre surfaces de présentation (barre supérieure, schéma, informations sur la dent, contrôles de la dent) et, sous `surfaces/cards/`, les sept cartes de contrôle déclaratives
- `projects/angular-advanced-odontogram/src/lib/components/settings-modal/` - `SettingsModalComponent` (boîte de dialogue de paramètres à 7 onglets)
- `projects/angular-advanced-odontogram/src/lib/components/export-options-modal/` - `ExportOptionsModalComponent` et le jeton DI `EXPORT_PDF_FN`
- `projects/angular-advanced-odontogram/src/lib/components/credits-modal/` - `CreditsModalComponent`
- `projects/angular-advanced-odontogram/src/lib/components/perio-chart/` / `perio-sidebar/` - le bilan parodontal autonome/en ligne et sa barre latérale contextuelle
- `projects/angular-advanced-odontogram/src/lib/components/dual-state-confirm/` - la boîte de dialogue de confirmation partagée (modifications affectant état↔plan)
- `projects/angular-advanced-odontogram/src/lib/components/shared/dialog-focus.ts` - les assistants partagés de piège/restauration de focus modal
- `projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.ts` - `I18nService`, la façade Angular réactive au-dessus du bus i18n du cœur
- `projects/demo/` - l'application de démo Angular (`ng serve` / `npm run build:demo`)
- `scripts/generate-svg-assets.mjs` - le générateur de `npm run gen:assets`

### ⚙️ Pile technique
- Angular 21 (composants autonomes, signaux) + Angular CLI (`@angular/build`) + TypeScript
- `ng-packagr` pour le build de la bibliothèque (`ng build angular-advanced-odontogram`)
- Tailwind CSS pour la mise en forme de l'interface, compilé une seule fois en une feuille de style statique (`npm run build:styles` → `projects/angular-advanced-odontogram/styles.css`) — les consommateurs enregistrent cette feuille de style, ils n'exécutent pas Tailwind eux-mêmes
- Superposition SVG via manipulation du DOM dans le cœur sans dépendance à un framework (état non réactif Angular pour la performance — le même moteur que celui de l'original React)
- Un système i18n personnalisé, léger et sans dépendance à un framework (`core/i18n/`), enveloppé par `I18nService` pour la liaison réactive aux templates Angular
- Deux runners de test : Vitest brut pour le corpus du cœur (`vitest run`), l'intégration Vitest `@angular/build:unit-test` d'Angular pour les specs de composants (`ng test`) ; `@testing-library/jest-dom` pour les matchers DOM
- TypeDoc pour la documentation d'API (`npm run docs`, sortie `docs/api/`)
- jsPDF pour le rapport PDF ; DOMPurify pour la désinfection de la sortie des plugins

### 📝 Notes
- Les modèles SVG et les icônes sont compilés en modules TypeScript générés au moment du build (`npm run gen:assets`) — il n'y a aucune récupération de ressource à l'exécution et rien à servir depuis un dossier public.
- Le moteur d'odontogramme utilise son propre état interne, sans dépendance à un framework (et non les signaux Angular), pour la grille SVG, pour la performance et pour rester identique à l'original React ; les composants Angular le lisent de manière réactive via `engineState()`/`I18nService`/`onStateChange()` au lieu de le posséder eux-mêmes.
- Les dents temporaires disposent d'un ensemble réduit de matériaux disponibles (pas d'obturations à l'amalgame, pas d'endo à base de tenon).
- Les dents sur implant disposent d'un ensemble d'options de couronne/pilier différent de celui des dents naturelles.

### 🔒 Notes de sécurité

- **Les plugins s'exécutent comme du code de confiance.** La valeur de retour de `renderSvg()` d'un plugin est injectée dans le SVG du schéma en direct. Cette sortie est désinfectée avec [DOMPurify](https://github.com/cure53/DOMPurify) (profil SVG, plus `svgFilters`) avant insertion — `<script>`, `<iframe>`, `<object>`, `<embed>` et `<foreignObject>` sont catégoriquement interdits, et une sortie entièrement malveillante est abandonnée plutôt que partiellement rendue. Cela réduit le rayon d'impact d'un plugin compromis ou bogué, mais les plugins ne devraient toujours être chargés que depuis des sources fiables — la désinfection est un filet de sécurité, pas un substitut à une vérification.
- **Content-Security-Policy.** Ce paquet n'injecte pas de CSP qui lui soit propre lorsqu'il est intégré comme bibliothèque. Les applications hôtes affichant `OdontogramShellComponent` devraient définir leur propre CSP adaptée à leur déploiement ; une base raisonnable reprend la politique de la démo du projet React d'origine :

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

### 📖 Comment citer

Ce paquet n'a pas de fiche de citation propre — il s'agit d'un portage qui partage son moteur clinique, à l'identique, avec le projet d'origine. Si vous utilisez ce logiciel dans le cadre d'une recherche, veuillez citer l'original :

> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Toutes les versions (DOI de concept) :** https://doi.org/10.5281/zenodo.21156787

Les métadonnées de citation lisibles par machine se trouvent dans le [`CITATION.cff`](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/CITATION.cff) du projet d'origine.

## 🙌 Crédits

Angular Advanced Odontogram est créé et maintenu par Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), créateur et développeur principal de ce portage et du moteur clinique sous-jacent. La même fenêtre contextuelle intégrée à l'application (barre supérieure → « À propos et remerciements ») liste ces noms.

**Projet d'origine**

- [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul) : l'implémentation React d'origine dont ce paquet est le portage — le moteur clinique (logique de statut dentaire, bilan parodontal, export/import FHIR, chaînes i18n, visite guidée, modèles SVG) est partagé à l'identique.

**Construit avec** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [Angular](https://angular.dev), [Angular CLI](https://angular.dev/tools/cli), [TypeScript](https://www.typescriptlang.org) et [Tailwind CSS](https://tailwindcss.com).

Les contributions sont les bienvenues — voir [`CONTRIBUTING.md`](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/CONTRIBUTING.md). Si ce projet vous est utile, n'hésitez pas à [lui donner une étoile sur GitHub](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
