// Angular port of $ENGINE/src/SettingsModal.tsx.
//
// Phase 3 Task 2 built the modal shell + the 7-tab-era SettingsState surface;
// Phase 6 Task 3 (v2.4.0 resync pin `f9b45fc`, 1171 lines) is the reorg this
// file now carries: SETTINGS_TABS regrouped to
// general/odontogram/periodontalChart/toothDetails/caries/fillings/export
// (TSX 456-973) — general gained the export/import availability toggles
// (dropping the old "coming soon" placeholder), odontogram absorbed the
// screen-layout controls + toothInfo + the two card toggles, periodontalChart
// gained an availability toggle that gates the rest of the tab, toothDetails
// absorbed the former Pulp + Notes tabs' controls plus the new selection
// colour/border rows, a new Fillings tab was added, and PDF Settings became
// the full "Export Settings" tab (TSX 787-971) driven by `settings.pdfSettings`
// + `settings.onPdfSettings`. The dialog owns no setting state itself: it is
// a pure view over `SettingsState`, mirroring the React component's
// `settings` prop — every value + its `on*` callback is supplied by the
// host, the modal never mutates anything directly.
//
// Shares the `.odon-settings-*` / `.odon-confirm-*`-sibling dialog contract
// with DualStateConfirmComponent: `role="dialog"` + `aria-modal`, Esc closes,
// backdrop-mousedown-on-self closes, focus trapped while open + restored to
// the opener on close (Task 1's `dialog-focus.ts` helpers, TSX 1005-1042).
//
// Additionally implements the APG tabs pattern for the `role="tablist"` tab
// strip (TSX 1051-1073): roving tabindex + Arrow Left/Right/Up/Down wrap,
// Home/End, activation-follows-focus. The Export Settings tab is disabled
// (TSX 1080-1082, 1136-1152) whenever `settings().exportPdf` is false — its
// controls would have no effect with PDF export off; the panel falls back to
// the first (general) tab's content in that case, even if the tab strip's
// roving tabindex still lets Arrow-key nav land the (visually disabled)
// export button (TSX's own `onTabListKeyDown` never checks `tabDisabled`).
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
import { I18nService } from "../../i18n/i18n.service";
import { focusFirst, nextDialogTitleId, trapTabKey } from "../shared/dialog-focus";
import type { Language } from "../../core/i18n/translations";
import type { NumberingSystem } from "../../core/utils/numbering";
import type {
  PdfBorderThickness,
  PdfDateFormat,
  PdfPerioFontSize,
  PdfPerioLabelPlacement,
  PdfSettings,
  PdfSummaryGrouping,
  PdfToothNumberSize,
  PdfToothSpacing,
  PerioIndexNameMode,
  PerioRowId,
  PerioViewMode,
  PulpDetailLevel,
  RadiographicDepthMode,
  RootCariesMode,
  SecondaryCariesMode,
  SurfaceNotation,
  ToothAnatomy,
  ToothDetailLevel,
} from "../../core/odontogram";
import type { PdfColorTheme } from "../../core/perioPdf";

// v2.4.0 resync (Task 2): the four small value-type aliases SettingsModal.tsx
// exports alongside its `SettingsState` (TSX 42-50) — ported verbatim so the
// interface fields below can reference them.
/** On-screen odontogram layout controls (distinct from the PDF/export
 *  equivalents). Spacing = inter-tooth gap in the live grid; number size = the
 *  tooth-number font size. Session-only, pure CSS via data-attributes on the
 *  `#toothGrid` element. */
export type ScreenToothSpacing = "wide" | "normal" | "close";
export type ScreenToothNumberSize = "small" | "normal" | "xlarge";
/** Selection-ring border style (default dashed). */
export type SelectionBorderStyle = "solid" | "dashed" | "dotted";
/** Fillings card complexity — "complex" = per-surface grid (default), "simple"
 *  = one filled/not-filled toggle for the whole tooth. */
export type FillingComplexity = "complex" | "simple";
/** The four filling materials whose availability is configurable (TSX 50). */
export const FILLING_MATERIAL_KEYS = ["amalgam", "composite", "gic", "temporary"] as const;

/**
 * The full set of live setting values + change handlers the modal drives.
 * Field-for-field identical to SettingsModal.tsx's `SettingsState` (52-133,
 * v2.4.0 pin `f9b45fc`) — every field maps 1:1 to an existing app-level piece
 * of state.
 *
 * NOTE for the host wiring this up (OdontogramShellComponent): unlike React
 * re-rendering from scratch, Angular's `[checked]`/`[selected]` bindings are
 * diffed against a cached last-written value — if the DOM control's live
 * state changes (e.g. a checkbox the user clicked) but the host's `on*`
 * callback does NOT feed a new value back into this `settings` input, the
 * binding cache already matches the DOM and Angular will NOT "snap" the
 * widget back on the next change detection. Every `on*` callback must
 * therefore round-trip through host state (even if the new value is
 * rejected/ignored) or the widget silently drifts from the source of truth.
 */
