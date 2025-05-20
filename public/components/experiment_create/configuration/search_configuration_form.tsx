import React, { useEffect, useState } from 'react';
import { EuiFormRow, EuiComboBox } from '@elastic/eui';
import { IndexOption } from './types';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';

interface SearchConfigFormProps {
  selectedOptions: IndexOption[];
  onChange: (selectedOptions: IndexOption[]) => void;
  http: CoreStart['http'];
}

export const SearchConfigForm = ({ selectedOptions, onChange, http }: SearchConfigFormProps) => {
  const [searchConfigOptions, setSearchConfigOptions] = useState<IndexOption[]>([]);
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

  return (
    <EuiFormRow
      label="Search Configurations"
      helpText="Select two or more search configurations"
    >
      <EuiComboBox
        placeholder="Select search configuration"
        options={searchConfigOptions}
        selectedOptions={selectedOptions}
        onChange={(selected) => {
          if (selected.length <= 2) {
            onChange(selected);
          }
        }}
        isClearable={true}
        isInvalid={selectedOptions.length === 0}
        isLoading={isLoadingConfigs}
        multi={true}
        fullWidth
      />
    </EuiFormRow>
  );
};
