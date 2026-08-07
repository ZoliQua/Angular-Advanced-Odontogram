// Angular port of core/__tests__/perio-p2-grid.test.ts.
//
// The source renders <PerioChart open onClose={...}/> directly via
// @testing-library/react and drives it with fireEvent + no <App/> mount
// (nothing it needs requires a live initOdontogram()/SVG-grid mount).
// Mount route here mirrors that exactly: TestBed.createComponent() of a
// small host wrapping <aao-perio-chart [open]="true">, no engine-lifecycle
// DI fake needed (PerioChartComponent, unlike OdontogramShellComponent,
// never calls initOdontogram/destroyOdontogram).
//
// The whole-mouth summary bar (`perio-fg-summary-*`) the source queries
// lives in <PerioSidebar/> in the CURRENT TSX (UI-1 Task 1 extracted it out
// of PerioChart's own JSX) — the popup/dialog housing still mounts
// <PerioSidebar/> directly (see PerioChart.tsx's own doc comment, TSX
// 2287-2300), so those ids are reachable exactly the same way through
// <aao-perio-sidebar/>, nested inside the dialog housing here too.
// PerioSidebarComponent refreshes its own `summary` signal from its OWN
// onStateChange subscription — an Angular signal write, unlike the source's
// synchronous-via-RTL-act() React state update — so every assertion that
// reads a `perio-fg-summary-*` value awaits `f.whenStable()` after the
// triggering action; the grid's own PD/GM/CAL/BOP cell values are raw DOM
// writes (`syncToothCells`, not Angular-bound) and need no such wait, but
// this file awaits uniformly after each action for simplicity/robustness.
//
// fireEvent.change/click -> native `.value=`/`.checked=` + dispatchEvent, or
// plain `.click()`. `act(() => setChartMode(...))` -> a direct call (Angular
// has no React-style batching to opt into).
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { PerioChartComponent } from "../perio-chart.component";
import { hideInfoPopover } from "../perio-grid-dom";
import { setI18nLanguage } from "../../../core/i18n/useI18n";
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  setNumberingSystem,
  setChartMode,
  getToothPerio,
  getToothCal,
  getPerioSummary,
  setPerioSite,
  PERIO_SITES,
} from "../../../core/odontogram";

const UPPER_ARCH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ARCH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

@Component({
  imports: [PerioChartComponent],
  template: `<aao-perio-chart [open]="true" (closeChart)="closed = true" />`,
})
class HostComponent {
  closed = false;
}

function openGrid() {
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(HostComponent);
}

