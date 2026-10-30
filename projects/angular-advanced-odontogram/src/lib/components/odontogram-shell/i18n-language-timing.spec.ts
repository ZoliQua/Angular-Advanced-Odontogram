// Angular counterpart of $ENGINE@a11468d:src/__tests__/i18n-language-timing.test.tsx
// (upstream issue #38), replacing that React-only test in the corpus.
//
// Upstream's cause was React effect ordering: child effects ran before the
// provider's, so the perio chart (an imperative DOM builder resolving labels
// through the module-level `t()`) was built against the English fallback and
// never rebuilt. The fix (`useLayoutEffect` inside the React `useI18n` hook)
// is stripped from this port (deviation 3), but the BUG CLASS applies here:
// our perio grid is imperative too. These specs assert behaviour, not the
// mechanism: (1) a child's first render already sees the requested language,
// (2) the perio chart paints in that language, (3) a later switch relabels the
// grid and keeps the clinician's focus, (4) every grid control is refocusable.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "./odontogram-shell.component";
import { PerioChartComponent } from "../perio-chart/perio-chart.component";
import { hideInfoPopover } from "../perio-chart/perio-grid-dom";
import { getI18nLanguage, setI18nLanguage, t } from "../../core/i18n/useI18n";
import type { Language } from "../../core/i18n/languages";
import {
  __resetChartStateForTest,
  closePerioOverlay,
  openPerioOverlay,
  setPerioViewMode,
} from "../../core/odontogram";

beforeEach(async () => {
  await setI18nLanguage("en");
  __resetChartStateForTest();
  setPerioViewMode("popup");
});

afterEach(async () => {
  closePerioOverlay();
  hideInfoPopover();
  __resetChartStateForTest();
  await setI18nLanguage("en");
});

function mount(language: Language) {
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      // The engine's DOM bootstrap is not under test (and needs matchMedia).
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: { init: async () => {}, destroy: () => {} } },
    ],
  });
  const f = TestBed.createComponent(OdontogramShellComponent);
  f.componentRef.setInput("language", language);
  return f;
}

const gridText = (root: HTMLElement) =>
  root.querySelector(".perio-fullgrid-scroll")?.textContent ?? "";

describe("the shell's language is in place before its children paint (#38)", () => {
  for (const lang of ["es", "hu"] as const) {
    it(`a child's FIRST render already reads ${lang} (module-level t() and the signal)`, () => {
      const f = mount(lang);
      // ONE synchronous change-detection pass: the children's first render.
      f.detectChanges();
      expect(getI18nLanguage(), "the core language was not set before the first paint").toBe(lang);
      const btn = f.nativeElement.querySelector("#openCaseDiagnosesBtn") as HTMLElement;
      expect(btn.textContent?.trim()).toBe(t("case.diagnoses.button", lang));
      expect(btn.textContent?.trim()).not.toBe(t("case.diagnoses.button", "en"));
    });

    it(`the periodontal chart's labels render in ${lang}, not the English fallback`, async () => {
      const f = mount(lang);
      await f.whenStable();
      openPerioOverlay();
      await f.whenStable();
      const text = gridText(f.nativeElement);
      expect(text, "the grid did not render").not.toBe("");
      expect(text).toContain(t("perio.mobility", lang));
      expect(text).not.toContain(t("perio.mobility", "en"));
    });

    it(`the chart opened in the very same turn as the mount still ends up in ${lang}`, async () => {
      const f = mount(lang);
      f.detectChanges();
      openPerioOverlay();
      await f.whenStable();
      const text = gridText(f.nativeElement);
      expect(text).toContain(t("perio.mobility", lang));
      expect(text).not.toContain(t("perio.mobility", "en"));
    });
  }
});

