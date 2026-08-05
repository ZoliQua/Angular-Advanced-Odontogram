// Angular port of core/__tests__/ds1-confirm.test.ts.
//
// The source file has two parts:
//   1. The gate/confirm/batch/preset describe blocks — pure engine-module
//      tests driven entirely through setPerioSite/setChartMode/
//      accept|cancelDualStateConfirm/the DS-1 __*ForTest seams. No React
//      import at all (this file was swept into REACT_DEPENDENT only by the
//      exclusion grep's "useI18n"/"../App"-adjacent keyword matching against
//      its sibling ds1-confirm-revert.test.tsx, or bundled as a same-feature
//      pair — the module itself imports neither React nor ../App). Ported
//      verbatim below, only import paths adjusted.
//   2. A final `<DualStateConfirm> component` describe block that renders
//      React's <DualStateConfirm/> directly. That block is ALREADY ported —
//      see dual-state-confirm.component.spec.ts (Task 3), whose own header
//      comment cites this exact source range (~line 299-340) as its origin,
//      plus additional focus-trap/restore coverage the source didn't
//      exercise. Not duplicated here.
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setChartMode,
  getPlanChanges,
  setPerioSite,
  getToothPerio,
  isDualStateConfirmPending,
  acceptDualStateConfirm,
  cancelDualStateConfirm,
  onStateChange,
  getStatusChart,
  __resetChartStateForTest,
  __getStatusStateForTest,
  __getPlanStateForTest,
  __planEditedTeethForTest,
  __setEdentulousForTest,
  __setToothStateForTest,
  __applyStatusExtraForTest,
} from "../../../core/odontogram";

beforeEach(() => {
  __resetChartStateForTest();
});

describe("single-tooth status edit on a plan-edited tooth", () => {
  function planEditTooth16() {
    setPerioSite(16, "MB", { pd: 5 });
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 });
    expect(__planEditedTeethForTest()).toContain(16);
    setChartMode("status");
  }

  it("does NOT apply immediately — it opens a pending confirm", () => {
    planEditTooth16();

    setPerioSite(16, "MB", { pd: 3 });

    expect(isDualStateConfirmPending()).toBe(true);
    expect(getToothPerio(16).pd.MB).toBe(5);
    expect((__getPlanStateForTest(16) as any).perio.pd.get("MB")).toBe(6);
  });

  it("accept applies the edit (status diverges; plan stays as planned)", () => {
    planEditTooth16();
    setPerioSite(16, "MB", { pd: 3 });

    acceptDualStateConfirm();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getToothPerio(16).pd.MB).toBe(3);
    expect(getPlanChanges().some((c) => c.toothNo === 16 && c.axis === "perio")).toBe(true);
    setChartMode("plan");
    expect(getToothPerio(16).pd.MB).toBe(6);
    setChartMode("status");
  });

  it("cancel leaves state unchanged and clears the pending confirm", () => {
    planEditTooth16();
    setPerioSite(16, "MB", { pd: 3 });

    cancelDualStateConfirm();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getToothPerio(16).pd.MB).toBe(5);
    setChartMode("plan");
    expect(getToothPerio(16).pd.MB).toBe(6);
    setChartMode("status");
  });

  it("cancel notifies listeners (so the UI re-syncs to stored state)", () => {
    planEditTooth16();
    setPerioSite(16, "MB", { pd: 3 });
    const spy = vi.fn();
    const off = onStateChange(spy);

    cancelDualStateConfirm();
    off();

    expect(spy).toHaveBeenCalled();
  });
});

describe("batch edit touching a plan-edited tooth", () => {
  function planEditTooth16() {
    setPerioSite(16, "MB", { pd: 5 });
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 });
    setChartMode("status");
  }

  it("confirms ONCE before applying the whole batch", () => {
    planEditTooth16();

    __setEdentulousForTest(true);

    expect(isDualStateConfirmPending()).toBe(true);
    expect(getToothPerio(16).pd.MB).toBe(5);
  });

  it("accept applies all: the planned tooth diverges, un-planned teeth mirror", () => {
    planEditTooth16();
    __setEdentulousForTest(true);

    acceptDualStateConfirm();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getPlanChanges().some((c) => c.toothNo === 16)).toBe(true);
    expect(getPlanChanges().some((c) => c.toothNo === 26)).toBe(false);
  });

  it("cancel applies none of the batch", () => {
    planEditTooth16();
    __setEdentulousForTest(true);

    cancelDualStateConfirm();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getToothPerio(16).pd.MB).toBe(5);
  });
});

