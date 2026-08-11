// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrollIntoView; stub it so code paths that call it
// (e.g. the intro tour) do not crash during tests.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
