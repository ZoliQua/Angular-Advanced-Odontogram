// Angular spec for CaseDiagnosesModalComponent (v2.6.0 resync, Phase 11 Task
// 3). Same real-shell mount route as diagnoses-card.component.spec.ts —
// `getCaseConditions()`/`onStateChange` need a real injection context, and
// this exercises the actual entry point (`#openCaseDiagnosesBtn`, mounted in
// OdontogramShellComponent per the pinned App.tsx diff).
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell/odontogram-shell.component";
import {
  getCaseConditions,
  setChartMode,
  setNumberingSystem,
  __resetChartStateForTest,
} from "../../core/odontogram";

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

async function openModal(f: { nativeElement: HTMLElement; whenStable: () => Promise<boolean> }) {
  const openBtn = f.nativeElement.querySelector("#openCaseDiagnosesBtn") as HTMLButtonElement;
  openBtn.click();
  await f.whenStable();
}

describe("CaseDiagnosesModalComponent", () => {
  it("is closed by default; #openCaseDiagnosesBtn opens it (no engine reads while closed)", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#caseDiagnosesModal")).toBeNull();

    await openModal(f);

    const dialog = f.nativeElement.querySelector("#caseDiagnosesModal") as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute("role")).toBe("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });

  it("adding a case condition via the add picker writes through setCaseCondition, and it can be removed", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    await openModal(f);

    expect(getCaseConditions().length).toBe(0);

    const addSelect = f.nativeElement.querySelector("#caseDxAddSelect") as HTMLSelectElement;
    expect(addSelect.value).toBe("");
    addSelect.value = "tmjDisorder";
    fire(addSelect);
    await f.whenStable();

    expect(getCaseConditions().some((c) => c.key === "tmjDisorder")).toBe(true);
    // Force-value parity — same rationale as DiagnosesCardComponent's own
    // #dxAddSelect: the placeholder must be reasserted after a pick.
    expect(addSelect.value).toBe("");

    const row = f.nativeElement.querySelector(".case-diagnoses-row") as HTMLElement;
    expect(row).toBeTruthy();
    expect(row.querySelector(".dx-code")?.textContent).toBe("K07.6");

    const removeBtn = row.querySelector(".case-dx-remove") as HTMLButtonElement;
    removeBtn.click();
    await f.whenStable();

    expect(getCaseConditions().some((c) => c.key === "tmjDisorder")).toBe(false);
    expect(f.nativeElement.querySelector(".case-diagnoses-row")).toBeNull();
  });

  it("a lateralizable condition's laterality select writes through setCaseCondition", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    await openModal(f);

    const addSelect = f.nativeElement.querySelector("#caseDxAddSelect") as HTMLSelectElement;
    addSelect.value = "tmjDisorder"; // lateralizable
    fire(addSelect);
    await f.whenStable();

    const lateralitySelect = f.nativeElement.querySelector(".case-diagnoses-row select") as HTMLSelectElement;
    expect(lateralitySelect).toBeTruthy();
    expect(lateralitySelect.value).toBe("unspecified");

    lateralitySelect.value = "left";
    fire(lateralitySelect);
    await f.whenStable();

    expect(getCaseConditions().find((c) => c.key === "tmjDisorder")?.laterality).toBe("left");
  });
});
