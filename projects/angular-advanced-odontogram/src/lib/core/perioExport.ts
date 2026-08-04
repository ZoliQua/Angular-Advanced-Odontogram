// Part of React Odontogram Modul - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// UI-3b Task 4: `buildPerioSvg()` — the FULL perio chart (teeth graphic +
// numeric rows + 2017 classification) rendered as ONE standalone vector SVG,
// built headlessly from state (NOT from the mounted `PerioChart` DOM). Tasks
// 5/6 (`exportPerioSvg`/`exportPerioImage`, then `exportPdf`) consume this.
//
// Reuses `perioGraphic.ts`'s existing builders (`archToothLayout`,
// `buildBuccalArchSvg`/`buildPalatalArchSvg`, `perioCurve`/
// `buildPerioCurveLayer`, `loadTemplateCache`) — the SAME template cache
// loader `PerioChart.tsx` awaits, so a load failure (no network / templates
// unavailable) is handled identically: this module returns `null` rather
// than throwing, mirroring `PerioChart.tsx`'s own `.catch` swallow (the
// graphic is a presentation enhancement, never a hard dependency).
//
// The numeric rows and the 2017-classification block are emitted as native
// `<text>` elements positioned via the SAME `archToothLayout(cache,
// teeth).teeth[i].x/width` columns the arch SVGs themselves are built from —
// one shared geometry, so a tooth's numbers always sit under/over that same
// tooth's crown, exactly like the live `PerioChart` grid's columns
// (`applyArchColumns`) track the arch SVG. Row ORDER and VALUE SOURCES
// mirror `PerioChart.tsx`'s `buildArch` exactly: tooth-number header, Miller,
// buccal BOP/CAL/GM/PD, furcation, the buccal arch graphic + curve, the
// central band (Plaque/PI/GI/mPI/mBI), the palatal arch graphic + curve,
// palatal PD/GM/CAL/BOP, mobility, CEJ visibility, root concavity, KG, GT —
// gated the SAME way: `getPerioRowVisibility()` per row, `indexName()` for
// row labels, and the T3 mPI/mBI implant-gate (`teeth.some(isToothImplant)`
// per arch, from `ui3b-mpi-implant-gate.test.ts`).
//
// A charted/graded value renders only when it is actually CHARTED — mirrors
// this module's own `perioOverlayMarks`/`perioGradeMarks`/`perioKgMarks`
// convention throughout `perioGraphic.ts` ("absence = not charted, never a
// mark"): an uncharted site/surface/axis emits no `<text>` at all, rather
// than a placeholder dash, keeping the exported vector clean.
import {
  archToothLayout,
  buildBuccalArchSvg,
  buildPalatalArchSvg,
  buildPerioCurveLayer,
  perioCurve,
  loadTemplateCache,
  PERIO_MM_PX,
  type ArchLayout,
  type PerioCurveSite,
  type TemplateDocCache,
} from "./perioGraphic";
import {
  isToothImplant,
  getPerioRowVisibility,
  getToothPerio,
  getToothCal,
  getPerioClassification,
  isPerioRowHidden,
  furcationEntrances,
  getToothFurcation,
  getToothPlaque,
  getPlaqueIndex,
  getGingivalIndex,
  getPeriImplantPlaque,
  getPeriImplantBleeding,
  getCejVisibility,
  getRootConcavity,
  getKeratinizedWidth,
  getGingivalThickness,
  getMillerClass,
  getToothMobility,
  isUpperTooth,
  formatToothLabel,
  type PerioSite,
} from "./odontogram";
import { indexName } from "./perioIndexNames";
import { t } from "./i18n/useI18n";

const SVG_NS = "http://www.w3.org/2000/svg";

