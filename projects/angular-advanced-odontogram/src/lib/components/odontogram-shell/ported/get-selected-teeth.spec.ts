// Angular port of core/__tests__/get-selected-teeth.test.ts (v2.6.0 resync,
// Phase 11 Task 5). `getSelectedTeeth()` — the public read of the multi-tooth
// selection, contributed in a downstream fork upstream adopted. Four of the
// five upstream cases exercise `../odontogram` directly (framework-free) —
// ported verbatim here, same seams (`__setSelectionForTest`,
// `__resetChartStateForTest`), import paths adjusted for
// components/odontogram-shell/ported/. The fifth ("is part of the public
// entry point") statically imports React's `../App` to assert
// `typeof App.getSelectedTeeth === "function"`; its Angular equivalent (does
// `getSelectedTeeth` reach OUR public entry point, `public-api.ts`) is ported
// in ../../../public-api-surface.spec.ts instead, since `../App`'s role here
// is purely "re-exports odontogram.ts's functions" — the same role
// `public-api.ts`'s `export * from "./lib/core/odontogram"` already plays.
import { describe, it, expect, beforeEach } from "vitest";
import {
  getSelectedTeeth,
  clearSelection,
  __setSelectionForTest,
  __resetChartStateForTest,
} from "../../../core/odontogram";

beforeEach(() => {
  __resetChartStateForTest();
  clearSelection();
});

describe("getSelectedTeeth", () => {
  it("is empty when nothing is selected", () => {
    expect(getSelectedTeeth()).toEqual([]);
  });

  it("returns the selection in the order it was made", () => {
    __setSelectionForTest([26, 11, 47]);
    expect(getSelectedTeeth()).toEqual([26, 11, 47]);
  });

  it("hands out a copy — changing it never changes the selection", () => {
    __setSelectionForTest([16, 17]);
    const got = getSelectedTeeth();
    got.push(18);
    got.length = 0;
    expect(getSelectedTeeth()).toEqual([16, 17]);
  });

  it("follows clearSelection()", () => {
    __setSelectionForTest([21, 22]);
    clearSelection();
    expect(getSelectedTeeth()).toEqual([]);
  });
});
