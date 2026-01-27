/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptTemplateSettings } from '../prompt_template_settings';
import { usePromptTemplate } from '../../../hooks/use_prompt_template';
import { OutputSchema, SYSTEM_PROMPTS } from '../../../types/prompt_template_types';

jest.mock('../../../hooks/use_prompt_template');
const mockUsePromptTemplate = usePromptTemplate as jest.MockedFunction<typeof usePromptTemplate>;

// Mock child components to isolate PromptTemplateSettings testing
jest.mock('../prompt_panel', () => ({
  PromptPanel: (props: any) => <div data-testid="prompt-panel">PromptPanel</div>,
}));
jest.mock('../validation_panel', () => ({
  ValidationPanel: (props: any) => <div data-testid="validation-panel">ValidationPanel</div>,
}));

const mockHookReturn = {
  outputSchema: OutputSchema.SCORE_0_1,
  setOutputSchema: jest.fn(),
  ratingCriteria: '',
  setRatingCriteria: jest.fn(),
  customInstructions: '',
  setCustomInstructions: jest.fn(),
  userInstructions: '',
  setUserInstructions: jest.fn(),
  placeholders: [],
  validPlaceholders: [],
  invalidPlaceholders: [],
  availableQuerySetFields: [],
  validationModelId: 'model-1',
  setValidationModelId: jest.fn(),
  validatePrompt: jest.fn(),
  buildFullPrompt: jest.fn().mockReturnValue('full prompt'),
  resetToDefaults: jest.fn(),
  getPromptTemplate: jest.fn().mockReturnValue({
    outputSchema: OutputSchema.SCORE_0_1,
    systemPromptStart: SYSTEM_PROMPTS[OutputSchema.SCORE_0_1].start,
    systemPromptEnd: SYSTEM_PROMPTS[OutputSchema.SCORE_0_1].end,
    userInstructions: '',
    placeholders: [],
  }),
};

const defaultProps = {
  querySetId: 'qs-1',
  modelId: 'model-1',
  modelOptions: [
    { label: 'Model 1', value: 'model-1' },
    { label: 'Model 2', value: 'model-2' },
  ],
  onSave: jest.fn(),
  onCancel: jest.fn(),
  httpClient: {},
};

describe('PromptTemplateSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePromptTemplate.mockReturnValue(mockHookReturn as any);
  });

  describe('rendering', () => {
    it('should render the page title and description', () => {
      render(<PromptTemplateSettings {...defaultProps} />);

      expect(screen.getByText('Prompt Template Configuration')).toBeInTheDocument();
      expect(screen.getByText(/Configure and validate your LLM prompt template/)).toBeInTheDocument();
    });

    it('should render Save Template and Reset to Defaults buttons', () => {
      render(<PromptTemplateSettings {...defaultProps} />);

      expect(screen.getByText('Save Template')).toBeInTheDocument();
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
    });

    it('should render Cancel button when onCancel is provided', () => {
      render(<PromptTemplateSettings {...defaultProps} />);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should not render Cancel button when onCancel is not provided', () => {
      const { onCancel, ...propsWithoutCancel } = defaultProps;
      render(<PromptTemplateSettings {...propsWithoutCancel} />);

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('should call onSave with template when Save Template is clicked', () => {
      render(<PromptTemplateSettings {...defaultProps} />);

      fireEvent.click(screen.getByText('Save Template'));

      expect(mockHookReturn.getPromptTemplate).toHaveBeenCalled();
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ outputSchema: OutputSchema.SCORE_0_1 })
      );
    });

    it('should not call onSave when onSave prop is not provided', () => {
      const { onSave, ...propsWithoutSave } = defaultProps;
      render(<PromptTemplateSettings {...propsWithoutSave} />);

      fireEvent.click(screen.getByText('Save Template'));

      expect(mockHookReturn.getPromptTemplate).not.toHaveBeenCalled();
    });

    it('should call resetToDefaults when Reset to Defaults is clicked', () => {
      render(<PromptTemplateSettings {...defaultProps} />);

      fireEvent.click(screen.getByText('Reset to Defaults'));

      expect(mockHookReturn.resetToDefaults).toHaveBeenCalled();
    });

    it('should call onCancel when Cancel is clicked', () => {
      render(<PromptTemplateSettings {...defaultProps} />);

      fireEvent.click(screen.getByText('Cancel'));

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('hook initialization', () => {
    it('should pass querySetId, modelId, and httpClient to usePromptTemplate', () => {
      render(<PromptTemplateSettings {...defaultProps} />);

      expect(mockUsePromptTemplate).toHaveBeenCalledWith({
        querySetId: 'qs-1',
        modelId: 'model-1',
        httpClient: defaultProps.httpClient,
      });
    });
  });
});
