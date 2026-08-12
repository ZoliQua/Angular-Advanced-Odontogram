// Angular port of $ENGINE@934a911:src/surfaces/cards/RootPeriodontiumCard.tsx (223 lines).
//
// Composable-UI Tier 3, PR 3e — the declarative Root / periodontium card BODY.
// Replaces the former imperative `wireControls()` Root/perio block + its
// `syncControlsFromState()` counterpart: it subscribes to engine state
// (`engineState(getActiveRootPerio)`) and renders BOTH sub-blocks as controlled
// inputs —
//
//   #rpRootBlock: the merged pulp/endo optgroup select (`#pulpEndoSelect`, whose
//     two `<optgroup>`s + Plan-mode standalone "none" mirror `buildPulpEndoSelect`
//     exactly), the apical-diagnosis / periapical-lesion / root-resorption
//     selects, and the resection + parapulpal-pin checkboxes.
//   #rpPerioBlock: the mobility select (this is the control DS-1's
//     `ds1-confirm-revert.spec.ts` red depends on — binding it to
//     `rp().mobilityValue` off `engineState` means a `revertActiveControls()`
//     call's `notifyStateChange()` snaps the rendered `<select>` back
//     automatically, no imperative re-sync needed), the still-imperative 6-site
//     probing grid (`#perioGrid` + `#perioReadout` — the Tier 3 PR 3e
//     CARVE-OUT, rendered as static empty containers and populated by
//     `buildPerioGrid`/`syncPerioRow` in the engine), the inflammation/
//     parodontal mod checkboxes (`#modsChecks`, same ids/markup the removed
//     `buildChecks(MOD_OPTIONS)` emitted), the calculus toggle, and the
//     peri-implant status select.
//
// writing through the `set*ForSelection` setters — which wrap the exact
// `applyToSelected(...)` closures the imperative handlers used (incl. the
// pulp/endo endo↔pulpDx mutual exclusion and the apical→periapical reset), so
// behavior is identical.
//
// ALL row/sub-block visibility, the ordering-dependent mod-checkbox visibility
// (`syncInflammationModVisibility` after `syncPeriImplantVisibility`), the
// dynamic `#lbl-parodontal`/`#lbl-inflammation` label text, and every
// per-control `disabled` flag come pre-resolved from `getActiveRootPerio()`.
//
// The `.card#rootPeriodontiumSection` wrapper, `.card-title`, and
// `#btnToggleRootPeriodontiumCard` collapse toggle stay STATIC in
// `ToothControlsSurface`; this card only owns the body — and it drives the
// section's `hidden` visibility gate (`sectionVisible`) via an `effect()` over
// this component's own host element (mirrors CariesCard/FillingsCard's
// identical technique).
//
// Every `[value]`/`[checked]` control in this card (T5 CONTROLLER-ADDED
// scope, from the T3 review's "latent-memoization audit" finding) uses the
// shared `[aaoForceValue]`/`[aaoForceChecked]` directives instead of plain
// property bindings — see `force-value.directive.ts`'s file header for why:
// every `set*ForSelection` setter here routes through `applyToSelected()` ->
// `gateToothEditBatch()`, whose dual-state-confirm CANCEL path can leave a
// native control's already-mutated DOM value/checked state stale because the
// underlying engine value never changed (the deferred `apply` never ran).
// `#mobilitySelect` — the one control DS-1's `ds1-confirm-revert.spec.ts` red
// depended on — previously carried a one-off `effect()` + `viewChild`
// force-write for exactly this; it now uses the same shared directive as
// every other control in the card.
import { ChangeDetectionStrategy, Component, ElementRef, effect, inject } from "@angular/core";
import { I18nService } from "../../../i18n/i18n.service";
import {
  getActiveRootPerio,
  setApicalDxForSelection,
  setCalculusForSelection,
  setEndoResectionForSelection,
  setMobilityForSelection,
  setModForSelection,
  setParapulpalPinForSelection,
  setPeriapicalTypeForSelection,
  setPeriImplantForSelection,
  setPulpEndoForSelection,
  setResorptionForSelection,
} from "../../../core/odontogram";
import { engineState } from "../../engine-state";
import { ForceCheckedDirective, ForceValueDirective } from "./force-value.directive";

