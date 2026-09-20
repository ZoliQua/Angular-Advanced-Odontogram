// Angular port of $ENGINE@934a911:src/surfaces/OdontogramTopbar.tsx (199 lines).
//
// Composable surface — the `<header class="topbar">` region. The header
// dropdown open flags (languageOpen/exportOpen/importOpen), their DOM refs,
// and the outside-click effect are strictly region-local UI state, so they
// live here rather than in `OdontogramUiService` — matching the source
// file's own header comment.
//
// 1.2.0 resync additions transcribed from the pin: the "About and credits"
// button (`#btnCreditsMenu`, opens the credits-open signal on
// `OdontogramUiService` — the modal itself is Task 4's scope) and the
// "View on GitHub" link (`#btnGithubLink`); the intro-tour button's icon
// swapped to the play glyph, freeing the old info-circle glyph for the new
// Credits button. `#btnSettingsMenu` also gained an explicit id in the pin
// (previously selector-only via `[aria-haspopup="dialog"]`).
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { I18nService } from "../../i18n/i18n.service";
import { OdontogramUiService } from "../odontogram-ui.service";
import { startIntroTour } from "../../core/tour";
import { setImportFormat } from "../../core/odontogram";
import type { Language } from "../../core/i18n/languages";
import { brandLogoUrl } from "../../core/generated/icon-svgs";

// OdontogramTopbar.tsx 20-33's LANGUAGE_OPTIONS, verbatim (order + labelKeys).
const LANGUAGE_OPTIONS: ReadonlyArray<{ value: Language; labelKey: string }> = [
  { value: "hu", labelKey: "language.hu" },
  { value: "en", labelKey: "language.en" },
  { value: "de", labelKey: "language.de" },
  { value: "es", labelKey: "language.es" },
  { value: "it", labelKey: "language.it" },
  { value: "sk", labelKey: "language.sk" },
  { value: "pl", labelKey: "language.pl" },
  { value: "ru", labelKey: "language.ru" },
  { value: "pt-br", labelKey: "language.pt-br" },
  { value: "zh", labelKey: "language.zh" },
  { value: "ar", labelKey: "language.ar" },
  { value: "fr", labelKey: "language.fr" },
];

