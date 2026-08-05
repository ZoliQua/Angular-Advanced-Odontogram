// Angular port of core/__tests__/sp14-ortho-summary.test.ts. Framework-free
// (swept into REACT_DEPENDENT by the exclusion grep's "useI18n" keyword
// match only) — verbatim port, import paths adjusted for
// components/odontogram-shell/ported/.
import { describe, it, expect, beforeEach } from "vitest";
import { getToothStateSummary, getOdontogramSummary, __setToothStateForTest } from "../../../core/odontogram";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";
beforeEach(() => setI18nLanguage("en"));

describe("SP14 Task 4: orthodontics in summaries", () => {
  it("tooltip shows each set ortho finding for a natural tooth", () => {
    __setToothStateForTest(11, {
      toothSelection: "tooth-base",
      orthoAppliance: "bracket",
      orthoDrift: "mesial",
      orthoVertical: "extrusion",
      orthoRotation: true,
    });
    const summary = getToothStateSummary(11).join(" · ");
    expect(summary).toContain(`${t("ortho.appliance.label")}: ${t("ortho.appliance.bracket")}`);
    expect(summary).toContain(`${t("ortho.drift.label")}: ${t("ortho.drift.mesial")}`);
    expect(summary).toContain(`${t("ortho.vertical.label")}: ${t("ortho.vertical.extrusion")}`);
    expect(summary).toContain(t("ortho.rotation.label"));
  });

  it("whole-mouth has an orthodontics section listing the tooth + its findings", () => {
    __setToothStateForTest(21, {
      toothSelection: "tooth-base",
      orthoAppliance: "band",
      orthoDrift: "distal",
      orthoVertical: "none",
      orthoRotation: false,
    });
    const section = getOdontogramSummary().sections.find(s => s.key === "orthodontics")!;
    expect(section).toBeTruthy();
    const joined = section.items.join(" | ");
    expect(joined).toContain(t("ortho.appliance.band"));
    expect(joined).toContain(t("ortho.drift.distal"));
  });

  it("gate consistency: suppressed for an implant/missing tooth even when ortho fields are set", () => {
    __setToothStateForTest(16, {
      toothSelection: "implant",
      orthoAppliance: "bracket",
      orthoDrift: "mesial",
      orthoVertical: "extrusion",
      orthoRotation: true,
    });
    __setToothStateForTest(26, {
      toothSelection: "none",
      orthoAppliance: "band",
      orthoDrift: "distal",
      orthoVertical: "intrusion",
      orthoRotation: true,
    });

    const summary16 = getToothStateSummary(16).join(" · ");
    expect(summary16).not.toContain(t("ortho.appliance.label"));
    expect(summary16).not.toContain(t("ortho.rotation.label"));

    const section = getOdontogramSummary().sections.find(s => s.key === "orthodontics")!;
    expect(section).toBeTruthy();
    expect(section.items.join(" | ")).not.toContain("16 (");
    expect(section.items.join(" | ")).not.toContain("26 (");
  });
});
