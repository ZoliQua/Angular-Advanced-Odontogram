// Angular port of $ENGINE/src/PerioSidebar.tsx (441 lines,
// v2.4.0 resync pin `f9b45fc`).
//
// Phase 4 Task 2: the whole-mouth summary bar + "Páciens adatok"
// case-metadata form + 2017 World Workshop periodontal classification block
// — three cards a caller mounts wherever the perio (Dental Chart) view needs
// them (OdontogramShellComponent, Task 5; PerioChartComponent's popup
// chrome, a later task). Reuses the EXACT same DOM ids/classes the source
// JSX has, so every existing id-based test (and any host CSS targeting
// them) keeps resolving unchanged.
//
// Self-contained (TSX 135-150): owns its own summary/caseMeta/classification
// state, refreshed via a single constructor `onStateChange` subscription —
// same self-contained pattern as ExportOptionsModalComponent
// (export-options-modal.component.ts's constructor effect), minus that
// component's `open()` gate: PerioSidebar has no inputs at all and
// subscribes unconditionally on construction, mirroring the TSX's
// `useEffect(() => { ...; return onStateChange(...); }, [])` (empty deps —
// subscribe once, for the component's whole lifetime).
//
// readOnly semantics (TSX 155): the TSX reads `getReadOnly()` DIRECTLY at
// render time, not through React state — so it picks up a same-tick
// `setReadOnly()` call on literally the next render, whatever triggers it.
// `setReadOnly()` itself does NOT call the engine's internal
// `notifyStateChange()` (verified by reading core/odontogram.ts's
// `setReadOnly` — it only toggles DOM classes/tabindex, no listener fan-out),
// so there is no dedicated "readOnly changed" signal to hook. Angular's
// OnPush/zoneless templates only re-run when a signal they read changes, so
// a literal "read fresh every render" isn't reachable here — the closest
// mirror is to fold `readOnly` into the SAME onStateChange-driven refresh as
// `summary`/`caseMeta`/`classification`: it updates whenever anything else
// in the engine notifies (which is what actually drives a re-render in this
// component), same as a plain TSX render captures whatever `getReadOnly()`
// happens to return at that moment. A `setReadOnly()` call that isn't
// followed (or preceded, same tick) by some other notifying mutation will
// not, by itself, repaint this component's disabled states until the next
// unrelated notify — a real (documented) behavior difference from the TSX,
// which always repaints instantly. `getPerioIndexNameMode()` (drives the
// summary card's translated<->canonical labels, TSX 175-182) has the exact
// same "read fresh on render" shape in the TSX, but does NOT need this same
// treatment: `setPerioIndexNameMode()` DOES call `notifyStateChange()` (see
// odontogram.ts), so every label helper below simply re-reads it live each
// time the template re-evaluates (itself triggered by the very same notify)
// — no separate signal required.
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from "@angular/core";
import { I18nService } from "../../i18n/i18n.service";
import {
  formatToothLabel,
  getCaseMeta,
  getPerioClassification,
  getPerioIndexNameMode,
  getPerioSummary,
  getReadOnly,
  onStateChange,
  setCaseAge,
  setCigarettesPerDay,
  setDiabetesStatus,
  setDiagnosisOverride,
  setExamDate,
  setExtentOverride,
  setGradeOverride,
  setHba1c,
  setMaxRblPercent,
  setPatientName,
  setSmokingStatus,
  setStageOverride,
  setToothLossPerio,
} from "../../core/odontogram";
import { indexName } from "../../core/perioIndexNames";

type PerioSummaryData = ReturnType<typeof getPerioSummary>;
const EMPTY_SUMMARY: PerioSummaryData = {
  chartedSites: 0,
  bleedingSites: 0,
  bopPercent: 0,
  worstCal: null,
  worstCalTooth: null,
  maxPd: null,
  avgPd: null,
  avgCal: null,
  maxFurcation: null,
  plaquePercent: 0,
  piScore: null,
  giScore: null,
  kgDeficientTeeth: 0,
  gtDistribution: { thin: 0, medium: 0, thick: 0 },
  millerDistribution: { i: 0, ii: 0, iii: 0, iv: 0 },
  mpiScore: null,
  mbiScore: null,
};

