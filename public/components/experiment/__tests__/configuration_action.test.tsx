/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigurationActions } from '../configuration/configuration_action';

describe('ConfigurationActions', () => {
  const mockProps = {
    onBack: jest.fn(),
    onClose: jest.fn(),
    onNext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all action buttons', () => {
    render(<ConfigurationActions {...mockProps} />);

    expect(screen.getByText('Start Evaluation')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onBack when Cancel button is clicked', () => {
    render(<ConfigurationActions {...mockProps} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when Start Evaluation button is clicked', () => {
    render(<ConfigurationActions {...mockProps} />);

    fireEvent.click(screen.getByText('Start Evaluation'));
    expect(mockProps.onNext).toHaveBeenCalledTimes(1);
  });
});
