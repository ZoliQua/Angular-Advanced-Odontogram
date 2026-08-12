// Angular port of core/__tests__/root-periodontium-card.test.tsx (PR 3e:
// <RootPeriodontiumCard/> renders declaratively) — T5 Part C annotation for
// `root-periodontium-card.test.tsx`. Same mount route as
// `caries-card.spec.ts` (see that file's header). `#mobilitySelect`'s own
// cancel-revert behavior is covered separately by `ds1-confirm-revert.spec.ts`
// and `#calculusToggle`'s by `ds1b-force-value-root-periodontium.spec.ts`;
// this file covers the rest of the card's render + write-through + row-gate
// assertions the existing suite (sp7-card-merge/sp8-peri-implant-ui, which
// only assert STATIC structure/gates, not write-through) left untested.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../../../odontogram-shell/odontogram-shell.component";
import {
  setChartMode,
  setNumberingSystem,
  getStatusChart,
  getActiveRootPerio,
  setPerioSite,
  __resetChartStateForTest,
  __setActiveToothForTest,
  __setSelectionForTest,
  __setToothStateForTest,
  __buildPerioGridForTest,
  __syncPerioRowForTest,
} from "../../../../core/odontogram";

const engineLifecycle = { init: async () => {}, destroy: () => {} };

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  __resetChartStateForTest();
  setChartMode("status");
  setNumberingSystem("FDI");
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

describe("PR 3e: <RootPeriodontiumCard/> renders declaratively (Angular port)", () => {
  it("renders both sub-blocks with the merged pulp/endo optgroups + real option sets", async () => {
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const pulpEndo = f.nativeElement.querySelector("#pulpEndoSelect") as HTMLSelectElement;
    expect(pulpEndo).toBeTruthy();
    expect(pulpEndo.querySelectorAll("optgroup").length).toBe(2);
    expect(pulpEndo.options.length).toBeGreaterThan(1);
    expect((f.nativeElement.querySelector("#apicalDxSelect") as HTMLSelectElement).options.length).toBeGreaterThan(0);
    expect((f.nativeElement.querySelector("#resorptionSelect") as HTMLSelectElement).options.length).toBeGreaterThan(0);
    expect(f.nativeElement.querySelector("#endoResection")).toBeTruthy();
    expect(f.nativeElement.querySelector("#parapulpalPin")).toBeTruthy();
    expect((f.nativeElement.querySelector("#mobilitySelect") as HTMLSelectElement).options.length).toBeGreaterThan(0);
    expect(f.nativeElement.querySelector("#perioGrid")).toBeTruthy();
    expect(f.nativeElement.querySelector("#chk-parodontal")).toBeTruthy();
    expect(f.nativeElement.querySelector("#chk-inflammation")).toBeTruthy();
    expect(f.nativeElement.querySelector("#calculusToggle")).toBeTruthy();
  });

  it("applies a treated endo value and normalizes pulpDx (endo<->pulpDx exclusion)", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", pulpDx: "irreversible-pulpitis" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const pulpEndo = f.nativeElement.querySelector("#pulpEndoSelect") as HTMLSelectElement;
    pulpEndo.value = "endo-filling";
    fire(pulpEndo);
    await f.whenStable();

    expect(getStatusChart().teeth[11].endo).toBe("endo-filling");
    expect(getStatusChart().teeth[11].pulpDx).toBe("normal");
  });

  it("applies apical / resorption / mobility selects", async () => {
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const apical = f.nativeElement.querySelector("#apicalDxSelect") as HTMLSelectElement;
    apical.value = "chronic-apical-abscess";
    fire(apical);
    await f.whenStable();
    expect(getStatusChart().teeth[11].apicalDx).toBe("chronic-apical-abscess");

    const resorption = f.nativeElement.querySelector("#resorptionSelect") as HTMLSelectElement;
    resorption.value = "internal";
    fire(resorption);
    await f.whenStable();
    expect(getStatusChart().teeth[11].resorptionType).toBe("internal");

    const mobility = f.nativeElement.querySelector("#mobilitySelect") as HTMLSelectElement;
    mobility.value = "m2";
    fire(mobility);
    await f.whenStable();
    expect(getStatusChart().teeth[11].mobility).toBe("m2");
  });

  it("peri-implant status is authored + writes on an implant tooth", async () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    expect(f.nativeElement.querySelector("#periImplantRow").classList.contains("hidden")).toBe(false);
    const periImplant = f.nativeElement.querySelector("#periImplantSelect") as HTMLSelectElement;
    periImplant.value = "mucositis";
    fire(periImplant);
    await f.whenStable();
    expect(getStatusChart().teeth[11].periImplant).toBe("mucositis");
  });

  it("writes a #modsChecks modifier and toggles calculus", async () => {
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const parodontal = f.nativeElement.querySelector("#chk-parodontal") as HTMLInputElement;
    parodontal.checked = true;
    fire(parodontal);
    await f.whenStable();
    expect(getStatusChart().teeth[11].mods).toContain("parodontal");

    parodontal.checked = false;
    fire(parodontal);
    await f.whenStable();
    expect(getStatusChart().teeth[11].mods).not.toContain("parodontal");

    const calculus = f.nativeElement.querySelector("#calculusToggle") as HTMLInputElement;
    calculus.checked = true;
    fire(calculus);
    await f.whenStable();
    expect(getStatusChart().teeth[11].calculus).toBe(true);
  });

  it("checkboxes reflect stored state and endoResection writes", async () => {
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const resection = f.nativeElement.querySelector("#endoResection") as HTMLInputElement;
    expect(resection.checked).toBe(false);
    resection.checked = true;
    fire(resection);
    await f.whenStable();

    expect(getStatusChart().teeth[11].endoResection).toBe(true);
    expect(getActiveRootPerio().endoResectionChecked).toBe(true);
  });

  it("hides the root block on a missing tooth", async () => {
    __setToothStateForTest(11, { toothSelection: "none" });
    __setActiveToothForTest(11);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#rpRootBlock").classList.contains("hidden")).toBe(true);
  });

  it("hides the perio block in Plan mode; root block stays visible", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setActiveToothForTest(11);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#rpRootBlock").classList.contains("hidden")).toBe(false);
    expect(f.nativeElement.querySelector("#rpPerioBlock").classList.contains("hidden")).toBe(false);

    setChartMode("plan");
    await f.whenStable();
    expect(f.nativeElement.querySelector("#rpPerioBlock").classList.contains("hidden")).toBe(true);
    expect(f.nativeElement.querySelector("#rpRootBlock").classList.contains("hidden")).toBe(false);
  });

  it("still renders #perioGrid and the imperative probing carve-out works", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setActiveToothForTest(11);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const grid = f.nativeElement.querySelector("#perioGrid") as HTMLElement;
    expect(grid).toBeTruthy();
    __buildPerioGridForTest(grid);
    expect(grid.querySelector("#perio-pd-MB")).toBeTruthy();

    setPerioSite(11, "MB", { pd: 5 });
    __syncPerioRowForTest(getStatusChart().teeth[11], 11);
    expect((f.nativeElement.querySelector("#perio-pd-MB") as HTMLInputElement).value).toBe("5");
  });
});
