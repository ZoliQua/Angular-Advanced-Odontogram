// Angular port of $ENGINE/src/__tests__/App.test.tsx's mount/unmount contract
// (lines 16-17 mock strategy) applied to the Phase 2 Task 4 static skeleton:
// every DOM id the imperative engine (odontogram.ts) queries via
// document.getElementById/querySelector must exist once the shell renders,
// and the engine lifecycle (initOdontogram/destroyOdontogram) must be driven
// exactly once per mount/destroy.
//
// NOTE on deviation from the brief's literal spec code: the brief's Step 1
// mocks initOdontogram/destroyOdontogram via `vi.mock("../../core/odontogram",
// ...)` + `importOriginal` (mirroring App.test.tsx). Under `npm run test:ng`
// (the Angular unit-test builder, ngtsc) that throws unconditionally:
// `@angular/build`'s Vitest integration patches `vi.mock`/`vi.doMock`/etc. to
// hard-reject any relative-path specifier with "The 'vi.mock' and related
// methods are not supported for relative imports with the Angular unit-test
// system. Please use Angular TestBed for mocking dependencies." (see
// `node_modules/@angular/build/src/builders/unit-test/runners/vitest/build-options.js`).
// `vi.spyOn` on the real module namespace also fails (`Cannot redefine
// property: initOdontogram` — the compiled exports are non-configurable), and
// mocking via an absolute `file://` URL specifier (which bypasses the
// relative-path check) resolves to a *different* module-cache entry than the
// component's own relative import, so it never intercepts the real call.
// The component therefore takes engine lifecycle through the
// `ODONTOGRAM_ENGINE_LIFECYCLE` DI token (see odontogram-shell.component.ts)
// — the exact seam the builder's own error message points at — and this spec
// overrides it via TestBed's provider array instead of module-mocking.
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "./odontogram-shell.component";
// Task 5: the topbar/menus/tooth-info/confirm-mount tests below drive the
// REAL engine module through its exported test seams (same route as
// `core/__tests__/ds1-confirm.test.ts` and the summary-seeding corpus tests)
// rather than mocking `core/odontogram` — see the task-5 report for why
// `vi.mock` is unavailable under `npm run test:ng` (Task 4's note above).
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  acceptDualStateConfirm,
  cancelDualStateConfirm,
  formatToothLabel,
  getToothPerio,
  isDualStateConfirmPending,
  setChartMode,
  setPerioSite,
} from "../../core/odontogram";
import { setI18nLanguage, t } from "../../core/i18n/useI18n";

const initOdontogram = vi.fn().mockResolvedValue(undefined);
const destroyOdontogram = vi.fn();

