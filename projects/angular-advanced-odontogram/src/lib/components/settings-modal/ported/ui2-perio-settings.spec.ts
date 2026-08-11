// Angular port of core/__tests__/ui2-perio-settings.test.tsx.
//
// v2.4.0 resync (Phase 6 Task 3), per the corpus source's own "Round 2
// (Stage 4)" updates: the Periodontal tab was renamed/relocated to id
// "periodontalChart" and gained a "General" group heading + a
// `perioChartAvailable` availability toggle at the top (before the
// perioViewMode select), which — when off — disables every other perio
// control on the tab (the toggle itself stays enabled). The 16-row-toggle
// count assertion becomes 17 (+1 for the availability toggle) and the
// group-heading list gains a leading "General" entry.
//
// Describe 1 ("module flags") never touched React at all in the source
// (only `getPerioRowVisibility`/`setPerioRowVisibility`/
// `getPerioIndexNameMode`/`setPerioIndexNameMode` from odontogram.ts) — it
// is a real-engine-seam test, ported verbatim below with only the import
// path adjusted (real engine module, no vi.mock). Its `afterEach` reset
// (restore every row to visible + name mode to "translated") is the shared
// reset this file's own header comment refers to: since both describes
// share the same module-level state, that one reset protects describe 2's
// assertions from cross-test leakage too.
//
// MAPPING (React-element-tree -> DOM) for describe 2 ("Periodontal settings
// tab"): the source calls the periodontalChart tab's `render({ t, s })`
// directly and inspects the returned React tree via RTL's `render()`
// (already a real DOM render in the source, just of a detached element —
// not a full <SettingsModal>). Angular's SETTINGS_TABS carries only
// `{ id, titleKey }` (render lives in the component's `@switch` template),
// so this mounts the full SettingsModalComponent with the periodontalChart
// tab active and queries the same DOM shape: `.odon-settings-group-title`
// headings, `input[type="checkbox"]` rows, and the availability/index-name
// `<select>`s — located by their i18n-translated `aria-label` in place of
// the source's identity-`t()` key text.
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import {
  getPerioRowVisibility,
  setPerioRowVisibility,
  getPerioIndexNameMode,
  setPerioIndexNameMode,
  type PerioRowId,
} from "../../../core/odontogram";
import {
  SettingsModalComponent,
  SETTINGS_TABS,
  type SettingsState,
} from "../settings-modal.component";
import { setI18nLanguage } from "../../../core/i18n/useI18n";
import { makeSettings as makeBaseSettings } from "../testing/make-settings";

const ALL_ROW_IDS: PerioRowId[] = [
  "plaque", "bop", "cal", "gm", "pd", "furcation", "mobility", "cej",
  "rootConcavity", "pi", "gi", "mpi", "mbi", "kg", "gt", "miller",
];

afterEach(() => {
  // Restore module-level defaults so this file doesn't leak state into
  // other test files sharing the same module instance.
  for (const id of ALL_ROW_IDS) setPerioRowVisibility(id, true);
  setPerioIndexNameMode("translated");
});

// Wraps the shared stubbed-fixture base with the 4 fields this file's
// describe 1 needs wired to the real engine seams instead of stubs — see
// `testing/make-settings.ts`'s header comment.
function makeSettings(overrides: Partial<SettingsState> = {}): SettingsState {
  return makeBaseSettings({
    perioRowVisibility: getPerioRowVisibility(),
    onPerioRowVisibility: (id, v) => setPerioRowVisibility(id, v),
    perioIndexNameMode: getPerioIndexNameMode(),
    onPerioIndexNameMode: (v) => setPerioIndexNameMode(v),
    ...overrides,
  });
}

describe("UI-2 Task 1: module flags (odontogram.ts)", () => {
  it("defaults: every row visible, name mode 'translated'", () => {
    const visibility = getPerioRowVisibility();
    for (const id of ALL_ROW_IDS) {
      expect(visibility[id]).toBe(true);
    }
    expect(Object.keys(visibility).sort()).toEqual([...ALL_ROW_IDS].sort());
    expect(getPerioIndexNameMode()).toBe("translated");
  });

  it("setPerioRowVisibility flips a single row and persists via the getter", () => {
    expect(getPerioRowVisibility().pi).toBe(true);
    setPerioRowVisibility("pi", false);
    expect(getPerioRowVisibility().pi).toBe(false);
    // Other rows are untouched.
    expect(getPerioRowVisibility().gi).toBe(true);
    setPerioRowVisibility("pi", true);
    expect(getPerioRowVisibility().pi).toBe(true);
  });

  it("setPerioIndexNameMode flips the mode and persists via the getter", () => {
    expect(getPerioIndexNameMode()).toBe("translated");
    setPerioIndexNameMode("canonical");
    expect(getPerioIndexNameMode()).toBe("canonical");
    setPerioIndexNameMode("translated");
    expect(getPerioIndexNameMode()).toBe("translated");
  });
});

@Component({
  imports: [SettingsModalComponent],
  template: `<aao-settings-modal [open]="open()" [settings]="settings()" (close)="closed = true" />`,
})
class HostComponent {
  open = signal(true);
  settings = signal<SettingsState>(makeSettings());
  closed = false;
}

