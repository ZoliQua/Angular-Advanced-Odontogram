// Angular port of core/__tests__/caries-card.test.tsx (PR 3c: <CariesCard/>
// renders declaratively) — T5 Part C annotation for `caries-card.test.tsx`.
//
// Mount route: TestBed.createComponent(OdontogramShellComponent) with only
// ODONTOGRAM_ENGINE_LIFECYCLE DI-faked — mirrors the source's `vi.mock` of
// only `initOdontogram`/`destroyOdontogram` (every other engine getter/setter
// stays real), same pattern as `ds1-confirm-revert.spec.ts` and the other
// `ds1b-force-value-*.spec.ts` files. NOT a full 1:1 port of every corpus
// assertion (some option-count/label assertions are already covered
// elsewhere — `App.spec.ts`'s static `#rootCariesRow`/`#rootCariesSelect`
// existence check, `sp6-task2-caries-popup.spec.ts`'s CARS-label mechanics);
// this covers the WRITE-THROUGH behavior + section-visibility gate the
// existing suite left untested.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../../../odontogram-shell/odontogram-shell.component";
import {
  setChartMode,
  setNumberingSystem,
  getStatusChart,
  __resetChartStateForTest,
  __setActiveToothForTest,
  __setSelectionForTest,
  __setToothStateForTest,
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

describe("PR 3c: <CariesCard/> renders declaratively (Angular port)", () => {
  it("renders the caries cross (5 cells + 5 .surf-depth indicators) and the subcrown row", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const checks = f.nativeElement.querySelector("#cariesChecks");
    expect(checks).toBeTruthy();
    expect(checks.querySelector(".surface-cross")).toBeTruthy();
    expect(checks.querySelectorAll(".surface-cell").length).toBe(5);
    expect(checks.querySelectorAll(".surf-depth").length).toBe(5);
    expect(f.nativeElement.querySelector("#chk-caries-subcrown")).toBeTruthy();
    const depth = f.nativeElement.querySelector("#cariesDepthSelect") as HTMLSelectElement;
    expect(depth.options.length).toBeGreaterThan(0);
  });

  it("toggling a surface writes caries + cariesSeverity to the status chart", async () => {
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const buccal = f.nativeElement.querySelector("#chk-caries-buccal") as HTMLInputElement;
    buccal.checked = true;
    buccal.dispatchEvent(new Event("change"));
    await f.whenStable();

    expect(getStatusChart().teeth[11].caries).toContain("caries-buccal");
    expect(getStatusChart().teeth[11].cariesSeverity.buccal).toBe(2); // default active depth

    buccal.checked = false;
    buccal.dispatchEvent(new Event("change"));
    await f.whenStable();

    expect(getStatusChart().teeth[11].caries).not.toContain("caries-buccal");
    expect(getStatusChart().teeth[11].cariesSeverity.buccal).toBeUndefined();
  });

  it("changing #cariesDepthSelect sets the active depth for newly tapped surfaces", async () => {
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const depth = f.nativeElement.querySelector("#cariesDepthSelect") as HTMLSelectElement;
    depth.value = "6";
    depth.dispatchEvent(new Event("change"));
    await f.whenStable();

    const distal = f.nativeElement.querySelector("#chk-caries-distal") as HTMLInputElement;
    distal.checked = true;
    distal.dispatchEvent(new Event("change"));
    await f.whenStable();

    expect(getStatusChart().teeth[11].cariesSeverity.distal).toBe(6);
  });

  it("#chk-caries-subcrown writes the subcrown surface", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "emax" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const subcrown = f.nativeElement.querySelector("#chk-caries-subcrown") as HTMLInputElement;
    expect(subcrown.disabled).toBe(false); // subcrown enabled once the tooth has a crown
    subcrown.checked = true;
    subcrown.dispatchEvent(new Event("change"));
    await f.whenStable();

    expect(getStatusChart().teeth[11].caries).toContain("caries-subcrown");
  });

  it("#rootCariesSelect writes rootCaries and displays the value back", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const root = f.nativeElement.querySelector("#rootCariesSelect") as HTMLSelectElement;
    const picked = Array.from(root.options as unknown as HTMLOptionElement[])
      .map((o) => o.value)
      .find((v) => v !== root.value);
    expect(picked).toBeTruthy();
    root.value = picked!;
    root.dispatchEvent(new Event("change"));
    await f.whenStable();

    expect(getStatusChart().teeth[11].rootCaries).toBeTruthy();
    expect(root.value).toBe(picked);
  });

  it("hides #cariesSection in Plan mode", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setActiveToothForTest(11);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#cariesSection").classList.contains("hidden")).toBe(false);

    setChartMode("plan");
    await f.whenStable();
    expect(f.nativeElement.querySelector("#cariesSection").classList.contains("hidden")).toBe(true);
  });

  it("hides #cariesSection on a radix-substrate tooth", async () => {
    // __setToothStateForTest bypasses notifyStateChange (by design — it's a
    // DOM-less hydrate seam), so the state must be seeded BEFORE mount; the
    // component's engineState() signal reads it once at construction.
    __setToothStateForTest(11, { toothSelection: "tooth-base", toothSubstrate: "radix" });
    __setActiveToothForTest(11);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#cariesSection").classList.contains("hidden")).toBe(true);
  });
});
