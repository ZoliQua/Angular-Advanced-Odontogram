// TDD spec for perio-grid-dom.ts — Phase 4 Task 3.
//
// This module is framework-free (no Angular imports, no TestBed) — it is
// the SAME plain-DOM builder surface $ENGINE/src/PerioChart.tsx uses at
// module scope (TSX ~87-1517), just re-hosted under this repo's core. Specs
// below drive it directly against the real engine seams (`core/odontogram`)
// — no `vi.mock`, matching this repo's testing conventions.
//
// `toggleInfoPopover` appends `.perio-info-popover` to `document.body` — any
// test that opens one MUST close it afterward (`hideInfoPopover()`), per the
// task brief; the `afterEach` below does this unconditionally for every
// test in this file (safe no-op when nothing is open).
import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  mesialOnLeft,
  diamondGridArea,
  mkEl,
  mkRowLabelCell,
  syncToothCells,
  buildFieldCell,
  buildFurcationCell,
  buildPlaqueCell,
  buildCejVisibilityCell,
  buildRootConcavityCell,
  buildGradeCell,
  buildKgCell,
  buildGingivalThicknessCell,
  buildMillerClassCell,
  buildArch,
  applyArchColumns,
  collectCurveInput,
  drawArchCurves,
  collectOverlayInput,
  collectMmHeatInput,
  drawArchOverlay,
  overlaySwitchLabel,
  toggleInfoPopover,
  hideInfoPopover,
  type GridHandlers,
  type ToothCellRefs,
} from "./perio-grid-dom";
import {
  setPerioSite,
  getToothPerio,
  getToothCal,
  setPerioRowVisibility,
  setPlaque,
  __setToothStateForTest,
} from "../../core/odontogram";
import { indexName } from "../../core/perioIndexNames";
import { setI18nLanguage, t } from "../../core/i18n/useI18n";
import {
  archToothLayout,
  computeFillScale,
  buildBuccalArchSvg,
  buildPalatalArchSvg,
  TOOTH_GAP,
  type ArchLayout,
  type TemplateDocCache,
  type TemplateNo,
} from "../../core/perioGraphic";

// Real template-doc cache built from the actual tooth-base SVG assets — same
// technique `perio-graphic-toothrow.test.ts`/`pgb-mm-overlays.test.ts` use
// (readFileSync + DOMParser, no fetch/network). Needed for the `buildArch`/
// `applyArchColumns`/`drawArchOverlay` real-path (non-early-return) specs
// below — a Map-only fake cache never reaches `archToothLayout`'s real
// per-tooth layout math.
const testFileUrl = import.meta.url;
const svgText = (tplNo: TemplateNo) =>
  readFileSync(fileURLToPath(new URL(`../../core/assets/teeth-svgs/${tplNo}.svg`, testFileUrl)), "utf8");
const TEMPLATE_NOS: readonly TemplateNo[] = [11, 13, 14, 16];
function buildRealCache(): TemplateDocCache {
  const cache: TemplateDocCache = new Map();
  for (const tplNo of TEMPLATE_NOS) {
    cache.set(tplNo, new DOMParser().parseFromString(svgText(tplNo), "image/svg+xml"));
  }
  return cache;
}
// Mirrors perio-grid-dom.ts's own (private, not exported) ROW_LABEL_WIDTH —
// same technique `ui1-dynamic-scale.test.ts` uses for the same constant.
const ROW_LABEL_WIDTH = 220;
const GRID_SCROLLBAR_ALLOWANCE = 2;

afterEach(() => {
  hideInfoPopover();
});

function noopHandlers(): GridHandlers {
  return {
    onPd: () => {},
    onGm: () => {},
    onBop: () => {},
    onMobility: () => {},
    onFurcation: () => {},
    onPlaque: () => {},
    onCejVisibility: () => {},
    onRootConcavity: () => {},
    onPiSurface: () => {},
    onGiSurface: () => {},
    onKg: () => {},
    onGingivalThickness: () => {},
    onMillerClass: () => {},
    onMpiSurface: () => {},
    onMbiSurface: () => {},
  };
}

