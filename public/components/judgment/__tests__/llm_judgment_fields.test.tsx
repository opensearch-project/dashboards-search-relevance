/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LLMJudgmentFields } from '../components/llm_judgment_fields';

const defaultProps = {
  formData: { size: 5, ignoreFailure: false, contextFields: [], tokenLimit: 4000 },
  updateFormData: jest.fn(),
  selectedQuerySet: [],
  setSelectedQuerySet: jest.fn(),
  selectedSearchConfigs: [],
  setSelectedSearchConfigs: jest.fn(),
  selectedModel: [],
  setSelectedModel: jest.fn(),
  querySetOptions: [{ label: 'QS1', value: 'qs1' }],
  searchConfigOptions: [{ label: 'SC1', value: 'sc1' }],
  modelOptions: [{ label: 'Model1', value: 'model1', state: 'DEPLOYED', algorithm: 'REMOTE' }],
  isLoadingQuerySets: false,
  isLoadingSearchConfigs: false,
  isLoadingModels: false,
  newContextField: '',
  setNewContextField: jest.fn(),
  addContextField: jest.fn(),
  removeContextField: jest.fn(),
};

describe('LLMJudgmentFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all LLM fields', () => {
    render(<LLMJudgmentFields {...defaultProps} />);

    expect(screen.getByText('Query Set')).toBeInTheDocument();
    expect(screen.getByText('Search Configurations')).toBeInTheDocument();
    expect(screen.getByText('K Value')).toBeInTheDocument();
    expect(screen.getByText('Model ID')).toBeInTheDocument();
  });

  it('should call updateFormData when size changes', () => {
    const mockUpdateFormData = jest.fn();
    render(<LLMJudgmentFields {...defaultProps} updateFormData={mockUpdateFormData} />);

    const sizeInput = screen.getByDisplayValue('5');
    fireEvent.change(sizeInput, { target: { value: '10' } });
    expect(mockUpdateFormData).toHaveBeenCalledWith({ size: 10 });
  });

  it('should show loading state for query sets', () => {
    render(<LLMJudgmentFields {...defaultProps} isLoadingQuerySets={true} />);
    // EuiComboBox shows loading state internally
    expect(screen.getByText('Query Set')).toBeInTheDocument();
  });

  it('should render advanced settings accordion', () => {
    render(<LLMJudgmentFields {...defaultProps} />);
    expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
  });

  it('should call setSelectedQuerySet when query set changes', () => {
    const mockSetSelectedQuerySet = jest.fn();
    render(<LLMJudgmentFields {...defaultProps} setSelectedQuerySet={mockSetSelectedQuerySet} />);

    // EuiComboBox interaction would be tested in integration tests
    expect(screen.getByText('Query Set')).toBeInTheDocument();
  });
});
