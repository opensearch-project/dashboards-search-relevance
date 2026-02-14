/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UBIJudgmentFields } from '../components/ubi_judgment_fields';
import moment from 'moment';

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

  it('should render UBI fields', () => {
    render(<UBIJudgmentFields {...defaultProps} />);

    expect(screen.getByText('Click Model')).toBeInTheDocument();
    expect(screen.getByText('Max Rank')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('UBI Events Index (Optional)')).toBeInTheDocument();
  });

  it('should call updateFormData when click model changes', () => {
    const mockUpdateFormData = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdateFormData} />);

    fireEvent.change(screen.getByDisplayValue('COEC'), { target: { value: 'coec' } });
    expect(mockUpdateFormData).toHaveBeenCalledWith({ clickModel: 'coec' });
  });

  it('should call updateFormData when max rank changes', () => {
    const mockUpdateFormData = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdateFormData} />);

    const maxRankInput = screen.getByDisplayValue('20');
    fireEvent.change(maxRankInput, { target: { value: '30' } });
    expect(mockUpdateFormData).toHaveBeenCalledWith({ maxRank: 30 });
  });

  it('should display current values', () => {
    render(<UBIJudgmentFields {...defaultProps} />);

    expect(screen.getByDisplayValue('COEC')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2023-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2023-01-31')).toBeInTheDocument();
  });

  it('should render with null start date', () => {
    const props = {
      ...defaultProps,
      formData: { ...defaultProps.formData, startDate: '' },
    };
    render(<UBIJudgmentFields {...props} />);

    expect(screen.getByText('Start Date')).toBeInTheDocument();
  });

  it('should render with null end date', () => {
    const props = {
      ...defaultProps,
      formData: { ...defaultProps.formData, endDate: '' },
    };
    render(<UBIJudgmentFields {...props} />);

    expect(screen.getByText('End Date')).toBeInTheDocument();
  });

  it('should display date range error when provided', () => {
    const dateRangeError = 'End date must be after start date';
    render(<UBIJudgmentFields {...defaultProps} dateRangeError={dateRangeError} />);

    expect(screen.getByText(dateRangeError)).toBeInTheDocument();
  });

  it('should not display error when dateRangeError is undefined', () => {
    render(<UBIJudgmentFields {...defaultProps} />);
    // The "End Date" help text should be there but no error
    expect(screen.getByText(/The date until which/)).toBeInTheDocument();
  });

  it('should render with selected ubiEventsIndex', () => {
    const props = {
      ...defaultProps,
      formData: { ...defaultProps.formData, ubiEventsIndex: 'ubi_events_index_1' },
    };
    render(<UBIJudgmentFields {...props} />);

    expect(screen.getByText('ubi_events_index_1')).toBeInTheDocument();
  });

  it('should call updateFormData when combobox selection changes', () => {
    const mockUpdateFormData = jest.fn();
    const props = {
      ...defaultProps,
      formData: { ...defaultProps.formData, ubiEventsIndex: 'ubi_events_index_1' },
      updateFormData: mockUpdateFormData,
    };
    render(<UBIJudgmentFields {...props} />);

    // Click the clear button to clear the selection
    const clearButtons = screen.getAllByLabelText('Clear input');
    if (clearButtons.length > 0) {
      fireEvent.click(clearButtons[clearButtons.length - 1]);
      expect(mockUpdateFormData).toHaveBeenCalledWith({ ubiEventsIndex: '' });
    }
  });

  it('should show loading state for index options', () => {
    const props = {
      ...defaultProps,
      isLoadingIndexes: true,
    };
    render(<UBIJudgmentFields {...props} />);

    expect(screen.getByText('UBI Events Index (Optional)')).toBeInTheDocument();
  });
});