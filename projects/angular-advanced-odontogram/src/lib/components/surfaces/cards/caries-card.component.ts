// Angular port of $ENGINE@934a911:src/surfaces/cards/CariesCard.tsx (129 lines).
//
// Composable-UI Tier 3, PR 3c — the declarative Caries card BODY. Replaces the
// former imperative `wireControls()` caries block + its `syncControlsFromState()`
// counterpart: it subscribes to engine state (`engineState(getActiveCaries)`),
// renders the depth select, the 5-cell surface cross (via the shared
// `<aao-surface-cross>`), the subcrown row, and the root-caries select as
// controlled inputs, and writes through the `setCaries*ForSelection` setters —
// which wrap the exact `applyToSelected(...)` closures the imperative handlers
// used, so behavior is identical. The per-surface `.surf-depth` severity
// indicator keeps the SAME markup (`data-depth`/`data-icdas`/`data-radio` +
// badge-or-bars) the imperative `syncSurfaceDepthIndicator()` produced; clicking
// it opens the existing (still-imperative) severity popup via
// `openCariesDepthPopup()`.
//
// The `#rootCariesSelect` shows the NON-collapsing `rootCariesDisplayValue`
// (folded into the getter) — never written back to state. Row visibility
// (`#cariesDepthRow`/`#rootCariesRow`) comes from the getter's flags. The
// `.card#cariesSection` wrapper, `.card-title`, and `#btnToggleCariesCard`
// collapse toggle stay STATIC in `ToothControlsSurface` (collapse is shared
// delegated infra); this card only owns the body — and it drives the section's
// `hidden` visibility gate (`cariesSectionVisible`) via an `effect()` over this
// component's own host element (Angular's equivalent of the pin's
// `useLayoutEffect` + `hintRef.current?.closest("#cariesSection")`: the host
// custom element itself sits directly inside the static `<section
// id="cariesSection">`, so `closest()` from the host finds the same ancestor).
import { ChangeDetectionStrategy, Component, ElementRef, effect, inject } from "@angular/core";
import { I18nService } from "../../../i18n/i18n.service";
import {
  getActiveCaries,
  getCariesDepthOptions,
  getReadOnly,
  openCariesDepthPopup,
  rootCariesOptions,
  setCariesActiveDepthForSelection,
  setCariesSurfaceForSelection,
  setRootCariesForSelection,
} from "../../../core/odontogram";
import { engineState } from "../../engine-state";
import { ForceCheckedDirective, ForceValueDirective } from "./force-value.directive";
import { SurfaceCell, SurfaceCrossComponent } from "./surface-cross.component";

@Component({
  selector: "aao-caries-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SurfaceCrossComponent, ForceValueDirective, ForceCheckedDirective],
  template: `
    <div class="hint">{{ i18n.t('caries.hint') }}</div>
    <div id="cariesDepthRow" [class]="caries().cariesDepthVisible ? 'row' : 'row hidden'">
      <span>{{ i18n.t('caries.depthLabel') }}</span>
      <select id="cariesDepthSelect" [aaoForceValue]="activeDepthValue" (change)="onDepthChange($event)">
        @for (o of depthOptions(); track o.value) {
          <option [value]="o.value" [attr.title]="o.title ?? null">{{ o.label }}</option>
        }
      </select>
    </div>
    <div id="cariesChecks">
      <aao-surface-cross [cells]="cells()" />
    </div>
    <div id="cariesSubcrownRow" class="check-grid subcrown-row">
      <label [style.display]="caries().subcrownDisabled ? 'none' : null">
        <input
          type="checkbox"
          id="chk-caries-subcrown"
          value="caries-subcrown"
          [aaoForceChecked]="subcrownChecked"
          [disabled]="caries().subcrownDisabled"
          (change)="onSubcrownChange($event)"
        />
        <span id="lbl-caries-subcrown">{{ caries().subcrownLabel }}</span>
      </label>
    </div>
    <div id="rootCariesRow" [class]="caries().rootCariesVisible ? 'row' : 'row hidden'">
      <span>{{ i18n.t('caries.rootLabel') }}</span>
      <select id="rootCariesSelect" [aaoForceValue]="rootCariesDisplay" (change)="onRootCariesChange($event)">
        @for (o of rootOptions(); track o.value) {
          <option [value]="o.value">{{ o.label }}</option>
        }
      </select>
    </div>
  `,
})
export class CariesCardComponent {
  protected readonly i18n = inject(I18nService);
  private readonly elRef = inject(ElementRef<HTMLElement>);
  protected readonly caries = engineState(getActiveCaries);

  // Thunks for the `[aaoForceValue]`/`[aaoForceChecked]` directives — see
  // `force-value.directive.ts`'s header and `ToothDetailsCardComponent`'s
  // identical rationale note.
  protected readonly activeDepthValue = () => String(this.caries().cariesActiveDepth);
  protected readonly subcrownChecked = () => this.caries().subcrownChecked;
  protected readonly rootCariesDisplay = () => this.caries().rootCariesDisplay;

  constructor() {
    // Mirrors the pin's `useLayoutEffect(() => {...})` (no dep array — reruns
    // on every render): apply #cariesSection's `hidden` class from this host
    // element's closest ancestor whenever the caries snapshot is refreshed.
    effect(() => {
      const visible = this.caries().cariesSectionVisible;
      this.elRef.nativeElement.closest("#cariesSection")?.classList.toggle("hidden", !visible);
    });
  }

  protected depthOptions(): { value: number; label: string; title?: string }[] {
    return getCariesDepthOptions();
  }

  protected rootOptions(): { value: string; label: string }[] {
    return rootCariesOptions();
  }

  protected cells(): SurfaceCell[] {
    return this.caries().surfaces.map((s) => ({
      value: s.value,
      pos: s.pos,
      letter: s.letter,
      label: s.label,
      labelId: `lbl-${s.value}`,
      checked: s.checked,
      disabled: s.disabled,
      onToggle: (checked: boolean) => setCariesSurfaceForSelection(s.value, checked),
      indicators: [
        {
          key: "surf-depth",
          className: s.isIcdas ? "surf-depth icdas" : "surf-depth",
          title: this.i18n.t("caries.detailsHint"),
          side: "right" as const,
          dataDepth: s.depth,
          dataIcdas: String(s.icdas),
          dataRadio: s.radio ?? undefined,
          content: s.isIcdas ? { kind: "badge" as const, text: String(s.icdas) } : { kind: "bars" as const, count: 3 },
          onClick: (anchor: HTMLElement) => {
            // Same guard the imperative indicator handler used.
            if (!s.checked || getReadOnly()) return;
            openCariesDepthPopup(s.surface, anchor);
          },
        },
      ],
    }));
  }

  protected onDepthChange(e: Event): void {
    setCariesActiveDepthForSelection(Number((e.target as HTMLSelectElement).value));
  }

  protected onSubcrownChange(e: Event): void {
    setCariesSurfaceForSelection("caries-subcrown", (e.target as HTMLInputElement).checked);
  }

  protected onRootCariesChange(e: Event): void {
    setRootCariesForSelection((e.target as HTMLSelectElement).value);
  }
}
