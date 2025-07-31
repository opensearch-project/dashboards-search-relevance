/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { JudgmentForm } from '../components/judgment_form';
import { JudgmentType } from '../types';

const defaultProps = {
  formData: {
    name: '',
    type: JudgmentType.LLM,
    ignoreFailure: false,
    contextFields: [],
    tokenLimit: 4000,
  },
  updateFormData: jest.fn(),
  nameError: '',
  selectedQuerySet: [],
  setSelectedQuerySet: jest.fn(),
  selectedSearchConfigs: [],
  setSelectedSearchConfigs: jest.fn(),
  selectedModel: [],
  setSelectedModel: jest.fn(),
  querySetOptions: [],
  searchConfigOptions: [],
  modelOptions: [],
  isLoadingQuerySets: false,
  isLoadingSearchConfigs: false,
  isLoadingModels: false,
  newContextField: '',
  setNewContextField: jest.fn(),
  addContextField: jest.fn(),
  removeContextField: jest.fn(),
};

describe('JudgmentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render name field', () => {
    render(<JudgmentForm {...defaultProps} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('should render type selector', () => {
    render(<JudgmentForm {...defaultProps} />);
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
  });

  it('should show name error when present', () => {
    render(<JudgmentForm {...defaultProps} nameError="Name is required" />);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('should call updateFormData when name changes', () => {
    const mockUpdateFormData = jest.fn();
    render(<JudgmentForm {...defaultProps} updateFormData={mockUpdateFormData} />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'test' } });
    expect(mockUpdateFormData).toHaveBeenCalledWith({ name: 'test' });
  });

  it('should call updateFormData when type changes', () => {
    const mockUpdateFormData = jest.fn();
    render(<JudgmentForm {...defaultProps} updateFormData={mockUpdateFormData} />);

    const typeSelect = screen.getByDisplayValue('Explicit (LLM Judge)');
    fireEvent.change(typeSelect, { target: { value: JudgmentType.UBI } });
    expect(mockUpdateFormData).toHaveBeenCalledWith({ type: JudgmentType.UBI });
  });

  it('should render LLM fields when type is LLM', () => {
    render(
      <JudgmentForm
        {...defaultProps}
        formData={{ ...defaultProps.formData, type: JudgmentType.LLM }}
      />
    );
    expect(screen.getByText('Query Set')).toBeInTheDocument();
  });

  it('should render UBI fields when type is UBI', () => {
    render(
      <JudgmentForm
        {...defaultProps}
        formData={{ ...defaultProps.formData, type: JudgmentType.UBI }}
      />
    );
    expect(screen.getByText('Click Model')).toBeInTheDocument();
  });
});
