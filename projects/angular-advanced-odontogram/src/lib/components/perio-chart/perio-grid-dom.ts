// Angular port of $ENGINE/src/PerioChart.tsx's MODULE-SCOPE plain-DOM
// builders (TSX ~87-1517). React never controls this grid: the TSX itself
// builds the whole 32-tooth x 6-site fullgrid with `document.createElement`
// calls and updates it via targeted `syncToothCells` writes, not JSX/React
// state (see the source file's own header doc above `PerioChart`, TSX
// 1479-1517). That means this module ports near-verbatim, framework-free —
// no Angular imports, no React imports, just DOM + the engine's plain-
// function API (`core/odontogram`, `core/perioGraphic`,
// `core/perioIndexNames`) exactly like the TSX consumes it. Phase 4 Task 4's
// `PerioChartComponent` is the only caller: it constructs the `GridHandlers`
// bag (wiring each callback to the real engine setters, TSX 1797-1942),
// holds the `Map<number, ToothCellRefs>` registry, and calls `buildArch`/
// `applyArchColumns`/`drawArchCurves`/`drawArchOverlay`/`syncToothCells`
// from its own effects — the same shape as the TSX component body
// (1518-2369), just re-hosted under Angular's change-detection instead of
// React's.
//
// Names, structure, CSS classes, dataset attributes and aria attributes are
// byte-identical to the TSX so every existing id/class-based test (and any
// host CSS targeting them) keeps resolving unchanged. The only adaptations
// are: import paths (`./odontogram` -> `../../core/odontogram`, etc.) and
// explicit TS types where the TSX relied on inference from its own local
// scope (the `GridHandlers` bag below is typed exactly from its usage at TSX
// 1797-1942).
import {
  PERIO_SITES,
  type PerioSite,
  type PerioOverlayLayer,
  type PerioRowId,
  isUpperTooth,
  formatToothLabel,
  getToothPerio,
  getToothCal,
  getToothRecessionType,
  getToothMobility,
  furcationEntrances,
  getToothFurcation,
  getToothPlaque,
  getCejVisibility,
  getRootConcavity,
  isPerioRowHidden,
  isToothImplant,
  getPlaqueIndex,
  getGingivalIndex,
  getKeratinizedWidth,
  getGingivalThickness,
  getMillerClass,
  getPeriImplantPlaque,
  getPeriImplantBleeding,
  getPerioRowVisibility,
  getPerioIndexNameMode,
} from "../../core/odontogram";
import { indexName, CANONICAL_INDEX_NAMES } from "../../core/perioIndexNames";
import { optionsFor } from "../../core/registry/uiOptions";
import { t } from "../../core/i18n/useI18n";
import {
  archToothLayout,
  perioCurve,
  buildPerioCurveLayer,
  perioOverlayMarks,
  perioPlaqueMarks,
  perioMmHeatMarks,
  perioCairoMarks,
  perioGradeMarks,
  perioKgMarks,
  buildPerioOverlayLayer,
  PERIO_MM_PX,
  TOOTH_GAP,
  computeFillScale,
  type TemplateDocCache,
  type ArchLayout,
  type PerioCurveSite,
  type PerioOverlaySite,
  type PerioCairoTooth,
  type PerioGradeTooth,
  type PerioKgTooth,
  type SiteOverlayLayer,
  type MmHeatOverlayLayer,
} from "../../core/perioGraphic";

// Width of the sticky left-hand row-label column (px). The arch graphic and
// every number row share ONE CSS grid whose first track is this label column,
// so the tooth columns (tracks 2..N+1) start at the same x in every row.
const ROW_LABEL_WIDTH = 220;

// Provisional per-tooth column width (px) used until the tooth-template cache
// loads and the real, per-tooth arch-layout widths are applied
// (`applyArchColumns`). Wide enough to hold a 3-site cell so the grid is fully
// usable for charting even when the graphic never loads (e.g. no network in a
// unit test) — the graphic + column alignment is a presentation enhancement,
// never a hard dependency for data entry.
const PROVISIONAL_COL_WIDTH = 46;

// Literal (not `PERIO_SITES.slice(...)`) — order matches PERIO_SITES' own
// canonical MB/B/DB/ML/L/DL.
const BUCCAL_SITES: readonly PerioSite[] = ["MB", "B", "DB"];
const LINGUAL_SITES: readonly PerioSite[] = ["ML", "L", "DL"];

// SP-perio P2b Task 4: the 4 fixed O'Leary plaque-index surfaces (mirrors
// VALID_PLAQUE_SURFACE in odontogram.ts). Order = the clockwise M/D + B/L
// quadrant order the 4-quadrant plaque mark reads in.
const PLAQUE_SURFACES: readonly string[] = ["mesial", "distal", "buccal", "lingual"];

// UI-3a Task 3: does SURFACE "mesial" sit in the LEFT column of a tooth's
// diamond plaque/grade cell (`.perio-fullgrid-plaque-quad`'s `"mes dis"`
// middle row)? Mesial always points toward the arch midline. The upper/lower
// arch arrays (owned by the caller — mirrors `PerioChart.tsx`'s
// UPPER_ARCH/LOWER_ARCH) lay FDI quadrant 1/4 teeth on the screen-LEFT half of
// their arch (the midline sits at the 11|21 / 41|31 boundary, to their
// right) and quadrant 2/3 teeth on the screen-RIGHT half (midline to their
// left) — so mesial is visually on the LEFT for quadrants 2/3 and on the
// RIGHT for quadrants 1/4.
export function mesialOnLeft(toothNo: number): boolean {
  const quadrant = Math.floor(toothNo / 10);
  return quadrant === 2 || quadrant === 3;
}

// UI-3a Task 3: the diamond `grid-area` a plaque/grade surface button gets
// on a given tooth. Buccal/lingual are always the top-/bottom-centered tips;
// mesial/distal swap the "mes"/"dis" middle-row columns per `mesialOnLeft`
// so mesial stays toward the midline on both sides of the arch. This only
// decides visual placement — the button's `surface`/`data-*` wiring (set by
// the caller) is unaffected.
export function diamondGridArea(surface: string, toothNo: number): "buc" | "mes" | "dis" | "lin" {
  if (surface === "buccal") return "buc";
  if (surface === "lingual") return "lin";
  const onLeft = mesialOnLeft(toothNo);
  if (surface === "mesial") return onLeft ? "mes" : "dis";
  return onLeft ? "dis" : "mes"; // distal
}

// Glickman furcation grade -> Roman-numeral face on the cycle control.
// Index 0 (no involvement) shows the em-dash placeholder, 1-4 show I-IV.
const FURCATION_ROMAN = ["–", "I", "II", "III", "IV"];

// SP-perio PG-C Task 3: cejVisibility / rootConcavity cycle-button value
// order + compact face glyphs (mirrors FURCATION_ROMAN's role). Literal —
// order matches VALID_CEJ_VISIBILITY / VALID_ROOT_CONCAVITY (odontogram.ts)
// / LOCAL_VALUE_MAPS (fhir/codesystems.ts). Exported (unlike the TSX, which
// keeps these module-private since its component body lives in the SAME
// file) — Phase 4 Task 4's PerioChartComponent needs the exact same cycle
// order to compute the *next* value in its `onCejVisibility`/etc. handlers,
// and re-declaring a second literal copy there would risk the two silently
// drifting out of sync.
export const CEJ_VISIBILITY_CYCLE: readonly string[] = ["none", "detectable", "not-detectable"];
const CEJ_VISIBILITY_FACE: Record<string, string> = { none: "–", detectable: "D", "not-detectable": "ND" };
export const ROOT_CONCAVITY_CYCLE: readonly string[] = ["none", "mild", "deep"];
const ROOT_CONCAVITY_FACE: Record<string, string> = { none: "–", mild: "Mi", deep: "Dp" };

// SP-perio PG-D Task 4: gingivalThickness (GT) / millerClass cycle-button
// value order + compact face glyphs — mirrors CEJ_VISIBILITY_CYCLE/
// ROOT_CONCAVITY_CYCLE above exactly. Order matches VALID_GINGIVAL_THICKNESS
// / VALID_MILLER_CLASS (odontogram.ts) / LOCAL_VALUE_MAPS (fhir/codesystems.ts).
// Exported for the same PerioChartComponent-handler reason as the two cycles
// above.
export const GINGIVAL_THICKNESS_CYCLE: readonly string[] = ["unknown", "thin", "medium", "thick"];
const GINGIVAL_THICKNESS_FACE: Record<string, string> = { unknown: "–", thin: "Tn", medium: "Md", thick: "Tk" };
export const MILLER_CLASS_CYCLE: readonly string[] = ["none", "i", "ii", "iii", "iv"];
const MILLER_CLASS_FACE: Record<string, string> = { none: "–", i: "I", ii: "II", iii: "III", iv: "IV" };

