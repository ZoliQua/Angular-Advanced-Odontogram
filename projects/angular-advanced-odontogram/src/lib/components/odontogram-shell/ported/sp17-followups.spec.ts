// Angular port of core/__tests__/sp17-followups.test.ts. Framework-free
// (swept into REACT_DEPENDENT by the exclusion grep's "useI18n" keyword
// match only) — verbatim port, import paths adjusted for
// components/odontogram-shell/ported/.
//
// DRIFT NOTE (Task 5, v2.4.0 resync): Fix #3's expected value changed. The
// v2.2.0-era corpus asserted the recon-measured SADDLE_Y_FRACTION_LOWER of
// 0.19; at the pinned v2.4.0 commit (f9b45fc) upstream re-anchored it back
// to the TRUE geometric mirror of the upper fraction (`1 - SADDLE_Y_FRACTION`
// = 0.28000000000000003 in JS float), per `bridgeOverlay.ts`'s own comment
// ("2.2.1: the recon-measured 0.19 sat too high on the lower abutment vs the
// well-fitting upper saddle..."). This is a REAL upstream visual-behavior
// change (the lower-arch bridge-saddle bar moves vertically), not test
// staleness — flagged here for owner sign-off at final review. Assertion
// updated to mirror `core/__tests__/sp17-followups.test.ts`'s own current
// expectation exactly (`toBe(1 - SADDLE_Y_FRACTION)`, both sides derived
// from the same module-scope constants so exact equality holds).
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
import { SADDLE_Y_FRACTION_LOWER, SADDLE_Y_FRACTION } from "../../../core/bridgeOverlay";

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

  it("does NOT fire notifyStateChange when the level is already the same (idempotent)", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setPulpDetailLevel("aae");
      expect(fired).toBe(false);
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
  // v2.4.0: re-anchored to the TRUE geometric mirror of the proven upper
  // value (see the header DRIFT NOTE above) — was the recon-measured 0.19.
  it("SADDLE_Y_FRACTION_LOWER mirrors the upper fraction (1 - SADDLE_Y_FRACTION)", () => {
    expect(SADDLE_Y_FRACTION_LOWER).toBe(1 - SADDLE_Y_FRACTION);
  });
});
