// Angular port of core/__tests__/ui3b-mpi-implant-gate.test.ts.
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
  setPerioRowVisibility,
} from "../../../core/odontogram";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";

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

function mpiRowCount(): number {
  return rowLabels().filter((l) => l === t("perio.mpi.row")).length;
}

function mbiRowCount(): number {
  return rowLabels().filter((l) => l === t("perio.mbi.row")).length;
}

beforeEach(() => {
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setI18nLanguage("en");
});

afterEach(() => {
  hideInfoPopover();
  setPerioRowVisibility("mpi", true);
  setPerioRowVisibility("mbi", true);
});

describe("UI-3b Task 3: per-arch mPI/mBI implant gating", () => {
  it("hides mPI/mBI rows in both arches when no implant exists anywhere (even with visibility ON)", async () => {
    const f = openGrid();
    await f.whenStable();
    expect(mpiRowCount()).toBe(0);
    expect(mbiRowCount()).toBe(0);
  });

  it("shows the mPI/mBI rows ONLY in the arch that has an implant (upper)", async () => {
    __setToothStateForTest(16, { toothSelection: "implant" }); // upper-right first molar
    const f = openGrid();
    await f.whenStable();
    expect(mpiRowCount()).toBe(1);
    expect(mbiRowCount()).toBe(1);
  });

  it("shows the mPI/mBI rows ONLY in the arch that has an implant (lower)", async () => {
    __setToothStateForTest(46, { toothSelection: "implant" }); // lower-right first molar
    const f = openGrid();
    await f.whenStable();
    expect(mpiRowCount()).toBe(1);
    expect(mbiRowCount()).toBe(1);
  });

  it("shows the rows in BOTH arches when both arches have an implant", async () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    __setToothStateForTest(46, { toothSelection: "implant" });
    const f = openGrid();
    await f.whenStable();
    expect(mpiRowCount()).toBe(2);
    expect(mbiRowCount()).toBe(2);
  });

  it("the UI-2 visibility toggle still hides the row even when an implant is present", async () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    const f = openGrid();
    await f.whenStable();
    expect(mpiRowCount()).toBe(1);
    setPerioRowVisibility("mpi", false);
    await f.whenStable();
    expect(mpiRowCount()).toBe(0);
    // mBI (untouched) still renders — the two rows gate independently.
    expect(mbiRowCount()).toBe(1);

    setPerioRowVisibility("mpi", true);
    await f.whenStable();
    expect(mpiRowCount()).toBe(1);
  });
});

// NOTE: live-rebuild-on-implant-change (the `visibilitySig` extension that
// makes the grid re-run `buildGrid` when a tooth becomes/stops being an
// implant, so the mPI/mBI row appears/disappears without a remount) is NOT
// independently unit-tested here. `__setToothStateForTest` — the only
// implant-setting API this file's harness (and every other perio DOM test
// file) has access to — mutates state directly and does not call
// `notifyStateChange()`, so it cannot drive the live `onStateChange` rebuild
// path in a test; only the app's real interactive tooth-selection control
// (App.tsx / OdontogramShellComponent, gated through `gateToothEdit`) does.
// See the source's task-3-report.md for the manual verification steps
// covering this path in the running app.
