import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiFieldText, EuiComboBox } from '@elastic/eui';
import { QuerySetOption, UserBehaviorFormData } from '../types';
import { mockupQuerySetOptions } from '../../../resource_management_home/mockup_data';

interface UserBehaviorFormProps {
  formData: UserBehaviorFormData;
  onChange: (field: keyof UserBehaviorFormData, value: any) => void;
}

export const UserBehaviorForm = ({ formData, onChange }: UserBehaviorFormProps) => {
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
              multi={true}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <EuiFormRow label="Start Date">
            <EuiFieldText
              value={formData.startDate}
              onChange={(e) => onChange('startDate', e.target.value)}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <EuiFormRow label="End Date">
            <EuiFieldText
              value={formData.endDate}
              onChange={(e) => onChange('endDate', e.target.value)}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <EuiFormRow label="Collect Model">
            <EuiFieldText
              placeholder="CLICK_MODEL"
              value={formData.collectSignal}
              onChange={(e) => onChange('collectSignal', e.target.value)}
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
