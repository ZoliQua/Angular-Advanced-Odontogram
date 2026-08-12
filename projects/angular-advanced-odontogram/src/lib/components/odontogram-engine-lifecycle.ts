// DI seam around App.tsx/OdontogramContext.tsx's `initOdontogram()`/
// `destroyOdontogram()` pair — split into its own module so both
// `OdontogramShellComponent` (which calls `init()`/`destroy()` from its
// `ngAfterViewInit()`/`ngOnDestroy()`) and `OdontogramUiService` (which now
// owns the injection, per the Composable-UI resync) can import the same
// token without a circular module dependency between the two.
//
// The Angular unit-test builder's Vitest integration hard-blocks `vi.mock()`
// for any relative-path specifier ("not supported for relative imports...
// use Angular TestBed for mocking dependencies" — see `@angular/build`'s
// `runners/vitest/build-options.js`), which is exactly the mocking strategy
// the source engine test suite (`App.test.tsx`) and this component's own
// spec need: mock only the two lifecycle calls, keep every other export of
// `core/odontogram` real. `vi.spyOn` on the module namespace fails too (its
// exports are non-configurable). This token is the sanctioned workaround the
// builder's own error message points at: specs override it via TestBed's
// provider array instead of module-level mocking/spying.
import { InjectionToken } from "@angular/core";
import { destroyOdontogram, initOdontogram } from "../core/odontogram";

export const ODONTOGRAM_ENGINE_LIFECYCLE = new InjectionToken<{
  init: () => Promise<void>;
  destroy: () => void;
}>("ODONTOGRAM_ENGINE_LIFECYCLE", {
  providedIn: "root",
  factory: () => ({ init: initOdontogram, destroy: destroyOdontogram }),
});
