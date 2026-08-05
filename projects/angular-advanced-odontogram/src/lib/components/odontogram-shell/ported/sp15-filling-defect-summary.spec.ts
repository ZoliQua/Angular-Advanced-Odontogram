// Angular port of core/__tests__/sp15-filling-defect-summary.test.ts.
// Framework-free (swept into REACT_DEPENDENT by the exclusion grep's
// "useI18n" keyword match only). Not in the task-6 brief's explicit expected
// batch, but it satisfies the same classification rule (no App/Settings/
// PerioChart/PerioSidebar dependency at all) — verbatim port, import paths
// adjusted for components/odontogram-shell/ported/.
import { describe, it, expect, beforeEach } from "vitest";
import { getOdontogramSummary, getToothStateSummary, __setToothStateForTest } from "../../../core/odontogram";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";

beforeEach(() => setI18nLanguage("en"));

describe("SP15 Task 5: filling defect reads like secondary caries in the bottom summary", () => {
  it("whole-mouth summary names the defect with the fillingDefect.label qualifier, alongside surface + type", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      fillingSurfaceMaterials: { occlusal: "composite" },
      fillingDefect: { occlusal: "fracture" },
    });
    const fills = getOdontogramSummary().sections.find((s) => s.key === "fillings")!;
    const text = fills.items.join(" | ");
    expect(text).toContain(t("fillingDefect.label"));
    expect(text).toContain(t("fillingDefect.fracture"));
    expect(text).toMatch(/O/);
  });

  it("reads in parallel with secondary caries: both a defect suffix and a secondary-caries qualifier appear in the same whole-mouth summary", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      fillingSurfaceMaterials: { occlusal: "composite" },
      fillingDefect: { occlusal: "fracture" },
    });
    __setToothStateForTest(26, {
      toothSelection: "tooth-base",
      fillingSurfaceMaterials: { distal: "gic" },
      caries: ["caries-distal"],
    });
    const summary = getOdontogramSummary();
    const fills = summary.sections.find((s) => s.key === "fillings")!.items.join(" | ");
    const caries = summary.sections.find((s) => s.key === "caries")!.items.join(" | ");
    expect(fills).toContain(t("fillingDefect.label"));
    expect(caries).toContain(t("toothInfo.secondary"));
  });

  it("tooltip still names the defect (unchanged baseline behavior)", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      fillingSurfaceMaterials: { occlusal: "composite" },
      fillingDefect: { occlusal: "fracture" },
    });
    expect(getToothStateSummary(16).join(" · ")).toContain(t("fillingDefect.label"));
    expect(getToothStateSummary(16).join(" · ")).toContain(t("fillingDefect.fracture"));
  });

  it("is suppressed on a crowned tooth (restorationType !== \"none\") even though a defect is stored", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      restorationType: "crown",
      restorationMaterial: "zircon",
      fillingSurfaceMaterials: { occlusal: "composite" },
      fillingDefect: { occlusal: "fracture" },
    });
    const fills = getOdontogramSummary().sections.find((s) => s.key === "fillings")!;
    const text = fills.items.join(" | ");
    expect(text).not.toContain(t("fillingDefect.label"));
    expect(text).not.toContain(t("fillingDefect.fracture"));
  });
});
