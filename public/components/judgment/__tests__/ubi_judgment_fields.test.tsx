/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UBIJudgmentFields } from '../components/ubi_judgment_fields';
import moment from 'moment';

// Capture EUI component props so we can invoke callbacks directly.
// Using require() inside jest.mock factory because jest hoists mock calls above imports.
// Using data-test-subj instead of data-testid since OSD configures testing-library to use data-test-subj.
jest.mock('@elastic/eui', () => {
  const actual = jest.requireActual('@elastic/eui');
  const mockReact = require('react');
  const mockMoment = require('moment');
  return {
    ...actual,
    EuiDatePicker: (props: any) => {
      return mockReact.createElement('div', null,
        mockReact.createElement('input', {
          value: props.selected ? props.selected.format(props.dateFormat || 'YYYY-MM-DD') : '',
          readOnly: true,
        }),
        mockReact.createElement('button', {
          'data-test-subj': 'datepicker-set',
          onClick: () => props.onChange && props.onChange(mockMoment('2024-06-15')),
        }, 'Set Date'),
        mockReact.createElement('button', {
          'data-test-subj': 'datepicker-clear',
          onClick: () => props.onChange && props.onChange(null),
        }, 'Clear Date')
      );
    },
    EuiComboBox: (props: any) => {
      const children = [
        ...(props.selectedOptions || []).map((opt: any) =>
          mockReact.createElement('span', { key: opt.label, 'data-test-subj': 'selected-option' }, opt.label)
        ),
        mockReact.createElement('button', {
          key: 'select',
          'data-test-subj': 'combobox-select',
          onClick: () => props.onChange && props.onChange([{ label: 'ubi_events_index_1', value: 'uuid-1' }]),
        }, 'Select'),
        mockReact.createElement('button', {
          key: 'clear',
          'data-test-subj': 'combobox-clear',
          onClick: () => props.onChange && props.onChange([]),
        }, 'Clear'),
        mockReact.createElement('button', {
          key: 'create',
          'data-test-subj': 'combobox-create',
          onClick: () => props.onCreateOption && props.onCreateOption('custom_index'),
        }, 'Create'),
        mockReact.createElement('button', {
          key: 'create-empty',
          'data-test-subj': 'combobox-create-empty',
          onClick: () => props.onCreateOption && props.onCreateOption('   '),
        }, 'Create Empty'),
      ];
      if (props.isLoading) {
        children.push(
          mockReact.createElement('span', { key: 'loading', 'data-test-subj': 'combobox-loading' }, 'Loading...')
        );
      }
      return mockReact.createElement('div', { 'data-test-subj': 'combobox' }, ...children);
    },
  };
});

const defaultProps = {
  formData: {
    clickModel: 'coec',
    maxRank: 20,
    startDate: '2023-01-01',
    endDate: '2023-01-31',
    ubiEventsIndex: '',
  },
  updateFormData: jest.fn(),
  indexOptions: [
    { label: 'ubi_events_index_1', value: 'uuid-1' },
    { label: 'ubi_events_index_2', value: 'uuid-2' },
  ],
  isLoadingIndexes: false,
};

describe('UBIJudgmentFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<UBIJudgmentFields {...defaultProps} />);

    expect(screen.getByText('Click Model')).toBeInTheDocument();
    expect(screen.getByText('Max Rank')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('UBI Events Index (Optional)')).toBeInTheDocument();
  });

  it('calls updateFormData when click model changes', () => {
    const mockUpdate = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdate} />);

    fireEvent.change(screen.getByDisplayValue('COEC'), { target: { value: 'coec' } });
    expect(mockUpdate).toHaveBeenCalledWith({ clickModel: 'coec' });
  });

  it('calls updateFormData when max rank changes', () => {
    const mockUpdate = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdate} />);

    fireEvent.change(screen.getByDisplayValue('20'), { target: { value: '30' } });
    expect(mockUpdate).toHaveBeenCalledWith({ maxRank: 30 });
  });

  it('calls updateFormData with formatted date when start date is selected', () => {
    const mockUpdate = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdate} />);

    const setButtons = screen.getAllByText('Set Date');
    fireEvent.click(setButtons[0]);

    expect(mockUpdate).toHaveBeenCalledWith({ startDate: '2024-06-15' });
  });

  it('calls updateFormData with empty string when start date is cleared', () => {
    const mockUpdate = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdate} />);

    const clearButtons = screen.getAllByText('Clear Date');
    fireEvent.click(clearButtons[0]);

    expect(mockUpdate).toHaveBeenCalledWith({ startDate: '' });
  });

  it('calls updateFormData with formatted date when end date is selected', () => {
    const mockUpdate = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdate} />);

    const setButtons = screen.getAllByText('Set Date');
    fireEvent.click(setButtons[1]);

    expect(mockUpdate).toHaveBeenCalledWith({ endDate: '2024-06-15' });
  });

  it('calls updateFormData with empty string when end date is cleared', () => {
    const mockUpdate = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdate} />);

    const clearButtons = screen.getAllByText('Clear Date');
    fireEvent.click(clearButtons[1]);

    expect(mockUpdate).toHaveBeenCalledWith({ endDate: '' });
  });

  it('calls updateFormData when combobox selection is made', () => {
    const mockUpdate = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdate} />);

    fireEvent.click(screen.getByTestId('combobox-select'));

    expect(mockUpdate).toHaveBeenCalledWith({ ubiEventsIndex: 'ubi_events_index_1' });
  });

  it('calls updateFormData with empty string when combobox is cleared', () => {
    const mockUpdate = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdate} />);

    fireEvent.click(screen.getByTestId('combobox-clear'));

    expect(mockUpdate).toHaveBeenCalledWith({ ubiEventsIndex: '' });
  });

  it('calls updateFormData when custom option is created', () => {
    const mockUpdate = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdate} />);

    fireEvent.click(screen.getByTestId('combobox-create'));

    expect(mockUpdate).toHaveBeenCalledWith({ ubiEventsIndex: 'custom_index' });
  });

  it('does not call updateFormData when empty custom option is created', () => {
    const mockUpdate = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdate} />);

    fireEvent.click(screen.getByTestId('combobox-create-empty'));

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('renders with selected ubiEventsIndex', () => {
    const props = {
      ...defaultProps,
      formData: { ...defaultProps.formData, ubiEventsIndex: 'ubi_events_index_1' },
    };
    render(<UBIJudgmentFields {...props} />);

    expect(screen.getByTestId('selected-option')).toHaveTextContent('ubi_events_index_1');
  });

  it('displays date range error when provided', () => {
    render(
      <UBIJudgmentFields {...defaultProps} dateRangeError="End date must be after start date" />
    );

    expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
  });

  it('shows loading state for index options', () => {
    render(<UBIJudgmentFields {...defaultProps} isLoadingIndexes={true} />);

    expect(screen.getByTestId('combobox-loading')).toBeInTheDocument();
  });

  it('renders with empty dates', () => {
    const props = {
      ...defaultProps,
      formData: { ...defaultProps.formData, startDate: '', endDate: '' },
    };
    render(<UBIJudgmentFields {...props} />);

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
  });
});