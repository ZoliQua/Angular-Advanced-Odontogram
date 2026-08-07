// Angular port of core/__tests__/pge-rows.test.ts.
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
  getPeriImplantPlaque,
  setPeriImplantPlaque,
  getPeriImplantBleeding,
  setPeriImplantBleeding,
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

describe("PG-E Task 2: row labels render", () => {
  it("both mPI and mBI rows are labeled (both arches, inline chrome)", async () => {
    // UI-3b Task 3: mPI/mBI additionally gate per-arch on that arch having an
    // implant (see ui3b-mpi-implant-gate.spec.ts) — set one in EACH arch so
    // both rows render in both arches.
    __setToothStateForTest(16, { toothSelection: "implant" }); // upper
    __setToothStateForTest(46, { toothSelection: "implant" }); // lower
    const f = openInline();
    await f.whenStable();
    const grid = document.getElementById("perioInlineGrid")!;
    const labels = Array.from(grid.querySelectorAll(".perio-fullgrid-row-label-text")).map((el) => el.textContent);
    for (const key of ["perio.mpi.row", "perio.mbi.row"]) {
      const text = t(key);
      expect(labels.filter((l) => l === text).length).toBe(2); // upper + lower arch
    }
  });

  it("both rows exist in the modal overlay chrome too, for an implant tooth", async () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    const f = openOverlay();
    await f.whenStable();
    const root = document.getElementById("perioOverlayGrid")!;
    expect(root.querySelector("#perio-fg-mpi-16-buccal")).toBeTruthy();
    expect(root.querySelector("#perio-fg-mbi-16-buccal")).toBeTruthy();
  });
});

describe("PG-E Task 2: implant gate — active on an implant tooth, inert on a natural tooth", () => {
  it("an IMPLANT tooth's mPI/mBI cells are ENABLED", async () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    const f = openOverlay();
    await f.whenStable();
    const mpiBtn = document.getElementById("perio-fg-mpi-21-buccal") as HTMLButtonElement;
    const mbiBtn = document.getElementById("perio-fg-mbi-21-buccal") as HTMLButtonElement;
    expect(mpiBtn.disabled).toBe(false);
    expect(mbiBtn.disabled).toBe(false);
  });

  it("a NATURAL (present, default) tooth's mPI/mBI cells are DISABLED", async () => {
    // Tooth 16 is never touched -> defaults to a present natural tooth.
    // UI-3b Task 3: mPI/mBI rows only render in an arch with an implant, so
    // give the (same, upper) arch an implant elsewhere (17) to make the row
    // exist while keeping 16 itself natural/inert.
    __setToothStateForTest(17, { toothSelection: "implant" });
    const f = openOverlay();
    await f.whenStable();
    const mpiBtn = document.getElementById("perio-fg-mpi-16-buccal") as HTMLButtonElement;
    const mbiBtn = document.getElementById("perio-fg-mbi-16-buccal") as HTMLButtonElement;
    expect(mpiBtn.disabled).toBe(true);
    expect(mbiBtn.disabled).toBe(true);
  });

  it("a MISSING tooth's mPI/mBI cells are also DISABLED", async () => {
    __setToothStateForTest(21, { toothSelection: "none" });
    // UI-3b Task 3: mPI/mBI rows only render in an arch with an implant, so
    // give the (same, upper) arch an implant elsewhere (16) to make the row
    // exist while keeping 21 itself missing/inert.
    __setToothStateForTest(16, { toothSelection: "implant" });
    const f = openOverlay();
    await f.whenStable();
    const mpiBtn = document.getElementById("perio-fg-mpi-21-buccal") as HTMLButtonElement;
    expect(mpiBtn.disabled).toBe(true);
  });
});

