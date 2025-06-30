/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiFieldNumber } from '@elastic/eui';
import { OptionLabel, ResultListComparisonFormData } from '../types';
import { CoreStart } from '../../../../../src/core/public';
import { SearchConfigForm } from '../search_configuration_form';
import { QuerySetsComboBox } from './query_sets_combo_box';

export interface ResultListComparisonFormRef {
  validateAndSetErrors: () => { isValid: boolean; data: ResultListComparisonFormData };
  clearAllErrors: () => void;
}

interface ResultListComparisonFormProps {
  formData: ResultListComparisonFormData;
  onChange: (field: keyof ResultListComparisonFormData, value: any) => void;
  http: CoreStart['http'];
}

export const ResultListComparisonForm = forwardRef<
  ResultListComparisonFormRef,
  ResultListComparisonFormProps
>(({ formData, onChange, http }, ref) => {
  const [querySetOptions, setQuerySetOptions] = useState<OptionLabel[]>([]);
  const [selectedSearchConfigs, setSelectedSearchConfigs] = useState<OptionLabel[]>([]);
  const [k, setK] = useState<number>(10);

  const [querySetError, setQuerySetError] = useState<string[]>([]);
  const [kError, setKError] = useState<string[]>([]);
  const [searchConfigError, setSearchConfigError] = useState<string[]>([]);

  const clearAllErrors = () => {
    setQuerySetError([]);
    setKError([]);
    setSearchConfigError([]);
  };

  useEffect(() => {
    setQuerySetOptions(
      formData?.querySetId ? [{ label: formData.querySetName, value: formData.querySetId }] : []
    );
    setSelectedSearchConfigs(
      Array.isArray(formData?.searchConfigurationList)
        ? formData.searchConfigurationList.map((config) => ({
          label: config.name || config.id,
          value: config.id,
          }))
       : []
   );
    setK(formData?.size !== undefined && formData?.size !== null ? formData.size : 10);
    clearAllErrors();
  }, [formData]);

  const validateAndSetErrors = (): { isValid: boolean; data: ResultListComparisonFormData } => {
    let isValid = true;

    const currentData: ResultListComparisonFormData = {
      querySetId: querySetOptions[0]?.value || '',
      size: k,
      searchConfigurationList: selectedSearchConfigs.map((c) => ({ id: c.value, name: c.label })),
      type: formData.type,
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

    // Validate Search Configuration (at least two are needed for comparison)
    if (currentData.searchConfigurationList.length < 2) {
      setSearchConfigError(['Please select at least two search configurations to compare.']);
      isValid = false;
    } else {
      setSearchConfigError([]);
    }

    return { isValid, data: currentData };
  };

  useImperativeHandle(ref, () => ({
    validateAndSetErrors,
    clearAllErrors,
  }));

  const handleQuerySetsChange = (selectedOptions: OptionLabel[]) => {
    setQuerySetOptions(selectedOptions || []);
    const newQuerySetId = selectedOptions?.[0]?.label || '';
    const newQuerySetName = selectedOptions?.[0]?.label || '';

    if (formData.querySetId !== newQuerySetId) {
      onChange('querySetId', newQuerySetId);
    }
    if (formData.querySetName !== newQuerySetName) {
      onChange('querySetName', newQuerySetName);
    }
    if (selectedOptions.length > 0 && querySetError.length > 0) {
      setQuerySetError([]);
    }
  };

  const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setK(value);
    // Optimize onChange call
    if (formData.size !== value) {
      onChange('size', value);
    }
    if (!isNaN(value) && value >= 1 && kError.length > 0) {
      setKError([]);
    }
  };

  const handleSearchConfigChange = (selectedOptions: OptionLabel[]) => {
    setSelectedSearchConfigs(selectedOptions);
    const newValues = selectedOptions.map((o) => ({ id: o.value, name: o.label }));
    // Optimize onChange call
    if (JSON.stringify(formData.searchConfigurationList) !== JSON.stringify(newValues)) {
      onChange('searchConfigurationList', newValues);
    }
    if (selectedOptions.length >= 2 && searchConfigError.length > 0) {
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
          label="Search Configurations"
          helpText={`Select ${2} search configuration${
            2 > 1 ? 's' : ''
          } to compare against each other.`}
          isInvalid={searchConfigError.length > 0}
          error={searchConfigError}
        >
          <SearchConfigForm
            selectedOptions={selectedSearchConfigs}
            onChange={handleSearchConfigChange}
            http={http}
            maxNumberOfOptions={2}
            hideLabel={true}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
});
