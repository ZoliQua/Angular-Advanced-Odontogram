# Angular Odontogram Port — Phase 2: OdontogramShell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the React shell (`App.tsx`) to a working `OdontogramShellComponent` — the engine boots against an Angular-rendered DOM skeleton, all 18 props + 3 callbacks work, `DualStateConfirm` and the `I18nService` land, the demo app shows the working odontogram, and the shell-scoped excluded tests are ported and green.

**Architecture:** Per spec §4: the Angular template reproduces the App.tsx JSX skeleton with identical DOM ids/classes; `initOdontogram()` binds to it unchanged. Signal inputs + `effect()`s replace the 16 prop-sync `useEffect`s; one `onStateChange` subscription mirrors engine state into signals. Components use INLINE templates (no `templateUrl`) so vitest's JIT TestBed needs no template loader. `SettingsModal` and `ExportOptionsModal` remain Phase 3; `PerioChart`/`PerioSidebar` remain Phase 4 — their mount points render nothing yet.

**Tech Stack:** Angular 21 standalone components (OnPush, zoneless-compatible), Vitest 4 + jsdom + Angular TestBed (JIT), the Phase-1 core at `projects/angular-advanced-odontogram/src/lib/core/`.

**Source repo (read-only reference):** `/Users/Zoli/Sites/DentalQuoteCreator/src/modules/odontogram/engine` = `$ENGINE`. The React `App.tsx` (1,039 lines) is the transcription source of truth; never modify `$ENGINE`.

## Global Constraints

- Everything from Phase 1 still binds: core byte-identical (3 sanctioned deviations), payload 2.19 untouched, package `angular-advanced-odontogram` 0.1.0 MIT, npm.
- NO React anywhere; NO new runtime dependencies without controller approval (dev-deps for testing allowed per Task 1).
- DOM-contract rule: every id/class the engine queries (`#toothGrid`, `#cariesChecks`, `#modsChecks`, `#statusExtraSelect`, `#chartModeToggle`, `#btnStatus*`, …) must appear in the Angular template exactly as in App.tsx. The copied engine tests are the referee.
- Angular components: standalone, `changeDetection: ChangeDetectionStrategy.OnPush`, INLINE `template:` (vitest JIT cannot resolve `templateUrl`), signal `input()`/`output()`.
- Commit policy (repo-root `CLAUDE.md`, untracked): sole author `Zoltán Dul <zoltan.dul@gmail.com>`, no Co-Authored-By/AI attribution ever, backdated dates assigned per-dispatch by the controller (day 2026-08-05 onward, max 10/day, +02:00, both `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE`), one commit per task unless the dispatch says otherwise.

---

### Task 1: Angular component-test infrastructure under Vitest

**Files:**
- Create: `projects/angular-advanced-odontogram/src/lib/testing/angular-test-setup.ts`
- Create: `projects/angular-advanced-odontogram/src/lib/testing/smoke.spec.ts`
- Modify: `vitest.config.ts` (add the setup file to `setupFiles`, keep everything else)

**Interfaces:**
- Produces: a working `TestBed` in every vitest file — later tasks call `TestBed.configureTestingModule({ imports: [SomeComponent], providers: [provideZonelessChangeDetection()] })` and `TestBed.createComponent(...)` directly. No helper wrapper (YAGNI — TestBed's own API is the interface).

- [ ] **Step 1: Write the failing smoke test**

`projects/angular-advanced-odontogram/src/lib/testing/smoke.spec.ts`:

```ts
// Proves Angular components compile and render under vitest/jsdom (JIT).
import { describe, it, expect } from "vitest";
import { Component, ChangeDetectionStrategy, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";

@Component({
  selector: "aao-smoke",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button id="smokeBtn" (click)="n.set(n() + 1)">{{ n() }}</button>`,
})
class SmokeComponent { n = signal(0); }

