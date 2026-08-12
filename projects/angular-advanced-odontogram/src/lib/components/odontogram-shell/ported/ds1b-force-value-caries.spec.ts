// T5 CONTROLLER-ADDED scope — see `ds1b-force-value-tooth-details.spec.ts`'s
// file header for the shared rationale (T3 review "latent-memoization audit",
// generalizing `ds1-confirm-revert.test.tsx`'s pattern beyond
// `#mobilitySelect`). This spec covers `CariesCardComponent`'s
// `#cariesDepthSelect` AND the shared `SurfaceCrossComponent`'s per-surface
// checkbox (`#chk-caries-buccal`) as used inside the Caries card — both route
// through `applyToSelected()` -> `gateToothEditBatch()` via
// `setCariesActiveDepthForSelection`/`setCariesSurfaceForSelection`.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import {
  setChartMode,
  setCariesActiveDepthForSelection,
  setCariesSurfaceForSelection,
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

describe("T5: CariesCard controls snap back on cancel", () => {
  it("#cariesDepthSelect snaps back on cancel", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    __setSelectionForTest([16]);

    setChartMode("plan");
    setCariesActiveDepthForSelection(6);
    setChartMode("status");
    await f.whenStable();

    const sel = f.nativeElement.querySelector("#cariesDepthSelect") as HTMLSelectElement;
    expect(sel).toBeTruthy();
    expect(sel.value).toBe("2"); // default cariesActiveDepth

    sel.value = "4";
    setCariesActiveDepthForSelection(4);
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(true);
    const cancelBtn = f.nativeElement.querySelector("#dualStateConfirm .odon-confirm-cancel") as HTMLButtonElement;
    cancelBtn.click();
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(sel.value).toBe("2");
  });

  it("SurfaceCross #chk-caries-buccal snaps back on cancel", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    __setSelectionForTest([16]);

    setChartMode("plan");
    setCariesSurfaceForSelection("caries-buccal", true);
    setChartMode("status");
    await f.whenStable();

    const chk = f.nativeElement.querySelector("#chk-caries-buccal") as HTMLInputElement;
    expect(chk).toBeTruthy();
    expect(chk.checked).toBe(false);

    // Native pre-mutation (a real click flips `.checked` before the change
    // handler runs), then the actual gated status edit.
    chk.checked = true;
    setCariesSurfaceForSelection("caries-buccal", true);
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(true);
    const cancelBtn = f.nativeElement.querySelector("#dualStateConfirm .odon-confirm-cancel") as HTMLButtonElement;
    cancelBtn.click();
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(chk.checked).toBe(false);
  });
});
