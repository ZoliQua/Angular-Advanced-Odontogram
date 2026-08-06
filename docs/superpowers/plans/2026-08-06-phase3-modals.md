# Angular Odontogram Port — Phase 3: Settings & Export Modals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port `SettingsModal.tsx` (652 lines, 7 tabs) and `ExportOptionsModal.tsx` (228 lines) to Angular, wire both into the shell's existing Phase-3 markers, re-enable the 4 settings-dependent tests, and land the Phase-2 review's hygiene items — completing spec §8 Phase 3.

**Architecture:** Both modals mirror `DualStateConfirmComponent`'s established dialog pattern (inline template, `input.required<boolean>() open`, `output<void>() close`, constructor `effect(onCleanup)` focus trap with the jsdom-safe `isVisible()` guard, incrementing title-id). The focus-trap machinery — now needed by three dialogs — is extracted into one shared helper. `SettingsModalComponent` takes a `settings: SettingsState` input object carrying values AND `on*` callbacks (field-for-field identical to the React type) and exports a `SETTINGS_TABS` metadata array for parity tests; the shell builds `settingsState` exactly as App.tsx 474-513 does. `ExportOptionsModalComponent` is self-contained (own checkbox state, caseMeta sync via engine, calls `exportPdf` itself).

**Tech Stack:** Angular 21 standalone/OnPush/inline-template components; dual-runner tests (`test:corpus` plain vitest, `test:ng` Angular builder); Phase-1 core untouched.

**Source repo (read-only reference):** `/Users/Zoli/Sites/DentalQuoteCreator/src/modules/odontogram/engine` = `$ENGINE`. Transcription sources of truth: `$ENGINE/src/SettingsModal.tsx`, `$ENGINE/src/ExportOptionsModal.tsx`, `$ENGINE/src/App.tsx` (wiring at 474-513, 570-572, 601, 1021-1026, 1035-1039).

## Global Constraints

- Everything from Phases 1–2 binds: core byte-identical (`lib/core/**` NEVER edited), payload 2.19, no React, no new runtime dependencies, package 0.1.0 MIT npm.
- Angular components: standalone, OnPush, INLINE templates, signal `input()`/`output()`; specs run under `npm run test:ng` (no `vi.mock` — TestBed DI overrides + real engine seams); corpus stays green under `npm run test:corpus` (95+1).
- Dialog classes/keys byte-identical to the TSX sources (`odon-settings-*` namespace for Settings; `odon-confirm-*` + `id="exportOptionsModal"` for Export; i18n keys read from the sources, never invented).
- Any NEW singleton state mutated by specs (e.g. `setPerioRowVisibility`, `setPerioIndexNameMode`, `setPatientName`, `setExamDate`) must be folded into `lib/testing/reset-engine-state.ts` in the same task that first mutates it.
- Commit policy (repo-root `CLAUDE.md`, untracked): sole author `Zoltán Dul <zoltan.dul@gmail.com>`, no Co-Authored-By/AI attribution ever, backdated dates assigned per-dispatch by the controller (day 2026-08-06, max 10/day, +02:00, both date vars), one commit per task unless the dispatch says otherwise.

---

### Task 1: Shared focus-trap helper + hygiene items

