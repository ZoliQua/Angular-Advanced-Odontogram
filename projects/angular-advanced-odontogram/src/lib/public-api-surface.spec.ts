// Angular equivalent of core/__tests__/parity/api-surface.test.ts (v2.6.0
// resync, Phase 11 Task 5) — "Superseded by Task 5's own public-api-exports
// port" per vitest.config.ts's own annotation for that upstream file.
//
// Upstream freezes EVERY runtime export (name + typeof) of its library entry
// point (`App.tsx`) as a byte-identical golden — the safety net for splitting
// odontogram.ts into modules without silently losing a re-export. A
// byte-identical golden has no useful Angular analog: our own public surface
// (`public-api.ts`) is intentionally SMALLER than React's (no framework glue
// like `useEngineState`, our own component set), and a golden this broad
// would just be maintenance noise for this port. Instead this ports the
// SUBSTANCE of what the golden defends against for the slice that actually
// moved in this resync: does every new v2.6.0 dx/case-condition symbol
// actually reach `public-api.ts` (Task 1-3's new exports are useless if a
// consumer's `import { getActiveDiagnoses } from "angular-advanced-odontogram"`
// can't find them), a real regression class this repo already hit once (see
// public-api.ts's own header comment / task-2-report.md §5: a stale
// `export * from ".../i18n/translations"` line silently defeated the entire
// lazy-i18n code split for every published version until it was found here).
import { describe, it, expect } from "vitest";
import * as PublicApi from "../public-api";

type Surface = Record<string, unknown>;

describe("public API surface — public-api.ts (this package's npm entry point)", () => {
  it("exports the v2.6.0 diagnosis-coding + case-condition engine API", () => {
    const names = [
      "getSelectedTeeth",
      "getToothDiagnoses",
      "getActiveDiagnoses",
      "addDiagnosisToSelection",
      "removeDiagnosisFromSelection",
      "setDxOverrideForSelection",
      "getDiagnosisCodingPack",
      "setDiagnosisCodingPack",
      "getSnomedEnabled",
      "setSnomedEnabled",
      "getCaseConditions",
      "setCaseCondition",
    ] as const;
    for (const name of names) {
      expect(typeof (PublicApi as Surface)[name], `${name} should be a function`).toBe("function");
    }
  });

  it("exports the v2.6.0 diagnosis-coding UI components", () => {
    expect(typeof PublicApi.DiagnosesCardComponent).toBe("function");
    expect(typeof PublicApi.CaseDiagnosesModalComponent).toBe("function");
  });

  it("exports the v2.7.0 display-settings API, getNumberingSystem, compareExams and the perio-comparison constant", () => {
    const names = [
      "getNumberingSystem",
      "getScreenToothSpacing", "setScreenToothSpacing",
      "getScreenToothNumberSize", "setScreenToothNumberSize",
      "getSelectionColor", "setSelectionColor",
      "getSelectionBorderStyle", "setSelectionBorderStyle",
      "getToothInfoVisible", "setToothInfoVisible",
      "compareExams",
    ] as const;
    for (const name of names) {
      expect(typeof (PublicApi as Surface)[name], `${name} should be a function`).toBe("function");
    }
    expect(PublicApi.PROGRESSION_MM).toBe(2);
    // Upstream keeps the per-perio comparator internal; so do we.
    expect((PublicApi as Surface)["comparePerioExams"]).toBeUndefined();
  });

  it("compareExams() works through the public entry point", () => {
    const exam = (teeth: Record<string, unknown>) => ({ version: "2.22", globals: {}, teeth });
    const before = exam({ "16": { toothSelection: "tooth-base" } });
    const after = exam({ "16": { toothSelection: "no-tooth-after-extraction" } });
    const same = PublicApi.compareExams(before, structuredClone(before));
    expect(same.changes).toEqual([]);
    const diff = PublicApi.compareExams(before, after);
    expect(diff.changes.length).toBeGreaterThan(0);
    expect(diff.perio.from.chartedSites).toBe(0);
  });

  it("the FHIR plan export has no entry point of its own: exportFhir() appends ServiceRequests when the plan differs", () => {
    PublicApi.__resetChartStateForTest();
    PublicApi.importStatus({ version: "2.22", globals: {}, teeth: { "16": { toothSelection: "tooth-base" } } });
    const none = PublicApi.exportFhir() as { entry: { resource: { resourceType: string } }[] };
    expect(none.entry.filter((e) => e.resource.resourceType === "ServiceRequest")).toEqual([]);
    PublicApi.setChartMode("plan");
    PublicApi.__setSelectionForTest([16]);
    PublicApi.setToothSelectionForSelection("no-tooth-after-extraction");
    const planned = PublicApi.exportFhir() as { entry: { resource: { resourceType: string; intent?: string } }[] };
    const requests = planned.entry.map((e) => e.resource).filter((r) => r.resourceType === "ServiceRequest");
    expect(requests.length).toBeGreaterThan(0);
    expect(requests.every((r) => r.intent === "plan")).toBe(true);
  });

  it("does NOT re-export the raw i18n translations record (would inline all 12 languages into the FESM — see public-api.ts's own header comment and task-2-report.md §5)", () => {
    const key = "translations"; // indirected: esbuild statically flags a literal "translations" property access as always-undefined (it IS, by design) and warns at build time; the check itself is the point.
    expect((PublicApi as Surface)[key]).toBeUndefined();
  });

  it("keeps the DI test seams out of the public surface", () => {
    // Test seams live in their own files that public-api.ts does not re-export
    // (ODONTOGRAM_ENGINE_LIFECYCLE is the deliberate exception: hosts override it).
    for (const key of ["ODONTOGRAM_SET_TOOTH_ANATOMY", "ODONTOGRAM_I18N_LOADER"]) {
      expect((PublicApi as Surface)[key], `${key} must not be exported`).toBeUndefined();
    }
  });

  it("sanity: the surface is large and every entry is a real runtime value", () => {
    const names = Object.keys(PublicApi);
    expect(names.length).toBeGreaterThan(150);
    for (const name of names) {
      expect((PublicApi as Surface)[name], `${name} is undefined at runtime`).not.toBe(undefined);
    }
  });
});