@Component({
  selector: "aao-root-periodontium-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ForceValueDirective, ForceCheckedDirective],
  template: `
    <div id="rpRootBlock" [class]="rp().rootBlockVisible ? null : 'hidden'">
      <div class="hint">{{ i18n.t('endo.hint') }}</div>
      <div id="pulpEndoRow" class="row">
        <span>{{ i18n.t('pulpEndo.label') }}</span>
        <select id="pulpEndoSelect" [aaoForceValue]="pulpEndoValue" [disabled]="rp().pulpEndoDisabled" (change)="onPulpEndoChange($event)">
          @if (rp().pulpEndoNoneOption; as none) {
            <option [value]="none.value">{{ none.label }}</option>
          }
          @for (g of rp().pulpEndoGroups; track g.label) {
            <optgroup [label]="g.label">
              @for (o of g.options; track o.value) {
                <option [value]="o.value">{{ o.label }}</option>
              }
            </optgroup>
          }
        </select>
      </div>
      <div id="apicalDxRow" [class]="rp().apicalDxRowVisible ? 'row' : 'row hidden'">
        <span>{{ i18n.t('apical.dxLabel') }}</span>
        <select id="apicalDxSelect" [aaoForceValue]="apicalDxValue" [disabled]="rp().apicalDxDisabled" (change)="onApicalDxChange($event)">
          @for (o of rp().apicalDxOptions; track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </div>
      <div id="periapicalTypeRow" [class]="rp().periapicalRowVisible ? 'row' : 'row hidden'">
        <span>{{ i18n.t('periapical.typeLabel') }}</span>
        <select id="periapicalTypeSelect" [aaoForceValue]="periapicalTypeValue" (change)="onPeriapicalTypeChange($event)">
          @for (o of rp().periapicalTypeOptions; track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </div>
      <div id="resorptionRow" [class]="rp().resorptionRowVisible ? 'row' : 'row hidden'">
        <span>{{ i18n.t('root.resorption') }}</span>
        <select id="resorptionSelect" [aaoForceValue]="resorptionValue" [disabled]="rp().resorptionDisabled" (change)="onResorptionChange($event)">
          @for (o of rp().resorptionOptions; track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </div>
      <div class="row inline-checks">
        <label [style.display]="rp().endoResectionDisabled ? 'none' : null">
          <input type="checkbox" id="endoResection" [aaoForceChecked]="endoResectionChecked" [disabled]="rp().endoResectionDisabled" (change)="onEndoResectionChange($event)" />
          <span>{{ i18n.t('endo.resection') }}</span>
        </label>
        <label [style.display]="rp().parapulpalPinDisabled ? 'none' : null">
          <input type="checkbox" id="parapulpalPin" [aaoForceChecked]="parapulpalPinChecked" [disabled]="rp().parapulpalPinDisabled" (change)="onParapulpalPinChange($event)" />
          <span>{{ i18n.t('endo.parapulpalPin') }}</span>
        </label>
      </div>
    </div>

    <div id="rpPerioBlock" [class]="rp().perioBlockVisible ? null : 'hidden'">
      <div id="mobilityRow" [class]="rp().mobilityRowVisible ? 'row' : 'row hidden'">
        <span>{{ i18n.t('inflammation.mobilityLabel') }}</span>
        <select id="mobilitySelect" [aaoForceValue]="mobilityValue" [disabled]="rp().mobilityDisabled" (change)="onMobilityChange($event)">
          @for (o of rp().mobilityOptions; track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </div>
      <!-- The 6-site PD/GM/BOP/SUP probing grid + its derived read-out stay
           IMPERATIVE (Tier 3 PR 3e carve-out): rendered as static empty
           containers here, built by buildPerioGrid and synced by
           syncPerioRow in the engine — exactly as before. -->
      <div id="perioRow" [class]="rp().perioRowVisible ? 'perio-block' : 'perio-block hidden'">
        <div class="perio-block-title">{{ i18n.t('perio.title') }}</div>
        <div id="perioGrid" class="perio-grid"></div>
        <div id="perioReadout" class="hint perio-readout"></div>
      </div>
      <div id="modsChecks" class="check-grid">
        @for (m of rp().mods; track m.value) {
          <label [class]="m.hiddenClass ? 'hidden' : null" [style.display]="m.styleHidden ? 'none' : null">
            <input type="checkbox" [id]="'chk-' + m.value" [value]="m.value" [aaoForceChecked]="modChecked(m.value)" [disabled]="m.disabled" (change)="onModChange(m.value, $event)" />
            <span [id]="'lbl-' + m.value">{{ m.label }}</span>
          </label>
        }
      </div>
      <div id="calculusRow" [class]="rp().calculusRowVisible ? 'row inline-checks' : 'row inline-checks hidden'">
        <label>
          <input type="checkbox" id="calculusToggle" [aaoForceChecked]="calculusChecked" (change)="onCalculusChange($event)" />
          <span>{{ i18n.t('calculus.label') }}</span>
        </label>
      </div>
      <div id="periImplantRow" [class]="rp().periImplantRowVisible ? 'row' : 'row hidden'">
        <span>{{ i18n.t('periImplant.label') }}</span>
        <select id="periImplantSelect" [aaoForceValue]="periImplantValue" (change)="onPeriImplantChange($event)">
          @for (o of rp().periImplantOptions; track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </div>
    </div>
  `,
})
export class RootPeriodontiumCardComponent {
  protected readonly i18n = inject(I18nService);
  private readonly elRef = inject(ElementRef<HTMLElement>);
  protected readonly rp = engineState(getActiveRootPerio);

