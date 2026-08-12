// Stage A — tooth-anatomy profile abstraction (classic only). Verifies the
// session flag accessors and that the active profile resolves to the classic
// (uniform16) profile, including the fallback when an unrealized value is set.
import { describe, it, expect, afterEach } from "vitest";
import {
  getToothAnatomy,
  setToothAnatomy,
  activeAnatomyProfile,
} from "../odontogram";

describe("tooth-anatomy profile (Stage A)", () => {
  afterEach(() => {
    // Restore the default so ordering never leaks between assertions.
    setToothAnatomy("classic");
  });

  it("defaults to classic", () => {
    expect(getToothAnatomy()).toBe("classic");
  });

  it("setToothAnatomy round-trips the flag", () => {
    setToothAnatomy("measured");
    expect(getToothAnatomy()).toBe("measured");
  });

  it("activeAnatomyProfile resolves the layout per the selected profile", () => {
    // Stage B realizes the measured profile — it now resolves to the two-arch
    // layout rather than falling back to classic.
    setToothAnatomy("measured");
    expect(activeAnatomyProfile().layout).toBe("twoArch");
    setToothAnatomy("classic");
    expect(activeAnatomyProfile().layout).toBe("uniform16");
  });

  it("the measured profile exposes the nine measured templates + occlusal map", () => {
    setToothAnatomy("measured");
    const p = activeAnatomyProfile();
    expect(p.tplNos).toEqual([11, 12, 13, 14, 15, 16, 17, 31, 46]);
    expect(p.occlNos).toEqual([14, 16, 34, 46]);
    expect(p.occlusalTemplate).toBeTruthy();
    // A lower first molar occlusal is its OWN template (46), not an upper flipped.
    expect(p.occlusalTemplate!.get(46)?.tpl).toBe(46);
    setToothAnatomy("classic");
    // Classic keeps its four templates and no separate occlusal map.
    expect(activeAnatomyProfile().tplNos).toEqual([11, 13, 14, 16]);
    expect(activeAnatomyProfile().occlusalTemplate).toBeUndefined();
  });
});
