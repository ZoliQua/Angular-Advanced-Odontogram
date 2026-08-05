// Angular port of core/__tests__/r2b-changes-box.test.ts.
//
// Mount route: TestBed.createComponent(OdontogramShellComponent) with only
// ODONTOGRAM_ENGINE_LIFECYCLE DI-faked; getOdontogramSummary/getPlanChanges/
// formatToothLabel/onStateChange/setChartMode/__setToothStateForTest/
// __resetChartStateForTest are all the REAL core/odontogram exports — the
// source test's own `vi.mock(..., { ...actual })` forwarded every one of
// them for real already (see odontogram-shell.component.spec.ts's header
// comment for why `vi.mock` itself is unavailable under `npm run test:ng`).
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import {
  getOdontogramSummary,
  getPlanChanges,
  setChartMode,
  __setToothStateForTest,
  __resetChartStateForTest,
} from "../../../core/odontogram";
import { setI18nLanguage, t } from "../../../core/i18n/useI18n";

const engineLifecycle = { init: async () => {}, destroy: () => {} };

beforeEach(() => {
  __resetChartStateForTest();
  setI18nLanguage("en");
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

describe("getOdontogramSummary().plannedChanges", () => {
  it("is [] when no plan chart exists yet", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "none" });
    expect(getOdontogramSummary().plannedChanges).toEqual([]);
  });

  it("is [] when the plan equals status", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "none" });
    setChartMode("plan");
    setChartMode("status");
    expect(getOdontogramSummary().plannedChanges).toEqual([]);
  });

  it("mirrors getPlanChanges() exactly when the plan differs from status", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "none" });
    setChartMode("plan");
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon" });
    setChartMode("status");

    const summary = getOdontogramSummary();
    expect(summary.plannedChanges.length).toBeGreaterThan(0);
    expect(summary.plannedChanges).toEqual(getPlanChanges());
  });
});

describe("#plannedChangesBox in the Tooth-information panel", () => {
  it("is absent when there is no plan", async () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base" });
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#plannedChangesBox")).toBeNull();
  });

  it("is absent when the plan equals status", async () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "none" });
    setChartMode("plan");
    setChartMode("status");
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#plannedChangesBox")).toBeNull();
  });

  it("lists every formatted change (label: axis from → to) when the plan differs", async () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "none" });
    setChartMode("plan");
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon" });
    setChartMode("status");

    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const box = f.nativeElement.querySelector("#plannedChangesBox");
    expect(box).toBeTruthy();

    const text = box!.textContent ?? "";
    expect(text).toContain(t("toothInfo.plannedChanges"));
    expect(text).toContain("16");
    expect(text).toContain(t("planChange.axis.restoration"));
    expect(text).toContain(t("planChange.none"));
    expect(text).toContain(`${t("restoration.type.crown")} – ${t("restoration.material.zircon")}`);
    expect(text).toContain("→");
  });

  it("refreshes live when a plan edit fires notifyStateChange (no remount)", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", orthoDrift: "none" });
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#plannedChangesBox")).toBeNull();

    setChartMode("plan");
    __setToothStateForTest(11, { toothSelection: "tooth-base", orthoDrift: "mesial" });
    setChartMode("status");
    await f.whenStable();

    const box = f.nativeElement.querySelector("#plannedChangesBox");
    expect(box).toBeTruthy();
    expect(box!.textContent ?? "").toContain(t("ortho.drift.mesial"));
  });
});
