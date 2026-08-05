// Proves Angular components compile and render under vitest/jsdom (JIT).
import { describe, it, expect } from "vitest";
import { Component, ChangeDetectionStrategy, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";

@Component({
  selector: "aao-smoke",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button id="smokeBtn" (click)="n.set(n() + 1)">{{ n() }}</button>`,
})
class SmokeComponent { n = signal(0); }

describe("Angular TestBed under vitest", () => {
  it("renders and reacts to a click", async () => {
    TestBed.configureTestingModule({
      imports: [SmokeComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(SmokeComponent);
    await fixture.whenStable();
    const btn = fixture.nativeElement.querySelector("#smokeBtn") as HTMLButtonElement;
    expect(btn.textContent).toContain("0");
    btn.click();
    await fixture.whenStable();
    expect(btn.textContent).toContain("1");
  });
});
