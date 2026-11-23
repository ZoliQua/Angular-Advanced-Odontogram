// Angular-side guards for $ENGINE@215c43a's two v2.6.0 lazy-loading
// architectures (i18n per-language chunks, on-demand measured anatomy).
//
// The upstream guard tests themselves don't run here: `measured-lazy-load
// .test.ts` is framework-free and already runs VERBATIM in `test:corpus`
// (core/__tests__/) — it proves the SOURCE-level split holds for `lib/core/`.
// `i18n-lazy-load.test.tsx` mixes its static-analysis guards with React
// render assertions in one file, so the whole file is excluded from
// `test:corpus` (React-dependent). Its framework-free guards therefore live
// HERE, as standing automated checks under `test:ng`: the two static-import
// scans below, and — since 2.9.0 added Japanese and Korean — the
// registry-derived "the loader reaches every other language through a literal
// dynamic import" guard, which is what proves a NEW language is code-split
// rather than silently bundled. Before that guard was ported, nothing
// executed in this repo checked that claim for any language.
//
// This file is the ANGULAR half those upstream guards don't reach: (a) that
// nothing under `src/` OUTSIDE `lib/core/` (which carries its own
// upstream-ported guards) statically imports the test-only `translations.ts`
// aggregator or the `anatomy/measured` chunk — either one would silently pull
// the split content back into the main bundle; (b) that switching the
// shell's language actually goes through `loadLanguage()`-then-flip and
// repaints in the new language, not just that the underlying bus supports
// it; (c) that selecting the measured anatomy profile through the real
// Settings wiring triggers the dynamic import and repaints `#toothGrid`
// accordingly, while the classic default never triggers it.
//
// (a) is not hypothetical: `src/public-api.ts` (the package's actual entry
// point, one level ABOVE `lib/`) carried `export * from
// "./lib/core/i18n/translations"` since before this resync, back when
// translations.ts WAS the single runtime i18n module. Task 1's resync
// repurposed that file into a test-only aggregator without anyone touching
// this now-stale export line, so — until this task's public-api.ts fix — the
// published library silently re-bundled every UI language into its main FESM
// output (`ng build angular-advanced-odontogram` + `npm run build:demo`
// showed zero `import("./locales/…")` calls anywhere in the built output,
// and every language's strings sitting in the main chunk, confirming it).
// The scan below is rooted at `src/`, not `lib/`, specifically so it also
// reaches `public-api.ts` and would have caught this on its own.
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { TestBed } from "@angular/core/testing";
import { Component, inject, inputBinding, provideZonelessChangeDetection, signal } from "@angular/core";
import {
  ODONTOGRAM_ENGINE_LIFECYCLE,
  OdontogramShellComponent,
} from "./components/odontogram-shell/odontogram-shell.component";
import { ODONTOGRAM_I18N_LOADER } from "./components/odontogram-i18n-loader";
import type { SettingsState } from "./components/settings-modal/settings-modal.component";
import { OdontogramUiService } from "./components/odontogram-ui.service";
import { getToothAnatomy } from "./core/odontogram";
import { isMeasuredProfileLoaded } from "./core/anatomy/profiles";
import { getI18nLanguage, setI18nLanguage, t } from "./core/i18n/useI18n";
import { isLanguageLoaded, loadLanguage } from "./core/i18n/loader";
import { FALLBACK_LANGUAGE, LANGUAGES, type Language } from "./core/i18n/languages";
import { OdontogramTopbarComponent } from "./components/surfaces/odontogram-topbar.component";
import { SettingsModalComponent } from "./components/settings-modal/settings-modal.component";
import { makeSettings } from "./components/settings-modal/testing/make-settings";

// `src/`, not just `src/lib/` — `public-api.ts` (the package's actual entry
// point, one level above `lib/`) is exactly where this class of regression
// bit for real: see the "public-api.ts re-exported translations.ts" note
// below. A scan rooted at `lib/` alone would have missed it.
const SRC_ROOT = path.resolve(__dirname, "..");

/** Every `.ts`/`.tsx` source file under `src/`, EXCLUDING `lib/core/`
 *  SPECIFICALLY (not any directory merely named `core` — there is only one
 *  today, but a future `src/somewhere/core/` should still be scanned; this
 *  carries its own upstream-ported guards — see this file's header) and spec
 *  files themselves. */