describe("Angular TestBed under vitest", () => {
  it("renders and reacts to a click", async () => {
    TestBed.configureTestingModule({
      imports: [SmokeComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(SmokeComponent);
    await fixture.whenStable();
    const btn = fixture.nativeElement.querySelector("#smokeBtn") as HTMLButtonElement;
    expect(btn.textContent).toContain("0");
    btn.click();
    await fixture.whenStable();
    expect(btn.textContent).toContain("1");
  });
});
```

- [ ] **Step 2: Run it to verify it fails for the right reason**

Run: `npx vitest run projects/angular-advanced-odontogram/src/lib/testing/smoke.spec.ts`
Expected: FAIL — TestBed not initialized ("Need to call TestBed.initTestEnvironment") or missing `@angular/compiler`. A different failure class (transform/import errors) means config work is needed first.

- [ ] **Step 3: Write the setup file**

`projects/angular-advanced-odontogram/src/lib/testing/angular-test-setup.ts`:

```ts
// Initializes the Angular JIT test environment once per vitest worker.
// Components under test MUST use inline templates (templateUrl needs a
// build-time transform vitest doesn't have).
import "@angular/compiler";
import { getTestBed } from "@angular/core/testing";
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from "@angular/platform-browser/testing";

const testBed = getTestBed();
if (!(globalThis as Record<string, unknown>)["__aaoTestEnvInit"]) {
  testBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  (globalThis as Record<string, unknown>)["__aaoTestEnvInit"] = true;
}
```

In `vitest.config.ts`, extend `setupFiles` to
`[`./${TESTS}/setup.ts`, "./projects/angular-advanced-odontogram/src/lib/testing/angular-test-setup.ts"]`
and widen `include` with a second glob: `"projects/angular-advanced-odontogram/src/lib/**/*.spec.ts"` (the copied corpus keeps `.test.ts`; new Angular specs use `.spec.ts` so the two families are visually distinct).

If Angular's package layout differs (e.g. `platformBrowserTesting` not exported under that name in the installed v21 build), check `node_modules/@angular/platform-browser/testing/index.d.ts` for the current names (`BrowserTestingModule`/`platformBrowserTesting` are the v20+ names; the older `BrowserDynamicTestingModule` pair lives in `@angular/platform-browser-dynamic/testing`) and use what exists — the deliverable is a green smoke test, not a particular symbol name.

- [ ] **Step 4: Run the smoke test to green, then the whole suite**

Run: `npx vitest run projects/angular-advanced-odontogram/src/lib/testing/smoke.spec.ts` → PASS.
Run: `npm test 2>&1 | tail -4` → 96 passed files + 1 skipped (95 + this one), 0 failures.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: Angular TestBed infrastructure under Vitest"
```

---

### Task 2: I18nService

**Files:**
- Create: `projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.ts`
- Test: `projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.spec.ts`
- Modify: `projects/angular-advanced-odontogram/src/public-api.ts` (export the service)

**Interfaces:**
- Consumes: core bus `t`, `getI18nLanguage`, `setI18nLanguage`, `onI18nChange` from `../core/i18n/useI18n` and `Language` from `../core/i18n/translations`.
- Produces: `I18nService` (`providedIn: "root"`): `readonly lang: Signal<Language>` (mirrors the module-level language), `setLanguage(lang: Language): void` (delegates to `setI18nLanguage`), `t(key: string, params?: Record<string, string | number>): string` (delegates to core `t`, always current language). The controlled/uncontrolled prop semantics from the React `useI18n` hook live in the SHELL component (Task 4), not here — the service is a thin reactive facade over the singleton bus.

- [ ] **Step 1: Write the failing tests**

`projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.spec.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { I18nService } from "./i18n.service";
import { setI18nLanguage } from "../core/i18n/useI18n";

describe("I18nService", () => {
  beforeEach(() => {
    setI18nLanguage("en"); // reset the module-level singleton between tests
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  it("mirrors the core language into the lang signal", () => {
    const svc = TestBed.inject(I18nService);
    expect(svc.lang()).toBe("en");
    setI18nLanguage("hu");
    expect(svc.lang()).toBe("hu");
  });

  it("setLanguage drives the core bus (and thus t())", () => {
    const svc = TestBed.inject(I18nService);
    svc.setLanguage("hu");
    expect(svc.lang()).toBe("hu");
    // app.title exists in every language table; hu differs from en
    expect(svc.t("app.title")).not.toBe("");
  });

  it("t() resolves template params like the core t()", () => {
    const svc = TestBed.inject(I18nService);
    const raw = svc.t("app.title", { x: 1 }); // params on a paramless key are a no-op
    expect(typeof raw).toBe("string");
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx vitest run projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.spec.ts` → FAIL (module not found).

- [ ] **Step 3: Implement**

`projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.ts`:

```ts
// Reactive facade over the engine's framework-free i18n bus (core/i18n/useI18n).
// The bus stays the single source of truth — the engine's own localized
// repaints subscribe to it directly; this service only mirrors it for
// Angular templates. Controlled/uncontrolled language-prop semantics live in
// OdontogramShellComponent, mirroring the React useI18n hook.
import { Injectable, NgZone, Signal, signal } from "@angular/core";
import {
  t as coreT,
  getI18nLanguage,
  setI18nLanguage,
  onI18nChange,
} from "../core/i18n/useI18n";
import type { Language } from "../core/i18n/translations";

@Injectable({ providedIn: "root" })
export class I18nService {
  private readonly _lang = signal<Language>(getI18nLanguage());
  readonly lang: Signal<Language> = this._lang.asReadonly();

  constructor() {
    onI18nChange((lang) => this._lang.set(lang));
  }

  setLanguage(lang: Language): void {
    setI18nLanguage(lang);
  }

  t(key: string, params?: Record<string, string | number>): string {
    return params === undefined ? coreT(key) : coreT(key, params);
  }
}
```

(Remove the unused `NgZone` import if the linter flags it — it is not needed.)

- [ ] **Step 4: Run tests** — the spec file → PASS; then `npm test 2>&1 | tail -4` → all green.

- [ ] **Step 5: Export from `public-api.ts`** — add `export * from "./lib/i18n/i18n.service";` and verify `npx ng build angular-advanced-odontogram` is green.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: I18nService facade over the engine i18n bus"
```

---

### Task 3: DualStateConfirmComponent

**Files:**
- Create: `projects/angular-advanced-odontogram/src/lib/components/dual-state-confirm/dual-state-confirm.component.ts`
- Test: `projects/angular-advanced-odontogram/src/lib/components/dual-state-confirm/dual-state-confirm.component.spec.ts`
- Modify: `projects/angular-advanced-odontogram/src/public-api.ts`

**Interfaces:**
- Consumes: `I18nService` (Task 2) for labels.
- Produces: `DualStateConfirmComponent`, selector `aao-dual-state-confirm`, inputs `open: input.required<boolean>()`, outputs `accept = output<void>()`, `cancel = output<void>()`. Renders NOTHING when `open` is false. The shell (Task 5) binds `[open]="confirmOpen()"`, `(accept)="onDualStateAccept()"`, `(cancel)="onDualStateCancel()"`.

**Transcription source:** `$ENGINE/src/DualStateConfirm.tsx` (125 lines). Port its contract exactly: backdrop `onMouseDown` on self → cancel (source 89-91); Escape → cancel; Tab/Shift+Tab manual focus trap over visible focusable elements (56-82); on open, focus first focusable and restore the opener's focus on close (45-54); same class names (`.ds-confirm-backdrop`, `.ds-confirm-dialog`, and every other class in the TSX) and the same `t()` keys (`dualState.title`, `dualState.body`, `dualState.cancel`, `dualState.accept` — read the exact key set from the source; do not invent keys). Implement focus/trap logic in the component class with `ElementRef`+`effect()` on `open` — not in the template.

- [ ] **Step 1: Write the failing tests** — port the component-render assertions from `$ENGINE/src/__tests__/ds1-confirm.test.ts` (its `render(createElement(DualStateConfirm, ...))` block at ~line 299-340) into Angular form:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { DualStateConfirmComponent } from "./dual-state-confirm.component";

@Component({
  imports: [DualStateConfirmComponent],
  template: `<aao-dual-state-confirm [open]="open()" (accept)="accepted = true" (cancel)="cancelled = true" />`,
})
class HostComponent { open = signal(false); accepted = false; cancelled = false; }

describe("DualStateConfirmComponent", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideZonelessChangeDetection()] });
  });

  it("renders nothing while closed", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector(".ds-confirm-dialog")).toBeNull();
  });

  it("opens, fires accept, and closes cleanly", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector(".ds-confirm-dialog") as HTMLElement;
    expect(dialog).not.toBeNull();
    (dialog.querySelectorAll("button")[1] as HTMLButtonElement).click(); // accept is the 2nd button, as in the TSX
    await f.whenStable();
    expect(f.componentInstance.accepted).toBe(true);
  });

  it("Escape fires cancel", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector(".ds-confirm-dialog") as HTMLElement;
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.cancelled).toBe(true);
  });
});
```

Adjust the exact class-name selectors to the REAL ones from the TSX after reading it (the test must assert the same classes App.css styles) — the two-button order (cancel then accept) comes from source lines 107-120.

- [ ] **Step 2: Run to verify failure** → FAIL (module not found).
- [ ] **Step 3: Implement the component** (inline template transcribing the TSX markup; class logic per the Transcription-source paragraph).
- [ ] **Step 4: Run its spec → PASS; `npm test` → all green.**
- [ ] **Step 5: Export from public-api; `npx ng build angular-advanced-odontogram` green.**
- [ ] **Step 6: Commit** — `git commit -m "feat: DualStateConfirm dialog component"`

---

### Task 4: OdontogramShellComponent — static skeleton, lifecycle, prop syncs

**Files:**
- Create: `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/odontogram-shell.component.ts`
- Test: `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/odontogram-shell.component.spec.ts`
- Modify: `projects/angular-advanced-odontogram/src/public-api.ts`

**Interfaces:**
- Consumes: engine API from `../../core/odontogram` (`initOdontogram`, `destroyOdontogram`, `setNumberingSystem`, `setReadOnly`, `setNotesEnabled`, `setIcdasEnabled`, `setPulpDetailLevel`, `setSecondaryCariesMode`, `setRootCariesMode`, `setRadiographicDepthMode`, `setCariesDepthEnabled`, `setWearDetailLevel`, `setDiscolorationDetailLevel`, `setSurfaceNotation`, `registerPlugins`, `onStateChange`, `getOdontogramSummary`, `formatToothLabel`, `hasAnyPerioData`, `isPerioOverlayOpen`, `getPerioViewMode`, `isDualStateConfirmPending`, `acceptDualStateConfirm`, `cancelDualStateConfirm`); `applyThemeConfig` from `../../core/theme`; `I18nService`; generated icons from `../../core/generated/icon-svgs`.
- Produces: `OdontogramShellComponent`, selector `aao-odontogram-shell`, standalone. Inputs (all optional signal `input()`s, names = React props): `language`, `numberingSystem`, `darkMode`, `themeConfig`, `plugins`, `readOnly`, `enableNotes`, `enableIcdas`, `pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `cariesDepthEnabled`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`. Outputs: `languageChange = output<Language>()`, `numberingChange = output<NumberingSystem>()`, `darkModeChange = output<boolean>()`. Internal signals later tasks bind: `summary`, `confirmOpen`, `hasPerio`, `viewMode`, `activeView`, `languageOpen`, `exportOpen`, `importOpen`, `settingsOpen`, `pdfOpen`.

**Transcription sources (exact):** App.tsx JSX `515-516` (root div, `dir`/`lang` reactive), `663-695` (chart section: `#chartModeToggle` 669-673, `#proposedLegend` 680-683, toolbar 685-691, empty `#toothGrid` 694), `738-1012` static `<aside class="panel">` (panel-header 743-775 incl. `#activeToothLabel`, `#controlsActions`, `#warnings`; `#statusCard` 778-798; tooth card 800-885 with every row/select id; `#orthoCard` 887-909; `#cariesSection` 911-929; `#fillingSection` 931-949; `#rootPeriodontiumSection` 951-1008). Transcribe JSX→Angular mechanically: `className`→`class`, `htmlFor`→`for`, self-closing divs expanded, React conditional visibility for `showStatusCard`/`showOrthoCard` → `@if`. Static label text goes through `i18n.t(...)` with the same keys App.tsx uses. Toolbar icon buttons carry `[attr.data-icon-src]` bound to the generated icon strings (`iconOcclSvg`, `icon8Svg`, `iconGumSvg`, `iconPulpSvg`) — the engine's `loadInlineIcon` parses that attribute itself; `#btnSelectNoneChart` uses `<img [src]="iconNoSelectionUrl">`. This task SKIPS the topbar, perio-launch bar, tooth-info card, and modal mounts (Task 5) — leave a single `<!-- Task 5: topbar/dynamic sections -->` comment where they go.

**Class logic (transcription of App.tsx 295-469, minus Task-5 parts):**
- `ngAfterViewInit` → `void initOdontogram();` `ngOnDestroy` → `destroyOdontogram()` + unsubscribe every `onStateChange` (App.tsx 320-325).
- One constructor-scope `effect()` per prop sync, exactly mirroring App.tsx 327-391: read the input signal, `?? default`, call the engine setter (13 setters + the two card-visibility locals). Defaults verbatim from App.tsx: notes false, icdas false, pulp "aae", secondary "standard", root "simple", radiographic "off", cariesDepth true, wear "complex", discoloration "complex", notation "full", both cards true.
- `onStateChange` subscriptions → signals (App.tsx 395-452): `summary` (from `getOdontogramSummary()`, gated on `toothInfoOn`), `hasPerio`, `perioOpen`, `viewMode`, `confirmOpen` (from `isDualStateConfirmPending()`). perioRowVisibility/perioIndexNameMode mirrors are Phase-3/4 consumers — skip until then (YAGNI).
- Language: controlled/uncontrolled per the React hook (useI18n.ts 68-91): `lang = computed(() => this.language() ?? this.i18n.lang())`; an `effect()` pushes `lang()` into `i18n.setLanguage(...)`; `setLang(next)` emits `languageChange` and, when `language()` is undefined (uncontrolled), also calls `i18n.setLanguage(next)`. Root div binds `[attr.dir]="isRtl() ? 'rtl' : 'ltr'"` (RTL only for `ar`) and `[attr.lang]="lang()"`.
- Numbering: `currentNumbering = computed(() => this.numberingSystem() ?? this.internalNumbering())`; effect calls `setNumberingSystem(currentNumbering())`.
- Dark mode + themeConfig application: implement now (small): effect—when `darkMode()` is undefined (standalone) toggle the `dark` class on `document.documentElement` from the internal signal (App.tsx 295-299); effect—`applyThemeConfig(this.host.nativeElement.querySelector(".odontogram-root"), this.themeConfig())` when set (App.tsx 332-334).

- [ ] **Step 1: Write the failing spec** — DOM-contract test with the engine MOCKED (same strategy as `$ENGINE/src/__tests__/App.test.tsx` lines 16-17: mock `initOdontogram`/`destroyOdontogram`, keep the rest real via `importActual`):

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
vi.mock("../../core/odontogram", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, initOdontogram: vi.fn().mockResolvedValue(undefined), destroyOdontogram: vi.fn() };
});
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { OdontogramShellComponent } from "./odontogram-shell.component";
import { initOdontogram, destroyOdontogram } from "../../core/odontogram";

const MUST_HAVE_IDS = [
  "toothGrid", "chartModeToggle", "chartModeStatus", "chartModePlan", "proposedLegend",
  "btnOcclView", "btnWisdomVisible", "btnBoneVisible", "btnPulpVisible", "btnSelectNoneChart",
  "activeToothLabel", "controlsActions", "warnings", "statusCard", "btnResetAll",
  "statusExtraSelect", "statusExtraApply", "toothSelect", "substrateSelect", "restorationRow",
  "restorationSelect", "crownLeakageRow", "orthoCard", "cariesSection", "cariesChecks",
  "cariesSubcrownRow", "rootCariesSelect", "fillingSection", "fillingSelect", "fillingSurfaceChecks",
  "rootPeriodontiumSection", "mobilityRow", "modsChecks", "periImplantRow",
];

describe("OdontogramShellComponent skeleton", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OdontogramShellComponent], providers: [provideZonelessChangeDetection()] });
  });

  it("renders every engine-contract DOM id and boots/destroys the engine", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    for (const id of MUST_HAVE_IDS) {
      expect(f.nativeElement.querySelector(`#${id}`), `#${id} missing`).not.toBeNull();
    }
    expect(initOdontogram).toHaveBeenCalledTimes(1);
    f.destroy();
    expect(destroyOdontogram).toHaveBeenCalledTimes(1);
  });

  it("hides statusCard/orthoCard when the inputs say so", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("showStatusCard", false);
    f.componentRef.setInput("showOrthoCard", false);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#statusCard")).toBeNull();
    expect(f.nativeElement.querySelector("#orthoCard")).toBeNull();
  });
});
```

Extend `MUST_HAVE_IDS` while transcribing: every id you port from App.tsx joins the list — the final list is the DOM contract inventory for the sections in this task's scope.

- [ ] **Step 2: Run to verify failure** → FAIL (module not found).
- [ ] **Step 3: Implement** component per the Transcription sources + Class logic paragraphs. Open `$ENGINE/src/App.tsx` side-by-side and transcribe section by section; do not paraphrase structure.
- [ ] **Step 4: Run the spec → PASS; `npm test` → all green; `npx ng build angular-advanced-odontogram` → green** (AOT compiles the inline template — template syntax errors surface here).
- [ ] **Step 5: Export from public-api (`export * from "./lib/components/odontogram-shell/odontogram-shell.component";`).**
- [ ] **Step 6: Commit** — `git commit -m "feat: OdontogramShell static skeleton, engine lifecycle, prop syncs"`

---

### Task 5: Shell dynamic sections — topbar, menus, tooth-info, view bar, modal mounts

**Files:**
- Modify: `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/odontogram-shell.component.ts`
- Test: extend `odontogram-shell.component.spec.ts`

**Interfaces:**
- Consumes: Task 4's component + signals; `DualStateConfirmComponent` (Task 3); engine functions already imported.
- Produces: the complete Phase-2 shell. Selector/API unchanged.

**Transcription sources (exact App.tsx lines):** topbar `517-619` (brand 521-522; tour button 526-528 wired to `startIntroTour` from `../../core/tour`; language dropdown 529-551 driven by `languageOpen` signal; dark toggle 552-568; settings button 569-573 — sets `settingsOpen` signal, renders NO modal yet, add comment `<!-- Phase 3: SettingsModal -->`; the 9 hidden proxy buttons 575-582+605 with their exact ids `btnStatusExport btnStatusFhirExport btnStatusPngExport btnStatusJpgExport btnStatusSvgExport btnPerioSvgExport btnPerioPngExport btnPerioJpgExport btnStatusImport`; export dropdown 583-604 — each item proxy-clicks its hidden button via `document.getElementById(...)?.click()` exactly as React does, perio items get `[disabled]="!hasPerio()"`, the PDF item sets `pdfOpen` and renders NO modal yet `<!-- Phase 3: ExportOptionsModal -->`; import dropdown 606-616 calling `setImportFormat("status"|"fhir")` + proxy-click; hidden `#statusImportInput` file input 617). Perio-launch bar `622-658` (`#appViewToggle` with `#appViewOdontogram`/`#appViewDentalChart` tabs when `viewMode()==='toggle'`, else `#openPerioOverlayBtn` calling `openPerioOverlay()`; the dental-chart column 733-737 renders an empty div with comment `<!-- Phase 4: PerioChart inline -->`; the aside's `isPerioView` branch 739-740 renders an empty `<aside class="panel">` with `<!-- Phase 4: PerioSidebar -->`). Tooth-info card `696-731` (`@if (toothInfoOn() && summary(); as s)`, sections loop 702-709 via `@for`, `#plannedChangesBox` 710-719 with `formatToothLabel`, implants 720-725, periodontal 726-729). Click-away: one `document` click listener (App.tsx 454-469) registered in `ngAfterViewInit`, removed in `ngOnDestroy`, closing `languageOpen`/`exportOpen`/`importOpen` when the click lands outside their respective container elements (use `ElementRef.nativeElement.querySelector` against stable wrapper classes, same classes as the TSX). Mount `<aao-dual-state-confirm [open]="confirmOpen()" (accept)="acceptDualStateConfirm()" (cancel)="cancelDualStateConfirm()" />` (App.tsx 1025-1030 equivalent).

