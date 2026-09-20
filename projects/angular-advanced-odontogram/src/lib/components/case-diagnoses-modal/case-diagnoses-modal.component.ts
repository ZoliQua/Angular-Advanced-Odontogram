// Angular port of $ENGINE@215c43a:src/CaseDiagnosesModal.tsx (166 lines).
//
// v2.6.0 resync, Task 3 — the "Case / regional diagnoses" pop-up. Moved out
// of the perio-status sidebar (`PerioSidebar.tsx`) into its own dialog,
// opened from the "Diagnoses" button beside the Odontogram/Periodontal-status
// view toggle (`#openCaseDiagnosesBtn`, `OdontogramShellComponent`'s own
// `.perio-launch-bar`, per the pinned `App.tsx` diff — NOT PerioSidebar
// itself; PerioSidebar's own pinned delta is just the `EMPTY_CASE_META`
// shape fix (Task 1) plus a comment noting the move). Mirrors
// `CreditsModalComponent`'s dialog contract exactly: `role="dialog"` +
// `aria-modal`, Escape closes, backdrop-mousedown-on-self closes, focus is
// trapped while open and returned to the opener on close (the shared
// `dialog-focus.ts` helpers) — no new a11y pattern introduced.
//
// Owns its own `caseConds` signal + a single `onStateChange` subscription
// that only runs WHILE OPEN (an `effect()` gated on `open()`, cleaned up via
// `onCleanup` when the dialog closes or the component is destroyed) — like
// `PerioSidebar` did before this move, and like the pinned TSX's own
// `useEffect(() => { if (!open) return; ...; return onStateChange(...); },
// [open])`: no engine reads (`getCaseConditions`/`onStateChange`) happen
// while the dialog is closed, so a host that mounts this modal closed never
// touches those setters. `readOnly` folds into the SAME refresh (read fresh
// on every notify while open) rather than its own signal — same rationale as
// `PerioSidebarComponent`'s own `readOnly` field (see that file's header
// comment): `getReadOnly()`/`setReadOnly()` have no dedicated "changed"
// notification of their own to hook, so this mirrors the TSX's "read fresh
// at render time" by re-reading it alongside the other state on every
// `onStateChange` notify.
//
// Force-value note: `#caseDxAddSelect` uses `[aaoForceValue]` for the exact
// same reason `#dxAddSelect` (DiagnosesCardComponent) does — see that file's
// header comment. The per-row laterality `<select>` (bound to
// `c.laterality`) does NOT: `setCaseCondition` is explicitly "Case-level (not
// DS-1 gated)" (state/caseMeta.ts's own doc comment) — there is no
// dual-state-confirm cancel/revert path that could leave the engine's stored
// laterality unchanged while a native `<select>`'s own DOM value already
// drifted, so a plain `[value]` binding is sufficient (matches every
// perioViewMode-shaped select in SettingsModalComponent, which is in the same
// "plain module flag, no revert path" category).
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { I18nService } from "../../i18n/i18n.service";
import { focusFirst, nextDialogTitleId, trapTabKey } from "../shared/dialog-focus";
import {
  getCaseConditions,
  getReadOnly,
  onStateChange,
  setCaseCondition,
} from "../../core/odontogram";
import { CASE_DX_CODES, type CaseConditionKey, type Laterality } from "../../core/dx/caseCodes";
import { ForceValueDirective } from "../surfaces/cards/force-value.directive";

type CaseConditionsData = ReturnType<typeof getCaseConditions>;

const LATERALITY_OPTIONS: readonly Laterality[] = ["unspecified", "left", "right", "bilateral"];

