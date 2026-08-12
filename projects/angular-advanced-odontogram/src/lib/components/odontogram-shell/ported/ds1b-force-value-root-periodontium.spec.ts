// T5 CONTROLLER-ADDED scope — see `ds1b-force-value-tooth-details.spec.ts`'s
// file header for the shared rationale. `ds1-confirm-revert.spec.ts` already
// covers `RootPeriodontiumCardComponent`'s `#mobilitySelect` (the control the
// original red depended on); this spec proves the fix generalizes to the
// card's OTHER 9 Class-A controls (T3 review §3(a)) by covering
// `#calculusToggle`, which routes through `applyToSelected()` ->
// `gateToothEditBatch()` via `setCalculusForSelection`.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import {
  setChartMode,
  setCalculusForSelection,
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

describe("T5: RootPeriodontiumCard #calculusToggle snaps back on cancel", () => {
  it("opens #dualStateConfirm and snaps the calculus control back on cancel", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    __setSelectionForTest([16]); // natural tooth-base — calculus row visible

    setChartMode("plan");
    setCalculusForSelection(true);
    setChartMode("status");
    await f.whenStable();

    const chk = f.nativeElement.querySelector("#calculusToggle") as HTMLInputElement;
    expect(chk).toBeTruthy();
    expect(chk.checked).toBe(false); // default calculus

    // Native pre-mutation, then the actual gated status edit.
    chk.checked = true;
    setCalculusForSelection(true);
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(true);
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeTruthy();

    const cancelBtn = f.nativeElement.querySelector("#dualStateConfirm .odon-confirm-cancel") as HTMLButtonElement;
    cancelBtn.click();
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(chk.checked).toBe(false);
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeFalsy();
  });
});
