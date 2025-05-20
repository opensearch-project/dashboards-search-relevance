import React, { useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiFieldNumber } from '@elastic/eui';
import { ResultListComparisonFormData, IndexOption } from '../types';
import { CoreStart } from '../../../../../src/core/public';
import { SearchConfigForm } from '../search_configuration_form';
import { QuerySetsComboBox } from './query_sets_combo_box';
import { JudgmentsComboBox } from './judgments_combo_box';

interface UserBehaviorFormProps {
  formData: ResultListComparisonFormData;
  onChange: (field: keyof ResultListComparisonFormData, value: any) => void;
  http: CoreStart['http'];
}

export const UserBehaviorForm = ({
  formData,
  onChange,
  http,
}: UserBehaviorFormProps) => {
  const [selectedSearchConfigs, setSelectedSearchConfigs] = useState<IndexOption[]>([]);
  const [querySetOptions, setQuerySetOptions] = useState<IndexOption[]>([]);
  const [k, setK] = useState<number>(10);
  const [judgmentOptions, setJudgmentOptions] = useState<IndexOption[]>([]);

  const handleQuerySetsChange = (selectedOptions: any[]) => {
    setQuerySetOptions(selectedOptions || []);
    onChange('querySetId', selectedOptions?.[0]?.value);
  };

  const handleJudgmentsChange = (selectedOptions: IndexOption[]) => {
    setJudgmentOptions(selectedOptions || []);
    onChange('judgmentList', selectedOptions.map((o) => o.value));
  };

  const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setK(value);
    onChange('size', value);
  };

  const handleSearchConfigChange = (selectedOptions: IndexOption[]) => {
    setSelectedSearchConfigs(selectedOptions);
    onChange('searchConfigurationList', selectedOptions.map((o) => o.value));
  };

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup gutterSize="m" direction="row" style={{ maxWidth: 600 }}>
          <EuiFlexItem grow={4}>
            <QuerySetsComboBox
              selectedOptions={querySetOptions}
              onChange={handleQuerySetsChange}
              http={http}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={1}>
            <EuiFormRow label="K Value">
              <EuiFieldNumber
                placeholder="Enter k value"
                value={k}
                onChange={handleKChange}
                min={1}
                fullWidth
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <SearchConfigForm
          selectedOptions={selectedSearchConfigs}
          onChange={handleSearchConfigChange}
          http={http}
          maxNumberOfOptions={1}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <JudgmentsComboBox
          selectedOptions={judgmentOptions}
          onChange={handleJudgmentsChange}
          http={http}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
