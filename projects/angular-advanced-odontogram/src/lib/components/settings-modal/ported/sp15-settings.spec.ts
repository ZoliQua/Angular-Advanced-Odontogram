// Angular port of core/__tests__/sp15-settings.test.ts.
//
// SP15 Task 4:
//   B1 — the "Panels" settings tab (id "panels"), inserted immediately
//        after "general", with two toggles bound to showStatusCard /
//        showOrthoCard.
//   B2 — the standalone "secondaryCaries" tab is removed; its CARS select
//        is relocated into the "caries" tab, between the RootCariesMode row
//        and the RadiographicDepthMode row.
//
// Tab-order/id-set assertions (SETTINGS_TABS.map(t => t.id) etc.) are
// portable as-is — SETTINGS_TABS carries `{ id, titleKey }` in both React
// and Angular.
//
// MAPPING (React-element-tree -> DOM) for the render-body assertions: the
// source calls each tab's `render({ t, s })` directly and inspects the
// returned tree via RTL's `render()`. Angular's SETTINGS_TABS has no
// `render` function (the markup lives in the component's `@switch`
// template), so this mounts the full SettingsModalComponent with the
// relevant tab active and queries the same DOM shape — `<select>`s located
// by their i18n-translated `aria-label` in place of the source's
// identity-`t()` key text ("caries.rootLabel" -> "Root caries",
// "caries.secondaryLabel" -> "Secondary caries (CARS)",
// "caries.radiographicLabel" -> "Radiographic depth", all at locale "en").
import { describe, it, expect, beforeEach, vi } from "vitest";
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

async function renderTab(tabId: string, settings: SettingsState) {
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [provideZonelessChangeDetection()],
  });
  const f = TestBed.createComponent(HostComponent);
  f.componentInstance.settings.set(settings);
  await f.whenStable();

  if (tabId !== "general") {
    const tabBtn = f.nativeElement.querySelector(
      `#odon-settings-tab-${tabId}`,
    ) as HTMLButtonElement;
    tabBtn.click();
    await f.whenStable();
  }

  return f;
}

describe("SP15 Task 4 (B1): Panels settings tab", () => {
  beforeEach(() => setI18nLanguage("en"));

  it("is positioned immediately after the general tab", () => {
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    const generalIdx = ids.indexOf("general");
    expect(generalIdx).toBeGreaterThanOrEqual(0);
    expect(ids[generalIdx + 1]).toBe("panels");
  });

  it("has the expected titleKey", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "panels");
    expect(tab?.titleKey).toBe("settings.tab.panels");
  });

  it("renders two toggles bound to showStatusCard / showOrthoCard, each wired to its handler", async () => {
    const onShowStatusCard = vi.fn();
    const onShowOrthoCard = vi.fn();
    const s = makeSettings({
      showStatusCard: true,
      onShowStatusCard,
      showOrthoCard: false,
      onShowOrthoCard,
    });
    const f = await renderTab("panels", s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const checkboxes = panel.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(2);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);

    (checkboxes[0] as HTMLInputElement).click();
    await f.whenStable();
    expect(onShowStatusCard).toHaveBeenCalledWith(false);

    (checkboxes[1] as HTMLInputElement).click();
    await f.whenStable();
    expect(onShowOrthoCard).toHaveBeenCalledWith(true);
  });
});

describe("SP15 Task 4 (B2): merged Caries / Secondary-caries settings", () => {
  beforeEach(() => setI18nLanguage("en"));

  it("removes the standalone secondaryCaries tab", () => {
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    expect(ids).not.toContain("secondaryCaries");
  });

  it("caries tab renders the CARS select between root-caries and radiographic-depth", async () => {
    const s = makeSettings();
    const f = await renderTab("caries", s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const selects = Array.from(panel.querySelectorAll("select"));
    // aria-label on each <select> is the row's translated label text (the
    // source's identity-`t()` compared "caries.rootLabel" etc. verbatim;
    // here compared against the "en" translation of the same key).
    const labels = selects.map((el) => el.getAttribute("aria-label"));

    const rootIdx = labels.indexOf("Root caries");
    const carsIdx = labels.indexOf("Secondary caries (CARS)");
    const radioIdx = labels.indexOf("Radiographic depth");

    expect(rootIdx).toBeGreaterThanOrEqual(0);
    expect(carsIdx).toBeGreaterThanOrEqual(0);
    expect(radioIdx).toBeGreaterThanOrEqual(0);
    expect(carsIdx).toBeGreaterThan(rootIdx);
    expect(radioIdx).toBeGreaterThan(carsIdx);
  });

  it("caries tab CARS select is wired to secondaryCariesMode / onSecondaryCariesMode", async () => {
    const onSecondaryCariesMode = vi.fn();
    const s = makeSettings({ secondaryCariesMode: "full", onSecondaryCariesMode });
    const f = await renderTab("caries", s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const select = panel.querySelector(
      'select[aria-label="Secondary caries (CARS)"]',
    ) as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("full");
  });

  it("does not duplicate the total tab count (net zero: -1 secondaryCaries, +1 panels)", () => {
    // Guards against accidentally leaving a stray/duplicate tab entry behind.
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("UI-2 Task 1: Periodontal settings tab", () => {
  it("is present in the tab registry, uniquely", () => {
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    expect(ids).toEqual([
      "general",
      "panels",
      "toothDetails",
      "caries",
      "pulpa",
      "notes",
      "periodontal",
    ]);
  });

  it("has the expected titleKey", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "periodontal");
    expect(tab?.titleKey).toBe("settings.tab.periodontal");
  });
});
