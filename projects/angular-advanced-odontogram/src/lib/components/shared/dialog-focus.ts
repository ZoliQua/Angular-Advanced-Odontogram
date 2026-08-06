// Shared focus-trap helpers for the library's modal dialogs (DualStateConfirm,
// and the SettingsModal/ExportOptionsModal that follow in Phase 3 Tasks 2/4).
// Extracted verbatim from DualStateConfirmComponent's inline focus-trap logic
// — see dual-state-confirm.component.ts's history for the original TSX
// citations (DualStateConfirm.tsx lines 45-82). No component imports here:
// this module is plain DOM logic only.

/** Selector for elements a dialog's focus trap should consider focusable. */
export const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// jsdom performs no layout, so `offsetParent` is always `null` there — the
// TSX's `el.offsetParent !== null` visibility filter would exclude every
// element under Vitest/jsdom and break the focus trap in tests. Feature-detect
// jsdom via its distinctive `navigator.userAgent` and fall back to "always
// visible" only in that environment; real browsers keep the original
// offsetParent check verbatim.
const IS_JSDOM =
  typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent);

/** jsdom-safe visibility check used to filter the focus-trap's candidate list. */
export function isVisible(el: HTMLElement): boolean {
  return IS_JSDOM ? true : el.offsetParent !== null;
}

/**
 * Manual Tab/Shift+Tab focus-wrap for a dialog: when Tab would move focus
 * outside the dialog's focusable set, wrap it back to the other end instead.
 * No-op for any key other than "Tab", and when there is no focusable element.
 */
export function trapTabKey(dialog: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== "Tab") return;
  const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => isVisible(el) || el === document.activeElement,
  );
  if (items.length === 0) return;
  const firstEl = items[0];
  const lastEl = items[items.length - 1];
  const active = document.activeElement as HTMLElement | null;
  if (event.shiftKey && active === firstEl) {
    event.preventDefault();
    lastEl.focus();
  } else if (!event.shiftKey && active === lastEl) {
    event.preventDefault();
    firstEl.focus();
  }
}

/** Move focus to the dialog's first focusable element, or the dialog itself if none. */
export function focusFirst(dialog: HTMLElement): void {
  const first = dialog.querySelector<HTMLElement>(FOCUSABLE);
  (first ?? dialog).focus();
}

let nextTitleId = 0;

/** Incrementing, collision-free id factory for dialog title/message elements. */
export function nextDialogTitleId(prefix: string): string {
  return `${prefix}-${nextTitleId++}`;
}
