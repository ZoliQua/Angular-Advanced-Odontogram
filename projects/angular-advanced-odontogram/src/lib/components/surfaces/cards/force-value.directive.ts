// Shared attribute directives generalizing RootPeriodontiumCardComponent's
// former one-off `#mobilitySelect` fix (T3 review, "latent-memoization
// audit" finding, ruled into T5 as CONTROLLER-ADDED scope).
//
// PROBLEM: every `set*ForSelection` setter across all seven declarative
// control cards routes through `applyToSelected()` -> `gateToothEditBatch()`
// (`core/odontogram.ts`). While a plan-edited tooth is being edited in
// status mode, `gateToothEditBatch` defers the mutation behind
// `requestDualStateConfirm(apply, revert)` — a normal, reachable editing
// workflow, not a test artifice. On CANCEL, `apply` never runs, so the
// engine's stored value is provably unchanged before and after the gesture.
// But a native `<select>`/checkbox already mutated its OWN DOM value/checked
// state synchronously on the user's pick, before Angular's `(change)`
// handler ever ran. React's controlled `<select value={…}>` re-asserts the
// DOM value on every commit regardless of prop equality — exactly why
// "controlled inputs" fix native desync. Angular's plain `[value]`/
// `[checked]` property binding does the opposite: `bindingUpdated` SKIPS
// the DOM write whenever the bound expression is `===` to its previous
// value, so after a cancel, the picked-but-reverted DOM value is never
// corrected back — a stale/wrong displayed value survives an ordinary
// pick-then-cancel workflow.
//
// FIX: read the bound value through a THUNK (`() => …`) from inside an
// `afterRenderEffect()`, not through a template property binding.
// `afterRenderEffect`/`effect` re-run whenever any signal read synchronously
// inside them changes — including `engineState()`'s own signal, whose value
// is a FRESH object every notify (see `engine-state.ts`'s
// `state.set(read())`), so the effect reruns even when the specific field it
// reads (`.mobilityValue`, `.checked`, …) is textually unchanged. That is
// Angular's equivalent of React's unconditional controlled-input
// reassertion. `ForceValueDirective` specifically needs `afterRenderEffect`
// (not plain `effect()`) — see its own doc comment for why.
//
// USAGE: bind a THUNK, never the evaluated value —
//   [aaoForceValue]="mobilityValue"     // class field: mobilityValue = () => this.rp().mobilityValue
//   [aaoForceChecked]="calculusChecked" // class field: calculusChecked = () => this.rp().calculusChecked
// A bare `[aaoForceValue]="rp().mobilityValue"` would hit the EXACT SAME
// `bindingUpdated` skip on the directive's own input before ever reaching
// this directive. The thunk itself can be (and, for readability, IS in every
// call site below) a STABLE bound method reference — it does not need to be
// a fresh closure every template check. What makes this work is where the
// signal read happens: `effect()` subscribes to every signal read
// SYNCHRONOUSLY during its own execution, so once the effect below calls
// `this.aaoForceValue()()` — which invokes the thunk, which reads
// `this.rp()` (or whichever `engineState()` signal it closes over) — the
// effect is subscribed to THAT signal directly, and reruns whenever it
// notifies, independent of whether the input binding itself is considered
// "changed".
import { Directive, ElementRef, afterRenderEffect, effect, inject, input } from "@angular/core";

/** Force-writes a native `<select>`/text `<input>`'s `.value` on every read
 *  of the bound thunk — see file header for why a thunk, not a plain value
 *  binding, is required. */
@Directive({
  selector: "[aaoForceValue]",
})
export class ForceValueDirective {
  readonly aaoForceValue = input.required<() => string>();
  private readonly el = inject(ElementRef<HTMLSelectElement | HTMLInputElement>);

  constructor() {
    // `afterRenderEffect` (not a plain `effect()`) — required, not just a
    // style choice: a `<select>`'s `.value` setter only "sticks" if a
    // matching `<option>` is ALREADY a child at assignment time; a plain
    // `effect()` on THIS host binding can run before the sibling `@for`-
    // generated `<option>` children have their own `[value]` bindings
    // written (both are scheduled independently), silently no-op'ing the
    // assignment (`selectedIndex` stays -1) whenever the desired value isn't
    // an option's incidental index-0 default. `afterRenderEffect` defers to
    // Angular's dedicated post-render phase, guaranteeing the whole view
    // (including `@for` children) has fully committed first.
    afterRenderEffect(() => {
      const value = this.aaoForceValue()();
      this.el.nativeElement.value = value;
    });
  }
}

/** Force-writes a native `<input type="checkbox">`'s `.checked` on every
 *  read of the bound thunk — same rationale as `ForceValueDirective`. */
@Directive({
  selector: "[aaoForceChecked]",
})
export class ForceCheckedDirective {
  readonly aaoForceChecked = input.required<() => boolean>();
  private readonly el = inject(ElementRef<HTMLInputElement>);

  constructor() {
    effect(() => {
      const value = this.aaoForceChecked()();
      this.el.nativeElement.checked = value;
    });
  }
}
