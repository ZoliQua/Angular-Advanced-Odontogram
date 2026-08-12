// Angular port of $ENGINE@934a911:src/surfaces/ToothControlsSurface.tsx (124 lines).
//
// Composable surface — the `<div class="panel-odontogram-controls">` region:
// the odontogram control panel (selection actions, Statuses/Tooth/Ortho/
// Caries/Fillings/Root-periodontium cards). STATIC card wrappers + the
// shared delegated collapse infra live here; the seven declarative card
// components (Task 3) own each card's BODY — the shared collapse behavior
// itself is engine-side (`odontogram.ts`'s single document-level delegated
// listener over `.icon-btn`/`#btnToggle*`, see `wireControls()`), so no
// Angular-side collapse logic is needed here beyond keeping the same
// ids/classes the delegated listener queries by. `OrthodonticsCardComponent`
// is the one exception — it owns its OWN `.card#orthoCard` wrapper too,
// mirroring the pin (see that component's doc comment).
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
import { CariesCardComponent } from "./cards/caries-card.component";
import { FillingsCardComponent } from "./cards/fillings-card.component";
import { OrthodonticsCardComponent } from "./cards/orthodontics-card.component";
import { RootPeriodontiumCardComponent } from "./cards/root-periodontium-card.component";
import { StatusesCardComponent } from "./cards/statuses-card.component";
import { ToothDetailsCardComponent } from "./cards/tooth-details-card.component";

@Component({
  selector: "aao-tooth-controls-surface",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StatusesCardComponent,
    ToothDetailsCardComponent,
    OrthodonticsCardComponent,
    CariesCardComponent,
    FillingsCardComponent,
    RootPeriodontiumCardComponent,
  ],
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
            <aao-statuses-card />
          </section>
        </div>

        <section class="card">
          <div class="card-title card-title-row">
            <span>{{ i18n.t('tooth.title') }}</span>
            <button id="btnResetTooth" class="btn btn-ghost btn-sm" [attr.title]="i18n.t('tooth.resetTitle')" [attr.aria-label]="i18n.t('tooth.resetTitle')" (click)="resetTooth()">{{ i18n.t('tooth.reset') }}</button>
          </div>
          <aao-tooth-details-card />
        </section>

        <!-- No wrapper div here (unlike statusCard): OrthodonticsCardComponent
             renders #orthoCard as the FIRST (and only) element in its own
             template, so [class.hidden] is bound directly on the
             aao-orthodontics-card host tag from this usage site — Angular
             always interposes a real host element for a component (unlike
             React, which adds none), so putting the class here keeps
             #orthoCard's parentElement carrying the same .hidden toggle the
             pin's wrapper div did, for odontogram-shell.component.spec.ts's
             "keeps statusCard/orthoCard MOUNTED" assertion. -->
        <aao-orthodontics-card [class.hidden]="!ui.showOrthoCard()" />

        <section id="cariesSection" class="card">
          <div class="card-title card-title-row">
            <span>{{ i18n.t('caries.title') }}</span>
            <button id="btnToggleCariesCard" class="icon-btn" [attr.title]="i18n.t('actions.collapse', { label: i18n.t('caries.title') })" [attr.aria-label]="i18n.t('actions.collapse', { label: i18n.t('caries.title') })">
              <span class="toggle-icon" aria-hidden="true">&minus;</span>
            </button>
          </div>
          <aao-caries-card />
        </section>

        <section id="fillingSection" class="card">
          <div class="card-title card-title-row">
            <span>{{ i18n.t('filling.title') }}</span>
            <button id="btnToggleFillingCard" class="icon-btn" [attr.title]="i18n.t('actions.collapse', { label: i18n.t('filling.title') })" [attr.aria-label]="i18n.t('actions.collapse', { label: i18n.t('filling.title') })">
              <span class="toggle-icon" aria-hidden="true">&minus;</span>
            </button>
          </div>
          <aao-fillings-card />
        </section>

        <section id="rootPeriodontiumSection" class="card">
          <div class="card-title card-title-row">
            <span>{{ i18n.t('card.rootPeriodontium') }}</span>
            <button id="btnToggleRootPeriodontiumCard" class="icon-btn" [attr.title]="i18n.t('actions.collapse', { label: i18n.t('card.rootPeriodontium') })" [attr.aria-label]="i18n.t('actions.collapse', { label: i18n.t('card.rootPeriodontium') })">
              <span class="toggle-icon" aria-hidden="true">&minus;</span>
            </button>
          </div>
          <aao-root-periodontium-card />
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
