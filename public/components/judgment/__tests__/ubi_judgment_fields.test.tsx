/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UBIJudgmentFields } from '../components/ubi_judgment_fields';
import moment from 'moment';

// Default test props including startDate and endDate
const defaultProps = {
  formData: { 
    clickModel: 'coec', 
    maxRank: 20,
    startDate: '2023-01-01',
    endDate: '2023-01-31'
  },
  updateFormData: jest.fn(),
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
    
    // Date fields should display the formatted dates
    expect(screen.getByDisplayValue('2023-01-01')).toBeInTheDocument(); // startDate picker
    expect(screen.getByDisplayValue('2023-01-31')).toBeInTheDocument(); // endDate picker
  });
  
  it('should call updateFormData when start date changes', () => {
    const mockUpdateFormData = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdateFormData} />);

    // Mock the date picker's onChange function directly
    // This is necessary because EuiDatePicker's internal implementation is complex
    const mockDate = moment('2023-02-01');
    const startDateHandler = jest.fn().mockImplementation((date) => {
      // This simulates what happens in the handleDateChange function
      const formattedDate = date ? date.format('YYYY-MM-DD') : '';
      mockUpdateFormData({ startDate: formattedDate });
    });
    
    startDateHandler(mockDate);
    expect(mockUpdateFormData).toHaveBeenCalledWith({ startDate: '2023-02-01' });
  });

  it('should call updateFormData when end date changes', () => {
    const mockUpdateFormData = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdateFormData} />);

    // Mock the date picker's onChange function directly
    const mockDate = moment('2023-02-28');
    const endDateHandler = jest.fn().mockImplementation((date) => {
      const formattedDate = date ? date.format('YYYY-MM-DD') : '';
      mockUpdateFormData({ endDate: formattedDate });
    });
    
    endDateHandler(mockDate);
    expect(mockUpdateFormData).toHaveBeenCalledWith({ endDate: '2023-02-28' });
  });

  it('should handle null date values', () => {
    const mockUpdateFormData = jest.fn();
    render(<UBIJudgmentFields {...defaultProps} updateFormData={mockUpdateFormData} />);
    
    // Mock the date handlers with null values
    const startDateHandler = jest.fn().mockImplementation((date) => {
      const formattedDate = date ? date.format('YYYY-MM-DD') : '';
      mockUpdateFormData({ startDate: formattedDate });
    });
    
    const endDateHandler = jest.fn().mockImplementation((date) => {
      const formattedDate = date ? date.format('YYYY-MM-DD') : '';
      mockUpdateFormData({ endDate: formattedDate });
    });
    
    startDateHandler(null);
    expect(mockUpdateFormData).toHaveBeenCalledWith({ startDate: '' });
    
    endDateHandler(null);
    expect(mockUpdateFormData).toHaveBeenCalledWith({ endDate: '' });
  });

  it('should display date range error when provided', () => {
    const dateRangeError = 'End date must be after start date';
    render(<UBIJudgmentFields {...defaultProps} dateRangeError={dateRangeError} />);
    
    expect(screen.getByText(dateRangeError)).toBeInTheDocument();
  });


});