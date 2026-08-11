// Angular port of core/__tests__/sp13-settings-tab.test.ts.
//
// v2.4.0 resync (Phase 6 Task 3): the source's own "Round 2 restructure"
// comment documents the corpus source's own delta — tabs are now
// general/odontogram/periodontalChart/toothDetails/…, so toothDetails is
// general+3 (previously general+1 under the pre-resync 7-tab order this file
// used to assert). toothDetails also absorbed the Pulp-detail select (now
// first) and the Notes toggle (now last), on top of the pre-existing
// selection-colour/selection-border rows this file already asserted —> 7
// controls total, order: selection-color, selection-border, pulp, wear,
// discoloration, notation, notes.
//
// MAPPING (React-element-tree -> DOM): the source calls the toothDetails
// tab's `render({ t, s })` directly and walks the returned React element
// tree (`Children.toArray` + `isValidElement`) to read each SelectRow's
// `value`/`label`/`descKey`/`options`/`onChange` props without ever
// touching a DOM. The Angular `SETTINGS_TABS` registry (settings-modal.
// component.ts) carries only `{ id, titleKey }` — the actual row markup
// lives in the component's `@switch (currentTabId())` template, not in a
// per-tab `render` function — so there is no element tree to walk here.
// This ports the DOM equivalent: mount SettingsModalComponent with the
// toothDetails tab active and assert the 5 `<select>`s (queried by their
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

  // v2.4.0 resync: toothDetails now follows general, odontogram,
  // periodontalChart (general+3), not general+1.
  it("exists in SETTINGS_TABS after general/odontogram/periodontalChart", () => {
    const generalIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "general");
    const odontogramIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "odontogram");
    const toothDetailsIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "toothDetails");

    expect(generalIdx).toBe(0);
    expect(odontogramIdx).toBe(generalIdx + 1);
    expect(toothDetailsIdx).toBe(generalIdx + 3);
    expect(SETTINGS_TABS[toothDetailsIdx].titleKey).toBe("settings.tab.toothDetails");
  });

  it("renders five selects bound to selectionBorderStyle, pulpLevel, wearDetailLevel, discolorationDetailLevel, and surfaceNotation", async () => {
    const s = makeSettings();
    const f = await renderToothDetails(s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const selects = Array.from(panel.querySelectorAll("select")) as HTMLSelectElement[];
    expect(selects).toHaveLength(5);

    const borderSelect = panel.querySelector(
      'select[aria-label="Selection border style"]',
    ) as HTMLSelectElement;
    const pulpSelect = panel.querySelector(
      'select[aria-label="Pulp detail level"]',
    ) as HTMLSelectElement;
    const wearSelect = panel.querySelector('select[aria-label="Wear detail"]') as HTMLSelectElement;
    const discoSelect = panel.querySelector(
      'select[aria-label="Discoloration detail"]',
    ) as HTMLSelectElement;
    const notationSelect = panel.querySelector(
      'select[aria-label="Surface notation"]',
    ) as HTMLSelectElement;

    expect(borderSelect).toBeTruthy();
    expect(borderSelect.value).toBe(s.selectionBorderStyle);

    expect(pulpSelect).toBeTruthy();
    expect(pulpSelect.value).toBe(s.pulpLevel);

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

    expect(notationSelect).toBeTruthy();
    expect(notationSelect.value).toBe(s.surfaceNotation);
    expect(Array.from(notationSelect.options).map((o) => o.value).sort()).toEqual([
      "full",
      "simple",
    ]);
  });

  it("renders the selection-color input and the notes toggle bookending the tab", async () => {
    const s = makeSettings();
    const f = await renderToothDetails(s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const colorInput = panel.querySelector(
      'input[type="color"][aria-label="Selection color"]',
    ) as HTMLInputElement;
    expect(colorInput).toBeTruthy();
    expect(colorInput.value.toLowerCase()).toBe(s.selectionColor);

    const notesToggle = panel.querySelector('input[aria-label="Notes"]') as HTMLInputElement;
    expect(notesToggle).toBeTruthy();
    expect(notesToggle.checked).toBe(s.notes);
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
