// Angular port of $ENGINE@934a911:src/surfaces/ToothControlsSurface.tsx (124 lines).
//
// Composable surface — the `<div class="panel-odontogram-controls">` region:
// the odontogram control panel (selection actions, Statuses/Tooth/Ortho/
// Caries/Fillings/Root-periodontium cards). STATIC card wrappers + the
// shared delegated collapse infra live here; per the Task 2 brief the card
// BODIES stay as the pre-existing imperative template blocks for now (Task 3
// replaces them with the seven declarative card components) — the shared
// collapse behavior itself is engine-side (`odontogram.ts`'s single
// document-level delegated listener over `.icon-btn`/`#btnToggle*`, see
// `wireControls()`), so no Angular-side collapse logic is needed here beyond
// keeping the same ids/classes the delegated listener queries by.
//
// DOM-mount-strategy deviation: the pinned source is conditionally MOUNTED
// by the shell layout (`{isPerioView ? <PerioSidebar/> : <ToothControlsSurface/>}`,
// safe now that Tier 2 made `rewireControls()` idempotent on remount). This
// port keeps the pre-resync shell's "always mounted, `display:none` while
// the perio view is active" strategy instead, matching the still-current
// `ui1-perio-sidebar.spec.ts` assertions ("odontogram controls stay mounted
// but hidden"). See the Task 2 report for the full rationale.
//
// Resync fallout fix: `#btnResetTooth`'s click handling used to be wired
// imperatively by the engine; the 1.2.0 pin's `syncControlsFromState()`
// comment confirms that wiring was REMOVED in favor of the declarative
// wrapper binding `onClick={() => resetTooth()}` directly (see
// `core/odontogram.ts`'s `resetTooth()` doc comment) — ported here since
// this file owns that exact button.
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { I18nService } from "../../i18n/i18n.service";
import { OdontogramUiService } from "../odontogram-ui.service";
import { resetTooth, rewireControls } from "../../core/odontogram";

@Component({
  selector: "aao-tooth-controls-surface",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel-odontogram-controls" [style.display]="ui.isPerioView() ? 'none' : null">
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
        <div [class.hidden]="!ui.showStatusCard()">
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
            <button id="btnResetTooth" class="btn btn-ghost btn-sm" [attr.title]="i18n.t('tooth.resetTitle')" [attr.aria-label]="i18n.t('tooth.resetTitle')" (click)="resetTooth()">{{ i18n.t('tooth.reset') }}</button>
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

        <div [class.hidden]="!ui.showOrthoCard()">
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
          <!-- "simple" complexity: one filled/not-filled toggle shown
               instead of the 5-surface grid (wired in odontogram.ts). It
               is a .row LABEL (the whole pill is clickable — the native
               checkbox is display:none), like #fissureSealingRow. -->
          <label id="fillingSimpleRow" class="row fissure-row hidden">
            <input type="checkbox" id="fillingSimpleToggle" />
            <span>{{ i18n.t('filling.simpleToggle') }}</span>
          </label>
          <!-- When the filling-defect feature is on, a defect select
               applies a defect to ALL filled surfaces (simple mode has no
               per-surface cells). -->
          <div id="fillingSimpleDefectRow" class="row hidden">
            <span>{{ i18n.t('fillingDefect.label') }}</span>
            <select id="fillingSimpleDefectSelect"></select>
          </div>
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
  `,
})
export class ToothControlsSurfaceComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly ui = inject(OdontogramUiService);
  protected readonly resetTooth = resetTooth;

  constructor() {
    // Re-wire the imperative controls whenever this surface (re)mounts —
    // no-op on first mount (ODONTOGRAM_ENGINE_LIFECYCLE's init runs
    // afterwards and does the first wiring); acts only on later remounts
    // (ToothControlsSurface.tsx 25-28).
    rewireControls();
  }
}
