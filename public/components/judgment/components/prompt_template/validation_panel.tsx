/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiFormRow,
  EuiFieldText,
  EuiButton,
  EuiCallOut,
  EuiCodeBlock,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiComboBox,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { PromptValidationResponse } from '../../types/prompt_template_types';

interface ValidationPanelProps {
  placeholders: string[];
  validPlaceholders?: string[];
  invalidPlaceholders?: string[];
  availableQuerySetFields?: string[];
  modelId: string;
  modelOptions: Array<{ label: string; value: string }>;
  onModelChange: (modelId: string) => void;
  onValidate: (params: {
    placeholderValues: Record<string, string>;
  }) => Promise<PromptValidationResponse>;
  disabled?: boolean;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  placeholders,
  validPlaceholders = placeholders,
  invalidPlaceholders = [],
  availableQuerySetFields = [],
  modelId,
  modelOptions,
  onModelChange,
  onValidate,
  disabled = false,
}) => {
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<PromptValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult(null);

    console.log('ValidationPanel - handleValidate called with:', {
      placeholderValues,
    });

    try {
      const result = await onValidate({
        placeholderValues,
      });
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const isAutoFilledPlaceholder = (placeholder: string) => {
    const lowerPlaceholder = placeholder.toLowerCase();
    return lowerPlaceholder === 'hits' || lowerPlaceholder === 'results';
  };

  const canValidate = () => {
    if (!modelId) return false;
    // Check if there are invalid placeholders
    if (invalidPlaceholders.length > 0) return false;
    // If there are valid placeholders, check if all non-auto-filled ones have values
    if (validPlaceholders.length > 0) {
      return validPlaceholders.every((placeholder) => {
        // Skip validation for auto-filled placeholders
        if (isAutoFilledPlaceholder(placeholder)) return true;
        return placeholderValues[placeholder]?.trim();
      });
    }
    // If no placeholders, allow validation
    return true;
  };

  const selectedModel = modelOptions.find((opt) => opt.value === modelId);
  const comboBoxOptions = modelOptions.map((opt) => ({ label: opt.label }));
  const selectedComboBoxOption = selectedModel ? [{ label: selectedModel.label }] : [];

  return (
    <EuiPanel paddingSize="l">
      <EuiTitle size="s">
        <h3>Validation</h3>
      </EuiTitle>
      <EuiSpacer size="m" />

      <EuiText size="s" color="subdued">
        <p>
          Test your prompt template with sample values to verify the LLM output before saving.
        </p>
      </EuiText>
      <EuiSpacer size="m" />

      <EuiFormRow label="Model" helpText="Select the model to use for validation" fullWidth>
        <EuiComboBox
          placeholder="Select a model"
          singleSelection={{ asPlainText: true }}
          options={comboBoxOptions}
          selectedOptions={selectedComboBoxOption}
          onChange={(selected) => {
            if (selected.length > 0) {
              const option = modelOptions.find((opt) => opt.label === selected[0].label);
              if (option) {
                onModelChange(option.value);
              }
            } else {
              onModelChange('');
            }
          }}
          isDisabled={disabled}
          fullWidth
        />
      </EuiFormRow>

      <EuiSpacer size="m" />

      {invalidPlaceholders.length > 0 && (
        <>
          <EuiCallOut
            title="Invalid placeholders detected"
            color="danger"
            iconType="alert"
            size="s"
          >
            <p>
              The following placeholders are not defined in the selected query set:{' '}
              <strong>{invalidPlaceholders.join(', ')}</strong>
            </p>
            {availableQuerySetFields.length > 0 && (
              <p>
                <EuiSpacer size="s" />
                Available fields: <code>{availableQuerySetFields.join(', ')}</code>
              </p>
            )}
          </EuiCallOut>
          <EuiSpacer size="m" />
        </>
      )}

      {placeholders.length === 0 ? (
        <>
          <EuiCallOut
            title="No placeholders detected"
            color="primary"
            iconType="iInCircle"
            size="s"
          >
            <p>
              Add placeholders to your user input instructions using the format{' '}
              <strong>{`{{field_name}}`}</strong>. For example:{' '}
              <code>{`{{query}}`}</code> or <code>{`{{document}}`}</code>.
            </p>
          </EuiCallOut>
          <EuiSpacer size="m" />
        </>
      ) : validPlaceholders.length > 0 ? (
        <>
          <EuiTitle size="xs">
            <h4>Placeholder Values</h4>
          </EuiTitle>
          <EuiSpacer size="s" />
          <EuiText size="xs" color="subdued">
            <p>Provide sample values for each placeholder to test the prompt:</p>
          </EuiText>
          <EuiSpacer size="m" />

          {validPlaceholders.map((placeholder) => {
            const isAutoFilled = isAutoFilledPlaceholder(placeholder);
            return (
              <React.Fragment key={placeholder}>
                <EuiFormRow
                  label={placeholder}
                  helpText={isAutoFilled ? 'This field will be automatically filled with search results' : undefined}
                  fullWidth
                >
                  <EuiFieldText
                    placeholder={isAutoFilled ? 'Auto-filled with search results' : `Enter sample value for ${placeholder}`}
                    value={isAutoFilled ? 'Auto-filled with search results' : (placeholderValues[placeholder] || '')}
                    onChange={(e) => handlePlaceholderChange(placeholder, e.target.value)}
                    disabled={disabled || isValidating || isAutoFilled}
                    fullWidth
                  />
                </EuiFormRow>
                <EuiSpacer size="m" />
              </React.Fragment>
            );
          })}
        </>
      ) : null}

      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            onClick={handleValidate}
            disabled={!canValidate() || disabled || isValidating}
            iconType={isValidating ? undefined : 'play'}
          >
            {isValidating ? (
              <>
                <EuiLoadingSpinner size="m" />
                &nbsp;Validating...
              </>
            ) : (
              'Validate Prompt'
            )}
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>

      {validationResult && (
        <>
          <EuiSpacer size="l" />
          {validationResult.success ? (
                <EuiCallOut
                  title="Validation Successful"
                  color="success"
                  iconType="check"
                  size="s"
                >
                  {validationResult.rawResponse && (
                    <EuiCodeBlock fontSize="s" paddingSize="s" isCopyable>
                      {validationResult.rawResponse}
                    </EuiCodeBlock>
                  )}
                </EuiCallOut>
              ) : (
                <EuiCallOut
                  title="Validation Failed"
                  color="danger"
                  iconType="alert"
                  size="s"
                >
                  <EuiText size="s">
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                      {validationResult.error || 'Unknown error occurred'}
                    </pre>
                  </EuiText>
                  {validationResult.rawResponse && (
                    <>
                      <EuiSpacer size="m" />
                      <EuiText size="xs" color="subdued">
                        <p>Error details:</p>
                      </EuiText>
                      <EuiSpacer size="s" />
                      <EuiCodeBlock fontSize="s" paddingSize="s" isCopyable>
                        {validationResult.rawResponse}
                      </EuiCodeBlock>
                    </>
                  )}
                </EuiCallOut>
              )}
            </>
          )}
    </EuiPanel>
  );
};
