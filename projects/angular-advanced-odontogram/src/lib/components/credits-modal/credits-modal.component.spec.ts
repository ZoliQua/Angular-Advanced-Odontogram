// Angular port of $ENGINE@934a911:src/CreditsModal.tsx's dialog contract
// (open/close, Escape, backdrop dismiss, focus trap/restore) — same shape as
// dual-state-confirm.component.spec.ts, plus assertions for this task's
// adapted strings/links (see credits-modal.component.ts's header comment for
// the full adaptation rationale). 2026-08-19: the Contributors section was
// removed from the component per owner directive; the "creator + all 4
// contributors + libraries" assertion below was split into a creator/
// libraries assertion plus a new absence assertion (no Contributors heading,
// none of the previously-listed contributor GitHub handles render).
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { CreditsModalComponent } from "./credits-modal.component";
import { setI18nLanguage } from "../../core/i18n/useI18n";

@Component({
  imports: [CreditsModalComponent],
  template: `<button id="opener" type="button">opener</button>
    <aao-credits-modal [open]="open()" (close)="closed = true" />`,
})
class HostComponent {
  open = signal(false);
  closed = false;
}

describe("CreditsModalComponent", () => {
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

  it("renders nothing while closed (no #creditsModal dialog)", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#creditsModal")).toBeNull();
    expect(f.nativeElement.querySelector(".odon-confirm-backdrop")).toBeNull();
  });

  it("renders #creditsModal role=dialog + title when open", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();

    const dialog = f.nativeElement.querySelector("#creditsModal") as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute("role")).toBe("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.classList.contains("odon-credits-modal")).toBe(true);

    const backdrop = f.nativeElement.querySelector(".odon-confirm-backdrop");
    expect(backdrop).not.toBeNull();

    const title = dialog.querySelector(".odon-credits-title") as HTMLElement;
    expect(title.textContent?.length).toBeGreaterThan(0);
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
  });

  it("renders the creator and the libraries list", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#creditsModal") as HTMLElement;

    const links = Array.from(dialog.querySelectorAll("a.odon-credits-link")) as HTMLAnchorElement[];
    const creatorLink = links.find((a) => a.getAttribute("href") === "https://github.com/ZoliQua");
    expect(creatorLink).toBeTruthy();

    const libNames = (Array.from(dialog.querySelectorAll(".odon-credits-libs a")) as HTMLAnchorElement[]).map(
      (a) => a.textContent?.trim(),
    );
    expect(libNames).toEqual(["jsPDF", "DOMPurify", "Angular", "Angular CLI", "TypeScript", "Tailwind CSS"]);
  });

  it("renders no Contributors section (owner directive, 2026-08-19)", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#creditsModal") as HTMLElement;

    const headings = Array.from(dialog.querySelectorAll(".odon-credits-heading")).map((el) => el.textContent);
    expect(headings.some((h) => h?.toLowerCase().includes("contributor"))).toBe(false);

    const links = Array.from(dialog.querySelectorAll("a.odon-credits-link")) as HTMLAnchorElement[];
    for (const handle of ["odontodev", "JulianoBazzi", "yassine-bhn", "saegerdirk-star"]) {
      expect(links.some((a) => a.getAttribute("href") === `https://github.com/${handle}`)).toBe(false);
    }
  });

  it("the bottom 'star' CTA points at this package's own repo (adapted app-identity link)", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const star = f.nativeElement.querySelector(".odon-credits-star") as HTMLAnchorElement;
    expect(star.getAttribute("href")).toBe("https://github.com/ZoliQua/Angular-Advanced-Odontogram");
  });

  it("renders a visible, clickable 'Original Project' credit linking the upstream React repo (review round 1 fix)", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#creditsModal") as HTMLElement;

    const heading = Array.from(dialog.querySelectorAll(".odon-credits-heading")).find(
      (el) => el.textContent === "Original Project",
    ) as HTMLElement | undefined;
    expect(heading).toBeTruthy();

    const links = Array.from(dialog.querySelectorAll("a.odon-credits-link")) as HTMLAnchorElement[];
    const originalLink = links.find(
      (a) => a.getAttribute("href") === "https://github.com/ZoliQua/React-Odontogram-Modul",
    );
    expect(originalLink).toBeTruthy();
    expect(originalLink?.textContent?.trim()).toBe("React Advanced Odontogram");
  });

  it("close button fires close", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#creditsModal") as HTMLElement;
    (dialog.querySelector(".odon-settings-close") as HTMLButtonElement).click();
    await f.whenStable();
    expect(f.componentInstance.closed).toBe(true);
  });

  it("Escape fires close", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#creditsModal") as HTMLElement;
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.closed).toBe(true);
  });

  it("backdrop mousedown on itself fires close (self-target only)", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();
    const backdrop = f.nativeElement.querySelector(".odon-confirm-backdrop") as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.closed).toBe(true);
  });

  it("mousedown that bubbles up from inside the dialog does NOT fire close", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#creditsModal") as HTMLElement;
    dialog.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.closed).toBe(false);
  });

  it("on open, moves focus into the dialog (first focusable element)", async () => {
    const f = TestBed.createComponent(HostComponent);
    const opener = f.nativeElement.querySelector("#opener") as HTMLButtonElement;
    opener.focus();
    await f.whenStable();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#creditsModal") as HTMLElement;
    const first = dialog.querySelector(".odon-settings-close") as HTMLButtonElement;
    expect(document.activeElement).toBe(first);
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
    const dialog = f.nativeElement.querySelector("#creditsModal") as HTMLElement;
    const items = dialog.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = items[0] as HTMLElement;
    const last = items[items.length - 1] as HTMLElement;
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
    const dialog = f.nativeElement.querySelector("#creditsModal") as HTMLElement;
    const items = dialog.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = items[0] as HTMLElement;
    const last = items[items.length - 1] as HTMLElement;
    first.focus();
    dialog.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true }),
    );
    await f.whenStable();
    expect(document.activeElement).toBe(last);
  });
});
