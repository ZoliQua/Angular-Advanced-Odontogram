// Angular port of core/__tests__/pgb-mm-overlays.test.ts.
//
// The source's `drawArchOverlay` import from `../PerioChart` maps to this
// repo's `perio-grid-dom.ts` (same builder, re-hosted — see
// perio-grid-dom.spec.ts's header). The pure ramp helpers/geometry
// (`pdCalHeatBucket`/`recessionHeatBucket`/`perioMmHeatMarks`) and the
// template-driven arch builders (`buildBuccalArchSvg`/`buildPalatalArchSvg`)
// map to core `perioGraphic.ts`, unchanged. The switcher UI describe mounts
// PerioChartComponent inline, mirroring pgb-switcher/pgc-cairo's own precedent.
//
// Real SVG template cache built the same way perio-grid-dom.spec.ts does
// (readFileSync + DOMParser) — no fetch stub needed (this repo's
// `loadTemplateCache()` never fetches).
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { PerioChartComponent } from "../perio-chart.component";
import { drawArchOverlay, hideInfoPopover } from "../perio-grid-dom";
import {
  __resetChartStateForTest,
  setNumberingSystem,
  setPerioSite,
  getPerioOverlayLayer,
  setPerioOverlayLayer,
} from "../../../core/odontogram";
import {
  buildBuccalArchSvg,
  buildPalatalArchSvg,
  pdCalHeatBucket,
  recessionHeatBucket,
  perioMmHeatMarks,
  type TemplateDocCache,
  type TemplateNo,
} from "../../../core/perioGraphic";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";

const testFileUrl = import.meta.url;
const svgText = (tplNo: TemplateNo) =>
  readFileSync(fileURLToPath(new URL(`../../../core/assets/teeth-svgs/${tplNo}.svg`, testFileUrl)), "utf8");
const TEMPLATE_NOS: readonly TemplateNo[] = [11, 13, 14, 16];
function buildCache(): TemplateDocCache {
  const cache: TemplateDocCache = new Map();
  for (const tplNo of TEMPLATE_NOS) {
    cache.set(tplNo, new DOMParser().parseFromString(svgText(tplNo), "image/svg+xml"));
  }
  return cache;
}

const UPPER_ARCH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];

@Component({
  imports: [PerioChartComponent],
  template: `<aao-perio-chart [inline]="true" />`,
})
class InlineHost {}

