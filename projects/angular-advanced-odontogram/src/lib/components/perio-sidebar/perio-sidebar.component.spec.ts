// TDD spec for PerioSidebarComponent — Phase 4 Task 2.
//
// PerioSidebarComponent is self-contained (no inputs/outputs, mirrors
// $ENGINE/src/PerioSidebar.tsx exactly): it owns its own summary/caseMeta/
// classification/readOnly state, refreshed via a single constructor
// `onStateChange` subscription — same self-contained pattern as
// ExportOptionsModalComponent (export-options-modal.component.ts), minus the
// `open()` gate (PerioSidebar has none; TSX subscribes unconditionally on
// mount). Driven entirely through the real engine seams (`core/odontogram`)
// — no host-supplied state, matching the TSX's zero-props signature.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { PerioSidebarComponent } from "./perio-sidebar.component";
import { setI18nLanguage } from "../../core/i18n/useI18n";
import { getCaseMeta, getPerioClassification, setReadOnly, setCaseAge } from "../../core/odontogram";

function createSidebar() {
  TestBed.configureTestingModule({
    imports: [PerioSidebarComponent],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(PerioSidebarComponent);
}

beforeEach(() => {
  setI18nLanguage("en");
});

describe("PerioSidebarComponent", () => {
  it("(a) renders the three cards with engine-default (empty) data", async () => {
    const f = createSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;

    // Whole-mouth summary card.
    const summaryCard = root.querySelector(".perio-summary-card");
    expect(summaryCard).not.toBeNull();
    expect(summaryCard!.querySelector(".perio-summary-card-title")!.textContent).toContain(
      "Summary",
    );
    expect(root.querySelector("#perio-fg-summary-avgpd")!.textContent).toBe("–");
    expect(root.querySelector("#perio-fg-summary-avgcal")!.textContent).toBe("–");
    expect(root.querySelector("#perio-fg-summary-bop")!.textContent).toBe("0%");
    expect(root.querySelector("#perio-fg-summary-charted")!.textContent).toBe("0");
    expect(root.querySelector("#perio-fg-summary-cal")!.textContent).toBe("–");
    expect(root.querySelector("#perio-fg-summary-maxpd")!.textContent).toBe("–");
    expect(root.querySelector("#perio-fg-summary-maxfurc")!.textContent).toBe("–");
    expect(root.querySelector("#perio-fg-summary-plaque")!.textContent).toBe("0%");

    // Case-meta card.
    const panel = root.querySelector("#caseMetaPanel");
    expect(panel).not.toBeNull();
    expect(panel!.classList.contains("case-meta-panel")).toBe(true);
    expect(root.querySelector("#caseMetaPatientName")).not.toBeNull();
    expect(root.querySelector("#caseMetaExamDate")).not.toBeNull();
    expect(root.querySelector("#caseMetaAge")).not.toBeNull();
    expect(root.querySelector("#caseMetaSmoking")).not.toBeNull();
    expect(root.querySelector("#caseMetaCigarettesPerDay")).not.toBeNull();
    expect(root.querySelector("#caseMetaDiabetes")).not.toBeNull();
    expect(root.querySelector("#caseMetaHba1c")).not.toBeNull();
    expect(root.querySelector("#caseMetaRbl")).not.toBeNull();
    expect(root.querySelector("#caseMetaToothLoss")).not.toBeNull();

    // Classification card.
    expect(root.querySelector("#perioClassDiagnosisDerived")).not.toBeNull();
    expect(root.querySelector("#perioClassDiagnosisOverride")).not.toBeNull();
    expect(root.querySelector("#perioClassStageDerived")).not.toBeNull();
    expect(root.querySelector("#perioClassStageOverride")).not.toBeNull();
    expect(root.querySelector("#perioClassGradeDerived")).not.toBeNull();
    expect(root.querySelector("#perioClassGradeOverride")).not.toBeNull();
    expect(root.querySelector("#perioClassExtentDerived")).not.toBeNull();
    expect(root.querySelector("#perioClassExtentOverride")).not.toBeNull();
  });

  it("(b) typing patient name / picking smoking=current reveals cigarettes field and calls the engine", async () => {
    const f = createSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;

    const nameInput = root.querySelector<HTMLInputElement>("#caseMetaPatientName")!;
    nameInput.value = "Jane Doe";
    nameInput.dispatchEvent(new Event("input"));
    await f.whenStable();
    expect(getCaseMeta().patientName).toBe("Jane Doe");

    const cigsRowBefore = root.querySelector("#caseMetaCigarettesPerDay")!.closest(".case-meta-row")!;
    expect(cigsRowBefore.classList.contains("case-meta-row-disabled")).toBe(true);
    expect(root.querySelector<HTMLInputElement>("#caseMetaCigarettesPerDay")!.disabled).toBe(true);

    const smokingSelect = root.querySelector<HTMLSelectElement>("#caseMetaSmoking")!;
    smokingSelect.value = "current";
    smokingSelect.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(getCaseMeta().smokingStatus).toBe("current");

    const cigsRowAfter = root.querySelector("#caseMetaCigarettesPerDay")!.closest(".case-meta-row")!;
    expect(cigsRowAfter.classList.contains("case-meta-row-disabled")).toBe(false);
    expect(root.querySelector<HTMLInputElement>("#caseMetaCigarettesPerDay")!.disabled).toBe(false);
  });

  it("(c) classification override select calls setStageOverride and the derived read-out updates on notify", async () => {
    const f = createSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;

    const derivedBefore = root.querySelector("#perioClassStageDerived")!.textContent;
    expect(derivedBefore).toBe("Not applicable");

    const stageSelect = root.querySelector<HTMLSelectElement>("#perioClassStageOverride")!;
    stageSelect.value = "III";
    stageSelect.dispatchEvent(new Event("change"));
    await f.whenStable();

    expect(getPerioClassification().stage).toBe("III");
    expect(getPerioClassification().overridden.stage).toBe(true);
    // The derived (non-override) read-out is untouched by an override —
    // still reflects the pure derivation, not the clinician's chosen value.
    expect(root.querySelector("#perioClassStageDerived")!.textContent).toBe(derivedBefore);
  });

  it("(d) readOnly=true disables inputs (drive via engine setReadOnly + notify)", async () => {
    const f = createSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;

    expect(root.querySelector<HTMLInputElement>("#caseMetaPatientName")!.disabled).toBe(false);

    // setReadOnly() does not itself notify onStateChange listeners (verified
    // by reading core/odontogram.ts) — trigger a refresh via a real setter
    // afterward, same as the component's own onStateChange-driven refresh
    // would observe from any other concurrent engine mutation.
    setReadOnly(true);
    setCaseAge(30);
    await f.whenStable();

    expect(root.querySelector<HTMLInputElement>("#caseMetaPatientName")!.disabled).toBe(true);
    expect(root.querySelector<HTMLInputElement>("#caseMetaAge")!.disabled).toBe(true);
    expect(root.querySelector<HTMLSelectElement>("#caseMetaSmoking")!.disabled).toBe(true);
    expect(root.querySelector<HTMLSelectElement>("#perioClassStageOverride")!.disabled).toBe(true);

    setReadOnly(false);
    setCaseAge(31);
    await f.whenStable();
    expect(root.querySelector<HTMLInputElement>("#caseMetaPatientName")!.disabled).toBe(false);
  });
});
