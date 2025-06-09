/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiFieldNumber } from '@elastic/eui';
import { HybridOptimizerExperimentFormData, OptionLabel } from '../types';
import { CoreStart } from '../../../../../src/core/public';
import { SearchConfigForm } from '../search_configuration_form';
import { QuerySetsComboBox } from './query_sets_combo_box';
import { JudgmentsComboBox } from './judgments_combo_box';

export interface HybridOptimizerExperimentFormRef {
  validateAndSetErrors: () => { isValid: boolean; data: HybridOptimizerExperimentFormData };
  clearAllErrors: () => void;
}

interface HybridOptimizerExperimentFormProps {
  formData: HybridOptimizerExperimentFormData;
  onChange: (field: keyof HybridOptimizerExperimentFormData, value: any) => void;
  http: CoreStart['http'];
}

export const HybridOptimizerExperimentForm = forwardRef<
  HybridOptimizerExperimentFormRef,
  HybridOptimizerExperimentFormProps
>(({ formData, onChange, http }, ref) => {
  const [querySetOptions, setQuerySetOptions] = useState<OptionLabel[]>([]);
  const [selectedSearchConfigs, setSelectedSearchConfigs] = useState<OptionLabel[]>([]);
  const [k, setK] = useState<number>(10);
  const [judgmentOptions, setJudgmentOptions] = useState<OptionLabel[]>([]);

  const [querySetError, setQuerySetError] = useState<string[]>([]);
  const [kError, setKError] = useState<string[]>([]);
  const [searchConfigError, setSearchConfigError] = useState<string[]>([]);
  const [judgmentError, setJudgmentError] = useState<string[]>([]);

  const clearAllErrors = () => {
    setQuerySetError([]);
    setKError([]);
    setSearchConfigError([]);
    setJudgmentError([]);
  };

  useEffect(() => {
    setQuerySetOptions(
      formData?.querySetId ? [{ label: formData.querySetId, value: formData.querySetId }] : []
    );
    setSelectedSearchConfigs(
      Array.isArray(formData?.searchConfigurationList)
        ? formData.searchConfigurationList.map((config) => ({ label: config, value: config }))
        : []
    );
    setK(formData?.size !== undefined && formData?.size !== null ? formData.size : 10);
    setJudgmentOptions(
      Array.isArray(formData?.judgmentList)
        ? formData.judgmentList.map((judgment) => ({ label: judgment, value: judgment }))
        : []
    );
    clearAllErrors(); // Clear errors on formData prop change
  }, [formData]);

  const validateAndSetErrors = (): {
    isValid: boolean;
    data: HybridOptimizerExperimentFormData;
  } => {
    let isValid = true;

    // Construct the current data object from internal states for validation
    const currentData: HybridOptimizerExperimentFormData = {
      querySetId: querySetOptions[0]?.value || '',
      size: k,
      searchConfigurationList: selectedSearchConfigs.map((c) => c.value),
      judgmentList: judgmentOptions.map((j) => j.value),
      type: formData.type, // Preserve the 'type' from the initial formData
    };

    // Validate Query Set
    if (!currentData.querySetId) {
      setQuerySetError(['Please select a query set.']);
      isValid = false;
    } else {
      setQuerySetError([]);
    }

    // Validate K Value
    if (isNaN(currentData.size) || currentData.size < 1) {
      setKError(['K value must be a positive number.']);
      isValid = false;
    } else {
      setKError([]);
    }

    // Validate Search Configuration (exactly one is needed for HybridOptimizer)
    if (currentData.searchConfigurationList.length !== 1) {
      setSearchConfigError(['Please select exactly one search configuration.']);
      isValid = false;
    } else {
      setSearchConfigError([]);
    }

    // Validate Judgments
    if (!currentData.judgmentList.length) {
      setJudgmentError(['Please select at least one judgment list.']);
      isValid = false;
    } else {
      setJudgmentError([]);
    }

    return { isValid, data: currentData }; // Return the validation status AND the current data
  };

  useImperativeHandle(ref, () => ({
    validateAndSetErrors,
    clearAllErrors,
  }));

  const handleQuerySetsChange = (selectedOptions: OptionLabel[]) => {
    setQuerySetOptions(selectedOptions || []);
    const newValue = selectedOptions?.[0]?.value || '';
    if (formData.querySetId !== newValue) {
      onChange('querySetId', newValue);
    }
    if (selectedOptions.length > 0 && querySetError.length > 0) {
      setQuerySetError([]);
    }
  };

  const handleJudgmentsChange = (selectedOptions: OptionLabel[]) => {
    setJudgmentOptions(selectedOptions || []);
    const newValues = selectedOptions.map((o) => o.value);
    if (JSON.stringify(formData.judgmentList) !== JSON.stringify(newValues)) {
      onChange('judgmentList', newValues);
    }
    if (selectedOptions.length > 0 && judgmentError.length > 0) {
      setJudgmentError([]);
    }
  };

  const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setK(value);
    if (formData.size !== value) {
      onChange('size', value);
    }
    if (!isNaN(value) && value >= 1 && kError.length > 0) {
      setKError([]);
    }
  };

  const handleSearchConfigChange = (selectedOptions: OptionLabel[]) => {
    setSelectedSearchConfigs(selectedOptions);
    const newValues = selectedOptions.map((o) => o.value);
    if (JSON.stringify(formData.searchConfigurationList) !== JSON.stringify(newValues)) {
      onChange('searchConfigurationList', newValues);
    }
    // Clear error immediately on valid change (assuming exactly 1 is needed)
    if (selectedOptions.length === 1 && searchConfigError.length > 0) {
      setSearchConfigError([]);
    }
  };

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup gutterSize="m" direction="row" style={{ maxWidth: 600 }}>
          <EuiFlexItem grow={4}>
            <EuiFormRow
              label="Query Set"
              isInvalid={querySetError.length > 0}
              error={querySetError}
            >
              <QuerySetsComboBox
                selectedOptions={querySetOptions}
                onChange={handleQuerySetsChange}
                http={http}
                hideLabel={true}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={1}>
            <EuiFormRow
              label="K Value"
              helpText="The number of documents to include from the result list."
              isInvalid={kError.length > 0}
              error={kError}
            >
              <EuiFieldNumber
                placeholder="Enter k value"
                value={k}
                onChange={handleKChange}
                min={1}
                fullWidth
                isInvalid={kError.length > 0}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow
          label="Search Configuration"
          helpText="Select exactly one search configuration."
          isInvalid={searchConfigError.length > 0}
          error={searchConfigError}
        >
          <SearchConfigForm
            selectedOptions={selectedSearchConfigs}
            onChange={handleSearchConfigChange}
            http={http}
            maxNumberOfOptions={1} // Set to 1 as per HybridOptimizer requirements
            hideLabel={true}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow label="Judgments" isInvalid={judgmentError.length > 0} error={judgmentError}>
          <JudgmentsComboBox
            selectedOptions={judgmentOptions}
            onChange={handleJudgmentsChange}
            http={http}
            hideLabel={true}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
});
