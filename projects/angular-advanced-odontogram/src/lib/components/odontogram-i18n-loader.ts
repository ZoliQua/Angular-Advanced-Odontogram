// DI seam around `core/i18n/loader.ts`'s `isLanguageLoaded()`/`loadLanguage()`
// pair — used ONLY by `OdontogramUiService.configure()`'s first-paint
// `languageReady` gate (mirrors React's `useLanguageReady`; see that
// signal's own doc comment).
//
// Same rationale as `odontogram-engine-lifecycle.ts`'s token: the Angular
// unit-test builder's Vitest integration hard-blocks `vi.mock()`/`vi.doMock()`
// for relative specifiers, so a spec that needs the gate to observe a
// language as NOT YET loaded — every real `beforeEach`/`afterEach` cycle
// preloads all twelve via `reset-engine-state.ts`, so `isLanguageLoaded()`
// is always true for a real `Language` by the time any test's `configure()`
// runs — has no way to force that state through the real core module. This
// token lets a spec override BOTH functions via TestBed's provider array with
// a controlled deferred, without touching the core loader's real (monotonic,
// process-wide, correctly un-resettable) cache.
import { InjectionToken } from "@angular/core";
import { isLanguageLoaded, loadLanguage } from "../core/i18n/loader";
import type { Language } from "../core/i18n/languages";

export const ODONTOGRAM_I18N_LOADER = new InjectionToken<{
  isLanguageLoaded: (lang: Language) => boolean;
  loadLanguage: (lang: Language) => Promise<void>;
}>("ODONTOGRAM_I18N_LOADER", {
  providedIn: "root",
  factory: () => ({ isLanguageLoaded, loadLanguage }),
});
