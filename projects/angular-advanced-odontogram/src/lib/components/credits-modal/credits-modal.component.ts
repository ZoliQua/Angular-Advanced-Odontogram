// Angular port of $ENGINE@934a911:src/CreditsModal.tsx (181 lines) —
// v2.4.0/1.2.0 resync: the "About and credits" popup, opened from the
// topbar's Credits button (`ui.creditsOpen`/`ui.setCreditsOpen`, wired in
// Task 2). Mirrors DualStateConfirmComponent's/SettingsModalComponent's
// dialog contract exactly — `role="dialog"` + `aria-modal`, Escape closes,
// backdrop-mousedown-on-self closes, focus trapped while open and restored
// to the opener on close (`shared/dialog-focus.ts` helpers) — no new a11y
// pattern introduced, per the brief ("copy whatever upstream CreditsModal
// does, no more").
//
// ADAPTED STRINGS/LINKS (owner-visible — see the Task 4 report's table for
// the full rationale; amended after review round 1 — see that round's finding
// for why the ORIGINAL_PROJECT section below exists):
//  - `REPO_URL` (the bottom "Star on GitHub" button, `credits.star`):
//    upstream points at the original React project
//    (https://github.com/ZoliQua/React-Odontogram-Modul); this port points
//    at THIS package's own repo (https://github.com/ZoliQua/Angular-Advanced-Odontogram),
//    matching OdontogramTopbarComponent's own `#btnGithubLink` (Task 2) —
//    one consistent "this package's repo" URL across the shell.
//  - `LIBRARIES`: `React`/`Vite` (build-time deps of the ORIGINAL project,
//    not this package) replaced with `Angular`/`Angular CLI` (this
//    package's actual framework/build tool per `package.json`) — jsPDF,
//    DOMPurify, TypeScript and Tailwind CSS are genuinely still used here
//    unchanged.
//  - `credits.intro` (translations.ts, all 12 languages, core file): the
//    app-name mention "React Advanced Odontogram" swapped to "Angular
//    Advanced Odontogram" — the same proper-noun substitution already
//    applied to `app.title` (spec §2 deviation #4), just re-applied to this
//    second key the pin's own resync didn't touch.
//  - CREATOR (`@ZoliQua` + `credits.contrib.zoliqua`) and every CONTRIBUTORS
//    entry are UNCHANGED — the creator/contributor credits stay intact
//    verbatim, per the brief.
//  - NEW: an "Original Project" section (`ORIGINAL_PROJECT_URL`,
//    `credits.originalProjectTitle`/`.originalProjectDesc`, translated in all
//    12 languages) was ADDED, mirroring the Creator section's own
//    heading+list+link+desc shape, immediately after it. Restores a visible,
//    clickable, in-modal credit to https://github.com/ZoliQua/React-Odontogram-Modul
//    — the three adaptations above only redirect THIS package's own
//    app-identity touchpoints; they must not (and, with this section, no
//    longer do) remove the original project's own attribution from the
//    rendered modal.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import { I18nService } from "../../i18n/i18n.service";
import { focusFirst, nextDialogTitleId, trapTabKey } from "../shared/dialog-focus";

/** This package's own repo — the modal's "app-identity" link (TSX `REPO_URL`,
 *  adapted; see this file's header comment). */
const REPO_URL = "https://github.com/ZoliQua/Angular-Advanced-Odontogram";

/** The ORIGINAL React project this package is a port of — NOT in the pinned
 *  TSX (which IS that project, so it never credits itself). Added post-review
 *  round 1 so the modal keeps a visible, clickable credit to the upstream
 *  project once `REPO_URL`/`LIBRARIES` above were adapted to this package's
 *  own identity; see this file's header comment. */
const ORIGINAL_PROJECT_URL = "https://github.com/ZoliQua/React-Odontogram-Modul";

/** The creator / lead developer, called out separately from the
 *  contributors (TSX `CREATOR`, unchanged). */
const CREATOR = { handle: "ZoliQua", descKey: "credits.contrib.zoliqua" } as const;

/** Human contributors and what each one added (TSX `CONTRIBUTORS`,
 *  unchanged — kept as data so a new contributor is a one-line addition). */
const CONTRIBUTORS: ReadonlyArray<{ handle: string; descKey: string }> = [
  { handle: "odontodev", descKey: "credits.contrib.odontodev" },
  { handle: "JulianoBazzi", descKey: "credits.contrib.julianobazzi" },
  { handle: "yassine-bhn", descKey: "credits.contrib.yassine" },
  { handle: "saegerdirk-star", descKey: "credits.contrib.saegerdirk" },
];

/** External projects this package is built with (TSX `LIBRARIES`, names are
 *  proper nouns and NOT translated — adapted to this package's actual
 *  framework/build tool, see this file's header comment). */
