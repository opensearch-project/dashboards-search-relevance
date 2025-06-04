/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { EuiFormRow, EuiComboBox } from '@elastic/eui';
import { OptionLabel } from './types';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';

interface SearchConfigFormProps {
  selectedOptions: OptionLabel[];
  onChange: (selectedOptions: OptionLabel[]) => void;
  http: CoreStart['http'];
  maxNumberOfOptions: number;
}

export const SearchConfigForm = ({
  selectedOptions,
  onChange,
  http,
  maxNumberOfOptions,
}: SearchConfigFormProps) => {
  const [searchConfigOptions, setSearchConfigOptions] = useState<OptionLabel[]>([]);
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
      helpText={`Select ${maxNumberOfOptions} search configuration${
        maxNumberOfOptions > 1 ? 's' : ''
      }${maxNumberOfOptions > 1 ? ' to compare against each other' : ''}.`}
    >
      <EuiComboBox
        placeholder="Select search configuration"
        options={searchConfigOptions}
        selectedOptions={selectedOptions}
        onChange={(selected) => {
          if (selected.length > maxNumberOfOptions) {
            return;
          }
          onChange(selected);
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
