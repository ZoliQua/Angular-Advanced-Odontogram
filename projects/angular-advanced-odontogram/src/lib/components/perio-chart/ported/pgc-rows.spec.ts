// Angular port of core/__tests__/pgc-rows.test.ts.
//
// Same mount route as the sibling ported files in this directory (see
// ../perio-p2-grid.spec.ts's header comment for the full rationale).
//
// fireEvent.click -> plain `.click()`.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { PerioChartComponent } from "../perio-chart.component";
import { hideInfoPopover } from "../perio-grid-dom";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  setNumberingSystem,
  getCejVisibility,
  getRootConcavity,
  getToothStateSummary,
  getOdontogramSummary,
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
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setI18nLanguage("en");
});

afterEach(() => {
  hideInfoPopover();
});

describe("PG-C Task 3: cejVisibility row", () => {
  it("a present natural tooth (16) has a cej-visibility control", async () => {
    const f = openOverlay();
    await f.whenStable();
    expect(document.getElementById("perio-fg-cej-16")).toBeTruthy();
  });

  it("clicking cycles none -> detectable -> not-detectable -> none, via setCejVisibility", async () => {
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-cej-16") as HTMLButtonElement;
    expect(getCejVisibility(16)).toBe("none");
    btn.click();
    expect(getCejVisibility(16)).toBe("detectable");
    btn.click();
    expect(getCejVisibility(16)).toBe("not-detectable");
    btn.click();
    expect(getCejVisibility(16)).toBe("none");
  });

  it("a MISSING tooth's cej-visibility control is disabled", async () => {
    __setToothStateForTest(21, { toothSelection: "none" });
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-cej-21") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("an IMPLANT tooth's cej-visibility control is disabled", async () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-cej-21") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("PG-C Task 3: rootConcavity row", () => {
  it("a present natural tooth (26) has a root-concavity control", async () => {
    const f = openOverlay();
    await f.whenStable();
    expect(document.getElementById("perio-fg-rootconcavity-26")).toBeTruthy();
  });

  it("clicking cycles none -> mild -> deep -> none, via setRootConcavity", async () => {
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-rootconcavity-26") as HTMLButtonElement;
    expect(getRootConcavity(26)).toBe("none");
    btn.click();
    expect(getRootConcavity(26)).toBe("mild");
    btn.click();
    expect(getRootConcavity(26)).toBe("deep");
    btn.click();
    expect(getRootConcavity(26)).toBe("none");
  });

  it("a MISSING tooth's root-concavity control is disabled", async () => {
    __setToothStateForTest(36, { toothSelection: "none" });
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-rootconcavity-36") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("an IMPLANT tooth's root-concavity control is disabled", async () => {
    __setToothStateForTest(36, { toothSelection: "implant" });
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-rootconcavity-36") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("PG-C Task 3: rows exist on both chrome variants (overlay + inline)", () => {
  it("the modal overlay renders both rows", async () => {
    const f = openOverlay();
    await f.whenStable();
    const root = document.getElementById("perioOverlayGrid")!;
    expect(root.querySelector("#perio-fg-cej-16")).toBeTruthy();
    expect(root.querySelector("#perio-fg-rootconcavity-16")).toBeTruthy();
  });

  it("the inline panel renders both rows", async () => {
    const f = openInline();
    await f.whenStable();
    const root = document.getElementById("perioInlineGrid")!;
    expect(root.querySelector("#perio-fg-cej-16")).toBeTruthy();
    expect(root.querySelector("#perio-fg-rootconcavity-16")).toBeTruthy();
  });
});

describe("PG-C Task 3: info buttons", () => {
  it('the CEJ-visibility row\'s info button opens a popover with t("perio.info.cej")', async () => {
    const f = openInline();
    await f.whenStable();
    const rowLabels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label"));
    const target = rowLabels.find((el) => el.textContent?.includes(t("perio.cej.label")));
    const btn = target!.querySelector(".perio-info-btn") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();
    const popover = document.querySelector(".perio-info-popover");
    expect(popover).toBeTruthy();
    expect(popover!.textContent).toBe(t("perio.info.cej"));
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });

  it('the root-concavity row\'s info button opens a popover with t("perio.info.rootConcavity")', async () => {
    const f = openInline();
    await f.whenStable();
    const rowLabels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label"));
    const target = rowLabels.find((el) => el.textContent?.includes(t("perio.rootConcavity.label")));
    const btn = target!.querySelector(".perio-info-btn") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();
    const popover = document.querySelector(".perio-info-popover");
    expect(popover).toBeTruthy();
    expect(popover!.textContent).toBe(t("perio.info.rootConcavity"));
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("PG-C Task 3: tooltip + whole-mouth summary surface both axes", () => {
  it("getToothStateSummary includes the perio.cej.* line when cejVisibility is set", async () => {
    const f = openOverlay();
    await f.whenStable();
    (document.getElementById("perio-fg-cej-16") as HTMLButtonElement).click(); // -> detectable
    const lines = getToothStateSummary(16);
    expect(lines).toContain(t("perio.cej.detectable"));
  });

  it("getToothStateSummary omits the cej line when cejVisibility is 'none'", () => {
    const lines = getToothStateSummary(16);
    expect(lines).not.toContain(t("perio.cej.detectable"));
    expect(lines).not.toContain(t("perio.cej.notDetectable"));
  });

  it("getToothStateSummary includes the perio.rootConcavity.* line when rootConcavity is set", async () => {
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-rootconcavity-16") as HTMLButtonElement;
    btn.click(); // -> mild
    btn.click(); // -> deep
    const lines = getToothStateSummary(16);
    expect(lines).toContain(t("perio.rootConcavity.deep"));
  });

  it("getToothStateSummary omits the root-concavity line when it is 'none'", () => {
    const lines = getToothStateSummary(16);
    expect(lines).not.toContain(t("perio.rootConcavity.mild"));
    expect(lines).not.toContain(t("perio.rootConcavity.deep"));
  });

  it("getOdontogramSummary's periodontalText surfaces both axes alongside other periodontal findings", async () => {
    const f = openOverlay();
    await f.whenStable();
    (document.getElementById("perio-fg-cej-16") as HTMLButtonElement).click(); // -> detectable
    const rcBtn = document.getElementById("perio-fg-rootconcavity-26") as HTMLButtonElement;
    rcBtn.click(); // -> mild
    const summary = getOdontogramSummary();
    expect(summary.periodontalText).toContain(t("perio.cej.detectable"));
    expect(summary.periodontalText).toContain(t("perio.rootConcavity.mild"));
  });

  it("getOdontogramSummary's periodontalText is healthy when neither axis is set anywhere", () => {
    const summary = getOdontogramSummary();
    expect(summary.periodontalText).toBe(t("toothInfo.periodontalHealthy"));
  });
});
