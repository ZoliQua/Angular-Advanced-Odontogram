// Angular port of $ENGINE@934a911:src/surfaces/cards/FillingsCard.tsx (169 lines).
//
// Composable-UI Tier 3, PR 3d — the declarative Fillings card BODY. Replaces the
// former imperative `wireControls()` fillings block + its
// `syncControlsFromState()` counterpart: it subscribes to engine state
// (`engineState(getActiveFillings)`), renders the material select, the 5-cell
// surface cross (via the shared `<aao-surface-cross>`) with its TWO per-cell
// indicators — a RIGHT-side `.surf-depth` recurrent-caries affordance and a
// LEFT-side `.surf-defect` structural-defect affordance — the simple/complex
// swap (`#fillingSimpleRow`/`#fillingSimpleDefectRow` instead of the grid when
// `fillingComplexity === "simple"`), the fissure-sealing toggle, and the two
// whole-selection summary lines, all as controlled inputs, and writes through
// the `setFilling*ForSelection`/`setFissureSealingForSelection` setters — which
// wrap the exact `applyToSelected(...)` closures the imperative handlers used,
// so behavior is identical.
//
// The `.surf-depth` indicator keeps the SAME markup
// `syncFillingSubcariesIndicator()` produced (neutral 3-bar affordance, or the
// CARS `.has-subcaries` badge/bars when the filled surface also carries caries);
// clicking it opens the shared (still-imperative) caries-depth popup via
// `openCariesDepthPopup()`. The `.surf-defect` indicator keeps the markup
// `syncFillingDefectIndicator()` produced (a single `<i>` bar, `.has-defect` +
// `data-defect` when set); clicking it opens the filling-defect popup via
// `openFillingDefectPopup()`, gated on the `fillingDefectEnabled` setting.
//
// The `.card#fillingSection` wrapper, `.card-title`, and `#btnToggleFillingCard`
// collapse toggle stay STATIC in `ToothControlsSurface`; this card only owns the
// body — and it drives the section's `hidden` visibility gate
// (`fillingSectionVisible`) via an `effect()` over this component's own host
// element (mirrors CariesCard's identical technique).
import { ChangeDetectionStrategy, Component, ElementRef, effect, inject } from "@angular/core";
import { I18nService } from "../../../i18n/i18n.service";
import {
  getActiveFillings,
  getFillingDefectEnabled,
  getReadOnly,
  openCariesDepthPopup,
  openFillingDefectPopup,
  setFillingMaterialForSelection,
  setFillingSimpleDefectForSelection,
  setFillingSimpleToggleForSelection,
  setFillingSurfaceForSelection,
  setFissureSealingForSelection,
} from "../../../core/odontogram";
import { engineState } from "../../engine-state";
import { ForceCheckedDirective, ForceValueDirective } from "./force-value.directive";
import { SurfaceCell, SurfaceCrossComponent } from "./surface-cross.component";

@Component({
  selector: "aao-fillings-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SurfaceCrossComponent, ForceValueDirective, ForceCheckedDirective],
  template: `
    <div class="row">
      <span>{{ i18n.t('filling.typeLabel') }}</span>
      <select id="fillingSelect" [aaoForceValue]="fillingMaterial" (change)="onMaterialChange($event)">
        @for (o of fillings().fillingOptions; track o.value) {
          <option [value]="o.value">{{ o.label }}</option>
        }
      </select>
    </div>
    <div id="fillingSurfaceChecks" [class]="surfaceChecksClass()">
      <aao-surface-cross [cells]="cells()" />
    </div>
    <!-- "simple" complexity: one filled/not-filled toggle shown
         instead of the 5-surface grid (wired in odontogram.ts). It
         is a .row LABEL (the whole pill is clickable — the native
         checkbox is display:none), like #fissureSealingRow. -->
    <label id="fillingSimpleRow" [class]="fillings().simpleRowVisible ? 'row fissure-row' : 'row fissure-row hidden'">
      <input type="checkbox" id="fillingSimpleToggle" [aaoForceChecked]="simpleToggleChecked" (change)="onSimpleToggleChange($event)" />
      <span>{{ i18n.t('filling.simpleToggle') }}</span>
    </label>
    <!-- When the filling-defect feature is on, a defect select
         applies a defect to ALL filled surfaces (simple mode has no
         per-surface cells). -->
    <div id="fillingSimpleDefectRow" [class]="fillings().simpleDefectRowVisible ? 'row' : 'row hidden'">
      <span>{{ i18n.t('fillingDefect.label') }}</span>
      <select id="fillingSimpleDefectSelect" [aaoForceValue]="simpleDefectValue" (change)="onSimpleDefectChange($event)">
        @for (o of fillings().simpleDefectOptions; track o.value) {
          <option [value]="o.value">{{ o.label }}</option>
        }
      </select>
    </div>
    <label id="fissureSealingRow" [class]="fillings().fissureRowVisible ? 'row fissure-row' : 'row fissure-row hidden'">
      <input type="checkbox" id="fissureSealing" [aaoForceChecked]="fissureSealingChecked" (change)="onFissureSealingChange($event)" />
      <span>{{ i18n.t('filling.fissureSealing') }}</span>
    </label>
    <div id="fillingSubcariesSummary" [class]="fillings().subcariesSummary ? 'hint' : 'hint hidden'">{{ fillings().subcariesSummary }}</div>
    <div id="fillingDefectSummary" [class]="fillings().defectSummary ? 'hint' : 'hint hidden'">{{ fillings().defectSummary }}</div>
  `,
})
export class FillingsCardComponent {
  protected readonly i18n = inject(I18nService);
  private readonly elRef = inject(ElementRef<HTMLElement>);
  protected readonly fillings = engineState(getActiveFillings);

