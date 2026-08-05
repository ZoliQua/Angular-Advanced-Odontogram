// Angular port of core/__tests__/warnings.test.ts. Despite living in
// vitest.config.ts's REACT_DEPENDENT list, the source file never imports
// React/@testing-library/react/App — it was swept in by the exclusion
// grep's "useI18n" keyword match (its i18n import path contains that
// substring). Framework-free: __getStateWarnings is a pure function over a
// plain state object, so this is a verbatim port, only the two import
// paths change (one directory deeper than core/__tests__, plus a `core/`
// hop) to reach the same modules from components/odontogram-shell/ported/.
import { describe, it, expect } from "vitest";
import { __getStateWarnings } from "../../../core/odontogram";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";

describe("getStateWarnings (via __getStateWarnings)", () => {
  const base = () => ({
    toothSelection: "tooth-base",
    endo: "none",
    fillingMaterial: "none",
    caries: new Set<string>(),
    crownReplace: false,
    bridgePillar: false,
    restorationType: "none",
    restorationMaterial: "none",
  });

  it("does NOT fire crownReplace/pillar warnings on a plain new-model restoration (regression: false positive)", () => {
    setI18nLanguage("en");
    const state = {
      ...base(),
      restorationType: "crown",
      restorationMaterial: "zircon",
      crownReplace: true,
      bridgePillar: true,
    };
    const warnings = __getStateWarnings(state);
    expect(warnings).not.toContain(t("warn.crownReplaceNoCrown"));
    expect(warnings).not.toContain(t("warn.pillarNoCrown"));
  });

  it("still fires the crownReplace warning when the flag is set but no restoration is present", () => {
    setI18nLanguage("en");
    const state = { ...base(), crownReplace: true, restorationType: "none" };
    const warnings = __getStateWarnings(state);
    expect(warnings).toContain(t("warn.crownReplaceNoCrown"));
  });

  it("still fires the bridgePillar warning when the flag is set but no restoration is present", () => {
    setI18nLanguage("en");
    const state = { ...base(), bridgePillar: true, restorationType: "none" };
    const warnings = __getStateWarnings(state);
    expect(warnings).toContain(t("warn.pillarNoCrown"));
  });

  it("fires the crownReplace warning when the restoration exists but the tooth is not tooth-base (e.g. a bridge pontic gap)", () => {
    setI18nLanguage("en");
    const state = {
      ...base(),
      toothSelection: "none",
      restorationType: "bridge",
      restorationMaterial: "zircon",
      crownReplace: true,
    };
    const warnings = __getStateWarnings(state);
    expect(warnings).toContain(t("warn.crownReplaceNoCrown"));
  });

  it("does not fire either warning when the flags are unset, regardless of restoration", () => {
    setI18nLanguage("en");
    const state = { ...base(), restorationType: "crown", restorationMaterial: "emax" };
    const warnings = __getStateWarnings(state);
    expect(warnings).not.toContain(t("warn.crownReplaceNoCrown"));
    expect(warnings).not.toContain(t("warn.pillarNoCrown"));
  });

  it("still fires endo/filling/caries-on-missing warnings unaffected by this change", () => {
    setI18nLanguage("en");
    const state = { ...base(), toothSelection: "none", endo: "endo-filling", fillingMaterial: "composite", caries: new Set(["caries-occlusal"]) };
    const warnings = __getStateWarnings(state);
    expect(warnings).toContain(t("warn.endoOnMissing"));
    expect(warnings).toContain(t("warn.fillingOnMissing"));
    expect(warnings).toContain(t("warn.cariesOnMissing"));
  });

  it("fires an invalid-restoration-combo warning for a pair not in RESTORATION_MATRIX", () => {
    setI18nLanguage("en");
    const state = { ...base(), restorationType: "inlay", restorationMaterial: "metal" };
    const warnings = __getStateWarnings(state);
    expect(warnings).toContain(t("warn.invalidRestorationCombo"));
  });

  it("does NOT fire the invalid-restoration-combo warning for a valid pair", () => {
    setI18nLanguage("en");
    const state = { ...base(), restorationType: "crown", restorationMaterial: "zircon" };
    const warnings = __getStateWarnings(state);
    expect(warnings).not.toContain(t("warn.invalidRestorationCombo"));
  });

  it('does NOT fire the invalid-restoration-combo warning for restorationType:"none"/restorationMaterial:"none"', () => {
    setI18nLanguage("en");
    const state = { ...base() };
    const warnings = __getStateWarnings(state);
    expect(warnings).not.toContain(t("warn.invalidRestorationCombo"));
  });
});
