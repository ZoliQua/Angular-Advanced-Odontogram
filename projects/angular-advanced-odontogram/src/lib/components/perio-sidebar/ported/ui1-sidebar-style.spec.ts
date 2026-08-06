// Angular port of core/__tests__/ui1-sidebar-style.test.tsx — full port (the
// source file has a single scope: structural/copy assertions over
// `<PerioSidebar/>`, no App-level mount to split out).
//
// MAPPING (React-tree mechanics -> DOM): the source renders `<PerioSidebar/>`
// via `@testing-library/react` and queries `document.getElementById`/
// `document.querySelector`. This mounts PerioSidebarComponent via TestBed
// instead — same assertions, same ids/classes/i18n keys.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { PerioSidebarComponent } from "../perio-sidebar.component";
import { t, setI18nLanguage } from "../../../core/i18n/useI18n";
import { setNumberingSystem, resetCaseMeta } from "../../../core/odontogram";

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

describe("UI-1 Task 2: <PerioSidebar/> renders three titled cards", () => {
  it("renders the case-meta (Páciens adatok) panel as a titled card", async () => {
    const f = renderSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;
    const panel = root.querySelector("#caseMetaPanel");
    expect(panel).toBeTruthy();
    expect(panel!.className).toContain("case-meta-panel");
    const title = panel!.querySelector(".case-meta-panel-title");
    expect(title).toBeTruthy();
    expect(title!.textContent).toBe(t("case.panelTitle"));
  });

  it("renders the 2017 classification block under its own subheading inside the card", async () => {
    const f = renderSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;
    const subheading = root.querySelector(".case-meta-panel-subheading");
    expect(subheading).toBeTruthy();
    expect(subheading!.textContent).toBe(t("perio.class.title"));
    // Classification axis rows carry a dedicated class hook for styling
    // (aligned label / derived value / override select).
    const classRows = root.querySelectorAll(".perio-class-row");
    expect(classRows.length).toBe(4); // diagnosis, stage, grade, extent
  });

  it("renders the whole-mouth summary as its own titled card", async () => {
    const f = renderSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;
    const summaryCard = root.querySelector(".perio-summary-card");
    expect(summaryCard).toBeTruthy();
    const title = summaryCard!.querySelector(".perio-summary-card-title");
    expect(title).toBeTruthy();
    expect(title!.textContent!.length).toBeGreaterThan(0);
    // The existing summary items still resolve inside the titled card.
    expect(summaryCard!.querySelector("#perio-fg-summary-avgpd")).toBeTruthy();
  });
});

describe("UI-1 Task 2: Páciens adatok metadata uses a labelled row structure", () => {
  it("every metadata control has an associated <label>", async () => {
    const f = renderSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;
    const controlIds = [
      "caseMetaPatientName",
      "caseMetaExamDate",
      "caseMetaAge",
      "caseMetaSmoking",
      "caseMetaCigarettesPerDay",
      "caseMetaDiabetes",
      "caseMetaHba1c",
      "caseMetaRbl",
      "caseMetaToothLoss",
    ];
    for (const id of controlIds) {
      const control = root.querySelector(`#${id}`);
      expect(control).toBeTruthy();
      // Associated via a <label for=id> in the same row.
      const label = root.querySelector(`label[for="${id}"]`);
      expect(label, `expected a <label for="${id}"> to exist`).toBeTruthy();
    }
  });

  it("metadata rows use the two-column grid row class", async () => {
    const f = renderSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;
    const rows = root.querySelectorAll(".case-meta-row");
    // 9 metadata rows (patientName, examDate, age, smoking, cigs, diabetes, hba1c, rbl, toothLoss)
    expect(rows.length).toBe(9);
  });

  it("conditional fields (cigarettes/day, HbA1c) carry the disabled-row class when gated off", async () => {
    const f = renderSidebar();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;
    const cigsRow = root.querySelector("#caseMetaCigarettesPerDay")!.closest(".case-meta-row");
    const hba1cRow = root.querySelector("#caseMetaHba1c")!.closest(".case-meta-row");
    // Default case-meta: smoking=unknown, diabetes=unknown -> both gated off.
    expect(cigsRow!.className).toContain("case-meta-row-disabled");
    expect(hba1cRow!.className).toContain("case-meta-row-disabled");
  });
});

describe("UI-1 Task 2: case.panelTitle renamed", () => {
  it("resolves to the renamed 'Patient data' value (default test language: en)", () => {
    setI18nLanguage("en");
    expect(t("case.panelTitle")).toBe("Patient data");
  });
});
