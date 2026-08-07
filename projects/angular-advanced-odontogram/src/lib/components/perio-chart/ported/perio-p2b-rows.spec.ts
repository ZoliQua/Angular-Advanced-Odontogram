// Angular port of core/__tests__/perio-p2b-rows.test.ts.
//
// Same mount route as the sibling ported files in this directory (see
// ../perio-p2-grid.spec.ts's header comment for the full rationale): the
// source renders <PerioChart open/inline/> directly via
// @testing-library/react and drives it with fireEvent, nothing here needs a
// live initOdontogram()/SVG-grid mount.
//
// fireEvent.click -> plain `.click()`.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { PerioChartComponent } from "../perio-chart.component";
import { hideInfoPopover } from "../perio-grid-dom";
import { setI18nLanguage } from "../../../core/i18n/useI18n";
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  setNumberingSystem,
  getToothFurcation,
  getToothPlaque,
  getPerioSummary,
} from "../../../core/odontogram";

@Component({
  imports: [PerioChartComponent],
  template: `<aao-perio-chart [open]="true" (closeChart)="closed = true" />`,
})
class OverlayHost {
  closed = false;
}

@Component({
  imports: [PerioChartComponent],
  template: `<aao-perio-chart [inline]="true" />`,
})
class InlineHost {}

