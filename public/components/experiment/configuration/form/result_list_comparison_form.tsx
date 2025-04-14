import React, { useEffect, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiComboBox,
} from '@elastic/eui';
import { ResultListComparisonFormData, QuerySetOption } from "../types";
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../../common';

interface ResultListComparisonFormProps {
  formData: ResultListComparisonFormData;
  onChange: (field: keyof ResultListComparisonFormData, value: any) => void;
  http: CoreStart['http'];
}

export const ResultListComparisonForm = ({
  formData,
  onChange,
  http,
}: ResultListComparisonFormProps) => {
  const [querySetOptions, setQuerySetOptions] = useState<QuerySetOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQuerySets = async () => {
      try {
        const data = await http.get(ServiceEndpoints.QuerySets);
        const options = data.hits.hits.map((qs: any) => ({
          label: qs._source.name,
          value: qs._source.id,
        }))
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

  const handleQuerySetsChange = (selectedOptions: QuerySetOption[]) => {
    onChange('querySets', selectedOptions || []);
  };

  return (
    <EuiFlexGroup gutterSize="m" direction="row" style={{ maxWidth: 600 }}>
      <EuiFlexItem grow={4}>
        <EuiFormRow label="Query Sets">
          <EuiComboBox
            placeholder={isLoading ? 'Loading...' : 'Select query sets'}
            options={querySetOptions}
            selectedOptions={formData.querySets}
            onChange={handleQuerySetsChange}
            isClearable
            isInvalid={formData.querySets.length === 0}
            isLoading={isLoading}
            async
            fullWidth
            multi
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
