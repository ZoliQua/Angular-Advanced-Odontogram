// Leak guard for the 2.8.0 module-level template-override state under
// `test.isolate: false`: the global beforeEach/afterEach in reset-engine-state
// must hand every test the factory profile and an empty rejection log.
import { describe, it, expect } from "vitest";
import { activeAnatomyProfile, CLASSIC_PROFILE } from "../core/anatomy/profiles";
import { getToothTemplateRejections, setToothTemplateOverrides } from "../core/odontogram";

describe("template overrides do not leak between tests (reset-engine-state)", () => {
  it("1/2: leaves an accepted override and a rejection behind", () => {
    const good = CLASSIC_PROFILE.templates[11].replace("</svg>", '<g id="leak-mark"/></svg>');
    setToothTemplateOverrides({ classic: { templates: { 11: good, 12: good } } });
    expect(activeAnatomyProfile().templates[11]).toContain("leak-mark");
    expect(getToothTemplateRejections()).toHaveLength(1);
  });

  it("2/2: the next test starts from the factory profile and no rejections", () => {
    expect(activeAnatomyProfile()).toBe(CLASSIC_PROFILE);
    expect(getToothTemplateRejections()).toEqual([]);
  });
});
