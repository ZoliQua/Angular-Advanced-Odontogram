// T5 CONTROLLER-ADDED scope — see `ds1b-force-value-tooth-details.spec.ts`'s
// file header for the shared rationale. This spec covers
// `OrthodonticsCardComponent`'s `#orthoApplianceSelect`, which routes through
// `applyToSelected()` -> `gateToothEditBatch()` via
// `setOrthoApplianceForSelection`.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import {
  setChartMode,
  setOrthoApplianceForSelection,
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

describe("T5: OrthodonticsCard #orthoApplianceSelect snaps back on cancel", () => {
  it("opens #dualStateConfirm and snaps the appliance control back on cancel", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    __setSelectionForTest([16]);

    setChartMode("plan");
    setOrthoApplianceForSelection("bracket");
    setChartMode("status");
    await f.whenStable();

    const sel = f.nativeElement.querySelector("#orthoApplianceSelect") as HTMLSelectElement;
    expect(sel).toBeTruthy();
    expect(sel.value).toBe("none"); // default orthoAppliance

    sel.value = "band";
    setOrthoApplianceForSelection("band");
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
