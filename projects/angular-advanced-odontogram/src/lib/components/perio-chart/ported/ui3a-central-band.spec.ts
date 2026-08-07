// Angular port of core/__tests__/ui3a-central-band.test.ts.
//
// Same mount route as the sibling ported files in this directory (see
// ../perio-p2-grid.spec.ts's header comment for the full rationale).
//
// DRIFT (frozen corpus vs live $ENGINE), same class as Task 5's
// ui1-perio-sidebar finding: the frozen copy's "band-orientation legend"
// describe block asserts a SINGLE `.perio-fullgrid-band-label` containing
// both "▲ Buccal ▲" and "▼ Lingual / Palatal ▼" text. The live component
// (`$ENGINE/src/PerioChart.tsx` 1291-1353, byte-identical to this repo's
// `perio-grid-dom.ts` 1225-1287) renders TWO separate band-label elements —
// one above the band (buccal only) and one below (lingual/palatal only).
// Verified against the live, currently-green test at
// `$ENGINE/src/__tests__/ui3a-central-band.test.ts` (140-152), which asserts
// the two-label shape and was updated accordingly (its own "row-label cell
// empty" and DOM-order/visibility describes are otherwise unchanged from the
// frozen copy). Ported using the corrected, live assertions.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { PerioChartComponent } from "../perio-chart.component";
import { hideInfoPopover } from "../perio-grid-dom";
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  setNumberingSystem,
  getPerioRowVisibility,
  setPerioRowVisibility,
  type PerioRowId,
} from "../../../core/odontogram";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";

const ALL_ROW_IDS: PerioRowId[] = [
  "plaque", "bop", "cal", "gm", "pd", "furcation", "mobility", "cej",
  "rootConcavity", "pi", "gi", "mpi", "mbi", "kg", "gt", "miller",
];

@Component({
  imports: [PerioChartComponent],
  template: `<aao-perio-chart [open]="true" (closeChart)="closed = true" />`,
})
class OverlayHost {
  closed = false;
}

