// Angular port of core/__tests__/sp12-discoloration.test.ts. Framework-free
// (swept into REACT_DEPENDENT by the exclusion grep's "useI18n" keyword
// match only) — verbatim port, import paths adjusted for
// components/odontogram-shell/ported/.
import { describe, it, expect, beforeEach } from "vitest";
import { AXES } from "../../../core/registry/axes";
import { FIELD_MAPPINGS } from "../../../core/fhir/fieldMappings";
import { VALID_DISCOLORATION, __setToothStateForTest, __getToothStateForTest, __collectExportPayloadForTest } from "../../../core/odontogram";
import { buildFhirBundle } from "../../../core/fhir/toFhir";
import { parseFhirBundle } from "../../../core/fhir/fromFhir";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";

beforeEach(() => setI18nLanguage("en"));

describe("SP12 Task 1: discoloration axis + round-trip", () => {
  it("has the 6 values", () => {
    expect(Array.from(VALID_DISCOLORATION).sort()).toEqual(["extrinsic", "fluorosis", "none", "nonvital", "other", "tetracycline"]);
  });
  it("axis exists (enum, no svgLayer) + FIELD_MAPPINGS row", () => {
    const ax = AXES.find(a => a.id === "discoloration");
    expect(ax).toBeTruthy();
    expect(ax!.svgLayer).toBeUndefined();
    const fm = FIELD_MAPPINGS.find(m => m.field === "discoloration");
    expect(fm!.findingCode).toBe("tooth-discoloration");
  });
  it("JSON export stamps 2.9 + round-trips discoloration", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", discoloration: "tetracycline" });
    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.22");
    expect(payload.teeth[11].discoloration).toBe("tetracycline");
  });
  it("hydrate reads it back; unknown → none; legacy → none", () => {
    __setToothStateForTest(12, { toothSelection: "tooth-base", discoloration: "bogus" });
    expect(__getToothStateForTest(12)!.discoloration).toBe("none");
    __setToothStateForTest(13, { toothSelection: "tooth-base" });
    expect(__getToothStateForTest(13)!.discoloration).toBe("none");
  });
  it("FHIR round-trips discoloration", () => {
    __setToothStateForTest(26, { toothSelection: "tooth-base", discoloration: "fluorosis" });
    const parsed = parseFhirBundle(buildFhirBundle(__collectExportPayloadForTest()));
    expect(parsed.teeth["26"].discoloration).toBe("fluorosis");
  });
  it("i18n labels exist", () => {
    expect(t("discoloration.tetracycline")).not.toContain("discoloration.");
  });
});
