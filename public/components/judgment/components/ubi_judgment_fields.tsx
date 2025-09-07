/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCompressedFormRow, EuiSelect, EuiFieldNumber, EuiDatePicker } from '@elastic/eui';
import moment from 'moment';

interface UBIJudgmentFieldsProps {
  formData: any;
  updateFormData: (updates: any) => void;
  dateRangeError?: string;
}

export const UBIJudgmentFields: React.FC<UBIJudgmentFieldsProps> = ({
  formData,
  updateFormData,
  dateRangeError,
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
    </>
  );
};
