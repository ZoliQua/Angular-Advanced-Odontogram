// Phase 12, Task 2 — the Angular shell exposes upstream 2.7.0's themable tooth
// artwork and the completed measured anatomy.
//
// Covers (see also lib/theming/tooth-artwork-theming.spec.ts for the
// framework-free token / dark-palette guards, and lib/lazy-loading.guard.spec.ts
// for the standing lazy-chunk guard):
//   1. `themeConfig.tooth` / `.tokens` reach the rendered artwork.
//   2. `themeConfig.selection` is applied through the session setters
//      (setSelectionColor / setSelectionBorderStyle) and is NOT a CSS custom
//      property; a dedicated `selectionColor` / `selectionBorderStyle` input
//      still wins (the claim of upstream's one React-only theming test).
//   3. The completed 40-template measured set, built into the REAL tooth grid
//      by the real engine: every position has its own template, primary teeth
//      draw from the primary templates, the derived dentin core is there.
//   4. Dark mode deliberately leaves the dentin alone.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "./odontogram-shell.component";
import {
  getSelectionBorderStyle,
  getSelectionColor,
  setSelectionBorderStyle,
  setSelectionColor,
  setToothAnatomy,
} from "../../core/odontogram";
import { activeAnatomyProfile, ensureMeasuredProfile } from "../../core/anatomy/profiles";
import { flattenThemeTokens } from "../../core/theme";

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

/** Engine lifecycle faked (like the rest of the shell specs). */
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

const root = (f: ReturnType<typeof mountFaked>) =>
  f.nativeElement.querySelector(".odontogram-root") as HTMLElement;

describe("themeConfig: tooth tokens reach the artwork", () => {
  beforeEach(installDomStubs);

  it("applies tooth, dentin, milktoothBody and raw tokens as CSS custom properties on the root", async () => {
    const f = mountFaked();
    f.componentRef.setInput("themeConfig", {
      tooth: { body: "#102030", dentin: "#8a6b45", milktoothBody: "#abcdef" },
      tokens: { "--odon-rest-gold": "#d4af37", "--not-ours": "red" },
    });
    await f.whenStable();
    const el = root(f);
    expect(el.style.getPropertyValue("--odon-tooth-body")).toBe("#102030");
    expect(el.style.getPropertyValue("--odon-tooth-dentin")).toBe("#8a6b45");
    expect(el.style.getPropertyValue("--odon-milktooth-body")).toBe("#abcdef");
    expect(el.style.getPropertyValue("--odon-rest-gold")).toBe("#d4af37");
    expect(el.style.getPropertyValue("--not-ours")).toBe("");
  });

  it("clears the tokens again when the config is removed", async () => {
    const f = mountFaked();
    f.componentRef.setInput("themeConfig", { tooth: { body: "#102030" } });
    await f.whenStable();
    f.componentRef.setInput("themeConfig", undefined);
    await f.whenStable();
    expect(root(f).style.getPropertyValue("--odon-tooth-body")).toBe("");
  });

  it("a themed token resolves in an export of the shell's own markup (the artwork inherits from the root)", async () => {
    const f = mountFaked();
    f.componentRef.setInput("themeConfig", { tooth: { body: "#102030" } });
    await f.whenStable();
    const xml = '<path style="fill: var(--odon-tooth-body, #ebebeb)"/>';
    expect(flattenThemeTokens(xml, root(f))).toBe('<path style="fill: #102030"/>');
  });
});

