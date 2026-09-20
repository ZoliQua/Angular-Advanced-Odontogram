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
import type { PerioRowId, PdfSettings } from "../../../core/odontogram";
import { DEFAULT_PDF_THEME } from "../../../core/perioPdf";

// v2.4.0 resync (Task 2): default PDF settings mirror, matching
// core/odontogram.ts's own module defaults (see `resetEngineStateForTest`'s
// `setPdfSettings` call in `lib/testing/reset-engine-state.ts`, kept in sync
// with this literal). v2.6.0 resync (Task 4): the module default changed
// from "John Doe"/"1980-01-01" to "" — the inherited PDF-identity bug fix
// (an empty case prints "not specified", never an invented name/DOB/age; see
// pdf-patient-identity.test.ts). Updated here to match.
const DEFAULT_PDF_SETTINGS: PdfSettings = {
  defaultName: "",
  defaultDob: "",
  showAge: true,
  dateFormat: "iso",
  colorTheme: DEFAULT_PDF_THEME,
  showBone: true,
  showHealthyPulp: true,
  toothSpacing: "medium",
  border: false,
  borderThickness: "medium",
  borderColor: "#000000",
  toothNumberSize: "normal",
  includeOdontogramText: true,
  includeOdontogramTable: true,
  perioToothSpacing: "medium",
  perioShowEmptyRows: false,
  perioLabelPlacement: "center",
  perioFontSize: "normal",
  includePerioTable: true,
  includePerioAbbrev: true,
  showDisclaimer: true,
  disclaimerText: "",
  showGenerator: true,
  summaryGrouping: "jaw",
};

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
    exportPng: true,
    onExportPng: vi.fn(),
    exportJpg: true,
    onExportJpg: vi.fn(),
    exportSvg: true,
    onExportSvg: vi.fn(),
    exportPdf: true,
    onExportPdf: vi.fn(),
    importStatus: true,
    onImportStatus: vi.fn(),
    importFhir: true,
    onImportFhir: vi.fn(),
    codingPack: "none",
    onDiagnosisCodingPack: vi.fn(),
    snomedEnabled: false,
    onSnomedEnabled: vi.fn(),
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
    selectionColor: "#3b7bff",
    onSelectionColor: vi.fn(),
    selectionBorderStyle: "dashed",
    onSelectionBorderStyle: vi.fn(),
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
    planModeAvailable: true,
    onPlanModeAvailable: vi.fn(),
    screenToothSpacing: "normal",
    onScreenToothSpacing: vi.fn(),
    screenToothNumberSize: "normal",
    onScreenToothNumberSize: vi.fn(),
    toothAnatomy: "classic",
    onToothAnatomy: vi.fn(),
    showStatusCard: true,
    onShowStatusCard: vi.fn(),
    showOrthoCard: true,
    onShowOrthoCard: vi.fn(),
    perioChartAvailable: true,
    onPerioChartAvailable: vi.fn(),
    perioViewMode: "toggle",
    onPerioViewMode: vi.fn(),
    perioRowVisibility,
    onPerioRowVisibility: vi.fn(),
    perioIndexNameMode: "translated",
    onPerioIndexNameMode: vi.fn(),
    fillingDefectEnabled: true,
    onFillingDefectEnabled: vi.fn(),
    fillingComplexity: "complex",
    onFillingComplexity: vi.fn(),
    fillingMaterials: { amalgam: true, composite: true, gic: true, temporary: true },
    onFillingMaterial: vi.fn(),
    fissureSealingEnabled: true,
    onFissureSealingEnabled: vi.fn(),
    pdfSettings: { ...DEFAULT_PDF_SETTINGS },
    onPdfSettings: vi.fn(),
    ...overrides,
  };
}
