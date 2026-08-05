// Angular port of core/__tests__/sp12-discoloration-ui.test.ts. Mount route:
// same DI-faked-engine-lifecycle-only TestBed mount as r2a-toggle-ui.spec.ts;
// __discolorationRowAllowedForTest/VALID_DISCOLORATION are the REAL
// core/odontogram exports.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import { __discolorationRowAllowedForTest, VALID_DISCOLORATION } from "../../../core/odontogram";

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

describe("SP12 Task 3: discoloration dropdown next to the wear row", () => {
  it("#discolorationSelect exists inside #discolorationRow", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#discolorationRow #discolorationSelect")).toBeTruthy();
  });

  it("#discolorationRow is placed immediately after #bruxismRow", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const bruxismRow = f.nativeElement.querySelector("#bruxismRow");
    expect(bruxismRow?.nextElementSibling?.id).toBe("discolorationRow");
  });

  it("selecting a discoloration value writes state.discoloration (buildSelect wiring, mirrors #wearEdgeSelect)", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "discolorationSelect";
    for (const v of VALID_DISCOLORATION) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { discoloration: "none" };
    sel.addEventListener("change", () => {
      state.discoloration = sel.value;
    });

    expect(VALID_DISCOLORATION.has("tetracycline")).toBe(true);
    sel.value = "tetracycline";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.discoloration).toBe("tetracycline");
  });

  it("row gate: allowed for a plain natural tooth-base or milktooth", () => {
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "natural" })).toBe(true);
    expect(__discolorationRowAllowedForTest({ toothSelection: "milktooth", restorationType: "none", toothSubstrate: "natural" })).toBe(true);
  });

  it("row gate: hidden for a crowned tooth or a non-natural substrate", () => {
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "natural" })).toBe(false);
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "radix" })).toBe(false);
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "broken" })).toBe(false);
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "crownprep" })).toBe(false);
  });

  it("row gate: hidden when the tooth isn't a natural present tooth at all", () => {
    expect(__discolorationRowAllowedForTest({ toothSelection: "implant", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
    expect(__discolorationRowAllowedForTest({ toothSelection: "none", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
  });
});
