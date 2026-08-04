// Part of React Odontogram Modul - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-3b Task 4: `buildPerioSvg()` — the full perio chart (teeth graphic +
// numeric rows + 2017 classification) built headlessly, as ONE standalone
// vector SVG, from state (not the mounted `PerioChart` DOM).
//
// `buildPerioSvg()` awaits the SAME `loadTemplateCache()` `perioGraphic.ts`
// exports. Tooth templates are now INLINED into the bundle (via `?raw` imports
// in `odontogram.ts`) and parsed directly — no `fetch()` — so this suite needs
// no network/asset stub; the cache resolves from the inlined markup. The
// template-load FAILURE path is exercised by spying on `loadTemplateCache` and
// forcing a rejection (see first test), instead of the old fetch-404 stub.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as perioGraphic from "../perioGraphic";
import { buildPerioSvg } from "../perioExport";
import { __resetChartStateForTest, setPerioSite } from "../odontogram";
import { t } from "../i18n/useI18n";

beforeEach(() => {
  __resetChartStateForTest();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("UI-3b T4: buildPerioSvg", () => {
  it("returns null gracefully when the tooth-template cache cannot be loaded", async () => {
    // Templates are inlined now, so a load failure is only possible via an
    // internal fault in `loadTemplateCache` (e.g. a parse error). Force it to
    // reject to prove `buildPerioSvg`'s null-guard still holds. `mockRestore`
    // (in afterEach) hands subsequent tests the real, successful loader.
    vi.spyOn(perioGraphic, "loadTemplateCache").mockRejectedValueOnce(
      new Error("forced template-load failure"),
    );
    const built = await buildPerioSvg();
    expect(built).toBeNull();
  });

  it("returns a serialized SVG with positive dimensions", async () => {
    setPerioSite(11, "MB", { pd: 4 });
    const built = await buildPerioSvg();
    expect(built).not.toBeNull();
    expect(built!.xml.startsWith("<?xml") || built!.xml.includes("<svg")).toBe(true);
    expect(built!.width).toBeGreaterThan(0);
    expect(built!.height).toBeGreaterThan(0);
  });

  it("emits <text> for charted numeric values", async () => {
    // PD 7 is a DISTINCTIVE probe value: the mm-guide grid only ever labels
    // 5/10/15, and permanent tooth numbers containing 7 (17/27/37/47)
    // serialize as ">17<" etc. (never ">7<"), so a ">7<" text node can ONLY
    // come from the charted PD value actually rendering — guards against a
    // false-positive where a grid/tooth-number label coincidentally matches.
    setPerioSite(11, "MB", { pd: 7 });
    const built = await buildPerioSvg();
    expect(built!.xml).toContain("<text");
    expect(built!.xml).toContain(">7<"); // the charted PD value rendered as text
  });

  it("localizes the 2017-classification block labels + values (not raw enums)", async () => {
    const built = await buildPerioSvg();
    // Labels come through i18n, exactly like PerioSidebar's panel — the raw
    // English literal "Diagnosis:" and the raw enum value "health" must NOT leak.
    expect(built!.xml).toContain(t("perio.class.diagnosis"));
    expect(built!.xml).toContain(t("perio.class.dx.health")); // blank chart → healthy, localized
    expect(built!.xml).not.toContain(">Diagnosis: health<");
  });
});
