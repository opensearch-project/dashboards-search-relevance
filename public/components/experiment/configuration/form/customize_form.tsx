import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiComboBox,
} from '@elastic/eui';
import { CustomizeFormData, QuerySetOption } from "../types";
import { mockupQuerySetOptions } from "../../mockup_data";

interface CustomizeFormProps {
  formData: CustomizeFormData;
  onChange: (field: keyof CustomizeFormData, value: any) => void;
}

export const CustomizeForm= ({
                               formData,
                               onChange
}: CustomizeFormProps) => {
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

      <EuiFlexItem grow={2}>
        <EuiFormRow label="Calculator">
          <EuiFieldText
            value={formData.calculator}
            onChange={(e) => onChange('calculator', e.target.value)}
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
