// Angular port of core/__tests__/statuses-card.test.tsx (PR 3b: <StatusesCard/>
// renders declaratively) — T5 Part C annotation for `statuses-card.test.tsx`.
// Same mount route as `caries-card.spec.ts` (see that file's header).
// `#btnEdentulous`'s dual-state-confirm-gated whole-mouth edit is covered
// separately (never-stale-DOM proof) by `ds1b-force-value-statuses.spec.ts`;
// this file covers plain (ungated) render + write-through.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../../../odontogram-shell/odontogram-shell.component";
import {
  setNumberingSystem,
  getStatusChart,
  getEdentulous,
  getStatusExtras,
  __resetChartStateForTest,
  __setToothStateForTest,
} from "../../../../core/odontogram";

const engineLifecycle = { init: async () => {}, destroy: () => {} };

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

describe("PR 3b: <StatusesCard/> renders declaratively (Angular port)", () => {
  it("renders the status action buttons + the statusExtra row with the real option set", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    expect(f.nativeElement.querySelector("#btnResetAll")).toBeTruthy();
    expect(f.nativeElement.querySelector("#btnPrimaryDentition")).toBeTruthy();
    expect(f.nativeElement.querySelector("#btnMixedDentition")).toBeTruthy();
    expect(f.nativeElement.querySelector("#btnEdentulous")).toBeTruthy();
    const select = f.nativeElement.querySelector("#statusExtraSelect") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(f.nativeElement.querySelector("#statusExtraApply")).toBeTruthy();
    const values = Array.from(select.options as unknown as HTMLOptionElement[]).map((o) => o.value);
    expect(values).toEqual(getStatusExtras().map((o) => o.id));
    expect(values.length).toBeGreaterThan(0);
  });

  it("#btnEdentulous aria-pressed reflects getEdentulous() and toggles on click", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const btn = f.nativeElement.querySelector("#btnEdentulous") as HTMLButtonElement;
    expect(getEdentulous()).toBe(false);
    expect(btn.getAttribute("aria-pressed")).toBe("false");

    btn.click();
    await f.whenStable();
    expect(getEdentulous()).toBe(true);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(getStatusChart().teeth[11].toothSelection).toBe("none");

    btn.click();
    await f.whenStable();
    expect(getEdentulous()).toBe(false);
    expect(btn.getAttribute("aria-pressed")).toBe("false");
  });

  it("#btnResetAll resets the mouth (clears edentulous + tooth edits)", async () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const edn = f.nativeElement.querySelector("#btnEdentulous") as HTMLButtonElement;
    edn.click();
    await f.whenStable();
    expect(getEdentulous()).toBe(true);

    (f.nativeElement.querySelector("#btnResetAll") as HTMLButtonElement).click();
    await f.whenStable();
    expect(getEdentulous()).toBe(false);
    expect(edn.getAttribute("aria-pressed")).toBe("false");
    expect(getStatusChart().teeth[11].toothSelection).toBe("tooth-base");
  });

  it("#btnPrimaryDentition and #btnMixedDentition apply their presets", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    (f.nativeElement.querySelector("#btnPrimaryDentition") as HTMLButtonElement).click();
    await f.whenStable();
    expect(getStatusChart().teeth[11].toothSelection).toBe("milktooth");
    expect(getStatusChart().teeth[18].toothSelection).toBe("none");

    (f.nativeElement.querySelector("#btnMixedDentition") as HTMLButtonElement).click();
    await f.whenStable();
    expect(getStatusChart().teeth[13].toothSelection).toBe("milktooth");
  });

  it("selecting a statusExtra preset and clicking apply writes it to the status chart", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const select = f.nativeElement.querySelector("#statusExtraSelect") as HTMLSelectElement;
    select.value = "upper-12-22-zircon";
    select.dispatchEvent(new Event("change"));
    await f.whenStable();
    (f.nativeElement.querySelector("#statusExtraApply") as HTMLButtonElement).click();
    await f.whenStable();

    expect(getStatusChart().teeth[12].restorationMaterial).toBe("zircon");
    expect(getStatusChart().teeth[12].restorationType).toBe("crown");
  });
});