describe("themeConfig.selection: through the setters, never a CSS variable", () => {
  beforeEach(installDomStubs);

  it("routes colour and border style to the core setters", async () => {
    const f = mountFaked();
    f.componentRef.setInput("themeConfig", { selection: { color: "#ABCDEF", borderStyle: "dotted" } });
    await f.whenStable();
    expect(getSelectionColor()).toBe("#abcdef"); // the setter lowercases: proof it went through it
    expect(getSelectionBorderStyle()).toBe("dotted");
    // …and the chart tile reads the setter state back through the mirror.
    const grid = f.nativeElement.querySelector("#toothGrid") as HTMLElement;
    expect(grid.style.getPropertyValue("--odon-select-border-style")).toBe("dotted");
    expect(grid.style.getPropertyValue("--odon-select-rgb")).toBe("171,205,239");
  });

  it("does NOT appear on the themed element as a custom property", async () => {
    const f = mountFaked();
    f.componentRef.setInput("themeConfig", {
      colors: { accent: "#123456" },
      selection: { color: "#ff0000", borderStyle: "solid" },
    });
    await f.whenStable();
    const el = root(f);
    expect(el.style.getPropertyValue("--odon-accent")).toBe("#123456"); // theme DID apply
    expect(el.getAttribute("style") ?? "").not.toMatch(/select/i);
    expect(el.getAttribute("style") ?? "").not.toContain("#ff0000");
  });

  it("an ignored value (not #rrggbb) leaves the setter state alone", async () => {
    const f = mountFaked();
    f.componentRef.setInput("themeConfig", { selection: { color: "red" } });
    await f.whenStable();
    expect(getSelectionColor()).toBe("#3b7bff");
  });

  it("a dedicated selectionColor / selectionBorderStyle input wins over themeConfig.selection", async () => {
    const f = mountFaked();
    f.componentRef.setInput("themeConfig", { selection: { color: "#abcdef", borderStyle: "dotted" } });
    f.componentRef.setInput("selectionColor", "#123456");
    f.componentRef.setInput("selectionBorderStyle", "solid");
    await f.whenStable();
    expect(getSelectionColor(), "the explicit input is the more specific control").toBe("#123456");
    expect(getSelectionBorderStyle()).toBe("solid");
  });

  it("the Settings control writes through the same setter (state is the core's, not a local signal)", async () => {
    const f = mountFaked();
    await f.whenStable();
    const ui = (f.componentInstance as unknown as {
      ui: { settingsState: () => { onSelectionColor: (v: string) => void; onSelectionBorderStyle: (v: "solid") => void } };
    }).ui;
    ui.settingsState().onSelectionColor("#00ff00");
    ui.settingsState().onSelectionBorderStyle("solid");
    await f.whenStable();
    expect(getSelectionColor()).toBe("#00ff00");
    expect(getSelectionBorderStyle()).toBe("solid");
    // A host calling the setter directly is mirrored back to the tile.
    setSelectionColor("#0000ff");
    setSelectionBorderStyle("dashed");
    await f.whenStable();
    const grid = f.nativeElement.querySelector("#toothGrid") as HTMLElement;
    expect(grid.style.getPropertyValue("--odon-select-rgb")).toBe("0,0,255");
    expect(grid.style.getPropertyValue("--odon-select-border-style")).toBe("dashed");
  });
});

