// Angular port of $ENGINE/src/PerioChart.tsx's COMPONENT BODY (TSX 1518-2369).
// Task 3 (`perio-grid-dom.ts`) ported the framework-free module scope (TSX
// ~87-1517) verbatim — the plain-DOM grid builders, `GridHandlers`/
// `ToothCellRefs` types, `syncToothCells`, `buildArch`/`applyArchColumns`/
// `drawArchCurves`/`drawArchOverlay`, and the info-popover singleton. THIS
// file is the only caller: it constructs the real `GridHandlers` bag (wiring
// every callback to the actual engine setters, TSX 1797-1942), owns the
// `Map<number, ToothCellRefs>` registry + template-cache/graphic-container
// refs the TSX kept in `useRef`s, and re-hosts the TSX's four `useEffect`s as
// Angular `effect()`s.
//
// The component-only constants the TSX declares at module scope for its OWN
// exclusive use (never touched by `perio-grid-dom.ts`'s builders) are
// transcribed HERE, per Task 3's own deliberate omission: `UPPER_ARCH`/
// `LOWER_ARCH` (TSX 113-114), `SWITCHER_LAYERS` (TSX 364-366), the
// `PerioSummaryData`/`PerioSiteData` type aliases + their `EMPTY_*` defaults
// (TSX 191-215).
//
// CRITICAL CONTRACT (mirrors the TSX's own doc comment, TSX 1518-1526 +
// 2236): `active = inline() || open()`. While inactive, the component renders
// NOTHING (`@if (active()) { ... }`, mirroring the TSX's `if (!active) return
// null`) and every effect that touches the real engine module starts with an
// `if (!this.active()) return;` guard — a closed/unmounted chart never calls
// into `core/odontogram`/`core/perioGraphic` at all, exactly like the TSX's
// own "every real module call is deferred to the active-gated effect, never
// at module eval" contract (TSX 1553-1558, 1563-1565).
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { I18nService } from "../../i18n/i18n.service";
import { PerioSidebarComponent } from "../perio-sidebar/perio-sidebar.component";
import { focusFirst, nextDialogTitleId, trapTabKey } from "../shared/dialog-focus";
import {
  buildArch,
  applyArchColumns,
  drawArchCurves,
  drawArchOverlay,
  syncToothCells,
  hideInfoPopover,
  overlaySwitchLabel as computeOverlaySwitchLabel,
  CEJ_VISIBILITY_CYCLE,
  ROOT_CONCAVITY_CYCLE,
  GINGIVAL_THICKNESS_CYCLE,
  MILLER_CLASS_CYCLE,
  type ToothCellRefs,
  type GridHandlers,
} from "./perio-grid-dom";
import {
  loadTemplateCache,
  buildBuccalArchSvg,
  buildPalatalArchSvg,
  type TemplateDocCache,
} from "../../core/perioGraphic";
import {
  getPerioChart,
  getToothPerio,
  getToothCal,
  getPerioSummary,
  setPerioSite,
  setToothMobility,
  getToothFurcation,
  setFurcation,
  getToothPlaque,
  setPlaque,
  getCejVisibility,
  setCejVisibility,
  getRootConcavity,
  setRootConcavity,
  getPlaqueIndex,
  setPlaqueIndex,
  getGingivalIndex,
  setGingivalIndex,
  getKeratinizedWidth,
  setKeratinizedWidth,
  getGingivalThickness,
  setGingivalThickness,
  getMillerClass,
  setMillerClass,
  getPeriImplantPlaque,
  setPeriImplantPlaque,
  getPeriImplantBleeding,
  setPeriImplantBleeding,
  getReadOnly,
  onStateChange,
  nextPerioCell,
  prevPerioCell,
  getPerioOverlayLayer,
  setPerioOverlayLayer,
  getPerioRowVisibility,
  getPerioIndexNameMode,
  isToothImplant,
  type PerioCellCoord,
  type PerioOverlayLayer,
  type PerioSite,
} from "../../core/odontogram";

// Mirrors `ALL_TEETH` in odontogram.ts — same duplication precedent as
// `perio-grid-dom.ts`'s own copy (TSX 110-114 / that module's header doc).
// Array-adjacent == visually adjacent within an arch; the two arches never mix.
const UPPER_ARCH: readonly number[] = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ARCH: readonly number[] = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// PG-B Task 2/3 switcher: the overlay layers offered by the switch row, in
// display order (TSX 364-366) — transcribed verbatim.
const SWITCHER_LAYERS: readonly PerioOverlayLayer[] = [
  "none", "pd", "cal", "gr", "cairo", "kg", "bop", "plaque", "pi", "gi", "mpi", "mbi", "pd5", "pd6",
];

