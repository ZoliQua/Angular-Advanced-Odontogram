// Angular equivalent of core/__tests__/note-editor-notify.test.tsx (2.7.0):
// the per-tooth note is part of the export payload, so saving or deleting one
// from the note-editor popover must fire notifyStateChange() like any other
// tooth edit. The popover is framework-free core DOM; this spec drives it
// through the Angular shell's real, mounted grid (real engine lifecycle).
// The badge-survives-rebuild half lives in display-settings.spec.ts.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { OdontogramShellComponent } from "../odontogram-shell.component";
import {
  __resetChartStateForTest,
  getStatusChart,
  onStateChange,
  setNotesEnabled,
  setNumberingSystem,
} from "../../../core/odontogram";

vi.setConfig({ testTimeout: 60000, hookTimeout: 60000 });

beforeEach(() => {
  window.matchMedia ??= ((q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent() { return false; },
  })) as unknown as typeof window.matchMedia;
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
    observe() {} unobserve() {} disconnect() {}
  };
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [provideZonelessChangeDetection()],
  });
});

afterEach(() => setNotesEnabled(false));

async function mount() {
  const f = TestBed.createComponent(OdontogramShellComponent);
  f.componentRef.setInput("enableNotes", true);
  await f.whenStable();
  await vi.waitFor(() => {
    const grid = document.getElementById("toothGrid");
    expect(grid && grid.childElementCount).toBeGreaterThan(0);
  });
  return f;
}

function openNoteEditor(toothNo: number) {
  const tile = document.querySelector(`.tooth-tile.side-view[data-tooth="${toothNo}"]`) as HTMLElement;
  tile.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
  const popover = document.querySelector(".odon-note-popover") as HTMLElement;
  expect(popover).toBeTruthy();
  const [save, del] = Array.from(popover.querySelectorAll<HTMLButtonElement>(".odon-note-actions button"));
  return { textarea: popover.querySelector("textarea") as HTMLTextAreaElement, save, del };
}

function notifiesFor(action: () => void): number {
  const spy = vi.fn();
  const unsub = onStateChange(spy);
  action();
  unsub();
  return spy.mock.calls.length;
}

describe("note editor: save/delete notify onStateChange (real engine, Angular shell)", () => {
  it("saving a new note notifies once and lands in the payload", async () => {
    await mount();
    const { textarea, save } = openNoteEditor(11);
    textarea.value = "  sensitive to cold  ";
    expect(notifiesFor(() => save.click())).toBe(1);
    expect(getStatusChart().teeth[11].note).toBe("sensitive to cold");
    expect(document.querySelector(".odon-note-popover")).toBeNull();
  });

  it("re-saving the same note does not notify", async () => {
    await mount();
    const first = openNoteEditor(11);
    first.textarea.value = "same";
    first.save.click();

    const second = openNoteEditor(11);
    expect(second.textarea.value).toBe("same");
    expect(notifiesFor(() => second.save.click())).toBe(0);
  });

  it("deleting a note notifies once and removes it from the payload", async () => {
    await mount();
    const first = openNoteEditor(11);
    first.textarea.value = "to be removed";
    first.save.click();

    const second = openNoteEditor(11);
    expect(notifiesFor(() => second.del.click())).toBe(1);
    expect(getStatusChart().teeth[11].note).toBeUndefined();

    // Deleting an already-empty note is a no-op.
    const third = openNoteEditor(11);
    expect(notifiesFor(() => third.del.click())).toBe(0);
  });
});