function spyHandlers(): { handlers: GridHandlers; calls: Record<string, unknown[][]> } {
  const calls: Record<string, unknown[][]> = {};
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      (calls[name] ??= []).push(args);
    };
  const handlers: GridHandlers = {
    onPd: record("onPd"),
    onGm: record("onGm"),
    onBop: record("onBop"),
    onMobility: record("onMobility"),
    onFurcation: record("onFurcation"),
    onPlaque: record("onPlaque"),
    onCejVisibility: record("onCejVisibility"),
    onRootConcavity: record("onRootConcavity"),
    onPiSurface: record("onPiSurface"),
    onGiSurface: record("onGiSurface"),
    onKg: record("onKg"),
    onGingivalThickness: record("onGingivalThickness"),
    onMillerClass: record("onMillerClass"),
    onMpiSurface: record("onMpiSurface"),
    onMbiSurface: record("onMbiSurface"),
  };
  return { handlers, calls };
}

describe("mesialOnLeft", () => {
  it("is true for quadrant-2 teeth (upper left)", () => {
    expect(mesialOnLeft(21)).toBe(true);
    expect(mesialOnLeft(28)).toBe(true);
  });
  it("is true for quadrant-3 teeth (lower left)", () => {
    expect(mesialOnLeft(31)).toBe(true);
    expect(mesialOnLeft(38)).toBe(true);
  });
  it("is false for quadrant-1 teeth (upper right)", () => {
    expect(mesialOnLeft(11)).toBe(false);
    expect(mesialOnLeft(18)).toBe(false);
  });
  it("is false for quadrant-4 teeth (lower right)", () => {
    expect(mesialOnLeft(41)).toBe(false);
    expect(mesialOnLeft(48)).toBe(false);
  });
});

describe("diamondGridArea", () => {
  it("maps buccal/lingual to fixed tips regardless of quadrant", () => {
    expect(diamondGridArea("buccal", 16)).toBe("buc");
    expect(diamondGridArea("buccal", 26)).toBe("buc");
    expect(diamondGridArea("lingual", 16)).toBe("lin");
    expect(diamondGridArea("lingual", 26)).toBe("lin");
  });
  it("swaps mesial/distal so mesial stays toward the midline (quadrant 1/4: mesial->dis area)", () => {
    // Quadrant 1 (16): mesialOnLeft === false -> mesial surface uses the
    // RIGHT ("dis") grid-area column, distal uses the LEFT ("mes") column.
    expect(diamondGridArea("mesial", 16)).toBe("dis");
    expect(diamondGridArea("distal", 16)).toBe("mes");
  });
  it("swaps mesial/distal so mesial stays toward the midline (quadrant 2/3: mesial->mes area)", () => {
    // Quadrant 2 (26): mesialOnLeft === true -> mesial surface uses the
    // LEFT ("mes") grid-area column, distal uses the RIGHT ("dis") column.
    expect(diamondGridArea("mesial", 26)).toBe("mes");
    expect(diamondGridArea("distal", 26)).toBe("dis");
  });
});

describe("mkEl", () => {
  it("creates a plain element, optionally with a className", () => {
    const div = mkEl("div", "foo bar");
    expect(div.tagName).toBe("DIV");
    expect(div.className).toBe("foo bar");
    const span = mkEl("span");
    expect(span.className).toBe("");
  });
});

describe("mkRowLabelCell", () => {
  it("renders the label text with no info button when infoKey is omitted", () => {
    const cell = mkRowLabelCell("Header");
    expect(cell.className).toBe("perio-fullgrid-row-label");
    const label = cell.querySelector(".perio-fullgrid-row-label-text");
    expect(label?.textContent).toBe("Header");
    expect(cell.querySelector(".perio-info-btn")).toBeNull();
  });

  it("renders the indexName()-driven label plus a real info button that opens/closes a popover on document.body", () => {
    setI18nLanguage("en");
    const label = indexName("pd");
    const cell = mkRowLabelCell(label, "perio.info.pd");
    document.body.appendChild(cell);
    const labelSpan = cell.querySelector(".perio-fullgrid-row-label-text");
    expect(labelSpan?.textContent).toBe(label);
    const btn = cell.querySelector<HTMLButtonElement>(".perio-info-btn");
    expect(btn).not.toBeNull();
    expect(btn!.getAttribute("aria-haspopup")).toBe("dialog");
    expect(btn!.getAttribute("aria-expanded")).toBe("false");

    btn!.click();
    expect(document.getElementById("perioInfoPopover")).not.toBeNull();
    expect(btn!.getAttribute("aria-expanded")).toBe("true");
    const popoverText = document.querySelector(".perio-info-popover-text");
    expect(popoverText?.textContent).toBe(t("perio.info.pd"));

    // Clicking the SAME button again closes it (toggleInfoPopover contract).
    btn!.click();
    expect(document.getElementById("perioInfoPopover")).toBeNull();
    expect(btn!.getAttribute("aria-expanded")).toBe("false");

    cell.remove();
  });
});

