// Reactive facade over the engine's framework-free i18n bus (core/i18n/useI18n).
// The bus stays the single source of truth — the engine's own localized
// repaints subscribe to it directly; this service only mirrors it for
// Angular templates. Controlled/uncontrolled language-prop semantics live in
// OdontogramShellComponent, mirroring the React useI18n hook.
import { Injectable, Signal, signal } from "@angular/core";
import {
  t as coreT,
  getI18nLanguage,
  setI18nLanguage,
  onI18nChange,
} from "../core/i18n/useI18n";
import type { Language } from "../core/i18n/translations";

@Injectable({ providedIn: "root" })
export class I18nService {
  private readonly _lang = signal<Language>(getI18nLanguage());
  readonly lang: Signal<Language> = this._lang.asReadonly();

  constructor() {
    onI18nChange((lang) => this._lang.set(lang));
  }

  setLanguage(lang: Language): void {
    setI18nLanguage(lang);
  }

  t(key: string, params?: Record<string, string | number>): string {
    return params === undefined ? coreT(key) : coreT(key, params);
  }
}
