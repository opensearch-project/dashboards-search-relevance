import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiComboBox,
} from '@elastic/eui';
import { ResultListComparisonFormData, QuerySetOption } from "../types";
import { mockupQuerySetOptions } from "../../mockup_data";

interface ResultListComparisonFormProps {
  formData: ResultListComparisonFormData;
  onChange: (field: keyof ResultListComparisonFormData, value: any) => void;
}

export const ResultListComparisonForm= ({
                               formData,
                               onChange
}: ResultListComparisonFormProps) => {
  const handleQuerySetsChange = (selectedOptions: QuerySetOption[]) => {
    onChange('querySets', selectedOptions || []);
  };

  return (
    <>
    <EuiFlexGroup gutterSize="m" direction="row" style={{ maxWidth: 600 }}>
      <EuiFlexItem grow={4}>
        <EuiFormRow
          label="Query Sets"
        >
          <EuiComboBox
            placeholder="Select query sets"
            options={mockupQuerySetOptions}
            selectedOptions={formData.querySets}
            onChange={handleQuerySetsChange}
            isClearable={true}
            isInvalid={formData.querySets.length === 0}
            multi={true}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
    </>
  );
};
