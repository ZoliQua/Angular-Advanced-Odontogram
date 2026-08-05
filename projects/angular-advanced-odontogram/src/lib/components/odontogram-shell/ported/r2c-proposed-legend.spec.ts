// Angular port of core/__tests__/r2c-proposed-legend.test.ts.
//
// Same two-harness split and DI-faked-lifecycle-only mount route as
// r2a-toggle-ui.spec.ts (see that file's header comment for the rationale).
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import { setChartMode, getChartMode, __resetChartStateForTest } from "../../../core/odontogram";

const engineLifecycle = { init: async () => {}, destroy: () => {} };

beforeEach(() => {
  __resetChartStateForTest();
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

describe("R2-C Task 2: #proposedLegend placement + copy", () => {
  it("#proposedLegend exists inside .chart and carries the chart.proposedLegend copy", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const legend = f.nativeElement.querySelector(".chart #proposedLegend");
    expect(legend).toBeTruthy();
    expect(legend?.textContent).toContain("dashed = proposed");
  });

  it("is NOT reachable via the .chart.plan-mode selector on App's default (status-mode) markup", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector(".chart.plan-mode #proposedLegend")).toBeFalsy();
  });
});

describe("R2-C Task 2: real toggle wiring — legend reachable only under .chart.plan-mode", () => {
  function mountChartModeFixture(): { chartCard: HTMLElement; statusBtn: HTMLButtonElement; planBtn: HTMLButtonElement } {
    document.body.innerHTML = `
      <section class="chart">
        <div class="chart-header">
          <div id="chartModeToggle" class="chart-mode-toggle" role="tablist">
            <button id="chartModeStatus" type="button" class="chart-mode-btn is-active" role="tab" aria-selected="true">Status</button>
            <button id="chartModePlan" type="button" class="chart-mode-btn" role="tab" aria-selected="false">Plan</button>
            <span id="chartModePlanBadge" class="plan-badge hidden">PLAN</span>
          </div>
          <div id="proposedLegend" class="proposed-legend">
            <span class="proposed-legend-swatch" aria-hidden="true"></span>
            dashed = proposed
          </div>
        </div>
      </section>
    `;
    const chartCard = document.querySelector(".chart") as HTMLElement;
    const statusBtn = document.getElementById("chartModeStatus") as HTMLButtonElement;
    const planBtn = document.getElementById("chartModePlan") as HTMLButtonElement;
    statusBtn.addEventListener("click", () => setChartMode("status"));
    planBtn.addEventListener("click", () => setChartMode("plan"));
    return { chartCard, statusBtn, planBtn };
  }

  it("clicking Plan makes the legend reachable via .chart.plan-mode #proposedLegend", () => {
    mountChartModeFixture();
    expect(getChartMode()).toBe("status");
    expect(document.querySelector(".chart.plan-mode #proposedLegend")).toBeFalsy();

    (document.getElementById("chartModePlan") as HTMLButtonElement).click();

    expect(getChartMode()).toBe("plan");
    expect(document.querySelector(".chart.plan-mode #proposedLegend")).toBeTruthy();
  });

  it("clicking Status makes the legend unreachable via .chart.plan-mode #proposedLegend again", () => {
    mountChartModeFixture();
    (document.getElementById("chartModePlan") as HTMLButtonElement).click();
    expect(document.querySelector(".chart.plan-mode #proposedLegend")).toBeTruthy();

    (document.getElementById("chartModeStatus") as HTMLButtonElement).click();

    expect(getChartMode()).toBe("status");
    expect(document.querySelector(".chart.plan-mode #proposedLegend")).toBeFalsy();
  });

  it("the legend element itself is never removed from the DOM — only its reachability via the plan-mode selector changes", () => {
    mountChartModeFixture();
    expect(document.getElementById("proposedLegend")).toBeTruthy();

    (document.getElementById("chartModePlan") as HTMLButtonElement).click();
    expect(document.getElementById("proposedLegend")).toBeTruthy();

    (document.getElementById("chartModeStatus") as HTMLButtonElement).click();
    expect(document.getElementById("proposedLegend")).toBeTruthy();
  });
});
