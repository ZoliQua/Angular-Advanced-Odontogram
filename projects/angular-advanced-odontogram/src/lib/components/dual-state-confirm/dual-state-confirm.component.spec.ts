// Angular port of $ENGINE/src/__tests__/ds1-confirm.test.ts's
// `<DualStateConfirm> component` describe block (~line 299-340), plus the
// focus-trap/restore contract from $ENGINE/src/DualStateConfirm.tsx
// (lines 45-82) that the source-repo React test doesn't exercise directly.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { DualStateConfirmComponent } from "./dual-state-confirm.component";
import { setI18nLanguage } from "../../core/i18n/useI18n";

@Component({
  imports: [DualStateConfirmComponent],
  template: `<button id="opener" type="button">opener</button>
    <aao-dual-state-confirm
      [open]="open()"
      (accept)="accepted = true"
      (cancel)="cancelled = true"
    />`,
})
class HostComponent {
  open = signal(false);
  accepted = false;
  cancelled = false;
}

describe("DualStateConfirmComponent", () => {
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

  it("renders nothing while closed (no #dualStateConfirm dialog)", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#dualStateConfirm")).toBeNull();
    expect(f.nativeElement.querySelector(".odon-confirm-backdrop")).toBeNull();
  });

  it("renders #dualStateConfirm role=dialog with message + Igen/Mégse-equivalent labels when open", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();

    const dialog = f.nativeElement.querySelector("#dualStateConfirm") as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute("role")).toBe("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.classList.contains("odon-confirm-modal")).toBe(true);

    const backdrop = f.nativeElement.querySelector(".odon-confirm-backdrop");
    expect(backdrop).not.toBeNull();

    const message = f.nativeElement.querySelector(".odon-confirm-message") as HTMLElement;
    expect(message.textContent?.length).toBeGreaterThan(0);

    const buttons = dialog.querySelectorAll("button");
    expect(buttons.length).toBe(2);
    expect(buttons[0].classList.contains("odon-confirm-cancel")).toBe(true);
    expect(buttons[1].classList.contains("odon-confirm-accept")).toBe(true);
  });

  it("opens, fires accept on the 2nd (accept) button, and closes cleanly", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#dualStateConfirm") as HTMLElement;
    (dialog.querySelectorAll("button")[1] as HTMLButtonElement).click(); // accept is the 2nd button, as in the TSX
    await f.whenStable();
    expect(f.componentInstance.accepted).toBe(true);
  });

  it("fires cancel on the 1st (cancel) button", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#dualStateConfirm") as HTMLElement;
    (dialog.querySelectorAll("button")[0] as HTMLButtonElement).click();
    await f.whenStable();
    expect(f.componentInstance.cancelled).toBe(true);
  });

  it("Escape fires cancel", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#dualStateConfirm") as HTMLElement;
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.cancelled).toBe(true);
  });

  it("backdrop mousedown on itself fires cancel (self-target only, per TSX 89-91)", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();
    const backdrop = f.nativeElement.querySelector(".odon-confirm-backdrop") as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.cancelled).toBe(true);
  });

  it("mousedown that bubbles up from inside the dialog does NOT fire cancel", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#dualStateConfirm") as HTMLElement;
    dialog.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.cancelled).toBe(false);
  });

  it("on open, moves focus into the dialog (first focusable element)", async () => {
    const f = TestBed.createComponent(HostComponent);
    const opener = f.nativeElement.querySelector("#opener") as HTMLButtonElement;
    opener.focus();
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#dualStateConfirm") as HTMLElement;
    const firstButton = dialog.querySelectorAll("button")[0];
    expect(document.activeElement).toBe(firstButton);
  });

  it("on close, restores focus to the opener element", async () => {
    const f = TestBed.createComponent(HostComponent);
    const opener = f.nativeElement.querySelector("#opener") as HTMLButtonElement;
    opener.focus();
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    f.componentInstance.open.set(false);
    await f.whenStable();
    expect(document.activeElement).toBe(opener);
  });

  it("Tab from the last focusable element wraps to the first (manual focus trap)", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#dualStateConfirm") as HTMLElement;
    const buttons = dialog.querySelectorAll("button");
    const first = buttons[0] as HTMLButtonElement;
    const last = buttons[buttons.length - 1] as HTMLButtonElement;
    last.focus();
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }));
    await f.whenStable();
    expect(document.activeElement).toBe(first);
  });

  it("Shift+Tab from the first focusable element wraps to the last (manual focus trap)", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#dualStateConfirm") as HTMLElement;
    const buttons = dialog.querySelectorAll("button");
    const first = buttons[0] as HTMLButtonElement;
    const last = buttons[buttons.length - 1] as HTMLButtonElement;
    first.focus();
    dialog.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true }),
    );
    await f.whenStable();
    expect(document.activeElement).toBe(last);
  });
});
