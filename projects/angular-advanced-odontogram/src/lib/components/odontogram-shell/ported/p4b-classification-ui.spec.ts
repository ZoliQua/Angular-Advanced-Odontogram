// Angular port of core/__tests__/p4b-classification-ui.test.ts.
//
// Same mount route as p4a-case-panel.spec.ts: TestBed.createComponent
// (OdontogramShellComponent) with ONLY ODONTOGRAM_ENGINE_LIFECYCLE DI-faked
// (fake-tooth-svg injection); getCaseMeta/resetCaseMeta/
// getPerioClassification/the 4 override setters/setPerioSite/
// __resetChartStateForTest and the full perio data-core surface are the
// REAL, unmocked core/odontogram export.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import {
  getCaseMeta,
  resetCaseMeta,
  getPerioClassification,
  setPerioSite,
  __resetChartStateForTest,
  closePerioOverlay,
  setPerioViewMode,
} from "../../../core/odontogram";

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
  __resetChartStateForTest();
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

describe("P4b Task 4: classification block renders in the Dental Chart", () => {
  it("renders the 4 axis override selects + derived-value displays", async () => {
    const f = await openDentalChart();
    expect(f.nativeElement.querySelector("#perioClassDiagnosisDerived")).toBeTruthy();
    expect(f.nativeElement.querySelector("#perioClassDiagnosisOverride")).toBeTruthy();
    expect(f.nativeElement.querySelector("#perioClassStageDerived")).toBeTruthy();
    expect(f.nativeElement.querySelector("#perioClassStageOverride")).toBeTruthy();
    expect(f.nativeElement.querySelector("#perioClassGradeDerived")).toBeTruthy();
    expect(f.nativeElement.querySelector("#perioClassGradeOverride")).toBeTruthy();
    expect(f.nativeElement.querySelector("#perioClassExtentDerived")).toBeTruthy();
    expect(f.nativeElement.querySelector("#perioClassExtentOverride")).toBeTruthy();
  });

  it("shows the derived values for an untouched (healthy) case", async () => {
    const f = await openDentalChart();
    const derived = getPerioClassification().derived;
    expect(
      (f.nativeElement.querySelector("#perioClassDiagnosisDerived")!.textContent || "").toLowerCase(),
    ).toContain(derived.diagnosis);
    expect(f.nativeElement.querySelector("#perioClassStageDerived")).toBeTruthy();
    expect(f.nativeElement.querySelector("#perioClassGradeDerived")).toBeTruthy();
    expect(f.nativeElement.querySelector("#perioClassExtentDerived")).toBeTruthy();
  });

  it("indeterminate/na derived values are shown as such, not blank", async () => {
    const f = await openDentalChart();
    // Untouched case: diagnosis derives to "health", which forces stage AND
    // extent to the non-authorable "na" placeholder (derivePerioClassification's
    // entry point only computes a real stage/extent once diagnosis is
    // "periodontitis"); grade is computed independent of diagnosis and reads
    // "indeterminate" (no age/RBL/smoking/diabetes charted yet).
    const derived = getPerioClassification().derived;
    expect(derived.stage).toBe("na");
    expect(derived.grade).toBe("indeterminate");
    expect(derived.extent).toBe("na");
    const stageText = f.nativeElement.querySelector("#perioClassStageDerived")!.textContent || "";
    const gradeText = f.nativeElement.querySelector("#perioClassGradeDerived")!.textContent || "";
    const extentText = f.nativeElement.querySelector("#perioClassExtentDerived")!.textContent || "";
    expect(stageText.trim().length).toBeGreaterThan(0);
    expect(gradeText.trim().length).toBeGreaterThan(0);
    expect(extentText.trim().length).toBeGreaterThan(0);
    expect(stageText).not.toContain("perio.class."); // must be a resolved label, not a raw i18n key
    expect(gradeText).not.toContain("perio.class.");
    expect(extentText).not.toContain("perio.class.");
  });
});

describe("P4b Task 4: each override select calls its OWN setter (no cross-wiring)", () => {
  it("diagnosis select calls setDiagnosisOverride only", async () => {
    const f = await openDentalChart();
    const select = f.nativeElement.querySelector("#perioClassDiagnosisOverride") as HTMLSelectElement;
    select.value = "periodontitis";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    const c = getPerioClassification();
    expect(c.diagnosis).toBe("periodontitis");
    expect(c.overridden).toEqual({ diagnosis: true, stage: false, grade: false, extent: false });
  });

  it("stage select calls setStageOverride only", async () => {
    const f = await openDentalChart();
    const select = f.nativeElement.querySelector("#perioClassStageOverride") as HTMLSelectElement;
    select.value = "III";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    const c = getPerioClassification();
    expect(c.stage).toBe("III");
    expect(c.overridden).toEqual({ diagnosis: false, stage: true, grade: false, extent: false });
  });

  it("grade select calls setGradeOverride only", async () => {
    const f = await openDentalChart();
    const select = f.nativeElement.querySelector("#perioClassGradeOverride") as HTMLSelectElement;
    select.value = "B";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    const c = getPerioClassification();
    expect(c.grade).toBe("B");
    expect(c.overridden).toEqual({ diagnosis: false, stage: false, grade: true, extent: false });
  });

  it("extent select calls setExtentOverride only", async () => {
    const f = await openDentalChart();
    const select = f.nativeElement.querySelector("#perioClassExtentOverride") as HTMLSelectElement;
    select.value = "generalized";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    const c = getPerioClassification();
    expect(c.extent).toBe("generalized");
    expect(c.overridden).toEqual({ diagnosis: false, stage: false, grade: false, extent: true });
  });

  it("picking the first '(use derived)' option clears the override back to null", async () => {
    const f = await openDentalChart();
    const select = f.nativeElement.querySelector("#perioClassStageOverride") as HTMLSelectElement;
    select.value = "III";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect(getPerioClassification().overridden.stage).toBe(true);
    select.value = "";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await f.whenStable();
    expect(getPerioClassification().overridden.stage).toBe(false);
    expect(getCaseMeta().stageOverride).toBeNull();
  });
});

describe("P4b Task 4: panel re-reads getPerioClassification() on notifyStateChange", () => {
  it("charting perio data (via another API call) refreshes the derived-value display", async () => {
    const f = await openDentalChart();
    // Two non-adjacent present teeth with interdental CAL >= 1mm qualifies
    // the 2017 periodontitis primary case definition — same shape T2/T3's
    // own tests use to reach a non-health derived diagnosis.
    setPerioSite(16, "MB", { pd: 3, gm: 2 }); // CAL 5
    setPerioSite(36, "MB", { pd: 3, gm: 2 }); // CAL 5, non-adjacent arch
    await f.whenStable();
    const derived = getPerioClassification().derived;
    expect(derived.diagnosis).toBe("periodontitis");
    const text = f.nativeElement.querySelector("#perioClassDiagnosisDerived")!.textContent || "";
    expect(text.toLowerCase()).toContain(derived.diagnosis);
  });
});

describe("P4b Task 4: i18n keys resolve", () => {
  it("classification block labels are not raw i18n keys", async () => {
    const f = await openDentalChart();
    const panel = f.nativeElement.querySelector("#caseMetaPanel")!;
    const text = panel.textContent || "";
    expect(text).not.toContain("perio.class.title");
    expect(text).not.toContain("perio.class.diagnosis");
    expect(text).not.toContain("perio.class.stage");
    expect(text).not.toContain("perio.class.grade");
    expect(text).not.toContain("perio.class.extent");
    expect(text).not.toContain("perio.class.useDerived");
  });
});
