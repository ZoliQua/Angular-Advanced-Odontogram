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
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { I18nService } from "../../../i18n/i18n.service";
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
  template: `
    <div class="row">
      <span>{{ i18n.t('tooth.baseLabel') }}</span>
      <select id="toothSelect" [value]="td().toothSelectValue" (change)="onToothSelectionChange($event)">
        @for (o of td().toothSelectOptions; track o.value) {
          <option [value]="o.value" [disabled]="o.disabled ?? false">{{ o.label }}</option>
        }
      </select>
    </div>
    <div id="substrateRow" [class]="td().substrateRowVisible ? 'row' : 'row hidden'">
      <span>{{ i18n.t('substrate.label') }}</span>
      <select id="substrateSelect" [value]="td().substrateValue" (change)="onSubstrateChange($event)">
        @for (o of td().substrateOptions; track o.value) {
          <option [value]="o.value">{{ o.label }}</option>
        }
      </select>
    </div>
    <label id="extractionRow" [class]="td().extractionRowVisible ? 'row' : 'row hidden'">
      <input type="checkbox" id="extractionWound" [checked]="td().extractionWoundChecked" (change)="onExtractionWoundChange($event)" />
      <span>{{ i18n.t('tooth.extractionWound') }}</span>
    </label>
    <label id="missingClosedRow" [class]="td().missingClosedRowVisible ? 'row' : 'row hidden'">
      <input type="checkbox" id="missingClosed" [checked]="td().missingClosedChecked" (change)="onMissingClosedChange($event)" />
      <span>{{ i18n.t('tooth.missingClosed') }}</span>
    </label>
    <div id="restorationRow" [class]="td().restorationRowVisible ? 'row' : 'row hidden'">
      <span>{{ i18n.t('restoration.label') }}</span>
      <select id="restorationSelect" [value]="td().restorationValue" (change)="onRestorationChange($event)">
        @for (o of td().restorationOptions; track o.value) {
          <option [value]="o.value">{{ o.label }}</option>
        }
      </select>
    </div>
    <label id="crownLeakageRow" [class]="td().crownLeakageRowVisible ? 'row' : 'row hidden'">
      <input type="checkbox" id="crownLeakage" [checked]="td().crownLeakageChecked" (change)="onCrownLeakageChange($event)" />
      <span>{{ i18n.t('crownLeakage.label') }}</span>
    </label>
    <div id="brokenCrownRow" [class]="td().brokenCrownRowVisible ? 'row inline-checks contact-row' : 'row inline-checks contact-row hidden'">
      <label>
        <input type="checkbox" id="brokenMesial" [checked]="td().brokenMesialChecked" (change)="onBrokenMesialChange($event)" />
        <span>{{ i18n.t('tooth.broken.mesial') }}</span>
      </label>
      <label>
        <input type="checkbox" id="brokenIncisal" [checked]="td().brokenIncisalChecked" (change)="onBrokenIncisalChange($event)" />
        <span>{{ i18n.t('tooth.broken.incisal') }}</span>
      </label>
      <label>
        <input type="checkbox" id="brokenDistal" [checked]="td().brokenDistalChecked" (change)="onBrokenDistalChange($event)" />
        <span>{{ i18n.t('tooth.broken.distal') }}</span>
      </label>
      @if (td().extractionPlanParent === 'brokenCrownRow') {
        <label id="extractionPlanRow" [class]="td().extractionPlanRowVisible ? 'inline-check' : 'inline-check hidden'">
          <input type="checkbox" id="extractionPlan" [checked]="td().extractionPlanChecked" (change)="onExtractionPlanChange($event)" />
          <span>{{ i18n.t('tooth.extractionPlan') }}</span>
        </label>
      }
    </div>
    <div id="contactPointRow" [class]="td().contactPointRowVisible ? 'row inline-checks contact-row' : 'row inline-checks contact-row hidden'">
      <label>
        <input type="checkbox" id="contactMesial" [checked]="td().contactMesialChecked" (change)="onContactMesialChange($event)" />
        <span>{{ i18n.t('tooth.contact.mesialMissing') }}</span>
      </label>
      <label>
        <input type="checkbox" id="contactDistal" [checked]="td().contactDistalChecked" (change)="onContactDistalChange($event)" />
        <span>{{ i18n.t('tooth.contact.distalMissing') }}</span>
      </label>
    </div>
    <div id="bruxismRow" [class]="td().bruxismRowVisible ? 'inline-checks bruxism-row wear-stack' : 'inline-checks bruxism-row wear-stack hidden'">
      <div id="wearEdgeRow" class="row">
        <label id="wearEdgeSelectLabel" [class]="td().wearSimple ? 'hidden' : null">
          <span>{{ i18n.t('tooth.bruxism.edgeWear') }}</span>
          <select id="wearEdgeSelect" [value]="td().wearEdgeValue" (change)="onWearEdgeChange($event)">
            @for (o of td().wearEdgeOptions; track o.value) {
              <option [value]="o.value">{{ o.label }}</option>
            }
          </select>
        </label>
        <label id="wearEdgeToggleLabel" [class]="td().wearSimple ? 'inline-check' : 'inline-check hidden'">
          <input type="checkbox" id="wearEdgeToggle" [checked]="td().wearEdgeToggleChecked" (change)="onWearEdgeToggleChange($event)" />
          <span>{{ i18n.t('tooth.bruxism.edgeWear') }}</span>
        </label>
      </div>
      <div id="wearCervicalRow" class="row">
        <label id="wearCervicalSelectLabel" [class]="td().wearSimple ? 'hidden' : null">
          <span>{{ i18n.t('tooth.bruxism.neckWear') }}</span>
          <select id="wearCervicalSelect" [value]="td().wearCervicalValue" (change)="onWearCervicalChange($event)">
            @for (o of td().wearCervicalOptions; track o.value) {
              <option [value]="o.value">{{ o.label }}</option>
            }
          </select>
        </label>
        <label id="wearCervicalToggleLabel" [class]="td().wearSimple ? 'inline-check' : 'inline-check hidden'">
          <input type="checkbox" id="wearCervicalToggle" [checked]="td().wearCervicalToggleChecked" (change)="onWearCervicalToggleChange($event)" />
          <span>{{ i18n.t('tooth.bruxism.neckWear') }}</span>
        </label>
      </div>
      @if (td().extractionPlanParent === 'bruxismRow') {
        <label id="extractionPlanRow" [class]="td().extractionPlanRowVisible ? 'inline-check' : 'inline-check hidden'">
          <input type="checkbox" id="extractionPlan" [checked]="td().extractionPlanChecked" (change)="onExtractionPlanChange($event)" />
          <span>{{ i18n.t('tooth.extractionPlan') }}</span>
        </label>
      }
    </div>
    <div id="discolorationRow" [class]="td().discolorationRowVisible ? 'row inline-checks' : 'row inline-checks hidden'">
      <label id="discolorationSelectLabel" [class]="td().discoSimple ? 'hidden' : null">
        <span>{{ i18n.t('discoloration.label') }}</span>
        <select id="discolorationSelect" [value]="td().discolorationValue" (change)="onDiscolorationChange($event)">
          @for (o of td().discolorationOptions; track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </label>
      <label id="discolorationToggleLabel" [class]="td().discoSimple ? 'inline-check' : 'inline-check hidden'">
        <input type="checkbox" id="discolorationToggle" [checked]="td().discolorationToggleChecked" (change)="onDiscolorationToggleChange($event)" />
        <span>{{ i18n.t('discoloration.label') }}</span>
      </label>
    </div>
    <div id="crownActionsRow" [class]="td().crownActionsRowVisible ? 'row inline-checks bridge-actions-row' : 'row inline-checks bridge-actions-row hidden'">
      <label id="bridgePillarRow" [class]="td().bridgePillarRowVisible ? 'inline-check' : 'inline-check hidden'">
        <input type="checkbox" id="bridgePillar" [checked]="td().bridgePillarChecked" (change)="onBridgePillarChange($event)" />
        <span>{{ i18n.t('tooth.bridgePillar') }}</span>
      </label>
      @if (td().extractionPlanParent === 'crownActionsRow') {
        <label id="extractionPlanRow" [class]="td().extractionPlanRowVisible ? 'inline-check' : 'inline-check hidden'">
          <input type="checkbox" id="extractionPlan" [checked]="td().extractionPlanChecked" (change)="onExtractionPlanChange($event)" />
          <span>{{ i18n.t('tooth.extractionPlan') }}</span>
        </label>
      }
    </div>
    <label id="crownReplaceRow" [class]="td().crownReplaceRowVisible ? 'row' : 'row hidden'">
      <input type="checkbox" id="crownReplace" [checked]="td().crownReplaceChecked" (change)="onCrownReplaceChange($event)" />
      <span>{{ i18n.t('tooth.crownReplace') }}</span>
    </label>
    <label id="crownNeededRow" [class]="td().crownNeededRowVisible ? 'row' : 'row hidden'">
      <input type="checkbox" id="crownNeeded" [checked]="td().crownNeededChecked" (change)="onCrownNeededChange($event)" />
      <span>{{ i18n.t('tooth.crownNeeded') }}</span>
    </label>
  `,
})
export class ToothDetailsCardComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly td = engineState(getActiveToothDetails);

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
