# Angular Odontogram Port — Phase 5: Release (1.0.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `angular-advanced-odontogram` 1.0.0 — parity with `react-advanced-odontogram` v2.2.0 (payload 2.19) — with correct npm packaging, API docs, full README (EN + HU), and the spec-§7 acceptance evidence assembled.

**Architecture:** OWNER DECISION (2026-08-07): 1.0.0 pins the Phase-1 snapshot (React v2.2.0 / payload 2.19) exactly as the spec states; the upstream v2.2.1 resync (payload 2.20: patientDob, individual notes, PDF-dialog DOB/split options, Plan-mode gating, bridge lower-arch fix) is deliberately deferred to a 1.1.0 release. Phase 5 therefore touches NO core and NO component behavior — it is packaging, documentation, acceptance evidence, and version cut. Browser smoke is a CONTROLLER close-out step (the controller drives the served demo in a real browser after merge, before tagging).

**Tech Stack:** ng-packagr assets, typedoc, npm pack, existing dual-runner suite.

## Global Constraints

- ZERO behavior changes: no `lib/core/**`, no component-logic edits; components may gain doc comments ONLY. Suite must stay corpus 100+1 (1061) + test:ng 74/760 throughout.
- 1.0.0 parity target: React v2.2.0 / payload 2.19 (per spec §1 and the owner's pin decision). The v2.2.1 drift stays documented in spec §2; CHANGELOG 1.0.0 notes the pin + planned 1.1.0 resync.
- DI-token ruling (controller): `ODONTOGRAM_ENGINE_LIFECYCLE` and `EXPORT_PDF_FN` REMAIN public, documented as supported host-testing override points (doc comments already describe them; README documents them; no @internal hiding).
- Commit policy (repo-root `CLAUDE.md`, untracked): sole author `Zoltán Dul <zoltan.dul@gmail.com>`, no Co-Authored-By/AI attribution ever, controller-assigned backdated dates (2026-08-07 remaining slots, then 2026-08-08, max 10/day, +02:00, both date vars), one commit per task.

---

### Task 1: npm packaging correctness

**Files:**
- Modify: `projects/angular-advanced-odontogram/README.md` (replace ng-boilerplate with real npm-facing content), `projects/angular-advanced-odontogram/ng-package.json` (assets: LICENSE), root `package.json` (drop `packageManager` pin; add `build:demo` convenience script), `CHANGELOG.md` (comparison links footer)
- Create: none (LICENSE ships via assets from repo root)

**Interfaces:**
- Produces: `dist/angular-advanced-odontogram/` after `npm run build:styles && ng build angular-advanced-odontogram` contains README.md (real content), LICENSE, styles.css, correct package.json (version still 0.1.0 — the bump is Task 4). Root scripts: `"build:demo": "npm run build:styles && ng build demo"`.

- [ ] **Step 1:** Library README.md: short npm-facing page — what it is (Angular port of react-advanced-odontogram, parity v2.2.0/payload 2.19), install (`npm i angular-advanced-odontogram`), the two-step consumer setup (import `OdontogramShellComponent`; add `angular-advanced-odontogram/styles.css` to styles), a minimal usage snippet, link to the GitHub repo for full docs. No AI attribution anywhere.
- [ ] **Step 2:** `ng-package.json` assets: add LICENSE — `"assets": ["styles.css", {"input": "../../", "glob": "LICENSE", "output": "."}]` (adjust the input form to what ng-packagr's schema accepts; the contract is `dist/angular-advanced-odontogram/LICENSE` existing after build; if the relative-input form is rejected, copy LICENSE into the project dir and gitignore-exempt it — report which route worked).
- [ ] **Step 3:** Root package.json: remove the `"packageManager"` field; add `build:demo`. CHANGELOG: add the Keep-a-Changelog comparison-links footer scaffolding (an `[Unreleased]` link placeholder pointing at the GitHub compare URL — real tags land in Task 4).
- [ ] **Step 4:** Verify: `npm run build:styles && npx ng build angular-advanced-odontogram && ls dist/angular-advanced-odontogram/` shows README.md + LICENSE + styles.css; `head -5` of the built README shows the real content; `npm run build:demo` green; suite spot: `npm run test:ng 2>&1 | tail -3` unchanged 74/760.
- [ ] **Step 5:** Commit — `chore: npm packaging (dist README, LICENSE, scripts)`

---

### Task 2: typedoc API docs

**Files:**
- Create: `typedoc.json`
- Modify: root `package.json` (`"docs": "typedoc"`), `.gitignore` (`/docs/api/`), README.md (root — one "API docs" line)

**Interfaces:**
- Produces: `npm run docs` renders the public API to `docs/api/` (gitignored output; config committed). Dev-dep `typedoc` added (docs tooling — allowed like test dev-deps).

- [ ] **Step 1:** `npm i -D typedoc` (latest compatible with the workspace TS version — if the latest rejects the TS version, pin the newest that accepts it and note it).
- [ ] **Step 2:** `typedoc.json`: entry point `projects/angular-advanced-odontogram/src/public-api.ts`, `"out": "docs/api"`, `"tsconfig": "projects/angular-advanced-odontogram/tsconfig.lib.json"`, `"excludeInternal": true`, name "Angular Advanced Odontogram". If typedoc chokes on Angular decorators/signal initializers, add the minimal `"skipErrorChecking": true` and note it — the deliverable is rendered docs for the exported surface (engine functions + components + tokens + types).
- [ ] **Step 3:** Run `npm run docs`; verify `docs/api/index.html` exists and mentions `OdontogramShellComponent`, `initOdontogram`, `PerioChartComponent`. Gitignore `/docs/api/`.
- [ ] **Step 4:** Suite spot-check unchanged; commit — `docs: typedoc API docs pipeline`

---

### Task 3: Full README (EN) + Hungarian translation

**Files:**
- Modify: `README.md` (root — expand to the full library documentation)
- Create: `lang/README-hu.md`

**Interfaces:**
- Produces: the repo's front page documents everything a consumer needs; HU translation mirrors it; both carry a language-switcher line (`English | [Magyar](lang/README-hu.md)` / reverse).

- [ ] **Step 1:** Expand root README.md (keep the existing Status/Development sections, restructure around them): overview + parity statement (React v2.2.0 / payload 2.19; JSON+FHIR round-trip compatible; upstream v2.2.1 resync planned as 1.1.0); install + styles setup; usage — `<aao-odontogram-shell>` with the full inputs table (all 18 inputs: name, type, default — read them from `odontogram-shell.component.ts`, do not invent) + 3 outputs; `PerioChartComponent` standalone usage (`[open]`/`[inline]`/`(closeChart)`); the imperative API (grouped list of the main exported engine functions — export/import, chart mode, perio API — pointing at typedoc for the rest); testing override points (`ODONTOGRAM_ENGINE_LIFECYCLE`, `EXPORT_PDF_FN` — supported, with a 3-line TestBed example); dual-runner dev workflow; credits/license. Every claim checked against the repo (script names, counts, selectors).
- [ ] **Step 2:** `lang/README-hu.md`: full Hungarian translation of the final EN content (translate prose; keep code/identifiers/tables' code column untouched).
- [ ] **Step 3:** Add the language-switcher line to both. Verify all relative links resolve (`lang/README-hu.md` ↔ `../README.md`).
- [ ] **Step 4:** Suite spot-check unchanged; commit — `docs: full README (EN) and Hungarian translation`

---

### Task 4: 1.0.0 acceptance evidence + version cut

**Files:**
- Modify: root + library `package.json` (0.1.0 → 1.0.0), `CHANGELOG.md` (cut `## [1.0.0] - 2026-08-08` from Unreleased + real compare links), `docs/superpowers/specs/2026-08-06-angular-odontogram-port-design.md` (§7 acceptance evidence mapping + §8 phase-5 DELIVERED), README badges/claims if any reference 0.x
- Create: `docs/superpowers/specs/1.0.0-acceptance.md` (the evidence sheet)

**Interfaces:**
- Produces: the acceptance sheet maps every spec-§7 criterion to its concrete evidence; versions bumped; CHANGELOG released. (Tagging + browser smoke are the controller's close-out, after merge.)

- [ ] **Step 1:** Write `docs/superpowers/specs/1.0.0-acceptance.md`: table of spec-§7 criteria → evidence: (a) SVG-fingerprint parity → `parity.test.ts` + `parity/matrix.test.ts` green in corpus (cite current run counts); (b) FHIR golden byte-identical → `parity/capture.test.ts`/`fhir.test.ts` corpus-green; (c) roundtrip golden (a real React-2.2.0 export) imports + re-exports equal → `payload-2-4-roundtrip.test.ts` + roundtrip-golden corpus-green; (d) full suite state (corpus 100+1/1061, test:ng 74/760); (e) `npm pack` dry-run: run `npm run build:styles && npx ng build angular-advanced-odontogram && cd dist/angular-advanced-odontogram && npm pack --dry-run` — record the file list (README, LICENSE, styles.css, FESM, typings present); (f) consumer resolution proof (scratch symlink + `import.meta.resolve` for both `.` and `./styles.css` — record outputs); (g) known-drift note (v2.2.1 → 1.1.0). Every evidence line must be an ACTUAL run output from this task, not asserted.
- [ ] **Step 2:** Version bump both package.json files to 1.0.0; CHANGELOG cut `[1.0.0] - 2026-08-08` with the phase-grouped feature list + compare links (`[Unreleased]: .../compare/v1.0.0...HEAD`, `[1.0.0]: .../releases/tag/v1.0.0`).
- [ ] **Step 3:** Spec: §7 annotated with the acceptance-sheet pointer; §8 phase-5 line DELIVERED (2026-08-08).
- [ ] **Step 4:** FULL GATE: `npm run test:corpus` && `npm run test:ng` ×2 && `npm run build:styles` && `npx ng build angular-advanced-odontogram` && `npm run build:demo` — all green, recorded.
- [ ] **Step 5:** Commit — `release: 1.0.0 — parity with react-advanced-odontogram 2.2.0`

---

## Controller close-out (after merge, not subagent work)

1. Merge to main + push (established phase-close flow).
2. Browser smoke: controller drives the served demo (`ng serve demo`) in a real browser — odontogram edit, Status/Plan toggle, Settings open, Dental Chart view (perio grid + keyboard entry), PDF/export menu — and records findings; any defect found becomes a fix commit BEFORE tagging.
3. Tag: `GIT_COMMITTER_DATE="2026-08-08T<slot>+02:00" git tag -a v1.0.0 -m "angular-advanced-odontogram 1.0.0"` on the release commit; push `--tags`.
4. `npm publish` remains ZOLI'S manual action (never run by the agent) — hand over the exact command (`cd dist/angular-advanced-odontogram && npm publish`) in the closing summary.

## Deferred (explicit)

- 1.1.0: upstream v2.2.1 resync (payload 2.20 — patientDob + setPatientDob, individual notes, PDF-dialog DOB/split options, Plan-mode gating, bridge lower-arch; core+corpus re-copy with the 3 sanctioned deviations reapplied; ExportOptionsModal DOB field; affected ported specs). Also the `setReadOnly`-doesn't-notify core question rides with the resync (fix belongs upstream).
- Remaining 10 README translations (per spec §5 doc strategy).