function sourceFiles(dir: string, relDir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules") continue;
    const rel = relDir ? `${relDir}/${name}` : name;
    if (rel === "lib/core") continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) sourceFiles(full, rel, out);
    else if (/\.tsx?$/.test(name) && !name.endsWith(".d.ts") && !name.endsWith(".spec.ts")) out.push(full);
  }
  return out;
}

/** Every module specifier a file statically `import`s/`export ... from`s —
 *  `import type`/`export type` excluded, as in upstream's own guard regex (a
 *  type-only import is erased at compile time; it cannot pull runtime content
 *  into the bundle).
 *
 *  Upstream's regex requires a `from` clause, which leaves a bare side-effect
 *  import (`import "../core/fonts/notoKR";`) invisible to every scan built on
 *  it — and that form bundles the module just as completely as a named one.
 *  Implausible as a mistake, but these guards exist precisely for the
 *  implausible, so the second alternative below catches it too. */
function staticImportSpecifiers(src: string): string[] {
  const specs: string[] = [];
  for (const m of src.matchAll(/^\s*(?:import|export)\b(?!\s+type\b)[^;]*?\bfrom\s*["']([^"']+)["']/gm)) {
    specs.push(m[1]);
  }
  for (const m of src.matchAll(/^\s*import\s+["']([^"']+)["']\s*;?\s*$/gm)) {
    specs.push(m[1]);
  }
  return specs;
}

describe("Angular shell: the i18n and measured-anatomy code splits hold", () => {
  it("nothing outside lib/core/ statically imports core/i18n/translations.ts (incl. public-api.ts)", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(SRC_ROOT, "")) {
      const rel = path.relative(SRC_ROOT, file);
      for (const spec of staticImportSpecifiers(readFileSync(file, "utf8"))) {
        if (/(^|\/)i18n\/translations$/.test(spec)) offenders.push(`${rel} -> ${spec}`);
      }
    }
    expect(
      offenders,
      "a static (non `import type`) import of translations.ts pulls every UI language back into the main bundle — import the Language type from core/i18n/languages, or t()/setI18nLanguage() from core/i18n/useI18n, instead",
    ).toEqual([]);
  });

  it("nothing outside lib/core/ statically imports core/anatomy/measured.ts (incl. public-api.ts)", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(SRC_ROOT, "")) {
      const rel = path.relative(SRC_ROOT, file);
      for (const spec of staticImportSpecifiers(readFileSync(file, "utf8"))) {
        if (/(^|\/)anatomy\/measured$/.test(spec)) offenders.push(`${rel} -> ${spec}`);
      }
    }
    expect(
      offenders,
      "a static import of anatomy/measured defeats the code split — select it through setToothAnatomy(\"measured\")",
    ).toEqual([]);
  });

  // Standing regression coverage for the bus-level ordering guarantee itself
  // (core/i18n/loader.ts + useI18n.ts's "load first, switch second"):
  // core/__tests__/i18n-lazy-load.test.tsx proves this too, but that whole
  // file is excluded from test:corpus (React-dependent) — Task 1 only
  // hand-verified its two framework-free guards once. `vi.resetModules()` (a
  // registry reset, not `vi.mock()`/`vi.doMock()` — the API the Angular unit
  // -test builder blocks for relative specifiers, see
  // odontogram-engine-lifecycle.ts's header note) gets a module instance
  // where only English has loaded, regardless of this suite's own
  // `reset-engine-state.ts` preload.
  it("a language not yet loaded stays on the previous one until it arrives (bus level)", async () => {
    const { vi } = await import("vitest");
    vi.resetModules();
    const loader = await import("./core/i18n/loader");
    const i18n = await import("./core/i18n/useI18n");
    expect(loader.isLanguageLoaded("hu")).toBe(false);

    const pending = i18n.setI18nLanguage("hu");
    expect(i18n.getI18nLanguage()).toBe("en"); // still English immediately after the call
    expect(i18n.t("chart.title")).toBe("Dental chart");
    await pending;
    expect(i18n.getI18nLanguage()).toBe("hu");
    expect(i18n.t("chart.title")).toBe("Fogászati státusz");
  });
});

