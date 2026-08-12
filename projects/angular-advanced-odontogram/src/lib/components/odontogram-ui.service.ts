// Angular port of $ENGINE@934a911:src/OdontogramContext.tsx (813 lines) —
// Composable-UI foundation, Tier 1.
//
// `OdontogramProvider` owns the ENTIRE former App.tsx component body — all
// state/refs/memos, the `useI18n` call, every `useEffect` (init/destroy
// first, then the configure effects, then the five `onStateChange`
// mirrors), the `settingsState` bundle, and all handlers — and exposes
// everything the surface components + shell modals need through
// `OdontogramUiContext`. `OdontogramUiService` is that port: a plain
// `@Injectable()` (no `providedIn`) instantiated PER SHELL INSTANCE via
// `OdontogramShellComponent`'s own `providers: [OdontogramUiService]` array
// — the Angular equivalent of one `<OdontogramProvider>` per mounted `<App/>`.
// Every descendant (the shell itself, the four surfaces, T3's cards) reads
// the SAME instance via `inject(OdontogramUiService)`, exactly like
// `useOdontogramUi()` reads the nearest provider's context value.
//
// Angular has no props system, so the piece of `OdontogramProviderProps`
// that would normally flow in as component props is threaded through
// explicitly: the shell calls `configure()` once, in its own constructor,
// handing over its `input()` signals (read reactively inside this service's
// own `effect()`s — a `Signal<T>` can be captured and read from any
// injection-context class, not just the component that declared it) plus
// the `output()` callbacks this service's handlers invoke on user action.
// `init()`/`destroy()` are separate methods the shell calls from its own
// `ngAfterViewInit()`/`ngOnDestroy()` — a plain `@Injectable` has no view
// lifecycle hooks of its own, and the mount-before-init guarantee (DOM
// children must exist before `initOdontogram()` runs so `wireControls()`
// finds every `#id`) depends on that exact timing: Angular constructs the
// whole component tree (including this service, injected during the
// shell's own constructor) BEFORE `ngAfterViewInit` fires, and `effect()`s
// created during construction don't run their first pass synchronously —
// they flush on a later tick — so as long as `init()` is called from
// `ngAfterViewInit()` (never from this service's constructor or from an
// `effect()`), the ordering the source's linear effect declaration order
// encodes ("init/destroy first, then configure effects, then the five
// onStateChange mirrors") holds without any extra bookkeeping: `init()`
// always resolves before any effect's first flush.
//
// Region-local UI state (header dropdown open flags + the outside-click
// effect) stays OUT of this service and lives in OdontogramTopbarComponent,
// per the source file's own header comment.
//
// DOM-mount-strategy note (deviation from the pinned surfaces): the pinned
// `OdontogramChartSurface`/`ToothControlsSurface` unmount `#chartModeToggle`/
// the whole controls panel when hidden (Composable-UI Tier 2 made
// `rewireControls()`/`rebuildGrid()` safe to re-run on remount). This port
// keeps the EXISTING, already-tested "always mounted, CSS `display:none`/
// `.hidden`" strategy for all of it instead — see the surface components'
// own header comments for the full rationale (recorded in the Task 2 report).
import {
  Injectable,
  Signal,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import {
  applyThemeConfig,
  type OdontogramThemeConfig,
} from "../core/theme";
import type { OdontogramPlugin } from "../core/plugin";
import type { Language } from "../core/i18n/translations";
import type { NumberingSystem } from "../core/utils/numbering";
import {
  closePerioOverlay,
  getChartMode,
  getFillingComplexity,
  getFillingDefectEnabled,
  getFillingMaterialAvailability,
  getFissureSealingEnabled,
  getOdontogramSummary,
  getPdfSettings,
  getPerioIndexNameMode,
  getPerioRowVisibility,
  getPerioViewMode,
  getToothAnatomy,
  hasAnyPerioData,
  isDualStateConfirmPending,
  isPerioOverlayOpen,
  onStateChange,
  rebuildGrid,
  registerPlugins,
  setCariesDepthEnabled,
  setChartMode,
  setDiscolorationDetailLevel,
  setFillingComplexity,
  setFillingDefectEnabled,
  setFillingMaterialAvailability,
  setFissureSealingEnabled,
  setIcdasEnabled,
  setNotesEnabled,
  setNumberingSystem,
  setPdfSettings,
  setPerioIndexNameMode,
  setPerioRowVisibility,
  setPerioViewMode,
  setPulpDetailLevel,
  setRadiographicDepthMode,
  setReadOnly,
  setRootCariesMode,
  setSecondaryCariesMode,
  setSurfaceNotation,
  setToothAnatomy,
  setWearDetailLevel,
  type OdontogramSummary,
  type PdfSettings,
  type PerioIndexNameMode,
  type PerioRowId,
  type PerioViewMode,
  type PulpDetailLevel,
  type RadiographicDepthMode,
  type RootCariesMode,
  type SecondaryCariesMode,
  type SurfaceNotation,
  type ToothAnatomy,
  type ToothDetailLevel,
} from "../core/odontogram";
import { I18nService } from "../i18n/i18n.service";
import { ODONTOGRAM_ENGINE_LIFECYCLE } from "./odontogram-engine-lifecycle";
import type {
  FillingComplexity,
  ScreenToothNumberSize,
  ScreenToothSpacing,
  SelectionBorderStyle,
  SettingsState,
} from "./settings-modal/settings-modal.component";

// App.tsx/OdontogramContext.tsx: languages whose native reading direction is
// right-to-left (only Arabic today). The root's `dir` reacts to the active
// language and never mutates `document.documentElement` — an embedding
// host's direction is not ours to change.
const RTL_LANGUAGES: ReadonlySet<Language> = new Set(["ar"]);

/**
 * The full former `OdontogramShell` props surface, threaded in once via
 * {@link OdontogramUiService.configure} instead of React props. Every
 * `Signal` is read reactively inside this service's own `effect()`s; every
 * `on*Change` callback is what the shell's own `output()` emitters call
 * into (see `OdontogramShellComponent`).
 */
export interface OdontogramUiConfig {
  language: Signal<Language | undefined>;
  onLanguageChange: (lang: Language) => void;
  numberingSystem: Signal<NumberingSystem | undefined>;
  onNumberingChange: (system: NumberingSystem) => void;
  darkMode: Signal<boolean | undefined>;
  onDarkModeChange: (dark: boolean) => void;
  themeConfig: Signal<OdontogramThemeConfig | undefined>;
  themeRoot: Signal<HTMLElement | null>;
  plugins: Signal<OdontogramPlugin[] | undefined>;
  readOnly: Signal<boolean | undefined>;
  enableNotes: Signal<boolean | undefined>;
  enableIcdas: Signal<boolean | undefined>;
  pulpDetailLevel: Signal<PulpDetailLevel | undefined>;
  secondaryCariesMode: Signal<SecondaryCariesMode | undefined>;
  rootCariesMode: Signal<RootCariesMode | undefined>;
  radiographicDepthMode: Signal<RadiographicDepthMode | undefined>;
  cariesDepthEnabled: Signal<boolean | undefined>;
  wearDetailLevel: Signal<ToothDetailLevel | undefined>;
  discolorationDetailLevel: Signal<ToothDetailLevel | undefined>;
  surfaceNotation: Signal<SurfaceNotation | undefined>;
  showStatusCard: Signal<boolean | undefined>;
  showOrthoCard: Signal<boolean | undefined>;
  // v2.4.0/1.2.0 resync — fillings controlled props (OdontogramContext.tsx
  // 366-373/568-604): DEFINED-GATED sync (an omitted prop never writes the
  // engine — the fillings flags genuinely live in module state, see each
  // effect below) and NOT fired for prop-driven restores (only the
  // Settings-modal handlers in `settingsState` call the `on*Change` callbacks).
  fillingComplexity: Signal<FillingComplexity | undefined>;
  onFillingComplexityChange: (value: FillingComplexity) => void;
  fillingDefectEnabled: Signal<boolean | undefined>;
  onFillingDefectEnabledChange: (enabled: boolean) => void;
  fillingMaterialAvailability: Signal<Record<string, boolean> | undefined>;
  onFillingMaterialAvailabilityChange: (material: string, enabled: boolean) => void;
  fissureSealingEnabled: Signal<boolean | undefined>;
  onFissureSealingEnabledChange: (enabled: boolean) => void;
}

@Injectable()
export class OdontogramUiService {
  private readonly i18n = inject(I18nService);
  private readonly engineLifecycle = inject(ODONTOGRAM_ENGINE_LIFECYCLE);
  private cfg: OdontogramUiConfig | null = null;

  // ---------------------------------------------------------------------
  // Language / numbering / dark mode (OdontogramContext.tsx 375-378/461-484).
  // `I18nService.lang` already mirrors the core i18n bus, so it stands in
  // for React's `internalLang` state the way it already did in the
  // pre-resync shell.
  // ---------------------------------------------------------------------
  readonly lang = computed<Language>(() => this.cfg!.language() ?? this.i18n.lang());
  readonly isRtl = computed(() => RTL_LANGUAGES.has(this.lang()));

  private readonly internalNumbering = signal<NumberingSystem>("FDI");
  readonly currentNumbering = computed(
    () => this.cfg!.numberingSystem() ?? this.internalNumbering(),
  );

  private readonly internalDark = signal<boolean>(
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false,
  );
  readonly isDark = computed(() => this.cfg!.darkMode() ?? this.internalDark());

  // ---------------------------------------------------------------------
  // Settings-tab mirrors (OdontogramContext.tsx 380-420) — local state kept
  // in sync with the engine module flags via the configure effects below,
  // bundled into `settingsState` for the Settings modal.
  // ---------------------------------------------------------------------
  private readonly notesOn = signal(false);
  private readonly icdasOn = signal(false);
  private readonly pulpLevel = signal<PulpDetailLevel>("aae");
  private readonly secondaryMode = signal<SecondaryCariesMode>("standard");
  private readonly rootMode = signal<RootCariesMode>("simple");
  private readonly radiographicMode = signal<RadiographicDepthMode>("off");
  private readonly cariesDepthOn = signal(true);
  private readonly wearLevel = signal<ToothDetailLevel>("complex");
  private readonly discoLevel = signal<ToothDetailLevel>("complex");
  private readonly notation = signal<SurfaceNotation>("full");
  readonly toothInfoOn = signal(true);

  // Per-format export + per-source import availability (session-only UI
  // config, all default ON — OdontogramContext.tsx 391-399).
  readonly exportPngOn = signal(true);
  readonly exportJpgOn = signal(true);
  readonly exportSvgOn = signal(true);
  readonly exportPdfOn = signal(true);
  readonly importStatusOn = signal(true);
  readonly importFhirOn = signal(true);
  // Odontogram-tab on-screen controls (session-only, OdontogramContext.tsx 400-407).
  readonly planModeAvailable = signal(true);
  readonly perioChartAvailable = signal(true);
  readonly screenSpacing = signal<ScreenToothSpacing>("normal");
  readonly screenNumberSize = signal<ScreenToothNumberSize>("normal");
  readonly selectionColor = signal<string>("#3b7bff");
  readonly selectionBorderStyle = signal<SelectionBorderStyle>("dashed");
  // Fillings-tab config (OdontogramContext.tsx 408-414) — the initializers
  // prefer a provided prop, falling back to the engine's current module
  // value, so an imperative setX() call before `configure()` is never
  // clobbered by a plain default. Seeded lazily inside `configure()` (the
  // config object isn't available at field-initializer time).
  readonly fillingDefectOn = signal<boolean>(getFillingDefectEnabled());
  readonly fillingComplexityState = signal<FillingComplexity>(getFillingComplexity());
  readonly fissureSealingOn = signal<boolean>(getFissureSealingEnabled());
  readonly fillingMaterialsState = signal<Record<string, boolean>>(getFillingMaterialAvailability());
  readonly showStatusCard = signal<boolean>(true);
  readonly showOrthoCard = signal<boolean>(true);

  // onStateChange mirrors (OdontogramContext.tsx 417-459/606-670).
  readonly summary = signal<OdontogramSummary | null>(null);
  readonly hasPerio = signal(false);
  readonly perioOpen = signal(false);
  readonly viewMode = signal<PerioViewMode>(getPerioViewMode());
  readonly pdfSettingsState = signal<PdfSettings>(getPdfSettings());
  readonly perioRowVisibilityState = signal<Record<PerioRowId, boolean>>(getPerioRowVisibility());
  readonly perioIndexNameModeState = signal<PerioIndexNameMode>(getPerioIndexNameMode());
  readonly confirmOpen = signal(false);
  // Mirrors the module-level tooth-anatomy profile (OdontogramContext.tsx
  // 432-435/646-652) — consumed by OdontogramChartSurfaceComponent's
  // `data-anatomy` attribute AND the Settings-modal picker
  // (`settingsState.toothAnatomy`/`onToothAnatomy`, wired below).
  readonly toothAnatomy = signal<ToothAnatomy>(getToothAnatomy());

  // App.tsx's `isPerioView` (OdontogramContext.tsx 452) — only true in
  // toggle-mode dentalChart.
  readonly activeView = signal<"odontogram" | "dentalChart">("odontogram");
  readonly isPerioView = computed(
    () => this.viewMode() === "toggle" && this.activeView() === "dentalChart",
  );
  setActiveView(view: "odontogram" | "dentalChart"): void {
    this.activeView.set(view);
  }

  // Modal plumbing (OdontogramContext.tsx 379/419-420).
  readonly settingsOpen = signal(false);
  readonly pdfOpen = signal(false);
  // Credits modal (v2.4.0/1.2.0 resync — new in the pinned provider). The
  // modal component itself is Task 4's scope; the open signal + setter are
  // wired here now so OdontogramTopbarComponent's new "About and credits"
  // button has something real to toggle.
  readonly creditsOpen = signal(false);

  setSettingsOpen(open: boolean): void {
    this.settingsOpen.set(open);
  }
  setPdfOpen(open: boolean): void {
    this.pdfOpen.set(open);
  }
  setCreditsOpen(open: boolean): void {
    this.creditsOpen.set(open);
  }

  // -----------------------------------------------------------------------
  // Handlers (OdontogramContext.tsx 476-763).
  // -----------------------------------------------------------------------

  /** useI18n.ts 77-84 (framework-free-bus era): emits regardless of mode;
   *  only pushes into the core i18n bus when uncontrolled (no `language`
   *  config value bound). */
  setLang(next: Language): void {
    this.cfg!.onLanguageChange(next);
    if (this.cfg!.language() === undefined) {
      this.i18n.setLanguage(next);
    }
  }

  /** OdontogramContext.tsx 486-493, verbatim: controlled/uncontrolled
   *  numbering — always emits `onNumberingChange`; only writes
   *  `internalNumbering` when uncontrolled. */
  setNumbering(next: NumberingSystem): void {
    if (this.cfg!.numberingSystem() !== undefined) {
      this.cfg!.onNumberingChange(next);
      return;
    }
    this.internalNumbering.set(next);
    this.cfg!.onNumberingChange(next);
  }

  /** OdontogramContext.tsx 476-484, verbatim: standalone flips
   *  `internalDark`; controlled never touches internal state — either way
   *  `onDarkModeChange` always fires. */
  toggleDark(): void {
    const next = !this.isDark();
    if (this.cfg!.darkMode() !== undefined) {
      this.cfg!.onDarkModeChange(next);
    } else {
      this.internalDark.set(next);
      this.cfg!.onDarkModeChange(next);
    }
  }

  private readonly onNumbering = (v: NumberingSystem): void => this.setNumbering(v);
  private readonly onLanguage = (v: Language): void => this.setLang(v);
  private readonly onToggleDark = (): void => this.toggleDark();
  private readonly onToothInfo = (v: boolean): void => this.toothInfoOn.set(v);
  private readonly onExportPng = (v: boolean): void => this.exportPngOn.set(v);
  private readonly onExportJpg = (v: boolean): void => this.exportJpgOn.set(v);
  private readonly onExportSvg = (v: boolean): void => this.exportSvgOn.set(v);
  private readonly onExportPdf = (v: boolean): void => this.exportPdfOn.set(v);
  private readonly onImportStatus = (v: boolean): void => this.importStatusOn.set(v);
  private readonly onImportFhir = (v: boolean): void => this.importFhirOn.set(v);
  private readonly onSecondaryCariesMode = (v: SecondaryCariesMode): void => {
    this.secondaryMode.set(v);
    setSecondaryCariesMode(v);
  };
  private readonly onIcdas = (v: boolean): void => {
    this.icdasOn.set(v);
    setIcdasEnabled(v);
  };
  private readonly onCariesDepth = (v: boolean): void => {
    this.cariesDepthOn.set(v);
    setCariesDepthEnabled(v);
  };
  private readonly onRootCariesMode = (v: RootCariesMode): void => {
    this.rootMode.set(v);
    setRootCariesMode(v);
  };
  private readonly onRadiographicDepthMode = (v: RadiographicDepthMode): void => {
    this.radiographicMode.set(v);
    setRadiographicDepthMode(v);
  };
  private readonly onSelectionColor = (v: string): void => this.selectionColor.set(v);
  private readonly onSelectionBorderStyle = (v: SelectionBorderStyle): void =>
    this.selectionBorderStyle.set(v);
  private readonly onPulpLevel = (v: PulpDetailLevel): void => {
    this.pulpLevel.set(v);
    setPulpDetailLevel(v);
  };
  private readonly onWearDetailLevel = (v: ToothDetailLevel): void => {
    this.wearLevel.set(v);
    setWearDetailLevel(v);
  };
  private readonly onDiscolorationDetailLevel = (v: ToothDetailLevel): void => {
    this.discoLevel.set(v);
    setDiscolorationDetailLevel(v);
  };
  private readonly onSurfaceNotation = (v: SurfaceNotation): void => {
    this.notation.set(v);
    setSurfaceNotation(v);
  };
  private readonly onNotes = (v: boolean): void => {
    this.notesOn.set(v);
    setNotesEnabled(v);
  };
  private readonly onPlanModeAvailable = (v: boolean): void => {
    this.planModeAvailable.set(v);
    // Leaving plan unavailable must not strand the chart in plan mode.
    if (!v && getChartMode() === "plan") setChartMode("status");
  };
  private readonly onScreenToothSpacing = (v: ScreenToothSpacing): void =>
    this.screenSpacing.set(v);
  private readonly onScreenToothNumberSize = (v: ScreenToothNumberSize): void =>
    this.screenNumberSize.set(v);
  // Tooth-anatomy profile picker (OdontogramContext.tsx 725-730): writes the
  // local mirror, the engine module flag, then rebuilds the grid so the new
  // profile's layout/artwork takes effect immediately.
  private readonly onToothAnatomy = (v: ToothAnatomy): void => {
    this.toothAnatomy.set(v);
    setToothAnatomy(v);
    void rebuildGrid();
  };
  private readonly onShowStatusCard = (v: boolean): void => this.showStatusCard.set(v);
  private readonly onShowOrthoCard = (v: boolean): void => this.showOrthoCard.set(v);
  private readonly onPerioChartAvailable = (v: boolean): void => {
    this.perioChartAvailable.set(v);
    // Turning perio off must leave the user on the odontogram, not stranded
    // on a now-hidden perio view / open overlay.
    if (!v) {
      this.activeView.set("odontogram");
      closePerioOverlay();
    }
  };
  // perioViewMode/perioRowVisibility/perioIndexNameMode call the engine
  // setter only — the onStateChange mirror below is what feeds the new
  // value back into state (and thus into the next `settingsState()` read).
  private readonly onPerioViewMode = (v: PerioViewMode): void => setPerioViewMode(v);
  private readonly onPerioRowVisibility = (id: PerioRowId, v: boolean): void =>
    setPerioRowVisibility(id, v);
  private readonly onPerioIndexNameMode = (v: PerioIndexNameMode): void =>
    setPerioIndexNameMode(v);
  // Fillings tab config — mirrors odontogram.ts module flags, same
  // round-trip-through-local-state pattern as the other module-backed
  // handlers above, PLUS the host callback (fired only from here, never
  // from the prop-sync effects below).
  private readonly onFillingDefectEnabled = (v: boolean): void => {
    this.fillingDefectOn.set(v);
    setFillingDefectEnabled(v);
    this.cfg!.onFillingDefectEnabledChange(v);
  };
  private readonly onFillingComplexity = (v: FillingComplexity): void => {
    this.fillingComplexityState.set(v);
    setFillingComplexity(v);
    this.cfg!.onFillingComplexityChange(v);
  };
  private readonly onFillingMaterial = (material: string, v: boolean): void => {
    this.fillingMaterialsState.update((prev) => ({ ...prev, [material]: v }));
    setFillingMaterialAvailability(material, v);
    this.cfg!.onFillingMaterialAvailabilityChange(material, v);
  };
  private readonly onFissureSealingEnabled = (v: boolean): void => {
    this.fissureSealingOn.set(v);
    setFissureSealingEnabled(v);
    this.cfg!.onFissureSealingEnabledChange(v);
  };
  private readonly onPdfSettings = (patch: Partial<PdfSettings>): void => {
    setPdfSettings(patch);
    this.pdfSettingsState.set(getPdfSettings());
  };

  /** The live settings surface for the tabbed Settings modal
   *  (OdontogramContext.tsx 674-763). */
  readonly settingsState = computed<SettingsState>(() => ({
    numbering: this.currentNumbering(),
    onNumbering: this.onNumbering,
    language: this.lang(),
    onLanguage: this.onLanguage,
    isDark: this.isDark(),
    onToggleDark: this.onToggleDark,
    toothInfo: this.toothInfoOn(),
    onToothInfo: this.onToothInfo,
    exportPng: this.exportPngOn(),
    onExportPng: this.onExportPng,
    exportJpg: this.exportJpgOn(),
    onExportJpg: this.onExportJpg,
    exportSvg: this.exportSvgOn(),
    onExportSvg: this.onExportSvg,
    exportPdf: this.exportPdfOn(),
    onExportPdf: this.onExportPdf,
    importStatus: this.importStatusOn(),
    onImportStatus: this.onImportStatus,
    importFhir: this.importFhirOn(),
    onImportFhir: this.onImportFhir,
    secondaryCariesMode: this.secondaryMode(),
    onSecondaryCariesMode: this.onSecondaryCariesMode,
    icdas: this.icdasOn(),
    onIcdas: this.onIcdas,
    cariesDepth: this.cariesDepthOn(),
    onCariesDepth: this.onCariesDepth,
    rootCariesMode: this.rootMode(),
    onRootCariesMode: this.onRootCariesMode,
    radiographicDepthMode: this.radiographicMode(),
    onRadiographicDepthMode: this.onRadiographicDepthMode,
    selectionColor: this.selectionColor(),
    onSelectionColor: this.onSelectionColor,
    selectionBorderStyle: this.selectionBorderStyle(),
    onSelectionBorderStyle: this.onSelectionBorderStyle,
    pulpLevel: this.pulpLevel(),
    onPulpLevel: this.onPulpLevel,
    wearDetailLevel: this.wearLevel(),
    onWearDetailLevel: this.onWearDetailLevel,
    discolorationDetailLevel: this.discoLevel(),
    onDiscolorationDetailLevel: this.onDiscolorationDetailLevel,
    surfaceNotation: this.notation(),
    onSurfaceNotation: this.onSurfaceNotation,
    notes: this.notesOn(),
    onNotes: this.onNotes,
    planModeAvailable: this.planModeAvailable(),
    onPlanModeAvailable: this.onPlanModeAvailable,
    screenToothSpacing: this.screenSpacing(),
    onScreenToothSpacing: this.onScreenToothSpacing,
    screenToothNumberSize: this.screenNumberSize(),
    onScreenToothNumberSize: this.onScreenToothNumberSize,
    toothAnatomy: this.toothAnatomy(),
    onToothAnatomy: this.onToothAnatomy,
    showStatusCard: this.showStatusCard(),
    onShowStatusCard: this.onShowStatusCard,
    showOrthoCard: this.showOrthoCard(),
    onShowOrthoCard: this.onShowOrthoCard,
    perioChartAvailable: this.perioChartAvailable(),
    onPerioChartAvailable: this.onPerioChartAvailable,
    perioViewMode: this.viewMode(),
    onPerioViewMode: this.onPerioViewMode,
    perioRowVisibility: this.perioRowVisibilityState(),
    onPerioRowVisibility: this.onPerioRowVisibility,
    perioIndexNameMode: this.perioIndexNameModeState(),
    onPerioIndexNameMode: this.onPerioIndexNameMode,
    fillingDefectEnabled: this.fillingDefectOn(),
    onFillingDefectEnabled: this.onFillingDefectEnabled,
    fillingComplexity: this.fillingComplexityState(),
    onFillingComplexity: this.onFillingComplexity,
    fillingMaterials: this.fillingMaterialsState(),
    onFillingMaterial: this.onFillingMaterial,
    fissureSealingEnabled: this.fissureSealingOn(),
    onFissureSealingEnabled: this.onFissureSealingEnabled,
    pdfSettings: this.pdfSettingsState(),
    onPdfSettings: this.onPdfSettings,
  }));

  // Diff-write tracking for `fillingMaterialAvailability` prop sync (mirrors
  // OdontogramContext.tsx's `prevMaterialsRef`).
  private prevMaterials: Record<string, boolean> | null = null;

  /**
   * Thread the shell's inputs/outputs into this service. Called exactly
   * once, from `OdontogramShellComponent`'s own constructor — sets up every
   * "configure" effect (numbering/theme/plugins/readOnly/notes/icdas/...
   * /fillings-controlled-props) plus the seven onStateChange mirrors.
   * Deliberately does NOT call `engineLifecycle.init()` — see `init()` below
   * and this file's header comment for why that has to wait for
   * `ngAfterViewInit()`.
   */
  configure(cfg: OdontogramUiConfig): void {
    this.cfg = cfg;
    this.internalNumbering.set(cfg.numberingSystem() ?? "FDI");
    if (cfg.darkMode() !== undefined) this.internalDark.set(cfg.darkMode()!);
    this.fillingDefectOn.set(cfg.fillingDefectEnabled() ?? getFillingDefectEnabled());
    this.fillingComplexityState.set(cfg.fillingComplexity() ?? getFillingComplexity());
    this.fissureSealingOn.set(cfg.fissureSealingEnabled() ?? getFissureSealingEnabled());
    this.fillingMaterialsState.set(cfg.fillingMaterialAvailability() ?? getFillingMaterialAvailability());
    this.showStatusCard.set(cfg.showStatusCard() ?? true);
    this.showOrthoCard.set(cfg.showOrthoCard() ?? true);

    // Language: push the effective language into the core i18n bus whenever
    // it changes (useI18n.ts-era 73-75). A same-value guard makes this
    // effect's termination locally obvious.
    effect(() => {
      const next = this.lang();
      if (next !== this.i18n.lang()) {
        this.i18n.setLanguage(next);
      }
    });

    effect(() => setNumberingSystem(this.currentNumbering()));
    effect(() => applyThemeConfig(cfg.themeRoot(), cfg.themeConfig()));
    effect(() => registerPlugins(cfg.plugins() ?? []));
    effect(() => setReadOnly(cfg.readOnly() ?? false));
    effect(() => {
      const v = cfg.enableNotes() ?? false;
      setNotesEnabled(v);
      this.notesOn.set(v);
    });
    effect(() => {
      const v = cfg.enableIcdas() ?? false;
      setIcdasEnabled(v);
      this.icdasOn.set(v);
    });
    effect(() => {
      const v = cfg.pulpDetailLevel() ?? "aae";
      setPulpDetailLevel(v);
      this.pulpLevel.set(v);
    });
    effect(() => {
      const v = cfg.secondaryCariesMode() ?? "standard";
      setSecondaryCariesMode(v);
      this.secondaryMode.set(v);
    });
    effect(() => {
      const v = cfg.rootCariesMode() ?? "simple";
      setRootCariesMode(v);
      this.rootMode.set(v);
    });
    effect(() => {
      const v = cfg.radiographicDepthMode() ?? "off";
      setRadiographicDepthMode(v);
      this.radiographicMode.set(v);
    });
    effect(() => {
      const v = cfg.cariesDepthEnabled() ?? true;
      setCariesDepthEnabled(v);
      this.cariesDepthOn.set(v);
    });
    effect(() => {
      const v = cfg.wearDetailLevel() ?? "complex";
      setWearDetailLevel(v);
      this.wearLevel.set(v);
    });
    effect(() => {
      const v = cfg.discolorationDetailLevel() ?? "complex";
      setDiscolorationDetailLevel(v);
      this.discoLevel.set(v);
    });
    effect(() => {
      const v = cfg.surfaceNotation() ?? "full";
      setSurfaceNotation(v);
      this.notation.set(v);
    });
    effect(() => this.showStatusCard.set(cfg.showStatusCard() ?? true));
    effect(() => this.showOrthoCard.set(cfg.showOrthoCard() ?? true));

    // Dark mode: only manage the `.dark` class when standalone.
    effect(() => {
      if (cfg.darkMode() === undefined) {
        document.documentElement.classList.toggle("dark", this.internalDark());
      }
    });

    // Fillings-tab controlled props (1.2.0 resync): DEFINED-GATED — an
    // omitted prop must never write the engine, since these flags genuinely
    // live in module state (a host may call setFillingComplexity() etc.
    // before mounting, and `configure()`'s seeding above already read that
    // value). NOT fired for prop-driven restores — no `on*Change` call here.
    effect(() => {
      const v = cfg.fillingComplexity();
      if (v !== undefined) {
        setFillingComplexity(v);
        this.fillingComplexityState.set(v);
      }
    });
    effect(() => {
      const v = cfg.fillingDefectEnabled();
      if (v !== undefined) {
        setFillingDefectEnabled(v);
        this.fillingDefectOn.set(v);
      }
    });
    effect(() => {
      const v = cfg.fissureSealingEnabled();
      if (v !== undefined) {
        setFissureSealingEnabled(v);
        this.fissureSealingOn.set(v);
      }
    });
    // Canonical serialized key over the material record — an inline-literal
    // prop re-renders every time, but the diff below only WRITES when the
    // CONTENT changes (sorted keys, so key order never matters). `null` =
    // prop absent.
    const fillingMaterialsKey = computed(() => {
      const rec = cfg.fillingMaterialAvailability();
      if (rec === undefined) return null;
      const entries = Object.keys(rec).sort().map((m) => [m, !!rec[m]] as const);
      return JSON.stringify(entries);
    });
    effect(() => {
      const key = fillingMaterialsKey();
      if (key === null) {
        this.prevMaterials = null;
        return;
      }
      const entries = JSON.parse(key) as [string, boolean][];
      const next = Object.fromEntries(entries);
      const prev = this.prevMaterials ?? {};
      for (const [m, on] of entries) {
        if (prev[m] !== on) setFillingMaterialAvailability(m, on);
      }
      this.prevMaterials = next;
      this.fillingMaterialsState.set({ ...next });
    });

    // Refresh the tooth-information summary while its panel is open.
    // Recomputes on every state change, and when language/numbering change
    // (which affect labels).
    effect((onCleanup) => {
      if (!this.toothInfoOn()) return;
      this.lang();
      this.currentNumbering();
      const refresh = () => this.summary.set(getOdontogramSummary());
      refresh();
      onCleanup(onStateChange(refresh));
    });

    // Perio-data presence — unconditional, own effect.
    effect((onCleanup) => {
      const refresh = () => this.hasPerio.set(hasAnyPerioData());
      refresh();
      onCleanup(onStateChange(refresh));
    });

    // Perio-overlay open flag.
    effect((onCleanup) => {
      const refresh = () => this.perioOpen.set(isPerioOverlayOpen());
      refresh();
      onCleanup(onStateChange(refresh));
    });

    // Perio view mode.
    effect((onCleanup) => {
      const refresh = () => this.viewMode.set(getPerioViewMode());
      refresh();
      onCleanup(onStateChange(refresh));
    });

    // Tooth-anatomy profile.
    effect((onCleanup) => {
      const refresh = () => this.toothAnatomy.set(getToothAnatomy());
      refresh();
      onCleanup(onStateChange(refresh));
    });

    // Perio-row-visibility / perio-index-name-mode mirrors.
    effect((onCleanup) => {
      const refresh = () => {
        this.perioRowVisibilityState.set(getPerioRowVisibility());
        this.perioIndexNameModeState.set(getPerioIndexNameMode());
      };
      refresh();
      onCleanup(onStateChange(refresh));
    });

    // Dual-state confirm pending flag — subscribe only, no initial read (a
    // confirm can only be requested by a post-mount edit).
    effect((onCleanup) => {
      onCleanup(onStateChange(() => this.confirmOpen.set(isDualStateConfirmPending())));
    });
  }

  /** Called from `OdontogramShellComponent.ngAfterViewInit()` — fire and
   *  forget, exactly like the untouched React effect (the engine's own init
   *  is async but not awaited here either). Must run AFTER the shell's own
   *  template (and therefore every surface's DOM) has been created — see
   *  this file's header comment. */
  init(): void {
    void this.engineLifecycle.init();
  }

  /** Called from `OdontogramShellComponent.ngOnDestroy()`. The onStateChange
   *  mirrors above are all registered via `effect()`'s own `onCleanup`, and
   *  every `effect()` created in `configure()` is tied to the injector that
   *  was active while it ran — the shell's own element injector, since
   *  `configure()` is called synchronously from the shell's constructor —
   *  so Angular tears all of them down automatically when the shell (this
   *  service's provider) is destroyed. No separate bookkeeping needed here
   *  beyond the engine teardown call itself. */
  destroy(): void {
    this.engineLifecycle.destroy();
  }
}
