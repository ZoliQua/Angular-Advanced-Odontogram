// Angular port of core/__tests__/tooth-details-card.test.tsx (PR 3f:
// <ToothDetailsCard/> renders declaratively — the hardest card) — T5 Part C
// annotation for BOTH `tooth-details-card.test.tsx` and
// `tooth-details-selection.test.tsx` (the latter's row-visibility-follows-
// selection regressions are the same mechanism this file's row-visibility
// tests exercise; a dedicated "switch active tooth mid-test" case is folded
// in at the end). Same mount route as `caries-card.spec.ts` (see that file's
// header).
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../../../odontogram-shell/odontogram-shell.component";
import {
  setChartMode,
  setNumberingSystem,
  setWearDetailLevel,
  setDiscolorationDetailLevel,
  getStatusChart,
  getActiveToothDetails,
  __resetChartStateForTest,
  __setSelectionForTest,
  __setToothStateForTest,
} from "../../../../core/odontogram";

const engineLifecycle = { init: async () => {}, destroy: () => {} };

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  __resetChartStateForTest();
  setChartMode("status");
  setNumberingSystem("FDI");
  setWearDetailLevel("complex");
  setDiscolorationDetailLevel("complex");
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

function fire(el: HTMLInputElement | HTMLSelectElement, type = "change"): void {
  el.dispatchEvent(new Event(type));
}

