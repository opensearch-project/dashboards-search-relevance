/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UBIJudgmentFields } from '../components/ubi_judgment_fields';

const defaultProps = {
  formData: { clickModel: 'coec', maxRank: 20 },
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
  });
});
