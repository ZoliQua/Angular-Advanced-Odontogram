// Angular port of the SettingsModal contract exercised by
// $ENGINE/src/__tests__/settings-modal-a11y.test.tsx and the SETTINGS_TABS /
// SettingsState shape from $ENGINE/src/SettingsModal.tsx. Cases (a)-(f) per
// the Phase 3 Task 2 brief: closed/open rendering, tab-switch + toggle
// wiring, periodontal tab's 16 rows/5 groups + row-visibility wiring,
// Esc-to-close, and the APG tablist's Arrow-key roving-tabindex navigation.
//
// v2.4.0 resync (Phase 6 Task 3): SETTINGS_TABS reorganized to
// general/odontogram/periodontalChart/toothDetails/caries/fillings/export
// (SettingsModal.tsx@f9b45fc) — cases (c)/(d) and the two select-follows-
// input-update cases below are updated for the new tab ids
// ("panels" -> "odontogram", "periodontal" -> "periodontalChart") and the
// odontogram tab's new content (4 toggles + 2 selects instead of 2 toggles +
// 1 select — perioViewMode moved to periodontalChart). The old "disabled
// export/import placeholder" case is replaced with a case for the new,
// real general-tab export/import toggles (the placeholder was removed by
// the resync — see sp15-settings.spec.ts's dedicated coverage for the full
// toggle set).
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import {
  SettingsModalComponent,
  SETTINGS_TABS,
  type SettingsState,
} from "./settings-modal.component";
import { setI18nLanguage } from "../../core/i18n/useI18n";
import { makeSettings } from "./testing/make-settings";

@Component({
  imports: [SettingsModalComponent],
  template: `<button id="opener" type="button">opener</button>
    <aao-settings-modal [open]="open()" [settings]="settings()" (close)="closed = true" />`,
})
class HostComponent {
  open = signal(false);
  settings = signal<SettingsState>(
    makeSettings({ toothInfo: true, notes: true, pulpLevel: "simple" }),
  );
  closed = false;
}

