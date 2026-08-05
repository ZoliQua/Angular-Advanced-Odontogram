// Angular port of core/__tests__/ds1-confirm-revert.test.tsx.
//
// Mount route: TestBed.createComponent(OdontogramShellComponent) with only
// ODONTOGRAM_ENGINE_LIFECYCLE DI-faked (init/destroy no-ops) — same as the
// source's vi.mock, which only stubbed the heavy imperative DOM/SVG
// lifecycle and forwarded setChartMode/setToothMobility/
// isDualStateConfirmPending/onStateChange/__resetChartStateForTest/
// __setActiveToothForTest as the REAL module (`actual.X`).
//
// This works against the Shell's real (unmocked engine-lifecycle-independent)
// DOM: odontogram.ts's `revertActiveControls()` (invoked by
// `cancelDualStateConfirm()`) and `setToothMobility()` both call
// `syncControlsFromState()`, which queries `#mobilitySelect` by id and
// REBUILDS its `<option>`s from `getMobilityOptions()` (a pure i18n-driven
// function, `setSelectOptions()` in odontogram.ts) before setting `.value` —
// none of that is gated behind `initOdontogram()`, so it runs correctly
// against the Shell's real, mounted `<select id="mobilitySelect">` even
// though the engine's own SVG-grid lifecycle is faked out here.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import {
  setChartMode,
  setToothMobility,
  isDualStateConfirmPending,
  __resetChartStateForTest,
  __setActiveToothForTest,
} from "../../../core/odontogram";

const engineLifecycle = { init: async () => {}, destroy: () => {} };

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  __resetChartStateForTest();
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

describe("DS-1 Task 2: control-revert on cancel (real active tooth + control DOM)", () => {
  it("opens #dualStateConfirm and snaps the mobility control back on cancel", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    __setActiveToothForTest(16); // active tooth 16 (a natural molar — mobility allowed)

    // Plan-edit 16's mobility, then return to status (status mobility stays "none").
    setChartMode("plan");
    setToothMobility(16, "m2");
    setChartMode("status");
    await f.whenStable();

    const sel = f.nativeElement.querySelector("#mobilitySelect") as HTMLSelectElement;
    expect(sel).toBeTruthy();
    expect(sel.value).toBe("none"); // status value after the mode switch synced it

    // Simulate the user picking a new value in the DOM, then the change handler
    // firing the (gated) status edit — which defers behind the confirm.
    sel.value = "m3";
    setToothMobility(16, "m3");
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(true);
    // The dialog surfaces (the Shell mirrors the flag via the real onStateChange).
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeTruthy();

    // Cancel via the dialog button -> revert re-syncs #mobilitySelect from state.
    const cancelBtn = f.nativeElement.querySelector("#dualStateConfirm .odon-confirm-cancel") as HTMLButtonElement;
    cancelBtn.click();
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(sel.value).toBe("none"); // snapped back to the stored value (no stale UI)
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeFalsy();
  });
});