// Neither array is exported from odontogram.ts/perioGraphic.ts — this
// mirrors the SAME module-local duplication `PerioChart.tsx` and
// `bridgeOverlay.ts` already carry (see their own "Mirrors ALL_TEETH..."
// comments); array-adjacent == visually adjacent within an arch.
const UPPER_ARCH: readonly number[] = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ARCH: readonly number[] = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// Mirrors PerioChart.tsx's own module-local `BUCCAL_SITES`/`LINGUAL_SITES`
// literals (same module-eval-safety precedent — see that file's comment).
const BUCCAL_SITES: readonly PerioSite[] = ["MB", "B", "DB"];
const LINGUAL_SITES: readonly PerioSite[] = ["ML", "L", "DL"];

// Mirrors PerioChart.tsx's `PLAQUE_SURFACES` (the 4 fixed O'Leary surfaces
// shared by plaque/PI/GI/mPI/mBI).
const PLAQUE_SURFACES: readonly string[] = ["mesial", "distal", "buccal", "lingual"];

// Compact display faces for the categorical/graded rows — mirror
// PerioChart.tsx's own PRIVATE face maps (`FURCATION_ROMAN`, `GRADE_FACE`,
// `CEJ_VISIBILITY_FACE`, `ROOT_CONCAVITY_FACE`, `GINGIVAL_THICKNESS_FACE`,
// `MILLER_CLASS_FACE`) — duplicated here for the same reason that file
// doesn't export them (display-only, not a shared API): this module renders
// its OWN standalone `<text>`, never the live grid's cycle-button labels.
const FURCATION_ROMAN: readonly string[] = ["–", "I", "II", "III", "IV"];
const GRADE_FACE: Record<number, string> = { 1: "1", 2: "2", 3: "3" };
const MOBILITY_FACE: Record<string, string> = { m1: "1", m2: "2", m3: "3" };
const CEJ_FACE: Record<string, string> = { detectable: "D", "not-detectable": "ND" };
const ROOT_CONCAVITY_FACE: Record<string, string> = { mild: "Mi", deep: "Dp" };
const GT_FACE: Record<string, string> = { thin: "Tn", medium: "Md", thick: "Tk" };
const MILLER_FACE: Record<string, string> = { i: "I", ii: "II", iii: "III", iv: "IV" };

/** Left column width (svg user units) reserved for the row-label text —
 *  mirrors `PerioChart.tsx`'s `ROW_LABEL_WIDTH` role (a fixed sticky-label
 *  track), just in this module's own coordinate scale (row-local units, not
 *  px), so a wide label ("Peri-implant Bleeding Index (mBI)") still has room
 *  before the tooth columns start at `LABEL_WIDTH`. */
const LABEL_WIDTH = 150;
/** Fixed vertical advance (svg user units) per numeric row. */
const ROW_HEIGHT = 10;
/** Font size (svg user units) for every row-label/value `<text>`. */
const ROW_FONT_SIZE = 6;
/** Extra vertical gap (svg user units) between one arch's block and the next
 *  (or the trailing classification block). */
const SECTION_GAP = 6;

/** Trim trailing float noise for readable coordinate strings (purely
 *  cosmetic — mirrors `perioGraphic.ts`'s own `fmt`). */
function fmt(n: number): string {
  return Number(n.toFixed(3)).toString();
}

function text(x: number, y: number, content: string, anchor: "start" | "middle" | "end" = "middle"): SVGTextElement {
  const el = document.createElementNS(SVG_NS, "text") as unknown as SVGTextElement;
  el.setAttribute("x", fmt(x));
  el.setAttribute("y", fmt(y));
  el.setAttribute("font-size", String(ROW_FONT_SIZE));
  el.setAttribute("text-anchor", anchor);
  el.textContent = content;
  return el;
}

function appendRowLabel(root: Element, y: number, label: string): void {
  if (!label) return;
  root.appendChild(text(4, y, label, "start"));
}

