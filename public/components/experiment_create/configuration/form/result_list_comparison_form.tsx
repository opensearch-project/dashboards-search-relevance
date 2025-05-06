import React, { useEffect, useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiComboBox, EuiFieldNumber } from '@elastic/eui';
import { ResultListComparisonFormData, QuerySetOption } from '../types';
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
  const [k, setK] = useState<number>(10);

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

  const handleQuerySetsChange = (selectedOptions: QuerySetOption[]) => {
    onChange('querySets', selectedOptions || []);
  };

  const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setK(value);
    onChange('k', value);
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
            singleSelection={{ asPlainText: true }}
            isLoading={isLoading}
            async
            fullWidth
          />
        </EuiFormRow>
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
  );
};