function openGrid() {
  TestBed.configureTestingModule({
    imports: [OverlayHost],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(OverlayHost);
}

function grid(): HTMLElement {
  return document.getElementById("perioOverlayGrid") as HTMLElement;
}

/** The arch band whose header row contains tooth 16 (the upper arch). */
function upperArch(): HTMLElement {
  const header = grid().querySelector('[data-perio-tooth-header="16"]')!;
  return header.closest(".perio-fullgrid-arch") as HTMLElement;
}

/** Index (within `arch`'s children) of the first element matching `sel`. */
function idxOf(arch: HTMLElement, sel: string): number {
  const el = arch.querySelector(sel);
  expect(el, `selector not found: ${sel}`).toBeTruthy();
  return Array.from(arch.children).indexOf(el as Element);
}

beforeEach(() => {
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setI18nLanguage("en");
});

afterEach(() => {
  hideInfoPopover();
  for (const id of ALL_ROW_IDS) setPerioRowVisibility(id, true);
});

describe("UI-3a Task 2: two graphic grid cells per arch", () => {
  it("each arch has exactly two `.perio-fullgrid-graphic-cell`s, tagged buccal/palatal", async () => {
    const f = openGrid();
    await f.whenStable();
    const cells = grid().querySelectorAll(".perio-fullgrid-graphic-cell");
    expect(cells.length).toBe(4); // 2 arches x (buccal + palatal)

    const arch = upperArch();
    const buccal = arch.querySelector('.perio-fullgrid-graphic-cell[data-perio-aspect="buccal"]');
    const palatal = arch.querySelector('.perio-fullgrid-graphic-cell[data-perio-aspect="palatal"]');
    expect(buccal).toBeTruthy();
    expect(palatal).toBeTruthy();
    expect(buccal!.getAttribute("data-perio-arch")).toBe("upper");
    expect(palatal!.getAttribute("data-perio-arch")).toBe("upper");
  });
});

describe("UI-3a Task 2: central index band DOM order", () => {
  it("orders: header -> Miller -> buccal graphic -> band label -> Plaque -> PI -> GI -> mPI -> mBI -> palatal graphic", async () => {
    // UI-3b Task 3: mPI/mBI rows only render in an arch with an implant
    // (see ui3b-mpi-implant-gate.spec.ts) — this test asserts DOM order
    // within the upper arch, so give it one.
    __setToothStateForTest(16, { toothSelection: "implant" });
    const f = openGrid();
    await f.whenStable();
    const arch = upperArch();

    const headerIdx = idxOf(arch, "[data-perio-tooth-header]");
    const millerIdx = idxOf(arch, '[data-perio-field="millerClass"]');
    const buccalGraphicIdx = idxOf(arch, '.perio-fullgrid-graphic-cell[data-perio-aspect="buccal"]');
    const bandLabelIdx = idxOf(arch, ".perio-fullgrid-band-label");
    const plaqueIdx = idxOf(arch, '[data-perio-field="plaque"]');
    const piIdx = idxOf(arch, '[data-perio-field="pi"]');
    const giIdx = idxOf(arch, '[data-perio-field="gi"]');
    const mpiIdx = idxOf(arch, '[data-perio-field="mpi"]');
    const mbiIdx = idxOf(arch, '[data-perio-field="mbi"]');
    const palatalGraphicIdx = idxOf(arch, '.perio-fullgrid-graphic-cell[data-perio-aspect="palatal"]');

    expect(headerIdx).toBeLessThan(millerIdx);
    expect(millerIdx).toBeLessThan(buccalGraphicIdx);
    expect(buccalGraphicIdx).toBeLessThan(bandLabelIdx);
    expect(bandLabelIdx).toBeLessThan(plaqueIdx);
    expect(plaqueIdx).toBeLessThan(piIdx);
    expect(piIdx).toBeLessThan(giIdx);
    expect(giIdx).toBeLessThan(mpiIdx);
    expect(mpiIdx).toBeLessThan(mbiIdx);
    expect(mbiIdx).toBeLessThan(palatalGraphicIdx);
  });

  it("no Plaque row remains at the very top (it now trails the buccal graphic, not the header)", async () => {
    const f = openGrid();
    await f.whenStable();
    const arch = upperArch();
    const headerIdx = idxOf(arch, "[data-perio-tooth-header]");
    const plaqueIdx = idxOf(arch, '[data-perio-field="plaque"]');
    // Plaque used to be the very first data row (index 1, right after the
    // sticky label at 0). It must now sit well after the header + Miller +
    // buccal graphic + band label rows.
    expect(plaqueIdx).toBeGreaterThan(headerIdx + 4);
  });

  it("Miller renders in the top buccal area, before the buccal graphic and the buccal number rows", async () => {
    const f = openGrid();
    await f.whenStable();
    const arch = upperArch();
    const millerIdx = idxOf(arch, '[data-perio-field="millerClass"]');
    const buccalPdIdx = idxOf(arch, '[data-perio-aspect="buccal"][data-perio-field="pd"]');
    const buccalGraphicIdx = idxOf(arch, '.perio-fullgrid-graphic-cell[data-perio-aspect="buccal"]');
    expect(millerIdx).toBeLessThan(buccalPdIdx);
    expect(millerIdx).toBeLessThan(buccalGraphicIdx);
  });
});

describe("UI-3a Task 2: band-orientation legend", () => {
  it("renders two centered band labels (buccal above the band, lingual/palatal below) with resolved perio.band.* i18n text", async () => {
    const f = openGrid();
    await f.whenStable();
    const arch = upperArch();
    // Two separate, centered legend rows now: buccal at the top of the central
    // index band, lingual/palatal at the bottom (adjacent to the palatal graphic).
    const bandLabels = arch.querySelectorAll(".perio-fullgrid-band-label");
    expect(bandLabels.length).toBe(2);
    const [topLabel, bottomLabel] = Array.from(bandLabels) as HTMLElement[];
    expect(topLabel.getAttribute("aria-label")).toBe(t("perio.band.title"));
    expect(topLabel.textContent).toContain(t("perio.band.buccal"));
    expect(topLabel.textContent).not.toContain(t("perio.band.lingual"));
    expect(bottomLabel.textContent).toContain(t("perio.band.lingual"));
  });

  it("the band label's row-label cell is empty (chrome only, no info button, never counted as a data row)", async () => {
    const f = openGrid();
    await f.whenStable();
    const arch = upperArch();
    const bandLabel = arch.querySelector(".perio-fullgrid-band-label")!;
    const rowLabel = bandLabel.previousElementSibling as HTMLElement | null;
    expect(rowLabel?.classList.contains("perio-fullgrid-row-label")).toBe(true);
    expect(rowLabel?.querySelector(".perio-fullgrid-row-label-text")?.textContent).toBe("");
    expect(rowLabel?.querySelector(".perio-info-btn")).toBeNull();
  });
});

describe("UI-3a Task 2: UI-2 row visibility still gates the relocated rows", () => {
  it("hiding 'plaque' removes its cells but keeps both graphic cells and the band label", async () => {
    const f = openGrid();
    await f.whenStable();
    expect(getPerioRowVisibility().plaque).toBe(true);
    setPerioRowVisibility("plaque", false);
    await f.whenStable();
    const arch = upperArch();
    expect(arch.querySelector('[data-perio-field="plaque"]')).toBeNull();
    expect(arch.querySelector('.perio-fullgrid-graphic-cell[data-perio-aspect="buccal"]')).toBeTruthy();
    expect(arch.querySelector('.perio-fullgrid-graphic-cell[data-perio-aspect="palatal"]')).toBeTruthy();
    expect(arch.querySelector(".perio-fullgrid-band-label")).toBeTruthy();

    setPerioRowVisibility("plaque", true);
    await f.whenStable();
    expect(upperArch().querySelector('[data-perio-field="plaque"]')).toBeTruthy();
  });

  it("hiding 'miller' removes it from the top buccal area, keeps the header + buccal graphic", async () => {
    const f = openGrid();
    await f.whenStable();
    setPerioRowVisibility("miller", false);
    await f.whenStable();
    const arch = upperArch();
    expect(arch.querySelector('[data-perio-field="millerClass"]')).toBeNull();
    expect(arch.querySelector("[data-perio-tooth-header]")).toBeTruthy();
    expect(arch.querySelector('.perio-fullgrid-graphic-cell[data-perio-aspect="buccal"]')).toBeTruthy();

    setPerioRowVisibility("miller", true);
    await f.whenStable();
    expect(upperArch().querySelector('[data-perio-field="millerClass"]')).toBeTruthy();
  });
});
