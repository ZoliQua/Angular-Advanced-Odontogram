# Contributing

Thank you for thinking about contributing to Angular Advanced Odontogram. Bug
reports, fixes, translations and new features are all welcome, and
contributions are acknowledged in the project's commit history.

## Getting set up

This is a standalone Angular and TypeScript library built with the Angular CLI
(`ng-packagr`).

- Install dependencies: `npm install`
- Run the demo app: `npm start` (`ng serve`)
- Build the library (styles first, then `ng build`):
  `npm run build:styles && npx ng build angular-advanced-odontogram`
- Build the demo app: `npm run build:demo`
- Regenerate the SVG/icon asset modules after editing a source SVG:
  `npm run gen:assets`
- Generate the API docs (TypeDoc, output in `docs/api/`): `npm run docs`
- Test: `npm test` — see "Two test runners" below

There is no separate linter configured; `ng build`'s template type-checking and
strict TypeScript are the compile-time gate.

## Two test runners

The suite is split across two runners, and both must pass:

- `npm run test:corpus` — the shared clinical-engine core
  (`projects/angular-advanced-odontogram/src/lib/core/`), run with plain
  Vitest against the ported test corpus. This is where the SVG-rendering,
  FHIR-export and JSON-round-trip golden fixtures (`svg-fingerprints.json`,
  `fhir-golden.json`, `roundtrip-golden.json`) live and are checked byte for
  byte.
- `npm run test:ng` — the Angular shell (components, services, directives),
  run through `ng test` (Angular's Vitest builder). This is where the
  DOM-parity specs live, asserting the shell renders the same ids, classes
  and markup as the original React components.

`npm test` runs both, in that order.

## Core files are synced from upstream

`projects/angular-advanced-odontogram/src/lib/core/` (the clinical engine —
dental status logic, periodontal charting, FHIR export/import, i18n strings,
guided tour, SVG templates) is a byte-identical port of the original
[React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram)
project's engine, pinned to a specific upstream commit and re-copied from that
pinned snapshot on every resync. Please do not hand-edit files under `core/`
for a feature or bug fix — a small, explicitly documented set of deviations
exists (branding strings and similar Angular-package identity swaps only; see
`docs/superpowers/specs/2026-08-06-angular-odontogram-port-design.md` §2 for
the full, current list). Any other change to core behaviour should be
proposed upstream first, then ported here on the next resync, so both
projects stay verifiable against the same pinned commit. If you are not sure
whether something belongs in `core/` or in the Angular-only shell
(`projects/angular-advanced-odontogram/src/lib/components/`), please ask in
the pull request rather than guessing.

## Before you open a pull request

- Keep changes small and focused. One topic per pull request is much easier
  to review.
- Run the full test suite (`npm test`) and `npx ng build
  angular-advanced-odontogram`. They should all pass.
- Add or update tests for anything you change.
- If your change is meant to preserve behaviour, the golden fixtures listed
  above must stay byte identical. If it changes output on purpose,
  regenerate the affected golden and say why in the pull request.

## Translations and i18n

All user facing text lives in
`projects/angular-advanced-odontogram/src/lib/core/i18n/translations.ts`. The
UI ships in twelve languages, all as keys in that one file. This port carries
a full-length documentation file per language under `lang/`
(`lang/README-en.md` is the canonical reference the other eleven mirror) —
please keep them in sync when documenting a behaviour or public-API change.

## Style

- Follow the patterns already in the surrounding code.
- Prefer explicit, readable logic over clever shortcuts.
- Do not add heavy dependencies. The bundle is meant to stay small.
- Public API changes must stay backward compatible, and the JSON payload
  version is bumped whenever the serialized shape changes.

## Documentation

Updating the docs is part of the change, not an afterthought. Update
`README.md` and `lang/README-en.md` (the canonical full documentation)
together when behaviour or the public API changes; the other eleven `lang/`
translations should follow on the next documentation pass.

## Credit

The app's Credits popup and the README's Credits section list the creator,
the original project this is ported from, and the libraries it's built
with. Contributions themselves are acknowledged in the project's commit
history.