export interface SettingsState {
  numbering: NumberingSystem;
  onNumbering: (value: NumberingSystem) => void;
  language: Language;
  onLanguage: (value: Language) => void;
  isDark: boolean;
  onToggleDark: () => void;
  toothInfo: boolean;
  onToothInfo: (value: boolean) => void;
  // Per-format export availability + per-source import availability. When a
  // format/source is off, its export/import menu item is hidden; when PDF is
  // off, the Export Settings tab is also disabled (this file's reorg wires
  // that gate).
  exportPng: boolean;
  onExportPng: (value: boolean) => void;
  exportJpg: boolean;
  onExportJpg: (value: boolean) => void;
  exportSvg: boolean;
  onExportSvg: (value: boolean) => void;
  exportPdf: boolean;
  onExportPdf: (value: boolean) => void;
  importStatus: boolean;
  onImportStatus: (value: boolean) => void;
  importFhir: boolean;
  onImportFhir: (value: boolean) => void;
  secondaryCariesMode: SecondaryCariesMode;
  onSecondaryCariesMode: (value: SecondaryCariesMode) => void;
  icdas: boolean;
  onIcdas: (value: boolean) => void;
  cariesDepth: boolean;
  onCariesDepth: (value: boolean) => void;
  rootCariesMode: RootCariesMode;
  onRootCariesMode: (value: RootCariesMode) => void;
  radiographicDepthMode: RadiographicDepthMode;
  onRadiographicDepthMode: (value: RadiographicDepthMode) => void;
  // Adjustable tooth-selection colour + border style.
  selectionColor: string;
  onSelectionColor: (value: string) => void;
  selectionBorderStyle: SelectionBorderStyle;
  onSelectionBorderStyle: (value: SelectionBorderStyle) => void;
  pulpLevel: PulpDetailLevel;
  onPulpLevel: (value: PulpDetailLevel) => void;
  wearDetailLevel: ToothDetailLevel;
  onWearDetailLevel: (value: ToothDetailLevel) => void;
  discolorationDetailLevel: ToothDetailLevel;
  onDiscolorationDetailLevel: (value: ToothDetailLevel) => void;
  surfaceNotation: SurfaceNotation;
  onSurfaceNotation: (value: SurfaceNotation) => void;
  notes: boolean;
  onNotes: (value: boolean) => void;
  // Odontogram-tab on-screen controls.
  planModeAvailable: boolean;
  onPlanModeAvailable: (value: boolean) => void;
  screenToothSpacing: ScreenToothSpacing;
  onScreenToothSpacing: (value: ScreenToothSpacing) => void;
  screenToothNumberSize: ScreenToothNumberSize;
  onScreenToothNumberSize: (value: ScreenToothNumberSize) => void;
  // Tooth-anatomy profile — classic (default) vs. measured two-arch layout
  // (v2.4.0/1.2.0 resync, SettingsModal.tsx delta).
  toothAnatomy: ToothAnatomy;
  onToothAnatomy: (value: ToothAnatomy) => void;
  showStatusCard: boolean;
  onShowStatusCard: (value: boolean) => void;
  showOrthoCard: boolean;
  onShowOrthoCard: (value: boolean) => void;
  // Periodontal Chart availability. When off, the perio entry points are
  // hidden and the tab's other perio settings are disabled (this file's
  // reorg wires that gate).
  perioChartAvailable: boolean;
  onPerioChartAvailable: (value: boolean) => void;
  perioViewMode: PerioViewMode;
  onPerioViewMode: (value: PerioViewMode) => void;
  perioRowVisibility: Record<PerioRowId, boolean>;
  onPerioRowVisibility: (id: PerioRowId, visible: boolean) => void;
  perioIndexNameMode: PerioIndexNameMode;
  onPerioIndexNameMode: (value: PerioIndexNameMode) => void;
  // Fillings tab config — mirrors odontogram.ts module flags.
  fillingDefectEnabled: boolean;
  onFillingDefectEnabled: (value: boolean) => void;
  fillingComplexity: FillingComplexity;
  onFillingComplexity: (value: FillingComplexity) => void;
  fillingMaterials: Record<string, boolean>;
  onFillingMaterial: (material: string, value: boolean) => void;
  fissureSealingEnabled: boolean;
  onFissureSealingEnabled: (value: boolean) => void;
  // PDF export settings mirror.
  pdfSettings: PdfSettings;
  onPdfSettings: (patch: Partial<PdfSettings>) => void;
}

/** Ids of the 7 tabs, in the order the tab strip (and `SETTINGS_TABS`)
 *  renders them (TSX 456-973, v2.4.0 pin `f9b45fc`). */
export type SettingsTabId =
  | "general"
  | "odontogram"
  | "periodontalChart"
  | "toothDetails"
  | "caries"
  | "fillings"
  | "export";

/**
 * Declarative tab registry (TSX 456-973, `render` bodies dropped — Angular's
 * `@switch (currentTabId())` plays that role in the template instead).
 */
export const SETTINGS_TABS: ReadonlyArray<{ id: SettingsTabId; titleKey: string }> = [
  { id: "general", titleKey: "settings.tab.general" },
  { id: "odontogram", titleKey: "settings.tab.odontogram" },
  { id: "periodontalChart", titleKey: "settings.tab.periodontalChart" },
  { id: "toothDetails", titleKey: "settings.tab.toothDetails" },
  { id: "caries", titleKey: "settings.tab.caries" },
  { id: "fillings", titleKey: "settings.tab.fillings" },
  { id: "export", titleKey: "settings.tab.export" },
];

// Option lists for every select row (TSX 149-236, 414-454), transcribed verbatim.
const NUMBERING_OPTIONS: ReadonlyArray<{ value: NumberingSystem; labelKey: string }> = [
  { value: "FDI", labelKey: "numbering.fdi" },
  { value: "UNIVERSAL", labelKey: "numbering.universal" },
  { value: "PALMER", labelKey: "numbering.palmer" },
];

const LANGUAGE_OPTIONS: ReadonlyArray<{ value: Language; labelKey: string }> = [
  { value: "hu", labelKey: "language.hu" },
  { value: "en", labelKey: "language.en" },
  { value: "de", labelKey: "language.de" },
  { value: "es", labelKey: "language.es" },
  { value: "it", labelKey: "language.it" },
  { value: "sk", labelKey: "language.sk" },
  { value: "pl", labelKey: "language.pl" },
  { value: "ru", labelKey: "language.ru" },
  { value: "pt-br", labelKey: "language.pt-br" },
  { value: "zh", labelKey: "language.zh" },
  { value: "ar", labelKey: "language.ar" },
  { value: "fr", labelKey: "language.fr" },
];

const SECONDARY_OPTIONS: ReadonlyArray<{ value: SecondaryCariesMode; labelKey: string }> = [
  { value: "simple", labelKey: "settings.secondaryCaries.simple" },
  { value: "standard", labelKey: "settings.secondaryCaries.standard" },
  { value: "full", labelKey: "settings.secondaryCaries.full" },
];

const ROOT_OPTIONS: ReadonlyArray<{ value: RootCariesMode; labelKey: string }> = [
  { value: "simple", labelKey: "settings.rootCaries.simple" },
  { value: "severity", labelKey: "settings.rootCaries.severity" },
];

const RADIOGRAPHIC_OPTIONS: ReadonlyArray<{ value: RadiographicDepthMode; labelKey: string }> = [
  { value: "off", labelKey: "settings.radiographic.off" },
  { value: "threeLevel", labelKey: "settings.radiographic.threeLevel" },
  { value: "detailed", labelKey: "settings.radiographic.detailed" },
];

const PULP_OPTIONS: ReadonlyArray<{ value: PulpDetailLevel; labelKey: string }> = [
  { value: "simple", labelKey: "pulp.level.simple" },
  { value: "aae", labelKey: "pulp.level.aae" },
  { value: "latin", labelKey: "pulp.level.latin" },
];

const TOOTH_DETAIL_OPTIONS: ReadonlyArray<{ value: ToothDetailLevel; labelKey: string }> = [
  { value: "complex", labelKey: "settings.toothDetail.complex" },
  { value: "simple", labelKey: "settings.toothDetail.simple" },
];

const SURFACE_NOTATION_OPTIONS: ReadonlyArray<{ value: SurfaceNotation; labelKey: string }> = [
  { value: "full", labelKey: "settings.surfaceNotation.full" },
  { value: "simple", labelKey: "settings.surfaceNotation.simple" },
];

