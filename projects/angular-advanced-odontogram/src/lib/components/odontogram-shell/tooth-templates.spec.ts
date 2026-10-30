// The shell's `toothTemplates` input (OdontogramContext.tsx 2.8.0
// `toothTemplates` prop). Runs the real engine through the Angular shell:
// the overrides must be in place BEFORE the first grid is built, a later change
// must rebuild the grid (the core's setToothTemplateOverrides does not), an
// omitted input must touch nothing, and a refused drawing must keep the factory
// one and be reported.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { OdontogramShellComponent } from "./odontogram-shell.component";
import {
  __resetChartStateForTest,
  getToothTemplateRejections,
  setNumberingSystem,
  setPerioViewMode,
  setToothAnatomy,
  setToothTemplateOverrides,
  type ToothTemplateOverrides,
} from "../../core/odontogram";
import { CLASSIC_PROFILE } from "../../core/anatomy/profiles";

vi.setConfig({ testTimeout: 60000, hookTimeout: 60000 });

const FACTORY_11 = CLASSIC_PROFILE.templates[11];
const MARK = `<g id="host-mark"><rect id="host-rect" width="1" height="1" fill="#f00"/></g>`;
const HOST_11 = FACTORY_11.replace("</svg>", `${MARK}</svg>`);
const HOST: ToothTemplateOverrides = { classic: { templates: { 11: HOST_11 } } };
const EVIL: ToothTemplateOverrides = {
  classic: { templates: { 11: FACTORY_11.replace("</svg>", `<script>alert(1)</script></svg>`) } },
};

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
  setToothTemplateOverrides(null);
  await setToothAnatomy("classic");
  setPerioViewMode("toggle");
  setNumberingSystem("FDI");
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [provideZonelessChangeDetection()],
  });
});

afterEach(async () => {
  setToothTemplateOverrides(null);
  await setToothAnatomy("classic");
});

const grid = () => document.getElementById("toothGrid")!;
const hostMarks = () => grid().querySelectorAll("[id$='host-rect'], rect[fill='#f00']").length;

async function settle(f: { whenStable(): Promise<unknown> }) {
  await f.whenStable();
  await vi.waitFor(() => expect(grid() && grid().childElementCount).toBeGreaterThan(0));
}

describe("toothTemplates input", () => {
  it("is applied before the engine's first grid build", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("toothTemplates", HOST);
    await settle(f);
    expect(hostMarks(), "the first grid was built from the factory artwork").toBeGreaterThan(0);
    expect(getToothTemplateRejections()).toEqual([]);
  });

  it("an omitted input touches nothing (an override set elsewhere survives the mount)", async () => {
    setToothTemplateOverrides(HOST);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await settle(f);
    expect(hostMarks()).toBeGreaterThan(0);
  });

  it("a LATER change rebuilds the grid, and clearing it restores the factory artwork", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await settle(f);
    expect(hostMarks()).toBe(0);

    f.componentRef.setInput("toothTemplates", HOST);
    await f.whenStable();
    await vi.waitFor(() => expect(hostMarks()).toBeGreaterThan(0));

    f.componentRef.setInput("toothTemplates", undefined);
    await f.whenStable();
    await vi.waitFor(() => expect(hostMarks()).toBe(0));
  });

  it("a refused drawing keeps the factory one and is reported", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("toothTemplates", EVIL);
    await settle(f);
    expect(hostMarks()).toBe(0);
    expect(grid().querySelectorAll("script").length).toBe(0);
    const rejected = getToothTemplateRejections();
    expect(rejected.length).toBeGreaterThan(0);
    expect(rejected[0]).toMatchObject({ profile: "classic", set: "templates", key: 11 });
  });
});
