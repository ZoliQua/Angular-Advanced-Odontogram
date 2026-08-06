// Angular port of core/__tests__/ui1-perio-sidebar.test.tsx — STANDALONE-RENDER
// PARTS ONLY (its two `describe` blocks before "--- Part (b) ---": "<PerioSidebar/>
// renders standalone" and "<PerioSidebar/> controls still call their setters").
// The source file's third `describe` ("<App/> right panel view-gate", mounting
// the full `<App/>` behind a comprehensive partial engine mock to prove the
// perio/odontogram view-gate itself) is OUT OF SCOPE here — it belongs to
// Task 5 (wiring PerioSidebarComponent into OdontogramShellComponent's own
// view-gate), which is the Angular equivalent of that App-level mock harness.
//
// MAPPING (React-tree mechanics -> DOM): the source renders `<PerioSidebar/>`
// directly via `@testing-library/react` and queries `document.getElementById`
// / dispatches `fireEvent.change`. This mounts PerioSidebarComponent via
// TestBed instead and dispatches native DOM events — same assertions,
// same ids, same engine read-backs (`getCaseMeta()`/`getPerioClassification()`).
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { PerioSidebarComponent } from "../perio-sidebar.component";
import {
  setNumberingSystem,
  getCaseMeta,
  resetCaseMeta,
  getPerioClassification,
} from "../../../core/odontogram";

function renderSidebar() {
  TestBed.configureTestingModule({
    imports: [PerioSidebarComponent],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(PerioSidebarComponent);
}

beforeEach(() => {
  setNumberingSystem("FDI");
  resetCaseMeta();
});

describe("UI-1 Task 1: <PerioSidebar/> renders standalone", () => {
  it("renders the whole-mouth summary bar items", async () => {
    const f = renderSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;
    expect(root.querySelector("#perio-fg-summary-avgpd")).toBeTruthy();
    expect(root.querySelector("#perio-fg-summary-avgcal")).toBeTruthy();
    expect(root.querySelector("#perio-fg-summary-bop")).toBeTruthy();
    expect(root.querySelector("#perio-fg-summary-charted")).toBeTruthy();
    expect(root.querySelector("#perio-fg-summary-cal")).toBeTruthy();
    expect(root.querySelector("#perio-fg-summary-maxpd")).toBeTruthy();
    expect(root.querySelector("#perio-fg-summary-maxfurc")).toBeTruthy();
    expect(root.querySelector("#perio-fg-summary-plaque")).toBeTruthy();
  });

  it("renders the Páciens adatok (case-metadata) controls", async () => {
    const f = renderSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;
    expect(root.querySelector("#caseMetaPanel")).toBeTruthy();
    expect(root.querySelector("#caseMetaAge")).toBeTruthy();
    expect(root.querySelector("#caseMetaSmoking")).toBeTruthy();
    expect(root.querySelector("#caseMetaCigarettesPerDay")).toBeTruthy();
    expect(root.querySelector("#caseMetaDiabetes")).toBeTruthy();
    expect(root.querySelector("#caseMetaHba1c")).toBeTruthy();
    expect(root.querySelector("#caseMetaRbl")).toBeTruthy();
    expect(root.querySelector("#caseMetaToothLoss")).toBeTruthy();
  });

  it("renders the 2017 classification axes", async () => {
    const f = renderSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;
    expect(root.querySelector("#perioClassDiagnosisDerived")).toBeTruthy();
    expect(root.querySelector("#perioClassDiagnosisOverride")).toBeTruthy();
    expect(root.querySelector("#perioClassStageDerived")).toBeTruthy();
    expect(root.querySelector("#perioClassStageOverride")).toBeTruthy();
    expect(root.querySelector("#perioClassGradeDerived")).toBeTruthy();
    expect(root.querySelector("#perioClassGradeOverride")).toBeTruthy();
    expect(root.querySelector("#perioClassExtentDerived")).toBeTruthy();
    expect(root.querySelector("#perioClassExtentOverride")).toBeTruthy();
  });
});

describe("UI-1 Task 1: <PerioSidebar/> controls still call their setters", () => {
  it("age input calls setCaseAge", async () => {
    const f = renderSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;
    const input = root.querySelector<HTMLInputElement>("#caseMetaAge")!;
    input.value = "61";
    input.dispatchEvent(new Event("input"));
    await f.whenStable();
    expect(getCaseMeta().age).toBe(61);
  });

  it("smoking select calls setSmokingStatus", async () => {
    const f = renderSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;
    const select = root.querySelector<HTMLSelectElement>("#caseMetaSmoking")!;
    select.value = "current";
    select.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(getCaseMeta().smokingStatus).toBe("current");
  });

  it("diagnosis override select calls setDiagnosisOverride", async () => {
    const f = renderSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;
    const select = root.querySelector<HTMLSelectElement>("#perioClassDiagnosisOverride")!;
    select.value = "periodontitis";
    select.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(getPerioClassification().diagnosis).toBe("periodontitis");
    expect(getPerioClassification().overridden.diagnosis).toBe(true);
  });

  it("stage override select calls setStageOverride", async () => {
    const f = renderSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;
    const select = root.querySelector<HTMLSelectElement>("#perioClassStageOverride")!;
    select.value = "III";
    select.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(getPerioClassification().stage).toBe("III");
    expect(getPerioClassification().overridden.stage).toBe(true);
  });
});
