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
  EuiDatePicker: ({ selected, onChange, dateFormat = 'YYYY-MM-DD', ...rest }: any) => (
    <input
      data-testid="date-picker"
      type="text"
      value={selected ? selected.format(dateFormat) : ''}
      onChange={(e) => {
        // In a real implementation, this would convert the string to a moment object
        // For testing, we just need to simulate the onChange event
        onChange(e.target.value);
      }}
      {...rest}
    />
  ),
}));