- [ ] **Step 1: Write the failing tests** — extend the spec with (a) topbar contract ids (`btnExportMenu`, `btnImportMenu`, all 9 hidden proxy ids, `statusImportInput`) joining `MUST_HAVE_IDS`; (b) language dropdown opens on click and closes on outside click; (c) export menu: perio items disabled when `hasAnyPerioData()` is false; (d) DualStateConfirm appears when the engine confirm becomes pending — drive it via the real engine: `importActual`'s `__setToothStateForTest`-free path is complex, so instead mock `isDualStateConfirmPending` to a controllable `vi.fn()` in the module mock and flip it + fire a manual `onStateChange` notification via the real `notifyStateChange` export if available; if not exported, drive `confirmOpen` by calling the mocked engine's registered `onStateChange` callback captured from the real implementation — document in the spec which route you took; (e) summary card renders section labels from a stubbed `getOdontogramSummary` (mock returns a small fixed summary object matching the `OdontogramSummary` type).
- [ ] **Step 2: Run to verify the new tests fail.**
- [ ] **Step 3: Implement** per the transcription sources.
- [ ] **Step 4: Spec green; `npm test` all green; `ng build` green.**
- [ ] **Step 5: Commit** — `git commit -m "feat: OdontogramShell topbar, menus, summary card, confirm wiring"`