// The first-paint `languageReady` gate (OdontogramUiService.configure(),
// mirroring React's `useLanguageReady`/`OdontogramProvider`'s
// `if(!ready) return null`) only ever closes for an initial `language`
// config value that is NOT yet loaded. Every real language is preloaded by
// `reset-engine-state.ts` before any spec in this suite runs, so the real
// `core/i18n/loader.ts` can never report a real `Language` as unloaded here
// — the closed branch is otherwise only reachable by inspection, never by a
// red-to-green test. `ODONTOGRAM_I18N_LOADER` (a DI seam, same shape as
// `ODONTOGRAM_ENGINE_LIFECYCLE`) exists specifically so a spec can force it
// with a controlled, manually-resolved deferred — no `vi.mock()` (blocked for
// relative specifiers under this builder), no `vi.resetModules()` (would
// desync the component's already-imported `@angular/core` from a freshly
// re-imported one), no arbitrary timeout.
describe("Angular shell: the first-paint language gate", () => {
  function mount(
    loader: {
      isLanguageLoaded: (lang: Language) => boolean;
      loadLanguage: (lang: Language) => Promise<void>;
    },
    language?: Language,
  ) {
    TestBed.configureTestingModule({
      imports: [OdontogramShellComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ODONTOGRAM_ENGINE_LIFECYCLE,
          useValue: { init: () => Promise.resolve(), destroy: () => {} },
        },
        { provide: ODONTOGRAM_I18N_LOADER, useValue: loader },
      ],
    });
    // `bindings`/`inputBinding` sets the `language` input BEFORE the
    // component (and therefore its constructor's `ui.configure({ language
    // })` call, which reads it synchronously) is created — the ordinary
    // `TestBed.createComponent` + `setInput()` sequence sets the input AFTER
    // construction, too late for this gate's one-time initial check. Omitting
    // `language` altogether (the second test below) leaves the input
    // genuinely unbound, exactly like standalone/uncontrolled mode.
    return TestBed.createComponent(OdontogramShellComponent, {
      bindings: language === undefined ? [] : [inputBinding("language", () => language)],
    });
  }

  it("stays hidden while the requested initial language downloads, and reveals once it resolves — no torn state, no timeouts", async () => {
    let resolveHu!: () => void;
    const huLoad = new Promise<void>((resolve) => {
      resolveHu = resolve;
    });
    // Every language but "hu" reports loaded (matching the real preloaded
    // process state) so only the branch under test — an explicit initial
    // language that is NOT yet loaded — actually closes the gate.
    const f = mount(
      {
        isLanguageLoaded: (lang) => lang !== "hu",
        loadLanguage: (lang) => (lang === "hu" ? huLoad : Promise.resolve()),
      },
      "hu",
    );
    const ui = (f.componentInstance as unknown as { ui: OdontogramUiService }).ui;

    f.detectChanges();
    const root = f.nativeElement.querySelector(".odontogram-root") as HTMLElement;

    // CLOSED: the mocked "hu" load is still pending. Nothing is painted —
    // the visibility gate, not the DOM structure, is what hides it (see
    // OdontogramUiService.languageReady's own doc comment on why an
    // unmount-based gate isn't used here).
    expect(ui.languageReady()).toBe(false);
    expect(root.style.visibility).toBe("hidden");

    // OPEN: resolve the deferred exactly like a real chunk arriving.
    resolveHu();
    await huLoad;
    f.detectChanges();

    expect(ui.languageReady()).toBe(true);
    expect(root.style.visibility).not.toBe("hidden");
  });

  it("never closes for standalone mode (no explicit initial language)", () => {
    const f = mount({
      isLanguageLoaded: () => false, // even a maximally pessimistic loader...
      loadLanguage: () => new Promise<void>(() => {}), // ...that never resolves...
    });
    f.detectChanges();
    // ...must not close the gate when nothing asked for a specific language —
    // matches React's own `language === undefined` short-circuit exactly.
    const ui = (f.componentInstance as unknown as { ui: OdontogramUiService }).ui;
    expect(ui.languageReady()).toBe(true);
    expect((f.nativeElement.querySelector(".odontogram-root") as HTMLElement).style.visibility).not.toBe("hidden");
  });
});

