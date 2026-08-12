// Angular port of $ENGINE@934a911:src/surfaces/ToothInfoSurface.tsx (99 lines).
//
// Composable surface — the tooth-information panel
// (`@if (toothInfoOn && summary) { <section class="tooth-info card"> }`).
// Presentational: reads the summary from `OdontogramUiService` and renders
// nothing when the Tooth-info panel is off or there is no summary yet
// (mirrors the source component returning `null`).
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { I18nService } from "../../i18n/i18n.service";
import { OdontogramUiService } from "../odontogram-ui.service";
import { formatToothLabel } from "../../core/odontogram";

@Component({
  selector: "aao-tooth-info-surface",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ui.toothInfoOn() && ui.summary(); as s) {
      <section class="tooth-info card" [attr.aria-label]="i18n.t('toothInfo.title')">
        <div class="card-title">{{ i18n.t('toothInfo.title') }}</div>
        <p class="tooth-info-overview">{{ s.overview }}</p>
        <!-- Grouped dentition table: one column per tooth category, one
             row per anatomical group (whole mouth / jaw / quadrant /
             sextant per the PDF summary-grouping setting). Tooth numbers
             are coloured by status (blue = has content, red+italic = has
             a problem). -->
        @if (s.toothTable.rows.length > 0) {
          <div class="tooth-info-table-wrap">
            <table class="tooth-info-table">
              <thead>
                <tr>
                  <th aria-hidden="true"></th>
                  @for (c of s.toothTable.columns; track c.key) {
                    <th scope="col">{{ c.label }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of s.toothTable.rows; track row.key) {
                  <tr>
                    <th scope="row">{{ row.label }}</th>
                    @for (c of s.toothTable.columns; track c.key) {
                      <td>
                        @for (cell of row.cells[c.key] ?? []; track cell.toothNo; let last = $last) {
                          <span [class]="'tooth-cell tooth-cell-' + cell.status">{{ cell.label }}{{ last ? '' : ', ' }}</span>
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
            <p class="tooth-info-table-legend">{{ s.toothTable.legend }}</p>
          </div>
        }
        @if (s.individualNotes; as notes) {
          <div id="toothInfoNotes" class="tooth-info-notes">
            <span class="tooth-info-heading">{{ notes.heading }}:</span>
            @for (n of notes.items; track $index) {
              <p class="tooth-info-note-item">{{ n }}</p>
            }
          </div>
        }
        @for (sec of s.sections; track sec.key) {
          <p class="tooth-info-line">
            <span class="tooth-info-heading">{{ sec.heading }}:</span>
            @if (sec.items.length) {
              {{ sec.items.join(', ') }}
            } @else {&ngsp;<span class="tooth-info-empty">{{ sec.emptyText }}</span>
            }
          </p>
        }
        @if (s.plannedChanges && s.plannedChanges.length > 0) {
          <div id="plannedChangesBox" class="planned-changes">
            <div class="tooth-info-heading">{{ i18n.t('toothInfo.plannedChanges') }}</div>
            @for (c of s.plannedChanges; track c.toothNo + '-' + c.axis) {
              <p class="planned-changes-item">
                {{ formatToothLabel(c.toothNo) }}: {{ i18n.t('planChange.axis.' + c.axis) }} {{ c.from }} → {{ c.to }}
              </p>
            }
          </div>
        }
        @if (s.implants; as implants) {
          <p class="tooth-info-line">
            <span class="tooth-info-heading">{{ implants.heading }}:</span>
            {{ implants.text }}
          </p>
        }
        <p class="tooth-info-line">
          <span class="tooth-info-heading">{{ s.periodontalTitle }}:</span>
          {{ s.periodontalText }}
        </p>
      </section>
    }
  `,
})
export class ToothInfoSurfaceComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly ui = inject(OdontogramUiService);
  protected readonly formatToothLabel = formatToothLabel;
}
