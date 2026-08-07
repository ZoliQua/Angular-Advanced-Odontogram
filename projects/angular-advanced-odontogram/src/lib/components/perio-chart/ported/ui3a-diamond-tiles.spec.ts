// Angular port of core/__tests__/ui3a-diamond-tiles.test.ts.
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
  setNumberingSystem,
  type PerioRowId,
  setPerioRowVisibility,
} from "../../../core/odontogram";
import { setI18nLanguage } from "../../../core/i18n/useI18n";

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

beforeEach(() => {
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setI18nLanguage("en");
});

afterEach(() => {
  hideInfoPopover();
  for (const id of ALL_ROW_IDS) setPerioRowVisibility(id, true);
});

/** Plaque-row surface button for a tooth. */
function plaqueBtn(toothNo: number, surface: string): HTMLButtonElement {
  const el = document.getElementById(`perio-fg-plaque-${toothNo}-${surface}`);
  expect(el, `plaque button not found for ${toothNo}/${surface}`).toBeTruthy();
  return el as HTMLButtonElement;
}

/** PI-row (grade) surface button for a tooth — same 4-surface shape as plaque. */
function piBtn(toothNo: number, surface: string): HTMLButtonElement {
  const el = document.getElementById(`perio-fg-pi-${toothNo}-${surface}`);
  expect(el, `pi button not found for ${toothNo}/${surface}`).toBeTruthy();
  return el as HTMLButtonElement;
}

describe("UI-3a Task 3: diamond layout for 4-surface plaque/grade cells", () => {
  it("plaque cell: buccal top, mesial+distal middle, lingual bottom (by grid-area)", async () => {
    const f = openGrid();
    await f.whenStable();
    const buccal = plaqueBtn(16, "buccal");
    const mesial = plaqueBtn(16, "mesial");
    const distal = plaqueBtn(16, "distal");
    const lingual = plaqueBtn(16, "lingual");

    expect(buccal.style.gridArea).toBe("buc");
    expect(lingual.style.gridArea).toBe("lin");
    // mesial/distal occupy the two middle-row areas (mes/dis), never buc/lin.
    expect(["mes", "dis"]).toContain(mesial.style.gridArea);
    expect(["mes", "dis"]).toContain(distal.style.gridArea);
    expect(mesial.style.gridArea).not.toBe(distal.style.gridArea);
  });

  it("grade cell (PI): same diamond grid-area shape as plaque", async () => {
    const f = openGrid();
    await f.whenStable();
    const buccal = piBtn(16, "buccal");
    const mesial = piBtn(16, "mesial");
    const distal = piBtn(16, "distal");
    const lingual = piBtn(16, "lingual");

    expect(buccal.style.gridArea).toBe("buc");
    expect(lingual.style.gridArea).toBe("lin");
    expect(["mes", "dis"]).toContain(mesial.style.gridArea);
    expect(["mes", "dis"]).toContain(distal.style.gridArea);
    expect(mesial.style.gridArea).not.toBe(distal.style.gridArea);
  });

  it("button surface/data wiring is unchanged regardless of visual position", async () => {
    const f = openGrid();
    await f.whenStable();
    for (const surface of ["mesial", "distal", "buccal", "lingual"]) {
      expect(plaqueBtn(16, surface).dataset["plaqueSurface"]).toBe(surface);
      expect(plaqueBtn(26, surface).dataset["plaqueSurface"]).toBe(surface);
      expect(piBtn(16, surface).dataset["gradeSurface"]).toBe(surface);
      expect(piBtn(26, surface).dataset["gradeSurface"]).toBe(surface);
    }
  });

  it("mesial/distal visual columns swap between a RIGHT-quadrant tooth (16) and a LEFT-quadrant tooth (26), mesial toward the midline", async () => {
    const f = openGrid();
    await f.whenStable();
    const rightMesial = plaqueBtn(16, "mesial"); // FDI quadrant 1
    const leftMesial = plaqueBtn(26, "mesial"); // FDI quadrant 2

    // Both are still wired to the "mesial" surface...
    expect(rightMesial.dataset["plaqueSurface"]).toBe("mesial");
    expect(leftMesial.dataset["plaqueSurface"]).toBe("mesial");
    // ...but their visual column differs: quadrant 1 sits screen-left of the
    // upper-arch midline (11|21 boundary), so mesial (toward the midline) is
    // on the RIGHT ("dis" column); quadrant 2 sits screen-right of the
    // midline, so mesial is on the LEFT ("mes" column).
    expect(rightMesial.style.gridArea).toBe("dis");
    expect(leftMesial.style.gridArea).toBe("mes");
    expect(rightMesial.style.gridArea).not.toBe(leftMesial.style.gridArea);

    // Distal is the mirror image of mesial on both teeth.
    expect(plaqueBtn(16, "distal").style.gridArea).toBe("mes");
    expect(plaqueBtn(26, "distal").style.gridArea).toBe("dis");
  });

  it("mesial/distal swap also applies to the graded (PI) cells", async () => {
    const f = openGrid();
    await f.whenStable();
    expect(piBtn(16, "mesial").style.gridArea).toBe("dis");
    expect(piBtn(26, "mesial").style.gridArea).toBe("mes");
  });

  it("buccal/lingual visual position never swaps by quadrant", async () => {
    const f = openGrid();
    await f.whenStable();
    expect(plaqueBtn(16, "buccal").style.gridArea).toBe("buc");
    expect(plaqueBtn(26, "buccal").style.gridArea).toBe("buc");
    expect(plaqueBtn(16, "lingual").style.gridArea).toBe("lin");
    expect(plaqueBtn(26, "lingual").style.gridArea).toBe("lin");
  });

  it("lower-arch quadrants (3x/4x) follow the same mesial-toward-midline rule", async () => {
    const f = openGrid();
    await f.whenStable();
    // Tooth 46 = FDI quadrant 4 (screen-left half, right quadrant) -> mesial right.
    // Tooth 36 = FDI quadrant 3 (screen-right half, left quadrant) -> mesial left.
    expect(plaqueBtn(46, "mesial").style.gridArea).toBe("dis");
    expect(plaqueBtn(36, "mesial").style.gridArea).toBe("mes");
  });
});
