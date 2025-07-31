/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiForm, EuiFormRow, EuiText, EuiSpacer } from '@elastic/eui';
import { QuerySetQueriesTable } from './query_set_queries_table';

interface QuerySetDetailsProps {
  querySet: {
    name: string;
    description: string;
    sampling: string;
    querySetQueries: any[];
  };
}

export const QuerySetDetails: React.FC<QuerySetDetailsProps> = ({ querySet }) => {
  return (
    <EuiForm>
      <EuiFormRow label="Query Set Name" fullWidth>
        <EuiText>{querySet.name}</EuiText>
      </EuiFormRow>

      <EuiFormRow label="Description" fullWidth>
        <EuiText>{querySet.description}</EuiText>
      </EuiFormRow>

      <EuiFormRow label="Sampling Method" fullWidth>
        <EuiText>{querySet.sampling}</EuiText>
      </EuiFormRow>

      <EuiSpacer size="l" />

      <EuiFormRow label="Queries" fullWidth>
        <QuerySetQueriesTable queries={querySet.querySetQueries || []} />
      </EuiFormRow>
    </EuiForm>
  );
};