type CaseMetaData = ReturnType<typeof getCaseMeta>;
const EMPTY_CASE_META: CaseMetaData = {
  age: null,
  smokingStatus: "unknown",
  cigarettesPerDay: null,
  diabetesStatus: "unknown",
  hba1c: null,
  toothLossPerio: null,
  maxRblPercent: null,
  diagnosisOverride: null,
  stageOverride: null,
  gradeOverride: null,
  extentOverride: null,
  patientName: null,
  // PerioSidebar itself has no DOB UI (that lives on ExportOptionsModal's
  // own "case-meta-row" — see that component's `#exportOptionsPatientDob`
  // input); this literal just needs to satisfy CaseMetaData's shape,
  // mirroring the pinned TSX's own EMPTY_CASE_META (PerioSidebar.tsx 84).
  patientDob: null,
  examDate: null,
};

type ClassificationData = ReturnType<typeof getPerioClassification>;
const EMPTY_CLASSIFICATION: ClassificationData = {
  diagnosis: "health",
  stage: "na",
  grade: "indeterminate",
  extent: "na",
  derived: {
    diagnosis: "health",
    stage: "na",
    grade: "indeterminate",
    extent: "na",
    buckets: { smoking: "A", diabetes: "A", direct: null },
  },
  overridden: { diagnosis: false, stage: false, grade: false, extent: false },
};

// Glickman furcation grade -> Roman-numeral face, mirrors TSX's own
// `FURCATION_ROMAN` (same duplication precedent as PerioChart.tsx's own
// UPPER_ARCH/LOWER_ARCH vs. odontogram.ts's ALL_TEETH).
const FURCATION_ROMAN = ["–", "I", "II", "III", "IV"];

