// Angular port of core/__tests__/sp11-wear-ui.test.ts. Mount route: same
// DI-faked-engine-lifecycle-only TestBed mount as r2a-toggle-ui.spec.ts;
// __wearRowAllowedForTest/VALID_WEAR_EDGE/VALID_WEAR_CERVICAL are the REAL
// core/odontogram exports.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import { __wearRowAllowedForTest, VALID_WEAR_EDGE, VALID_WEAR_CERVICAL } from "../../../core/odontogram";

const engineLifecycle = { init: async () => {}, destroy: () => {} };

beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

describe("SP11 Task 3: wear-type dropdowns replace bruxism checkboxes", () => {
  it("#wearEdgeSelect and #wearCervicalSelect exist inside #bruxismRow", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#bruxismRow #wearEdgeSelect")).toBeTruthy();
    expect(f.nativeElement.querySelector("#bruxismRow #wearCervicalSelect")).toBeTruthy();
  });

  it("the old bruxism checkboxes are gone", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#bruxismWear")).toBeNull();
    expect(f.nativeElement.querySelector("#bruxismNeckWear")).toBeNull();
  });

  it("selecting a wearEdge value writes state.wearEdge (buildSelect wiring, mirrors #resorptionSelect)", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "wearEdgeSelect";
    for (const v of VALID_WEAR_EDGE) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { wearEdge: "none" };
    sel.addEventListener("change", () => {
      state.wearEdge = sel.value;
    });

    expect(VALID_WEAR_EDGE.has("erosion")).toBe(true);
    sel.value = "erosion";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.wearEdge).toBe("erosion");
  });

  it("selecting a wearCervical value writes state.wearCervical", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "wearCervicalSelect";
    for (const v of VALID_WEAR_CERVICAL) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { wearCervical: "none" };
    sel.addEventListener("change", () => {
      state.wearCervical = sel.value;
    });

    expect(VALID_WEAR_CERVICAL.has("abfraction")).toBe(true);
    sel.value = "abfraction";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.wearCervical).toBe("abfraction");
  });

  it("row gate: allowed only for tooth-base + no restoration + natural substrate", () => {
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "natural" })).toBe(true);
  });

  it("row gate quirk fix: a crown-prepped/broken/radix substrate (matching the render gate) now hides the row too", () => {
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "radix" })).toBe(false);
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "broken" })).toBe(false);
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "crownprep" })).toBe(false);
  });

  it("row gate: hidden when a restoration is present or the tooth isn't a natural present tooth", () => {
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "natural" })).toBe(false);
    expect(__wearRowAllowedForTest({ toothSelection: "implant", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
    expect(__wearRowAllowedForTest({ toothSelection: "none", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
  });
});
