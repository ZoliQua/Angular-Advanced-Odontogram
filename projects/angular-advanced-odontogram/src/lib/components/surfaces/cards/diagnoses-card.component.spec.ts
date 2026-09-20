// Angular spec for DiagnosesCardComponent (v2.6.0 resync, Phase 11 Task 3).
// Mounts the full OdontogramShellComponent — same DI-seam mount route as
// `root-periodontium-card.spec.ts`/`fillings-card.spec.ts` (a fake
// ODONTOGRAM_ENGINE_LIFECYCLE substitutes the real wireControls()/rebuildGrid()
// engine bootstrap, since `vi.mock()` is unavailable under the `ng test`
// builder for relative specifiers) — because `getActiveDiagnoses()`/
// `engineState()` need a real injection context and a genuinely mounted tree.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../../odontogram-shell/odontogram-shell.component";
import {
  getActiveDiagnoses,
  getStatusChart,
  setChartMode,
  setNumberingSystem,
  __resetChartStateForTest,
  __setSelectionForTest,
  __setToothStateForTest,
} from "../../../core/odontogram";

const engineLifecycle = { init: async () => {}, destroy: () => {} };

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  __resetChartStateForTest();
  setChartMode("status");
  setNumberingSystem("FDI");
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

function fire(el: HTMLInputElement | HTMLSelectElement, type = "change"): void {
  el.dispatchEvent(new Event(type));
}

describe("DiagnosesCardComponent", () => {
  it("renders a row for a tooth's rule-derived diagnosis, code-first", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", pulpDx: "irreversible-pulpitis" });
    __setSelectionForTest([11]);
    expect(getActiveDiagnoses().visible).toBe(true);
    expect(getActiveDiagnoses().rows.some((r) => r.key === "pulpitis")).toBe(true);

    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const row = f.nativeElement.querySelector("#dxRow-pulpitis") as HTMLElement;
    expect(row).toBeTruthy();
    expect(row.getAttribute("data-source")).toBe("derived");
    expect(row.hasAttribute("data-suppressed")).toBe(false);
    expect(row.querySelector(".dx-code")?.textContent).toBeTruthy();
  });

  it("shows #diagnosesSection (no hidden class) for a plain naturally-present tooth with no diagnoses yet", async () => {
    __setSelectionForTest([11]);
    expect(getActiveDiagnoses()).toEqual({ visible: true, rows: [], addableKeys: expect.any(Array) });

    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const section = f.nativeElement.querySelector("#diagnosesSection") as HTMLElement;
    expect(section.classList.contains("hidden")).toBe(false);
    expect(f.nativeElement.querySelectorAll("#diagnosesRows > .dx-row").length).toBe(0);
  });

  it("hides #diagnosesSection when the active tooth is not naturally present (e.g. an implant)", async () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    __setSelectionForTest([16]);
    expect(getActiveDiagnoses().visible).toBe(false);

    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const section = f.nativeElement.querySelector("#diagnosesSection") as HTMLElement;
    expect(section.classList.contains("hidden")).toBe(true);
  });

  it("the exclude (suppress) toggle writes through setDxOverrideForSelection and the delete button removes the finding", async () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", pulpDx: "irreversible-pulpitis" });
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const suppressBtn = f.nativeElement.querySelector("#dxSuppress-pulpitis") as HTMLButtonElement;
    expect(suppressBtn).toBeTruthy();
    expect(suppressBtn.getAttribute("aria-pressed")).toBe("false");

    suppressBtn.click();
    await f.whenStable();

    expect(getActiveDiagnoses().rows.find((r) => r.key === "pulpitis")?.suppressed).toBe(true);
    const rowAfterSuppress = f.nativeElement.querySelector("#dxRow-pulpitis") as HTMLElement;
    expect(rowAfterSuppress.getAttribute("data-suppressed")).toBe("true");

    const removeBtn = f.nativeElement.querySelector("#dxRemove-pulpitis") as HTMLButtonElement;
    removeBtn.click();
    await f.whenStable();

    expect(getStatusChart().teeth[11].pulpDx).toBe("normal");
    expect(f.nativeElement.querySelector("#dxRow-pulpitis")).toBeNull();
  });

  it("the add picker writes through addDiagnosisToSelection and resets to the placeholder", async () => {
    __setSelectionForTest([11]);
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const addSelect = f.nativeElement.querySelector("#dxAddSelect") as HTMLSelectElement;
    expect(addSelect.value).toBe("");
    expect(addSelect.disabled).toBe(false);

    addSelect.value = "attrition";
    fire(addSelect);
    await f.whenStable();

    expect(getStatusChart().teeth[11].wearEdge).toBe("attrition");
    // Force-value parity: the native <select>'s own DOM mutation (native
    // select behavior sets .value on the picked option) must be reset back
    // to the placeholder on the next render, exactly like React's
    // unconditional `value=""` reassertion — see the component's own header
    // comment for why a plain `[value]` binding would NOT do this.
    expect(addSelect.value).toBe("");
  });
});