// PI/GI (Silness-Löe Plaque Index / Löe-Silness Gingival Index) per-surface
// graded (0-3) cycle face — 0 (healthy/uncharted, matches
// getPlaqueIndex/getGingivalIndex's own "absence" semantics) shows the
// em-dash placeholder, mirroring FURCATION_ROMAN's role for a graded axis.
const GRADE_FACE: readonly string[] = ["–", "1", "2", "3"];

/** Per-tooth DOM element registry — one entry per charted tooth, populated by
 *  `buildArch`/the cell builders below and consumed by `syncToothCells` (the
 *  R3 perf targeted-update primitive) and the caller's keyboard handling.
 *  Exported so Task 4's `PerioChartComponent` can type its own
 *  `Map<number, ToothCellRefs>` registry. */
export type ToothCellRefs = {
  pd: Partial<Record<PerioSite, HTMLInputElement>>;
  gm: Partial<Record<PerioSite, HTMLInputElement>>;
  bop: Partial<Record<PerioSite, HTMLInputElement>>;
  cal: Partial<Record<PerioSite, HTMLSpanElement>>;
  mobility: HTMLSelectElement | null;
  // SP-perio P2b Task 4: per-entrance furcation cycle buttons (keyed by
  // entrance string — only the furcated-position entrances exist) and the
  // 4 O'Leary plaque-surface toggle buttons.
  furcation: Partial<Record<string, HTMLButtonElement>>;
  plaque: Partial<Record<string, HTMLButtonElement>>;
  // SP-perio PG-C Task 3: single per-tooth cycle button each (no site/entrance
  // subdivision — mirrors `mobility` above, which is also one-per-tooth).
  cejVisibility: HTMLButtonElement | null;
  rootConcavity: HTMLButtonElement | null;
  // SP-perio PG-D Task 4: PI/GI per-surface (0-3) cycle buttons (keyed by the
  // 4 O'Leary surfaces, mirrors `plaque` above); KG is a single per-tooth mm
  // number input (mirrors `mobility`'s one-per-tooth shape); gingivalThickness/
  // millerClass are single per-tooth cycle buttons (mirror cejVisibility/
  // rootConcavity above).
  pi: Partial<Record<string, HTMLButtonElement>>;
  gi: Partial<Record<string, HTMLButtonElement>>;
  kg: HTMLInputElement | null;
  gingivalThickness: HTMLButtonElement | null;
  millerClass: HTMLButtonElement | null;
  // SP-perio PG-E Task 2: mPI/mBI per-surface (0-3) cycle buttons — mirror
  // `pi`/`gi` above exactly, but IMPLANT-GATED (see syncToothCells): active
  // only on an implant tooth, inert everywhere else.
  mpi: Partial<Record<string, HTMLButtonElement>>;
  mbi: Partial<Record<string, HTMLButtonElement>>;
};

/** The callback bag `buildArch`/the cell builders wire every interactive
 *  control to. Transcribed from TSX 256-272 (the type) and TSX 1797-1942 (the
 *  actual per-callback implementations the caller supplies) — every
 *  signature below matches exactly what those implementations receive/use.
 *  Task 4's `PerioChartComponent` constructs the real bag (engine
 *  reads/writes via `setPerioSite`/`setToothMobility`/... + a targeted
 *  `syncOneTooth` re-sync per TSX's own pattern); this module never calls an
 *  engine SETTER itself — only these handlers do. */
export type GridHandlers = {
  onPd: (toothNo: number, site: PerioSite, raw: string) => void;
  onGm: (toothNo: number, site: PerioSite, raw: string) => void;
  onBop: (toothNo: number, site: PerioSite, checked: boolean) => void;
  onMobility: (toothNo: number, value: string) => void;
  onFurcation: (toothNo: number, entrance: string) => void;
  onPlaque: (toothNo: number, surface: string) => void;
  onCejVisibility: (toothNo: number) => void;
  onRootConcavity: (toothNo: number) => void;
  onPiSurface: (toothNo: number, surface: string) => void;
  onGiSurface: (toothNo: number, surface: string) => void;
  onKg: (toothNo: number, raw: string) => void;
  onGingivalThickness: (toothNo: number) => void;
  onMillerClass: (toothNo: number) => void;
  onMpiSurface: (toothNo: number, surface: string) => void;
  onMbiSurface: (toothNo: number, surface: string) => void;
};

// T3 curve overlay: gather the ordered per-site {pd,gm} readings for one row
// (buccal MB/B/DB or lingual ML/L/DL) plus each site's x. The 3 sites of a
// tooth spread evenly across that tooth's width (reusing the SAME per-tooth
// x/width `archToothLayout` gives the arch teeth, so the curve tracks them):
// site j lands at x + width*(j+0.5)/3 → the 1/6, 1/2, 5/6 fractions. Reads
// getToothPerio (active chart) → status/plan aware + live-updates.
export function collectCurveInput(
  layout: ArchLayout,
  siteKeys: readonly PerioSite[],
): { sites: PerioCurveSite[]; xs: number[] } {
  const sites: PerioCurveSite[] = [];
  const xs: number[] = [];
  for (const tooth of layout.teeth) {
    const perio = getToothPerio(tooth.toothNo);
    siteKeys.forEach((site, j) => {
      const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
      sites.push({
        site,
        pd: charted ? perio.pd[site] : undefined,
        gm: Object.prototype.hasOwnProperty.call(perio.gm, site) ? perio.gm[site] : undefined,
      });
      xs.push(tooth.x + (tooth.width * (j + 0.5)) / 3);
    });
  }
  return { sites, xs };
}

// UI-3a Task 2: `buildBuccalArchSvg`/`buildPalatalArchSvg` (caller-owned,
// core/perioGraphic) render as two independent
// `<svg class="perio-tooth-arch perio-tooth-arch-buccal|palatal">` elements,
// each mounted into its OWN grid cell (`buccalCell`/`palatalCell`, see
// `buildArch` below) with the central perio index band between them — one
// `container.querySelector` reaches either aspect's SVG from anywhere in the
// arch (it still takes `container` rather than the SVG directly because
// `drawArchCurves`/`drawArchOverlay` are called with the whole arch grid
// element, which contains BOTH `buccalCell` and `palatalCell` as
// descendants regardless of the rows sitting between them in the DOM).
function resolveAspectSvg(container: Element, aspectClass: string): Element | null {
  return container.querySelector(`svg.${aspectClass}`);
}

/** Draw (or redraw) each aspect's curve into its arch SVG (see
 *  `resolveAspectSvg` above). Stale curve layers are removed first (scoped
 *  to `container`, i.e. every arch SVG it holds), so this is safe to call on
 *  every state change. The palatal curve is computed in the SAME
 *  buccal-space (cejY at the shared baseline); since the palatal SVG's row
 *  group carries NO net orientation transform, the curve needs no transform
 *  of its own either — it lands directly on the palatal teeth. */
export function drawArchCurves(cache: TemplateDocCache, container: HTMLElement | null, teeth: readonly number[]): void {
  if (!container) return;
  // Remove any stale curve layers first (safe to call on every state change).
  container.querySelectorAll(".perio-curve").forEach((el) => el.remove());

  const layout = archToothLayout(cache, teeth);
  const opts = { cejY: layout.cejY, mmPx: PERIO_MM_PX };

  const buccalSvg = resolveAspectSvg(container, "perio-tooth-arch-buccal");
  if (buccalSvg) {
    const buccalParent = (buccalSvg.querySelector(".perio-tooth-row-buccal") as SVGGElement | null) ?? buccalSvg;
    const buccalIn = collectCurveInput(layout, BUCCAL_SITES);
    const buccalCurve = perioCurve(buccalIn.sites, { ...opts, siteX: (i) => buccalIn.xs[i] });
    const buccalLayer = buildPerioCurveLayer(buccalCurve, { width: layout.totalWidth, className: "perio-curve perio-curve-buccal" });
    buccalParent.appendChild(buccalLayer);
  }

  const palatalSvg = resolveAspectSvg(container, "perio-tooth-arch-palatal");
  if (palatalSvg) {
    const palatalParent = (palatalSvg.querySelector(".perio-tooth-row-palatal-inner") as SVGGElement | null) ?? palatalSvg;
    const lingualIn = collectCurveInput(layout, LINGUAL_SITES);
    const lingualCurve = perioCurve(lingualIn.sites, { ...opts, siteX: (i) => lingualIn.xs[i] });
    const lingualLayer = buildPerioCurveLayer(lingualCurve, { width: layout.totalWidth, className: "perio-curve perio-curve-palatal" });
    palatalParent.appendChild(lingualLayer);
  }
}

