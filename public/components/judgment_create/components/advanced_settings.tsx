/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiCompressedFormRow,
  EuiFieldText,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiBadge,
  EuiSpacer,
  EuiFieldNumber,
  EuiSwitch,
} from '@elastic/eui';
import { isValidTokenLimit } from '../utils/validation';

interface AdvancedSettingsProps {
  formData: any;
  updateFormData: (updates: any) => void;
  newContextField: string;
  setNewContextField: (value: string) => void;
  addContextField: () => void;
  removeContextField: (field: string) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  formData,
  updateFormData,
  newContextField,
  setNewContextField,
  addContextField,
  removeContextField,
}) => {
  return (
    <>
      <EuiCompressedFormRow
        label="Context Fields"
        helpText="Specify context fields used for the LLM judgment."
        fullWidth
      >
        <div>
          <EuiFlexGroup gutterSize="s">
            <EuiFlexItem>
              <EuiFieldText
                placeholder="Enter field name"
                value={newContextField}
                onChange={(e) => setNewContextField(e.target.value)}
                onKeyUp={(e) => {
                  if (e.key === 'Enter' && newContextField.trim()) {
                    addContextField();
                  }
                }}
                fullWidth
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton size="m" onClick={addContextField} isDisabled={!newContextField.trim()}>
                Add
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>

          {formData.contextFields?.length > 0 && (
            <>
              <EuiSpacer size="s" />
              <div>
                {formData.contextFields.map((field: string) => (
                  <EuiBadge
                    key={field}
                    color="hollow"
                    iconType="cross"
                    iconSide="right"
                    iconOnClick={() => removeContextField(field)}
                    iconOnClickAriaLabel={`Remove ${field} from context fields`}
                    style={{ marginRight: '4px', marginBottom: '4px' }}
                  >
                    {field}
                  </EuiBadge>
                ))}
              </div>
            </>
          )}
        </div>
      </EuiCompressedFormRow>

      <EuiCompressedFormRow
        label="Token Limit"
        helpText="Please check token limit for the modelId (1000-500000)"
        fullWidth
      >
        <EuiFieldNumber
          value={formData.tokenLimit}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (isValidTokenLimit(value)) {
              updateFormData({ tokenLimit: value });
            }
          }}
          min={1000}
          max={500000}
          step={1000}
          fullWidth
        />
      </EuiCompressedFormRow>

      <EuiCompressedFormRow
        label="Ignore Failure"
        helpText="Continue processing even if some judgments fail"
        fullWidth
      >
        <EuiSwitch
          label="Ignore failures during judgment process"
          checked={formData.ignoreFailure}
          onChange={(e) => updateFormData({ ignoreFailure: e.target.checked })}
        />
      </EuiCompressedFormRow>
    </>
  );
};
