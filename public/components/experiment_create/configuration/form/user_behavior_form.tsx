import React, { useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiFieldNumber } from '@elastic/eui';
import { ResultListComparisonFormData, SearchConfigFromData, JudgmentOption, QuerySetOption } from '../types';
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
  const [searchConfigData, setSearchConfigData] = useState<SearchConfigFromData>({
    searchConfigs: [],
  });
  const [querySetOptions, setQuerySetOptions] = useState<QuerySetOption[]>([]);
  const [k, setK] = useState<number>(10);
  const [judgmentOptions, setJudgmentOptions] = useState<JudgmentOption[]>([]);

  const handleQuerySetsChange = (selectedOptions: any[]) => {
    setQuerySetOptions(selectedOptions || []);
    onChange('querySetId', selectedOptions?.[0]?.value);
  };

  const handleJudgmentsChange = (selectedOptions: JudgmentOption[]) => {
    setJudgmentOptions(selectedOptions || []);
    onChange('judgmentList', selectedOptions.map((o) => o.value));
  };

  const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setK(value);
    onChange('size', value);
  };

  const handleSearchConfigChange = (data: SearchConfigFromData) => {
    setSearchConfigData(data);
    onChange('searchConfigurationList', data.searchConfigs.map((o) => o.value));
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
          formData={searchConfigData}
          onChange={handleSearchConfigChange}
          http={http}
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
