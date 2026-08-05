// Angular port of core/__tests__/sp15-stale-render.test.ts. Framework-free
// (swept into REACT_DEPENDENT by the exclusion grep's "useI18n" keyword
// match only) — verbatim port, import paths (including the SVG-asset URL)
// adjusted for components/odontogram-shell/ported/.
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  __parseSvgForTest,
  __renderActiveLayersOnNode,
  __setToothStateForTest,
  __getToothStateForTest,
  getToothStateSummary,
  getOdontogramSummary,
} from "../../../core/odontogram";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";

const testFileUrl = import.meta.url;
const svg11Text = readFileSync(fileURLToPath(new URL("../../../core/assets/teeth-svgs/11.svg", testFileUrl)), "utf8");

const ids = (layers: { id: string }[]) => layers.map(l => l.id);
const render = (state: Record<string, unknown>) => {
  const node = __parseSvgForTest(svg11Text);
  return __renderActiveLayersOnNode(node, 11, state);
};

beforeEach(() => setI18nLanguage("en"));

describe("SP15 wholebranch fix — Finding 1: stale crown on a radix substrate", () => {
  it("hydrate: a crown+radix payload self-heals to restorationType 'none'", () => {
    __setToothStateForTest(11, {
      toothSelection: "tooth-base",
      toothSubstrate: "radix",
      restorationType: "crown",
      restorationMaterial: "emax",
    });
    const s = __getToothStateForTest(11)!;
    expect(s.restorationType).toBe("none");
    expect(s.restorationMaterial).toBe("none");
  });

  it("render: no emax-crown activates over a radix substrate even with crown fields set", () => {
    const l = render({
      toothSelection: "tooth-base",
      toothSubstrate: "radix",
      restorationType: "crown",
      restorationMaterial: "emax",
    });
    expect(ids(l)).not.toContain("emax-crown");
    expect(ids(l)).toContain("tooth-radix");
  });

  it("regression guard: the SAME crown on a natural substrate still renders emax-crown", () => {
    const l = render({
      toothSelection: "tooth-base",
      toothSubstrate: "natural",
      restorationType: "crown",
      restorationMaterial: "emax",
    });
    expect(ids(l)).toContain("emax-crown");
    expect(ids(l)).not.toContain("tooth-radix");
  });

  it("tooltip summary: does not list a crown alongside 'Radix'", () => {
    __setToothStateForTest(11, {
      toothSelection: "tooth-base",
      toothSubstrate: "radix",
      restorationType: "crown",
      restorationMaterial: "emax",
    });
    const summary = getToothStateSummary(11).join(" · ");
    expect(summary).toContain(t("substrate.radix"));
    expect(summary).not.toContain(t("restoration.type.crown"));
  });
});

describe("SP15 wholebranch fix — Finding 2: stale mobility glyph on an implant", () => {
  it("render: no mobility glyph activates on an implant even with mobility set", () => {
    const l = render({ toothSelection: "implant", mobility: "m2" });
    expect(ids(l)).not.toContain("mobility");
  });

  it("regression guard: the SAME mobility on a tooth-base still renders the mobility glyph", () => {
    const l = render({ toothSelection: "tooth-base", mobility: "m2" });
    expect(ids(l)).toContain("mobility");
  });

  it("stored value is left untouched by hydrate (T1's preserve-value choice)", () => {
    __setToothStateForTest(11, { toothSelection: "implant", mobility: "m2" });
    const s = __getToothStateForTest(11)!;
    expect(s.mobility).toBe("m2");
  });

  it("tooltip summary: does not list mobility on an implant", () => {
    __setToothStateForTest(11, { toothSelection: "implant", mobility: "m2" });
    const summary = getToothStateSummary(11).join(" · ");
    expect(summary).not.toContain(t("inflammation.mobilityLabel"));
  });

  it("tooltip summary: the SAME mobility on a tooth-base still lists it (regression guard)", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", mobility: "m2" });
    const summary = getToothStateSummary(11).join(" · ");
    expect(summary).toContain(t("inflammation.mobilityLabel"));
  });

  it("whole-mouth summary: does not list mobility for an implant tooth (periodontalText)", () => {
    __setToothStateForTest(46, { toothSelection: "implant", mobility: "m3" });
    const { periodontalText } = getOdontogramSummary();
    expect(periodontalText).not.toContain("46 (");
  });

  it("whole-mouth summary: the SAME mobility on a tooth-base still lists it (regression guard)", () => {
    __setToothStateForTest(47, { toothSelection: "tooth-base", mobility: "m3" });
    const { periodontalText } = getOdontogramSummary();
    expect(periodontalText).toContain("47 (");
    expect(periodontalText).toContain(t("inflammation.mobilityLabel"));
  });
});
