// Angular port of core/__tests__/summary.test.ts. Framework-free (swept into
// REACT_DEPENDENT by the exclusion grep's "useI18n" keyword match only) —
// verbatim port, import paths adjusted for components/odontogram-shell/ported/.
import { describe, it, expect } from "vitest";
import { getOdontogramSummary, __setToothStateForTest } from "../../../core/odontogram";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";

describe("getOdontogramSummary", () => {
  it("returns the expected structure with the four always-present sections", () => {
    setI18nLanguage("en");
    const s = getOdontogramSummary();
    expect(s.sections.map((sec) => sec.key)).toEqual(["caries", "fillings", "endo", "diagnoses", "wear", "discoloration", "orthodontics", "prosthetics"]);
    expect(typeof s.overview).toBe("string");
    expect(s.overview.length).toBeGreaterThan(0);
    expect(s.periodontalTitle.length).toBeGreaterThan(0);
    expect(s.periodontalText.length).toBeGreaterThan(0);
    expect(s.implants).toBeNull();
  });

  it("shows empty-section text when no teeth match, and healthy periodontium", () => {
    setI18nLanguage("en");
    const s = getOdontogramSummary();
    for (const sec of s.sections) {
      expect(sec.items).toEqual([]);
      expect(sec.emptyText).toBe(sec.emptyText);
      expect(sec.emptyText).not.toContain("toothInfo.");
    }
    expect(s.periodontalText).toBe(t("toothInfo.periodontalHealthy", "en"));
  });

  it("resolves all referenced i18n keys (no raw keys leak through)", () => {
    for (const lang of ["hu", "en", "de", "es", "it", "sk", "pl", "ru"] as const) {
      setI18nLanguage(lang);
      const s = getOdontogramSummary();
      const texts = [s.overview, s.periodontalTitle, s.periodontalText, ...s.sections.flatMap((sec) => [sec.heading, sec.emptyText])];
      for (const txt of texts) {
        expect(txt).not.toMatch(/toothInfo\./);
      }
    }
  });
});

describe("SP9: whole-mouth surfaces clinical axes", () => {
  it("lists pulp/apical/resorption in a diagnoses section, and peri-implant in periodontalText (not diagnoses)", () => {
    setI18nLanguage("en");
    __setToothStateForTest(36, { toothSelection: "tooth-base", pulpDx: "necrosis", apicalDx: "acute-apical-abscess", resorptionType: "external-cervical" });
    __setToothStateForTest(14, { toothSelection: "implant", periImplant: "peri-implantitis-severe" });
    const s = getOdontogramSummary();
    const dx = s.sections.find((sec) => sec.key === "diagnoses")!;
    expect(dx.items.join(" | ")).toContain(t("pulpDx.necrosis"));
    expect(dx.items.join(" | ")).toContain(t("apicalDx.acuteApicalAbscess"));
    expect(dx.items.join(" | ")).toContain(t("resorption.type.externalCervical"));
    expect(dx.items.join(" | ")).not.toContain(t("periImplant.periImplantitisSevere"));
    expect(s.periodontalText).toContain(t("periImplant.periImplantitisSevere"));
  });
  it("caries line carries the coarse severity qualifier", () => {
    setI18nLanguage("en");
    __setToothStateForTest(16, { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 3 } });
    const c = getOdontogramSummary().sections.find((sec) => sec.key === "caries")!;
    expect(c.items.join(" | ")).toContain(t("summary.severity.moderate"));
  });
  it("periodontal text includes calculus and mobility", () => {
    setI18nLanguage("en");
    __setToothStateForTest(26, { toothSelection: "tooth-base", calculus: true, mobility: "m2" });
    const p = getOdontogramSummary().periodontalText;
    expect(p).toContain(t("calculus.label"));
    expect(p).toContain(t("mobility.m2"));
  });
  it("crownLeakage appears in the prosthetics section", () => {
    setI18nLanguage("en");
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon", crownLeakage: true });
    const pr = getOdontogramSummary().sections.find((sec) => sec.key === "prosthetics")!;
    expect(pr.items.join(" | ")).toContain(t("crownLeakage.label"));
  });
});