/** Append one site-subdivided row (PD/GM/CAL/BOP) — up to 3 sub-columns per
 *  tooth, spread across the tooth's width via the SAME fraction formula
 *  `PerioChart.tsx`'s `collectCurveInput`/`collectOverlayInput` use for the
 *  curve/overlay marks (`x + width*(j+0.5)/n`), so a site's number sits
 *  exactly where that site's curve point / overlay mark lands. `valueFor`
 *  returning `null` means "not charted" — no `<text>` is emitted for it. */
function appendSiteRow(
  root: Element,
  y: number,
  label: string,
  layout: ArchLayout,
  sites: readonly PerioSite[],
  valueFor: (toothNo: number, site: PerioSite) => string | null,
): void {
  appendRowLabel(root, y, label);
  for (const tooth of layout.teeth) {
    sites.forEach((site, j) => {
      const v = valueFor(tooth.toothNo, site);
      if (v === null) return;
      const x = LABEL_WIDTH + tooth.x + (tooth.width * (j + 0.5)) / sites.length;
      root.appendChild(text(x, y, v));
    });
  }
}

/** Append one 4-surface diamond row (Plaque/PI/GI/mPI/mBI) — mirrors
 *  `appendSiteRow` but spread over `PLAQUE_SURFACES` (mesial/distal/buccal/
 *  lingual) instead of probing sites. */
function appendSurfaceRow(
  root: Element,
  y: number,
  label: string,
  layout: ArchLayout,
  valueFor: (toothNo: number, surface: string) => string | null,
): void {
  appendRowLabel(root, y, label);
  for (const tooth of layout.teeth) {
    PLAQUE_SURFACES.forEach((surface, j) => {
      const v = valueFor(tooth.toothNo, surface);
      if (v === null) return;
      const x = LABEL_WIDTH + tooth.x + (tooth.width * (j + 0.5)) / PLAQUE_SURFACES.length;
      root.appendChild(text(x, y, v));
    });
  }
}

/** Append one single-value-per-tooth row (Miller/mobility/CEJ/root
 *  concavity/KG/GT) — centered on the tooth, no site/surface subdivision. */
function appendSingleRow(
  root: Element,
  y: number,
  label: string,
  layout: ArchLayout,
  valueFor: (toothNo: number) => string | null,
): void {
  appendRowLabel(root, y, label);
  for (const tooth of layout.teeth) {
    const v = valueFor(tooth.toothNo);
    if (v === null) continue;
    const x = LABEL_WIDTH + tooth.x + tooth.width / 2;
    root.appendChild(text(x, y, v));
  }
}

/** Append the furcation row — mirrors `PerioChart.tsx`'s `buildFurcationCell`
 *  content gate exactly: a tooth with no furcated entrance for its position,
 *  OR whose perio rows are hidden (`isPerioRowHidden` — missing/implant/
 *  under-gum/extraction), gets NO marks at all (not even a "–" placeholder),
 *  unlike every graded-index row above (which shows "–" via the button face
 *  even when ungraded) — an existing-but-ungraded entrance still gets its
 *  "–" face (mirrors `FURCATION_ROMAN[0]`), since the entrance's POSITIONAL
 *  existence is itself informative. */
function appendFurcationRow(root: Element, y: number, label: string, layout: ArchLayout): void {
  appendRowLabel(root, y, label);
  for (const tooth of layout.teeth) {
    const entrances = furcationEntrances(tooth.toothNo);
    if (entrances.length === 0 || isPerioRowHidden(tooth.toothNo)) continue;
    const furc = getToothFurcation(tooth.toothNo);
    entrances.forEach((entrance, j) => {
      const grade = furc[entrance] ?? 0;
      const x = LABEL_WIDTH + tooth.x + (tooth.width * (j + 0.5)) / entrances.length;
      root.appendChild(text(x, y, FURCATION_ROMAN[grade] ?? "–"));
    });
  }
}

