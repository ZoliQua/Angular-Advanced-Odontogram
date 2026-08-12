// Angular port of core/__tests__/sp16-filling-props.test.tsx ("Issue #17:
// fillings settings as controlled props") — T5 Part C annotation for
// `sp16-filling-props.test.tsx`. The controlled-props mechanism (React
// props -> `OdontogramContext`) ports to `OdontogramShellComponent`'s
// `input()`/`output()` pairs (`fillingComplexity`/`fillingDefectEnabled`/
// `fillingMaterialAvailability`/`fissureSealingEnabled` +
// `*Change` outputs, wired through `OdontogramUiService`'s DEFINED-GATED
// effects — see that service's own comments at the "Fillings-tab controlled
// props" block). Covers the core round-trip (restore-on-mount, re-sync-on-
// change, standalone-never-touches-engine, on*Change fires from the Settings
// tab and NOT from a prop-driven restore). NOT ported: the "inline-literal
// material prop does not re-fire on identical content" and "an imperative
// setX call before mount is not clobbered by a missing prop" cases — both
// narrow effect-implementation-detail assertions already covered by the
// service's own well-commented DEFINED-GATED/serialized-key design (see
// `odontogram-ui.service.ts` around `fillingMaterialsKey`), not re-verified
// here as a deliberate residual gap (flagged in the T5 report).
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";
import type { SettingsState } from "../../settings-modal/settings-modal.component";
import {
  getFillingDefectEnabled,
  getFillingComplexity,
  __resetChartStateForTest,
} from "../../../core/odontogram";

const engineLifecycle = { init: async () => {}, destroy: () => {} };

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  __resetChartStateForTest();
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

function settings(f: ReturnType<typeof TestBed.createComponent>): SettingsState {
  return (f.componentInstance as unknown as { ui: { settingsState: () => SettingsState } }).ui.settingsState();
}

describe("Issue #17: fillings settings as controlled props (Angular port)", () => {
  it("restores fillingComplexity + fillingDefectEnabled from props on mount", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("fillingComplexity", "simple");
    f.componentRef.setInput("fillingDefectEnabled", false);
    await f.whenStable();

    expect(getFillingComplexity()).toBe("simple");
    expect(getFillingDefectEnabled()).toBe(false);
    expect(settings(f).fillingComplexity).toBe("simple");
    expect(settings(f).fillingDefectEnabled).toBe(false);
  });

  it("re-syncs engine + modal when a prop changes", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("fillingComplexity", "simple");
    await f.whenStable();
    expect(getFillingComplexity()).toBe("simple");

    f.componentRef.setInput("fillingComplexity", "complex");
    await f.whenStable();
    expect(getFillingComplexity()).toBe("complex");
    expect(settings(f).fillingComplexity).toBe("complex");
  });

  it("standalone mode: an omitted prop never touches the engine; the engine value seeds the modal", async () => {
    // No fillingDefectEnabled input bound at all (module default: true —
    // see reset-engine-state.ts).
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    expect(getFillingDefectEnabled()).toBe(true);
    expect(settings(f).fillingDefectEnabled).toBe(true);
  });

  it("fires onFillingDefectEnabledChange from the Settings -> Fillings tab (user-driven)", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();

    const fired: boolean[] = [];
    (f.componentInstance as unknown as { fillingDefectEnabledChange: { subscribe: (fn: (v: boolean) => void) => void } })
      .fillingDefectEnabledChange.subscribe((v) => fired.push(v));

    settings(f).onFillingDefectEnabled(false);
    await f.whenStable();

    expect(fired).toEqual([false]);
    expect(getFillingDefectEnabled()).toBe(false);
  });

  it("does NOT fire onFillingComplexityChange for a prop-driven restore", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    const fired: string[] = [];
    (f.componentInstance as unknown as { fillingComplexityChange: { subscribe: (fn: (v: string) => void) => void } })
      .fillingComplexityChange.subscribe((v) => fired.push(v));

    f.componentRef.setInput("fillingComplexity", "simple");
    await f.whenStable();

    expect(fired).toEqual([]);
    expect(getFillingComplexity()).toBe("simple");
  });
});
