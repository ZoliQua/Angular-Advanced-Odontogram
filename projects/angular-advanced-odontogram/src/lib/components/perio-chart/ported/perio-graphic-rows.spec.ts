// Angular port of core/__tests__/perio-graphic-rows.test.ts.
//
// Same mount route as the sibling ported files in this directory (see
// ../perio-p2-grid.spec.ts's header comment for the full rationale).
//
// FETCH STUB DROPPED: the source stubs `global.fetch` so `loadTemplateCache()`
// (jsdom has no real network) can load the tooth-base SVG templates. This
// Angular library's `core/perioGraphic.ts` no longer fetches at all — the 4
// tooth templates are inlined SVG *text* (via `odontogram.ts`'s `?raw`
// imports) and `loadTemplateCache()` just parses them with `DOMParser`
// (works identically in jsdom), so there is nothing to stub; the promise
// resolves on a plain microtask, and `waitFor` picks that up exactly like
// the source's (now-unnecessary) network mock.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { PerioChartComponent } from "../perio-chart.component";
import { hideInfoPopover } from "../perio-grid-dom";
import { setI18nLanguage } from "../../../core/i18n/useI18n";
import {
  __resetChartStateForTest,
  setNumberingSystem,
  getToothPerio,
  getPerioSummary,
  setPerioSite,
  setReadOnly,
} from "../../../core/odontogram";

beforeEach(() => {
  setI18nLanguage("en");
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setReadOnly(false);
});

afterEach(() => {
  hideInfoPopover();
  setReadOnly(false);
});

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

function cellOf(id: string): HTMLElement {
  return (document.getElementById(id) as HTMLElement).closest(".perio-fullgrid-cell") as HTMLElement;
}

function change(el: HTMLInputElement, value: string): void {
  el.value = value;
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function keyDown(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
}

async function waitFor(assertion: () => void, timeoutMs = 1000): Promise<void> {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      assertion();
      return;
    } catch (err) {
      if (Date.now() - start > timeoutMs) throw err;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}

describe("P2 Task 4: reference structure (buccal above / palatal below)", () => {
  it("lays every buccal-aspect number row above the tooth graphic and every palatal row below it", async () => {
    const f = openGrid();
    await f.whenStable();
    const grid = cellOf("perio-fg-pd-16-MB").closest(".perio-fullgrid-arch") as HTMLElement;
    const archCell = grid.querySelector("[data-perio-arch]") as HTMLElement;
    expect(archCell).toBeTruthy();

    const kids = Array.from(grid.children);
    const archIdx = kids.indexOf(archCell);
    expect(archIdx).toBeGreaterThan(0);

    for (const site of ["MB", "B", "DB"]) {
      for (const field of ["pd", "gm", "cal", "bop"]) {
        const idx = kids.indexOf(cellOf(`perio-fg-${field}-16-${site}`));
        expect(idx, `buccal ${field} ${site}`).toBeGreaterThanOrEqual(0);
        expect(idx, `buccal ${field} ${site} before graphic`).toBeLessThan(archIdx);
      }
    }
    for (const site of ["ML", "L", "DL"]) {
      for (const field of ["pd", "gm", "cal", "bop"]) {
        const idx = kids.indexOf(cellOf(`perio-fg-${field}-16-${site}`));
        expect(idx, `palatal ${field} ${site}`).toBeGreaterThanOrEqual(0);
        expect(idx, `palatal ${field} ${site} after graphic`).toBeGreaterThan(archIdx);
      }
    }
  });

  it("aligns the grid tooth columns to the arch layout once the graphic loads", async () => {
    const f = openGrid();
    await f.whenStable();
    await waitFor(() => {
      expect(document.querySelector("[data-perio-arch] svg.perio-tooth-arch")).toBeTruthy();
    });
    const grid = cellOf("perio-fg-pd-16-MB").closest(".perio-fullgrid-arch") as HTMLElement;
    const cols = grid.style.gridTemplateColumns.trim().split(/\s+/);
    expect(cols.length).toBe(17);
  });
});

describe("P2 Task 4: PD cell drives state AND the curve overlay", () => {
  it("authoring a PD via a cell updates getToothPerio and moves the pocket point", async () => {
    const f = openGrid();
    await f.whenStable();
    await waitFor(() => {
      expect(document.querySelector("[data-perio-arch] svg.perio-tooth-arch")).toBeTruthy();
    });
    const archSvg = cellOf("perio-fg-pd-18-MB")
      .closest(".perio-fullgrid-arch")!
      .querySelector("[data-perio-arch] svg.perio-tooth-arch") as SVGSVGElement;

    expect(archSvg.querySelector(".perio-curve-buccal .perio-curve-pocket")).toBeNull();

    const pd = document.getElementById("perio-fg-pd-18-MB") as HTMLInputElement;
    change(pd, "6");
    await f.whenStable();
    expect(getToothPerio(18).pd.MB).toBe(6);

    const pocket6 = archSvg.querySelector(".perio-curve-buccal .perio-curve-pocket");
    expect(pocket6).toBeTruthy();
    const y6 = Number(pocket6!.getAttribute("points")!.trim().split(/[\s,]+/)[1]);

    change(pd, "9");
    await f.whenStable();
    const pocket9 = archSvg.querySelector(".perio-curve-buccal .perio-curve-pocket");
    const y9 = Number(pocket9!.getAttribute("points")!.trim().split(/[\s,]+/)[1]);
    expect(y9).toBeGreaterThan(y6);
  });
});

describe("P2 Task 4: keyboard auto-advance in the new layout", () => {
  it("commits a digit and advances MB -> B in the pd row", async () => {
    const f = openGrid();
    await f.whenStable();
    const mb = document.getElementById("perio-fg-pd-18-MB") as HTMLInputElement;
    mb.focus();
    keyDown(mb, "3");
    expect(getToothPerio(18).pd.MB).toBe(3);
    expect(document.activeElement).toBe(document.getElementById("perio-fg-pd-18-B"));
  });
});

describe("P2 Task 4: summary averages", () => {
  it("getPerioSummary returns null averages when nothing is charted", () => {
    const s = getPerioSummary();
    expect(s.avgPd).toBeNull();
    expect(s.avgCal).toBeNull();
  });

  it("getPerioSummary computes avg PD and avg CAL over charted sites", () => {
    setPerioSite(16, "MB", { pd: 4, gm: 1 }); // cal 5
    setPerioSite(16, "B", { pd: 2, gm: 0 }); // cal 2
    const s = getPerioSummary();
    expect(s.avgPd).toBe(3); // (4 + 2) / 2
    expect(s.avgCal).toBe(3.5); // (5 + 2) / 2
  });

  it("the summary bar surfaces avg PD, avg CAL and %BOP", async () => {
    const f = openGrid();
    await f.whenStable();
    change(document.getElementById("perio-fg-pd-16-MB") as HTMLInputElement, "4");
    const bopInput = document.getElementById("perio-fg-bop-16-MB") as HTMLInputElement;
    bopInput.checked = true;
    bopInput.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect(document.getElementById("perio-fg-summary-avgpd")!.textContent).toContain("4");
    expect(document.getElementById("perio-fg-summary-avgcal")).toBeTruthy();
    expect(document.getElementById("perio-fg-summary-bop")!.textContent).toContain("100");
  });
});
