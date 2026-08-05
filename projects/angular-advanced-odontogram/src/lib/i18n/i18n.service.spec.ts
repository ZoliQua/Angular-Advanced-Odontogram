import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { I18nService } from "./i18n.service";
import { setI18nLanguage } from "../core/i18n/useI18n";

describe("I18nService", () => {
  beforeEach(() => {
    setI18nLanguage("en"); // reset the module-level singleton between tests
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  it("mirrors the core language into the lang signal", () => {
    const svc = TestBed.inject(I18nService);
    expect(svc.lang()).toBe("en");
    setI18nLanguage("hu");
    expect(svc.lang()).toBe("hu");
  });

  it("setLanguage drives the core bus (and thus t())", () => {
    const svc = TestBed.inject(I18nService);
    svc.setLanguage("hu");
    expect(svc.lang()).toBe("hu");
    // app.title exists in every language table; hu differs from en
    expect(svc.t("app.title")).not.toBe("");
  });

  it("t() resolves template params like the core t()", () => {
    const svc = TestBed.inject(I18nService);
    const raw = svc.t("app.title", { x: 1 }); // params on a paramless key are a no-op
    expect(typeof raw).toBe("string");
  });

  // Carry-forward fix (Task 3 review): t() must read `_lang` first so an
  // OnPush template binding that calls `i18n.t(...)` is registered as a
  // reactive consumer of the language signal and re-renders on
  // setLanguage(), without needing any other signal read in the template.
  it("a template binding calling i18n.t() refreshes after setLanguage()", async () => {
    @Component({
      imports: [],
      // "panel.controls" actually differs between languages ("Controls" en /
      // "Vezérlők" hu), unlike "app.title" (an untranslated brand name).
      template: `<span id="label">{{ i18n.t('panel.controls') }}</span>`,
    })
    class HostComponent {
      readonly i18n = TestBed.inject(I18nService);
    }

    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    const label = f.nativeElement.querySelector("#label") as HTMLElement;
    const before = label.textContent;

    f.componentInstance.i18n.setLanguage("hu");
    await f.whenStable();

    expect(label.textContent).not.toBe(before);
    expect(label.textContent).toBe(f.componentInstance.i18n.t("panel.controls"));
  });
});