// UI-2 Task 3: the subset of overlay layers that correspond 1:1 to a
// toggleable Dental Chart index row (`PerioRowId`) — these route their pill
// label through `indexName()` so canonical mode is consistent between the
// grid row and the matching overlay switcher entry. Layers with no row
// counterpart ("none"/"gr"/"cairo"/"pd5"/"pd6") always stay
// `t(\`perio.overlay.${layer}\`)`, unaffected by the name-mode setting.
const OVERLAY_LAYER_TO_ROW: Partial<Record<PerioOverlayLayer, PerioRowId>> = {
  pd: "pd",
  cal: "cal",
  bop: "bop",
  plaque: "plaque",
  pi: "pi",
  gi: "gi",
  kg: "kg",
  mpi: "mpi",
  mbi: "mbi",
};

/** Display label for one overlay-switcher pill, honoring
 *  `getPerioIndexNameMode()` for layers that map to a `PerioRowId`. NOTE:
 *  this deliberately does NOT delegate to `indexName()` — the switcher's
 *  TRANSLATED-mode text is the dedicated short `perio.overlay.<layer>` key
 *  (e.g. "PI"), which differs from the grid row's own translated key
 *  (`perio.pi.row` -> "Plaque Index (PI)"); only CANONICAL mode reuses the
 *  same `CANONICAL_INDEX_NAMES` entry the row uses, so the pill and the row
 *  agree once canonical mode is on. */
export function overlaySwitchLabel(layer: PerioOverlayLayer): string {
  const rowId = OVERLAY_LAYER_TO_ROW[layer];
  if (rowId && getPerioIndexNameMode() === "canonical") return CANONICAL_INDEX_NAMES[rowId];
  return t(`perio.overlay.${layer}`);
}

// PG-B Task 2 overlay: gather one row's ordered per-site {x, pd, gm, bop}
// readings — the SAME per-tooth x/width `archToothLayout` gives the arch teeth
// (and the curve), so the overlay marks track the teeth. Reads getToothPerio
// (active chart) -> status/plan aware + live-updates, mirroring
// `collectCurveInput`.
export function collectOverlayInput(layout: ArchLayout, siteKeys: readonly PerioSite[]): PerioOverlaySite[] {
  const out: PerioOverlaySite[] = [];
  for (const tooth of layout.teeth) {
    const perio = getToothPerio(tooth.toothNo);
    siteKeys.forEach((site, j) => {
      const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
      out.push({
        x: tooth.x + (tooth.width * (j + 0.5)) / 3,
        pd: charted ? perio.pd[site] : undefined,
        gm: Object.prototype.hasOwnProperty.call(perio.gm, site) ? perio.gm[site] : undefined,
        bop: perio.bop.includes(site),
      });
    });
  }
  return out;
}

// PG-B Task 3 overlay: gather one row's ordered per-site {x, pd, gm, cal}
// readings for the continuous mm heat overlays — same shape/x-positioning as
// `collectOverlayInput`, plus the site's CAL (via the REAL `getToothCal`, not
// a re-derived `pd+gm`, so the heat overlay can never drift from the public
// CAL definition). Reads getToothPerio/getToothCal (active chart) ->
// status/plan aware + live-updates, mirroring `collectOverlayInput`.
export function collectMmHeatInput(layout: ArchLayout, siteKeys: readonly PerioSite[]): PerioOverlaySite[] {
  const out: PerioOverlaySite[] = [];
  for (const tooth of layout.teeth) {
    const perio = getToothPerio(tooth.toothNo);
    const cal = getToothCal(tooth.toothNo);
    siteKeys.forEach((site, j) => {
      const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
      out.push({
        x: tooth.x + (tooth.width * (j + 0.5)) / 3,
        pd: charted ? perio.pd[site] : undefined,
        gm: Object.prototype.hasOwnProperty.call(perio.gm, site) ? perio.gm[site] : undefined,
        cal: cal.has(site) ? cal.get(site) : undefined,
      });
    });
  }
  return out;
}

/**
 * PG-B Task 2/3: draw (or clear) the overlay for ONE arch band. UI-3a Task 2:
 * each aspect has its OWN standalone arch SVG (`buildBuccalArchSvg`/
 * `buildPalatalArchSvg`), each mounted into its own grid cell
 * (`buccalCell`/`palatalCell` — see `buildArch`), so a buccal-aspect mark is
 * appended into `svg.perio-tooth-arch-buccal` and a palatal-aspect mark into
 * `svg.perio-tooth-arch-palatal`.
 * Stale overlay layers are removed first (scoped to `container`, i.e. both
 * SVGs), so this is safe to call on every state / layer change. The overlay
 * `<g>` is appended INTO the SAME oriented row group the teeth + curve ride
 * in its OWN svg (`.perio-tooth-row-buccal` / `.perio-tooth-row-palatal-
 * inner`), so the occlusal-to-occlusal flip carries the marks along with
 * the teeth — one coordinate space, no divergent geometry (it reuses
 * `archToothLayout` + `PERIO_MM_PX`, exactly like `drawArchCurves`).
 *
 * `none` draws nothing (after the stale clear), so selecting None leaves a
 * bare arch. Exported for direct unit testing against a hand-built template
 * cache, mirroring the source TSX's own export.
 */
export function drawArchOverlay(
  cache: TemplateDocCache,
  container: HTMLElement | null,
  teeth: readonly number[],
  layer: PerioOverlayLayer,
): void {
  if (!container) return;
  // Remove any stale overlay first (safe to call on every state/layer change).
  container.querySelectorAll(".perio-overlay-layer").forEach((el) => el.remove());
  if (layer === "none") return;

  const buccalSvg = resolveAspectSvg(container, "perio-tooth-arch-buccal");
  const palatalSvg = resolveAspectSvg(container, "perio-tooth-arch-palatal");
  const buccalParent = ((buccalSvg?.querySelector(".perio-tooth-row-buccal") as SVGGElement | null) ?? buccalSvg) as
    | SVGGElement
    | Element
    | null;
  const palatalParent = ((palatalSvg?.querySelector(".perio-tooth-row-palatal-inner") as SVGGElement | null) ??
    palatalSvg) as SVGGElement | Element | null;

  const layout = archToothLayout(cache, teeth);
  const opts = { cejY: layout.cejY, mmPx: PERIO_MM_PX };
  const className = `perio-overlay-${layer}`;

  if (layer === "plaque") {
    const plaqueTeeth = layout.teeth.map((tooth) => ({
      x: tooth.x,
      width: tooth.width,
      surfaces: getToothPlaque(tooth.toothNo),
    }));
    buccalParent?.appendChild(
      buildPerioOverlayLayer(perioPlaqueMarks(plaqueTeeth, "buccal", opts), { width: layout.totalWidth, className }),
    );
    palatalParent?.appendChild(
      buildPerioOverlayLayer(perioPlaqueMarks(plaqueTeeth, "palatal", opts), { width: layout.totalWidth, className }),
    );
    return;
  }

  // PG-C Task 1: the Cairo recession-TYPE overlay — a per-TOOTH derived
  // classification (getToothRecessionType), not a per-site reading, so it is
  // collected once per tooth (mirroring the plaque block above) and — since
  // RT is specifically a BUCCAL-recession index — drawn ONLY into the buccal
  // row, never the lingual/palatal row.
  if (layer === "cairo") {
    const cairoTeeth: PerioCairoTooth[] = layout.teeth.map((tooth) => ({
      x: tooth.x,
      width: tooth.width,
      rt: getToothRecessionType(tooth.toothNo),
    }));
    buccalParent?.appendChild(
      buildPerioOverlayLayer(perioCairoMarks(cairoTeeth, opts), { width: layout.totalWidth, className }),
    );
    return;
  }

  // PG-D Task 4: the KG (keratinized gingiva width) overlay — a per-TOOTH
  // buccal mm scalar (getKeratinizedWidth), collected once per tooth
  // (mirrors the Cairo block above) and drawn ONLY into the buccal row (KG is
  // specifically a buccal measure, like Cairo RT).
  if (layer === "kg") {
    const kgTeeth: PerioKgTooth[] = layout.teeth.map((tooth) => ({
      x: tooth.x,
      width: tooth.width,
      kg: getKeratinizedWidth(tooth.toothNo),
    }));
    buccalParent?.appendChild(
      buildPerioOverlayLayer(perioKgMarks(kgTeeth, opts), { width: layout.totalWidth, className }),
    );
    return;
  }

  // PG-D Task 4: the PI/GI graded-index overlays — per-surface 0-3 grades
  // (getPlaqueIndex/getGingivalIndex) over the SAME 4 O'Leary surfaces the
  // "plaque" overlay reads, split across both rows exactly like it.
  // PG-E Task 2 adds "mpi"/"mbi" (Mombelli modified Plaque/Bleeding indices,
  // getPeriImplantPlaque/getPeriImplantBleeding) to the SAME shape — implant-
  // only data, so a non-implant tooth simply reads grade 0 everywhere and
  // draws no mark, with no extra gating needed here.
  if (layer === "pi" || layer === "gi" || layer === "mpi" || layer === "mbi") {
    const getGrade =
      layer === "pi" ? getPlaqueIndex :
      layer === "gi" ? getGingivalIndex :
      layer === "mpi" ? getPeriImplantPlaque :
      getPeriImplantBleeding;
    const gradeTeeth: PerioGradeTooth[] = layout.teeth.map((tooth) => ({
      x: tooth.x,
      width: tooth.width,
      grades: {
        mesial: getGrade(tooth.toothNo, "mesial"),
        distal: getGrade(tooth.toothNo, "distal"),
        buccal: getGrade(tooth.toothNo, "buccal"),
        lingual: getGrade(tooth.toothNo, "lingual"),
      },
    }));
    buccalParent?.appendChild(
      buildPerioOverlayLayer(perioGradeMarks(gradeTeeth, "buccal", opts), { width: layout.totalWidth, className }),
    );
    palatalParent?.appendChild(
      buildPerioOverlayLayer(perioGradeMarks(gradeTeeth, "palatal", opts), { width: layout.totalWidth, className }),
    );
    return;
  }

  // PG-B Task 3: the continuous mm heat overlays (pd / cal / gr) — every
  // charted site heat-bucketed by depth, over the SAME sites/x-positions the
  // T2 discrete overlays + curve use (`collectMmHeatInput` mirrors
  // `collectOverlayInput`, adding the real `getToothCal` reading for `cal`).
  if (layer === "pd" || layer === "cal" || layer === "gr") {
    const mmHeatLayer = layer as MmHeatOverlayLayer;
    const buccalMarks = perioMmHeatMarks(mmHeatLayer, collectMmHeatInput(layout, BUCCAL_SITES), opts);
    buccalParent?.appendChild(buildPerioOverlayLayer(buccalMarks, { width: layout.totalWidth, className }));
    const lingualMarks = perioMmHeatMarks(mmHeatLayer, collectMmHeatInput(layout, LINGUAL_SITES), opts);
    palatalParent?.appendChild(buildPerioOverlayLayer(lingualMarks, { width: layout.totalWidth, className }));
    return;
  }

  // Site-based discrete overlays (bop / pd5 / pd6).
  const siteLayer = layer as SiteOverlayLayer;
  const buccalMarks = perioOverlayMarks(siteLayer, collectOverlayInput(layout, BUCCAL_SITES), opts);
  buccalParent?.appendChild(buildPerioOverlayLayer(buccalMarks, { width: layout.totalWidth, className }));
  const lingualMarks = perioOverlayMarks(siteLayer, collectOverlayInput(layout, LINGUAL_SITES), opts);
  palatalParent?.appendChild(buildPerioOverlayLayer(lingualMarks, { width: layout.totalWidth, className }));
}

