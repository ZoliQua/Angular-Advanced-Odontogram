// T5 CONTROLLER-ADDED scope — see `ds1b-force-value-tooth-details.spec.ts`'s
// file header for the shared rationale.
//
// UNLIKE the other 5 `ds1b-force-value-*` specs, `StatusesCardComponent` does
// NOT need the `[aaoForceValue]`/`[aaoForceChecked]` directives — audited and
// deliberately excluded (T5 self-review): `#btnEdentulous` reads
// `[attr.aria-pressed]="edentulous()"` off `engineState(getEdentulous)`, not a
// `[value]`/`[checked]` property binding, and — critically — it is a `<button>`
// whose click handler synchronously calls `toggleEdentulous()`, so there is no
// NATIVE pre-mutation of the element's own state before Angular's handler runs
// (unlike a `<select>`/checkbox, whose `.value`/`.checked` a real browser
// mutates on the user's pick BEFORE any `(change)` handler fires). The
// same-value `bindingUpdated` memoization gap this whole sweep fixes can only
// manifest when the DOM already diverged from Angular's last-written value
// before the notify; a plain button never diverges that way. `#statusExtraSelect`
// is the card's only OTHER bound control, and it mirrors purely LOCAL transient
// UI state (a plain Angular `signal`, not `engineState`/`applyToSelected`), so
// it is never subject to `gateToothEditBatch`'s dual-state-confirm cancel path
// either.
//
// This spec instead proves that conclusion: `setEdentulous(true)` — the
// whole-mouth structural edit `#btnEdentulous` calls — DOES route through
// `gateToothEditBatch()` (deferred here because a selected tooth is
// plan-edited), yet `#btnEdentulous`'s `aria-pressed` correctly stays `"false"`
// throughout the pending confirm (never optimistically flips) and after
// cancel — with NO force-write directive needed, because nothing ever wrote a
// stale DOM value in the first place.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import {
  setChartMode,
  setSubstrateForSelection,
  setEdentulous,
  isDualStateConfirmPending,
  getEdentulous,
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

describe("T5: StatusesCard #btnEdentulous never shows stale state around a gated cancel", () => {
  it("opens #dualStateConfirm for the gated whole-mouth edit and aria-pressed stays false throughout + after cancel", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    __setSelectionForTest([16]);

    // Plan-edit tooth 16 so the whole-mouth edentulous batch below touches a
    // plan-edited tooth and gets deferred behind ONE confirm.
    setChartMode("plan");
    setSubstrateForSelection("broken");
    setChartMode("status");
    await f.whenStable();

    const btn = f.nativeElement.querySelector("#btnEdentulous") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("aria-pressed")).toBe("false");

    setEdentulous(true);
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(true);
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeTruthy();
    // Not optimistically flipped while the confirm is pending — `edentulous`
    // is set INSIDE the deferred `apply` closure, never before it resolves.
    expect(getEdentulous()).toBe(false);
    expect(btn.getAttribute("aria-pressed")).toBe("false");

    const cancelBtn = f.nativeElement.querySelector("#dualStateConfirm .odon-confirm-cancel") as HTMLButtonElement;
    cancelBtn.click();
    await f.whenStable();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getEdentulous()).toBe(false);
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeFalsy();
  });
});
