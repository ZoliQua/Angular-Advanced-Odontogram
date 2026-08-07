// Angular port of core/__tests__/perio-p1-ui.test.ts.
//
// Mount route (same precedent as r2a-toggle-ui.spec.ts / odontogram-shell
// .component.spec.ts's header): TestBed.createComponent(OdontogramShellComponent)
// with ONLY ODONTOGRAM_ENGINE_LIFECYCLE DI-faked (init/destroy no-ops, no
// fake-tooth-svg injection needed — this file's #perioRow JSX-placement
// harness never asserts anything about #toothGrid's contents); every other
// engine function (PERIO_SITES/setPerioSite/getToothPerio/getToothCal/
// __syncPerioRowForTest/__perioRowHiddenForTest/__buildPerioGridForTest/
// __setToothStateForTest/__resetChartStateForTest) is the REAL, unmocked
// core/odontogram export — exactly what the source's `vi.mock(..., {
// ...actual })` forwarding already meant.
//
// The source's own two-harness split carries over unchanged: (1) <App/> (here:
// the Shell) mounted only to prove #perioRow's placement inside
// #rootPeriodontiumSection (already transcribed to the shell template in an
// earlier phase — no Task 5 markup change needed for this part); (2)-(4) are
// framework-free calls straight into core/odontogram, needing no TestBed
// mount at all, ported verbatim.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import {
  PERIO_SITES,
  setPerioSite,
  getToothPerio,
  getToothCal,
  __syncPerioRowForTest,
  __perioRowHiddenForTest,
  __buildPerioGridForTest,
  __setToothStateForTest,
  __resetChartStateForTest,
} from "../../../core/odontogram";

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

describe("SP-perio P1 Task 2: #perioRow JSX placement/structure", () => {
  it("#perioRow (with its #perioGrid + #perioReadout containers) lives inside the root-periodontium card", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#rootPeriodontiumSection #perioRow")).toBeTruthy();
    expect(f.nativeElement.querySelector("#rootPeriodontiumSection #perioRow #perioGrid")).toBeTruthy();
    expect(f.nativeElement.querySelector("#rootPeriodontiumSection #perioRow #perioReadout")).toBeTruthy();
  });
});

describe("SP-perio P1 Task 2: real grid-building DOM shape (__buildPerioGridForTest, forwarding the real buildPerioGrid())", () => {
  it("builds 6 PD, 6 GM, 6 BOP and 6 SUP inputs, one per PERIO_SITES entry", () => {
    document.body.innerHTML = '<div id="perioGrid"></div>';
    __buildPerioGridForTest(document.getElementById("perioGrid") as Element);

    for (const site of PERIO_SITES) {
      const pd = document.querySelector(`#perioGrid input[data-site="${site}"][data-field="pd"]`) as HTMLInputElement;
      const gm = document.querySelector(`#perioGrid input[data-site="${site}"][data-field="gm"]`) as HTMLInputElement;
      const bop = document.querySelector(`#perioGrid input[data-site="${site}"][data-field="bop"]`) as HTMLInputElement;
      const sup = document.querySelector(`#perioGrid input[data-site="${site}"][data-field="sup"]`) as HTMLInputElement;
      expect(pd, `PD input for ${site}`).toBeTruthy();
      expect(pd.type).toBe("number");
      expect(gm, `GM input for ${site}`).toBeTruthy();
      expect(gm.type).toBe("number");
      expect(bop, `BOP checkbox for ${site}`).toBeTruthy();
      expect(bop.type).toBe("checkbox");
      expect(sup, `SUP checkbox for ${site}`).toBeTruthy();
      expect(sup.type).toBe("checkbox");
    }
  });

  it("lays out the buccal sites (MB/B/DB) before the lingual sites (ML/L/DL), PERIO_SITES' own order", () => {
    document.body.innerHTML = '<div id="perioGrid"></div>';
    const grid = document.getElementById("perioGrid") as Element;
    __buildPerioGridForTest(grid);
    const cells = Array.from(grid.querySelectorAll(".perio-site-cell")).map((c) => c.getAttribute("data-site"));
    expect(cells).toEqual(["MB", "B", "DB", "ML", "L", "DL"]);
  });
});