function openInline() {
  TestBed.configureTestingModule({
    imports: [InlineHost],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(InlineHost);
}

beforeEach(() => {
  __resetChartStateForTest();
  setPerioOverlayLayer("none");
  setNumberingSystem("FDI");
  setI18nLanguage("en");
});

afterEach(() => {
  hideInfoPopover();
  setPerioOverlayLayer("none");
});

// ---------------------------------------------------------------------------
// Pure ramp helpers (perioGraphic.ts): known mm values map to expected
// severity buckets. Unit-testable in complete isolation from any DOM/state.
// ---------------------------------------------------------------------------
describe("PG-B Task 3: pdCalHeatBucket (pure ramp)", () => {
  it("maps known values to shallow/moderate/deep", () => {
    expect(pdCalHeatBucket(1)).toBe("shallow");
    expect(pdCalHeatBucket(3)).toBe("shallow");
    expect(pdCalHeatBucket(4)).toBe("moderate");
    expect(pdCalHeatBucket(5)).toBe("moderate");
    expect(pdCalHeatBucket(6)).toBe("deep");
    expect(pdCalHeatBucket(12)).toBe("deep");
  });
});

describe("PG-B Task 3: recessionHeatBucket (pure ramp)", () => {
  it("maps known values to shallow/moderate/deep on a shallower scale", () => {
    expect(recessionHeatBucket(1)).toBe("shallow");
    expect(recessionHeatBucket(2)).toBe("moderate");
    expect(recessionHeatBucket(3)).toBe("moderate");
    expect(recessionHeatBucket(4)).toBe("deep");
    expect(recessionHeatBucket(8)).toBe("deep");
  });
});

// ---------------------------------------------------------------------------
// Pure geometry (perioGraphic.ts): perioMmHeatMarks — reuses the exact same
// cejY/mmPx coordinate math the curve + T2 discrete overlays use.
// ---------------------------------------------------------------------------
describe("PG-B Task 3: perioMmHeatMarks (pure geometry)", () => {
  const MM = 3;
  const cejY = 40;
  const opts = { cejY, mmPx: MM };

  it("PD heat-colours every charted site by probing depth, at the pocket base", () => {
    const marks = perioMmHeatMarks(
      "pd",
      [
        { x: 0, pd: 2, gm: 0 }, // shallow
        { x: 10, pd: 5, gm: 0 }, // moderate
        { x: 20, pd: 7, gm: 1 }, // deep
        { x: 30 }, // uncharted -> no mark
      ],
      opts,
    );
    expect(marks.map((m) => m.kind)).toEqual(["heat-shallow", "heat-moderate", "heat-deep"]);
    expect(marks.map((m) => m.x)).toEqual([0, 10, 20]);
    // pocket base of the pd7/gm1 site: cejY + (1 + 7) * mm
    expect(marks[2].y).toBe(cejY + (1 + 7) * MM);
  });

  it("CAL heat-colours by pd+gm (matching getToothCal's formula), preferring an attached `cal` value", () => {
    const marks = perioMmHeatMarks(
      "cal",
      [
        { x: 0, pd: 2, gm: 1, cal: 3 }, // shallow (3)
        { x: 10, pd: 4, gm: 2 }, // no explicit cal -> falls back to pd+gm = 6 -> deep
      ],
      opts,
    );
    expect(marks.map((m) => m.kind)).toEqual(["heat-shallow", "heat-deep"]);
  });

  it("GR only highlights sites with recession (gm>0), scaled by depth, at the gingival margin", () => {
    const marks = perioMmHeatMarks(
      "gr",
      [
        { x: 0, pd: 3, gm: 1 }, // recession, shallow
        { x: 10, pd: 3, gm: 0 }, // no recession -> excluded
        { x: 20, pd: 3, gm: -2 }, // pseudopocket, not recession -> excluded
        { x: 30, pd: 3, gm: 5 }, // recession, deep
        { x: 40 }, // uncharted -> excluded
      ],
      opts,
    );
    expect(marks.map((m) => m.x)).toEqual([0, 30]);
    expect(marks.map((m) => m.kind)).toEqual(["heat-shallow", "heat-deep"]);
    // gingival margin, not the pocket base: cejY + gm*mm
    expect(marks[0].y).toBe(cejY + 1 * MM);
    expect(marks[1].y).toBe(cejY + 5 * MM);
  });
});

// ---------------------------------------------------------------------------
// Integration: drawArchOverlay renders the heat overlay into the SAME
// oriented row groups the teeth/curve ride, reusing archToothLayout +
// PERIO_MM_PX (aligned across both arches).
// ---------------------------------------------------------------------------
describe("PG-B Task 3: drawArchOverlay integration (real templates)", () => {
  const cache = buildCache();

  function mountArch(): HTMLDivElement {
    const container = document.createElement("div");
    container.appendChild(buildBuccalArchSvg(cache, UPPER_ARCH));
    container.appendChild(buildPalatalArchSvg(cache, UPPER_ARCH));
    return container;
  }

  it("PD renders a heat mark per charted site, into the buccal/palatal oriented groups, aria-hidden", () => {
    const container = mountArch();
    setPerioSite(16, "MB", { pd: 2 }); // shallow, buccal aspect
    setPerioSite(16, "B", { pd: 5 }); // moderate, buccal aspect
    setPerioSite(16, "ML", { pd: 7 }); // deep, lingual aspect

    drawArchOverlay(cache, container, UPPER_ARCH, "pd");

    const buccalGroup = container.querySelector(".perio-tooth-row-buccal")!;
    const palatalGroup = container.querySelector(".perio-tooth-row-palatal-inner")!;
    const buccalOverlay = buccalGroup.querySelector(".perio-overlay-layer")!;
    const palatalOverlay = palatalGroup.querySelector(".perio-overlay-layer")!;
    expect(buccalOverlay).toBeTruthy();
    expect(buccalOverlay.getAttribute("aria-hidden")).toBe("true");
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-pd");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-shallow").length).toBe(1);
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-moderate").length).toBe(1);
    expect(palatalOverlay.querySelectorAll(".perio-overlay-heat-deep").length).toBe(1);
  });

  it("CAL heat-colours by pd+gm", () => {
    const container = mountArch();
    setPerioSite(16, "MB", { pd: 2, gm: 4 }); // cal 6 -> deep

    drawArchOverlay(cache, container, UPPER_ARCH, "cal");
    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-cal");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-deep").length).toBe(1);
  });

  it("GR only highlights recession sites (gm>0); a charted site with gm<=0 draws no mark", () => {
    const container = mountArch();
    setPerioSite(16, "MB", { pd: 3, gm: 2 }); // recession -> marked
    setPerioSite(16, "B", { pd: 3, gm: 0 }); // no recession -> not marked
    setPerioSite(16, "DB", { pd: 3 }); // gm defaults to 0 -> not marked

    drawArchOverlay(cache, container, UPPER_ARCH, "gr");
    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-gr");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-mark").length).toBe(1);
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-moderate").length).toBe(1);
  });

  it("switching to None clears a previously-drawn heat overlay", () => {
    const container = mountArch();
    setPerioSite(16, "MB", { pd: 6 });
    drawArchOverlay(cache, container, UPPER_ARCH, "pd");
    expect(container.querySelector(".perio-overlay-layer")).toBeTruthy();

    drawArchOverlay(cache, container, UPPER_ARCH, "none");
    expect(container.querySelector(".perio-overlay-layer")).toBeNull();
  });

  it("switching from pd to cal clears the stale pd overlay", () => {
    const container = mountArch();
    setPerioSite(16, "MB", { pd: 6 });
    drawArchOverlay(cache, container, UPPER_ARCH, "pd");
    expect(container.querySelectorAll(".perio-overlay-layer").length).toBe(2); // buccal + palatal

    drawArchOverlay(cache, container, UPPER_ARCH, "cal");
    const overlays = container.querySelectorAll(".perio-overlay-layer");
    expect(overlays.length).toBe(2);
    overlays.forEach((el) => expect(el.getAttribute("class")).toContain("perio-overlay-cal"));
  });
});