describe("toggleInfoPopover / hideInfoPopover", () => {
  it("opening a second popover closes the first (single active popover contract)", () => {
    const btnA = mkEl("button") as HTMLButtonElement;
    const btnB = mkEl("button") as HTMLButtonElement;
    document.body.appendChild(btnA);
    document.body.appendChild(btnB);

    toggleInfoPopover("perio.info.pd", btnA);
    expect(document.querySelectorAll(".perio-info-popover").length).toBe(1);
    expect(btnA.getAttribute("aria-expanded")).toBe("true");

    toggleInfoPopover("perio.info.gm", btnB);
    expect(document.querySelectorAll(".perio-info-popover").length).toBe(1);
    expect(btnA.getAttribute("aria-expanded")).toBe("false");
    expect(btnB.getAttribute("aria-expanded")).toBe("true");

    hideInfoPopover();
    expect(document.querySelectorAll(".perio-info-popover").length).toBe(0);
    expect(btnB.getAttribute("aria-expanded")).toBe("false");

    btnA.remove();
    btnB.remove();
  });

  it("hideInfoPopover is a safe no-op when nothing is open", () => {
    expect(() => hideInfoPopover()).not.toThrow();
  });
});

describe("buildArch", () => {
  it("honors getPerioRowVisibility(): hiding a row omits its label + cells from the built grid", () => {
    setPerioRowVisibility("furcation", false);
    const registry = new Map<number, ToothCellRefs>();
    const { grid } = buildArch([16, 17], registry, noopHandlers());
    expect(grid.querySelectorAll('[data-perio-field="furcation"]').length).toBe(0);
    expect(Array.from(grid.querySelectorAll(".perio-fullgrid-row-label-text")).some((el) => el.textContent === indexName("furcation"))).toBe(false);
  });

  it("renders a visible row's label + one cell per tooth, and registers every tooth", () => {
    const registry = new Map<number, ToothCellRefs>();
    const teeth = [16, 17, 18];
    const { grid } = buildArch(teeth, registry, noopHandlers());
    expect(registry.size).toBe(teeth.length);
    const pdCells = grid.querySelectorAll('[data-perio-field="pd"][data-perio-aspect="buccal"]');
    expect(pdCells.length).toBe(teeth.length);
    const label = Array.from(grid.querySelectorAll(".perio-fullgrid-row-label-text")).find(
      (el) => el.textContent === `${t("perio.buccal")} ${indexName("pd")}`,
    );
    expect(label).toBeDefined();
  });

  it("seeded PD/BOP data renders in the built cells and clicking a BOP checkbox invokes onBop with the right args", () => {
    setPerioSite(16, "MB", { pd: 4, bop: true });
    const perio = getToothPerio(16);
    expect(perio.pd.MB).toBe(4);
    expect(perio.bop).toContain("MB");

    const registry = new Map<number, ToothCellRefs>();
    const { handlers, calls } = spyHandlers();
    const { grid } = buildArch([16], registry, handlers);
    document.body.appendChild(grid);

    // Seed value is only reflected once syncToothCells runs (buildArch itself
    // wires empty inputs) — mirrors the TSX's own build-then-sync sequence.
    const cal = getToothCal(16);
    syncToothCells(registry.get(16)!, 16, perio, cal, false);

    const pdInput = document.getElementById("perio-fg-pd-16-MB") as HTMLInputElement;
    expect(pdInput.value).toBe("4");
    const bopInput = document.getElementById("perio-fg-bop-16-MB") as HTMLInputElement;
    expect(bopInput.checked).toBe(true);

    bopInput.checked = false;
    bopInput.dispatchEvent(new Event("change"));
    expect(calls.onBop).toEqual([[16, "MB", false]]);

    grid.remove();
  });

  it("renders the mPI/mBI rows only for an arch containing an implant tooth", () => {
    const registryNoImplant = new Map<number, ToothCellRefs>();
    const { grid: gridNoImplant } = buildArch([16, 17], registryNoImplant, noopHandlers());
    expect(gridNoImplant.querySelectorAll('[data-perio-field="mpi"]').length).toBe(0);

    __setToothStateForTest(16, { toothSelection: "implant" });
    const registryImplant = new Map<number, ToothCellRefs>();
    const { grid: gridImplant } = buildArch([16, 17], registryImplant, noopHandlers());
    expect(gridImplant.querySelectorAll('[data-perio-field="mpi"]').length).toBe(2);
  });
});

