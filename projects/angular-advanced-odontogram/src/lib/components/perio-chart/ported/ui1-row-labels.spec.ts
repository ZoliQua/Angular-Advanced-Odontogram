// Angular port of core/__tests__/ui1-row-labels.test.ts.
//
// Same mount route as the sibling ported files in this directory (see
// ../perio-p2-grid.spec.ts's header comment for the full rationale).
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { PerioChartComponent } from "../perio-chart.component";
import { hideInfoPopover } from "../perio-grid-dom";
import { __resetChartStateForTest, __setToothStateForTest, setNumberingSystem, setReadOnly } from "../../../core/odontogram";
import { t } from "../../../core/i18n/useI18n";

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

beforeEach(() => {
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setReadOnly(false);
});

afterEach(() => {
  hideInfoPopover();
  setReadOnly(false);
});

// The old hardcoded value this task replaces (PerioChart.tsx:94 pre-Task-3).
const OLD_ROW_LABEL_WIDTH = 132;

describe("UI-1 Task 3: row-label column is wide enough for full index names", () => {
  it("the arch grid's first gridTemplateColumns track is wider than the old 132px and fits the longest label (>= 200px)", async () => {
    const f = openGrid();
    await f.whenStable();
    const arch = document.querySelector(".perio-fullgrid-arch") as HTMLElement;
    expect(arch).toBeTruthy();
    const firstTrack = arch.style.gridTemplateColumns.trim().split(/\s+/)[0];
    const px = parseFloat(firstTrack);
    expect(firstTrack.endsWith("px")).toBe(true);
    expect(px).toBeGreaterThan(OLD_ROW_LABEL_WIDTH);
    expect(px).toBeGreaterThanOrEqual(200);
  });

  it("every arch band (upper + lower) shares the SAME first-track width, keeping header/graphic/data rows aligned", async () => {
    const f = openGrid();
    await f.whenStable();
    const arches = Array.from(document.querySelectorAll(".perio-fullgrid-arch")) as HTMLElement[];
    expect(arches.length).toBe(2);
    const widths = arches.map((a) => parseFloat(a.style.gridTemplateColumns.trim().split(/\s+/)[0]));
    expect(widths[0]).toBe(widths[1]);
  });
});

describe("UI-1 Task 3: long labels render the full i18n string (no data-layer truncation)", () => {
  it('the mBI row label text node equals t("perio.mbi.row") verbatim, not clipped', async () => {
    // UI-3b Task 3: mBI additionally gates on the arch having an implant
    // (see ui3b-mpi-implant-gate.spec.ts) — set one so the row renders here.
    __setToothStateForTest(16, { toothSelection: "implant" });
    const f = openGrid();
    await f.whenStable();
    const labels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label-text"));
    const mbiLabel = labels.find((el) => el.textContent === t("perio.mbi.row"));
    expect(mbiLabel).toBeTruthy();
    // Exact match — not a prefix/truncated substring of the full string.
    expect(mbiLabel!.textContent).toBe(t("perio.mbi.row"));
    expect(mbiLabel!.textContent!.length).toBe(t("perio.mbi.row").length);
  });

  it("the GI row label also renders in full (regression guard for other long rows)", async () => {
    const f = openGrid();
    await f.whenStable();
    const labels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label-text"));
    const giLabel = labels.find((el) => el.textContent === t("perio.gi.row"));
    expect(giLabel).toBeTruthy();
    expect(giLabel!.textContent).toBe(t("perio.gi.row"));
  });
});