describe("status edit on an un-planned tooth mirrors silently (no dialog)", () => {
  it("does not open the confirm; applies + mirrors so there is no diff", () => {
    setChartMode("plan");
    setChartMode("status");

    setPerioSite(26, "MB", { pd: 4 });

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getToothPerio(26).pd.MB).toBe(4);
    expect(getPlanChanges().some((c) => c.toothNo === 26)).toBe(false);
  });
});

describe("Statuses preset over plan-edited teeth (atomic batch gate)", () => {
  function planEditTeeth1213() {
    __setToothStateForTest(12, { toothSelection: "tooth-base" });
    __setToothStateForTest(13, { toothSelection: "tooth-base" });
    setChartMode("plan");
    setPerioSite(12, "MB", { pd: 6 });
    setPerioSite(13, "MB", { pd: 6 });
    expect(__planEditedTeethForTest()).toContain(12);
    expect(__planEditedTeethForTest()).toContain(13);
    setChartMode("status");
  }

  it("(a) a span over TWO plan-edited teeth confirms ONCE; accept applies to BOTH (no dropped edit)", () => {
    planEditTeeth1213();

    __applyStatusExtraForTest({ type: "span", teeth: [12, 13], material: "zircon" });

    expect(isDualStateConfirmPending()).toBe(true);
    expect((__getStatusStateForTest(12) as any).restorationType).toBe("none");
    expect((__getStatusStateForTest(13) as any).restorationType).toBe("none");

    acceptDualStateConfirm();

    expect(isDualStateConfirmPending()).toBe(false);
    expect((__getStatusStateForTest(12) as any).restorationType).toBe("crown");
    expect((__getStatusStateForTest(13) as any).restorationType).toBe("crown");
  });

  function planEdit12Only() {
    __setToothStateForTest(12, { toothSelection: "tooth-base" });
    __setToothStateForTest(13, { toothSelection: "tooth-base" });
    setChartMode("plan");
    setPerioSite(12, "MB", { pd: 6 });
    setChartMode("status");
    expect(__planEditedTeethForTest()).toContain(12);
    expect(__planEditedTeethForTest()).not.toContain(13);
  }

  it("(b) a span over a planned + an unplanned tooth: while pending NEITHER applied; cancel leaves BOTH untouched", () => {
    planEdit12Only();

    __applyStatusExtraForTest({ type: "span", teeth: [12, 13], material: "zircon" });

    expect(isDualStateConfirmPending()).toBe(true);
    expect((__getStatusStateForTest(12) as any).restorationType).toBe("none");
    expect((__getStatusStateForTest(13) as any).restorationType).toBe("none");

    cancelDualStateConfirm();

    expect(isDualStateConfirmPending()).toBe(false);
    expect((__getStatusStateForTest(12) as any).restorationType).toBe("none");
    expect((__getStatusStateForTest(13) as any).restorationType).toBe("none");
  });

  it("(b) accept applies both; the un-planned tooth mirrors (no diff), the planned one diverges", () => {
    planEdit12Only();

    __applyStatusExtraForTest({ type: "span", teeth: [12, 13], material: "zircon" });
    acceptDualStateConfirm();

    expect((__getStatusStateForTest(12) as any).restorationType).toBe("crown");
    expect((__getStatusStateForTest(13) as any).restorationType).toBe("crown");
    expect(getPlanChanges().some((c) => c.toothNo === 13)).toBe(false);
    expect(getPlanChanges().some((c) => c.toothNo === 12)).toBe(true);
  });
});

describe("setEdentulous global revert on cancel", () => {
  it("(c) cancel leaves globals.edentulous NOT true (global reverted)", () => {
    __setEdentulousForTest(false);
    setPerioSite(16, "MB", { pd: 5 });
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 });
    setChartMode("status");

    __setEdentulousForTest(true);
    expect(isDualStateConfirmPending()).toBe(true);

    cancelDualStateConfirm();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getStatusChart().globals.edentulous).not.toBe(true);
  });

  it("(c) accept sets globals.edentulous true", () => {
    __setEdentulousForTest(false);
    setPerioSite(16, "MB", { pd: 5 });
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 });
    setChartMode("status");

    __setEdentulousForTest(true);
    acceptDualStateConfirm();

    expect(getStatusChart().globals.edentulous).toBe(true);
  });
});
