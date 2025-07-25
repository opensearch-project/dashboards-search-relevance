/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { JudgmentCreate } from '../judgment_create';

const mockHttp = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
};

const mockNotifications = {
  toasts: {
    addDanger: jest.fn(),
    addSuccess: jest.fn(),
    addError: jest.fn(),
  },
};

const mockHistory = {
  push: jest.fn(),
};

jest.mock('../hooks/use_judgment_form', () => ({
  useJudgmentForm: () => ({
    formData: { name: '', type: 'LLM_JUDGMENT', ignoreFailure: false, contextFields: [] },
    updateFormData: jest.fn(),
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
    nameError: '',
    newContextField: '',
    setNewContextField: jest.fn(),
    addContextField: jest.fn(),
    removeContextField: jest.fn(),
    validateAndSubmit: jest.fn(),
  }),
}));

describe('JudgmentCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHttp.get.mockResolvedValue({ hits: { hits: [] } });
    mockHttp.post.mockResolvedValue({ hits: { hits: [] } });
  });

  it('should render correctly', () => {
    render(
      <JudgmentCreate http={mockHttp} notifications={mockNotifications} history={mockHistory} />
    );

    expect(screen.getByText('Judgment List')).toBeInTheDocument();
    expect(screen.getByText('Configure a new judgment list.')).toBeInTheDocument();
  });

  it('should handle cancel button click', () => {
    render(
      <JudgmentCreate http={mockHttp} notifications={mockNotifications} history={mockHistory} />
    );

    fireEvent.click(screen.getByTestId('cancelJudgmentButton'));
    expect(mockHistory.push).toHaveBeenCalledWith('/judgment');
  });

  it('should handle create button click', () => {
    const mockValidateAndSubmit = jest.fn((callback) => callback());

    const useJudgmentFormMock = jest.requireMock('../hooks/use_judgment_form');
    useJudgmentFormMock.useJudgmentForm = jest.fn(() => ({
      formData: { name: 'test', type: 'LLM_JUDGMENT', ignoreFailure: false, contextFields: [] },
      updateFormData: jest.fn(),
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
      nameError: '',
      newContextField: '',
      setNewContextField: jest.fn(),
      addContextField: jest.fn(),
      removeContextField: jest.fn(),
      validateAndSubmit: mockValidateAndSubmit,
    }));

    render(
      <JudgmentCreate http={mockHttp} notifications={mockNotifications} history={mockHistory} />
    );

    fireEvent.click(screen.getByTestId('createJudgmentButton'));
    expect(mockValidateAndSubmit).toHaveBeenCalled();
    expect(mockHistory.push).toHaveBeenCalledWith('/judgment');
  });
});
