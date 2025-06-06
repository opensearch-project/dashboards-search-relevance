/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiFieldNumber } from '@elastic/eui';
import { ResultListComparisonFormData, OptionLabel } from '../types';
import { CoreStart } from '../../../../../src/core/public';
import { SearchConfigForm } from '../search_configuration_form';
import { QuerySetsComboBox } from './query_sets_combo_box';
import { JudgmentsComboBox } from './judgments_combo_box';

interface PointwiseExperimentFormProps {
  formData: ResultListComparisonFormData;
  onChange: (field: keyof ResultListComparisonFormData, value: any) => void;
  http: CoreStart['http'];
}

export interface PointwiseExperimentFormRef {
  validateAndSetErrors: () => { isValid: boolean; data: PointwiseExperimentFormData };
  clearAllErrors: () => void;
}

export const PointwiseExperimentForm = forwardRef<
  PointwiseExperimentFormRef,
  PointwiseExperimentFormProps
>(({ formData, onChange, http }, ref) => {
  const [selectedSearchConfigs, setSelectedSearchConfigs] = useState<OptionLabel[]>([]);
  const [querySetOptions, setQuerySetOptions] = useState<OptionLabel[]>([]);
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
      formData.querySetId ? [{ label: formData.querySetId, value: formData.querySetId }] : []
    );
    setK(formData.size ?? 10);
    setSelectedSearchConfigs(
      formData.searchConfigurationList
        ? formData.searchConfigurationList.map((config) => ({ label: config, value: config }))
        : []
    );
    setJudgmentOptions(
      (formData.judgmentList as string[])?.length > 0
        ? (formData.judgmentList as string[]).map((judgment) => ({
            label: judgment,
            value: judgment,
          }))
        : []
    );
    clearAllErrors();
  }, [formData]); // Dependency on formData ensures re-initialization when parent's formData changes

  const validateAndSetErrors = (): { isValid: boolean; data: PointwiseExperimentFormData } => {
    let isValid = true;
    const currentData: PointwiseExperimentFormData = {
      querySetId: querySetOptions[0]?.value || '',
      size: k,
      searchConfigurationList: selectedSearchConfigs.map((c) => c.value),
      judgmentList: judgmentOptions.map((j) => j.value),
      type: formData.type, // Preserve the type from the initial formData
    };

    // Validate Query Set
    if (!currentData.querySetId) {
      // Validate against currentData
      setQuerySetError(['Please select a query set.']);
      isValid = false;
    } else {
      setQuerySetError([]);
    }

    // Validate K Value
    if (isNaN(currentData.size) || currentData.size < 1) {
      // Validate against currentData
      setKError(['K value must be a positive number.']);
      isValid = false;
    } else {
      setKError([]);
    }

    // Validate Search Configuration
    if (currentData.searchConfigurationList.length === 0) {
      // Validate against currentData
      setSearchConfigError(['Please select at least one search configuration.']);
      isValid = false;
    } else {
      setSearchConfigError([]);
    }

    // Validate Judgments
    if (currentData.judgmentList.length === 0) {
      // Validate against currentData
      setJudgmentError(['Please select at least one judgment list.']);
      isValid = false;
    } else {
      setJudgmentError([]);
    }

    return { isValid, data: currentData }; // Return the validation result and the current data
  };

  // Expose the validateAndSetErrors and clearAllErrors functions to the parent via ref
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
    if (selectedOptions.length > 0 && searchConfigError.length > 0) {
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
              isInvalid={querySetError.length > 0} // Only invalid if there's an error message
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
              isInvalid={kError.length > 0} // Only invalid if there's an error message
              error={kError}
            >
              <EuiFieldNumber
                placeholder="Enter k value"
                value={k}
                onChange={handleKChange}
                min={1}
                fullWidth
                isInvalid={kError.length > 0} // Also for the input field itself
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow
          label="Search Configuration"
          isInvalid={searchConfigError.length > 0} // Only invalid if there's an error message
          error={searchConfigError}
        >
          <SearchConfigForm
            selectedOptions={selectedSearchConfigs}
            onChange={handleSearchConfigChange}
            http={http}
            maxNumberOfOptions={1}
            hideLabel={true}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow
          label="Judgments"
          isInvalid={judgmentError.length > 0} // Only invalid if there's an error message
          error={judgmentError}
        >
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
