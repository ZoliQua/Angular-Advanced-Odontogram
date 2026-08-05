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
} from "@angular/core";
import {
  destroyOdontogram,
  getOdontogramSummary,
  getPerioViewMode,
  hasAnyPerioData,
  initOdontogram,
  isDualStateConfirmPending,
  isPerioOverlayOpen,
  onStateChange,
  registerPlugins,
  setCariesDepthEnabled,
  setDiscolorationDetailLevel,
  setIcdasEnabled,
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
  template: `
    <div class="odontogram-root" [attr.dir]="isRtl() ? 'rtl' : 'ltr'" [attr.lang]="lang()">
      <!-- Task 5: topbar, perio-launch bar, tooth-info card, modal mounts -->
      <main class="layout">
        <!-- Task 5: viewMode style binding (App.tsx 659-661) -->
        <div class="chart-column">
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
        </div>

        <aside class="panel">
          <!-- Task 5: isPerioView style binding + PerioSidebar mount (App.tsx 745-746) -->
          <div class="panel-odontogram-controls">
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
    </div>
  `,
})
export class OdontogramShellComponent implements AfterViewInit, OnDestroy {
  protected readonly i18n = inject(I18nService);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly engineLifecycle = inject(ODONTOGRAM_ENGINE_LIFECYCLE);

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

  // Dark mode: only managed internally when standalone (App.tsx 286-299).
  private readonly internalDark = signal<boolean>(
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false,
  );

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
  private readonly toothInfoOn = signal(true);

  // onStateChange mirrors (App.tsx 395-452).
  protected readonly summary = signal<OdontogramSummary | null>(null);
  protected readonly hasPerio = signal(false);
  protected readonly perioOpen = signal(false);
  protected readonly viewMode = signal<PerioViewMode>(getPerioViewMode());
  protected readonly confirmOpen = signal(false);

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
      applyThemeConfig(
        this.host.nativeElement.querySelector<HTMLElement>(".odontogram-root"),
        this.themeConfig(),
      );
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

  ngAfterViewInit(): void {
    // App.tsx 320-325: fire-and-forget, exactly like the untouched React
    // effect — the engine's own init is async but not awaited here either.
    void this.engineLifecycle.init();
  }

  ngOnDestroy(): void {
    // App.tsx 322-324. The onStateChange mirrors above are all registered
    // via effect()'s onCleanup, so Angular tears them down automatically as
    // part of this component's destroy — no separate bookkeeping needed.
    this.engineLifecycle.destroy();
  }

  /** useI18n.ts 77-84: emits regardless of mode; only pushes into the core
   *  i18n bus when uncontrolled (no `language` input bound). */
  protected setLang(next: Language): void {
    this.languageChange.emit(next);
    if (this.language() === undefined) {
      this.i18n.setLanguage(next);
    }
  }
}
