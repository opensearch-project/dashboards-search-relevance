/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiBasicTable, EuiCode, EuiCodeBlock, EuiText } from '@elastic/eui';
import { LtrFeature } from '../types';

interface LtrFeatureTableProps {
  features: LtrFeature[];
}

/**
 * The feature set a model was built from. Templates are shown in full rather than
 * summarized — knowing which query a feature actually runs is the reason to open this view.
 */
export const LtrFeatureTable: React.FC<LtrFeatureTableProps> = ({ features }) => {
  if (!features.length) {
    return <EuiText size="s">This model&apos;s feature set has no features.</EuiText>;
  }

  const columns = [
    {
      field: 'name',
      name: 'Feature',
      width: '25%',
      render: (name: string) => <EuiText size="s">{name}</EuiText>,
    },
    {
      field: 'params',
      name: 'Parameters',
      width: '20%',
      render: (params: string[]) =>
        params.length ? (
          <EuiText size="s">
            {params.map((param) => (
              <EuiCode key={param}>{param}</EuiCode>
            ))}
          </EuiText>
        ) : (
          <EuiText size="s">&mdash;</EuiText>
        ),
    },
    {
      field: 'template',
      name: 'Template',
      render: (template: any) => (
        <EuiCodeBlock language="json" fontSize="s" paddingSize="s" isCopyable={true}>
          {JSON.stringify(template, null, 2)}
        </EuiCodeBlock>
      ),
    },
  ];

  return (
    <EuiBasicTable
      items={features}
      columns={columns}
      tableLayout="auto"
      data-test-subj="ltrFeatureTable"
    />
  );
};
