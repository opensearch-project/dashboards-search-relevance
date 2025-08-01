/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// Suppress console warnings and errors during tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = () => {
    // Suppress all errors in tests
    return;
  };

  console.warn = () => {
    // Suppress all warnings in tests
    return;
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
