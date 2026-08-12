// Angular port of $ENGINE@934a911:src/App.tsx (276 lines) — Composable-UI
// resync (1.2.0). App.tsx is now a THIN composition: it mounts
// `OdontogramProvider` (all state/effects/handlers) and lays out the four
// surface components + the shell-managed perio bits and modals in the
// default arrangement. This component is that composition root: it provides
// `OdontogramUiService` (per shell instance, via its own `providers` array —
// the Angular equivalent of one `<OdontogramProvider>` per mounted `<App/>`),
// threads its own `input()`s/`output()`s into the service via `configure()`,
// and renders the topbar surface + the shell-managed layout (perio
// launch-bar, chart column, dental-chart column, right panel, popup perio
// chart, and the four modals) exactly as `ShellLayout` does in the pin.
//
// Every id transcribed from App.tsx's chart/panel/topbar ranges is asserted
// by odontogram-shell.component.spec.ts's DOM-contract inventory; the four
// surfaces now own most of that markup directly (see
// `surfaces/*.component.ts`), so this file's own template is the thinner
// "shell-managed layout" slice: `.perio-launch-bar`, `.chart-column`/
// `.dental-chart-column` wrappers, `<aside class="panel">`, the popup
// `<aao-perio-chart>`, and the four modals.
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import {
  acceptDualStateConfirm,
  cancelDualStateConfirm,
  closePerioOverlay,
  openPerioOverlay,
  type PulpDetailLevel,
  type RadiographicDepthMode,
  type RootCariesMode,
  type SecondaryCariesMode,
  type SurfaceNotation,
  type ToothDetailLevel,
} from "../../core/odontogram";
import type { OdontogramThemeConfig } from "../../core/theme";
import type { OdontogramPlugin } from "../../core/plugin";
import type { NumberingSystem } from "../../core/utils/numbering";
import type { Language } from "../../core/i18n/translations";
import { OdontogramUiService } from "../odontogram-ui.service";
import { I18nService } from "../../i18n/i18n.service";
import { DualStateConfirmComponent } from "../dual-state-confirm/dual-state-confirm.component";
import {
  SettingsModalComponent,
  type FillingComplexity,
} from "../settings-modal/settings-modal.component";
import { ExportOptionsModalComponent } from "../export-options-modal/export-options-modal.component";
import { PerioChartComponent } from "../perio-chart/perio-chart.component";
import { PerioSidebarComponent } from "../perio-sidebar/perio-sidebar.component";
import { OdontogramTopbarComponent } from "../surfaces/odontogram-topbar.component";
import { OdontogramChartSurfaceComponent } from "../surfaces/odontogram-chart-surface.component";
import { ToothInfoSurfaceComponent } from "../surfaces/tooth-info-surface.component";
import { ToothControlsSurfaceComponent } from "../surfaces/tooth-controls-surface.component";

// Re-exported for the many existing specs that import this token from this
// module (`from "./odontogram-shell.component"` / `"../odontogram-shell.component"`)
// — the token itself now lives in `odontogram-engine-lifecycle.ts` so both
// this component and `OdontogramUiService` (which now owns the injection —
// see that file's header comment) can import it without a circular
// module dependency between the two.
export { ODONTOGRAM_ENGINE_LIFECYCLE } from "../odontogram-engine-lifecycle";

