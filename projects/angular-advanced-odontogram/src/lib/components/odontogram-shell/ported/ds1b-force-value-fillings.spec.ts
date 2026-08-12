// T5 CONTROLLER-ADDED scope — see `ds1b-force-value-tooth-details.spec.ts`'s
// file header for the shared rationale. This spec covers
// `FillingsCardComponent`'s `#fillingSelect`, which routes through
// `applyToSelected()` -> `gateToothEditBatch()` via
// `setFillingMaterialForSelection`.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import {
  setChartMode,
  setFillingMaterialForSelection,
  isDualStateConfirmPending,
  __resetChartStateForTest,
  __setSelectionForTest,
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

describe("T5: FillingsCard #fillingSelect snaps back on cancel", () => {
  it("opens #dualStateConfirm and snaps the filling-material control back on cancel", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    __setSelectionForTest([16]);

    setChartMode("plan");
    setFillingMaterialForSelection("amalgam");
    setChartMode("status");
    await f.whenStable();

    const sel = f.nativeElement.querySelector("#fillingSelect") as HTMLSelectElement;
    expect(sel).toBeTruthy();
    expect(sel.value).toBe("none"); // default fillingMaterial

    sel.value = "composite";
    setFillingMaterialForSelection("composite");
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(true);
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeTruthy();

    const cancelBtn = f.nativeElement.querySelector("#dualStateConfirm .odon-confirm-cancel") as HTMLButtonElement;
    cancelBtn.click();
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(sel.value).toBe("none");
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeFalsy();
  });
});