@Component({
  selector: "aao-odontogram-topbar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="topbar">
      <div class="brand">
        <img class="brand-logo" [src]="brandLogoUrl" alt="" aria-hidden="true" />
        <div>
          <div class="title">{{ i18n.t('app.title') }}</div>
          <div class="subtitle">{{ i18n.t('app.subtitleLang') }} {{ i18n.t('app.subtitleNumbering.' + ui.currentNumbering()) }} {{ i18n.t(ui.isDark() ? 'app.subtitleMode.dark' : 'app.subtitleMode.light') }}</div>
        </div>
      </div>
      <div class="topbar-actions">
        <button class="btn-theme" (click)="startIntroTour()" [attr.title]="i18n.t('intro.start')" [attr.aria-label]="i18n.t('intro.start')">
          <!-- Play-in-circle: reads as "start the guided tour". -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M10 8.5v7l6-3.5-6-3.5z"/></svg>
        </button>
        <div id="languageMenu" class="topbar-group dropdown" #languageGroup>
          <button class="btn-theme" (click)="languageOpen.set(!languageOpen())" aria-haspopup="menu" [attr.aria-expanded]="languageOpen()" [attr.title]="i18n.t('language.label')" [attr.aria-label]="i18n.t('language.label')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>
          </button>
          @if (languageOpen()) {
            <div class="dropdown-menu" role="menu" [attr.aria-label]="i18n.t('language.label')">
              @for (opt of languageOptions; track opt.value) {
                <button
                  class="dropdown-item"
                  role="menuitemradio"
                  [attr.aria-checked]="ui.lang() === opt.value"
                  (click)="selectLanguage(opt.value)"
                >{{ i18n.t(opt.labelKey) }}</button>
              }
            </div>
          }
        </div>
        <button
          class="btn-theme"
          (click)="ui.toggleDark()"
          [attr.title]="ui.isDark() ? i18n.t('theme.light') : i18n.t('theme.dark')"
          [attr.aria-label]="ui.isDark() ? i18n.t('theme.light') : i18n.t('theme.dark')"
        >
          @if (ui.isDark()) {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
          } @else {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          }
        </button>
        <div class="topbar-group">
          <button id="btnSettingsMenu" class="btn-theme" (click)="ui.setSettingsOpen(true)" aria-haspopup="dialog" [attr.aria-expanded]="ui.settingsOpen()" [attr.title]="i18n.t('settings.title')" [attr.aria-label]="i18n.t('settings.title')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
        <!-- Hidden export buttons kept for host capture + wireControls wiring -->
        <button id="btnStatusExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('topbar.exportStatus') }}</button>
        <button id="btnStatusFhirExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('topbar.exportFhir') }}</button>
        <button id="btnStatusPngExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('topbar.exportPng') }}</button>
        <button id="btnStatusJpgExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('topbar.exportJpg') }}</button>
        <button id="btnStatusSvgExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('export.menu.svg') }}</button>
        <button id="btnPerioSvgExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('export.menu.perioSvg') }}</button>
        <button id="btnPerioPngExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('export.menu.perioPng') }}</button>
        <button id="btnPerioJpgExport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('export.menu.perioJpg') }}</button>
        <div class="topbar-group dropdown" #exportGroup>
          <button id="btnExportMenu" class="btn-theme" (click)="exportOpen.set(!exportOpen())" aria-haspopup="menu" [attr.aria-expanded]="exportOpen()" [attr.title]="i18n.t('topbar.export')" [attr.aria-label]="i18n.t('topbar.export')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          </button>
          @if (exportOpen()) {
            <div class="dropdown-menu" role="menu" [attr.aria-label]="i18n.t('topbar.export')">
              <button class="dropdown-item" role="menuitem" (click)="proxyClick('btnStatusExport'); exportOpen.set(false)">{{ i18n.t('export.menu.statusJson') }}</button>
              <button class="dropdown-item" role="menuitem" (click)="proxyClick('btnStatusFhirExport'); exportOpen.set(false)">{{ i18n.t('export.menu.fhir') }}</button>
              <!-- Image + PDF items gated by per-format availability
                   (General -> Export). Status/FHIR JSON export always stay. -->
              @if (ui.exportPngOn()) {
                <button class="dropdown-item" role="menuitem" (click)="proxyClick('btnStatusPngExport'); exportOpen.set(false)">{{ i18n.t('export.menu.png') }}</button>
              }
              @if (ui.exportJpgOn()) {
                <button class="dropdown-item" role="menuitem" (click)="proxyClick('btnStatusJpgExport'); exportOpen.set(false)">{{ i18n.t('export.menu.jpg') }}</button>
              }
              @if (ui.exportSvgOn()) {
                <button class="dropdown-item" role="menuitem" (click)="proxyClick('btnStatusSvgExport'); exportOpen.set(false)">{{ i18n.t('export.menu.svg') }}</button>
              }
              @if (ui.exportSvgOn()) {
                <button class="dropdown-item" role="menuitem" [disabled]="!ui.hasPerio()" (click)="proxyClick('btnPerioSvgExport'); exportOpen.set(false)">{{ i18n.t('export.menu.perioSvg') }}</button>
              }
              @if (ui.exportPngOn()) {
                <button class="dropdown-item" role="menuitem" [disabled]="!ui.hasPerio()" (click)="proxyClick('btnPerioPngExport'); exportOpen.set(false)">{{ i18n.t('export.menu.perioPng') }}</button>
              }
              @if (ui.exportJpgOn()) {
                <button class="dropdown-item" role="menuitem" [disabled]="!ui.hasPerio()" (click)="proxyClick('btnPerioJpgExport'); exportOpen.set(false)">{{ i18n.t('export.menu.perioJpg') }}</button>
              }
              @if (ui.exportPdfOn()) {
                <button class="dropdown-item" role="menuitem" (click)="exportOpen.set(false); ui.setPdfOpen(true)">{{ i18n.t('export.menu.pdf') }}</button>
              }
            </div>
          }
        </div>
        <button id="btnStatusImport" hidden aria-hidden="true" tabindex="-1">{{ i18n.t('topbar.importStatus') }}</button>
        <div class="topbar-group dropdown" #importGroup>
          <button id="btnImportMenu" class="btn-theme" (click)="importOpen.set(!importOpen())" aria-haspopup="menu" [attr.aria-expanded]="importOpen()" [attr.title]="i18n.t('topbar.import')" [attr.aria-label]="i18n.t('topbar.import')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 8l5-5 5 5M12 3v12"/></svg>
          </button>
          @if (importOpen()) {
            <div class="dropdown-menu" role="menu" [attr.aria-label]="i18n.t('topbar.import')">
              @if (ui.importStatusOn()) {
                <button class="dropdown-item" role="menuitem" (click)="importStatusJson()">{{ i18n.t('import.menu.statusJson') }}</button>
              }
              @if (ui.importFhirOn()) {
                <button class="dropdown-item" role="menuitem" (click)="importFhirJson()">{{ i18n.t('import.menu.fhir') }}</button>
              }
            </div>
          }
        </div>
        <!-- Hidden file picker backing both import menu items. -->
        <input id="statusImportInput" type="file" accept="application/json" hidden />
        <!-- Credits ("About and credits") popup -- right after Import. -->
        <div class="topbar-group">
          <button id="btnCreditsMenu" class="btn-theme" (click)="ui.setCreditsOpen(true)" aria-haspopup="dialog" [attr.title]="i18n.t('credits.title')" [attr.aria-label]="i18n.t('credits.title')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          </button>
        </div>
        <!-- Star / view on GitHub. -->
        <a id="btnGithubLink" class="btn-theme" href="https://github.com/ZoliQua/Angular-Advanced-Odontogram" target="_blank" rel="noopener noreferrer" [attr.title]="i18n.t('credits.github')" [attr.aria-label]="i18n.t('credits.github')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.575.106.785-.25.785-.556 0-.274-.01-1-.016-1.965-3.198.695-3.874-1.541-3.874-1.541-.523-1.33-1.278-1.684-1.278-1.684-1.045-.714.08-.7.08-.7 1.155.082 1.763 1.186 1.763 1.186 1.027 1.76 2.695 1.252 3.352.957.104-.744.402-1.252.732-1.54-2.553-.29-5.238-1.277-5.238-5.686 0-1.256.448-2.283 1.184-3.088-.12-.29-.513-1.46.112-3.045 0 0 .966-.31 3.166 1.18a11.02 11.02 0 0 1 2.88-.388c.977.004 1.96.132 2.88.388 2.198-1.49 3.163-1.18 3.163-1.18.626 1.585.233 2.755.114 3.045.737.805 1.183 1.832 1.183 3.088 0 4.42-2.69 5.393-5.25 5.677.413.357.78 1.06.78 2.137 0 1.543-.014 2.787-.014 3.166 0 .309.206.669.79.555A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/></svg>
        </a>
      </div>
    </header>
  `,
})
export class OdontogramTopbarComponent implements AfterViewInit, OnDestroy {
  protected readonly i18n = inject(I18nService);
  protected readonly ui = inject(OdontogramUiService);
  protected readonly brandLogoUrl = brandLogoUrl;
  protected readonly startIntroTour = startIntroTour;
  protected readonly languageOptions = LANGUAGE_OPTIONS;

  // Region-local UI state (OdontogramTopbar.tsx 56-61) — strictly this
  // surface's own, not part of OdontogramUiService.
  protected readonly languageOpen = signal(false);
  protected readonly exportOpen = signal(false);
  protected readonly importOpen = signal(false);
  private readonly languageGroupRef = viewChild<ElementRef<HTMLElement>>("languageGroup");
  private readonly exportGroupRef = viewChild<ElementRef<HTMLElement>>("exportGroup");
  private readonly importGroupRef = viewChild<ElementRef<HTMLElement>>("importGroup");

  // OdontogramTopbar.tsx 63-78: one `document` click listener closing the
  // three dropdowns when the click lands outside their wrapper element.
  private readonly documentClickHandler = (event: MouseEvent): void => {
    const target = event.target as Node;
    if (!this.languageGroupRef()?.nativeElement.contains(target)) {
      this.languageOpen.set(false);
    }
    if (!this.exportGroupRef()?.nativeElement.contains(target)) {
      this.exportOpen.set(false);
    }
    if (!this.importGroupRef()?.nativeElement.contains(target)) {
      this.importOpen.set(false);
    }
  };

  ngAfterViewInit(): void {
    document.addEventListener("click", this.documentClickHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener("click", this.documentClickHandler);
  }

  /** OdontogramTopbar.tsx 106-109: pick a language from the dropdown, then close it. */
  protected selectLanguage(next: Language): void {
    this.ui.setLang(next);
    this.languageOpen.set(false);
  }

  /** OdontogramTopbar.tsx's inline proxy-click pattern: the visible dropdown
   *  item clicks the matching hidden `#btnStatus*`/`#btnPerio*` button, which
   *  is the engine's own wireControls() capture target. */
  protected proxyClick(id: string): void {
    (document.getElementById(id) as HTMLButtonElement | null)?.click();
  }

  /** OdontogramTopbar.tsx 179: status-JSON import menu item. */
  protected importStatusJson(): void {
    setImportFormat("status");
    this.proxyClick("btnStatusImport");
    this.importOpen.set(false);
  }

  /** OdontogramTopbar.tsx 180: FHIR import menu item. */
  protected importFhirJson(): void {
    setImportFormat("fhir");
    this.proxyClick("btnStatusImport");
    this.importOpen.set(false);
  }
}
