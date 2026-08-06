// Angular port of $ENGINE/src/SettingsModal.tsx (652 lines).
//
// Phase 3 Task 2: the app's Settings dialog — 7 declaratively-registered tabs
// (general/panels/toothDetails/caries/pulpa/notes/periodontal) driving every
// live setting the app exposes. The dialog owns no setting state itself: it
// is a pure view over `SettingsState`, mirroring the React component's
// `settings` prop (TSX 29-68) — every value + its `on*` callback is supplied
// by the host, the modal never mutates anything directly.
//
// Shares the `.odon-settings-*` / `.odon-confirm-*`-sibling dialog contract
// with DualStateConfirmComponent: `role="dialog"` + `aria-modal`, Esc closes,
// backdrop-mousedown-on-self closes, focus trapped while open + restored to
// the opener on close (Task 1's `dialog-focus.ts` helpers, TSX 468-535).
//
// Additionally implements the APG tabs pattern for the `role="tablist"` tab
// strip (TSX 544-566): roving tabindex + Arrow Left/Right/Up/Down wrap,
// Home/End, activation-follows-focus.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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
  PerioIndexNameMode,
  PerioRowId,
  PerioViewMode,
  PulpDetailLevel,
  RadiographicDepthMode,
  RootCariesMode,
  SecondaryCariesMode,
  SurfaceNotation,
  ToothDetailLevel,
} from "../../core/odontogram";

/**
 * The full set of live setting values + change handlers the modal drives.
 * Field-for-field identical to SettingsModal.tsx's `SettingsState` (29-68) —
 * every field maps 1:1 to an existing app-level piece of state.
 *
 * NOTE for the host wiring this up (Task 3, OdontogramShellComponent): unlike
 * React re-rendering from scratch, Angular's `[checked]`/`[selected]`
 * bindings are diffed against a cached last-written value — if the DOM
 * control's live state changes (e.g. a checkbox the user clicked) but the
 * host's `on*` callback does NOT feed a new value back into this `settings`
 * input, the binding cache already matches the DOM and Angular will NOT
 * "snap" the widget back on the next change detection. Every `on*` callback
 * must therefore round-trip through host state (even if the new value is
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
  showStatusCard: boolean;
  onShowStatusCard: (value: boolean) => void;
  showOrthoCard: boolean;
  onShowOrthoCard: (value: boolean) => void;
  perioViewMode: PerioViewMode;
  onPerioViewMode: (value: PerioViewMode) => void;
  perioRowVisibility: Record<PerioRowId, boolean>;
  onPerioRowVisibility: (id: PerioRowId, visible: boolean) => void;
  perioIndexNameMode: PerioIndexNameMode;
  onPerioIndexNameMode: (value: PerioIndexNameMode) => void;
}

/** Ids of the 7 tabs, in the order the tab strip (and `SETTINGS_TABS`) renders them. */
export type SettingsTabId =
  | "general"
  | "panels"
  | "toothDetails"
  | "caries"
  | "pulpa"
  | "notes"
  | "periodontal";

/**
 * Declarative tab registry (TSX 252-466, `render` bodies dropped — Angular's
 * `@switch (activeTab())` plays that role in the template instead).
 */
export const SETTINGS_TABS: ReadonlyArray<{ id: SettingsTabId; titleKey: string }> = [
  { id: "general", titleKey: "settings.tab.general" },
  { id: "panels", titleKey: "settings.tab.panels" },
  { id: "toothDetails", titleKey: "settings.tab.toothDetails" },
  { id: "caries", titleKey: "settings.tab.caries" },
  { id: "pulpa", titleKey: "settings.tab.pulpa" },
  { id: "notes", titleKey: "settings.tab.notes" },
  { id: "periodontal", titleKey: "settings.tab.periodontal" },
];

// Option lists for every select row (TSX 84-146), transcribed verbatim.
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

