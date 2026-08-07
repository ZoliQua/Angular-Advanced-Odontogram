// Angular port of the ExportOptionsModal contract from
// $ENGINE/src/ExportOptionsModal.tsx (228 lines) — Phase 3 Task 4. Unlike
// SettingsModalComponent/DualStateConfirmComponent, this dialog is
// self-contained (owns its own checkbox state + reads/writes case identity +
// calls exportPdf itself), so these specs drive it through the REAL engine
// seams (`getCaseMeta`, `setPerioSite`, `resetEngineStateForTest` via the
// global vitest setup) rather than a host-supplied settings object — plus a
// DI-injected `EXPORT_PDF_FN` substitute (see that token's doc comment in the
// component for why: real `exportPdf` does jsPDF/canvas work jsdom can't run).
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { EXPORT_PDF_FN, ExportOptionsModalComponent } from "./export-options-modal.component";
import { setI18nLanguage } from "../../core/i18n/useI18n";
import { getCaseMeta, setPerioSite } from "../../core/odontogram";
import type { PdfExportOptions } from "../../core/perioPdf";

@Component({
  imports: [ExportOptionsModalComponent],
  template: `<button id="opener" type="button">opener</button>
    <aao-export-options-modal [open]="open()" (close)="closed = true" />`,
})
class HostComponent {
  open = signal(false);
  closed = false;
}