function openOverlay() {
  TestBed.configureTestingModule({
    imports: [OverlayHost],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(OverlayHost);
}

function openInline() {
  TestBed.configureTestingModule({
    imports: [InlineHost],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(InlineHost);
}

beforeEach(() => {
  setI18nLanguage("en");
  __resetChartStateForTest();
  setNumberingSystem("FDI");
});

afterEach(() => {
  hideInfoPopover();
});

describe("P2b Task 4: furcation row", () => {
  it("a furcated + present upper molar (16) shows one control per entrance (mesial/distal/buccal)", async () => {
    const f = openOverlay();
    await f.whenStable();
    expect(document.getElementById("perio-fg-furc-16-mesial")).toBeTruthy();
    expect(document.getElementById("perio-fg-furc-16-distal")).toBeTruthy();
    expect(document.getElementById("perio-fg-furc-16-buccal")).toBeTruthy();
    // No lingual entrance on an upper molar.
    expect(document.getElementById("perio-fg-furc-16-lingual")).toBeNull();
  });

  it("a lower molar (46) shows buccal/lingual; an upper first premolar (14) shows mesial/distal", async () => {
    const f = openOverlay();
    await f.whenStable();
    expect(document.getElementById("perio-fg-furc-46-buccal")).toBeTruthy();
    expect(document.getElementById("perio-fg-furc-46-lingual")).toBeTruthy();
    expect(document.getElementById("perio-fg-furc-46-mesial")).toBeNull();
    expect(document.getElementById("perio-fg-furc-14-mesial")).toBeTruthy();
    expect(document.getElementById("perio-fg-furc-14-distal")).toBeTruthy();
    expect(document.getElementById("perio-fg-furc-14-buccal")).toBeNull();
  });

  it("a non-furcated tooth (15, second premolar) shows no furcation cell", async () => {
    const f = openOverlay();
    await f.whenStable();
    const furcCells = document.querySelectorAll('[id^="perio-fg-furc-15-"]');
    expect(furcCells.length).toBe(0);
  });

  it("a MISSING furcated tooth (16 = none) shows no furcation cell", async () => {
    __setToothStateForTest(16, { toothSelection: "none" });
    const f = openOverlay();
    await f.whenStable();
    const furcCells = document.querySelectorAll('[id^="perio-fg-furc-16-"]');
    expect(furcCells.length).toBe(0);
  });

  it("clicking a furcation control cycles the Glickman grade none->I->II->III->IV->none", async () => {
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-furc-16-buccal") as HTMLButtonElement;
    expect(getToothFurcation(16).buccal).toBeUndefined();
    btn.click();
    expect(getToothFurcation(16).buccal).toBe(1);
    btn.click();
    expect(getToothFurcation(16).buccal).toBe(2);
    btn.click();
    btn.click();
    expect(getToothFurcation(16).buccal).toBe(4);
    btn.click(); // wraps back to none
    expect(getToothFurcation(16).buccal).toBeUndefined();
  });

  it("furcation controls on each entrance are independent", async () => {
    const f = openOverlay();
    await f.whenStable();
    (document.getElementById("perio-fg-furc-16-mesial") as HTMLButtonElement).click();
    (document.getElementById("perio-fg-furc-16-distal") as HTMLButtonElement).click();
    (document.getElementById("perio-fg-furc-16-distal") as HTMLButtonElement).click();
    expect(getToothFurcation(16)).toEqual({ mesial: 1, distal: 2 });
  });
});

describe("P2b Task 4: plaque row", () => {
  it("a present tooth (26) shows a 4-surface plaque control (mesial/distal/buccal/lingual)", async () => {
    const f = openOverlay();
    await f.whenStable();
    for (const surface of ["mesial", "distal", "buccal", "lingual"]) {
      expect(document.getElementById(`perio-fg-plaque-26-${surface}`), surface).toBeTruthy();
    }
  });

  it("clicking a plaque surface toggles it (getToothPlaque updates) and the summary PI% changes", async () => {
    const f = openOverlay();
    await f.whenStable();
    expect(getToothPlaque(26)).toEqual([]);
    const btn = document.getElementById("perio-fg-plaque-26-buccal") as HTMLButtonElement;
    btn.click();
    expect(getToothPlaque(26)).toContain("buccal");
    expect(getPerioSummary().plaquePercent).toBeGreaterThan(0);
    await f.whenStable();
    const plaqueSummary = document.getElementById("perio-fg-summary-plaque")!;
    expect(plaqueSummary.textContent).toContain(String(getPerioSummary().plaquePercent));
    btn.click(); // toggle off
    expect(getToothPlaque(26)).toEqual([]);
  });

  it("a MISSING tooth's plaque controls are disabled", async () => {
    __setToothStateForTest(21, { toothSelection: "none" });
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-plaque-21-buccal") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("P2b Task 4: summary bar", () => {
  it("shows a max-furcation and a PI% item reflecting getPerioSummary()", async () => {
    const f = openOverlay();
    await f.whenStable();
    // Both summary items exist.
    expect(document.getElementById("perio-fg-summary-maxfurc")).toBeTruthy();
    expect(document.getElementById("perio-fg-summary-plaque")).toBeTruthy();

    (document.getElementById("perio-fg-furc-16-buccal") as HTMLButtonElement).click();
    (document.getElementById("perio-fg-furc-16-buccal") as HTMLButtonElement).click();
    (document.getElementById("perio-fg-furc-16-buccal") as HTMLButtonElement).click(); // grade III
    (document.getElementById("perio-fg-plaque-26-buccal") as HTMLButtonElement).click();
    await f.whenStable();

    const summary = getPerioSummary();
    expect(summary.maxFurcation).toBe(3);
    // Summary shows the Glickman grade in Roman numerals (III), matching the
    // row's cycle-control faces.
    expect(document.getElementById("perio-fg-summary-maxfurc")!.textContent).toBe("III");
    expect(document.getElementById("perio-fg-summary-plaque")!.textContent).toContain(
      String(summary.plaquePercent),
    );
  });

  it("starts with a blank max furcation when nothing is graded", async () => {
    const f = openOverlay();
    await f.whenStable();
    expect(document.getElementById("perio-fg-summary-maxfurc")!.textContent).toContain("–");
  });
});

describe("P2b Task 4: both chrome variants (overlay + inline) carry the rows", () => {
  it("the modal overlay renders both rows", async () => {
    const f = openOverlay();
    await f.whenStable();
    const root = document.getElementById("perioOverlayGrid")!;
    expect(root.querySelector('[id^="perio-fg-furc-16-"]')).toBeTruthy();
    expect(root.querySelector('[id^="perio-fg-plaque-26-"]')).toBeTruthy();
  });

  it("the inline panel renders both rows", async () => {
    const f = openInline();
    await f.whenStable();
    const root = document.getElementById("perioInlineGrid")!;
    expect(root.querySelector('[id^="perio-fg-furc-16-"]')).toBeTruthy();
    expect(root.querySelector('[id^="perio-fg-plaque-26-"]')).toBeTruthy();
  });
});
