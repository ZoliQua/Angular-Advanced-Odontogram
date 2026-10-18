// Phase 12, Task 3 — the 2.7.0 chart display-settings API in the Angular shell
// (OdontogramContext.tsx 2.7.0: screenToothSpacing / screenToothNumberSize /
// toothInfo provider props, mirrored from ./state/displaySettings through
// onStateChange; selectionColor / selectionBorderStyle are covered in
// theming.spec.ts and share this exact pattern).
//
// Contract under test:
//   - the dedicated inputs are DEFINED-GATED and go through the core setters
//     (no local-only signals);
//   - an omitted input never clobbers state a host set before mount;
//   - a host calling the setter directly is mirrored back to the chart;
//   - the Settings handlers write through the setters only;
//   - the session setters are idempotent (no notification when unchanged) yet
//     still notify when the value changes — consumed through the shell;
//   - a tooth note's label badge survives a grid rebuild (real engine).
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "./odontogram-shell.component";
import {
  __setToothStateForTest,
  getNumberingSystem,
  getScreenToothNumberSize,
  getScreenToothSpacing,
  getToothInfoVisible,
  getWearDetailLevel,
  onStateChange,
  rebuildGrid,
  setScreenToothNumberSize,
  setScreenToothSpacing,
  setToothInfoVisible,
  setWearDetailLevel,
} from "../../core/odontogram";

function installDomStubs() {
  window.matchMedia ??= ((q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent() { return false; },
  })) as unknown as typeof window.matchMedia;
  if (typeof (globalThis as { ResizeObserver?: unknown }).ResizeObserver === "undefined") {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
}

function mountFaked() {
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: { init: () => Promise.resolve(), destroy: () => {} } },
    ],
  });
  return TestBed.createComponent(OdontogramShellComponent);
}

type SettingsState = {
  onScreenToothSpacing: (v: "wide") => void;
  onScreenToothNumberSize: (v: "xlarge") => void;
  onToothInfo: (v: boolean) => void;
  screenToothSpacing: string;
  screenToothNumberSize: string;
  toothInfo: boolean;
};
const settings = (f: ReturnType<typeof mountFaked>): SettingsState =>
  (f.componentInstance as unknown as { ui: { settingsState: () => SettingsState } }).ui.settingsState();

const grid = (f: ReturnType<typeof mountFaked>) => f.nativeElement.querySelector("#toothGrid") as HTMLElement;
const toothInfoPanel = (f: ReturnType<typeof mountFaked>) => f.nativeElement.querySelector(".tooth-info");

describe("display settings: dedicated inputs drive the core setters", () => {
  beforeEach(installDomStubs);

  it("screenToothSpacing / screenToothNumberSize / toothInfo reach the engine and the chart", async () => {
    const f = mountFaked();
    f.componentRef.setInput("screenToothSpacing", "wide");
    f.componentRef.setInput("screenToothNumberSize", "xlarge");
    f.componentRef.setInput("toothInfo", false);
    await f.whenStable();
    expect(getScreenToothSpacing()).toBe("wide");
    expect(getScreenToothNumberSize()).toBe("xlarge");
    expect(getToothInfoVisible()).toBe(false);
    expect(grid(f).getAttribute("data-screen-spacing")).toBe("wide");
    expect(grid(f).getAttribute("data-tooth-num")).toBe("xlarge");
    expect(toothInfoPanel(f)).toBeNull();
  });

  it("an input changed later is applied again (prop-driven restore)", async () => {
    const f = mountFaked();
    f.componentRef.setInput("screenToothSpacing", "wide");
    await f.whenStable();
    f.componentRef.setInput("screenToothSpacing", "close");
    await f.whenStable();
    expect(getScreenToothSpacing()).toBe("close");
    expect(grid(f).getAttribute("data-screen-spacing")).toBe("close");
  });

  it("omitted inputs never clobber state a host set before mount (defined-gated)", async () => {
    setScreenToothSpacing("close");
    setScreenToothNumberSize("small");
    setToothInfoVisible(false);
    const f = mountFaked();
    await f.whenStable();
    expect(getScreenToothSpacing()).toBe("close");
    expect(getScreenToothNumberSize()).toBe("small");
    expect(getToothInfoVisible()).toBe(false);
    // …and the chart renders that pre-set state (seeded from the getters).
    expect(grid(f).getAttribute("data-screen-spacing")).toBe("close");
    expect(grid(f).getAttribute("data-tooth-num")).toBe("small");
    expect(toothInfoPanel(f)).toBeNull();
  });
});

