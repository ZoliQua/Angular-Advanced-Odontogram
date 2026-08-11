// Angular port of $ENGINE/src/ExportOptionsModal.tsx (228 lines).
//
// Phase 3 Task 4: the "PDF report…" export-settings dialog. Unlike
// SettingsModalComponent/DualStateConfirmComponent (pure views driven
// entirely by host-supplied state), this dialog is SELF-CONTAINED, mirroring
// the TSX exactly: it owns its own checkbox state (all four default ON,
// TSX 52-55), reads/writes case identity (patient name + exam date) straight
// through the engine's `getCaseMeta`/`setPatientName`/`setExamDate` (TSX
// 63-73, 156-180), and calls `exportPdf()` itself on "Export" (TSX 123-133)
// — the host only supplies `open` and reacts to `close`.
//
// Shares the `.odon-confirm-backdrop`/`.odon-confirm-modal` dialog contract
// with DualStateConfirmComponent/SettingsModalComponent (TSX 21-37): root
// `id="exportOptionsModal"` (TSX 135/143), `role="dialog"` + `aria-modal`,
// labelled via an incrementing title id, Esc/backdrop-click closes, focus
// trapped while open + restored to the opener on close — all via Task 1's
// `dialog-focus.ts` helpers, no reimplementation.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  InjectionToken,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { I18nService } from "../../i18n/i18n.service";
import { focusFirst, nextDialogTitleId, trapTabKey } from "../shared/dialog-focus";
import {
  exportPdf,
  getCaseMeta,
  hasAnyPerioData,
  onStateChange,
  setExamDate,
  setPatientName,
} from "../../core/odontogram";
import type { PdfExportOptions } from "../../core/perioPdf";

/**
 * DI seam around TSX 131's `exportPdf(opts)` call. `exportPdf()` is a real
 * core export that lazy-loads jsPDF and drives SVG->PNG rasterization via
 * `canvas`/`Image` — none of which jsdom can run (see perioPdf.ts's
 * "jsPDF-in-jsdom note"). Same pattern as `ODONTOGRAM_ENGINE_LIFECYCLE`
 * (odontogram-shell.component.ts): the default factory wires the real
 * `exportPdf`, and specs override it via `TestBed`'s provider array instead
 * of module-level mocking/spying (`vi.mock`/`vi.spyOn` are unavailable for
 * this builder's Vitest integration — see that token's own doc comment for
 * the full rationale).
 */
export const EXPORT_PDF_FN = new InjectionToken<(opts: PdfExportOptions) => Promise<void>>(
  "EXPORT_PDF_FN",
  { providedIn: "root", factory: () => exportPdf },
);

