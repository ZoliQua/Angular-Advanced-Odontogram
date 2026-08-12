// Angular-port addition: proves the generated asset modules carry the exact
// bytes of the source SVG files (the ?raw-import replacement, spec §5).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  tooth11Svg, tooth13Svg, tooth14Svg, tooth16Svg, tooth14OcclSvg, tooth16OcclSvg,
  measuredTooth11Svg, measuredTooth12Svg, measuredTooth13Svg, measuredTooth14Svg,
  measuredTooth15Svg, measuredTooth16Svg, measuredTooth17Svg, measuredTooth31Svg,
  measuredTooth46Svg, measuredTooth14OcclSvg, measuredTooth34OcclSvg,
  measuredTooth16OcclSvg, measuredTooth46OcclSvg,
} from "../generated/teeth-svgs";
import {
  icon8Svg, iconGumSvg, iconOcclSvg, iconPulpSvg, iconNoSelectionUrl, brandLogoUrl,
} from "../generated/icon-svgs";

const here = dirname(fileURLToPath(import.meta.url));
const teeth = (f: string) => readFileSync(resolve(here, "../assets/teeth-svgs", f), "utf8");
const measuredTeeth = (f: string) => readFileSync(resolve(here, "../assets/teeth-svgs/measured", f), "utf8");
const icons = (f: string) => readFileSync(resolve(here, "../assets/icon-svgs", f), "utf8");
// Phase 7 (Task 1): the brand logo data URI source moved from the copied
// engine asset (assets/react-module-logo.png) to the repo-root docs/ logo
// (owner directive) — see scripts/generate-svg-assets.mjs.
const logoBase64 = () => readFileSync(resolve(here, "../../../../../../docs/angular-module-logo.png")).toString("base64");

describe("generated SVG asset modules", () => {
  it("teeth markup is byte-identical to the .svg sources", () => {
    expect(tooth11Svg).toBe(teeth("11.svg"));
    expect(tooth13Svg).toBe(teeth("13.svg"));
    expect(tooth14Svg).toBe(teeth("14.svg"));
    expect(tooth16Svg).toBe(teeth("16.svg"));
    expect(tooth14OcclSvg).toBe(teeth("14_occl.svg"));
    expect(tooth16OcclSvg).toBe(teeth("16_occl.svg"));
  });
  it("measured (candidate-anatomy) teeth markup is byte-identical to the .svg sources", () => {
    expect(measuredTooth11Svg).toBe(measuredTeeth("11.svg"));
    expect(measuredTooth12Svg).toBe(measuredTeeth("12.svg"));
    expect(measuredTooth13Svg).toBe(measuredTeeth("13.svg"));
    expect(measuredTooth14Svg).toBe(measuredTeeth("14.svg"));
    expect(measuredTooth15Svg).toBe(measuredTeeth("15.svg"));
    expect(measuredTooth16Svg).toBe(measuredTeeth("16.svg"));
    expect(measuredTooth17Svg).toBe(measuredTeeth("17.svg"));
    expect(measuredTooth31Svg).toBe(measuredTeeth("31.svg"));
    expect(measuredTooth46Svg).toBe(measuredTeeth("46.svg"));
    expect(measuredTooth14OcclSvg).toBe(measuredTeeth("14_occl.svg"));
    expect(measuredTooth34OcclSvg).toBe(measuredTeeth("34_occl.svg"));
    expect(measuredTooth16OcclSvg).toBe(measuredTeeth("16_occl.svg"));
    expect(measuredTooth46OcclSvg).toBe(measuredTeeth("46_occl.svg"));
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
  // Phase 7 (Task 1): the brand logo source is docs/angular-module-logo.png
  // (repo root) — a shell-only asset with no ?raw/text-import analog. It's a
  // PNG, so it's base64-encoded into a data: URI, same generated-module path
  // as the other assets above (see scripts/generate-svg-assets.mjs).
  it("brand logo is a base64 data URI of its source PNG", () => {
    expect(brandLogoUrl).toBe("data:image/png;base64," + logoBase64());
  });
});
