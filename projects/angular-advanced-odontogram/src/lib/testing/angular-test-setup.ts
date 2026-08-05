// Initializes the Angular JIT test environment once per vitest worker.
// Components under test MUST use inline templates (templateUrl needs a
// build-time transform vitest doesn't have).
import "@angular/compiler";
import { getTestBed } from "@angular/core/testing";
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from "@angular/platform-browser/testing";

const testBed = getTestBed();
if (!(globalThis as Record<string, unknown>)["__aaoTestEnvInit"]) {
  testBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  (globalThis as Record<string, unknown>)["__aaoTestEnvInit"] = true;
}
