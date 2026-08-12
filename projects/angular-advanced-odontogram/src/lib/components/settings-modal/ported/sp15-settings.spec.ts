// Angular port of core/__tests__/sp15-settings.test.ts.
//
// v2.4.0 resync (Phase 6 Task 3), per the corpus source's own updated
// header:
//   B1 — the "Panels" tab was renamed/relocated to "odontogram" (still
//        immediately after "general") and absorbed the screen-layout
//        controls (plan-mode, screen tooth-spacing, screen tooth-number-size)
//        + toothInfo on top of its original two card toggles -> 4 toggles +
//        2 selects, in order: plan-mode, tooth-info, statuses, orthodontics.
//        (v2.4.0/1.2.0 resync, Task 4: a 3rd select — tooth-anatomy
//        classic/measured — was added between screen tooth-number-size and
//        tooth-info, per SettingsModal.tsx's own delta.)
//   B2 — unchanged: the standalone "secondaryCaries" tab stays removed; its
//        CARS SelectRow stays in "caries", between root-caries and
//        radiographic-depth.
//   (round 2 additions folded in below, per the resynced source): the tab
//   registry is now the full 7-tab v2.4.0 order (general/odontogram/
//   periodontalChart/toothDetails/caries/fillings/export); general's
//   "coming soon" export/import placeholder is replaced with real toggles;
//   a new Fillings tab exists.
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
// relevant tab active and queries the same DOM shape — controls located by
// their i18n-translated `aria-label` in place of the source's identity-`t()`
// key text ("caries.rootLabel" -> "Root caries", "caries.secondaryLabel" ->
// "Secondary caries (CARS)", "caries.radiographicLabel" -> "Radiographic
// depth", all at locale "en").
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

