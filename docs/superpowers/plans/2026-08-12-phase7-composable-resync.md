# Angular Odontogram Port — Phase 7: 1.2.0 Upstream Resync (Composable UI + Anatomy) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resync the Angular port to `react-advanced-odontogram` main @ engine commit `934a911` (post-2.4.0: fillings controlled props #17/#19, Composable UI #20/#21, anatomy profiles Stages A-C, extended guided tour, Credits/About + GitHub toolbar, README restructure + community health files) — released as 1.2.0. Also (owner directives 2026-08-19): swap the brand logo to `docs/angular-module-logo.png`, review both language READMEs for names/descriptions/behavior accuracy, prepare the npm release.

**Architecture:** Core stays verbatim under the SAME FIVE sanctioned deviations. The upstream shell was decomposed: `OdontogramProvider` (813-line context owning ALL former App.tsx state/effects) + 4 presentational surfaces + 7 declarative cards + `useEngineState`, all PUBLIC exports; the imperative per-card `wireControls()` blocks were REMOVED from core and `rewireControls`/`rebuildGrid` mount-on-demand APIs added. The Angular shell mirrors this: an `OdontogramUiService` (component-provided injectable = the provider port), an `engineState()` signal helper (= useEngineState), and standalone surface/card components with byte-identical DOM ids/classes/markup, all exported from public-api for feature parity with upstream's exported control cards.

**Tech Stack:** unchanged (no new runtime deps observed upstream; Task 1 verifies against pinned package.json).

**Source pin:** `/Users/Zoli/Sites/DentalQuoteCreator/src/modules/odontogram/engine` = `$ENGINE`, pinned at commit **`934a911`**. The live tree currently IS at 934a911, but read upstream content ONLY via `git -C $ENGINE show 934a911:<path>` (Phase-6 lesson: one contamination event from live-tree reads). If a future drift happens mid-phase it then cannot affect us.

## Global Constraints

