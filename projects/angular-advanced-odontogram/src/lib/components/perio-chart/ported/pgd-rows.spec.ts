// Angular port of core/__tests__/pgd-rows.test.ts.
//
// Same mount route as the sibling ported files in this directory (see
// ../perio-p2-grid.spec.ts's header comment for the full rationale). The
// source's `drawArchOverlay` import from `../PerioChart` maps to this
// repo's `perio-grid-dom.ts` — see pgb-mm-overlays.spec.ts's header for the
// same mapping rationale.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { PerioChartComponent } from "../perio-chart.component";
import { drawArchOverlay, hideInfoPopover } from "../perio-grid-dom";
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  setNumberingSystem,
  getPlaqueIndex,
  setPlaqueIndex,
  getGingivalIndex,
  setGingivalIndex,
  getKeratinizedWidth,
  setKeratinizedWidth,
  getGingivalThickness,
  getMillerClass,
  getPerioOverlayLayer,
  setPerioOverlayLayer,
} from "../../../core/odontogram";
import {
  buildBuccalArchSvg,
  buildPalatalArchSvg,
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
  template: `<aao-perio-chart [open]="true" (closeChart)="closed = true" />`,
})
class OverlayHost {
  closed = false;
}
@Component({
  imports: [PerioChartComponent],
  template: `<aao-perio-chart [inline]="true" />`,
})
class InlineHost {}