---

### Task 6: Port the shell-scoped excluded tests

**Files:**
- Modify: `vitest.config.ts` (shrink `REACT_DEPENDENT`)
- Create: ported `.spec.ts` files under `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/ported/` (one per ported source test, same base name, e.g. `r2a-toggle-ui.spec.ts`)

**Interfaces:**
- Consumes: the complete shell (Tasks 4-5), DualStateConfirm (Task 3), TestBed infra (Task 1).
- Produces: the Phase-2 test batch green; the exclusion list annotated so Phase 3/4 know what remains.

**Classification rule (apply to every entry still in `REACT_DEPENDENT`):** a test is PHASE-2-PORTABLE iff its React usage is only (a) mounting `<App/>` as DOM scaffolding (with the engine lifecycle mocked, per the App.test.tsx pattern), and/or (b) rendering `DualStateConfirm`, and it does NOT depend on `SettingsModal`, `ExportOptionsModal`, `PerioChart`, or `PerioSidebar` markup. Expected Phase-2 batch (verify each against its source before porting; move to the correct later phase if the source says otherwise): `App.test.tsx`, `ds1-confirm.test.ts`, `ds1-confirm-revert.test.tsx`, `warnings.test.ts`, `summary.test.ts`, `restoration-summary.test.ts`, `secondary-caries-parity.test.ts`, `useI18n.test.ts`, `public-api-exports.test.ts`, `r2a-toggle-ui.test.ts`, `r2b-changes-box.test.ts`, `r2b-plan-diff.test.ts`, `r2c-proposed-legend.test.ts`, `sp6-task2-caries-popup.test.ts`, `sp6-task4-subcaries-summary-incisal.test.ts`, `sp7-card-merge.test.ts`, `sp8-peri-implant-ui.test.ts`, `sp9-summary-tooltip.test.ts`, `sp10-filling-defect-summary.test.ts`, `sp11-wear-summary.test.ts`, `sp11-wear-ui.test.ts`, `sp12-discoloration-summary.test.ts`, `sp12-discoloration-ui.test.ts`, `sp12-discoloration.test.ts`, `sp14-ortho-summary.test.ts`, `sp14-ortho-ui.test.ts`, `sp15-settings.test.ts`(→likely Phase 3 — check), `sp15-stale-render.test.ts`, `sp16-fillings-card.test.ts`, `sp17-followups.test.ts`, `sp18-periimplant-roundtrip.test.ts`, `sp10-filling-defect.test.ts`, `sp13-wear-layout.test.ts`(check), `p4a-case-meta.test.ts`, `ui-ar-rtl.test.tsx`. Settings-dependent (`sp13-settings-tab`, `settings-modal-a11y`, `ui2-perio-settings`, likely `sp15-settings`) stay for Phase 3; perio-chart-dependent (`perio-*`, `pg*`, `ui1-*`, `ui2-index-names`, `ui2-row-visibility`, `ui3*`, `p4a-case-panel`, `p4b-classification-ui`, `perio-polish-diff`, `pgd-summary`, `pge-summary`, `perio-graphic-rows`, `perio-graphical-presentation`) stay for Phase 4.
- **Porting mechanics per file:** copy the source test; replace `render(<App/>)`/`render(createElement(App))` + `@testing-library/react` with `TestBed.createComponent(OdontogramShellComponent)` + `await fixture.whenStable()`; replace `cleanup()` with `fixture.destroy()`; keep the `vi.mock` of the engine EXACTLY as the source does (path becomes `../../../core/odontogram`); keep every assertion and helper unchanged — the DOM ids match by construction. `useI18n.test.ts`: port only the bus part is already covered (it runs against core); its hook-section describe blocks become I18nService/shell-language tests or are dropped with a comment naming the Angular equivalent spec that covers the behavior. A test that cannot be made green without touching core or changing its assertions: leave it excluded, annotate why, and report it — do NOT weaken assertions.
- The original copied `.test.ts` files under `core/__tests__/` STAY in the exclusion list permanently (they are the verbatim React corpus; the ported `.spec.ts` files are the running versions). Update the `REACT_DEPENDENT` comment to say exactly that: each entry is either `ported: <spec path>` or `phase-3` / `phase-4`.

