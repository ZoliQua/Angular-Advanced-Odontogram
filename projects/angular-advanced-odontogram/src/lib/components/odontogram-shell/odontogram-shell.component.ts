// Angular port of $ENGINE/src/App.tsx — Phase 2 Task 4: static skeleton,
// engine lifecycle, and prop syncs. This task deliberately transcribes only:
//   - the chart section (App.tsx 663-695)
//   - the right-hand controls panel `<aside class="panel">` (App.tsx 738-1012)
//   - the lifecycle/prop-sync effects (App.tsx 295-469, minus perio-row/
//     index-name mirrors, which are Phase-3/4 consumers, and minus anything
//     that only feeds the topbar/perio-launch-bar/tooth-info-card/modal
//     mounts, which are Task 5's job (marked below).
// Every id transcribed from those two JSX ranges is asserted by
// odontogram-shell.component.spec.ts's DOM-contract inventory.
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  InjectionToken,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import {
  acceptDualStateConfirm,
  cancelDualStateConfirm,
  destroyOdontogram,
  formatToothLabel,
  getOdontogramSummary,
  getPerioViewMode,
  hasAnyPerioData,
  initOdontogram,
  isDualStateConfirmPending,
  isPerioOverlayOpen,
  onStateChange,
  openPerioOverlay,
  registerPlugins,
  setCariesDepthEnabled,
  setDiscolorationDetailLevel,
  setIcdasEnabled,
  setImportFormat,
  setNotesEnabled,
  setNumberingSystem,
  setPulpDetailLevel,
  setRadiographicDepthMode,
  setReadOnly,
  setRootCariesMode,
  setSecondaryCariesMode,
  setSurfaceNotation,
  setWearDetailLevel,
  type OdontogramSummary,
  type PerioViewMode,
  type PulpDetailLevel,
  type RadiographicDepthMode,
  type RootCariesMode,
  type SecondaryCariesMode,
  type SurfaceNotation,
  type ToothDetailLevel,
} from "../../core/odontogram";
import { applyThemeConfig, type OdontogramThemeConfig } from "../../core/theme";
import type { OdontogramPlugin } from "../../core/plugin";
import type { NumberingSystem } from "../../core/utils/numbering";
import type { Language } from "../../core/i18n/translations";
import { I18nService } from "../../i18n/i18n.service";
import { startIntroTour } from "../../core/tour";
import { DualStateConfirmComponent } from "../dual-state-confirm/dual-state-confirm.component";
import {
  icon8Svg,
  iconGumSvg,
  iconNoSelectionUrl,
  iconOcclSvg,
  iconPulpSvg,
} from "../../core/generated/icon-svgs";

// App.tsx 37-47: languages whose native reading direction is right-to-left.
// Only Arabic today. The root's `dir` is reactive to the active language
// (never mutates document.documentElement — an embedding host's direction is
// not ours to change); the dental/perio charts stay pinned `dir="ltr"` (see
// `#toothGrid` below) since they are diagrams read 18->28 left-to-right in
// every locale.
const RTL_LANGUAGES: ReadonlySet<Language> = new Set(["ar"]);

/**
 * DI seam around App.tsx 320-325's `initOdontogram()`/`destroyOdontogram()`
 * pair. The Angular unit-test builder's Vitest integration hard-blocks
 * `vi.mock()` for any relative-path specifier (it throws "not supported for
 * relative imports... use Angular TestBed for mocking dependencies" — see
 * `@angular/build`'s `runners/vitest/build-options.js`), which is exactly the
 * mocking strategy the source engine test suite (`App.test.tsx`) and this
 * component's own spec need: mock only the two lifecycle calls, keep every
 * other export of `core/odontogram` real. `vi.spyOn` on the module namespace
 * fails too (its exports are non-configurable). This token is the sanctioned
 * workaround the builder's own error message points at: specs override it
 * via `TestBed`'s provider array instead of module-mocking.
 */
export const ODONTOGRAM_ENGINE_LIFECYCLE = new InjectionToken<{
  init: () => Promise<void>;
  destroy: () => void;
}>("ODONTOGRAM_ENGINE_LIFECYCLE", {
  providedIn: "root",
  factory: () => ({ init: initOdontogram, destroy: destroyOdontogram }),
});

