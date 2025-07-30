/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCompressedFormRow, EuiSelect, EuiFieldNumber } from '@elastic/eui';

interface UBIJudgmentFieldsProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export const UBIJudgmentFields: React.FC<UBIJudgmentFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <>
      <EuiCompressedFormRow label="Click Model" fullWidth>
        <EuiSelect
          options={[{ value: 'coec', text: 'COEC' }]}
          value={formData.clickModel}
          onChange={(e) => updateFormData({ clickModel: e.target.value })}
        />
      </EuiCompressedFormRow>

      <EuiCompressedFormRow label="Max Rank" fullWidth>
        <EuiFieldNumber
          value={formData.maxRank}
          onChange={(e) => updateFormData({ maxRank: parseInt(e.target.value, 10) })}
          min={1}
          fullWidth
        />
      </EuiCompressedFormRow>
    </>
  );
};