function change(el: HTMLInputElement, value: string): void {
  el.value = value;
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

beforeEach(() => {
  setI18nLanguage("en");
  __resetChartStateForTest();
  setNumberingSystem("FDI");
});

afterEach(() => {
  hideInfoPopover();
});

describe("P2 Task 2: arch bands + tooth headers", () => {
  it("renders an UPPER arch band (18..11,21..28) then a LOWER band (48..41,31..38), in that order", async () => {
    const f = openGrid();
    await f.whenStable();
    const grid = document.getElementById("perioOverlayGrid")!;
    expect(grid).toBeTruthy();
    const headers = Array.from(grid.querySelectorAll("[data-perio-tooth-header]")).map((h) =>
      h.getAttribute("data-perio-tooth-header"),
    );
    expect(headers).toEqual([...UPPER_ARCH, ...LOWER_ARCH].map(String));
  });

  it("tooth headers use formatToothLabel (FDI by default)", async () => {
    const f = openGrid();
    await f.whenStable();
    const header = document.querySelector('[data-perio-tooth-header="26"]')!;
    expect(header.textContent).toBe("26");
  });

  it("each tooth column has 3 buccal + 3 lingual site cells (PD/GM/BOP inputs + CAL readout per site)", async () => {
    const f = openGrid();
    await f.whenStable();
    for (const site of PERIO_SITES) {
      expect(document.getElementById(`perio-fg-pd-26-${site}`), `pd ${site}`).toBeTruthy();
      expect(document.getElementById(`perio-fg-gm-26-${site}`), `gm ${site}`).toBeTruthy();
      expect(document.getElementById(`perio-fg-bop-26-${site}`), `bop ${site}`).toBeTruthy();
      expect(document.getElementById(`perio-fg-cal-26-${site}`), `cal ${site}`).toBeTruthy();
    }
  });

  it("each tooth has a mobility cell", async () => {
    const f = openGrid();
    await f.whenStable();
    expect(document.getElementById("perio-fg-mobility-26")).toBeTruthy();
  });
});

describe("P2 Task 2: state binding — authoring", () => {
  it("setting PD on tooth 26 site MB calls through to setPerioSite (getToothPerio updated) and the CAL cell reflects getToothCal", async () => {
    const f = openGrid();
    await f.whenStable();
    const pdInput = document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement;
    change(pdInput, "4");
    await f.whenStable();
    expect(getToothPerio(26).pd.MB).toBe(4);
    const calCell = document.getElementById("perio-fg-cal-26-MB")!;
    expect(calCell.textContent).toBe(String(getToothCal(26).get("MB")));
  });

  it("un-charting a site (empty PD) clears the CAL cell and disables GM/BOP for that site", async () => {
    const f = openGrid();
    await f.whenStable();
    const pdInput = document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement;
    change(pdInput, "4");
    change(pdInput, "");
    await f.whenStable();
    expect(getToothPerio(26).pd.MB).toBeUndefined();
    const calCell = document.getElementById("perio-fg-cal-26-MB")!;
    expect(calCell.textContent).toBe("");
    const gmInput = document.getElementById("perio-fg-gm-26-MB") as HTMLInputElement;
    const bopInput = document.getElementById("perio-fg-bop-26-MB") as HTMLInputElement;
    expect(gmInput.disabled).toBe(true);
    expect(bopInput.disabled).toBe(true);
  });

  it("setting GM on an already-charted site calls through to setPerioSite", async () => {
    const f = openGrid();
    await f.whenStable();
    const pdInput = document.getElementById("perio-fg-pd-14-B") as HTMLInputElement;
    change(pdInput, "3");
    const gmInput = document.getElementById("perio-fg-gm-14-B") as HTMLInputElement;
    change(gmInput, "2");
    await f.whenStable();
    expect(getToothPerio(14).gm.B).toBe(2);
    const calCell = document.getElementById("perio-fg-cal-14-B")!;
    expect(calCell.textContent).toBe(String(getToothCal(14).get("B")));
    expect(getToothCal(14).get("B")).toBe(5);
  });

  it("toggling BOP calls through to setPerioSite and updates the summary bar %BOP", async () => {
    const f = openGrid();
    await f.whenStable();
    const pdInput = document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement;
    change(pdInput, "4");
    const bopInput = document.getElementById("perio-fg-bop-26-MB") as HTMLInputElement;
    bopInput.click();
    await f.whenStable();
    expect(getToothPerio(26).bop).toEqual(["MB"]);
    const summary = getPerioSummary();
    expect(summary.bopPercent).toBe(100);
    const bopSummaryEl = document.getElementById("perio-fg-summary-bop")!;
    expect(bopSummaryEl.textContent).toContain("100");
  });
});

describe("P2 Task 2: summary bar", () => {
  it("shows charted count, %BOP, worst CAL, and max PD from getPerioSummary()", async () => {
    const f = openGrid();
    await f.whenStable();
    change(document.getElementById("perio-fg-pd-11-B") as HTMLInputElement, "3");
    change(document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement, "6");
    change(document.getElementById("perio-fg-gm-26-MB") as HTMLInputElement, "2");
    await f.whenStable();

    const summary = getPerioSummary();
    expect(summary.chartedSites).toBe(2);
    expect(summary.maxPd).toBe(6);
    expect(summary.worstCal).toBe(8);

    expect(document.getElementById("perio-fg-summary-charted")!.textContent).toContain("2");
    expect(document.getElementById("perio-fg-summary-maxpd")!.textContent).toContain("6");
    expect(document.getElementById("perio-fg-summary-cal")!.textContent).toContain("8");
  });

  it("starts at zero/blank when nothing is charted", async () => {
    const f = openGrid();
    await f.whenStable();
    expect(document.getElementById("perio-fg-summary-charted")!.textContent).toContain("0");
  });
});

describe("P2 Task 2: dual-state reflow", () => {
  it("switching to plan mode reflows the grid to the plan chart's perio", async () => {
    const f = openGrid();
    await f.whenStable();
    change(document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement, "4");
    await f.whenStable();

    setChartMode("plan");
    await f.whenStable();

    // Plan chart is cloned from status at first switch -> same value initially.
    const pdInPlan = document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement;
    expect(pdInPlan.value).toBe("4");

    // Editing the plan chart directly (bypassing the grid's own onChange) must
    // still reflow into the grid via the onStateChange subscription.
    setPerioSite(26, "MB", { pd: 9 });
    await f.whenStable();
    expect((document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement).value).toBe("9");

    setChartMode("status");
    await f.whenStable();
    expect((document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement).value).toBe("4");
  });
});

describe("P2 Task 2: perioRowHidden gate", () => {
  it("a missing tooth's site cells and mobility cell are disabled", async () => {
    __setToothStateForTest(11, { toothSelection: "none" });
    const f = openGrid();
    await f.whenStable();
    for (const site of PERIO_SITES) {
      expect((document.getElementById(`perio-fg-pd-11-${site}`) as HTMLInputElement).disabled).toBe(true);
    }
    expect((document.getElementById("perio-fg-mobility-11") as HTMLSelectElement).disabled).toBe(true);
  });

  it("an implant tooth's site cells are disabled", async () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    const f = openGrid();
    await f.whenStable();
    expect((document.getElementById("perio-fg-pd-21-B") as HTMLInputElement).disabled).toBe(true);
  });

  it("a normal present tooth's cells are enabled", async () => {
    const f = openGrid();
    await f.whenStable();
    expect((document.getElementById("perio-fg-pd-26-B") as HTMLInputElement).disabled).toBe(false);
    expect((document.getElementById("perio-fg-mobility-26") as HTMLSelectElement).disabled).toBe(false);
  });
});