**Files:**
- Create: `projects/angular-advanced-odontogram/src/lib/components/shared/dialog-focus.ts`
- Modify: `projects/angular-advanced-odontogram/src/lib/components/dual-state-confirm/dual-state-confirm.component.ts` (refactor onto the helper; behavior identical)
- Modify: `projects/angular-advanced-odontogram/src/lib/i18n/i18n.service.ts` (dispose fix)
- Test: extend `dual-state-confirm.component.spec.ts` + `i18n.service.spec.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `dialog-focus.ts` exporting `FOCUSABLE: string` (the selector from DualStateConfirm), `isVisible(el: HTMLElement): boolean` (the jsdom-safe visibility check — move the existing `IS_JSDOM` logic here verbatim), `trapTabKey(dialog: HTMLElement, event: KeyboardEvent): void` (the Tab/Shift+Tab wrap logic), `focusFirst(dialog: HTMLElement): void`, and `nextDialogTitleId(prefix: string): string` (incrementing id factory). Tasks 2–3's modals consume exactly these. `I18nService` gains constructor-scope `inject(DestroyRef).onDestroy(unsub)` on its `onI18nChange` subscription.

- [ ] **Step 1:** Extract the named helpers out of `dual-state-confirm.component.ts` into `dialog-focus.ts` (move, don't rewrite; the component imports them). Run `npm run test:ng` — the existing 11 DualStateConfirm tests must stay green unchanged (they are the behavior lock).
- [ ] **Step 2:** I18nService dispose fix: capture `onI18nChange`'s returned unsubscribe and register it with `inject(DestroyRef)`. Add one spec: `TestBed.resetTestingModule()` after injecting the service does not leave the old instance updating (assert via listener-count seam if exported, else assert the new instance still tracks language — the behavioral core).
- [ ] **Step 3:** Gates: `npm run test:ng` all green; `npm run test:corpus` 95+1; `npx ng build angular-advanced-odontogram` green.
- [ ] **Step 4:** Commit — `refactor: shared dialog focus-trap helper; i18n listener dispose`

---

### Task 2: SettingsModalComponent

**Files:**
- Create: `projects/angular-advanced-odontogram/src/lib/components/settings-modal/settings-modal.component.ts`
- Test: `projects/angular-advanced-odontogram/src/lib/components/settings-modal/settings-modal.component.spec.ts`
- Modify: `projects/angular-advanced-odontogram/src/public-api.ts`

**Interfaces:**
- Consumes: `dialog-focus.ts` helpers (Task 1); `I18nService` for `t()`; types from core (`NumberingSystem`, `Language`, `SecondaryCariesMode`, `RootCariesMode`, `RadiographicDepthMode`, `PulpDetailLevel`, `ToothDetailLevel`, `SurfaceNotation`, `PerioViewMode`, `PerioRowId`, `PerioIndexNameMode`) and `PERIO_ROW_GROUPS`-equivalent structure (transcribe the 5 groups/16 row ids from SettingsModal.tsx 153-159).
- Produces: `SettingsModalComponent`, selector `aao-settings-modal`, inputs `open: input.required<boolean>()`, `settings: input.required<SettingsState>()`, output `close = output<void>()`. Exports `SETTINGS_TABS: ReadonlyArray<{ id: SettingsTabId; titleKey: string }>` (ids in order: `general, panels, toothDetails, caries, pulpa, notes, periodontal`) and the `SettingsState` interface — field-for-field identical to `$ENGINE/src/SettingsModal.tsx:29-68` (19 value fields + on* callbacks: numbering/onNumbering, language/onLanguage, isDark/onToggleDark (no-arg), toothInfo/onToothInfo, secondaryCariesMode/onSecondaryCariesMode, icdas/onIcdas, cariesDepth/onCariesDepth, rootCariesMode/onRootCariesMode, radiographicDepthMode/onRadiographicDepthMode, pulpLevel/onPulpLevel, wearDetailLevel/onWearDetailLevel, discolorationDetailLevel/onDiscolorationDetailLevel, surfaceNotation/onSurfaceNotation, notes/onNotes, showStatusCard/onShowStatusCard, showOrthoCard/onShowOrthoCard, perioViewMode/onPerioViewMode, perioRowVisibility/onPerioRowVisibility(id, visible), perioIndexNameMode/onPerioIndexNameMode).

**Transcription source:** `$ENGINE/src/SettingsModal.tsx` in full. Contract to preserve exactly: `odon-settings-backdrop`/`odon-settings-modal` + every other `odon-settings-*` class; `role="dialog"`/`aria-modal`/`aria-labelledby`; tab structure per SETTINGS_TABS 252-466 (general 256-299 incl. the disabled `exportImport` coming-soon row 288-296; panels 300-329; toothDetails 330-361; caries 362-407 with the CARS select; pulpa 408-421; notes 422-434; periodontal 435-465 with 5 group headings + 16 per-row toggles + trailing index-name select); `SettingRow` value/desc structure (`.odon-settings-row-desc`); APG tablist keyboard nav (onTabListKeyDown 544-566: Arrow wrap, Home/End, roving tabIndex, `aria-selected`); Esc→close (513), backdrop-mousedown-self→close (576), focus trap + opener restore via the Task-1 helpers. All i18n keys read from the TSX (`settings.tab.<id>`, `settings.<field>.label/.desc`, `settings.perio.row.<id>`, `settings.perio.group.<name>`, reused generic keys). Template: one `@for` over tabs for the tablist; `@switch (activeTab())` for panels. Select/toggle rows may be structured with small private template fragments — but rendered DOM (tags/classes/aria) must match the TSX's SettingRow output.

- [ ] **Step 1: Write the failing spec** — cases: (a) closed renders nothing; (b) open renders the dialog with all 7 tabs in `SETTINGS_TABS` order (`role="tab"` count/order, general selected); (c) switching to panels shows the two card toggles + perioViewMode select and clicking a toggle invokes the matching `on*` callback with the right value; (d) periodontal tab renders 16 row toggles (default all checked from a `perioRowVisibility` of all-true) + 5 group headings + index-mode select, and toggling row `pd` calls `onPerioRowVisibility("pd", false)`; (e) Esc emits close; (f) ArrowRight on the tablist moves `aria-selected` and roving tabindex (seed of the a11y port). Host component supplies a full `SettingsState` with vitest `vi.fn()` callbacks (plain function spies — `vi.fn` itself works under test:ng; only `vi.mock` is unavailable).
- [ ] **Step 2:** RED run (module not found).
- [ ] **Step 3:** Implement per the transcription source.
- [ ] **Step 4:** Spec green under `npm run test:ng`; corpus 95+1; `npx ng build angular-advanced-odontogram` green (AOT template check).
- [ ] **Step 5:** Export component + `SettingsState` + `SETTINGS_TABS` from `public-api.ts`; build green.
- [ ] **Step 6:** Commit — `feat: SettingsModal component (7 tabs, APG tablist)`

---

### Task 3: Shell settings wiring + missing perio-settings mirrors

**Files:**
- Modify: `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/odontogram-shell.component.ts`
- Modify: `projects/angular-advanced-odontogram/src/lib/testing/reset-engine-state.ts` (fold in perio-settings resets)
- Test: extend `odontogram-shell.component.spec.ts`

**Interfaces:**
- Consumes: `SettingsModalComponent` + `SettingsState` (Task 2); engine `getPerioRowVisibility`/`setPerioRowVisibility`/`getPerioIndexNameMode`/`setPerioIndexNameMode` (core exports).
- Produces: the shell mounts `<aao-settings-modal [open]="settingsOpen()" [settings]="settingsState()" (close)="settingsOpen.set(false)" />` at the existing `<!-- Phase 3: SettingsModal -->` marker; `settingsState: Signal<SettingsState>` computed mirroring App.tsx 474-513 (each on* = local signal set + engine setter, exactly as the React comment at 471-473 describes; isDark/onToggleDark reuse the existing `toggleDark`); NEW signals `perioRowVisibilityState` + `perioIndexNameModeState` mirrored via the previously-deferred 6th `onStateChange` subscription (App.tsx 437-444).

- [ ] **Step 1: Failing spec cases:** (a) clicking the settings gear opens the modal (`.odon-settings-modal` present), close works; (b) changing the numbering select in the modal's general tab calls through to the engine (`setNumberingSystem` effect → assert via a DOM artifact the engine controls or the shell's numbering signal); (c) toggling a periodontal row updates `getPerioRowVisibility()` (real engine) and survives modal close/reopen; (d) the `settingsState` object passes current values (open the modal after setting e.g. icdas on — checkbox reflects it).
- [ ] **Step 2:** RED run.
- [ ] **Step 3:** Implement; fold `setPerioRowVisibility`-default + `setPerioIndexNameMode("translated")` resets into `reset-engine-state.ts` (check core for the exact default-restoring calls; `getPerioRowVisibility()` default is all-visible).
- [ ] **Step 4:** Gates: test:ng all green ×2 consecutive runs (isolation check after the new singleton use); corpus 95+1; build green.
- [ ] **Step 5:** Commit — `feat: wire SettingsModal into the shell; perio-settings mirrors`

---

### Task 4: ExportOptionsModalComponent + shell mount

**Files:**
- Create: `projects/angular-advanced-odontogram/src/lib/components/export-options-modal/export-options-modal.component.ts`
- Modify: `projects/angular-advanced-odontogram/src/lib/components/odontogram-shell/odontogram-shell.component.ts` (mount at the `<!-- Phase 3: ExportOptionsModal -->` marker)
- Modify: `projects/angular-advanced-odontogram/src/lib/testing/reset-engine-state.ts` (patientName/examDate resets if not already covered by resetCaseMeta)
- Test: `export-options-modal.component.spec.ts`
- Modify: `projects/angular-advanced-odontogram/src/public-api.ts`

**Interfaces:**
- Consumes: `dialog-focus.ts` (Task 1); `I18nService`; engine `getCaseMeta`, `setPatientName`, `setExamDate`, `hasAnyPerioData`, `exportPdf`, `onStateChange` (all core exports).
- Produces: `ExportOptionsModalComponent`, selector `aao-export-options-modal`, inputs `open: input.required<boolean>()`, output `close = output<void>()` — self-contained like the TSX (own checkbox signals defaulting true; caseMeta sync on open + via onStateChange while open; the modal itself calls `exportPdf(opts)` with perio flags force-ANDed with `hasPerio`, then emits close). Shell mounts `<aao-export-options-modal [open]="pdfOpen()" (close)="pdfOpen.set(false)" />`.

**Transcription source:** `$ENGINE/src/ExportOptionsModal.tsx` in full. Contract: `odon-confirm-backdrop`/`odon-confirm-modal` classes (SAME namespace as DualStateConfirm — documented in the TSX 21-37), root `id="exportOptionsModal"` (135); 4 checkboxes (patientData, odontogram, perioStatus, perioDescription — the last two `disabled` when no perio data, with the `export.options.noPerio` hint); patient-name (→`setPatientName`) and exam-date (→`setExamDate`) inputs synced from `getCaseMeta()`; export button invokes `exportPdf` (116-125's belt-and-suspenders flag logic verbatim); Esc/backdrop/focus-trap identical to DualStateConfirm via the shared helpers.

- [ ] **Step 1: Failing spec cases:** (a) closed renders nothing; open renders `#exportOptionsModal` with 4 checkboxes default-checked; (b) no perio data → perioStatus/perioDescription disabled + hint visible; with perio data (seed via real `setPerioSite(16,"MB",{pd:4})`) → enabled; (c) typing a patient name calls through to the engine (`getCaseMeta().patientName` updated); (d) export button: provide a spy route for `exportPdf` — it is a real core export doing jsPDF work; jsdom cannot run it, so the spec must inject a substitute. `vi.mock` is unavailable: add a minimal DI token `EXPORT_PDF_FN` (default factory = real `exportPdf`) in the component, override in TestBed — same pattern as `ODONTOGRAM_ENGINE_LIFECYCLE`, documented in the component; assert it is called with perio flags false when `hasPerio` is false even if boxes were checked, and that close is emitted after resolve.
- [ ] **Step 2:** RED run.
- [ ] **Step 3:** Implement; extend `reset-engine-state.ts` only if `resetCaseMeta()` (already called there via `__resetChartStateForTest`? verify) does not cover patientName/examDate — check core: `resetCaseMeta` restores the full default CaseMeta including the two identity fields.
- [ ] **Step 4:** Gates: test:ng green ×2; corpus 95+1; build green.
- [ ] **Step 5:** Export from public-api; commit — `feat: ExportOptionsModal component wired to PDF export`