const LIBRARIES: ReadonlyArray<{ name: string; url: string }> = [
  { name: "jsPDF", url: "https://github.com/parallax/jsPDF" },
  { name: "DOMPurify", url: "https://github.com/cure53/DOMPurify" },
  { name: "Angular", url: "https://angular.dev" },
  { name: "Angular CLI", url: "https://angular.dev/tools/cli" },
  { name: "TypeScript", url: "https://www.typescriptlang.org" },
  { name: "Tailwind CSS", url: "https://tailwindcss.com" },
];

@Component({
  selector: "aao-credits-modal",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="odon-confirm-backdrop" (mousedown)="onBackdropMouseDown($event)">
        <div
          id="creditsModal"
          #dialog
          class="odon-credits-modal"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          tabindex="-1"
          (keydown)="onKeyDown($event)"
        >
          <button
            type="button"
            class="odon-settings-close"
            (click)="close.emit()"
            [attr.aria-label]="i18n.t('credits.close')"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <h2 class="odon-credits-title" [id]="titleId">{{ i18n.t('credits.title') }}</h2>

          <div class="odon-credits-body">
            <p class="odon-credits-intro">{{ i18n.t('credits.intro') }}</p>

            <section class="odon-credits-section">
              <h3 class="odon-credits-heading">{{ i18n.t('credits.creatorTitle') }}</h3>
              <ul class="odon-credits-list">
                <li>
                  <a
                    class="odon-credits-link"
                    [href]="'https://github.com/' + creator.handle"
                    target="_blank"
                    rel="noopener noreferrer"
                  >&#64;{{ creator.handle }}</a>
                  <span class="odon-credits-desc">{{ i18n.t(creator.descKey) }}</span>
                </li>
              </ul>
            </section>

            <section class="odon-credits-section">
              <h3 class="odon-credits-heading">{{ i18n.t('credits.originalProjectTitle') }}</h3>
              <ul class="odon-credits-list">
                <li>
                  <a
                    class="odon-credits-link"
                    [href]="originalProjectUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >React Advanced Odontogram</a>
                  <span class="odon-credits-desc">{{ i18n.t('credits.originalProjectDesc') }}</span>
                </li>
              </ul>
            </section>

            <section class="odon-credits-section">
              <h3 class="odon-credits-heading">{{ i18n.t('credits.contributorsTitle') }}</h3>
              <ul class="odon-credits-list">
                @for (c of contributors; track c.handle) {
                  <li>
                    <a
                      class="odon-credits-link"
                      [href]="'https://github.com/' + c.handle"
                      target="_blank"
                      rel="noopener noreferrer"
                    >&#64;{{ c.handle }}</a>
                    <span class="odon-credits-desc">{{ i18n.t(c.descKey) }}</span>
                  </li>
                }
              </ul>
            </section>

            <section class="odon-credits-section">
              <h3 class="odon-credits-heading">{{ i18n.t('credits.librariesTitle') }}</h3>
              <ul class="odon-credits-libs">
                @for (l of libraries; track l.name) {
                  <li>
                    <a class="odon-credits-link" [href]="l.url" target="_blank" rel="noopener noreferrer">{{ l.name }}</a>
                  </li>
                }
              </ul>
            </section>

            <p class="odon-credits-welcome">{{ i18n.t('credits.welcome') }}</p>
          </div>

          <a class="odon-credits-star" [href]="repoUrl" target="_blank" rel="noopener noreferrer">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            <span>{{ i18n.t('credits.star') }}</span>
          </a>
        </div>
      </div>
    }
  `,
})
export class CreditsModalComponent {
  readonly open = input.required<boolean>();
  readonly close = output<void>();

  protected readonly i18n = inject(I18nService);
  protected readonly titleId = nextDialogTitleId("creditsTitle");
  protected readonly creator = CREATOR;
  protected readonly contributors = CONTRIBUTORS;
  protected readonly libraries = LIBRARIES;
  protected readonly repoUrl = REPO_URL;
  protected readonly originalProjectUrl = ORIGINAL_PROJECT_URL;

  private readonly dialogRef = viewChild<ElementRef<HTMLElement>>("dialog");
  private openerEl: HTMLElement | null = null;

  constructor() {
    // Mirrors CreditsModal.tsx lines 59-69: capture the opener + move focus
    // into the dialog when it opens; the cleanup (invoked on close and on
    // destroy) restores focus to the opener — same pattern as
    // DualStateConfirmComponent/SettingsModalComponent.
    effect((onCleanup) => {
      const isOpen = this.open();
      const dialog = this.dialogRef()?.nativeElement;
      if (!isOpen || !dialog) return;

      this.openerEl = (document.activeElement as HTMLElement | null) ?? null;
      focusFirst(dialog);

      onCleanup(() => {
        this.openerEl?.focus?.();
      });
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
}