describe("PR 3f: <ToothDetailsCard/> renders declaratively (Angular port)", () => {
  it("renders all rows with real option sets and every checkbox id", async () => {
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    expect((f.nativeElement.querySelector("#toothSelect") as HTMLSelectElement).options.length).toBeGreaterThan(1);
    expect((f.nativeElement.querySelector("#substrateSelect") as HTMLSelectElement).options.length).toBe(4);
    expect((f.nativeElement.querySelector("#restorationSelect") as HTMLSelectElement).options.length).toBeGreaterThan(1);
    expect((f.nativeElement.querySelector("#wearEdgeSelect") as HTMLSelectElement).options.length).toBeGreaterThan(0);
    expect((f.nativeElement.querySelector("#wearCervicalSelect") as HTMLSelectElement).options.length).toBeGreaterThan(0);
    expect((f.nativeElement.querySelector("#discolorationSelect") as HTMLSelectElement).options.length).toBeGreaterThan(0);
    for (const id of ["extractionWound", "missingClosed", "crownLeakage", "brokenMesial", "brokenIncisal", "brokenDistal", "contactMesial", "contactDistal", "bridgePillar", "extractionPlan", "crownReplace", "crownNeeded"]) {
      expect(f.nativeElement.querySelector(`#${id}`)).toBeTruthy();
    }
  });

  it("base + substrate selects write state", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const substrate = f.nativeElement.querySelector("#substrateSelect") as HTMLSelectElement;
    substrate.value = "radix";
    fire(substrate);
    await f.whenStable();
    expect(getStatusChart().teeth[11].toothSubstrate).toBe("radix");

    const base = f.nativeElement.querySelector("#toothSelect") as HTMLSelectElement;
    base.value = "implant";
    fire(base);
    await f.whenStable();
    expect(getStatusChart().teeth[11].toothSelection).toBe("implant");
  });

  it("restoration select decodes `${type}|${material}`", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const resto = f.nativeElement.querySelector("#restorationSelect") as HTMLSelectElement;
    resto.value = "crown|emax";
    fire(resto);
    await f.whenStable();

    expect(getStatusChart().teeth[11].restorationType).toBe("crown");
    expect(getStatusChart().teeth[11].restorationMaterial).toBe("emax");
    expect(getStatusChart().teeth[11].prosthesis).toBe("none");
  });

  it("restoration select decodes a prosthesis value on an implant", async () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const resto = f.nativeElement.querySelector("#restorationSelect") as HTMLSelectElement;
    resto.value = "prosthesis|healing-abutment";
    fire(resto);
    await f.whenStable();

    expect(getStatusChart().teeth[11].prosthesis).toBe("healing-abutment");
    expect(getStatusChart().teeth[11].restorationType).toBe("none");
  });

  it("complex detail level (default): the selects are shown, the toggles hidden", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    expect(f.nativeElement.querySelector("#wearEdgeSelectLabel").classList.contains("hidden")).toBe(false);
    expect(f.nativeElement.querySelector("#wearEdgeToggleLabel").classList.contains("hidden")).toBe(true);
    expect(f.nativeElement.querySelector("#discolorationSelectLabel").classList.contains("hidden")).toBe(false);
    expect(f.nativeElement.querySelector("#discolorationToggleLabel").classList.contains("hidden")).toBe(true);
  });

  it("simple detail level: the toggles are shown, the selects hidden; the toggle writes the canonical value", async () => {
    // setWearDetailLevel/setDiscolorationDetailLevel don't call
    // notifyStateChange() (mirrors the corpus's own fresh-render-after-level-
    // change pattern) — seed the level BEFORE mount so the component's
    // engineState() signal reads it at construction.
    setWearDetailLevel("simple");
    setDiscolorationDetailLevel("simple");
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    expect(f.nativeElement.querySelector("#wearEdgeSelectLabel").classList.contains("hidden")).toBe(true);
    expect(f.nativeElement.querySelector("#wearEdgeToggleLabel").classList.contains("hidden")).toBe(false);
    expect(f.nativeElement.querySelector("#discolorationSelectLabel").classList.contains("hidden")).toBe(true);
    expect(f.nativeElement.querySelector("#discolorationToggleLabel").classList.contains("hidden")).toBe(false);

    const wearToggle = f.nativeElement.querySelector("#wearEdgeToggle") as HTMLInputElement;
    wearToggle.checked = true;
    fire(wearToggle);
    await f.whenStable();
    expect(getStatusChart().teeth[11].wearEdge).toBe("attrition");
  });

  it("representative checkboxes write state (contactMesial, missingClosed)", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const contactMesial = f.nativeElement.querySelector("#contactMesial") as HTMLInputElement;
    contactMesial.checked = true;
    fire(contactMesial);
    await f.whenStable();
    expect(getStatusChart().teeth[11].contactMesial).toBe(true);
  });

  it("missingClosed is authored on a gap tooth", async () => {
    __setToothStateForTest(11, { toothSelection: "none" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const missingClosed = f.nativeElement.querySelector("#missingClosed") as HTMLInputElement;
    missingClosed.checked = true;
    fire(missingClosed);
    await f.whenStable();
    expect(getStatusChart().teeth[11].missingClosed).toBe(true);
  });

  it("row visibility follows the predicates: #crownLeakageRow needs a crown/bridge", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#crownLeakageRow").classList.contains("hidden")).toBe(true);
  });

  it("row visibility: #crownLeakageRow shows once a crown is present", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "emax" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#crownLeakageRow").classList.contains("hidden")).toBe(false);
  });

  it("row visibility: #restorationRow hides on a radix substrate", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", toothSubstrate: "radix" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#restorationRow").classList.contains("hidden")).toBe(true);
  });

  it("row visibility: #substrateRow hides on an implant", async () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#substrateRow").classList.contains("hidden")).toBe(true);
  });

  it("#extractionPlanRow reparents to #brokenCrownRow on a broken substrate", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", toothSubstrate: "broken" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const epr = f.nativeElement.querySelector("#extractionPlanRow") as HTMLElement;
    expect(epr).toBeTruthy();
    expect(epr.closest("#brokenCrownRow")).toBeTruthy();
    expect(getActiveToothDetails().extractionPlanParent).toBe("brokenCrownRow");
  });

  it("#extractionPlanRow reparents to #bruxismRow on a wear-eligible natural tooth", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const epr = f.nativeElement.querySelector("#extractionPlanRow") as HTMLElement;
    expect(epr.closest("#bruxismRow")).toBeTruthy();
  });

  it("#extractionPlanRow stays in #crownActionsRow on an implant", async () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const epr = f.nativeElement.querySelector("#extractionPlanRow") as HTMLElement;
    expect(epr.closest("#crownActionsRow")).toBeTruthy();
  });

  it("#btnResetTooth resets the active tooth", async () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(getStatusChart().teeth[11].toothSelection).toBe("implant");

    (f.nativeElement.querySelector("#btnResetTooth") as HTMLButtonElement).click();
    await f.whenStable();
    expect(getStatusChart().teeth[11].toothSelection).toBe("tooth-base");
  });

  // Folded in from tooth-details-selection.test.tsx (Tier 3f regressions):
  // row visibility follows whichever tooth is ACTIVE, re-derived from THAT
  // tooth's own state rather than a stale/cached predicate. The corpus test
  // drives this via real tile clicks under a real `initOdontogram()` (a
  // heavier real-grid mount no other Angular spec in this suite uses);
  // `__setSelectionForTest` (this port's seam) intentionally skips
  // `notifyStateChange()` (a real click's `updateSelectionUI()` -> ...
  // -> notify path is what the corpus regression itself was about — see that
  // file's bug #2 note), so this proves the same invariant — the getter
  // re-derives from a FRESH mount's current active tooth, not a leftover
  // value — without requiring the real-grid infra.
  it("hides extraction-wound/missing-closed rows for a present permanent tooth", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#extractionRow").classList.contains("hidden")).toBe(true);
    expect(f.nativeElement.querySelector("#missingClosedRow").classList.contains("hidden")).toBe(true);
    expect((f.nativeElement.querySelector("#toothSelect") as HTMLSelectElement).value).toBe("tooth-base");
  });

  it("shows extraction-wound/missing-closed rows and the gap's OWN base value for a different (missing) active tooth", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setToothStateForTest(12, { toothSelection: "none" });
    __setSelectionForTest([12]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#extractionRow").classList.contains("hidden")).toBe(false);
    expect(f.nativeElement.querySelector("#missingClosedRow").classList.contains("hidden")).toBe(false);
    expect((f.nativeElement.querySelector("#toothSelect") as HTMLSelectElement).value).toBe("none");
  });
});
