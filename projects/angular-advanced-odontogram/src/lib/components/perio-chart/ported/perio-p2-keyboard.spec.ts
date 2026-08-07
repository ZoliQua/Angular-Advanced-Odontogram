// Angular port of core/__tests__/perio-p2-keyboard.test.ts.
//
// Same mount route as ../perio-p2-grid.spec.ts (its header comment covers
// the rationale in full): TestBed.createComponent() of a small host wrapping
// <aao-perio-chart [open]="true">, real engine seams throughout.
// `fireEvent.keyDown(el, {key})` -> `el.dispatchEvent(new KeyboardEvent(
// "keydown", {key, bubbles:true, cancelable:true}))`; `fireEvent.focusOut`
// -> a "focusout" KeyboardEvent-less FocusEvent dispatch, mirroring the
// delegated `focusout` listener PerioChartComponent attaches to the grid
// scroll container. `fireEvent.change` -> native `.value=` + change dispatch.
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
  getToothCal,
  setPerioSite,
  setReadOnly,
  nextPerioCell,
  prevPerioCell,
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

function mountInline() {
  TestBed.configureTestingModule({
    imports: [InlineHostComponent],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(InlineHostComponent);
}

@Component({
  imports: [PerioChartComponent],
  template: `<aao-perio-chart [inline]="true" />`,
})
class InlineHostComponent {}

function pd(toothNo: number, site: string): HTMLInputElement {
  return document.getElementById(`perio-fg-pd-${toothNo}-${site}`) as HTMLInputElement;
}
function gm(toothNo: number, site: string): HTMLInputElement {
  return document.getElementById(`perio-fg-gm-${toothNo}-${site}`) as HTMLInputElement;
}
function bop(toothNo: number, site: string): HTMLInputElement {
  return document.getElementById(`perio-fg-bop-${toothNo}-${site}`) as HTMLInputElement;
}

function keyDown(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
}
function focusOut(el: HTMLElement, relatedTarget: HTMLElement | null): void {
  el.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget }));
}
function change(el: HTMLInputElement, value: string): void {
  el.value = value;
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

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

describe("P2 Task 3: nextPerioCell / prevPerioCell — pure charting order", () => {
  it("advances MB -> B -> DB within a tooth (pd row)", () => {
    expect(nextPerioCell({ toothNo: 18, site: "MB", row: "pd" })).toEqual({ toothNo: 18, site: "B", row: "pd" });
    expect(nextPerioCell({ toothNo: 18, site: "B", row: "pd" })).toEqual({ toothNo: 18, site: "DB", row: "pd" });
  });

  it("after DB, advances to the next tooth's MB, in arch order (upper then lower)", () => {
    expect(nextPerioCell({ toothNo: 18, site: "DB", row: "pd" })).toEqual({ toothNo: 17, site: "MB", row: "pd" });
    expect(nextPerioCell({ toothNo: 28, site: "DB", row: "pd" })).toEqual({ toothNo: 48, site: "MB", row: "pd" });
  });

  it("end of the buccal group (last tooth's DB) wraps into the lingual group's first tooth/site", () => {
    expect(nextPerioCell({ toothNo: 38, site: "DB", row: "pd" })).toEqual({ toothNo: 18, site: "ML", row: "pd" });
  });

  it("end of the pd row (last tooth's DL) wraps into the gm row's first tooth/site", () => {
    expect(nextPerioCell({ toothNo: 38, site: "DL", row: "pd" })).toEqual({ toothNo: 18, site: "MB", row: "gm" });
  });

  it("the very last cell (last tooth's DL, gm row) has no next cell", () => {
    expect(nextPerioCell({ toothNo: 38, site: "DL", row: "gm" })).toBeNull();
  });

  it("an unrecognized cell returns null", () => {
    expect(nextPerioCell({ toothNo: 18, site: "XX", row: "pd" })).toBeNull();
  });

  it("prevPerioCell is the exact reverse of nextPerioCell", () => {
    const cur = { toothNo: 26, site: "L", row: "pd" as const };
    const next = nextPerioCell(cur)!;
    expect(prevPerioCell(next)).toEqual(cur);
    expect(prevPerioCell({ toothNo: 18, site: "MB", row: "pd" })).toBeNull();
  });
});

describe("P2 Task 3: digit keydown commits + auto-advances (PD)", () => {
  it("dispatching keydown '3' on a PD cell sets the value AND moves focus to the next site's PD cell", async () => {
    const f = openGrid();
    await f.whenStable();
    const cell = pd(18, "MB");
    cell.focus();
    expect(document.activeElement).toBe(cell);

    keyDown(cell, "3");

    expect(getToothPerio(18).pd.MB).toBe(3);
    expect(document.activeElement).toBe(pd(18, "B"));
  });

  it("chains across an entire tooth (MB,B,DB) then to the next tooth", async () => {
    const f = openGrid();
    await f.whenStable();
    pd(18, "MB").focus();
    keyDown(pd(18, "MB"), "5");
    expect(document.activeElement).toBe(pd(18, "B"));
    keyDown(pd(18, "B"), "4");
    expect(document.activeElement).toBe(pd(18, "DB"));
    keyDown(pd(18, "DB"), "3");
    expect(document.activeElement).toBe(pd(17, "MB"));

    expect(getToothPerio(18).pd).toEqual({ MB: 5, B: 4, DB: 3 });
  });

  it("digit '0' un-charts the site via the existing setPerioSite semantics, and still advances", async () => {
    const f = openGrid();
    await f.whenStable();
    const cell = pd(26, "MB");
    change(cell, "4");
    expect(getToothPerio(26).pd.MB).toBe(4);

    cell.focus();
    keyDown(cell, "0");

    expect(getToothPerio(26).pd.MB).toBeUndefined();
    expect(document.activeElement).toBe(pd(26, "B"));
  });
});

describe("P2 Task 1 (deferred fix): PD digit '1' primes a tens composition for 10-15", () => {
  it("digit '1' on PD commits value 1, primes pendingTens, and does NOT advance focus", async () => {
    const f = openGrid();
    await f.whenStable();
    const cell = pd(18, "MB");
    cell.focus();

    keyDown(cell, "1");

    expect(getToothPerio(18).pd.MB).toBe(1);
    expect(cell.dataset.pendingTens).toBe("1");
    expect(document.activeElement).toBe(cell); // no advance yet
  });

  it("a primed '1' followed by a digit 0-5 composes 10-15, clears the prime, and advances", async () => {
    const f = openGrid();
    await f.whenStable();
    const cell = pd(18, "MB");
    cell.focus();
    keyDown(cell, "1");

    keyDown(cell, "4");

    expect(getToothPerio(18).pd.MB).toBe(14);
    expect(cell.dataset.pendingTens).toBeUndefined();
    expect(document.activeElement).toBe(pd(18, "B"));
  });

  it("'1' then '0' composes 10", async () => {
    const f = openGrid();
    await f.whenStable();
    const cell = pd(18, "MB");
    cell.focus();
    keyDown(cell, "1");
    keyDown(cell, "0");
    expect(getToothPerio(18).pd.MB).toBe(10);
  });

  it("'1' then '5' composes 15 (upper clamp boundary)", async () => {
    const f = openGrid();
    await f.whenStable();
    const cell = pd(18, "MB");
    cell.focus();
    keyDown(cell, "1");
    keyDown(cell, "5");
    expect(getToothPerio(18).pd.MB).toBe(15);
  });

  it("a primed '1' followed by a digit 6-9 clears the prime and lets the digit act normally (overwrites + advances)", async () => {
    const f = openGrid();
    await f.whenStable();
    const cell = pd(18, "MB");
    cell.focus();
    keyDown(cell, "1");

    keyDown(cell, "7");

    expect(getToothPerio(18).pd.MB).toBe(7);
    expect(cell.dataset.pendingTens).toBeUndefined();
    expect(document.activeElement).toBe(pd(18, "B"));
  });

  it("a primed '1' followed by ArrowRight clears the prime (value stays 1) and moves focus normally", async () => {
    const f = openGrid();
    await f.whenStable();
    const cell = pd(18, "MB");
    cell.focus();
    keyDown(cell, "1");

    keyDown(cell, "ArrowRight");

    expect(getToothPerio(18).pd.MB).toBe(1);
    expect(cell.dataset.pendingTens).toBeUndefined();
    expect(document.activeElement).toBe(pd(18, "B"));
  });

  it("digits 2-9 still commit + advance immediately (no priming) — existing behavior preserved", async () => {
    const f = openGrid();
    await f.whenStable();
    const cell = pd(18, "MB");
    cell.focus();

    keyDown(cell, "6");

    expect(getToothPerio(18).pd.MB).toBe(6);
    expect(cell.dataset.pendingTens).toBeUndefined();
    expect(document.activeElement).toBe(pd(18, "B"));
  });

  it("a primed '1' does NOT survive blur (focusout clears pendingTens) — no stale-prime regression", async () => {
    const f = openGrid();
    await f.whenStable();
    const cell = pd(18, "MB");
    const other = pd(18, "B");
    cell.focus();

    keyDown(cell, "1");
    expect(cell.dataset.pendingTens).toBe("1");

    other.focus();
    focusOut(cell, other);

    expect(cell.dataset.pendingTens).toBeUndefined();

    cell.focus();
    keyDown(cell, "3");

    expect(getToothPerio(18).pd.MB).toBe(3);
  });

  it("read-only mode is a no-op for the tens-priming flow", async () => {
    const f = openGrid();
    await f.whenStable();
    setReadOnly(true);
    const cell = pd(18, "MB");

    keyDown(cell, "1");

    expect(getToothPerio(18).pd.MB).toBeUndefined();
    expect(cell.dataset.pendingTens).toBeUndefined();
  });
});

describe("P2 Task 3: GM digit entry (leading '-' for recession-negative)", () => {
  it("a bare digit on GM commits a positive reading and advances", async () => {
    const f = openGrid();
    await f.whenStable();
    change(pd(14, "B"), "3");
    change(pd(14, "DB"), "5");
    const cell = gm(14, "B");
    cell.focus();

    keyDown(cell, "2");

    expect(getToothPerio(14).gm.B).toBe(2);
    expect(document.activeElement).toBe(gm(14, "DB"));
  });

  it("'-' then a digit commits a negative (coronal/pseudopocket) reading", async () => {
    const f = openGrid();
    await f.whenStable();
    change(pd(14, "B"), "3");
    change(pd(14, "DB"), "5");
    const cell = gm(14, "B");
    cell.focus();

    keyDown(cell, "-");
    expect(cell.dataset.pendingSign).toBe("-");
    expect(getToothPerio(14).gm.B).toBeUndefined();

    keyDown(cell, "2");

    expect(getToothPerio(14).gm.B).toBe(-2);
    expect(getToothCal(14).get("B")).toBe(1);
    expect(document.activeElement).toBe(gm(14, "DB"));
  });

  it("a primed '-' does NOT survive a non-keyboard focus change (blur/focusout clears it)", async () => {
    const f = openGrid();
    await f.whenStable();
    change(pd(14, "B"), "3");
    change(pd(14, "DB"), "5");
    const cell = gm(14, "B");
    const other = gm(14, "DB");
    cell.focus();

    keyDown(cell, "-");
    expect(cell.dataset.pendingSign).toBe("-");

    other.focus();
    focusOut(cell, other);

    expect(cell.dataset.pendingSign).toBeUndefined();

    cell.focus();
    keyDown(cell, "7");

    expect(getToothPerio(14).gm.B).toBe(7);
  });
});

describe("P2 Task 3: arrow-key navigation", () => {
  it("ArrowRight/ArrowLeft move focus within a row (site-by-site, tooth-to-tooth) without writing state", async () => {
    const f = openGrid();
    await f.whenStable();
    const start = pd(18, "MB");
    start.focus();

    keyDown(start, "ArrowRight");
    expect(document.activeElement).toBe(pd(18, "B"));

    keyDown(pd(18, "B"), "ArrowRight");
    expect(document.activeElement).toBe(pd(18, "DB"));

    keyDown(pd(18, "DB"), "ArrowLeft");
    expect(document.activeElement).toBe(pd(18, "B"));

    expect(getToothPerio(18).pd).toEqual({});
  });

  it("ArrowDown moves from a charted PD cell to its (now-enabled) GM cell; ArrowUp moves back", async () => {
    const f = openGrid();
    await f.whenStable();
    change(pd(26, "L"), "4");
    const pdCell = pd(26, "L");
    pdCell.focus();

    keyDown(pdCell, "ArrowDown");
    expect(document.activeElement).toBe(gm(26, "L"));

    keyDown(gm(26, "L"), "ArrowUp");
    expect(document.activeElement).toBe(pdCell);
  });

  it("ArrowDown to an un-charted (disabled) GM cell does not move focus", async () => {
    const f = openGrid();
    await f.whenStable();
    const pdCell = pd(26, "DL");
    pdCell.focus();

    keyDown(pdCell, "ArrowDown");

    expect(document.activeElement).toBe(pdCell);
  });
});

describe("P2 Task 3: Space/Enter toggles BOP", () => {
  it("Space on a focused BOP cell toggles it via setPerioSite", async () => {
    const f = openGrid();
    await f.whenStable();
    change(pd(26, "MB"), "4");
    const bopCell = bop(26, "MB");
    bopCell.focus();

    keyDown(bopCell, " ");
    expect(getToothPerio(26).bop).toEqual(["MB"]);
    expect(bopCell.checked).toBe(true);

    keyDown(bopCell, " ");
    expect(getToothPerio(26).bop).toEqual([]);
    expect(bopCell.checked).toBe(false);
  });

  it("Enter on a focused BOP cell also toggles it", async () => {
    const f = openGrid();
    await f.whenStable();
    change(pd(26, "MB"), "4");
    const bopCell = bop(26, "MB");
    bopCell.focus();

    keyDown(bopCell, "Enter");
    expect(getToothPerio(26).bop).toEqual(["MB"]);
  });
});

describe("P2 Task 3: clearing a PD cell un-charts (existing change-event path)", () => {
  it("emptying a charted PD cell removes pd/gm/bop/cal for that site", async () => {
    const f = openGrid();
    await f.whenStable();
    const pdCell = pd(26, "MB");
    change(pdCell, "4");
    change(gm(26, "MB"), "2");
    bop(26, "MB").click();
    expect(getToothPerio(26).pd.MB).toBe(4);
    expect(getToothCal(26).get("MB")).toBe(6);
    expect(getToothPerio(26).bop).toEqual(["MB"]);

    change(pdCell, "");

    expect(getToothPerio(26).pd.MB).toBeUndefined();
    expect(getToothPerio(26).gm.MB).toBeUndefined();
    expect(getToothPerio(26).bop).toEqual([]);
    expect(getToothCal(26).get("MB")).toBeUndefined();
    expect(document.getElementById("perio-fg-cal-26-MB")!.textContent).toBe("");
  });
});

describe("P2 Task 3: read-only mode disables keyboard entry", () => {
  it("a digit keydown on a PD cell is a no-op when read-only", async () => {
    const f = openGrid();
    await f.whenStable();
    setReadOnly(true);
    const cell = pd(18, "MB");

    keyDown(cell, "3");

    expect(getToothPerio(18).pd.MB).toBeUndefined();
    expect(document.activeElement).not.toBe(pd(18, "B"));
  });

  it("PD/GM cells are disabled (not focusable) when read-only, mirroring Task 2's gating", async () => {
    setReadOnly(true);
    const f = openGrid();
    await f.whenStable();
    expect(pd(18, "MB").disabled).toBe(true);
    setReadOnly(false);
  });
});

describe("P2 Task 1 (deferred fix): setReadOnly() locks the perio chart live", () => {
  it("popup mode: setReadOnly(true) adds .read-only to #perioOverlay live; setReadOnly(false) removes it", async () => {
    const f = openGrid();
    await f.whenStable();
    const overlay = document.getElementById("perioOverlay")!;
    expect(overlay).toBeTruthy();
    expect(overlay.classList.contains("read-only")).toBe(false);

    setReadOnly(true);
    expect(overlay.classList.contains("read-only")).toBe(true);

    setReadOnly(false);
    expect(overlay.classList.contains("read-only")).toBe(false);
  });

  it("inline mode: setReadOnly(true) adds .read-only to #perioInlinePanel live; setReadOnly(false) removes it", async () => {
    const f = mountInline();
    await f.whenStable();
    const panel = document.getElementById("perioInlinePanel")!;
    expect(panel).toBeTruthy();
    expect(panel.classList.contains("read-only")).toBe(false);

    setReadOnly(true);
    expect(panel.classList.contains("read-only")).toBe(true);

    setReadOnly(false);
    expect(panel.classList.contains("read-only")).toBe(false);
  });

  it("setReadOnly() is a safe no-op when no perio container is mounted (neither overlay nor inline panel present)", () => {
    expect(document.getElementById("perioOverlay")).toBeNull();
    expect(document.getElementById("perioInlinePanel")).toBeNull();
    expect(() => setReadOnly(true)).not.toThrow();
    setReadOnly(false);
  });
});

describe("P2 Task 3: arch-order sanity (matches the grid's own UPPER/LOWER arrays)", () => {
  it("the first tooth of the pd row is the first upper-arch tooth and the row spans into the lower arch", () => {
    expect(UPPER_ARCH[0]).toBe(18);
    expect(LOWER_ARCH[0]).toBe(48);
    expect(nextPerioCell({ toothNo: UPPER_ARCH[UPPER_ARCH.length - 1], site: "DB", row: "pd" })).toEqual({
      toothNo: LOWER_ARCH[0],
      site: "MB",
      row: "pd",
    });
  });
});