function openOverlay() {
  TestBed.configureTestingModule({
    imports: [OverlayHost],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(OverlayHost);
}
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

describe("PG-D Task 4: row labels render", () => {
  it("all five rows are labeled (both arches, inline chrome)", async () => {
    const f = openInline();
    await f.whenStable();
    const grid = document.getElementById("perioInlineGrid")!;
    const labels = Array.from(grid.querySelectorAll(".perio-fullgrid-row-label-text")).map((el) => el.textContent);
    for (const key of ["perio.pi.row", "perio.gi.row", "perio.kg.row", "perio.gt.row", "perio.miller.row"]) {
      const text = t(key);
      expect(labels.filter((l) => l === text).length).toBe(2); // upper + lower arch
    }
  });

  it("all five rows exist in the modal overlay chrome too", async () => {
    const f = openOverlay();
    await f.whenStable();
    const root = document.getElementById("perioOverlayGrid")!;
    expect(root.querySelector("#perio-fg-pi-16-buccal")).toBeTruthy();
    expect(root.querySelector("#perio-fg-gi-16-buccal")).toBeTruthy();
    expect(root.querySelector("#perio-fg-kg-16")).toBeTruthy();
    expect(root.querySelector("#perio-fg-gt-16")).toBeTruthy();
    expect(root.querySelector("#perio-fg-miller-16")).toBeTruthy();
  });
});

describe("PG-D Task 4: PI row (Silness-Löe Plaque Index, per-surface graded)", () => {
  it("clicking a surface button cycles 0 -> 1 -> 2 -> 3 -> 0, via setPlaqueIndex", async () => {
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-pi-16-buccal") as HTMLButtonElement;
    expect(getPlaqueIndex(16, "buccal")).toBe(0);
    btn.click();
    expect(getPlaqueIndex(16, "buccal")).toBe(1);
    btn.click();
    expect(getPlaqueIndex(16, "buccal")).toBe(2);
    btn.click();
    expect(getPlaqueIndex(16, "buccal")).toBe(3);
    btn.click();
    expect(getPlaqueIndex(16, "buccal")).toBe(0);
  });

  it("each of the 4 O'Leary surfaces has its own independent button", async () => {
    const f = openOverlay();
    await f.whenStable();
    for (const surface of ["mesial", "distal", "buccal", "lingual"]) {
      expect(document.getElementById(`perio-fg-pi-16-${surface}`)).toBeTruthy();
    }
    (document.getElementById("perio-fg-pi-16-mesial") as HTMLButtonElement).click();
    expect(getPlaqueIndex(16, "mesial")).toBe(1);
    expect(getPlaqueIndex(16, "distal")).toBe(0);
  });

  it("a MISSING tooth's PI buttons are disabled", async () => {
    __setToothStateForTest(21, { toothSelection: "none" });
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-pi-21-buccal") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("an IMPLANT tooth's PI buttons are disabled", async () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-pi-21-buccal") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("PG-D Task 4: GI row (Löe-Silness Gingival Index, per-surface graded)", () => {
  it("clicking a surface button cycles 0 -> 1 -> 2 -> 3 -> 0, via setGingivalIndex", async () => {
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-gi-26-mesial") as HTMLButtonElement;
    expect(getGingivalIndex(26, "mesial")).toBe(0);
    btn.click();
    expect(getGingivalIndex(26, "mesial")).toBe(1);
    btn.click();
    btn.click();
    expect(getGingivalIndex(26, "mesial")).toBe(3);
    btn.click();
    expect(getGingivalIndex(26, "mesial")).toBe(0);
  });
});

describe("PG-D Task 4: KG row (keratinized gingiva width, per-tooth mm)", () => {
  it("a present natural tooth (16) has a KG mm cell", async () => {
    const f = openOverlay();
    await f.whenStable();
    expect(document.getElementById("perio-fg-kg-16")).toBeTruthy();
  });

  it("typing a value + change commits it via setKeratinizedWidth", async () => {
    const f = openOverlay();
    await f.whenStable();
    const input = document.getElementById("perio-fg-kg-16") as HTMLInputElement;
    input.value = "4";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getKeratinizedWidth(16)).toBe(4);
  });

  it("an empty value clears it (null)", async () => {
    const f = openOverlay();
    await f.whenStable();
    const input = document.getElementById("perio-fg-kg-16") as HTMLInputElement;
    input.value = "4";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getKeratinizedWidth(16)).toBe(4);
    input.value = "";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getKeratinizedWidth(16)).toBeNull();
  });

  it("a MISSING tooth's KG cell is disabled", async () => {
    __setToothStateForTest(21, { toothSelection: "none" });
    const f = openOverlay();
    await f.whenStable();
    const input = document.getElementById("perio-fg-kg-21") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});

describe("PG-D Task 4: GT row (gingival thickness)", () => {
  it("clicking cycles unknown -> thin -> medium -> thick -> unknown, via setGingivalThickness", async () => {
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-gt-16") as HTMLButtonElement;
    expect(getGingivalThickness(16)).toBe("unknown");
    btn.click();
    expect(getGingivalThickness(16)).toBe("thin");
    btn.click();
    expect(getGingivalThickness(16)).toBe("medium");
    btn.click();
    expect(getGingivalThickness(16)).toBe("thick");
    btn.click();
    expect(getGingivalThickness(16)).toBe("unknown");
  });

  it("an IMPLANT tooth's GT control is disabled", async () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-gt-21") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("PG-D Task 4: Miller-class row", () => {
  it("clicking cycles none -> i -> ii -> iii -> iv -> none, via setMillerClass", async () => {
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-miller-26") as HTMLButtonElement;
    expect(getMillerClass(26)).toBe("none");
    btn.click();
    expect(getMillerClass(26)).toBe("i");
    btn.click();
    expect(getMillerClass(26)).toBe("ii");
    btn.click();
    expect(getMillerClass(26)).toBe("iii");
    btn.click();
    expect(getMillerClass(26)).toBe("iv");
    btn.click();
    expect(getMillerClass(26)).toBe("none");
  });

  it("a MISSING tooth's Miller-class control is disabled", async () => {
    __setToothStateForTest(36, { toothSelection: "none" });
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-miller-36") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("PG-D Task 4: info buttons open the right popover", () => {
  const cases: Array<{ rowKey: string; infoKey: string }> = [
    { rowKey: "perio.pi.row", infoKey: "perio.info.pi" },
    { rowKey: "perio.gi.row", infoKey: "perio.info.gi" },
    { rowKey: "perio.kg.row", infoKey: "perio.info.kg" },
    { rowKey: "perio.gt.row", infoKey: "perio.info.gt" },
    { rowKey: "perio.miller.row", infoKey: "perio.info.miller" },
  ];
  for (const { rowKey, infoKey } of cases) {
    it(`${rowKey}'s info button opens a popover with t("${infoKey}")`, async () => {
      const f = openInline();
      await f.whenStable();
      const rowLabels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label"));
      const target = rowLabels.find((el) => el.textContent?.includes(t(rowKey)));
      const btn = target!.querySelector(".perio-info-btn") as HTMLButtonElement;
      expect(btn).toBeTruthy();
      btn.click();
      const popover = document.querySelector(".perio-info-popover");
      expect(popover).toBeTruthy();
      expect(popover!.textContent).toBe(t(infoKey));
    });
  }
});

// ---------------------------------------------------------------------------
// Index switcher + overlays: pi/gi/kg select + draw without throwing.
// ---------------------------------------------------------------------------
describe("PG-D Task 4: #perioOverlaySwitch offers PI/GI/KG", () => {
  it("renders a button for pi/gi/kg alongside the existing layers", async () => {
    const f = openInline();
    await f.whenStable();
    const sw = document.getElementById("perioOverlaySwitch")!;
    for (const layer of ["pi", "gi", "kg"]) {
      const btn = sw.querySelector(`[data-overlay-layer="${layer}"]`);
      expect(btn, layer).toBeTruthy();
      expect(btn!.textContent!.trim()).toBe(t(`perio.overlay.${layer}`));
    }
  });

  it("clicking PI selects it (getPerioOverlayLayer + active state)", async () => {
    const f = openInline();
    await f.whenStable();
    const btn = document.querySelector('[data-overlay-layer="pi"]') as HTMLButtonElement;
    btn.click();
    await f.whenStable();
    expect(getPerioOverlayLayer()).toBe("pi");
    expect(btn.getAttribute("aria-checked")).toBe("true");
  });

  it("clicking GI then KG switches the active selection cleanly", async () => {
    const f = openInline();
    await f.whenStable();
    const giBtn = document.querySelector('[data-overlay-layer="gi"]') as HTMLButtonElement;
    giBtn.click();
    await f.whenStable();
    expect(getPerioOverlayLayer()).toBe("gi");

    const kgBtn = document.querySelector('[data-overlay-layer="kg"]') as HTMLButtonElement;
    kgBtn.click();
    await f.whenStable();
    expect(getPerioOverlayLayer()).toBe("kg");
    expect(kgBtn.getAttribute("aria-checked")).toBe("true");
    expect(giBtn.getAttribute("aria-checked")).toBe("false");
  });
});

describe("PG-D Task 4: drawArchOverlay integration (real templates)", () => {
  const cache = buildCache();

  function mountArch(): HTMLDivElement {
    const container = document.createElement("div");
    container.appendChild(buildBuccalArchSvg(cache, UPPER_ARCH));
    container.appendChild(buildPalatalArchSvg(cache, UPPER_ARCH));
    return container;
  }

  it("PI heat-colours every charted surface, split across buccal/palatal rows, aria-hidden", () => {
    const container = mountArch();
    setPlaqueIndex(16, "buccal", 1); // shallow, buccal aspect
    setPlaqueIndex(16, "mesial", 2); // moderate, buccal aspect
    setPlaqueIndex(16, "lingual", 3); // deep, lingual/palatal aspect

    expect(() => drawArchOverlay(cache, container, UPPER_ARCH, "pi")).not.toThrow();

    const buccalGroup = container.querySelector(".perio-tooth-row-buccal")!;
    const palatalGroup = container.querySelector(".perio-tooth-row-palatal-inner")!;
    const buccalOverlay = buccalGroup.querySelector(".perio-overlay-layer")!;
    const palatalOverlay = palatalGroup.querySelector(".perio-overlay-layer")!;
    expect(buccalOverlay).toBeTruthy();
    expect(buccalOverlay.getAttribute("aria-hidden")).toBe("true");
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-pi");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-shallow").length).toBe(1);
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-moderate").length).toBe(1);
    expect(palatalOverlay.querySelectorAll(".perio-overlay-heat-deep").length).toBe(1);
  });

  it("GI heat-colours the charted surfaces the same way", () => {
    const container = mountArch();
    setGingivalIndex(16, "distal", 3);

    drawArchOverlay(cache, container, UPPER_ARCH, "gi");
    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-gi");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-deep").length).toBe(1);
  });

  it("a grade-0 (uncharted) surface produces no mark", () => {
    const container = mountArch();
    setPlaqueIndex(16, "buccal", 0);
    drawArchOverlay(cache, container, UPPER_ARCH, "pi");
    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.querySelectorAll(".perio-overlay-mark").length).toBe(0);
  });

  it("KG draws one heat mark for a charted tooth, buccal row only", () => {
    const container = mountArch();
    setKeratinizedWidth(16, 1); // thin -> deep bucket

    expect(() => drawArchOverlay(cache, container, UPPER_ARCH, "kg")).not.toThrow();
    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-kg");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-deep").length).toBe(1);
    // KG is buccal-only — no overlay layer is appended to the palatal row at all.
    const palatalGroup = container.querySelector(".perio-tooth-row-palatal-inner")!;
    expect(palatalGroup.querySelector(".perio-overlay-layer")).toBeNull();
  });

  it("switching to None clears a previously-drawn pi/gi/kg overlay", () => {
    const container = mountArch();
    setPlaqueIndex(16, "buccal", 2);
    drawArchOverlay(cache, container, UPPER_ARCH, "pi");
    expect(container.querySelector(".perio-overlay-layer")).toBeTruthy();

    drawArchOverlay(cache, container, UPPER_ARCH, "none");
    expect(container.querySelector(".perio-overlay-layer")).toBeNull();
  });
});
