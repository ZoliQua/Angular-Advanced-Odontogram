// Angular port of core/__tests__/perio-chart-anatomy-switch.test.ts.
//
// Switching the tooth-anatomy profile while the perio chart is OPEN.
//
// The chart parses its own copy of the tooth templates into `archCache`, and
// that cache used to live for the lifetime of the `active`-gated effect only.
// `resetPerioTemplateCache()` (which `setToothAnatomy()` calls) only clears
// `perioGraphic`'s own promise, so a mounted chart kept drawing MEASURED
// tooth positions out of CLASSIC documents (or vice versa) — the measured
// profile adds templates (12/15/17/31/46) the classic set does not have, so
// those teeth silently vanished from the arch. The Angular fix (Task 4,
// `perio-chart.component.ts`'s `anatomy` signal) makes the cache-building
// effect depend on the anatomy profile, not just on `active`, mirroring the
// TSX source's own `[active, anatomy]` effect-dependency fix.
//
// The React source mounts `<PerioChart open={true}/>` (an overlay). This
// port uses `[inline]="true"` instead — cheaper to mount, and the fix under
// test (the graphic effect's dependency set) is identical in both modes, per
// every other `perio-chart/ported/*.spec.ts` file's own precedent.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { PerioChartComponent } from "../perio-chart.component";
import { hideInfoPopover } from "../perio-grid-dom";
import { setI18nLanguage } from "../../../core/i18n/useI18n";
import { loadTemplateCache, buildBuccalArchSvg } from "../../../core/perioGraphic";
import {
  __resetChartStateForTest,
  setNumberingSystem,
  setToothAnatomy,
  getToothAnatomy,
} from "../../../core/odontogram";

const UPPER_ARCH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];

@Component({
  imports: [PerioChartComponent],
  template: `<aao-perio-chart [inline]="true" />`,
})
class InlineHost {}

function openInline() {
  TestBed.configureTestingModule({
    imports: [InlineHost],
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.createComponent(InlineHost);
}

/** Just the TOOTH GEOMETRY of a buccal row — the part that comes straight
 *  from the parsed templates, without the mm grid / curves / overlay the
 *  mounted chart draws on top. */
const toothGeometry = (root: Element | null | undefined): string =>
  Array.from(root?.querySelectorAll("[data-tooth]") ?? [])
    .map((el) => el.outerHTML)
    .join("");

/** The buccal arch the MOUNTED chart is currently showing. */
const mountedArch = (root: HTMLElement) =>
  toothGeometry(root.querySelector(".perio-tooth-row-buccal"));

/** The buccal arch built headlessly from a cache loaded RIGHT NOW — i.e.
 *  from whichever profile is active at this moment. */
async function freshArch(): Promise<string> {
  const cache = await loadTemplateCache();
  return toothGeometry(buildBuccalArchSvg(cache, UPPER_ARCH).querySelector(".perio-tooth-row-buccal"));
}

beforeEach(() => {
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setI18nLanguage("en");
});

afterEach(async () => {
  hideInfoPopover();
  await setToothAnatomy("classic");
});

describe("perio chart: a live anatomy switch re-parses the templates", () => {
  it("draws from the profile that is active, not the one that was active on mount", async () => {
    expect(getToothAnatomy()).toBe("classic");
    const f = openInline();
    await f.whenStable();
    await loadTemplateCache();
    await f.whenStable();
    const root: HTMLElement = f.nativeElement;

    const classicMounted = mountedArch(root);
    expect(classicMounted.length).toBeGreaterThan(0);
    expect(classicMounted).toBe(await freshArch()); // baseline: agrees on mount

    await setToothAnatomy("measured");
    await f.whenStable();

    // The measured profile has its OWN template set (it adds 12/15/17/31/46).
    // A cache kept from mount would keep drawing the classic documents, so
    // the mounted chart would no longer match a freshly built measured arch.
    const measuredFresh = await freshArch();
    expect(measuredFresh, "the two profiles draw identically — the probe proves nothing").not.toBe(
      classicMounted,
    );
    expect(mountedArch(root), "the chart is still drawing the classic templates").toBe(measuredFresh);

    await setToothAnatomy("classic");
    await f.whenStable();
    expect(mountedArch(root)).toBe(await freshArch());
  });
});
