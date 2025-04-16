import React, { useEffect, useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiComboBox } from '@elastic/eui';
import { SearchConfigOption, SearchConfigFromData, IndexOption } from './types';
import { CoreStart } from '../../../../../src/core/public';
import { INDEX_NODE_API_PATH, ServiceEndpoints } from '../../../../common';
import { DocumentsIndex } from '../../../types';

interface SearchConfigFormProps {
  formData: SearchConfigFromData;
  onChange: (data: Partial<SearchConfigFromData>) => void;
  http: CoreStart['http'];
}

export const SearchConfigForm = ({ formData, onChange, http }: SearchConfigFormProps) => {
  const [searchConfigOptions, setSearchConfigOptions] = useState<SearchConfigOption[]>([]);
  const [indexOptions, setIndexOptions] = useState<IndexOption[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState<boolean>(true);
  const [isLoadingIndexes, setIsLoadingIndexes] = useState<boolean>(true);

  // need to initialize with defaulted form data with empty lists.
  const [defaultFormData, setDefaultFormData] = useState<SearchConfigFromData>({
    searchConfigs: [],
    indexes: [],
    ...formData,
  });

  useEffect(() => {
    setDefaultFormData({
      searchConfigs: [],
      indexes: [],
      ...formData,
    });
  }, [formData]);

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

    const fetchIndexes = async () => {
      try {
        const res = await http.get(`${INDEX_NODE_API_PATH}`);
        const options = res.map((index: DocumentsIndex) => ({
          label: index.index,
          value: index.uuid,
        }));
        setIndexOptions(options);
      } catch (error) {
        console.error('Failed to fetch indexes', error);
        setIndexOptions([]);
      } finally {
        setIsLoadingIndexes(false);
      }
    };

    fetchSearchConfigurations();
    fetchIndexes();
  }, [http]);

  const handleSearchConfigsChange = (selected: SearchConfigOption[]) => {
    const newData = {
      ...defaultFormData,
      searchConfigs: selected || [],
    };
    onChange(newData);
  };

  const handleIndexesChange = (selected: IndexOption[]) => {
    const newData = {
      ...defaultFormData,
      indexes: selected || [],
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
            selectedOptions={defaultFormData.searchConfigs || []}
            onChange={handleSearchConfigsChange}
            isClearable={true}
            isInvalid={(defaultFormData.searchConfigs || []).length === 0}
            isLoading={isLoadingConfigs}
            multi={true}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow label="Index" helpText="Select one index">
          <EuiComboBox
            placeholder="Select index"
            options={indexOptions}
            selectedOptions={defaultFormData.indexes || []}
            onChange={handleIndexesChange}
            isClearable={true}
            isInvalid={(defaultFormData.indexes || []).length === 0}
            isLoading={isLoadingIndexes}
            multi={true}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
