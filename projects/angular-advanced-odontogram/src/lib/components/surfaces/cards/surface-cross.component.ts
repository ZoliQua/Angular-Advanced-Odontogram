// Angular port of $ENGINE@934a911:src/surfaces/cards/SurfaceCross.tsx (114 lines).
//
// Composable-UI Tier 3, PR 3c — the declarative equivalent of the imperative
// `buildSurfaceCross()` UI builder in `odontogram.ts`. It renders the anatomical
// 5-cell cross grid (mesial/occlusal/distal/buccal/lingual) with the SAME markup,
// classes and ids the builder emitted:
//
//   <div class="surface-cross">
//     <label class="surface-cell pos-{pos}" [style="display:none"]>
//       {left indicators…}
//       <input type="checkbox" id="chk-{value}" value="{value}">
//       <span class="surf-letter">{letter}</span>
//       <span id="lbl-{value}" class="surf-name">{label}</span>
//       {right indicators…}
//     </label>
//     …
//   </div>
//
// so id-based tests and the host CSS (`.surface-cross`/`.surface-cell`/
// `.surf-letter`/`.surf-name`/`.surf-depth`) keep resolving. The per-cell
// `.surf-depth`/`.surf-defect` severity/defect indicators the builder injected
// afterwards are parameterised (`indicators`, each with a `side`) so BOTH the
// Caries card (one right-side `.surf-depth`) and the Fillings card (a left-side
// `.surf-defect` + a right-side `.surf-depth`) can reuse this one component. A
// disabled cell is rendered `display:none`, exactly as the imperative
// `setDisabled()`→`syncControlLabelVisibility()` path hid it.
//
// Every cell's `<input type="checkbox" [checked]="cell.checked">` uses the
// shared `[aaoForceChecked]` directive instead of a plain property binding
// (T5 CONTROLLER-ADDED scope, from the T3 review's "latent-memoization
// audit" finding — see `force-value.directive.ts`'s header): both callers'
// `onToggle` (`setCariesSurfaceForSelection`/`setFillingSurfaceForSelection`)
// route through `applyToSelected()` -> `gateToothEditBatch()`, whose
// dual-state-confirm CANCEL path can leave a surface checkbox's
// already-mutated DOM `.checked` stale after a cancel. Since `cell` here is a
// plain per-render snapshot object (not itself a signal), the thunk looks the
// cell back up by `value` from the `cells` INPUT SIGNAL itself (`checkedFor`)
// so the directive's internal `effect()` has a genuine signal read to
// subscribe to.
//
// Angular-ism: the pin's `SurfaceIndicator.children` is a `ReactNode` (either a
// text badge or the 3-bar `<><i/><i/><i/></>` markup); Angular templates can't
// carry an arbitrary render fragment through a plain data object, so it is
// narrowed here to a closed `content` union (`{kind:"badge",text}` |
// `{kind:"bars",count}`) — the only two shapes any caller ever produces — and
// the two `data-*` attribute sets the two callers actually use (depth/icdas/
// radio for Caries, defect for Fillings) are named fields instead of a free
// `attrs` record, since Angular can't bind a dynamic attribute NAME from a
// template expression. The left/right indicator spans are written out twice
// (once per side) instead of factored through `ngTemplateOutlet`, trading a
// few duplicated lines for one fewer import/indirection.
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { ForceCheckedDirective } from "./force-value.directive";

/** Either a text badge (ICDAS code) or N neutral `<i>` severity bars. */
export type SurfaceIndicatorContent = { kind: "badge"; text: string } | { kind: "bars"; count: number };

/** One injected per-cell indicator span (e.g. the `.surf-depth` severity popup
 *  affordance). `side` decides whether it renders before the checkbox (left) or
 *  after the caption (right), matching the imperative insert order. */
export type SurfaceIndicator = {
  key: string;
  className: string; // full className, incl. any state class
  title: string;
  side: "left" | "right";
  dataDepth?: string; // .surf-depth data-depth
  dataIcdas?: string; // .surf-depth data-icdas
  dataRadio?: string; // .surf-depth data-radio
  dataDefect?: string; // .surf-defect data-defect
  content: SurfaceIndicatorContent;
  onClick?: (anchor: HTMLElement) => void;
};

