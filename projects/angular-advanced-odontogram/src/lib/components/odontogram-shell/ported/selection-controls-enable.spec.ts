// Angular port of core/__tests__/selection-controls-enable.test.tsx.
//
// Every selection change enables or disables the whole control panel, and
// hides the label of each disabled control. Each control's `label[for]` used
// to be looked up with its own `document.querySelector` — across a tooth grid
// of some twenty thousand nodes — and a control with an id but no such label
// paid that full scan on every click. Under jsdom that was ~340 ms of a
// ~380 ms selection change; gathering the labels in one pass (a `labelFor`
// Map built once per call, `core/odontogram.ts`'s `setControlsEnabled()`)
// brought a click to ~65 ms.
//
// Timing is not asserted here either (flaky, same as the source); the CAUSE
// is: a selection change must not look a label up per control. The behaviour
// itself — disabled control, hidden label — is pinned alongside, since the
// fix rewrote the loop that does it. `setControlsEnabled()` is entirely core,
// framework-free, DOM-querying logic (`.panel-body input, .panel-body
// select`, `document.getElementsByTagName("label")`) — it needs no Angular
// port of its own. What THIS port proves is that it runs correctly against
// the Angular shell's real, mounted DOM: the fix is only as good as the DOM
// contract it queries, and this repo has never before had a spec that drives
// a real, engine-built tooth-tile click end to end.
//
// Mount route: the REAL `ODONTOGRAM_ENGINE_LIFECYCLE` (default DI factory,
// not the fake used by every other odontogram-shell spec) — the tile click
// path only exists once `initOdontogram()` has built the real SVG grid
// (`buildGrid()` -> `addTile()`, wiring each tile's own "click" listener to
// `onToothClick`). `window.matchMedia` is polyfilled exactly as the source
// does: `addTile()` calls `isToothDevice()` -> `window.matchMedia(...)`
// unconditionally for every clickable tile, and jsdom (this repo's test
// environment) does not implement it.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { OdontogramShellComponent } from "../odontogram-shell.component";
import { __resetChartStateForTest, setNumberingSystem, clearSelection } from "../../../core/odontogram";
import { setI18nLanguage } from "../../../core/i18n/useI18n";

vi.setConfig({ testTimeout: 60000, hookTimeout: 60000 });

const tile = (n: number) =>
  document.querySelector(`.tooth-tile.side-view[data-tooth="${n}"]`) as HTMLElement;

beforeEach(() => {
  window.matchMedia = ((q: string) => ({
    matches: false,
    media: q,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
  })) as unknown as typeof window.matchMedia;
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setI18nLanguage("en");
  document.documentElement.classList.remove("dark");
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [provideZonelessChangeDetection()],
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** A control with a SEPARATE `label[for]` — the case the per-control lookup
 *  served. The label sits outside the panel on purpose: the lookup has
 *  always been document-wide, and that must not quietly narrow. …and one
 *  wrapped in its own label, the other supported shape — same fixture as the
 *  pinned TSX test. */
function mountWithFixture(root: HTMLElement) {
  const panel = root.querySelector(".panel-body")!;
  const input = document.createElement("input");
  input.id = "zz-fixture-control";
  panel.appendChild(input);
  const label = document.createElement("label");
  label.htmlFor = "zz-fixture-control";
  document.body.appendChild(label);
  const wrapper = document.createElement("label");
  const wrapped = document.createElement("input");
  wrapper.appendChild(wrapped);
  panel.appendChild(wrapper);
  return { input, label, wrapped, wrapper };
}

describe("selection change: control panel enable/disable (real engine, real tooth-tile clicks)", () => {
  it("disables controls and hides their labels with no tooth selected, and restores them on selection", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const fixture = mountWithFixture(f.nativeElement);

    tile(16).click();
    await f.whenStable();
    expect(fixture.input.disabled).toBe(false);
    expect(fixture.label.style.display).toBe("");
    expect(fixture.wrapped.disabled).toBe(false);
    expect(fixture.wrapper.style.display).toBe("");

    clearSelection();
    await f.whenStable();
    expect(fixture.input.disabled).toBe(true);
    expect(fixture.label.style.display).toBe("none");
    expect(fixture.wrapped.disabled).toBe(true);
    expect(fixture.wrapper.style.display).toBe("none");

    tile(21).click();
    await f.whenStable();
    expect(fixture.input.disabled).toBe(false);
    expect(fixture.label.style.display).toBe("");

    f.destroy();
  });

  it("does not look a label up per control on a selection change", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    mountWithFixture(f.nativeElement);

    const spy = vi.spyOn(Document.prototype, "querySelector");
    tile(16).click();
    clearSelection();
    tile(21).click();
    await f.whenStable();

    const perControlLookups = spy.mock.calls.filter(([sel]) => String(sel).startsWith("label[for="));
    expect(
      perControlLookups,
      "a selection change scanned the whole document once per control",
    ).toEqual([]);

    f.destroy();
  });
});
