// Angular port of core/__tests__/sp6-task4-subcaries-summary-incisal.test.ts.
// Framework-free (swept into REACT_DEPENDENT by the exclusion grep's
// "useI18n" keyword match only) — verbatim port, import paths adjusted for
// components/odontogram-shell/ported/.
import { describe, it, expect } from "vitest";
import {
  isAnteriorTooth,
  surfaceLabelKey,
  subcariesLettersForTooth,
  computeFillingSubcariesSummaryLine,
  __setToothStateForTest,
  getOdontogramSummary,
} from "../../../core/odontogram";
import { t, setI18nLanguage } from "../../../core/i18n/useI18n";

describe("isAnteriorTooth (spec §8 anterior set)", () => {
  it("is true for every incisor/canine (11-13, 21-23, 31-33, 41-43)", () => {
    for (const tn of [11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43]) {
      expect(isAnteriorTooth(tn)).toBe(true);
    }
  });
  it("is false for every premolar/molar", () => {
    for (const tn of [14, 15, 16, 17, 18, 24, 25, 26, 27, 28, 34, 35, 36, 37, 38, 44, 45, 46, 47, 48]) {
      expect(isAnteriorTooth(tn)).toBe(false);
    }
  });
});

describe("surfaceLabelKey (spec §8 anterior label swap)", () => {
  it('("occlusal", 12) -> "surface.incisal" (anterior)', () => {
    expect(surfaceLabelKey("occlusal", 12)).toBe("surface.incisal");
  });
  it('("occlusal", 16) -> "surface.occlusal" (posterior)', () => {
    expect(surfaceLabelKey("occlusal", 16)).toBe("surface.occlusal");
  });
  it("with no toothNo (or null) falls back to the plain occlusal key", () => {
    expect(surfaceLabelKey("occlusal")).toBe("surface.occlusal");
    expect(surfaceLabelKey("occlusal", null)).toBe("surface.occlusal");
  });
  it("mesial/distal are position-independent — unaffected on an anterior tooth", () => {
    expect(surfaceLabelKey("mesial", 12)).toBe("surface.mesial");
    expect(surfaceLabelKey("distal", 21)).toBe("surface.distal");
  });
  it("buccal/lingual are now arch/anterior-aware in \"full\" notation mode (default)", () => {
    expect(surfaceLabelKey("buccal", 43)).toBe("surface.labial");
    expect(surfaceLabelKey("lingual", 33)).toBe("surface.lingual");
  });
  it("an unmapped surface (not in surfaceLabelKey's own map, e.g. subcrown) falls back to the raw string", () => {
    expect(surfaceLabelKey("subcrown")).toBe("subcrown");
    expect(surfaceLabelKey("nonsense")).toBe("nonsense");
  });
  it("surface.incisal resolves to a real translation in every UI language", () => {
    for (const lang of ["hu", "en", "de", "es", "it", "sk", "pl", "ru", "pt-br", "zh", "ar", "fr"] as const) {
      const label = t("surface.incisal", lang);
      expect(label).not.toBe("surface.incisal");
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

function makeState(opts: { caried?: string[]; filled?: string[] } = {}) {
  const caries = new Set((opts.caried ?? []).map((s) => `caries-${s}`));
  const fillingSurfaceMaterials = new Map((opts.filled ?? []).map((s) => [s, "composite"]));
  return { caries, fillingSurfaceMaterials };
}

describe("subcariesLettersForTooth (spec §7 recurrent surfaces)", () => {
  it("one surface, caried AND filled -> its letter", () => {
    const s = makeState({ caried: ["occlusal"], filled: ["occlusal"] });
    expect(subcariesLettersForTooth(35, s)).toBe("O");
  });
  it("multiple surfaces caried+filled -> combined in B,M,O,D,L order", () => {
    const s = makeState({ caried: ["distal", "occlusal", "mesial"], filled: ["mesial", "occlusal", "distal"] });
    expect(subcariesLettersForTooth(35, s)).toBe("MOD");
  });
  it("caries without a filling on the same surface -> not recurrent, excluded", () => {
    const s = makeState({ caried: ["occlusal"], filled: [] });
    expect(subcariesLettersForTooth(35, s)).toBe("");
  });
  it("a filling without caries on the same surface -> not recurrent, excluded", () => {
    const s = makeState({ caried: [], filled: ["occlusal"] });
    expect(subcariesLettersForTooth(35, s)).toBe("");
  });
  it("caries and filling on DIFFERENT surfaces (no overlap) -> excluded", () => {
    const s = makeState({ caried: ["occlusal"], filled: ["mesial"] });
    expect(subcariesLettersForTooth(35, s)).toBe("");
  });
  it("an undefined/empty state -> \"\"", () => {
    expect(subcariesLettersForTooth(35, undefined)).toBe("");
    expect(subcariesLettersForTooth(35, makeState())).toBe("");
  });
  it("anterior tooth: the occlusal/incisal recurrent surface is lettered \"I\", not \"O\"", () => {
    const s = makeState({ caried: ["occlusal"], filled: ["occlusal"] });
    expect(subcariesLettersForTooth(12, s)).toBe("I");
  });
  it("anterior tooth, combined surfaces -> \"MID\" (mesial, incisal, distal)", () => {
    const s = makeState({ caried: ["mesial", "occlusal", "distal"], filled: ["mesial", "occlusal", "distal"] });
    expect(subcariesLettersForTooth(21, s)).toBe("MID");
  });
});

describe("computeFillingSubcariesSummaryLine (spec §7 fillings-panel line)", () => {
  it("no selected teeth -> \"\" (hidden)", () => {
    expect(computeFillingSubcariesSummaryLine([], () => undefined)).toBe("");
  });
  it("selected teeth exist but none have subcaries -> \"\"", () => {
    const states = new Map([[16, makeState({ caried: ["occlusal"] })], [17, makeState({ filled: ["mesial"] })]]);
    const line = computeFillingSubcariesSummaryLine([16, 17], (tn) => states.get(tn));
    expect(line).toBe("");
  });
  it("one tooth, one surface -> singular phrasing, \"35 (O)\"", () => {
    setI18nLanguage("hu");
    const states = new Map([[35, makeState({ caried: ["occlusal"], filled: ["occlusal"] })]]);
    const line = computeFillingSubcariesSummaryLine([35], (tn) => states.get(tn));
    expect(line).toBe(t("filling.subcariesSummarySingle", "hu", { teeth: "35 (O)" }));
    expect(line).toBe("35 (O) tömése mellett subcaries van beállítva.");
  });
  it("one tooth, combined surfaces -> still singular phrasing, \"35 (MOD)\"", () => {
    setI18nLanguage("hu");
    const states = new Map([[35, makeState({ caried: ["mesial", "occlusal", "distal"], filled: ["mesial", "occlusal", "distal"] })]]);
    const line = computeFillingSubcariesSummaryLine([35], (tn) => states.get(tn));
    expect(line).toBe("35 (MOD) tömése mellett subcaries van beállítva.");
  });
  it("multiple selected teeth with subcaries -> plural phrasing, one entry per tooth", () => {
    setI18nLanguage("hu");
    const states = new Map([
      [36, makeState({ caried: ["occlusal"], filled: ["occlusal"] })],
      [35, makeState({ caried: ["buccal"], filled: ["buccal"] })],
    ]);
    const line = computeFillingSubcariesSummaryLine([36, 35], (tn) => states.get(tn));
    expect(line).toBe("35 (B), 36 (O) tömések mellett subcaries van beállítva.");
  });
  it("a mix of teeth with and without subcaries -> only the subcaries teeth are listed", () => {
    setI18nLanguage("en");
    const states = new Map([
      [14, makeState({ caried: ["mesial"] })],
      [15, makeState({ caried: ["occlusal"], filled: ["occlusal"] })],
    ]);
    const line = computeFillingSubcariesSummaryLine([14, 15], (tn) => states.get(tn));
    expect(line).toContain("15 (O)");
    expect(line).not.toContain("14");
  });
  it("resolves through the real singular/plural i18n keys in English too", () => {
    setI18nLanguage("en");
    const states = new Map([[26, makeState({ caried: ["distal"], filled: ["distal"] })]]);
    const line = computeFillingSubcariesSummaryLine([26], (tn) => states.get(tn));
    expect(line).toBe(t("filling.subcariesSummarySingle", "en", { teeth: "26 (D)" }));
  });
  it("anterior tooth in the selection uses the \"I\" (incisal) letter, not \"O\"", () => {
    setI18nLanguage("en");
    const states = new Map([[12, makeState({ caried: ["occlusal"], filled: ["occlusal"] })]]);
    const line = computeFillingSubcariesSummaryLine([12], (tn) => states.get(tn));
    expect(line).toContain("12 (I)");
  });
});

describe("getOdontogramSummary picks up the anterior incisal letter too (spec §8)", () => {
  it("a primary-caries occlusal surface on an anterior tooth is lettered \"I\" in the caries summary", () => {
    setI18nLanguage("en");
    __setToothStateForTest(12, { toothSelection: "tooth-base", caries: ["caries-occlusal"] }, "2.4");
    const caries = getOdontogramSummary().sections.find((sec) => sec.key === "caries");
    const item = caries?.items.find((i) => i.includes("12")) ?? "";
    expect(item).toContain("I");
    expect(item).not.toMatch(/\bO\b/);
  });
  it("a filling on an anterior tooth's occlusal surface is lettered \"I\" in the fillings summary", () => {
    setI18nLanguage("en");
    __setToothStateForTest(21, { toothSelection: "tooth-base", fillingSurfaceMaterials: { occlusal: "composite" } }, "2.4");
    const fillings = getOdontogramSummary().sections.find((sec) => sec.key === "fillings");
    const item = fillings?.items.find((i) => i.includes("21")) ?? "";
    expect(item).toContain("(I)");
  });
  it("the same occlusal surface on a posterior tooth still reads \"O\" (regression control)", () => {
    setI18nLanguage("en");
    __setToothStateForTest(16, { toothSelection: "tooth-base", fillingSurfaceMaterials: { occlusal: "composite" } }, "2.4");
    const fillings = getOdontogramSummary().sections.find((sec) => sec.key === "fillings");
    const item = fillings?.items.find((i) => i.includes("16")) ?? "";
    expect(item).toContain("(O)");
  });
});
