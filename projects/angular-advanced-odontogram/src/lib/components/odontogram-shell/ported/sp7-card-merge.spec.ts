// Angular port of core/__tests__/sp7-card-merge.test.ts. Mount route: same
// DI-faked-engine-lifecycle-only TestBed mount as r2a-toggle-ui.spec.ts;
// __syncInflammationModVisibilityForTest is the REAL core/odontogram export.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import { __syncInflammationModVisibilityForTest } from "../../../core/odontogram";

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

describe("SP7 Task 5: Root and Periodontium merged card", () => {
  it("has one #rootPeriodontiumSection and neither old section", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#rootPeriodontiumSection")).toBeTruthy();
    expect(f.nativeElement.querySelector("#endoSection")).toBeNull();
    expect(f.nativeElement.querySelector("#inflammationSection")).toBeNull();
  });

  it("periapicalTypeRow lives under apicalDxRow in the root block", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const root = f.nativeElement.querySelector("#rpRootBlock")!;
    expect(root).toBeTruthy();
    expect(root.querySelector("#apicalDxRow")).toBeTruthy();
    expect(root.querySelector("#periapicalTypeRow")).toBeTruthy();
    expect(root.querySelector("#pulpEndoSelect")).toBeTruthy();
  });

  it("mobility + calculus + mods live in the perio block", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const perio = f.nativeElement.querySelector("#rpPerioBlock")!;
    expect(perio).toBeTruthy();
    expect(perio.querySelector("#mobilityRow")).toBeTruthy();
    expect(perio.querySelector("#calculusRow")).toBeTruthy();
    expect(perio.querySelector("#modsChecks")).toBeTruthy();
  });

  it("has one collapse button wired to the merged card", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#btnToggleRootPeriodontiumCard")).toBeTruthy();
    expect(f.nativeElement.querySelector("#btnToggleEndoCard")).toBeNull();
    expect(f.nativeElement.querySelector("#btnToggleInflammationCard")).toBeNull();
  });

  it("hides the inflammation mod checkbox's row for a present tooth and for an implant (implant case superseded by SP15 Task 3 / B4 — see sp15-inflammation-toggle.test.ts)", () => {
    document.body.innerHTML = "";
    const container = document.createElement("div");
    container.id = "modsChecks";
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = "inflammation";
    const span = document.createElement("span");
    span.textContent = "Inflammation";
    label.appendChild(input);
    label.appendChild(span);
    container.appendChild(label);
    document.body.appendChild(container);

    __syncInflammationModVisibilityForTest(container, "tooth-base");
    expect(label.classList.contains("hidden")).toBe(true);

    __syncInflammationModVisibilityForTest(container, "implant");
    expect(label.classList.contains("hidden")).toBe(true);

    __syncInflammationModVisibilityForTest(container, "none");
    expect(label.classList.contains("hidden")).toBe(false);
  });
});