@Component({
  selector: "aao-case-diagnoses-modal",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ForceValueDirective],
  template: `
    @if (open()) {
      <div class="odon-confirm-backdrop" (mousedown)="onBackdropMouseDown($event)">
        <div
          id="caseDiagnosesModal"
          #dialog
          class="odon-credits-modal odon-casedx-modal"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          tabindex="-1"
          (keydown)="onKeyDown($event)"
        >
          <button
            type="button"
            class="odon-settings-close"
            (click)="close.emit()"
            [attr.aria-label]="i18n.t('case.diagnoses.close')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>

          <h2 class="odon-credits-title" [id]="titleId">{{ i18n.t('case.diagnoses.section') }}</h2>

          <div id="caseDiagnosesSection" class="case-diagnoses odon-casedx-body">
            @for (c of caseConds(); track c.key) {
              <div class="case-diagnoses-row dx-row">
                <span class="dx-name">
                  @if (c.icd10) {
                    <span class="dx-code">{{ c.icd10 }}</span>
                  }
                  <span class="dx-label">{{ i18n.t('dx.case.' + c.key) }}</span>
                </span>
                @if (c.lateralizable) {
                  <select
                    [value]="c.laterality"
                    [disabled]="readOnly()"
                    (change)="onLateralityChange(c.key, $event)"
                  >
                    @for (l of lateralityOptions; track l) {
                      <option [value]="l">{{ i18n.t('caseDx.laterality.' + l) }}</option>
                    }
                  </select>
                }
                <button
                  type="button"
                  class="btn btn-ghost btn-icon btn-danger dx-delete case-dx-remove"
                  [disabled]="readOnly()"
                  [attr.aria-label]="i18n.t('case.diagnoses.remove')"
                  [attr.title]="i18n.t('case.diagnoses.remove')"
                  (click)="setCaseCondition(c.key, null)"
                >&times;</button>
              </div>
            }
            <select
              id="caseDxAddSelect"
              [aaoForceValue]="addSelectValue"
              [disabled]="readOnly()"
              (change)="onAddSelectChange($event)"
            >
              <option value="">{{ i18n.t('case.diagnoses.add') }}</option>
              @for (o of addable(); track o.key) {
                <option [value]="o.key">{{ o.icd10 ? o.icd10 + ' ' + i18n.t('dx.case.' + o.key) : i18n.t('dx.case.' + o.key) }}</option>
              }
            </select>
          </div>
        </div>
      </div>
    }
  `,
})
export class CaseDiagnosesModalComponent {
  readonly open = input.required<boolean>();
  readonly close = output<void>();

  protected readonly i18n = inject(I18nService);
  protected readonly titleId = nextDialogTitleId("caseDiagnosesTitle");
  protected readonly lateralityOptions = LATERALITY_OPTIONS;
  protected readonly setCaseCondition = setCaseCondition;

  protected readonly caseConds = signal<CaseConditionsData>([]);
  protected readonly readOnly = signal(false);
  protected readonly addable = () => {
    const present = new Set(this.caseConds().map((c) => c.key));
    return (Object.keys(CASE_DX_CODES) as CaseConditionKey[])
      .filter((k) => !present.has(k))
      .map((k) => ({ key: k, icd10: CASE_DX_CODES[k].icd10 }))
      .sort((a, b) => a.icd10.localeCompare(b.icd10));
  };

  // Constant thunk for the add-select's `[aaoForceValue]` — see the file
  // header comment; reads `caseConds()` so the directive's `afterRenderEffect`
  // re-subscribes/reruns on every engine notify while open.
  protected readonly addSelectValue = (): string => {
    this.caseConds();
    return "";
  };

  private readonly dialogRef = viewChild<ElementRef<HTMLElement>>("dialog");
  private openerEl: HTMLElement | null = null;

  constructor() {
    // Subscribe only while open — see file header comment (mirrors
    // CaseDiagnosesModal.tsx's `useEffect(..., [open])`).
    effect((onCleanup) => {
      if (!this.open()) return;
      const refresh = () => {
        this.caseConds.set(getCaseConditions());
        this.readOnly.set(getReadOnly());
      };
      refresh();
      onCleanup(onStateChange(refresh));
    });

    // Focus handling — mirrors CreditsModalComponent's identical effect.
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
    if (e.target === e.currentTarget) this.close.emit();
  }

  protected onKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.stopPropagation();
      this.close.emit();
      return;
    }
    if (e.key !== "Tab") return;
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) return;
    trapTabKey(dialog, e);
  }

  protected onLateralityChange(key: string, e: Event): void {
    setCaseCondition(key, (e.target as HTMLSelectElement).value as Laterality);
  }

  protected onAddSelectChange(e: Event): void {
    const key = (e.target as HTMLSelectElement).value;
    if (key) setCaseCondition(key, "unspecified");
  }
}