export function mkEl<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/** SP-perio PG-B Task 1: at most ONE row-label info popover is open across the
 *  whole perio chart (upper+lower arch, overlay or inline) at any time —
 *  module-scope singleton, mirroring `odontogram.ts`'s
 *  `showCariesDepthPopup`/`hideCariesDepthPopup` outside-click/Escape
 *  contract. Opening a new popover always closes any previous one first. */
let activeInfoPopover: {
  popover: HTMLDivElement;
  button: HTMLButtonElement;
  cleanup: () => void;
} | null = null;

export function hideInfoPopover(): void {
  if (!activeInfoPopover) return;
  const { popover, button, cleanup } = activeInfoPopover;
  cleanup();
  popover.remove();
  button.setAttribute("aria-expanded", "false");
  activeInfoPopover = null;
}

/** Open (or, when the SAME button is clicked again, close) a lightweight
 *  positioned popover explaining one perio index (`t(infoKey)`), anchored
 *  below the row-label "i" button that triggered it. Dismisses on
 *  click-away or Esc via CAPTURE-phase document listeners — added
 *  synchronously (not deferred with `setTimeout`, unlike
 *  `showCariesDepthPopup`): the triggering "i" button's own click handler
 *  runs during the bubble phase of a "click" event, and any "mousedown" for
 *  that SAME user interaction has already fully dispatched by then (mousedown
 *  -> mouseup -> click), so a listener added here can never see a stale event
 *  from the click that opened it. Capture phase (not bubble) also means Esc
 *  is consumed here BEFORE it can bubble up into the perio-overlay dialog's
 *  own Esc-closes-the-whole-overlay handler (`PerioChartComponent`'s own
 *  keydown handling) — the popover closes without also closing the overlay.
 *  APPENDS TO `document.body` — every caller (component/spec) that opens one
 *  MUST close it on teardown (a spec via `afterEach(() => hideInfoPopover())`,
 *  the component via its destroy path), mirroring the TSX's own contract. */
export function toggleInfoPopover(infoKey: string, anchor: HTMLButtonElement): void {
  const reopening = activeInfoPopover?.button === anchor;
  hideInfoPopover();
  if (reopening) return;

  const popover = mkEl("div", "perio-info-popover");
  popover.id = "perioInfoPopover";
  popover.setAttribute("role", "dialog");
  popover.setAttribute("aria-modal", "false");
  const text = mkEl("p", "perio-info-popover-text");
  text.textContent = t(infoKey);
  popover.appendChild(text);
  popover.setAttribute("aria-label", text.textContent);
  document.body.appendChild(popover);

  // Position below the anchor, clamped to the viewport (mirrors
  // showCariesDepthPopup's positioning in odontogram.ts).
  const rect = anchor.getBoundingClientRect();
  const pw = popover.offsetWidth || 260;
  const left = Math.min(rect.left, window.innerWidth - pw - 8);
  const top = Math.min(rect.bottom + 6, window.innerHeight - (popover.offsetHeight || 0) - 8);
  popover.style.left = `${Math.max(8, left)}px`;
  popover.style.top = `${Math.max(8, top)}px`;

  anchor.setAttribute("aria-expanded", "true");

  const onDocMouseDown = (e: MouseEvent) => {
    const target = e.target as Node | null;
    if (target && (popover.contains(target) || anchor.contains(target))) return;
    hideInfoPopover();
  };
  const onDocKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      hideInfoPopover();
    }
  };
  document.addEventListener("mousedown", onDocMouseDown, true);
  document.addEventListener("keydown", onDocKeyDown, true);

  activeInfoPopover = {
    popover,
    button: anchor,
    cleanup: () => {
      document.removeEventListener("mousedown", onDocMouseDown, true);
      document.removeEventListener("keydown", onDocKeyDown, true);
    },
  };
}

/** Builds a sticky row-label cell. When `infoKey` is given, appends a small
 *  `.perio-info-btn` ("i" icon, real `aria-label`) after the label text that
 *  opens a positioned `.perio-info-popover` with `t(infoKey)` on click (see
 *  {@link toggleInfoPopover}). Rows with no label (the tooth-number header /
 *  tooth-graphic placeholder rows) call this with no `infoKey` and get no
 *  button, same as before. */
export function mkRowLabelCell(text: string, infoKey?: string): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-row-label");
  const label = mkEl("span", "perio-fullgrid-row-label-text");
  label.textContent = text;
  cell.appendChild(label);
  if (infoKey) {
    const btn = mkEl("button", "perio-info-btn") as HTMLButtonElement;
    btn.type = "button";
    btn.textContent = "i";
    btn.setAttribute("aria-label", t("perio.info.button", { label: text }));
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleInfoPopover(infoKey, btn);
    });
    cell.appendChild(btn);
  }
  return cell;
}

/** Sync ONE tooth's already-built cells from the given perio/CAL snapshot —
 *  the R3 (perf) targeted-update primitive. Never creates/destroys DOM
 *  nodes, only updates value/checked/disabled/text on existing ones, so it
 *  is cheap to call after every single-site edit AND in a loop over all 32
 *  teeth for a full resync (dual-state switch / external edits). Omit-when-
 *  empty: an uncharted site renders blank, `?? ""`. */