describe("buildFieldCell", () => {
  it("wires a pd input's change listener to handlers.onPd with the raw string value", () => {
    const cells: ToothCellRefs = {
      pd: {}, gm: {}, bop: {}, cal: {}, mobility: null, furcation: {}, plaque: {},
      cejVisibility: null, rootConcavity: null, pi: {}, gi: {}, kg: null,
      gingivalThickness: null, millerClass: null, mpi: {}, mbi: {},
    };
    const { handlers, calls } = spyHandlers();
    const cell = buildFieldCell(16, "pd", ["MB"], "buccal", cells, handlers);
    document.body.appendChild(cell);
    const input = cells.pd.MB!;
    input.value = "5";
    input.dispatchEvent(new Event("change"));
    expect(calls.onPd).toEqual([[16, "MB", "5"]]);
    cell.remove();
  });
});

describe("buildFurcationCell", () => {
  it("builds one cycle button per furcation entrance and wires clicks to onFurcation", () => {
    const cells: ToothCellRefs = {
      pd: {}, gm: {}, bop: {}, cal: {}, mobility: null, furcation: {}, plaque: {},
      cejVisibility: null, rootConcavity: null, pi: {}, gi: {}, kg: null,
      gingivalThickness: null, millerClass: null, mpi: {}, mbi: {},
    };
    const { handlers, calls } = spyHandlers();
    // Tooth 16 (upper first molar) has furcation entrances.
    const cell = buildFurcationCell(16, cells, handlers);
    const entrances = Object.keys(cells.furcation);
    expect(entrances.length).toBeGreaterThan(0);
    const btn = cells.furcation[entrances[0]]!;
    btn.click();
    expect(calls.onFurcation).toEqual([[16, entrances[0]]]);
    void cell;
  });

  it("is empty for a tooth with no furcated entrance", () => {
    const cells: ToothCellRefs = {
      pd: {}, gm: {}, bop: {}, cal: {}, mobility: null, furcation: {}, plaque: {},
      cejVisibility: null, rootConcavity: null, pi: {}, gi: {}, kg: null,
      gingivalThickness: null, millerClass: null, mpi: {}, mbi: {},
    };
    // Tooth 11 (upper central incisor, single-rooted) has no furcation entrance.
    const cell = buildFurcationCell(11, cells, noopHandlers());
    expect(cell.children.length).toBe(0);
    expect(Object.keys(cells.furcation).length).toBe(0);
  });
});

