/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCompressedFormRow, EuiSelect, EuiFieldNumber, EuiDatePicker, EuiComboBox } from '@elastic/eui';
import moment from 'moment';

interface UBIJudgmentFieldsProps {
  formData: any;
  updateFormData: (updates: any) => void;
  dateRangeError?: string;
  indexOptions: Array<{ label: string; value: string }>;
  isLoadingIndexes: boolean;
}

export const UBIJudgmentFields: React.FC<UBIJudgmentFieldsProps> = ({
  formData,
  updateFormData,
  dateRangeError,
  indexOptions,
  isLoadingIndexes,
}) => {
  const handleDateChange = (date: moment.Moment | null, fieldName: string) => {
    // If a date is selected, format it; otherwise, set to null or an empty string
    const formattedDate = date ? date.format('YYYY-MM-DD') : '';
    updateFormData({ [fieldName]: formattedDate });
  };
  return (
    <>
      <EuiCompressedFormRow label="Click Model"
        helpText="Choose the click model to calculate implicit judgments with."
        fullWidth>
        <EuiSelect
          options={[{ value: 'coec', text: 'COEC' }]}
          value={formData.clickModel}
          onChange={(e) => updateFormData({ clickModel: e.target.value })}
        />
      </EuiCompressedFormRow>

      <EuiCompressedFormRow label="Max Rank"
        helpText="Choose the maximum rank of behavioral data events to consider for implicit judgments."
        fullWidth>
        <EuiFieldNumber
          value={formData.maxRank}
          onChange={(e) => updateFormData({ maxRank: parseInt(e.target.value, 10) })}
          min={1}
          fullWidth
        />
      </EuiCompressedFormRow>
      <EuiCompressedFormRow label="Start Date"
        helpText="The date from which behavioral data events are being taken into account for implicit judgment generation."
        fullWidth>
        <EuiDatePicker
          selected={formData.startDate ? moment(formData.startDate) : null}
          onChange={(date) => handleDateChange(date, 'startDate')}
          dateFormat="YYYY-MM-DD"
          fullWidth
          showTimeSelect={false}
        />
      </EuiCompressedFormRow>
      <EuiCompressedFormRow
        label="End Date"
        helpText="The date until which behavioral data events are being taken into account for implicit judgment generation."
        isInvalid={!!dateRangeError}
        error={dateRangeError ? [dateRangeError] : undefined}
        fullWidth>
        <EuiDatePicker
          selected={formData.endDate ? moment(formData.endDate) : null}
          onChange={(date) => handleDateChange(date, 'endDate')}
          dateFormat="YYYY-MM-DD"
          fullWidth
          showTimeSelect={false}
        />
      </EuiCompressedFormRow>
      <EuiCompressedFormRow
        label="UBI Events Index (Optional)"
        helpText="Select from UBI queries indexes or type a custom index name and press Enter. Leave empty to use default."
        fullWidth>
        <EuiComboBox
          placeholder="Select or type UBI events index"
          options={indexOptions}
          selectedOptions={formData.ubi_events_index ? [{ label: formData.ubi_events_index, value: formData.ubi_events_index }] : []}
          onChange={(selected) => updateFormData({ ubi_events_index: selected[0]?.label || '' })}
          onCreateOption={(searchValue) => {
            const trimmed = searchValue.trim();
            if (trimmed) {
              updateFormData({ ubi_events_index: trimmed });
            }
          }}
          singleSelection={{ asPlainText: true }}
          isLoading={isLoadingIndexes}
          isClearable={true}
          fullWidth
          customOptionText="Use custom index: {searchValue}"
        />
      </EuiCompressedFormRow>
    </>
  );
};
