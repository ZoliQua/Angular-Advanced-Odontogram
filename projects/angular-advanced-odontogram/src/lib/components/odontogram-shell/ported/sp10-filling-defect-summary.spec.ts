// Angular port of core/__tests__/sp10-filling-defect-summary.test.ts.
// Framework-free (swept into REACT_DEPENDENT by the exclusion grep's
// "useI18n" keyword match only) — verbatim port, import paths adjusted for
// components/odontogram-shell/ported/.
import { describe, it, expect, beforeEach } from "vitest";
import { getToothStateSummary, getOdontogramSummary, __setToothStateForTest } from "../../../core/odontogram";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";

beforeEach(() => setI18nLanguage("en"));

describe("SP10 Task 4: filling-defect in summaries", () => {
  it("tooltip lists the defect type", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", fillingSurfaceMaterials: { occlusal: "composite" }, fillingDefect: { occlusal: "fracture" } });
    expect(getToothStateSummary(16).join(" · ")).toContain(t("fillingDefect.fracture"));
  });
  it("whole-mouth folds the defect into the fillings section", () => {
    __setToothStateForTest(26, { toothSelection: "tooth-base", fillingSurfaceMaterials: { distal: "gic" }, fillingDefect: { distal: "marginal" } });
    const fills = getOdontogramSummary().sections.find(s => s.key === "fillings")!;
    expect(fills.items.join(" | ")).toContain(t("fillingDefect.marginal"));
  });

  it("tooltip suppresses the defect on a crowned tooth", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      restorationType: "crown",
      restorationMaterial: "zircon",
      fillingSurfaceMaterials: { occlusal: "composite" },
      fillingDefect: { occlusal: "fracture" },
    });
    expect(getToothStateSummary(16).join(" · ")).not.toContain(t("fillingDefect.fracture"));
  });

  it("whole-mouth suppresses the defect suffix on a crowned tooth", () => {
    __setToothStateForTest(26, {
      toothSelection: "tooth-base",
      restorationType: "crown",
      restorationMaterial: "zircon",
      fillingSurfaceMaterials: { distal: "gic" },
      fillingDefect: { distal: "marginal" },
    });
    const fills = getOdontogramSummary().sections.find(s => s.key === "fillings")!;
    expect(fills.items.join(" | ")).not.toContain(t("fillingDefect.marginal"));
  });
});
