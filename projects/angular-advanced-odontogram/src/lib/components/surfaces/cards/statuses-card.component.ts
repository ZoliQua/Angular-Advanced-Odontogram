// Angular port of $ENGINE@934a911:src/surfaces/cards/StatusesCard.tsx (68 lines).
//
// Composable-UI Tier 3, PR 3b — the declarative Statuses card BODY. Replaces the
// former imperative `wireControls()` Statuses block: the whole-mouth action
// buttons (#btnResetAll / #btnPrimaryDentition / #btnMixedDentition) call the
// engine wrappers directly, #btnEdentulous is a toggle whose `aria-pressed`
// comes from `engineState(getEdentulous)` (every engine path that flips
// `edentulous` fires `notifyStateChange()`, so this re-renders — replacing the
// six scattered `setToggleButton($("#btnEdentulous"), …)` imperative syncs), and
// the status-extra row renders its options from `getStatusExtras()` and applies
// the selected preset via `applyStatusExtra()`. The selected preset id is
// TRANSIENT local UI state (not tooth state), a local `signal` mirroring the
// pin's own `useState`. The `.card#statusCard` wrapper, `.card-title`, and the
// `#btnToggleStatusCard` collapse toggle stay STATIC in `ToothControlsSurface`
// (collapse is shared delegated infra, orthogonal to this card). Same DOM
// ids/classes/markup as the static shell.
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { I18nService } from "../../../i18n/i18n.service";
import {
  applyMixedDentition,
  applyPrimaryDentition,
  applyStatusExtra,
  getEdentulous,
  getStatusExtras,
  resetMouth,
  setEdentulous,
} from "../../../core/odontogram";
import { engineState } from "../../engine-state";

@Component({
  selector: "aao-statuses-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row status-actions" id="statusCardBody">
      <button id="btnResetAll" class="btn btn-ghost btn-sm" (click)="resetMouth()">{{ i18n.t('status.resetAll') }}</button>
      <button id="btnPrimaryDentition" class="btn btn-ghost btn-sm" (click)="applyPrimaryDentition()">{{ i18n.t('status.primaryDentition') }}</button>
      <button id="btnMixedDentition" class="btn btn-ghost btn-sm" (click)="applyMixedDentition()">{{ i18n.t('status.mixedDentition') }}</button>
      <button
        id="btnEdentulous"
        class="btn btn-toggle btn-sm"
        [attr.aria-pressed]="edentulous()"
        (click)="toggleEdentulous()"
      >{{ i18n.t('status.edentulous') }}</button>
    </div>
    <div class="row status-extra-row">
      <span>{{ i18n.t('status.extraLabel') }}</span>
      <select id="statusExtraSelect" [value]="selected()" (change)="onSelectChange($event)">
        @for (o of options(); track o.value) {
          <option [value]="o.value">{{ o.label }}</option>
        }
      </select>
      <button id="statusExtraApply" class="btn btn-ghost btn-sm" (click)="applySelected()">{{ i18n.t('status.extraApply') }}</button>
    </div>
  `,
})
export class StatusesCardComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly edentulous = engineState(getEdentulous);
  protected readonly resetMouth = resetMouth;
  protected readonly applyPrimaryDentition = applyPrimaryDentition;
  protected readonly applyMixedDentition = applyMixedDentition;

  // Transient LOCAL selection for the status-extra dropdown — NOT tooth
  // state. Defaults to the first option, matching the pin's own `useState`
  // initializer (and the removed imperative `setSelectOptions(...,
  // statusOptions[0]?.value)` before it).
  protected readonly selected = signal<string>(this.options()[0]?.value ?? "");

  protected options(): { value: string; label: string }[] {
    return getStatusExtras().map((opt) => ({ value: opt.id, label: opt.label }));
  }

  protected toggleEdentulous(): void {
    setEdentulous(!this.edentulous());
  }

  protected onSelectChange(e: Event): void {
    this.selected.set((e.target as HTMLSelectElement).value);
  }

  protected applySelected(): void {
    const statusExtras = getStatusExtras();
    const option = statusExtras.find((o) => o.id === this.selected());
    applyStatusExtra(option);
  }
}
