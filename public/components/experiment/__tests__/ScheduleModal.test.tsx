/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScheduleModal } from '../views/ScheduleModal';

describe('ScheduleModal', () => {
  const defaultProps = {
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    itemName: 'Test Experiment',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal correctly', () => {
    render(<ScheduleModal {...defaultProps} />);
    expect(screen.getByText('Schedule Experiment to Run Periodically')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows an error when submitting an empty cron expression', () => {
    render(<ScheduleModal {...defaultProps} />);
    const submitButton = screen.getByText('Schedule Experiment to Run');
    
    fireEvent.click(submitButton);

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Cron expression is required.')).toBeInTheDocument();
  });

  it('shows an error when submitting a cron expression with only whitespaces', () => {
    render(<ScheduleModal {...defaultProps} />);
    const input = screen.getByPlaceholderText('To run every morning at 1:00 AM use (0 1 * * *)');
    const submitButton = screen.getByText('Schedule Experiment to Run');
    
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(submitButton);

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Cron expression is required.')).toBeInTheDocument();
  });

  it('calls onSubmit with the cron expression and clears error when valid', () => {
    render(<ScheduleModal {...defaultProps} />);
    const input = screen.getByPlaceholderText('To run every morning at 1:00 AM use (0 1 * * *)');
    const submitButton = screen.getByText('Schedule Experiment to Run');
    
    // Trigger error first
    fireEvent.click(submitButton);
    expect(screen.getByText('Cron expression is required.')).toBeInTheDocument();

    // Fill with valid input
    fireEvent.change(input, { target: { value: '0 1 * * *' } });
    
    // Error should be cleared on change
    expect(screen.queryByText('Cron expression is required.')).not.toBeInTheDocument();
    
    // Submit
    fireEvent.click(submitButton);
    expect(defaultProps.onSubmit).toHaveBeenCalledWith('0 1 * * *');
  });
});
