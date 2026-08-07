// Angular port of core/__tests__/p4a-case-panel.test.ts.
//
// Same mount route as perio-graphical-presentation.spec.ts: TestBed.createComponent
// (OdontogramShellComponent) with ONLY ODONTOGRAM_ENGINE_LIFECYCLE DI-faked
// (fake-tooth-svg injection into #toothGrid, mirroring the source mock);
// getCaseMeta/resetCaseMeta/closePerioOverlay/setPerioViewMode and the full
// perio data-core surface the case-metadata panel needs at mount are the
// REAL, unmocked core/odontogram export.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import { getCaseMeta, resetCaseMeta, closePerioOverlay, setPerioViewMode } from "../../../core/odontogram";

const engineLifecycle = {
  init: async () => {
    const grid = document.getElementById("toothGrid");
    if (grid && !grid.querySelector("[data-fake-tooth-svg]")) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("data-fake-tooth-svg", "11");
      grid.appendChild(svg);
    }
  },
  destroy: () => {},
};

async function openDentalChart() {
  const f = TestBed.createComponent(OdontogramShellComponent);
  await f.whenStable();
  (f.nativeElement.querySelector("#appViewDentalChart") as HTMLButtonElement).click();
  await f.whenStable();
  return f;
}

beforeEach(() => {
  document.body.innerHTML = "";
  document.documentElement.classList.remove("dark");
  closePerioOverlay();
  setPerioViewMode("toggle");
  resetCaseMeta();
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

describe("P4a Task 2: case-metadata panel renders in the Dental Chart", () => {
  it("renders the panel title", async () => {
    const f = await openDentalChart();
    expect(f.nativeElement.querySelector("#caseMetaPanel")).toBeTruthy();
  });

  it("renders all 7 controls", async () => {
    const f = await openDentalChart();
    expect(f.nativeElement.querySelector("#caseMetaAge")).toBeTruthy();
    expect(f.nativeElement.querySelector("#caseMetaSmoking")).toBeTruthy();
    expect(f.nativeElement.querySelector("#caseMetaCigarettesPerDay")).toBeTruthy();
    expect(f.nativeElement.querySelector("#caseMetaDiabetes")).toBeTruthy();
    expect(f.nativeElement.querySelector("#caseMetaHba1c")).toBeTruthy();
    expect(f.nativeElement.querySelector("#caseMetaRbl")).toBeTruthy();
    expect(f.nativeElement.querySelector("#caseMetaToothLoss")).toBeTruthy();
  });
});

describe("P4a Task 2: each control calls its setter", () => {
  it("age input calls setCaseAge", async () => {
    const f = await openDentalChart();
    const input = f.nativeElement.querySelector("#caseMetaAge") as HTMLInputElement;
    input.value = "54";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect(getCaseMeta().age).toBe(54);
  });

  it("smoking select calls setSmokingStatus", async () => {
    const f = await openDentalChart();
    const select = f.nativeElement.querySelector("#caseMetaSmoking") as HTMLSelectElement;
    select.value = "current";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect(getCaseMeta().smokingStatus).toBe("current");
  });

  it("cigarettes/day input calls setCigarettesPerDay (once smoking=current)", async () => {
    const f = await openDentalChart();
    const select = f.nativeElement.querySelector("#caseMetaSmoking") as HTMLSelectElement;
    select.value = "current";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    const cigs = f.nativeElement.querySelector("#caseMetaCigarettesPerDay") as HTMLInputElement;
    cigs.value = "12";
    cigs.dispatchEvent(new Event("input", { bubbles: true }));
    cigs.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect(getCaseMeta().cigarettesPerDay).toBe(12);
  });

  it("diabetes select calls setDiabetesStatus", async () => {
    const f = await openDentalChart();
    const select = f.nativeElement.querySelector("#caseMetaDiabetes") as HTMLSelectElement;
    select.value = "present";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect(getCaseMeta().diabetesStatus).toBe("present");
  });

  it("HbA1c input calls setHba1c (once diabetes=present)", async () => {
    const f = await openDentalChart();
    const select = f.nativeElement.querySelector("#caseMetaDiabetes") as HTMLSelectElement;
    select.value = "present";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    const hba1c = f.nativeElement.querySelector("#caseMetaHba1c") as HTMLInputElement;
    hba1c.value = "7.8";
    hba1c.dispatchEvent(new Event("input", { bubbles: true }));
    hba1c.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect(getCaseMeta().hba1c).toBe(7.8);
  });

  it("RBL % input calls setMaxRblPercent", async () => {
    const f = await openDentalChart();
    const input = f.nativeElement.querySelector("#caseMetaRbl") as HTMLInputElement;
    input.value = "45";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect(getCaseMeta().maxRblPercent).toBe(45);
  });

  it("tooth-loss input calls setToothLossPerio", async () => {
    const f = await openDentalChart();
    const input = f.nativeElement.querySelector("#caseMetaToothLoss") as HTMLInputElement;
    input.value = "3";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect(getCaseMeta().toothLossPerio).toBe(3);
  });

  it("clearing the age input (empty string) sets it back to null", async () => {
    const f = await openDentalChart();
    const input = f.nativeElement.querySelector("#caseMetaAge") as HTMLInputElement;
    input.value = "54";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect(getCaseMeta().age).toBe(54);
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect(getCaseMeta().age).toBeNull();
  });
});

describe("P4a Task 2: conditional fields", () => {
  it("cigarettes/day is disabled unless smoking = current", async () => {
    const f = await openDentalChart();
    const cigs = f.nativeElement.querySelector("#caseMetaCigarettesPerDay") as HTMLInputElement;
    expect(cigs.disabled).toBe(true);
    const select = f.nativeElement.querySelector("#caseMetaSmoking") as HTMLSelectElement;
    select.value = "current";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect((f.nativeElement.querySelector("#caseMetaCigarettesPerDay") as HTMLInputElement).disabled).toBe(false);
    select.value = "former";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect((f.nativeElement.querySelector("#caseMetaCigarettesPerDay") as HTMLInputElement).disabled).toBe(true);
  });

  it("HbA1c is disabled unless diabetes = present", async () => {
    const f = await openDentalChart();
    const hba1c = f.nativeElement.querySelector("#caseMetaHba1c") as HTMLInputElement;
    expect(hba1c.disabled).toBe(true);
    const select = f.nativeElement.querySelector("#caseMetaDiabetes") as HTMLSelectElement;
    select.value = "present";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect((f.nativeElement.querySelector("#caseMetaHba1c") as HTMLInputElement).disabled).toBe(false);
    select.value = "none";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect((f.nativeElement.querySelector("#caseMetaHba1c") as HTMLInputElement).disabled).toBe(true);
  });
});

describe("P4a Task 2: i18n keys resolve", () => {
  it("panel title + control labels are not raw i18n keys", async () => {
    const f = await openDentalChart();
    const panel = f.nativeElement.querySelector("#caseMetaPanel")!;
    const text = panel.textContent || "";
    expect(text).not.toContain("case.panelTitle");
    expect(text).not.toContain("case.age");
    expect(text).not.toContain("case.smoking.label");
    expect(text).not.toContain("case.diabetes.label");
    expect(text).not.toContain("case.hba1c");
    expect(text).not.toContain("case.rbl");
    expect(text).not.toContain("case.toothLoss");
  });
});