@Component({
  selector: "aao-export-options-modal",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="odon-confirm-backdrop" (mousedown)="onBackdropMouseDown($event)">
        <div
          id="exportOptionsModal"
          #dialog
          class="odon-confirm-modal"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          tabindex="-1"
          (keydown)="onKeyDown($event)"
        >
          <p class="odon-confirm-message" [id]="titleId">
            {{ i18n.t('export.options.title') }}
          </p>

          <div class="case-meta-row">
            <label class="case-meta-row-label" for="exportOptionsPatientName">
              {{ i18n.t('case.patientName') }}
            </label>
            <input
              id="exportOptionsPatientName"
              class="case-meta-input"
              type="text"
              [value]="nameInput()"
              (input)="onNameInput($event)"
              (blur)="onNameBlur()"
            />
          </div>
          <div class="case-meta-row">
            <label class="case-meta-row-label" for="exportOptionsExamDate">
              {{ i18n.t('case.examDate') }}
            </label>
            <input
              id="exportOptionsExamDate"
              class="case-meta-input"
              type="date"
              [value]="caseMeta().examDate ?? ''"
              (input)="onExamDateInput($event)"
            />
          </div>

          <label>
            <input
              type="checkbox"
              [checked]="patientData()"
              (change)="patientData.set($any($event.target).checked)"
            />
            <span>{{ i18n.t('export.options.patientData') }}</span>
          </label>
          <label>
            <input
              type="checkbox"
              [checked]="odontogram()"
              (change)="odontogram.set($any($event.target).checked)"
            />
            <span>{{ i18n.t('export.options.odontogram') }}</span>
          </label>
          <label>
            <input
              type="checkbox"
              [checked]="perioStatus()"
              [disabled]="!hasPerio()"
              (change)="perioStatus.set($any($event.target).checked)"
            />
            <span>{{ i18n.t('export.options.perioStatus') }}</span>
          </label>
          <label>
            <input
              type="checkbox"
              [checked]="perioDescription()"
              [disabled]="!hasPerio()"
              (change)="perioDescription.set($any($event.target).checked)"
            />
            <span>{{ i18n.t('export.options.perioDescription') }}</span>
          </label>
          @if (!hasPerio()) {
            <p class="hint">{{ i18n.t('export.options.noPerio') }}</p>
          }

          <div class="odon-confirm-actions">
            <button
              type="button"
              class="odon-confirm-btn odon-confirm-cancel"
              (click)="close.emit()"
            >
              {{ i18n.t('export.options.cancel') }}
            </button>
            <button
              type="button"
              class="odon-confirm-btn odon-confirm-accept"
              (click)="onExport()"
            >
              {{ i18n.t('export.options.export') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ExportOptionsModalComponent {
  readonly open = input.required<boolean>();
  readonly close = output<void>();

  protected readonly i18n = inject(I18nService);
  private readonly exportPdfFn = inject(EXPORT_PDF_FN);
  protected readonly titleId = nextDialogTitleId("exportOptionsModalTitle");

  protected readonly patientData = signal(true);
  protected readonly odontogram = signal(true);
  protected readonly perioStatus = signal(true);
  protected readonly perioDescription = signal(true);
  protected readonly hasPerio = signal(false);
  protected readonly caseMeta = signal(getCaseMeta());
  // Local, decoupled buffer for the patient-name input — mirrors TSX 58-63.
  // `setPatientName` trims on every call, and the `onStateChange` re-sync
  // below would snap a just-typed trailing space back, making it impossible
  // to type a space ("John Doe"). So the input is driven by this local
  // buffer and only committed (trimmed) on blur and at export time, never
  // per keystroke.
  protected readonly nameInput = signal(getCaseMeta().patientName ?? "");

  private readonly dialogRef = viewChild<ElementRef<HTMLElement>>("dialog");
  private openerEl: HTMLElement | null = null;

  constructor() {
    // Mirrors TSX 68-80: capture the opener + move focus into the dialog when
    // it opens, and (re)read hasPerio + caseMeta so the dialog reflects the
    // current chart every time it opens. Cleanup restores focus to the opener.
    effect((onCleanup) => {
      const isOpen = this.open();
      const dialog = this.dialogRef()?.nativeElement;
      if (!isOpen || !dialog) return;

      this.openerEl = (document.activeElement as HTMLElement | null) ?? null;
      this.hasPerio.set(hasAnyPerioData());
      this.caseMeta.set(getCaseMeta());
      this.nameInput.set(getCaseMeta().patientName ?? "");
      focusFirst(dialog);

      onCleanup(() => {
        this.openerEl?.focus?.();
      });
    });

    // Mirrors TSX 85-91: keep the name/exam-date inputs (and the hasPerio
    // gate) in sync with the engine while the dialog is open.
    effect((onCleanup) => {
      if (!this.open()) return;
      onCleanup(
        onStateChange(() => {
          this.caseMeta.set(getCaseMeta());
          this.hasPerio.set(hasAnyPerioData());
        }),
      );
    });
  }

  protected onBackdropMouseDown(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.close.emit();
  }

  protected onKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.stopPropagation();
      this.close.emit();
      return;
    }
    if (e.key !== "Tab") return;
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) return;
    trapTabKey(dialog, e);
  }

  protected onNameInput(e: Event): void {
    this.nameInput.set((e.target as HTMLInputElement).value);
  }

  protected onNameBlur(): void {
    const v = this.nameInput();
    setPatientName(v.trim() === "" ? null : v);
  }

  protected onExamDateInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    setExamDate(v === "" ? null : v);
  }

  // Mirrors TSX 123-133's `handleExport` VERBATIM: commit the (possibly
  // untrimmed) name buffer, force-AND the perio flags with `hasPerio`
  // (belt-and-suspenders on top of `exportPdf()`'s own internal auto-skip),
  // fire `exportPdf` fire-and-forget (its own rejection is caught and logged,
  // never surfaced to the caller), and close IMMEDIATELY/synchronously — NOT
  // gated on the export promise. This is intentional, not an oversight: the
  // real `exportPdf()` (core/odontogram.ts) unconditionally shows its own
  // `showExportOverlay()` progress overlay for the whole PDF-generation
  // duration, so the modal must vanish instantly and let that overlay alone
  // carry the progress UX — stacking this modal on top of it for the export's
  // duration (as an earlier revision of this file did, gating `close` on the
  // promise settling) was a review-caught defect, corrected after the
  // controller ruled React parity governs here.
  protected onExport(): void {
    const v = this.nameInput();
    setPatientName(v.trim() === "" ? null : v);
    const opts: PdfExportOptions = {
      patientData: this.patientData(),
      // v2.4.0 resync (Task 1): PdfExportOptions' single `odontogram` flag
      // split into odontogramChart/odontogramDescription/individualNotes.
      // Mechanical stopgap — this modal's single checkbox still drives all
      // three until Task 2/4 gives them independent UI.
      odontogramChart: this.odontogram(),
      odontogramDescription: this.odontogram(),
      individualNotes: this.odontogram(),
      perioStatus: this.perioStatus() && this.hasPerio(),
      perioDescription: this.perioDescription() && this.hasPerio(),
    };
    this.exportPdfFn(opts).catch((err) => console.error("exportPdf failed", err));
    this.close.emit();
  }
}
