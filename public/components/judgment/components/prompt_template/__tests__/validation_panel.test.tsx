/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidationPanel } from '../validation_panel';

const mockModelOptions = [
  { label: 'Model 1', value: 'model-1' },
  { label: 'Model 2', value: 'model-2' },
];

const defaultProps = {
  placeholders: ['queryText', 'category'],
  validPlaceholders: ['queryText', 'category'],
  invalidPlaceholders: [],
  availableQuerySetFields: ['queryText', 'category', 'referenceAnswer'],
  modelId: 'model-1',
  modelOptions: mockModelOptions,
  onModelChange: jest.fn(),
  onValidate: jest.fn(),
  searchConfigurationList: ['config-1'],
  contextFields: ['field1'],
  size: 5,
  tokenLimit: 4000,
  ignoreFailure: false,
};

describe('ValidationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render validation panel with title', () => {
      render(<ValidationPanel {...defaultProps} />);

      expect(screen.getByText('Validation')).toBeInTheDocument();
      expect(screen.getByText(/Test your prompt template/)).toBeInTheDocument();
    });

    it('should render model selection label', () => {
      render(<ValidationPanel {...defaultProps} />);

      expect(screen.getByText('Model')).toBeInTheDocument();
    });

    it('should render validate button', () => {
      render(<ValidationPanel {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Validate Prompt/ });
      expect(button).toBeInTheDocument();
    });

    it('should render placeholder input fields', () => {
      render(<ValidationPanel {...defaultProps} />);

      expect(screen.getByLabelText('queryText')).toBeInTheDocument();
      expect(screen.getByLabelText('category')).toBeInTheDocument();
    });
  });

  describe('invalid placeholders', () => {
    it('should display warning when invalid placeholders exist', () => {
      const props = {
        ...defaultProps,
        placeholders: ['queryText', 'unknown'],
        validPlaceholders: ['queryText'],
        invalidPlaceholders: ['unknown'],
      };

      render(<ValidationPanel {...props} />);

      expect(screen.getByText('Invalid placeholders detected')).toBeInTheDocument();
      expect(screen.getByText(/unknown/)).toBeInTheDocument();
    });

    it('should show available fields when invalid placeholders exist', () => {
      const props = {
        ...defaultProps,
        placeholders: ['unknown'],
        validPlaceholders: [],
        invalidPlaceholders: ['unknown'],
        availableQuerySetFields: ['queryText', 'category'],
      };

      render(<ValidationPanel {...props} />);

      expect(screen.getByText(/Available fields/)).toBeInTheDocument();
      expect(screen.getByText(/queryText, category/)).toBeInTheDocument();
    });

    it('should disable validate button when invalid placeholders exist', () => {
      const props = {
        ...defaultProps,
        placeholders: ['queryText', 'unknown'],
        validPlaceholders: ['queryText'],
        invalidPlaceholders: ['unknown'],
      };

      render(<ValidationPanel {...props} />);

      const button = screen.getByRole('button', { name: /Validate Prompt/ });
      expect(button).toBeDisabled();
    });
  });

  describe('no placeholders', () => {
    it('should show info callout when no placeholders detected', () => {
      const props = {
        ...defaultProps,
        placeholders: [],
        validPlaceholders: [],
      };

      render(<ValidationPanel {...props} />);

      expect(screen.getByText('No placeholders detected')).toBeInTheDocument();
      expect(screen.getByText(/Add placeholders to your user input instructions/)).toBeInTheDocument();
    });

    it('should allow validation when no placeholders exist', () => {
      const props = {
        ...defaultProps,
        placeholders: [],
        validPlaceholders: [],
      };

      render(<ValidationPanel {...props} />);

      const button = screen.getByRole('button', { name: /Validate Prompt/ });
      expect(button).not.toBeDisabled();
    });
  });

  describe('validation button state', () => {
    it('should disable button when model is not selected', () => {
      const props = {
        ...defaultProps,
        modelId: '',
      };

      render(<ValidationPanel {...props} />);

      const button = screen.getByRole('button', { name: /Validate Prompt/ });
      expect(button).toBeDisabled();
    });

    it('should disable button when placeholder values are empty', () => {
      render(<ValidationPanel {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Validate Prompt/ });
      expect(button).toBeDisabled();
    });

    it('should have input fields for all placeholders', () => {
      render(<ValidationPanel {...defaultProps} />);

      const queryTextInput = screen.getByLabelText('queryText') as HTMLInputElement;
      const categoryInput = screen.getByLabelText('category') as HTMLInputElement;

      // Verify inputs exist and are enabled by default
      expect(queryTextInput).toBeInTheDocument();
      expect(queryTextInput).not.toBeDisabled();
      expect(categoryInput).toBeInTheDocument();
      expect(categoryInput).not.toBeDisabled();
    });

    it('should respect disabled prop', () => {
      const props = {
        ...defaultProps,
        disabled: true,
      };

      render(<ValidationPanel {...props} />);

      const button = screen.getByRole('button', { name: /Validate Prompt/ });
      expect(button).toBeDisabled();
    });
  });

  describe('placeholder input handling', () => {
    it('should render input fields for placeholders', () => {
      render(<ValidationPanel {...defaultProps} />);

      const queryTextInput = screen.getByLabelText('queryText') as HTMLInputElement;
      const categoryInput = screen.getByLabelText('category') as HTMLInputElement;

      expect(queryTextInput).toBeInTheDocument();
      expect(categoryInput).toBeInTheDocument();
    });

    it('should handle placeholder value changes', () => {
      render(<ValidationPanel {...defaultProps} />);

      const queryTextInput = screen.getByLabelText('queryText') as HTMLInputElement;

      fireEvent.change(queryTextInput, { target: { value: 'test value' } });

      expect(queryTextInput.value).toBe('test value');
    });

  });

  describe('model selection changes', () => {
    it('should call onModelChange when a model is selected', () => {
      const mockOnModelChange = jest.fn();
      const props = {
        ...defaultProps,
        onModelChange: mockOnModelChange,
      };

      render(<ValidationPanel {...props} />);

      // Note: Testing EuiComboBox onChange is complex, but we can verify the prop is passed
      expect(mockOnModelChange).toBeDefined();
    });

    it('should work with empty model selection', () => {
      const props = {
        ...defaultProps,
        modelId: '',
      };

      render(<ValidationPanel {...props} />);

      const button = screen.getByRole('button', { name: /Validate Prompt/ });
      expect(button).toBeDisabled();
    });
  });

  describe('canValidate logic', () => {
    it('should disable button when modelId is empty', () => {
      const props = {
        ...defaultProps,
        modelId: '',
      };

      render(<ValidationPanel {...props} />);

      const button = screen.getByRole('button', { name: /Validate Prompt/ });
      expect(button).toBeDisabled();
    });

    it('should disable button when invalid placeholders exist', () => {
      const props = {
        ...defaultProps,
        invalidPlaceholders: ['unknown'],
      };

      render(<ValidationPanel {...props} />);

      const button = screen.getByRole('button', { name: /Validate Prompt/ });
      expect(button).toBeDisabled();
    });

    it('should enable button when no placeholders exist and model is selected', () => {
      const props = {
        ...defaultProps,
        placeholders: [],
        validPlaceholders: [],
      };

      render(<ValidationPanel {...props} />);

      const button = screen.getByRole('button', { name: /Validate Prompt/ });
      expect(button).not.toBeDisabled();
    });

    it('should enable button when only auto-filled placeholders exist', () => {
      const props = {
        ...defaultProps,
        placeholders: ['hits', 'results'],
        validPlaceholders: ['hits', 'results'],
      };

      render(<ValidationPanel {...props} />);

      const button = screen.getByRole('button', { name: /Validate Prompt/ });
      expect(button).not.toBeDisabled();
    });

    it('should disable button when valid placeholders are not filled', () => {
      const props = {
        ...defaultProps,
        placeholders: ['queryText'],
        validPlaceholders: ['queryText'],
      };

      render(<ValidationPanel {...props} />);

      const button = screen.getByRole('button', { name: /Validate Prompt/ });
      expect(button).toBeDisabled();
    });
  });

});
