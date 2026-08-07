// Angular port of core/__tests__/ui1-dynamic-scale.test.ts.
//
// FETCH STUB DROPPED: same rationale as perio-graphic-rows.spec.ts's header
// — this repo's `loadTemplateCache()` never fetches (inlined SVG text +
// DOMParser), so `waitFor`/`whenStable()` picks up the resolved promise on a
// plain microtask with nothing to stub.
//
// Same mount route as the sibling ported files in this directory (see
// ../perio-p2-grid.spec.ts's header comment). `.perio-fullgrid-scroll`
// `clientWidth` override technique unchanged from the source — must run
// BEFORE `loadTemplateCache()` resolves (i.e. synchronously right after
// mount, before any `await`).
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { PerioChartComponent } from "../perio-chart.component";
import { hideInfoPopover } from "../perio-grid-dom";
import { __resetChartStateForTest, setNumberingSystem, setReadOnly } from "../../../core/odontogram";
import {
  archToothLayout,
  computeFillScale,
  MIN_FILL_SCALE,
  MAX_FILL_SCALE,
  PERIO_DISPLAY_SCALE,
  TOOTH_GAP,
  type TemplateDocCache,
  type TemplateNo,
} from "../../../core/perioGraphic";

// Mirrors perio-chart.component.ts's own (private, not exported) constants —
// same technique ui1-row-labels.spec.ts uses for `OLD_ROW_LABEL_WIDTH`.
const ROW_LABEL_WIDTH = 220;
const GRID_SCROLLBAR_ALLOWANCE = 2;

const UPPER_ARCH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];

const testFileUrl = import.meta.url;
function svgFor(name: string): string {
  return readFileSync(fileURLToPath(new URL(`../../../core/assets/teeth-svgs/${name}`, testFileUrl)), "utf8");
}

const TEMPLATE_NOS: readonly TemplateNo[] = [11, 13, 14, 16];
function buildRefCache(): TemplateDocCache {
  const cache: TemplateDocCache = new Map();
  for (const tplNo of TEMPLATE_NOS) {
    cache.set(tplNo, new DOMParser().parseFromString(svgFor(`${tplNo}.svg`), "image/svg+xml"));
  }
  return cache;
}

