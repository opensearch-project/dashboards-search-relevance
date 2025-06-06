/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { EuiFormRow, EuiComboBox } from '@elastic/eui';
import { OptionLabel } from '../types';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../../common';

interface JudgmentsComboBoxProps {
  selectedOptions: JudgmentOption[];
  onChange: (selectedOptions: JudgmentOption[]) => void;
  http: CoreStart['http'];
}

export const JudgmentsComboBox = ({ selectedOptions, onChange, http }: JudgmentsComboBoxProps) => {
  const [judgmentOptions, setJudgmentOptions] = useState<OptionLabel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchJudgments = async () => {
      try {
        const data = await http.get(ServiceEndpoints.Judgments);
        const options = data.hits.hits.map((judgment: any) => ({
          label: judgment._source.name,
          value: judgment._source.id,
        }));
        setJudgmentOptions(options);
      } catch (error) {
        console.error('Failed to fetch judgments', error);
        setJudgmentOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJudgments();
  }, [http]);

  return (
    <EuiFormRow label="Judgments">
      <EuiComboBox
        placeholder={isLoading ? 'Loading...' : 'Select judgment list'}
        options={judgmentOptions}
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
