/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom';

// Mock EUI components that might cause issues in tests
jest.mock('@elastic/eui', () => ({
  ...jest.requireActual('@elastic/eui'),
  EuiComboBox: ({ onChange, selectedOptions, options, placeholder }: any) => (
    <select
      data-testid="combo-box"
      onChange={(e) => onChange([{ value: e.target.value, label: e.target.value }])}
      value={selectedOptions?.[0]?.value || ''}
    >
      <option value="">{placeholder}</option>
      {options?.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));