type PerioSiteData = ReturnType<typeof getToothPerio>;
type PerioSummaryData = ReturnType<typeof getPerioSummary>;

const EMPTY_PERIO: PerioSiteData = { pd: {}, gm: {}, bop: [], sup: [] };
const EMPTY_SUMMARY: PerioSummaryData = {
  chartedSites: 0,
  bleedingSites: 0,
  bopPercent: 0,
  worstCal: null,
  worstCalTooth: null,
  maxPd: null,
  avgPd: null,
  avgCal: null,
  maxFurcation: null,
  plaquePercent: 0,
  piScore: null,
  giScore: null,
  kgDeficientTeeth: 0,
  gtDistribution: { thin: 0, medium: 0, thick: 0 },
  millerDistribution: { i: 0, ii: 0, iii: 0, iv: 0 },
  mpiScore: null,
  mbiScore: null,
};

@Component({
  selector: "aao-perio-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, PerioSidebarComponent],
  template: `
    @if (active()) {
      <ng-template #overlaySwitchTpl>
        <div
          id="perioOverlaySwitch"
          class="perio-overlay-switch"
          role="radiogroup"
          [attr.aria-label]="i18n.t('perio.overlay.label')"
        >
          @for (layer of switcherLayers; track layer) {
            <button
              type="button"
              role="radio"
              [attr.aria-checked]="overlayLayer() === layer"
              class="perio-overlay-switch-btn"
              [class.is-active]="overlayLayer() === layer"
              [attr.data-overlay-layer]="layer"
              (click)="onOverlayLayerClick(layer)"
            >
              {{ overlaySwitchLabel(layer) }}
            </button>
          }
          @if (overlayReadout(); as readout) {
            <span class="perio-overlay-readout" id="perioOverlayReadout">{{ readout }}</span>
          }
        </div>
      </ng-template>

      @if (inline()) {
        <section id="perioInlinePanel" class="chart perio-inline-panel" [attr.aria-label]="i18n.t('perio.chart.title')">
          <div class="chart-header perio-chart-header">
            <div class="chart-title">{{ i18n.t('perio.chart.title') }}</div>
            <ng-container *ngTemplateOutlet="overlaySwitchTpl"></ng-container>
          </div>
          <div id="perioInlineGrid" class="perio-overlay-body" [attr.aria-label]="i18n.t('perio.chart.title')">
            <div class="perio-fullgrid-scroll" #scroll></div>
          </div>
        </section>
      } @else {
        <div
          #dialog
          id="perioOverlay"
          class="perio-overlay"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          tabindex="-1"
          (keydown)="onKeyDown($event)"
          (mousedown)="onBackdropMouseDown($event)"
        >
          <div class="perio-overlay-panel">
            <div class="perio-overlay-header">
              <h2 class="perio-overlay-title" [id]="titleId">{{ i18n.t('perio.chart.title') }}</h2>
              <ng-container *ngTemplateOutlet="overlaySwitchTpl"></ng-container>
              <button
                type="button"
                class="perio-overlay-close"
                (click)="closeChart.emit()"
                [attr.aria-label]="i18n.t('perio.close')"
                [title]="i18n.t('perio.close')"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <aao-perio-sidebar />
            <div id="perioOverlayGrid" class="perio-overlay-body" [attr.aria-label]="i18n.t('perio.chart.title')">
              <div class="perio-fullgrid-scroll" #scroll></div>
            </div>
          </div>
        </div>
      }
    }
  `,
})
export class PerioChartComponent {
  readonly open = input<boolean>(false);
  readonly inline = input<boolean>(false);
  readonly closeChart = output<void>();

  protected readonly active = computed(() => this.inline() || this.open());

  protected readonly i18n = inject(I18nService);
  protected readonly titleId = nextDialogTitleId("perioOverlayTitle");
  protected readonly switcherLayers = SWITCHER_LAYERS;

