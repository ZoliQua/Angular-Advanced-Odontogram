// Drift guard for app-version.ts's LIB_VERSION literal. That file can't
// import package.json directly (ng-packagr's secondary-entry-point TS
// program only includes files under this package's src/ root — see its own
// header comment), so the version string is hand-maintained there instead of
// derived. This spec (which compiles under tsconfig.spec.json, a different,
// more permissive program than the lib build) reads package.json via
// node:fs and cross-checks it against the runtime global the shim sets, so a
// future package.json version bump that forgets to update app-version.ts
// fails loudly here instead of silently staling the PDF "generated with"
// footer stamp.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import "./app-version";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(resolve(here, "../../package.json"), "utf8"),
) as { version: string };

describe("app-version.ts drift guard", () => {
  it("__APP_VERSION__ matches the library's package.json version", () => {
    expect((globalThis as unknown as { __APP_VERSION__: string }).__APP_VERSION__).toBe(
      pkg.version,
    );
  });
});
