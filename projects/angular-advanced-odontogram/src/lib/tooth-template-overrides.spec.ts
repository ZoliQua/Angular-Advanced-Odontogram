// Angular-suite surface spec for the 2.8.0 host-supplied tooth drawings, taken
// through the package entry point (public-api.ts) rather than the core files.
// Mirrors the intents of $ENGINE@a11468d:src/__tests__/tooth-template-overrides.test.ts
// (which runs in test:corpus only): applied, vetted, resolved per anatomy
// profile, and refused input surfaced through getToothTemplateRejections().
// Covers all nine rejection reasons of anatomy/templateOverrides.ts.
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  getToothTemplateRejections,
  setToothAnatomy,
  setToothTemplateOverrides,
  type ToothTemplateOverrides,
} from "../public-api";
import { activeAnatomyProfile, CLASSIC_PROFILE } from "./core/anatomy/profiles";

vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 });

const FACTORY_11 = CLASSIC_PROFILE.templates[11];
const MARK = `<g id="host-mark"><rect id="host-rect" width="1" height="1" fill="#f00"/></g>`;
const HOST_11 = FACTORY_11.replace("</svg>", `${MARK}</svg>`);
const SIBLING = Number(Object.keys(CLASSIC_PROFILE.templates).find((k) => k !== "11"));
const inject = (markup: string) => FACTORY_11.replace("</svg>", `${markup}</svg>`);

afterEach(async () => {
  setToothTemplateOverrides(null);
  await setToothAnatomy("classic");
});

describe("host drawings are applied, per profile", () => {
  it("an accepted drawing is served to the engine; neighbours and the rest of the profile are untouched", () => {
    setToothTemplateOverrides({ classic: { templates: { 11: HOST_11 } } });
    const p = activeAnatomyProfile();
    expect(getToothTemplateRejections()).toEqual([]);
    expect(p).not.toBe(CLASSIC_PROFILE);
    expect(p.templates[11]).toContain("host-rect");
    expect(p.templates[13]).toBe(CLASSIC_PROFILE.templates[13]);
  });

  it("null restores the factory profile object itself", () => {
    setToothTemplateOverrides({ classic: { templates: { 11: HOST_11 } } });
    setToothTemplateOverrides(null);
    expect(activeAnatomyProfile()).toBe(CLASSIC_PROFILE);
  });

  it("overrides never leak across profiles, and each survives switching back and forth", async () => {
    await setToothAnatomy("measured");
    const mFactory = activeAnatomyProfile().templates[11];
    const mHost = mFactory.replace("</svg>", `${MARK}</svg>`);
    await setToothAnatomy("classic");
    setToothTemplateOverrides({ classic: { templates: { 11: HOST_11 } } });
    await setToothAnatomy("measured");
    expect(activeAnatomyProfile().templates[11], "a classic override reached measured").toBe(mFactory);
    setToothTemplateOverrides({ classic: { templates: { 11: HOST_11 } }, measured: { templates: { 11: mHost } } });
    for (let i = 0; i < 2; i++) {
      await setToothAnatomy("measured");
      expect(activeAnatomyProfile().templates[11]).toContain("host-rect");
      expect(activeAnatomyProfile().templates[11]).not.toBe(mFactory);
      await setToothAnatomy("classic");
      expect(activeAnatomyProfile().templates[11]).toContain("host-rect");
    }
  });

  it("the measured deciduous artwork is overridable under primaryTemplates", async () => {
    await setToothAnatomy("measured");
    const base = activeAnatomyProfile();
    const key = Number(Object.keys(base.primaryTemplates!)[0]);
    const mine = base.primaryTemplates![key].replace("</svg>", `${MARK}</svg>`);
    setToothTemplateOverrides({ measured: { primaryTemplates: { [key]: mine } } });
    const p = activeAnatomyProfile();
    expect(p.primaryTemplates![key]).toContain("host-rect");
    expect(p.templates).toBe(base.templates);
  });
});

describe("refused input keeps the factory drawing and is reported with a reason", () => {
  const reasonFor = (overrides: ToothTemplateOverrides) => {
    setToothTemplateOverrides(overrides);
    expect(activeAnatomyProfile(), "a refused drawing must not change the profile").toBe(CLASSIC_PROFILE);
    const rejected = getToothTemplateRejections();
    expect(rejected).toHaveLength(1);
    expect(rejected[0]).toMatchObject({ profile: "classic", set: "templates" });
    return rejected[0].reason;
  };
  const one = (markup: unknown): ToothTemplateOverrides => ({
    classic: { templates: { 11: markup as string } },
  });

  it.each([
    ["not a string", () => reasonFor(one(42)), /^not a string$/],
    ["too large", () => reasonFor(one(FACTORY_11 + " ".repeat(1_000_001))), /^too large/],
    ["root element is not <svg>", () => reasonFor(one("<div>x</div>")), /^root element is not <svg>$/],
    ["unsafe markup (script)", () => reasonFor(one(inject("<script>alert(1)</script>"))), /^unsafe markup.*script/],
    ["unsafe markup (event handler)", () => reasonFor(one(inject('<circle r="1" onload="alert(1)"/>'))), /^unsafe markup.*onload/],
    ["external reference", () => reasonFor(one(inject('<use href="https://evil.example/s.svg#a"/>'))), /external reference|unsafe markup.*<use>/],
    ["<style> that fetches", () => reasonFor(one(inject("<style>.x{fill:url(https://evil.example/p)}</style>"))), /fetches/],
    [
      "style attribute that fetches",
      () => reasonFor(one(inject('<rect width="1" height="1" style="fill:url(https://evil.example/p)"/>'))),
      /fetches/,
    ],
    [
      "missing layer ids",
      () => reasonFor(one('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><g id="only-this"/></svg>')),
      /^missing layer ids \(\d+\)/,
    ],
    [
      "no such template in this profile",
      () => reasonFor({ classic: { templates: { 12: HOST_11 } } }),
      /^no such template in this profile$/,
    ],
  ])("%s", (_name, run, why) => {
    expect(run()).toMatch(why);
  });

  it("a rejection names the offending key, and an accepted sibling is still applied", () => {
    setToothTemplateOverrides({
      classic: {
        templates: { 11: inject("<script>1</script>"), [SIBLING]: CLASSIC_PROFILE.templates[SIBLING].replace("</svg>", `${MARK}</svg>`) },
      },
    });
    expect(getToothTemplateRejections().map((r) => r.key)).toEqual([11]);
    expect(activeAnatomyProfile().templates[SIBLING]).toContain("host-rect");
    expect(activeAnatomyProfile().templates[11]).toBe(FACTORY_11);
  });

  it("an override for the measured profile is vetted when its lazy artwork loads", async () => {
    setToothTemplateOverrides({ measured: { templates: { 11: "<svg xmlns='http://www.w3.org/2000/svg'><g id='x'/></svg>" } } });
    await setToothAnatomy("measured");
    expect(activeAnatomyProfile().templates[11]).not.toContain('id="x"');
    expect(getToothTemplateRejections().some((r) => r.profile === "measured" && /missing layer ids/.test(r.reason))).toBe(true);
  });
});
