// Angular equivalent of core/__tests__/measured-primary-dentition.test.tsx
// (2.7.0, the grid half): the measured profile draws a milk tooth from its OWN
// deciduous template, and the 20 primary measured templates must render in a
// real grid. Runs the real engine through the Angular shell (the framework-free
// anchor/profile half runs as measured-anchors.test.ts + dentin-layer.test.ts).
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { OdontogramShellComponent } from "./odontogram-shell.component";
import {
  __resetChartStateForTest,
  getStatusChart,
  setNumberingSystem,
  setPerioViewMode,
  setToothAnatomy,
} from "../../core/odontogram";
import { activeAnatomyProfile } from "../../core/anatomy/profiles";

vi.setConfig({ testTimeout: 60000, hookTimeout: 60000 });

beforeEach(async () => {
  window.matchMedia ??= ((q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent() { return false; },
  })) as unknown as typeof window.matchMedia;
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
    observe() {} unobserve() {} disconnect() {}
  };
  document.body.innerHTML = "";
  __resetChartStateForTest();
  await setToothAnatomy("classic");
  setPerioViewMode("toggle");
  setNumberingSystem("FDI");
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [provideZonelessChangeDetection()],
  });
});

afterEach(async () => {
  await setToothAnatomy("classic");
});

async function mount() {
  const f = TestBed.createComponent(OdontogramShellComponent);
  await f.whenStable();
  await vi.waitFor(() => {
    const grid = document.getElementById("toothGrid");
    expect(grid && grid.childElementCount).toBeGreaterThan(0);
  });
  return f;
}

async function switchAnatomy(f: Awaited<ReturnType<typeof mount>>, v: "classic" | "measured") {
  await setToothAnatomy(v);
  await f.whenStable();
  await vi.waitFor(() => expect(document.getElementById("toothGrid")!.childElementCount).toBeGreaterThan(0));
}

const sideTile = (n: number) =>
  document.querySelector(`.tooth-tile.side-view[data-tooth="${n}"]`) as HTMLElement;
const rootsOf = (n: number) => Array.from(sideTile(n).querySelectorAll("svg")) as unknown as SVGElement[];

function setSelection(n: number, value: string) {
  sideTile(n).click();
  const sel = document.getElementById("toothSelect") as HTMLSelectElement;
  sel.value = value;
  sel.dispatchEvent(new Event("change"));
}

describe("measured anatomy: the deciduous dentition (real grid, Angular shell)", () => {
  it("gives every milk-capable position two artwork variants, and the molars one", async () => {
    const f = await mount();
    await switchAnatomy(f, "measured");
    for (const n of [11, 12, 13, 14, 15, 24, 35, 41]) {
      expect(rootsOf(n).map((r) => r.getAttribute("data-variant")), `tooth ${n}`).toEqual(["permanent", "primary"]);
    }
    for (const n of [16, 17, 18, 47]) {
      const roots = rootsOf(n);
      expect(roots, `tooth ${n}`).toHaveLength(1);
      expect(roots[0].getAttribute("data-variant")).toBeNull();
    }
  });

  it("renders all 20 primary measured templates in the grid", async () => {
    const f = await mount();
    await switchAnatomy(f, "measured");
    const primary = activeAnatomyProfile().primaryToothTemplate!;
    expect(primary.size).toBe(20);
    let drawn = 0;
    for (const [toothNo] of primary) {
      const root = rootsOf(toothNo).find((r) => r.getAttribute("data-variant") === "primary");
      expect(root, `primary root for ${toothNo}`).toBeTruthy();
      expect(root!.childElementCount, `primary artwork for ${toothNo}`).toBeGreaterThan(0);
      drawn++;
    }
    expect(drawn).toBe(20);
  });

  it("flips which variant is displayed when a tooth becomes a milk tooth, and back", async () => {
    const f = await mount();
    await switchAnatomy(f, "measured");
    const tile = sideTile(14);
    const [permanent, primary] = rootsOf(14);
    expect(permanent.style.display).not.toBe("none");
    expect(primary.style.display).toBe("none");

    setSelection(14, "milktooth");
    await f.whenStable();
    expect(getStatusChart().teeth[14].toothSelection).toBe("milktooth");
    expect(permanent.style.display).toBe("none");
    expect(primary.style.display).not.toBe("none");
    expect(sideTile(14)).toBe(tile);
    expect(rootsOf(14)).toEqual([permanent, primary]);

    setSelection(14, "tooth-base");
    await f.whenStable();
    expect(permanent.style.display).not.toBe("none");
    expect(primary.style.display).toBe("none");
  });

  it("the classic profile is untouched: one root per tile, no variant attribute", async () => {
    await mount();
    for (const n of [11, 14, 16, 35]) {
      const roots = rootsOf(n);
      expect(roots, `tooth ${n}`).toHaveLength(1);
      expect(roots[0].getAttribute("data-variant")).toBeNull();
    }
    expect(activeAnatomyProfile().primaryToothTemplate).toBeUndefined();
  });
});
