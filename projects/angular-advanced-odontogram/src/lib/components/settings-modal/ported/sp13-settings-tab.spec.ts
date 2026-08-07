// Angular port of core/__tests__/sp13-settings-tab.test.ts.
//
// MAPPING (React-element-tree -> DOM): the source calls the toothDetails
// tab's `render({ t, s })` directly and walks the returned React element
// tree (`Children.toArray` + `isValidElement`) to read each SelectRow's
// `value`/`label`/`descKey`/`options`/`onChange` props without ever
// touching a DOM. The Angular `SETTINGS_TABS` registry (settings-modal.
// component.ts) carries only `{ id, titleKey }` — the actual row markup
// lives in the component's `@switch (activeTab())` template, not in a
// per-tab `render` function — so there is no element tree to walk here.
// This ports the DOM equivalent: mount SettingsModalComponent with the
// toothDetails tab active and assert the 3 `<select>`s (queried by their
// i18n-translated `aria-label`, matching the source's `label` prop check)
// for current value + option-value set (source's `descKey`/`label` checks
// collapse into "is this the right control, bound to the right field" —
// verified here by aria-label + value), and wiring: dispatching a native
// `change` event on each select calls the matching `on*` handler with the
// new value (the DOM equivalent of invoking the source's `onChange` prop
// directly).
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import {
  SettingsModalComponent,
  SETTINGS_TABS,
  type SettingsState,
} from "../settings-modal.component";
import { setI18nLanguage } from "../../../core/i18n/useI18n";
import { makeSettings } from "../testing/make-settings";

@Component({
  imports: [SettingsModalComponent],
  template: `<aao-settings-modal [open]="open()" [settings]="settings()" (close)="closed = true" />`,
})
class HostComponent {
  open = signal(true);
  settings = signal<SettingsState>(makeSettings());
  closed = false;
}

async function renderToothDetails(settings: SettingsState) {
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [provideZonelessChangeDetection()],
  });
  const f = TestBed.createComponent(HostComponent);
  f.componentInstance.settings.set(settings);
  await f.whenStable();

  const tabBtn = f.nativeElement.querySelector(
    "#odon-settings-tab-toothDetails",
  ) as HTMLButtonElement;
  tabBtn.click();
  await f.whenStable();

  return f;
}

describe("SP13 Task 3: toothDetails settings tab", () => {
  beforeEach(() => setI18nLanguage("en"));

  // SP15 Task 4 (B1/B2) inserted the "panels" tab immediately after "general"
  // and removed the standalone "secondaryCaries" tab (merged into "caries"),
  // so toothDetails is now general+2 rather than general+1. See
  // sp15-settings.spec.ts for the panels-tab and merged-caries assertions.
  it("exists in SETTINGS_TABS after the general and panels tabs", () => {
    const generalIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "general");
    const panelsIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "panels");
    const toothDetailsIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "toothDetails");

    expect(generalIdx).toBe(0);
    expect(panelsIdx).toBe(generalIdx + 1);
    expect(toothDetailsIdx).toBeGreaterThan(-1);
    expect(toothDetailsIdx).toBe(panelsIdx + 1);
    expect(SETTINGS_TABS[toothDetailsIdx].titleKey).toBe("settings.tab.toothDetails");
  });

  it("renders three controls bound to wearDetailLevel, discolorationDetailLevel, and surfaceNotation", async () => {
    const s = makeSettings();
    const f = await renderToothDetails(s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const selects = Array.from(panel.querySelectorAll("select")) as HTMLSelectElement[];
    expect(selects).toHaveLength(3);

    const wearSelect = panel.querySelector('select[aria-label="Wear detail"]') as HTMLSelectElement;
    const discoSelect = panel.querySelector(
      'select[aria-label="Discoloration detail"]',
    ) as HTMLSelectElement;
    const notationSelect = panel.querySelector(
      'select[aria-label="Surface notation"]',
    ) as HTMLSelectElement;

    expect(wearSelect).toBeTruthy();
    expect(wearSelect.value).toBe(s.wearDetailLevel);
    expect(Array.from(wearSelect.options).map((o) => o.value).sort()).toEqual([
      "complex",
      "simple",
    ]);

    expect(discoSelect).toBeTruthy();
    expect(discoSelect.value).toBe(s.discolorationDetailLevel);
    expect(Array.from(discoSelect.options).map((o) => o.value).sort()).toEqual([
      "complex",
      "simple",
    ]);

    // SP16 Task 2: a new select bound to surfaceNotation ("full"/"simple").
    expect(notationSelect).toBeTruthy();
    expect(notationSelect.value).toBe(s.surfaceNotation);
    expect(Array.from(notationSelect.options).map((o) => o.value).sort()).toEqual([
      "full",
      "simple",
    ]);
  });

  it("changing each control fires its matching settings handler with the new value", async () => {
    const s = makeSettings();
    const f = await renderToothDetails(s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const wearSelect = panel.querySelector('select[aria-label="Wear detail"]') as HTMLSelectElement;
    wearSelect.value = "simple";
    wearSelect.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(s.onWearDetailLevel).toHaveBeenCalledTimes(1);
    expect(s.onWearDetailLevel).toHaveBeenCalledWith("simple");
    expect(s.onDiscolorationDetailLevel).not.toHaveBeenCalled();

    const discoSelect = panel.querySelector(
      'select[aria-label="Discoloration detail"]',
    ) as HTMLSelectElement;
    discoSelect.value = "simple";
    discoSelect.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(s.onDiscolorationDetailLevel).toHaveBeenCalledTimes(1);
    expect(s.onDiscolorationDetailLevel).toHaveBeenCalledWith("simple");

    const notationSelect = panel.querySelector(
      'select[aria-label="Surface notation"]',
    ) as HTMLSelectElement;
    notationSelect.value = "simple";
    notationSelect.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(s.onSurfaceNotation).toHaveBeenCalledTimes(1);
    expect(s.onSurfaceNotation).toHaveBeenCalledWith("simple");
  });
});
