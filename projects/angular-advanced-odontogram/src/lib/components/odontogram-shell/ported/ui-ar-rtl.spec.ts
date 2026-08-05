// Angular port of core/__tests__/ui-ar-rtl.test.tsx. Mount route: same
// DI-faked-engine-lifecycle-only TestBed mount as r2a-toggle-ui.spec.ts.
//
// NOTE: the ar/en dir+lang pair on `.odontogram-root` is already pinned by
// odontogram-shell.component.spec.ts's "root div reflects RTL only for
// Arabic and the current language" test (Task 4). Ported here in full anyway
// for source-test parity, plus the two assertions that spec doesn't cover:
// `zh` (a non-RTL language) staying `dir="ltr"`, and `#toothGrid` staying
// pinned `dir="ltr"` under an RTL (`ar`) shell.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";

const engineLifecycle = { init: async () => {}, destroy: () => {} };

beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

describe("Arabic RTL layout", () => {
  it("sets dir=rtl on the shell root for Arabic but keeps the tooth grid LTR", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("language", "ar");
    await f.whenStable();
    const root = f.nativeElement.querySelector(".odontogram-root") as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.getAttribute("dir")).toBe("rtl");
    expect(root.getAttribute("lang")).toBe("ar");
    const grid = f.nativeElement.querySelector("#toothGrid") as HTMLElement;
    expect(grid).toBeTruthy();
    expect(grid.getAttribute("dir")).toBe("ltr");
  });

  it("uses dir=ltr on the shell root for a non-RTL language (en)", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("language", "en");
    await f.whenStable();
    const root = f.nativeElement.querySelector(".odontogram-root") as HTMLElement;
    expect(root.getAttribute("dir")).toBe("ltr");
    expect(root.getAttribute("lang")).toBe("en");
  });

  it("uses dir=ltr on the shell root for Chinese (zh is LTR, not RTL)", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("language", "zh");
    await f.whenStable();
    const root = f.nativeElement.querySelector(".odontogram-root") as HTMLElement;
    expect(root.getAttribute("dir")).toBe("ltr");
    expect(root.getAttribute("lang")).toBe("zh");
  });
});
