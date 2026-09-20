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

  it("does NOT re-export the raw i18n translations record (would inline all 12 languages into the FESM — see public-api.ts's own header comment and task-2-report.md §5)", () => {
    const key = "translations"; // indirected: esbuild statically flags a literal "translations" property access as always-undefined (it IS, by design) and warns at build time; the check itself is the point.
    expect((PublicApi as Surface)[key]).toBeUndefined();
  });

  it("sanity: the surface is large and every entry is a real runtime value", () => {
    const names = Object.keys(PublicApi);
    expect(names.length).toBeGreaterThan(150);
    for (const name of names) {
      expect((PublicApi as Surface)[name], `${name} is undefined at runtime`).not.toBe(undefined);
    }
  });
});