// DOM contract inventory for this task's scope (chart section 663-695 +
// aside.panel 738-1012 of App.tsx) — every id transcribed from those ranges
// joins this list, per the task brief.
const MUST_HAVE_IDS = [
  // chart section
  "chartModeToggle", "chartModeStatus", "chartModePlan", "chartModePlanBadge", "proposedLegend",
  "btnOcclView", "btnWisdomVisible", "btnBoneVisible", "btnPulpVisible", "btnSelectNoneChart",
  "toothGrid",
  // panel header
  "btnSelectNone", "btnToggleControlsCard", "activeToothLabel", "controlsActions",
  "btnSelectAll", "btnSelectAllPresent", "btnSelectPermanent", "btnSelectMilk",
  "btnSelectImplants", "btnSelectAllMissing", "btnSelectUpper", "btnSelectUpperFront",
  "btnSelectUpperMolar", "btnSelectLower", "btnSelectLowerFront", "btnSelectLowerMolar",
  "warnings",
  // statusCard
  "statusCard", "btnToggleStatusCard", "statusCardBody", "btnResetAll", "btnPrimaryDentition",
  "btnMixedDentition", "btnEdentulous", "statusExtraSelect", "statusExtraApply",
  // tooth card
  "btnResetTooth", "toothSelect", "substrateRow", "substrateSelect", "extractionRow",
  "extractionWound", "missingClosedRow", "missingClosed", "restorationRow", "restorationSelect",
  "crownLeakageRow", "crownLeakage", "brokenCrownRow", "brokenMesial", "brokenIncisal",
  "brokenDistal", "contactPointRow", "contactMesial", "contactDistal", "bruxismRow",
  "wearEdgeRow", "wearEdgeSelectLabel", "wearEdgeSelect", "wearEdgeToggleLabel", "wearEdgeToggle",
  "wearCervicalRow", "wearCervicalSelectLabel", "wearCervicalSelect", "wearCervicalToggleLabel",
  "wearCervicalToggle", "discolorationRow", "discolorationSelectLabel", "discolorationSelect",
  "discolorationToggleLabel", "discolorationToggle", "crownActionsRow", "bridgePillarRow",
  "bridgePillar", "extractionPlanRow", "extractionPlan", "crownReplaceRow", "crownReplace",
  "crownNeededRow", "crownNeeded",
  // orthoCard
  "orthoCard", "orthoApplianceRow", "orthoApplianceSelect", "orthoDriftRow", "orthoDriftSelect",
  "orthoVerticalRow", "orthoVerticalSelect", "orthoRotationRow", "orthoRotationToggle",
  // cariesSection
  "cariesSection", "btnToggleCariesCard", "cariesDepthRow", "cariesDepthSelect", "cariesChecks",
  "cariesSubcrownRow", "rootCariesRow", "rootCariesSelect",
  // fillingSection
  "fillingSection", "btnToggleFillingCard", "fillingSelect", "fillingSurfaceChecks",
  "fissureSealingRow", "fissureSealing", "fillingSubcariesSummary", "fillingDefectSummary",
  // rootPeriodontiumSection
  "rootPeriodontiumSection", "btnToggleRootPeriodontiumCard", "rpRootBlock", "pulpEndoRow",
  "pulpEndoSelect", "apicalDxRow", "apicalDxSelect", "periapicalTypeRow", "periapicalTypeSelect",
  "resorptionRow", "resorptionSelect", "endoResection", "parapulpalPin", "rpPerioBlock",
  "mobilityRow", "mobilitySelect", "perioRow", "perioGrid", "perioReadout", "modsChecks",
  "calculusRow", "calculusToggle", "periImplantRow", "periImplantSelect",
  // Task 5: topbar contract ids (App.tsx 517-619) — btnExportMenu/
  // btnImportMenu toggle the two dropdowns; the 9 hidden proxy buttons +
  // statusImportInput are the engine's own wireControls() capture targets
  // (odontogram.ts ~8840-8878), asserted null-safely there but always
  // rendered here regardless of showStatusCard/showOrthoCard.
  "btnExportMenu", "btnImportMenu",
  "btnStatusExport", "btnStatusFhirExport", "btnStatusPngExport", "btnStatusJpgExport",
  "btnStatusSvgExport", "btnPerioSvgExport", "btnPerioPngExport", "btnPerioJpgExport",
  "btnStatusImport", "statusImportInput",
];

