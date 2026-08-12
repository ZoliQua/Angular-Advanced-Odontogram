// T5 CONTROLLER-ADDED scope (T3 review, "latent-memoization audit" finding —
// see `.superpowers/sdd/2026-08-12-phase7-composable-resync/task-3-review.md`
// §3(a)): NOT a literal corpus port — `ds1-confirm-revert.test.tsx` only
// exercised `RootPeriodontiumCardComponent`'s `#mobilitySelect`. This
// generalizes the SAME arrange/act/assert pattern to `ToothDetailsCardComponent`
// (T5's `[aaoForceValue]`/`[aaoForceChecked]` sweep target), proving the fix
// applies beyond the one control the original red depended on.
//
// Root cause (identical mechanism to ds1-confirm-revert.spec.ts): every
// `set*ForSelection` setter routes through `applyToSelected()` ->
// `gateToothEditBatch()`, whose dual-state-confirm CANCEL path never runs the
// deferred `apply` closure — so the engine value is unchanged before/after a
// cancel. A native `<select>` already mutated its own DOM `.value` on the
// user's pick, before Angular's `(change)` handler fires; without
// `[aaoForceValue]`, Angular's plain `[value]` binding would skip the DOM
// write back on cancel (bindingUpdated same-value memoization). See
// `force-value.directive.ts`'s file header for the full mechanism.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import {
  setChartMode,
  setSubstrateForSelection,
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

describe("T5: ToothDetailsCard #substrateSelect snaps back on cancel", () => {
  it("opens #dualStateConfirm and snaps the substrate control back on cancel", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    __setSelectionForTest([16]); // natural tooth-base — substrate row visible

    // Plan-edit 16's substrate, then return to status (status substrate stays
    // the default "natural" — unaffected by the plan-mode edit).
    setChartMode("plan");
    setSubstrateForSelection("broken");
    setChartMode("status");
    await f.whenStable();

    const sel = f.nativeElement.querySelector("#substrateSelect") as HTMLSelectElement;
    expect(sel).toBeTruthy();
    expect(sel.value).toBe("natural");

    // Simulate the user picking a new value in the DOM (native pre-mutation,
    // exactly what a real browser does before Angular's change handler runs),
    // then the actual card setter firing the gated status edit.
    sel.value = "radix";
    setSubstrateForSelection("radix");
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(true);
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeTruthy();

    // Cancel via the dialog button -> revert re-syncs via notifyStateChange(),
    // which the engineState signal + [aaoForceValue] directive force-write
    // back onto #substrateSelect.
    const cancelBtn = f.nativeElement.querySelector("#dualStateConfirm .odon-confirm-cancel") as HTMLButtonElement;
    cancelBtn.click();
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(sel.value).toBe("natural"); // snapped back to the stored value (no stale UI)
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeFalsy();
  });
});
