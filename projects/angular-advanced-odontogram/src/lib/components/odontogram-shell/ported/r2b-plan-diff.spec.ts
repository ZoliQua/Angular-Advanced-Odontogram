// Angular port of core/__tests__/r2b-plan-diff.test.ts. Framework-free
// (swept into REACT_DEPENDENT by the exclusion grep's "useI18n" keyword
// match only) — verbatim port, import paths adjusted for
// components/odontogram-shell/ported/.
import { describe, it, expect, beforeEach } from "vitest";
import {
  setChartMode,
  getPlanChanges,
  __setToothStateForTest,
  __resetChartStateForTest,
} from "../../../core/odontogram";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";

beforeEach(() => {
  __resetChartStateForTest();
  setI18nLanguage("en");
});

describe("getPlanChanges() — status vs. plan diff engine", () => {
  it("returns [] when the plan chart was never initialized", () => {
    __setToothStateForTest(16, { restorationType: "crown", restorationMaterial: "zircon" });
    expect(getPlanChanges()).toEqual([]);
  });

  it("returns [] when plan equals status (no edits since the plan was cloned)", () => {
    __setToothStateForTest(16, { restorationType: "crown", restorationMaterial: "zircon" });
    setChartMode("plan");
    setChartMode("status");
    expect(getPlanChanges()).toEqual([]);
  });

  it("status sound + plan crown(zircon) -> a single restoration change", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "none" });
    setChartMode("plan");
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon" });
    setChartMode("status");

    const changes = getPlanChanges();
    const restorationChanges = changes.filter((c) => c.toothNo === 16 && c.axis === "restoration");
    expect(restorationChanges).toEqual([
      {
        toothNo: 16,
        axis: "restoration",
        from: t("planChange.none"),
        to: `${t("restoration.type.crown")} – ${t("restoration.material.zircon")}`,
      },
    ]);
  });

  it("status present + plan extraction-planned -> a presence change (extractionPlan suffix)", () => {
    __setToothStateForTest(26, { toothSelection: "tooth-base", extractionPlan: false });
    setChartMode("plan");
    __setToothStateForTest(26, { toothSelection: "tooth-base", extractionPlan: true });
    setChartMode("status");

    const changes = getPlanChanges();
    const presenceChanges = changes.filter((c) => c.toothNo === 26 && c.axis === "presence");
    expect(presenceChanges).toEqual([
      {
        toothNo: 26,
        axis: "presence",
        from: t("toothSelect.permanent"),
        to: `${t("toothSelect.permanent")} (${t("tooth.extractionPlan")})`,
      },
    ]);
  });

  it("status no ortho + plan orthoDrift mesial -> an ortho change (planned movement)", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", orthoDrift: "none" });
    setChartMode("plan");
    __setToothStateForTest(11, { toothSelection: "tooth-base", orthoDrift: "mesial" });
    setChartMode("status");

    const changes = getPlanChanges();
    const orthoChanges = changes.filter((c) => c.toothNo === 11 && c.axis === "ortho");
    expect(orthoChanges).toEqual([
      {
        toothNo: 11,
        axis: "ortho",
        from: t("planChange.none"),
        to: t("ortho.drift.mesial"),
      },
    ]);
  });

  it("multiple axes on one tooth -> multiple entries; multiple teeth -> grouped/ordered by tooth number", () => {
    __setToothStateForTest(36, { toothSelection: "tooth-base", toothSubstrate: "natural", restorationType: "none" });
    __setToothStateForTest(15, { toothSelection: "tooth-base", prosthesis: "none" });
    setChartMode("plan");
    __setToothStateForTest(36, { toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "crown", restorationMaterial: "emax" });
    __setToothStateForTest(15, { toothSelection: "tooth-base", prosthesis: "locator" });
    setChartMode("status");

    const changes = getPlanChanges();
    const relevant = changes.filter((c) => c.toothNo === 36 || c.toothNo === 15);

    expect(relevant.map((c) => c.toothNo)).toEqual([15, 36, 36]);

    expect(relevant).toEqual([
      { toothNo: 15, axis: "prosthesis", from: t("planChange.none"), to: t("prosthesis.type.locator") },
      { toothNo: 36, axis: "substrate", from: t("substrate.natural"), to: t("substrate.crownprep") },
      { toothNo: 36, axis: "restoration", from: t("planChange.none"), to: `${t("restoration.type.crown")} – ${t("restoration.material.emax")}` },
    ]);
  });

  it("symmetric: a field REMOVED in plan (status had a crown, plan sound) -> from crown -> to sound", () => {
    __setToothStateForTest(46, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon" });
    setChartMode("plan");
    __setToothStateForTest(46, { toothSelection: "tooth-base", restorationType: "none", restorationMaterial: "none" });
    setChartMode("status");

    const changes = getPlanChanges();
    const restorationChanges = changes.filter((c) => c.toothNo === 46 && c.axis === "restoration");
    expect(restorationChanges).toEqual([
      {
        toothNo: 46,
        axis: "restoration",
        from: `${t("restoration.type.crown")} – ${t("restoration.material.zircon")}`,
        to: t("planChange.none"),
      },
    ]);
  });

  it("a tooth with no changes at all contributes no entries", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "emax" });
    setChartMode("plan");
    setChartMode("status");
    __setToothStateForTest(22, { toothSelection: "tooth-base" });
    setChartMode("plan");
    __setToothStateForTest(22, { toothSelection: "tooth-base", crownNeeded: true });
    setChartMode("status");

    const changes = getPlanChanges();
    expect(changes.some((c) => c.toothNo === 21)).toBe(false);
  });
});