describe("Angular shell: switching language loads the chunk, then repaints", () => {
  function mount() {
    TestBed.configureTestingModule({
      imports: [OdontogramShellComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ODONTOGRAM_ENGINE_LIFECYCLE,
          useValue: { init: () => Promise.resolve(), destroy: () => {} },
        },
      ],
    });
    return TestBed.createComponent(OdontogramShellComponent);
  }

  function ui(f: ReturnType<typeof mount>): OdontogramUiService {
    return (f.componentInstance as unknown as { ui: OdontogramUiService }).ui;
  }

  it("selecting Hungarian from the language menu's own wiring renders Hungarian strings", async () => {
    const f = mount();
    await f.whenStable();
    const chartTitle = () => f.nativeElement.querySelector(".chart-title") as HTMLElement;

    expect(f.nativeElement.querySelector(".odontogram-root").getAttribute("lang")).toBe("en");
    expect(chartTitle().textContent).toBe(t("chart.title", "en"));

    // `OdontogramTopbarComponent.selectLanguage()` calls exactly this —
    // `ui.setLang()` is the shell-side seam every language-menu item wires to
    // (see odontogram-topbar.component.ts).
    ui(f).setLang("hu" as Language);
    await f.whenStable();

    expect(isLanguageLoaded("hu")).toBe(true);
    expect(getI18nLanguage()).toBe("hu");
    expect(f.nativeElement.querySelector(".odontogram-root").getAttribute("lang")).toBe("hu");
    expect(chartTitle().textContent).toBe(t("chart.title", "hu"));
    expect(chartTitle().textContent).toBe("Fogászati státusz");
  });

  it("rapid switching settles on the last language requested, with no torn state", async () => {
    const f = mount();
    await f.whenStable();

    ui(f).setLang("de" as Language);
    ui(f).setLang("fr" as Language);
    ui(f).setLang("hu" as Language);
    await f.whenStable();

    expect(getI18nLanguage()).toBe("hu");
    expect(f.nativeElement.querySelector(".odontogram-root").getAttribute("lang")).toBe("hu");
    expect(f.nativeElement.querySelector(".chart-title")?.textContent).toBe(t("chart.title", "hu"));
  });
});

describe("Angular shell: measured anatomy loads on demand", () => {
  function mount() {
    TestBed.configureTestingModule({
      imports: [OdontogramShellComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ODONTOGRAM_ENGINE_LIFECYCLE,
          useValue: { init: () => Promise.resolve(), destroy: () => {} },
        },
      ],
    });
    return TestBed.createComponent(OdontogramShellComponent);
  }

  function settingsState(f: ReturnType<typeof mount>): SettingsState {
    return (f.componentInstance as unknown as { ui: { settingsState: () => SettingsState } }).ui.settingsState();
  }

  it("the classic default never sets data-anatomy on #toothGrid", async () => {
    const f = mount();
    await f.whenStable();
    const grid = f.nativeElement.querySelector("#toothGrid") as HTMLElement;

    expect(getToothAnatomy()).toBe("classic");
    expect(grid.hasAttribute("data-anatomy")).toBe(false);
  });

  it("selecting measured through the Settings -> Odontogram picker triggers the dynamic import and renders the measured artwork", async () => {
    const f = mount();
    await f.whenStable();
    const grid = f.nativeElement.querySelector("#toothGrid") as HTMLElement;

    settingsState(f).onToothAnatomy("measured");
    await f.whenStable();

    expect(isMeasuredProfileLoaded()).toBe(true); // the chunk actually resolved
    expect(getToothAnatomy()).toBe("measured");
    expect(grid.getAttribute("data-anatomy")).toBe("measured");

    settingsState(f).onToothAnatomy("classic");
    await f.whenStable();

    expect(getToothAnatomy()).toBe("classic");
    expect(grid.hasAttribute("data-anatomy")).toBe(false);
  });
});

