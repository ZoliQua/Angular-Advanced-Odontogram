// Angular port of $ENGINE@934a911:src/surfaces/useEngineState.ts (22 lines).
//
// Composable-UI Tier 3's shared subscription helper — the reusable
// distillation of the hand-rolled "seed from a getter, then re-read on every
// onStateChange notification" idiom already used ad hoc across this port
// (PerioSidebarComponent's constructor effect, OdontogramShellComponent's
// onStateChange mirrors). Declarative control cards (Task 3) inject this to
// read a single engine getter reactively without hand-writing the
// subscribe/cleanup boilerplate each time.
//
// Must be called from an injection context (a component/service constructor
// or field initializer, or inside `runInInjectionContext`) — it calls
// `inject(DestroyRef)` directly, mirroring the source hook's
// `useEffect(..., [])` cleanup via Angular's own teardown hook instead of
// React's unmount effect.
import { DestroyRef, Signal, inject, signal } from "@angular/core";
import { onStateChange } from "../core/odontogram";

/**
 * Read an engine getter reactively: seeds a signal with `read()` and updates
 * it on every core `onStateChange` notification, unsubscribing when the
 * owning component/service is destroyed.
 */
export function engineState<T>(read: () => T): Signal<T> {
  const state = signal<T>(read());
  const unsubscribe = onStateChange(() => state.set(read()));
  inject(DestroyRef).onDestroy(unsubscribe);
  return state.asReadonly();
}
