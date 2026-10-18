// Regression spec for the Phase 12 Task-3 review finding: when the lazy
// measured-anatomy chunk fails to load, the core's setToothAnatomy() clears its
// target and returns WITHOUT notifying. The Settings anatomy <select> already
// shows the rejected pick; Angular skips an unchanged binding, so it must be
// re-asserted explicitly (React's controlled <select> snaps back on its own).
// The failure is forced through the internal ODONTOGRAM_SET_TOOTH_ANATOMY seam
// because vi.mock is unavailable under the Angular test builder.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "./odontogram-shell.component";
import type { OdontogramUiService } from "../odontogram-ui.service";
import { ODONTOGRAM_SET_TOOTH_ANATOMY } from "../odontogram-set-tooth-anatomy";
import { getToothAnatomy, setToothAnatomy, __resetChartStateForTest, type ToothAnatomy } from "../../core/odontogram";

const engineLifecycle = { init: async () => {}, destroy: () => {} };
let failLoads = false;

beforeEach(() => {
  failLoads = false;
  document.documentElement.classList.remove("dark");
  __resetChartStateForTest();
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
      {
        provide: ODONTOGRAM_SET_TOOTH_ANATOMY,
        // A failed chunk load, exactly as the core reports it: nothing
        // changes, nothing notifies, the promise resolves.
        useValue: (v: ToothAnatomy): Promise<void> => (failLoads ? Promise.resolve() : setToothAnatomy(v)),
      },
    ],
  });
});

describe("Settings tooth-anatomy select after a failed measured load", () => {
  it("snaps back to Classic and lets the user retry Measured", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    (f.componentInstance as unknown as { ui: OdontogramUiService }).ui.setSettingsOpen(true);
    await f.whenStable();

    (f.nativeElement.querySelector("#odon-settings-tab-odontogram") as HTMLButtonElement).click();
    await f.whenStable();
    const anatomySel = f.nativeElement.querySelector(
      'select[aria-label="Tooth anatomy"]',
    ) as HTMLSelectElement;
    expect(anatomySel).toBeTruthy();
    expect(anatomySel.value).toBe("classic");

    // Flaky connection: the user picks Measured, the load fails.
    failLoads = true;
    anatomySel.value = "measured";
    anatomySel.dispatchEvent(new Event("change"));
    await f.whenStable();

    expect(getToothAnatomy()).toBe("classic");
    expect(anatomySel.value).toBe("classic");

    // Retry: the select is back on Classic, so picking Measured fires again.
    failLoads = false;
    anatomySel.value = "measured";
    anatomySel.dispatchEvent(new Event("change"));
    await f.whenStable();

    expect(getToothAnatomy()).toBe("measured");
    expect(anatomySel.value).toBe("measured");
  });
});
