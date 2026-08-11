import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JSDOM } from "jsdom";

// Node 22+ ships a native `localStorage` global (Web Storage API) that, without
// a `--localstorage-file` path, is a non-functional stub (no getItem/setItem/
// clear/etc). Vitest's built-in jsdom test environment deliberately does not
// override an already-present `localStorage` global (see the `k in global`
// check in vitest's `populateGlobal`), so this suite's `localStorage.clear()`/
// `getItem()`/`setItem()` calls would otherwise hit Node's broken stub instead
// of a real Storage implementation. Install a genuine jsdom-backed Storage so
// this suite exercises real localStorage semantics — `jsdom` is already a
// direct devDependency (it backs the `environment: 'jsdom'` config).
if (typeof localStorage === "undefined" || typeof localStorage.clear !== "function") {
  const realStorage = new JSDOM("", { url: "http://localhost/" }).window.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    value: realStorage,
    configurable: true,
    writable: true,
  });
}

// vi.mock factories are hoisted above module-level `const`/`let` declarations,
// so any value referenced *eagerly* inside the factory (not inside a nested
// closure invoked later) must itself be declared via vi.hoisted() to avoid a
// "Cannot access before initialization" TDZ error.
const { stateChangeCallbacks, unsubscribeSpy, importStatusSpy } = vi.hoisted(() => ({
  stateChangeCallbacks: new Set<() => void>(),
  unsubscribeSpy: vi.fn(),
  importStatusSpy: vi.fn(),
}));
let statusPayload: Record<string, unknown> = {};

vi.mock("../odontogram", () => ({
  onStateChange: vi.fn((cb: () => void) => {
    stateChangeCallbacks.add(cb);
    return () => { stateChangeCallbacks.delete(cb); unsubscribeSpy(); };
  }),
  getStatusChart: vi.fn(() => JSON.parse(JSON.stringify(statusPayload))),
  importStatus: importStatusSpy,
}));

import {
  enablePersistence, disablePersistence, clearPersistedState, isPersistenceEnabled,
} from "../persistence";

const KEY = "react-advanced-odontogram";
// Saving is now debounced (SAVE_DEBOUNCE_MS), so flush pending timers after
// firing a state change to keep these synchronous assertions valid.
const fireStateChange = () => { for (const cb of stateChangeCallbacks) cb(); vi.runOnlyPendingTimers(); };

beforeEach(() => {
  vi.useFakeTimers();
  disablePersistence();
  localStorage.clear();
  stateChangeCallbacks.clear();
  vi.clearAllMocks();
  statusPayload = { version: "2.20", globals: { edentulous: false }, teeth: { "11": { toothSelection: "implant" } } };
});

afterEach(() => {
  vi.useRealTimers();
});

describe("persistence lifecycle", () => {
  it("is disabled by default", () => { expect(isPersistenceEnabled()).toBe(false); });

  it("saves a versioned wrapper on state change after enable", () => {
    enablePersistence();
    expect(isPersistenceEnabled()).toBe(true);
    fireStateChange();
    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored.version).toBe(1);
    expect(typeof stored.savedAt).toBe("string");
    expect(stored.payload).toEqual(statusPayload);
  });

  it("debounces rapid state changes — nothing is written until edits settle", () => {
    enablePersistence();
    // Three rapid changes with no timer flush → nothing persisted yet.
    for (let i = 0; i < 3; i++) for (const cb of stateChangeCallbacks) cb();
    expect(localStorage.getItem(KEY)).toBeNull();
    // Only after the debounce window does the settled state get saved.
    vi.advanceTimersByTime(400);
    expect(localStorage.getItem(KEY)).not.toBeNull();
  });

  it("restores the saved payload via importStatus on enable", () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, savedAt: "2026-08-09T00:00:00Z", payload: statusPayload }));
    enablePersistence();
    expect(importStatusSpy).toHaveBeenCalledWith(statusPayload);
  });

  it("does not restore and reports when the wrapper version is unknown", () => {
    const onError = vi.fn();
    localStorage.setItem(KEY, JSON.stringify({ version: 99, payload: {} }));
    enablePersistence({ onError });
    expect(importStatusSpy).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it("reports corrupt JSON without throwing and continues working", () => {
    const onError = vi.fn();
    localStorage.setItem(KEY, "{not json");
    expect(() => enablePersistence({ onError })).not.toThrow();
    expect(onError).toHaveBeenCalled();
    fireStateChange(); // saving still works after a failed restore
    expect(JSON.parse(localStorage.getItem(KEY)!).version).toBe(1);
  });

  it("strips the plan chart unless includePlan is set", () => {
    statusPayload.plan = { "11": { toothSelection: "none" } };
    enablePersistence();
    fireStateChange();
    expect(JSON.parse(localStorage.getItem(KEY)!).payload.plan).toBeUndefined();
    disablePersistence();
    enablePersistence({ includePlan: true });
    fireStateChange();
    expect(JSON.parse(localStorage.getItem(KEY)!).payload.plan).toEqual(statusPayload.plan);
  });

  it("uses a custom key when provided", () => {
    enablePersistence({ key: "my-chart" });
    fireStateChange();
    expect(localStorage.getItem("my-chart")).not.toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("skips oversized payloads and reports instead of throwing", () => {
    const onError = vi.fn();
    statusPayload.teeth = { "11": { note: "x".repeat(4 * 1024 * 1024 + 1) } };
    enablePersistence({ onError });
    fireStateChange();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(onError).toHaveBeenCalled();
  });

  it("disablePersistence unsubscribes and stops saving", () => {
    enablePersistence();
    disablePersistence();
    expect(isPersistenceEnabled()).toBe(false);
    expect(unsubscribeSpy).toHaveBeenCalled();
    fireStateChange();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("enable is idempotent — re-enabling replaces the old subscription", () => {
    enablePersistence();
    enablePersistence({ key: "second" });
    fireStateChange();
    expect(localStorage.getItem("second")).not.toBeNull();
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });

  it("clearPersistedState removes the stored entry", () => {
    enablePersistence();
    fireStateChange();
    clearPersistedState();
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
