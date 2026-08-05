// Angular port of core/__tests__/sp17-followups.test.ts. Framework-free
// (swept into REACT_DEPENDENT by the exclusion grep's "useI18n" keyword
// match only) — verbatim port, import paths adjusted for
// components/odontogram-shell/ported/.
import { describe, it, expect, afterEach } from "vitest";
import {
  setPulpDetailLevel,
  getPulpDetailLevel,
  onStateChange,
  getToothStateSummary,
  getOdontogramSummary,
  __setToothStateForTest,
} from "../../../core/odontogram";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";
import { SADDLE_Y_FRACTION_LOWER } from "../../../core/bridgeOverlay";

setI18nLanguage("en");

describe("Fix #1: setPulpDetailLevel live-refresh", () => {
  afterEach(() => {
    setPulpDetailLevel("aae");
  });

  it("calls notifyStateChange() (onStateChange listener fires)", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setPulpDetailLevel("latin");
      expect(fired).toBe(true);
      expect(getPulpDetailLevel()).toBe("latin");
    } finally {
      unsub();
    }
  });
});

describe("Fix #2: crown-leakage summary line gated on restorationType crown/bridge", () => {
  afterEach(() => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "none", crownLeakage: false });
  });

  it("getToothStateSummary (tooltip) shows the leakage line when restorationType is crown", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon", crownLeakage: true });
    const s = getToothStateSummary(21).join(" · ");
    expect(s).toContain(t("crownLeakage.label"));
  });

  it("getToothStateSummary (tooltip) HIDES the leakage line once restorationType is cleared to none, even though crownLeakage stays true", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "none", crownLeakage: true });
    const s = getToothStateSummary(21).join(" · ");
    expect(s).not.toContain(t("crownLeakage.label"));
  });

  it("getOdontogramSummary (whole-mouth) shows the leakage line when restorationType is bridge", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "bridge", restorationMaterial: "gold", crownLeakage: true });
    const pr = getOdontogramSummary().sections.find((sec) => sec.key === "prosthetics")!;
    expect(pr.items.join(" | ")).toContain(t("crownLeakage.label"));
  });

  it("getOdontogramSummary (whole-mouth) HIDES the leakage line once restorationType is cleared to none, even though crownLeakage stays true", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "none", crownLeakage: true });
    const pr = getOdontogramSummary().sections.find((sec) => sec.key === "prosthetics")!;
    expect(pr.items.join(" | ")).not.toContain(t("crownLeakage.label"));
  });

  it("getToothStateSummary (tooltip) HIDES the leakage line on a milktooth carrying a stale crown restorationType (restoration row is hidden for milk teeth)", () => {
    __setToothStateForTest(21, { toothSelection: "milktooth", restorationType: "crown", restorationMaterial: "zircon", crownLeakage: true });
    const s = getToothStateSummary(21).join(" · ");
    expect(s).not.toContain(t("crownLeakage.label"));
  });

  it("getOdontogramSummary (whole-mouth) HIDES the leakage line on a milktooth carrying a stale crown restorationType (restoration row is hidden for milk teeth)", () => {
    __setToothStateForTest(21, { toothSelection: "milktooth", restorationType: "crown", restorationMaterial: "zircon", crownLeakage: true });
    const pr = getOdontogramSummary().sections.find((sec) => sec.key === "prosthetics")!;
    expect(pr.items.join(" | ")).not.toContain(t("crownLeakage.label"));
  });
});

describe("Fix #3: lower-arch bridge saddle Y fraction", () => {
  it("SADDLE_Y_FRACTION_LOWER is the recon-measured 0.19, not the old mirrored 0.28", () => {
    expect(SADDLE_Y_FRACTION_LOWER).toBe(0.19);
  });
});
