/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UBIJudgmentFields } from '../ubi_judgment_fields';
import moment from 'moment';

describe('UBIJudgmentFields', () => {
  const mockUpdateFormData = jest.fn();
  const defaultFormData = {
    clickModel: 'coec',
    maxRank: 10,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(
      <UBIJudgmentFields
        formData={defaultFormData}
        updateFormData={mockUpdateFormData}
        dateRangeError=""
      />
    );

    expect(screen.getByText('Click Model')).toBeInTheDocument();
    expect(screen.getByText('Max Rank')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
  });

  it('handles click model change', () => {
    render(
      <UBIJudgmentFields
        formData={defaultFormData}
        updateFormData={mockUpdateFormData}
        dateRangeError=""
      />
    );

    const selectElement = screen.getByDisplayValue('COEC');
    fireEvent.change(selectElement, { target: { value: 'coec' } });

    expect(mockUpdateFormData).toHaveBeenCalledWith({ clickModel: 'coec' });
  });

  it('handles max rank change', () => {
    render(
      <UBIJudgmentFields
        formData={defaultFormData}
        updateFormData={mockUpdateFormData}
        dateRangeError=""
      />
    );

    const numberInput = screen.getByDisplayValue('10');
    fireEvent.change(numberInput, { target: { value: '20' } });

    expect(mockUpdateFormData).toHaveBeenCalledWith({ maxRank: 20 });
  });

  it('displays date range error when provided', () => {
    const errorMessage = 'End date must be after start date';
    
    render(
      <UBIJudgmentFields
        formData={defaultFormData}
        updateFormData={mockUpdateFormData}
        dateRangeError={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('handles empty form data', () => {
    const emptyFormData = {
      clickModel: '',
      maxRank: 0,
      startDate: '',
      endDate: '',
    };

    render(
      <UBIJudgmentFields
        formData={emptyFormData}
        updateFormData={mockUpdateFormData}
        dateRangeError=""
      />
    );

    expect(screen.getByText('Click Model')).toBeInTheDocument();
    expect(screen.getByText('Max Rank')).toBeInTheDocument();
  });

  it('handles start date change', () => {
    render(
      <UBIJudgmentFields
        formData={defaultFormData}
        updateFormData={mockUpdateFormData}
        dateRangeError=""
      />
    );

    const startDatePicker = screen.getByDisplayValue('2023-01-01');
    fireEvent.change(startDatePicker, { target: { value: '2023-02-01' } });

    expect(mockUpdateFormData).toHaveBeenCalled();
  });

  it('handles end date change', () => {
    render(
      <UBIJudgmentFields
        formData={defaultFormData}
        updateFormData={mockUpdateFormData}
        dateRangeError=""
      />
    );

    const endDatePicker = screen.getByDisplayValue('2023-12-31');
    fireEvent.change(endDatePicker, { target: { value: '2023-11-30' } });

    expect(mockUpdateFormData).toHaveBeenCalled();
  });

  it('handles null date values', () => {
    const formDataWithNullDates = {
      clickModel: 'coec',
      maxRank: 10,
      startDate: null,
      endDate: null,
    };

    render(
      <UBIJudgmentFields
        formData={formDataWithNullDates}
        updateFormData={mockUpdateFormData}
        dateRangeError=""
      />
    );

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
  });
});