describe("buildPlaqueCell / buildGradeCell (diamond quad builders)", () => {
  it("buildPlaqueCell wires each of the 4 surfaces with the right grid-area + click handler", () => {
    const cells: ToothCellRefs = {
      pd: {}, gm: {}, bop: {}, cal: {}, mobility: null, furcation: {}, plaque: {},
      cejVisibility: null, rootConcavity: null, pi: {}, gi: {}, kg: null,
      gingivalThickness: null, millerClass: null, mpi: {}, mbi: {},
    };
    const { handlers, calls } = spyHandlers();
    buildPlaqueCell(16, cells, handlers);
    expect(Object.keys(cells.plaque).sort()).toEqual(["buccal", "distal", "lingual", "mesial"]);
    expect(cells.plaque.buccal!.style.gridArea).toBe("buc");
    cells.plaque.mesial!.click();
    expect(calls.onPlaque).toEqual([[16, "mesial"]]);
  });

  // v2.4.0 resync: SURFACE_LETTER watermark tag (`data-surface-letter`) — the
  // faint M/D/B/L letter shown behind each plaque/PI/GI/mPI/mBI marker square
  // (CSS: `core/index.css`'s `[data-surface-letter]::before{ content:
  // attr(data-surface-letter) }`).
  it("buildPlaqueCell tags each surface button with its dental-standard watermark letter", () => {
    const cells: ToothCellRefs = {
      pd: {}, gm: {}, bop: {}, cal: {}, mobility: null, furcation: {}, plaque: {},
      cejVisibility: null, rootConcavity: null, pi: {}, gi: {}, kg: null,
      gingivalThickness: null, millerClass: null, mpi: {}, mbi: {},
    };
    const { handlers } = spyHandlers();
    buildPlaqueCell(16, cells, handlers);
    expect(cells.plaque.mesial!.dataset.surfaceLetter).toBe("M");
    expect(cells.plaque.distal!.dataset.surfaceLetter).toBe("D");
    expect(cells.plaque.buccal!.dataset.surfaceLetter).toBe("B");
    expect(cells.plaque.lingual!.dataset.surfaceLetter).toBe("L");
  });

  it("buildGradeCell(mapKey='mpi') wires each surface to onMpiSurface", () => {
    const cells: ToothCellRefs = {
      pd: {}, gm: {}, bop: {}, cal: {}, mobility: null, furcation: {}, plaque: {},
      cejVisibility: null, rootConcavity: null, pi: {}, gi: {}, kg: null,
      gingivalThickness: null, millerClass: null, mpi: {}, mbi: {},
    };
    const { handlers, calls } = spyHandlers();
    buildGradeCell(16, "mpi", cells, handlers);
    cells.mpi.distal!.click();
    expect(calls.onMpiSurface).toEqual([[16, "distal"]]);
  });

  it("buildGradeCell tags each surface button with its dental-standard watermark letter (mirrors buildPlaqueCell)", () => {
    const cells: ToothCellRefs = {
      pd: {}, gm: {}, bop: {}, cal: {}, mobility: null, furcation: {}, plaque: {},
      cejVisibility: null, rootConcavity: null, pi: {}, gi: {}, kg: null,
      gingivalThickness: null, millerClass: null, mpi: {}, mbi: {},
    };
    const { handlers } = spyHandlers();
    buildGradeCell(16, "pi", cells, handlers);
    expect(cells.pi.mesial!.dataset.surfaceLetter).toBe("M");
    expect(cells.pi.distal!.dataset.surfaceLetter).toBe("D");
    expect(cells.pi.buccal!.dataset.surfaceLetter).toBe("B");
    expect(cells.pi.lingual!.dataset.surfaceLetter).toBe("L");
  });
});

describe("buildCejVisibilityCell / buildRootConcavityCell / buildGingivalThicknessCell / buildMillerClassCell", () => {
  it("each wires its single per-tooth cycle button to its handler", () => {
    const cells: ToothCellRefs = {
      pd: {}, gm: {}, bop: {}, cal: {}, mobility: null, furcation: {}, plaque: {},
      cejVisibility: null, rootConcavity: null, pi: {}, gi: {}, kg: null,
      gingivalThickness: null, millerClass: null, mpi: {}, mbi: {},
    };
    const { handlers, calls } = spyHandlers();
    buildCejVisibilityCell(16, cells, handlers);
    buildRootConcavityCell(16, cells, handlers);
    buildGingivalThicknessCell(16, cells, handlers);
    buildMillerClassCell(16, cells, handlers);
    cells.cejVisibility!.click();
    cells.rootConcavity!.click();
    cells.gingivalThickness!.click();
    cells.millerClass!.click();
    expect(calls.onCejVisibility).toEqual([[16]]);
    expect(calls.onRootConcavity).toEqual([[16]]);
    expect(calls.onGingivalThickness).toEqual([[16]]);
    expect(calls.onMillerClass).toEqual([[16]]);
  });
});

