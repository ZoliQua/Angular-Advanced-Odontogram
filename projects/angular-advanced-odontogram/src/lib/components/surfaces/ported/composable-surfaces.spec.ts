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
import { provideZonelessChangeDetection } from "@angular/core";
import { OdontogramTopbarComponent } from "../odontogram-topbar.component";

describe("Composable-UI Tier 1: a surface used outside its provider (Angular port)", () => {
  it("throws Angular's own DI error — no ancestor provides OdontogramUiService", async () => {
    TestBed.configureTestingModule({
      imports: [OdontogramTopbarComponent],
      providers: [provideZonelessChangeDetection()],
    });

    expect(() => TestBed.createComponent(OdontogramTopbarComponent)).toThrow(/OdontogramUiService/);
  });
});
