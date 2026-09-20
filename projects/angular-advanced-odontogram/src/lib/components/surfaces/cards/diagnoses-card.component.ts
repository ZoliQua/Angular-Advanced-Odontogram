// Angular port of $ENGINE@215c43a:src/surfaces/cards/DiagnosesCard.tsx (125 lines).
//
// v2.6.0 resync, Task 3 — the declarative Diagnoses card BODY. Surfaces the
// active tooth's EFFECTIVE coded diagnoses (`getActiveDiagnoses`, from the
// new `dx/*` layer): one row per rule-derived key (whether or not currently
// suppressed) plus any explicitly `add`-mode key no rule derived, with an
// "add a diagnosis" picker over `addableKeys`. Follows
// `RootPeriodontiumCard`/`CariesCard` exactly — it subscribes to engine state
// via `engineState(getActiveDiagnoses)` and drives the section's `hidden`
// visibility (`#diagnosesSection`) via an `effect()` over this component's
// own host element, since the section element itself stays static in
// `ToothControlsSurface` (shared collapse infra).
//
// Each row is three explicit parts: (1) the code-first text (`{icd10} {label}`,
// falling back to the label alone when a row has no code); (2) an EXCLUDE
// toggle (derived rows only) — an eye/eye-off icon button reflecting the
// suppressed state, toggling `setDxOverrideForSelection(key, "suppress"|null)`
// (keeps the glyph, drops the finding from the FHIR export); (3) a DELETE (×)
// button calling `removeDiagnosisFromSelection(key)`, which clears the
// underlying chart axis so the diagnosis AND its glyph are removed. The add
// `<select id="dxAddSelect">` is a controlled component pinned to the empty
// placeholder (`diagnoses.add`) — its options render code-first too, and
// selecting one of `addableKeys` calls `addDiagnosisToSelection`; it snaps
// back to the placeholder on the next render.
//
// Force-value note: `#dxAddSelect` uses `[aaoForceValue]` even though its
// desired value ("") never changes across `getActiveDiagnoses()` reads — the
// literal-constant thunk still closes over `dx()` (see the thunk below) so
// the directive's `afterRenderEffect` re-runs on every engine notify, the
// SAME mechanism `force-value.directive.ts`'s header documents. Without it,
// once a user picks an addable option the native `<select>`'s own DOM
// `.value` drifts to that option (browsers mutate a `<select>`'s value on
// user interaction independent of any Angular binding) and a plain
// `[value]="''"` binding would never write again — Angular's `bindingUpdated`
// only re-writes when the EVALUATED expression changes, and a literal `""`
// never does, so the picked-but-consumed option would stay visibly selected
// forever instead of resetting to the placeholder like React's unconditional
// controlled-input reassertion. The suppress button below is NOT a native
// `[value]`/`[checked]` control (it's `[attr.aria-pressed]` + a CSS class on a
// `<button>`), so the Phase-7 rule doesn't apply to it.
import { ChangeDetectionStrategy, Component, ElementRef, effect, inject } from "@angular/core";
import { I18nService } from "../../../i18n/i18n.service";
import {
  addDiagnosisToSelection,
  getActiveDiagnoses,
  removeDiagnosisFromSelection,
  setDxOverrideForSelection,
} from "../../../core/odontogram";
import { engineState } from "../../engine-state";
import { ForceValueDirective } from "./force-value.directive";

@Component({
  selector: "aao-diagnoses-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ForceValueDirective],
  template: `
    <div id="diagnosesRows">
      @for (row of dx().rows; track row.key) {
        <div
          [id]="'dxRow-' + row.key"
          class="row dx-row"
          [attr.data-source]="row.source"
          [attr.data-suppressed]="row.suppressed ? 'true' : null"
        >
          <span class="dx-name">
            @if (row.icd10) {
              <span class="dx-code">{{ row.icd10 }}</span>
            }
            <span class="dx-label">{{ i18n.t('dx.' + row.key) }}</span>
            @if (row.source === 'added') {
              <span class="pill dx-added-tag">{{ i18n.t('diagnoses.added') }}</span>
            }
          </span>
          <span class="dx-actions">
            @if (row.source === 'derived') {
              <button
                type="button"
                [id]="'dxSuppress-' + row.key"
                [class]="'btn btn-ghost btn-icon dx-exclude' + (row.suppressed ? ' is-active' : '')"
                [attr.aria-pressed]="row.suppressed"
                [attr.aria-label]="i18n.t('diagnoses.suppress')"
                [attr.title]="row.suppressed ? i18n.t('diagnoses.includeHint') : i18n.t('diagnoses.excludeHint')"
                (click)="onSuppressClick(row.key, row.suppressed)"
              >
                @if (row.suppressed) {
                  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
                    <path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
                      d="M4 4l12 12M8.2 8.3A2.4 2.4 0 0010 12.4M6 6.1C3.4 7.4 1.5 10 1.5 10s3 5.5 8.5 5.5c1.3 0 2.5-.3 3.5-.8M9 4.6c.3 0 .6-.1 1-.1 5.5 0 8.5 5.5 8.5 5.5s-.8 1.4-2.2 2.8" />
                  </svg>
                } @else {
                  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
                    <path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
                      d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z" />
                    <circle cx="10" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6" />
                  </svg>
                }
              </button>
            }
            <button
              type="button"
              [id]="'dxRemove-' + row.key"
              class="btn btn-ghost btn-icon btn-danger dx-delete"
              [attr.aria-label]="i18n.t('diagnoses.delete')"
              [attr.title]="i18n.t('diagnoses.deleteHint')"
              (click)="onRemoveClick(row.key)"
            >&times;</button>
          </span>
        </div>
      }
    </div>
    <div id="dxAddRow" class="row">
      <select
        id="dxAddSelect"
        [aaoForceValue]="addSelectValue"
        [disabled]="dx().addableKeys.length === 0"
        (change)="onAddSelectChange($event)"
      >
        <option value="">{{ i18n.t('diagnoses.add') }}</option>
        @for (o of dx().addableKeys; track o.key) {
          <option [value]="o.key">{{ o.icd10 ? o.icd10 + ' ' + i18n.t('dx.' + o.key) : i18n.t('dx.' + o.key) }}</option>
        }
      </select>
    </div>
  `,
})
export class DiagnosesCardComponent {
  protected readonly i18n = inject(I18nService);
  private readonly elRef = inject(ElementRef<HTMLElement>);
  protected readonly dx = engineState(getActiveDiagnoses);

  // Constant thunk for the add-select's `[aaoForceValue]` — see the file
  // header comment for why a THUNK is required even though the underlying
  // value is a literal "" (the directive's `afterRenderEffect` must still
  // read a signal — `dx()` here — on every run for it to re-subscribe/rerun
  // on every engine notify).
  protected readonly addSelectValue = (): string => {
    this.dx();
    return "";
  };

  constructor() {
    // Mirrors the pin's `useLayoutEffect(() => {...})` (no dep array — reruns
    // on every render) — see CariesCardComponent's/RootPeriodontiumCardComponent's
    // identical constructor note.
    effect(() => {
      const visible = this.dx().visible;
      this.elRef.nativeElement.closest("#diagnosesSection")?.classList.toggle("hidden", !visible);
    });
  }

  protected onSuppressClick(key: string, suppressed: boolean): void {
    setDxOverrideForSelection(key, suppressed ? null : "suppress");
  }

  protected onRemoveClick(key: string): void {
    removeDiagnosisFromSelection(key);
  }

  protected onAddSelectChange(e: Event): void {
    const key = (e.target as HTMLSelectElement).value;
    if (key) addDiagnosisToSelection(key);
  }
}
