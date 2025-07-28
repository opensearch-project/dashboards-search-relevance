/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiFieldText, EuiComboBox } from '@elastic/eui';
import { LLMFormData, QuerySetOption } from '../types';
import { mockupQuerySetOptions } from '../../../resource_management_home/mockup_data';

interface LLMFormProps {
  formData: LLMFormData;
  onChange: (field: keyof LLMFormData, value: any) => void;
}

export const LLMForm = ({ formData, onChange }: LLMFormProps) => {
  const handleQuerySetsChange = (selectedOptions: QuerySetOption[]) => {
    onChange('querySets', selectedOptions || []);
  };

  return (
    <>
      <EuiFlexGroup gutterSize="m" direction="row" style={{ maxWidth: 600 }}>
        <EuiFlexItem grow={4}>
          <EuiFormRow label="Query Sets">
            <EuiComboBox
              placeholder="Select query sets"
              options={mockupQuerySetOptions}
              selectedOptions={formData.querySets}
              onChange={handleQuerySetsChange}
              isClearable={true}
              isInvalid={formData.querySets.length === 0}
              singleSelection={false}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <EuiFormRow label="Model Id">
            <EuiFieldText
              value={formData.modelId}
              onChange={(e) => onChange('modelId', e.target.value)}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <EuiFormRow label="Score Threshold">
            <EuiFieldText
              value={formData.scoreThreshold}
              onChange={(e) => onChange('scoreThreshold', e.target.value)}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
