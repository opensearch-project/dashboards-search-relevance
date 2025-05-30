import React, { useEffect, useState } from 'react';
import { EuiFormRow, EuiComboBox } from '@elastic/eui';
import { IndexOption } from '../types';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../../common';

interface QuerySetsComboBoxProps {
  selectedOptions: IndexOption[];
  onChange: (selectedOptions: IndexOption[]) => void;
  http: CoreStart['http'];
}

export const QuerySetsComboBox = ({
  selectedOptions,
  onChange,
  http,
}: QuerySetsComboBoxProps) => {
  const [querySetOptions, setQuerySetOptions] = useState<IndexOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQuerySets = async () => {
      try {
        const data = await http.get(ServiceEndpoints.QuerySets);
        const options = data.hits.hits.map((qs: any) => ({
          label: qs._source.name,
          value: qs._source.id,
        }));
        setQuerySetOptions(options);
      } catch (error) {
        console.error('Failed to fetch query sets', error);
        setQuerySetOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuerySets();
  }, [http]);

  return (
    <EuiFormRow label="Query Sets">
      <EuiComboBox
        placeholder={isLoading ? 'Loading...' : 'Select query sets'}
        options={querySetOptions}
        selectedOptions={selectedOptions}
        onChange={onChange}
        isClearable
        isInvalid={selectedOptions.length === 0}
        singleSelection={{ asPlainText: true }}
        isLoading={isLoading}
        async
        fullWidth
      />
    </EuiFormRow>
  );
}; 