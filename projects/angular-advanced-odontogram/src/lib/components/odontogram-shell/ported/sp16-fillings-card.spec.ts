// Angular port of core/__tests__/sp16-fillings-card.test.ts. Framework-free
// (swept into REACT_DEPENDENT by the exclusion grep's "useI18n" keyword
// match only) — verbatim port; import paths and the index.css URL adjusted
// for components/odontogram-shell/ported/ (core/index.css ships unchanged
// under lib/core/, same file the source repo's src/index.css corresponds to).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  fillingDefectLettersForTooth,
  computeFillingDefectSummaryLine,
} from "../../../core/odontogram";
import { t, setI18nLanguage } from "../../../core/i18n/useI18n";

const testFileUrl = import.meta.url;

function makeState(opts: { defect?: string[]; filled?: string[]; restorationType?: string } = {}) {
  const fillingDefect = new Map((opts.defect ?? []).map((s) => [s, "marginal"]));
  const fillingSurfaceMaterials = new Map((opts.filled ?? []).map((s) => [s, "composite"]));
  return { fillingDefect, fillingSurfaceMaterials, restorationType: opts.restorationType };
}

describe("fillingDefectLettersForTooth (SP16 Task 1 parallel to subcariesLettersForTooth)", () => {
  it("one surface, filled AND defect -> its letter", () => {
    const s = makeState({ defect: ["occlusal"], filled: ["occlusal"] });
    expect(fillingDefectLettersForTooth(35, s)).toBe("O");
  });
  it("multiple surfaces filled+defect -> combined in B,M,O,D,L order", () => {
    const s = makeState({ defect: ["distal", "occlusal", "mesial"], filled: ["mesial", "occlusal", "distal"] });
    expect(fillingDefectLettersForTooth(35, s)).toBe("MOD");
  });
  it("a defect entry without a filling on the same surface -> excluded (stale/orphaned state)", () => {
    const s = makeState({ defect: ["occlusal"], filled: [] });
    expect(fillingDefectLettersForTooth(35, s)).toBe("");
  });
  it("a filling without a defect on the same surface -> excluded", () => {
    const s = makeState({ defect: [], filled: ["occlusal"] });
    expect(fillingDefectLettersForTooth(35, s)).toBe("");
  });
  it("defect and filling on DIFFERENT surfaces (no overlap) -> excluded", () => {
    const s = makeState({ defect: ["occlusal"], filled: ["mesial"] });
    expect(fillingDefectLettersForTooth(35, s)).toBe("");
  });
  it("an undefined/empty state -> \"\"", () => {
    expect(fillingDefectLettersForTooth(35, undefined)).toBe("");
    expect(fillingDefectLettersForTooth(35, makeState())).toBe("");
  });
  it("gate consistency: a CROWNED tooth (restorationType !== \"none\") -> excluded even with a defect surface", () => {
    const s = makeState({ defect: ["occlusal"], filled: ["occlusal"], restorationType: "crown" });
    expect(fillingDefectLettersForTooth(35, s)).toBe("");
  });
  it("an explicit restorationType \"none\" behaves the same as the field being absent", () => {
    const s = makeState({ defect: ["occlusal"], filled: ["occlusal"], restorationType: "none" });
    expect(fillingDefectLettersForTooth(35, s)).toBe("O");
  });
});

describe("computeFillingDefectSummaryLine (SP16 Task 1 fillings-panel hint, parallel to computeFillingSubcariesSummaryLine)", () => {
  it("no selected teeth -> \"\" (hidden)", () => {
    expect(computeFillingDefectSummaryLine([], () => undefined)).toBe("");
  });
  it("selected teeth exist but none have a filling defect -> \"\"", () => {
    const states = new Map([[16, makeState({ filled: ["occlusal"] })], [17, makeState({ defect: ["mesial"] })]]);
    const line = computeFillingDefectSummaryLine([16, 17], (tn) => states.get(tn));
    expect(line).toBe("");
  });
  it("one tooth, one surface -> singular phrasing, \"35 (O)\"", () => {
    setI18nLanguage("hu");
    const states = new Map([[35, makeState({ defect: ["occlusal"], filled: ["occlusal"] })]]);
    const line = computeFillingDefectSummaryLine([35], (tn) => states.get(tn));
    expect(line).toBe(t("filling.fillingDefectSummarySingle", "hu", { teeth: "35 (O)" }));
  });
  it("multiple selected teeth with defects -> plural phrasing, one entry per tooth", () => {
    setI18nLanguage("hu");
    const states = new Map([
      [36, makeState({ defect: ["occlusal"], filled: ["occlusal"] })],
      [35, makeState({ defect: ["buccal"], filled: ["buccal"] })],
    ]);
    const line = computeFillingDefectSummaryLine([36, 35], (tn) => states.get(tn));
    expect(line).toBe(t("filling.fillingDefectSummaryMultiple", "hu", { teeth: "35 (B), 36 (O)" }));
  });
  it("a mix of teeth with and without defects -> only the defect teeth are listed", () => {
    setI18nLanguage("en");
    const states = new Map([
      [14, makeState({ filled: ["mesial"] })],
      [15, makeState({ defect: ["occlusal"], filled: ["occlusal"] })],
    ]);
    const line = computeFillingDefectSummaryLine([14, 15], (tn) => states.get(tn));
    expect(line).toContain("15 (O)");
    expect(line).not.toContain("14");
  });
  it("resolves through the real singular/plural i18n keys in English too", () => {
    setI18nLanguage("en");
    const states = new Map([[26, makeState({ defect: ["distal"], filled: ["distal"] })]]);
    const line = computeFillingDefectSummaryLine([26], (tn) => states.get(tn));
    expect(line).toBe(t("filling.fillingDefectSummarySingle", "en", { teeth: "26 (D)" }));
    expect(line).toBe("26 (D) has a filling defect recorded.");
  });
  it("a crowned tooth with a stale defect/filled surface is excluded from the summary line", () => {
    setI18nLanguage("en");
    const states = new Map([[24, makeState({ defect: ["occlusal"], filled: ["occlusal"], restorationType: "crown" })]]);
    const line = computeFillingDefectSummaryLine([24], (tn) => states.get(tn));
    expect(line).toBe("");
  });
});

describe("filling.fillingDefectSummarySingle/Multiple resolve in every UI language", () => {
  it("is a non-empty, non-raw-key translation for every supported language", () => {
    for (const lang of ["hu", "en", "de", "es", "it", "sk", "pl", "ru", "pt-br", "zh", "ar", "fr"] as const) {
      const single = t("filling.fillingDefectSummarySingle", lang, { teeth: "35 (O)" });
      const multiple = t("filling.fillingDefectSummaryMultiple", lang, { teeth: "35 (O), 36 (M)" });
      expect(single).not.toBe("filling.fillingDefectSummarySingle");
      expect(multiple).not.toBe("filling.fillingDefectSummaryMultiple");
      expect(single).toContain("35 (O)");
      expect(multiple).toContain("35 (O), 36 (M)");
    }
  });
});

describe("SP16 Task 1 (b): the filling-defect popup's option group stacks vertically", () => {
  it("index.css defines .odon-depth-group as a column flex container", () => {
    const cssPath = fileURLToPath(new URL("../../../core/index.css", testFileUrl));
    const css = readFileSync(cssPath, "utf8");
    const match = css.match(/\.odon-depth-group\s*\{([^}]*)\}/);
    expect(match, ".odon-depth-group rule must exist").not.toBeNull();
    const body = match![1];
    expect(body).toMatch(/display\s*:\s*flex/);
    expect(body).toMatch(/flex-direction\s*:\s*column/);
  });
});