@Component({
  selector: "aao-perio-sidebar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel-body">
      <div class="perio-summary-card">
        <div class="perio-summary-card-title">{{ i18n.t('perio.summary.title') }}</div>
        <div class="perio-fullgrid-summary" role="status">
          <span class="perio-fullgrid-summary-item">
            <span class="perio-fullgrid-summary-label">{{ avgPdLabel() }}</span>
            <span class="perio-fullgrid-summary-value" id="perio-fg-summary-avgpd">{{ summary().avgPd === null ? '–' : summary().avgPd }}</span>
          </span>
          <span class="perio-fullgrid-summary-item">
            <span class="perio-fullgrid-summary-label">{{ avgCalLabel() }}</span>
            <span class="perio-fullgrid-summary-value" id="perio-fg-summary-avgcal">{{ summary().avgCal === null ? '–' : summary().avgCal }}</span>
          </span>
          <span class="perio-fullgrid-summary-item">
            <span class="perio-fullgrid-summary-label">{{ bopSummaryLabel() }}</span>
            <span class="perio-fullgrid-summary-value" id="perio-fg-summary-bop">{{ summary().bopPercent }}%</span>
          </span>
          <span class="perio-fullgrid-summary-item">
            <span class="perio-fullgrid-summary-label">{{ i18n.t('perio.summary.charted') }}</span>
            <span class="perio-fullgrid-summary-value" id="perio-fg-summary-charted">{{ summary().chartedSites }}</span>
          </span>
          <span class="perio-fullgrid-summary-item">
            <span class="perio-fullgrid-summary-label">{{ worstCalLabel() }}</span>
            <span class="perio-fullgrid-summary-value" id="perio-fg-summary-cal">{{ worstCalText() }}</span>
          </span>
          <span class="perio-fullgrid-summary-item">
            <span class="perio-fullgrid-summary-label">{{ maxPdLabel() }}</span>
            <span class="perio-fullgrid-summary-value" id="perio-fg-summary-maxpd">{{ summary().maxPd === null ? '–' : summary().maxPd }}</span>
          </span>
          <span class="perio-fullgrid-summary-item">
            <span class="perio-fullgrid-summary-label">{{ maxFurcationLabel() }}</span>
            <span class="perio-fullgrid-summary-value" id="perio-fg-summary-maxfurc">{{ summary().maxFurcation === null ? '–' : furcationRoman(summary().maxFurcation!) }}</span>
          </span>
          <span class="perio-fullgrid-summary-item">
            <span class="perio-fullgrid-summary-label">{{ plaquePercentLabel() }}</span>
            <span class="perio-fullgrid-summary-value" id="perio-fg-summary-plaque">{{ summary().plaquePercent }}%</span>
          </span>
        </div>
      </div>
      <details id="caseMetaPanel" class="case-meta-panel" open>
        <summary class="case-meta-panel-title">{{ i18n.t('case.panelTitle') }}</summary>
        <div class="case-meta-panel-body">
          <div class="case-meta-row">
            <label class="case-meta-row-label" for="caseMetaPatientName">{{ i18n.t('case.patientName') }}</label>
            <input
              id="caseMetaPatientName"
              class="case-meta-input"
              type="text"
              [disabled]="readOnly()"
              [value]="caseMeta().patientName ?? ''"
              (input)="onPatientNameInput($event)"
            />
          </div>
          <div class="case-meta-row">
            <label class="case-meta-row-label" for="caseMetaExamDate">{{ i18n.t('case.examDate') }}</label>
            <input
              id="caseMetaExamDate"
              class="case-meta-input"
              type="date"
              [disabled]="readOnly()"
              [value]="caseMeta().examDate ?? ''"
              (input)="onExamDateInput($event)"
            />
          </div>
          <div class="case-meta-row">
            <label class="case-meta-row-label" for="caseMetaAge">{{ i18n.t('case.age') }}</label>
            <input
              id="caseMetaAge"
              class="case-meta-input case-meta-input-narrow"
              type="number"
              min="0"
              max="120"
              [disabled]="readOnly()"
              [value]="caseMeta().age ?? ''"
              (input)="onAgeInput($event)"
            />
          </div>
          <div class="case-meta-row">
            <label class="case-meta-row-label" for="caseMetaSmoking">{{ i18n.t('case.smoking.label') }}</label>
            <select
              id="caseMetaSmoking"
              class="odon-settings-select case-meta-select"
              [disabled]="readOnly()"
              [value]="caseMeta().smokingStatus"
              (change)="onSmokingChange($event)"
            >
              <option value="unknown">{{ i18n.t('case.smoking.unknown') }}</option>
              <option value="never">{{ i18n.t('case.smoking.never') }}</option>
              <option value="former">{{ i18n.t('case.smoking.former') }}</option>
              <option value="current">{{ i18n.t('case.smoking.current') }}</option>
            </select>
          </div>
          <div class="case-meta-row" [class.case-meta-row-disabled]="cigsDisabled()">
            <label class="case-meta-row-label" for="caseMetaCigarettesPerDay">{{ i18n.t('case.cigarettesPerDay') }}</label>
            <input
              id="caseMetaCigarettesPerDay"
              class="case-meta-input case-meta-input-narrow"
              type="number"
              min="0"
              max="99"
              [disabled]="readOnly() || cigsDisabled()"
              [value]="caseMeta().cigarettesPerDay ?? ''"
              (input)="onCigarettesPerDayInput($event)"
            />
          </div>
          <div class="case-meta-row">
            <label class="case-meta-row-label" for="caseMetaDiabetes">{{ i18n.t('case.diabetes.label') }}</label>
            <select
              id="caseMetaDiabetes"
              class="odon-settings-select case-meta-select"
              [disabled]="readOnly()"
              [value]="caseMeta().diabetesStatus"
              (change)="onDiabetesChange($event)"
            >
              <option value="unknown">{{ i18n.t('case.diabetes.unknown') }}</option>
              <option value="none">{{ i18n.t('case.diabetes.none') }}</option>
              <option value="present">{{ i18n.t('case.diabetes.present') }}</option>
            </select>
          </div>
          <div class="case-meta-row" [class.case-meta-row-disabled]="hba1cDisabled()">
            <label class="case-meta-row-label" for="caseMetaHba1c">{{ i18n.t('case.hba1c') }}</label>
            <input
              id="caseMetaHba1c"
              class="case-meta-input case-meta-input-narrow"
              type="number"
              min="3"
              max="20"
              step="0.1"
              [disabled]="readOnly() || hba1cDisabled()"
              [value]="caseMeta().hba1c ?? ''"
              (input)="onHba1cInput($event)"
            />
          </div>
          <div class="case-meta-row">
            <label class="case-meta-row-label" for="caseMetaRbl">{{ i18n.t('case.rbl') }}</label>
            <input
              id="caseMetaRbl"
              class="case-meta-input case-meta-input-narrow"
              type="number"
              min="0"
              max="100"
              [disabled]="readOnly()"
              [value]="caseMeta().maxRblPercent ?? ''"
              (input)="onMaxRblPercentInput($event)"
            />
          </div>
          <div class="case-meta-row">
            <label class="case-meta-row-label" for="caseMetaToothLoss">{{ i18n.t('case.toothLoss') }}</label>
            <input
              id="caseMetaToothLoss"
              class="case-meta-input case-meta-input-narrow"
              type="number"
              min="0"
              max="32"
              [disabled]="readOnly()"
              [value]="caseMeta().toothLossPerio ?? ''"
              (input)="onToothLossPerioInput($event)"
            />
          </div>
          <div class="case-meta-panel-subheading">{{ i18n.t('perio.class.title') }}</div>
          <div class="perio-class-row">
            <label class="perio-class-row-label" for="perioClassDiagnosisOverride">{{ i18n.t('perio.class.diagnosis') }}</label>
            <div class="perio-class-derived" id="perioClassDiagnosisDerived">{{ diagnosisLabel(classification().derived.diagnosis) }}</div>
            <select
              id="perioClassDiagnosisOverride"
              class="odon-settings-select case-meta-select"
              [disabled]="readOnly()"
              [value]="caseMeta().diagnosisOverride ?? ''"
              (change)="onDiagnosisOverrideChange($event)"
            >
              <option value="">{{ i18n.t('perio.class.useDerived', { value: diagnosisLabel(classification().derived.diagnosis) }) }}</option>
              <option value="health">{{ i18n.t('perio.class.dx.health') }}</option>
              <option value="gingivitis">{{ i18n.t('perio.class.dx.gingivitis') }}</option>
              <option value="periodontitis">{{ i18n.t('perio.class.dx.periodontitis') }}</option>
            </select>
          </div>
          <div class="perio-class-row">
            <label class="perio-class-row-label" for="perioClassStageOverride">{{ i18n.t('perio.class.stage') }}</label>
            <div class="perio-class-derived" id="perioClassStageDerived">{{ stageLabel(classification().derived.stage) }}</div>
            <select
              id="perioClassStageOverride"
              class="odon-settings-select case-meta-select"
              [disabled]="readOnly()"
              [value]="caseMeta().stageOverride ?? ''"
              (change)="onStageOverrideChange($event)"
            >
              <option value="">{{ i18n.t('perio.class.useDerived', { value: stageLabel(classification().derived.stage) }) }}</option>
              <option value="I">{{ i18n.t('perio.class.stage.I') }}</option>
              <option value="II">{{ i18n.t('perio.class.stage.II') }}</option>
              <option value="III">{{ i18n.t('perio.class.stage.III') }}</option>
              <option value="IV">{{ i18n.t('perio.class.stage.IV') }}</option>
            </select>
          </div>
          <div class="perio-class-row">
            <label class="perio-class-row-label" for="perioClassGradeOverride">{{ i18n.t('perio.class.grade') }}</label>
            <div class="perio-class-derived" id="perioClassGradeDerived">{{ gradeLabel(classification().derived.grade) }}</div>
            <select
              id="perioClassGradeOverride"
              class="odon-settings-select case-meta-select"
              [disabled]="readOnly()"
              [value]="caseMeta().gradeOverride ?? ''"
              (change)="onGradeOverrideChange($event)"
            >
              <option value="">{{ i18n.t('perio.class.useDerived', { value: gradeLabel(classification().derived.grade) }) }}</option>
              <option value="A">{{ i18n.t('perio.class.grade.A') }}</option>
              <option value="B">{{ i18n.t('perio.class.grade.B') }}</option>
              <option value="C">{{ i18n.t('perio.class.grade.C') }}</option>
            </select>
          </div>
          <div class="perio-class-row">
            <label class="perio-class-row-label" for="perioClassExtentOverride">{{ i18n.t('perio.class.extent') }}</label>
            <div class="perio-class-derived" id="perioClassExtentDerived">{{ extentLabel(classification().derived.extent) }}</div>
            <select
              id="perioClassExtentOverride"
              class="odon-settings-select case-meta-select"
              [disabled]="readOnly()"
              [value]="caseMeta().extentOverride ?? ''"
              (change)="onExtentOverrideChange($event)"
            >
              <option value="">{{ i18n.t('perio.class.useDerived', { value: extentLabel(classification().derived.extent) }) }}</option>
              <option value="localized">{{ i18n.t('perio.class.extent.localized') }}</option>
              <option value="generalized">{{ i18n.t('perio.class.extent.generalized') }}</option>
              <option value="molar-incisor">{{ i18n.t('perio.class.extent.molarIncisor') }}</option>
            </select>
          </div>
        </div>
      </details>
    </div>
  `,
})
export class PerioSidebarComponent {
  protected readonly i18n = inject(I18nService);

  protected readonly summary = signal<PerioSummaryData>(EMPTY_SUMMARY);
  protected readonly caseMeta = signal<CaseMetaData>(EMPTY_CASE_META);
  protected readonly classification = signal<ClassificationData>(EMPTY_CLASSIFICATION);
  // See the file-level doc comment above for why this is folded into the
  // same onStateChange-driven refresh as the three signals above, rather
  // than read fresh on every template evaluation the way the TSX does.
  protected readonly readOnly = signal(getReadOnly());

  constructor() {
    // Mirrors TSX 140-150's `useEffect(() => { ...; return onStateChange(...); }, [])`
    // — subscribe exactly once, for the component's whole lifetime (this
    // effect reads no signal of its own, so it never reruns).
    this.summary.set(getPerioSummary());
    this.caseMeta.set(getCaseMeta());
    this.classification.set(getPerioClassification());
    this.readOnly.set(getReadOnly());

    effect((onCleanup) => {
      onCleanup(
        onStateChange(() => {
          this.summary.set(getPerioSummary());
          this.caseMeta.set(getCaseMeta());
          this.classification.set(getPerioClassification());
          this.readOnly.set(getReadOnly());
        }),
      );
    });
  }

  protected furcationRoman(grade: number): string {
    return FURCATION_ROMAN[grade];
  }

  protected worstCalText(): string {
    const s = this.summary();
    if (s.worstCal === null) return "–";
    return `${s.worstCal}${s.worstCalTooth !== null ? ` (${formatToothLabel(s.worstCalTooth)})` : ""}`;
  }

  protected cigsDisabled(): boolean {
    return this.caseMeta().smokingStatus !== "current";
  }

  protected hba1cDisabled(): boolean {
    return this.caseMeta().diabetesStatus !== "present";
  }

  // UI-2 Task 3 (TSX 165-182): the summary items that name a specific index
  // (PD/CAL/BOP/Furcation/Plaque) compose their label from the qualifier
  // (Avg/Worst/Max/%) + `indexName(...)`, so canonical mode swaps in the
  // fixed English/Latin index name instead of the localized string. Read
  // fresh on every call (not cached in a signal) — `setPerioIndexNameMode()`
  // DOES notify, so the enclosing template re-evaluation this runs inside is
  // already triggered by the same mechanism; see the file-level doc comment.
  private canonicalNames(): boolean {
    return getPerioIndexNameMode() === "canonical";
  }

  protected avgPdLabel(): string {
    return this.canonicalNames() ? `Avg ${indexName("pd")}` : this.i18n.t("perio.summary.avgPd");
  }

  protected avgCalLabel(): string {
    return this.canonicalNames() ? `Avg ${indexName("cal")}` : this.i18n.t("perio.summary.avgCal");
  }

  protected bopSummaryLabel(): string {
    return this.canonicalNames() ? `${indexName("bop")}%` : this.i18n.t("perio.bopPercent");
  }

  protected worstCalLabel(): string {
    return this.canonicalNames() ? `Worst ${indexName("cal")}` : this.i18n.t("perio.summary.worstCal");
  }

  protected maxPdLabel(): string {
    return this.canonicalNames() ? `Max ${indexName("pd")}` : this.i18n.t("perio.summary.maxPd");
  }

  protected maxFurcationLabel(): string {
    return this.canonicalNames() ? `Max ${indexName("furcation")}` : this.i18n.t("perio.summary.maxFurcation");
  }

  protected plaquePercentLabel(): string {
    return this.canonicalNames() ? `${indexName("plaque")}%` : this.i18n.t("plaque.percent");
  }

  // P4b Task 4: per-axis derived-value label helpers, mirrors TSX's own
  // identically-named free functions exactly (115-133).
  protected diagnosisLabel(v: string): string {
    return this.i18n.t(`perio.class.dx.${v}`);
  }

  protected stageLabel(v: string): string {
    if (v === "na") return this.i18n.t("perio.class.stage.na");
    if (v === "indeterminate") return this.i18n.t("perio.class.stage.indeterminate");
    return this.i18n.t(`perio.class.stage.${v}`);
  }

  protected gradeLabel(v: string): string {
    if (v === "indeterminate") return this.i18n.t("perio.class.grade.indeterminate");
    return this.i18n.t(`perio.class.grade.${v}`);
  }

  protected extentLabel(v: string): string {
    if (v === "na") return this.i18n.t("perio.class.extent.na");
    if (v === "molar-incisor") return this.i18n.t("perio.class.extent.molarIncisor");
    return this.i18n.t(`perio.class.extent.${v}`);
  }

  protected onPatientNameInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    setPatientName(v === "" ? null : v);
  }

  protected onExamDateInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    setExamDate(v === "" ? null : v);
  }

  protected onAgeInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    setCaseAge(v === "" ? null : Number(v));
  }

  protected onSmokingChange(e: Event): void {
    setSmokingStatus((e.target as HTMLSelectElement).value);
  }

  protected onCigarettesPerDayInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    setCigarettesPerDay(v === "" ? null : Number(v));
  }

  protected onDiabetesChange(e: Event): void {
    setDiabetesStatus((e.target as HTMLSelectElement).value);
  }

  protected onHba1cInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    setHba1c(v === "" ? null : Number(v));
  }

  protected onMaxRblPercentInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    setMaxRblPercent(v === "" ? null : Number(v));
  }

  protected onToothLossPerioInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    setToothLossPerio(v === "" ? null : Number(v));
  }

  protected onDiagnosisOverrideChange(e: Event): void {
    const v = (e.target as HTMLSelectElement).value;
    setDiagnosisOverride(v === "" ? null : v);
  }

  protected onStageOverrideChange(e: Event): void {
    const v = (e.target as HTMLSelectElement).value;
    setStageOverride(v === "" ? null : v);
  }

  protected onGradeOverrideChange(e: Event): void {
    const v = (e.target as HTMLSelectElement).value;
    setGradeOverride(v === "" ? null : v);
  }

  protected onExtentOverrideChange(e: Event): void {
    const v = (e.target as HTMLSelectElement).value;
    setExtentOverride(v === "" ? null : v);
  }
}