// ---------------------------------------------------------------------------
// Switcher UI (PerioChart inline): pd/cal/gr are now active buttons in
// #perioOverlaySwitch (no longer T2 no-op stubs).
// ---------------------------------------------------------------------------
describe("PG-B Task 3: #perioOverlaySwitch offers PD/CAL/GR", () => {
  it("renders a button for pd/cal/gr alongside the T2 discrete layers", async () => {
    const f = openInline();
    await f.whenStable();
    const sw = document.getElementById("perioOverlaySwitch")!;
    for (const layer of ["none", "pd", "cal", "gr", "bop", "plaque", "pd5", "pd6"]) {
      const btn = sw.querySelector(`[data-overlay-layer="${layer}"]`);
      expect(btn, layer).toBeTruthy();
      // .trim(): the Angular template's `@for`/interpolation whitespace
      // formatting leaves surrounding text nodes the React JSX didn't have;
      // substance (the resolved label) is unchanged.
      expect(btn!.textContent!.trim()).toBe(t(`perio.overlay.${layer}`));
    }
  });

  it("clicking PD selects it (getPerioOverlayLayer + active state)", async () => {
    const f = openInline();
    await f.whenStable();
    const pdBtn = document.querySelector('[data-overlay-layer="pd"]') as HTMLButtonElement;
    pdBtn.click();
    await f.whenStable();
    expect(getPerioOverlayLayer()).toBe("pd");
    expect(pdBtn.getAttribute("aria-checked")).toBe("true");
  });

  it("clicking CAL then GR switches the active selection cleanly", async () => {
    const f = openInline();
    await f.whenStable();
    const calBtn = document.querySelector('[data-overlay-layer="cal"]') as HTMLButtonElement;
    calBtn.click();
    await f.whenStable();
    expect(getPerioOverlayLayer()).toBe("cal");

    const grBtn = document.querySelector('[data-overlay-layer="gr"]') as HTMLButtonElement;
    grBtn.click();
    await f.whenStable();
    expect(getPerioOverlayLayer()).toBe("gr");
    expect(grBtn.getAttribute("aria-checked")).toBe("true");
    expect(calBtn.getAttribute("aria-checked")).toBe("false");
  });

  it("selecting None after PD clears the active selection", async () => {
    const f = openInline();
    await f.whenStable();
    const pdBtn = document.querySelector('[data-overlay-layer="pd"]') as HTMLButtonElement;
    pdBtn.click();
    await f.whenStable();
    expect(getPerioOverlayLayer()).toBe("pd");

    const noneBtn = document.querySelector('[data-overlay-layer="none"]') as HTMLButtonElement;
    noneBtn.click();
    await f.whenStable();
    expect(getPerioOverlayLayer()).toBe("none");
    expect(noneBtn.getAttribute("aria-checked")).toBe("true");
  });
});
