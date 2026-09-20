// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { FALLBACK_LANGUAGE, type Language } from "./languages";
import { getLoadedTable, isLanguageLoaded, loadLanguage } from "./loader";

let currentLanguage: Language = FALLBACK_LANGUAGE;
const listeners = new Set<(lang: Language) => void>();

/** Parameter map for template placeholders (`{{key}}`). */
type Params = Record<string, string | number>;

/**
 * Resolve a translation key to a localised string.
 *
 * @param key - Dot-delimited translation key (e.g. `"app.title"`).
 * @param langOverride - Explicit {@link Language} code **or** a {@link Params} object
 *   (when called with two arguments where the second is an object, it is treated as params).
 * @param params - Optional template parameters that replace `{{placeholder}}` tokens.
 * @returns The resolved string, or the key itself if no translation is found.
 */
export function t(key: string, langOverride?: Language | Params, params?: Params): string {
  const resolvedParams = typeof langOverride === "object" ? langOverride : params;
  const lang = typeof langOverride === "string" ? langOverride : currentLanguage;
  // The fallback is always loaded (it is bundled statically). A language that
  // has not arrived yet resolves against it — though in practice nothing asks:
  // the current language is only ever flipped to one already loaded.
  const fallback = getLoadedTable(FALLBACK_LANGUAGE)!;
  const table = getLoadedTable(lang) ?? fallback;
  const raw = table[key] ?? fallback[key] ?? key;
  if(!resolvedParams) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, token) => String(resolvedParams[token] ?? ""));
}

/** Get the current global language. */
export function getI18nLanguage(): Language {
  return currentLanguage;
}

// The language the most recent setI18nLanguage() call is switching TO, and a
// monotonic request token: loading a language is async, so a second switch can
// arrive while the first is still downloading, and whoever asked LAST must win.
// (Same shape as setToothAnatomy's — without the token, "hu" then "en" issued
// during the "hu" download ended on Hungarian.)
let languageRequest = 0;
let pendingLanguage: Language | null = null;

function applyLanguage(lang: Language): void {
  if(lang === currentLanguage) return;
  currentLanguage = lang;
  for(const listener of listeners){
    listener(lang);
  }
}

/**
 * Switch the global UI language and notify all listeners.
 *
 * A language that is already loaded (English always is) switches
 * SYNCHRONOUSLY, exactly as before. Any other is fetched first and switched
 * once its strings are in, so `t()` never renders a key in a language it cannot
 * resolve. No-op when the language is already current or already on its way in.
 *
 * Never rejects: a language that fails to load is reported on the console and
 * the current language stays, so an un-awaited call cannot raise an unhandled
 * rejection.
 */
export function setI18nLanguage(lang: Language): Promise<void> {
  if(lang === (pendingLanguage ?? currentLanguage)) return Promise.resolve();
  const token = ++languageRequest;
  if(isLanguageLoaded(lang)){
    pendingLanguage = null;
    applyLanguage(lang);
    return Promise.resolve();
  }
  pendingLanguage = lang;
  return loadLanguage(lang).then(
    () => {
      if(token !== languageRequest) return;        // a later switch superseded this one
      pendingLanguage = null;
      applyLanguage(lang);
    },
    (err) => {
      if(token === languageRequest) pendingLanguage = null;
      console.error(`odontogram: the "${lang}" UI language could not be loaded — staying on "${currentLanguage}"`, err);
    },
  );
}

/**
 * Subscribe to language changes.
 * @returns An unsubscribe function.
 */
export function onI18nChange(listener: (lang: Language) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
