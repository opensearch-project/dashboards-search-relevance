import React, { useEffect, useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiComboBox } from '@elastic/eui';
import { SearchConfigOption, SearchConfigFromData } from './types';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';

interface SearchConfigFormProps {
  formData: SearchConfigFromData;
  onChange: (data: Partial<SearchConfigFromData>) => void;
  http: CoreStart['http'];
}

export const SearchConfigForm = ({ formData, onChange, http }: SearchConfigFormProps) => {
  const [searchConfigOptions, setSearchConfigOptions] = useState<SearchConfigOption[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState<boolean>(true);

  useEffect(() => {
    const fetchSearchConfigurations = async () => {
      try {
        const data = await http.get(ServiceEndpoints.SearchConfigurations);
        const options = data.hits.hits.map((search_config: any) => ({
          label: search_config._source.name,
          value: search_config._source.id,
        }));
        setSearchConfigOptions(options);
      } catch (error) {
        console.error('Failed to fetch search configurations', error);
        setSearchConfigOptions([]);
      } finally {
        setIsLoadingConfigs(false);
      }
    };

    fetchSearchConfigurations();
  }, [http]);

  const handleSearchConfigsChange = (selected: SearchConfigOption[]) => {
    const newData = {
      ...formData,
      searchConfigs: selected || [],
    };
    onChange(newData);
  };

  return (
    <EuiFlexGroup gutterSize="m" direction="column" style={{ maxWidth: 600 }}>
      <EuiFlexItem>
        <EuiFormRow
          label="Search Configurations"
          helpText="Select two or more search configurations"
        >
          <EuiComboBox
            placeholder="Select search configuration"
            options={searchConfigOptions}
            selectedOptions={formData.searchConfigs || []}
            onChange={(selected) => {
              if (selected.length <= 2) {
                handleSearchConfigsChange(selected);
              }
            }}
            isClearable={true}
            isInvalid={(formData.searchConfigs || []).length === 0}
            isLoading={isLoadingConfigs}
            multi={true}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
