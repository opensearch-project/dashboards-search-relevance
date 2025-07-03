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
  validateAndSetErrors: () => { isValid: boolean; data: ResultListComparisonFormData }; // Corrected type
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
    let newQuerySetOptions: OptionLabel[] = [];
    // Ensure both querySetId and querySetName are strings and not empty
    if (
      typeof formData.querySetId === 'string' &&
      formData.querySetId !== '' &&
      typeof formData.querySetName === 'string' &&
      formData.querySetName !== ''
    ) {
      newQuerySetOptions = [{ label: formData.querySetName, value: formData.querySetId }];
    }
    setQuerySetOptions(newQuerySetOptions);

    setK(formData.size ?? 10);

    let newSelectedSearchConfigs: OptionLabel[] = [];
    if (Array.isArray(formData.searchConfigurationList)) {
      newSelectedSearchConfigs = formData.searchConfigurationList
        .map((config: any) => { // Type 'any' for config to allow flexible property access
          const label = (typeof config.name === 'string' && config.name !== '')
            ? config.name
            : (typeof config.id === 'string' && config.id !== '')
                ? config.id
                : ''; // Default to empty string
          const value = (typeof config.id === 'string' && config.id !== '')
          ? config.id
          : ''; // Ensure value is also a string

          return { label, value };
        })
        .filter((option) => option.label !== ''); // Filter out options with empty labels
    }
    setSelectedSearchConfigs(newSelectedSearchConfigs);

    let newJudgmentOptions: OptionLabel[] = [];
    if (Array.isArray(formData.judgmentList)) {
      newJudgmentOptions = formData.judgmentList
        .map((judgment: any) => { // Type 'any' for judgment for flexible property access
          const label = (typeof judgment.name === 'string' && judgment.name !== '')
            ? judgment.name
            : (typeof judgment.id === 'string' && judgment.id !== '')
                ? judgment.id
                : ''; // Fallback to empty string
          const value = (typeof judgment.id === 'string' && judgment.id !== '')
           ? judgment.id
            : ''; // Ensure value is also a string

          return { label, value };
        })
        .filter((option) => option.label !== ''); // Filter out options with empty labels
    }
    setJudgmentOptions(newJudgmentOptions);

    clearAllErrors();
  }, [formData]); // Dependency on formData ensures re-initialization when parent's formData changes

  const validateAndSetErrors = (): { isValid: boolean; data: ResultListComparisonFormData } => {
    let isValid = true;
    const currentData: ResultListComparisonFormData = {
      querySetId: querySetOptions[0]?.value || '',
      querySetName: querySetOptions[0]?.label || '',
      size: k,
      searchConfigurationList: selectedSearchConfigs.map((c) => ({ id: c.value, name: c.label })),
      judgmentList: judgmentOptions.map((j) => ({ id: j.value, name: j.label })),
      type: formData.type, // Preserve the type from the initial formData
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

    // Validate Search Configuration
    if (currentData.searchConfigurationList.length === 0) {
      setSearchConfigError(['Please select at least one search configuration.']);
      isValid = false;
    } else {
      setSearchConfigError([]);
    }

    // Validate Judgments
    if (currentData.judgmentList.length === 0) {
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
    const safeSelectedOptions = selectedOptions || []; // Ensure it's always an array
    setQuerySetOptions(safeSelectedOptions);
    const newQuerySetId = safeSelectedOptions?.[0]?.value || ''; // Use value for ID
    const newQuerySetName = safeSelectedOptions?.[0]?.label || ''; // Use label for name

    if (formData.querySetId !== newQuerySetId) {
      onChange('querySetId', newQuerySetId);
    }
    if (formData.querySetName !== newQuerySetName) { // Make sure this is also updated
      onChange('querySetName', newQuerySetName);
    }
    if (safeSelectedOptions.length > 0 && querySetError.length > 0) {
      setQuerySetError([]);
    }
  };

  const handleJudgmentsChange = (selectedOptions: OptionLabel[]) => {
    const safeSelectedOptions = selectedOptions || [];
    setJudgmentOptions(safeSelectedOptions);
    const newValues = safeSelectedOptions.map((o) => ({ id: o.value, name: o.label }));
    if (JSON.stringify(formData.judgmentList) !== JSON.stringify(newValues)) {
      onChange('judgmentList', newValues);
    }
    if (safeSelectedOptions.length > 0 && judgmentError.length > 0) {
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
    const safeSelectedOptions = selectedOptions || [];
    setSelectedSearchConfigs(safeSelectedOptions);
    const newValues = safeSelectedOptions.map((o) => ({ id: o.value, name: o.label }));
    if (JSON.stringify(formData.searchConfigurationList) !== JSON.stringify(newValues)) {
      onChange('searchConfigurationList', newValues);
    }
    if (safeSelectedOptions.length >= 2 && searchConfigError.length > 0) { // Changed condition for clearing error
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
          isInvalid={searchConfigError.length > 0}
          error={searchConfigError}
        >
          <SearchConfigForm
            selectedOptions={selectedSearchConfigs}
            onChange={handleSearchConfigChange}
            http={http}
            // maxNumberOfOptions={1} // Removed this if it's not a strict requirement for pointwise
            hideLabel={true}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow
          label="Judgments"
          isInvalid={judgmentError.length > 0}
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