@Component({
  selector: "aao-odontogram-shell",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OdontogramUiService],
  imports: [
    OdontogramTopbarComponent,
    OdontogramChartSurfaceComponent,
    ToothInfoSurfaceComponent,
    ToothControlsSurfaceComponent,
    DualStateConfirmComponent,
    SettingsModalComponent,
    ExportOptionsModalComponent,
    PerioChartComponent,
    PerioSidebarComponent,
  ],
  template: `
    <div class="odontogram-root" #root [attr.dir]="ui.isRtl() ? 'rtl' : 'ltr'" [attr.lang]="ui.lang()">
      <aao-odontogram-topbar />
      <main class="layout">
        <!-- Hide the perio entry point (view toggle / open button) entirely
             when the Periodontal chart is turned off in Settings. -->
        <div class="perio-launch-bar" [class.hidden]="!ui.perioChartAvailable()">
          @if (ui.viewMode() === 'toggle') {
            <div id="appViewToggle" class="chart-mode-toggle" role="tablist">
              <button
                id="appViewOdontogram"
                type="button"
                [class]="'chart-mode-btn' + (ui.activeView() === 'odontogram' ? ' is-active' : '')"
                role="tab"
                [attr.aria-selected]="ui.activeView() === 'odontogram'"
                (click)="ui.setActiveView('odontogram')"
              >{{ i18n.t('view.odontogram') }}</button>
              <button
                id="appViewDentalChart"
                type="button"
                [class]="'chart-mode-btn' + (ui.activeView() === 'dentalChart' ? ' is-active' : '')"
                role="tab"
                [attr.aria-selected]="ui.activeView() === 'dentalChart'"
                (click)="ui.setActiveView('dentalChart')"
              >{{ i18n.t('view.dentalChart') }}</button>
            </div>
          } @else {
            <button
              type="button"
              id="openPerioOverlayBtn"
              class="btn btn-ghost"
              (click)="openPerioOverlay()"
              [attr.title]="i18n.t('perio.open')"
              [attr.aria-label]="i18n.t('perio.open')"
            >{{ i18n.t('perio.open') }}</button>
          }
        </div>
        <!-- Hide (not unmount) the odontogram column while the Dental Chart
             segment is active in toggle mode, so its wired controls
             survive — see odontogram-ui.service.ts's DOM-mount-strategy
             header note. -->
        <div class="chart-column" [style.display]="ui.isPerioView() ? 'none' : null">
          <aao-odontogram-chart-surface />
          <aao-tooth-info-surface />
        </div>
        @if (ui.isPerioView()) {
          <div class="dental-chart-column" dir="ltr">
            <aao-perio-chart [inline]="true" />
          </div>
        }
        <aside class="panel">
          <!-- One region, two contents: the perio-context sidebar in the
               perio view, the odontogram control panel otherwise (which
               stays mounted, CSS-hidden — see the DOM-mount-strategy note
               above). -->
          @if (ui.isPerioView()) {
            <aao-perio-sidebar />
          }
          <aao-tooth-controls-surface />
        </aside>
      </main>

      @if (ui.viewMode() === 'popup') {
        <aao-perio-chart [open]="ui.perioOpen()" (closeChart)="closePerioOverlay()" />
      }

      <aao-settings-modal
        [open]="ui.settingsOpen()"
        [settings]="ui.settingsState()"
        (close)="ui.setSettingsOpen(false)"
      />

      <aao-dual-state-confirm
        [open]="ui.confirmOpen()"
        (accept)="acceptDualStateConfirm()"
        (cancel)="cancelDualStateConfirm()"
      />

      <aao-export-options-modal [open]="ui.pdfOpen()" (close)="ui.setPdfOpen(false)" />

      <!-- Credits ("About and credits") modal: Task 4's scope. ui.creditsOpen
           is already wired (the topbar's #btnCreditsMenu button opens it) —
           nothing renders here yet. -->
    </div>
  `,
})
export class OdontogramShellComponent implements AfterViewInit, OnDestroy {
  protected readonly ui = inject(OdontogramUiService);

  private readonly rootRef = viewChild<ElementRef<HTMLElement>>("root");

  // Inputs (React prop parity — names match App.tsx's AppProps /
  // OdontogramProviderProps).
  readonly language = input<Language>();
  readonly numberingSystem = input<NumberingSystem>();
  readonly darkMode = input<boolean>();
  readonly themeConfig = input<OdontogramThemeConfig>();
  readonly plugins = input<OdontogramPlugin[]>();
  readonly readOnly = input<boolean>();
  readonly enableNotes = input<boolean>();
  readonly enableIcdas = input<boolean>();
  readonly pulpDetailLevel = input<PulpDetailLevel>();
  readonly secondaryCariesMode = input<SecondaryCariesMode>();
  readonly rootCariesMode = input<RootCariesMode>();
  readonly radiographicDepthMode = input<RadiographicDepthMode>();
  readonly cariesDepthEnabled = input<boolean>();
  readonly wearDetailLevel = input<ToothDetailLevel>();
  readonly discolorationDetailLevel = input<ToothDetailLevel>();
  readonly surfaceNotation = input<SurfaceNotation>();
  readonly showStatusCard = input<boolean>();
  readonly showOrthoCard = input<boolean>();
  // 1.2.0 resync: fillings controlled props (OdontogramProviderProps
  // 217-263) — DEFINED-GATED sync + prop-driven-restore semantics live in
  // OdontogramUiService.configure(); the four `on*Change` callbacks below
  // are called ONLY from the Settings-modal handlers in `settingsState`,
  // never for a prop-driven restore.
  readonly fillingComplexity = input<FillingComplexity>();
  readonly fillingDefectEnabled = input<boolean>();
  readonly fillingMaterialAvailability = input<Record<string, boolean>>();
  readonly fissureSealingEnabled = input<boolean>();