describe("ExportOptionsModalComponent", () => {
  let exportPdfSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setI18nLanguage("en");
    exportPdfSpy = vi.fn(() => Promise.resolve());
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: EXPORT_PDF_FN, useValue: exportPdfSpy },
      ],
    });
  });

  afterEach(() => {
    setI18nLanguage("en");
  });

  it("(a) renders nothing while closed; open renders #exportOptionsModal with 4 default-checked checkboxes", async () => {
    const f = TestBed.createComponent(HostComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#exportOptionsModal")).toBeNull();
    expect(f.nativeElement.querySelector(".odon-confirm-backdrop")).toBeNull();

    f.componentInstance.open.set(true);
    await f.whenStable();

    const dialog = f.nativeElement.querySelector("#exportOptionsModal") as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute("role")).toBe("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.classList.contains("odon-confirm-modal")).toBe(true);

    const checkboxes = Array.from(
      dialog.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
    );
    expect(checkboxes.length).toBe(4);
    for (const cb of checkboxes) expect(cb.checked).toBe(true);
  });

  it("(b) no perio data disables the perio checkboxes + shows the hint; seeded perio data enables them", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();

    let dialog = f.nativeElement.querySelector("#exportOptionsModal") as HTMLElement;
    let checkboxes = Array.from(
      dialog.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
    );
    expect(checkboxes[2].disabled).toBe(true); // perioStatus
    expect(checkboxes[3].disabled).toBe(true); // perioDescription
    expect(dialog.querySelector(".hint")).not.toBeNull();

    // Close, seed real perio data, reopen — mirrors TSX's re-read-on-open.
    f.componentInstance.open.set(false);
    await f.whenStable();
    setPerioSite(16, "MB", { pd: 4 });
    f.componentInstance.open.set(true);
    await f.whenStable();

    dialog = f.nativeElement.querySelector("#exportOptionsModal") as HTMLElement;
    checkboxes = Array.from(dialog.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
    expect(checkboxes[2].disabled).toBe(false);
    expect(checkboxes[3].disabled).toBe(false);
    expect(dialog.querySelector(".hint")).toBeNull();
  });

  it("(c) typing a patient name commits through setPatientName on blur", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();

    const dialog = f.nativeElement.querySelector("#exportOptionsModal") as HTMLElement;
    const nameInput = dialog.querySelector<HTMLInputElement>("#exportOptionsPatientName")!;
    nameInput.value = "Jane Doe";
    nameInput.dispatchEvent(new Event("input", { bubbles: true }));
    nameInput.dispatchEvent(new Event("blur", { bubbles: true }));
    await f.whenStable();

    expect(getCaseMeta().patientName).toBe("Jane Doe");
  });

  it("(d) export forces perio flags off when hasPerio is false (even if checked) and emits close synchronously (fire-and-forget export, mirrors TSX 131-132)", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();

    const dialog = f.nativeElement.querySelector("#exportOptionsModal") as HTMLElement;
    const buttons = dialog.querySelectorAll<HTMLButtonElement>(".odon-confirm-btn");
    const exportBtn = Array.from(buttons).find((b) =>
      b.classList.contains("odon-confirm-accept"),
    )!;
    exportBtn.click();

    // close must fire in the SAME turn as the click — the real exportPdf()
    // shows its own progress overlay for the whole export duration, so this
    // modal must vanish instantly rather than stay stacked on top of it.
    expect(f.componentInstance.closed).toBe(true);
    expect(exportPdfSpy).toHaveBeenCalledTimes(1);
    const opts = exportPdfSpy.mock.calls[0][0] as PdfExportOptions;
    expect(opts.patientData).toBe(true);
    expect(opts.odontogram).toBe(true);
    expect(opts.perioStatus).toBe(false);
    expect(opts.perioDescription).toBe(false);
  });

  it("(d2) a rejected export still closes synchronously and routes the error through console.error (mirrors TSX's .catch)", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = new Error("boom");
    exportPdfSpy.mockImplementation(() => Promise.reject(err));

    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();

    const dialog = f.nativeElement.querySelector("#exportOptionsModal") as HTMLElement;
    const exportBtn = Array.from(
      dialog.querySelectorAll<HTMLButtonElement>(".odon-confirm-btn"),
    ).find((b) => b.classList.contains("odon-confirm-accept"))!;

    expect(() => exportBtn.click()).not.toThrow();
    expect(f.componentInstance.closed).toBe(true);

    // Flush the rejected promise's microtask so the component's own .catch()
    // runs before the test ends (otherwise this would surface as an
    // unhandled rejection instead of exercising the TSX's catch route).
    await Promise.resolve();
    await Promise.resolve();
    await f.whenStable();

    expect(consoleErrorSpy).toHaveBeenCalledWith("exportPdf failed", err);
    consoleErrorSpy.mockRestore();
  });

  // Phase 4 Task 6 adjudication: core/__tests__/ui3b-export-options-modal.test.ts
  // (the frozen React corpus source for this component) was compared
  // assertion-by-assertion against this file. Most of its coverage is
  // already subsumed above (defaults/checkbox state -> (a), perio-gate
  // enable/disable -> (b), forced-off export opts -> (d)). Four assertions
  // were genuinely UNCOVERED and are ported here verbatim (substance
  // unchanged, DOM-event mechanics only): Escape/backdrop-close and the
  // Cancel button (this dialog shares DualStateConfirmComponent's
  // `dialog-focus.ts` contract per this component's own doc comment, but no
  // spec anywhere exercises Escape/backdrop/Cancel on THIS component
  // specifically), and an Export call with perio data PRESENT (so the
  // checked opts pass through un-forced — every existing Export-path test
  // exercises the hasPerio=false forced-off branch only).
  it("(e) Escape closes the dialog", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();

    const dialog = f.nativeElement.querySelector("#exportOptionsModal") as HTMLElement;
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await f.whenStable();

    expect(f.componentInstance.closed).toBe(true);
  });

  it("(f) backdrop click closes the dialog", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();

    const backdrop = f.nativeElement.querySelector(".odon-confirm-backdrop") as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await f.whenStable();

    expect(f.componentInstance.closed).toBe(true);
  });

  it("(g) Cancel closes without calling exportPdf", async () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();

    const dialog = f.nativeElement.querySelector("#exportOptionsModal") as HTMLElement;
    const cancelBtn = Array.from(
      dialog.querySelectorAll<HTMLButtonElement>(".odon-confirm-btn"),
    ).find((b) => b.classList.contains("odon-confirm-cancel"))!;
    cancelBtn.click();
    await f.whenStable();

    expect(f.componentInstance.closed).toBe(true);
    expect(exportPdfSpy).not.toHaveBeenCalled();
  });

  it("(h) export with perio data PRESENT passes the (checked, un-forced) perio opts through as-is", async () => {
    setPerioSite(11, "MB", { pd: 4 });
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.open.set(true);
    await f.whenStable();

    const dialog = f.nativeElement.querySelector("#exportOptionsModal") as HTMLElement;
    const exportBtn = Array.from(
      dialog.querySelectorAll<HTMLButtonElement>(".odon-confirm-btn"),
    ).find((b) => b.classList.contains("odon-confirm-accept"))!;
    exportBtn.click();

    expect(exportPdfSpy).toHaveBeenCalledTimes(1);
    const opts = exportPdfSpy.mock.calls[0][0] as PdfExportOptions;
    expect(opts.patientData).toBe(true);
    expect(opts.odontogram).toBe(true);
    expect(opts.perioStatus).toBe(true);
    expect(opts.perioDescription).toBe(true);
  });
});
