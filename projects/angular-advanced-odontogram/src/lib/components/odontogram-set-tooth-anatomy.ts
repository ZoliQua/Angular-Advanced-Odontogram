// DI seam around the core's async `setToothAnatomy()` — used ONLY by
// `OdontogramUiService.setToothAnatomy()`, so the Settings anatomy <select> can
// be re-asserted after a failed lazy chunk load.
//
// The core swallows a failed load of the measured artwork and returns without
// notifying; a spec substitutes this token to force that path, because
// `vi.mock()` is unavailable for relative specifiers under the Angular unit-test
// builder (same rationale as `odontogram-i18n-loader.ts`).
//
// This is a test seam, not API: like `ODONTOGRAM_I18N_LOADER` it lives in its
// own file that `public-api.ts` deliberately does NOT re-export.
import { InjectionToken } from "@angular/core";
import { setToothAnatomy, type ToothAnatomy } from "../core/odontogram";

export const ODONTOGRAM_SET_TOOTH_ANATOMY = new InjectionToken<(v: ToothAnatomy) => Promise<void>>(
  "ODONTOGRAM_SET_TOOTH_ANATOMY",
  { providedIn: "root", factory: () => setToothAnatomy },
);
