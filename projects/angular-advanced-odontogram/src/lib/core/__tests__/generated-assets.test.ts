// Angular-port addition: proves the generated asset modules carry the exact
// bytes of the source SVG files (the ?raw-import replacement, spec §5).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  tooth11Svg, tooth13Svg, tooth14Svg, tooth16Svg, tooth14OcclSvg, tooth16OcclSvg,
} from "../generated/teeth-svgs";
import {
  icon8Svg, iconGumSvg, iconOcclSvg, iconPulpSvg, iconNoSelectionUrl,
} from "../generated/icon-svgs";

const here = dirname(fileURLToPath(import.meta.url));
const teeth = (f: string) => readFileSync(resolve(here, "../assets/teeth-svgs", f), "utf8");
const icons = (f: string) => readFileSync(resolve(here, "../assets/icon-svgs", f), "utf8");

describe("generated SVG asset modules", () => {
  it("teeth markup is byte-identical to the .svg sources", () => {
    expect(tooth11Svg).toBe(teeth("11.svg"));
    expect(tooth13Svg).toBe(teeth("13.svg"));
    expect(tooth14Svg).toBe(teeth("14.svg"));
    expect(tooth16Svg).toBe(teeth("16.svg"));
    expect(tooth14OcclSvg).toBe(teeth("14_occl.svg"));
    expect(tooth16OcclSvg).toBe(teeth("16_occl.svg"));
  });
  it("icon markup is byte-identical to the .svg sources", () => {
    expect(icon8Svg).toBe(icons("icon_8.svg"));
    expect(iconGumSvg).toBe(icons("icon_gum.svg"));
    expect(iconOcclSvg).toBe(icons("icon_occl.svg"));
    expect(iconPulpSvg).toBe(icons("icon_pulp.svg"));
  });
  it("no-selection icon is a data URI of its source", () => {
    expect(iconNoSelectionUrl).toBe(
      "data:image/svg+xml," + encodeURIComponent(icons("icon_no_selection.svg")),
    );
  });
});
