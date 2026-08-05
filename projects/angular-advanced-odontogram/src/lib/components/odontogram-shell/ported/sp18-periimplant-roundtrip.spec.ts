// Angular port of core/__tests__/sp18-periimplant-roundtrip.test.ts.
// Framework-free (swept into REACT_DEPENDENT by the exclusion grep's
// "useI18n" keyword match only) — verbatim port, import paths adjusted for
// components/odontogram-shell/ported/.
import { describe, it, expect, beforeEach } from "vitest";
import {
  VALID_PERI_IMPLANT, __setToothStateForTest, __getToothStateForTest,
  __collectExportPayloadForTest,
} from "../../../core/odontogram";
import { buildFhirBundle } from "../../../core/fhir/toFhir";
import { parseFhirBundle } from "../../../core/fhir/fromFhir";
import { setI18nLanguage } from "../../../core/i18n/useI18n";

beforeEach(() => setI18nLanguage("en"));

describe("SP18: periImplant serialize/round-trip fix", () => {
  it("serializeState now includes periImplant in the JSON export payload", () => {
    __setToothStateForTest(16, { toothSelection: "implant", periImplant: "peri-implantitis-moderate" });
    const payload = __collectExportPayloadForTest();
    expect(payload.teeth[16].periImplant).toBe("peri-implantitis-moderate");
  });

  it("JSON export -> hydrate round-trips a non-none periImplant value", () => {
    __setToothStateForTest(16, { toothSelection: "implant", periImplant: "peri-implantitis-moderate" });
    const payload = __collectExportPayloadForTest();
    __setToothStateForTest(17, payload.teeth[16], payload.version);
    expect(__getToothStateForTest(17)!.periImplant).toBe("peri-implantitis-moderate");
  });

  it("FHIR export -> import round-trips a non-none periImplant value", () => {
    __setToothStateForTest(26, { toothSelection: "implant", periImplant: "peri-implantitis-severe" });
    const parsed = parseFhirBundle(buildFhirBundle(__collectExportPayloadForTest()));
    const tooth26 = parsed.teeth["26"] as unknown as Record<string, unknown>;
    expect(tooth26.periImplant).toBe("peri-implantitis-severe");
  });

  it("default/none periImplant still round-trips (no regression for the common case)", () => {
    __setToothStateForTest(36, { toothSelection: "implant" });
    const payload = __collectExportPayloadForTest();
    expect(payload.teeth[36].periImplant).toBe("none");
    __setToothStateForTest(37, payload.teeth[36], payload.version);
    expect(__getToothStateForTest(37)!.periImplant).toBe("none");
  });

  it("unknown/invalid value falls back to none on hydrate", () => {
    __setToothStateForTest(46, { toothSelection: "implant", periImplant: "bogus" });
    expect(__getToothStateForTest(46)!.periImplant).toBe("none");
  });

  it("value set is unchanged", () => {
    expect(Array.from(VALID_PERI_IMPLANT).sort()).toEqual([
      "mucositis", "none", "peri-implantitis-mild", "peri-implantitis-moderate", "peri-implantitis-severe",
    ]);
  });
});