describe("OdontogramShellComponent skeleton", () => {
  beforeEach(() => {
    initOdontogram.mockClear();
    destroyOdontogram.mockClear();
    TestBed.configureTestingModule({
      imports: [OdontogramShellComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ODONTOGRAM_ENGINE_LIFECYCLE,
          useValue: { init: initOdontogram, destroy: destroyOdontogram },
        },
      ],
    });
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

  // Controller-mandated correction (post-review): App.tsx keeps #statusCard
  // /#orthoCard permanently MOUNTED (782/891 — `className={showX ? "" : "hidden"}`
  // on a wrapper div), never unmounted via a conditional. The engine
  // dereferences #btnResetAll/#btnPrimaryDentition/#btnMixedDentition/
  // #orthoApplianceSelect/#orthoRotationToggle/#orthoCard without null guards
  // during initOdontogram()/sync (odontogram.ts:8692/8711/8648/8657/3899), so
  // unmounting them would break boot whenever a host passes `false`.
  it("keeps statusCard/orthoCard MOUNTED (hidden via wrapper class) when the inputs say so", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("showStatusCard", false);
    f.componentRef.setInput("showOrthoCard", false);
    await f.whenStable();

    const statusCard = f.nativeElement.querySelector("#statusCard");
    const orthoCard = f.nativeElement.querySelector("#orthoCard");
    expect(statusCard, "#statusCard must stay mounted").not.toBeNull();
    expect(orthoCard, "#orthoCard must stay mounted").not.toBeNull();
    expect(statusCard.parentElement.classList.contains("hidden")).toBe(true);
    expect(orthoCard.parentElement.classList.contains("hidden")).toBe(true);

    // Pin the DOM contract the real engine relies on: even with both cards
    // hidden, the real (unmocked here — only the lifecycle *call site* is
    // DI-faked) initOdontogram()'s unguarded `#btnResetAll` dereference would
    // still resolve against this DOM.
    expect(f.nativeElement.querySelector("#btnResetAll"), "#btnResetAll missing").not.toBeNull();
  });

  it("root div reflects RTL only for Arabic and the current language", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("language", "ar");
    await f.whenStable();
    const root = f.nativeElement.querySelector(".odontogram-root");
    expect(root.getAttribute("dir")).toBe("rtl");
    expect(root.getAttribute("lang")).toBe("ar");

    f.componentRef.setInput("language", "en");
    await f.whenStable();
    expect(root.getAttribute("dir")).toBe("ltr");
    expect(root.getAttribute("lang")).toBe("en");
  });
});