---

### Task 5: Port the 4 settings tests; docs; phase close

**Files:**
- Create: `projects/angular-advanced-odontogram/src/lib/components/settings-modal/ported/{sp13-settings-tab,settings-modal-a11y,ui2-perio-settings,sp15-settings}.spec.ts`
- Modify: `vitest.config.ts` (annotations: the 4 `phase-3` entries → `ported:`), `tsconfig.spec.json` if needed
- Modify: `README.md`, `CHANGELOG.md`, `docs/superpowers/specs/2026-08-06-angular-odontogram-port-design.md` (§8 phase-3 delivered)

**Interfaces:**
- Consumes: `SettingsModalComponent` + `SETTINGS_TABS` + `SettingsState` (Task 2), shell wiring (Task 3).
- Produces: the 4 tests green as Angular specs; docs closed out.

**Porting notes (the React tests inspect React element trees — adapt the mechanics, keep the substance):**
- `sp13-settings-tab` (tab order + toothDetails content): assert `SETTINGS_TABS` id order (general, panels, toothDetails at index 2) directly from the export; render the modal with toothDetails active and assert the 3 selects (wear/discoloration/notation) exist with the right current values and that changing each fires its callback — the DOM equivalent of the element-tree walk.
- `settings-modal-a11y` (APG tablist): near-1:1 port — mount, keydown ArrowRight/ArrowLeft/Home/End on `[role="tab"]`, assert `aria-selected`, focus movement, roving `tabindex`.
- `ui2-perio-settings`: describe 1 (module flags) is framework-free — port as direct engine-import assertions (defaults, round-trip, with afterEach resets); describe 2: render periodontal tab, assert 16 checkboxes default-checked, group headings, index-mode select, change wiring.
- `sp15-settings`: full tab-order assert `[general, panels, toothDetails, caries, pulpa, notes, periodontal]`, panels tab's 2 toggles, caries tab CARS select position/wiring, no duplicate tab ids.
- Never weaken assertion substance; a genuinely unportable assertion (React-element-tree-specific) is replaced by its DOM-level equivalent and the mapping documented in the spec header comment.

- [ ] **Step 1:** Port the 4 files one at a time, each green before the next; update the 4 `vitest.config.ts` annotations to `// ported: <path>`.
- [ ] **Step 2:** Docs: README Phase 3 checked; CHANGELOG Added entries (SettingsModal, ExportOptionsModal, shared dialog-focus helper, i18n dispose fix, 4 ported settings tests); spec §8 phase-3 annotated DELIVERED.
- [ ] **Step 3:** Full phase gate with outputs recorded: `npm run test:corpus` && `npm run test:ng` ×3 consecutive && `npm run build:styles` && `npx ng build angular-advanced-odontogram` && `npx ng build demo` — all green.
- [ ] **Step 4:** Commit — `test: port settings test batch; phase 3 docs`

---

## Deferred (explicit)

- Phase 4: PerioChart + PerioSidebar + the 31 phase-4 tests + perio export UI checks.
- Phase 5: packaging (dist README/LICENSE, `ODONTOGRAM_ENGINE_LIFECYCLE` + `EXPORT_PDF_FN` public-API ruling, packageManager pin, CHANGELOG links, `pre` script for build:styles ordering), typedoc, remaining READMEs, 1.0.0 acceptance.