beforeEach(() => {
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
class OverlayHost {
  closed = false;
}

function openGrid() {
  // resetTestingModule(): the "wide vs narrow" comparison test below mounts
  // TWICE in a row (mirroring the source's two `render()` + `cleanup()`
  // calls) — TestBed refuses to reconfigure an already-instantiated module.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [OverlayHost],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(OverlayHost);
}

/** Fake the scroll container's measured width — `clientWidth` is a read-only
 *  getter on the real prototype, jsdom included, so it must be overridden
 *  per-instance. Must run BEFORE the async `loadTemplateCache()` resolves
 *  (i.e. synchronously right after `openGrid()`, before any `await`) so the
 *  component's initial `applyArchColumns` fit reads the mocked value. */
function setScrollWidth(width: number): void {
  const el = document.querySelector(".perio-fullgrid-scroll") as HTMLElement | null;
  if (!el) throw new Error("`.perio-fullgrid-scroll` not found — did openGrid() run?");
  Object.defineProperty(el, "clientWidth", { configurable: true, value: width });
}

function upperArchGrid(): HTMLElement {
  return document.querySelector(".perio-fullgrid-arch") as HTMLElement;
}

function toothColumnsPx(grid: HTMLElement): number[] {
  return grid.style.gridTemplateColumns
    .trim()
    .split(/\s+/)
    .slice(1) // drop the leading row-label track
    .map((tok) => parseFloat(tok));
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

async function waitForArchLoaded(): Promise<void> {
  await waitFor(() => {
    // UI-3a Task 2: each arch now has TWO graphic cells (`buccalCell`/
    // `palatalCell`), each holding its own standalone SVG — so "both arches
    // loaded" is 2 arches x 2 cells x 1 SVG each = 4.
    expect(document.querySelectorAll("[data-perio-arch] svg.perio-tooth-arch").length).toBe(4);
  });
}

describe("computeFillScale: pure scale-fitting math (no DOM)", () => {
  it("clamps to MIN_FILL_SCALE for a non-positive or non-finite baseCols", () => {
    expect(computeFillScale(1000, 0)).toBe(MIN_FILL_SCALE);
    expect(computeFillScale(1000, -5)).toBe(MIN_FILL_SCALE);
    expect(computeFillScale(1000, NaN)).toBe(MIN_FILL_SCALE);
  });

  it("clamps to MIN_FILL_SCALE for a non-finite or negative available width", () => {
    expect(computeFillScale(NaN, 500)).toBe(MIN_FILL_SCALE);
    expect(computeFillScale(-50, 500)).toBe(MIN_FILL_SCALE);
  });

  it("clamps to MAX_FILL_SCALE rather than growing unbounded on a huge (but finite) available width", () => {
    expect(computeFillScale(100000, 400)).toBe(MAX_FILL_SCALE);
  });

  it("never returns Infinity/NaN for a non-finite available width (falls back to the safe floor)", () => {
    expect(computeFillScale(Infinity, 500)).toBe(MIN_FILL_SCALE);
    expect(Number.isFinite(computeFillScale(Infinity, 500))).toBe(true);
  });

  it("returns a strictly bigger scale for a wider available width at the same baseCols (monotonic fill)", () => {
    const narrow = computeFillScale(600, 400);
    const wide = computeFillScale(1600, 400);
    expect(wide).toBeGreaterThan(narrow);
  });

  it("clamps to MIN_FILL_SCALE when the fitted ratio would fall below it (narrow container)", () => {
    expect(computeFillScale(10, 400)).toBe(MIN_FILL_SCALE);
    expect(computeFillScale(0, 400)).toBe(MIN_FILL_SCALE);
  });

  it("returns the exact unclamped ratio when it falls within [MIN_FILL_SCALE, MAX_FILL_SCALE]", () => {
    // 800 / 400 == 2.0, and MIN_FILL_SCALE (1.5) < 2.0 < MAX_FILL_SCALE (2.6).
    expect(computeFillScale(800, 400)).toBeCloseTo(2.0, 5);
  });

  it("MIN_FILL_SCALE equals the legacy fixed PERIO_DISPLAY_SCALE (narrow/unmeasured containers keep the old layout)", () => {
    expect(MIN_FILL_SCALE).toBe(PERIO_DISPLAY_SCALE);
  });

  it("MAX_FILL_SCALE is a sensible ceiling above the floor (not degenerate/inverted)", () => {
    expect(MAX_FILL_SCALE).toBeGreaterThan(MIN_FILL_SCALE);
  });
});

describe("UI-1 Task 3b: PerioChart threads the scroll-container width into the arch's fill-scale", () => {
  it("fits wider tooth columns for a wider scroll-container width than a narrower one", async () => {
    // Render #1: a comfortably wide container.
    let f = openGrid();
    f.detectChanges(); // synchronous initial render + effect flush (the DOM/`.perio-fullgrid-scroll` exists, `loadTemplateCache()` has been KICKED OFF but its promise is still pending — same "before resolution" window the source's synchronous React render gave it).
    setScrollWidth(2200);
    await f.whenStable();
    await waitForArchLoaded();
    const wideCols = toothColumnsPx(upperArchGrid());
    f.destroy();
    document.body.innerHTML = "";

    // Render #2: a much narrower (but still positive) container.
    f = openGrid();
    f.detectChanges();
    setScrollWidth(700);
    await f.whenStable();
    await waitForArchLoaded();
    const narrowCols = toothColumnsPx(upperArchGrid());

    expect(wideCols.length).toBe(narrowCols.length);
    expect(wideCols.length).toBeGreaterThan(0);
    // Every tooth column is wider in the wide-container render (same
    // per-tooth base geometry, only the fill-scale differs).
    for (let i = 0; i < wideCols.length; i++) {
      expect(wideCols[i]).toBeGreaterThan(narrowCols[i]);
    }
  });

  it("matches computeFillScale's fitted value exactly for a known container width", async () => {
    const f = openGrid();
    f.detectChanges();
    setScrollWidth(2200);
    await f.whenStable();
    await waitForArchLoaded();

    const refLayout = archToothLayout(buildRefCache(), UPPER_ARCH);
    const available = 2200 - ROW_LABEL_WIDTH - GRID_SCROLLBAR_ALLOWANCE;
    const expectedScale = computeFillScale(available, refLayout.totalWidth);
    const expectedFirstColPx = (refLayout.teeth[0].width + TOOTH_GAP) * expectedScale;

    const actualFirstColPx = toothColumnsPx(upperArchGrid())[0];
    expect(actualFirstColPx).toBeCloseTo(expectedFirstColPx, 1);
    // Sanity: this wide a container should actually fill ABOVE the legacy floor.
    expect(expectedScale).toBeGreaterThan(MIN_FILL_SCALE);
  });

  it("degrades to the legacy fixed MIN_FILL_SCALE layout for an unmeasured (0-width) container", async () => {
    const f = openGrid();
    f.detectChanges();
    setScrollWidth(0); // jsdom's real unmocked default anyway
    await f.whenStable();
    await waitForArchLoaded();

    const refLayout = archToothLayout(buildRefCache(), UPPER_ARCH);
    const expectedFirstColPx = (refLayout.teeth[0].width + TOOTH_GAP) * MIN_FILL_SCALE;
    const actualFirstColPx = toothColumnsPx(upperArchGrid())[0];
    expect(actualFirstColPx).toBeCloseTo(expectedFirstColPx, 1);
  });

  it("both arches (upper + lower) fit independently but neither is degenerate for the same container", async () => {
    const f = openGrid();
    f.detectChanges();
    setScrollWidth(1800);
    await f.whenStable();
    await waitForArchLoaded();

    const arches = Array.from(document.querySelectorAll(".perio-fullgrid-arch")) as HTMLElement[];
    expect(arches.length).toBe(2);
    for (const arch of arches) {
      const cols = arch.style.gridTemplateColumns.trim().split(/\s+/);
      expect(cols.length).toBeGreaterThan(1);
      for (const tok of cols) expect(tok.endsWith("px")).toBe(true);
      // The row-label track itself never scales with the arch.
      expect(parseFloat(cols[0])).toBe(ROW_LABEL_WIDTH);
    }
  });
});