export function syncToothCells(
  cells: ToothCellRefs,
  toothNo: number,
  perio: ReturnType<typeof getToothPerio>,
  cal: Map<string, number>,
  readOnly: boolean,
): void {
  const hidden = isPerioRowHidden(toothNo);
  for (const site of PERIO_SITES) {
    const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
    const pdInput = cells.pd[site];
    if (pdInput) {
      pdInput.value = charted ? String(perio.pd[site]) : "";
      pdInput.disabled = readOnly || hidden;
    }
    const gmInput = cells.gm[site];
    if (gmInput) {
      gmInput.value = charted && Object.prototype.hasOwnProperty.call(perio.gm, site) ? String(perio.gm[site]) : "";
      gmInput.disabled = readOnly || hidden || !charted;
    }
    const bopInput = cells.bop[site];
    if (bopInput) {
      bopInput.checked = perio.bop.includes(site);
      bopInput.disabled = readOnly || hidden || !charted;
    }
    const calSpan = cells.cal[site];
    if (calSpan) {
      const calVal = cal.get(site);
      calSpan.textContent = calVal === undefined ? "" : String(calVal);
    }
  }
  if (cells.mobility) {
    cells.mobility.value = getToothMobility(toothNo);
    cells.mobility.disabled = readOnly || hidden;
  }
  // SP-perio P2b Task 4: furcation cycle buttons — face + grade + pressed
  // state from the active chart's per-entrance grade (getToothFurcation).
  // Buttons only exist for furcated-position + present teeth (built once,
  // see buildFurcationCell), so `hidden` here is belt-and-braces.
  const furc = getToothFurcation(toothNo);
  for (const entrance of Object.keys(cells.furcation)) {
    const btn = cells.furcation[entrance];
    if (!btn) continue;
    const grade = furc[entrance] ?? 0;
    btn.textContent = FURCATION_ROMAN[grade];
    btn.dataset.grade = String(grade);
    btn.setAttribute("aria-pressed", grade > 0 ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  // SP-perio P2b Task 4: plaque toggles — present/absent mark + pressed state
  // from the active chart's plaque surface set (getToothPlaque). Disabled on
  // a non-present tooth (mirrors the PD/GM disable gate).
  const plaque = getToothPlaque(toothNo);
  for (const surface of Object.keys(cells.plaque)) {
    const btn = cells.plaque[surface];
    if (!btn) continue;
    const present = plaque.includes(surface);
    btn.dataset.present = present ? "1" : "0";
    btn.setAttribute("aria-pressed", present ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  // SP-perio PG-C Task 3: cejVisibility / rootConcavity cycle buttons — face
  // + value + pressed/disabled state from the active chart (getCejVisibility/
  // getRootConcavity). Same hidden-row disable gate as PD/GM/mobility above
  // (both axes are per-tooth, not gated to a furcated position like furcation).
  if (cells.cejVisibility) {
    const value = getCejVisibility(toothNo);
    const btn = cells.cejVisibility;
    btn.textContent = CEJ_VISIBILITY_FACE[value] ?? "–";
    btn.dataset.value = value;
    btn.setAttribute("aria-pressed", value !== "none" ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  if (cells.rootConcavity) {
    const value = getRootConcavity(toothNo);
    const btn = cells.rootConcavity;
    btn.textContent = ROOT_CONCAVITY_FACE[value] ?? "–";
    btn.dataset.value = value;
    btn.setAttribute("aria-pressed", value !== "none" ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  // SP-perio PG-D Task 4: PI/GI per-surface grade buttons — face + grade +
  // pressed state from the active chart (getPlaqueIndex/getGingivalIndex).
  // Same hidden-row disable gate as the plaque toggles above.
  for (const surface of Object.keys(cells.pi)) {
    const btn = cells.pi[surface];
    if (!btn) continue;
    const grade = getPlaqueIndex(toothNo, surface);
    btn.textContent = GRADE_FACE[grade] ?? "–";
    btn.dataset.grade = String(grade);
    btn.setAttribute("aria-pressed", grade > 0 ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  for (const surface of Object.keys(cells.gi)) {
    const btn = cells.gi[surface];
    if (!btn) continue;
    const grade = getGingivalIndex(toothNo, surface);
    btn.textContent = GRADE_FACE[grade] ?? "–";
    btn.dataset.grade = String(grade);
    btn.setAttribute("aria-pressed", grade > 0 ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  // SP-perio PG-E Task 2: mPI/mBI per-surface grade buttons — mirror PI/GI's
  // value sync exactly, but IMPLANT-GATED: active only on an implant tooth
  // (`isToothImplant`, status/plan aware — mirrors `setSurfaceGrade`'s own
  // implant guard in odontogram.ts). Deliberately NOT gated on `hidden`
  // (`isPerioRowHidden`) like every other row above — that predicate hides
  // implant teeth precisely because they have no periodontal PROBING site,
  // the opposite of what these peri-implant indices need; it still respects
  // the global readOnly lock.
  const implant = isToothImplant(toothNo);
  for (const surface of Object.keys(cells.mpi)) {
    const btn = cells.mpi[surface];
    if (!btn) continue;
    const grade = getPeriImplantPlaque(toothNo, surface);
    btn.textContent = GRADE_FACE[grade] ?? "–";
    btn.dataset.grade = String(grade);
    btn.setAttribute("aria-pressed", grade > 0 ? "true" : "false");
    btn.disabled = readOnly || !implant;
  }
  for (const surface of Object.keys(cells.mbi)) {
    const btn = cells.mbi[surface];
    if (!btn) continue;
    const grade = getPeriImplantBleeding(toothNo, surface);
    btn.textContent = GRADE_FACE[grade] ?? "–";
    btn.dataset.grade = String(grade);
    btn.setAttribute("aria-pressed", grade > 0 ? "true" : "false");
    btn.disabled = readOnly || !implant;
  }
  // SP-perio PG-D Task 4: KG — a single per-tooth mm number input (mirrors
  // the pd/gm inputs' omit-when-empty value sync).
  if (cells.kg) {
    const mm = getKeratinizedWidth(toothNo);
    cells.kg.value = mm === null ? "" : String(mm);
    cells.kg.disabled = readOnly || hidden;
  }
  // SP-perio PG-D Task 4: gingivalThickness / millerClass cycle buttons —
  // mirror cejVisibility/rootConcavity above exactly.
  if (cells.gingivalThickness) {
    const value = getGingivalThickness(toothNo);
    const btn = cells.gingivalThickness;
    btn.textContent = GINGIVAL_THICKNESS_FACE[value] ?? "–";
    btn.dataset.value = value;
    btn.setAttribute("aria-pressed", value !== "unknown" ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  if (cells.millerClass) {
    const value = getMillerClass(toothNo);
    const btn = cells.millerClass;
    btn.textContent = MILLER_CLASS_FACE[value] ?? "–";
    btn.dataset.value = value;
    btn.setAttribute("aria-pressed", value !== "none" ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
}

/** One arch band's built grid plus the two placeholder cells the buccal/
 *  palatal tooth-row graphic SVGs are injected into (UI-3a Task 2 — each
 *  spans all tooth columns; `buccalCell` sits above the central perio index
 *  band (Plaque/PI/GI/mPI/mBI), `palatalCell` below it). Exported so Task
 *  4's `PerioChartComponent` can type its own refs to these cells. */
export type BuiltArch = { grid: HTMLDivElement; buccalCell: HTMLDivElement; palatalCell: HTMLDivElement };

/** Build ONE tooth's field cell for a given field/site-set — the SAME cell +
 *  `data-perio` locator + `change`-listener wiring, reused by both the
 *  buccal-aspect rows (built ABOVE the graphic) and the palatal-aspect rows
 *  (built BELOW it). Every id / `dataset.perio` is byte-identical to the
 *  source TSX — the keyboard + sync code locates cells by these. */
export function buildFieldCell(
  toothNo: number,
  field: "pd" | "gm" | "cal" | "bop",
  sites: readonly PerioSite[],
  aspect: "buccal" | "palatal",
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell");
  cell.dataset.perioAspect = aspect;
  cell.dataset.perioField = field;
  const group = mkEl("div", "perio-fullgrid-sitegroup");
  for (const site of sites) {
    if (field === "cal") {
      const span = mkEl("span", "perio-fullgrid-cal");
      span.id = `perio-fg-cal-${toothNo}-${site}`;
      group.appendChild(span);
      cells.cal[site] = span;
    } else if (field === "bop") {
      const input = mkEl("input", "perio-fullgrid-bop");
      input.type = "checkbox";
      input.id = `perio-fg-bop-${toothNo}-${site}`;
      input.title = t(`perio.site.${site}`);
      input.dataset.perio = `${toothNo}:${site}:bop`;
      input.addEventListener("change", () => handlers.onBop(toothNo, site, input.checked));
      group.appendChild(input);
      cells.bop[site] = input;
    } else if (field === "pd") {
      const input = mkEl("input", "perio-fullgrid-input");
      input.type = "number";
      input.min = "1";
      input.max = "15";
      input.step = "1";
      input.id = `perio-fg-pd-${toothNo}-${site}`;
      input.title = t(`perio.site.${site}`);
      input.dataset.perio = `${toothNo}:${site}:pd`;
      input.addEventListener("change", () => handlers.onPd(toothNo, site, input.value));
      group.appendChild(input);
      cells.pd[site] = input;
    } else {
      const input = mkEl("input", "perio-fullgrid-input");
      input.type = "number";
      input.min = "-10";
      input.max = "20";
      input.step = "1";
      input.id = `perio-fg-gm-${toothNo}-${site}`;
      input.title = t(`perio.site.${site}`);
      input.dataset.perio = `${toothNo}:${site}:gm`;
      input.addEventListener("change", () => handlers.onGm(toothNo, site, input.value));
      group.appendChild(input);
      cells.gm[site] = input;
    }
  }
  cell.appendChild(group);
  return cell;
}

/** SP-perio P2b Task 4: build ONE tooth's FURCATION cell — a compact
 *  cycle-button per {@link furcationEntrances} entrance (Glickman none->I->
 *  II->III->IV->none on click, via the caller's `onFurcation`). A tooth with
 *  NO furcated entrance for its position, OR one whose perio rows are hidden
 *  (missing / implant / under-gum / extraction — `isPerioRowHidden`), gets an
 *  EMPTY cell (no controls at all — furcation involvement only exists on a
 *  present, furcated tooth). The cell still occupies the tooth's grid column
 *  so the row stays column-aligned with the teeth. */
export function buildFurcationCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-furcation");
  cell.dataset.perioField = "furcation";
  const entrances = furcationEntrances(toothNo);
  if (entrances.length === 0 || isPerioRowHidden(toothNo)) return cell; // empty placeholder
  const group = mkEl("div", "perio-fullgrid-sitegroup");
  for (const entrance of entrances) {
    const btn = mkEl("button", "perio-fullgrid-furc");
    btn.type = "button";
    btn.id = `perio-fg-furc-${toothNo}-${entrance}`;
    btn.dataset.furcEntrance = entrance;
    btn.title = t(`furcation.entrance.${entrance}`);
    btn.setAttribute("aria-label", t(`furcation.entrance.${entrance}`));
    btn.addEventListener("click", () => handlers.onFurcation(toothNo, entrance));
    group.appendChild(btn);
    cells.furcation[entrance] = btn;
  }
  cell.appendChild(group);
  return cell;
}

/** SP-perio P2b Task 4: build ONE tooth's PLAQUE cell — a 4-quadrant mark of
 *  toggle buttons (mesial/distal/buccal/lingual), each flipping O'Leary plaque
 *  presence for that surface via the caller's `onPlaque` on click. Built for
 *  EVERY tooth (the 4 surfaces are the same fixed set regardless of position)
 *  and disabled on a non-present tooth via `syncToothCells`, mirroring the
 *  PD/GM rows. */
export function buildPlaqueCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-plaque");
  cell.dataset.perioField = "plaque";
  const group = mkEl("div", "perio-fullgrid-plaque-quad");
  for (const surface of PLAQUE_SURFACES) {
    const btn = mkEl("button", `perio-fullgrid-plaque perio-fullgrid-plaque-${surface}`);
    btn.type = "button";
    btn.id = `perio-fg-plaque-${toothNo}-${surface}`;
    btn.dataset.plaqueSurface = surface;
    btn.style.gridArea = diamondGridArea(surface, toothNo);
    btn.title = t(`surface.${surface}`);
    btn.setAttribute("aria-label", t(`surface.${surface}`));
    btn.addEventListener("click", () => handlers.onPlaque(toothNo, surface));
    group.appendChild(btn);
    cells.plaque[surface] = btn;
  }
  cell.appendChild(group);
  return cell;
}

/** SP-perio PG-C Task 3: build ONE tooth's CEJ-VISIBILITY cell — a single
 *  compact cycle button (none -> detectable -> not-detectable -> none on
 *  click, via the caller's `onCejVisibility`). Built for EVERY tooth (mirrors
 *  the mobility select below — this axis applies to any present tooth, not
 *  just a furcated-position subset) and disabled on a hidden-row tooth
 *  (missing / implant / under-gum / extraction — `isPerioRowHidden`) via
 *  `syncToothCells`, the same gate PD/GM/mobility use. */
export function buildCejVisibilityCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-cej");
  cell.dataset.perioField = "cejVisibility";
  const btn = mkEl("button", "perio-fullgrid-cej") as HTMLButtonElement;
  btn.type = "button";
  btn.id = `perio-fg-cej-${toothNo}`;
  btn.title = t("perio.cej.label");
  btn.setAttribute("aria-label", t("perio.cej.label"));
  btn.addEventListener("click", () => handlers.onCejVisibility(toothNo));
  cell.appendChild(btn);
  cells.cejVisibility = btn;
  return cell;
}

/** SP-perio PG-C Task 3: build ONE tooth's ROOT-CONCAVITY cell — mirrors
 *  {@link buildCejVisibilityCell} exactly (none -> mild -> deep -> none via
 *  the caller's `onRootConcavity`). */
export function buildRootConcavityCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-rootconcavity");
  cell.dataset.perioField = "rootConcavity";
  const btn = mkEl("button", "perio-fullgrid-rootconcavity") as HTMLButtonElement;
  btn.type = "button";
  btn.id = `perio-fg-rootconcavity-${toothNo}`;
  btn.title = t("perio.rootConcavity.label");
  btn.setAttribute("aria-label", t("perio.rootConcavity.label"));
  btn.addEventListener("click", () => handlers.onRootConcavity(toothNo));
  cell.appendChild(btn);
  cells.rootConcavity = btn;
  return cell;
}

/** SP-perio PG-D Task 4: build ONE tooth's PI or GI cell — a 4-quadrant mark
 *  of cycle buttons (mesial/distal/buccal/lingual, mirrors
 *  {@link buildPlaqueCell}'s shape exactly), each cycling its own 0->1->2->3->0
 *  grade via the caller's `onPiSurface`/`onGiSurface` on click. Built for
 *  EVERY tooth (the 4 surfaces are the same fixed set regardless of position)
 *  and disabled on a hidden-row tooth via `syncToothCells`, mirroring the
 *  plaque toggles.
 *  SP-perio PG-E Task 2 reuses this exact builder for "mpi"/"mbi" (Mombelli
 *  modified Plaque/Bleeding indices, `onMpiSurface`/`onMbiSurface`) — same
 *  4-surface shape, but built for EVERY tooth and gated ACTIVE-only-on-an-
 *  implant in `syncToothCells` (opposite of the hidden-row gate PI/GI/plaque
 *  use, since implants are exactly the teeth those axes disable). */
export function buildGradeCell(
  toothNo: number,
  mapKey: "pi" | "gi" | "mpi" | "mbi",
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", `perio-fullgrid-cell perio-fullgrid-cell-${mapKey}`);
  cell.dataset.perioField = mapKey;
  const group = mkEl("div", "perio-fullgrid-plaque-quad");
  const onSurface =
    mapKey === "pi" ? handlers.onPiSurface :
    mapKey === "gi" ? handlers.onGiSurface :
    mapKey === "mpi" ? handlers.onMpiSurface :
    handlers.onMbiSurface;
  const registry =
    mapKey === "pi" ? cells.pi :
    mapKey === "gi" ? cells.gi :
    mapKey === "mpi" ? cells.mpi :
    cells.mbi;
  for (const surface of PLAQUE_SURFACES) {
    const btn = mkEl("button", `perio-fullgrid-${mapKey} perio-fullgrid-${mapKey}-${surface}`);
    btn.type = "button";
    btn.id = `perio-fg-${mapKey}-${toothNo}-${surface}`;
    btn.dataset.gradeSurface = surface;
    btn.style.gridArea = diamondGridArea(surface, toothNo);
    btn.title = t(`surface.${surface}`);
    btn.setAttribute("aria-label", t(`surface.${surface}`));
    btn.addEventListener("click", () => onSurface(toothNo, surface));
    group.appendChild(btn);
    registry[surface] = btn;
  }
  cell.appendChild(group);
  return cell;
}

/** SP-perio PG-D Task 4: build ONE tooth's KG (keratinized gingiva width)
 *  cell — a single per-tooth mm number input (0-15, empty clears), mirroring
 *  the pd/gm cells' `<input type="number">` shape but with NO site
 *  subdivision (mirrors the mobility cell's one-per-tooth shape). Writes go
 *  through the caller's `onKg` on `change`, like the pd/gm inputs. */
export function buildKgCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-kg");
  cell.dataset.perioField = "kg";
  const input = mkEl("input", "perio-fullgrid-input perio-fullgrid-kg") as HTMLInputElement;
  input.type = "number";
  input.min = "0";
  input.max = "15";
  input.step = "1";
  input.id = `perio-fg-kg-${toothNo}`;
  input.title = t("perio.kg.row");
  input.addEventListener("change", () => handlers.onKg(toothNo, input.value));
  cell.appendChild(input);
  cells.kg = input;
  return cell;
}

/** SP-perio PG-D Task 4: build ONE tooth's gingival-thickness (GT) cell — a
 *  single compact cycle button (unknown -> thin -> medium -> thick -> unknown
 *  on click, via the caller's `onGingivalThickness`). Mirrors
 *  {@link buildCejVisibilityCell} exactly. */
export function buildGingivalThicknessCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-gt");
  cell.dataset.perioField = "gingivalThickness";
  const btn = mkEl("button", "perio-fullgrid-gt") as HTMLButtonElement;
  btn.type = "button";
  btn.id = `perio-fg-gt-${toothNo}`;
  btn.title = t("perio.gt.row");
  btn.setAttribute("aria-label", t("perio.gt.row"));
  btn.addEventListener("click", () => handlers.onGingivalThickness(toothNo));
  cell.appendChild(btn);
  cells.gingivalThickness = btn;
  return cell;
}

/** SP-perio PG-D Task 4: build ONE tooth's Miller-class cell — mirrors
 *  {@link buildGingivalThicknessCell} exactly (none -> i -> ii -> iii -> iv ->
 *  none via the caller's `onMillerClass`). */
export function buildMillerClassCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-miller");
  cell.dataset.perioField = "millerClass";
  const btn = mkEl("button", "perio-fullgrid-miller") as HTMLButtonElement;
  btn.type = "button";
  btn.id = `perio-fg-miller-${toothNo}`;
  btn.title = t("perio.miller.row");
  btn.setAttribute("aria-label", t("perio.miller.row"));
  btn.addEventListener("click", () => handlers.onMillerClass(toothNo));
  cell.appendChild(btn);
  cells.millerClass = btn;
  return cell;
}

/**
 * Build ONE arch band, laid out buccal-graphic-top → central perio index
 * band → palatal-graphic-bottom (UI-3a Task 2): the tooth-number header and
 * the Miller-class row sit at the very top (near the buccal aspect), then
 * the buccal-aspect number rows (PD innermost / nearest the teeth), the
 * furcation row, the BUCCAL tooth graphic (`buccalCell`), a band-orientation
 * legend, the central index band (Plaque → PI → GI → mPI → mBI), the
 * PALATAL tooth graphic (`palatalCell`), the palatal-aspect number rows,
 * mobility, and the remaining mucogingival/support rows (CEJ visibility,
 * root concavity, KG, GT) at the foot. Everything shares ONE CSS grid
 * (`ROW_LABEL_WIDTH` label column + one column per tooth), so both tooth
 * graphics (each spanning tracks 2..N+1) and every number column line up in
 * the same coordinate space — the columns are widened to the real per-tooth
 * arch-layout widths once the template cache loads (`applyArchColumns`).
 * Reuses `buildFieldCell` for the number rows; built ONCE per active session
 * by the caller (Task 4's `PerioChartComponent` effect).
 */
export function buildArch(teeth: readonly number[], registry: Map<number, ToothCellRefs>, handlers: GridHandlers): BuiltArch {
  const arch = mkEl("div", "perio-fullgrid-arch");
  arch.style.gridTemplateColumns = `${ROW_LABEL_WIDTH}px repeat(${teeth.length}, ${PROVISIONAL_COL_WIDTH}px)`;
  const isUpper = teeth.length > 0 && isUpperTooth(teeth[0]);
  // UI-2 Task 2: per-index row visibility (Settings -> Periodontal tab). Read
  // ONCE per build — a rebuild is triggered by the caller whenever the
  // underlying flag changes. The tooth-number header + the tooth graphic
  // (below) are NEVER gated.
  const visible = getPerioRowVisibility();
  // UI-3b Task 3: the peri-implant Mombelli indices (mPI/mBI) are meaningless
  // without an implant, so their rows only render in an arch that has at
  // least one implant tooth. Per-arch because buildArch runs once per arch
  // (upper/lower) — an upper-only implant must not show a phantom lower row.
  const archHasImplant = teeth.some((n) => isToothImplant(n));
  // UI-2 Task 3: every row-label text below goes through `indexName(id)`
  // (`core/perioIndexNames.ts`) instead of a raw `t(...)` call, so a row's
  // NAME switches between the localized string and a fixed English/Latin
  // canonical form per `getPerioIndexNameMode()`. The `infoKey` (2nd arg to
  // `mkRowLabelCell`) is UNCHANGED — tooltips stay `t("perio.info.*")` in
  // both modes. A mode flip is part of the same rebuild trigger as row
  // visibility (see the caller's rebuild-signature snapshot), since this
  // function reads the mode once per build, same as `visible` above.

  // Initialise every tooth's cell registry up front — the buccal rows built
  // below reference these before the header row (which used to create them).
  for (const toothNo of teeth) {
    registry.set(toothNo, {
      pd: {}, gm: {}, bop: {}, cal: {}, mobility: null, furcation: {}, plaque: {},
      cejVisibility: null, rootConcavity: null,
      pi: {}, gi: {}, kg: null, gingivalThickness: null, millerClass: null,
      mpi: {}, mbi: {},
    });
  }

  const buccalLabel = t("perio.buccal");
  const lingualLabel = isUpper ? t("perio.palatal") : t("perio.lingual");

  // Append one full field row (label cell + one field cell per tooth). The
  // row-label's info button always wires to `perio.info.<field>` — PD/GM/CAL/
  // BOP each has exactly ONE explanation, shared by both its buccal- and
  // palatal-aspect rows (SP-perio PG-B Task 1).
  const appendFieldRow = (
    field: "pd" | "gm" | "cal" | "bop",
    sites: readonly PerioSite[],
    aspect: "buccal" | "palatal",
    label: string,
  ) => {
    arch.appendChild(mkRowLabelCell(label, `perio.info.${field}`));
    for (const toothNo of teeth) {
      arch.appendChild(buildFieldCell(toothNo, field, sites, aspect, registry.get(toothNo)!, handlers));
    }
  };

  // --- Tooth-number header row, at the very top of the arch ---
  arch.appendChild(mkRowLabelCell(""));
  for (const toothNo of teeth) {
    const header = mkEl("div", "perio-fullgrid-header-cell");
    header.setAttribute("data-perio-tooth-header", String(toothNo));
    header.textContent = formatToothLabel(toothNo);
    arch.appendChild(header);
  }

  // --- Miller-class row (single per-tooth cycle button) — UI-3a Task 2 moves
  //     this to the top buccal area (recession classification reads next to
  //     the tooth numbers, closest to the buccal aspect it's measured on). ---
  if (visible.miller) {
    arch.appendChild(mkRowLabelCell(indexName("miller"), "perio.info.miller"));
    for (const toothNo of teeth) {
      arch.appendChild(buildMillerClassCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  // --- Buccal-aspect rows, ABOVE the graphic (PD innermost / nearest teeth) ---
  // UI-2 Task 3: the aspect qualifier (buccal/palatal/lingual) stays
  // translated in BOTH name modes — only the index NAME (`indexName(...)`)
  // switches between `t(...)` and the canonical form.
  if (visible.bop) appendFieldRow("bop", BUCCAL_SITES, "buccal", `${buccalLabel} ${indexName("bop")}`);
  if (visible.cal) appendFieldRow("cal", BUCCAL_SITES, "buccal", `${buccalLabel} ${indexName("cal")}`);
  if (visible.gm) appendFieldRow("gm", BUCCAL_SITES, "buccal", `${buccalLabel} ${indexName("gm")}`);
  if (visible.pd) appendFieldRow("pd", BUCCAL_SITES, "buccal", `${buccalLabel} ${indexName("pd")}`);

  // --- Furcation row, nearest the teeth (just above the buccal graphic) ---
  if (visible.furcation) {
    arch.appendChild(mkRowLabelCell(indexName("furcation"), "perio.info.furcation"));
    for (const toothNo of teeth) {
      arch.appendChild(buildFurcationCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  // --- BUCCAL tooth-row graphic cell: spans all tooth columns, crown-DOWN,
  //     filled by the caller's graphic effect once the template cache loads.
  //     An empty sticky label cell keeps the label column continuous. ---
  arch.appendChild(mkRowLabelCell(""));
  const buccalCell = mkEl("div", "perio-fullgrid-graphic-cell");
  buccalCell.dataset.perioArch = isUpper ? "upper" : "lower";
  buccalCell.dataset.perioAspect = "buccal";
  buccalCell.style.gridColumn = "2 / -1";
  arch.appendChild(buccalCell);

  // --- Band-orientation legend: a larger-font row marking the central
  //     index band's buccal (top, adjacent to the graphic above) / lingual-
  //     palatal (bottom, adjacent to the graphic below) anatomy. Chrome only
  //     (like the header/graphic placeholder rows above) — its row-label
  //     cell stays EMPTY and carries no info button, so it is never gated by
  //     `getPerioRowVisibility()` and never shows up in a row-label-text
  //     collection alongside the real index rows. ---
  arch.appendChild(mkRowLabelCell(""));
  const bandLabelTop = mkEl("div", "perio-fullgrid-band-label");
  bandLabelTop.style.gridColumn = "2 / -1";
  bandLabelTop.setAttribute("role", "note");
  bandLabelTop.setAttribute("aria-label", t("perio.band.title"));
  const bandBuccal = mkEl("span", "perio-fullgrid-band-label-buccal");
  bandBuccal.textContent = `▲ ${t("perio.band.buccal")} ▲`;
  bandLabelTop.appendChild(bandBuccal);
  arch.appendChild(bandLabelTop);

  // --- Central perio index band: Plaque -> PI -> GI -> mPI -> mBI, between
  //     the buccal and palatal graphics (UI-3a Task 2). ---
  if (visible.plaque) {
    arch.appendChild(mkRowLabelCell(indexName("plaque"), "perio.info.plaque"));
    for (const toothNo of teeth) {
      arch.appendChild(buildPlaqueCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  // --- PI row (Silness-Löe Plaque Index, per-surface graded 0-3) — mirrors
  //     the O'Leary plaque row's 4-quadrant shape (SP-perio PG-D Task 4). ---
  if (visible.pi) {
    arch.appendChild(mkRowLabelCell(indexName("pi"), "perio.info.pi"));
    for (const toothNo of teeth) {
      arch.appendChild(buildGradeCell(toothNo, "pi", registry.get(toothNo)!, handlers));
    }
  }

  // --- GI row (Löe-Silness Gingival Index, per-surface graded 0-3). ---
  if (visible.gi) {
    arch.appendChild(mkRowLabelCell(indexName("gi"), "perio.info.gi"));
    for (const toothNo of teeth) {
      arch.appendChild(buildGradeCell(toothNo, "gi", registry.get(toothNo)!, handlers));
    }
  }

  // --- mPI row (Mombelli modified Plaque Index, implant-only, per-surface
  //     graded 0-3 — SP-perio PG-E Task 2). Built for EVERY tooth like PI/GI,
  //     but the cells are only ACTIVE on an implant tooth (see syncToothCells). ---
  if (visible.mpi && archHasImplant) {
    arch.appendChild(mkRowLabelCell(indexName("mpi"), "perio.info.mpi"));
    for (const toothNo of teeth) {
      arch.appendChild(buildGradeCell(toothNo, "mpi", registry.get(toothNo)!, handlers));
    }
  }

  // --- mBI row (Mombelli modified sulcus Bleeding Index, implant-only). ---
  if (visible.mbi && archHasImplant) {
    arch.appendChild(mkRowLabelCell(indexName("mbi"), "perio.info.mbi"));
    for (const toothNo of teeth) {
      arch.appendChild(buildGradeCell(toothNo, "mbi", registry.get(toothNo)!, handlers));
    }
  }

  // --- Band-orientation legend (bottom): the lingual/palatal edge of the
  //     central index band, adjacent to the palatal graphic below. Centered,
  //     mirroring the buccal legend at the top of the band. ---
  arch.appendChild(mkRowLabelCell(""));
  const bandLabelBottom = mkEl("div", "perio-fullgrid-band-label");
  bandLabelBottom.style.gridColumn = "2 / -1";
  bandLabelBottom.setAttribute("role", "note");
  bandLabelBottom.setAttribute("aria-label", t("perio.band.title"));
  const bandLingual = mkEl("span", "perio-fullgrid-band-label-lingual");
  bandLingual.textContent = `▼ ${t("perio.band.lingual")} ▼`;
  bandLabelBottom.appendChild(bandLingual);
  arch.appendChild(bandLabelBottom);

  // --- PALATAL tooth-row graphic cell: spans all tooth columns, crown-UP,
  //     filled by the caller's graphic effect once the template cache loads. ---
  arch.appendChild(mkRowLabelCell(""));
  const palatalCell = mkEl("div", "perio-fullgrid-graphic-cell");
  palatalCell.dataset.perioArch = isUpper ? "upper" : "lower";
  palatalCell.dataset.perioAspect = "palatal";
  palatalCell.style.gridColumn = "2 / -1";
  arch.appendChild(palatalCell);

  // --- Palatal-aspect rows, BELOW the graphic (PD innermost / nearest teeth) ---
  if (visible.pd) appendFieldRow("pd", LINGUAL_SITES, "palatal", `${lingualLabel} ${indexName("pd")}`);
  if (visible.gm) appendFieldRow("gm", LINGUAL_SITES, "palatal", `${lingualLabel} ${indexName("gm")}`);
  if (visible.cal) appendFieldRow("cal", LINGUAL_SITES, "palatal", `${lingualLabel} ${indexName("cal")}`);
  if (visible.bop) appendFieldRow("bop", LINGUAL_SITES, "palatal", `${lingualLabel} ${indexName("bop")}`);

  // --- Mobility row: one select per tooth, no site subdivision. ---
  if (visible.mobility) {
    arch.appendChild(mkRowLabelCell(indexName("mobility"), "perio.info.mobility"));
    const mobilityOptions = optionsFor("mobility").map((o) => ({ value: o.value, label: t(o.labelKey) }));
    for (const toothNo of teeth) {
      const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-mobility");
      const select = mkEl("select", "perio-fullgrid-mobility-select");
      select.id = `perio-fg-mobility-${toothNo}`;
      for (const opt of mobilityOptions) {
        const optionEl = mkEl("option");
        optionEl.value = opt.value;
        optionEl.textContent = opt.label;
        select.appendChild(optionEl);
      }
      select.addEventListener("change", () => handlers.onMobility(toothNo, select.value));
      cell.appendChild(select);
      arch.appendChild(cell);
      registry.get(toothNo)!.mobility = select;
    }
  }

  // --- CEJ-visibility row: single per-tooth cycle button, no site
  //     subdivision (SP-perio PG-C Task 3 — mirrors the mobility row above). ---
  if (visible.cej) {
    arch.appendChild(mkRowLabelCell(indexName("cej"), "perio.info.cej"));
    for (const toothNo of teeth) {
      arch.appendChild(buildCejVisibilityCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  // --- Root-concavity row: mirrors the CEJ-visibility row above. ---
  if (visible.rootConcavity) {
    arch.appendChild(mkRowLabelCell(indexName("rootConcavity"), "perio.info.rootConcavity"));
    for (const toothNo of teeth) {
      arch.appendChild(buildRootConcavityCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  // --- KG row (keratinized gingiva width, single per-tooth mm cell). ---
  if (visible.kg) {
    arch.appendChild(mkRowLabelCell(indexName("kg"), "perio.info.kg"));
    for (const toothNo of teeth) {
      arch.appendChild(buildKgCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  // --- GT row (gingival thickness, single per-tooth cycle button). ---
  if (visible.gt) {
    arch.appendChild(mkRowLabelCell(indexName("gt"), "perio.info.gt"));
    for (const toothNo of teeth) {
      arch.appendChild(buildGingivalThicknessCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  return { grid: arch, buccalCell, palatalCell };
}

// UI-1 Task 3b: a small allowance subtracted from the measured scroll
// container width before fitting columns to it, so the fitted columns never
// sit exactly flush with the container edge (which could otherwise trip a
// horizontal scrollbar into existing JUST from its own width, oscillating
// between fitting and not).
const GRID_SCROLLBAR_ALLOWANCE = 2;

/** Widen an already-built arch grid's tooth columns to the real per-tooth
 *  arch-layout widths (viewBox width + `TOOTH_GAP`, baked in — NO CSS
 *  column-gap — so the cumulative column edges match the arch SVG's per-tooth
 *  x positions exactly, with no progressive drift), scaled by a DYNAMIC
 *  fill-scale (UI-1 Task 3b) so the arch fills the available width of
 *  `scrollContainer` instead of a fixed scale. Called once the template
 *  cache loads AND on every resize of `scrollContainer` (the caller's
 *  `ResizeObserver`), so a tooth's number columns keep sitting directly
 *  under/over that tooth in the graphic at any width. `scrollContainer` is
 *  the scroll div (NOT the grid itself — the grid's own width is a computed
 *  OUTPUT of this function, so measuring it here would be circular / risk a
 *  resize feedback loop); its width is driven by the surrounding flex
 *  layout, not by this grid's content (`overflow: auto` on the scroll
 *  container absorbs any column overflow), so reading `clientWidth` here
 *  never reacts to the change this function itself makes. A `null`/
 *  unmounted/zero-width container (including jsdom, which never lays out
 *  `clientWidth`) measures as `0`, which `computeFillScale` clamps down to
 *  `MIN_FILL_SCALE` — reproducing a fixed layout when width can't be
 *  measured. */
export function applyArchColumns(
  grid: HTMLElement | null,
  teeth: readonly number[],
  cache: TemplateDocCache,
  scrollContainer: HTMLElement | null,
): void {
  if (!grid) return;
  const layout = archToothLayout(cache, teeth);
  if (layout.teeth.length === 0) return;
  const containerWidth = scrollContainer?.clientWidth ?? 0;
  const available = containerWidth - ROW_LABEL_WIDTH - GRID_SCROLLBAR_ALLOWANCE;
  const fillScale = computeFillScale(available, layout.totalWidth);
  // Scale each tooth column by the fitted `fillScale`: the arch SVG fills the
  // graphic cell these columns span (CSS `width:100%`, no fixed width), so
  // scaling the columns scales the rendered teeth to match — one shared
  // layout (teeth/curve/overlays/mm-grid all derive from the SAME
  // `archToothLayout` + this one scale), columns stay locked to the teeth
  // (no divergent geometry).
  const cols = layout.teeth
    .map((tooth) => `${((tooth.width + TOOTH_GAP) * fillScale).toFixed(3)}px`)
    .join(" ");
  grid.style.gridTemplateColumns = `${ROW_LABEL_WIDTH}px ${cols}`;
}