describe("SettingsModalComponent", () => {
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

  it("(a) renders nothing while closed", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector(".odon-settings-backdrop")).toBeNull();
    expect(f.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it("(b) renders the dialog with all 7 tabs in SETTINGS_TABS order, general selected", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();

    const dialog = f.nativeElement.querySelector(".odon-settings-modal") as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute("role")).toBe("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    const tabs = f.nativeElement.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(SETTINGS_TABS.length);
    expect(tabs.length).toBe(7);
    tabs.forEach((el: Element, i: number) => {
      expect(el.id).toBe(`odon-settings-tab-${SETTINGS_TABS[i].id}`);
    });
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    expect(tabs[0].getAttribute("tabindex")).toBe("0");
    for (let i = 1; i < tabs.length; i++) {
      expect(tabs[i].getAttribute("aria-selected")).toBe("false");
      expect(tabs[i].getAttribute("tabindex")).toBe("-1");
    }
  });

  it("(c) switching to odontogram shows 4 toggles + 3 selects; toggling calls the on* callback", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();

    const odontogramTab = f.nativeElement.querySelector(
      "#odon-settings-tab-odontogram",
    ) as HTMLButtonElement;
    odontogramTab.click();
    await f.whenStable();

    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;
    const switches = panel.querySelectorAll('input[type="checkbox"]');
    expect(switches.length).toBe(4);
    // v2.4.0/1.2.0 resync: screen spacing, screen number size, tooth anatomy.
    const selects = panel.querySelectorAll("select.odon-settings-select");
    expect(selects.length).toBe(3);

    // Order: plan-mode, tooth-info, statuses, orthodontics.
    const statusToggle = switches[2] as HTMLInputElement;
    statusToggle.checked = true;
    statusToggle.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(f.componentInstance.settings().onShowStatusCard).toHaveBeenCalledWith(true);

    const orthoToggle = switches[3] as HTMLInputElement;
    orthoToggle.checked = false;
    orthoToggle.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(f.componentInstance.settings().onShowOrthoCard).toHaveBeenCalledWith(false);
  });

  it("general tab's numbering select reads FDI initially and follows a settings-input update to PALMER", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.settings.set(makeSettings({ numbering: "FDI" }));
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();

    const select = f.nativeElement.querySelector(
      ".odon-settings-panel select.odon-settings-select",
    ) as HTMLSelectElement;
    expect(select.value).toBe("FDI");

    // New SettingsState object through the input signal (mirrors the host
    // re-rendering after its own state changed elsewhere) — exercises the
    // browser's "ask for a reset" <select> algorithm under jsdom, which is
    // what the [attr.value]/[selected]-per-<option> approach leans on.
    f.componentInstance.settings.set(makeSettings({ numbering: "PALMER" }));
    await f.whenStable();
    expect(select.value).toBe("PALMER");
  });

  it("periodontalChart tab's perioViewMode select reads toggle initially and follows a settings-input update to popup", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.settings.set(makeSettings({ perioViewMode: "toggle" }));
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const perioTab = f.nativeElement.querySelector(
      "#odon-settings-tab-periodontalChart",
    ) as HTMLButtonElement;
    perioTab.click();
    await f.whenStable();

    const select = f.nativeElement.querySelector(
      'select[aria-label="Periodontal chart view"]',
    ) as HTMLSelectElement;
    expect(select.value).toBe("toggle");

    f.componentInstance.settings.set(makeSettings({ perioViewMode: "popup" }));
    await f.whenStable();
    expect(select.value).toBe("popup");
  });

  it("(d) periodontalChart tab renders 16 row toggles + the availability toggle + 6 group headings + index-mode select; toggling pd calls onPerioRowVisibility", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();

    const perioTab = f.nativeElement.querySelector(
      "#odon-settings-tab-periodontalChart",
    ) as HTMLButtonElement;
    perioTab.click();
    await f.whenStable();

    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;
    const groupHeadings = panel.querySelectorAll(".odon-settings-group-title");
    // General + the 5 row-id groups.
    expect(groupHeadings.length).toBe(6);

    const rowToggles = panel.querySelectorAll('input[type="checkbox"]');
    // 16 row toggles + the perioChartAvailable toggle.
    expect(rowToggles.length).toBe(17);
    rowToggles.forEach((el: Element) => {
      expect((el as HTMLInputElement).checked).toBe(true);
    });

    // perioViewMode + perioIndexNameMode selects.
    const selects = panel.querySelectorAll("select.odon-settings-select");
    expect(selects.length).toBe(2);

    // pd is the first row toggle after the perioChartAvailable toggle
    // (pocket group: pd, gm, cal, bop).
    const pdToggle = rowToggles[1] as HTMLInputElement;
    pdToggle.checked = false;
    pdToggle.dispatchEvent(new Event("change"));
    await f.whenStable();
    expect(f.componentInstance.settings().onPerioRowVisibility).toHaveBeenCalledWith("pd", false);
  });

  it("(e) Escape emits close", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector(".odon-settings-modal") as HTMLElement;
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.closed).toBe(true);
  });

  it("(f) ArrowRight on the tablist moves aria-selected + roving tabindex to the next tab", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();

    const tablist = f.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
    tablist.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }),
    );
    await f.whenStable();

    const generalTab = f.nativeElement.querySelector("#odon-settings-tab-general") as HTMLElement;
    const odontogramTab = f.nativeElement.querySelector(
      "#odon-settings-tab-odontogram",
    ) as HTMLElement;
    expect(generalTab.getAttribute("aria-selected")).toBe("false");
    expect(generalTab.getAttribute("tabindex")).toBe("-1");
    expect(odontogramTab.getAttribute("aria-selected")).toBe("true");
    expect(odontogramTab.getAttribute("tabindex")).toBe("0");
    expect(document.activeElement).toBe(odontogramTab);
  });

  it("ArrowLeft from the first tab wraps to the last tab", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();

    const tablist = f.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
    tablist.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }),
    );
    await f.whenStable();

    const lastTab = f.nativeElement.querySelector(
      `#odon-settings-tab-${SETTINGS_TABS[SETTINGS_TABS.length - 1].id}`,
    ) as HTMLElement;
    expect(lastTab.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(lastTab);
  });

  it("End jumps to the last tab, Home jumps back to the first", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();

    const tablist = f.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
    tablist.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    await f.whenStable();
    const lastTab = f.nativeElement.querySelector(
      `#odon-settings-tab-${SETTINGS_TABS[SETTINGS_TABS.length - 1].id}`,
    ) as HTMLElement;
    expect(lastTab.getAttribute("aria-selected")).toBe("true");

    tablist.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    await f.whenStable();
    const firstTab = f.nativeElement.querySelector("#odon-settings-tab-general") as HTMLElement;
    expect(firstTab.getAttribute("aria-selected")).toBe("true");
  });

  it("backdrop mousedown on itself emits close; bubbled mousedown from inside does not", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();

    const dialog = f.nativeElement.querySelector(".odon-settings-modal") as HTMLElement;
    dialog.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.closed).toBe(false);

    const backdrop = f.nativeElement.querySelector(".odon-settings-backdrop") as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.closed).toBe(true);
  });

  it("on open, moves focus into the dialog; on close, restores focus to the opener", async () => {
    const f = TestBed.createComponent(HostComponent);
    const opener = f.nativeElement.querySelector("#opener") as HTMLButtonElement;
    opener.focus();
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector(".odon-settings-modal") as HTMLElement;
    expect(dialog.contains(document.activeElement)).toBe(true);

    f.componentInstance.open.set(false);
    await f.whenStable();
    expect(document.activeElement).toBe(opener);
  });

  it("the general tab's export/import toggles are real controls (no disabled placeholder)", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();

    const panel = f.nativeElement.querySelector(".odon-settings-panel") as HTMLElement;
    expect(f.nativeElement.querySelector(".odon-settings-row-disabled")).toBeNull();
    expect(f.nativeElement.querySelector(".odon-settings-badge")).toBeNull();
    expect(panel.querySelector('input[aria-label="PNG image export"]')).not.toBeNull();
    expect(panel.querySelector('input[aria-label="Status JSON import"]')).not.toBeNull();
  });

  it("the Export Settings tab is disabled when exportPdf is off, and falls back to the general panel", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.settings.set(makeSettings({ exportPdf: false }));
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();

    const exportTab = f.nativeElement.querySelector(
      "#odon-settings-tab-export",
    ) as HTMLButtonElement;
    expect(exportTab.getAttribute("aria-disabled")).toBe("true");
    expect(exportTab.classList.contains("is-disabled")).toBe(true);

    exportTab.click();
    await f.whenStable();
    // Click on a disabled tab is a no-op — general stays active/rendered.
    expect(f.nativeElement.querySelector('[id="odon-settings-panel-general"]')).not.toBeNull();
    expect(exportTab.getAttribute("aria-selected")).toBe("false");
  });
});
