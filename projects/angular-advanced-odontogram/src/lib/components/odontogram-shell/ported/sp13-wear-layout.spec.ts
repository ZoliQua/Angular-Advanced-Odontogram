// Angular port of core/__tests__/sp13-wear-layout.test.ts. Mount route: same
// DI-faked-engine-lifecycle-only TestBed mount as r2a-toggle-ui.spec.ts.
//
// The last test's reparent step (bruxismRow.appendChild(extractionPlanRow))
// is odontogram.ts's own runtime move (syncControlsFromState(), gated behind
// the real, unmocked engine lifecycle the source test never actually
// exercises either — see that file's header comment: it replicates the
// exact call odontogram.ts makes, it doesn't invoke the real engine). Ported
// verbatim: #bruxismRow and #extractionPlanRow both already exist in the
// Shell's static template (crownActionsRow), so the manual reparent proves
// the same DOM-order contract against the real Angular-rendered markup.
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

describe("SP13 Task 1: wear controls on separate rows, extraction below (overflow fix)", () => {
  it("#wearEdgeSelect is inside #wearEdgeRow, #wearCervicalSelect is inside #wearCervicalRow (separate rows)", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#wearEdgeRow #wearEdgeSelect")).toBeTruthy();
    expect(f.nativeElement.querySelector("#wearCervicalRow #wearCervicalSelect")).toBeTruthy();
    const edgeRow = f.nativeElement.querySelector("#wearEdgeRow");
    const cervicalRow = f.nativeElement.querySelector("#wearCervicalRow");
    expect(edgeRow).not.toBe(cervicalRow);
    expect(edgeRow?.querySelector("#wearCervicalSelect")).toBeNull();
    expect(cervicalRow?.querySelector("#wearEdgeSelect")).toBeNull();
  });

  it("#wearEdgeRow and #wearCervicalRow are both descendants of #bruxismRow", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const bruxismRow = f.nativeElement.querySelector("#bruxismRow");
    expect(bruxismRow?.querySelector("#wearEdgeRow")).toBeTruthy();
    expect(bruxismRow?.querySelector("#wearCervicalRow")).toBeTruthy();
  });

  it("#bruxismRow has class \"wear-stack\" and NOT class \"row\"", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const bruxismRow = f.nativeElement.querySelector("#bruxismRow");
    expect(bruxismRow?.classList.contains("wear-stack")).toBe(true);
    expect(bruxismRow?.classList.contains("row")).toBe(false);
  });

  it("after a render with the wear row visible, #extractionPlanRow's parent is #bruxismRow and it comes AFTER #wearCervicalRow in DOM order", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const bruxismRow = f.nativeElement.querySelector("#bruxismRow") as HTMLElement;
    const wearCervicalRow = f.nativeElement.querySelector("#wearCervicalRow") as HTMLElement;
    const extractionPlanRow = f.nativeElement.querySelector("#extractionPlanRow") as HTMLElement;
    expect(bruxismRow).toBeTruthy();
    expect(wearCervicalRow).toBeTruthy();
    expect(extractionPlanRow).toBeTruthy();

    expect(bruxismRow.classList.contains("hidden")).toBe(false);
    bruxismRow.appendChild(extractionPlanRow);

    expect(extractionPlanRow.parentElement).toBe(bruxismRow);
    const position = wearCervicalRow.compareDocumentPosition(extractionPlanRow);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("#wearEdgeToggle / #wearCervicalToggle / #discolorationToggle exist and are type=checkbox", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    const edgeToggle = f.nativeElement.querySelector("#wearEdgeToggle") as HTMLInputElement | null;
    const cervicalToggle = f.nativeElement.querySelector("#wearCervicalToggle") as HTMLInputElement | null;
    const discolorationToggle = f.nativeElement.querySelector("#discolorationToggle") as HTMLInputElement | null;
    expect(edgeToggle).toBeTruthy();
    expect(cervicalToggle).toBeTruthy();
    expect(discolorationToggle).toBeTruthy();
    expect(edgeToggle?.type).toBe("checkbox");
    expect(cervicalToggle?.type).toBe("checkbox");
    expect(discolorationToggle?.type).toBe("checkbox");
  });

  it("the toggle-labels start hidden (default complex mode unchanged)", async () => {
    const f = TestBed.createComponent(OdontogramShellComponent);
    await f.whenStable();
    expect(f.nativeElement.querySelector("#wearEdgeToggleLabel")?.classList.contains("hidden")).toBe(true);
    expect(f.nativeElement.querySelector("#wearCervicalToggleLabel")?.classList.contains("hidden")).toBe(true);
    expect(f.nativeElement.querySelector("#discolorationToggleLabel")?.classList.contains("hidden")).toBe(true);
  });
});
