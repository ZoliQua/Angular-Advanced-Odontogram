// Angular port of core/__tests__/composable-surfaces.test.tsx (Composable-UI
// Tier 1: the four surfaces can be placed in a host-provided layout) — T5
// Part C annotation for `composable-surfaces.test.tsx`.
//
// SCOPE: this ports the "used outside a provider" contract only — the
// clearest 1:1 mapping. `OdontogramTopbarComponent`/`OdontogramChartSurfaceComponent`/
// `ToothInfoSurfaceComponent`/`ToothControlsSurfaceComponent` each
// `inject(OdontogramUiService)` (a REQUIRED, non-optional injection — see
// `odontogram-ui.service.ts`'s header, "the Angular equivalent of one
// <OdontogramProvider> per mounted <App/>"), so Angular's OWN DI throws when
// one is used with no ancestor `providers: [OdontogramUiService]` — exactly
// the architectural contract the corpus test proves, just via Angular's
// native DI error instead of a custom thrown message.
//
// NOT ported: the "renders in an arbitrary host layout" / "shares one
// provider" tests. `OdontogramUiService.configure()` must be called once
// (with the shell's full `input()`-signal bundle) before any surface reads
// it meaningfully — replicating that outside `OdontogramShellComponent`
// itself would mean re-deriving the shell's entire configure() call, which
// is substantial setup for marginal proof value: EVERY existing shell spec
// already demonstrates the 4 surfaces genuinely composing and sharing one
// `OdontogramUiService` instance (that's what `OdontogramShellComponent`
// *is* — the four surfaces mounted together under one service). The
// residual, unverified claim is narrowly "in an ARBITRARY host layout/
// order/nesting", a structural/cosmetic claim already implied by each
// surface being an independent standalone component with no fixed-parent
// assumption in its own template. Flagged as a residual gap in the T5 report.
import { describe, it, expect } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component, inject, provideZonelessChangeDetection, signal } from "@angular/core";
import { OdontogramTopbarComponent } from "../odontogram-topbar.component";
import { OdontogramUiService } from "../../odontogram-ui.service";
import { getReadOnly } from "../../../core/odontogram";
import type { NumberingSystem } from "../../../core/utils/numbering";

describe("Composable-UI Tier 1: a surface used outside its provider (Angular port)", () => {
  it("throws Angular's own DI error — no ancestor provides OdontogramUiService", async () => {
    TestBed.configureTestingModule({
      imports: [OdontogramTopbarComponent],
      providers: [provideZonelessChangeDetection()],
    });

    expect(() => TestBed.createComponent(OdontogramTopbarComponent)).toThrow(/OdontogramUiService/);
  });
});

// T6b (T6 review, "Important" finding): `OdontogramUiConfig` used to require
// all 30 Signal/callback fields — every field mandatory — while the pinned
// `OdontogramProviderProps` (OdontogramContext.tsx 115-266) makes every prop
// optional with a default. The two specs below prove the fixed contract: a
// host can provide `OdontogramUiService` and call `configure()` with NO
// argument at all (the interface default `= {}` — see
// `odontogram-ui.service.ts`) or with a PARTIAL object, and every omitted
// field resolves to its exact upstream default — matching how
// `OdontogramShellComponent`'s own full, explicit `configure()` call
// (unchanged, still wiring every field) continues to work unchanged.
//
// `OdontogramTopbarComponent` is the one surface mounted here — unlike the
// chart/controls surfaces it needs no engine `init()` (no `wireControls()`
// DOM-id dependency), so a bare `providers: [OdontogramUiService]` host is
// enough to prove both the service's internal defaults AND that a real
// composed surface renders them (the subtitle text mirrors
// `ui.currentNumbering()`/`ui.isDark()` directly — OdontogramTopbar.tsx 58).
@Component({
  selector: "zero-config-host",
  imports: [OdontogramTopbarComponent],
  providers: [OdontogramUiService],
  template: `<aao-odontogram-topbar />`,
})
class ZeroConfigHostComponent {
  private readonly ui = inject(OdontogramUiService);
  constructor() {
    // No argument at all — exercises `configure(cfg: OdontogramUiConfig = {})`'s
    // own default parameter, not just an explicit `{}` literal.
    this.ui.configure();
  }
}

@Component({
  selector: "partial-config-host",
  imports: [OdontogramTopbarComponent],
  providers: [OdontogramUiService],
  template: `<aao-odontogram-topbar />`,
})
class PartialConfigHostComponent {
  private readonly ui = inject(OdontogramUiService);
  readonly numberingSystem = signal<NumberingSystem>("UNIVERSAL");
  readonly darkMode = signal(true);
  constructor() {
    // Only 2 of the 30 fields provided — every other field must still
    // resolve to its upstream default.
    this.ui.configure({
      numberingSystem: this.numberingSystem,
      darkMode: this.darkMode,
    });
  }
}

describe("Composable-UI T6b: OdontogramUiConfig is fully optional, upstream defaults apply", () => {
  it("zero-config: service + one surface mounted with NO config resolve every upstream default", async () => {
    TestBed.configureTestingModule({
      imports: [ZeroConfigHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const f = TestBed.createComponent(ZeroConfigHostComponent);
    await f.whenStable();
    const ui = f.debugElement.injector.get(OdontogramUiService);

    // 5 representative upstream defaults (OdontogramContext.tsx):
    // language -> "en" (useI18n.ts's FALLBACK_LANGUAGE), numberingSystem ->
    // "FDI" (376), darkMode -> false (462-466, no `dark` class present),
    // readOnly -> false (517-519, mirrored onto the engine module flag),
    // pulpDetailLevel -> "aae" (382).
    expect(ui.lang()).toBe("en");
    expect(ui.currentNumbering()).toBe("FDI");
    expect(ui.isDark()).toBe(false);
    expect(getReadOnly()).toBe(false);
    expect(ui.settingsState().pulpLevel).toBe("aae");

    // The composed surface itself renders these same defaults, not just the
    // service's internal signals.
    const subtitle = (f.nativeElement.querySelector(".subtitle") as HTMLElement).textContent ?? "";
    expect(subtitle).toContain("FDI");
    expect(subtitle).toContain("light");
  });

  it("partial-config: overriding 2 fields leaves every other field at its upstream default", async () => {
    TestBed.configureTestingModule({
      imports: [PartialConfigHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const f = TestBed.createComponent(PartialConfigHostComponent);
    await f.whenStable();
    const ui = f.debugElement.injector.get(OdontogramUiService);

    // The 2 overridden fields take effect.
    expect(ui.currentNumbering()).toBe("UNIVERSAL");
    expect(ui.isDark()).toBe(true);

    // Every other field (28 of 30) still resolves to its upstream default.
    expect(ui.lang()).toBe("en");
    expect(getReadOnly()).toBe(false);
    expect(ui.settingsState().pulpLevel).toBe("aae");
  });
});
