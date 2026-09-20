// Angular spec for the Settings -> General tab's diagnosis coding-pack
// select + SNOMED toggle (v2.6.0 resync, Phase 11 Task 3 — SettingsModal.tsx
// diff `934a911..215c43a`).
//
// Describe 1 mounts the bare `SettingsModalComponent` against the
// `makeSettings` stub fixture (mirrors `settings-modal.component.spec.ts`'s
// own style): renders the 3 options + write-through of the `on*` callback,
// with no engine involved.
//
// Describe 2 mounts the REAL `OdontogramShellComponent` (same DI-seam mount
// route as `ui2-perio-settings.spec.ts`'s "real engine" describe) and drives
// the controls through the actual `getDiagnosisCodingPack`/`setSnomedEnabled`
// engine seams, proving the round trip survives modal close/reopen — the
// closest available analog to "survives a revert" for these two controls.
// Unlike the per-tooth `set*ForSelection` setters the `[aaoForceValue]`/
// `[aaoForceChecked]` directives exist for, `setDiagnosisCodingPack`/
// `setSnomedEnabled` are plain session-only module flags with NO
// dual-state-confirm/revert path (mirrors `state/caseMeta.ts`'s
// `setCaseCondition`, explicitly documented "Case-level (not DS-1 gated)") —
// there is no scenario where the engine's stored value stays unchanged while
// a native control's own DOM state has drifted, so neither control uses the
// force-value directives (see `OdontogramUiService`'s own comment on
// `codingPack`/`snomedEnabled`). This describe instead proves the ordinary
// (non-revert) write-through + persistence-through-remount contract, which
// IS the applicable parity concern for a plain module flag — mirrors case
// (c) in `settings-modal.component.spec.ts` ("toggling a periodontal row
// updates the REAL engine's getter ... survives modal close/reopen").
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import {
  SettingsModalComponent,
  type SettingsState,
} from "./settings-modal.component";
import { setI18nLanguage } from "../../core/i18n/useI18n";
import { makeSettings } from "./testing/make-settings";
import {
  ODONTOGRAM_ENGINE_LIFECYCLE,
  OdontogramShellComponent,
} from "../odontogram-shell/odontogram-shell.component";
import { getDiagnosisCodingPack, getSnomedEnabled } from "../../core/odontogram";

@Component({
  imports: [SettingsModalComponent],
  template: `<aao-settings-modal [open]="true" [settings]="settings()" (close)="closed = true" />`,
})
class HostComponent {
  settings = signal<SettingsState>(makeSettings());
  closed = false;
}

describe("SettingsModalComponent: diagnosis coding-pack + SNOMED (stub fixture)", () => {
  beforeEach(() => {
    setI18nLanguage("en");
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    setI18nLanguage("en");
  });

  it("renders the coding-pack select (3 options, 'none' selected by default) and the SNOMED toggle (off by default)", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();

    const select = f.nativeElement.querySelector(
      '[aria-label="Diagnosis coding system"]',
    ) as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.options.length).toBe(3);
    expect(Array.from(select.options).map((o) => o.value)).toEqual(["none", "bno10", "icd10cm"]);
    expect(select.value).toBe("none");

    const toggle = f.nativeElement.querySelector(
      '[aria-label="SNOMED CT"]',
    ) as HTMLInputElement;
    expect(toggle).toBeTruthy();
    expect(toggle.type).toBe("checkbox");
    expect(toggle.checked).toBe(false);
  });

  it("changing the coding-pack select calls onDiagnosisCodingPack; toggling SNOMED calls onSnomedEnabled", async () => {
    const onDiagnosisCodingPack = vi.fn();
    const onSnomedEnabled = vi.fn();
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.settings.set(makeSettings({ onDiagnosisCodingPack, onSnomedEnabled }));
    await f.whenStable();

    const select = f.nativeElement.querySelector('[aria-label="Diagnosis coding system"]') as HTMLSelectElement;
    select.value = "bno10";
    select.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(onDiagnosisCodingPack).toHaveBeenCalledWith("bno10");

    const toggle = f.nativeElement.querySelector('[aria-label="SNOMED CT"]') as HTMLInputElement;
    toggle.checked = true;
    toggle.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(onSnomedEnabled).toHaveBeenCalledWith(true);
  });
});

describe("Settings -> General: diagnosis coding-pack + SNOMED (real engine)", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OdontogramShellComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: { init: async () => {}, destroy: () => {} } },
      ],
    });
  });

  it("writes through to the real engine and survives Settings-modal close/reopen", async () => {
    expect(getDiagnosisCodingPack()).toBe("none");
    expect(getSnomedEnabled()).toBe(false);

    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    (f.nativeElement.querySelector("#btnSettingsMenu") as HTMLButtonElement | null)?.click();
    await f.whenStable();

    const select = f.nativeElement.querySelector(
      '[aria-label="Diagnosis coding system"]',
    ) as HTMLSelectElement;
    select.value = "bno10";
    select.dispatchEvent(new Event("change"));
    await f.whenStable();

    const toggle = f.nativeElement.querySelector('[aria-label="SNOMED CT"]') as HTMLInputElement;
    toggle.checked = true;
    toggle.dispatchEvent(new Event("change"));
    await f.whenStable();

    expect(getDiagnosisCodingPack()).toBe("bno10");
    expect(getSnomedEnabled()).toBe(true);

    // Close and reopen the modal — the mirrored signal must still reflect
    // the real engine state (OdontogramUiService's onStateChange mirror).
    (f.nativeElement.querySelector(".odon-settings-close") as HTMLButtonElement).click();
    await f.whenStable();
    expect(f.nativeElement.querySelector(".odon-settings-modal")).toBeNull();

    (f.nativeElement.querySelector("#btnSettingsMenu") as HTMLButtonElement).click();
    await f.whenStable();

    const selectAgain = f.nativeElement.querySelector(
      '[aria-label="Diagnosis coding system"]',
    ) as HTMLSelectElement;
    const toggleAgain = f.nativeElement.querySelector('[aria-label="SNOMED CT"]') as HTMLInputElement;
    expect(selectAgain.value).toBe("bno10");
    expect(toggleAgain.checked).toBe(true);
  });
});