@Component({
  selector: "aao-odontogram-shell",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DualStateConfirmComponent],
  template: `
    <div class="odontogram-root" #root [attr.dir]="isRtl() ? 'rtl' : 'ltr'" [attr.lang]="lang()">
      <header class="topbar">
        <div class="brand">
          <div class="dot"></div>
          <div>
            <div class="title">{{ i18n.t('app.title') }}</div>
            <div class="subtitle">{{ i18n.t('app.subtitleLang') }} {{ i18n.t('app.subtitleNumbering.' + currentNumbering()) }} {{ i18n.t(isDark() ? 'app.subtitleMode.dark' : 'app.subtitleMode.light') }}</div>
          </div>
        </div>
        <div class="topbar-actions">
          <button class="btn-theme" (click)="startIntroTour()" [attr.title]="i18n.t('intro.start')" [attr.aria-label]="i18n.t('intro.start')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          </button>
          <div class="topbar-group dropdown" #languageGroup>
            <button class="btn-theme" (click)="languageOpen.set(!languageOpen())" aria-haspopup="menu" [attr.aria-expanded]="languageOpen()" [attr.title]="i18n.t('language.label')" [attr.aria-label]="i18n.t('language.label')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>
            </button>
            @if (languageOpen()) {
              <div class="dropdown-menu" role="menu" [attr.aria-label]="i18n.t('language.label')">
                @for (opt of languageOptions; track opt.value) {
                  <button
                    class="dropdown-item"
                    role="menuitemradio"
                    [attr.aria-checked]="lang() === opt.value"
                    (click)="selectLanguage(opt.value)"
                  >{{ i18n.t(opt.labelKey) }}</button>
                }
              </div>
            }
          </div>
          <button
            class="btn-theme"
            (click)="toggleDark()"
            [attr.title]="isDark() ? i18n.t('theme.light') : i18n.t('theme.dark')"
            [attr.aria-label]="isDark() ? i18n.t('theme.light') : i18n.t('theme.dark')"
          >
            @if (isDark()) {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            }
          </button>
          <div class="topbar-group">
            <button class="btn-theme" (click)="settingsOpen.set(true)" aria-haspopup="dialog" [attr.aria-expanded]="settingsOpen()" [attr.title]="i18n.t('settings.title')" [attr.aria-label]="i18n.t('settings.title')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
          </div>
          <!-- Hidden export buttons kept for host capture + wireControls wiring -->
          <button id="btnStatusExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('topbar.exportStatus') }}</button>
          <button id="btnStatusFhirExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('topbar.exportFhir') }}</button>
          <button id="btnStatusPngExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('topbar.exportPng') }}</button>
          <button id="btnStatusJpgExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('topbar.exportJpg') }}</button>
          <button id="btnStatusSvgExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('export.menu.svg') }}</button>
          <button id="btnPerioSvgExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('export.menu.perioSvg') }}</button>
          <button id="btnPerioPngExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('export.menu.perioPng') }}</button>
          <button id="btnPerioJpgExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('export.menu.perioJpg') }}</button>
          <div class="topbar-group dropdown" #exportGroup>
            <button id="btnExportMenu" class="btn-theme" (click)="exportOpen.set(!exportOpen())" aria-haspopup="menu" [attr.aria-expanded]="exportOpen()" [attr.title]="i18n.t('topbar.export')" [attr.aria-label]="i18n.t('topbar.export')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            </button>
            @if (exportOpen()) {
              <div class="dropdown-menu" role="menu" [attr.aria-label]="i18n.t('topbar.export')">
                <button class="dropdown-item" role="menuitem" (click)="proxyClick('btnStatusExport'); exportOpen.set(false)">{{ i18n.t('export.menu.statusJson') }}</button>
                <button class="dropdown-item" role="menuitem" (click)="proxyClick('btnStatusFhirExport'); exportOpen.set(false)">{{ i18n.t('export.menu.fhir') }}</button>
                <button class="dropdown-item" role="menuitem" (click)="proxyClick('btnStatusPngExport'); exportOpen.set(false)">{{ i18n.t('export.menu.png') }}</button>
                <button class="dropdown-item" role="menuitem" (click)="proxyClick('btnStatusJpgExport'); exportOpen.set(false)">{{ i18n.t('export.menu.jpg') }}</button>
                <button class="dropdown-item" role="menuitem" (click)="proxyClick('btnStatusSvgExport'); exportOpen.set(false)">{{ i18n.t('export.menu.svg') }}</button>
                <button class="dropdown-item" role="menuitem" [disabled]="!hasPerio()" (click)="proxyClick('btnPerioSvgExport'); exportOpen.set(false)">{{ i18n.t('export.menu.perioSvg') }}</button>
                <button class="dropdown-item" role="menuitem" [disabled]="!hasPerio()" (click)="proxyClick('btnPerioPngExport'); exportOpen.set(false)">{{ i18n.t('export.menu.perioPng') }}</button>
                <button class="dropdown-item" role="menuitem" [disabled]="!hasPerio()" (click)="proxyClick('btnPerioJpgExport'); exportOpen.set(false)">{{ i18n.t('export.menu.perioJpg') }}</button>
                <button class="dropdown-item" role="menuitem" (click)="exportOpen.set(false); pdfOpen.set(true)">{{ i18n.t('export.menu.pdf') }}</button>
              </div>
            }
          </div>
          <button id="btnStatusImport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('topbar.importStatus') }}</button>
          <div class="topbar-group dropdown" #importGroup>
            <button id="btnImportMenu" class="btn-theme" (click)="importOpen.set(!importOpen())" aria-haspopup="menu" [attr.aria-expanded]="importOpen()" [attr.title]="i18n.t('topbar.import')" [attr.aria-label]="i18n.t('topbar.import')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 8l5-5 5 5M12 3v12"/></svg>
            </button>
            @if (importOpen()) {
              <div class="dropdown-menu" role="menu" [attr.aria-label]="i18n.t('topbar.import')">
                <button class="dropdown-item" role="menuitem" (click)="importStatusJson()">{{ i18n.t('import.menu.statusJson') }}</button>
                <button class="dropdown-item" role="menuitem" (click)="importFhirJson()">{{ i18n.t('import.menu.fhir') }}</button>
              </div>
            }
          </div>
          <input id="statusImportInput" type="file" accept="application/json" hidden />
        </div>
      </header>
      <main class="layout">
        <div class="perio-launch-bar">
          @if (viewMode() === 'toggle') {
            <div id="appViewToggle" class="chart-mode-toggle" role="tablist">
              <button
                id="appViewOdontogram"
                type="button"
                [class]="'chart-mode-btn' + (activeView() === 'odontogram' ? ' is-active' : '')"
                role="tab"
                [attr.aria-selected]="activeView() === 'odontogram'"
                (click)="activeView.set('odontogram')"
              >{{ i18n.t('view.odontogram') }}</button>
              <button
                id="appViewDentalChart"
                type="button"
                [class]="'chart-mode-btn' + (activeView() === 'dentalChart' ? ' is-active' : '')"
                role="tab"
                [attr.aria-selected]="activeView() === 'dentalChart'"
                (click)="activeView.set('dentalChart')"
              >{{ i18n.t('view.dentalChart') }}</button>
            </div>
          } @else {
            <button
              type="button"
              id="openPerioOverlayBtn"
              class="btn btn-ghost"
              (click)="openPerioOverlay()"
              [attr.title]="i18n.t('perio.open')"
              [attr.aria-label]="i18n.t('perio.open')"
            >{{ i18n.t('perio.open') }}</button>
          }
        </div>
        <div class="chart-column" [style.display]="isPerioView() ? 'none' : null">
        <section class="chart">
          <div class="chart-header">
            <div>
              <div class="chart-title">{{ i18n.t('chart.title') }}</div>
              <div class="chart-hint">{{ i18n.t('chart.hint') }}</div>
            </div>
            <div id="chartModeToggle" class="chart-mode-toggle" role="tablist">
              <button id="chartModeStatus" type="button" class="chart-mode-btn is-active" role="tab" aria-selected="true">{{ i18n.t('chartMode.status') }}</button>
              <button id="chartModePlan" type="button" class="chart-mode-btn" role="tab" aria-selected="false">{{ i18n.t('chartMode.plan') }}</button>
              <span id="chartModePlanBadge" class="plan-badge hidden">{{ i18n.t('chartMode.planBadge') }}</span>
            </div>
            <div id="proposedLegend" class="proposed-legend">
              <span class="proposed-legend-swatch" aria-hidden="true"></span>
              {{ i18n.t('chart.proposedLegend') }}
            </div>
            <div class="chart-actions">
              <button id="btnOcclView" class="btn btn-toggle btn-icon" aria-pressed="true" [attr.title]="i18n.t('chart.actions.occlusal')" [attr.aria-label]="i18n.t('chart.actions.occlusal')" [attr.data-icon-src]="iconOcclSvg" data-xline="1"></button>
              <button id="btnWisdomVisible" class="btn btn-toggle btn-icon" aria-pressed="true" [attr.title]="i18n.t('chart.actions.wisdom')" [attr.aria-label]="i18n.t('chart.actions.wisdom')" [attr.data-icon-src]="icon8Svg" data-xline="1"></button>
              <button id="btnBoneVisible" class="btn btn-toggle btn-icon" aria-pressed="true" [attr.title]="i18n.t('chart.actions.bone')" [attr.aria-label]="i18n.t('chart.actions.bone')" [attr.data-icon-src]="iconGumSvg" data-xline="1"></button>
              <button id="btnPulpVisible" class="btn btn-toggle btn-icon" aria-pressed="true" [attr.title]="i18n.t('chart.actions.pulp')" [attr.aria-label]="i18n.t('chart.actions.pulp')" [attr.data-icon-src]="iconPulpSvg" data-xline="1"></button>
              <button id="btnSelectNoneChart" class="btn btn-ghost btn-icon" [attr.title]="i18n.t('chart.actions.clearSelection')" [attr.aria-label]="i18n.t('chart.actions.clearSelection')">
                <img class="icon-img" [src]="iconNoSelectionUrl" alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div id="toothGrid" class="tooth-grid" dir="ltr" [attr.aria-label]="i18n.t('chart.aria.toothGrid')"></div>
        </section>
        @if (toothInfoOn() && summary(); as s) {
          <section class="tooth-info card" [attr.aria-label]="i18n.t('toothInfo.title')">
            <div class="card-title">{{ i18n.t('toothInfo.title') }}</div>
            <p class="tooth-info-overview">{{ s.overview }}</p>
            @if (s.permanentList) {
              <p class="tooth-info-list">{{ s.permanentList }}</p>
            }
            @if (s.missingList) {
              <p class="tooth-info-list">{{ s.missingList }}</p>
            }
            @for (sec of s.sections; track sec.key) {
              <p class="tooth-info-line">
                <span class="tooth-info-heading">{{ sec.heading }}:</span>
                @if (sec.items.length) {
                  {{ sec.items.join(', ') }}
                } @else {&ngsp;<span class="tooth-info-empty">{{ sec.emptyText }}</span>
                }
              </p>
            }
            @if (s.plannedChanges && s.plannedChanges.length > 0) {
              <div id="plannedChangesBox" class="planned-changes">
                <div class="tooth-info-heading">{{ i18n.t('toothInfo.plannedChanges') }}</div>
                @for (c of s.plannedChanges; track c.toothNo + '-' + c.axis) {
                  <p class="planned-changes-item">
                    {{ formatToothLabel(c.toothNo) }}: {{ i18n.t('planChange.axis.' + c.axis) }} {{ c.from }} → {{ c.to }}
                  </p>
                }
              </div>
            }
            @if (s.implants; as implants) {
              <p class="tooth-info-line">
                <span class="tooth-info-heading">{{ implants.heading }}:</span>
                {{ implants.text }}
              </p>
            }
            <p class="tooth-info-line">
              <span class="tooth-info-heading">{{ s.periodontalTitle }}:</span>
              {{ s.periodontalText }}
            </p>
          </section>
        }
        </div>
        @if (isPerioView()) {
          <div class="dental-chart-column" dir="ltr">
            <!-- Phase 4: PerioChart inline -->
          </div>
        }

        <aside class="panel">
          @if (isPerioView()) {
            <!-- Phase 4: PerioSidebar -->
          }
          <div class="panel-odontogram-controls" [style.display]="isPerioView() ? 'none' : null">
          <div class="panel-header">
            <div>
              <div class="panel-title-row">
                <span class="panel-title">{{ i18n.t('panel.controls') }}</span>
                <div class="panel-title-actions">
                  <button id="btnSelectNone" class="btn btn-ghost btn-icon btn-danger" [attr.title]="i18n.t('panel.clearSelection')" [attr.aria-label]="i18n.t('panel.clearSelection')">{{ i18n.t('panel.clearSelection') }}</button>
                  <button id="btnToggleControlsCard" class="icon-btn" [attr.title]="i18n.t('actions.collapse', { label: i18n.t('panel.controls') })" [attr.aria-label]="i18n.t('actions.collapse', { label: i18n.t('panel.controls') })">
                    <span class="toggle-icon" aria-hidden="true">&minus;</span>
                  </button>
                </div>
              </div>
              <div class="panel-subtitle">{{ i18n.t('panel.activeTooth') }}: <span id="activeToothLabel" class="pill">{{ i18n.t('selection.none') }}</span></div>
              <div id="controlsActions" class="panel-subtitle select-actions">
                <div class="select-actions-row">
                  <button id="btnSelectAll" class="btn btn-ghost btn-icon" [attr.title]="i18n.t('panel.selectActions.all')">{{ i18n.t('panel.selectActions.all') }}</button>
                  <button id="btnSelectAllPresent" class="btn btn-ghost btn-icon fade-toggle" [attr.title]="i18n.t('panel.selectActions.present')">{{ i18n.t('panel.selectActions.present') }}</button>
                  <button id="btnSelectPermanent" class="btn btn-ghost btn-icon fade-toggle" [attr.title]="i18n.t('panel.selectActions.permanent')">{{ i18n.t('panel.selectActions.permanent') }}</button>
                  <button id="btnSelectMilk" class="btn btn-ghost btn-icon fade-toggle" [attr.title]="i18n.t('panel.selectActions.milk')">{{ i18n.t('panel.selectActions.milk') }}</button>
                  <button id="btnSelectImplants" class="btn btn-ghost btn-icon fade-toggle" [attr.title]="i18n.t('panel.selectActions.implants')">{{ i18n.t('panel.selectActions.implants') }}</button>
                  <button id="btnSelectAllMissing" class="btn btn-ghost btn-icon fade-toggle" [attr.title]="i18n.t('panel.selectActions.missing')">{{ i18n.t('panel.selectActions.missing') }}</button>
                </div>
                <div class="select-actions-row">
                  <button id="btnSelectUpper" class="btn btn-ghost btn-icon" [attr.title]="i18n.t('panel.selectActions.upper')">{{ i18n.t('panel.selectActions.upper') }}</button>
                  <button id="btnSelectUpperFront" class="btn btn-ghost btn-icon" [attr.title]="i18n.t('panel.selectActions.upperFront')">{{ i18n.t('panel.selectActions.upperFront') }}</button>
                  <button id="btnSelectUpperMolar" class="btn btn-ghost btn-icon" [attr.title]="i18n.t('panel.selectActions.upperMolar')">{{ i18n.t('panel.selectActions.upperMolar') }}</button>
                  <button id="btnSelectLower" class="btn btn-ghost btn-icon" [attr.title]="i18n.t('panel.selectActions.lower')">{{ i18n.t('panel.selectActions.lower') }}</button>
                  <button id="btnSelectLowerFront" class="btn btn-ghost btn-icon" [attr.title]="i18n.t('panel.selectActions.lowerFront')">{{ i18n.t('panel.selectActions.lowerFront') }}</button>
                  <button id="btnSelectLowerMolar" class="btn btn-ghost btn-icon" [attr.title]="i18n.t('panel.selectActions.lowerMolar')">{{ i18n.t('panel.selectActions.lowerMolar') }}</button>
                </div>
              </div>
            </div>
            <div id="warnings" class="warnings"></div>
          </div>

          <div class="panel-body">
            <div [class.hidden]="!showStatusCardOn()">
              <section class="card" id="statusCard">
                <div class="card-title card-title-row">
                  <span>{{ i18n.t('status.title') }}</span>
                  <button id="btnToggleStatusCard" class="icon-btn" [attr.title]="i18n.t('actions.collapse', { label: i18n.t('status.title') })" [attr.aria-label]="i18n.t('actions.collapse', { label: i18n.t('status.title') })">
                    <span class="toggle-icon" aria-hidden="true">&minus;</span>
                  </button>
                </div>
                <div class="row status-actions" id="statusCardBody">
                  <button id="btnResetAll" class="btn btn-ghost btn-sm">{{ i18n.t('status.resetAll') }}</button>
                  <button id="btnPrimaryDentition" class="btn btn-ghost btn-sm">{{ i18n.t('status.primaryDentition') }}</button>
                  <button id="btnMixedDentition" class="btn btn-ghost btn-sm">{{ i18n.t('status.mixedDentition') }}</button>
                  <button id="btnEdentulous" class="btn btn-toggle btn-sm" aria-pressed="false">{{ i18n.t('status.edentulous') }}</button>
                </div>
                <div class="row status-extra-row">
                  <span>{{ i18n.t('status.extraLabel') }}</span>
                  <select id="statusExtraSelect"></select>
                  <button id="statusExtraApply" class="btn btn-ghost btn-sm">{{ i18n.t('status.extraApply') }}</button>
                </div>
              </section>
            </div>

            <section class="card">
              <div class="card-title card-title-row">
                <span>{{ i18n.t('tooth.title') }}</span>
                <button id="btnResetTooth" class="btn btn-ghost btn-sm" [attr.title]="i18n.t('tooth.resetTitle')" [attr.aria-label]="i18n.t('tooth.resetTitle')">{{ i18n.t('tooth.reset') }}</button>
              </div>
              <div class="row">
                <span>{{ i18n.t('tooth.baseLabel') }}</span>
                <select id="toothSelect"></select>
              </div>
              <div id="substrateRow" class="row">
                <span>{{ i18n.t('substrate.label') }}</span>
                <select id="substrateSelect"></select>
              </div>
              <label id="extractionRow" class="row">
                <input type="checkbox" id="extractionWound" />
                <span>{{ i18n.t('tooth.extractionWound') }}</span>
              </label>
              <label id="missingClosedRow" class="row">
                <input type="checkbox" id="missingClosed" />
                <span>{{ i18n.t('tooth.missingClosed') }}</span>
              </label>
              <div id="restorationRow" class="row">
                <span>{{ i18n.t('restoration.label') }}</span>
                <select id="restorationSelect"></select>
              </div>
              <label id="crownLeakageRow" class="row hidden">
                <input type="checkbox" id="crownLeakage" />
                <span>{{ i18n.t('crownLeakage.label') }}</span>
              </label>
              <div id="brokenCrownRow" class="row inline-checks contact-row">
                <label>
                  <input type="checkbox" id="brokenMesial" />
                  <span>{{ i18n.t('tooth.broken.mesial') }}</span>
                </label>
                <label>
                  <input type="checkbox" id="brokenIncisal" />
                  <span>{{ i18n.t('tooth.broken.incisal') }}</span>
                </label>
                <label>
                  <input type="checkbox" id="brokenDistal" />
                  <span>{{ i18n.t('tooth.broken.distal') }}</span>
                </label>
              </div>
              <div id="contactPointRow" class="row inline-checks contact-row">
                <label>
                  <input type="checkbox" id="contactMesial" />
                  <span>{{ i18n.t('tooth.contact.mesialMissing') }}</span>
                </label>
                <label>
                  <input type="checkbox" id="contactDistal" />
                  <span>{{ i18n.t('tooth.contact.distalMissing') }}</span>
                </label>
              </div>
              <div id="bruxismRow" class="inline-checks bruxism-row wear-stack">
                <div id="wearEdgeRow" class="row">
                  <label id="wearEdgeSelectLabel"><span>{{ i18n.t('tooth.bruxism.edgeWear') }}</span><select id="wearEdgeSelect"></select></label>
                  <label id="wearEdgeToggleLabel" class="inline-check hidden"><input type="checkbox" id="wearEdgeToggle" /><span>{{ i18n.t('tooth.bruxism.edgeWear') }}</span></label>
                </div>
                <div id="wearCervicalRow" class="row">
                  <label id="wearCervicalSelectLabel"><span>{{ i18n.t('tooth.bruxism.neckWear') }}</span><select id="wearCervicalSelect"></select></label>
                  <label id="wearCervicalToggleLabel" class="inline-check hidden"><input type="checkbox" id="wearCervicalToggle" /><span>{{ i18n.t('tooth.bruxism.neckWear') }}</span></label>
                </div>
              </div>
              <div id="discolorationRow" class="row inline-checks">
                <label id="discolorationSelectLabel"><span>{{ i18n.t('discoloration.label') }}</span><select id="discolorationSelect"></select></label>
                <label id="discolorationToggleLabel" class="inline-check hidden"><input type="checkbox" id="discolorationToggle" /><span>{{ i18n.t('discoloration.label') }}</span></label>
              </div>
              <div id="crownActionsRow" class="row inline-checks bridge-actions-row">
                <label id="bridgePillarRow" class="inline-check">
                  <input type="checkbox" id="bridgePillar" />
                  <span>{{ i18n.t('tooth.bridgePillar') }}</span>
                </label>
                <label id="extractionPlanRow" class="inline-check">
                  <input type="checkbox" id="extractionPlan" />
                  <span>{{ i18n.t('tooth.extractionPlan') }}</span>
                </label>
              </div>
              <label id="crownReplaceRow" class="row">
                <input type="checkbox" id="crownReplace" />
                <span>{{ i18n.t('tooth.crownReplace') }}</span>
              </label>
              <label id="crownNeededRow" class="row">
                <input type="checkbox" id="crownNeeded" />
                <span>{{ i18n.t('tooth.crownNeeded') }}</span>
              </label>
            </section>

            <div [class.hidden]="!showOrthoCardOn()">
              <section id="orthoCard" class="card">
                <div class="card-title card-title-row">
                  <span>{{ i18n.t('toothInfo.orthodontics') }}</span>
                </div>
                <div id="orthoApplianceRow" class="row">
                  <span>{{ i18n.t('ortho.appliance.label') }}</span>
                  <select id="orthoApplianceSelect"></select>
                </div>
                <div id="orthoDriftRow" class="row">
                  <span>{{ i18n.t('ortho.drift.label') }}</span>
                  <select id="orthoDriftSelect"></select>
                </div>
                <div id="orthoVerticalRow" class="row">
                  <span>{{ i18n.t('ortho.vertical.label') }}</span>
                  <select id="orthoVerticalSelect"></select>
                </div>
                <label id="orthoRotationRow" class="row inline-check">
                  <input type="checkbox" id="orthoRotationToggle" />
                  <span>{{ i18n.t('ortho.rotation.label') }}</span>
                </label>
              </section>
            </div>

            <section id="cariesSection" class="card">
              <div class="card-title card-title-row">
                <span>{{ i18n.t('caries.title') }}</span>
                <button id="btnToggleCariesCard" class="icon-btn" [attr.title]="i18n.t('actions.collapse', { label: i18n.t('caries.title') })" [attr.aria-label]="i18n.t('actions.collapse', { label: i18n.t('caries.title') })">
                  <span class="toggle-icon" aria-hidden="true">&minus;</span>
                </button>
              </div>
              <div class="hint">{{ i18n.t('caries.hint') }}</div>
              <div id="cariesDepthRow" class="row">
                <span>{{ i18n.t('caries.depthLabel') }}</span>
                <select id="cariesDepthSelect"></select>
              </div>
              <div id="cariesChecks"></div>
              <div id="cariesSubcrownRow" class="check-grid subcrown-row"></div>
              <div id="rootCariesRow" class="row">
                <span>{{ i18n.t('caries.rootLabel') }}</span>
                <select id="rootCariesSelect"></select>
              </div>
            </section>

            <section id="fillingSection" class="card">
              <div class="card-title card-title-row">
                <span>{{ i18n.t('filling.title') }}</span>
                <button id="btnToggleFillingCard" class="icon-btn" [attr.title]="i18n.t('actions.collapse', { label: i18n.t('filling.title') })" [attr.aria-label]="i18n.t('actions.collapse', { label: i18n.t('filling.title') })">
                  <span class="toggle-icon" aria-hidden="true">&minus;</span>
                </button>
              </div>
              <div class="row">
                <span>{{ i18n.t('filling.typeLabel') }}</span>
                <select id="fillingSelect"></select>
              </div>
              <div id="fillingSurfaceChecks" class="hidden"></div>
              <label id="fissureSealingRow" class="row fissure-row">
                <input type="checkbox" id="fissureSealing" />
                <span>{{ i18n.t('filling.fissureSealing') }}</span>
              </label>
              <div id="fillingSubcariesSummary" class="hint hidden"></div>
              <div id="fillingDefectSummary" class="hint hidden"></div>
            </section>

            <section id="rootPeriodontiumSection" class="card">
              <div class="card-title card-title-row">
                <span>{{ i18n.t('card.rootPeriodontium') }}</span>
                <button id="btnToggleRootPeriodontiumCard" class="icon-btn" [attr.title]="i18n.t('actions.collapse', { label: i18n.t('card.rootPeriodontium') })" [attr.aria-label]="i18n.t('actions.collapse', { label: i18n.t('card.rootPeriodontium') })">
                  <span class="toggle-icon" aria-hidden="true">&minus;</span>
                </button>
              </div>

              <div id="rpRootBlock">
                <div class="hint">{{ i18n.t('endo.hint') }}</div>
                <div id="pulpEndoRow" class="row">
                  <span>{{ i18n.t('pulpEndo.label') }}</span>
                  <select id="pulpEndoSelect"></select>
                </div>
                <div id="apicalDxRow" class="row">
                  <span>{{ i18n.t('apical.dxLabel') }}</span>
                  <select id="apicalDxSelect"></select>
                </div>
                <div id="periapicalTypeRow" class="row hidden">
                  <span>{{ i18n.t('periapical.typeLabel') }}</span>
                  <select id="periapicalTypeSelect"></select>
                </div>
                <div id="resorptionRow" class="row">
                  <span>{{ i18n.t('root.resorption') }}</span>
                  <select id="resorptionSelect"></select>
                </div>
                <div class="row inline-checks">
                  <label>
                    <input type="checkbox" id="endoResection" />
                    <span>{{ i18n.t('endo.resection') }}</span>
                  </label>
                  <label>
                    <input type="checkbox" id="parapulpalPin" />
                    <span>{{ i18n.t('endo.parapulpalPin') }}</span>
                  </label>
                </div>
              </div>

              <div id="rpPerioBlock">
                <div id="mobilityRow" class="row">
                  <span>{{ i18n.t('inflammation.mobilityLabel') }}</span>
                  <select id="mobilitySelect"></select>
                </div>
                <div id="perioRow" class="perio-block">
                  <div class="perio-block-title">{{ i18n.t('perio.title') }}</div>
                  <div id="perioGrid" class="perio-grid"></div>
                  <div id="perioReadout" class="hint perio-readout"></div>
                </div>
                <div id="modsChecks" class="check-grid"></div>
                <div id="calculusRow" class="row inline-checks hidden">
                  <label><input type="checkbox" id="calculusToggle" /><span>{{ i18n.t('calculus.label') }}</span></label>
                </div>
                <div id="periImplantRow" class="row hidden">
                  <span>{{ i18n.t('periImplant.label') }}</span>
                  <select id="periImplantSelect"></select>
                </div>
              </div>
            </section>
          </div>
          </div>
        </aside>
      </main>

      <!-- Phase 4: PerioChart popup (viewMode === "popup", perioOpen) -->

      <!-- Phase 3: SettingsModal -->

      <aao-dual-state-confirm
        [open]="confirmOpen()"
        (accept)="acceptDualStateConfirm()"
        (cancel)="cancelDualStateConfirm()"
      />

      <!-- Phase 3: ExportOptionsModal -->
    </div>
  `,
})
export class OdontogramShellComponent implements AfterViewInit, OnDestroy {
  protected readonly i18n = inject(I18nService);
  private readonly engineLifecycle = inject(ODONTOGRAM_ENGINE_LIFECYCLE);