/** Build one aspect's arch graphic (buccal or palatal) — the standalone
 *  `<svg>` from `buildBuccalArchSvg`/`buildPalatalArchSvg` (own `viewBox`,
 *  already carrying its own mm-grid layer), positioned as a NESTED `<svg>`
 *  at `(LABEL_WIDTH, y)` with `width`/`height` set 1:1 to its `viewBox`
 *  dimensions (no rescale — `preserveAspectRatio` is already a no-op at that
 *  ratio), so its internal x=0 column lines up EXACTLY under `LABEL_WIDTH +
 *  tooth.x`, the same offset every numeric row/curve x uses. The T3 curve
 *  overlay is then built (via `perioCurve`/`buildPerioCurveLayer`, the exact
 *  per-site x formula `PerioChart.tsx`'s `collectCurveInput` uses) and
 *  appended into the SAME oriented row group `PerioChart.tsx`'s
 *  `drawArchCurves` targets (`.perio-tooth-row-buccal` /
 *  `.perio-tooth-row-palatal-inner`), so the curve rides the same flip/
 *  mirror transforms as the teeth. Returns the vertical space (svg user
 *  units) the graphic consumed, so the caller can advance its row cursor. */
function appendArchGraphic(
  root: Element,
  cache: TemplateDocCache,
  teeth: readonly number[],
  layout: ArchLayout,
  y: number,
  aspect: "buccal" | "palatal",
): number {
  const svg =
    aspect === "buccal"
      ? buildBuccalArchSvg(cache, teeth, isToothImplant)
      : buildPalatalArchSvg(cache, teeth, isToothImplant);

  const vb = (svg.getAttribute("viewBox") || "0 0 1 1").trim().split(/\s+/).map(Number);
  const vbW = vb[2] ?? Math.max(layout.totalWidth, 1);
  const vbH = vb[3] ?? 1;
  svg.setAttribute("x", fmt(LABEL_WIDTH));
  svg.setAttribute("y", fmt(y));
  svg.setAttribute("width", fmt(vbW));
  svg.setAttribute("height", fmt(vbH));

  const rowSelector = aspect === "buccal" ? ".perio-tooth-row-buccal" : ".perio-tooth-row-palatal-inner";
  const rowGroup = svg.querySelector(rowSelector) ?? svg;
  const sites = aspect === "buccal" ? BUCCAL_SITES : LINGUAL_SITES;

  const curveSites: PerioCurveSite[] = [];
  const xs: number[] = [];
  for (const tooth of layout.teeth) {
    const perio = getToothPerio(tooth.toothNo);
    sites.forEach((site, j) => {
      const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
      curveSites.push({
        site,
        pd: charted ? perio.pd[site] : undefined,
        gm: Object.prototype.hasOwnProperty.call(perio.gm, site) ? perio.gm[site] : undefined,
      });
      xs.push(tooth.x + (tooth.width * (j + 0.5)) / 3);
    });
  }
  const curve = perioCurve(curveSites, { cejY: layout.cejY, mmPx: PERIO_MM_PX, siteX: (i) => xs[i] });
  const curveLayer = buildPerioCurveLayer(curve, {
    width: layout.totalWidth,
    className: aspect === "buccal" ? "perio-curve perio-curve-buccal" : "perio-curve perio-curve-palatal",
  });
  rowGroup.appendChild(curveLayer);

  root.appendChild(svg);
  return vbH;
}

/**
 * UI-3b Task 4: build the FULL perio chart (teeth graphic + numeric rows +
 * 2017 classification) as ONE standalone vector SVG, from the ACTIVE chart's
 * state — headless, no mounted DOM read. Returns `null` when the shared
 * tooth-template cache (`loadTemplateCache()`, same loader/memoized promise
 * `PerioChart.tsx` awaits) fails to load (templates are inlined, so this is
 * only an internal parse fault — the guard is defensive).
 */
