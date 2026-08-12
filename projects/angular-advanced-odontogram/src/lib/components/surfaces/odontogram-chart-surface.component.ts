// Angular port of $ENGINE@934a911:src/surfaces/OdontogramChartSurface.tsx (109 lines).
//
// Composable surface — the `<section class="chart">` region (chart header,
// Status|Plan toggle, chart actions, and the `#toothGrid` mount node the
// engine wires imperatively). Presentational: reads everything from
// `OdontogramUiService` and holds no state of its own.
//
// DOM-mount-strategy deviation: the pinned source unmounts `#chartModeToggle`
// entirely when `planModeAvailable` is false (Composable-UI Tier 2 made
// `rewireControls()` safe to re-run on remount, so the toggle "can remount
// cleanly instead of being hidden with a CSS class"). This port keeps the
// pre-resync shell's `.hidden`-class strategy instead — `#chartModeToggle`
// stays mounted, matching the still-current
// `odontogram-shell.component.spec.ts` assertion that toggling
// `planModeAvailable` flips the `.hidden` class rather than unmounting the
// node. The `rewireControls()` effect below is still transcribed (reacting
// to `planModeAvailable`), so re-enabling this to genuinely unmount later is
// a template-only change. See the Task 2 report for the full rationale.
import { ChangeDetectionStrategy, Component, effect, inject } from "@angular/core";
import { I18nService } from "../../i18n/i18n.service";
import { OdontogramUiService } from "../odontogram-ui.service";
import { rebuildGrid, rewireControls } from "../../core/odontogram";
import {
  icon8Svg,
  iconGumSvg,
  iconNoSelectionUrl,
  iconOcclSvg,
  iconPulpSvg,
} from "../../core/generated/icon-svgs";

/** Parse a `#rgb`/`#rrggbb` hex colour to a CSS `"r,g,b"` channel string for
 *  `rgba(var(--odon-select-rgb), α)`. Falls back to the blue default on a
 *  malformed value. Duplicated from the pin's own module-level copy (same
 *  duplication precedent as other free-function transcriptions in this port). */
function hexToRgbCss(hex: string): string {
  let h = (hex || "").replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (h.length !== 6 || !Number.isFinite(n)) return "59,123,255";
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

@Component({
  selector: "aao-odontogram-chart-surface",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="chart">
      <div class="chart-header">
        <div>
          <div class="chart-title">{{ i18n.t('chart.title') }}</div>
          <div class="chart-hint">{{ i18n.t('chart.hint') }}</div>
        </div>
        <!-- The Status|Plan toggle is hidden when plan mode is turned off in
             Settings -> Odontogram. Hidden via CSS (not unmounted) so
             odontogram.ts's one-time click wiring on these buttons survives
             being toggled off and back on. -->
        <div id="chartModeToggle" class="chart-mode-toggle" [class.hidden]="!ui.planModeAvailable()" role="tablist">
          <button id="chartModeStatus" type="button" class="chart-mode-btn is-active" role="tab" aria-selected="true">{{ i18n.t('chartMode.status') }}</button>
          <button id="chartModePlan" type="button" class="chart-mode-btn" role="tab" aria-selected="false">{{ i18n.t('chartMode.plan') }}</button>
          <span id="chartModePlanBadge" class="plan-badge hidden">{{ i18n.t('chartMode.planBadge') }}</span>
        </div>
        <div id="proposedLegend" class="proposed-legend">
          <span class="proposed-legend-swatch" aria-hidden="true"></span>
          {{ i18n.t('chart.proposedLegend') }}
        </div>
        <div class="chart-actions">
          <button id="btnOcclView" class="btn btn-toggle btn-icon" aria-pressed="true" [attr.title]="i18n.t('chart.actions.occlusal')" [attr.aria-label]="i18n.t('chart.actions.occlusal')" [attr.data-icon-src]="iconOcclSvg" data-xline="1"></button>
          <button id="btnWisdomVisible" class="btn btn-toggle btn-icon" aria-pressed="true" [attr.title]="i18n.t('chart.actions.wisdom')" [attr.aria-label]="i18n.t('chart.actions.wisdom')" [attr.data-icon-src]="icon8Svg" data-xline="1"></button>
          <button id="btnBoneVisible" class="btn btn-toggle btn-icon" aria-pressed="true" [attr.title]="i18n.t('chart.actions.bone')" [attr.aria-label]="i18n.t('chart.actions.bone')" [attr.data-icon-src]="iconGumSvg" data-xline="1"></button>
          <button id="btnPulpVisible" class="btn btn-toggle btn-icon" aria-pressed="true" [attr.title]="i18n.t('chart.actions.pulp')" [attr.aria-label]="i18n.t('chart.actions.pulp')" [attr.data-icon-src]="iconPulpSvg" data-xline="1"></button>
          <button id="btnSelectNoneChart" class="btn btn-ghost btn-icon" [attr.title]="i18n.t('chart.actions.clearSelection')" [attr.aria-label]="i18n.t('chart.actions.clearSelection')">
            <img class="icon-img" [src]="iconNoSelectionUrl" alt="" aria-hidden="true" />
          </button>
        </div>
      </div>
      <!-- data-anatomy is emitted ONLY for the measured profile so the
           classic shell-DOM golden stays byte-identical (classic renders no
           data-anatomy attribute at all). The measured CSS keys off it. -->
      <div
        id="toothGrid"
        class="tooth-grid"
        dir="ltr"
        [attr.data-screen-spacing]="ui.screenSpacing()"
        [attr.data-tooth-num]="ui.screenNumberSize()"
        [attr.data-anatomy]="ui.toothAnatomy() === 'measured' ? 'measured' : null"
        [style.--odon-select-rgb]="hexToRgbCss(ui.selectionColor())"
        [style.--odon-select-border-style]="ui.selectionBorderStyle()"
        [attr.aria-label]="i18n.t('chart.aria.toothGrid')"
      ></div>
    </section>
  `,
})
export class OdontogramChartSurfaceComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly ui = inject(OdontogramUiService);
  protected readonly hexToRgbCss = hexToRgbCss;
  protected readonly iconOcclSvg = iconOcclSvg;
  protected readonly icon8Svg = icon8Svg;
  protected readonly iconGumSvg = iconGumSvg;
  protected readonly iconPulpSvg = iconPulpSvg;
  protected readonly iconNoSelectionUrl = iconNoSelectionUrl;

  constructor() {
    // Re-wire the chart-header controls whenever this surface (re)mounts,
    // and also when `planModeAvailable` flips — no-op before init; acts
    // only on later remounts / toggles (OdontogramChartSurface.tsx 44-48).
    effect(() => {
      this.ui.planModeAvailable();
      rewireControls();
    });
    // Rebuild the SVG grid whenever the chart column (re)mounts — no-op
    // before init (OdontogramChartSurface.tsx 49-51).
    void rebuildGrid();
  }
}