  // Task 5: viewChild reference to the root div, replacing the Task 4
  // `ElementRef.querySelector(".odontogram-root")` route for theme-config
  // application — a direct template reference is the idiomatic Angular seam
  // and avoids a DOM query on every themeConfig() change.
  private readonly rootRef = viewChild<ElementRef<HTMLElement>>("root");
  // App.tsx 529/583/606's `languageRef`/`exportRef`/`importRef` — the click-away
  // listener (App.tsx 454-469) checks `.contains(target)` against these.
  private readonly languageGroupRef = viewChild<ElementRef<HTMLElement>>("languageGroup");
  private readonly exportGroupRef = viewChild<ElementRef<HTMLElement>>("exportGroup");
  private readonly importGroupRef = viewChild<ElementRef<HTMLElement>>("importGroup");

  // Inputs (React prop parity — names match App.tsx's AppProps).
  readonly language = input<Language>();
  readonly numberingSystem = input<NumberingSystem>();
  readonly darkMode = input<boolean>();
  readonly themeConfig = input<OdontogramThemeConfig>();
  readonly plugins = input<OdontogramPlugin[]>();
  readonly readOnly = input<boolean>();
  readonly enableNotes = input<boolean>();
  readonly enableIcdas = input<boolean>();
  readonly pulpDetailLevel = input<PulpDetailLevel>();
  readonly secondaryCariesMode = input<SecondaryCariesMode>();
  readonly rootCariesMode = input<RootCariesMode>();
  readonly radiographicDepthMode = input<RadiographicDepthMode>();
  readonly cariesDepthEnabled = input<boolean>();
  readonly wearDetailLevel = input<ToothDetailLevel>();
  readonly discolorationDetailLevel = input<ToothDetailLevel>();
  readonly surfaceNotation = input<SurfaceNotation>();
  readonly showStatusCard = input<boolean>();
  readonly showOrthoCard = input<boolean>();