export async function buildPerioSvg(): Promise<{ xml: string; width: number; height: number } | null> {
  let cache: TemplateDocCache;
  try {
    cache = await loadTemplateCache();
  } catch {
    return null;
  }

  const svg = document.createElementNS(SVG_NS, "svg") as unknown as SVGSVGElement;

  let cursorY = ROW_HEIGHT;
  let maxWidth = LABEL_WIDTH;
  const visible = getPerioRowVisibility();

  const buildOneArch = (teeth: readonly number[]) => {
    const layout = archToothLayout(cache, teeth);
    if (layout.teeth.length === 0) return;
    maxWidth = Math.max(maxWidth, LABEL_WIDTH + layout.totalWidth);
    const isUpper = isUpperTooth(teeth[0]);
    const buccalLabel = t("perio.buccal");
    const lingualLabel = isUpper ? t("perio.palatal") : t("perio.lingual");
    const archHasImplant = teeth.some((n) => isToothImplant(n));

    // --- Tooth-number header row (chrome, not gated — mirrors buildArch's
    //     always-present header). ---
    for (const tooth of layout.teeth) {
      const x = LABEL_WIDTH + tooth.x + tooth.width / 2;
      svg.appendChild(text(x, cursorY, formatToothLabel(tooth.toothNo)));
    }
    cursorY += ROW_HEIGHT;

    // --- Miller-class row (top, near the buccal aspect). ---
    if (visible.miller) {
      appendSingleRow(svg, cursorY, indexName("miller"), layout, (n) => {
        const v = getMillerClass(n);
        return v === "none" ? null : MILLER_FACE[v] ?? v;
      });
      cursorY += ROW_HEIGHT;
    }

    // --- Buccal-aspect rows (PD innermost / nearest the teeth in the live
    //     grid — order here matches buildArch's append order: BOP, CAL, GM, PD). ---
    if (visible.bop) {
      appendSiteRow(svg, cursorY, `${buccalLabel} ${indexName("bop")}`, layout, BUCCAL_SITES, (n, site) => {
        const perio = getToothPerio(n);
        const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
        return charted && perio.bop.includes(site) ? "•" : null;
      });
      cursorY += ROW_HEIGHT;
    }
    if (visible.cal) {
      appendSiteRow(svg, cursorY, `${buccalLabel} ${indexName("cal")}`, layout, BUCCAL_SITES, (n, site) => {
        const v = getToothCal(n).get(site);
        return v === undefined ? null : String(v);
      });
      cursorY += ROW_HEIGHT;
    }
    if (visible.gm) {
      appendSiteRow(svg, cursorY, `${buccalLabel} ${indexName("gm")}`, layout, BUCCAL_SITES, (n, site) => {
        const perio = getToothPerio(n);
        const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
        if (!charted || !Object.prototype.hasOwnProperty.call(perio.gm, site)) return null;
        return String(perio.gm[site]);
      });
      cursorY += ROW_HEIGHT;
    }
    if (visible.pd) {
      appendSiteRow(svg, cursorY, `${buccalLabel} ${indexName("pd")}`, layout, BUCCAL_SITES, (n, site) => {
        const perio = getToothPerio(n);
        const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
        return charted ? String(perio.pd[site]) : null;
      });
      cursorY += ROW_HEIGHT;
    }

    // --- Furcation row, nearest the teeth (just above the buccal graphic). ---
    if (visible.furcation) {
      appendFurcationRow(svg, cursorY, indexName("furcation"), layout);
      cursorY += ROW_HEIGHT;
    }

    // --- BUCCAL tooth-row graphic + curve overlay. ---
    cursorY += appendArchGraphic(svg, cache, teeth, layout, cursorY, "buccal");

    // --- Band-orientation legend (mirrors PerioChart.tsx's central-band
    //     label): buccal (top, next to the graphic above) / lingual-palatal
    //     (bottom, next to the graphic below). Chrome only — matches the
    //     on-screen "▲ Buccal … Lingual/Palatal ▼" row so the export is
    //     visually faithful to the band. ---
    svg.appendChild(text(4, cursorY, `▲ ${t("perio.band.buccal")}`, "start"));
    svg.appendChild(text(LABEL_WIDTH + layout.totalWidth, cursorY, `${t("perio.band.lingual")} ▼`, "end"));
    cursorY += ROW_HEIGHT;

    // --- Central perio index band: Plaque -> PI -> GI -> mPI -> mBI. ---
    if (visible.plaque) {
      appendSurfaceRow(svg, cursorY, indexName("plaque"), layout, (n, surface) =>
        getToothPlaque(n).includes(surface) ? "•" : null,
      );
      cursorY += ROW_HEIGHT;
    }
    if (visible.pi) {
      appendSurfaceRow(svg, cursorY, indexName("pi"), layout, (n, surface) => {
        const g = getPlaqueIndex(n, surface);
        return g > 0 ? GRADE_FACE[g] ?? String(g) : null;
      });
      cursorY += ROW_HEIGHT;
    }
    if (visible.gi) {
      appendSurfaceRow(svg, cursorY, indexName("gi"), layout, (n, surface) => {
        const g = getGingivalIndex(n, surface);
        return g > 0 ? GRADE_FACE[g] ?? String(g) : null;
      });
      cursorY += ROW_HEIGHT;
    }
    // T3 implant-gate: mPI/mBI only render in an arch with >= 1 implant tooth
    // (mirrors `ui3b-mpi-implant-gate.test.ts` / buildArch's `archHasImplant`).
    if (visible.mpi && archHasImplant) {
      appendSurfaceRow(svg, cursorY, indexName("mpi"), layout, (n, surface) => {
        const g = getPeriImplantPlaque(n, surface);
        return g > 0 ? GRADE_FACE[g] ?? String(g) : null;
      });
      cursorY += ROW_HEIGHT;
    }
    if (visible.mbi && archHasImplant) {
      appendSurfaceRow(svg, cursorY, indexName("mbi"), layout, (n, surface) => {
        const g = getPeriImplantBleeding(n, surface);
        return g > 0 ? GRADE_FACE[g] ?? String(g) : null;
      });
      cursorY += ROW_HEIGHT;
    }

    // --- PALATAL tooth-row graphic + curve overlay. ---
    cursorY += appendArchGraphic(svg, cache, teeth, layout, cursorY, "palatal");

    // --- Palatal-aspect rows (PD innermost / nearest the teeth — order
    //     matches buildArch: PD, GM, CAL, BOP). ---
    if (visible.pd) {
      appendSiteRow(svg, cursorY, `${lingualLabel} ${indexName("pd")}`, layout, LINGUAL_SITES, (n, site) => {
        const perio = getToothPerio(n);
        const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
        return charted ? String(perio.pd[site]) : null;
      });
      cursorY += ROW_HEIGHT;
    }
    if (visible.gm) {
      appendSiteRow(svg, cursorY, `${lingualLabel} ${indexName("gm")}`, layout, LINGUAL_SITES, (n, site) => {
        const perio = getToothPerio(n);
        const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
        if (!charted || !Object.prototype.hasOwnProperty.call(perio.gm, site)) return null;
        return String(perio.gm[site]);
      });
      cursorY += ROW_HEIGHT;
    }
    if (visible.cal) {
      appendSiteRow(svg, cursorY, `${lingualLabel} ${indexName("cal")}`, layout, LINGUAL_SITES, (n, site) => {
        const v = getToothCal(n).get(site);
        return v === undefined ? null : String(v);
      });
      cursorY += ROW_HEIGHT;
    }
    if (visible.bop) {
      appendSiteRow(svg, cursorY, `${lingualLabel} ${indexName("bop")}`, layout, LINGUAL_SITES, (n, site) => {
        const perio = getToothPerio(n);
        const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
        return charted && perio.bop.includes(site) ? "•" : null;
      });
      cursorY += ROW_HEIGHT;
    }

    // --- Mobility, CEJ visibility, root concavity, KG, GT (foot rows). ---
    if (visible.mobility) {
      appendSingleRow(svg, cursorY, indexName("mobility"), layout, (n) => {
        const v = getToothMobility(n);
        return v === "none" ? null : MOBILITY_FACE[v] ?? v;
      });
      cursorY += ROW_HEIGHT;
    }
    if (visible.cej) {
      appendSingleRow(svg, cursorY, indexName("cej"), layout, (n) => {
        const v = getCejVisibility(n);
        return v === "none" ? null : CEJ_FACE[v] ?? v;
      });
      cursorY += ROW_HEIGHT;
    }
    if (visible.rootConcavity) {
      appendSingleRow(svg, cursorY, indexName("rootConcavity"), layout, (n) => {
        const v = getRootConcavity(n);
        return v === "none" ? null : ROOT_CONCAVITY_FACE[v] ?? v;
      });
      cursorY += ROW_HEIGHT;
    }
    if (visible.kg) {
      appendSingleRow(svg, cursorY, indexName("kg"), layout, (n) => {
        const mm = getKeratinizedWidth(n);
        return mm === null ? null : String(mm);
      });
      cursorY += ROW_HEIGHT;
    }
    if (visible.gt) {
      appendSingleRow(svg, cursorY, indexName("gt"), layout, (n) => {
        const v = getGingivalThickness(n);
        return v === "unknown" ? null : GT_FACE[v] ?? v;
      });
      cursorY += ROW_HEIGHT;
    }

    cursorY += SECTION_GAP;
  };

  buildOneArch(UPPER_ARCH);
  buildOneArch(LOWER_ARCH);

  // --- 2017 periodontal classification block (getPerioClassification —
  //     override-aware, same final per-axis values the Dental Chart
  //     classification panel shows). Labels AND values are localized via the
  //     SAME i18n keys/format helpers PerioSidebar.tsx uses, so the export
  //     honors the active UI language exactly like the on-screen panel (the
  //     "na"/"indeterminate"/"molar-incisor" special cases mirror it too). ---
  const cls = getPerioClassification();
  const dxLabel = (v: string): string => t(`perio.class.dx.${v}`);
  const stageLabel = (v: string): string =>
    v === "na" ? t("perio.class.stage.na")
    : v === "indeterminate" ? t("perio.class.stage.indeterminate")
    : t(`perio.class.stage.${v}`);
  const gradeLabel = (v: string): string =>
    v === "indeterminate" ? t("perio.class.grade.indeterminate") : t(`perio.class.grade.${v}`);
  const extentLabel = (v: string): string =>
    v === "na" ? t("perio.class.extent.na")
    : v === "molar-incisor" ? t("perio.class.extent.molarIncisor")
    : t(`perio.class.extent.${v}`);
  svg.appendChild(text(4, cursorY, `${t("perio.class.diagnosis")}: ${dxLabel(cls.diagnosis)}`, "start"));
  cursorY += ROW_HEIGHT;
  svg.appendChild(text(4, cursorY, `${t("perio.class.stage")}: ${stageLabel(cls.stage)}`, "start"));
  cursorY += ROW_HEIGHT;
  svg.appendChild(text(4, cursorY, `${t("perio.class.grade")}: ${gradeLabel(cls.grade)}`, "start"));
  cursorY += ROW_HEIGHT;
  svg.appendChild(text(4, cursorY, `${t("perio.class.extent")}: ${extentLabel(cls.extent)}`, "start"));
  cursorY += ROW_HEIGHT;

  const width = maxWidth;
  const height = cursorY;
  svg.setAttribute("viewBox", `0 0 ${fmt(width)} ${fmt(height)}`);
  svg.setAttribute("width", fmt(width));
  svg.setAttribute("height", fmt(height));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(svg)}`;
  return { xml, width, height };
}
