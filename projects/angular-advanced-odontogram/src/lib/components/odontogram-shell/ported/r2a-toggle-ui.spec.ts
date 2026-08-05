// Angular port of core/__tests__/r2a-toggle-ui.test.ts.
//
// Mount route (per task-6 amendments, superseding the brief's literal
// vi.mock instructions — see odontogram-shell.component.spec.ts's header
// comment for why `vi.mock` is unavailable under `npm run test:ng`):
// TestBed.createComponent(OdontogramShellComponent) with ONLY
// ODONTOGRAM_ENGINE_LIFECYCLE DI-faked (init/destroy no-ops); every other
// engine function (setChartMode/getChartMode/__resetChartStateForTest) is
// the REAL, unmocked core/odontogram export — exactly what the source
// test's `vi.mock(..., { ...actual })` forwarding already meant: only the
// heavy imperative DOM/SVG lifecycle was faked, everything else was real.
//
// Harness 2 ("real click wiring") doesn't need the Shell mounted at all:
// setChartMode()'s real, private syncChartModeUi() queries the DOM by
// id/class directly (odontogram.ts) and is null-safe with no engine mount —
// the source test's own hand-built DOM fixture proves this. Ported verbatim,
// unchanged from the source (no Angular-specific adaptation needed there).
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

describe("R2-A Task 3: #chartModeToggle placement (chart-header, not topbar, not the Controls panel)", () => {
  it("#chartModeToggle exists inside .chart-header with a Status and a Plan segment", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const toggle = f.nativeElement.querySelector(".chart-header #chartModeToggle");
    expect(toggle).toBeTruthy();
    const statusBtn = f.nativeElement.querySelector(".chart-header #chartModeToggle #chartModeStatus");
    const planBtn = f.nativeElement.querySelector(".chart-header #chartModeToggle #chartModePlan");
    expect(statusBtn).toBeTruthy();
    expect(planBtn).toBeTruthy();
  });

  it("is NOT inside the topbar", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector(".topbar #chartModeToggle")).toBeFalsy();
  });

  it("is NOT inside the right Controls panel (aside.panel)", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("aside.panel #chartModeToggle")).toBeFalsy();
  });

  it("is distinct from the existing chart-actions (tooth-type icon buttons)", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector(".chart-actions #chartModeToggle")).toBeFalsy();
    expect(f.nativeElement.querySelector(".chart-actions #chartModeStatus")).toBeFalsy();
  });

  it("Status starts as the active segment (initial mode)", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const statusBtn = f.nativeElement.querySelector("#chartModeStatus") as HTMLElement;
    const planBtn = f.nativeElement.querySelector("#chartModePlan") as HTMLElement;
    expect(statusBtn.classList.contains("is-active")).toBe(true);
    expect(planBtn.classList.contains("is-active")).toBe(false);
  });
});

describe("R2-A Task 3: real click wiring (setChartMode + syncChartModeUi via a production-shaped DOM fixture)", () => {
  function mountChartModeFixture(): { chartCard: HTMLElement; statusBtn: HTMLButtonElement; planBtn: HTMLButtonElement; badge: HTMLElement } {
    document.body.innerHTML = `
      <section class="chart">
        <div class="chart-header">
          <div id="chartModeToggle" class="chart-mode-toggle" role="tablist">
            <button id="chartModeStatus" type="button" class="chart-mode-btn is-active" role="tab" aria-selected="true">Status</button>
            <button id="chartModePlan" type="button" class="chart-mode-btn" role="tab" aria-selected="false">Plan</button>
            <span id="chartModePlanBadge" class="plan-badge hidden">PLAN</span>
          </div>
        </div>
      </section>
    `;
    const chartCard = document.querySelector(".chart") as HTMLElement;
    const statusBtn = document.getElementById("chartModeStatus") as HTMLButtonElement;
    const planBtn = document.getElementById("chartModePlan") as HTMLButtonElement;
    const badge = document.getElementById("chartModePlanBadge") as HTMLElement;
    statusBtn.addEventListener("click", () => setChartMode("status"));
    planBtn.addEventListener("click", () => setChartMode("plan"));
    return { chartCard, statusBtn, planBtn, badge };
  }

  it("clicking Plan switches mode, activates the Plan segment, and cues the chart card", () => {
    const { chartCard, statusBtn, planBtn, badge } = mountChartModeFixture();
    expect(getChartMode()).toBe("status");

    planBtn.click();

    expect(getChartMode()).toBe("plan");
    expect(planBtn.classList.contains("is-active")).toBe(true);
    expect(statusBtn.classList.contains("is-active")).toBe(false);
    expect(chartCard.classList.contains("plan-mode")).toBe(true);
    expect(badge.classList.contains("hidden")).toBe(false);
  });

  it("clicking Status reverts mode, re-activates Status, and clears the cue", () => {
    const { chartCard, statusBtn, planBtn, badge } = mountChartModeFixture();
    planBtn.click();
    expect(getChartMode()).toBe("plan");

    statusBtn.click();

    expect(getChartMode()).toBe("status");
    expect(statusBtn.classList.contains("is-active")).toBe(true);
    expect(planBtn.classList.contains("is-active")).toBe(false);
    expect(chartCard.classList.contains("plan-mode")).toBe(false);
    expect(badge.classList.contains("hidden")).toBe(true);
  });

  it("clicking the already-active segment is a no-op (mode/classes unchanged)", () => {
    const { chartCard, statusBtn, badge } = mountChartModeFixture();
    statusBtn.click();
    expect(getChartMode()).toBe("status");
    expect(statusBtn.classList.contains("is-active")).toBe(true);
    expect(chartCard.classList.contains("plan-mode")).toBe(false);
    expect(badge.classList.contains("hidden")).toBe(true);
  });

  it("setChartMode() with no chart-mode DOM mounted at all does not throw (null-safe syncChartModeUi)", () => {
    document.body.innerHTML = "";
    expect(() => setChartMode("plan")).not.toThrow();
    expect(getChartMode()).toBe("plan");
    setChartMode("status");
  });
});