describe("display settings: the state is the core's, mirrored (no local-only signals)", () => {
  beforeEach(installDomStubs);

  it("a host calling the setters after mount is mirrored to the chart and the Settings state", async () => {
    const f = mountFaked();
    await f.whenStable();
    setScreenToothSpacing("close");
    setScreenToothNumberSize("small");
    setToothInfoVisible(false);
    await f.whenStable();
    expect(grid(f).getAttribute("data-screen-spacing")).toBe("close");
    expect(grid(f).getAttribute("data-tooth-num")).toBe("small");
    expect(toothInfoPanel(f)).toBeNull();
    expect(settings(f)).toMatchObject({ screenToothSpacing: "close", screenToothNumberSize: "small", toothInfo: false });
  });

  it("the Settings handlers write through the setters only; the mirror then flips the chart", async () => {
    const f = mountFaked();
    await f.whenStable();
    settings(f).onScreenToothSpacing("wide");
    settings(f).onScreenToothNumberSize("xlarge");
    settings(f).onToothInfo(false);
    // The engine is updated synchronously by the setter…
    expect(getScreenToothSpacing()).toBe("wide");
    expect(getScreenToothNumberSize()).toBe("xlarge");
    expect(getToothInfoVisible()).toBe(false);
    await f.whenStable();
    // …and the chart follows through onStateChange, not through a local signal.
    expect(grid(f).getAttribute("data-screen-spacing")).toBe("wide");
    expect(grid(f).getAttribute("data-tooth-num")).toBe("xlarge");
    expect(toothInfoPanel(f)).toBeNull();
  });

  it("getNumberingSystem() follows the numberingSystem input", async () => {
    const f = mountFaked();
    f.componentRef.setInput("numberingSystem", "Universal");
    await f.whenStable();
    expect(getNumberingSystem()).toBe("Universal");
    f.componentRef.setInput("numberingSystem", "FDI");
    await f.whenStable();
    expect(getNumberingSystem()).toBe("FDI");
  });
});

describe("inherited fix: session-setting writes are idempotent yet still notify", () => {
  beforeEach(installDomStubs);

  const count = (act: () => void): number => {
    const spy = vi.fn();
    const off = onStateChange(spy);
    act();
    off();
    return spy.mock.calls.length;
  };

  it("repeating the value the shell pushed does not notify; a real change notifies exactly once", async () => {
    const f = mountFaked();
    f.componentRef.setInput("wearDetailLevel", "simple");
    await f.whenStable();
    expect(getWearDetailLevel()).toBe("simple");
    expect(count(() => setWearDetailLevel("simple")), "unchanged -> idempotent").toBe(0);
    expect(count(() => setWearDetailLevel("complex")), "changed -> notifies once").toBe(1);
    expect(count(() => setWearDetailLevel("complex"))).toBe(0);
  });

  it("the display settings obey the same contract through the public setters", () => {
    expect(count(() => setScreenToothSpacing("normal")), "default re-write").toBe(0);
    expect(count(() => setScreenToothSpacing("wide"))).toBe(1);
    expect(count(() => setScreenToothSpacing("wide"))).toBe(0);
    expect(count(() => setToothInfoVisible(false))).toBe(1);
    expect(count(() => setToothInfoVisible(false))).toBe(0);
  });

  it("re-pushing an unchanged shell input does not notify", async () => {
    const f = mountFaked();
    f.componentRef.setInput("screenToothSpacing", "wide");
    await f.whenStable();
    const n = count(() => f.componentRef.setInput("screenToothSpacing", "wide"));
    await f.whenStable();
    expect(n).toBe(0);
  });
});

describe("inherited fix: a tooth note's badge survives a grid rebuild (real engine)", () => {
  beforeEach(installDomStubs);

  it("the label-row note icon is restored by rebuildGrid()", async () => {
    TestBed.configureTestingModule({
      imports: [OdontogramShellComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const f = TestBed.createComponent(OdontogramShellComponent);
    // The shell pushes `enableNotes ?? false` into the engine, so notes are
    // switched on through the shell's own input.
    f.componentRef.setInput("enableNotes", true);
    await f.whenStable();
    await new Promise((r) => setTimeout(r, 0));
    await f.whenStable();
    __setToothStateForTest(11, { toothSelection: "tooth-base", note: "keep me" });
    const badges = () => f.nativeElement.querySelectorAll(".tooth-label-cell .tooth-note-icon").length;
    // Without the fix a rebuilt grid has fresh label cells and no icon.
    await rebuildGrid();
    await f.whenStable();
    expect(badges(), "badge present after a rebuild").toBeGreaterThanOrEqual(1);
    const before = badges();
    await rebuildGrid();
    await f.whenStable();
    expect(badges(), "and after another rebuild").toBe(before);
  }, 60000);
});
