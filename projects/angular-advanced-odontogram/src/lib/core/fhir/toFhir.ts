// Part of React Odontogram Modul - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { Bundle, OdontogramExportPayload, FhirExportOptions } from "./types";
import { buildFhirBundleFromRegistry } from "../registry/fhir";
import { appendPerioObservations, appendPerioCondition } from "./toFhirPerio";

/**
 * Convert a serialized odontogram payload into a FHIR R4 collection Bundle.
 * Pure: no DOM, no network. Tolerant of malformed input (never throws).
 *
 * SP-perio P1 Task 3: per-site periodontal probing (`ToothRecord.perio`)
 * does not fit the registry's one-field-per-tooth axis shape, so it is
 * appended by a bespoke builder (`appendPerioObservations`, toFhirPerio.ts)
 * AFTER the registry-driven per-tooth Observations below — a tooth with no
 * charted perio sites contributes nothing, so payloads without perio data
 * (including every existing parity fixture) are unaffected.
 *
 * SP-perio P4b Task 3: the engine's first FHIR Condition — the 2017 World
 * Workshop periodontitis/gingivitis diagnosis (ICD-10/BNO K05) — is appended
 * AFTER `appendPerioObservations` by `appendPerioCondition` (same file). A
 * payload whose final classification is "health" contributes nothing, so
 * every existing parity fixture (none of which derives a periodontal
 * diagnosis) is unaffected.
 */
export function buildFhirBundle(payload: OdontogramExportPayload, options: FhirExportOptions = {}): Bundle {
  const bundle = buildFhirBundleFromRegistry(payload, options);
  appendPerioObservations(bundle, payload, options);
  appendPerioCondition(bundle, payload, options);
  return bundle;
}
