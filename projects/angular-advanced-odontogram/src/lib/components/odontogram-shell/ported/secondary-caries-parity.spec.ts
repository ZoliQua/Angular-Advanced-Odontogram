// Angular port of core/__tests__/secondary-caries-parity.test.ts.
// Framework-free (swept into REACT_DEPENDENT by the exclusion grep's
// "useI18n" keyword match only) — verbatim port; only the import paths and
// the SVG-asset URL (one directory deeper, plus a `core/` hop, to reach
// core/assets/teeth-svgs/ from components/odontogram-shell/ported/) change.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { __renderActiveLayers, __setToothStateForTest, __getToothStateForTest, getOdontogramSummary } from "../../../core/odontogram";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";

const testFileUrl = import.meta.url;
const readSvg = (name: string) => readFileSync(fileURLToPath(new URL(`../../../core/assets/teeth-svgs/${name}.svg`, testFileUrl)), "utf8");

const occlSvg = readSvg("16_occl");
const render = (state: Record<string, unknown>) => __renderActiveLayers(occlSvg, 16, state);
const find = (layers: { id: string; opacity: string; cls: string }[], id: string) => layers.find(l => l.id === id);
type Read = { cariesSeverity: Record<string, number> };
const get = (n: number) => __getToothStateForTest(n) as unknown as Read;

describe("SP6 Task 1: caries/subcaries surface state machine", () => {
  it("primary caries (no filling) → caries-{s} at the ICDAS depth tier, NO subcaries", () => {
    const l2 = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 2 } });
    expect(find(l2, "caries-occlusal")?.opacity).toBe("0.45");
    expect(find(l2, "subcaries-occlusal")).toBeUndefined();

    const l4 = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } });
    expect(find(l4, "caries-occlusal")?.opacity).toBe("0.7");

    const l6 = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 6 } });
    expect(find(l6, "caries-occlusal")?.opacity).toBe("1");
    expect(find(l6, "caries-occlusal")?.cls.split(/\s+/)).toContain("caries-deep");
  });

  it("primary caries with no stored severity defaults to ICDAS-2 (opacity 0.45), no subcaries", () => {
    const l = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"] });
    expect(find(l, "caries-occlusal")?.opacity).toBe("0.45");
    expect(find(l, "subcaries-occlusal")).toBeUndefined();
  });

  it("recurrent caries (caries + filling) → subcaries-{s} at the CARS opacity, NO caries-{s}", () => {
    const l = render({
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: 3 },
    });
    expect(find(l, "subcaries-occlusal")).toBeTruthy();
    expect(find(l, "subcaries-occlusal")?.opacity).toBe("0.58");
    expect(find(l, "subcaries-occlusal")?.cls).toBe("");
    expect(find(l, "caries-occlusal")).toBeUndefined();
  });

  it("CARS opacity formula across the scale (recurrent surface): 6→1 … 1→0.3", () => {
    const at = (sev: number) => find(render({
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: sev },
    }), "subcaries-occlusal")?.opacity;
    expect(at(6)).toBe("1");
    expect(at(5)).toBe("0.86");
    expect(at(4)).toBe("0.72");
    expect(at(3)).toBe("0.58");
    expect(at(2)).toBe("0.44");
    expect(at(1)).toBe("0.3");
  });

  it("transition: adding a filling to a primary caried surface flips caries-X → subcaries-X and CARRIES the severity value", () => {
    const primary = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } });
    expect(find(primary, "caries-occlusal")?.opacity).toBe("0.7");
    expect(find(primary, "subcaries-occlusal")).toBeUndefined();

    const recurrent = render({
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: 4 },
    });
    expect(find(recurrent, "subcaries-occlusal")?.opacity).toBe("0.72");
    expect(find(recurrent, "caries-occlusal")).toBeUndefined();
  });

  it("migration: a legacy caries∩filling surface with NO stored recurrent value → cariesSeverity 3", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
    });
    expect(get(16).cariesSeverity.occlusal).toBe(3);
  });

  it("migration: a 2.3 payload with cariesDepths (primary) + secondaryCaries (recurrent) merges per surface state", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal", "caries-mesial"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesDepths: { mesial: 4, occlusal: 2 },
      secondaryCaries: { occlusal: 5 },
    });
    const s = get(16);
    expect(s.cariesSeverity.occlusal).toBe(5);
    expect(s.cariesSeverity.mesial).toBe(4);
  });

  it("migration: a native cariesSeverity value ALWAYS wins over legacy cariesDepths/secondaryCaries", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: 2 },
      secondaryCaries: { occlusal: 5 },
    });
    expect(get(16).cariesSeverity.occlusal).toBe(2);
  });

  it("migration: a caries surface with NO filling is never forced to recurrent (renders as primary)", () => {
    const l = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"] });
    expect(find(l, "caries-occlusal")).toBeTruthy();
    expect(find(l, "subcaries-occlusal")).toBeUndefined();
  });

  it("summary: a caried surface WITH a filling is reported recurrent/secondary; without a filling, primary", () => {
    setI18nLanguage("en");
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal", "caries-mesial"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
    });
    const summary = getOdontogramSummary();
    const caries = summary.sections.find(sec => sec.key === "caries");
    const item = caries?.items.find(i => i.includes("16")) ?? "";
    expect(item).toContain(t("toothInfo.secondary", "en"));
    expect(item).toContain("O");
    expect(item).toContain("M");
  });
});

describe("FIX 2 (final review): explicit CARS 0 on a recurrent surface is normalized to Sound on hydrate", () => {
  it("caries+filling+cariesSeverity 0 (native field) hydrates as a plain filling: removed from caries, severity cleared", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: 0 },
    });
    const s = get(16);
    expect(s.cariesSeverity.occlusal).toBeUndefined();
    const raw = __getToothStateForTest(16) as unknown as { caries: string[] };
    expect(raw.caries).not.toContain("caries-occlusal");
  });

  it("caries+filling+secondaryCaries 0 (legacy field, resolves to severity 0) is normalized the same way", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      secondaryCaries: { occlusal: 0 },
    });
    const s = get(16);
    expect(s.cariesSeverity.occlusal).toBeUndefined();
    const raw = __getToothStateForTest(16) as unknown as { caries: string[] };
    expect(raw.caries).not.toContain("caries-occlusal");
  });

  it("renders identically to a plain (non-caried) filling — no caries-X or subcaries-X layer active", () => {
    const l = render({
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: 0 },
    });
    expect(find(l, "subcaries-occlusal")).toBeUndefined();
    expect(find(l, "caries-occlusal")).toBeUndefined();
  });

  it("is scoped to RECURRENT surfaces only: a primary (unfilled) surface with cariesSeverity 0 is left untouched", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      cariesSeverity: { occlusal: 0 },
    });
    const s = get(16);
    expect(s.cariesSeverity.occlusal).toBe(0);
    const raw = __getToothStateForTest(16) as unknown as { caries: string[] };
    expect(raw.caries).toContain("caries-occlusal");
  });

  it("does not disturb an ordinary recurrent surface with a nonzero severity", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: 4 },
    });
    const s = get(16);
    expect(s.cariesSeverity.occlusal).toBe(4);
    const raw = __getToothStateForTest(16) as unknown as { caries: string[] };
    expect(raw.caries).toContain("caries-occlusal");
  });
});