const PERIO_VIEW_MODE_OPTIONS: ReadonlyArray<{ value: PerioViewMode; labelKey: string }> = [
  { value: "toggle", labelKey: "settings.perioViewMode.toggle" },
  { value: "popup", labelKey: "settings.perioViewMode.popup" },
];

const SCREEN_SPACING_OPTIONS: ReadonlyArray<{ value: ScreenToothSpacing; labelKey: string }> = [
  { value: "wide", labelKey: "settings.screen.spacing.wide" },
  { value: "normal", labelKey: "settings.screen.spacing.normal" },
  { value: "close", labelKey: "settings.screen.spacing.close" },
];
const SCREEN_NUMBER_SIZE_OPTIONS: ReadonlyArray<{ value: ScreenToothNumberSize; labelKey: string }> = [
  { value: "small", labelKey: "settings.screen.numberSize.small" },
  { value: "normal", labelKey: "settings.screen.numberSize.normal" },
  { value: "xlarge", labelKey: "settings.screen.numberSize.xlarge" },
];
const TOOTH_ANATOMY_OPTIONS: ReadonlyArray<{ value: ToothAnatomy; labelKey: string }> = [
  { value: "classic", labelKey: "settings.toothAnatomy.classic" },
  { value: "measured", labelKey: "settings.toothAnatomy.measured" },
];
const SELECTION_BORDER_OPTIONS: ReadonlyArray<{ value: SelectionBorderStyle; labelKey: string }> = [
  { value: "solid", labelKey: "settings.selection.border.solid" },
  { value: "dashed", labelKey: "settings.selection.border.dashed" },
  { value: "dotted", labelKey: "settings.selection.border.dotted" },
];
const FILLING_COMPLEXITY_OPTIONS: ReadonlyArray<{ value: FillingComplexity; labelKey: string }> = [
  { value: "complex", labelKey: "settings.filling.complexity.complex" },
  { value: "simple", labelKey: "settings.filling.complexity.simple" },
];
// Filling-material availability labels reuse the existing filling.option.* keys.
const FILLING_MATERIAL_LABEL_KEYS: Record<string, string> = {
  amalgam: "filling.option.amalgam",
  composite: "filling.option.composite",
  gic: "filling.option.gic",
  temporary: "filling.option.temporary",
};

const PERIO_INDEX_NAME_MODE_OPTIONS: ReadonlyArray<{ value: PerioIndexNameMode; labelKey: string }> = [
  { value: "translated", labelKey: "settings.perioIndexNameMode.translated" },
  { value: "canonical", labelKey: "settings.perioIndexNameMode.canonical" },
];

/**
 * Declarative row-id groups for the Periodontal Chart settings tab (TSX
 * 243-249, transcribed verbatim: 5 groups covering the 16 `PerioRowId`s).
 * Each group is a sub-heading + the row ids it covers; a toggle row is
 * rendered per id, bound to `settings().perioRowVisibility[id]` /
 * `onPerioRowVisibility(id, v)`.
 */
const PERIO_ROW_GROUPS: ReadonlyArray<{ titleKey: string; ids: readonly PerioRowId[] }> = [
  { titleKey: "settings.perio.group.pocket", ids: ["pd", "gm", "cal", "bop"] },
  { titleKey: "settings.perio.group.hygiene", ids: ["plaque", "pi", "gi"] },
  { titleKey: "settings.perio.group.mucogingival", ids: ["cej", "rootConcavity", "kg", "gt"] },
  { titleKey: "settings.perio.group.support", ids: ["furcation", "mobility", "miller"] },
  { titleKey: "settings.perio.group.periimplant", ids: ["mpi", "mbi"] },
];

// PDF Settings tab option lists (TSX 414-454), transcribed verbatim.
const PDF_DATE_FORMAT_OPTIONS: ReadonlyArray<{ value: PdfDateFormat; labelKey: string }> = [
  { value: "iso", labelKey: "settings.pdf.dateFormat.iso" },
  { value: "dmy", labelKey: "settings.pdf.dateFormat.dmy" },
  { value: "mdy", labelKey: "settings.pdf.dateFormat.mdy" },
];
const PDF_COLOR_THEME_OPTIONS: ReadonlyArray<{ value: PdfColorTheme; labelKey: string }> = [
  { value: "blue", labelKey: "settings.pdf.theme.blue" },
  { value: "teal", labelKey: "settings.pdf.theme.teal" },
  { value: "amber", labelKey: "settings.pdf.theme.amber" },
  { value: "slate", labelKey: "settings.pdf.theme.slate" },
];
const PDF_TOOTH_SPACING_OPTIONS: ReadonlyArray<{ value: PdfToothSpacing; labelKey: string }> = [
  { value: "wide", labelKey: "settings.pdf.spacing.wide" },
  { value: "medium", labelKey: "settings.pdf.spacing.medium" },
  { value: "close", labelKey: "settings.pdf.spacing.close" },
];
const PDF_BORDER_THICKNESS_OPTIONS: ReadonlyArray<{ value: PdfBorderThickness; labelKey: string }> = [
  { value: "thin", labelKey: "settings.pdf.thickness.thin" },
  { value: "medium", labelKey: "settings.pdf.thickness.medium" },
  { value: "thick", labelKey: "settings.pdf.thickness.thick" },
];
const PDF_TOOTH_NUMBER_SIZE_OPTIONS: ReadonlyArray<{ value: PdfToothNumberSize; labelKey: string }> = [
  { value: "small", labelKey: "settings.pdf.numberSize.small" },
  { value: "normal", labelKey: "settings.pdf.numberSize.normal" },
  { value: "xlarge", labelKey: "settings.pdf.numberSize.xlarge" },
];
const PDF_SUMMARY_GROUPING_OPTIONS: ReadonlyArray<{ value: PdfSummaryGrouping; labelKey: string }> = [
  { value: "whole", labelKey: "settings.pdf.summaryGrouping.whole" },
  { value: "jaw", labelKey: "settings.pdf.summaryGrouping.jaw" },
  { value: "quadrant", labelKey: "settings.pdf.summaryGrouping.quadrant" },
  { value: "sextant", labelKey: "settings.pdf.summaryGrouping.sextant" },
];
const PDF_PERIO_PLACEMENT_OPTIONS: ReadonlyArray<{ value: PdfPerioLabelPlacement; labelKey: string }> = [
  { value: "center", labelKey: "settings.pdf.perioPlacement.center" },
  { value: "edge", labelKey: "settings.pdf.perioPlacement.edge" },
];
const PDF_PERIO_FONT_OPTIONS: ReadonlyArray<{ value: PdfPerioFontSize; labelKey: string }> = [
  { value: "small", labelKey: "settings.pdf.perioFont.small" },
  { value: "normal", labelKey: "settings.pdf.perioFont.normal" },
  { value: "xlarge", labelKey: "settings.pdf.perioFont.xlarge" },
];