- [ ] **Step 1:** For each Phase-2-portable test: port → run the single spec → green, one by one. Keep a running list.
- [ ] **Step 2:** Update `vitest.config.ts` comments/annotations per above.
- [ ] **Step 3:** `npm test` → expected ~96 + (number ported) files passed, 0 failures; record exact counts.
- [ ] **Step 4:** Commit — `git commit -m "test: port shell-scoped React tests to Angular specs"` (the controller may split this task across two commits/date slots if the port list runs long — ask before committing twice).

---

### Task 7: Demo app, docs, phase close

**Files:**
- Modify: `projects/demo/src/app/app.ts`, `app.html`, `app.config.ts`, `projects/demo/src/styles.css`, `angular.json` (demo styles), `README.md`, `CHANGELOG.md`
- Modify: `docs/superpowers/specs/2026-08-06-angular-odontogram-port-design.md` (mark Phase-2 scope delivered; note DualStateConfirm moved from Phase 3 to Phase 2)

**Interfaces:**
- Consumes: the full shell via the library's public API (import from the built path alias `angular-advanced-odontogram` if the workspace tsconfig maps it — it does, ng-generated `paths`; else relative import — prefer the mapped alias, it exercises the public API exactly as a consumer).
- Produces: `ng serve demo` shows the working odontogram (mirrors `$ENGINE/src/main.tsx`: `<aao-odontogram-shell [enableNotes]="true" />`).

