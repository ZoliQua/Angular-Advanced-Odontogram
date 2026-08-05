// Angular port of core/__tests__/sp11-wear-summary.test.ts. Framework-free
// (swept into REACT_DEPENDENT by the exclusion grep's "useI18n" keyword
// match only) — verbatim port, import paths adjusted for
// components/odontogram-shell/ported/.
import { describe, it, expect, beforeEach } from "vitest";
import { getToothStateSummary, getOdontogramSummary, __setToothStateForTest } from "../../../core/odontogram";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";
beforeEach(() => setI18nLanguage("en"));
describe("SP11: wear in summaries", () => {
  it("tooltip shows type per location", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", wearEdge: "attrition", wearCervical: "abrasion" });
    const j = getToothStateSummary(16).join(" · ");
    expect(j).toContain(t("wearType.attrition"));
    expect(j).toContain(t("wearType.abrasion"));
  });
  it("whole-mouth has a wear section listing the tooth", () => {
    __setToothStateForTest(26, { toothSelection: "tooth-base", wearCervical: "abfraction" });
    const w = getOdontogramSummary().sections.find(s => s.key === "wear")!;
    expect(w).toBeTruthy();
    expect(w.items.join(" | ")).toContain(t("wearType.abfraction"));
  });

  it("tooltip suppresses wear on a crowned tooth", () => {
    __setToothStateForTest(17, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep",
      restorationType: "crown", restorationMaterial: "emax", wearEdge: "attrition",
    });
    const j = getToothStateSummary(17).join(" · ");
    expect(j).not.toContain(t("wearType.attrition"));
    const w = getOdontogramSummary().sections.find(s => s.key === "wear")!;
    expect(w.items.some(item => item.startsWith("17 ("))).toBe(false);
  });

  it("tooltip suppresses wear on a non-natural substrate (radix)", () => {
    __setToothStateForTest(27, { toothSelection: "tooth-base", toothSubstrate: "radix", wearCervical: "abrasion" });
    const j = getToothStateSummary(27).join(" · ");
    expect(j).not.toContain(t("wearType.abrasion"));
    const w = getOdontogramSummary().sections.find(s => s.key === "wear")!;
    expect(w.items.some(item => item.startsWith("27 ("))).toBe(false);
  });
});