describe("buildKgCell", () => {
  it("wires the mm number input's change to onKg with the raw string", () => {
    const cells: ToothCellRefs = {
      pd: {}, gm: {}, bop: {}, cal: {}, mobility: null, furcation: {}, plaque: {},
      cejVisibility: null, rootConcavity: null, pi: {}, gi: {}, kg: null,
      gingivalThickness: null, millerClass: null, mpi: {}, mbi: {},
    };
    const { handlers, calls } = spyHandlers();
    buildKgCell(16, cells, handlers);
    cells.kg!.value = "3";
    cells.kg!.dispatchEvent(new Event("change"));
    expect(calls.onKg).toEqual([[16, "3"]]);
  });
});

describe("syncToothCells", () => {
  it("disables PD/GM/BOP inputs on a hidden row and leaves uncharted sites blank", () => {
    const registry = new Map<number, ToothCellRefs>();
    buildArch([16], registry, noopHandlers());
    const cells = registry.get(16)!;
    // Tooth 16 default state (no perio data, not missing) -> not hidden.
    syncToothCells(cells, 16, getToothPerio(16), getToothCal(16), false);
    expect(cells.pd.MB!.value).toBe("");
    expect(cells.pd.MB!.disabled).toBe(false);

    __setToothStateForTest(16, { toothSelection: "none" });
    syncToothCells(cells, 16, getToothPerio(16), getToothCal(16), false);
    expect(cells.pd.MB!.disabled).toBe(true);
  });
});

describe("collectCurveInput / collectOverlayInput / collectMmHeatInput", () => {
  it("collect one entry per tooth per site, with x positions spread across the tooth width", () => {
    const layout: ArchLayout = {
      teeth: [
        { toothNo: 16, x: 0, width: 30 },
        { toothNo: 17, x: 30, width: 30 },
      ],
      totalWidth: 60,
      cejY: 40,
    };
    setPerioSite(16, "MB", { pd: 3, gm: 1 });
    const curveIn = collectCurveInput(layout, ["MB", "B", "DB"]);
    expect(curveIn.sites.length).toBe(6);
    expect(curveIn.sites[0]).toEqual({ site: "MB", pd: 3, gm: 1 });
    expect(curveIn.xs[0]).toBeCloseTo((30 * 0.5) / 3, 5);

    const overlayIn = collectOverlayInput(layout, ["MB", "B", "DB"]);
    expect(overlayIn[0]).toEqual({ x: curveIn.xs[0], pd: 3, gm: 1, bop: false });

    const mmHeatIn = collectMmHeatInput(layout, ["MB", "B", "DB"]);
    expect(mmHeatIn[0].pd).toBe(3);
    expect(mmHeatIn[0].cal).toBe(4); // getToothCal: pd(3) + gm(1)
  });

  // v2.4.0 resync: continuity fix — a tooth with ANY charted site on an
  // aspect has its REMAINING sites on that aspect treated as pd=0/gm=0 (not
  // `undefined`), so the pocket/margin curve draws fully across the tooth
  // instead of stopping at the first gap. A tooth with NO charted site on the
  // aspect is unaffected — every site there stays fully `undefined`.
  it("continuity fix: a tooth with one charted site fills its OTHER sites with pd=0/gm=0; an uncharted tooth stays undefined", () => {
    const layout: ArchLayout = {
      teeth: [
        { toothNo: 16, x: 0, width: 30 }, // one charted site (MB)
        { toothNo: 17, x: 30, width: 30 }, // no charted sites
      ],
      totalWidth: 60,
      cejY: 40,
    };
    setPerioSite(16, "MB", { pd: 3, gm: 1 });
    const curveIn = collectCurveInput(layout, ["MB", "B", "DB"]);

    // Tooth 16: charted MB stands; the uncharted B/DB fill to 0/0.
    expect(curveIn.sites[0]).toEqual({ site: "MB", pd: 3, gm: 1 });
    expect(curveIn.sites[1]).toEqual({ site: "B", pd: 0, gm: 0 });
    expect(curveIn.sites[2]).toEqual({ site: "DB", pd: 0, gm: 0 });

    // Tooth 17: nothing charted at all -> every site stays undefined.
    expect(curveIn.sites[3]).toEqual({ site: "MB", pd: undefined, gm: undefined });
    expect(curveIn.sites[4]).toEqual({ site: "B", pd: undefined, gm: undefined });
    expect(curveIn.sites[5]).toEqual({ site: "DB", pd: undefined, gm: undefined });
  });

  // A charted site's OWN pd is defined but its gm was never charted (a real,
  // if unusual, state — pd without a paired gm reading): gm still fills to 0
  // rather than staying undefined, since `pd !== undefined` on this site.
  it("continuity fix: a charted site's own missing gm fills to 0 (not undefined) once its pd is charted", () => {
    const layout: ArchLayout = {
      teeth: [{ toothNo: 16, x: 0, width: 30 }],
      totalWidth: 30,
      cejY: 40,
    };
    setPerioSite(16, "MB", { pd: 3 }); // pd only, no gm
    const curveIn = collectCurveInput(layout, ["MB", "B", "DB"]);
    expect(curveIn.sites[0]).toEqual({ site: "MB", pd: 3, gm: 0 });
  });
});

