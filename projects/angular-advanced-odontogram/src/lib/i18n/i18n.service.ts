// Reactive facade over the engine's framework-free i18n bus (core/i18n/useI18n).
// The bus stays the single source of truth — the engine's own localized
// repaints subscribe to it directly; this service only mirrors it for
// Angular templates. Controlled/uncontrolled language-prop semantics live in
// OdontogramShellComponent, mirroring the React useI18n hook.
//
// v2.6.0 resync: every UI language but English is now a lazily fetched chunk
// (core/i18n/loader.ts) and `setI18nLanguage()` loads it BEFORE flipping —
// `_lang` (and therefore every OnPush template that calls `t()`) only ever
// mirrors an ALREADY-LOADED language, exactly like the React `useI18n` hook's
// own `lang = isLanguageLoaded(requested) ? requested : getI18nLanguage()`
// guard. `t()` itself stays synchronous; nothing here awaits a load.
import { DestroyRef, Injectable, PendingTasks, Signal, inject, signal } from "@angular/core";
import {
  t as coreT,
  getI18nLanguage,
  setI18nLanguage,
  onI18nChange,
} from "../core/i18n/useI18n";
import type { Language } from "../core/i18n/languages";

@Injectable({ providedIn: "root" })
export class I18nService {
  private readonly pendingTasks = inject(PendingTasks);
  private readonly _lang = signal<Language>(getI18nLanguage());
  readonly lang: Signal<Language> = this._lang.asReadonly();

  constructor() {
    const unsubscribe = onI18nChange((lang) => this._lang.set(lang));
    inject(DestroyRef).onDestroy(unsubscribe);
  }

  /**
   * Switch the UI language. Fire-and-forget, exactly like the React
   * `useI18n` hook's own `void setI18nLanguage(requested)` — `setI18nLanguage()`
   * never rejects, and the rapid-switch case (last request wins) is handled
   * entirely inside the core bus via its own request token. Registered as an
   * Angular pending task purely so `ApplicationRef`/`ComponentFixture.whenStable()`
   * wait for the locale chunk to arrive and the language to actually flip,
   * not just for this call's synchronous part — a host awaiting stability (or
   * a test awaiting `whenStable()`) would otherwise observe the OLD language
   * still on screen.
   */
  setLanguage(lang: Language): void {
    const done = this.pendingTasks.add();
    setI18nLanguage(lang).finally(done);
  }

  t(key: string, params?: Record<string, string | number>): string {
    // Read the language signal first (even though coreT() doesn't need it —
    // it resolves against the core bus's own currentLanguage) so any OnPush
    // template binding that calls t() registers `_lang` as a reactive
    // dependency and re-evaluates when the language changes.
    this._lang();
    return params === undefined ? coreT(key) : coreT(key, params);
  }
}