describe("PG-E Task 2: mPI row (Mombelli modified Plaque Index, per-surface graded)", () => {
  it("clicking a surface button on an IMPLANT tooth cycles 0 -> 1 -> 2 -> 3 -> 0, via setPeriImplantPlaque", async () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-mpi-21-buccal") as HTMLButtonElement;
    expect(getPeriImplantPlaque(21, "buccal")).toBe(0);
    btn.click();
    expect(getPeriImplantPlaque(21, "buccal")).toBe(1);
    btn.click();
    expect(getPeriImplantPlaque(21, "buccal")).toBe(2);
    btn.click();
    expect(getPeriImplantPlaque(21, "buccal")).toBe(3);
    btn.click();
    expect(getPeriImplantPlaque(21, "buccal")).toBe(0);
  });

  it("each of the 4 O'Leary surfaces has its own independent button", async () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    const f = openOverlay();
    await f.whenStable();
    for (const surface of ["mesial", "distal", "buccal", "lingual"]) {
      expect(document.getElementById(`perio-fg-mpi-21-${surface}`)).toBeTruthy();
    }
    (document.getElementById("perio-fg-mpi-21-mesial") as HTMLButtonElement).click();
    expect(getPeriImplantPlaque(21, "mesial")).toBe(1);
    expect(getPeriImplantPlaque(21, "distal")).toBe(0);
  });
});

describe("PG-E Task 2: mBI row (Mombelli modified sulcus Bleeding Index, per-surface graded)", () => {
  it("clicking a surface button on an IMPLANT tooth cycles 0 -> 1 -> 2 -> 3 -> 0, via setPeriImplantBleeding", async () => {
    __setToothStateForTest(26, { toothSelection: "implant" });
    const f = openOverlay();
    await f.whenStable();
    const btn = document.getElementById("perio-fg-mbi-26-mesial") as HTMLButtonElement;
    expect(getPeriImplantBleeding(26, "mesial")).toBe(0);
    btn.click();
    expect(getPeriImplantBleeding(26, "mesial")).toBe(1);
    btn.click();
    btn.click();
    expect(getPeriImplantBleeding(26, "mesial")).toBe(3);
    btn.click();
    expect(getPeriImplantBleeding(26, "mesial")).toBe(0);
  });
});

