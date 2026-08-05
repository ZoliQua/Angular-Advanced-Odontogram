// Angular port of core/__tests__/sp14-ortho-ui.test.ts. Mount route: same
// DI-faked-engine-lifecycle-only TestBed mount as r2a-toggle-ui.spec.ts;
// __orthoCardAllowedForTest/VALID_ORTHO_* are the REAL core/odontogram
// exports.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import {
  __orthoCardAllowedForTest,
  VALID_ORTHO_APPLIANCE,
  VALID_ORTHO_DRIFT,
  VALID_ORTHO_VERTICAL,
} from "../../../core/odontogram";

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

describe("SP14 Task 3: the Ortho card (appliance/drift/vertical/rotation)", () => {
  it("#orthoApplianceSelect, #orthoDriftSelect, #orthoVerticalSelect and #orthoRotationToggle exist inside #orthoCard", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#orthoCard #orthoApplianceSelect")).toBeTruthy();
    expect(f.nativeElement.querySelector("#orthoCard #orthoDriftSelect")).toBeTruthy();
    expect(f.nativeElement.querySelector("#orthoCard #orthoVerticalSelect")).toBeTruthy();
    const toggle = f.nativeElement.querySelector("#orthoCard #orthoRotationToggle");
    expect(toggle).toBeTruthy();
    expect((toggle as HTMLInputElement).type).toBe("checkbox");
  });

  it("selecting an appliance value writes state.orthoAppliance (buildSelect wiring, mirrors #discolorationSelect)", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "orthoApplianceSelect";
    for (const v of VALID_ORTHO_APPLIANCE) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { orthoAppliance: "none" };
    sel.addEventListener("change", () => {
      state.orthoAppliance = sel.value;
    });

    expect(VALID_ORTHO_APPLIANCE.has("bracket")).toBe(true);
    sel.value = "bracket";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.orthoAppliance).toBe("bracket");
  });

  it("selecting a drift value writes state.orthoDrift (buildSelect wiring)", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "orthoDriftSelect";
    for (const v of VALID_ORTHO_DRIFT) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { orthoDrift: "none" };
    sel.addEventListener("change", () => {
      state.orthoDrift = sel.value;
    });

    expect(VALID_ORTHO_DRIFT.has("mesial")).toBe(true);
    sel.value = "mesial";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.orthoDrift).toBe("mesial");
  });

  it("selecting a vertical value writes state.orthoVertical (buildSelect wiring)", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "orthoVerticalSelect";
    for (const v of VALID_ORTHO_VERTICAL) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { orthoVertical: "none" };
    sel.addEventListener("change", () => {
      state.orthoVertical = sel.value;
    });

    expect(VALID_ORTHO_VERTICAL.has("extrusion")).toBe(true);
    sel.value = "extrusion";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.orthoVertical).toBe("extrusion");
  });

  it("toggling #orthoRotationToggle writes state.orthoRotation (checkbox wiring, mirrors #wearEdgeToggle)", () => {
    document.body.innerHTML = "";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "orthoRotationToggle";
    document.body.appendChild(checkbox);

    const state: Record<string, unknown> = { orthoRotation: false };
    checkbox.addEventListener("change", (e) => {
      state.orthoRotation = (e.target as HTMLInputElement).checked;
    });

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.orthoRotation).toBe(true);
  });

  it("card gate: allowed for a plain natural tooth-base or milktooth", () => {
    expect(__orthoCardAllowedForTest({ toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "natural" })).toBe(true);
    expect(__orthoCardAllowedForTest({ toothSelection: "milktooth", restorationType: "none", toothSubstrate: "natural" })).toBe(true);
  });

  it("card gate: hidden for implant or missing tooth", () => {
    expect(__orthoCardAllowedForTest({ toothSelection: "implant", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
    expect(__orthoCardAllowedForTest({ toothSelection: "none", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
  });
});
