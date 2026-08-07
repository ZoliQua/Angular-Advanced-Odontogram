// Angular port of core/__tests__/pgb-info-buttons.test.ts.
//
// Same mount route as the sibling ported files in this directory (see
// ../perio-p2-grid.spec.ts's header comment for the full rationale).
//
// fireEvent.click -> plain `.click()`. `act(() => unmount())` -> `f.destroy()`.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { PerioChartComponent } from "../perio-chart.component";
import { hideInfoPopover } from "../perio-grid-dom";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";
import { __resetChartStateForTest, __setToothStateForTest, setNumberingSystem } from "../../../core/odontogram";

@Component({
  imports: [PerioChartComponent],
  template: `<aao-perio-chart [inline]="true" />`,
})
class InlineHost {}

@Component({
  imports: [PerioChartComponent],
  template: `<aao-perio-chart [open]="true" (closeChart)="closed = true" />`,
})
class OverlayHost {
  closed = false;
}

function openInline() {
  TestBed.configureTestingModule({
    imports: [InlineHost],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(InlineHost);
}

function openOverlay() {
  TestBed.configureTestingModule({
    imports: [OverlayHost],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(OverlayHost);
}

beforeEach(() => {
  __resetChartStateForTest();
  // UI-3b Task 3: mPI/mBI additionally gate on the arch having an implant
  // (see ui3b-mpi-implant-gate.spec.ts) — set one in EACH arch so both rows
  // render in both arches, matching this file's BUTTONS_PER_ARCH*2 counts.
  __setToothStateForTest(16, { toothSelection: "implant" });
  __setToothStateForTest(46, { toothSelection: "implant" });
  setNumberingSystem("FDI");
  setI18nLanguage("en");
});

afterEach(() => {
  hideInfoPopover();
});

// One arch's labelled rows: plaque(1) + bop(buccal+palatal) + cal(buccal+
// palatal) + gm(buccal+palatal) + pd(buccal+palatal) + furcation(1) +
// mobility(1) + cejVisibility(1) + rootConcavity(1) [SP-perio PG-C Task 3] +
// pi(1) + gi(1) + kg(1) + gt(1) + miller(1) [SP-perio PG-D Task 4] +
// mpi(1) + mbi(1) [SP-perio PG-E Task 2] = 20. Two arches (upper+lower) =>
// 40 total. The tooth-number header row and the tooth-graphic placeholder
// row have NO label/infoKey and so get no button.
const BUTTONS_PER_ARCH = 20;

describe("PG-B Task 1: .perio-info-btn on every labelled row", () => {
  it("every labelled row-label cell has exactly one .perio-info-btn", async () => {
    const f = openInline();
    await f.whenStable();
    const grid = document.getElementById("perioInlineGrid")!;
    expect(grid).toBeTruthy();
    const buttons = grid.querySelectorAll(".perio-info-btn");
    expect(buttons.length).toBe(BUTTONS_PER_ARCH * 2);
  });

  it("the tooth-number header row and the tooth-graphic row have no info button", async () => {
    const f = openInline();
    await f.whenStable();
    const grid = document.getElementById("perioInlineGrid")!;

    // Every arch's flat grid appends the row-label immediately before that
    // row's first tooth cell (no per-row wrapper element), so the FIRST
    // header cell's previous sibling is its row's label.
    const firstHeaderCell = grid.querySelector("[data-perio-tooth-header]")!;
    const headerRowLabel = firstHeaderCell.previousElementSibling as HTMLElement | null;
    expect(headerRowLabel?.classList.contains("perio-fullgrid-row-label")).toBe(true);
    expect(headerRowLabel?.querySelector(".perio-info-btn")).toBeNull();

    // The graphic placeholder row-label sits right before .perio-fullgrid-graphic-cell.
    const graphicCell = grid.querySelector('[data-perio-arch="upper"]')!;
    const graphicRowLabel = graphicCell.previousElementSibling as HTMLElement | null;
    expect(graphicRowLabel?.classList.contains("perio-fullgrid-row-label")).toBe(true);
    expect(graphicRowLabel?.querySelector(".perio-info-btn")).toBeNull();
  });

  it("each info button has a non-empty, real aria-label", async () => {
    const f = openInline();
    await f.whenStable();
    const grid = document.getElementById("perioInlineGrid")!;
    const buttons = Array.from(grid.querySelectorAll(".perio-info-btn"));
    expect(buttons.length).toBeGreaterThan(0);
    for (const btn of buttons) {
      const label = btn.getAttribute("aria-label");
      expect(label).toBeTruthy();
      expect(label!.trim().length).toBeGreaterThan(0);
    }
  });

  it("an info button starts collapsed (aria-expanded=false, aria-haspopup=dialog)", async () => {
    const f = openInline();
    await f.whenStable();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(btn.getAttribute("aria-haspopup")).toBe("dialog");
  });
});

describe("PG-B Task 1: clicking an info button opens the right popover text", () => {
  const cases: Array<{ field: string; infoKey: string }> = [
    { field: "plaque", infoKey: "perio.info.plaque" },
    { field: "furcation", infoKey: "perio.info.furcation" },
    { field: "mobility", infoKey: "perio.info.mobility" },
  ];

  for (const { field, infoKey } of cases) {
    it(`${field} row's info button opens a popover with t("${infoKey}")`, async () => {
      const f = openInline();
      await f.whenStable();
      const rowLabels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label"));
      const target = field === "plaque"
        ? rowLabels.find((el) => el.textContent?.includes(t("plaque.label")))
        : field === "furcation"
        ? rowLabels.find((el) => el.textContent?.includes(t("furcation.label")))
        : rowLabels.find((el) => el.textContent?.includes(t("perio.mobility")));
      const btn = target!.querySelector(".perio-info-btn") as HTMLButtonElement;
      expect(btn).toBeTruthy();
      btn.click();

      const popover = document.querySelector(".perio-info-popover");
      expect(popover).toBeTruthy();
      expect(popover!.textContent).toBe(t(infoKey));
      expect(btn.getAttribute("aria-expanded")).toBe("true");
    });
  }

  it("every PD row (buccal + palatal/lingual, both arches) opens perio.info.pd", async () => {
    const f = openInline();
    await f.whenStable();
    const pdRows = Array.from(document.querySelectorAll(".perio-fullgrid-row-label")).filter((el) =>
      el.textContent?.includes(t("perio.pd")),
    );
    // 2 aspects (buccal + palatal/lingual) x 2 arches (upper + lower) = 4.
    expect(pdRows.length).toBe(4);
    for (const row of pdRows) {
      const btn = row.querySelector(".perio-info-btn") as HTMLButtonElement;
      btn.click();
      const popover = document.querySelector(".perio-info-popover");
      expect(popover!.textContent).toBe(t("perio.info.pd"));
      btn.click(); // close again before the next iteration (toggle)
    }
  });

  it("GM/CAL/BOP rows open perio.info.gm/.cal/.bop respectively", async () => {
    const f = openInline();
    await f.whenStable();
    const findRow = (labelSubstr: string) =>
      Array.from(document.querySelectorAll(".perio-fullgrid-row-label")).find((el) =>
        el.textContent?.includes(labelSubstr),
      )!;

    const gmBtn = findRow(t("perio.gm")).querySelector(".perio-info-btn") as HTMLButtonElement;
    gmBtn.click();
    expect(document.querySelector(".perio-info-popover")!.textContent).toBe(t("perio.info.gm"));

    const calBtn = findRow(t("perio.cal")).querySelector(".perio-info-btn") as HTMLButtonElement;
    calBtn.click();
    expect(document.querySelector(".perio-info-popover")!.textContent).toBe(t("perio.info.cal"));

    const bopBtn = findRow(t("perio.bop")).querySelector(".perio-info-btn") as HTMLButtonElement;
    bopBtn.click();
    expect(document.querySelector(".perio-info-popover")!.textContent).toBe(t("perio.info.bop"));
  });
});

describe("SP-perio PG-D Task 4: the five new info buttons resolve their keys", () => {
  const cases: Array<{ rowKey: string; infoKey: string }> = [
    { rowKey: "perio.pi.row", infoKey: "perio.info.pi" },
    { rowKey: "perio.gi.row", infoKey: "perio.info.gi" },
    { rowKey: "perio.kg.row", infoKey: "perio.info.kg" },
    { rowKey: "perio.gt.row", infoKey: "perio.info.gt" },
    { rowKey: "perio.miller.row", infoKey: "perio.info.miller" },
  ];

  for (const { rowKey, infoKey } of cases) {
    it(`${rowKey}'s info button opens a popover with t("${infoKey}")`, async () => {
      const f = openInline();
      await f.whenStable();
      const rowLabels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label"));
      const target = rowLabels.find((el) => el.textContent?.includes(t(rowKey)));
      const btn = target!.querySelector(".perio-info-btn") as HTMLButtonElement;
      expect(btn).toBeTruthy();
      btn.click();
      const popover = document.querySelector(".perio-info-popover");
      expect(popover).toBeTruthy();
      expect(popover!.textContent).toBe(t(infoKey));
      expect(t(infoKey).trim().length).toBeGreaterThan(0);
    });
  }
});

describe("SP-perio PG-E Task 2: the two new mPI/mBI info buttons resolve their keys", () => {
  const cases: Array<{ rowKey: string; infoKey: string }> = [
    { rowKey: "perio.mpi.row", infoKey: "perio.info.mpi" },
    { rowKey: "perio.mbi.row", infoKey: "perio.info.mbi" },
  ];

  for (const { rowKey, infoKey } of cases) {
    it(`${rowKey}'s info button opens a popover with t("${infoKey}")`, async () => {
      const f = openInline();
      await f.whenStable();
      const rowLabels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label"));
      const target = rowLabels.find((el) => el.textContent?.includes(t(rowKey)));
      const btn = target!.querySelector(".perio-info-btn") as HTMLButtonElement;
      expect(btn).toBeTruthy();
      btn.click();
      const popover = document.querySelector(".perio-info-popover");
      expect(popover).toBeTruthy();
      expect(popover!.textContent).toBe(t(infoKey));
      expect(t(infoKey).trim().length).toBeGreaterThan(0);
    });
  }
});

describe("PG-B Task 1: dismissal + one-open-at-a-time", () => {
  it("click-away (mousedown outside the popover/button) dismisses it", async () => {
    const f = openInline();
    await f.whenStable();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    btn.click();
    expect(document.querySelector(".perio-info-popover")).toBeTruthy();

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(document.querySelector(".perio-info-popover")).toBeNull();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("clicking inside the popover itself does NOT dismiss it", async () => {
    const f = openInline();
    await f.whenStable();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    btn.click();
    const popover = document.querySelector(".perio-info-popover") as HTMLElement;
    expect(popover).toBeTruthy();

    popover.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(document.querySelector(".perio-info-popover")).toBeTruthy();
  });

  it("Escape dismisses the open popover", async () => {
    const f = openInline();
    await f.whenStable();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    btn.click();
    expect(document.querySelector(".perio-info-popover")).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(document.querySelector(".perio-info-popover")).toBeNull();
  });

  it("Escape closes ONLY the popover, not the whole perio-overlay dialog (no DS-1-style stacking conflict)", async () => {
    const f = openOverlay();
    await f.whenStable();
    const dialog = document.getElementById("perioOverlay");
    expect(dialog).toBeTruthy();
    const btn = dialog!.querySelector(".perio-info-btn") as HTMLButtonElement;
    btn.click();
    expect(document.querySelector(".perio-info-popover")).toBeTruthy();

    // Fire from an element INSIDE #perioOverlay so the event actually traverses the
    // overlay's DOM subtree — this genuinely exercises the capture-phase interception
    // (a keyDown on `document` would pass trivially, never reaching the dialog handler).
    btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));

    // The popover is gone, but the overlay dialog itself is still open.
    expect(document.querySelector(".perio-info-popover")).toBeNull();
    expect(document.getElementById("perioOverlay")).toBeTruthy();
  });

  it("clicking a second row's info button closes the first popover (only one open at a time)", async () => {
    const f = openInline();
    await f.whenStable();
    const rows = Array.from(document.querySelectorAll(".perio-fullgrid-row-label")).filter((el) =>
      el.querySelector(".perio-info-btn"),
    );
    const btnA = rows[0].querySelector(".perio-info-btn") as HTMLButtonElement;
    const btnB = rows[1].querySelector(".perio-info-btn") as HTMLButtonElement;

    btnA.click();
    expect(document.querySelectorAll(".perio-info-popover").length).toBe(1);
    expect(btnA.getAttribute("aria-expanded")).toBe("true");

    btnB.click();
    expect(document.querySelectorAll(".perio-info-popover").length).toBe(1);
    expect(btnA.getAttribute("aria-expanded")).toBe("false");
    expect(btnB.getAttribute("aria-expanded")).toBe("true");
  });

  it("clicking the SAME button twice toggles the popover closed", async () => {
    const f = openInline();
    await f.whenStable();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    btn.click();
    expect(document.querySelector(".perio-info-popover")).toBeTruthy();

    btn.click();
    expect(document.querySelector(".perio-info-popover")).toBeNull();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("unmounting the grid while a popover is open removes the (body-appended) popover too", async () => {
    const f = openInline();
    await f.whenStable();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    btn.click();
    expect(document.querySelector(".perio-info-popover")).toBeTruthy();

    f.destroy();

    expect(document.querySelector(".perio-info-popover")).toBeNull();
  });
});

describe("PG-B Task 1: popover accessibility", () => {
  it("the popover carries role=dialog and a non-modal aria-modal", async () => {
    const f = openInline();
    await f.whenStable();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    btn.click();
    const popover = document.querySelector(".perio-info-popover")!;
    expect(popover.getAttribute("role")).toBe("dialog");
    expect(popover.getAttribute("aria-modal")).toBe("false");
  });
});
