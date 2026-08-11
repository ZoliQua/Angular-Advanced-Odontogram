// Angular port of core/__tests__/ui1-perio-sidebar.test.tsx's "<App/> right
// panel view-gate" describe block ONLY (Part (b) in the source). Its two
// standalone-render describes ("<PerioSidebar/> renders standalone" /
// "<PerioSidebar/> controls still call their setters") were already ported
// in Task 2 to components/perio-sidebar/ported/ui1-perio-sidebar.spec.ts —
// see that file's own header for the documented split.
//
// Mount route: same as the other five Task 5 ported files —
// TestBed.createComponent(OdontogramShellComponent) with ONLY
// ODONTOGRAM_ENGINE_LIFECYCLE DI-faked (fake-tooth-svg injection, mirroring
// the source's vi.mock init); everything else real.
//
// STALENESS NOTE — RESOLVED at v2.4.0 (Task 5, v2.4.0 resync): at the time
// this file was originally ported (pre-resync), the frozen corpus copy of
// core/__tests__/ui1-perio-sidebar.test.tsx was OLDER than the live engine
// source it was transcribed from, and asserted that the odontogram controls
// panel was FULLY UNMOUNTED (`#statusCard`/`#toothSelect` both `null`) when
// the Dental Chart view was active — contradicting App.tsx's own
// "always mounted, CSS-hidden" design and the live test suite of the day.
// This spec was ported using the corrected (then-live) assertions instead
// of the frozen corpus's stale ones.
//
// As of the v2.4.0 resync (Task 1, pin f9b45fc), `$ENGINE` IS the frozen
// source of truth again — `core/__tests__/ui1-perio-sidebar.test.tsx` now
// natively asserts the same "always mounted, `display: none`" shape this
// spec already had (see its own "perio (Dental Chart) view" describe block,
// `.panel-odontogram-controls` + truthy `#statusCard`/`#toothSelect`). The
// upstream divergence this note originally flagged is gone; the
// frozen-copy caveat above no longer applies — kept for history only.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import { closePerioOverlay, resetCaseMeta, setPerioViewMode } from "../../../core/odontogram";

const engineLifecycle = {
  init: async () => {
    const grid = document.getElementById("toothGrid");
    if (grid && !grid.querySelector("[data-fake-tooth-svg]")) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("data-fake-tooth-svg", "11");
      grid.appendChild(svg);
    }
  },
  destroy: () => {},
};

async function mountShell() {
  const f = TestBed.createComponent(OdontogramShellComponent);
  await f.whenStable();
  return f;
}

beforeEach(() => {
  document.body.innerHTML = "";
  document.documentElement.classList.remove("dark");
  closePerioOverlay();
  setPerioViewMode("toggle");
  resetCaseMeta();
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

describe("UI-1 Task 1: <Shell/> right panel view-gate", () => {
  it("odontogram view (default): shows the odontogram controls, not the perio sidebar", async () => {
    const f = await mountShell();
    expect(f.nativeElement.querySelector("#statusCard")).toBeTruthy();
    expect(f.nativeElement.querySelector("#toothSelect")).toBeTruthy();
    expect(f.nativeElement.querySelector("#caseMetaPanel")).toBeNull();
  });

  it("perio (Dental Chart) view: shows the perio sidebar; odontogram controls stay mounted but hidden", async () => {
    const f = await mountShell();
    (f.nativeElement.querySelector("#appViewDentalChart") as HTMLButtonElement).click();
    await f.whenStable();
    expect(f.nativeElement.querySelector("#caseMetaPanel")).toBeTruthy();
    expect(f.nativeElement.querySelector("#perio-fg-summary-avgpd")).toBeTruthy();
    // The odontogram control panel is NOT unmounted (that would drop its
    // one-time wireControls() listeners and break editing after toggling
    // back — see odontogram-shell.component.ts's own marker-3 comment). It
    // stays in the DOM, hidden via CSS.
    const controls = f.nativeElement.querySelector(".panel-odontogram-controls") as HTMLElement | null;
    expect(controls).toBeTruthy();
    expect(controls!.style.display).toBe("none");
    expect(f.nativeElement.querySelector("#statusCard")).toBeTruthy();
    expect(f.nativeElement.querySelector("#toothSelect")).toBeTruthy();
  });

  it("switching back to the odontogram view restores the odontogram controls", async () => {
    const f = await mountShell();
    (f.nativeElement.querySelector("#appViewDentalChart") as HTMLButtonElement).click();
    await f.whenStable();
    expect(f.nativeElement.querySelector("#caseMetaPanel")).toBeTruthy();
    (f.nativeElement.querySelector("#appViewOdontogram") as HTMLButtonElement).click();
    await f.whenStable();
    expect(f.nativeElement.querySelector("#statusCard")).toBeTruthy();
    expect(f.nativeElement.querySelector("#caseMetaPanel")).toBeNull();
  });
});
