// Angular port of core/__tests__/App.test.tsx.
//
// Mount route: TestBed.createComponent(OdontogramShellComponent) with only
// ODONTOGRAM_ENGINE_LIFECYCLE DI-faked (init/destroy no-ops) — the source's
// `vi.mock('../odontogram', () => ({ ... }))` stubbed the SAME heavy
// imperative DOM/SVG lifecycle wholesale (every export mocked, since the
// source test only checks static JSX structure, never drives real engine
// behavior) — see odontogram-shell.component.spec.ts's header comment for
// why `vi.mock` itself is unavailable under `npm run test:ng`.
//
// SCOPE: this ports every describe block EXCEPT 'controlled numbering mode'
// and 'settings modal' — both now require SettingsModal markup (per the
// source file's own comments: "Numbering now lives inside the Settings
// modal"), which is Phase 3 scope. Every other block here needs neither
// SettingsModal nor PerioChart/PerioSidebar markup, matching the task-6
// brief's Phase-2-portable rule.
import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ODONTOGRAM_ENGINE_LIFECYCLE, OdontogramShellComponent } from "../odontogram-shell.component";

const engineLifecycle = { init: async () => {}, destroy: () => {} };

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  TestBed.configureTestingModule({
    imports: [OdontogramShellComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ODONTOGRAM_ENGINE_LIFECYCLE, useValue: engineLifecycle },
    ],
  });
});

describe("App.tsx: standalone mode (no props)", () => {
  it("renders without crashing", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const text = (f.nativeElement.textContent as string) ?? "";
    expect(text.toLowerCase()).toContain("odontogram");
  });

  it("renders the topbar with export/import buttons", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#btnStatusExport")).not.toBeNull();
    expect(f.nativeElement.querySelector("#statusImportInput")).not.toBeNull();
  });

  it("renders the tooth grid container", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#toothGrid")).not.toBeNull();
  });

  it("renders the panel with control sections", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#statusCard")).not.toBeNull();
  });

  it("renders the crown-leakage toggle row, hidden by default", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const row = f.nativeElement.querySelector("#crownLeakageRow");
    const checkbox = f.nativeElement.querySelector("#crownLeakage");
    expect(row).not.toBeNull();
    expect(checkbox).not.toBeNull();
    expect(checkbox.getAttribute("type")).toBe("checkbox");
    expect(row.classList.contains("hidden")).toBe(true);
  });

  it("renders the root-caries picker row inside the caries card", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const row = f.nativeElement.querySelector("#rootCariesRow");
    const select = f.nativeElement.querySelector("#rootCariesSelect");
    expect(row).not.toBeNull();
    expect(select).not.toBeNull();
    expect(select.tagName).toBe("SELECT");
  });

  it("renders chart action buttons", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#btnOcclView")).not.toBeNull();
    expect(f.nativeElement.querySelector("#btnWisdomVisible")).not.toBeNull();
    expect(f.nativeElement.querySelector("#btnBoneVisible")).not.toBeNull();
    expect(f.nativeElement.querySelector("#btnPulpVisible")).not.toBeNull();
    expect(f.nativeElement.querySelector("#btnSelectNoneChart")).not.toBeNull();
  });
});

describe("App.tsx: controlled language mode", () => {
  it("uses the provided language", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("language", "en");
    await f.whenStable();
    const text = (f.nativeElement.textContent as string) ?? "";
    expect(text.toLowerCase()).toContain("in english");
  });

  it("calls onLanguageChange when language is selected", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("language", "en");
    const emitted: string[] = [];
    f.componentInstance.languageChange.subscribe((l) => emitted.push(l));
    await f.whenStable();

    const langButton = f.nativeElement.querySelector('[aria-label="Language"]') as HTMLButtonElement;
    expect(langButton).not.toBeNull();
    langButton.click();
    await f.whenStable();

    const huOption = Array.from(f.nativeElement.querySelectorAll('[role="menuitemradio"]')).find((el) =>
      (el as HTMLElement).textContent?.includes("Hungarian"),
    ) as HTMLButtonElement;
    expect(huOption).not.toBeUndefined();
    huOption.click();
    await f.whenStable();

    expect(emitted).toEqual(["hu"]);
  });
});

describe("App.tsx: dark mode", () => {
  it("toggles dark mode when theme button is clicked (standalone)", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const themeBtn = f.nativeElement.querySelector('[aria-label="Dark mode"]') as HTMLButtonElement;
    expect(themeBtn).not.toBeNull();

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    themeBtn.click();
    await f.whenStable();
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    // The toggle re-queries by the CURRENT aria-label (it flips to "Light mode").
    const themeBtn2 = f.nativeElement.querySelector('[aria-label="Light mode"]') as HTMLButtonElement;
    themeBtn2.click();
    await f.whenStable();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("calls onDarkModeChange in controlled mode", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("darkMode", false);
    const emitted: boolean[] = [];
    f.componentInstance.darkModeChange.subscribe((v) => emitted.push(v));
    await f.whenStable();

    const themeBtn = f.nativeElement.querySelector('[aria-label="Dark mode"]') as HTMLButtonElement;
    themeBtn.click();
    await f.whenStable();

    expect(emitted).toEqual([true]);
  });

  it("respects darkMode prop", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    f.componentRef.setInput("darkMode", true);
    await f.whenStable();
    // In controlled dark mode, the button shows the sun icon (switch to light).
    const sunIcon = f.nativeElement.querySelector(".btn-theme svg circle");
    expect(sunIcon).not.toBeNull();
  });
});

describe("App.tsx: selection actions", () => {
  it("renders all selection action buttons", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#btnSelectAll")).not.toBeNull();
    expect(f.nativeElement.querySelector("#btnSelectNone")).not.toBeNull();
    expect(f.nativeElement.querySelector("#btnSelectUpper")).not.toBeNull();
    expect(f.nativeElement.querySelector("#btnSelectLower")).not.toBeNull();
  });

  it("renders status action buttons", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#btnResetAll")).not.toBeNull();
    expect(f.nativeElement.querySelector("#btnPrimaryDentition")).not.toBeNull();
    expect(f.nativeElement.querySelector("#btnMixedDentition")).not.toBeNull();
    expect(f.nativeElement.querySelector("#btnEdentulous")).not.toBeNull();
  });
});

describe("App.tsx: tooth control sections", () => {
  it("renders tooth select dropdown", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#toothSelect")).not.toBeNull();
  });

  it("renders restoration + substrate select dropdowns", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#restorationSelect")).not.toBeNull();
    expect(f.nativeElement.querySelector("#substrateSelect")).not.toBeNull();
  });

  it("renders the merged pulp/endo select dropdown, not the old separate ones", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#pulpEndoSelect")).not.toBeNull();
    expect(f.nativeElement.querySelector("#endoSelect")).toBeNull();
    expect(f.nativeElement.querySelector("#pulpSelect")).toBeNull();
  });

  it("renders filling select dropdown", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#fillingSelect")).not.toBeNull();
  });

  it("renders mobility select dropdown", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#mobilitySelect")).not.toBeNull();
  });
});
