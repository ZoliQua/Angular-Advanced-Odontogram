// Angular port of core/__tests__/fillings-card.test.tsx (PR 3d: <FillingsCard/>
// renders declaratively) — T5 Part C annotation for `fillings-card.test.tsx`.
// Same mount route as `caries-card.spec.ts` (see that file's header). Covers
// the render + write-through + simple/complex swap + fissure gating +
// section-visibility assertions. NOT ported: the `.surf-defect` indicator's
// popup-open + `fillingDefect` write (`openFillingDefectPopup`'s DOM popup
// interaction) — left as a residual gap (flagged in the T5 report), same
// class as the caries-depth popup click which no existing Angular spec
// exercises either.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../../../odontogram-shell/odontogram-shell.component";
import {
  setChartMode,
  setNumberingSystem,
  setFillingComplexity,
  getStatusChart,
  getActiveFillings,
  __resetChartStateForTest,
  __setActiveToothForTest,
  __setSelectionForTest,
  __setToothStateForTest,
} from "../../../../core/odontogram";

const engineLifecycle = { init: async () => {}, destroy: () => {} };

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  __resetChartStateForTest();
  __setSelectionForTest([]);
  setChartMode("status");
  setNumberingSystem("FDI");
  setFillingComplexity("complex");
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

describe("PR 3d: <FillingsCard/> renders declaratively (Angular port)", () => {
  it("renders #fillingSelect, the 5-cell cross with BOTH indicators, and #fissureSealing", async () => {
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const sel = f.nativeElement.querySelector("#fillingSelect") as HTMLSelectElement;
    expect(sel.options.length).toBeGreaterThan(0);
    const checks = f.nativeElement.querySelector("#fillingSurfaceChecks");
    expect(checks.querySelector(".surface-cross")).toBeTruthy();
    expect(checks.querySelectorAll(".surface-cell").length).toBe(5);
    expect(f.nativeElement.querySelector("#chk-buccal")).toBeTruthy();
    expect(checks.querySelectorAll(".surf-depth").length).toBe(5);
    expect(checks.querySelectorAll(".surf-defect").length).toBe(5);
    expect(f.nativeElement.querySelector("#fissureSealing")).toBeTruthy();
  });

  it("picking a material then tapping a surface writes fillingSurfaces + material to the status chart", async () => {
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const sel = f.nativeElement.querySelector("#fillingSelect") as HTMLSelectElement;
    sel.value = "composite";
    fire(sel);
    await f.whenStable();
    expect(getActiveFillings().fillingMaterial).toBe("composite");

    const buccal = f.nativeElement.querySelector("#chk-buccal") as HTMLInputElement;
    buccal.checked = true;
    fire(buccal);
    await f.whenStable();

    expect(getStatusChart().teeth[11].fillingSurfaces).toContain("buccal");
    expect(getStatusChart().teeth[11].fillingSurfaceMaterials.buccal).toBe("composite");
    const cell = f.nativeElement.querySelector("#fillingSurfaceChecks .surface-cell.pos-buccal") as HTMLElement;
    expect(cell.getAttribute("data-material")).toBe("composite");

    buccal.checked = false;
    fire(buccal);
    await f.whenStable();
    expect(getStatusChart().teeth[11].fillingSurfaces).not.toContain("buccal");
    expect(getStatusChart().teeth[11].fillingSurfaceMaterials.buccal).toBeUndefined();
  });

  it("the simple/complex swap shows the grid in complex mode and the toggle in simple mode; the toggle fills ALL surfaces", async () => {
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const sel = f.nativeElement.querySelector("#fillingSelect") as HTMLSelectElement;
    sel.value = "composite";
    fire(sel);
    await f.whenStable();

    expect(f.nativeElement.querySelector("#fillingSurfaceChecks").classList.contains("hidden")).toBe(false);
    expect(f.nativeElement.querySelector("#fillingSimpleRow").classList.contains("hidden")).toBe(true);

    setFillingComplexity("simple");
    await f.whenStable();

    expect(f.nativeElement.querySelector("#fillingSurfaceChecks").classList.contains("hidden")).toBe(true);
    expect(f.nativeElement.querySelector("#fillingSimpleRow").classList.contains("hidden")).toBe(false);

    const simpleToggle = f.nativeElement.querySelector("#fillingSimpleToggle") as HTMLInputElement;
    simpleToggle.checked = true;
    fire(simpleToggle);
    await f.whenStable();

    expect((getStatusChart().teeth[11].fillingSurfaces as string[]).sort()).toEqual(["buccal", "distal", "lingual", "mesial", "occlusal"]);
  });

  it("fissure sealing toggles on a fissure-eligible tooth (14) and is gated hidden on an anterior tooth (11)", async () => {
    __setSelectionForTest([14]); // upper first premolar — fissure-eligible
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    expect(f.nativeElement.querySelector("#fissureSealingRow").classList.contains("hidden")).toBe(false);
    const toggle = f.nativeElement.querySelector("#fissureSealing") as HTMLInputElement;
    toggle.checked = true;
    fire(toggle);
    await f.whenStable();
    expect(getStatusChart().teeth[14].fissureSealing).toBe(true);
  });

  it("hides #fissureSealingRow for an anterior (non-eligible) tooth", async () => {
    __setSelectionForTest([11]); // central incisor — not fissure-eligible
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#fissureSealingRow").classList.contains("hidden")).toBe(true);
  });

  it("shows #fillingSection for a natural tooth and hides it for an implant tooth", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setActiveToothForTest(11);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#fillingSection").classList.contains("hidden")).toBe(false);
  });

  it("hides #fillingSection for an implant tooth", async () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setActiveToothForTest(11);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#fillingSection").classList.contains("hidden")).toBe(true);
  });
});
