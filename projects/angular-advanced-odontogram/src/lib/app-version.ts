// Angular port shim (non-core, config-level): the upstream React engine
// injects `__APP_VERSION__` as a Vite build-time global via `define` in
// vite.lib.config.ts/vitest.config.ts (see $ENGINE's src/vite-env.d.ts for
// the ambient declaration — a shell/tooling file this port deliberately does
// not copy, see the port design doc's core-vs-shell split). ng-packagr has no
// equivalent global-define build step, so this module defines the same
// global explicitly for both environments this package runs in:
//   - `globalThis.__APP_VERSION__` for real (browser/library-consumer) code,
//     read by core/odontogram.ts's PDF-footer "generated with" stamp.
//   - TypeScript sees the `declare global` block below regardless of whether
//     this file is imported anywhere (ambient declarations apply
//     project-wide once included in the program), satisfying the
//     `__APP_VERSION__` reference at compile time under the lib tsconfig.
// Imported once, for its side effect, from public-api.ts so any consumer of
// the package has the global set before core code can read it.
//
// A literal (not read from package.json): ng-packagr's secondary-entry-point
// TS program only includes files under this package's `src/`, and importing
// JSON from outside that root is unsupported by the library build. Bump this
// string alongside projects/angular-advanced-odontogram/package.json's
// "version" field.
const LIB_VERSION = "1.0.0";

declare global {
  // eslint-disable-next-line no-var
  var __APP_VERSION__: string;
}

(globalThis as unknown as { __APP_VERSION__: string }).__APP_VERSION__ ??= LIB_VERSION;

export {};