- Core byte-identical to `$ENGINE@934a911` except the FIVE sanctioned deviations (spec §2): (1) `?raw` SVG imports → `generated/teeth-svgs`; (2) `src/assets`→`assets` anchors in copied test infra; (3) `i18n/useI18n.ts` React hook stripped (bus + `t` kept); (4) `app.title` → "Angular Advanced Odontogram" in all 12 languages (RE-APPLY after re-copy — translations.ts changed upstream, 888-line delta); (5) PDF footer branding (app name + repoUrl → Angular repo) — RE-APPLY, odontogram.ts changed heavily (2888-line delta), locate the footer block anew in the pinned blob.
- React `.tsx` sources (`OdontogramContext.tsx`, `surfaces/**`, `CreditsModal.tsx`, `App.tsx`) are TRANSCRIPTION SOURCES for Angular components — never copied into the lib. Framework-free core files (odontogram.ts, tour.ts, perioGraphic.ts, i18n/*, registry/*, index.css, perioIndexNames.ts, persistence.ts, fhir/*, fonts/*) are verbatim copies.
- DOM parity discipline: every Angular surface/card renders the SAME ids/classes/markup as the upstream React component (upstream proves its own decomposition byte-identical via `parity/shell-dom.test.tsx`; our ported specs assert the same ids).
- `tools/toothgen/` (Python generator, 17 files) is dev tooling NOT in the npm package — do NOT copy. The generated `src/assets/teeth-svgs/measured/*.svg` (13 files) ARE copied and folded into `npm run gen:assets` (extend `scripts/generate-svg-assets.mjs` for the `measured/` subdir exactly as upstream's Vite `?raw` globbing consumes them).
- BRAND LOGO (owner directive): the header logo data-URI source becomes `docs/angular-module-logo.png` (repo root docs/). `gen:assets` reads it from there; the README(s) reference it at its GitHub raw URL. Do not modify the PNG.
- Versioning: our release = **1.2.0**; upstream package version string is still `2.4.0` (their 2.5.0 bump was reverted) — parity statements cite "engine commit 934a911 (post-v2.4.0 main)". Task 1 records the payload/export version from the pinned blob; goldens re-adopted if regenerated upstream.
- Commit policy (repo-root `CLAUDE.md`, untracked): sole author `Zoltán Dul <zoltan.dul@gmail.com>`, no Co-Authored-By/AI attribution ever, backdated day **2026-08-12** (max 10/day, +02:00, both date vars, single-line message, EMPTY body). Slots: #1 09:30 plan, #2 10:15 T1, #3 11:30 T2, #4 13:15 T3, #5 14:30 T4, #6 15:45 T5, #7 17:00 T6, #8 17:45 T7; #9-#10 fix reserve; overflow → 2026-08-13.
- Never commit: CLAUDE.md, `.superpowers/`, `.claude/`, node_modules/, dist/, docs/api/, `projects/angular-advanced-odontogram/styles.css`. npm publish is the owner's manual step.
- Test gates at every task boundary: `npm run test:corpus` green; `test:ng` red only per the Task-1 inventory, burned down by T5.

---

### Task 1: Core + corpus resync to 934a911

**Files:**
- Modify/Create: everything under `lib/core/` (re-copy: odontogram.ts, tour.ts, perioGraphic.ts, i18n/translations.ts + useI18n.ts, registry/restorations.ts, index.css, plus ANY other core file the pin diff names; new `assets/teeth-svgs/measured/*.svg`; FULL `src/__tests__` corpus re-copy incl. the ~40 changed/new test files and any regenerated `parity/*.json`)
- Modify: `scripts/generate-svg-assets.mjs` (measured/ subdir + logo source → `docs/angular-module-logo.png`), regenerate `lib/core/generated/*`, `vitest.config.ts` (exclusion audit: new React-dependent files — `surfaces/**` tests, shell-dom parity harness, OdontogramContext tests → `REACT_DEPENDENT` with `phase-7` annotations; framework-free new tests RUN)
- Verify: pinned `package.json` dep diff (expect none; record)

**Interfaces:**
- Produces: the post-2.4.0 core surface Tasks 2-4 consume — notably `rewireControls`, `rebuildGrid`, `getToothAnatomy/setToothAnatomy` (+ `ToothAnatomy` type), `getEdentulous`, `getStatusExtras/applyStatusExtra`, and every getter the upstream cards read (extract the exact list from the pinned `surfaces/**` + `OdontogramContext.tsx` import statements; record it in the report for T2-T4).

- [ ] **Step 1:** Re-copy core set + corpus from pinned blobs; re-apply ALL FIVE deviations (re-locate #4 in the changed translations.ts and #5 in the changed odontogram.ts).
- [ ] **Step 2:** Extend gen:assets (measured subdir + logo swap to `docs/angular-module-logo.png`); regenerate; verify the header logo export now carries the new PNG bytes.
- [ ] **Step 3:** Diff-discipline check: every copied file diffs empty vs its pinned blob except the sanctioned hunks; record output. Record payload version + goldens status.
- [ ] **Step 4:** Exclusion audit for all new corpus files (imports decide; annotate).
- [ ] **Step 5:** Gates: corpus GREEN (record counts); lib build green; `test:ng` run ONCE, failures INVENTORIED per file with root cause — this is T2-T5's burn-down contract.
- [ ] **Step 6:** Commit — `feat: resync core and corpus to react-advanced-odontogram main (934a911)`

---

### Task 2: Composable-UI foundation — OdontogramUiService + engineState + surface shells

**Files:**
- Create: `lib/components/odontogram-ui.service.ts` (transcription of `$ENGINE@934a911:src/OdontogramContext.tsx` — all state → signals, all handlers → methods, effect ordering preserved: init/destroy first, then configure effects, then the onStateChange mirrors; provided via the shell component's `providers` array, injected by surfaces/cards)
- Create: `lib/components/engine-state.ts` (`engineState<T>(getter): Signal<T>` — onStateChange-subscribed signal, unsubscribed on destroy; = `useEngineState.ts` 22 lines)
- Create: `lib/components/surfaces/odontogram-topbar.component.ts`, `odontogram-chart-surface.component.ts`, `tooth-info-surface.component.ts`, `tooth-controls-surface.component.ts` (from the four `$ENGINE` surface TSX files: template regions MOVED out of the current shell template, byte-identical DOM; topbar gains the GitHub toolbar links + credits-open button; tooth-controls keeps the STATIC card wrappers + shared collapse infra, card BODIES arrive in T3 — until then keep the existing imperative bodies mounted so the suite stays at its T1-inventory level, no worse)
- Modify: `odontogram-shell.component.ts` (becomes the composition root mirroring the new 276-line App.tsx: provider-service + surfaces + modals; ALL existing inputs/outputs preserved; NEW fillings controlled props inputs ported from the upstream OdontogramShell props with mount-restore/re-sync semantics per the pinned App.tsx)

**Interfaces:**
- Consumes: T1 core exports (`rewireControls`, `rebuildGrid`, …).
- Produces: `OdontogramUiService` public shape (signal + method names mirroring `OdontogramUiContextValue` — exact list from the pinned blob, recorded in the report), `engineState`, four surface components — T3 cards inject the service and slot into tooth-controls.

- [ ] **Step 1:** Transcribe service + helper + four surfaces; recompose the shell; port fillings controlled props.
- [ ] **Step 2:** Gates: build green; shell + surface-scoped specs green or explainably within the T1 inventory; corpus untouched.
- [ ] **Step 3:** Commit — `feat: composable shell foundation — UI service, engineState, surface components`

---

### Task 3: Declarative cards

**Files:**
- Create: `lib/components/surfaces/cards/{statuses,orthodontics,caries,fillings,tooth-details,root-periodontium}-card.component.ts` + `surface-cross.component.ts` (from the seven pinned card TSX files; local `useState` → local signals; `useEngineState` → `engineState`; engine calls identical; DOM ids/classes byte-identical)
- Modify: `tooth-controls-surface.component.ts` (imperative card bodies → card components), `odontogram-ui.service.ts` (only if a card needs a context member missed in T2)

**Interfaces:**
- Consumes: T2 service + `engineState`; T1 card-read core getters.
- Produces: the seven card components T5 exports.

- [ ] **Step 1:** Transcribe the seven cards; swap them into tooth-controls; delete the superseded imperative bodies.
- [ ] **Step 2:** Gates: build green; controls-scoped specs green or within inventory; corpus untouched.
- [ ] **Step 3:** Commit — `feat: declarative control cards ported from composable UI`

---

### Task 4: CreditsModal, Settings anatomy option, tour + perio deltas, logo verification

**Files:**
- Create: `lib/components/credits-modal/credits-modal.component.ts` (from pinned `CreditsModal.tsx`, 181 lines: About/credits popup, creator vs contributors split, outlined GitHub button; opened from the topbar)
- Modify: `settings-modal.component.ts` (+16-line pinned delta: anatomy-profile selectable option wired to `getToothAnatomy/setToothAnatomy`) + `make-settings.ts` fixture
- Modify: shell/service as needed for the extended guided tour (tour.ts is core/verbatim from T1 — wire any NEW shell hooks the pinned App.tsx/provider adds), perio component deltas per the pinned `perioGraphic.ts`/`PerioSidebar` diffs (115-line delta — if the diff shows perio-sidebar/chart changes, port them; otherwise record "no component-side change")
- Verify: header logo renders the new `docs/angular-module-logo.png` data-URI (T1 generated it)

**Interfaces:**
- Consumes: T2 service (modal open/close signals), T1 core.
- Produces: complete shell feature parity with the pin; T5 tests against it.

- [ ] **Step 1:** Transcribe CreditsModal + Settings delta + tour/perio wiring.
- [ ] **Step 2:** Gates: build green; settings/credits-scoped specs green or within inventory; corpus untouched.
- [ ] **Step 3:** Commit — `feat: credits modal, anatomy setting, tour and perio deltas`

---

### Task 5: Test burn-down + public API

**Files:**
- Modify: `lib/testing/reset-engine-state.ts` (fold in EVERY new singleton mutation channel: tooth anatomy, status extras if stateful, rewire/rebuild side effects — enumerate from the T1 report), all red ported specs per the T1 inventory (re-diff each against its updated corpus source; port deltas drift-noted), NEW ported specs for the React-dependent new corpus files (surfaces/cards/shell-dom → Angular equivalents where meaningful; annotate `ported:`/`covered-by:` in vitest.config.ts), `public-api.ts` (export: `OdontogramUiService`, `engineState`, 4 surfaces, 7 cards, `CreditsModal`, new core APIs + types — mirroring upstream's export list)
- Modify: shell spec `MUST_HAVE_IDS` for any id that moved into surfaces/cards

**Interfaces:**
- Consumes: everything T1-T4 produced.
- Produces: SUITE FULLY GREEN — `test:ng` ×2 identical green runs + corpus green; the 1.2.0 public API surface.

- [ ] **Step 1:** Burn the inventory to zero; port/annotate new tests; extend reset + exports.
- [ ] **Step 2:** Gates: corpus green && `test:ng` ×2 green && lib build && demo build.
- [ ] **Step 3:** Commit — `test: burn down composable resync suite to green; export the composable API`

---

### Task 6: README structure port + language review + community files

**Files:**
- Modify: `README.md` + `lang/README-hu.md` — port the pinned README structure deltas (f9b45fc..934a911 on `README.md` + `lang/README-hu.md`): Credits section with creator/contributors split, TOC if the root gained one, exported-control-cards documentation, anatomy-profiles mention; adapt every name/link to the Angular package (angular-advanced-odontogram, our repo/demo URLs, attribution to the React original preserved); update the README logo/preview references per the owner's logo directive; FULL ACCURACY REVIEW of both files (owner directive): every claimed behavior/API/name checked against the actual 1.2.0 code — record each correction
- Create: `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md` (from pinned root files, links/names adapted to this repo)
- Modify: spec §2 (deviation list unchanged in count — re-affirm), §8 (Phase 7 delivered), §10 (drift note → resynced to 934a911)

**Interfaces:**
- Consumes: T5's final API surface (docs must match it).
- Produces: docs at 1.2.0 truth; T7 cites them.

- [ ] **Step 1:** Port structure; run the accuracy review; write community files; update spec.
- [ ] **Step 2:** Gates: none beyond a link/anchor lint pass (record method).
- [ ] **Step 3:** Commit — `docs: restructure READMEs with credits and community files; Angular accuracy review`

---

### Task 7: 1.2.0 release cut (npm prep)

**Files:**
- Modify: `CHANGELOG.md` (`## [1.2.0] - 2026-08-12` + compare links), root + library `package.json` → 1.2.0 (+ lockfile), `lib/core/app-version.ts` LIB_VERSION, README version badges + parity statements ("engine commit 934a911, post-v2.4.0 main"), `angular.json` budgets ONLY if a real measured regression demands (justify vs a 1.1.0 comparison build)
- Create: `docs/superpowers/specs/1.2.0-acceptance.md` (same evidence discipline as 1.1.0: real run outputs for suite, `npm pack --dry-run` file list from a fresh lib build, consumer `import.meta.resolve` proof from /private/tmp scratch — cleaned up, demo bundle sizes incl. lazy chunks)

**Interfaces:**
- Consumes: everything.
- Produces: a tree ready for `npm publish` (owner's manual step) + the final-review/merge/tag close-out.

- [ ] **Step 1:** Docs + versions + acceptance evidence; FULL GATE: corpus && test:ng ×2 && build:styles && lib build && demo build.
- [ ] **Step 2:** Commit — `release: 1.2.0 — composable UI, anatomy profiles and credits resync (engine 934a911)`

---

## Close-out (controller)

Final whole-branch review (most capable model, range = plan commit..T7) → fix wave if needed → merge (`git update-ref refs/heads/main`), worktree removal, parent reset + push, browser smoke (logo, credits popup, cards behavior, anatomy setting, tour), tag `v1.2.0` backdated, push --tags, npm-publish handover with owner flags.