  readonly languageChange = output<Language>();
  readonly numberingChange = output<NumberingSystem>();
  readonly darkModeChange = output<boolean>();
  readonly fillingComplexityChange = output<FillingComplexity>();
  readonly fillingDefectEnabledChange = output<boolean>();
  // Per-material callback (OdontogramProviderProps.onFillingMaterialAvailabilityChange
  // is `(material: string, enabled: boolean) => void`); Angular `output()`
  // emits one value, so this emits the pair as an object.
  readonly fillingMaterialAvailabilityChange = output<{ material: string; enabled: boolean }>();
  readonly fissureSealingEnabledChange = output<boolean>();

  // Free engine functions the template invokes directly (App.tsx's ShellLayout
  // imports these the same way) — exposed as instance fields so the inline
  // template can call them as bare identifiers.
  protected readonly openPerioOverlay = openPerioOverlay;
  protected readonly closePerioOverlay = closePerioOverlay;
  protected readonly acceptDualStateConfirm = acceptDualStateConfirm;
  protected readonly cancelDualStateConfirm = cancelDualStateConfirm;

  // ShellLayout's own two remaining translated strings (the view-toggle
  // labels + the popup-open button) — same direct-injection convention every
  // other component in this port uses (see e.g. PerioSidebarComponent).
  protected readonly i18n = inject(I18nService);

  constructor() {
    this.ui.configure({
      language: this.language,
      onLanguageChange: (v) => this.languageChange.emit(v),
      numberingSystem: this.numberingSystem,
      onNumberingChange: (v) => this.numberingChange.emit(v),
      darkMode: this.darkMode,
      onDarkModeChange: (v) => this.darkModeChange.emit(v),
      themeConfig: this.themeConfig,
      themeRoot: computed(() => this.rootRef()?.nativeElement ?? null),
      plugins: this.plugins,
      readOnly: this.readOnly,
      enableNotes: this.enableNotes,
      enableIcdas: this.enableIcdas,
      pulpDetailLevel: this.pulpDetailLevel,
      secondaryCariesMode: this.secondaryCariesMode,
      rootCariesMode: this.rootCariesMode,
      radiographicDepthMode: this.radiographicDepthMode,
      cariesDepthEnabled: this.cariesDepthEnabled,
      wearDetailLevel: this.wearDetailLevel,
      discolorationDetailLevel: this.discolorationDetailLevel,
      surfaceNotation: this.surfaceNotation,
      showStatusCard: this.showStatusCard,
      showOrthoCard: this.showOrthoCard,
      fillingComplexity: this.fillingComplexity,
      onFillingComplexityChange: (v) => this.fillingComplexityChange.emit(v),
      fillingDefectEnabled: this.fillingDefectEnabled,
      onFillingDefectEnabledChange: (v) => this.fillingDefectEnabledChange.emit(v),
      fillingMaterialAvailability: this.fillingMaterialAvailability,
      onFillingMaterialAvailabilityChange: (material, enabled) =>
        this.fillingMaterialAvailabilityChange.emit({ material, enabled }),
      fissureSealingEnabled: this.fissureSealingEnabled,
      onFissureSealingEnabledChange: (v) => this.fissureSealingEnabledChange.emit(v),
    });
  }

  ngAfterViewInit(): void {
    // App.tsx/OdontogramContext.tsx: fire-and-forget, exactly like the
    // untouched React effect — the engine's own init is async but not
    // awaited here either. Must run after the whole child tree (all four
    // surfaces) has rendered, so `wireControls()` finds every `#id` — see
    // odontogram-ui.service.ts's header comment for why this can't move
    // into the service's own constructor.
    this.ui.init();
  }

  ngOnDestroy(): void {
    this.ui.destroy();
  }
}
