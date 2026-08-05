# Angular Advanced Odontogram

Angular port of [react-advanced-odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)
— an interactive, SVG-based dental odontogram (dental chart) editor.
Work in progress; 1.0.0 = full feature parity with the React module v2.2.0
(payload version 2.19, JSON/FHIR round-trip compatible).

## Status

- [x] Phase 1 — engine core (framework-free) + test corpus green
- [x] Phase 2 — `OdontogramShellComponent` (topbar/menus/summary/confirm) + demo app
- [ ] Phase 3 — Settings & dialogs
- [ ] Phase 4 — Periodontal chart & exports
- [ ] Phase 5 — docs, packaging, 1.0.0

## Usage

```html
<aao-odontogram-shell [enableNotes]="true" />
```

Build the library styles before building/serving anything that consumes the
component (the demo app does this — see `projects/demo`):

    npm run build:styles && npx ng build angular-advanced-odontogram

`npm run build:styles` must run first — it emits
`projects/angular-advanced-odontogram/styles.css` from the Tailwind source,
which the demo's `angular.json` `styles` array references directly (the
source-side artifact, not `dist/`).

## Development

    npm install
    npm run gen:assets   # regenerate SVG asset modules after editing an SVG
    npm test             # test:corpus (Vitest core suite, incl. golden parity fixtures) + test:ng (Angular specs, ngtsc-compiled via `ng test`)
    npm run test:corpus  # plain Vitest — the framework-free engine + copied React-derived corpus only
    npm run test:ng      # Angular component/service *.spec.ts files, via `ng test` (needed for signal input()/output() support)
    npm run build:styles && npx ng build angular-advanced-odontogram

Design spec: `docs/superpowers/specs/2026-08-06-angular-odontogram-port-design.md`.