// ---------------------------------------------------------------------------
// Task 5: topbar, menus, tooth-info card, view bar, confirm mount.
//
// Mocking routes, per test case (see task-5-report.md for the full
// rationale): the engine lifecycle (init/destroy) is still DI-faked exactly
// as above; every OTHER engine entry point below is the REAL, unmocked
// `core/odontogram` export, driven through its own public API and `__*ForTest`
// seams — the same route `core/__tests__/ds1-confirm.test.ts` and the
// corpus's `getOdontogramSummary()` tests use. `__resetChartStateForTest()`
// (+ pinning the i18n language) runs in `beforeEach` because the engine
// module is a real singleton shared across every test in this file.
// ---------------------------------------------------------------------------
describe("OdontogramShellComponent Task 5: dynamic sections", () => {
  beforeEach(() => {
    initOdontogram.mockClear();
    destroyOdontogram.mockClear();
    __resetChartStateForTest();
    setI18nLanguage("en");
    TestBed.configureTestingModule({
      imports: [OdontogramShellComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ODONTOGRAM_ENGINE_LIFECYCLE,
          useValue: { init: initOdontogram, destroy: destroyOdontogram },
        },
      ],
    });
  });

  it("(b) the language dropdown opens on click and closes on an outside click", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const groups = f.nativeElement.querySelectorAll(".topbar-group.dropdown");
    const languageGroup = groups[0] as HTMLElement;
    expect(languageGroup.querySelector(".dropdown-menu")).toBeNull();

    (languageGroup.querySelector("button.btn-theme") as HTMLButtonElement).click();
    await f.whenStable();
    expect(languageGroup.querySelector(".dropdown-menu")).not.toBeNull();

    document.body.click();
    await f.whenStable();
    expect(languageGroup.querySelector(".dropdown-menu")).toBeNull();
  });

  it("(b) selecting a language item closes the dropdown and emits languageChange", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    const emitted: string[] = [];
    f.componentInstance.languageChange.subscribe((l) => emitted.push(l));
    await f.whenStable();

    const languageGroup = f.nativeElement.querySelectorAll(".topbar-group.dropdown")[0] as HTMLElement;
    (languageGroup.querySelector("button.btn-theme") as HTMLButtonElement).click();
    await f.whenStable();
    const items = languageGroup.querySelectorAll(".dropdown-item");
    // App.tsx 160-173 order: hu, en, de, ... — index 2 is "de".
    (items[2] as HTMLButtonElement).click();
    await f.whenStable();

    expect(emitted).toEqual(["de"]);
    expect(languageGroup.querySelector(".dropdown-menu")).toBeNull();
  });

  it("(c) the export menu's perio items are disabled while hasAnyPerioData() is false", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const exportGroup = f.nativeElement.querySelectorAll(".topbar-group.dropdown")[1] as HTMLElement;
    (exportGroup.querySelector("#btnExportMenu") as HTMLButtonElement).click();
    await f.whenStable();

    const items = Array.from(exportGroup.querySelectorAll(".dropdown-item")) as HTMLButtonElement[];
    expect(items).toHaveLength(9); // statusJson, fhir, png, jpg, svg, perioSvg, perioPng, perioJpg, pdf
    // perioSvg/perioPng/perioJpg are items[5..7] (App.tsx 594-599).
    expect(items[5].disabled).toBe(true);
    expect(items[6].disabled).toBe(true);
    expect(items[7].disabled).toBe(true);
    // Non-perio items stay enabled.
    expect(items[0].disabled).toBe(false);
    expect(items[8].disabled).toBe(false);
  });

  it("(a) export/import menu items proxy-click their hidden #btn* target (App.tsx 589-616)", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const statusExportClicked = vi.fn();
    f.nativeElement.querySelector("#btnStatusExport").addEventListener("click", statusExportClicked);
    const exportGroup = f.nativeElement.querySelectorAll(".topbar-group.dropdown")[1] as HTMLElement;
    (exportGroup.querySelector("#btnExportMenu") as HTMLButtonElement).click();
    await f.whenStable();
    (exportGroup.querySelectorAll(".dropdown-item")[0] as HTMLButtonElement).click();
    expect(statusExportClicked).toHaveBeenCalledTimes(1);
    await f.whenStable();
    expect(exportGroup.querySelector(".dropdown-menu")).toBeNull(); // closes itself

    const statusImportClicked = vi.fn();
    f.nativeElement.querySelector("#btnStatusImport").addEventListener("click", statusImportClicked);
    const importGroup = f.nativeElement.querySelectorAll(".topbar-group.dropdown")[2] as HTMLElement;
    (importGroup.querySelector("#btnImportMenu") as HTMLButtonElement).click();
    await f.whenStable();
    (importGroup.querySelectorAll(".dropdown-item")[1] as HTMLButtonElement).click(); // FHIR
    expect(statusImportClicked).toHaveBeenCalledTimes(1);
  });

  it("(d) the DualStateConfirm dialog mounts when the REAL engine's confirm becomes pending", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeNull();

    // Same plan-edit-then-status-edit gate sequence as
    // ds1-confirm.test.ts's `planEditTooth16()` helper.
    setPerioSite(16, "MB", { pd: 5 });
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 });
    setChartMode("status");
    setPerioSite(16, "MB", { pd: 3 }); // status edit on the plan-edited tooth
    expect(isDualStateConfirmPending()).toBe(true);
    await f.whenStable();

    const dialog = f.nativeElement.querySelector("#dualStateConfirm");
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute("role")).toBe("dialog");

    cancelDualStateConfirm();
    await f.whenStable();
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeNull();
  });

  it("(d) the mounted dialog's accept/cancel buttons are wired to the REAL engine functions", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    setPerioSite(16, "MB", { pd: 5 });
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 });
    setChartMode("status");
    setPerioSite(16, "MB", { pd: 3 });
    await f.whenStable();

    (f.nativeElement.querySelector(".odon-confirm-cancel") as HTMLButtonElement).click();
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getToothPerio(16).pd.MB).toBe(5); // cancel reverted — the real cancelDualStateConfirm() ran
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeNull();
  });

  it("(e) the summary card renders section headings/items from the REAL getOdontogramSummary()", async () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", caries: ["caries-occlusal"] });
    __setToothStateForTest(12, { toothSelection: "implant" });

    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const text = (f.nativeElement.textContent as string).replace(/\s+/g, " ");
    expect(text).toContain(t("toothInfo.caries"));
    expect(text).toContain(formatToothLabel(16));
    expect(text).toContain(t("toothInfo.implants"));
    expect(text).toContain(formatToothLabel(12));
  });

  // Code-review fix: App.tsx 704 emits `{" "}` between the heading span and
  // the items-vs-emptyText ternary. Angular's `preserveWhitespaces: false`
  // drops a whitespace-only text node, so the `@else` branch needs an
  // explicit `&ngsp;` to keep that space — without it an empty section
  // renders "Caries:No caries recorded" (heading glued to the empty-text
  // fallback, no colon-space). Collapsing runs of *existing* whitespace
  // (`.replace(/\s+/g, " ")`) can't manufacture a space that was never
  // rendered at all, so this assertion is a real regression pin, unlike the
  // looser `.toContain(heading)` checks above.
  it("(e) an empty tooth-info section keeps the heading-colon space before its empty-text fallback (App.tsx 704)", async () => {
    // Fresh reset state (beforeEach) with nothing seeded: every non-inflamed
    // section (caries included) has no items and renders its emptyText.
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const text = (f.nativeElement.textContent as string).replace(/\s+/g, " ");
    expect(text).toContain(`${t("toothInfo.caries")}: ${t("toothInfo.cariesEmpty")}`);
    expect(text).toContain(`${t("toothInfo.fillings")}: ${t("toothInfo.fillingsEmpty")}`);
  });

  it("(a) chart-column hides (display:none) and the view-bar tabs switch activeView (App.tsx 659-661)", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const chartColumn = f.nativeElement.querySelector(".chart-column") as HTMLElement;
    expect(chartColumn.style.display).not.toBe("none");
    expect(f.nativeElement.querySelector("#appViewToggle")).not.toBeNull();
    expect(f.nativeElement.querySelector("#appViewOdontogram").classList.contains("is-active")).toBe(true);

    (f.nativeElement.querySelector("#appViewDentalChart") as HTMLButtonElement).click();
    await f.whenStable();

    expect(chartColumn.style.display).toBe("none");
    expect(f.nativeElement.querySelector("#appViewDentalChart").classList.contains("is-active")).toBe(true);
    expect(f.nativeElement.querySelector(".dental-chart-column")).not.toBeNull();
    expect(
      (f.nativeElement.querySelector(".panel-odontogram-controls") as HTMLElement).style.display,
    ).toBe("none");
  });

  it("dark mode: standalone toggle flips internal state and always emits darkModeChange", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    const emitted: boolean[] = [];
    f.componentInstance.darkModeChange.subscribe((v) => emitted.push(v));
    await f.whenStable();
    const wasDark = document.documentElement.classList.contains("dark");

    const darkToggle = f.nativeElement.querySelectorAll(".topbar-actions > button.btn-theme")[1] as HTMLButtonElement;
    darkToggle.click();
    await f.whenStable();

    expect(emitted).toEqual([!wasDark]);
    expect(document.documentElement.classList.contains("dark")).toBe(!wasDark);
    if (!wasDark) document.documentElement.classList.remove("dark"); // leave global DOM as found
  });

  it("dark mode: controlled (darkMode input bound) toggle only emits — never flips the document class itself", async () => {
    document.documentElement.classList.remove("dark");
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("darkMode", false);
    const emitted: boolean[] = [];
    f.componentInstance.darkModeChange.subscribe((v) => emitted.push(v));
    await f.whenStable();

    const darkToggle = f.nativeElement.querySelectorAll(".topbar-actions > button.btn-theme")[1] as HTMLButtonElement;
    darkToggle.click();
    await f.whenStable();

    expect(emitted).toEqual([true]);
    // Controlled: the host owns `.dark`, the component must not touch it.
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("themeConfig applies CSS custom properties to the root element via the viewChild reference", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("themeConfig", { colors: { accent: "#123456" } });
    await f.whenStable();

    const root = f.nativeElement.querySelector(".odontogram-root") as HTMLElement;
    expect(root.style.getPropertyValue("--odon-accent")).toBe("#123456");
  });
});