/** Keyboard keys the tablist's APG nav handler reacts to (TSX 1053). */
const TABLIST_NAV_KEYS = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"];

@Component({
  selector: "aao-settings-modal",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="odon-settings-backdrop" (mousedown)="onBackdropMouseDown($event)">
        <div
          #dialog
          class="odon-settings-modal"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          tabindex="-1"
          (keydown)="onKeyDown($event)"
        >
          <div class="odon-settings-header">
            <h2 class="odon-settings-title" [id]="titleId">{{ i18n.t("settings.title") }}</h2>
            <button
              type="button"
              class="odon-settings-close"
              (click)="close.emit()"
              [attr.aria-label]="i18n.t('settings.close')"
              [title]="i18n.t('settings.close')"
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
          <div class="odon-settings-body">
            <div
              #tablist
              class="odon-settings-tabs"
              role="tablist"
              [attr.aria-label]="i18n.t('settings.title')"
              (keydown)="onTabListKeyDown($event)"
            >
              @for (tab of tabs; track tab.id) {
                <button
                  type="button"
                  role="tab"
                  [id]="'odon-settings-tab-' + tab.id"
                  [attr.aria-selected]="tab.id === activeTab()"
                  [attr.aria-controls]="'odon-settings-panel-' + tab.id"
                  [attr.aria-disabled]="isTabDisabled(tab.id) ? true : null"
                  [attr.tabindex]="tab.id === activeTab() ? 0 : -1"
                  class="odon-settings-tab"
                  [class.is-active]="tab.id === activeTab()"
                  [class.is-disabled]="isTabDisabled(tab.id)"
                  (click)="onTabClick(tab.id)"
                >
                  {{ i18n.t(tab.titleKey) }}
                </button>
              }
            </div>
            <div
              class="odon-settings-panel"
              role="tabpanel"
              [id]="'odon-settings-panel-' + currentTabId()"
              [attr.aria-labelledby]="'odon-settings-tab-' + currentTabId()"
            >
              @switch (currentTabId()) {
                @case ("general") {
                  <!-- TSX 456-531 -->
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("numbering.label") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-numbering">
                        {{ i18n.t("settings.numbering.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-numbering">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('numbering.label')"
                        (change)="onNumberingChange($event)"
                      >
                        @for (opt of numberingOptions; track opt.value) {
                          <option [attr.value]="opt.value" [selected]="opt.value === settings().numbering">
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("language.label") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-language">
                        {{ i18n.t("settings.language.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-language">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('language.label')"
                        (change)="onLanguageChange($event)"
                      >
                        @for (opt of languageOptions; track opt.value) {
                          <option [attr.value]="opt.value" [selected]="opt.value === settings().language">
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.theme.label") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-theme">
                        {{ i18n.t("settings.theme.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-theme">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.theme.label')"
                          [checked]="settings().isDark"
                          (change)="onToggleDarkChange()"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-group-title">{{ i18n.t("settings.export.section") }}</div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.export.png") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-exportPng">
                        {{ i18n.t("settings.export.png.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-exportPng">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.export.png')"
                          [checked]="settings().exportPng"
                          (change)="settings().onExportPng($any($event.target).checked)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.export.jpg") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-exportJpg">
                        {{ i18n.t("settings.export.jpg.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-exportJpg">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.export.jpg')"
                          [checked]="settings().exportJpg"
                          (change)="settings().onExportJpg($any($event.target).checked)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.export.svg") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-exportSvg">
                        {{ i18n.t("settings.export.svg.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-exportSvg">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.export.svg')"
                          [checked]="settings().exportSvg"
                          (change)="settings().onExportSvg($any($event.target).checked)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.export.pdf") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-exportPdf">
                        {{ i18n.t("settings.export.pdf.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-exportPdf">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.export.pdf')"
                          [checked]="settings().exportPdf"
                          (change)="settings().onExportPdf($any($event.target).checked)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-group-title">{{ i18n.t("settings.import.section") }}</div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.import.status") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-importStatus">
                        {{ i18n.t("settings.import.status.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-importStatus">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.import.status')"
                          [checked]="settings().importStatus"
                          (change)="settings().onImportStatus($any($event.target).checked)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.import.fhir") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-importFhir">
                        {{ i18n.t("settings.import.fhir.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-importFhir">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.import.fhir')"
                          [checked]="settings().importFhir"
                          (change)="settings().onImportFhir($any($event.target).checked)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                }
                @case ("odontogram") {
                  <!-- TSX 532-583 -->
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.planMode") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-planMode">
                        {{ i18n.t("settings.planMode.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-planMode">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.planMode')"
                          [checked]="settings().planModeAvailable"
                          (change)="settings().onPlanModeAvailable($any($event.target).checked)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.screen.spacing") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-screenSpacing">
                        {{ i18n.t("settings.screen.spacing.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-screenSpacing">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.screen.spacing')"
                        (change)="settings().onScreenToothSpacing($any($event.target).value)"
                      >
                        @for (opt of screenSpacingOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().screenToothSpacing"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.screen.numberSize") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-screenNumberSize">
                        {{ i18n.t("settings.screen.numberSize.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-screenNumberSize">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.screen.numberSize')"
                        (change)="settings().onScreenToothNumberSize($any($event.target).value)"
                      >
                        @for (opt of screenNumberSizeOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().screenToothNumberSize"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.toothAnatomy") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-toothAnatomy">
                        {{ i18n.t("settings.toothAnatomy.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-toothAnatomy">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.toothAnatomy')"
                        (change)="settings().onToothAnatomy($any($event.target).value)"
                      >
                        @for (opt of toothAnatomyOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().toothAnatomy"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.toothInfo") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-toothInfo">
                        {{ i18n.t("settings.toothInfo.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-toothInfo">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.toothInfo')"
                          [checked]="settings().toothInfo"
                          (change)="onToothInfoChange($event)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.panels.statuses") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-panelsStatuses">
                        {{ i18n.t("settings.panels.statuses.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-panelsStatuses">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.panels.statuses')"
                          [checked]="settings().showStatusCard"
                          (change)="onShowStatusCardChange($event)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.panels.orthodontics") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-panelsOrthodontics">
                        {{ i18n.t("settings.panels.orthodontics.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-panelsOrthodontics">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.panels.orthodontics')"
                          [checked]="settings().showOrthoCard"
                          (change)="onShowOrthoCardChange($event)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                }
                @case ("periodontalChart") {
                  <!-- TSX 584-633 -->
                  <div class="odon-settings-group-title">{{ i18n.t("settings.perio.group.general") }}</div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.perioChart.available") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-perioChartAvailable">
                        {{ i18n.t("settings.perioChart.available.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-perioChartAvailable">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.perioChart.available')"
                          [checked]="settings().perioChartAvailable"
                          (change)="settings().onPerioChartAvailable($any($event.target).checked)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.perioViewMode") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-perioViewMode">
                        {{ i18n.t("settings.perioViewMode.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-perioViewMode">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.perioViewMode')"
                        [disabled]="!settings().perioChartAvailable"
                        (change)="onPerioViewModeChange($event)"
                      >
                        @for (opt of perioViewModeOptions; track opt.value) {
                          <option [attr.value]="opt.value" [selected]="opt.value === settings().perioViewMode">
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  @for (group of perioRowGroups; track group.titleKey) {
                    <div>
                      <div class="odon-settings-group-title">{{ i18n.t(group.titleKey) }}</div>
                      @for (id of group.ids; track id) {
                        <div class="odon-settings-row">
                          <div class="odon-settings-row-text">
                            <div class="odon-settings-row-label">
                              {{ i18n.t("settings.perio.row." + id) }}
                            </div>
                            <div class="odon-settings-row-desc" [id]="'settingsDesc-perioRow-' + id">
                              {{ i18n.t("settings.perio.row." + id + ".desc") }}
                            </div>
                          </div>
                          <div
                            class="odon-settings-row-control"
                            [attr.data-desc]="'settingsDesc-perioRow-' + id"
                          >
                            <label class="odon-settings-switch">
                              <input
                                type="checkbox"
                                [attr.aria-label]="i18n.t('settings.perio.row.' + id)"
                                [checked]="settings().perioRowVisibility[id]"
                                [disabled]="!settings().perioChartAvailable"
                                (change)="onPerioRowChange(id, $event)"
                              />
                              <span class="odon-settings-switch-track" aria-hidden="true"></span>
                            </label>
                          </div>
                        </div>
                      }
                    </div>
                  }
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">
                        {{ i18n.t("settings.perioIndexNameMode") }}
                      </div>
                      <div class="odon-settings-row-desc" id="settingsDesc-perioIndexNameMode">
                        {{ i18n.t("settings.perioIndexNameMode.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-perioIndexNameMode">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.perioIndexNameMode')"
                        [disabled]="!settings().perioChartAvailable"
                        (change)="onPerioIndexNameModeChange($event)"
                      >
                        @for (opt of perioIndexNameModeOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().perioIndexNameMode"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                }
                @case ("toothDetails") {
                  <!-- TSX 634-696 -->
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.selection.color") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-selectionColor">
                        {{ i18n.t("settings.selection.color.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-selectionColor">
                      <input
                        class="odon-settings-input"
                        type="color"
                        [attr.aria-label]="i18n.t('settings.selection.color')"
                        [value]="settings().selectionColor"
                        (change)="settings().onSelectionColor($any($event.target).value)"
                      />
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.selection.border") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-selectionBorder">
                        {{ i18n.t("settings.selection.border.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-selectionBorder">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.selection.border')"
                        (change)="settings().onSelectionBorderStyle($any($event.target).value)"
                      >
                        @for (opt of selectionBorderOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().selectionBorderStyle"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("pulp.level.label") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pulpLevel">
                        {{ i18n.t("settings.pulpLevel.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pulpLevel">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('pulp.level.label')"
                        (change)="onPulpLevelChange($event)"
                      >
                        @for (opt of pulpOptions; track opt.value) {
                          <option [attr.value]="opt.value" [selected]="opt.value === settings().pulpLevel">
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.wearDetail.label") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-wearDetail">
                        {{ i18n.t("settings.wearDetail.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-wearDetail">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.wearDetail.label')"
                        (change)="onWearDetailChange($event)"
                      >
                        @for (opt of toothDetailOptions; track opt.value) {
                          <option [attr.value]="opt.value" [selected]="opt.value === settings().wearDetailLevel">
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">
                        {{ i18n.t("settings.discolorationDetail.label") }}
                      </div>
                      <div class="odon-settings-row-desc" id="settingsDesc-discolorationDetail">
                        {{ i18n.t("settings.discolorationDetail.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-discolorationDetail">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.discolorationDetail.label')"
                        (change)="onDiscolorationDetailChange($event)"
                      >
                        @for (opt of toothDetailOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().discolorationDetailLevel"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">
                        {{ i18n.t("settings.surfaceNotation.label") }}
                      </div>
                      <div class="odon-settings-row-desc" id="settingsDesc-surfaceNotation">
                        {{ i18n.t("settings.surfaceNotation.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-surfaceNotation">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.surfaceNotation.label')"
                        (change)="onSurfaceNotationChange($event)"
                      >
                        @for (opt of surfaceNotationOptions; track opt.value) {
                          <option [attr.value]="opt.value" [selected]="opt.value === settings().surfaceNotation">
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.notes") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-notes">
                        {{ i18n.t("settings.notes.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-notes">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.notes')"
                          [checked]="settings().notes"
                          (change)="onNotesChange($event)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                }
                @case ("caries") {
                  <!-- TSX 697-742 -->
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("icdas.enable") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-icdas">
                        {{ i18n.t("settings.icdas.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-icdas">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('icdas.enable')"
                          [checked]="settings().icdas"
                          (change)="onIcdasChange($event)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.cariesDepth.label") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-cariesDepth">
                        {{ i18n.t("settings.cariesDepth.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-cariesDepth">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.cariesDepth.label')"
                          [checked]="settings().cariesDepth"
                          (change)="onCariesDepthChange($event)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("caries.rootLabel") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-rootCaries">
                        {{ i18n.t("settings.rootCaries.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-rootCaries">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('caries.rootLabel')"
                        (change)="onRootCariesChange($event)"
                      >
                        @for (opt of rootOptions; track opt.value) {
                          <option [attr.value]="opt.value" [selected]="opt.value === settings().rootCariesMode">
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("caries.secondaryLabel") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-secondaryCaries">
                        {{ i18n.t("settings.secondaryCaries.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-secondaryCaries">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('caries.secondaryLabel')"
                        (change)="onSecondaryCariesChange($event)"
                      >
                        @for (opt of secondaryOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().secondaryCariesMode"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("caries.radiographicLabel") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-radiographic">
                        {{ i18n.t("settings.radiographic.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-radiographic">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('caries.radiographicLabel')"
                        (change)="onRadiographicChange($event)"
                      >
                        @for (opt of radiographicOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().radiographicDepthMode"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                }
                @case ("fillings") {
                  <!-- TSX 743-783 -->
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.filling.defect") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-fillingDefect">
                        {{ i18n.t("settings.filling.defect.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-fillingDefect">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.filling.defect')"
                          [checked]="settings().fillingDefectEnabled"
                          (change)="settings().onFillingDefectEnabled($any($event.target).checked)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.filling.complexity") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-fillingComplexity">
                        {{ i18n.t("settings.filling.complexity.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-fillingComplexity">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.filling.complexity')"
                        (change)="settings().onFillingComplexity($any($event.target).value)"
                      >
                        @for (opt of fillingComplexityOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().fillingComplexity"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-group-title">{{ i18n.t("settings.filling.materials") }}</div>
                  @for (m of fillingMaterialKeys; track m) {
                    <div class="odon-settings-row">
                      <div class="odon-settings-row-text">
                        <div class="odon-settings-row-label">{{ i18n.t(fillingMaterialLabelKeys[m]) }}</div>
                        <div class="odon-settings-row-desc" [id]="'settingsDesc-fillingMaterial-' + m">
                          {{ i18n.t("settings.filling.material.desc") }}
                        </div>
                      </div>
                      <div
                        class="odon-settings-row-control"
                        [attr.data-desc]="'settingsDesc-fillingMaterial-' + m"
                      >
                        <label class="odon-settings-switch">
                          <input
                            type="checkbox"
                            [attr.aria-label]="i18n.t(fillingMaterialLabelKeys[m])"
                            [checked]="settings().fillingMaterials[m] ?? true"
                            (change)="onFillingMaterialChange(m, $event)"
                          />
                          <span class="odon-settings-switch-track" aria-hidden="true"></span>
                        </label>
                      </div>
                    </div>
                  }
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.filling.fissure") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-fillingFissure">
                        {{ i18n.t("settings.filling.fissure.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-fillingFissure">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.filling.fissure')"
                          [checked]="settings().fissureSealingEnabled"
                          (change)="settings().onFissureSealingEnabled($any($event.target).checked)"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                }
                @case ("export") {
                  <!-- TSX 784-971: the full PDF Settings form. -->
                  <div class="odon-settings-note">{{ i18n.t("settings.export.appliesNote") }}</div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.defaultName") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfDefaultName">
                        {{ i18n.t("settings.pdf.defaultName.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfDefaultName">
                      <input
                        class="odon-settings-input"
                        type="text"
                        [attr.aria-label]="i18n.t('settings.pdf.defaultName')"
                        [value]="settings().pdfSettings.defaultName"
                        (change)="settings().onPdfSettings({ defaultName: $any($event.target).value })"
                      />
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.defaultDob") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfDefaultDob">
                        {{ i18n.t("settings.pdf.defaultDob.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfDefaultDob">
                      <input
                        class="odon-settings-input"
                        type="date"
                        [attr.aria-label]="i18n.t('settings.pdf.defaultDob')"
                        [value]="settings().pdfSettings.defaultDob"
                        (change)="settings().onPdfSettings({ defaultDob: $any($event.target).value })"
                      />
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.showAge") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfShowAge">
                        {{ i18n.t("settings.pdf.showAge.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfShowAge">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.pdf.showAge')"
                          [checked]="settings().pdfSettings.showAge"
                          (change)="settings().onPdfSettings({ showAge: $any($event.target).checked })"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.dateFormat") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfDateFormat">
                        {{ i18n.t("settings.pdf.dateFormat.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfDateFormat">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.pdf.dateFormat')"
                        (change)="settings().onPdfSettings({ dateFormat: $any($event.target).value })"
                      >
                        @for (opt of pdfDateFormatOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().pdfSettings.dateFormat"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.theme") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfTheme">
                        {{ i18n.t("settings.pdf.theme.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfTheme">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.pdf.theme')"
                        (change)="settings().onPdfSettings({ colorTheme: $any($event.target).value })"
                      >
                        @for (opt of pdfColorThemeOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().pdfSettings.colorTheme"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>

                  <div class="odon-settings-group-title">{{ i18n.t("settings.pdf.section.odontogram") }}</div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.showBone") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfShowBone">
                        {{ i18n.t("settings.pdf.showBone.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfShowBone">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.pdf.showBone')"
                          [checked]="settings().pdfSettings.showBone"
                          (change)="settings().onPdfSettings({ showBone: $any($event.target).checked })"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.showHealthyPulp") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfShowHealthyPulp">
                        {{ i18n.t("settings.pdf.showHealthyPulp.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfShowHealthyPulp">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.pdf.showHealthyPulp')"
                          [checked]="settings().pdfSettings.showHealthyPulp"
                          (change)="settings().onPdfSettings({ showHealthyPulp: $any($event.target).checked })"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.spacing") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfSpacing">
                        {{ i18n.t("settings.pdf.spacing.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfSpacing">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.pdf.spacing')"
                        (change)="settings().onPdfSettings({ toothSpacing: $any($event.target).value })"
                      >
                        @for (opt of pdfToothSpacingOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().pdfSettings.toothSpacing"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.border") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfBorder">
                        {{ i18n.t("settings.pdf.border.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfBorder">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.pdf.border')"
                          [checked]="settings().pdfSettings.border"
                          (change)="settings().onPdfSettings({ border: $any($event.target).checked })"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.borderThickness") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfBorderThickness">
                        {{ i18n.t("settings.pdf.borderThickness.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfBorderThickness">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.pdf.borderThickness')"
                        [disabled]="!settings().pdfSettings.border"
                        (change)="settings().onPdfSettings({ borderThickness: $any($event.target).value })"
                      >
                        @for (opt of pdfBorderThicknessOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().pdfSettings.borderThickness"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.numberSize") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfNumberSize">
                        {{ i18n.t("settings.pdf.numberSize.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfNumberSize">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.pdf.numberSize')"
                        (change)="settings().onPdfSettings({ toothNumberSize: $any($event.target).value })"
                      >
                        @for (opt of pdfToothNumberSizeOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().pdfSettings.toothNumberSize"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.includeText") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfIncludeText">
                        {{ i18n.t("settings.pdf.includeText.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfIncludeText">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.pdf.includeText')"
                          [checked]="settings().pdfSettings.includeOdontogramText"
                          (change)="settings().onPdfSettings({ includeOdontogramText: $any($event.target).checked })"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.includeTable") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfIncludeTable">
                        {{ i18n.t("settings.pdf.includeTable.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfIncludeTable">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.pdf.includeTable')"
                          [checked]="settings().pdfSettings.includeOdontogramTable"
                          (change)="settings().onPdfSettings({ includeOdontogramTable: $any($event.target).checked })"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.summaryGrouping") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfSummaryGrouping">
                        {{ i18n.t("settings.pdf.summaryGrouping.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfSummaryGrouping">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.pdf.summaryGrouping')"
                        (change)="settings().onPdfSettings({ summaryGrouping: $any($event.target).value })"
                      >
                        @for (opt of pdfSummaryGroupingOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().pdfSettings.summaryGrouping"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>

                  <div class="odon-settings-group-title">{{ i18n.t("settings.pdf.section.perio") }}</div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.perioSpacing") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfPerioSpacing">
                        {{ i18n.t("settings.pdf.perioSpacing.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfPerioSpacing">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.pdf.perioSpacing')"
                        (change)="settings().onPdfSettings({ perioToothSpacing: $any($event.target).value })"
                      >
                        @for (opt of pdfToothSpacingOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().pdfSettings.perioToothSpacing"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.perioEmptyRows") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfPerioEmptyRows">
                        {{ i18n.t("settings.pdf.perioEmptyRows.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfPerioEmptyRows">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.pdf.perioEmptyRows')"
                          [checked]="settings().pdfSettings.perioShowEmptyRows"
                          (change)="settings().onPdfSettings({ perioShowEmptyRows: $any($event.target).checked })"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.perioPlacement") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfPerioPlacement">
                        {{ i18n.t("settings.pdf.perioPlacement.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfPerioPlacement">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.pdf.perioPlacement')"
                        (change)="settings().onPdfSettings({ perioLabelPlacement: $any($event.target).value })"
                      >
                        @for (opt of pdfPerioPlacementOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().pdfSettings.perioLabelPlacement"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.perioFont") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfPerioFont">
                        {{ i18n.t("settings.pdf.perioFont.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfPerioFont">
                      <select
                        class="odon-settings-select"
                        [attr.aria-label]="i18n.t('settings.pdf.perioFont')"
                        (change)="settings().onPdfSettings({ perioFontSize: $any($event.target).value })"
                      >
                        @for (opt of pdfPerioFontOptions; track opt.value) {
                          <option
                            [attr.value]="opt.value"
                            [selected]="opt.value === settings().pdfSettings.perioFontSize"
                          >
                            {{ i18n.t(opt.labelKey) }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.includePerioTable") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfIncludePerioTable">
                        {{ i18n.t("settings.pdf.includePerioTable.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfIncludePerioTable">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.pdf.includePerioTable')"
                          [checked]="settings().pdfSettings.includePerioTable"
                          (change)="settings().onPdfSettings({ includePerioTable: $any($event.target).checked })"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.includePerioAbbrev") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfIncludePerioAbbrev">
                        {{ i18n.t("settings.pdf.includePerioAbbrev.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfIncludePerioAbbrev">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.pdf.includePerioAbbrev')"
                          [checked]="settings().pdfSettings.includePerioAbbrev"
                          (change)="settings().onPdfSettings({ includePerioAbbrev: $any($event.target).checked })"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>

                  <div class="odon-settings-group-title">{{ i18n.t("settings.pdf.section.footer") }}</div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.showDisclaimer") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfShowDisclaimer">
                        {{ i18n.t("settings.pdf.showDisclaimer.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfShowDisclaimer">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.pdf.showDisclaimer')"
                          [checked]="settings().pdfSettings.showDisclaimer"
                          (change)="settings().onPdfSettings({ showDisclaimer: $any($event.target).checked })"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.disclaimerText") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfDisclaimerText">
                        {{ i18n.t("settings.pdf.disclaimerText.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfDisclaimerText">
                      <textarea
                        class="odon-settings-textarea"
                        [attr.aria-label]="i18n.t('settings.pdf.disclaimerText')"
                        rows="3"
                        [value]="settings().pdfSettings.disclaimerText"
                        [attr.placeholder]="i18n.t('pdf.disclaimer')"
                        [disabled]="!settings().pdfSettings.showDisclaimer"
                        (change)="settings().onPdfSettings({ disclaimerText: $any($event.target).value })"
                      ></textarea>
                    </div>
                  </div>
                  <div class="odon-settings-row">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">{{ i18n.t("settings.pdf.showGenerator") }}</div>
                      <div class="odon-settings-row-desc" id="settingsDesc-pdfShowGenerator">
                        {{ i18n.t("settings.pdf.showGenerator.desc") }}
                      </div>
                    </div>
                    <div class="odon-settings-row-control" data-desc="settingsDesc-pdfShowGenerator">
                      <label class="odon-settings-switch">
                        <input
                          type="checkbox"
                          [attr.aria-label]="i18n.t('settings.pdf.showGenerator')"
                          [checked]="settings().pdfSettings.showGenerator"
                          (change)="settings().onPdfSettings({ showGenerator: $any($event.target).checked })"
                        />
                        <span class="odon-settings-switch-track" aria-hidden="true"></span>
                      </label>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class SettingsModalComponent {
  readonly open = input.required<boolean>();
  readonly settings = input.required<SettingsState>();
  readonly close = output<void>();

  protected readonly i18n = inject(I18nService);
  protected readonly titleId = nextDialogTitleId("settingsTitle");
  protected readonly activeTab = signal<SettingsTabId>(SETTINGS_TABS[0].id);

  protected readonly tabs = SETTINGS_TABS;
  protected readonly numberingOptions = NUMBERING_OPTIONS;
  protected readonly languageOptions = LANGUAGE_OPTIONS;
  protected readonly secondaryOptions = SECONDARY_OPTIONS;
  protected readonly rootOptions = ROOT_OPTIONS;
  protected readonly radiographicOptions = RADIOGRAPHIC_OPTIONS;
  protected readonly pulpOptions = PULP_OPTIONS;
  protected readonly toothDetailOptions = TOOTH_DETAIL_OPTIONS;
  protected readonly surfaceNotationOptions = SURFACE_NOTATION_OPTIONS;
  protected readonly perioViewModeOptions = PERIO_VIEW_MODE_OPTIONS;
  protected readonly perioIndexNameModeOptions = PERIO_INDEX_NAME_MODE_OPTIONS;
  protected readonly perioRowGroups = PERIO_ROW_GROUPS;
  protected readonly screenSpacingOptions = SCREEN_SPACING_OPTIONS;
  protected readonly screenNumberSizeOptions = SCREEN_NUMBER_SIZE_OPTIONS;
  protected readonly toothAnatomyOptions = TOOTH_ANATOMY_OPTIONS;
  protected readonly selectionBorderOptions = SELECTION_BORDER_OPTIONS;
  protected readonly fillingComplexityOptions = FILLING_COMPLEXITY_OPTIONS;
  protected readonly fillingMaterialKeys = FILLING_MATERIAL_KEYS;
  protected readonly fillingMaterialLabelKeys = FILLING_MATERIAL_LABEL_KEYS;
  protected readonly pdfDateFormatOptions = PDF_DATE_FORMAT_OPTIONS;
  protected readonly pdfColorThemeOptions = PDF_COLOR_THEME_OPTIONS;
  protected readonly pdfToothSpacingOptions = PDF_TOOTH_SPACING_OPTIONS;
  protected readonly pdfBorderThicknessOptions = PDF_BORDER_THICKNESS_OPTIONS;
  protected readonly pdfToothNumberSizeOptions = PDF_TOOTH_NUMBER_SIZE_OPTIONS;
  protected readonly pdfSummaryGroupingOptions = PDF_SUMMARY_GROUPING_OPTIONS;
  protected readonly pdfPerioPlacementOptions = PDF_PERIO_PLACEMENT_OPTIONS;
  protected readonly pdfPerioFontOptions = PDF_PERIO_FONT_OPTIONS;

  private readonly dialogRef = viewChild<ElementRef<HTMLElement>>("dialog");
  private readonly tablistRef = viewChild<ElementRef<HTMLElement>>("tablist");
  private openerEl: HTMLElement | null = null;

  // TSX 1077-1082: never show the Export Settings panel when PDF export is
  // off (the tab is disabled) — fall back to the first tab. The tab strip's
  // own `aria-selected`/roving-tabindex bindings still read the raw
  // `activeTab()` (TSX 1144/1147 do the same), so this only affects which
  // panel content renders.
  protected readonly currentTabId = computed<SettingsTabId>(() => {
    const active = this.activeTab();
    if (active === "export" && this.settings().exportPdf === false) {
      return this.tabs[0].id;
    }
    return active;
  });

  constructor() {
    // Mirrors SettingsModal.tsx's focus effect (1005-1014): capture the
    // opener + move focus into the dialog when it opens; cleanup (on
    // close/destroy) restores focus to the opener.
    effect((onCleanup) => {
      const isOpen = this.open();
      const dialog = this.dialogRef()?.nativeElement;
      if (!isOpen || !dialog) return;

      this.openerEl = (document.activeElement as HTMLElement | null) ?? null;
      focusFirst(dialog);

      onCleanup(() => {
        this.openerEl?.focus?.();
      });
    });
  }

  /** TSX 1080/1137: the Export Settings tab is disabled whenever PDF export
   *  is off — its settings would have no effect. */
  protected isTabDisabled(id: SettingsTabId): boolean {
    return id === "export" && this.settings().exportPdf === false;
  }

  /** TSX 1152: a disabled tab ignores clicks. */
  protected onTabClick(id: SettingsTabId): void {
    if (!this.isTabDisabled(id)) this.activeTab.set(id);
  }

  protected onBackdropMouseDown(e: MouseEvent): void {
    // TSX 1086-1089: only a mousedown that targets the backdrop itself closes.
    if (e.target === e.currentTarget) this.close.emit();
  }

  protected onKeyDown(e: KeyboardEvent): void {
    // TSX 1016-1042: Escape closes; Tab is manually trapped within the dialog.
    if (e.key === "Escape") {
      e.stopPropagation();
      this.close.emit();
      return;
    }
    if (e.key !== "Tab") return;
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) return;
    trapTabKey(dialog, e);
  }

  /**
   * APG tabs keyboard support (TSX 1051-1073): Arrow Left/Right/Up/Down move
   * between tabs with wraparound; Home/End jump to first/last. Moving focus
   * also activates (roving-tabindex + activation-follows-focus model). This
   * never checks `isTabDisabled` — same as the pin's own handler — so
   * keyboard nav can still land the (visually disabled) export tab.
   */
  protected onTabListKeyDown(e: KeyboardEvent): void {
    if (!TABLIST_NAV_KEYS.includes(e.key)) return;
    e.preventDefault();
    const tabs = this.tabs;
    const count = tabs.length;
    if (count === 0) return;
    const cur = tabs.findIndex((tab) => tab.id === this.activeTab());
    const idx = cur < 0 ? 0 : cur;
    let next = idx;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    else if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % count;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + count) % count;
    const nextTab = tabs[next];
    if (!nextTab) return;
    if (nextTab.id !== this.activeTab()) this.activeTab.set(nextTab.id);
    this.tablistRef()
      ?.nativeElement.querySelector<HTMLElement>(`#odon-settings-tab-${nextTab.id}`)
      ?.focus();
  }

  protected onNumberingChange(e: Event): void {
    this.settings().onNumbering((e.target as HTMLSelectElement).value as NumberingSystem);
  }

  protected onLanguageChange(e: Event): void {
    this.settings().onLanguage((e.target as HTMLSelectElement).value as Language);
  }

  protected onToggleDarkChange(): void {
    this.settings().onToggleDark();
  }

  protected onToothInfoChange(e: Event): void {
    this.settings().onToothInfo((e.target as HTMLInputElement).checked);
  }

  protected onShowStatusCardChange(e: Event): void {
    this.settings().onShowStatusCard((e.target as HTMLInputElement).checked);
  }

  protected onShowOrthoCardChange(e: Event): void {
    this.settings().onShowOrthoCard((e.target as HTMLInputElement).checked);
  }

  protected onPerioViewModeChange(e: Event): void {
    this.settings().onPerioViewMode((e.target as HTMLSelectElement).value as PerioViewMode);
  }

  protected onWearDetailChange(e: Event): void {
    this.settings().onWearDetailLevel((e.target as HTMLSelectElement).value as ToothDetailLevel);
  }

  protected onDiscolorationDetailChange(e: Event): void {
    this.settings().onDiscolorationDetailLevel(
      (e.target as HTMLSelectElement).value as ToothDetailLevel,
    );
  }

  protected onSurfaceNotationChange(e: Event): void {
    this.settings().onSurfaceNotation((e.target as HTMLSelectElement).value as SurfaceNotation);
  }

  protected onIcdasChange(e: Event): void {
    this.settings().onIcdas((e.target as HTMLInputElement).checked);
  }

  protected onCariesDepthChange(e: Event): void {
    this.settings().onCariesDepth((e.target as HTMLInputElement).checked);
  }

  protected onRootCariesChange(e: Event): void {
    this.settings().onRootCariesMode((e.target as HTMLSelectElement).value as RootCariesMode);
  }

  protected onSecondaryCariesChange(e: Event): void {
    this.settings().onSecondaryCariesMode(
      (e.target as HTMLSelectElement).value as SecondaryCariesMode,
    );
  }

  protected onRadiographicChange(e: Event): void {
    this.settings().onRadiographicDepthMode(
      (e.target as HTMLSelectElement).value as RadiographicDepthMode,
    );
  }

  protected onPulpLevelChange(e: Event): void {
    this.settings().onPulpLevel((e.target as HTMLSelectElement).value as PulpDetailLevel);
  }

  protected onNotesChange(e: Event): void {
    this.settings().onNotes((e.target as HTMLInputElement).checked);
  }

  protected onPerioRowChange(id: PerioRowId, e: Event): void {
    this.settings().onPerioRowVisibility(id, (e.target as HTMLInputElement).checked);
  }

  protected onPerioIndexNameModeChange(e: Event): void {
    this.settings().onPerioIndexNameMode(
      (e.target as HTMLSelectElement).value as PerioIndexNameMode,
    );
  }

  protected onFillingMaterialChange(material: string, e: Event): void {
    this.settings().onFillingMaterial(material, (e.target as HTMLInputElement).checked);
  }
}
