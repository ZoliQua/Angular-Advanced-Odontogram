// Angular port of $ENGINE@934a911:src/surfaces/cards/OrthodonticsCard.tsx (91 lines).
//
// Composable-UI Tier 3 — the declarative `#orthoCard`. Replaces the former
// imperative `wireControls()`/`syncControlsFromState()` `#orthoCard` block: it
// subscribes to engine state (`engineState(getActiveOrtho)`), renders the three
// ortho selects + the rotation toggle from the shared option getters as
// controlled inputs, and writes through the `setOrtho*ForSelection` setters —
// which wrap the exact same `applyToSelected(...)` closures the imperative
// handlers used, so behavior is identical. Same DOM ids/classes/markup as the
// static shell (so id-based tests and host CSS keep resolving); it is hidden via
// the same class-based hide the sync used (`getActiveOrtho().visible`), keeping
// `#orthoCard` in the DOM either way.
//
// Unlike the other five control cards, this one owns its OWN `<section
// id="orthoCard">` wrapper (incl. the `.card`/`.card-title` markup) — mirroring
// the pin exactly, where `ToothControlsSurface` mounts `<OrthodonticsCard/>`
// directly inside the `showOrthoCard`-gated wrapper `<div>` rather than
// providing a static `.card` shell around it (there is no
// `#btnToggleOrthoCard` collapse toggle either — the pin's own markup omits
// one). `ToothControlsSurfaceComponent` binds `[class.hidden]="!ui.showOrthoCard()"`
// directly on this component's OWN `<aao-orthodontics-card>` host tag rather
// than wrapping it in a separate `<div>` (Angular always interposes a real
// host element for a component, unlike React, so the host tag itself already
// plays that wrapper's role — see that surface's inline comment); this card's
// own `hidden` class on `#orthoCard` (driven by `ortho.visible`) is independent
// of that outer gate.
import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { I18nService } from "../../../i18n/i18n.service";
import {
  getActiveOrtho,
  getOrthoApplianceOptions,
  getOrthoDriftOptions,
  getOrthoVerticalOptions,
  setOrthoApplianceForSelection,
  setOrthoDriftForSelection,
  setOrthoRotationForSelection,
  setOrthoVerticalForSelection,
} from "../../../core/odontogram";
import { engineState } from "../../engine-state";
import { ForceCheckedDirective, ForceValueDirective } from "./force-value.directive";

@Component({
  selector: "aao-orthodontics-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ForceValueDirective, ForceCheckedDirective],
  template: `
    <section id="orthoCard" [class]="hidden() ? 'card hidden' : 'card'">
      <div class="card-title card-title-row">
        <span>{{ i18n.t('toothInfo.orthodontics') }}</span>
      </div>
      <div id="orthoApplianceRow" class="row">
        <span>{{ i18n.t('ortho.appliance.label') }}</span>
        <select id="orthoApplianceSelect" [aaoForceValue]="appliance" (change)="onApplianceChange($event)">
          @for (o of applianceOptions(); track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </div>
      <div id="orthoDriftRow" class="row">
        <span>{{ i18n.t('ortho.drift.label') }}</span>
        <select id="orthoDriftSelect" [aaoForceValue]="drift" (change)="onDriftChange($event)">
          @for (o of driftOptions(); track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </div>
      <div id="orthoVerticalRow" class="row">
        <span>{{ i18n.t('ortho.vertical.label') }}</span>
        <select id="orthoVerticalSelect" [aaoForceValue]="vertical" (change)="onVerticalChange($event)">
          @for (o of verticalOptions(); track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </div>
      <label id="orthoRotationRow" class="row inline-check">
        <input type="checkbox" id="orthoRotationToggle" [aaoForceChecked]="rotation" (change)="onRotationChange($event)" />
        <span>{{ i18n.t('ortho.rotation.label') }}</span>
      </label>
    </section>
  `,
})
export class OrthodonticsCardComponent {
  protected readonly i18n = inject(I18nService);
  private readonly ortho = engineState(getActiveOrtho);

  protected readonly hidden = computed(() => {
    const o = this.ortho();
    return o ? !o.visible : false;
  });
  // Thunks for the `[aaoForceValue]`/`[aaoForceChecked]` directives — see
  // `force-value.directive.ts`'s header and `ToothDetailsCardComponent`'s
  // identical rationale note.
  protected readonly appliance = () => this.ortho()?.appliance ?? "none";
  protected readonly drift = () => this.ortho()?.drift ?? "none";
  protected readonly vertical = () => this.ortho()?.vertical ?? "none";
  protected readonly rotation = () => this.ortho()?.rotation ?? false;

  protected applianceOptions(): { value: string; label: string }[] {
    return getOrthoApplianceOptions();
  }

  protected driftOptions(): { value: string; label: string }[] {
    return getOrthoDriftOptions();
  }

  protected verticalOptions(): { value: string; label: string }[] {
    return getOrthoVerticalOptions();
  }

  protected onApplianceChange(e: Event): void {
    setOrthoApplianceForSelection((e.target as HTMLSelectElement).value);
  }

  protected onDriftChange(e: Event): void {
    setOrthoDriftForSelection((e.target as HTMLSelectElement).value);
  }

  protected onVerticalChange(e: Event): void {
    setOrthoVerticalForSelection((e.target as HTMLSelectElement).value);
  }

  protected onRotationChange(e: Event): void {
    setOrthoRotationForSelection((e.target as HTMLInputElement).checked);
  }
}