describe("a language change after mount relabels the periodontal chart (#38, second defect)", () => {
  async function openEnglishChart() {
    const f = mount("en");
    await f.whenStable();
    openPerioOverlay();
    await f.whenStable();
    expect(gridText(f.nativeElement)).toContain(t("perio.mobility", "en"));
    return f;
  }

  it("switching the language rebuilds the grid in the new language", async () => {
    const f = await openEnglishChart();
    f.componentRef.setInput("language", "es");
    await f.whenStable();
    const text = gridText(f.nativeElement);
    expect(text, "the Spanish label did not arrive").toContain(t("perio.mobility", "es"));
    expect(text, "the English label survived the switch").not.toContain(t("perio.mobility", "en"));
  });

  it("puts focus back on the cell that had it", async () => {
    const f = await openEnglishChart();
    const cell = document.getElementById("perio-fg-pd-11-MB") as HTMLInputElement | null;
    expect(cell, "the probing cell this test is about is not in the grid").not.toBeNull();
    cell!.focus();
    expect(document.activeElement).toBe(cell);

    f.componentRef.setInput("language", "es");
    await f.whenStable();

    const rebuilt = document.getElementById("perio-fg-pd-11-MB");
    expect(rebuilt, "the cell is gone after the rebuild").not.toBeNull();
    expect(rebuilt).not.toBe(cell);
    expect(document.activeElement, "the clinician lost their place in the chart").toBe(rebuilt);
  });

  it("does not steal focus from outside the chart", async () => {
    const f = await openEnglishChart();
    const outside = document.createElement("button");
    outside.id = "host-language-toggle";
    document.body.appendChild(outside);
    outside.focus();

    f.componentRef.setInput("language", "es");
    await f.whenStable();

    expect(document.activeElement, "the chart grabbed focus off the host's control").toBe(outside);
    outside.remove();
  });

  it("gives every focusable control in the grid a unique locator", async () => {
    const f = await openEnglishChart();
    const grid = f.nativeElement.querySelector(".perio-fullgrid-scroll") as HTMLElement;
    const focusable = Array.from(grid.querySelectorAll<HTMLElement>("input, button, select, textarea"));
    expect(focusable.length).toBeGreaterThan(50);
    expect(focusable.filter((el) => !el.id).map((el) => el.className)).toEqual([]);
    const ids = focusable.map((el) => el.id);
    expect([...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))]).toEqual([]);
  });

  it("restores focus on a row-label info button (stable scoped id)", async () => {
    const f = await openEnglishChart();
    const infos = Array.from(
      (f.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(".perio-fullgrid-scroll .perio-info-btn"),
    );
    expect(infos.length).toBeGreaterThan(0);
    const target = infos[0];
    target.focus();
    const id = target.id;
    f.componentRef.setInput("language", "es");
    await f.whenStable();
    expect(document.activeElement?.id).toBe(id);
  });

});

@Component({
  imports: [PerioChartComponent],
  template: `<div id="host-a"><aao-perio-chart [inline]="true" /></div>
    <div id="host-b"><aao-perio-chart [inline]="true" /></div>`,
})
class TwoChartsHost {}

describe("focus restoration is scoped to the chart's own container", () => {
  // Two charts on one page (a host showing two odontograms) build the SAME
  // locator ids. A document-global getElementById returns the first match,
  // the container.contains guard then rejects it, and the second chart would
  // silently skip the restore.
  it("the second of two charts gets its own cell back, not the first one's", async () => {
    TestBed.configureTestingModule({
      imports: [TwoChartsHost],
      providers: [provideZonelessChangeDetection()],
    });
    const f = TestBed.createComponent(TwoChartsHost);
    await f.whenStable();
    const root = f.nativeElement as HTMLElement;
    const cellIn = (host: string) =>
      root.querySelector<HTMLInputElement>(`#${host} [id="perio-fg-pd-11-MB"]`);
    const own = cellIn("host-b");
    expect(cellIn("host-a"), "the first chart is not built").not.toBeNull();
    expect(own, "the second chart is not built").not.toBeNull();
    own!.focus();
    expect(document.activeElement).toBe(own);

    await setI18nLanguage("es");
    await f.whenStable();

    const rebuilt = cellIn("host-b");
    expect(rebuilt, "the second chart's cell is gone").not.toBeNull();
    expect(rebuilt).not.toBe(own);
    expect(
      document.activeElement,
      "focus was not restored inside the second chart (document-global lookup)",
    ).toBe(rebuilt);
  });
});