describe("measured anatomy: the completed 40-template set", () => {
  beforeEach(async () => {
    installDomStubs();
    await ensureMeasuredProfile();
  });
  afterEach(async () => {
    await setToothAnatomy("classic");
  });

  const PERMANENT = [1, 2, 3, 4].flatMap((q) => [1, 2, 3, 4, 5, 6, 7, 8].map((n) => q * 10 + n));

  it("has exactly 40 templates: 16 side + 10 occlusal permanent, 10 side + 4 occlusal primary", async () => {
    await setToothAnatomy("measured");
    const p = activeAnatomyProfile();
    expect(Object.keys(p.templates)).toHaveLength(16);
    expect(Object.keys(p.templatesOccl)).toHaveLength(10);
    expect(Object.keys(p.primaryTemplates ?? {})).toHaveLength(10);
    expect(Object.keys(p.primaryTemplatesOccl ?? {})).toHaveLength(4);
  });

  it("gives every one of the 32 permanent positions its OWN template (no neighbour's artwork reused)", async () => {
    await setToothAnatomy("measured");
    const p = activeAnatomyProfile();
    for (const tooth of PERMANENT) {
      const tile = p.toothTemplate.get(tooth);
      expect(tile, `tooth ${tooth} has a side template`).toBeDefined();
      // The template number is the tooth's own position in its drawn quadrant.
      expect(tile!.tpl % 10, `tooth ${tooth} uses its own position`).toBe(tooth % 10);
      expect(p.templates[tile!.tpl], `template ${tile!.tpl} exists`).toContain("<svg");
    }
    // 18 and 38 were the old gaps (17's / a shared lower molar's artwork).
    expect(p.toothTemplate.get(18)!.tpl).toBe(18);
    expect(p.toothTemplate.get(28)).toMatchObject({ tpl: 18, mirror: true });
    expect(p.toothTemplate.get(38)!.tpl).toBe(38);
    expect(p.toothTemplate.get(48)).toMatchObject({ tpl: 38, mirror: true });
    expect(p.templatesOccl[18]).toContain("<svg");
    expect(p.templatesOccl[38]).toContain("<svg");
  });

  it("draws primary teeth from primary templates, keyed by the permanent position they occupy", async () => {
    await setToothAnatomy("measured");
    const p = activeAnatomyProfile();
    for (const tooth of [11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 31, 32, 33, 34, 35, 41, 42, 43, 44, 45]) {
      const tile = p.primaryToothTemplate!.get(tooth);
      expect(tile, `milk tooth on ${tooth}`).toBeDefined();
      expect(tile!.tpl, `milk tooth on ${tooth} is a deciduous template`).toBeGreaterThanOrEqual(51);
      expect(p.primaryTemplates![tile!.tpl]).toContain("<svg");
    }
    expect(p.primaryToothTemplate!.get(14)!.tpl).toBe(54);
    expect(p.primaryToothTemplate!.get(35)!.tpl).toBe(75);
  });

  it("derives a dentin core in every side template, and none in any occlusal view", async () => {
    await setToothAnatomy("measured");
    const p = activeAnatomyProfile();
    const NESTED = "var(--odon-tooth-dentin, var(--odon-tooth-body, ";
    for (const [name, set] of [["side", p.templates], ["primary side", p.primaryTemplates!]] as const) {
      for (const [tpl, svg] of Object.entries(set)) {
        expect(svg, `${name} ${tpl}: dentin core`).toContain(NESTED);
      }
    }
    for (const set of [p.templatesOccl, p.primaryTemplatesOccl!]) {
      for (const [tpl, svg] of Object.entries(set)) {
        expect(svg, `occlusal ${tpl}: nothing of the dentin shows from above`).not.toContain("--odon-tooth-dentin");
      }
    }
  });
});

describe("measured anatomy in the real grid (real engine)", () => {
  vi.setConfig({ testTimeout: 60000, hookTimeout: 60000 });
  beforeEach(async () => {
    installDomStubs();
    await ensureMeasuredProfile();
  });
  afterEach(async () => {
    await setToothAnatomy("classic");
    document.documentElement.classList.remove("dark");
  });

  async function mountReal() {
    TestBed.configureTestingModule({
      imports: [OdontogramShellComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    await new Promise((r) => setTimeout(r, 0));
    await f.whenStable();
    return f;
  }

  it("builds 32 side tiles with the dentin core, and the dentin follows the body until it is set", async () => {
    await setToothAnatomy("measured");
    const f = await mountReal();
    const grid = f.nativeElement.querySelector("#toothGrid") as HTMLElement;
    expect(grid.getAttribute("data-anatomy")).toBe("measured");
    const sides = grid.querySelectorAll(".tooth-tile.side-view");
    expect(sides.length).toBe(32);
    for (const tile of Array.from(sides)) {
      const xml = new XMLSerializer().serializeToString(tile.querySelector("svg")!);
      expect(xml, `tooth ${tile.getAttribute("data-tooth")}: dentin core drawn`).toContain("--odon-tooth-dentin");
    }
    const one = new XMLSerializer().serializeToString(sides[0].querySelector("svg")!);
    expect(flattenThemeTokens(one, grid)).not.toContain("var(");
    f.componentRef.setInput("themeConfig", { tooth: { body: "#273140" } });
    await f.whenStable();
    expect(flattenThemeTokens(one, root(f))).toContain("#273140");
  });

  it("dark mode leaves the dentin alone: no dentin value on the root, nested default intact", async () => {
    await setToothAnatomy("measured");
    document.documentElement.classList.add("dark");
    const f = await mountReal();
    const el = root(f);
    expect(el.style.getPropertyValue("--odon-tooth-dentin")).toBe("");
    const grid = f.nativeElement.querySelector("#toothGrid") as HTMLElement;
    const xml = new XMLSerializer().serializeToString(grid.querySelector(".tooth-tile.side-view svg")!);
    expect(xml).toContain("var(--odon-tooth-dentin, var(--odon-tooth-body,");
  });
});
