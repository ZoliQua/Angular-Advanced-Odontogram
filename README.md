# Angular Advanced Odontogram

Angular port of [react-advanced-odontogram](https://github.com/ZoliQua/React-Odontogram-Modul)
— an interactive, SVG-based dental odontogram (dental chart) editor.
Work in progress; 1.0.0 = full feature parity with the React module v2.2.0
(payload version 2.19, JSON/FHIR round-trip compatible).

## Status

- [x] Phase 1 — engine core (framework-free) + test corpus green
- [ ] Phase 2 — `OdontogramShellComponent`
- [ ] Phase 3 — Settings & dialogs
- [ ] Phase 4 — Periodontal chart & exports
- [ ] Phase 5 — docs, packaging, 1.0.0

## Development

    npm install
    npm run gen:assets   # regenerate SVG asset modules after editing an SVG
    npm test             # Vitest core suite (incl. golden parity fixtures)
    npm run build:styles && npx ng build angular-advanced-odontogram

Design spec: `docs/superpowers/specs/2026-08-06-angular-odontogram-port-design.md`.
