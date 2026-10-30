import { defineConfig } from "vitest/config";

// Extra options for `ng test` (the Angular unit-test builder merges this into
// its own Vitest setup). The perio-chart specs build full jsdom grids; on a
// shared CI runner under load the first one in a file can overrun Vitest's 5 s
// default (observed 5.5 s on node 24), so give every test a generous ceiling.
export default defineConfig({
  test: { testTimeout: 30000 },
});