describe("SP-perio P1 Task 2: perioRowHidden gate (reused for #perioRow visibility)", () => {
  it("hidden for a missing tooth", () => {
    expect(__perioRowHiddenForTest({ toothSelection: "none" })).toBe(true);
  });
  it("hidden for an implant", () => {
    expect(__perioRowHiddenForTest({ toothSelection: "implant" })).toBe(true);
  });
  it("hidden for a tooth under gum", () => {
    expect(__perioRowHiddenForTest({ toothSelection: "tooth-under-gum" })).toBe(true);
  });
  it("hidden for an extraction socket", () => {
    expect(__perioRowHiddenForTest({ toothSelection: "no-tooth-after-extraction" })).toBe(true);
  });
  it("NOT hidden for a natural present tooth", () => {
    expect(__perioRowHiddenForTest({ toothSelection: "tooth-base" })).toBe(false);
  });
  it("NOT hidden for a milk tooth", () => {
    expect(__perioRowHiddenForTest({ toothSelection: "milktooth" })).toBe(false);
  });
});

describe("SP-perio P1 Task 2: real write path (hand-built #perioRow fixture, production listener contract)", () => {
  /** Mirrors the shell's real #perioRow/#perioGrid markup closely enough for
   *  __syncPerioRowForTest (forwarding the real, private syncPerioRow()) to
   *  find every element it queries by id/data-attribute, and reproduces the
   *  exact change-listener contract buildPerioGrid() installs in production:
   *  setPerioSite(toothNo, site, patch) on change, then re-sync (setPerioSite
   *  deliberately never touches DOM itself). */
  function mountPerioFixture(toothNo: number): { pd: HTMLInputElement; gm: HTMLInputElement; bop: HTMLInputElement; readout: HTMLElement } {
    document.body.innerHTML = `
      <div id="perioRow" class="perio-block">
        <div id="perioGrid" class="perio-grid">
          <div class="perio-site-row">
            <div class="perio-site-cell" data-site="MB">
              <input type="number" id="perio-pd-MB" data-site="MB" data-field="pd" min="1" max="15" step="1" />
              <input type="number" id="perio-gm-MB" data-site="MB" data-field="gm" min="-10" max="20" step="1" />
              <input type="checkbox" id="perio-bop-MB" data-site="MB" data-field="bop" />
              <input type="checkbox" id="perio-sup-MB" data-site="MB" data-field="sup" />
            </div>
          </div>
        </div>
        <div id="perioReadout" class="hint"></div>
      </div>
    `;
    const pd = document.getElementById("perio-pd-MB") as HTMLInputElement;
    const gm = document.getElementById("perio-gm-MB") as HTMLInputElement;
    const bop = document.getElementById("perio-bop-MB") as HTMLInputElement;
    const readout = document.getElementById("perioReadout") as HTMLElement;

    pd.addEventListener("change", () => {
      const raw = pd.value.trim();
      setPerioSite(toothNo, "MB", { pd: raw === "" ? null : Number(raw) });
      __syncPerioRowForTest({ toothSelection: "tooth-base" }, toothNo);
    });
    gm.addEventListener("change", () => {
      const raw = gm.value.trim();
      if (raw === "") return;
      setPerioSite(toothNo, "MB", { gm: Number(raw) });
      __syncPerioRowForTest({ toothSelection: "tooth-base" }, toothNo);
    });
    bop.addEventListener("change", () => {
      setPerioSite(toothNo, "MB", { bop: bop.checked });
      __syncPerioRowForTest({ toothSelection: "tooth-base" }, toothNo);
    });
    return { pd, gm, bop, readout };
  }

  it("authoring PD + GM + BOP on one site updates state (getToothPerio) and the live read-out shows derived CAL + tooth %BOP", () => {
    __setToothStateForTest(21, {});
    const { pd, gm, bop, readout } = mountPerioFixture(21);

    pd.value = "5";
    pd.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getToothPerio(21).pd.MB).toBe(5);

    gm.value = "2";
    gm.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getToothPerio(21).gm.MB).toBe(2);

    bop.checked = true;
    bop.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getToothPerio(21).bop).toEqual(["MB"]);

    // Derived CAL = pd + gm = 7, surfaced via the real getToothCal().
    expect(getToothCal(21).get("MB")).toBe(7);

    // Live read-out reflects both the per-site CAL and the tooth-level %BOP
    // (1 charted site, 1 bleeding -> 100%).
    expect(readout.textContent).toContain("7");
    expect(readout.textContent).toMatch(/100/);
  });

  it("clearing PD (blank) un-charts the site — state and read-out both revert to empty", () => {
    __setToothStateForTest(22, {});
    const { pd, readout } = mountPerioFixture(22);

    pd.value = "6";
    pd.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getToothPerio(22).pd.MB).toBe(6);

    pd.value = "";
    pd.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getToothPerio(22).pd.MB).toBeUndefined();
    expect(getToothCal(22).has("MB")).toBe(false);
    expect(readout.textContent?.length).toBeGreaterThan(0); // empty-state message, not blank
  });
});
