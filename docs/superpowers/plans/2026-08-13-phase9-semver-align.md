# Angular Odontogram Port — Phase 9: Upstream Semver Alignment + Credits Outro Fix

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal (owner directives 2026-08-19):** (1) The npm version tracks the React module's semver from now on — this release is **2.4.0** (matching react-advanced-odontogram v2.4.0, our engine pin 934a911 being post-2.4.0 main). (2) Reword the credits modal's closing sentence (`credits.welcome`, ×12 languages) — "…you will be credited here" is wrong now that the modal has no contributors list.

## Global Constraints
- `credits.welcome` reword is a further deviation-#4 extension (core translations.ts) — spec §2 note required. New EN text: "Contributions are welcome — open a pull request on GitHub." Other 11 languages: native equivalents in each table's register.
- Version 2.4.0 EVERYWHERE: root+lib package.json, lockfile, app-version.ts, 13 README badges; parity sentences gain the lockstep note (EN: "Versioned in lockstep with the React module."; native equivalents per language, placed with the existing parity sentence). CHANGELOG: `## [2.4.0] - 2026-08-13` with an explicit version-scheme note (jump from 1.2.1 is intentional; no 1.3.x/2.0-2.3 will exist).
- Commit policy unchanged (sole author, EMPTY bodies, backdated 2026-08-13): #8 17:45 plan, #9 18:30 T1 reword, #10 19:15 T2 release. Fix rounds AMEND (no new slots — day cap is 10).
- Never commit forbidden paths. npm publish = owner's manual step.

### Task 1: credits.welcome reword ×12
**Files:** lib/core/i18n/translations.ts (12 tables), credits specs if they assert the string, spec §2 note. Sweep repo for other "credited here" echoes.
- [ ] Reword ×12 (native quality, register-matched); gates: test:ng green, corpus green (the corpus i18n tests may assert the string — if an UPSTREAM-VERBATIM corpus test asserts the old text, exclude-annotate it as branding-deviation-affected instead of editing the copied test, mirroring how deviation #4 is already handled — check the existing pattern first), build green.
- [ ] Commit — `fix: reword credits welcome line for the trimmed modal`

### Task 2: 2.4.0 release cut
**Files:** package.json ×2, lockfile, app-version.ts, CHANGELOG (+ compare links: `[2.4.0]: ...compare/v1.2.1...v2.4.0`), 13 README badges + parity/lockstep sentences (native per language), docs/superpowers/specs/2.4.0-acceptance.md (evidence: suite, pack dry-run, 13-file badge grep).
- [ ] FULL GATE (corpus, test:ng ×2, build:styles, lib build, demo build).
- [ ] Commit — `release: 2.4.0 — version aligned with react-advanced-odontogram`

## Close-out (controller)
Final review (light — two small diffs) → merge → tag v2.4.0 → push → smoke (modal sentence) → npm handover with publish steps.
