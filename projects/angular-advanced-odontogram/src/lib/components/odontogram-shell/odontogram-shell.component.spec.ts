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
