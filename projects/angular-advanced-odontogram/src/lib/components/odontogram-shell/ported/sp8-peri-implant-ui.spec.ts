// Angular port of core/__tests__/sp8-peri-implant-ui.test.ts. Mount route:
// same DI-faked-engine-lifecycle-only TestBed mount as r2a-toggle-ui.spec.ts;
// the __*ForTest seams and VALID_PERI_IMPLANT are the REAL core/odontogram
// exports.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import {
  __syncPeriImplantVisibilityForTest,
  __applyPeriImplantSelectionForTest,
  VALID_PERI_IMPLANT,
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

describe("SP8 Task 5: peri-implant UI", () => {
  it("#periImplantSelect exists in the perio block", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#rpPerioBlock #periImplantRow #periImplantSelect")).toBeTruthy();
  });

  it("shown for an implant, hidden for a natural tooth", () => {
    document.body.innerHTML = "";
    const row = document.createElement("div");
    row.id = "periImplantRow";
    row.className = "row hidden";
    document.body.appendChild(row);

    __syncPeriImplantVisibilityForTest(row, null, "implant");
    expect(row.classList.contains("hidden")).toBe(false);

    __syncPeriImplantVisibilityForTest(row, null, "tooth-base");
    expect(row.classList.contains("hidden")).toBe(true);
  });

  it("mods checkboxes hidden for an implant", () => {
    document.body.innerHTML = "";
    const container = document.createElement("div");
    container.id = "modsChecks";
    const build = (value: string, text: string) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = value;
      const span = document.createElement("span");
      span.textContent = text;
      label.appendChild(input);
      label.appendChild(span);
      container.appendChild(label);
      return label;
    };
    const parodontalLabel = build("parodontal", "Parodontal");
    const inflammationLabel = build("inflammation", "Inflammation");
    document.body.appendChild(container);

    __syncPeriImplantVisibilityForTest(null, container, "implant");
    expect(parodontalLabel.classList.contains("hidden")).toBe(true);
    expect(inflammationLabel.classList.contains("hidden")).toBe(true);

    __syncPeriImplantVisibilityForTest(null, container, "tooth-base");
    expect(parodontalLabel.classList.contains("hidden")).toBe(false);
    expect(inflammationLabel.classList.contains("hidden")).toBe(false);
  });

  it("selecting a value writes state.periImplant", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "periImplantSelect";
    for (const v of VALID_PERI_IMPLANT) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { periImplant: "none" };
    sel.addEventListener("change", () => {
      __applyPeriImplantSelectionForTest(state, sel.value);
    });

    expect(VALID_PERI_IMPLANT.has("peri-implantitis-moderate")).toBe(true);
    sel.value = "peri-implantitis-moderate";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.periImplant).toBe("peri-implantitis-moderate");
  });
});
