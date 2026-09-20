// Drift guard for app-version.ts's LIB_VERSION literal. That file can't
// import package.json directly (ng-packagr's secondary-entry-point TS
// program only includes files under this package's src/ root — see its own
// header comment), so the version string is hand-maintained there instead of
// derived. This spec reads package.json via node:fs and cross-checks it
// against the runtime global the shim sets, so a future package.json
// version bump that forgets to update app-version.ts fails loudly here
// instead of silently staling the PDF "generated with" footer stamp (and,
// since Task 7, the FHIR CodeSystem/ValueSet resources' embedded version).
//
// Runs under BOTH runners (Task 7 requirement, closing a Task-5 review
// finding that proved the literal can silently diverge):
//   - `ng test` (`@angular/build:unit-test`), which picks this file up via
//     its own broad `**/*.spec.ts` include — this is where it originally
//     ran (Task 5).
//   - `npm run test:corpus` (plain Vitest via vitest.config.ts), which by
//     default only includes core/__tests__; this file is added there via an
//     explicit extra `include` entry rather than moved into that tree,
//     because it guards a non-core, Angular-shim-level concern, not part of
//     the frozen upstream corpus.
// Each runner compiles it under its own tsconfig (tsconfig.spec.json for
// `ng test`; Vitest's own esbuild-based transform for test:corpus) — both
// permissive enough for this file's plain node:fs/import.meta.url usage.
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
