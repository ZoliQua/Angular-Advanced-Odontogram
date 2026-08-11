import { describe, it, expect } from "vitest";
import { fdiToDeciduous, deciduousToFdi, toothBodySiteCode } from "../fhir/iso3950";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";
import type { Observation } from "../fhir/types";

const payload = (teeth: Record<string, object>) =>
  ({ version: "2.20", globals: {}, teeth }) as never;

const toothObs = (bundle: { entry?: Array<{ resource?: unknown }> }): Observation[] =>
  (bundle.entry ?? [])
    .map((e) => e.resource as Observation)
    .filter((r) => r?.resourceType === "Observation" && r.bodySite);

describe("ISO 3950 deciduous mapping", () => {
  it("maps every anterior/premolar position and rejects molars", () => {
    const pairs: Array<[string, string]> = [];
    for (let q = 1; q <= 4; q++) for (let p = 1; p <= 5; p++) pairs.push([`${q}${p}`, `${q + 4}${p}`]);
    for (const [fdi, dec] of pairs) {
      expect(fdiToDeciduous(fdi)).toBe(dec);
      expect(deciduousToFdi(dec)).toBe(fdi);
    }
    for (const molar of ["16", "18", "27", "38", "46"]) expect(fdiToDeciduous(molar)).toBeNull();
    for (const bad of ["50", "56", "99", "11a", ""]) expect(deciduousToFdi(bad)).toBeNull();
  });

  it("toothBodySiteCode converts only milk teeth", () => {
    expect(toothBodySiteCode("11", { toothSelection: "milktooth" })).toBe("51");
    expect(toothBodySiteCode("11", { toothSelection: "tooth-base" })).toBe("11");
    expect(toothBodySiteCode("11", {})).toBe("11");
    expect(toothBodySiteCode("16", { toothSelection: "milktooth" })).toBe("16"); // no deciduous molar-3 equivalent
  });
});

describe("FHIR export/import of milk teeth", () => {
  it("emits the deciduous ISO 3950 bodySite code for a milk tooth", () => {
    const bundle = buildFhirBundle(payload({ "11": { toothSelection: "milktooth" } }));
    const obs = toothObs(bundle);
    expect(obs.length).toBeGreaterThan(0);
    expect(obs[0].bodySite?.coding?.[0].code).toBe("51");
    expect(obs[0].bodySite?.coding?.[0].system).toBe("urn:iso:std:iso:3950");
  });

  it("keeps the permanent code for permanent teeth and for milk-flagged molars", () => {
    const bundle = buildFhirBundle(payload({
      "21": { toothSelection: "implant" },
      "16": { toothSelection: "milktooth" },
    }));
    const codes = toothObs(bundle).map((o) => o.bodySite?.coding?.[0].code);
    expect(codes).toContain("21");
    expect(codes).toContain("16");
    expect(codes).not.toContain("51");
  });

  it("round-trips a milk tooth back to its internal FDI key", () => {
    const bundle = buildFhirBundle(payload({ "24": { toothSelection: "milktooth", caries: ["caries-occlusal"] } }));
    const parsed = parseFhirBundle(bundle) as { teeth: Record<string, { toothSelection?: string; caries?: string[] }> };
    expect(parsed.teeth["24"]).toBeDefined();
    expect(parsed.teeth["64"]).toBeUndefined();
    expect(parsed.teeth["24"].toothSelection).toBe("milktooth");
    expect(parsed.teeth["24"].caries).toEqual(["caries-occlusal"]);
  });
});
