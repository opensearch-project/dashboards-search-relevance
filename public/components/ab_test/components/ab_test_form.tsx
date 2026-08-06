/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButton,
  EuiComboBox,
  EuiFieldNumber,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
} from '@elastic/eui';
import { UseAbTestFormReturn } from '../hooks/use_ab_test_form';
import { SearchConfigOption } from '../types';

interface AbTestFormProps {
  formState: UseAbTestFormReturn;
}

export const AbTestForm: React.FC<AbTestFormProps> = ({ formState }) => {
  const {
    name,
    setName,
    size,
    setSize,
    searchConfigs,
    selectedConfigA,
    setSelectedConfigA,
    selectedConfigB,
    setSelectedConfigB,
    isLoading,
    isCreated,
    createAbTest,
  } = formState;

  return (
    <EuiForm component="form">
      <EuiFormRow label="Test Name" helpText="A unique identifier for this A/B test">
        <EuiFieldText
          placeholder="e.g., bm25-vs-neural"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isCreated}
          data-test-subj="abTestNameInput"
          aria-label="Test name"
        />
      </EuiFormRow>

      <EuiSpacer size="m" />

      <EuiFormRow label="Search Configuration A" helpText="First search strategy">
        <EuiComboBox
          placeholder="Select configuration A"
          options={searchConfigs}
          selectedOptions={selectedConfigA}
          onChange={(selected) => setSelectedConfigA(selected as SearchConfigOption[])}
          singleSelection={{ asPlainText: true }}
          isDisabled={isCreated}
          data-test-subj="abTestConfigAComboBox"
        />
      </EuiFormRow>

      <EuiSpacer size="m" />

      <EuiFormRow label="Search Configuration B" helpText="Second search strategy">
        <EuiComboBox
          placeholder="Select configuration B"
          options={searchConfigs}
          selectedOptions={selectedConfigB}
          onChange={(selected) => setSelectedConfigB(selected as SearchConfigOption[])}
          singleSelection={{ asPlainText: true }}
          isDisabled={isCreated}
          data-test-subj="abTestConfigBComboBox"
        />
      </EuiFormRow>

      <EuiSpacer size="m" />

      <EuiFormRow label="Result Size" helpText="Number of interleaved results per search">
        <EuiFieldNumber
          value={size}
          onChange={(e) => setSize(parseInt(e.target.value, 10) || 10)}
          min={1}
          max={100}
          disabled={isCreated}
          data-test-subj="abTestSizeInput"
          aria-label="Result size"
        />
      </EuiFormRow>

      <EuiSpacer size="l" />

      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            onClick={createAbTest}
            isLoading={isLoading}
            disabled={isCreated}
            data-test-subj="createAbTestButton"
          >
            Create A/B Test
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  );
};
