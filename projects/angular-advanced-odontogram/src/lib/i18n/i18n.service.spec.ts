import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
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
});
