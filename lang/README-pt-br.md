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

> 🌐 **Languages:** 🇬🇧 [English](README-en.md) | 🇭🇺 [Magyar](README-hu.md) | 🇩🇪 [Deutsch](README-de.md) | 🇪🇸 [Español](README-es.md) | 🇫🇷 [Français](README-fr.md) | 🇮🇹 [Italiano](README-it.md) | 🇵🇱 [Polski](README-pl.md) | 🇧🇷 Português (BR) (este arquivo) | 🇸🇰 [Slovenčina](README-sk.md) | 🇷🇺 [Русский](README-ru.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md)

---

## 📑 Conteúdo

- [📋 Visão geral](#-visão-geral)
- [📦 Usar como pacote npm](#-usar-como-pacote-npm)
- [✨ Principais recursos](#-principais-recursos)
- [📦 Módulos](#-módulos)
- [🛠️ Controles da interface](#-controles-da-interface)
- [🦷 Tipos e estados de dente](#-tipos-e-estados-de-dente)
- [⚙️ Configurações](#-configurações)
- [🖼️ Sistema de modelos SVG](#-sistema-de-modelos-svg)
- [🔢 Sistemas de numeração](#-sistemas-de-numeração)
- [🚀 Uso](#-uso)
- [🔗 Integração](#-integração)
- [🧪 Testes](#-testes)
- [📖 Documentação da API](#-documentação-da-api)
- [📡 API pública](#-api-pública)
- [💾 Persistência de estado (localStorage)](#-persistência-de-estado-localstorage)
- [💾 Formato de exportação/importação de status](#-formato-de-exportaçãoimportação-de-status)
- [🖨️ Exportação](#-exportação)
- [📁 Estrutura de pastas](#-estrutura-de-pastas)
- [⚙️ Stack tecnológica](#-stack-tecnológica)
- [📝 Notas](#-notas)
- [🔒 Notas de segurança](#-notas-de-segurança)
- [📖 Como citar](#-como-citar)

## 🇧🇷 Português (BR)

### 📋 Visão geral

Este projeto é um editor de odontograma interativo, executado no navegador, para **Angular + TypeScript**, que agiliza o registro odontológico com uma interface limpa. Ele renderiza modelos de dentes em SVG por camadas para representar restaurações, cáries, estado endodôntico, mobilidade e outros detalhes clínicos, oferecendo seleção múltipla, filtros de seleção e predefinições de estado prontas para uso.

**Este é o port oficial em Angular do [React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram)** (npm: [`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)). Paridade de recursos com o react-advanced-odontogram **v2.6.0** (commit do motor `215c43a`), versão de payload **2.22** — as exportações JSON e FHIR R4 fazem round-trip entre as duas bibliotecas. O motor clínico (`projects/angular-advanced-odontogram/src/lib/core/`) é compartilhado, ao pé da letra — a lógica de estado dentário, o registro periodontal, a codificação de diagnósticos, a exportação/importação FHIR, as strings de i18n, o tour guiado e os modelos SVG são byte a byte idênticos ao original em React, recopiados a partir de um commit upstream fixado a cada ressincronização; apenas a casca de componentes (`projects/angular-advanced-odontogram/src/lib/components/`) é nativa em Angular. Existe um pequeno conjunto de desvios, explicitamente documentado (apenas strings de marca/identidade — veja a especificação de design do port neste repositório). O versionamento acompanha em lockstep o do módulo React.

---
![Prévia do editor de odontograma](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_en_odontogram.png)
*Captura de tela do projeto React original — o port em Angular renderiza a interface idêntica.*

🔗 **Demo ao vivo:** https://angular-advanced-odontogram.vercel.app/

---

### 📦 Usar como pacote npm

O odontograma é distribuído como uma biblioteca de componentes Angular autocontida no npm:
[`angular-advanced-odontogram`](https://www.npmjs.com/package/angular-advanced-odontogram).

#### Requisitos
- **Angular 21.2+** (declarado como peer dependency — fornecido pela sua aplicação).
- Um **bundler** que entenda o campo `exports` e ESM — o Angular CLI (`@angular/build`) atende a esse requisito nativamente. O pacote é **somente ESM**.
- Node **≥ 20** para as ferramentas.

#### Instalação

```bash
npm install angular-advanced-odontogram
```

#### Uso básico

Registre a folha de estilos **uma única vez**, em qualquer lugar onde os estilos globais da sua aplicação sejam configurados (por exemplo, `angular.json`):

```json
"styles": [
  "node_modules/angular-advanced-odontogram/styles.css",
  "src/styles.css"
]
```

Em seguida, renderize o `OdontogramShellComponent`:

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

`language` aceita `hu | en | de | es | it | sk | pl | ru | pt-br | zh | ar | fr`; `numberingSystem` aceita `FDI | UNIVERSAL | PALMER`.

#### Inputs do componente

`OdontogramShellComponent` é um componente controlado — todo input é um signal `input()` do Angular, todos opcionais, cada um recorrendo ao próprio padrão do motor quando omitido. Os mais comuns:

| Input | Tipo | Padrão | Descrição |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | Idioma da interface (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`zh`/`ar`/`fr`). |
| `numberingSystem` | `"FDI" \| "UNIVERSAL" \| "PALMER"` | `"FDI"` | Sistema de numeração dentária. |
| `darkMode` | `boolean` | `false` | Alternância de tema escuro. |
| `readOnly` | `boolean` | `false` | Desativa toda a edição (somente visualização). |
| `themeConfig` | `OdontogramThemeConfig` | — | Sobrescreve variáveis CSS do tema (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Registra plugins de estado personalizados / camadas extras. |
| `enableNotes` | `boolean` | `false` | Habilita anotações por dente. |
| `enableIcdas` | `boolean` | `false` | Habilita a pontuação de cáries ICDAS II. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Complexidade do cartão de restaurações: `"simple"` (um material por dente) ou `"complex"` (materiais por superfície). |
| `fillingDefectEnabled` | `boolean` | `true` | Habilita achados de defeito de restauração no cartão Restaurações. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | todos disponíveis | Materiais de restauração disponíveis como um mapa booleano sobre `amalgam`/`composite`/`gic`/`temporary` (chaves desconhecidas são ignoradas). |
| `fissureSealingEnabled` | `boolean` | `true` | Habilita o selante de fissura no cartão Restaurações. |
| `languageChange` / `numberingChange` / `darkModeChange` (outputs) | `output<T>` | — | Emitem quando o usuário altera a configuração pela interface. |
| `fillingComplexityChange` / `fillingDefectEnabledChange` / `fillingMaterialAvailabilityChange` / `fissureSealingEnabledChange` (outputs) | `output<T>` | — | Emitem quando o usuário altera a configuração correspondente em Configurações → Restaurações. |

Inputs de nível de detalhe mais granulares (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `cariesDepthEnabled`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) também são aceitos — consulte `odontogram-shell.component.ts` para a lista completa e tipada.

Os quatro inputs de restauração acima são **apenas de recuperação**: um input omitido nunca escreve no motor (uma chamada imperativa a `setFillingComplexity()` antes da montagem é preservada), enquanto um input fornecido escreve no motor e no estado do modal Configurações juntos, de modo que o modal nunca mostra um valor obsoleto. `fillingMaterialAvailability` é aplicado por diff em relação a uma chave serializada canônica, de modo que re-renderizar com um novo literal de objeto de conteúdo idêntico nunca reescreve o motor. Os outputs `*Change` correspondentes disparam em Configurações → Restaurações — o caminho de escrita para hosts que persistem preferências.

#### API pública (exports nomeados)

`OdontogramShellComponent` é um export nomeado. A API imperativa de estado, o `PerioChartComponent` autônomo, o tour guiado e todos os tipos públicos são exports nomeados do mesmo ponto de entrada:

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

A superfície completa (bem mais de 100 funções e tipos — `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PdfSettings`, `PerioViewMode` e muitos outros) está totalmente tipada nas declarações `.d.ts` incluídas no pacote; veja [API pública](#-api-pública) abaixo para a tabela de referência selecionada.

#### Superfícies componíveis (avançado)

`OdontogramShellComponent` é o componente tudo-em-um suportado e não requer nenhuma configuração extra. Se você precisar posicionar as regiões do odontograma em áreas diferentes do seu próprio layout, as quatro superfícies de interface da shell também são exportadas e podem ser compostas sob um único `OdontogramUiService`, todas compartilhando uma única sessão pertencente à instância:

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

`OdontogramUiService` recebe o mesmo formato de configuração que os inputs de `OdontogramShellComponent` (seu método `configure()` aceita um objeto `OdontogramUiConfig` de `Signal`s/callbacks, todo campo opcional com o mesmo padrão upstream). Restrição atual: uma instância de `OdontogramUiService` por página (o motor é um singleton em nível de módulo). As superfícies podem ser montadas e desmontadas sob demanda. O próprio `OdontogramShellComponent` permanece inalterado — é exatamente essa composição no arranjo padrão, ainda conectando explicitamente cada campo a partir dos seus próprios inputs.

Para uma composição ainda mais fina, os cartões de controle individuais também são exportados:

| Componente | Seletor | Cobre |
|---|---|---|
| `StatusesCardComponent` | `aao-statuses-card` | Controles de status/predefinição de boca completa (Reset, dentição Primária/Mista, Edêntulo, extras de status) |
| `ToothDetailsCardComponent` | `aao-tooth-details-card` | Linha base (seleção/substrato do dente), checkboxes de coroa fraturada, alternâncias de coroa necessária/substituição |
| `CariesCardComponent` | `aao-caries-card` | Modo de profundidade de cárie, cárie subcoronária, severidade de cárie radicular, seletor de cárie por superfície |
| `FillingsCardComponent` | `aao-fillings-card` | Material de restauração, seletor de restauração por superfície + defeitos, notas de dica de subcárie/defeito |
| `RootPeriodontiumCardComponent` | `aao-root-periodontium-card` | Status pulpar/endodôntico, diagnóstico apical, reabsorção, mobilidade, status peri-implantar |
| `OrthodonticsCardComponent` | `aao-orthodontics-card` | Aparelho, deriva, movimento vertical, rotação |
| `SurfaceCrossComponent` | `aao-surface-cross` | O widget compartilhado de seleção em cruz B/M/O/D/L que os cartões de Cáries/Restaurações usam internamente |
| `DiagnosesCardComponent` | `aao-diagnoses-card` | Codificação de diagnóstico ICD-10/BNO-10/ICD-10-CM/SNOMED por dente — visualize os diagnósticos derivados de um dente e cure-os (suprima um derivado, adicione um que o gráfico não representa) |

Cada cartão é um componente declarativo autocontido que lê e grava a sessão compartilhada por meio de `inject(OdontogramUiService)` e do helper exportado `engineState()` (uma leitura de qualquer getter do motor que retorna um signal, mantida atualizada via o próprio barramento de notificação de mudanças do core). Monte apenas os cartões de que um determinado layout precisa, em qualquer arranjo, sob um único `OdontogramUiService`. O `CreditsModalComponent` (`aao-credits-modal`, o popup "Sobre e créditos" da barra superior) e o `CaseDiagnosesModalComponent` (`aao-case-diagnoses-modal`, o popup de diagnósticos de caso/regionais de boca completa) também são exportados, para hosts que queiram controlar qualquer um dos dois a partir do seu próprio estado de abertura/fechamento.

```ts
import { engineState, OdontogramUiService, getOdontogramSummary } from "angular-advanced-odontogram";

// Anywhere inside an injection context under an `OdontogramUiService`:
readonly summary = engineState(getOdontogramSummary); // Signal<OdontogramSummary>, kept fresh automatically
```

#### Pontos de injeção de dependência (DI) para testes no host

Dois `InjectionToken`s permitem que uma aplicação hospedeira sobrescreva, em seus próprios testes, chamadas do motor com efeitos colaterais (ambos recorrem à chamada real do motor em produção por padrão; ambos são `providedIn: "root"`):

| Token | Sobrescreve | Formato |
|---|---|---|
| `ODONTOGRAM_ENGINE_LIFECYCLE` | `initOdontogram()` / `destroyOdontogram()`, chamados a partir de `ngAfterViewInit()`/`ngOnDestroy()` do `OdontogramShellComponent` | `{ init: () => Promise<void>; destroy: () => void }` |
| `EXPORT_PDF_FN` | `exportPdf(opts)`, chamado a partir do `ExportOptionsModalComponent` ao clicar em "Exportar" | `(opts: PdfExportOptions) => Promise<void>` |

Ambos existem porque as funções reais tocam internamente o DOM/canvas/`jsPDF`, algo que um ambiente de teste headless não consegue fornecer por completo — sobrescreva-as via o array de providers do `TestBed` do Angular, nos próprios testes de componente da aplicação hospedeira.

#### Notas importantes e limitações atuais
- **Somente ESM** — o pacote publica um único módulo ES (construído com `ng-packagr`) mais sua entrada de declaração de tipos. Ele mira a resolução de módulos de bundler; não há build CommonJS.
- **A folha de estilos é separada** — você **precisa** registrar `angular-advanced-odontogram/styles.css` uma vez; ela não é injetada automaticamente. A estilização é CSS global com escopo sob `.odontogram-root` e controlada por variáveis CSS `--odon-*`.
- **SSR / somente cliente** — o componente lê o DOM na montagem, então precisa rodar no navegador; renderize-o apenas no lado do cliente.
- **Assets autocontidos** — os SVGs de dentes e ícones são embutidos (inline) no bundle em tempo de build (módulos TypeScript gerados, `npm run gen:assets`); não há **busca de asset em runtime** para configurar e nada extra a copiar para a pasta pública da sua aplicação.
- **Carregamento sob demanda** — apenas o inglês e a arte da anatomia dentária `classic` são embutidos no bundle inicial; as 11 outras tabelas de idioma de interface e a arte do perfil de anatomia `measured` são chunks lazy separados, buscados na primeira vez que um host alterna para eles (`[language]` / `I18nService.setLanguage()`/o menu de idioma, e `setToothAnatomy("measured")`/Settings → Odontogram → tooth anatomy, respectivamente). Essa divisão desta ressincronização reduziu o chunk principal do demo de 3.12 MB para 1.25 MB e o total inicial de 3.21 MB para 1.33 MB — nada a configurar do lado do host.
- **Uma instância por página** nesta versão — o estado do motor é um singleton em nível de módulo (assim como no original em React), então renderizar duas instâncias de `<aao-odontogram-shell>` na mesma página faria com que compartilhassem o estado de um único gráfico.

---

### ✨ Principais recursos
- 🖱️ Seleção rápida e seleção múltipla (CMD/CTRL + clique)
- 🦷 Tipos de dente: permanente, decíduo (de leite), implante, subgengival, ausente
- 🦷 Substrato dentário (ortogonal a qualquer restauração): natural, radix (resto radicular), fraturado, preparado para coroa
- 👑 Restaurações por tipo × material: coroa / inlay / onlay / faceta / ponte em e.max, ouro, gradia, zircônia, metal, metalo-cerâmica, telescópica ou provisória (onlay é apenas na vista oclusal) — escolhidas em um único seletor combinado de poucos cliques "Fix: Crown – …"; coroas `metal` legadas migram para `metal-ceramic` (PFM); implantes usam o mesmo modelo tipo × material, composto com uma camada de conector de implante. O seletor é limitado pelo tipo de dente: um implante oferece apenas coroa/ponte (mais suas cinco opções de attachment, abaixo); um dente ausente/vão oferece apenas um pôntico de ponte (mais prótese parcial/total removível); um substrato `radix` oculta o controle de restauração por completo (nenhuma restauração pode ser registrada em um resto radicular)
- 🦿 Próteses removíveis/attachments no eixo dedicado `prosthesis` (entradas "Kivehető:" no seletor combinado): cicatrizador de implante, locator, locator com overdenture, barra, barra com overdenture; prótese parcial ou total removível dento-suportada
- 🌉 Dentes de ponte renderizam tanto a capa da coroa quanto o conector em sela; uma sobreposição de vão de ponte multi-dente renderiza um conector contínuo e ciente da arcada ao longo de dentes de ponte consecutivos (pônticos + pilares) e dos vãos interdentários entre eles, incluída na exportação PNG/JPG/SVG
- 🔍 Registro de cáries em 6 superfícies: mesial, distal, vestibular, lingual, oclusal, subcoronária
- 🪥 Materiais de restauração por superfície: amálgama, resina composta, CIV (GIC), provisório
- 🏥 Um seletor unificado "Pulp / Endo status" (agrupado: polpa vital vs. tratado/endo): estados endodônticos (curativo, obturação de canal, obturação de canal incompleta, pino de fibra de vidro, pino metálico) e o diagnóstico pulpar da AAE (`pulpDx`: normal / pulpite reversível / irreversível / necrose) são mutuamente exclusivos — um dente tratado endodonticamente (`endo` definido) não pode carregar também um diagnóstico de polpa vital; ao tratar, `pulpDx` é normalizado para `normal`. Uma configuração opcional de detalhe pulpar em 3 níveis (`pulpDetailLevel`: simple / AAE / prático-latim) expõe 9 subtipos pulpares em latim prático via `pulpLatin`
- 🦴 Diagnóstico apical (`apicalDx`: periodontite apical sintomática/assintomática, abscesso apical agudo/crônico, osteíte condensante) controla o glifo periapical diretamente; um qualificador de subtipo de lesão granuloma/cisto é exibido apenas em periodontite apical sintomática/assintomática
- 🩹 Cartão unificado "Raiz e periodonto" (uma única seção recolhível para achados radiculares/periapicais e periodontais)
- ⚕️ Modificações: inflamação periapical (mostrada apenas em dentes ausentes/alvéolos de extração; oculta em dentes presentes e em implantes, onde `periImplant` a cobre), doença periodontal, graus de mobilidade (M1/M2/M3, ocultos em implantes)
- 🦷🔩 Estado peri-implantar (`periImplant`: none / mucosite / peri-implantite-leve / -moderada / -grave) — estadiamento do World Workshop 2018, mostrado como um seletor dedicado em implantes
- 🏷️ Indicadores especiais: coroa necessária, substituição de coroa necessária, vão fechado ausente, plano de extração, selante de fóssulas e fissuras, perda de ponto de contato
- 👁️ Alternâncias de visibilidade: vista oclusal, dentes do siso, osso e polpa
- 🔢 12 filtros de seleção (todos, presentes, permanentes, decíduos, implantes, ausentes, superior/inferior, anteriores/molares)
- 📊 Predefinições de estado prontas (reset, dentição decídua, dentição mista, edêntulo)
- 📦 22 modelos de restauração predefinidos (pontes, próteses removíveis, próteses tipo barra com implantes)
- 💾 Exportação/importação de estado em JSON (versão 2.22; a importação ainda aceita as versões legadas 1.4 e 2.0 até 2.21 e migra automaticamente, com estados personalizados de plugins e anotações por dente)
- 💽 Persistência opcional em localStorage (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — desativada por padrão; salva automaticamente o gráfico de status (e, opcionalmente, o gráfico de plano) com um limite de tamanho de 4 MB e erros de storage/parse encaminhados a um callback `onError` (ou `console.warn`) em vez de lançar exceção
- 🔗 Exportação HL7 FHIR R4 (Bundle collection de Observations por dente, codificação dentária ISO 3950 para a dentição permanente **e também** dentes decíduos (51-85, round-trip sem perda na importação), sistema de código local, mais uma sobreposição opcional de SNOMED CT (Settings → General → SNOMED CT)); um componente de cárie com uma severidade registrada também carrega uma codificação de sistema de pontuação — ICDAS em uma superfície primária (não restaurada), CARS em uma recorrente (restaurada)
- ✚ Interface de seleção de superfície em cruz/mais (B/M/O/D/L) para cáries e restaurações — `SurfaceCrossComponent`, exportado para layouts componíveis
- 🧱 Materiais de restauração por superfície (restaurações mistas, ex.: amálgama vestibular + resina composta distal)
- 🖼️ Exportação de imagem PNG/JPG/SVG do gráfico (baixável; PNG/JPG rasterizados a partir do SVG vetorial)
- 🦷 Cárie/subcárie é uma máquina de estados por superfície: uma superfície cariada sem restauração renderiza como cárie primária (opacidade escalonada por ICDAS); uma vez que uma restauração esteja presente naquela superfície, ela renderiza como cárie recorrente (pontuada por CARS) — as duas nunca estão ativas ao mesmo tempo na mesma superfície
- 🎯 Severidade unificada por superfície (`cariesSeverity`, 0–6): lida como profundidade ICDAS em uma superfície primária, como uma pontuação CARS nomeada (Hígido … Cavidade extensa) em uma recorrente, via um popup contextual que mostra apenas a escala relevante ao estado atual da superfície
- 🌱 Cárie radicular (`rootCaries`: none / ativa / paralisada / ativa-cavitada), acionando a camada de artwork dedicada de cárie radicular com opacidade orientada pela severidade
- 📡 Profundidade radiográfica de cárie (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 por superfície), independente da escala visual de severidade ICDAS/CARS, exibida como um badge e com round-trip por sua própria Observation FHIR
- 🎚️ Três configurações de granularidade de cárie (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) mais uma alternância `cariesDepthEnabled`, reduzindo cada escala a uma visão de seletor mais simples sem perder o valor armazenado
- 🩹 Linha-resumo de subcárie no painel de restaurações: lista qualquer dente selecionado com cárie recorrente e suas superfícies
- 🪛 Defeitos de restauração por superfície (`fillingDefect`: none / marginal / fratura / desgaste) em restaurações diretas, independentes da cárie recorrente
- 🦷💥 Desgaste dentário tipado por causa clínica e localização (`wearEdge`: none / atrição / erosão, incisal/oclusal; `wearCervical`: none / abrasão / abfração / erosão, cervical)
- 🎨 Descoloração dentária por causa (`discoloration`: none / tetraciclina / fluorose / não-vital / extrínseca / outra) em dentes permanentes e decíduos
- ✏️ Dentes anteriores (incisivos/caninos) rotulam sua superfície oclusal como "incisal" em toda a interface; a chave de superfície armazenada permanece `occlusal`
- 🔤 Notação de superfície ciente da posição (Settings → Tooth details → "Surface notation", simple/full, padrão full): no modo full a letra e o rótulo da superfície de cárie/restauração seguem a anatomia dentária — oclusal → I/incisal em dentes anteriores, vestibular → L/labial em dentes anteriores, lingual → P/palatina em dentes superiores e L/lingual em dentes inferiores
- 🦷↕️ Registro ortodôntico por dente (`orthoAppliance`: none / bracket / banda; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusão / intrusão; `orthoRotation`: booleano) em um dente natural presente (permanente ou decíduo)
- 🪨 Cálculo dentário e reabsorção radicular tipada como interna ou externa-cervical (`resorptionType`)
- 📏 Profundidade de cárie por superfície (superficial / dentina / profunda), ou pontuação ICDAS II opcional (0–6) via `enableIcdas`
- 🩹 Alternância de infiltração marginal de coroa, mostrada apenas para uma restauração de coroa ou ponte
- 🧬 Codificação de diagnósticos baseada em padrões (WHO ICD-10, sempre ativa): todo achado registrado deriva um diagnóstico codificado em ICD-10 — cárie (K02), cárie radicular/cementária e paralisada (K02.2/.3), pulpite e necrose pulpar (K04.0/.1), periodontite apical, abscesso periapical e cisto radicular (K04.4–.9), atrição/abrasão/erosão/abfração (K03.0–.8), cálculo (K03.6), reabsorção (K03.3), descoloração (K00.3/K00.8/K03.7), perda dentária (K08.1), resto radicular (K08.3) e fratura dentária (S02.5) — exportados como FHIR Conditions
- 🩺 Cartão de **Diagnósticos** por dente (`DiagnosesCardComponent`, `aao-diagnoses-card`): visualize os diagnósticos ICD-10 derivados de um dente e cure-os — suprima um derivado incorretamente ou adicione um que o gráfico não representa. O conjunto efetivo (derivado − suprimido + adicionado) direciona a exportação FHIR; cada linha mostra primeiro seu código (`K04.0 Pulpitis`) e as linhas são ordenadas por código; uma alternância **excluir** remove um diagnóstico da exportação FHIR sem tocar no gráfico, e um **apagar** (×) remove o diagnóstico *e* o achado subjacente
- 🗂️ **Diagnósticos de caso / regionais** (`CaseDiagnosesModalComponent`, `aao-case-diagnoses-modal`): diagnósticos de boca completa não vinculados a um único dente — má oclusão e ATM (K07), cistos orais (K09), doença de glândula salivar (K11), estomatite e mucosa oral (K12/K13) e anomalias de desenvolvimento em nível de arcada (K00) — cada um opcionalmente lateralizado (esquerdo/direito/bilateral), aberto pelo botão **Diagnoses** ao lado da alternância Odontogram/Periodontal-status
- 🌍 Pacotes de codificação nacionais (Settings → General → Sistema de codificação de diagnóstico): sobrepõe um sistema de código nacional à base WHO ICD-10 — BNO-10 (húngaro, títulos oficiais do NEAK; mantém o código WHO) ou ICD-10-CM dos EUA (códigos remapeados, ex.: a faixa dentofacial K07 → M26)
- 🔬 Sobreposição SNOMED CT (Settings → General → SNOMED CT, opcional, desativada por padrão): adiciona uma codificação SNOMED CT junto à codificação WHO e a qualquer pacote nacional, e codifica os achados peri-implantares que não têm código WHO ICD-10. Os IDs de conceito ICD-10-CM e SNOMED são de referência/melhor esforço — verifique contra a lista tabular oficial do ICD-10-CM / o navegador SNOMED CT antes de uso clínico
- 🔁 Round-trip de FHIR Condition: diagnósticos são exportados como recursos FHIR `Condition` (vinculados ao dente, mais condições de caso em nível de paciente com um bodySite de lateralidade) junto às Observations, e a importação os reconstrói — as condições de caso diretamente, e as sobrescritas de adicionar/suprimir por dente comparando as Conditions importadas com o gráfico re-derivado
- ✅ Exportação FHIR limpa para validadores HL7: toda entrada do Bundle carrega um `id` determinístico e uma `fullUrl` absoluta (sem placeholders `urn:uuid`), e o Bundle embute o próprio **CodeSystem** do motor para que seus códigos locais resolvam durante a validação; o mesmo CodeSystem mais os ValueSets gerados são publicados neste repositório em `projects/angular-advanced-odontogram/src/lib/fhir/` (passe `includeCodeSystem: false` nas opções de exportação FHIR para omiti-lo do Bundle)
- 🔄 Dados periodontais também fazem round-trip pela importação FHIR, não apenas pelo payload JSON: o importador lê os painéis periodontais LOINC 74029-0 de volta para cada dente — profundidade de sondagem, margem gengival (reconstruída a partir do CAL, de modo que valores de pseudobolsa sobrevivem), BOP, furca, placa de O'Leary, os índices PI/GI e mPI/mBI de implante e a largura de gengiva ceratinizada — além das Observations de evidência de status de tabagismo e HbA1c em nível de caso; a supuração é a única exceção e permanece somente em JSON
- 🧰 Linha de ícones unificada na barra superior com um diálogo de Configurações em abas (7 abas — General / Odontogram / Periodontal Chart / Tooth details / Caries / Fillings / Export — veja [Configurações](#-configurações) abaixo)
- 🦷🩺 Aba Settings → "Periodontal Chart": uma alternância de disponibilidade mais 16 alternâncias mostrar/ocultar por índice para as linhas do gráfico perio, cada uma com uma descrição, mais uma opção de exibição do nome do índice traduzido-vs-canônico
- 📋 Painel de informações do dente: resumo textual ao vivo de todo o gráfico (contagens de dentes, listas de presentes/ausentes, cáries incl. secundárias, restaurações, tratamentos de canal, próteses, implantes, estado periodontal) — mostrado por padrão, alternável em Settings
- 🗂️ Dropdown de Exportação consolidado (Status JSON / FHIR / PNG / JPG / SVG / relatório PDF), cada formato ocultável de forma independente via Settings → General
- 📥 Dropdown de Importação com importação FHIR (faz round-trip de Bundles exportados), ocultável de forma independente por origem
- ⏳ Overlay de progresso durante a exportação de imagem
- 🎓 Tour interativo de introdução (percurso guiado pelos controles da shell)
- 🔢 Três sistemas de numeração (FDI, Universal, Palmer)
- 🌐 I18n — 12 idiomas de interface (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) com um seletor de idioma; o árabe renderiza a interface da direita para a esquerda com os gráficos dentário/perio fixados da esquerda para a direita; apenas o idioma ativo é embutido no bundle principal — cada outro idioma é um chunk separado, buscado na primeira vez que é selecionado
- 🌗 Suporte a modo escuro com botão de alternância (autônomo ou controlado pela aplicação pai)
- 🎨 Configuração de tema personalizada (input `themeConfig`) com propriedades CSS personalizadas (`--odon-*`)
- 📱 UX de toque para dispositivos móveis: popover de tocar-para-zoom, menu de contexto por pressão longa, pinça-para-zoom, alvos de toque WCAG de 44px, navegação por alternância de arcada
- 🔌 Sistema de plugins SVG personalizados: injete sobreposições visuais, estado personalizado por dente, suporte a exportação/importação JSON — a saída de `renderSvg()` do plugin é sanitizada com DOMPurify (perfil SVG) antes da inserção no gráfico ao vivo; os plugins ainda rodam como código confiável, então carregue plugins apenas de fontes em que você confia
- ⚠️ Avisos de validação de estado para combinações incompatíveis de estado do dente
- 🏷️ Tooltip automático de estado nos ladrilhos de dente (mostra todos os estados ativos)
- 🩺 Tooltip por dente e painel de resumo de boca completa expondo o conjunto completo de achados clínicos (diagnóstico pulpar/apical, reabsorção radicular, estado peri-implantar, cárie radicular graduada, cálculo, infiltração marginal de coroa, fratura, perda de contato, desgaste incisal/cervical tipado)
- ♿ Acessibilidade por teclado (WCAG): papéis ARIA listbox/option, seleção com Enter/Espaço, navegação por setas, contornos focus-visible
- 🔒 Modo somente leitura: desativa todas as interações para casos de impressão/relatório/visualização
- ✨ Animações de seleção: borda tracejada pulsante e drop-shadow brilhante em dentes selecionados (com suporte a prefers-reduced-motion)
- 📝 Anotações por dente: clique duplo para adicionar/editar anotações, ícone de nota ao lado do número do dente, tooltip ao passar o mouse com o texto da nota, uma linha "Individual notes" no painel de resumo de boca completa, inclusão no relatório PDF, exportação/importação JSON
- 🔀 Divisão gráfico Status ↔ Plan: uma alternância `Status | Plan` troca entre um gráfico de **status** atual e um gráfico de **plano** (pós-tratamento pretendido), cada um com seus próprios estados de dente; a exportação/importação sempre mira o gráfico de status, enquanto o gráfico de plano é lido/escrito separadamente via sua própria API (veja [API pública](#-api-pública)) e — quando difere do status — é incluído como uma seção `plan` aditiva na exportação JSON
- 📝 Caixa "What changes": sempre que o plano difere do status atual, lista cada diferença por dente e por eixo de tratamento; também disponível programaticamente via `getPlanChanges()`
- 🅿️ Estilização proposta: no modo Plan, os achados que o plano **adiciona** em relação ao status atual renderizam com um contorno "proposto" tracejado e tingido, visualmente distinto
- 🚦 Gating do modo Plan: o gráfico Plan mostra apenas o que um dentista pode *fazer* — achados que só existem no status (cáries, desgaste dentário, descoloração e todo o bloco periodontal) ficam ocultos; restauração, prótese, ortodontia, necessidade/substituição de coroa e plano de extração permanecem planejáveis

![Gráfico periodontal de boca completa](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_en_perio.png)
*Captura de tela do projeto React original — o port em Angular renderiza a interface idêntica.*

- 🩺 Registro periodontal: **profundidade de sondagem**, **margem gengival**, **sangramento à sondagem** (+ supuração) por sítio, nos seis sítios padrão por dente, com **nível de inserção clínica derivado (CAL = PD + margem gengival)**, recessão e **%BOP** de boca completa. Um **gráfico perio gráfico de boca completa** — cada arcada desenhada como dois SVGs vestibular/palatino(lingual) separados, com uma **linha JEC** vermelha, uma grade guia milimétrica numerada e uma curva de margem gengival/profundidade de bolsa, dividida por uma banda central de índices perio carregando a **classe de Miller** e **Plaque/PI/GI/mPI/mBI** como ladrilhos em diamante anatômico por dente; entrada com auto-avanço por teclado; o gráfico escala dinamicamente para preencher a largura disponível. Apresentado como uma alternância de visão `Odontogram | Periodontal Status`, e ainda invocável separadamente via o `PerioChartComponent` exportado. Exportação **FHIR** por sítio via o painel periodontal LOINC (`74029-0`; PD `32910-2`, recessão `32911-0`, CAL `32912-8`)
- 🧪 Uma extensa suíte de testes automatizados (veja [Testes](#-testes)) cobrindo numeração, traduções, predefinições, i18n, a shell, tema, toque, plugins, acessibilidade e paridade de eixo-clínico/diagnóstico em relação ao corpus React congelado
- 📖 Documentação de API em TypeDoc com comentários JSDoc em todos os exports públicos (`npm run docs`)

### 📦 Módulos
- 🦷 Grade do odontograma e interface do ladrilho de dente (`OdontogramChartSurfaceComponent`)
- 🎛️ Controles e painel de status (`ToothControlsSurfaceComponent` + os 8 cartões declarativos)
- 🎨 Motor de camadas SVG e modelos (core sem dependência de framework, `core/odontogram.ts`)
- 🔢 Numeração de dentes e mapeamento de rótulos (FDI/Universal/Palmer, `core/utils/numbering.ts`)
- 🌐 Localização — 12 idiomas de interface (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), incluindo árabe (RTL) (`core/i18n/`, `I18nService`)
- 💾 Exportação/importação de estado
- 📋 Extras de status: modelos de restauração predefinidos
- 🎨 Configuração de tema: paleta de cores personalizável via propriedades CSS `--odon-*`
- 📱 Interações de toque para dispositivos móveis (tocar-para-zoom, pressão longa, pinça-para-zoom, alternância de arcada)
- 🔌 Sistema de plugins SVG personalizados
- ⚠️ Sistema de validação de estado e tooltip
- ♿ Acessibilidade por teclado e suporte ARIA
- 🔒 Modo somente leitura
- ✨ Animações de seleção
- 📝 Sistema de anotações por dente
- 🧱 **Interface componível** — `OdontogramUiService`, o helper `engineState()`, 4 superfícies de apresentação e 8 cartões de controle declarativos, todos exportados de forma independente (veja [Superfícies componíveis](#-usar-como-pacote-npm) acima)
- 🧪 Suíte de testes automatizados (corpus Vitest + `ng test`, veja [Testes](#-testes))

### 🛠️ Controles da interface

**🔝 Barra superior** (`OdontogramTopbarComponent`):
- Seletor de idioma (dropdown HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR)
- Botão de alternância de modo escuro (ícone sol/lua, alterna entre tema claro e escuro)
- Seletor de sistema de numeração (dropdown FDI/Universal/Palmer)
- Botões Export Status / Import Status
- Settings (ícone de engrenagem), Credits/About (ícone de informação), link do GitHub

**📊 Cabeçalho do gráfico:**
- Alternância de vista oclusal
- Alternância de visibilidade dos dentes do siso
- Alternância de visibilidade do osso
- Alternância de visibilidade da polpa
- Botão de limpar seleção

**🔍 Filtros de seleção:**
- Select All / All Present / Permanent / Milk / Implants / All Missing
- Select Upper / Upper Front 6 / Upper Molars
- Select Lower / Lower Front 6 / Lower Molars

**📋 Predefinições de status:**
- Reset All (resetar a boca)
- Primary Dentition (dentição decídua)
- Mixed Dentition (dentição mista)
- Alternância Edentulous (edêntulo)

**📦 Dropdown de extras de status:**
- Pontes de zircônia superior/inferior (12-22, 13-23, 16-26, arcada completa)
- Pontes de metal superior/inferior (12-22, 13-23, 16-26, arcada completa)
- Próteses parciais removíveis superior/inferior
- Próteses totais removíveis superior/inferior
- Próteses tipo barra com implantes superior/inferior

**🦷 Painel de edição do dente** (`ToothControlsSurfaceComponent`, para o(s) dente(s) selecionado(s), agrupado em cartões recolhíveis):
- **Cartão de status:** predefinições de boca completa e extras de status (mostrado/ocultado de forma independente via `showStatusCard`)
- **Cartão de detalhes do dente:** seleção do dente (tipo base incl. variantes de coroa fraturada), substrato do dente, o dropdown combinado de restauração "Fix: …" / "Kivehető: …", checkbox de infiltração marginal de coroa, checkboxes de localização da coroa fraturada, alternâncias coroa necessária / substituição de coroa necessária
- **Cartão de ortodontia:** aparelho, deriva mesial/distal, movimento vertical, alternância de rotação — mostrado em um dente natural presente (mostrado/ocultado de forma independente via `showOrthoCard`)
- **Cartão de cáries:** dropdown de modo de profundidade de cárie, checkbox de cárie subcoronária, dropdown de severidade de cárie radicular e o seletor de cárie por superfície B/M/O/D/L (`SurfaceCrossComponent`) com um popup contextual de profundidade ICDAS/CARS e um badge de profundidade radiográfica
- **Cartão de restaurações:** dropdown de material de restauração, seletor de restauração por superfície, indicador de defeito de restauração por superfície, notas de dica de subcárie e de defeito de restauração
- **Cartão de raiz e periodonto:** seletor unificado "Pulp / Endo status", seletor de diagnóstico apical, seletor de subtipo de lesão periapical, seletor de tipo de reabsorção radicular, seletor de grau de mobilidade, seletor de estado peri-implantar (apenas implantes)
- **Indicadores especiais:** plano/ferida de extração, vão fechado ausente, selante de fissuras, perda de ponto de contato, cálculo, pino parapulpar, ressecção endodôntica, pilar de ponte

### 🦷 Tipos e estados de dente

**Seleção do dente (tipo base):**
| Valor | Descrição |
|---|---|
| `none` | Dente ausente |
| `tooth-base` | Dente permanente |
| `milktooth` | Dente decíduo (de leite) |
| `implant` | Implante dentário |
| `tooth-under-gum` | Dente subgengival (não irrompido) |

**Variantes de dente fraturado:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Substrato do dente (dentes permanentes):**
`natural` (padrão), `radix` (resto radicular), `broken`, `crownprep` (preparado para coroa)

**Tipo de restauração (dentes permanentes):**
`none`, `crown`, `inlay`, `onlay` (apenas vista oclusal), `veneer`, `bridge`

**Material de restauração (dentes permanentes):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (coroas `metal` legadas migram para cá), `telescope`, `temporary`

**As opções de restauração são condicionadas pelo tipo de dente** (`restorationOptions()` em `projects/angular-advanced-odontogram/src/lib/core/registry/restorations.ts`): um implante oferece apenas os tipos de restauração `crown`/`bridge` (compostos com uma camada de conector de implante) mais as cinco entradas de attachment de `prosthesis` abaixo; um dente ausente/vão oferece apenas um pôntico `bridge` mais as duas entradas de prótese removível de `prosthesis`; um substrato `radix` oculta o controle de restauração por completo.

**Prótese** (`prosthesis`; eixo removível/attachment ortogonal, exibido como entradas "Kivehető:" no dropdown de restauração combinado):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (attachments de implante, com ou sem uma overdenture), `removable-partial`, `removable-full` (próteses dento-suportadas em um dente ausente/vão). Um dente tem ou uma restauração fixa ou uma prótese, nunca ambas — definir uma limpa a outra.

**Infiltração marginal de coroa** (`crownLeakage`; booleano): mostrada apenas quando `restorationType` é `crown` ou `bridge`.

**Opções endodônticas (dentes permanentes):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opções endodônticas (dentes decíduos):**
`none`, `endo-medical-filling`

`endo` e `pulpDx` são exibidos através de um único seletor unificado "Pulp / Endo status" (agrupado: polpa vital vs. tratado/endo) e são mutuamente exclusivos — escolher uma opção tratada (`endo != none`) reseta `pulpDx` para `normal` e escolher um diagnóstico pulpar reseta `endo` para `none`.

**Materiais de restauração (dentes permanentes):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiais de restauração (dentes decíduos):**
`composite`, `gic`, `temporary`

**Superfícies de restauração/cárie:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (apenas cárie)

**Modificações:**
`inflammation` (periapical), `parodontal` (periodontal), `mobility` (M1/M2/M3)

**Tipo de lesão periapical** (`periapicalType`; qualifica o glifo periapical, mostrado apenas em periodontite apical sintomática/assintomática):
`none`, `granuloma`, `cyst` — o valor legado `abscess` ainda é aceito/armazenado mas não é mais oferecido no seletor

**Diagnóstico pulpar** (terminologia AAE; `pulpDx`):
`normal`, `reversible-pulpitis`, `irreversible-pulpitis`, `necrosis` — mutuamente exclusivo com `endo`

**Diagnóstico pulpar, latim prático** (`pulpLatin`; mostrado pelo seletor de polpa apenas quando `pulpDetailLevel` é `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Nível de detalhe pulpar** (`pulpDetailLevel`, configuração global): `simple`, `aae` (padrão), `latin`

**Diagnóstico apical** (`apicalDx`; controla o glifo periapical):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Tipo de reabsorção radicular** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Estado peri-implantar** (`periImplant`; apenas implantes, estadiamento do World Workshop 2018):
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Severidade de cárie** (`cariesSeverity`; campo unificado por superfície, `0`–`6`): em uma superfície sem restauração é lida como a escala de profundidade de cárie ICDAS (`superficial` / `dentin` / `deep`, ou os códigos brutos ICDAS II `0–6` quando `enableIcdas` está ativo); em uma superfície com restauração é lida como uma pontuação CARS nomeada (`0` hígido … `6` cavidade extensa)

**Cárie radicular** (`rootCaries`): `none`, `active`, `arrested`, `active-cavitated`

**Profundidade radiográfica de cárie** (`radiographicDepth`; por superfície): `none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Configurações de granularidade de cárie** (globais): `secondaryCariesMode` (`simple`/`standard`/`full`, padrão `standard`), `rootCariesMode` (`simple`/`severity`, padrão `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, padrão `off`), `cariesDepthEnabled` (booleano, padrão `true`)

**Indicadores especiais:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Desgaste dentário** (`wearEdge`, `wearCervical`; tipo clínico por localização, condicionado a tooth-base + sem restauração + substrato natural):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Descoloração** (`discoloration`; causa por dente, condicionada a um tooth-base natural ou dente decíduo + sem restauração + substrato natural):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Defeito de restauração** (`fillingDefect`; por superfície, achado de restauração direta independente da cárie recorrente):
`none`, `marginal`, `fracture`, `wear`

**Ortodontia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; por dente, condicionado a um dente natural presente):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion`, `intrusion` — `orthoRotation`: booleano

**Configurações de detalhe / notação do dente** (configurações globais de sessão, Settings → Tooth details): `wearDetailLevel` e `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, padrão `complex`) e `surfaceNotation` (`simple`/`full`, padrão `full`)

### ⚙️ Configurações

Aberto pelo ícone de engrenagem da barra superior (`SettingsModalComponent`); um `dialog` ARIA com foco preso e layout em 7 abas (Esc/clique no fundo para fechar, setas para trocar de aba). O diálogo é uma view pura sobre um `SettingsState` fornecido pelo host — ele mesmo não possui nenhum estado de configuração. Todas as configurações são apenas estado de interface em nível de sessão, salvo indicação contrária — nenhuma delas altera dados por dente ou o payload de exportação.

- **General:** sistema de numeração (FDI/Universal/Palmer), idioma, tema claro/escuro, disponibilidade de exportação por formato (PNG/JPG/SVG/PDF — oculta o item de menu de Exportação correspondente quando desligado, e desativa a aba Export quando o PDF está desligado), disponibilidade de importação por origem (Status JSON/FHIR), sistema de codificação de diagnóstico (none / BNO-10 / ICD-10-CM) e uma alternância opcional de sobreposição SNOMED CT
- **Odontogram:** layout na tela — espaçamento entre dentes, tamanho do número do dente, cor de seleção e estilo de borda; visibilidade do painel de informações do dente; disponibilidade do modo Plan; perfil de anatomia dental (`classic` padrão / `measured` — nove modelos de dentes medidos pela literatura em um layout de dois arcos com largura por dente, alternável em tempo de execução; sua arte é um chunk lazy separado, buscado apenas quando você alterna para ele, de modo que o padrão classic não custa nada extra); visibilidade do cartão de Statuses e do cartão de Orthodontics
- **Periodontal Chart:** uma alternância de disponibilidade que condiciona o resto da aba e os pontos de entrada perio na shell; modo de visão perio (`toggle`/`popup`); 16 alternâncias mostrar/ocultar por índice em 5 grupos (Pocket: PD/GM/CAL/BOP · Hygiene: Plaque/PI/GI · Mucogingival: visibilidade da JEC/Concavidade radicular/KG/GT · Support: Furca/Mobilidade/Classe de Miller · Peri-implant: mPI/mBI); um modo de exibição de nome de índice traduzido-vs-canônico (canônico = um nome científico fixo em inglês/latim em todos os idiomas da interface; os tooltips permanecem sempre localizados)
- **Tooth details:** nível de detalhe pulpar (simple/AAE/latim prático, padrão AAE), nível de detalhe de desgaste e nível de detalhe de descoloração (simple/complex, cada um padrão complex), notação de superfície (simple/full, padrão full), alternância de anotações por dente
- **Caries:** alternância de pontuação ICDAS II, alternância de profundidade de cárie, granularidade de cárie radicular (simple/severity), granularidade secundária/CARS (simple/standard/full), granularidade de profundidade radiográfica (off/threeLevel/detailed)
- **Fillings:** complexidade de restauração (complex/simple), alternância de achados de defeito de restauração, disponibilidade por material (amalgam/composite/gic/temporary), alternância de selante de fissuras
- **Export:** a configuração completa do relatório PDF (`PdfSettings` — veja [Exportação](#-exportação) abaixo) — desativada (recorrendo ao conteúdo da aba General) sempre que a exportação PDF estiver desligada na aba General

### 🖼️ Sistema de modelos SVG

**Modelos de dente** (em `projects/angular-advanced-odontogram/src/lib/core/assets/teeth-svgs/`):
| Modelo | Dentes que o usam |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisivos) |
| `13.svg` | 13, 23, 33, 43 (caninos) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (pré-molares) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molares) |

Os modelos são rotacionados 180 graus para a arcada inferior e espelhados horizontalmente para o lado esquerdo. Uma subpasta paralela `measured/` contém os nove modelos de dentes medidos pela literatura que o perfil de anatomia `measured` renderiza em um layout de dois arcos com largura por dente (Settings → Odontogram → tooth anatomy).

**SVGs de ícones** (em `projects/angular-advanced-odontogram/src/lib/core/assets/icon-svgs/`):
`icon_8.svg` (siso), `icon_gum.svg` (osso), `icon_no_selection.svg` (limpar), `icon_occl.svg` (vista oclusal), `icon_pulp.svg` (polpa)

Ambas as pastas são compiladas em módulos TypeScript gerados (`core/generated/teeth-svgs.ts`, `core/generated/icon-svgs.ts`) via `npm run gen:assets` — execute isso depois de editar um SVG de origem para que as strings inline empacotadas permaneçam sincronizadas.

### 🔢 Sistemas de numeração

**FDI (ISO 3950):** Dentes adultos 11-18, 21-28, 31-38, 41-48. Dentes decíduos 51-55, 61-65, 71-75, 81-85. Valor: `"FDI"`.

**Universal (EUA):** Dentes adultos numerados 1-32. Dentes decíduos com letras A-T. Valor: `"UNIVERSAL"`.

**Palmer (Zsigmondy-Palmer):** Formato quadrante + posição (ex.: UR-1, LL-5). Dentes decíduos usam letras A-E por quadrante. Valor: `"PALMER"`.

`NumberingSystem` (`core/utils/numbering.ts`) é exatamente a união `"FDI" | "UNIVERSAL" | "PALMER"`; o `toLabel(fdiTooth, system)` exportado converte um número de dente FDI para o rótulo do sistema solicitado (ex.: `toLabel(14, "PALMER")` → `"UR-4"`).

### 🚀 Uso
Desenvolvimento (executa a aplicação demo):
```bash
npm install
npm start           # ng serve
```
Compilar a biblioteca:
```bash
npm run build:styles && npx ng build angular-advanced-odontogram
```
Compilar a aplicação demo:
```bash
npm run build:demo
```

### 🔗 Integração
O componente pode ser incorporado em qualquer aplicação Angular:
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

**Integração do modo escuro:**
- **Modo autônomo:** Omita `darkMode` — o componente gerencia seu próprio estado de tema via o botão de alternância na barra superior e adiciona/remove a classe `.dark` no elemento raiz do host.
- **Modo controlado:** Vincule `[darkMode]` e `(darkModeChange)` — a aplicação pai controla o tema. O botão de alternância ainda aparece, mas emite `darkModeChange` em vez de gerenciar estado interno. A aplicação pai é responsável por adicionar/remover a classe `.dark` no `<html>`.

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

**Integração de plugins:**
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

A saída de `renderSvg()` do plugin é sanitizada com DOMPurify (perfil SVG) antes da inserção no gráfico ao vivo — veja [Notas de segurança](#-notas-de-segurança).

### 🧪 Testes

A suíte é dividida em **dois runners**, e ambos precisam passar (`npm test` executa os dois, em sequência):

```bash
npm run test:corpus   # plain Vitest — the shared clinical-engine core
npm run test:ng       # Angular's Vitest builder — the Angular shell (ng test)
npm test              # both, in order
npm run test:watch    # watch mode (corpus runner)
```

- **`test:corpus`** (`vitest run`) exercita `projects/angular-advanced-odontogram/src/lib/core/` — o core do motor clínico compartilhado — contra o corpus de testes portado (mais de 100 arquivos spec sob `core/__tests__/`). É aqui que vivem as **golden fixtures** de renderização SVG, exportação FHIR e round-trip JSON, checadas byte a byte: `parity/svg-fingerprints.json`, `parity/fhir-golden.json`, `parity/roundtrip-golden.json`, `parity/shell-dom-golden.html`.
- **`test:ng`** (`ng test angular-advanced-odontogram --watch=false`, a integração Vitest do `@angular/build:unit-test` do Angular) executa os próprios specs `*.spec.ts` da shell Angular — componentes, serviços, diretivas — verificando paridade de DOM: a shell renderiza os mesmos ids, classes e marcação que os componentes React originais.

Como a integração Vitest desse builder não suporta `vi.mock()`/`vi.spyOn()` para mock de módulos por caminho relativo, os efeitos colaterais que tocam o DOM (`initOdontogram`/`destroyOdontogram`, `exportPdf`) são sobrescritos, em vez disso, via os tokens de injeção `ODONTOGRAM_ENGINE_LIFECYCLE`/`EXPORT_PDF_FN` e o array de providers do `TestBed` do Angular — veja [Pontos de injeção de dependência (DI) para testes no host](#-usar-como-pacote-npm) acima.

### 📖 Documentação da API
```bash
npm run docs           # Generate TypeDoc docs in docs/api/
```
A API do motor clínico compartilhado também está documentada no projeto original:

📚 **https://zoliqua.github.io/React-Advanced-Odontogram/**

### 📡 API pública

**Inputs/outputs do componente:** veja [Inputs do componente](#-usar-como-pacote-npm) acima para a tabela completa.

**Funções exportadas para controle externo** (subconjunto selecionado — a superfície completa e tipada está no `.d.ts` incluído no pacote):

| Função | Descrição |
|---|---|
| `initOdontogram()` / `destroyOdontogram()` | Inicializa/limpa o motor (chamado internamente por `OdontogramShellComponent`/`OdontogramUiService` via o token `ODONTOGRAM_ENGINE_LIFECYCLE`) |
| `setNumberingSystem(system)` | Alterna entre FDI, UNIVERSAL, PALMER |
| `clearSelection()` | Deseleciona todos os dentes |
| `getSelectedTeeth()` | Dentes atualmente selecionados (números FDI), na ordem de seleção |
| `registerPlugins(plugins)` | Registra plugins SVG personalizados |
| `setPluginState(toothNo, pluginId, value)` / `getPluginState(toothNo, pluginId)` | Define/obtém o estado personalizado de um plugin para um dente |
| `getToothStateSummary(toothNo)` | Obtém o resumo localizado de todos os estados ativos |
| `getOdontogramSummary()` | Obtém um resumo textual estruturado e localizado de todo o gráfico (contagens, seções, alterações planejadas) |
| `onStateChange(callback)` | Assina mudanças de estado; retorna uma função de cancelamento |
| `setReadOnly(value)` / `getReadOnly()` | Habilita/desabilita / consulta o modo somente leitura |
| `setNotesEnabled(value)` / `getNotesEnabled()` | Habilita/desabilita / consulta as anotações por dente |
| `setPulpDetailLevel(level)` / `getPulpDetailLevel()` | Define/obtém o vocabulário do seletor de polpa — `"simple"`, `"aae"` ou `"latin"` |
| `getToothAnatomy()` / `setToothAnatomy(v)` | Obtém/define o perfil de anatomia dental — `"classic"` ou `"measured"` |
| `getChartMode()` / `setChartMode(mode)` | Obtém/alterna o gráfico ativo — `"status"` ou `"plan"` (o gráfico de plano é copiado em profundidade do status na primeira vez que é acessado) |
| `getStatusChart()` / `getPlanChart()` / `setPlanChart(payload)` | Lê os payloads do gráfico de status/plano independentemente do gráfico ativo, ou substitui os dentes do gráfico de plano |
| `getPlanChanges()` | Obtém o diff estruturado status→plan (`{ toothNo, axis, from, to }[]`) |
| `setPerioSite(toothNo, site, patch)` / `getToothPerio(toothNo)` | Define/obtém dados periodontais para um dos seis sítios (`patch` = `{ pd?, gm?, bop?, sup? }`) |
| `getToothCal(toothNo)` | Obtém o CAL derivado por sítio para um dente |
| `getPerioSummary()` | Agregados periodontais de boca completa: contagem de sítios registrados, contagem de sangramento, %BOP, pior CAL, PD máximo |
| `getPerioChart()` | Obtém os registros periodontais por dente do gráfico ativo |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Abre/fecha/consulta programaticamente a sobreposição do gráfico perio |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Obtém/define como o gráfico perio é exibido — `"toggle"` ou `"popup"` |
| `getPerioClassification()` | Obtém a classificação periodontal do World Workshop 2017 (`{diagnosis, stage, grade, extent, derived, overridden}`) |
| `setDiagnosisOverride(v)` / `setStageOverride(v)` / `setGradeOverride(v)` / `setExtentOverride(v)` | Sobrescreve um eixo derivado da classificação periodontal, ou `null` para reverter ao derivado |
| `getCaseMeta()` / `resetCaseMeta()` | Obtém/reseta o objeto de metadados em nível de caso (idade, status de tabagismo/diabetes, identidade do paciente, data do exame, …) |
| `setPatientName(v)` / `setPatientDob(v)` / `setExamDate(v)` | Define os campos de identidade do caso (apenas cabeçalho do relatório PDF — nunca fazem parte da exportação FHIR) |
| `getToothDiagnoses(toothNo)` | Obtém os diagnósticos codificados em ICD-10 de um dente, conforme derivados pelas regras do eixo clínico |
| `getActiveDiagnoses()` | Obtém as linhas de diagnóstico efetivas (derivado − suprimido + adicionado) para o dente atualmente selecionado, mais o catálogo de diagnósticos adicionáveis — o view-model do `DiagnosesCardComponent` |
| `addDiagnosisToSelection(key)` / `removeDiagnosisFromSelection(key)` | Adiciona/remove um diagnóstico para a seleção de dente atual escrevendo no achado de gráfico subjacente |
| `setDxOverrideForSelection(key, mode)` | Força uma sobrescrita de diagnóstico na seleção atual — `"add"`, `"suppress"`, ou `null` para limpar |
| `getDiagnosisCodingPack()` / `setDiagnosisCodingPack(id)` | Obtém/define a sobreposição de pacote de codificação nacional sobre o WHO ICD-10 — `"none"`, `"bno10"` (títulos húngaros do NEAK) ou `"icd10cm"` (EUA) |
| `getSnomedEnabled()` / `setSnomedEnabled(v)` | Obtém/define a sobreposição opcional de codificação SNOMED CT |
| `getCaseConditions()` / `setCaseCondition(key, laterality)` | Obtém/define diagnósticos de caso/regionais de boca completa (má oclusão e ATM, cistos orais, doença de glândula salivar, estomatite e mucosa oral, anomalias de desenvolvimento em nível de arcada), cada um com uma lateralidade — `null` limpa, ou `"left"`/`"right"`/`"bilateral"` |
| `exportFhir(options?)` | Exporta o gráfico como um Bundle collection HL7 FHIR R4 (download JSON); referência `{ subject }` opcional |
| `importFhirBundle(input)` | Importa um Bundle FHIR R4 (objeto ou string JSON) produzido por este módulo |
| `exportImage(format)` | Baixa o gráfico como uma imagem — `"png"` ou `"jpg"` |
| `exportSvg()` | Baixa o gráfico como um SVG escalável (vetorial) |
| `hasAnyPerioData()` | `true` se e somente se algum eixo periodontal estiver registrado em qualquer lugar da boca |
| `exportPerioSvg()` / `exportPerioImage(format)` | Baixa o gráfico periodontal completo como um SVG vetorial autônomo ou uma imagem rasterizada |
| `exportPdf(opts)` | Baixa um relatório PDF nativo em jsPDF (veja [Exportação](#-exportação) abaixo) |
| `getPdfSettings()` / `setPdfSettings(patch)` | Obtém/altera parcialmente a configuração do relatório PDF (`PdfSettings`) |
| `exportStatus()` | Baixa o gráfico de status como JSON |
| `importStatus(data)` | Hidrata o motor a partir de um payload JSON exportado anteriormente (veja [Formato de exportação/importação de status](#-formato-de-exportaçãoimportação-de-status)) |
| `setImportFormat(format)` | Define o parser da próxima importação de arquivo — `"status"` ou `"fhir"` |
| `startIntroTour()` | Inicia o tour interativo de introdução |

### 💾 Persistência de estado (localStorage)

Persistência opcional em `localStorage` para o estado de caso do odontograma (`core/persistence.ts`, reexportado do ponto de entrada do pacote). Desativada por padrão — integrações existentes não são afetadas a menos que uma aplicação hospedeira a habilite explicitamente, e deve ser chamada **após** o odontograma ter sido montado (por exemplo, a partir do `ngAfterViewInit()` de um componente, depois que `OdontogramShellComponent`/`OdontogramUiService` tiver chamado `init()` — a restauração repinta o DOM ao vivo via `importStatus()`):

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

| Função | Descrição |
|---|---|
| `enablePersistence(options?)` | Restaura um caso salvo anteriormente (se houver) via `importStatus()`, depois salva o gráfico de status no `localStorage` a cada mudança de estado assentada (as edições são agrupadas em lotes ao longo de uma janela curta de tempo — cerca de 400 ms, a técnica de "debounce" — de modo que uma rajada de mudanças, como uma predefinição de status, produza uma única gravação). Idempotente — chamá-la novamente substitui a assinatura/opções anteriores. **Deve ser chamada após o odontograma ter sido montado.** |
| `disablePersistence()` | Para de persistir (antes disso, força a gravação de qualquer salvamento pendente ainda represado por essa janela de agrupamento); a entrada armazenada é deixada no lugar. |
| `clearPersistedState()` | Remove a entrada armazenada para a chave ativa (ou padrão). |
| `isPersistenceEnabled()` | `true` enquanto uma assinatura de mudança de estado estiver ativa. |

**`PersistenceOptions`:**

| Campo | Tipo | Padrão | Descrição |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | A chave do `localStorage` — este é o próprio padrão literal do módulo core compartilhado (inalterado pelo port em Angular); passe sua própria `key` para evitar colisão com uma integração do lado React na mesma origem, ou para separar múltiplos hosts por namespace. |
| `includePlan` | `boolean` | `false` | Também persiste o gráfico de plano (o campo `plan` do payload). |
| `onError` | `(err: Error) => void` | — | Chamado em qualquer erro de storage/parse em vez de `console.warn`. |

Notas: nada é lido de ou escrito no `localStorage` a menos que `enablePersistence()` seja chamada; um limite de tamanho de 4 MB pula um salvamento excessivamente grande (reportado via `onError`/`console.warn`) em vez de lançar exceção; toda falha de storage/JSON — cota excedida, um iframe bloqueado, dados armazenados corrompidos ou não reconhecidos, etc. — é capturada e reportada. Este módulo nunca lança exceção.

Nota: habilitar a persistência restaura o caso salvo via `importStatus()`, que substitui o caso atual — incluindo um gráfico de plano em andamento, caso o payload salvo não tenha nenhum. Habilite a persistência na inicialização (logo após a montagem), não no meio da sessão.

Nota: o payload persistido pode incluir dados de caso que identificam o paciente (nome do paciente, data do exame) em texto simples no `localStorage`. Se você registrar tais dados, garanta proteção em nível de dispositivo ou limpe-os com `clearPersistedState()` quando apropriado.

### 💾 Formato de exportação/importação de status
A exportação cria um arquivo JSON (versão `2.22`; a importação também aceita as versões legadas `1.4` e `2.0` até `2.21` e migra automaticamente) contendo:

**Campos globais:**
- `wisdomVisible` - dentes do siso visíveis
- `showBase` - camada de osso visível
- `occlusalVisible` - vista oclusal ativa
- `showHealthyPulp` - polpa saudável visível
- `edentulous` - modo edêntulo ativo

**Campos por dente (32 dentes):**
- `toothSelection` - tipo base do dente
- `toothSubstrate` - substrato do dente (natural/radix/broken/crownprep), ortogonal a qualquer restauração
- `restorationType` - tipo de restauração (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - material de restauração (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), pareado com `restorationType`
- `prosthesis` - eixo removível/attachment (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), mutuamente exclusivo com um `restorationType` fixo de crown/bridge
- `crownLeakage` - flag de infiltração marginal de coroa, significativa apenas quando `restorationType` é crown ou bridge
- `endo` - estado endodôntico; mutuamente exclusivo com `pulpDx`
- `mods` - array de modificações (inflammation, parodontal); `inflammation` aplica-se apenas a dentes ausentes/alvéolos de extração
- `caries` - superfícies de cárie ativas
- `cariesActiveDepth` - o valor de profundidade ICDAS preparado pelo seletor de profundidade de cárie quando uma nova superfície é aplicada
- `rootCaries` - severidade de cárie radicular (none/active/arrested/active-cavitated)
- `cariesSeverity` - severidade unificada por superfície (0-6): profundidade ICDAS em uma superfície primária (não restaurada), pontuação CARS em uma superfície recorrente (restaurada)
- `radiographicDepth` - profundidade radiográfica de cárie por superfície (none/E1/E2/D1/D2/D3), independente da escala visual ICDAS/CARS
- `fillingMaterial` - material de restauração
- `fillingSurfaces` - superfícies restauradas
- `fillingSurfaceMaterials` - material de restauração por superfície (restaurações mistas, ex.: amálgama vestibular + resina composta distal)
- `fillingDefect` - defeito de restauração por superfície (none/marginal/fracture/wear), condicionado a superfície restaurada, independente da cárie recorrente
- `pulpDx` - diagnóstico pulpar AAE (normal/reversible-pulpitis/irreversible-pulpitis/necrosis)
- `pulpLatin` - subtipo pulpar em latim prático (mostrado pelo seletor de polpa apenas quando `pulpDetailLevel` é `latin`)
- `apicalDx` - diagnóstico apical que controla o glifo periapical
- `periapicalType` - subtipo de lesão periapical (none/granuloma/cyst); `abscess` legado ainda aceito na importação
- `resorptionType` - tipo de reabsorção radicular (none/internal/external-cervical)
- `periImplant` - estado peri-implantar apenas em implantes (none/mucositis/peri-implantitis-mild/-moderate/-severe), estadiamento do World Workshop 2018
- `dxOverrides` - sobrescritas de codificação de diagnóstico por dente (versão 2.21): um objeto chaveado por chave de diagnóstico ICD-10 → `add` | `suppress`, forçando um diagnóstico codificado a ligado apesar de nenhum achado de gráfico correspondente, ou desligado apesar de um existir; molda o conjunto codificado efetivo exportado como FHIR `Condition`s
- `endoResection` - flag de apicectomia
- `fissureSealing` - flag de selante de fissuras
- `calculus` - flag de cálculo
- `contactMesial` / `contactDistal` - perda de ponto de contato mesial/distal
- `wearEdge` - tipo de desgaste incisal/oclusal (none/attrition/erosion)
- `wearCervical` - tipo de desgaste cervical (none/abrasion/abfraction/erosion)
- `discoloration` - causa de descoloração por dente (none/tetracycline/fluorosis/nonvital/extrinsic/other)
- `orthoAppliance` - aparelho ortodôntico (none/bracket/band)
- `orthoDrift` - deriva ortodôntica (none/mesial/distal)
- `orthoVertical` - movimento vertical ortodôntico (none/extrusion/intrusion)
- `orthoRotation` - flag de rotação ortodôntica
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - localizações de fratura
- `extractionWound` - ferida pós-extração
- `extractionPlan` - extração planejada
- `parapulpalPin` - flag de pino parapulpar
- `bridgePillar` - dente pilar de ponte
- `mobility` - grau de mobilidade (none/m1/m2/m3)
- `crownNeeded` - indicador de coroa necessária
- `crownReplace` - indicador de substituição de coroa necessária
- `missingClosed` - vão fechado após extração
- `customStates` - estados personalizados de plugin (objeto, chaveado por ID de plugin)
- `note` - nota textual por dente (string, opcional — presente apenas quando não vazia)

**Campo `plan` de nível superior (versão 2.11+):**
- `plan` - objeto opcional, mesmo formato de `teeth` (campos por dente acima), contendo o gráfico de **plano** (pós-tratamento pretendido). Presente apenas quando o gráfico de plano foi inicializado E seu conteúdo difere do gráfico de status. Na importação, um `plan` ausente limpa/descarta a inicialização do gráfico de plano; um `plan` presente restaura o gráfico de plano junto com o status. Também pode ser lido/escrito independentemente via `getPlanChart()`/`setPlanChart()`.

**Campo `case` de nível superior (versão 2.17+, estendido em 2.18, 2.19, 2.20 e 2.22):**
- `case` - objeto opcional contendo metadados em nível de caso (não por dente), compartilhado por ambos os gráficos de status e plano. Omite-quando-vazio. Campos (cada um omitido quando em seu padrão): `age`; `smokingStatus` (+ `cigarettesPerDay`); `diabetesStatus` (+ `hba1c`); `toothLossPerio`; `maxRblPercent`; as quatro sobrescritas clínicas por eixo da classificação 2017 `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`; `patientName` / `examDate`; `patientDob`; e (versão 2.22) `caseConditions` — diagnósticos de caso/regionais (má oclusão e ATM K07, cistos orais K09, doença de glândula salivar K11, estomatite e mucosa oral K12/K13, desenvolvimento em nível de arcada K00), cada um mapeado para uma lateralidade (não especificado/esquerdo/direito/bilateral). Lido/escrito via `getCaseMeta()`/`getCaseConditions()` e os setters `set*`/`setCaseCondition()` acima. Nome do paciente, data de nascimento e data do exame são apenas metadados de identidade do gráfico — eles **não** fazem parte da exportação FHIR.

### 🖨️ Exportação
`exportFhir()` é limpo para validadores HL7: toda entrada do Bundle carrega um `id` determinístico e uma `fullUrl` absoluta (sem placeholders `urn:uuid`), e o Bundle embute o próprio CodeSystem do motor para que seus códigos locais resolvam durante a validação (também publicado em `projects/angular-advanced-odontogram/src/lib/fhir/`; passe `includeCodeSystem: false` para omiti-lo).

Dados periodontais agora também fazem round-trip pela importação FHIR, não apenas pelo payload JSON: `importFhirBundle()` lê os painéis periodontais LOINC `74029-0` de volta para o registro perio de cada dente — profundidade de sondagem, margem gengival (reconstruída a partir do CAL, de modo que valores de pseudobolsa sobrevivem), BOP, furca, placa de O'Leary, os índices PI/GI e mPI/mBI de implante e a largura de gengiva ceratinizada — além das Observations de evidência de status de tabagismo e HbA1c em nível de caso. A supuração é a única exceção: permanece somente em JSON, já que não faz parte da exportação FHIR.

Além da própria exportação Status JSON / FHIR / PNG / JPG / SVG do odontograma, o **gráfico periodontal** tem seu próprio caminho de exportação:
- **Perio SVG/PNG/JPG:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` renderizam o gráfico perio completo como um único SVG vetorial autônomo, independente do DOM do `PerioChartComponent` montado. Desativado sempre que `hasAnyPerioData()` for falso.
- **Relatório PDF:** o item "PDF report…" do menu de exportação abre o `ExportOptionsModalComponent` — um diálogo de configurações (campos de nome do paciente + data de nascimento + data do exame, ligados diretamente aos metadados do caso, com a data do exame assumindo hoje por padrão; checkboxes de seção: dados do paciente, gráfico do odontograma, descrição do odontograma, anotações individuais — desabilitado quando nenhum dente tem nota — status perio, descrição perio) antes de chamar `exportPdf(opts)` através do token de injeção `EXPORT_PDF_FN`. Campos de identidade vazios recorrem a placeholders (`"John Doe"` / `"1980-01-01"`, configuráveis via `PdfSettings.defaultName`/`defaultDob`) de modo que a exportação sempre tenha sucesso. O PDF é montado nativamente em jsPDF — texto vetorial via `.text()`, imagens rasterizadas de dentes/gráfico perio via `.addImage()` — sem dependência de `svg2pdf.js`. A seção de anotações individuais é pulada automaticamente quando nenhum dente tem nota, e as duas seções perio sempre que `hasAnyPerioData()` for falso, independentemente dos checkboxes do diálogo.
- **Configuração do relatório (`PdfSettings`, aba Settings → Export, obtida/definida via `getPdfSettings()`/`setPdfSettings(patch)`):** nome/data de nascimento padrão do paciente, se deve mostrar a idade, formato de data (ISO/DMY/MDY), tema de cor (blue/teal/amber/slate), visibilidade de osso/polpa do odontograma, espaçamento/borda/tamanho do número do dente na imagem do gráfico, se deve incluir a descrição textual e a tabela de achados, opções correspondentes de espaçamento/posicionamento de rótulo/tamanho de fonte do gráfico perio e se deve incluir a tabela de métricas perio e o glossário de abreviações, um aviso médico (texto padrão ou personalizado), um selo de gerador/versão, e o agrupamento do resumo de dentição (boca completa / arcada / quadrante / sextante — também controla a tabela do painel de informações do dente na tela).
- **Gating de implante mPI/mBI:** os índices peri-implantares de Mombelli (mPI/mBI) só renderizam como linhas em uma arcada que contém pelo menos um dente de implante — tanto no gráfico perio ao vivo quanto nas exportações SVG/PDF.
- Nome do paciente, data de nascimento e data do exame são apenas metadados de identidade do gráfico (payload `2.20`, aditivo) — eles **não** fazem parte da exportação FHIR.

### 📁 Estrutura de pastas
- `projects/angular-advanced-odontogram/src/public-api.ts` - o ponto de entrada público do pacote (todo export é reexportado a partir daqui)
- `projects/angular-advanced-odontogram/src/lib/core/odontogram.ts` - o motor clínico sem dependência de framework: camadas SVG, gerenciamento de estado do dente, interações de toque, sobreposições de plugin, configurações, exportação/importação
- `projects/angular-advanced-odontogram/src/lib/core/persistence.ts` - persistência opcional em localStorage
- `projects/angular-advanced-odontogram/src/lib/core/theme.ts` - o tipo `OdontogramThemeConfig` e o utilitário `applyThemeConfig()`
- `projects/angular-advanced-odontogram/src/lib/core/plugin.ts` - o tipo `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, as prioridades de z-index `LAYER_Z`
- `projects/angular-advanced-odontogram/src/lib/core/pluginSanitize.ts` - `sanitizePluginSvg()`, o sanitizador baseado em DOMPurify pelo qual a saída de `renderSvg()` de um plugin passa antes da inserção no gráfico ao vivo
- `projects/angular-advanced-odontogram/src/lib/core/tour.ts` - o tour guiado de introdução
- `projects/angular-advanced-odontogram/src/lib/core/perioClassification.ts` - derivação da classificação periodontal do World Workshop 2017
- `projects/angular-advanced-odontogram/src/lib/core/perioExport.ts` / `perioGraphic.ts` / `perioIndexNames.ts` - a renderização SVG do gráfico perio de boca completa
- `projects/angular-advanced-odontogram/src/lib/core/perioPdf.ts` - o montador puro de relatório jsPDF (`assemblePdf`)
- `projects/angular-advanced-odontogram/src/lib/core/status_extras.ts` - 22 modelos de restauração predefinidos
- `projects/angular-advanced-odontogram/src/lib/core/i18n/` - as traduções, um módulo carregado sob demanda por idioma em `i18n/locales/` (inglês estático, os outros 11 buscados via `i18n/loader.ts` no primeiro uso) e o barramento de i18n sem dependência de framework
- `projects/angular-advanced-odontogram/src/lib/core/dx/` - codificação de diagnósticos baseada em padrões: regras de derivação (`derive.ts`), o catálogo de diagnósticos ICD-10 (`codes.ts`/`caseCodes.ts`), pacotes de codificação nacionais — BNO-10/ICD-10-CM (`packs.ts`) — e a camada de refinamento ICD-10-CM/SNOMED CT (`refine.ts`)
- `projects/angular-advanced-odontogram/src/lib/core/anatomy/` - perfis de anatomia dental (`classic`/`measured`); os modelos `measured` medidos pela literatura (`measured.ts`) carregam como um chunk lazy separado
- `projects/angular-advanced-odontogram/src/lib/core/utils/numbering.ts` - conversão de numeração FDI, Universal, Palmer
- `projects/angular-advanced-odontogram/src/lib/core/registry/` - o registry declarativo de eixos clínicos: mapeamentos de campo FHIR, ativação de SVG-clear-set/boolean-flag, matriz tipo×material de restauração, listas de opções de interface
- `projects/angular-advanced-odontogram/src/lib/core/fhir/` - exportação/importação HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, `toFhirDx.ts`/`importConditions.ts` (Conditions de diagnóstico), `importPerio.ts` (Observations periodontais), sistemas de código, mapeamentos de campo, primitivos
- `projects/angular-advanced-odontogram/src/lib/fhir/` - o `CodeSystem-odontogram.json` publicado mais o conjunto `ValueSet-odontogram-*.json` gerado (um por grupo de valores do eixo clínico, um para tipos de achado, um conjunto com todos os códigos)
- `projects/angular-advanced-odontogram/src/lib/core/bridgeOverlay.ts` - sobreposição de conector de vão de ponte multi-dente
- `projects/angular-advanced-odontogram/src/lib/core/fonts/` - fontes Unicode empacotadas para o PDF (shaping árabe, CJK) + o carregador de fontes
- `projects/angular-advanced-odontogram/src/lib/core/assets/` - arquivos SVG de origem de dente/ícone (`teeth-svgs/`, `teeth-svgs/measured/`, `icon-svgs/`)
- `projects/angular-advanced-odontogram/src/lib/core/generated/` - os SVGs compilados em módulos TypeScript inline (`npm run gen:assets`)
- `projects/angular-advanced-odontogram/src/lib/core/__tests__/` + `registry/__tests__/` - o corpus de testes portado, incl. as golden fixtures em `parity/`
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/` - `OdontogramShellComponent`, a shell tudo-em-um
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-ui.service.ts` - `OdontogramUiService`, a camada de estado/efeitos da interface componível
- `projects/angular-advanced-odontogram/src/lib/components/engine-state.ts` - o helper de signal `engineState()`
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-engine-lifecycle.ts` - o token de DI `ODONTOGRAM_ENGINE_LIFECYCLE`
- `projects/angular-advanced-odontogram/src/lib/components/surfaces/` - as quatro superfícies de apresentação (topbar, chart, tooth-info, tooth-controls) e, em `surfaces/cards/`, os oito cartões de controle declarativos (incl. `DiagnosesCardComponent`)
- `projects/angular-advanced-odontogram/src/lib/components/settings-modal/` - `SettingsModalComponent` (diálogo de configurações em 7 abas)
- `projects/angular-advanced-odontogram/src/lib/components/export-options-modal/` - `ExportOptionsModalComponent` e o token de DI `EXPORT_PDF_FN`
- `projects/angular-advanced-odontogram/src/lib/components/credits-modal/` - `CreditsModalComponent`
- `projects/angular-advanced-odontogram/src/lib/components/case-diagnoses-modal/` - `CaseDiagnosesModalComponent`, o popup de diagnósticos de caso/regionais de boca completa
- `projects/angular-advanced-odontogram/src/lib/components/perio-chart/` / `perio-sidebar/` - o gráfico periodontal autônomo/inline e sua barra lateral de contexto
- `projects/angular-advanced-odontogram/src/lib/components/dual-state-confirm/` - o diálogo de confirmação compartilhado (edições que afetam status↔plano)
- `projects/angular-advanced-odontogram/src/lib/components/shared/dialog-focus.ts` - helpers compartilhados de foco-preso/restauração de modais
- `projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.ts` - `I18nService`, a fachada reativa em Angular sobre o barramento de i18n do core
- `projects/demo/` - a aplicação Angular de demonstração (`ng serve` / `npm run build:demo`)
- `scripts/generate-svg-assets.mjs` - o gerador do `npm run gen:assets`

### ⚙️ Stack tecnológica
- Angular 21 (componentes standalone, signals) + Angular CLI (`@angular/build`) + TypeScript
- `ng-packagr` para o build da biblioteca (`ng build angular-advanced-odontogram`)
- Tailwind CSS para a estilização da interface, compilado uma única vez em uma folha de estilos estática (`npm run build:styles` → `projects/angular-advanced-odontogram/styles.css`) — os consumidores registram essa folha de estilos, eles não executam o Tailwind por conta própria
- Camadas SVG via manipulação do DOM no core sem dependência de framework (estado não reativo do Angular, por desempenho — o mesmo motor que o original em React usa)
- Um sistema de i18n personalizado, leve e sem dependência de framework (`core/i18n/`), envolvido pelo `I18nService` para vinculação reativa em templates Angular
- Dois test runners: Vitest simples para o corpus do core (`vitest run`), a integração Vitest do `@angular/build:unit-test` do Angular para os specs de componente (`ng test`); `@testing-library/jest-dom` para matchers de DOM
- TypeDoc para a documentação da API (`npm run docs`, saída em `docs/api/`)
- jsPDF para o relatório PDF; DOMPurify para a sanitização da saída de plugins

### 📝 Notas
- Os modelos SVG e os ícones são compilados em módulos TypeScript gerados em tempo de build (`npm run gen:assets`) — não há busca de asset em runtime e nada a servir a partir de uma pasta pública.
- O motor do odontograma usa seu próprio estado interno, sem dependência de framework (não signals do Angular), para a grade SVG, por desempenho e para permanecer idêntico ao original em React; os componentes Angular o leem reativamente através de `engineState()`/`I18nService`/`onStateChange()` em vez de possuí-lo eles mesmos.
- Dentes decíduos têm um conjunto reduzido de materiais disponíveis (sem restaurações de amálgama, sem endo baseado em pino).
- Dentes de implante têm um conjunto de opções de coroa/pilar diferente dos dentes naturais.

### 🔒 Notas de segurança

- **Plugins rodam como código confiável.** O valor de retorno de `renderSvg()` de um plugin é injetado no SVG do gráfico ao vivo. Essa saída é sanitizada com [DOMPurify](https://github.com/cure53/DOMPurify) (perfil SVG, mais `svgFilters`) antes da inserção — `<script>`, `<iframe>`, `<object>`, `<embed>` e `<foreignObject>` são proibidos por completo, e saídas totalmente maliciosas são descartadas em vez de parcialmente renderizadas. Isso reduz o raio de impacto de um plugin comprometido ou com bugs, mas os plugins ainda devem ser carregados apenas de fontes em que você confia — a sanitização é uma rede de segurança, não um substituto para a análise cuidadosa.
- **Content-Security-Policy.** Este pacote não injeta uma CSP própria quando incorporado como biblioteca. Aplicações hospedeiras que renderizam `OdontogramShellComponent` devem definir sua própria CSP apropriada ao seu deployment; uma base razoável espelha a política do demo do projeto React original:

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

### 📖 Como citar

Este pacote não tem um registro de citação próprio — é um port que compartilha seu motor clínico, ao pé da letra, com o projeto original. Se você usar este software em pesquisa, por favor cite o original:

> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Todas as versões (DOI conceitual):** https://doi.org/10.5281/zenodo.21156787

Metadados de citação legíveis por máquina estão no [`CITATION.cff`](https://github.com/ZoliQua/React-Advanced-Odontogram/blob/main/CITATION.cff) do projeto original.

## 🙌 Créditos

Angular Advanced Odontogram é criado e mantido por Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), criador e desenvolvedor principal deste port e do motor clínico subjacente. O mesmo popup dentro do aplicativo (barra superior → "Sobre e créditos") lista esses nomes.

**Projeto original**

- [React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram) (npm: [`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)): a implementação original em React da qual este pacote é um port — o motor clínico (lógica de estado dentário, registro periodontal, codificação de diagnósticos, exportação/importação FHIR, strings de i18n, tour, modelos SVG) é compartilhado, ao pé da letra.

**Construído com** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [Angular](https://angular.dev), [Angular CLI](https://angular.dev/tools/cli), [TypeScript](https://www.typescriptlang.org) e [Tailwind CSS](https://tailwindcss.com).

Contribuições são bem-vindas — veja [`CONTRIBUTING.md`](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/CONTRIBUTING.md). Se este projeto for útil para você, por favor [dê uma estrela no GitHub](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