const PERIO_INDEX_NAME_MODE_OPTIONS: ReadonlyArray<{ value: PerioIndexNameMode; labelKey: string }> = [
  { value: "translated", labelKey: "settings.perioIndexNameMode.translated" },
  { value: "canonical", labelKey: "settings.perioIndexNameMode.canonical" },
];

/**
 * Declarative row-id groups for the Periodontal tab (TSX 153-159, transcribed
 * verbatim: 5 groups covering the 16 `PerioRowId`s). Each group is a
 * sub-heading + the row ids it covers; a toggle row is rendered per id,
 * bound to `settings().perioRowVisibility[id]` / `onPerioRowVisibility(id, v)`.
 */
const PERIO_ROW_GROUPS: ReadonlyArray<{ titleKey: string; ids: readonly PerioRowId[] }> = [
  { titleKey: "settings.perio.group.pocket", ids: ["pd", "gm", "cal", "bop"] },
  { titleKey: "settings.perio.group.hygiene", ids: ["plaque", "pi", "gi"] },
  { titleKey: "settings.perio.group.mucogingival", ids: ["cej", "rootConcavity", "kg", "gt"] },
  { titleKey: "settings.perio.group.support", ids: ["furcation", "mobility", "miller"] },
  { titleKey: "settings.perio.group.periimplant", ids: ["mpi", "mbi"] },
];

/** Keyboard keys the tablist's APG nav handler reacts to (TSX 546). */
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
                  [attr.tabindex]="tab.id === activeTab() ? 0 : -1"
                  class="odon-settings-tab"
                  [class.is-active]="tab.id === activeTab()"
                  (click)="activeTab.set(tab.id)"
                >
                  {{ i18n.t(tab.titleKey) }}
                </button>
              }
            </div>
            <div
              class="odon-settings-panel"
              role="tabpanel"
              [id]="'odon-settings-panel-' + activeTab()"
              [attr.aria-labelledby]="'odon-settings-tab-' + activeTab()"
            >
              @switch (activeTab()) {
                @case ("general") {
                  <!-- TSX 256-298 -->
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
                  <div class="odon-settings-row odon-settings-row-disabled" aria-disabled="true">
                    <div class="odon-settings-row-text">
                      <div class="odon-settings-row-label">
                        {{ i18n.t("settings.exportImport.title") }}
                        <span class="odon-settings-badge">{{ i18n.t("settings.comingSoon") }}</span>
                      </div>
                      <div class="odon-settings-row-desc">{{ i18n.t("settings.exportImport.desc") }}</div>
                    </div>
                  </div>
                }
                @case ("panels") {
                  <!-- TSX 300-329 -->
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
                }
                @case ("toothDetails") {
                  <!-- TSX 330-361 -->
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
                }
                @case ("caries") {
                  <!-- TSX 362-407 -->
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
                @case ("pulpa") {
                  <!-- TSX 408-421 -->
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
                }
                @case ("notes") {
                  <!-- TSX 422-434 -->
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
                @case ("periodontal") {
                  <!-- TSX 435-465 -->
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

  private readonly dialogRef = viewChild<ElementRef<HTMLElement>>("dialog");
  private readonly tablistRef = viewChild<ElementRef<HTMLElement>>("tablist");
  private openerEl: HTMLElement | null = null;

  constructor() {
    // Mirrors SettingsModal.tsx's focus effect (498-507): capture the opener +
    // move focus into the dialog when it opens; cleanup (on close/destroy)
    // restores focus to the opener.
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

  protected onBackdropMouseDown(e: MouseEvent): void {
    // TSX 574-577: only a mousedown that targets the backdrop itself closes.
    if (e.target === e.currentTarget) this.close.emit();
  }

  protected onKeyDown(e: KeyboardEvent): void {
    // TSX 509-535: Escape closes; Tab is manually trapped within the dialog.
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
   * APG tabs keyboard support (TSX 544-566): Arrow Left/Right/Up/Down move
   * between tabs with wraparound; Home/End jump to first/last. Moving focus
   * also activates (roving-tabindex + activation-follows-focus model).
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
}
