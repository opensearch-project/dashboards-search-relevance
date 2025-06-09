import React, { useEffect, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiComboBox,
} from "@elastic/eui";
import { SearchConfigOption, SearchConfigFromData } from "./types";
import { getSearchConfigurations } from '../../../services';
import { CoreStart } from '../../../../../src/core/public';

interface SearchConfigFormProps {
  formData: SearchConfigFromData;
  onChange: (data: SearchConfigFromData) => void;
  http: CoreStart['http'];
}

export const SearchConfigForm = ({
  formData,
  onChange,
  http,
}: SearchConfigFormProps) => {
    const [searchConfigOptions, setSearchConfigOptions] = useState<SearchConfigOption[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
      const fetchSearchConfigurations = async () => {
        try {
          const data = await getSearchConfigurations(http);
          if (data.ok) {
            // parse JSON data and build label/value object where labels are displayed in dropdown selection box

            const parsed = JSON.parse(data.resp);
            const options = parsed.map((search_config: any) => ({
                            label: search_config.search_configuration_name,
                            value: search_config.id,
                          }));
            setSearchConfigOptions(options);
          }
        } catch (error) {
          console.error('Failed to fetch query sets', error);
          setSearchConfigOptions([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSearchConfigurations();
    }, [http]);

    const handleSearchConfigsChange = (selected: SearchConfigOption[]) => {
    onChange({
      searchConfigs: selected || [],
    });
  };

  return (
    <EuiFlexGroup gutterSize="m" direction="row" style={{ maxWidth: 600 }}>
      <EuiFlexItem grow={4}>
        <EuiFormRow
          label="Search Configurations"
          helpText="Select two or more search configurations"
        >
          <EuiComboBox
            placeholholder="Select search configuration"
            options={searchConfigOptions}
            selectedOptions={formData.searchConfigs}
            onChange={handleSearchConfigsChange}
            isClearable={true}
            isInvalid={formData.searchConfigs.length === 0}
            multi={true}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
