// Angular port of core/__tests__/ui2-row-visibility.test.ts.
//
// Same mount route as the sibling ported files in this directory (see
// ../perio-p2-grid.spec.ts's header comment for the full rationale).
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

function rowLabels(): string[] {
  const grid = document.getElementById("perioOverlayGrid")!;
  return Array.from(grid.querySelectorAll(".perio-fullgrid-row-label-text")).map((el) => el.textContent ?? "");
}

function toothHeaders(): string[] {
  const grid = document.getElementById("perioOverlayGrid")!;
  return Array.from(grid.querySelectorAll("[data-perio-tooth-header]")).map((el) => el.getAttribute("data-perio-tooth-header")!);
}

function graphicCellCount(): number {
  const grid = document.getElementById("perioOverlayGrid")!;
  return grid.querySelectorAll(".perio-fullgrid-graphic-cell").length;
}

beforeEach(() => {
  __resetChartStateForTest();
  setNumberingSystem("FDI");
});

afterEach(() => {
  hideInfoPopover();
  // Restore module-level defaults so this file doesn't leak state into other
  // test files sharing the same module instance (mirrors
  // ui2-perio-settings.test.tsx's own afterEach precedent).
  for (const id of ALL_ROW_IDS) setPerioRowVisibility(id, true);
});

describe("UI-2 Task 2: default visibility (all true)", () => {
  it("getPerioRowVisibility() defaults every id to true", () => {
    const visibility = getPerioRowVisibility();
    for (const id of ALL_ROW_IDS) expect(visibility[id], id).toBe(true);
  });

  it("every index row label is present", async () => {
    // UI-3b Task 3: mPI/mBI additionally gate on the arch having an implant
    // (see ui3b-mpi-implant-gate.spec.ts) — set one so both rows render here.
    __setToothStateForTest(16, { toothSelection: "implant" });
    const f = openGrid();
    await f.whenStable();
    const labels = rowLabels();
    expect(labels).toContain("Plaque Index (PI)");
    expect(labels).toContain("Gingival Index (GI)");
    expect(labels).toContain("Peri-implant Plaque Index (mPI)");
    expect(labels).toContain("Peri-implant Bleeding Index (mBI)");
    expect(labels).toContain("Keratinized Gingiva (KG)");
    expect(labels).toContain("Gingival Thickness (GT)");
    expect(labels).toContain("Miller Class");
    expect(labels).toContain("Mobility");
    expect(labels).toContain("Plaque");
    expect(labels).toContain("Furcation");
    // pd/gm/cal/bop each render TWO rows (buccal + palatal aspect) PER ARCH
    // (upper + lower), so 4 occurrences total.
    expect(labels.filter((l) => l.endsWith("PD"))).toHaveLength(4);
    expect(labels.filter((l) => l.endsWith("GM"))).toHaveLength(4);
    expect(labels.filter((l) => l.endsWith("CAL"))).toHaveLength(4);
    expect(labels.filter((l) => l.endsWith("BOP"))).toHaveLength(4);
  });

  it("the tooth-number header and the tooth-row graphic placeholder are present", async () => {
    const f = openGrid();
    await f.whenStable();
    expect(toothHeaders().length).toBe(32);
    expect(graphicCellCount()).toBe(4); // buccal + palatal cells, per arch (upper + lower)
  });
});

describe("UI-2 Task 2: hiding a single-block row (pi)", () => {
  it("removes the PI row label after a rebuild, keeps every other row, restores on re-enable", async () => {
    const f = openGrid();
    await f.whenStable();
    expect(rowLabels()).toContain("Plaque Index (PI)");

    setPerioRowVisibility("pi", false);
    await f.whenStable();

    const labelsHidden = rowLabels();
    expect(labelsHidden).not.toContain("Plaque Index (PI)");
    // Everything else is untouched.
    expect(labelsHidden).toContain("Gingival Index (GI)");
    expect(labelsHidden).toContain("Mobility");
    expect(labelsHidden.filter((l) => l.endsWith("PD"))).toHaveLength(4);

    // The always-rendered rows never gate.
    expect(toothHeaders().length).toBe(32);
    expect(graphicCellCount()).toBe(4);

    setPerioRowVisibility("pi", true);
    await f.whenStable();
    expect(rowLabels()).toContain("Plaque Index (PI)");
  });
});

describe("UI-2 Task 2: hiding a two-block row (pd — buccal + palatal)", () => {
  it("removes BOTH the buccal and palatal PD row labels, restores both on re-enable", async () => {
    const f = openGrid();
    await f.whenStable();
    expect(rowLabels().filter((l) => l.endsWith("PD"))).toHaveLength(4);

    setPerioRowVisibility("pd", false);
    await f.whenStable();
    const labelsHidden = rowLabels();
    expect(labelsHidden.filter((l) => l.endsWith("PD"))).toHaveLength(0);
    // Sibling two-block rows (gm/cal/bop) are untouched.
    expect(labelsHidden.filter((l) => l.endsWith("GM"))).toHaveLength(4);
    expect(labelsHidden.filter((l) => l.endsWith("CAL"))).toHaveLength(4);
    expect(labelsHidden.filter((l) => l.endsWith("BOP"))).toHaveLength(4);
    // The always-rendered rows never gate.
    expect(toothHeaders().length).toBe(32);
    expect(graphicCellCount()).toBe(4);

    setPerioRowVisibility("pd", true);
    await f.whenStable();
    expect(rowLabels().filter((l) => l.endsWith("PD"))).toHaveLength(4);
  });
});

describe("UI-2 Task 2: hiding every row still leaves the header + graphic", () => {
  it("hiding all 16 ids empties every row label but keeps the header + graphic placeholder", async () => {
    const f = openGrid();
    await f.whenStable();
    for (const id of ALL_ROW_IDS) setPerioRowVisibility(id, false);
    await f.whenStable();
    expect(rowLabels().filter((l) => l !== "")).toHaveLength(0);
    expect(toothHeaders().length).toBe(32);
    expect(graphicCellCount()).toBe(4);
  });
});