/** One surface-cross cell's fully-resolved render state. */
export type SurfaceCell = {
  value: string; // checkbox value + id source (chk-{value})
  pos: string; // grid position (pos-{pos})
  letter: string; // boxed `.surf-letter` glyph
  label: string; // `.surf-name` caption
  labelId: string; // id on the caption span (lbl-{value})
  checked: boolean;
  disabled: boolean; // true → whole cell display:none
  onToggle: (checked: boolean) => void;
  indicators?: SurfaceIndicator[];
  dataMaterial?: string; // the Fillings card's cell-level data-material
};

@Component({
  selector: "aao-surface-cross",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ForceCheckedDirective],
  template: `
    <div class="surface-cross">
      @for (cell of cells(); track cell.value) {
        <label
          [class]="'surface-cell pos-' + cell.pos"
          [style.display]="cell.disabled ? 'none' : null"
          [attr.data-material]="cell.dataMaterial ?? null"
        >
          @for (ind of leftIndicators(cell); track ind.key) {
            <span
              [class]="ind.className"
              [attr.title]="ind.title"
              [attr.data-depth]="ind.dataDepth ?? null"
              [attr.data-icdas]="ind.dataIcdas ?? null"
              [attr.data-radio]="ind.dataRadio ?? null"
              [attr.data-defect]="ind.dataDefect ?? null"
              (click)="onIndicatorClick($event, ind)"
            >
              @if (ind.content.kind === 'badge') {
                {{ ind.content.text }}
              } @else {
                @for (b of bars(ind.content.count); track $index) {
                  <i></i>
                }
              }
            </span>
          }
          <input
            type="checkbox"
            [id]="'chk-' + cell.value"
            [value]="cell.value"
            [aaoForceChecked]="checkedFor(cell.value)"
            [disabled]="cell.disabled"
            (change)="onCellToggle(cell, $event)"
          />
          <span class="surf-letter">{{ cell.letter }}</span>
          <span [id]="cell.labelId" class="surf-name">{{ cell.label }}</span>
          @for (ind of rightIndicators(cell); track ind.key) {
            <span
              [class]="ind.className"
              [attr.title]="ind.title"
              [attr.data-depth]="ind.dataDepth ?? null"
              [attr.data-icdas]="ind.dataIcdas ?? null"
              [attr.data-radio]="ind.dataRadio ?? null"
              [attr.data-defect]="ind.dataDefect ?? null"
              (click)="onIndicatorClick($event, ind)"
            >
              @if (ind.content.kind === 'badge') {
                {{ ind.content.text }}
              } @else {
                @for (b of bars(ind.content.count); track $index) {
                  <i></i>
                }
              }
            </span>
          }
        </label>
      }
    </div>
  `,
})
export class SurfaceCrossComponent {
  readonly cells = input.required<SurfaceCell[]>();

  /** Thunk factory for `[aaoForceChecked]` — looks the cell back up by
   *  `value` from the `cells` INPUT SIGNAL on every read (see file header),
   *  since the `cell` loop variable itself is a plain per-render snapshot,
   *  not a signal. */
  protected checkedFor(value: string): () => boolean {
    return () => this.cells().find((c) => c.value === value)?.checked ?? false;
  }

  protected leftIndicators(cell: SurfaceCell): SurfaceIndicator[] {
    return (cell.indicators ?? []).filter((i) => i.side === "left");
  }

  protected rightIndicators(cell: SurfaceCell): SurfaceIndicator[] {
    return (cell.indicators ?? []).filter((i) => i.side === "right");
  }

  protected bars(count: number): number[] {
    return Array.from({ length: count });
  }

  protected onCellToggle(cell: SurfaceCell, e: Event): void {
    cell.onToggle((e.target as HTMLInputElement).checked);
  }

  protected onIndicatorClick(e: MouseEvent, ind: SurfaceIndicator): void {
    if (!ind.onClick) return;
    // The indicator sits INSIDE the cell <label>, so a bare click would also
    // toggle the label's checkbox (native behavior). The imperative handlers
    // guarded against this with preventDefault()+stopPropagation(); preserve
    // that so opening the popup never flips the surface on/off.
    e.preventDefault();
    e.stopPropagation();
    ind.onClick(e.currentTarget as HTMLElement);
  }
}
