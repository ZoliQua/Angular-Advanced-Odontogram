// Angular port of core/__tests__/perio-p2-overlay.test.ts.
//
// Mount route (same precedent as perio-graphical-presentation.spec.ts /
// odontogram-shell.component.spec.ts's header): TestBed.createComponent
// (OdontogramShellComponent) with ONLY ODONTOGRAM_ENGINE_LIFECYCLE DI-faked
// — the fake `init` reproduces the source mock's fake-tooth-svg injection
// into #toothGrid so the "overlay never unmounts the odontogram" assertions
// hold; openPerioOverlay/closePerioOverlay/isPerioOverlayOpen/onStateChange
// and the full perio data-core surface are the REAL, unmocked
// core/odontogram export.
//
// Named-export mapping: same as perio-graphical-presentation.spec.ts —
// PerioChartComponent resolved from the public-api barrel, asserted to be a
// class.
//
// This file forces popup housing regardless of the current (shared,
// session-level) perioViewMode module state, exactly like the source's
// `getPerioViewMode: vi.fn().mockReturnValue("popup")` stub — here achieved
// by calling the REAL `setPerioViewMode("popup")` in `beforeEach` instead
// (there is no module-mocking seam available; forcing the real flag has the
// same net effect the source's stub was standing in for).
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import { closePerioOverlay, isPerioOverlayOpen, openPerioOverlay, setPerioViewMode } from "../../../core/odontogram";
import { PerioChartComponent } from "../../../../public-api";

const engineLifecycle = {
  init: async () => {
    const grid = document.getElementById("toothGrid");
    if (grid && !grid.querySelector("[data-fake-tooth-svg]")) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("data-fake-tooth-svg", "11");
      grid.appendChild(svg);
    }
  },
  destroy: () => {},
};

beforeEach(() => {
  document.body.innerHTML = "";
  document.documentElement.classList.remove("dark");
  closePerioOverlay();
  setPerioViewMode("popup");
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

describe("P2 Task 1: PerioChart named export", () => {
  it("PerioChartComponent is exported from the library's public API and is a class", () => {
    expect(typeof PerioChartComponent).toBe("function");
    expect(PerioChartComponent.prototype).toBeTruthy();
  });
});

describe("P2 Task 1: openPerioOverlay/closePerioOverlay/isPerioOverlayOpen imperative API", () => {
  it("isPerioOverlayOpen() starts false", () => {
    expect(isPerioOverlayOpen()).toBe(false);
  });

  it("openPerioOverlay() flips the flag true; closePerioOverlay() flips it back false", () => {
    openPerioOverlay();
    expect(isPerioOverlayOpen()).toBe(true);
    closePerioOverlay();
    expect(isPerioOverlayOpen()).toBe(false);
  });
});

describe("P2 Task 1: <Shell/> mount — overlay shell over the (never-unmounted) odontogram", () => {
  it("the overlay is not shown initially", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#perioOverlay")).toBeNull();
  });

  it("openPerioOverlay() shows #perioOverlay (role=dialog) while the tooth SVG root stays mounted", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const toothSvgBefore = f.nativeElement.querySelector("#toothGrid [data-fake-tooth-svg]");
    expect(toothSvgBefore).toBeTruthy();

    (f.nativeElement.querySelector("#openPerioOverlayBtn") as HTMLButtonElement).click();
    await f.whenStable();

    const overlay = f.nativeElement.querySelector("#perioOverlay");
    expect(overlay).toBeTruthy();
    expect(overlay!.getAttribute("role")).toBe("dialog");
    expect(overlay!.getAttribute("aria-modal")).toBe("true");
    // Scoped WITHIN the dialog and by its own unique id, so this actually
    // proves the OVERLAY body mounted — not the P1 tooth-info panel's
        // always-present #perioGrid (which lives outside #perioOverlay and
    // would otherwise satisfy a bare querySelector lookup vacuously, even if
    // the overlay body never rendered).
    const overlayGrid = overlay!.querySelector("#perioOverlayGrid");
    expect(overlayGrid).toBeTruthy();
    expect(f.nativeElement.querySelector("#perioOverlayGrid")).toBe(overlayGrid);
    // No duplicate DOM id: the P1 panel keeps #perioGrid, the overlay uses
    // #perioOverlayGrid — the two must be distinct elements.
    expect(f.nativeElement.querySelector("#perioGrid")).not.toBe(overlayGrid);

    // The odontogram SVG root must still be in the DOM — the overlay layers
    // OVER it, it never unmounts.
    expect(f.nativeElement.querySelector("#toothGrid [data-fake-tooth-svg]")).toBe(toothSvgBefore);
    expect(isPerioOverlayOpen()).toBe(true);
  });

  it("the close button hides the overlay and keeps the odontogram mounted", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    (f.nativeElement.querySelector("#openPerioOverlayBtn") as HTMLButtonElement).click();
    await f.whenStable();
    expect(f.nativeElement.querySelector("#perioOverlay")).toBeTruthy();

    const dialog = f.nativeElement.querySelector("#perioOverlay") as HTMLElement;
    const closeBtn = dialog.querySelector("button[aria-label], button[title]") as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    await f.whenStable();

    expect(f.nativeElement.querySelector("#perioOverlay")).toBeNull();
    expect(isPerioOverlayOpen()).toBe(false);
    expect(f.nativeElement.querySelector("#toothGrid [data-fake-tooth-svg]")).toBeTruthy();
  });

  it("Esc closes the overlay", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    (f.nativeElement.querySelector("#openPerioOverlayBtn") as HTMLButtonElement).click();
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#perioOverlay") as HTMLElement;
    expect(dialog).toBeTruthy();

    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await f.whenStable();

    expect(f.nativeElement.querySelector("#perioOverlay")).toBeNull();
    expect(isPerioOverlayOpen()).toBe(false);
  });

  it("backdrop click (on the overlay root itself, not its inner panel) closes the overlay", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    (f.nativeElement.querySelector("#openPerioOverlayBtn") as HTMLButtonElement).click();
    await f.whenStable();
    const dialog = f.nativeElement.querySelector("#perioOverlay") as HTMLElement;
    expect(dialog).toBeTruthy();

    dialog.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await f.whenStable();

    expect(f.nativeElement.querySelector("#perioOverlay")).toBeNull();
  });

  it("closePerioOverlay() called directly (module API) also hides a Shell-rendered overlay", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    (f.nativeElement.querySelector("#openPerioOverlayBtn") as HTMLButtonElement).click();
    await f.whenStable();
    expect(f.nativeElement.querySelector("#perioOverlay")).toBeTruthy();

    closePerioOverlay();
    // The shell's own onStateChange subscription must re-render the overlay closed.
    await f.whenStable();
    expect(f.nativeElement.querySelector("#perioOverlay")).toBeNull();
  });

  it('#openPerioOverlayBtn exists in a slim bar at the top of <main class="layout">, not the topbar', async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const btn = f.nativeElement.querySelector("#openPerioOverlayBtn");
    expect(btn).toBeTruthy();
    expect(f.nativeElement.querySelector(".topbar #openPerioOverlayBtn")).toBeFalsy();
    expect(f.nativeElement.querySelector("main.layout #openPerioOverlayBtn")).toBeTruthy();
  });

  it("#openPerioOverlayBtn calls openPerioOverlay()", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(isPerioOverlayOpen()).toBe(false);
    (f.nativeElement.querySelector("#openPerioOverlayBtn") as HTMLButtonElement).click();
    await f.whenStable();
    expect(isPerioOverlayOpen()).toBe(true);
  });
});
