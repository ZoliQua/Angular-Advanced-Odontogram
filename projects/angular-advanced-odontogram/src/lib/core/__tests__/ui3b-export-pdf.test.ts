// Part of React Odontogram Modul - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-3b Task 6: `assemblePdf()` — pure section-gating assembler behind
// `exportPdf()`. Verified with an injectable fake jsPDF-like doc (see
// `PdfDocLike` in `../perioPdf`) rather than a real jsPDF instance, since
// jsPDF may not instantiate cleanly under jsdom — this suite asserts WHICH
// sections get added (headings/images/save), never pixel output.
import { describe, it, expect } from "vitest";
import { assemblePdf } from "../perioPdf";

function fakeDoc() {
  const calls: string[] = [];
  return {
    calls,
    text: (...a: any[]) => { calls.push("text:" + String(a[0]).slice(0,20)); return doc; },
    addImage: () => { calls.push("addImage"); return doc; },
    addPage: () => { calls.push("addPage"); return doc; },
    setFontSize: () => doc, setFont: () => doc, save: () => { calls.push("save"); },
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
  } as any;
  var doc: any;
}

const baseData = {
  hasPerio: true,
  caseMeta: { patientName: "X", examDate: "2026-01-01" } as any,
  odontogramPng: "data:image/png;base64,AAA", odontogramSummaryText: "Odonto summary",
  perioPng: "data:image/png;base64,BBB", perioSummaryText: "Perio summary",
};

describe("UI-3b T6: assemblePdf section gating", () => {
  it("includes perio when opts.perioStatus and data exist", () => {
    const doc = fakeDoc();
    assemblePdf({ patientData: true, odontogram: true, perioStatus: true, perioDescription: true }, baseData, () => doc);
    expect(doc.calls).toContain("addImage");            // both charts
    expect(doc.calls.filter((c:string)=>c==="addImage").length).toBe(2);
    expect(doc.calls).toContain("save");
  });

  it("auto-skips perio when hasPerio is false, even if opts ask for it", () => {
    const doc = fakeDoc();
    assemblePdf({ patientData: true, odontogram: true, perioStatus: true, perioDescription: true },
      { ...baseData, hasPerio: false }, () => doc);
    expect(doc.calls.filter((c:string)=>c==="addImage").length).toBe(1); // odontogram only
  });

  it("omits odontogram section when opts.odontogram is false", () => {
    const doc = fakeDoc();
    assemblePdf({ patientData: true, odontogram: false, perioStatus: true, perioDescription: true }, baseData, () => doc);
    expect(doc.calls.filter((c:string)=>c==="addImage").length).toBe(1); // perio only
  });
});