describe("PG-E Task 2: info buttons open the right popover", () => {
  const cases: Array<{ rowKey: string; infoKey: string }> = [
    { rowKey: "perio.mpi.row", infoKey: "perio.info.mpi" },
    { rowKey: "perio.mbi.row", infoKey: "perio.info.mbi" },
  ];
  for (const { rowKey, infoKey } of cases) {
    it(`${rowKey}'s info button opens a popover with t("${infoKey}")`, async () => {
      // UI-3b Task 3: mPI/mBI rows only render in an arch with an implant.
      __setToothStateForTest(16, { toothSelection: "implant" });
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
// Index switcher + overlays: mpi/mbi select + draw without throwing.
// ---------------------------------------------------------------------------
describe("PG-E Task 2: #perioOverlaySwitch offers mPI/mBI", () => {
  it("renders a button for mpi/mbi alongside the existing layers", async () => {
    const f = openInline();
    await f.whenStable();
    const sw = document.getElementById("perioOverlaySwitch")!;
    for (const layer of ["mpi", "mbi"]) {
      const btn = sw.querySelector(`[data-overlay-layer="${layer}"]`);
      expect(btn, layer).toBeTruthy();
      expect(btn!.textContent!.trim()).toBe(t(`perio.overlay.${layer}`));
    }
  });

  it("clicking mPI selects it (getPerioOverlayLayer + active state)", async () => {
    const f = openInline();
    await f.whenStable();
    const btn = document.querySelector('[data-overlay-layer="mpi"]') as HTMLButtonElement;
    btn.click();
    await f.whenStable();
    expect(getPerioOverlayLayer()).toBe("mpi");
    expect(btn.getAttribute("aria-checked")).toBe("true");
  });

  it("clicking mBI then None switches the active selection cleanly", async () => {
    const f = openInline();
    await f.whenStable();
    const mbiBtn = document.querySelector('[data-overlay-layer="mbi"]') as HTMLButtonElement;
    mbiBtn.click();
    await f.whenStable();
    expect(getPerioOverlayLayer()).toBe("mbi");
    expect(mbiBtn.getAttribute("aria-checked")).toBe("true");

    const noneBtn = document.querySelector('[data-overlay-layer="none"]') as HTMLButtonElement;
    noneBtn.click();
    await f.whenStable();
    expect(getPerioOverlayLayer()).toBe("none");
    expect(mbiBtn.getAttribute("aria-checked")).toBe("false");
  });
});

describe("PG-E Task 2: drawArchOverlay integration (real templates)", () => {
  const cache = buildCache();

  function mountArch(): HTMLDivElement {
    const container = document.createElement("div");
    container.appendChild(buildBuccalArchSvg(cache, UPPER_ARCH));
    container.appendChild(buildPalatalArchSvg(cache, UPPER_ARCH));
    return container;
  }

  it("mPI heat-colours every charted surface on an implant tooth, split across buccal/palatal rows, aria-hidden", () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    const container = mountArch();
    setPeriImplantPlaque(16, "buccal", 1);
    setPeriImplantPlaque(16, "mesial", 2);
    setPeriImplantPlaque(16, "lingual", 3);

    expect(() => drawArchOverlay(cache, container, UPPER_ARCH, "mpi")).not.toThrow();

    const buccalGroup = container.querySelector(".perio-tooth-row-buccal")!;
    const palatalGroup = container.querySelector(".perio-tooth-row-palatal-inner")!;
    const buccalOverlay = buccalGroup.querySelector(".perio-overlay-layer")!;
    const palatalOverlay = palatalGroup.querySelector(".perio-overlay-layer")!;
    expect(buccalOverlay).toBeTruthy();
    expect(buccalOverlay.getAttribute("aria-hidden")).toBe("true");
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-mpi");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-shallow").length).toBe(1);
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-moderate").length).toBe(1);
    expect(palatalOverlay.querySelectorAll(".perio-overlay-heat-deep").length).toBe(1);
  });

  it("mBI heat-colours the charted surfaces the same way", () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    const container = mountArch();
    setPeriImplantBleeding(16, "distal", 3);

    expect(() => drawArchOverlay(cache, container, UPPER_ARCH, "mbi")).not.toThrow();
    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-mbi");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-deep").length).toBe(1);
  });

  it("a non-implant tooth produces no mark (mpi/mbi are implant-only data)", () => {
    // Tooth 16 stays a default (natural) tooth here — setPeriImplantPlaque is
    // a data-layer no-op on it, so nothing is ever charted to draw.
    const container = mountArch();
    setPeriImplantPlaque(16, "buccal", 2);
    expect(getPeriImplantPlaque(16, "buccal")).toBe(0); // confirms the no-op
    drawArchOverlay(cache, container, UPPER_ARCH, "mpi");
    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.querySelectorAll(".perio-overlay-mark").length).toBe(0);
  });

  it("switching to None clears a previously-drawn mpi/mbi overlay", () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    const container = mountArch();
    setPeriImplantPlaque(16, "buccal", 2);
    drawArchOverlay(cache, container, UPPER_ARCH, "mpi");
    expect(container.querySelector(".perio-overlay-layer")).toBeTruthy();

    drawArchOverlay(cache, container, UPPER_ARCH, "none");
    expect(container.querySelector(".perio-overlay-layer")).toBeNull();
  });
});

describe("PG-E Task 2: overlay read-out consolidation", () => {
  it("selecting mpi/mbi shows the whole-mouth score read-out (stopgap '—' until Task 3)", async () => {
    const f = openInline();
    await f.whenStable();
    const mpiBtn = document.querySelector('[data-overlay-layer="mpi"]') as HTMLButtonElement;
    mpiBtn.click();
    await f.whenStable();
    const readout = document.getElementById("perioOverlayReadout");
    expect(readout).toBeTruthy();
    expect(readout!.textContent).toBe(`${t("perio.overlay.mpi")} —`);

    const mbiBtn = document.querySelector('[data-overlay-layer="mbi"]') as HTMLButtonElement;
    mbiBtn.click();
    await f.whenStable();
    expect(document.getElementById("perioOverlayReadout")!.textContent).toBe(`${t("perio.overlay.mbi")} —`);
  });

  it("selecting pi/gi/kg also shows a read-out now (closes the PG-D gap)", async () => {
    const f = openInline();
    await f.whenStable();
    const piBtn = document.querySelector('[data-overlay-layer="pi"]') as HTMLButtonElement;
    piBtn.click();
    await f.whenStable();
    expect(document.getElementById("perioOverlayReadout")).toBeTruthy();

    const kgBtn = document.querySelector('[data-overlay-layer="kg"]') as HTMLButtonElement;
    kgBtn.click();
    await f.whenStable();
    const readout = document.getElementById("perioOverlayReadout")!;
    expect(readout.textContent).toBe(`${t("perio.overlay.kg")} 0`);
  });
});
