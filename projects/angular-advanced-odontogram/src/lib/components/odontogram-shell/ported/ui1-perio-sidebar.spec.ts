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
// STALENESS NOTE (flagged for the reviewer): the frozen corpus copy of this
// file at core/__tests__/ui1-perio-sidebar.test.tsx is OLDER than the live
// engine source it was originally transcribed from — a `diff` against the
// live $ENGINE/src/__tests__/ui1-perio-sidebar.test.tsx (which the live
// suite runs green) shows only this file's "perio (Dental Chart) view"
// test differs, and non-trivially: the frozen copy asserts
// `document.getElementById("statusCard")).toBeNull()` /
// `document.getElementById("toothSelect")).toBeNull()` when the Dental
// Chart view is active, i.e. that the odontogram controls panel is FULLY
// UNMOUNTED. That directly contradicts (a) the live App.tsx itself (its own
// comment at the isPerioView branch: "Keep the odontogram control panel
// ALWAYS mounted, toggling only its visibility with CSS. Unmounting it on
// the perio toggle produced fresh DOM nodes whose one-time wireControls()
// listeners were never re-attached..."), (b) the current live version of
// THIS SAME test file (which instead asserts `.panel-odontogram-controls`
// stays mounted with `display: none`, `#statusCard`/`#toothSelect` both
// still truthy), and (c) the OTHER five files ported alongside this one in
// this same task (perio-graphical-presentation.spec.ts's own "hides
// .chart-column via CSS... but keeps... mounted" tests, run against the
// exact same shell wiring). The frozen copy is a stale pre-CSS-hide
// snapshot. Ported here using the CORRECTED (live, currently-passing)
// assertions — verified by running `npx vitest run
// src/__tests__/ui1-perio-sidebar.test.tsx` directly against the read-only
// $ENGINE checkout, which passes 10/10 with the corrected test body.
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