- [ ] **Step 1:** Demo `app.html` = `<aao-odontogram-shell [enableNotes]="true" />`; `app.ts` imports the component; global styles: import the built library CSS in demo — add `projects/angular-advanced-odontogram/styles.css` to the demo's `styles` array in `angular.json` with a comment that `npm run build:styles` must run first (document in README).
- [ ] **Step 2:** `npm run build:styles && npx ng build demo` → green. Then `npx ng serve demo` briefly (or `ng build` + a static file check) and verify in the served HTML that `#toothGrid` receives engine-rendered SVG children (the controller will do a browser smoke check at review time — note readiness in the report).
- [ ] **Step 3:** README: Phase 2 checked in the status list; usage snippet for the component (inputs/outputs table NOT needed yet — one `<aao-odontogram-shell>` example). CHANGELOG `[Unreleased] Added`: shell component, I18nService, DualStateConfirm, ported test batch, demo. Spec: §8 phase-2 line annotated done + the DualStateConfirm scope note.
- [ ] **Step 4:** Full gate: `npm test` + `npm run build:styles` + `npx ng build angular-advanced-odontogram` + `npx ng build demo` — all green.
- [ ] **Step 5:** Commit — `git commit -m "feat: demo renders the odontogram shell; phase 2 docs"`

---

## Deferred to later phases (explicit)

- Phase 3: `SettingsModalComponent` (tabs incl. periodontal), `ExportOptionsModalComponent` + the PDF menu item's modal, settings-dependent test batch.
- Phase 4: `PerioChartComponent`, `PerioSidebarComponent`, perio test batch, perio exports UI enablement checks.
- Phase 5: packaging polish (dist README/LICENSE, packageManager pin removal, CHANGELOG links), typedoc, remaining READMEs, 1.0.0 acceptance (spec §7).