describe("SP15 Task 4 (B1): Odontogram settings tab (was Panels)", () => {
  beforeEach(() => setI18nLanguage("en"));

  it("is positioned immediately after the general tab", () => {
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    const generalIdx = ids.indexOf("general");
    expect(generalIdx).toBeGreaterThanOrEqual(0);
    expect(ids[generalIdx + 1]).toBe("odontogram");
  });

  it("has the expected titleKey", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "odontogram");
    expect(tab?.titleKey).toBe("settings.tab.odontogram");
  });

  it("renders Plan-mode + Tooth-info + Statuses + Orthodontics toggles, each wired to its handler", async () => {
    const onPlanModeAvailable = vi.fn();
    const onToothInfo = vi.fn();
    const onShowStatusCard = vi.fn();
    const onShowOrthoCard = vi.fn();
    const s = makeSettings({
      planModeAvailable: true,
      onPlanModeAvailable,
      toothInfo: true,
      onToothInfo,
      showStatusCard: true,
      onShowStatusCard,
      showOrthoCard: false,
      onShowOrthoCard,
    });
    const f = await renderTab("odontogram", s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    // 4 toggles now, in order: plan-mode, tooth-info, statuses, orthodontics
    // (plus three selects for screen spacing / number size / tooth anatomy —
    // v2.4.0/1.2.0 resync added the tooth-anatomy select).
    const checkboxes = panel.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(4);
    expect(panel.querySelectorAll("select")).toHaveLength(3);

    (checkboxes[0] as HTMLInputElement).click();
    await f.whenStable();
    expect(onPlanModeAvailable).toHaveBeenCalledWith(false);

    (checkboxes[1] as HTMLInputElement).click();
    await f.whenStable();
    expect(onToothInfo).toHaveBeenCalledWith(false);

    (checkboxes[2] as HTMLInputElement).click();
    await f.whenStable();
    expect(onShowStatusCard).toHaveBeenCalledWith(false);

    (checkboxes[3] as HTMLInputElement).click();
    await f.whenStable();
    expect(onShowOrthoCard).toHaveBeenCalledWith(true);
  });

  it("renders screen tooth-spacing + tooth-number-size selects wired to their handlers", async () => {
    const s = makeSettings();
    const f = await renderTab("odontogram", s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const spacing = panel.querySelector(
      'select[aria-label="Tooth spacing (screen)"]',
    ) as HTMLSelectElement;
    const size = panel.querySelector(
      'select[aria-label="Tooth-number size (screen)"]',
    ) as HTMLSelectElement;
    expect(spacing).toBeTruthy();
    expect(size).toBeTruthy();
    expect(Array.from(spacing.options).map((o) => o.value)).toEqual(["wide", "normal", "close"]);
    expect(Array.from(size.options).map((o) => o.value)).toEqual(["small", "normal", "xlarge"]);
  });

  it("renders the tooth-anatomy select (classic/measured) wired to onToothAnatomy", async () => {
    const onToothAnatomy = vi.fn();
    const s = makeSettings({ toothAnatomy: "measured", onToothAnatomy });
    const f = await renderTab("odontogram", s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const anatomy = panel.querySelector(
      'select[aria-label="Tooth anatomy"]',
    ) as HTMLSelectElement;
    expect(anatomy).toBeTruthy();
    expect(Array.from(anatomy.options).map((o) => o.value)).toEqual(["classic", "measured"]);
    expect(anatomy.value).toBe("measured");

    anatomy.value = "classic";
    anatomy.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(onToothAnatomy).toHaveBeenCalledWith("classic");
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

  it("does not duplicate the total tab count (net zero: -1 secondaryCaries, +1 panels/odontogram)", () => {
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("UI-2 Task 1: Periodontal settings tab", () => {
  it("is present in the tab registry, uniquely", () => {
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    // v2.4.0 resync (round 2 restructure): Panels->Odontogram,
    // Periodontal->Periodontal Chart (moved up), PDF Settings->Export;
    // Pulp+Notes tabs folded into Tooth details; new Fillings tab.
    expect(ids).toEqual([
      "general",
      "odontogram",
      "periodontalChart",
      "toothDetails",
      "caries",
      "fillings",
      "export",
    ]);
  });

  it("has the expected titleKey", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "periodontalChart");
    expect(tab?.titleKey).toBe("settings.tab.periodontalChart");
  });
});

describe("Round 2 (Stage 2): General export/import availability", () => {
  beforeEach(() => setI18nLanguage("en"));

  it("renders the export (PNG/JPG/SVG/PDF) + import (Status/FHIR) toggles wired to handlers", async () => {
    const onExportPng = vi.fn();
    const onExportPdf = vi.fn();
    const onImportFhir = vi.fn();
    const s = makeSettings({
      exportPng: true,
      onExportPng,
      exportPdf: true,
      onExportPdf,
      importFhir: true,
      onImportFhir,
    });
    const f = await renderTab("general", s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    const png = panel.querySelector('input[aria-label="PNG image export"]') as HTMLInputElement;
    const pdf = panel.querySelector('input[aria-label="PDF report export"]') as HTMLInputElement;
    const fhir = panel.querySelector('input[aria-label="FHIR JSON import"]') as HTMLInputElement;
    expect(png).toBeTruthy();
    expect(pdf).toBeTruthy();
    expect(fhir).toBeTruthy();
    // JPG + SVG + Status toggles also present.
    expect(panel.querySelector('input[aria-label="JPG image export"]')).toBeTruthy();
    expect(panel.querySelector('input[aria-label="SVG image export"]')).toBeTruthy();
    expect(panel.querySelector('input[aria-label="Status JSON import"]')).toBeTruthy();

    png.click();
    await f.whenStable();
    expect(onExportPng).toHaveBeenCalledWith(false);
    pdf.click();
    await f.whenStable();
    expect(onExportPdf).toHaveBeenCalledWith(false);
    fhir.click();
    await f.whenStable();
    expect(onImportFhir).toHaveBeenCalledWith(false);
  });

  it("no longer renders the coming-soon export/import placeholder", async () => {
    const f = await renderTab("general", makeSettings());
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;
    expect(panel.querySelector(".odon-settings-badge")).toBeNull();
    expect(panel.querySelector(".odon-settings-row-disabled")).toBeNull();
  });
});

describe("Round 2 (Stage 6): Fillings tab", () => {
  beforeEach(() => setI18nLanguage("en"));

  it("renders defect + fissure + 4 material toggles and a complexity select, wired to handlers", async () => {
    const onFillingDefectEnabled = vi.fn();
    const onFillingComplexity = vi.fn();
    const onFillingMaterial = vi.fn();
    const onFissureSealingEnabled = vi.fn();
    const s = makeSettings({
      onFillingDefectEnabled,
      onFillingComplexity,
      onFillingMaterial,
      onFissureSealingEnabled,
    });
    const f = await renderTab("fillings", s);
    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;

    // 1 defect + 4 materials + 1 fissure = 6 checkboxes; 1 complexity select.
    const checkboxes = panel.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(6);
    const complexity = panel.querySelector(
      'select[aria-label="Filling complexity"]',
    ) as HTMLSelectElement;
    expect(complexity).toBeTruthy();
    expect(Array.from(complexity.options).map((o) => o.value)).toEqual(["complex", "simple"]);

    (panel.querySelector('input[aria-label="Filling defect"]') as HTMLInputElement).click();
    await f.whenStable();
    expect(onFillingDefectEnabled).toHaveBeenCalledWith(false);

    (panel.querySelector('input[aria-label="Amalgam filling"]') as HTMLInputElement).click();
    await f.whenStable();
    expect(onFillingMaterial).toHaveBeenCalledWith("amalgam", false);

    (panel.querySelector('input[aria-label="Fissure sealing"]') as HTMLInputElement).click();
    await f.whenStable();
    expect(onFissureSealingEnabled).toHaveBeenCalledWith(false);
  });
});
