// Angular port of core/__tests__/sp14-orthodontics.test.ts. Framework-free
// (swept into REACT_DEPENDENT by the exclusion grep's "useI18n" keyword
// match only). Not in the task-6 brief's explicit expected batch, but it
// satisfies the same classification rule (no App/Settings/PerioChart/
// PerioSidebar dependency at all) — verbatim port, import paths adjusted for
// components/odontogram-shell/ported/.
import { describe, it, expect, beforeEach } from "vitest";
import { AXES } from "../../../core/registry/axes";
import { FIELD_MAPPINGS } from "../../../core/fhir/fieldMappings";
import {
  VALID_ORTHO_APPLIANCE, VALID_ORTHO_DRIFT, VALID_ORTHO_VERTICAL,
  __setToothStateForTest, __getToothStateForTest, __collectExportPayloadForTest,
} from "../../../core/odontogram";
import { buildFhirBundle } from "../../../core/fhir/toFhir";
import { parseFhirBundle } from "../../../core/fhir/fromFhir";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";
beforeEach(() => setI18nLanguage("en"));
describe("SP14 Task 1: ortho axes + round-trip", () => {
  it("value sets", () => {
    expect(Array.from(VALID_ORTHO_APPLIANCE).sort()).toEqual(["band", "bracket", "none"]);
    expect(Array.from(VALID_ORTHO_DRIFT).sort()).toEqual(["distal", "mesial", "none"]);
    expect(Array.from(VALID_ORTHO_VERTICAL).sort()).toEqual(["extrusion", "intrusion", "none"]);
  });
  it("4 axes + FIELD_MAPPINGS rows (AXES↔FIELD_MAPPINGS stays 1:1 via parity.test)", () => {
    for (const id of ["orthoAppliance", "orthoDrift", "orthoVertical", "orthoRotation"]) expect(AXES.find(a => a.id === id)).toBeTruthy();
    expect(FIELD_MAPPINGS.find(m => m.field === "orthoRotation")!.findingCode).toBe("tooth-ortho-rotation");
    expect(AXES.find(a => a.id === "orthoRotation")!.svgLayer).toBeUndefined();
  });
  it("export stamps 2.10 + round-trips all four (JSON)", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", orthoAppliance: "bracket", orthoDrift: "mesial", orthoVertical: "extrusion", orthoRotation: true });
    const p = __collectExportPayloadForTest();
    expect(p.version).toBe("2.20");
    expect(p.teeth[11]).toMatchObject({ orthoAppliance: "bracket", orthoDrift: "mesial", orthoVertical: "extrusion", orthoRotation: true });
  });
  it("hydrate reads back; unknown→none/false; legacy→none/false", () => {
    __setToothStateForTest(12, { toothSelection: "tooth-base", orthoDrift: "bogus" as any });
    expect(__getToothStateForTest(12)!.orthoDrift).toBe("none");
    __setToothStateForTest(13, { toothSelection: "tooth-base" });
    expect(__getToothStateForTest(13)!.orthoAppliance).toBe("none");
    expect(__getToothStateForTest(13)!.orthoRotation).toBe(false);
  });
  it("FHIR round-trips", () => {
    __setToothStateForTest(26, { toothSelection: "tooth-base", orthoAppliance: "band", orthoRotation: true });
    const parsed = parseFhirBundle(buildFhirBundle(__collectExportPayloadForTest()));
    expect(parsed.teeth["26"]).toMatchObject({ orthoAppliance: "band", orthoRotation: true });
  });
  it("i18n labels exist", () => { expect(t("ortho.appliance.bracket")).not.toContain("ortho."); });
});
