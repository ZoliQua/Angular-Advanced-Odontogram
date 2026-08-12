// Angular port of $ENGINE@934a911:src/surfaces/cards/ToothDetailsCard.tsx (302 lines).
//
// Composable-UI Tier 3, PR 3f — the declarative Tooth-details card BODY (the
// HARDEST card). Replaces the former imperative `wireControls()` Tooth-details
// block + its (largest) `syncControlsFromState()` counterpart: it subscribes to
// engine state (`engineState(getActiveToothDetails)`) and renders ALL rows as
// controlled inputs with identical ids/markup —
//
//   the base picker (#toothSelect, options folding the MILKTOOTH_BLOCKED disable),
//   the substrate select (#substrateSelect), the extraction-wound / missing-closed
//   checkboxes, the combined restoration dropdown (#restorationSelect, whose
//   per-tooth options are already encoded `${type}|${material}` / `prosthesis|…`
//   by the getter and decoded+applied by `setRestorationForSelection`), the
//   crown-leakage / broken-crown / contact-point checkboxes, the wear block
//   (#bruxismRow → #wearEdgeRow/#wearCervicalRow) with the detail-level
//   select-vs-toggle swap, the discoloration row with the same swap, the crown
//   actions (#crownActionsRow: #bridgePillarRow + #extractionPlanRow) and the
//   crown-replace / crown-needed checkboxes.
//
// writing through the `set*ForSelection` setters — which wrap the exact
// `applyToSelected(...)` closures the imperative handlers used (incl. the
// base-picker `defaultState()` reset + `setEdentulous(false)` side-effects and
// the restoration `${type}|${material}` decode), so behavior is identical.
//
// Row visibility + label variants + the wear/discoloration select-vs-toggle swap
// come pre-resolved from `getActiveToothDetails()`. The genuine DOM-reparenting
// quirk — the imperative code moves #extractionPlanRow among #brokenCrownRow /
// #bruxismRow / #crownActionsRow depending on state — is resolved by the getter
// to a single `extractionPlanParent` id; the card renders exactly ONE instance of
// #extractionPlanRow (an Angular-ism: three `@if`-gated copies of the same
// markup, one per possible parent, instead of the pin's single JSX fragment
// reused via a variable — Angular templates can't carry a render fragment
// through a plain TS value the way JSX can), so only one is ever in the DOM,
// keeping the shell-DOM golden byte-identical.
//
// The `.card` wrapper, `.card-title`, and the `#btnResetTooth` action button stay
// STATIC in `ToothControlsSurface` (its `(click)` calls `resetTooth()`); this
// card only owns the body.
//
// Every `[value]`/`[checked]` control in this card (T5 CONTROLLER-ADDED
// scope, from the T3 review's "latent-memoization audit" finding) uses the
// shared `[aaoForceValue]`/`[aaoForceChecked]` directives instead of plain
// property bindings — see `force-value.directive.ts`'s file header. Every
// `set*ForSelection` setter here routes through `applyToSelected()` ->
// `gateToothEditBatch()`, whose dual-state-confirm CANCEL path can leave a
// native control's already-mutated DOM value/checked state stale because the
// underlying engine value never changed (the deferred `apply` never ran).
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { I18nService } from "../../../i18n/i18n.service";
import { ForceCheckedDirective, ForceValueDirective } from "./force-value.directive";
import {
  getActiveToothDetails,
  setBridgePillarForSelection,
  setBrokenDistalForSelection,
  setBrokenIncisalForSelection,
  setBrokenMesialForSelection,
  setContactDistalForSelection,
  setContactMesialForSelection,
  setCrownLeakageForSelection,
  setCrownNeededForSelection,
  setCrownReplaceForSelection,
  setDiscolorationForSelection,
  setDiscolorationToggleForSelection,
  setExtractionPlanForSelection,
  setExtractionWoundForSelection,
  setMissingClosedForSelection,
  setRestorationForSelection,
  setSubstrateForSelection,
  setToothSelectionForSelection,
  setWearCervicalForSelection,
  setWearCervicalToggleForSelection,
  setWearEdgeForSelection,
  setWearEdgeToggleForSelection,
} from "../../../core/odontogram";
import { engineState } from "../../engine-state";

