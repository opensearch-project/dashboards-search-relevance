/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';

// Mock brace and its extensions for tests
// brace/ext/language_tools requires window.ace to be defined
const mockSetCompleters = jest.fn();
const mockLangTools = {
    setCompleters: mockSetCompleters,
};
(window as any).ace = {
    acequire: jest.fn().mockReturnValue(mockLangTools),
    require: jest.fn().mockReturnValue(mockLangTools),
};
// Expose the mock for tests to access
(window as any).__mockSetCompleters = mockSetCompleters;

configure({ testIdAttribute: 'data-test-subj' });

window.URL.createObjectURL = () => '';
HTMLCanvasElement.prototype.getContext = () => '';
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
