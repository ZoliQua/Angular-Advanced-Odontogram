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
// Angular-ism (`#mobilitySelect` only): every other select here uses a plain
// `[value]` property binding, but `#mobilitySelect` is the ONE control the
// dual-state-confirm CANCEL path (`cancelDualStateConfirm()` →
// `revertActiveControls()` → `notifyStateChange()`) has to snap back with no
// underlying MODEL change — cancelling a deferred edit means the mutation
// (`s.mobility = value`) never actually ran, so `getActiveRootPerio().mobilityValue`
// is the SAME string before and after. React's controlled `<select value=…>`
// re-asserts the DOM value on every commit regardless of prop equality
// (exactly why "controlled inputs" fix native desync); Angular's `[value]`
// property binding does the opposite — it SKIPS the DOM write when the bound
// expression is `===` its previous value, so the browser's own (unrelated)
// mutation of `.value` — which is what a user's still-pending native `<select>`
// pick looks like while the confirm is open — would never be corrected back on
// cancel. Forcing the write imperatively inside the same `effect()` that
// already reruns on every `rp()` notify (see CariesCard's identical
// `useLayoutEffect`-style rationale) sidesteps Angular's memoization the same
// way React's reconciler does for this one control.
import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, viewChild } from "@angular/core";
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

@Component({
  selector: "aao-root-periodontium-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="rpRootBlock" [class]="rp().rootBlockVisible ? null : 'hidden'">
      <div class="hint">{{ i18n.t('endo.hint') }}</div>
      <div id="pulpEndoRow" class="row">
        <span>{{ i18n.t('pulpEndo.label') }}</span>
        <select id="pulpEndoSelect" [value]="rp().pulpEndoValue" [disabled]="rp().pulpEndoDisabled" (change)="onPulpEndoChange($event)">
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
        <select id="apicalDxSelect" [value]="rp().apicalDxValue" [disabled]="rp().apicalDxDisabled" (change)="onApicalDxChange($event)">
          @for (o of rp().apicalDxOptions; track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </div>
      <div id="periapicalTypeRow" [class]="rp().periapicalRowVisible ? 'row' : 'row hidden'">
        <span>{{ i18n.t('periapical.typeLabel') }}</span>
        <select id="periapicalTypeSelect" [value]="rp().periapicalTypeValue" (change)="onPeriapicalTypeChange($event)">
          @for (o of rp().periapicalTypeOptions; track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </div>
      <div id="resorptionRow" [class]="rp().resorptionRowVisible ? 'row' : 'row hidden'">
        <span>{{ i18n.t('root.resorption') }}</span>
        <select id="resorptionSelect" [value]="rp().resorptionValue" [disabled]="rp().resorptionDisabled" (change)="onResorptionChange($event)">
          @for (o of rp().resorptionOptions; track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </div>
      <div class="row inline-checks">
        <label [style.display]="rp().endoResectionDisabled ? 'none' : null">
          <input type="checkbox" id="endoResection" [checked]="rp().endoResectionChecked" [disabled]="rp().endoResectionDisabled" (change)="onEndoResectionChange($event)" />
          <span>{{ i18n.t('endo.resection') }}</span>
        </label>
        <label [style.display]="rp().parapulpalPinDisabled ? 'none' : null">
          <input type="checkbox" id="parapulpalPin" [checked]="rp().parapulpalPinChecked" [disabled]="rp().parapulpalPinDisabled" (change)="onParapulpalPinChange($event)" />
          <span>{{ i18n.t('endo.parapulpalPin') }}</span>
        </label>
      </div>
    </div>

    <div id="rpPerioBlock" [class]="rp().perioBlockVisible ? null : 'hidden'">
      <div id="mobilityRow" [class]="rp().mobilityRowVisible ? 'row' : 'row hidden'">
        <span>{{ i18n.t('inflammation.mobilityLabel') }}</span>
        <select id="mobilitySelect" #mobilitySelect [disabled]="rp().mobilityDisabled" (change)="onMobilityChange($event)">
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
            <input type="checkbox" [id]="'chk-' + m.value" [value]="m.value" [checked]="m.checked" [disabled]="m.disabled" (change)="onModChange(m.value, $event)" />
            <span [id]="'lbl-' + m.value">{{ m.label }}</span>
          </label>
        }
      </div>
      <div id="calculusRow" [class]="rp().calculusRowVisible ? 'row inline-checks' : 'row inline-checks hidden'">
        <label>
          <input type="checkbox" id="calculusToggle" [checked]="rp().calculusChecked" (change)="onCalculusChange($event)" />
          <span>{{ i18n.t('calculus.label') }}</span>
        </label>
      </div>
      <div id="periImplantRow" [class]="rp().periImplantRowVisible ? 'row' : 'row hidden'">
        <span>{{ i18n.t('periImplant.label') }}</span>
        <select id="periImplantSelect" [value]="rp().periImplantValue" (change)="onPeriImplantChange($event)">
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
  private readonly mobilitySelectRef = viewChild<ElementRef<HTMLSelectElement>>("mobilitySelect");
  protected readonly rp = engineState(getActiveRootPerio);

  constructor() {
    // Mirrors the pin's `useLayoutEffect(() => {...})` (no dep array — reruns
    // on every render) — see CariesCardComponent's identical constructor note.
    effect(() => {
      const visible = this.rp().sectionVisible;
      this.elRef.nativeElement.closest("#rootPeriodontiumSection")?.classList.toggle("hidden", !visible);
    });

    // Force-write #mobilitySelect's DOM value on every notify — see the
    // file-level "Angular-ism" doc comment above for why a plain `[value]`
    // binding isn't enough for this one control.
    effect(() => {
      const value = this.rp().mobilityValue;
      const el = this.mobilitySelectRef()?.nativeElement;
      if (el) el.value = value;
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
