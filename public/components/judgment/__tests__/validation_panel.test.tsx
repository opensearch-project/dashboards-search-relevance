/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ValidationPanel } from '../components/prompt_template/validation_panel';

const defaultProps = {
    placeholders: ['query', 'document'],
    validPlaceholders: ['query', 'document'],
    invalidPlaceholders: [],
    availableQuerySetFields: ['query', 'document'],
    modelId: 'model1',
    modelOptions: [
        { label: 'Model 1', value: 'model1' },
        { label: 'Model 2', value: 'model2' },
    ],
    onModelChange: jest.fn(),
    onValidate: jest.fn().mockResolvedValue({ success: true, rawResponse: '{"score": 0.85}' }),
    disabled: false,
};

describe('ValidationPanel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should render validation panel with title', () => {
        render(<ValidationPanel {...defaultProps} />);

        expect(screen.getByText('Validation')).toBeInTheDocument();
        expect(
            screen.getByText(/Test your prompt template with sample values/)
        ).toBeInTheDocument();
    });

    it('should render placeholder input fields for valid placeholders', () => {
        render(<ValidationPanel {...defaultProps} />);

        expect(screen.getByText('query')).toBeInTheDocument();
        expect(screen.getByText('document')).toBeInTheDocument();
    });

    it('should update placeholder values when input changes', () => {
        render(<ValidationPanel {...defaultProps} />);

        const queryInput = screen.getByPlaceholderText('Enter sample value for query');
        fireEvent.change(queryInput, { target: { value: 'bluetooth earbuds' } });

        expect(queryInput).toHaveValue('bluetooth earbuds');
    });

    it('should render no placeholders callout when placeholders is empty', () => {
        const props = {
            ...defaultProps,
            placeholders: [],
            validPlaceholders: [],
        };
        render(<ValidationPanel {...props} />);

        expect(screen.getByText('No placeholders detected')).toBeInTheDocument();
        expect(screen.getByText(/Add placeholders to your user input/)).toBeInTheDocument();
    });

    it('should render invalid placeholders callout', () => {
        const props = {
            ...defaultProps,
            invalidPlaceholders: ['badField'],
        };
        render(<ValidationPanel {...props} />);

        expect(screen.getByText('Invalid placeholders detected')).toBeInTheDocument();
        expect(screen.getByText('badField')).toBeInTheDocument();
    });

    it('should render invalid placeholders callout with available fields', () => {
        const props = {
            ...defaultProps,
            invalidPlaceholders: ['badField'],
            availableQuerySetFields: ['query', 'document'],
        };
        render(<ValidationPanel {...props} />);

        expect(screen.getByText('Invalid placeholders detected')).toBeInTheDocument();
        expect(screen.getByText('query, document')).toBeInTheDocument();
    });

    it('should render invalid placeholders callout without available fields', () => {
        const props = {
            ...defaultProps,
            invalidPlaceholders: ['badField'],
            availableQuerySetFields: [],
        };
        render(<ValidationPanel {...props} />);

        expect(screen.getByText('Invalid placeholders detected')).toBeInTheDocument();
        // No "Available fields:" text should appear
        expect(screen.queryByText(/Available fields:/)).not.toBeInTheDocument();
    });

    it('should disable Validate button when modelId is empty', () => {
        const props = { ...defaultProps, modelId: '' };
        render(<ValidationPanel {...props} />);

        const button = screen.getByText('Validate Prompt');
        expect(button.closest('button')).toBeDisabled();
    });

    it('should disable Validate button when there are invalid placeholders', () => {
        const props = {
            ...defaultProps,
            invalidPlaceholders: ['badField'],
        };
        render(<ValidationPanel {...props} />);

        const button = screen.getByText('Validate Prompt');
        expect(button.closest('button')).toBeDisabled();
    });

    it('should disable Validate button when non-auto-filled placeholders are empty', () => {
        render(<ValidationPanel {...defaultProps} />);

        // Don't fill in any placeholder values
        const button = screen.getByText('Validate Prompt');
        expect(button.closest('button')).toBeDisabled();
    });

    it('should enable Validate button when all non-auto-filled placeholders have values', () => {
        render(<ValidationPanel {...defaultProps} />);

        const queryInput = screen.getByPlaceholderText('Enter sample value for query');
        const docInput = screen.getByPlaceholderText('Enter sample value for document');

        fireEvent.change(queryInput, { target: { value: 'test query' } });
        fireEvent.change(docInput, { target: { value: 'test document' } });

        const button = screen.getByText('Validate Prompt');
        expect(button.closest('button')).not.toBeDisabled();
    });

    it('should handle auto-filled placeholders (hits/results)', () => {
        const props = {
            ...defaultProps,
            placeholders: ['query', 'hits'],
            validPlaceholders: ['query', 'hits'],
        };
        render(<ValidationPanel {...props} />);

        // Auto-filled placeholder should be disabled and show auto-fill text
        expect(screen.getByDisplayValue('Auto-filled with search results')).toBeInTheDocument();
        expect(screen.getByText('This field will be automatically filled with search results')).toBeInTheDocument();
    });

    it('should handle auto-filled "results" placeholder', () => {
        const props = {
            ...defaultProps,
            placeholders: ['query', 'results'],
            validPlaceholders: ['query', 'results'],
        };
        render(<ValidationPanel {...props} />);

        expect(screen.getByDisplayValue('Auto-filled with search results')).toBeInTheDocument();
    });

    it('should call onValidate when Validate button is clicked', async () => {
        const mockOnValidate = jest.fn().mockResolvedValue({
            success: true,
            rawResponse: '{"score": 0.85}',
        });

        const props = {
            ...defaultProps,
            onValidate: mockOnValidate,
        };

        render(<ValidationPanel {...props} />);

        // Fill in placeholder values
        const queryInput = screen.getByPlaceholderText('Enter sample value for query');
        const docInput = screen.getByPlaceholderText('Enter sample value for document');
        fireEvent.change(queryInput, { target: { value: 'test query' } });
        fireEvent.change(docInput, { target: { value: 'test doc' } });

        // Click Validate
        fireEvent.click(screen.getByText('Validate Prompt'));

        await waitFor(() => {
            expect(mockOnValidate).toHaveBeenCalledWith({
                placeholderValues: { query: 'test query', document: 'test doc' },
            });
        });
    });

    it('should display success result after validation', async () => {
        const mockOnValidate = jest.fn().mockResolvedValue({
            success: true,
            rawResponse: '{"score": 0.85}',
        });

        const props = {
            ...defaultProps,
            onValidate: mockOnValidate,
        };

        render(<ValidationPanel {...props} />);

        const queryInput = screen.getByPlaceholderText('Enter sample value for query');
        const docInput = screen.getByPlaceholderText('Enter sample value for document');
        fireEvent.change(queryInput, { target: { value: 'test' } });
        fireEvent.change(docInput, { target: { value: 'doc' } });

        fireEvent.click(screen.getByText('Validate Prompt'));

        await waitFor(() => {
            expect(screen.getByText('Validation Successful')).toBeInTheDocument();
        });
    });

    it('should display success result without rawResponse', async () => {
        const mockOnValidate = jest.fn().mockResolvedValue({
            success: true,
        });

        const props = {
            ...defaultProps,
            onValidate: mockOnValidate,
        };

        render(<ValidationPanel {...props} />);

        const queryInput = screen.getByPlaceholderText('Enter sample value for query');
        const docInput = screen.getByPlaceholderText('Enter sample value for document');
        fireEvent.change(queryInput, { target: { value: 'test' } });
        fireEvent.change(docInput, { target: { value: 'doc' } });

        fireEvent.click(screen.getByText('Validate Prompt'));

        await waitFor(() => {
            expect(screen.getByText('Validation Successful')).toBeInTheDocument();
        });
    });

    it('should display failure result after validation', async () => {
        const mockOnValidate = jest.fn().mockResolvedValue({
            success: false,
            error: 'Model returned invalid JSON',
        });

        const props = {
            ...defaultProps,
            onValidate: mockOnValidate,
        };

        render(<ValidationPanel {...props} />);

        const queryInput = screen.getByPlaceholderText('Enter sample value for query');
        const docInput = screen.getByPlaceholderText('Enter sample value for document');
        fireEvent.change(queryInput, { target: { value: 'test' } });
        fireEvent.change(docInput, { target: { value: 'doc' } });

        fireEvent.click(screen.getByText('Validate Prompt'));

        await waitFor(() => {
            expect(screen.getByText('Validation Failed')).toBeInTheDocument();
            expect(screen.getByText('Model returned invalid JSON')).toBeInTheDocument();
        });
    });

    it('should display failure result with raw response details', async () => {
        const mockOnValidate = jest.fn().mockResolvedValue({
            success: false,
            error: 'Parsing error',
            rawResponse: '{"error": "details"}',
        });

        const props = {
            ...defaultProps,
            onValidate: mockOnValidate,
        };

        render(<ValidationPanel {...props} />);

        const queryInput = screen.getByPlaceholderText('Enter sample value for query');
        const docInput = screen.getByPlaceholderText('Enter sample value for document');
        fireEvent.change(queryInput, { target: { value: 'test' } });
        fireEvent.change(docInput, { target: { value: 'doc' } });

        fireEvent.click(screen.getByText('Validate Prompt'));

        await waitFor(() => {
            expect(screen.getByText('Validation Failed')).toBeInTheDocument();
            expect(screen.getByText('Error details:')).toBeInTheDocument();
        });
    });

    it('should display "Unknown error occurred" when no error message is provided', async () => {
        const mockOnValidate = jest.fn().mockResolvedValue({
            success: false,
        });

        const props = {
            ...defaultProps,
            onValidate: mockOnValidate,
        };

        render(<ValidationPanel {...props} />);

        const queryInput = screen.getByPlaceholderText('Enter sample value for query');
        const docInput = screen.getByPlaceholderText('Enter sample value for document');
        fireEvent.change(queryInput, { target: { value: 'test' } });
        fireEvent.change(docInput, { target: { value: 'doc' } });

        fireEvent.click(screen.getByText('Validate Prompt'));

        await waitFor(() => {
            expect(screen.getByText('Validation Failed')).toBeInTheDocument();
            expect(screen.getByText('Unknown error occurred')).toBeInTheDocument();
        });
    });

    it('should handle validation throw error', async () => {
        const mockOnValidate = jest.fn().mockRejectedValue(new Error('Network failure'));

        const props = {
            ...defaultProps,
            onValidate: mockOnValidate,
        };

        render(<ValidationPanel {...props} />);

        const queryInput = screen.getByPlaceholderText('Enter sample value for query');
        const docInput = screen.getByPlaceholderText('Enter sample value for document');
        fireEvent.change(queryInput, { target: { value: 'test' } });
        fireEvent.change(docInput, { target: { value: 'doc' } });

        fireEvent.click(screen.getByText('Validate Prompt'));

        await waitFor(() => {
            expect(screen.getByText('Validation Failed')).toBeInTheDocument();
            expect(screen.getByText('Network failure')).toBeInTheDocument();
        });
    });

    it('should handle non-Error throw in validation', async () => {
        const mockOnValidate = jest.fn().mockRejectedValue('string error');

        const props = {
            ...defaultProps,
            onValidate: mockOnValidate,
        };

        render(<ValidationPanel {...props} />);

        const queryInput = screen.getByPlaceholderText('Enter sample value for query');
        const docInput = screen.getByPlaceholderText('Enter sample value for document');
        fireEvent.change(queryInput, { target: { value: 'test' } });
        fireEvent.change(docInput, { target: { value: 'doc' } });

        fireEvent.click(screen.getByText('Validate Prompt'));

        await waitFor(() => {
            expect(screen.getByText('Validation Failed')).toBeInTheDocument();
            expect(screen.getByText('Validation failed')).toBeInTheDocument();
        });
    });

    it('should change model via combobox', () => {
        const mockOnModelChange = jest.fn();
        const props = { ...defaultProps, onModelChange: mockOnModelChange };
        render(<ValidationPanel {...props} />);

        // The selected model should be shown
        expect(screen.getByText('Model 1')).toBeInTheDocument();
    });

    it('should disable fields when disabled prop is true', () => {
        const props = { ...defaultProps, disabled: true };
        render(<ValidationPanel {...props} />);

        const button = screen.getByText('Validate Prompt');
        expect(button.closest('button')).toBeDisabled();
    });

    it('should allow validation with no placeholders and model selected', () => {
        const props = {
            ...defaultProps,
            placeholders: [],
            validPlaceholders: [],
        };
        render(<ValidationPanel {...props} />);

        const button = screen.getByText('Validate Prompt');
        expect(button.closest('button')).not.toBeDisabled();
    });

    it('should render null when validPlaceholders exist but invalid also exist', () => {
        const props = {
            ...defaultProps,
            placeholders: ['query', 'badField'],
            validPlaceholders: ['query'],
            invalidPlaceholders: ['badField'],
        };
        render(<ValidationPanel {...props} />);

        // Both valid placeholder and invalid callout should be shown
        expect(screen.getByText('query')).toBeInTheDocument();
        expect(screen.getByText('Invalid placeholders detected')).toBeInTheDocument();
    });
});
