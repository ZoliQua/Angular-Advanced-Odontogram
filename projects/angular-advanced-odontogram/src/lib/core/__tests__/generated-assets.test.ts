// Angular-port addition: proves the generated asset modules carry the exact
// bytes of the source SVG files (the ?raw-import replacement, spec §5).
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  tooth11Svg, tooth13Svg, tooth14Svg, tooth16Svg, tooth14OcclSvg, tooth16OcclSvg,
} from "../generated/teeth-svgs";
// Phase 11 (Task 1): the measured artwork moved to its OWN generated module,
// kept out of the eager `teeth-svgs.ts` so it stays code-split behind
// `anatomy/measured.ts`'s dynamic-import boundary (see
// scripts/generate-svg-assets.mjs). This import is a normal static one —
// harmless here since this file is TEST-ONLY, never part of the shipped
// bundle graph.
import * as measuredModule from "../generated/teeth-svgs-measured";
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
    // Phase 12 (2.7.0): the measured set grew 13 -> 40 files (46.svg removed,
    // 46_occl.svg renamed 38_occl.svg), so every file in the directory is
    // checked against its generated export instead of a hand-kept list.
    const exportFor = (f: string) => {
      const [no, variant] = f.replace(/\.svg$/, "").split("_");
      return `measuredTooth${no}${variant ? variant[0].toUpperCase() + variant.slice(1) : ""}Svg`;
    };
    const files = readdirSync(resolve(here, "../assets/teeth-svgs/measured")).filter((f) => f.endsWith(".svg"));
    expect(files).toHaveLength(40);
    expect(files).not.toContain("46.svg");
    expect(files).not.toContain("46_occl.svg");
    expect(files).toContain("38_occl.svg");
    const exported = measuredModule as Record<string, string>;
    expect(Object.keys(exported).sort()).toEqual(files.map(exportFor).sort());
    for (const f of files) {
      expect(exported[exportFor(f)], f).toBe(measuredTeeth(f));
    }
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
