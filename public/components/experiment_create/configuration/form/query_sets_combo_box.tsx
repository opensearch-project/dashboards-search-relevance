/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { EuiFormRow, EuiComboBox } from '@elastic/eui';
import { OptionLabel } from '../types';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../../common';

interface QuerySetsComboBoxProps {
  selectedOptions: OptionLabel[];
  onChange: (selectedOptions: OptionLabel[]) => void;
  http: CoreStart['http'];
  hideLabel?: boolean;
}

export const QuerySetsComboBox = ({
  selectedOptions,
  onChange,
  http,
  hideLabel,
}: QuerySetsComboBoxProps) => {
  const [querySetOptions, setQuerySetOptions] = useState<OptionLabel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchQuerySets = async () => {
      try {
        const data = await http.get(ServiceEndpoints.QuerySets);
        const options = data.hits.hits.map((qs: any) => ({
          label: qs._source.name,
          value: qs._source.id,
        }));
       if (isMounted) {
         setQuerySetOptions(options);
       }
      } catch (error) {
        console.error('Failed to fetch query sets', error);
        if (isMounted) {
          setQuerySetOptions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchQuerySets();

    return () => {
      isMounted = false;
    }
  }, [http]);

  const comboBoxComponent = (
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
  );

  // Conditionally render EuiFormRow based on the hideLabel prop
  if (hideLabel) {
    return comboBoxComponent; // If hideLabel is true, just return the EuiComboBox
  } else {
    return (
      <EuiFormRow label="Query Sets">
        {' '}
        {/* If hideLabel is false or undefined, render with EuiFormRow */}
        {comboBoxComponent}
      </EuiFormRow>
    );
  }
};
