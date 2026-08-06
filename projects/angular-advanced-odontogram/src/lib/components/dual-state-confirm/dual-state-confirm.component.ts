// Angular port of $ENGINE/src/DualStateConfirm.tsx.
//
// DS-1 Task 2: blocking confirm dialog shown BEFORE a status-mode edit is
// applied to a tooth the user has already planned (which would make the
// status chart diverge from the plan). Mirrors SettingsModal's/
// ExportOptionsModal's dialog contract (`.odon-confirm-*` classes shared with
// those dialogs, see engine/src/index.css):
//
// - `role="dialog"` + `aria-modal`, labelled by its message; root id
//   `#dualStateConfirm`.
// - Esc cancels; backdrop click cancels; focus is trapped inside while open
//   and returned to the opener element on close.
// - Accept applies the divergent edit, cancel reverts the control. Both
//   labels + the message come through I18nService's `t()`.
//
// The dialog owns no state — accept/cancel are driven entirely by the
// consumer (the shell's deferred apply/revert), mirroring the React
// component's `onAccept`/`onCancel` callback props.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import { I18nService } from "../../i18n/i18n.service";
import { focusFirst, nextDialogTitleId, trapTabKey } from "../shared/dialog-focus";

@Component({
  selector: "aao-dual-state-confirm",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="odon-confirm-backdrop" (mousedown)="onBackdropMouseDown($event)">
        <div
          id="dualStateConfirm"
          #dialog
          class="odon-confirm-modal"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          tabindex="-1"
          (keydown)="onKeyDown($event)"
        >
          <p class="odon-confirm-message" [id]="titleId">
            {{ i18n.t("dualState.confirmPlannedStatusEdit") }}
          </p>
          <div class="odon-confirm-actions">
            <button
              type="button"
              class="odon-confirm-btn odon-confirm-cancel"
              (click)="cancel.emit()"
            >
              {{ i18n.t("dualState.cancel") }}
            </button>
            <button
              type="button"
              class="odon-confirm-btn odon-confirm-accept"
              (click)="accept.emit()"
            >
              {{ i18n.t("dualState.accept") }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DualStateConfirmComponent {
  readonly open = input.required<boolean>();
  readonly accept = output<void>();
  readonly cancel = output<void>();

  protected readonly i18n = inject(I18nService);
  protected readonly titleId = nextDialogTitleId("dualStateConfirmTitle");

  private readonly dialogRef = viewChild<ElementRef<HTMLElement>>("dialog");
  private openerEl: HTMLElement | null = null;

  constructor() {
    // Mirrors the React effect at DualStateConfirm.tsx lines 45-54: capture
    // the opener + move focus into the dialog when it opens; the cleanup
    // (invoked on close, i.e. before the next run with open=false, and on
    // destroy) restores focus to the opener.
    effect((onCleanup) => {
      const isOpen = this.open();
      const dialog = this.dialogRef()?.nativeElement;
      if (!isOpen || !dialog) return;

      this.openerEl = (document.activeElement as HTMLElement | null) ?? null;
      focusFirst(dialog);

      onCleanup(() => {
        this.openerEl?.focus?.();
      });
    });
  }

  protected onBackdropMouseDown(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.cancel.emit();
  }

  protected onKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.stopPropagation();
      this.cancel.emit();
      return;
    }
    if (e.key !== "Tab") return;
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) return;
    trapTabKey(dialog, e);
  }
}