@Component({
  selector: "aao-tooth-details-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ForceValueDirective, ForceCheckedDirective],
  template: `
    <div class="row">
      <span>{{ i18n.t('tooth.baseLabel') }}</span>
      <select id="toothSelect" [aaoForceValue]="toothSelectValue" (change)="onToothSelectionChange($event)">
        @for (o of td().toothSelectOptions; track o.value) {
          <option [value]="o.value" [disabled]="o.disabled ?? false">{{ o.label }}</option>
        }
      </select>
    </div>
    <div id="substrateRow" [class]="td().substrateRowVisible ? 'row' : 'row hidden'">
      <span>{{ i18n.t('substrate.label') }}</span>
      <select id="substrateSelect" [aaoForceValue]="substrateValue" (change)="onSubstrateChange($event)">
        @for (o of td().substrateOptions; track o.value) {
          <option [value]="o.value">{{ o.label }}</option>
        }
      </select>
    </div>
    <label id="extractionRow" [class]="td().extractionRowVisible ? 'row' : 'row hidden'">
      <input type="checkbox" id="extractionWound" [aaoForceChecked]="extractionWoundChecked" (change)="onExtractionWoundChange($event)" />
      <span>{{ i18n.t('tooth.extractionWound') }}</span>
    </label>
    <label id="missingClosedRow" [class]="td().missingClosedRowVisible ? 'row' : 'row hidden'">
      <input type="checkbox" id="missingClosed" [aaoForceChecked]="missingClosedChecked" (change)="onMissingClosedChange($event)" />
      <span>{{ i18n.t('tooth.missingClosed') }}</span>
    </label>
    <div id="restorationRow" [class]="td().restorationRowVisible ? 'row' : 'row hidden'">
      <span>{{ i18n.t('restoration.label') }}</span>
      <select id="restorationSelect" [aaoForceValue]="restorationValue" (change)="onRestorationChange($event)">
        @for (o of td().restorationOptions; track o.value) {
          <option [value]="o.value">{{ o.label }}</option>
        }
      </select>
    </div>
    <label id="crownLeakageRow" [class]="td().crownLeakageRowVisible ? 'row' : 'row hidden'">
      <input type="checkbox" id="crownLeakage" [aaoForceChecked]="crownLeakageChecked" (change)="onCrownLeakageChange($event)" />
      <span>{{ i18n.t('crownLeakage.label') }}</span>
    </label>
    <div id="brokenCrownRow" [class]="td().brokenCrownRowVisible ? 'row inline-checks contact-row' : 'row inline-checks contact-row hidden'">
      <label>
        <input type="checkbox" id="brokenMesial" [aaoForceChecked]="brokenMesialChecked" (change)="onBrokenMesialChange($event)" />
        <span>{{ i18n.t('tooth.broken.mesial') }}</span>
      </label>
      <label>
        <input type="checkbox" id="brokenIncisal" [aaoForceChecked]="brokenIncisalChecked" (change)="onBrokenIncisalChange($event)" />
        <span>{{ i18n.t('tooth.broken.incisal') }}</span>
      </label>
      <label>
        <input type="checkbox" id="brokenDistal" [aaoForceChecked]="brokenDistalChecked" (change)="onBrokenDistalChange($event)" />
        <span>{{ i18n.t('tooth.broken.distal') }}</span>
      </label>
      @if (td().extractionPlanParent === 'brokenCrownRow') {
        <label id="extractionPlanRow" [class]="td().extractionPlanRowVisible ? 'inline-check' : 'inline-check hidden'">
          <input type="checkbox" id="extractionPlan" [aaoForceChecked]="extractionPlanChecked" (change)="onExtractionPlanChange($event)" />
          <span>{{ i18n.t('tooth.extractionPlan') }}</span>
        </label>
      }
    </div>
    <div id="contactPointRow" [class]="td().contactPointRowVisible ? 'row inline-checks contact-row' : 'row inline-checks contact-row hidden'">
      <label>
        <input type="checkbox" id="contactMesial" [aaoForceChecked]="contactMesialChecked" (change)="onContactMesialChange($event)" />
        <span>{{ i18n.t('tooth.contact.mesialMissing') }}</span>
      </label>
      <label>
        <input type="checkbox" id="contactDistal" [aaoForceChecked]="contactDistalChecked" (change)="onContactDistalChange($event)" />
        <span>{{ i18n.t('tooth.contact.distalMissing') }}</span>
      </label>
    </div>
    <div id="bruxismRow" [class]="td().bruxismRowVisible ? 'inline-checks bruxism-row wear-stack' : 'inline-checks bruxism-row wear-stack hidden'">
      <div id="wearEdgeRow" class="row">
        <label id="wearEdgeSelectLabel" [class]="td().wearSimple ? 'hidden' : null">
          <span>{{ i18n.t('tooth.bruxism.edgeWear') }}</span>
          <select id="wearEdgeSelect" [aaoForceValue]="wearEdgeValue" (change)="onWearEdgeChange($event)">
            @for (o of td().wearEdgeOptions; track o.value) {
              <option [value]="o.value">{{ o.label }}</option>
            }
          </select>
        </label>
        <label id="wearEdgeToggleLabel" [class]="td().wearSimple ? 'inline-check' : 'inline-check hidden'">
          <input type="checkbox" id="wearEdgeToggle" [aaoForceChecked]="wearEdgeToggleChecked" (change)="onWearEdgeToggleChange($event)" />
          <span>{{ i18n.t('tooth.bruxism.edgeWear') }}</span>
        </label>
      </div>
      <div id="wearCervicalRow" class="row">
        <label id="wearCervicalSelectLabel" [class]="td().wearSimple ? 'hidden' : null">
          <span>{{ i18n.t('tooth.bruxism.neckWear') }}</span>
          <select id="wearCervicalSelect" [aaoForceValue]="wearCervicalValue" (change)="onWearCervicalChange($event)">
            @for (o of td().wearCervicalOptions; track o.value) {
              <option [value]="o.value">{{ o.label }}</option>
            }
          </select>
        </label>
        <label id="wearCervicalToggleLabel" [class]="td().wearSimple ? 'inline-check' : 'inline-check hidden'">
          <input type="checkbox" id="wearCervicalToggle" [aaoForceChecked]="wearCervicalToggleChecked" (change)="onWearCervicalToggleChange($event)" />
          <span>{{ i18n.t('tooth.bruxism.neckWear') }}</span>
        </label>
      </div>
      @if (td().extractionPlanParent === 'bruxismRow') {
        <label id="extractionPlanRow" [class]="td().extractionPlanRowVisible ? 'inline-check' : 'inline-check hidden'">
          <input type="checkbox" id="extractionPlan" [aaoForceChecked]="extractionPlanChecked" (change)="onExtractionPlanChange($event)" />
          <span>{{ i18n.t('tooth.extractionPlan') }}</span>
        </label>
      }
    </div>
    <div id="discolorationRow" [class]="td().discolorationRowVisible ? 'row inline-checks' : 'row inline-checks hidden'">
      <label id="discolorationSelectLabel" [class]="td().discoSimple ? 'hidden' : null">
        <span>{{ i18n.t('discoloration.label') }}</span>
        <select id="discolorationSelect" [aaoForceValue]="discolorationValue" (change)="onDiscolorationChange($event)">
          @for (o of td().discolorationOptions; track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </label>
      <label id="discolorationToggleLabel" [class]="td().discoSimple ? 'inline-check' : 'inline-check hidden'">
        <input type="checkbox" id="discolorationToggle" [aaoForceChecked]="discolorationToggleChecked" (change)="onDiscolorationToggleChange($event)" />
        <span>{{ i18n.t('discoloration.label') }}</span>
      </label>
    </div>
    <div id="crownActionsRow" [class]="td().crownActionsRowVisible ? 'row inline-checks bridge-actions-row' : 'row inline-checks bridge-actions-row hidden'">
      <label id="bridgePillarRow" [class]="td().bridgePillarRowVisible ? 'inline-check' : 'inline-check hidden'">
        <input type="checkbox" id="bridgePillar" [aaoForceChecked]="bridgePillarChecked" (change)="onBridgePillarChange($event)" />
        <span>{{ i18n.t('tooth.bridgePillar') }}</span>
      </label>
      @if (td().extractionPlanParent === 'crownActionsRow') {
        <label id="extractionPlanRow" [class]="td().extractionPlanRowVisible ? 'inline-check' : 'inline-check hidden'">
          <input type="checkbox" id="extractionPlan" [aaoForceChecked]="extractionPlanChecked" (change)="onExtractionPlanChange($event)" />
          <span>{{ i18n.t('tooth.extractionPlan') }}</span>
        </label>
      }
    </div>
    <label id="crownReplaceRow" [class]="td().crownReplaceRowVisible ? 'row' : 'row hidden'">
      <input type="checkbox" id="crownReplace" [aaoForceChecked]="crownReplaceChecked" (change)="onCrownReplaceChange($event)" />
      <span>{{ i18n.t('tooth.crownReplace') }}</span>
    </label>
    <label id="crownNeededRow" [class]="td().crownNeededRowVisible ? 'row' : 'row hidden'">
      <input type="checkbox" id="crownNeeded" [aaoForceChecked]="crownNeededChecked" (change)="onCrownNeededChange($event)" />
      <span>{{ i18n.t('tooth.crownNeeded') }}</span>
    </label>
  `,
})
export class ToothDetailsCardComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly td = engineState(getActiveToothDetails);

  // Thunks for the `[aaoForceValue]`/`[aaoForceChecked]` directives (see
  // `force-value.directive.ts`'s header) — stable bound methods; correctness
  // comes from `this.td()` being read inside the directive's own `effect()`,
  // not from these closures' identity.
  protected readonly toothSelectValue = () => this.td().toothSelectValue;
  protected readonly substrateValue = () => this.td().substrateValue;
  protected readonly extractionWoundChecked = () => this.td().extractionWoundChecked;
  protected readonly missingClosedChecked = () => this.td().missingClosedChecked;
  protected readonly restorationValue = () => this.td().restorationValue;
  protected readonly crownLeakageChecked = () => this.td().crownLeakageChecked;
  protected readonly brokenMesialChecked = () => this.td().brokenMesialChecked;
  protected readonly brokenIncisalChecked = () => this.td().brokenIncisalChecked;
  protected readonly brokenDistalChecked = () => this.td().brokenDistalChecked;
  protected readonly extractionPlanChecked = () => this.td().extractionPlanChecked;
  protected readonly contactMesialChecked = () => this.td().contactMesialChecked;
  protected readonly contactDistalChecked = () => this.td().contactDistalChecked;
  protected readonly wearEdgeValue = () => this.td().wearEdgeValue;
  protected readonly wearEdgeToggleChecked = () => this.td().wearEdgeToggleChecked;
  protected readonly wearCervicalValue = () => this.td().wearCervicalValue;
  protected readonly wearCervicalToggleChecked = () => this.td().wearCervicalToggleChecked;
  protected readonly discolorationValue = () => this.td().discolorationValue;
  protected readonly discolorationToggleChecked = () => this.td().discolorationToggleChecked;
  protected readonly bridgePillarChecked = () => this.td().bridgePillarChecked;
  protected readonly crownReplaceChecked = () => this.td().crownReplaceChecked;
  protected readonly crownNeededChecked = () => this.td().crownNeededChecked;

  protected onToothSelectionChange(e: Event): void {
    setToothSelectionForSelection((e.target as HTMLSelectElement).value);
  }

  protected onSubstrateChange(e: Event): void {
    setSubstrateForSelection((e.target as HTMLSelectElement).value);
  }

  protected onExtractionWoundChange(e: Event): void {
    setExtractionWoundForSelection((e.target as HTMLInputElement).checked);
  }

  protected onMissingClosedChange(e: Event): void {
    setMissingClosedForSelection((e.target as HTMLInputElement).checked);
  }

  protected onRestorationChange(e: Event): void {
    setRestorationForSelection((e.target as HTMLSelectElement).value);
  }

  protected onCrownLeakageChange(e: Event): void {
    setCrownLeakageForSelection((e.target as HTMLInputElement).checked);
  }

  protected onBrokenMesialChange(e: Event): void {
    setBrokenMesialForSelection((e.target as HTMLInputElement).checked);
  }

  protected onBrokenIncisalChange(e: Event): void {
    setBrokenIncisalForSelection((e.target as HTMLInputElement).checked);
  }

  protected onBrokenDistalChange(e: Event): void {
    setBrokenDistalForSelection((e.target as HTMLInputElement).checked);
  }

  protected onContactMesialChange(e: Event): void {
    setContactMesialForSelection((e.target as HTMLInputElement).checked);
  }

  protected onContactDistalChange(e: Event): void {
    setContactDistalForSelection((e.target as HTMLInputElement).checked);
  }

  protected onWearEdgeChange(e: Event): void {
    setWearEdgeForSelection((e.target as HTMLSelectElement).value);
  }

  protected onWearEdgeToggleChange(e: Event): void {
    setWearEdgeToggleForSelection((e.target as HTMLInputElement).checked);
  }

  protected onWearCervicalChange(e: Event): void {
    setWearCervicalForSelection((e.target as HTMLSelectElement).value);
  }

  protected onWearCervicalToggleChange(e: Event): void {
    setWearCervicalToggleForSelection((e.target as HTMLInputElement).checked);
  }

  protected onDiscolorationChange(e: Event): void {
    setDiscolorationForSelection((e.target as HTMLSelectElement).value);
  }

  protected onDiscolorationToggleChange(e: Event): void {
    setDiscolorationToggleForSelection((e.target as HTMLInputElement).checked);
  }

  protected onBridgePillarChange(e: Event): void {
    setBridgePillarForSelection((e.target as HTMLInputElement).checked);
  }

  protected onExtractionPlanChange(e: Event): void {
    setExtractionPlanForSelection((e.target as HTMLInputElement).checked);
  }

  protected onCrownReplaceChange(e: Event): void {
    setCrownReplaceForSelection((e.target as HTMLInputElement).checked);
  }

  protected onCrownNeededChange(e: Event): void {
    setCrownNeededForSelection((e.target as HTMLInputElement).checked);
  }
}
