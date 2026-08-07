// Shared spec fixture for `SettingsState` (Phase-3 final-review hygiene
// item: this object literal used to be copy-pasted verbatim across four
// settings-modal spec files — settings-modal.component.spec.ts and three of
// the ported specs — so a defaults tweak had to be hand-applied in four
// places to stay in sync). NOT re-exported from the package's public-api:
// this is spec-only scaffolding, not a consumer-facing testing utility.
//
// `ui2-perio-settings.spec.ts` imports this as `makeBaseSettings` and wraps
// it with a thin local `makeSettings()`: its `perioRowVisibility`/
// `onPerioRowVisibility`/`perioIndexNameMode`/`onPerioIndexNameMode` fields
// wire the real `getPerioRowVisibility`/`setPerioRowVisibility`/
// `getPerioIndexNameMode`/`setPerioIndexNameMode` engine seams instead of
// this file's stubbed defaults (describe 1 in that spec is a real-engine
// test) — everything else comes straight from this base.
import { vi } from "vitest";
import type { SettingsState } from "../settings-modal.component";
import type { PerioRowId } from "../../../core/odontogram";

const PERIO_ROW_IDS: readonly PerioRowId[] = [
  "plaque", "bop", "cal", "gm", "pd", "furcation", "mobility", "cej",
  "rootConcavity", "pi", "gi", "mpi", "mbi", "kg", "gt", "miller",
];

export function makeSettings(overrides: Partial<SettingsState> = {}): SettingsState {
  const perioRowVisibility = {} as Record<PerioRowId, boolean>;
  for (const id of PERIO_ROW_IDS) perioRowVisibility[id] = true;

  return {
    numbering: "FDI",
    onNumbering: vi.fn(),
    language: "en",
    onLanguage: vi.fn(),
    isDark: false,
    onToggleDark: vi.fn(),
    toothInfo: false,
    onToothInfo: vi.fn(),
    secondaryCariesMode: "standard",
    onSecondaryCariesMode: vi.fn(),
    icdas: false,
    onIcdas: vi.fn(),
    cariesDepth: false,
    onCariesDepth: vi.fn(),
    rootCariesMode: "simple",
    onRootCariesMode: vi.fn(),
    radiographicDepthMode: "off",
    onRadiographicDepthMode: vi.fn(),
    pulpLevel: "aae",
    onPulpLevel: vi.fn(),
    wearDetailLevel: "complex",
    onWearDetailLevel: vi.fn(),
    discolorationDetailLevel: "complex",
    onDiscolorationDetailLevel: vi.fn(),
    surfaceNotation: "full",
    onSurfaceNotation: vi.fn(),
    notes: false,
    onNotes: vi.fn(),
    showStatusCard: true,
    onShowStatusCard: vi.fn(),
    showOrthoCard: true,
    onShowOrthoCard: vi.fn(),
    perioViewMode: "toggle",
    onPerioViewMode: vi.fn(),
    perioRowVisibility,
    onPerioRowVisibility: vi.fn(),
    perioIndexNameMode: "translated",
    onPerioIndexNameMode: vi.fn(),
    ...overrides,
  };
}