  // PG-B Task 2: mirrors the module-level overlay-layer flag into a signal
  // so the switcher's active button + header read-out re-render on change
  // (TSX 1560-1566, 2192-2203). Static default — see the file-level doc
  // comment for why this hook never touches "./odontogram" until the
  // active-gated effect below runs.
  protected readonly overlayLayer = signal<PerioOverlayLayer>("none");
  // Static default, NOT getPerioSummary() — same module-eval-safety reason
  // (TSX 1553-1559). Replaced with the real summary as soon as the grid
  // effect's first fullResync() runs. Only feeds `overlayReadout()` — the
  // whole-mouth summary BAR itself lives in PerioSidebarComponent (UI-1
  // Task 1 extraction), mirrored in the popup housing below via
  // `<aao-perio-sidebar/>`.
  protected readonly summary = signal<PerioSummaryData>(EMPTY_SUMMARY);

  private readonly dialogRef = viewChild<ElementRef<HTMLDivElement>>("dialog");
  private readonly scrollRef = viewChild<ElementRef<HTMLDivElement>>("scroll");
  private openerEl: HTMLElement | null = null;

  // The tooth-row graphic containers + the grid elements are created inside
  // the plain-DOM grid build (`buildArch`), NOT rendered as Angular template
  // nodes — assigned by the grid-building effect, read by the graphic effect
  // that runs after it (mirrors TSX's `buccalUpperRef`/etc.).
  private gridUpperEl: HTMLDivElement | null = null;
  private gridLowerEl: HTMLDivElement | null = null;
  private buccalUpperEl: HTMLDivElement | null = null;
  private palatalUpperEl: HTMLDivElement | null = null;
  private buccalLowerEl: HTMLDivElement | null = null;
  private palatalLowerEl: HTMLDivElement | null = null;
  private archCache: TemplateDocCache | null = null;
  private registry: Map<number, ToothCellRefs> | null = null;
  // Mirrors `suppressResyncRef`: prevents the grid's own edits from ALSO
  // triggering a redundant full resync via the onStateChange subscription
  // (setPerioSite/etc. all fire it synchronously) — external edits still
  // trigger the full resync normally.
  private suppressResync = false;

