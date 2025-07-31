/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedSettings } from '../components/advanced_settings';

const defaultProps = {
  formData: {
    contextFields: ['field1'],
    tokenLimit: 4000,
    ignoreFailure: false,
  },
  updateFormData: jest.fn(),
  newContextField: '',
  setNewContextField: jest.fn(),
  addContextField: jest.fn(),
  removeContextField: jest.fn(),
};

describe('AdvancedSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all advanced settings fields', () => {
    render(<AdvancedSettings {...defaultProps} />);

    expect(screen.getByText('Context Fields')).toBeInTheDocument();
    expect(screen.getByText('Token Limit')).toBeInTheDocument();
    expect(screen.getByText('Ignore Failure')).toBeInTheDocument();
  });

  it('should call setNewContextField when context field input changes', () => {
    const mockSetNewContextField = jest.fn();
    render(<AdvancedSettings {...defaultProps} setNewContextField={mockSetNewContextField} />);

    const input = screen.getByPlaceholderText('Enter field name');
    fireEvent.change(input, { target: { value: 'newField' } });
    expect(mockSetNewContextField).toHaveBeenCalledWith('newField');
  });

  it('should call addContextField when Add button is clicked', () => {
    const mockAddContextField = jest.fn();
    render(
      <AdvancedSettings
        {...defaultProps}
        addContextField={mockAddContextField}
        newContextField="test"
      />
    );

    fireEvent.click(screen.getByText('Add'));
    expect(mockAddContextField).toHaveBeenCalled();
  });

  it('should call addContextField when Enter key is pressed', () => {
    const mockAddContextField = jest.fn();
    render(
      <AdvancedSettings
        {...defaultProps}
        addContextField={mockAddContextField}
        newContextField="test"
      />
    );

    const input = screen.getByPlaceholderText('Enter field name');
    fireEvent.keyUp(input, { key: 'Enter' });
    expect(mockAddContextField).toHaveBeenCalled();
  });

  it('should disable Add button when newContextField is empty', () => {
    render(<AdvancedSettings {...defaultProps} newContextField="" />);

    const addButton = screen.getByText('Add').closest('button');
    expect(addButton).toBeDisabled();
  });

  it('should render context field badges', () => {
    render(<AdvancedSettings {...defaultProps} />);
    expect(screen.getByText('field1')).toBeInTheDocument();
  });

  it('should call removeContextField when badge cross is clicked', () => {
    const mockRemoveContextField = jest.fn();
    render(<AdvancedSettings {...defaultProps} removeContextField={mockRemoveContextField} />);

    const badge = screen.getByText('field1');
    const removeButton = badge.parentElement?.querySelector('[data-euiicon-type="cross"]');
    if (removeButton) {
      fireEvent.click(removeButton);
      expect(mockRemoveContextField).toHaveBeenCalledWith('field1');
    }
  });

  it('should call updateFormData when token limit changes', () => {
    const mockUpdateFormData = jest.fn();
    render(<AdvancedSettings {...defaultProps} updateFormData={mockUpdateFormData} />);

    const tokenInput = screen.getByDisplayValue('4000');
    fireEvent.change(tokenInput, { target: { value: '5000' } });
    expect(mockUpdateFormData).toHaveBeenCalledWith({ tokenLimit: 5000 });
  });

  it('should call updateFormData when ignore failure switch changes', () => {
    const mockUpdateFormData = jest.fn();
    render(<AdvancedSettings {...defaultProps} updateFormData={mockUpdateFormData} />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    expect(mockUpdateFormData).toHaveBeenCalledWith({ ignoreFailure: true });
  });

  it('should not update token limit for invalid values', () => {
    const mockUpdateFormData = jest.fn();
    render(<AdvancedSettings {...defaultProps} updateFormData={mockUpdateFormData} />);

    const tokenInput = screen.getByDisplayValue('4000');
    fireEvent.change(tokenInput, { target: { value: '500' } }); // Below minimum
    expect(mockUpdateFormData).not.toHaveBeenCalled();
  });

  it('should handle empty context fields array', () => {
    const propsWithEmptyFields = {
      ...defaultProps,
      formData: { ...defaultProps.formData, contextFields: [] },
    };
    render(<AdvancedSettings {...propsWithEmptyFields} />);

    expect(screen.getByText('Context Fields')).toBeInTheDocument();
    expect(screen.queryByText('field1')).not.toBeInTheDocument();
  });
});