describe("drawArchCurves / drawArchOverlay", () => {
  it("are no-ops on a null container", () => {
    expect(() => drawArchCurves(new Map(), null, [16, 17])).not.toThrow();
    expect(() => drawArchOverlay(new Map(), null, [16, 17], "pd")).not.toThrow();
  });

  it("drawArchOverlay clears any stale overlay layer and draws nothing for layer 'none'", () => {
    const container = mkEl("div");
    const stale = mkEl("div", "perio-overlay-layer perio-overlay-stale");
    container.appendChild(stale);
    drawArchOverlay(new Map(), container, [16, 17], "none");
    expect(container.querySelector(".perio-overlay-stale")).toBeNull();
  });
});

// Important-finding fix (controller review): the specs above only exercise
// drawArchOverlay's early-return paths (null container / "none" layer /
// empty-teeth cache) — none of them build a REAL template cache and actually
// run the mark-drawing branches. These do, mirroring the exact
// readFileSync+DOMParser cache + buildBuccalArchSvg/buildPalatalArchSvg
// mount technique `pgb-switcher.test.ts`/`pgb-mm-overlays.test.ts` use.
describe("drawArchOverlay (real template cache, non-early-return paths)", () => {
  const cache = buildRealCache();
  const teeth = [16, 17];

  function mountArch(): HTMLDivElement {
    const container = mkEl("div");
    container.appendChild(buildBuccalArchSvg(cache, teeth));
    container.appendChild(buildPalatalArchSvg(cache, teeth));
    return container;
  }

  it("'pd' heat layer draws a mark for a charted site into the real buccal row group", () => {
    const container = mountArch();
    setPerioSite(16, "MB", { pd: 5 }); // moderate depth, buccal aspect

    drawArchOverlay(cache, container, teeth, "pd");

    const buccalGroup = container.querySelector(".perio-tooth-row-buccal")!;
    const buccalOverlay = buccalGroup.querySelector(".perio-overlay-layer")!;
    expect(buccalOverlay).toBeTruthy();
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-pd");
    expect(buccalOverlay.children.length).toBeGreaterThan(0);
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-moderate").length).toBe(1);
  });

  it("'plaque' layer draws a mark for a charted surface into buccal AND palatal row groups", () => {
    const container = mountArch();
    setPlaque(16, "buccal", true);
    setPlaque(16, "lingual", true);

    drawArchOverlay(cache, container, teeth, "plaque");

    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    const palatalOverlay = container.querySelector(".perio-tooth-row-palatal-inner .perio-overlay-layer")!;
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-plaque");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-plaque").length).toBe(1);
    expect(palatalOverlay.querySelectorAll(".perio-overlay-plaque").length).toBe(1);
  });

  it("switching from a drawn layer to 'none' clears every overlay mark", () => {
    const container = mountArch();
    setPerioSite(16, "MB", { pd: 6 });
    drawArchOverlay(cache, container, teeth, "pd");
    expect(container.querySelectorAll(".perio-overlay-layer").length).toBe(2); // buccal + palatal

    drawArchOverlay(cache, container, teeth, "none");
    expect(container.querySelectorAll(".perio-overlay-layer").length).toBe(0);
  });
});