  readonly languageChange = output<Language>();
  readonly numberingChange = output<NumberingSystem>();
  readonly darkModeChange = output<boolean>();

  // Icon strings/URLs for the template (App.tsx 31-35 imports).
  protected readonly iconOcclSvg = iconOcclSvg;
  protected readonly icon8Svg = icon8Svg;
  protected readonly iconGumSvg = iconGumSvg;
  protected readonly iconPulpSvg = iconPulpSvg;
  protected readonly iconNoSelectionUrl = iconNoSelectionUrl;

  // Free engine functions the template invokes directly (App.tsx 4-19
  // imports) — exposed as instance fields, same precedent as the icon
  // strings above, so the inline template can call them as bare identifiers.
  protected readonly startIntroTour = startIntroTour;
  protected readonly openPerioOverlay = openPerioOverlay;
  protected readonly formatToothLabel = formatToothLabel;
  protected readonly acceptDualStateConfirm = acceptDualStateConfirm;
  protected readonly cancelDualStateConfirm = cancelDualStateConfirm;

  // App.tsx 160-173's LANGUAGE_OPTIONS, verbatim (order + labelKeys).
  protected readonly languageOptions: ReadonlyArray<{ value: Language; labelKey: string }> = [
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

  // Language: controlled/uncontrolled per the React useI18n hook
  // (useI18n.ts 68-91) — I18nService's `lang` signal already mirrors the
  // core bus, so it stands in for React's `internalLang` state.
  protected readonly lang = computed<Language>(() => this.language() ?? this.i18n.lang());
  protected readonly isRtl = computed(() => RTL_LANGUAGES.has(this.lang()));

  // Numbering: controlled/uncontrolled per App.tsx 222-224/311-318.
  private readonly internalNumbering = signal<NumberingSystem>("FDI");
  protected readonly currentNumbering = computed(
    () => this.numberingSystem() ?? this.internalNumbering(),
  );

  // Dark mode: controlled via `darkMode` input, or standalone via internal
  // state (App.tsx 286-299/301-309).
  private readonly internalDark = signal<boolean>(
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false,
  );
  protected readonly isDark = computed(() => this.darkMode() ?? this.internalDark());

  // Local mirrors of the 11 detail-level/mode props (App.tsx 228-240) — kept
  // alongside each engine setter effect below, same precedent as the two
  // card-visibility locals. Consumed by the segmented/dropdown controls Task
  // 5+ wires into this template; unused by this task's static skeleton.
  protected readonly notesOn = signal(false);
  protected readonly icdasOn = signal(false);
  protected readonly pulpLevel = signal<PulpDetailLevel>("aae");
  protected readonly secondaryMode = signal<SecondaryCariesMode>("standard");
  protected readonly rootMode = signal<RootCariesMode>("simple");
  protected readonly radiographicMode = signal<RadiographicDepthMode>("off");
  protected readonly cariesDepthOn = signal(true);
  protected readonly wearLevel = signal<ToothDetailLevel>("complex");
  protected readonly discoLevel = signal<ToothDetailLevel>("complex");
  protected readonly notation = signal<SurfaceNotation>("full");
  protected readonly showStatusCardOn = signal(true);
  protected readonly showOrthoCardOn = signal(true);

  // Tooth-info summary gate (App.tsx 238) — the tooth-info card that reads
  // `summary` is Task 5 scope; the signal + its refresh effect are wired now.
  protected readonly toothInfoOn = signal(true);

  // onStateChange mirrors (App.tsx 395-452).
  protected readonly summary = signal<OdontogramSummary | null>(null);
  protected readonly hasPerio = signal(false);
  protected readonly perioOpen = signal(false);
  protected readonly viewMode = signal<PerioViewMode>(getPerioViewMode());
  protected readonly confirmOpen = signal(false);

  // App.tsx 277's `isPerioView` — only true in toggle-mode dentalChart.
  protected readonly isPerioView = computed(
    () => this.viewMode() === "toggle" && this.activeView() === "dentalChart",
  );

  // Pure local UI state (App.tsx 225-247/261) — later tasks (topbar,
  // export/import/settings/pdf menus) bind these; created now so this file
  // grows additively rather than needing new fields threaded in later.
  protected readonly activeView = signal<"odontogram" | "dentalChart">("odontogram");
  protected readonly languageOpen = signal(false);
  protected readonly exportOpen = signal(false);
  protected readonly importOpen = signal(false);
  protected readonly settingsOpen = signal(false);
  protected readonly pdfOpen = signal(false);

  constructor() {
    // Language: push the effective language into the core i18n bus whenever
    // it changes (useI18n.ts 73-75). `I18nService.setLanguage`/the core bus's
    // own `setI18nLanguage` already no-op when unchanged, but a local guard
    // makes this effect's termination locally obvious (it would otherwise
    // read as "always writes to the same bus this effect's own dependency
    // mirrors" — the guard shows directly, without following into
    // I18nService, that a same-value write is a no-op and can't retrigger).
    effect(() => {
      const next = this.lang();
      if (next !== this.i18n.lang()) {
        this.i18n.setLanguage(next);
      }
    });

    // Numbering (App.tsx 327-329).
    effect(() => {
      setNumberingSystem(this.currentNumbering());
    });

    // Theme config (App.tsx 332-334).
    effect(() => {
      applyThemeConfig(this.rootRef()?.nativeElement ?? null, this.themeConfig());
    });

    // Plugins (App.tsx 337-339).
    effect(() => {
      registerPlugins(this.plugins() ?? []);
    });

    // Read-only (App.tsx 342-344).
    effect(() => {
      setReadOnly(this.readOnly() ?? false);
    });

    // Notes (App.tsx 347-350).
    effect(() => {
      const v = this.enableNotes() ?? false;
      setNotesEnabled(v);
      this.notesOn.set(v);
    });

    // ICDAS (App.tsx 353-356).
    effect(() => {
      const v = this.enableIcdas() ?? false;
      setIcdasEnabled(v);
      this.icdasOn.set(v);
    });

    // Pulp detail level (App.tsx 359-362).
    effect(() => {
      const v = this.pulpDetailLevel() ?? "aae";
      setPulpDetailLevel(v);
      this.pulpLevel.set(v);
    });

    // Secondary-caries mode (App.tsx 367-371).
    effect(() => {
      const v = this.secondaryCariesMode() ?? "standard";
      setSecondaryCariesMode(v);
      this.secondaryMode.set(v);
    });

    // Root-caries mode (App.tsx 372-376).
    effect(() => {
      const v = this.rootCariesMode() ?? "simple";
      setRootCariesMode(v);
      this.rootMode.set(v);
    });

    // Radiographic-depth mode (App.tsx 377-381).
    effect(() => {
      const v = this.radiographicDepthMode() ?? "off";
      setRadiographicDepthMode(v);
      this.radiographicMode.set(v);
    });

    // Caries-depth enabled (App.tsx 382-386).
    effect(() => {
      const v = this.cariesDepthEnabled() ?? true;
      setCariesDepthEnabled(v);
      this.cariesDepthOn.set(v);
    });

    // Wear detail level (App.tsx 387).
    effect(() => {
      const v = this.wearDetailLevel() ?? "complex";
      setWearDetailLevel(v);
      this.wearLevel.set(v);
    });

    // Discoloration detail level (App.tsx 388).
    effect(() => {
      const v = this.discolorationDetailLevel() ?? "complex";
      setDiscolorationDetailLevel(v);
      this.discoLevel.set(v);
    });

    // Surface notation (App.tsx 389).
    effect(() => {
      const v = this.surfaceNotation() ?? "full";
      setSurfaceNotation(v);
      this.notation.set(v);
    });

    // Card-visibility locals — local state only, no engine setter (App.tsx 390-391).
    effect(() => {
      this.showStatusCardOn.set(this.showStatusCard() ?? true);
    });
    effect(() => {
      this.showOrthoCardOn.set(this.showOrthoCard() ?? true);
    });

    // Dark mode: only manage the `.dark` class when standalone (App.tsx 295-299).
    effect(() => {
      if (this.darkMode() === undefined) {
        document.documentElement.classList.toggle("dark", this.internalDark());
      }
    });

    // Tooth-info summary refresh (App.tsx 395-402) — reactive to
    // toothInfoOn/lang/currentNumbering (the original's dependency array),
    // plus every engine state change while the panel is on.
    effect((onCleanup) => {
      if (!this.toothInfoOn()) return;
      this.lang();
      this.currentNumbering();
      const refresh = () => this.summary.set(getOdontogramSummary());
      refresh();
      onCleanup(onStateChange(refresh));
    });

    // Perio-data presence (App.tsx 404-413) — unconditional, own effect.
    effect((onCleanup) => {
      const refresh = () => this.hasPerio.set(hasAnyPerioData());
      refresh();
      onCleanup(onStateChange(refresh));
    });

    // Perio-overlay open flag (App.tsx 415-424).
    effect((onCleanup) => {
      const refresh = () => this.perioOpen.set(isPerioOverlayOpen());
      refresh();
      onCleanup(onStateChange(refresh));
    });

    // Perio view mode (App.tsx 426-433).
    effect((onCleanup) => {
      const refresh = () => this.viewMode.set(getPerioViewMode());
      refresh();
      onCleanup(onStateChange(refresh));
    });

    // Dual-state confirm pending flag (App.tsx 446-452) — subscribe only, no
    // initial read (a confirm can only be requested by a post-mount edit).
    effect((onCleanup) => {
      onCleanup(onStateChange(() => this.confirmOpen.set(isDualStateConfirmPending())));
    });
  }

  // App.tsx 454-469: one `document` click listener closing the three
  // dropdowns (language/export/import) when the click lands outside their
  // wrapper element — registered in ngAfterViewInit, removed in ngOnDestroy,
  // exactly like the React effect's own add/removeEventListener pair.
  private readonly documentClickHandler = (event: MouseEvent): void => {
    const target = event.target as Node;
    if (!this.languageGroupRef()?.nativeElement.contains(target)) {
      this.languageOpen.set(false);
    }
    if (!this.exportGroupRef()?.nativeElement.contains(target)) {
      this.exportOpen.set(false);
    }
    if (!this.importGroupRef()?.nativeElement.contains(target)) {
      this.importOpen.set(false);
    }
  };

  ngAfterViewInit(): void {
    // App.tsx 320-325: fire-and-forget, exactly like the untouched React
    // effect — the engine's own init is async but not awaited here either.
    void this.engineLifecycle.init();
    document.addEventListener("click", this.documentClickHandler);
  }

  ngOnDestroy(): void {
    // App.tsx 322-324. The onStateChange mirrors above are all registered
    // via effect()'s onCleanup, so Angular tears them down automatically as
    // part of this component's destroy — no separate bookkeeping needed.
    this.engineLifecycle.destroy();
    document.removeEventListener("click", this.documentClickHandler);
  }

  /** useI18n.ts 77-84: emits regardless of mode; only pushes into the core
   *  i18n bus when uncontrolled (no `language` input bound). */
  protected setLang(next: Language): void {
    this.languageChange.emit(next);
    if (this.language() === undefined) {
      this.i18n.setLanguage(next);
    }
  }

  /** App.tsx 541-544: pick a language from the dropdown, then close it. */
  protected selectLanguage(next: Language): void {
    this.setLang(next);
    this.languageOpen.set(false);
  }

  /** App.tsx 301-309, verbatim: standalone flips `internalDark`; controlled
   *  (a `darkMode` input is bound) never touches internal state — either way
   *  `darkModeChange` always emits. */
  protected toggleDark(): void {
    const next = !this.isDark();
    if (this.darkMode() !== undefined) {
      this.darkModeChange.emit(next);
    } else {
      this.internalDark.set(next);
      this.darkModeChange.emit(next);
    }
  }

  /** App.tsx 589-599's proxy-click pattern: the visible dropdown item clicks
   *  the matching hidden `#btnStatus*`/`#btnPerio*` button, which is the
   *  engine's own wireControls() capture target. */
  protected proxyClick(id: string): void {
    (document.getElementById(id) as HTMLButtonElement | null)?.click();
  }

  /** App.tsx 612: status-JSON import menu item. */
  protected importStatusJson(): void {
    setImportFormat("status");
    this.proxyClick("btnStatusImport");
    this.importOpen.set(false);
  }

  /** App.tsx 613: FHIR import menu item. */
  protected importFhirJson(): void {
    setImportFormat("fhir");
    this.proxyClick("btnStatusImport");
    this.importOpen.set(false);
  }
}
