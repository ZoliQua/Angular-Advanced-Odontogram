// TDD spec for PerioChartComponent — Phase 4 Task 4. Cases (a)-(e) per the
// task brief. Real engine seams throughout (no vi.mock/vi.spyOn on
// `core/odontogram` — unavailable under `npm run test:ng`, see
// odontogram-shell.component.spec.ts's header comment for the full
// rationale) — every assertion drives/reads the actual module state.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { PerioChartComponent } from "./perio-chart.component";
import { hideInfoPopover } from "./perio-grid-dom";
import { setI18nLanguage } from "../../core/i18n/useI18n";
import {
  __resetChartStateForTest,
  setNumberingSystem,
  setReadOnly,
  setPerioSite,
  getToothPerio,
  getPerioOverlayLayer,
  setPerioOverlayLayer,
} from "../../core/odontogram";

@Component({
  imports: [PerioChartComponent],
  template: `<button id="opener" type="button">opener</button>
    <aao-perio-chart [open]="open()" [inline]="inline()" (closeChart)="closed = true" />`,
})
class HostComponent {
  open = signal(false);
  inline = signal(false);
  closed = false;
}

function createHost() {
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(HostComponent);
}

function pd(toothNo: number, site: string): HTMLInputElement {
  return document.getElementById(`perio-fg-pd-${toothNo}-${site}`) as HTMLInputElement;
}

beforeEach(() => {
  setI18nLanguage("en");
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setReadOnly(false);
  setPerioOverlayLayer("none");
});

afterEach(() => {
  hideInfoPopover();
  setReadOnly(false);
  setPerioOverlayLayer("none");
  __resetChartStateForTest();
});

describe("PerioChartComponent", () => {
  it("(a) inactive renders nothing and touches no visible engine state (seeded sentinel stays invisible)", async () => {
    // Seed a sentinel value BEFORE mounting — if the inactive component were
    // to build the grid/summary anyway, this would show up in the DOM.
    setPerioSite(18, "MB", { pd: 7 });

    const f = createHost();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;

    expect(root.querySelector("#perioInlinePanel")).toBeNull();
    expect(root.querySelector("#perioOverlay")).toBeNull();
    expect(root.querySelector("#perioInlineGrid")).toBeNull();
    expect(root.querySelector("#perioOverlayGrid")).toBeNull();
    expect(document.getElementById("perio-fg-pd-18-MB")).toBeNull();
    expect(document.getElementById("perioOverlaySwitch")).toBeNull();

    // The seeded engine value itself is untouched by the inactive mount.
    expect(getToothPerio(18).pd.MB).toBe(7);
  });

  it("(b) inline housing renders #perioInlinePanel + the grid with seeded PD values visible", async () => {
    setPerioSite(18, "MB", { pd: 5 });

    const f = createHost();
    f.componentInstance.inline.set(true);
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;

    const panel = root.querySelector("#perioInlinePanel");
    expect(panel).not.toBeNull();
    expect(root.querySelector("#perioInlineGrid")).not.toBeNull();
    expect(root.querySelector("#perioOverlay")).toBeNull();

    const cell = pd(18, "MB");
    expect(cell).not.toBeNull();
    expect(cell.value).toBe("5");
  });

  it("(c) open housing renders the dialog + <aao-perio-sidebar>, and Escape emits closeChart", async () => {
    const f = createHost();
    f.componentInstance.open.set(true);
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;

    const dialog = root.querySelector("#perioOverlay") as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute("role")).toBe("dialog");
    expect(root.querySelector("aao-perio-sidebar")).not.toBeNull();
    expect(root.querySelector("#perioOverlayGrid")).not.toBeNull();
    expect(root.querySelector("#perioInlinePanel")).toBeNull();

    expect(f.componentInstance.closed).toBe(false);
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(f.componentInstance.closed).toBe(true);
  });

  it("(d) a digit keystroke on a PD cell writes via real setPerioSite and advances focus per nextPerioCell", async () => {
    const f = createHost();
    f.componentInstance.inline.set(true);
    await f.whenStable();

    const cell = pd(18, "MB");
    cell.focus();
    expect(document.activeElement).toBe(cell);

    cell.dispatchEvent(new KeyboardEvent("keydown", { key: "3", bubbles: true, cancelable: true }));

    expect(getToothPerio(18).pd.MB).toBe(3);
    expect(document.activeElement).toBe(pd(18, "B"));
  });

  it("(e) clicking an overlay-switcher pill sets the engine overlay layer", async () => {
    const f = createHost();
    f.componentInstance.inline.set(true);
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;

    expect(getPerioOverlayLayer()).toBe("none");

    const btn = root.querySelector('[data-overlay-layer="bop"]') as HTMLButtonElement;
    expect(btn).not.toBeNull();
    btn.click();

    expect(getPerioOverlayLayer()).toBe("bop");

    await f.whenStable();
    expect(btn.classList.contains("is-active")).toBe(true);
    expect(btn.getAttribute("aria-checked")).toBe("true");
  });
});