async function renderPeriodontal(settings: SettingsState) {
  // resetTestingModule() first: the availability-toggle test below mounts
  // two independent instances (on/off) within one `it()`, which would
  // otherwise hit "test module already instantiated" on the second call.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [provideZonelessChangeDetection()],
  });
  const f = TestBed.createComponent(HostComponent);
  f.componentInstance.settings.set(settings);
  await f.whenStable();

  const tabBtn = f.nativeElement.querySelector(
    "#odon-settings-tab-periodontalChart",
  ) as HTMLButtonElement;
  tabBtn.click();
  await f.whenStable();

  return f;
}

describe("UI-2 Task 1: Periodontal settings tab", () => {
  beforeEach(() => setI18nLanguage("en"));

  it("is registered with the expected id/titleKey", () => {
    const tab = SETTINGS_TABS.find((tab) => tab.id === "periodontalChart");
    expect(tab).toBeTruthy();
    expect(tab?.titleKey).toBe("settings.tab.periodontalChart");
  });

  it("renders one checkbox row per the 16 row ids (+ the availability toggle), all checked by default", async () => {
    const s = makeSettings();
    const f = await renderPeriodontal(s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const checkboxes = Array.from(
      panel.querySelectorAll('input[type="checkbox"]'),
    ) as HTMLInputElement[];
    // Round 2 (Stage 4): + the "Periodontal chart available" toggle at the top.
    expect(checkboxes.length).toBe(ALL_ROW_IDS.length + 1);
    for (const cb of checkboxes) {
      expect(cb.checked).toBe(true);
    }
  });

  it("renders group sub-headings, led by a General group", async () => {
    const s = makeSettings();
    const f = await renderPeriodontal(s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const headings = Array.from(panel.querySelectorAll(".odon-settings-group-title")).map(
      (el) => el.textContent,
    );
    // Round 2 (Stage 4): a "General" group heads the tab (availability + view).
    expect(headings).toEqual([
      "General",
      "Pocket Chart",
      "Hygiene",
      "Mucogingival",
      "Support",
      "Peri-implant",
    ]);
  });

  it("renders an index-name mode select bound to perioIndexNameMode", async () => {
    const s = makeSettings({ perioIndexNameMode: "canonical" });
    const f = await renderPeriodontal(s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const select = panel.querySelector('select[aria-label="Index names"]') as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("canonical");
  });

  it("toggling a row's checkbox calls onPerioRowVisibility(id, false)", async () => {
    const onPerioRowVisibility = vi.fn();
    const s = makeSettings({ onPerioRowVisibility });
    const f = await renderPeriodontal(s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    // "pi" (Plaque Index) is charted with aria-label "Plaque Index (PI)" —
    // the translated form of the source's `settings.perio.row.pi` key text.
    const checkbox = panel.querySelector(
      'input[aria-label="Plaque Index (PI)"]',
    ) as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(true);

    checkbox.click();
    await f.whenStable();
    expect(onPerioRowVisibility).toHaveBeenCalledWith("pi", false);
  });

  it("changing the index-name select calls onPerioIndexNameMode('canonical')", async () => {
    const onPerioIndexNameMode = vi.fn();
    const s = makeSettings({ onPerioIndexNameMode });
    const f = await renderPeriodontal(s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const select = panel.querySelector('select[aria-label="Index names"]') as HTMLSelectElement;
    select.value = "canonical";
    select.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(onPerioIndexNameMode).toHaveBeenCalledWith("canonical");
  });

  it("Round 2 (Stage 4): availability toggle is wired; disabling it disables the other perio controls", async () => {
    const onPerioChartAvailable = vi.fn();

    // Available: the availability toggle is on and enabled; sub-controls enabled.
    const on = await renderPeriodontal(
      makeSettings({ perioChartAvailable: true, onPerioChartAvailable }),
    );
    const onPanel = on.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;
    const availOn = onPanel.querySelector(
      'input[aria-label="Periodontal chart"]',
    ) as HTMLInputElement;
    expect(availOn).toBeTruthy();
    expect(availOn.checked).toBe(true);
    expect(availOn.disabled).toBe(false);
    expect(
      (onPanel.querySelector('input[aria-label="Plaque Index (PI)"]') as HTMLInputElement)
        .disabled,
    ).toBe(false);
    expect(
      (onPanel.querySelector('select[aria-label="Periodontal chart view"]') as HTMLSelectElement)
        .disabled,
    ).toBe(false);
    availOn.click();
    await on.whenStable();
    expect(onPerioChartAvailable).toHaveBeenCalledWith(false);

    // Unavailable: every OTHER perio control is disabled (the toggle itself stays on).
    const off = await renderPeriodontal(makeSettings({ perioChartAvailable: false }));
    const offPanel = off.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;
    expect(
      (offPanel.querySelector('input[aria-label="Periodontal chart"]') as HTMLInputElement)
        .disabled,
    ).toBe(false);
    expect(
      (offPanel.querySelector('input[aria-label="Plaque Index (PI)"]') as HTMLInputElement)
        .disabled,
    ).toBe(true);
    expect(
      (offPanel.querySelector('select[aria-label="Periodontal chart view"]') as HTMLSelectElement)
        .disabled,
    ).toBe(true);
    expect(
      (offPanel.querySelector('select[aria-label="Index names"]') as HTMLSelectElement).disabled,
    ).toBe(true);
  });
});
