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

> 🌐 **Languages:** 🇬🇧 [English](README-en.md) | 🇭🇺 [Magyar](README-hu.md) | 🇩🇪 [Deutsch](README-de.md) | 🇪🇸 [Español](README-es.md) | 🇫🇷 [Français](README-fr.md) | 🇮🇹 [Italiano](README-it.md) | 🇵🇱 [Polski](README-pl.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇷🇺 [Русский](README-ru.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 简体中文（本文件）

---

## 📑 目录

- [📋 概述](#-概述)
- [📦 作为 npm 包使用](#-作为-npm-包使用)
- [✨ 主要功能](#-主要功能)
- [📦 模块组成](#-模块组成)
- [🛠️ 界面控件](#-界面控件)
- [🦷 牙齿类型与状态](#-牙齿类型与状态)
- [⚙️ 设置](#-设置)
- [🖼️ SVG 模板系统](#-svg-模板系统)
- [🔢 编号系统](#-编号系统)
- [🚀 使用方法](#-使用方法)
- [🔗 集成](#-集成)
- [🧪 测试](#-测试)
- [📖 API 文档](#-api-文档)
- [📡 公共 API](#-公共-api)
- [💾 状态持久化（localStorage）](#-状态持久化localstorage)
- [💾 状态导出/导入格式](#-状态导出导入格式)
- [🖨️ 导出](#-导出)
- [📁 目录结构](#-目录结构)
- [⚙️ 技术栈](#-技术栈)
- [📝 说明](#-说明)
- [🔒 安全说明](#-安全说明)
- [📖 如何引用](#-如何引用)

## 🇨🇳 简体中文

### 📋 概述

本项目是一款面向 **Angular + TypeScript** 的交互式、基于浏览器的牙位图（口腔检查图）编辑器，界面简洁，支持快速的牙科病历记录。它通过分层渲染 SVG 牙齿模板来表现修复体、龋齿、牙髓治疗状态、松动度及其他临床细节，同时提供多选、选择过滤器和预设状态模板。

**这是 [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)（npm 包名：`react-advanced-odontogram`）的官方 Angular 移植版本。** 与 react-advanced-odontogram 主分支提交 `934a911`（v2.4.0 之后；数据版本仍为 2.20）保持功能对等——JSON 与 FHIR R4 导出可在两个库之间无损互通。临床引擎（`projects/angular-advanced-odontogram/src/lib/core/`）为逐字节共享——牙位状态逻辑、牙周记录、FHIR 导出/导入、i18n 文本、引导式导览以及 SVG 模板均与 React 原版逐字节一致，并在每次同步时从锁定的上游提交重新复制；只有组件外壳（`projects/angular-advanced-odontogram/src/lib/components/`）是 Angular 原生实现。存在一小部分明确记录在案的差异（仅限品牌/标识文本——详见本仓库中的移植设计说明文档）。版本号与 React 模块保持同步（lockstep）。

---
![牙位图编辑器预览](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_en_odontogram.png)
*截图来自原始 React 项目——Angular 移植版本渲染出完全相同的界面。*

🔗 **在线演示：** https://angular-advanced-odontogram.vercel.app/

---

### 📦 作为 npm 包使用

牙位图作为一个自包含的 Angular 组件库发布在 npm 上：
[`angular-advanced-odontogram`](https://www.npmjs.com/package/angular-advanced-odontogram)。

#### 环境要求
- **Angular 21.2 及以上版本**（声明为 peer dependency——由你的应用提供）。
- 一个能理解 `exports` 字段和 ESM 的**打包工具**——Angular CLI（`@angular/build`）开箱即用即可满足要求。该包**仅支持 ESM**。
- 工具链需要 Node **≥ 20**。

#### 安装

```bash
npm install angular-advanced-odontogram
```

#### 基本用法

在应用全局样式配置的任意位置（例如 `angular.json`）**仅注册一次**样式表：

```json
"styles": [
  "node_modules/angular-advanced-odontogram/styles.css",
  "src/styles.css"
]
```

然后渲染 `OdontogramShellComponent`：

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

`language` 接受 `hu | en | de | es | it | sk | pl | ru | pt-br | zh | ar | fr`；`numberingSystem` 接受 `FDI | UNIVERSAL | PALMER`。

#### 组件输入

`OdontogramShellComponent` 是一个受控组件——每个输入都是 Angular 的 `input()` 信号，全部为可选项，省略时均回退到引擎自身的默认值。最常用的输入如下：

| 输入 | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | 界面语言（`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`zh`/`ar`/`fr`）。 |
| `numberingSystem` | `"FDI" \| "UNIVERSAL" \| "PALMER"` | `"FDI"` | 牙位编号系统。 |
| `darkMode` | `boolean` | `false` | 深色主题切换。 |
| `readOnly` | `boolean` | `false` | 禁用所有编辑（仅查看）。 |
| `themeConfig` | `OdontogramThemeConfig` | — | 覆盖主题 CSS 变量（`--odon-*`）。 |
| `plugins` | `OdontogramPlugin[]` | — | 注册自定义状态插件 / 额外图层。 |
| `enableNotes` | `boolean` | `false` | 启用逐牙备注。 |
| `enableIcdas` | `boolean` | `false` | 启用 ICDAS II 龋齿评分。 |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | 充填卡片复杂度：`"simple"`（每颗牙一种材料）或 `"complex"`（按牙面选择材料）。 |
| `fillingDefectEnabled` | `boolean` | `true` | 在充填卡片上启用充填缺陷发现项。 |
| `fillingMaterialAvailability` | `Record<string, boolean>` | 全部可用 | 可用充填材料，以 `amalgam`/`composite`/`gic`/`temporary` 为键的布尔映射（未知键被忽略）。 |
| `fissureSealingEnabled` | `boolean` | `true` | 在充填卡片上启用窝沟封闭。 |
| `languageChange` / `numberingChange` / `darkModeChange`（输出） | `output<T>` | — | 当用户在界面中更改该设置时触发。 |
| `fillingComplexityChange` / `fillingDefectEnabledChange` / `fillingMaterialAvailabilityChange` / `fissureSealingEnabledChange`（输出） | `output<T>` | — | 当用户在设置 → 充填中更改相应设置时触发。 |

还接受更细粒度的详情级别输入（`pulpDetailLevel`、`secondaryCariesMode`、`rootCariesMode`、`radiographicDepthMode`、`cariesDepthEnabled`、`wearDetailLevel`、`discolorationDetailLevel`、`surfaceNotation`、`showStatusCard`、`showOrthoCard`）——完整的带类型列表请参见 `odontogram-shell.component.ts`。

上述四个充填输入均为**仅恢复**性质：省略某个输入时绝不会写入引擎（挂载前的 `setFillingComplexity()` 命令式调用得以保留）；而提供该输入时会同时写入引擎和设置弹窗的状态，因此弹窗中永远不会出现过期数值。`fillingMaterialAvailability` 按规范化的序列化键进行差异化应用，因此以内容相同、但字面量对象不同的方式重新渲染，永远不会重写引擎。对应的 `*Change` 输出会在设置 → 充填中触发——这是宿主应用持久化偏好设置的回写路径。

#### 公共 API（具名导出）

`OdontogramShellComponent` 是一个具名导出。命令式状态 API、独立的 `PerioChartComponent`、引导式导览以及所有公共类型，均以具名导出的形式从同一入口点提供：

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

完整的 API 表面（远超 100 个函数与类型——`OdontogramSummary`、`OdontogramThemeConfig`、`OdontogramPlugin`、`FhirExportOptions`、`PdfSettings`、`PerioViewMode` 等等）在随附的 `.d.ts` 声明文件中均有完整类型定义；下文 [公共 API](#-公共-api) 提供了精选的参考表格。

#### 可组合的界面区域（高级）

`OdontogramShellComponent` 是受支持的一体化组件，无需额外设置。如果你需要将牙位图的各个区域放置在自己布局中的不同位置，该 shell 的四个 UI 界面区域也已导出，可以在单个 `OdontogramUiService` 下进行组合，它们共享同一个由该实例管理的会话：

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

`OdontogramUiService` 接受与 `OdontogramShellComponent` 的输入相同的配置形状（其 `configure()` 方法接受一个由 `Signal`/回调组成的 `OdontogramUiConfig` 对象，每个字段均为可选，默认值与上游一致）。当前限制：每个页面仅可使用一个 `OdontogramUiService` 实例（引擎是模块级单例）。界面区域可以按需挂载和卸载。`OdontogramShellComponent` 本身没有变化——它正是这种组合在默认排布下的形态，仍旧显式地从自身输入中接线每一个字段。

如需实现更精细的组合，各个控制卡片也已单独导出：

| 组件 | 选择器 | 涵盖内容 |
|---|---|---|
| `StatusesCardComponent` | `aao-statuses-card` | 全口状态/预设控件（重置、乳牙列/混合牙列、无牙颌、状态附加项） |
| `ToothDetailsCardComponent` | `aao-tooth-details-card` | 基础行（牙齿选择/基质）、断冠复选框、需要牙冠/需要更换牙冠开关 |
| `CariesCardComponent` | `aao-caries-card` | 龋齿深度模式、冠下龋、根面龋严重度、按牙面龋齿选择器 |
| `FillingsCardComponent` | `aao-fillings-card` | 充填材料、按牙面充填选择器 + 缺陷、继发龋/缺陷提示说明 |
| `RootPeriodontiumCardComponent` | `aao-root-periodontium-card` | 牙髓/根管状态、根尖诊断、牙根吸收、松动度、种植体周状态 |
| `OrthodonticsCardComponent` | `aao-orthodontics-card` | 矫治器、移位、垂直移动、扭转 |
| `SurfaceCrossComponent` | `aao-surface-cross` | 龋齿/充填卡片内部共用的 B/M/O/D/L 十字选择控件 |

每张卡片都是一个自包含的声明式组件，通过 `inject(OdontogramUiService)` 与导出的 `engineState()` 辅助函数读取和写入共享会话（`engineState()` 会对任意引擎 getter 的读取结果进行信号化封装，并通过核心自身的变更通知总线保持最新）。只需在单个 `OdontogramUiService` 下按任意排布挂载某个布局所需的卡片即可。`CreditsModalComponent`（`aao-credits-modal`，顶部工具栏的“关于与致谢”弹窗）也已导出，供希望自行驱动其开关状态的宿主应用使用。

```ts
import { engineState, OdontogramUiService, getOdontogramSummary } from "angular-advanced-odontogram";

// Anywhere inside an injection context under an `OdontogramUiService`:
readonly summary = engineState(getOdontogramSummary); // Signal<OdontogramSummary>, kept fresh automatically
```

#### 宿主测试用的依赖注入接缝

两个 `InjectionToken` 允许宿主应用在自己的测试中覆盖具有副作用的引擎调用（两者在生产环境下均默认调用真实引擎，且均为 `providedIn: "root"`）：

| 令牌 | 覆盖对象 | 结构 |
|---|---|---|
| `ODONTOGRAM_ENGINE_LIFECYCLE` | `initOdontogram()` / `destroyOdontogram()`，由 `OdontogramShellComponent` 的 `ngAfterViewInit()`/`ngOnDestroy()` 调用 | `{ init: () => Promise<void>; destroy: () => void }` |
| `EXPORT_PDF_FN` | `exportPdf(opts)`，在点击“导出”时由 `ExportOptionsModalComponent` 调用 | `(opts: PdfExportOptions) => Promise<void>` |

两者的存在是因为真实函数会触及无头测试环境无法完全提供的 DOM/canvas/`jsPDF` 内部机制——请在宿主应用自己的组件测试中，通过 Angular `TestBed` 的 provider 数组覆盖它们。

#### 重要说明与当前限制
- **仅支持 ESM**——该包发布为单个 ES 模块（通过 `ng-packagr` 构建），并附带其类型声明入口。它面向打包工具的模块解析方式；不提供 CommonJS 构建版本。
- **样式表是独立的**——你**必须**注册一次 `angular-advanced-odontogram/styles.css`；它不会被自动注入。样式为全局 CSS，作用域限定在 `.odontogram-root` 下，并由 `--odon-*` CSS 变量驱动。
- **SSR / 仅限客户端**——该组件在挂载时会读取 DOM，因此必须在浏览器中运行；请仅在浏览器端渲染它。
- **资源是自包含的**——牙齿和图标的 SVG 在构建时被内联到包中（生成的 TypeScript 模块，`npm run gen:assets`）；**无需配置任何运行时资源请求**，也无需向你的应用 public 文件夹额外复制任何文件。
- **本版本中每个页面仅限一个实例**——引擎状态是模块级单例（与 React 原版相同），因此在同一页面渲染两个 `<aao-odontogram-shell>` 实例会导致它们共享同一份图表状态。

---

### ✨ 主要功能
- 🖱️ 快速选择与多选（CMD/CTRL + 点击）
- 🦷 牙齿类型：恒牙、乳牙、种植体、龈下（未萌出）、缺失
- 🦷 牙体基质（与任何修复体正交）：天然、残根（radix）、折断、已预备冠
- 👑 按类型 × 材料划分的修复体：牙冠 / 嵌体 / 高嵌体 / 贴面 / 桥，材料涵盖 e.max、金合金、Gradia、氧化锆、金属、金属烤瓷、套筒冠或临时冠（高嵌体仅限咬合面视图）——通过一个合并的低点击次数“Fix: Crown – …”选择器统一选取；旧版 `metal` 牙冠会自动迁移为 `metal-ceramic`（金属烤瓷）；种植体使用相同的类型 × 材料模型，并叠加一个种植体连接体层。选择器按牙齿种类进行限定：种植体仅提供牙冠/桥（以及下文的五种附着方式选项）；缺失/间隙牙位仅提供桥体（pontic）（以及可摘局部/全口义齿）；`radix`（残根）基质会完全隐藏修复体控件（残根上不能设置任何修复体）
- 🦿 专用 `prosthesis`（可摘/附着体）轴上的可摘/附着式修复（合并选择器中的“Kivehető:”条目）：种植体愈合基台、Locator 附着体、带覆盖义齿的 Locator、杆卡附着体、带覆盖义齿的杆卡附着体；牙支持式可摘局部或全口义齿
- 🌉 桥体牙位同时渲染牙冠帽与桥体连接部；多牙位桥跨越叠加层会在连续的桥体牙位（桥体单位 + 基牙）及其间隙上渲染一条连续的、感知牙弓形态的连接体，并包含在 PNG/JPG/SVG 导出中
- 🔍 6 个牙面的龋齿记录：近中、远中、颊侧、舌侧、咬合面、冠下
- 🪥 每个牙面的充填材料：银汞合金、复合树脂、玻璃离子（GIC）、临时材料
- 🏥 一个合并的“牙髓 / 根管状态”选择器（分组：活髓 vs. 已治疗/根管）：根管治疗状态（药物充填、根管充填、根管充填不完全、玻璃纤维桩、金属桩）与 AAE 牙髓诊断（`pulpDx`：正常 / 可复性 / 不可复性牙髓炎 / 坏死）互斥——已行根管治疗的牙齿（设置了 `endo`）不能同时携带活髓诊断；进行治疗时，`pulpDx` 会被规范化为 `normal`。一个可选的三级牙髓详情设置（`pulpDetailLevel`：simple / AAE / 实用拉丁文）通过 `pulpLatin` 展示 9 种实用拉丁文牙髓亚型
- 🦴 根尖诊断（`apicalDx`：有症状/无症状根尖周炎，急性/慢性根尖脓肿，致密性骨炎）直接驱动根尖周图标；肉芽肿/囊肿病损亚型限定符仅在有症状/无症状根尖周炎下显示
- 🩹 合并的“牙根与牙周组织”卡片（一个可折叠区域，涵盖牙根/根尖周及牙周相关表现）
- ⚕️ 修饰项：根尖周炎症（仅在缺失/拔牙创牙位显示；在现有牙齿及种植体上隐藏，种植体上由 `periImplant` 覆盖该表现）、牙周病、松动度分级（M1/M2/M3，种植体上隐藏）
- 🦷🔩 种植体周状态（`periImplant`：无 / 黏膜炎 / 种植体周炎-轻度 / -中度 / -重度）——采用 2018 年世界研讨会分期标准，在种植体上作为专用选择器显示
- 🏷️ 特殊指示项：需要牙冠、需要更换牙冠、缺失后间隙已关闭、拔牙计划、窝沟封闭、接触点丧失
- 👁️ 咬合面视图、智齿、骨组织与牙髓可见性切换
- 🔢 12 个选择过滤器（全部、现有、恒牙、乳牙、种植体、缺失、上/下颌、前牙/磨牙）
- 📊 预设状态模板（重置、乳牙列、混合牙列、无牙颌）
- 📦 22 种预定义修复体模板（桥、可摘义齿、带种植体的杆卡义齿）
- 💾 JSON 格式的状态导出/导入（版本 2.20；导入仍接受旧版 1.4 及 2.0 至 2.19 版本，并自动迁移，包含插件自定义状态及每颗牙齿的备注）
- 💽 可选的 localStorage 状态持久化（`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`）——默认关闭；自动保存状态图表（可选同时保存计划图表），附带 4 MB 容量上限，存储/解析错误会通过 `onError` 回调（或 `console.warn`）上报，而不会抛出异常
- 🔗 HL7 FHIR R4 导出（每颗牙齿一个 Observation 组成的 collection Bundle，**恒牙及乳牙**均采用 ISO 3950 牙位编码（乳牙 51-85，导入时可无损还原），使用本地代码系统）；已记录严重度的龋齿分量还会附带评分体系编码——原发（未充填）牙面采用 ICDAS，继发（已充填）牙面采用 CARS
- ✚ 十字/加号式牙面选择界面（B/M/O/D/L）用于龋齿和充填记录——`SurfaceCrossComponent`，已导出以支持可组合布局
- 🧱 每个牙面独立的修复材料（混合充填，例如颊侧银汞合金 + 远中复合树脂）
- 🖼️ 图表的 PNG/JPG/SVG 图像导出（可下载；PNG/JPG 由矢量 SVG 栅格化而成）
- 🦷 龋齿/继发龋是按牙面划分的状态机：无充填体的患龋牙面渲染为原发龋（按 ICDAS 分级的不透明度）；一旦该牙面存在充填体，则改为渲染继发龋（按 CARS 评分）——同一牙面上两者永远不会同时激活
- 🎯 统一的按牙面严重度（`cariesSeverity`，0–6）：在原发牙面上按 ICDAS 深度解读，在继发牙面上按具名 CARS 评分（健康……广泛龋洞）解读，通过一个情境化弹窗仅显示与该牙面当前状态相关的量表
- 🌱 根面龋（`rootCaries`：无 / 活动性 / 静止性 / 活动性伴龋洞），驱动专用的根面龋美术层，其不透明度由严重度决定
- 📡 影像学龋损深度（`radiographicDepth`：无 / E1 / E2 / D1 / D2 / D3，按牙面记录），独立于视觉上的 ICDAS/CARS 严重度量表，以徽标形式呈现，并通过其自身的 FHIR Observation 往返导出/导入
- 🎚️ 三项龋齿粒度设置（`secondaryCariesMode`、`rootCariesMode`、`radiographicDepthMode`）以及一个 `cariesDepthEnabled` 开关，可将每种量表折叠为更简化的选择视图，而不丢失已存储的数值
- 🩹 充填面板中的继发龋摘要行：列出任何已选中且带有继发龋的牙齿及其牙面
- 🪛 每个牙面的充填缺陷（`fillingDefect`：无 / 边缘 / 折裂 / 磨损），针对直接修复体，独立于继发龋
- 🦷💥 按临床病因和部位分类的牙齿磨耗（`wearEdge`：无 / 磨耗（attrition）/ 酸蚀（erosion），切端/咬合面；`wearCervical`：无 / 磨损（abrasion）/ 楔状缺损（abfraction）/ 酸蚀（erosion），颈部）
- 🎨 按病因分类的牙齿变色（`discoloration`：无 / 四环素 / 氟斑牙 / 死髓 / 外源性 / 其他），适用于恒牙和乳牙
- ✏️ 前牙（切牙/尖牙）在整个界面中将其咬合面标注为“切端”；存储的牙面键仍为 `occlusal`
- 🔤 位置感知型牙面记法（设置 → 牙齿详情 →“牙面记法”，简单/完整，默认完整）：完整模式下，龋齿/充填牙面字母及标签遵循牙齿解剖结构——前牙的咬合面 → I/切端，前牙的颊侧 → L/唇侧，上颌牙的舌侧 → P/腭侧，下颌牙的舌侧 → L/舌侧
- 🦷↕️ 按牙位记录的正畸信息（`orthoAppliance`：无 / 托槽 / 带环；`orthoDrift`：无 / 近中 / 远中；`orthoVertical`：无 / 伸长 / 压低；`orthoRotation`：布尔值），适用于现有的天然牙（恒牙或乳牙）
- 🪨 牙石，以及分为内吸收或外颈吸收的牙根吸收（`resorptionType`）
- 📏 按牙面记录的龋齿深度（浅龋/中龋/深龋），或通过 `enableIcdas` 启用可选的 ICDAS II 评分（0–6）
- 🩹 牙冠边缘微渗漏开关，仅在牙冠或桥修复体上显示
- 🧰 统一的顶部工具栏图标行，配合带标签页的设置弹窗（7 个标签页——常规 / 牙位图 / 牙周图表 / 牙齿详情 / 龋齿 / 充填 / 导出——详见下文[设置](#-设置)）
- 🦷🩺 设置 →“牙周图表”标签页：一个可用性开关，加上针对牙周图表各行的 16 个按指标显示/隐藏开关，每项均附说明，另附一个“译文名称 vs. 规范名称”显示选项
- 📋 牙齿信息面板：整个图表的实时文字摘要（牙齿计数、现有/缺失列表、龋齿（含继发龋）、充填、根管治疗、修复体、种植体、牙周状态）——默认显示，可在设置中开关
- 🗂️ 合并的导出下拉菜单（状态 JSON / FHIR / PNG / JPG / SVG / PDF 报告），每种格式均可通过设置 → 常规独立隐藏
- 📥 带 FHIR 导入功能的导入下拉菜单（可回读已导出的 Bundle），每个来源均可独立隐藏
- ⏳ 图像导出过程中的进度浮层
- 🎓 交互式新手导览（对 shell 各项控件的引导式讲解）
- 🔢 三种牙位编号系统（FDI、通用编号法、Palmer）
- 🌐 国际化——12 种界面语言（HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR），支持语言切换；阿拉伯语界面从右到左渲染，同时牙位图/牙周图表固定保持从左到右
- 🌗 支持深色模式，附带切换按钮（独立控制或由父应用控制）
- 🎨 通过 CSS 自定义属性（`--odon-*`）实现的自定义主题配置（`themeConfig` 输入）
- 📱 移动端触控体验：点按缩放弹出层、长按上下文菜单、双指缩放、符合 WCAG 标准的 44px 触控目标、牙弓切换导航
- 🔌 自定义 SVG 插件系统：注入视觉叠加层、每颗牙齿的自定义状态、支持 JSON 导出/导入——插件 `renderSvg()` 的输出在插入实时图表前会经过 DOMPurify 净化（SVG 配置文件）；插件本质上仍作为受信任代码运行，因此请仅使用来源可信的插件
- ⚠️ 针对不兼容牙齿状态组合的状态校验警告
- 🏷️ 牙齿方块上的自动状态提示（显示所有当前激活的状态）
- 🩺 按牙位提示信息与全口摘要面板，展示完整的一整套临床发现（牙髓/根尖诊断、牙根吸收、种植体周状态、分级根面龋、牙石、牙冠边缘微渗漏、折裂、接触丧失、分类的切端/颈部磨耗）
- ♿ 键盘无障碍访问（WCAG）：ARIA listbox/option 角色、回车/空格键选择、方向键导航、focus-visible 轮廓
- 🔒 只读模式：为打印/报告/查看场景禁用所有交互
- ✨ 选中动画：选中牙齿呈现脉动虚线边框和发光阴影效果（支持 prefers-reduced-motion）
- 📝 每颗牙齿的备注：双击添加/编辑备注，牙号旁显示备注图标，悬停提示显示备注文字，全口摘要面板中新增一行“个别备注”，并纳入 PDF 报告，支持 JSON 导出/导入
- 🔀 现状 ↔ 计划图表切换：`Status | Plan`（现状 | 计划）切换开关可在当前**现状**图表与**计划**（拟定治疗后）图表之间切换，二者各自拥有独立的牙齿状态；导出/导入始终针对现状图表，而计划图表通过其自身的 API 单独读写（见下文[公共 API](#-公共-api)）——当其与现状不同时，会作为附加的 `plan` 区块包含在 JSON 导出中
- 📝 “变更内容”提示框：只要计划与当前现状存在差异，就会按牙位、按治疗轴逐条列出所有差异；也可通过 `getPlanChanges()` 以编程方式获取
- 🅿️ 拟定样式：在计划模式下，计划相对当前现状**新增**的发现会以醒目的虚线、着色“拟定”轮廓渲染
- 🚦 计划模式限定：计划图表仅显示牙医实际可以**执行**的操作——仅适用于现状的发现项（龋齿、牙齿磨耗、变色，以及整个牙周区块）均被隐藏；修复体、可摘修复、正畸、需要牙冠/更换牙冠及拔牙计划仍可纳入计划

![全口牙周图表](https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/lang/screenshot_en_perio.png)
*截图来自原始 React 项目——Angular 移植版本渲染出完全相同的界面。*

- 🩺 牙周记录：每颗牙齿六个标准位点的**探诊深度**、**龈缘位置**、**探诊出血**（+溢脓），并推算出**临床附着水平（CAL = 探诊深度 + 龈缘位置）**、牙龈退缩量，以及全口**探诊出血百分比（%BOP）**。**图形化全口牙周图**——每侧牙弓分别绘制为两张独立的颊侧/腭（舌）侧 SVG 图，配有红色的**CEJ 线**、带毫米刻度编号的参考网格，以及龈缘/牙周袋深度曲线，并由一条中央牙周指标带分隔，该指标带承载共用的按牙位指标——**Miller 分级**与**菌斑/PI/GI/mPI/mBI**以每颗牙齿一个解剖学菱形方块呈现；支持**键盘自动前进**式录入；图表会动态缩放以填满可用宽度。以 `Odontogram | Periodontal Status`（牙位图 | 牙周状态）视图切换开关呈现，并仍可通过导出的 `PerioChartComponent` 单独调用。按位点的 **FHIR** 导出通过 LOINC 牙周面板代码（`74029-0`；探诊深度 `32910-2`、牙龈退缩 `32911-0`、CAL `32912-8`）
- 🧪 一套全面的自动化测试套件（详见[测试](#-测试)），涵盖编号系统、翻译、预设模板、国际化、shell、主题、触控、插件、无障碍访问，以及与冻结的 React 语料库之间的临床轴/诊断一致性
- 📖 基于 JSDoc 注释、面向所有公共导出项生成的 TypeDoc API 文档（`npm run docs`）

### 📦 模块组成
- 🦷 牙位图网格与牙齿方块界面（`OdontogramChartSurfaceComponent`）
- 🎛️ 控件与状态面板（`ToothControlsSurfaceComponent` + 7 张声明式卡片）
- 🎨 SVG 分层渲染引擎及模板（框架无关的核心，`core/odontogram.ts`）
- 🔢 牙位编号与标签映射（FDI/通用编号法/Palmer，`core/utils/numbering.ts`）
- 🌐 本地化——12 种界面语言（HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR），包括阿拉伯语（RTL)（`core/i18n/`、`I18nService`）
- 💾 状态导出/导入
- 📋 状态附加项：预定义修复体模板
- 🎨 主题配置：通过 `--odon-*` CSS 属性实现的可自定义配色方案
- 📱 移动端触控交互（点按缩放、长按、双指缩放、牙弓切换）
- 🔌 自定义 SVG 插件系统
- ⚠️ 状态校验与提示系统
- ♿ 键盘无障碍访问与 ARIA 支持
- 🔒 只读模式
- ✨ 选中动画
- 📝 每颗牙齿的备注系统
- 🧱 **可组合界面**——`OdontogramUiService`、`engineState()` 辅助函数、4 个展示型界面区域，以及 7 张声明式控制卡片，全部可独立导出（详见上文[可组合的界面区域](#-作为-npm-包使用)）
- 🧪 自动化测试套件（Vitest 语料库 + `ng test`，详见[测试](#-测试)）

### 🛠️ 界面控件

**🔝 顶部工具栏**（`OdontogramTopbarComponent`）：
- 语言切换器（HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR 下拉菜单）
- 深色模式切换按钮（太阳/月亮图标，在亮色与深色主题间切换）
- 编号系统切换器（FDI/通用编号法/Palmer 下拉菜单）
- 导出状态 / 导入状态按钮
- 设置（齿轮图标）、致谢/关于（信息图标）、GitHub 链接

**📊 图表标题栏：**
- 咬合面视图切换
- 智齿可见性切换
- 骨组织可见性切换
- 牙髓可见性切换
- 清除选择按钮

**🔍 选择过滤器：**
- 全选 / 全部现有 / 恒牙 / 乳牙 / 种植体 / 全部缺失
- 选择上颌 / 上前牙 6 颗 / 上磨牙
- 选择下颌 / 下前牙 6 颗 / 下磨牙

**📋 状态预设：**
- 重置全部（重置整口牙齿）
- 乳牙列
- 混合牙列
- 无牙颌切换

**📦 状态附加项下拉菜单：**
- 上/下颌氧化锆桥（12-22、13-23、16-26、全牙弓）
- 上/下颌金属桥（12-22、13-23、16-26、全牙弓）
- 上/下颌可摘局部义齿
- 上/下颌可摘全口义齿
- 上/下颌带种植体的杆卡义齿

**🦷 牙齿编辑器面板**（`ToothControlsSurfaceComponent`，针对所选牙齿，按可折叠卡片分组）：
- **状态卡片：** 全口预设和状态附加项（可通过 `showStatusCard` 独立显示/隐藏）
- **牙齿详情卡片：** 牙齿选择（基本类型，含断冠变体）、牙体基质、合并的“Fix: …” / “Kivehető: …”修复体下拉菜单、牙冠边缘微渗漏复选框、断冠位置复选框、需要牙冠 / 需要更换牙冠开关
- **正畸卡片：** 矫治器、近中/远中移位、垂直移动、扭转开关——显示于现有天然牙上（可通过 `showOrthoCard` 独立显示/隐藏）
- **龋齿卡片：** 龋齿深度模式下拉菜单、冠下龋复选框、根面龋严重度下拉菜单，以及带情境化 ICDAS 深度/CARS 弹窗和影像学深度徽标的 B/M/O/D/L 按牙面龋齿选择器（`SurfaceCrossComponent`）
- **充填卡片：** 充填材料下拉菜单、按牙面的充填选择器、按牙面的充填缺陷指示器、继发龋与充填缺陷提示说明
- **牙根与牙周组织卡片：** 合并的“牙髓 / 根管状态”选择器、根尖诊断选择器、根尖病损亚型选择器、牙根吸收类型选择器、松动度分级选择器、种植体周状态选择器（仅限种植体）
- **特殊指示项：** 拔牙计划/拔牙创、缺失后间隙已关闭、窝沟封闭、接触点丧失、牙石、髓旁钉、根尖切除、桥基牙

### 🦷 牙齿类型与状态

**牙齿选择（基本类型）：**
| 值 | 说明 |
|---|---|
| `none` | 缺失牙 |
| `tooth-base` | 恒牙 |
| `milktooth` | 乳牙 |
| `implant` | 种植体 |
| `tooth-under-gum` | 龈下（未萌出）牙 |

**断冠变体：**
`tooth-broken-inicisal`、`tooth-broken-distal-inicisal`、`tooth-broken-distal`、`tooth-broken-mesial-distal-inicisal`、`tooth-broken-mesial-distal`、`tooth-broken-mesial-inicisal`、`tooth-broken-mesial`、`no-tooth-after-extraction`

**牙体基质（恒牙）：**
`natural`（天然，默认）、`radix`（残根）、`broken`（折断）、`crownprep`（已预备冠）

**修复体类型（恒牙）：**
`none`、`crown`、`inlay`、`onlay`（仅限咬合面视图）、`veneer`、`bridge`

**修复体材料（恒牙）：**
`none`、`emax`、`gold`、`gradia`、`zircon`、`metal`、`metal-ceramic`（旧版 `metal` 牙冠迁移至此）、`telescope`、`temporary`

**修复体选项按牙齿种类限定**（`projects/angular-advanced-odontogram/src/lib/core/registry/restorations.ts` 中的 `restorationOptions()`）：种植体仅提供 `crown`/`bridge` 修复体类型（叠加种植体连接体层），加上下文的五种 `prosthesis` 附着体条目；缺失/间隙牙位仅提供 `bridge`（桥体），加上两种可摘义齿的 `prosthesis` 条目；`radix`（残根）基质会完全隐藏修复体控件。

**可摘修复**（`prosthesis`；正交的可摘/附着体轴，在合并的修复体下拉菜单中以“Kivehető:”条目呈现）：
`none`、`healing-abutment`、`locator`、`locator-denture`、`bar`、`bar-denture`（种植体附着体，可带或不带覆盖义齿）、`removable-partial`、`removable-full`（缺失/间隙牙位上的牙支持式义齿）。一颗牙要么有固定修复体，要么有可摘修复，二者不能同时存在——设置其一会清除另一个。

**牙冠边缘微渗漏**（`crownLeakage`；布尔值）：仅在 `restorationType` 为 `crown` 或 `bridge` 时显示。

**根管治疗选项（恒牙）：**
`none`、`endo-medical-filling`、`endo-filling`、`endo-filling-incomplete`、`endo-glass-pin`、`endo-metal-pin`

**根管治疗选项（乳牙）：**
`none`、`endo-medical-filling`

`endo` 与 `pulpDx` 通过一个合并的“牙髓 / 根管状态”选择器呈现（分组：活髓 vs. 已治疗/根管），二者互斥——选择一个已治疗选项（`endo != none`）会将 `pulpDx` 重置为 `normal`，选择一个牙髓诊断则会将 `endo` 重置为 `none`。

**充填材料（恒牙）：**
`amalgam`（银汞合金）、`composite`（复合树脂）、`gic`（玻璃离子）、`temporary`（临时材料）

**充填材料（乳牙）：**
`composite`、`gic`、`temporary`

**充填/龋齿牙面：**
`mesial`（近中）、`distal`（远中）、`buccal`（颊侧）、`lingual`（舌侧）、`occlusal`（咬合面）、`subcrown`（冠下，仅限龋齿）

**修饰项：**
`inflammation`（根尖周炎症）、`parodontal`（牙周）、`mobility`（松动度，M1/M2/M3）

**根尖病损类型**（`periapicalType`；限定根尖周图标，仅在有症状/无症状根尖周炎下显示）：
`none`、`granuloma`（肉芽肿）、`cyst`（囊肿）——旧版 `abscess`（脓肿）值仍被接受并存储，但选择器中不再提供

**牙髓诊断**（AAE 术语；`pulpDx`）：
`normal`（正常）、`reversible-pulpitis`（可复性牙髓炎）、`irreversible-pulpitis`（不可复性牙髓炎）、`necrosis`（坏死）——与 `endo` 互斥

**牙髓诊断，实用拉丁文**（`pulpLatin`；仅当 `pulpDetailLevel` 为 `latin` 时由牙髓选择器显示）：
`none`、`pulpa-sana`、`hyperaemia-pulpae`、`pulpitis-acuta-serosa`、`pulpitis-acuta-purulenta`、`pulpitis-chronica-clausa`、`pulpitis-chronica-ulcerosa`、`pulpitis-chronica-hyperplastica`、`necrosis-pulpae`、`gangraena-pulpae`

**牙髓详情级别**（`pulpDetailLevel`，全局设置）：`simple`、`aae`（默认）、`latin`

**根尖诊断**（`apicalDx`；驱动根尖周图标）：
`normal`、`symptomatic-apical-periodontitis`（有症状根尖周炎）、`asymptomatic-apical-periodontitis`（无症状根尖周炎）、`acute-apical-abscess`（急性根尖脓肿）、`chronic-apical-abscess`（慢性根尖脓肿）、`condensing-osteitis`（致密性骨炎）

**牙根吸收类型**（`resorptionType`）：
`none`、`internal`（内吸收）、`external-cervical`（外颈吸收）

**种植体周状态**（`periImplant`；仅限种植体，采用 2018 年世界研讨会分期标准）：
`none`、`mucositis`（黏膜炎）、`peri-implantitis-mild`（种植体周炎-轻度）、`peri-implantitis-moderate`（种植体周炎-中度）、`peri-implantitis-severe`（种植体周炎-重度）

**龋齿严重度**（`cariesSeverity`；统一的按牙面字段，`0`–`6`）：在无充填的牙面上，按 ICDAS 龋齿深度量表解读（`superficial`/浅龋、`dentin`/中龋、`deep`/深龋，或在启用 `enableIcdas` 时使用原始 ICDAS II 代码 `0–6`）；在有充填的牙面上，按具名 CARS 评分解读（`0` 健康……`6` 广泛龋洞）

**根面龋**（`rootCaries`）：`none`、`active`、`arrested`、`active-cavitated`

**影像学龋损深度**（`radiographicDepth`；按牙面记录）：`none`、`E1`、`E2`、`D1`、`D2`、`D3`

**龋齿粒度设置**（全局）：`secondaryCariesMode`（`simple`/`standard`/`full`，默认 `standard`）、`rootCariesMode`（`simple`/`severity`，默认 `simple`）、`radiographicDepthMode`（`off`/`threeLevel`/`detailed`，默认 `off`）、`cariesDepthEnabled`（布尔值，默认 `true`）

**特殊指示项：**
`crownNeeded`、`crownReplace`、`missingClosed`、`extractionPlan`、`extractionWound`、`bridgePillar`、`fissureSealing`、`contactMesial`、`contactDistal`、`endoResection`、`calculus`、`parapulpalPin`

**牙齿磨耗**（`wearEdge`、`wearCervical`；按部位划分的临床类型，限定于天然牙基础类型 + 无修复体 + 天然基质）：
`wearEdge`：`none`、`attrition`（磨耗）、`erosion`（酸蚀）——`wearCervical`：`none`、`abrasion`（磨损）、`abfraction`（楔状缺损）、`erosion`（酸蚀）

**变色**（`discoloration`；按牙齿病因，限定于天然恒牙或乳牙 + 无修复体 + 天然基质）：
`none`、`tetracycline`（四环素）、`fluorosis`（氟斑牙）、`nonvital`（死髓）、`extrinsic`（外源性）、`other`（其他）

**充填缺陷**（`fillingDefect`；按牙面，独立于继发龋的直接修复体发现）：
`none`、`marginal`（边缘）、`fracture`（折裂）、`wear`（磨损）

**正畸**（`orthoAppliance`、`orthoDrift`、`orthoVertical`、`orthoRotation`；按牙位，限定于现有天然牙）：
`orthoAppliance`：`none`、`bracket`（托槽）、`band`（带环）——`orthoDrift`：`none`、`mesial`（近中）、`distal`（远中）——`orthoVertical`：`none`、`extrusion`（伸长）、`intrusion`（压低）——`orthoRotation`：布尔值

**牙齿详情/记法设置**（全局会话设置，设置 → 牙齿详情）：`wearDetailLevel` 与 `discolorationDetailLevel`（`ToothDetailLevel`：`simple`/`complex`，默认 `complex`）以及 `surfaceNotation`（`simple`/`full`，默认 `full`）

### ⚙️ 设置

通过顶部工具栏的齿轮图标打开（`SettingsModalComponent`）；这是一个具有焦点陷阱、ARIA `dialog` 角色的 7 标签页弹窗（Esc 键或点击背景可关闭，方向键可切换标签页）。该弹窗是宿主提供的 `SettingsState` 的纯视图——自身不持有任何设置状态。除非另有说明，所有设置均仅为会话级界面状态——都不会修改按牙位数据或导出数据。

- **常规：** 编号系统（FDI/通用编号法/Palmer）、语言、深色/浅色主题、按格式设置导出可用性（PNG/JPG/SVG/PDF——关闭时隐藏对应的导出菜单项，且关闭 PDF 时会禁用导出标签页）、按来源设置导入可用性（状态 JSON/FHIR）
- **牙位图：** 屏幕布局——牙齿间距、牙号大小、选中颜色与边框样式；牙齿信息面板可见性；计划模式可用性；牙齿解剖轮廓（`classic` 默认 / `measured`——`measured` 以双牙弓、逐牙宽度布局渲染九个依据文献测量的牙齿模板，可在运行时切换）；状态卡片与正畸卡片可见性
- **牙周图表：** 一个可用性开关，控制该标签页其余部分以及 shell 中的牙周入口；牙周视图模式（`toggle`/`popup`）；跨 5 个分组的 16 个按指标显示/隐藏开关（牙周袋：PD/GM/CAL/BOP · 口腔卫生：菌斑/PI/GI · 膜龈：CEJ 可见性/根面凹陷/KG/GT · 支持组织：根分叉/松动度/Miller 分级 · 种植体周：mPI/mBI）；一个译文名称 vs. 规范名称的显示模式（规范名称 = 在所有界面语言下均固定使用的英文/拉丁文学术名称；提示信息始终保持本地化）
- **牙齿详情：** 牙髓详情级别（简单/AAE/实用拉丁文，默认 AAE）、磨耗详情级别与变色详情级别（简单/复杂，默认均为复杂）、牙面记法（简单/完整，默认完整）、每颗牙齿备注开关
- **龋齿：** ICDAS II 评分开关、龋齿深度开关、根面龋粒度（简单/严重度）、继发龋/CARS 粒度（简单/标准/完整）、影像学深度粒度（关闭/三级/详细）
- **充填：** 充填复杂度（复杂/简单）、充填缺陷发现项开关、按材料设置可用性（amalgam/composite/gic/temporary）、窝沟封闭开关
- **导出：** 完整的 PDF 报告配置（`PdfSettings`——详见下文[导出](#-导出)）——当常规标签页中关闭 PDF 导出时，该标签页会被禁用（回退显示常规标签页的内容）

### 🖼️ SVG 模板系统

**牙齿模板**（位于 `projects/angular-advanced-odontogram/src/lib/core/assets/teeth-svgs/`）：
| 模板 | 使用该模板的牙位 |
|---|---|
| `11.svg` | 11、12、21、22、31、32、41、42（切牙） |
| `13.svg` | 13、23、33、43（尖牙） |
| `14.svg` / `14_occl.svg` | 14、15、24、25、34、35、44、45（前磨牙） |
| `16.svg` / `16_occl.svg` | 16、17、18、26、27、28、36、37、38、46、47、48（磨牙） |

模板在下颌旋转 180 度，在左侧水平镜像。一个并行的 `measured/` 子文件夹保存了 `measured` 解剖轮廓在双牙弓、逐牙宽度布局中渲染所用的九个依据文献测量的牙齿模板（设置 → 牙位图 → 牙齿解剖）。

**图标 SVG**（位于 `projects/angular-advanced-odontogram/src/lib/core/assets/icon-svgs/`）：
`icon_8.svg`（智齿）、`icon_gum.svg`（骨组织）、`icon_no_selection.svg`（清除）、`icon_occl.svg`（咬合面视图）、`icon_pulp.svg`（牙髓）

这两个文件夹都会通过 `npm run gen:assets` 编译为生成的 TypeScript 模块（`core/generated/teeth-svgs.ts`、`core/generated/icon-svgs.ts`）——编辑源 SVG 后请运行此命令，以使打包的内联字符串保持同步。

### 🔢 编号系统

**FDI（ISO 3950）：** 恒牙 11-18、21-28、31-38、41-48。乳牙 51-55、61-65、71-75、81-85。取值：`"FDI"`。

**通用编号法（美国）：** 恒牙编号 1-32。乳牙使用字母 A-T。取值：`"UNIVERSAL"`。

**Palmer（Zsigmondy-Palmer）：** 象限 + 位置格式（例如 UR-1、LL-5）。乳牙每个象限使用字母 A-E。取值：`"PALMER"`。

`NumberingSystem`（`core/utils/numbering.ts`）是精确的联合类型 `"FDI" | "UNIVERSAL" | "PALMER"`；导出的 `toLabel(fdiTooth, system)` 会将一个 FDI 牙位号转换为所请求编号系统的标签（例如 `toLabel(14, "PALMER")` → `"UR-4"`）。

### 🚀 使用方法
开发（运行演示应用）：
```bash
npm install
npm start           # ng serve
```
构建库：
```bash
npm run build:styles && npx ng build angular-advanced-odontogram
```
构建演示应用：
```bash
npm run build:demo
```

### 🔗 集成
该组件可嵌入任意 Angular 应用：
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

**深色模式集成：**
- **独立模式：** 省略 `darkMode`——组件通过顶部工具栏切换按钮自行管理主题状态，并在宿主的根元素上添加/移除 `.dark` 类。
- **受控模式：** 绑定 `[darkMode]` 和 `(darkModeChange)`——由父应用控制主题。切换按钮仍会显示，但会触发 `darkModeChange` 而不是管理内部状态。父应用负责在 `<html>` 上添加/移除 `.dark` 类。

**自定义主题：**
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

**插件集成：**
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

插件 `renderSvg()` 的输出在插入实时图表前会经过 DOMPurify 净化（SVG 配置文件）——详见[安全说明](#-安全说明)。

### 🧪 测试

测试套件拆分为**两个运行器**，二者必须都通过（`npm test` 会按顺序依次运行两者）：

```bash
npm run test:corpus   # plain Vitest — the shared clinical-engine core
npm run test:ng       # Angular's Vitest builder — the Angular shell (ng test)
npm test              # both, in order
npm run test:watch    # watch mode (corpus runner)
```

- **`test:corpus`**（`vitest run`）针对移植后的测试语料库（`core/__tests__/` 下 100 多个 spec 文件），对 `projects/angular-advanced-odontogram/src/lib/core/`——即共享的临床引擎核心——进行测试。SVG 渲染、FHIR 导出以及 JSON 往返的**黄金基准数据**就保存在这里，并按字节逐一核验：`parity/svg-fingerprints.json`、`parity/fhir-golden.json`、`parity/roundtrip-golden.json`、`parity/shell-dom-golden.html`。
- **`test:ng`**（`ng test angular-advanced-odontogram --watch=false`，Angular 自身的 `@angular/build:unit-test` Vitest 集成）运行 Angular shell 自己的 `*.spec.ts` 用例——组件、服务、指令——断言 DOM 一致性：shell 渲染出的 id、class 与标签结构与原始 React 组件相同。

由于该构建器的 Vitest 集成不支持针对相对路径模块模拟的 `vi.mock()`/`vi.spyOn()`，触及 DOM 的副作用（`initOdontogram`/`destroyOdontogram`、`exportPdf`）改为通过 `ODONTOGRAM_ENGINE_LIFECYCLE`/`EXPORT_PDF_FN` 注入令牌以及 Angular `TestBed` 的 provider 数组进行覆盖——详见上文[宿主测试用的依赖注入接缝](#-作为-npm-包使用)。

### 📖 API 文档
```bash
npm run docs           # Generate TypeDoc docs in docs/api/
```
共享的临床引擎 API 在原始项目中也有相应文档：

📚 **https://zoliqua.github.io/React-Odontogram-Modul/**

### 📡 公共 API

**组件输入/输出：** 完整表格请参见上文[组件输入](#-作为-npm-包使用)。

**用于外部控制的导出函数**（精选子集——完整的带类型接口请参见随附的 `.d.ts`）：

| 函数 | 说明 |
|---|---|
| `initOdontogram()` / `destroyOdontogram()` | 初始化/清理引擎（由 `OdontogramShellComponent`/`OdontogramUiService` 通过 `ODONTOGRAM_ENGINE_LIFECYCLE` 令牌在内部调用） |
| `setNumberingSystem(system)` | 在 FDI、UNIVERSAL、PALMER 之间切换 |
| `clearSelection()` | 取消选择所有牙齿 |
| `registerPlugins(plugins)` | 注册自定义 SVG 插件 |
| `setPluginState(toothNo, pluginId, value)` / `getPluginState(toothNo, pluginId)` | 设置/获取某颗牙齿的插件自定义状态 |
| `getToothStateSummary(toothNo)` | 获取全部当前激活状态的本地化摘要 |
| `getOdontogramSummary()` | 获取整个图表的结构化本地化文字摘要（计数、各区块、计划变更） |
| `onStateChange(callback)` | 订阅状态变化；返回一个取消订阅函数 |
| `setReadOnly(value)` / `getReadOnly()` | 启用/禁用 / 查询只读模式 |
| `setNotesEnabled(value)` / `getNotesEnabled()` | 启用/禁用 / 查询每颗牙齿的备注功能 |
| `setPulpDetailLevel(level)` / `getPulpDetailLevel()` | 设置/获取牙髓选择器的术语级别——`"simple"`、`"aae"` 或 `"latin"` |
| `getToothAnatomy()` / `setToothAnatomy(v)` | 获取/设置牙齿解剖轮廓——`"classic"` 或 `"measured"` |
| `getChartMode()` / `setChartMode(mode)` | 获取/切换当前激活的图表——`"status"` 或 `"plan"`（首次进入计划图表时会从现状图表深拷贝而来） |
| `getStatusChart()` / `getPlanChart()` / `setPlanChart(payload)` | 独立于当前激活图表读取现状/计划图表数据，或替换计划图表的牙齿数据 |
| `getPlanChanges()` | 获取结构化的现状→计划差异（`{ toothNo, axis, from, to }[]`） |
| `setPerioSite(toothNo, site, patch)` / `getToothPerio(toothNo)` | 设置/获取六个位点之一的牙周数据（`patch` = `{ pd?, gm?, bop?, sup? }`） |
| `getToothCal(toothNo)` | 获取某颗牙齿各位点推算得出的 CAL |
| `getPerioSummary()` | 全口牙周汇总数据：已记录位点数、出血位点数、%BOP、最差 CAL、最大 PD |
| `getPerioChart()` | 获取当前激活图表的按牙位牙周记录 |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | 以编程方式打开/关闭/查询牙周图表叠加层 |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | 获取/设置牙周图表的呈现方式——`"toggle"` 或 `"popup"` |
| `getPerioClassification()` | 获取 2017 年世界研讨会牙周分类结果（`{diagnosis, stage, grade, extent, derived, overridden}`） |
| `setDiagnosisOverride(v)` / `setStageOverride(v)` / `setGradeOverride(v)` / `setExtentOverride(v)` | 覆盖推算得出的牙周分类轴，传入 `null` 表示恢复为推算值 |
| `getCaseMeta()` / `resetCaseMeta()` | 获取/重置病例级元数据对象（年龄、吸烟/糖尿病状况、患者身份信息、检查日期……） |
| `setPatientName(v)` / `setPatientDob(v)` / `setExamDate(v)` | 设置病例身份字段（仅用于 PDF 报告标题——绝不属于 FHIR 导出的一部分） |
| `exportFhir(options?)` | 将图表导出为 HL7 FHIR R4 collection Bundle（JSON 下载）；可选 `{ subject }` 引用 |
| `importFhirBundle(input)` | 导入由本模块生成的 FHIR R4 Bundle（对象或 JSON 字符串） |
| `exportImage(format)` | 将图表下载为图像——`"png"` 或 `"jpg"` |
| `exportSvg()` | 将图表下载为可缩放的矢量 SVG |
| `hasAnyPerioData()` | 只要口腔中任意位置记录了任意牙周轴数据即为 `true` |
| `exportPerioSvg()` / `exportPerioImage(format)` | 将完整的牙周图表下载为一份独立的矢量 SVG 或一张栅格化图像 |
| `exportPdf(opts)` | 下载一份 jsPDF 原生生成的 PDF 报告（详见下文[导出](#-导出)） |
| `getPdfSettings()` / `setPdfSettings(patch)` | 获取/修补 PDF 报告的配置（`PdfSettings`） |
| `exportStatus()` | 将状态图表下载为 JSON |
| `importStatus(data)` | 用先前导出的 JSON 数据为引擎注入状态（详见[状态导出/导入格式](#-状态导出导入格式)） |
| `setImportFormat(format)` | 设置下一次文件导入所用的解析器——`"status"` 或 `"fhir"` |
| `startIntroTour()` | 启动交互式新手导览 |

### 💾 状态持久化（localStorage）

为牙位图案例状态提供的可选 `localStorage` 持久化功能（`core/persistence.ts`，从包入口重新导出）。默认关闭——除非宿主应用显式启用，否则不影响现有集成；应在牙位图挂载**之后**调用（例如在组件的 `ngAfterViewInit()` 中，在 `OdontogramShellComponent`/`OdontogramUiService` 调用 `init()` 之后——恢复操作会通过 `importStatus()` 重绘实时 DOM）：

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

| 函数 | 说明 |
|---|---|
| `enablePersistence(options?)` | 通过 `importStatus()` 恢复此前保存的案例（如果存在），随后在每次状态变化稳定后将状态图表保存到 `localStorage`（编辑操作会以约 400 毫秒防抖，因此一连串变更——例如应用一个状态预设——只会产生一次写入）。幂等——再次调用会替换之前的订阅/选项。**必须在牙位图挂载之后调用。** |
| `disablePersistence()` | 停止持久化（会先冲刷任何待处理的防抖保存）；已保存的条目保留不变。 |
| `clearPersistedState()` | 移除当前（或默认）键对应的已保存条目。 |
| `isPersistenceEnabled()` | 当状态变化订阅处于激活状态时为 `true`。 |

**`PersistenceOptions`：**

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | `localStorage` 的键——这是共享核心模块自身的字面量默认值（Angular 移植版本未作更改）；传入自己的 `key` 可避免与同源下的 React 端集成冲突，或用于为多个宿主命名空间隔离。 |
| `includePlan` | `boolean` | `false` | 是否同时持久化计划图表（数据中的 `plan` 字段）。 |
| `onError` | `(err: Error) => void` | — | 出现任何存储/解析错误时调用，用于替代 `console.warn`。 |

说明：除非调用 `enablePersistence()`，否则不会对 `localStorage` 进行任何读写；当保存内容超过 4 MB 容量上限时会跳过保存（并通过 `onError`/`console.warn` 上报），而不会抛出异常；任何存储/JSON 相关的失败——例如超出配额、受限的 iframe 环境、已损坏或无法识别的存储数据等——都会被捕获并上报。该模块永远不会抛出异常。

说明：启用持久化会通过 `importStatus()` 恢复已保存的案例，这会替换当前案例——如果已保存的数据中没有计划图表，也会替换正在进行中的计划图表。请在启动时（挂载后立即）启用持久化，而不要在会话中途启用。

说明：持久化的数据可能以明文形式在 `localStorage` 中包含患者身份信息（患者姓名、检查日期）。如果您在牙位图中记录了此类数据，请确保设备级别的保护，或在适当时使用 `clearPersistedState()` 将其清除。

### 💾 状态导出/导入格式
导出会生成一个 JSON 文件（版本 `2.20`；导入同时也接受旧版 `1.4` 及 `2.0` 至 `2.19`，并自动迁移），其中包含：

**全局字段：**
- `wisdomVisible` - 智齿是否可见
- `showBase` - 骨组织层是否可见
- `occlusalVisible` - 咬合面视图是否激活
- `showHealthyPulp` - 健康牙髓是否可见
- `edentulous` - 无牙颌模式是否激活

**按牙位字段（共 32 颗牙）：**
- `toothSelection` - 基本牙齿类型
- `toothSubstrate` - 牙体基质（天然/残根/折断/已预备冠），与任何修复体正交
- `restorationType` - 修复体类型（none/crown/inlay/onlay/veneer/bridge）
- `restorationMaterial` - 修复体材料（emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary），与 `restorationType` 成对
- `prosthesis` - 可摘/附着体轴（none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full），与 crown/bridge 类型的固定 `restorationType` 互斥
- `crownLeakage` - 牙冠边缘微渗漏标志，仅在 `restorationType` 为 crown 或 bridge 时有意义
- `endo` - 根管治疗状态；与 `pulpDx` 互斥
- `mods` - 修饰项数组（inflammation、parodontal）；`inflammation` 仅适用于缺失/拔牙创牙位
- `caries` - 当前有龋齿的牙面
- `cariesActiveDepth` - 应用新牙面时龋齿深度选择器所暂存的 ICDAS 深度值
- `rootCaries` - 根面龋严重度（none/active/arrested/active-cavitated）
- `cariesSeverity` - 统一的按牙面严重度（0-6）：原发（未充填）牙面按 ICDAS 深度解读，继发（已充填）牙面按 CARS 评分解读
- `radiographicDepth` - 按牙面记录的影像学龋损深度（none/E1/E2/D1/D2/D3），独立于视觉上的 ICDAS/CARS 量表
- `fillingMaterial` - 充填材料
- `fillingSurfaces` - 已充填的牙面
- `fillingSurfaceMaterials` - 按牙面记录的充填材料（混合充填，例如颊侧银汞合金 + 远中复合树脂）
- `fillingDefect` - 按牙面记录的充填缺陷（none/marginal/fracture/wear），限定于已充填牙面，独立于继发龋
- `pulpDx` - AAE 牙髓诊断（normal/reversible-pulpitis/irreversible-pulpitis/necrosis）
- `pulpLatin` - 实用拉丁文牙髓亚型（仅当 `pulpDetailLevel` 为 `latin` 时由牙髓选择器显示）
- `apicalDx` - 驱动根尖周图标的根尖诊断
- `periapicalType` - 根尖病损亚型（none/granuloma/cyst）；导入时仍接受旧版 `abscess` 值
- `resorptionType` - 牙根吸收类型（none/internal/external-cervical）
- `periImplant` - 仅限种植体的种植体周状态（none/mucositis/peri-implantitis-mild/-moderate/-severe），采用 2018 年世界研讨会分期标准
- `endoResection` - 根尖切除标志
- `fissureSealing` - 窝沟封闭标志
- `calculus` - 牙石标志
- `contactMesial` / `contactDistal` - 近中/远中接触点丧失
- `wearEdge` - 切端/咬合面磨耗类型（none/attrition/erosion）
- `wearCervical` - 颈部磨耗类型（none/abrasion/abfraction/erosion）
- `discoloration` - 按牙齿记录的变色病因（none/tetracycline/fluorosis/nonvital/extrinsic/other）
- `orthoAppliance` - 正畸矫治器（none/bracket/band）
- `orthoDrift` - 正畸移位（none/mesial/distal）
- `orthoVertical` - 正畸垂直移动（none/extrusion/intrusion）
- `orthoRotation` - 正畸扭转标志
- `brokenMesial`、`brokenIncisal`、`brokenDistal` - 折断部位
- `extractionWound` - 拔牙创
- `extractionPlan` - 拔牙计划
- `parapulpalPin` - 髓旁钉标志
- `bridgePillar` - 桥基牙
- `mobility` - 松动度分级（none/m1/m2/m3）
- `crownNeeded` - 需要牙冠指示项
- `crownReplace` - 需要更换牙冠指示项
- `missingClosed` - 拔牙后间隙已关闭
- `customStates` - 插件自定义状态（对象，按插件 ID 索引）
- `note` - 每颗牙齿的文字备注（字符串，可选——仅在非空时存在）

**顶层 `plan` 字段（版本 2.11+）：**
- `plan` - 可选对象，结构与 `teeth`（上述按牙位字段）相同，保存**计划**（拟定治疗后）图表。仅当计划图表已被初始化**且**其内容与现状图表不同时才会出现。导入时，若 `plan` 字段缺失，则会清除/取消初始化计划图表；若 `plan` 字段存在，则在恢复现状图表的同时一并恢复计划图表。也可通过 `getPlanChart()`/`setPlanChart()` 独立于导入/导出进行读写。

**顶层 `case` 字段（版本 2.17+，在 2.18、2.19 和 2.20 中扩展）：**
- `case` - 可选对象，保存病例级（非按牙位）元数据，由现状图表和计划图表共享。空值省略。各字段（在默认值时均被省略）：`age`（年龄）；`smokingStatus`（吸烟状况，+ `cigarettesPerDay`）；`diabetesStatus`（糖尿病状况，+ `hba1c`）；`toothLossPerio`（牙周炎致失牙数）；`maxRblPercent`（最大影像学骨吸收百分比）；2017 年分类的四个按轴临床医生覆盖值 `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`；`patientName` / `examDate`；以及 `patientDob`。通过上文的 `getCaseMeta()` 及 `set*` 系列设置函数读写。患者姓名、出生日期与检查日期仅为图表身份标识元数据——**不**属于 FHIR 导出的一部分。

### 🖨️ 导出
除了牙位图自身的状态 JSON / FHIR / PNG / JPG / SVG 导出外，**牙周图表**还拥有自己的一套导出路径：
- **牙周图 SVG/PNG/JPG：** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` 将完整的牙周图表渲染为一份独立的矢量 SVG，不依赖已挂载的 `PerioChartComponent` DOM。只要 `hasAnyPerioData()` 为 false，就会被禁用。
- **PDF 报告：** 导出菜单中的“PDF report…”项会打开 `ExportOptionsModalComponent`——一个设置弹窗（患者姓名 + 出生日期 + 检查日期字段，直接绑定到病例元数据，检查日期默认为当天；区块复选框：患者数据、牙位图、牙位图说明、个别备注——未有任何牙齿记录备注时禁用——牙周状态、牙周描述），然后通过 `EXPORT_PDF_FN` 注入令牌调用 `exportPdf(opts)`。身份信息字段留空时会回退为占位符（`"John Doe"` / `"1980-01-01"`，可通过 `PdfSettings.defaultName`/`defaultDob` 配置），确保导出始终成功。该 PDF 采用 jsPDF 原生方式组装——矢量文字通过 `.text()`，栅格化的牙齿/牙周图表图像通过 `.addImage()`——不依赖 `svg2pdf.js`。当没有任何牙齿记录备注时，“个别备注”区块会自动跳过；只要 `hasAnyPerioData()` 为 false，两个牙周区块也会自动跳过，二者均与弹窗中的复选框状态无关。
- **报告配置（`PdfSettings`，设置 → 导出标签页，通过 `getPdfSettings()`/`setPdfSettings(patch)` 获取/设置）：** 默认患者姓名/出生日期、是否显示年龄、日期格式（ISO/DMY/MDY）、配色主题（blue/teal/amber/slate）、牙位图骨组织/牙髓可见性、图表图像上的牙齿间距/边框/牙号大小、是否包含文字说明及发现项表格、匹配的牙周图表间距/标签位置/字号选项以及是否包含牙周指标表格和缩写词汇表、医疗免责声明（默认文本或自定义）、生成器/版本水印，以及牙列摘要分组方式（全口 / 颌 / 象限 / 六分区——同时驱动屏幕上的牙齿信息面板表格）。
- **mPI/mBI 种植体限定：** 种植体周 Mombelli 指数（mPI/mBI）仅在包含至少一颗种植牙的牙弓中作为行渲染——无论是在实时牙周图表还是 SVG/PDF 导出中均如此。
- 患者姓名、出生日期与检查日期仅为图表身份标识元数据（数据版本 `2.20`，附加字段）——**不**属于 FHIR 导出的一部分。

### 📁 目录结构
- `projects/angular-advanced-odontogram/src/public-api.ts` - 包的公共入口点（所有导出均从此处重新导出）
- `projects/angular-advanced-odontogram/src/lib/core/odontogram.ts` - 框架无关的临床引擎：SVG 分层、牙齿状态管理、触控交互、插件叠加层、设置、导出/导入
- `projects/angular-advanced-odontogram/src/lib/core/persistence.ts` - 可选的 localStorage 持久化
- `projects/angular-advanced-odontogram/src/lib/core/theme.ts` - `OdontogramThemeConfig` 类型及 `applyThemeConfig()` 工具函数
- `projects/angular-advanced-odontogram/src/lib/core/plugin.ts` - `OdontogramPlugin` 类型、`PluginLayer`、`getQuadrant()`、`LAYER_Z` 层级优先级
- `projects/angular-advanced-odontogram/src/lib/core/pluginSanitize.ts` - `sanitizePluginSvg()`，插件 `renderSvg()` 输出在插入实时图表前所经过的、基于 DOMPurify 的净化器
- `projects/angular-advanced-odontogram/src/lib/core/tour.ts` - 引导式新手导览
- `projects/angular-advanced-odontogram/src/lib/core/perioClassification.ts` - 2017 年世界研讨会牙周分类推算
- `projects/angular-advanced-odontogram/src/lib/core/perioExport.ts` / `perioGraphic.ts` / `perioIndexNames.ts` - 全口牙周图表的 SVG 渲染
- `projects/angular-advanced-odontogram/src/lib/core/perioPdf.ts` - PDF 报告的纯 jsPDF 组装器（`assemblePdf`）
- `projects/angular-advanced-odontogram/src/lib/core/status_extras.ts` - 22 种预定义修复体模板
- `projects/angular-advanced-odontogram/src/lib/core/i18n/` - 翻译文件（12 种语言）以及框架无关的 i18n 总线
- `projects/angular-advanced-odontogram/src/lib/core/utils/numbering.ts` - FDI、通用编号法、Palmer 编号转换
- `projects/angular-advanced-odontogram/src/lib/core/registry/` - 声明式临床轴注册表：FHIR 字段映射、SVG 清除集/布尔标志激活、修复体类型×材料矩阵、界面选项列表
- `projects/angular-advanced-odontogram/src/lib/core/fhir/` - HL7 FHIR R4 导出/导入：`toFhir.ts`/`fromFhir.ts`、代码系统、字段映射、基础类型
- `projects/angular-advanced-odontogram/src/lib/core/bridgeOverlay.ts` - 多牙位桥跨越连接体叠加层
- `projects/angular-advanced-odontogram/src/lib/core/fonts/` - 内置的 PDF Unicode 字体（阿拉伯文整形、中日韩文字）+ 字体加载器
- `projects/angular-advanced-odontogram/src/lib/core/assets/` - SVG 牙齿/图标源文件（`teeth-svgs/`、`teeth-svgs/measured/`、`icon-svgs/`）
- `projects/angular-advanced-odontogram/src/lib/core/generated/` - 编译为内联 TypeScript 模块的 SVG（`npm run gen:assets`）
- `projects/angular-advanced-odontogram/src/lib/core/__tests__/` + `registry/__tests__/` - 移植后的测试语料库，含 `parity/` 黄金基准数据
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/` - `OdontogramShellComponent`，一体化 shell
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-ui.service.ts` - `OdontogramUiService`，可组合界面的状态/副作用层
- `projects/angular-advanced-odontogram/src/lib/components/engine-state.ts` - `engineState()` 信号辅助函数
- `projects/angular-advanced-odontogram/src/lib/components/odontogram-engine-lifecycle.ts` - `ODONTOGRAM_ENGINE_LIFECYCLE` 依赖注入令牌
- `projects/angular-advanced-odontogram/src/lib/components/surfaces/` - 四个展示型界面区域（顶部工具栏、图表、牙齿信息、牙齿控件），以及 `surfaces/cards/` 下的七张声明式控制卡片
- `projects/angular-advanced-odontogram/src/lib/components/settings-modal/` - `SettingsModalComponent`（7 标签页设置弹窗）
- `projects/angular-advanced-odontogram/src/lib/components/export-options-modal/` - `ExportOptionsModalComponent` 及 `EXPORT_PDF_FN` 依赖注入令牌
- `projects/angular-advanced-odontogram/src/lib/components/credits-modal/` - `CreditsModalComponent`
- `projects/angular-advanced-odontogram/src/lib/components/perio-chart/` / `perio-sidebar/` - 独立/内嵌牙周图表及其情境侧栏
- `projects/angular-advanced-odontogram/src/lib/components/dual-state-confirm/` - 共享的确认弹窗（影响现状↔计划的编辑操作）
- `projects/angular-advanced-odontogram/src/lib/components/shared/dialog-focus.ts` - 共享的弹窗焦点陷阱/恢复辅助函数
- `projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.ts` - `I18nService`，核心 i18n 总线之上的响应式 Angular 门面
- `projects/demo/` - 演示 Angular 应用（`ng serve` / `npm run build:demo`）
- `scripts/generate-svg-assets.mjs` - `npm run gen:assets` 生成器

### ⚙️ 技术栈
- Angular 21（独立组件、信号）+ Angular CLI（`@angular/build`）+ TypeScript
- 使用 `ng-packagr` 进行库构建（`ng build angular-advanced-odontogram`）
- Tailwind CSS 用于界面样式，一次性编译为静态样式表（`npm run build:styles` → `projects/angular-advanced-odontogram/styles.css`）——使用者注册该样式表即可，无需自行运行 Tailwind
- 通过框架无关核心中的 DOM 操作实现 SVG 分层（出于性能考虑，采用非 Angular 响应式状态——与 React 原版使用的是同一套引擎）
- 一个轻量级、框架无关的自定义 i18n 系统（`core/i18n/`），由 `I18nService` 封装以支持响应式的 Angular 模板绑定
- 双测试运行器：普通 Vitest 用于核心语料库（`vitest run`），Angular 的 `@angular/build:unit-test` Vitest 集成用于组件用例（`ng test`）；`@testing-library/jest-dom` 提供 DOM 匹配器
- TypeDoc 用于 API 文档生成（`npm run docs`，输出至 `docs/api/`）
- jsPDF 用于 PDF 报告；DOMPurify 用于插件输出净化

### 📝 说明
- SVG 模板和图标在构建时被编译为生成的 TypeScript 模块（`npm run gen:assets`）——不存在运行时资源请求，也无需从 public 文件夹提供任何文件。
- 牙位图引擎针对 SVG 网格使用其自身内部的、框架无关的状态（而非 Angular 信号），以兼顾性能并与 React 原版保持一致；Angular 组件通过 `engineState()`/`I18nService`/`onStateChange()` 响应式地读取该状态，而不是自行持有它。
- 乳牙可用材料集合有所精简（不支持银汞合金充填，不支持基于桩钉的根管治疗）。
- 种植牙的牙冠/基台选项集合与天然牙不同。

### 🔒 安全说明

- **插件作为受信任代码运行。** 插件 `renderSvg()` 的返回值会被注入到实时图表的 SVG 中。该输出在插入前会经过 [DOMPurify](https://github.com/cure53/DOMPurify)（SVG 配置文件，含 `svgFilters`）净化——`<script>`、`<iframe>`、`<object>`、`<embed>` 及 `<foreignObject>` 一律被禁止，完全恶意的输出会被整体丢弃，而非部分渲染。此举降低了因插件被攻破或存在缺陷而带来的影响范围，但插件仍应仅从可信来源加载——净化是一道安全防线，而非审查把关的替代品。
- **内容安全策略（CSP）。** 本包作为库嵌入时不会自行注入 CSP。渲染 `OdontogramShellComponent` 的宿主应用应根据自身部署环境设置相应的 CSP；一个合理的基线可参照原始 React 项目演示站点的策略：

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

### 📖 如何引用

本包没有自己的引用记录——它是一个与原始项目逐字节共享临床引擎的移植版本。如果您在研究中使用本软件，请引用原始项目：

> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**所有版本（概念 DOI）：** https://doi.org/10.5281/zenodo.21156787

机器可读的引用元数据位于原始项目的 [`CITATION.cff`](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/CITATION.cff)。

## 🙌 致谢

Angular Advanced Odontogram 由 Zoltan Dul（[@ZoliQua](https://github.com/ZoliQua)）创建和维护，他是本移植版本及其底层临床引擎的创造者和主要开发者。应用内的同一个弹窗（顶部工具栏 →“关于与致谢”）中列出了这些名字。

**原始项目**

- [React Advanced Odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)：本包所移植的原始 React 实现——临床引擎（牙位状态逻辑、牙周记录、FHIR 导出/导入、i18n 文本、导览、SVG 模板）为逐字节共享。

**基于** [jsPDF](https://github.com/parallax/jsPDF)、[DOMPurify](https://github.com/cure53/DOMPurify)、[Angular](https://angular.dev)、[Angular CLI](https://angular.dev/tools/cli)、[TypeScript](https://www.typescriptlang.org) 和 [Tailwind CSS](https://tailwindcss.com) 构建。

欢迎贡献——参见 [`CONTRIBUTING.md`](https://github.com/ZoliQua/Angular-Advanced-Odontogram/blob/main/CONTRIBUTING.md)。如果本项目对您有用，请[在 GitHub 上给它点亮星标](https://github.com/ZoliQua/Angular-Advanced-Odontogram)。