  // Thunks for the `[aaoForceValue]`/`[aaoForceChecked]` directives — stable
  // bound methods (arrow-function class fields); see
  // `force-value.directive.ts`'s header for why a STABLE thunk reference
  // works fine (correctness comes from `this.rp()` being read inside the
  // directive's own `effect()`, not from the thunk's identity changing).
  protected readonly pulpEndoValue = () => this.rp().pulpEndoValue;
  protected readonly apicalDxValue = () => this.rp().apicalDxValue;
  protected readonly periapicalTypeValue = () => this.rp().periapicalTypeValue;
  protected readonly resorptionValue = () => this.rp().resorptionValue;
  protected readonly endoResectionChecked = () => this.rp().endoResectionChecked;
  protected readonly parapulpalPinChecked = () => this.rp().parapulpalPinChecked;
  protected readonly mobilityValue = () => this.rp().mobilityValue;
  protected readonly calculusChecked = () => this.rp().calculusChecked;
  protected readonly periImplantValue = () => this.rp().periImplantValue;

  protected modChecked(value: string): () => boolean {
    return () => this.rp().mods.find((m) => m.value === value)?.checked ?? false;
  }

  constructor() {
    // Mirrors the pin's `useLayoutEffect(() => {...})` (no dep array — reruns
    // on every render) — see CariesCardComponent's identical constructor note.
    effect(() => {
      const visible = this.rp().sectionVisible;
      this.elRef.nativeElement.closest("#rootPeriodontiumSection")?.classList.toggle("hidden", !visible);
    });
  }

  protected onPulpEndoChange(e: Event): void {
    setPulpEndoForSelection((e.target as HTMLSelectElement).value);
  }

  protected onApicalDxChange(e: Event): void {
    setApicalDxForSelection((e.target as HTMLSelectElement).value);
  }

  protected onPeriapicalTypeChange(e: Event): void {
    setPeriapicalTypeForSelection((e.target as HTMLSelectElement).value);
  }

  protected onResorptionChange(e: Event): void {
    setResorptionForSelection((e.target as HTMLSelectElement).value);
  }

  protected onEndoResectionChange(e: Event): void {
    setEndoResectionForSelection((e.target as HTMLInputElement).checked);
  }

  protected onParapulpalPinChange(e: Event): void {
    setParapulpalPinForSelection((e.target as HTMLInputElement).checked);
  }

  protected onMobilityChange(e: Event): void {
    setMobilityForSelection((e.target as HTMLSelectElement).value);
  }

  protected onModChange(value: string, e: Event): void {
    setModForSelection(value, (e.target as HTMLInputElement).checked);
  }

  protected onCalculusChange(e: Event): void {
    setCalculusForSelection((e.target as HTMLInputElement).checked);
  }

  protected onPeriImplantChange(e: Event): void {
    setPeriImplantForSelection((e.target as HTMLSelectElement).value);
  }
}
