// Angular port of core/__tests__/public-api-exports.test.ts. The source test
// imports its 17 functions from React's `../App` — App.tsx's job there was
// purely to re-export them from odontogram.ts (see App.tsx's own import
// list); it introduced no functions of its own. Angular's equivalent public
// surface is `public-api.ts`'s `export * from "./lib/core/odontogram"`
// (odontogram-shell.component.ts itself is a component, not a re-export
// module), so this ports by importing directly from core/odontogram — same
// functions, same "is it exported and callable" assertions, substance
// unchanged.
import { describe, it, expect } from "vitest";
import {
  initOdontogram,
  destroyOdontogram,
  setNumberingSystem,
  getChartMode,
  setChartMode,
  getStatusChart,
  getPlanChart,
  setPlanChart,
  getPlanChanges,
  openPerioOverlay,
  closePerioOverlay,
  isPerioOverlayOpen,
  hasAnyPerioData,
  exportStatus,
  importStatus,
  exportPdf,
  exportPerioImage,
  exportPerioSvg,
} from "../../../core/odontogram";

describe("public API exports — core/odontogram.ts (App.tsx's React re-export surface)", () => {
  it("exports lifecycle functions", () => {
    expect(initOdontogram).toBeDefined();
    expect(typeof initOdontogram).toBe("function");
    expect(destroyOdontogram).toBeDefined();
    expect(typeof destroyOdontogram).toBe("function");
  });

  it("exports chart-mode control functions", () => {
    expect(getChartMode).toBeDefined();
    expect(typeof getChartMode).toBe("function");
    expect(setChartMode).toBeDefined();
    expect(typeof setChartMode).toBe("function");
  });

  it("exports state serialization functions", () => {
    expect(getStatusChart).toBeDefined();
    expect(typeof getStatusChart).toBe("function");
    expect(getPlanChart).toBeDefined();
    expect(typeof getPlanChart).toBe("function");
    expect(setPlanChart).toBeDefined();
    expect(typeof setPlanChart).toBe("function");
  });

  it("exports plan-diff function", () => {
    expect(getPlanChanges).toBeDefined();
    expect(typeof getPlanChanges).toBe("function");
  });

  it("exports numbering system setter", () => {
    expect(setNumberingSystem).toBeDefined();
    expect(typeof setNumberingSystem).toBe("function");
  });

  it("exports perio overlay control functions", () => {
    expect(openPerioOverlay).toBeDefined();
    expect(typeof openPerioOverlay).toBe("function");
    expect(closePerioOverlay).toBeDefined();
    expect(typeof closePerioOverlay).toBe("function");
    expect(isPerioOverlayOpen).toBeDefined();
    expect(typeof isPerioOverlayOpen).toBe("function");
  });

  it("exports perio data presence check", () => {
    expect(hasAnyPerioData).toBeDefined();
    expect(typeof hasAnyPerioData).toBe("function");
  });

  it("exports JSON import/export functions", () => {
    expect(exportStatus).toBeDefined();
    expect(typeof exportStatus).toBe("function");
    expect(importStatus).toBeDefined();
    expect(typeof importStatus).toBe("function");
  });

  it("exports periodontal export format functions", () => {
    expect(exportPdf).toBeDefined();
    expect(typeof exportPdf).toBe("function");
    expect(exportPerioImage).toBeDefined();
    expect(typeof exportPerioImage).toBe("function");
    expect(exportPerioSvg).toBeDefined();
    expect(typeof exportPerioSvg).toBe("function");
  });
});
