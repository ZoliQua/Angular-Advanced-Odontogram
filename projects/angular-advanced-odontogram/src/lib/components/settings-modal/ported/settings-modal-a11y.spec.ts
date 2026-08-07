// Angular port of core/__tests__/settings-modal-a11y.test.tsx.
//
// Near-1:1 port: the source's `render(<SettingsModal .../>)` + RTL's
// `screen.getAllByRole("tab")`/`fireEvent.keyDown` map directly onto
// mounting SettingsModalComponent and dispatching bubbling `KeyboardEvent`s
// at the tab buttons — the same APG-tabs contract (roving tabindex,
// activation-follows-focus, Left/Right/Up/Down wrap, Home/End) is
// implemented by `onTabListKeyDown` in settings-modal.component.ts. No
// element-tree assertions to remap here; only the render/query mechanics
// change (TestBed instead of RTL).
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { SettingsModalComponent, type SettingsState } from "../settings-modal.component";
import { setI18nLanguage } from "../../../core/i18n/useI18n";
import { makeSettings } from "../testing/make-settings";

@Component({
  imports: [SettingsModalComponent],
  template: `<aao-settings-modal [open]="open()" [settings]="settings()" (close)="closed = true" />`,
})
class HostComponent {
  open = signal(false);
  settings = signal<SettingsState>(makeSettings());
  closed = false;
}

async function renderModal() {
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [provideZonelessChangeDetection()],
  });
  const f = TestBed.createComponent(HostComponent);
  f.componentInstance.open.set(true);
  await f.whenStable();
  return f;
}

function tabs(f: ReturnType<typeof TestBed.createComponent<HostComponent>>): HTMLElement[] {
  return Array.from(f.nativeElement.querySelectorAll('[role="tab"]'));
}

function selectedTab(
  f: ReturnType<typeof TestBed.createComponent<HostComponent>>,
): HTMLElement | undefined {
  return tabs(f).find((el) => el.getAttribute("aria-selected") === "true");
}

function keyDown(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
}

describe("FIX 2: SettingsModal tablist keyboard navigation", () => {
  beforeEach(() => setI18nLanguage("en"));

  it("ArrowRight moves and activates the next tab (wrapping at the end)", async () => {
    const f = await renderModal();
    const all = tabs(f);
    expect(selectedTab(f)).toBe(all[0]);

    keyDown(all[0], "ArrowRight");
    await f.whenStable();
    expect(selectedTab(f)).toBe(all[1]);
    expect(document.activeElement).toBe(all[1]);

    // wrap: ArrowRight from the last tab returns to the first
    keyDown(selectedTab(f)!, "End");
    await f.whenStable();
    expect(selectedTab(f)).toBe(all[all.length - 1]);
    keyDown(selectedTab(f)!, "ArrowRight");
    await f.whenStable();
    expect(selectedTab(f)).toBe(all[0]);
  });

  it("ArrowLeft wraps from the first tab to the last", async () => {
    const f = await renderModal();
    const all = tabs(f);
    keyDown(all[0], "ArrowLeft");
    await f.whenStable();
    expect(selectedTab(f)).toBe(all[all.length - 1]);
    expect(document.activeElement).toBe(all[all.length - 1]);
  });

  it("Home selects the first tab and End the last", async () => {
    const f = await renderModal();
    const all = tabs(f);
    keyDown(all[0], "End");
    await f.whenStable();
    expect(selectedTab(f)).toBe(all[all.length - 1]);
    keyDown(selectedTab(f)!, "Home");
    await f.whenStable();
    expect(selectedTab(f)).toBe(all[0]);
    expect(document.activeElement).toBe(all[0]);
  });

  it("keeps the roving tabindex: exactly one tab has tabIndex 0 after navigation", async () => {
    const f = await renderModal();
    keyDown(tabs(f)[0], "ArrowRight");
    await f.whenStable();
    const zero = tabs(f).filter((el) => el.getAttribute("tabindex") === "0");
    expect(zero).toHaveLength(1);
    expect(zero[0]).toBe(selectedTab(f));
  });
});