  // Thunks for the `[aaoForceValue]`/`[aaoForceChecked]` directives — see
  // `force-value.directive.ts`'s header and `ToothDetailsCardComponent`'s
  // identical rationale note.
  protected readonly fillingMaterial = () => this.fillings().fillingMaterial;
  protected readonly simpleToggleChecked = () => this.fillings().simpleToggleChecked;
  protected readonly simpleDefectValue = () => this.fillings().simpleDefectValue;
  protected readonly fissureSealingChecked = () => this.fillings().fissureSealing;

  constructor() {
    // Mirrors the pin's `useLayoutEffect(() => {...})` (no dep array — reruns
    // on every render) — see CariesCardComponent's identical constructor note.
    effect(() => {
      const visible = this.fillings().fillingSectionVisible;
      this.elRef.nativeElement.closest("#fillingSection")?.classList.toggle("hidden", !visible);
    });
  }

  protected surfaceChecksClass(): string {
    const f = this.fillings();
    return [f.surfaceGridVisible ? null : "hidden", f.defectDisabled ? "defect-disabled" : null].filter(Boolean).join(" ");
  }

  protected cells(): SurfaceCell[] {
    return this.fillings().surfaces.map((s) => ({
      value: s.value,
      pos: s.pos,
      letter: s.letter,
      label: s.label,
      labelId: s.labelId,
      checked: s.checked,
      disabled: false,
      dataMaterial: s.material,
      onToggle: (checked: boolean) => setFillingSurfaceForSelection(s.surface, checked),
      indicators: [
        // LEFT-side structural filling-defect indicator (single `<i>` bar).
        {
          key: "surf-defect",
          className: s.hasDefect ? "surf-defect has-defect" : "surf-defect",
          title: this.i18n.t("fillingDefect.label"),
          side: "left" as const,
          dataDefect: s.hasDefect && s.defectValue ? s.defectValue : undefined,
          content: { kind: "bars" as const, count: 1 },
          onClick: (anchor: HTMLElement) => {
            // Same guard the imperative indicator handler used.
            if (!s.checked || getReadOnly() || !getFillingDefectEnabled()) return;
            openFillingDefectPopup(s.surface, anchor);
          },
        },
        // RIGHT-side recurrent-caries indicator (CARS badge/bars when the filled
        // surface also has caries, else a neutral 3-bar affordance).
        {
          key: "surf-depth",
          className: s.hasSubcaries ? (s.isIcdas ? "surf-depth has-subcaries icdas" : "surf-depth has-subcaries") : "surf-depth",
          title: this.i18n.t("caries.recurrentHint"),
          side: "right" as const,
          dataDepth: s.hasSubcaries ? s.subDepth : undefined,
          dataIcdas: s.hasSubcaries ? String(s.subIcdas) : undefined,
          content: s.hasSubcaries && s.isIcdas ? { kind: "badge" as const, text: String(s.subIcdas) } : { kind: "bars" as const, count: 3 },
          onClick: (anchor: HTMLElement) => {
            // Same guard the imperative indicator handler used.
            if (!s.checked || getReadOnly()) return;
            openCariesDepthPopup(s.surface, anchor);
          },
        },
      ],
    }));
  }

  protected onMaterialChange(e: Event): void {
    setFillingMaterialForSelection((e.target as HTMLSelectElement).value);
  }

  protected onSimpleToggleChange(e: Event): void {
    setFillingSimpleToggleForSelection((e.target as HTMLInputElement).checked);
  }

  protected onSimpleDefectChange(e: Event): void {
    setFillingSimpleDefectForSelection((e.target as HTMLSelectElement).value);
  }

  protected onFissureSealingChange(e: Event): void {
    setFissureSealingForSelection((e.target as HTMLInputElement).checked);
  }
}
