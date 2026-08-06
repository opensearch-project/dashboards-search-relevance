/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-test-subj' });

window.URL.createObjectURL = () => '';
HTMLCanvasElement.prototype.getContext = () => '';

// jest-location-mock uses process.env.HOST as the base URL for its window.location mock.
// Set it to match testEnvironmentOptions.url so window.location.origin is 'http://localhost:5601'.
process.env.HOST = 'http://localhost:5601';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
window.IntersectionObserver = class IntersectionObserver {
  constructor() {}

  disconnect() {
    return null;
  }

  observe() {
    return null;
  }

  takeRecords() {
    return null;
  }

  unobserve() {
    return null;
  }
};

jest.mock('@elastic/eui/lib/components/form/form_row/make_id', () => () => 'random-id');

jest.mock('@elastic/eui/lib/services/accessibility/html_id_generator', () => ({
  htmlIdGenerator: () => {
    return () => 'random_html_id';
  },
}));

jest.setTimeout(30000);

// jsdom 26 marks window.localStorage and window.sessionStorage as non-configurable.
// Re-declare them as configurable once here so individual tests can override them
// with Object.defineProperty without hitting "Cannot redefine property" errors.
['localStorage', 'sessionStorage'].forEach((key) => {
  const descriptor = Object.getOwnPropertyDescriptor(window, key);
  if (descriptor && !descriptor.configurable) {
    Object.defineProperty(window, key, {
      configurable: true,
      writable: true,
      value: descriptor.value,
    });
  }
});