  constructor() {
    // Capture the opener + move focus into the dialog when it opens; restore
    // focus to the opener when it closes/unmounts (TSX 1777-1786). MODAL-ONLY.
    effect((onCleanup) => {
      const isInline = this.inline();
      const isOpen = this.open();
      const dialog = this.dialogRef()?.nativeElement;
      if (isInline || !isOpen || !dialog) return;
      this.openerEl = (document.activeElement as HTMLElement | null) ?? null;
      focusFirst(dialog);
      onCleanup(() => {
        this.openerEl?.focus?.();
      });
    });

    // Build the grid fresh each time this becomes active, wire the delegated
    // keyboard handlers, and subscribe to onStateChange for the lifetime of
    // this active session only (TSX 1793-2037).
    effect((onCleanup) => {
      if (!this.active()) return;
      const container = this.scrollRef()?.nativeElement;
      if (!container) return;

      const handlers = this.buildHandlers();

      const visibilitySig = () =>
        JSON.stringify([
          getPerioRowVisibility(),
          getPerioIndexNameMode(),
          [...UPPER_ARCH, ...LOWER_ARCH].filter((n) => isToothImplant(n)).join(","),
        ]);
      let lastVisibilitySig: string | null = null;

      const buildGrid = () => {
        const registry = new Map<number, ToothCellRefs>();
        container.innerHTML = "";
        const upper = buildArch(UPPER_ARCH, registry, handlers);
        const lower = buildArch(LOWER_ARCH, registry, handlers);
        container.appendChild(upper.grid);
        container.appendChild(lower.grid);
        this.registry = registry;
        this.gridUpperEl = upper.grid;
        this.gridLowerEl = lower.grid;
        this.buccalUpperEl = upper.buccalCell;
        this.palatalUpperEl = upper.palatalCell;
        this.buccalLowerEl = lower.buccalCell;
        this.palatalLowerEl = lower.palatalCell;
        lastVisibilitySig = visibilitySig();

        const cache = this.archCache;
        if (cache) {
          applyArchColumns(this.gridUpperEl, UPPER_ARCH, cache, container);
          applyArchColumns(this.gridLowerEl, LOWER_ARCH, cache, container);
          this.buccalUpperEl.appendChild(buildBuccalArchSvg(cache, UPPER_ARCH, isToothImplant));
          this.palatalUpperEl.appendChild(buildPalatalArchSvg(cache, UPPER_ARCH, isToothImplant));
          this.buccalLowerEl.appendChild(buildBuccalArchSvg(cache, LOWER_ARCH, isToothImplant));
          this.palatalLowerEl.appendChild(buildPalatalArchSvg(cache, LOWER_ARCH, isToothImplant));
          drawArchCurves(cache, this.gridUpperEl, UPPER_ARCH);
          drawArchCurves(cache, this.gridLowerEl, LOWER_ARCH);
          const layer = getPerioOverlayLayer();
          drawArchOverlay(cache, this.gridUpperEl, UPPER_ARCH, layer);
          drawArchOverlay(cache, this.gridLowerEl, LOWER_ARCH, layer);
        }
      };

      buildGrid();
      this.fullResync();
      container.addEventListener("keydown", this.handleGridKeyDown);
      container.addEventListener("focusout", this.handleGridFocusOut);

      const unsubscribe = onStateChange(() => {
        if (this.suppressResync) return;
        if (visibilitySig() !== lastVisibilitySig) buildGrid();
        this.fullResync();
      });

      onCleanup(() => {
        container.removeEventListener("keydown", this.handleGridKeyDown);
        container.removeEventListener("focusout", this.handleGridFocusOut);
        unsubscribe();
        // The info popover is appended to document.body (outside `container`),
        // so it would otherwise be orphaned when the grid is torn down.
        hideInfoPopover();
        this.registry = null;
        this.gridUpperEl = null;
        this.gridLowerEl = null;
        this.buccalUpperEl = null;
        this.palatalUpperEl = null;
        this.buccalLowerEl = null;
        this.palatalLowerEl = null;
      });
    });

    // "Dental Chart" graphical redesign: the tooth-row graphic + T3 curve
    // overlay + PG-B discrete/mm-heat overlay, independent of the
    // grid-building effect above (TSX 2062-2190). Fully READ-ONLY.
    effect((onCleanup) => {
      if (!this.active()) return;
      // Mirrors the grid-build effect's own `container` guard: the scroll
      // container is created by the SAME template swap the `active` gate
      // above reacts to (`@if (active())`), so on the very first pass after
      // activation the view may not have re-rendered yet — bail here instead
      // of burning a full loadTemplateCache()/ResizeObserver setup pass that
      // would immediately no-op on every DOM write anyway (every graphic
      // container ref this effect writes into is populated by the OTHER,
      // grid-build effect, which itself requires this same ref).
      if (!this.scrollRef()) return;
      let cancelled = false;

      const implantSig = () => [...UPPER_ARCH, ...LOWER_ARCH].filter((n) => isToothImplant(n)).join(",");
      let lastImplantSig: string | null = null;

      const buildArches = (cache: TemplateDocCache) => {
        const buccalUpper = this.buccalUpperEl;
        const palatalUpper = this.palatalUpperEl;
        const buccalLower = this.buccalLowerEl;
        const palatalLower = this.palatalLowerEl;
        if (buccalUpper) {
          buccalUpper.innerHTML = "";
          buccalUpper.appendChild(buildBuccalArchSvg(cache, UPPER_ARCH, isToothImplant));
        }
        if (palatalUpper) {
          palatalUpper.innerHTML = "";
          palatalUpper.appendChild(buildPalatalArchSvg(cache, UPPER_ARCH, isToothImplant));
        }
        if (buccalLower) {
          buccalLower.innerHTML = "";
          buccalLower.appendChild(buildBuccalArchSvg(cache, LOWER_ARCH, isToothImplant));
        }
        if (palatalLower) {
          palatalLower.innerHTML = "";
          palatalLower.appendChild(buildPalatalArchSvg(cache, LOWER_ARCH, isToothImplant));
        }
        lastImplantSig = implantSig();
      };

      const redraw = () => {
        const cache = this.archCache;
        if (!cache) return;
        if (implantSig() !== lastImplantSig) buildArches(cache);
        drawArchCurves(cache, this.gridUpperEl, UPPER_ARCH);
        drawArchCurves(cache, this.gridLowerEl, LOWER_ARCH);
        const layer = getPerioOverlayLayer();
        drawArchOverlay(cache, this.gridUpperEl, UPPER_ARCH, layer);
        drawArchOverlay(cache, this.gridLowerEl, LOWER_ARCH, layer);
      };

      const fitColumns = () => {
        const cache = this.archCache;
        if (!cache) return;
        try {
          const scroll = this.scrollRef()?.nativeElement ?? null;
          applyArchColumns(this.gridUpperEl, UPPER_ARCH, cache, scroll);
          applyArchColumns(this.gridLowerEl, LOWER_ARCH, cache, scroll);
        } catch (e) {
          console.error("perio fitColumns failed", e);
        }
      };

      loadTemplateCache()
        .then((cache) => {
          if (cancelled) return;
          this.archCache = cache;
          fitColumns();
          buildArches(cache);
          drawArchCurves(cache, this.gridUpperEl, UPPER_ARCH);
          drawArchCurves(cache, this.gridLowerEl, LOWER_ARCH);
          const layer = getPerioOverlayLayer();
          drawArchOverlay(cache, this.gridUpperEl, UPPER_ARCH, layer);
          drawArchOverlay(cache, this.gridLowerEl, LOWER_ARCH, layer);
        })
        .catch((err) => {
          console.error("perio tooth-row graphic: failed to load tooth templates", err);
        });

      const unsubscribe = onStateChange(() => {
        if (!cancelled) redraw();
      });

      // UI-1 Task 3b: re-fit the columns whenever the scroll container's own
      // width changes. Feature-checked — jsdom has no ResizeObserver.
      let resizeObserver: ResizeObserver | null = null;
      let resizeTimer: ReturnType<typeof setTimeout> | null = null;
      const scrollEl = this.scrollRef()?.nativeElement ?? null;
      if (typeof ResizeObserver !== "undefined" && scrollEl) {
        resizeObserver = new ResizeObserver(() => {
          if (resizeTimer) clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            resizeTimer = null;
            if (!cancelled) fitColumns();
          }, 100);
        });
        resizeObserver.observe(scrollEl);
      }

      onCleanup(() => {
        cancelled = true;
        unsubscribe();
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeObserver?.disconnect();
        this.archCache = null;
      });
    });

    // PG-B Task 2: mirror the module-level overlay-layer flag into a signal
    // (TSX 2198-2203).
    effect((onCleanup) => {
      if (!this.active()) return;
      this.overlayLayer.set(getPerioOverlayLayer());
      onCleanup(onStateChange(() => this.overlayLayer.set(getPerioOverlayLayer())));
    });
  }

  private fullResync(): void {
    const registry = this.registry;
    if (!registry) return;
    const chart = getPerioChart();
    const readOnly = getReadOnly();
    for (const [toothNo, cells] of registry) {
      const perio = chart[String(toothNo)] ?? EMPTY_PERIO;
      syncToothCells(cells, toothNo, perio, getToothCal(toothNo), readOnly);
    }
    this.summary.set(getPerioSummary());
  }

  private syncOneTooth(toothNo: number): void {
    const registry = this.registry;
    if (!registry) return;
    const cells = registry.get(toothNo);
    if (!cells) return;
    syncToothCells(cells, toothNo, getToothPerio(toothNo), getToothCal(toothNo), getReadOnly());
    this.summary.set(getPerioSummary());
  }

  // Move focus to a nextPerioCell/prevPerioCell coordinate's INPUT, if it
  // exists and is currently enabled (TSX 1594-1602).
  private focusPerioCell(coord: PerioCellCoord | null): void {
    if (!coord) return;
    const registry = this.registry;
    if (!registry) return;
    const cells = registry.get(coord.toothNo);
    if (!cells) return;
    const el = cells[coord.row][coord.site];
    if (el && !el.disabled) el.focus();
  }

  // Task 3 (source numbering): keyboard auto-advance + navigation, delegated
  // on the grid container — transcribed verbatim from TSX 1644-1747. Bound as
  // an instance arrow field (not a plain method) so `addEventListener`/
  // `removeEventListener` see the SAME function reference.
  private readonly handleGridKeyDown = (e: KeyboardEvent): void => {
    if (getReadOnly()) return;
    const target = e.target as HTMLElement | null;
    const coordStr = target?.dataset?.["perio"];
    if (!coordStr) return;
    const [toothStr, siteStr, rowStr] = coordStr.split(":");
    const toothNo = Number(toothStr);
    const site = siteStr as PerioSite;

    if (rowStr === "bop") {
      if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
        e.preventDefault();
        const checkbox = target as HTMLInputElement;
        const next = !checkbox.checked;
        this.suppressResync = true;
        setPerioSite(toothNo, site, { bop: next });
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      }
      return;
    }

    const row = rowStr as "pd" | "gm";
    const cur: PerioCellCoord = { toothNo, site, row };
    const input = target as HTMLInputElement;
    const isDigit = /^[0-9]$/.test(e.key);

    if (row === "gm" && input.dataset["pendingSign"] && e.key !== "-" && !isDigit) {
      delete input.dataset["pendingSign"];
    }

    if (row === "pd" && input.dataset["pendingTens"] === "1") {
      if (/^[0-5]$/.test(e.key)) {
        e.preventDefault();
        delete input.dataset["pendingTens"];
        this.suppressResync = true;
        setPerioSite(toothNo, site, { pd: Number(`1${e.key}`) });
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
        this.focusPerioCell(nextPerioCell(cur));
        return;
      }
      delete input.dataset["pendingTens"];
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      this.focusPerioCell(nextPerioCell(cur));
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      this.focusPerioCell(prevPerioCell(cur));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      this.focusPerioCell({ toothNo, site, row: "pd" });
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.focusPerioCell({ toothNo, site, row: "gm" });
      return;
    }

    if (row === "gm" && e.key === "-") {
      e.preventDefault();
      input.dataset["pendingSign"] = "-";
      return;
    }

    if (isDigit) {
      e.preventDefault();
      if (row === "pd" && e.key === "1") {
        this.suppressResync = true;
        setPerioSite(toothNo, site, { pd: 1 });
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
        input.dataset["pendingTens"] = "1";
        return; // withhold advance — a following 0-5 digit may compose 10-15
      }
      this.suppressResync = true;
      if (row === "pd") {
        setPerioSite(toothNo, site, { pd: Number(e.key) });
      } else {
        const composed = input.dataset["pendingSign"] === "-" ? `-${e.key}` : e.key;
        delete input.dataset["pendingSign"];
        setPerioSite(toothNo, site, { gm: Number(composed) });
      }
      this.suppressResync = false;
      this.syncOneTooth(toothNo);
      this.focusPerioCell(nextPerioCell(cur));
    }
  };

  // Clears a stale pendingSign/pendingTens prime on ANY loss of focus from
  // the cell that primed it — transcribed verbatim from TSX 1767-1771.
  private readonly handleGridFocusOut = (e: FocusEvent): void => {
    const target = e.target as HTMLElement | null;
    if (target?.dataset?.["pendingSign"]) delete target.dataset["pendingSign"];
    if (target?.dataset?.["pendingTens"]) delete target.dataset["pendingTens"];
  };

  // Constructs the real GridHandlers bag (TSX 1797-1942) — every callback
  // wired to the actual engine setter, gated by `suppressResync` around the
  // write + a targeted `syncOneTooth` re-sync, exactly like the existing
  // `change`-event handlers.
  private buildHandlers(): GridHandlers {
    return {
      onPd: (toothNo, site, raw) => {
        const trimmed = raw.trim();
        this.suppressResync = true;
        setPerioSite(toothNo, site, { pd: trimmed === "" ? null : Number(trimmed) });
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onGm: (toothNo, site, raw) => {
        const trimmed = raw.trim();
        if (trimmed === "") return; // no explicit gm edit -> no-op
        this.suppressResync = true;
        setPerioSite(toothNo, site, { gm: Number(trimmed) });
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onBop: (toothNo, site, checked) => {
        this.suppressResync = true;
        setPerioSite(toothNo, site, { bop: checked });
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onMobility: (toothNo, value) => {
        this.suppressResync = true;
        setToothMobility(toothNo, value);
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onFurcation: (toothNo, entrance) => {
        const cur = getToothFurcation(toothNo)[entrance];
        const next = cur === undefined ? 1 : cur >= 4 ? null : cur + 1;
        this.suppressResync = true;
        setFurcation(toothNo, entrance, next);
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onPlaque: (toothNo, surface) => {
        const present = getToothPlaque(toothNo).includes(surface);
        this.suppressResync = true;
        setPlaque(toothNo, surface, !present);
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onCejVisibility: (toothNo) => {
        const cur = getCejVisibility(toothNo);
        const idx = CEJ_VISIBILITY_CYCLE.indexOf(cur);
        const next = CEJ_VISIBILITY_CYCLE[(idx + 1) % CEJ_VISIBILITY_CYCLE.length];
        this.suppressResync = true;
        setCejVisibility(toothNo, next);
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onRootConcavity: (toothNo) => {
        const cur = getRootConcavity(toothNo);
        const idx = ROOT_CONCAVITY_CYCLE.indexOf(cur);
        const next = ROOT_CONCAVITY_CYCLE[(idx + 1) % ROOT_CONCAVITY_CYCLE.length];
        this.suppressResync = true;
        setRootConcavity(toothNo, next);
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onPiSurface: (toothNo, surface) => {
        const next = ((getPlaqueIndex(toothNo, surface) + 1) % 4) as 0 | 1 | 2 | 3;
        this.suppressResync = true;
        setPlaqueIndex(toothNo, surface, next);
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onGiSurface: (toothNo, surface) => {
        const next = ((getGingivalIndex(toothNo, surface) + 1) % 4) as 0 | 1 | 2 | 3;
        this.suppressResync = true;
        setGingivalIndex(toothNo, surface, next);
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onKg: (toothNo, raw) => {
        const trimmed = raw.trim();
        this.suppressResync = true;
        setKeratinizedWidth(toothNo, trimmed === "" ? null : Number(trimmed));
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onGingivalThickness: (toothNo) => {
        const cur = getGingivalThickness(toothNo);
        const idx = GINGIVAL_THICKNESS_CYCLE.indexOf(cur);
        const next = GINGIVAL_THICKNESS_CYCLE[(idx + 1) % GINGIVAL_THICKNESS_CYCLE.length];
        this.suppressResync = true;
        setGingivalThickness(toothNo, next);
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onMillerClass: (toothNo) => {
        const cur = getMillerClass(toothNo);
        const idx = MILLER_CLASS_CYCLE.indexOf(cur);
        const next = MILLER_CLASS_CYCLE[(idx + 1) % MILLER_CLASS_CYCLE.length];
        this.suppressResync = true;
        setMillerClass(toothNo, next);
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onMpiSurface: (toothNo, surface) => {
        const next = ((getPeriImplantPlaque(toothNo, surface) + 1) % 4) as 0 | 1 | 2 | 3;
        this.suppressResync = true;
        setPeriImplantPlaque(toothNo, surface, next);
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
      onMbiSurface: (toothNo, surface) => {
        const next = ((getPeriImplantBleeding(toothNo, surface) + 1) % 4) as 0 | 1 | 2 | 3;
        this.suppressResync = true;
        setPeriImplantBleeding(toothNo, surface, next);
        this.suppressResync = false;
        this.syncOneTooth(toothNo);
      },
    };
  }

  protected onBackdropMouseDown(e: MouseEvent): void {
    // TSX 2333-2335: only a mousedown that targets the backdrop itself closes.
    if (e.target === e.currentTarget) this.closeChart.emit();
  }

  protected onKeyDown(e: KeyboardEvent): void {
    // TSX 2208-2234: Escape closes; Tab is manually trapped within the dialog.
    if (e.key === "Escape") {
      e.stopPropagation();
      this.closeChart.emit();
      return;
    }
    if (e.key !== "Tab") return;
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) return;
    trapTabKey(dialog, e);
  }

  protected onOverlayLayerClick(layer: PerioOverlayLayer): void {
    setPerioOverlayLayer(layer);
  }

  protected overlaySwitchLabel(layer: PerioOverlayLayer): string {
    return computeOverlaySwitchLabel(layer);
  }

  // TSX 2248-2263: the whole-mouth read-out shown next to the active
  // overlay-switcher pill, when that layer has one.
  protected overlayReadout(): string | null {
    const layer = this.overlayLayer();
    const s = this.summary();
    if (layer === "bop") return `${this.i18n.t("perio.bopPercent")} ${s.bopPercent}%`;
    if (layer === "plaque") return `${this.i18n.t("plaque.percent")} ${s.plaquePercent}%`;
    if (layer === "pi") return `${this.i18n.t("perio.overlay.pi")} ${s.piScore ?? "—"}`;
    if (layer === "gi") return `${this.i18n.t("perio.overlay.gi")} ${s.giScore ?? "—"}`;
    if (layer === "kg") return `${this.i18n.t("perio.overlay.kg")} ${s.kgDeficientTeeth}`;
    if (layer === "mpi") return `${this.i18n.t("perio.overlay.mpi")} ${s.mpiScore ?? "—"}`;
    if (layer === "mbi") return `${this.i18n.t("perio.overlay.mbi")} ${s.mbiScore ?? "—"}`;
    return null;
  }
}
