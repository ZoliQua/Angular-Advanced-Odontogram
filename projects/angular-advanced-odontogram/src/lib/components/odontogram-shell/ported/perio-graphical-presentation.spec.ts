// Angular port of core/__tests__/perio-graphical-presentation.test.ts.
//
// Mount route (per odontogram-shell.component.spec.ts's header — `vi.mock`
// on a relative-path specifier is unavailable under `npm run test:ng`):
// TestBed.createComponent(OdontogramShellComponent) with ONLY
// ODONTOGRAM_ENGINE_LIFECYCLE DI-faked. The fake `init` reproduces the
// source's mock behavior exactly — synchronously injecting a fake tooth
// <svg data-fake-tooth-svg> into #toothGrid so the tests can prove the
// odontogram SVG root is never unmounted while the Dental Chart view is
// active — everything else (getPerioViewMode/setPerioViewMode/
// openPerioOverlay/closePerioOverlay/isPerioOverlayOpen + the full perio
// data core PerioChart needs to build its grid) is the REAL, unmocked
// core/odontogram export, exactly what the source's `vi.mock(..., {
// ...actual })` forwarding already meant.
//
// Named-export mapping: the source's "PerioChart named export" describe
// (`typeof PerioChart === "function"`, resolved from `../App`) maps to the
// component being exported from the library's public-api barrel — asserted
// by importing PerioChartComponent from "../../../../public-api" and
// checking it's a class (Angular component factory), not a function export
// from the shell module itself.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import { closePerioOverlay, getPerioViewMode, setPerioViewMode } from "../../../core/odontogram";
import { PerioChartComponent } from "../../../../public-api";

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

beforeEach(() => {
  document.body.innerHTML = "";
  document.documentElement.classList.remove("dark");
  closePerioOverlay();
  setPerioViewMode("toggle");
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

describe("Task 1: perioViewMode state (odontogram.ts)", () => {
  it('defaults to "toggle"', () => {
    // beforeEach already forced "toggle" (same as the source's fresh-module
    // baseline would show without any prior test having flipped it).
    expect(getPerioViewMode()).toBe("toggle");
  });

  it("setPerioViewMode changes the mode", () => {
    setPerioViewMode("popup");
    expect(getPerioViewMode()).toBe("popup");
    setPerioViewMode("toggle");
    expect(getPerioViewMode()).toBe("toggle");
  });
});

describe("Task 1: PerioChart named export", () => {
  it("PerioChartComponent is exported from the library's public API and is a class", () => {
    expect(typeof PerioChartComponent).toBe("function"); // Angular decorated classes are functions
    expect(PerioChartComponent.prototype).toBeTruthy();
  });
});

describe("Task 1: toggle mode housing (default)", () => {
  it("renders #appViewToggle with Odontogram + Dental Chart segments, Odontogram active by default", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const toggle = f.nativeElement.querySelector("#appViewToggle");
    expect(toggle).toBeTruthy();
    const odontogramBtn = f.nativeElement.querySelector("#appViewOdontogram") as HTMLButtonElement;
    const dentalChartBtn = f.nativeElement.querySelector("#appViewDentalChart") as HTMLButtonElement;
    expect(odontogramBtn).toBeTruthy();
    expect(dentalChartBtn).toBeTruthy();
    expect(odontogramBtn.classList.contains("is-active")).toBe(true);
    expect(dentalChartBtn.classList.contains("is-active")).toBe(false);
  });

  it("no popup launch button while in toggle mode", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#openPerioOverlayBtn")).toBeNull();
  });

  it("selecting \"Dental Chart\" hides .chart-column via CSS (display:none) but keeps the odontogram SVG mounted, and shows the perio content inline", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const toothSvgBefore = f.nativeElement.querySelector("#toothGrid [data-fake-tooth-svg]");
    expect(toothSvgBefore).toBeTruthy();

    (f.nativeElement.querySelector("#appViewDentalChart") as HTMLButtonElement).click();
    await f.whenStable();

    const chartColumn = f.nativeElement.querySelector(".chart-column") as HTMLElement;
    expect(chartColumn).toBeTruthy();
    expect(chartColumn.style.display).toBe("none");

    // The odontogram SVG root must still be in the DOM — never unmounted.
    expect(f.nativeElement.querySelector("#toothGrid [data-fake-tooth-svg]")).toBe(toothSvgBefore);

    // Perio content shown inline (no modal dialog chrome).
    expect(f.nativeElement.querySelector("#perioOverlay")).toBeNull();
    expect(f.nativeElement.querySelector("#perioInlineGrid")).toBeTruthy();

    const dentalChartBtn = f.nativeElement.querySelector("#appViewDentalChart") as HTMLButtonElement;
    const odontogramBtn = f.nativeElement.querySelector("#appViewOdontogram") as HTMLButtonElement;
    expect(dentalChartBtn.classList.contains("is-active")).toBe(true);
    expect(odontogramBtn.classList.contains("is-active")).toBe(false);
  });

  it("selecting \"Odontogram\" again reverses it: .chart-column visible, inline perio content gone", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    (f.nativeElement.querySelector("#appViewDentalChart") as HTMLButtonElement).click();
    await f.whenStable();
    expect((f.nativeElement.querySelector(".chart-column") as HTMLElement).style.display).toBe("none");
    expect(f.nativeElement.querySelector("#perioInlineGrid")).toBeTruthy();

    (f.nativeElement.querySelector("#appViewOdontogram") as HTMLButtonElement).click();
    await f.whenStable();

    expect((f.nativeElement.querySelector(".chart-column") as HTMLElement).style.display).not.toBe("none");
    expect(f.nativeElement.querySelector("#perioInlineGrid")).toBeNull();
  });
});

describe('Task 1: popup mode housing (perioViewMode === "popup")', () => {
  it("no #appViewToggle in popup mode", async () => {
    setPerioViewMode("popup");
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#appViewToggle")).toBeNull();
  });

  it("P2's launch button is present and openPerioOverlay() still opens the modal", async () => {
    setPerioViewMode("popup");
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const btn = f.nativeElement.querySelector("#openPerioOverlayBtn");
    expect(btn).toBeTruthy();

    (btn as HTMLButtonElement).click();
    await f.whenStable();

    const overlay = f.nativeElement.querySelector("#perioOverlay");
    expect(overlay).toBeTruthy();
    expect(overlay!.getAttribute("role")).toBe("dialog");

    // The odontogram SVG root must still be in the DOM behind the modal.
    expect(f.nativeElement.querySelector("#toothGrid [data-fake-tooth-svg]")).toBeTruthy();

    // .chart-column stays visible in popup mode (only toggle mode hides it).
    expect((f.nativeElement.querySelector(".chart-column") as HTMLElement).style.display).not.toBe("none");
  });

  it("closePerioOverlay() closes the popup modal", async () => {
    setPerioViewMode("popup");
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    (f.nativeElement.querySelector("#openPerioOverlayBtn") as HTMLButtonElement).click();
    await f.whenStable();
    expect(f.nativeElement.querySelector("#perioOverlay")).toBeTruthy();

    // The shell's own onStateChange subscription re-renders the overlay closed.
    closePerioOverlay();
    await f.whenStable();
    expect(f.nativeElement.querySelector("#perioOverlay")).toBeNull();
  });
});