// Mirrors upstream's i18n-lazy-load.test.tsx "the loader reaches every other
// language through a literal dynamic import" guard. That file is excluded from
// test:corpus (it mixes these static scans with React render assertions), and
// the scans above port only its two import checks, so this one needs a home
// that actually executes.
describe("i18n: the code split holds (registry-derived loader guard)", () => {
  it("the loader reaches every other language through a literal dynamic import", () => {
    const loader = readFileSync(path.join(__dirname, "core/i18n/loader.ts"), "utf8");
    // From the registry rather than a literal list: a hand-written list is the
    // one way to leave a language out of the guard itself.
    for (const lang of LANGUAGES.filter((l) => l !== FALLBACK_LANGUAGE)) {
      expect(loader, lang).toContain(`import("./locales/${lang}")`);
    }
    // English is the one statically bundled locale, being the fallback.
    expect(FALLBACK_LANGUAGE).toBe("en");
    expect(loader).toMatch(/^import en from "\.\/locales\/en";$/m);
  });
});

@Component({
  imports: [OdontogramTopbarComponent],
  providers: [OdontogramUiService],
  template: `<aao-odontogram-topbar />`,
})
class TopbarHostComponent {
  private readonly ui = inject(OdontogramUiService);
  constructor() {
    this.ui.configure();
  }
}

@Component({
  imports: [SettingsModalComponent],
  template: `<aao-settings-modal [open]="true" [settings]="settings()" (close)="0" />`,
})
class SettingsHostComponent {
  settings = signal(makeSettings({}));
}

describe("Angular shell: the language pickers cover the whole registry", () => {
  it("the topbar and Settings pickers both offer every language in LANGUAGES, in registry order", async () => {
    // A hand-written picker list is how a language gets wired into the core
    // and still never reaches the UI. Each rendered list is checked against
    // the registry, not against the other one, and ORDER matters: upstream's
    // two LANGUAGE_OPTIONS arrays are in LANGUAGES order and this port copies
    // them verbatim.
    TestBed.configureTestingModule({
      imports: [TopbarHostComponent, SettingsHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    await setI18nLanguage("en");
    const expectedLabels = LANGUAGES.map((l) => t(`language.${l}`));

    // Topbar: a menu of buttons carrying the translated label, no value attr.
    const top = TestBed.createComponent(TopbarHostComponent);
    await top.whenStable();
    (top.nativeElement.querySelector("#languageMenu button.btn-theme") as HTMLElement).click();
    await top.whenStable();
    const topLabels = Array.from(
      top.nativeElement.querySelectorAll("#languageMenu .dropdown-item"),
      (el) => ((el as HTMLElement).textContent ?? "").trim(),
    );
    expect(topLabels, "topbar").toEqual(expectedLabels);

    // Settings: a real <select> whose option values are the language codes.
    const set = TestBed.createComponent(SettingsHostComponent);
    await set.whenStable();
    const select = set.nativeElement.querySelector(
      `select[aria-label="${t("language.label")}"]`,
    ) as HTMLSelectElement;
    expect(select, "settings language select").not.toBeNull();
    const values = Array.from(select.options, (o) => o.value);
    expect(values, "settings").toEqual([...LANGUAGES]);
  });

  it("every picker label key resolves in the fallback language", () => {
    // A label key with no string shows the raw key in the menu.
    for (const lang of LANGUAGES) {
      expect(t(`language.${lang}`), lang).not.toBe(`language.${lang}`);
    }
  });
});

describe("Angular shell: no static import of an embedded PDF font", () => {
  it("nothing outside lib/core/ statically imports an embedded PDF font (incl. public-api.ts)", () => {
    // notoKR.ts alone is 3.2 MB of base64. core/fonts/loader.ts reaches every
    // font through a dynamic import so each stays its own chunk, loaded only
    // when a PDF is exported in that language; one static import anywhere above
    // lib/core/ undoes that for every consumer of this package.
    const offenders: string[] = [];
    for (const file of sourceFiles(SRC_ROOT, "")) {
      const rel = path.relative(SRC_ROOT, file);
      for (const spec of staticImportSpecifiers(readFileSync(file, "utf8"))) {
        if (/(^|\/)fonts\/noto[A-Za-z]+$/.test(spec)) offenders.push(`${rel} -> ${spec}`);
      }
    }
    expect(
      offenders,
      "a static import of an embedded font pulls it into the main bundle — reach fonts through core/fonts/loader.ts's loadPdfFont()",
    ).toEqual([]);
  });
});