describe("overlaySwitchLabel", () => {
  it("uses the dedicated perio.overlay.<layer> key in translated mode", () => {
    setI18nLanguage("en");
    expect(overlaySwitchLabel("pd")).toBe(t("perio.overlay.pd"));
  });

  it("falls back to t() for layers with no PerioRowId mapping (e.g. cairo)", () => {
    expect(overlaySwitchLabel("cairo")).toBe(t("perio.overlay.cairo"));
  });
});

describe("applyArchColumns", () => {
  it("is a no-op on a null grid", () => {
    expect(() => applyArchColumns(null, [16, 17], new Map(), null)).not.toThrow();
  });

  it("is a no-op when the layout has no teeth (empty template cache)", () => {
    const grid = mkEl("div");
    grid.style.gridTemplateColumns = "1px 2px";
    applyArchColumns(grid, [16, 17], new Map(), null);
    // archToothLayout(new Map(), ...) yields zero teeth (no template found) ->
    // function returns early, leaving the provisional columns untouched.
    expect(grid.style.gridTemplateColumns).toBe("1px 2px");
  });

  // Important-finding fix (controller review): the two specs above only
  // exercise the early-return paths. This one runs the REAL fill-scale path
  // — a real template cache (same technique as the drawArchOverlay real-path
  // specs above) + a real `buildArch` grid + a mocked-`clientWidth` scroll
  // container — and asserts against an INDEPENDENTLY computed expected value
  // (re-deriving the exact same archToothLayout/computeFillScale formula the
  // production code uses, mirroring `ui1-dynamic-scale.test.ts`'s own
  // structural-assertion technique), so the assertion is concrete and
  // deterministic rather than merely "changed from the placeholder".
  it("widens a real buildArch grid's tooth columns from the real per-tooth layout + a measured scroll width", () => {
    const teeth = [16, 17];
    const registry = new Map<number, ToothCellRefs>();
    const { grid } = buildArch(teeth, registry, {
      onPd: () => {}, onGm: () => {}, onBop: () => {}, onMobility: () => {},
      onFurcation: () => {}, onPlaque: () => {}, onCejVisibility: () => {},
      onRootConcavity: () => {}, onPiSurface: () => {}, onGiSurface: () => {},
      onKg: () => {}, onGingivalThickness: () => {}, onMillerClass: () => {},
      onMpiSurface: () => {}, onMbiSurface: () => {},
    });
    // Provisional (pre-`applyArchColumns`) columns: fixed placeholder width.
    expect(grid.style.gridTemplateColumns).toBe(`${ROW_LABEL_WIDTH}px repeat(${teeth.length}, 46px)`);

    const scrollContainer = mkEl("div");
    Object.defineProperty(scrollContainer, "clientWidth", { configurable: true, value: 900 });

    const cache = buildRealCache();
    applyArchColumns(grid, teeth, cache, scrollContainer);

    // Independently re-derive the expected column string via the SAME public
    // pure functions applyArchColumns itself calls.
    const layout = archToothLayout(cache, teeth);
    expect(layout.teeth.length).toBe(teeth.length); // sanity: the real cache resolved every tooth
    const available = 900 - ROW_LABEL_WIDTH - GRID_SCROLLBAR_ALLOWANCE;
    const fillScale = computeFillScale(available, layout.totalWidth);
    const expectedCols = layout.teeth
      .map((tooth) => `${((tooth.width + TOOTH_GAP) * fillScale).toFixed(3)}px`)
      .join(" ");
    expect(grid.style.gridTemplateColumns).toBe(`${ROW_LABEL_WIDTH}px ${expectedCols}`);
    // Concrete non-triviality checks: the fitted widths are real (decimal,
    // per-tooth) numbers, not the 46px placeholder.
    expect(grid.style.gridTemplateColumns).not.toContain("46px");
    expect(fillScale).toBeGreaterThan(0);
  });
});
