/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFormRow, EuiPanel, EuiText } from '@elastic/eui';

interface QueryPreviewProps {
  parsedQueries: string[];
}

export const QueryPreview: React.FC<QueryPreviewProps> = ({ parsedQueries }) => {
  if (parsedQueries.length === 0) {
    return null;
  }

  return (
    <EuiFormRow fullWidth label="Parsed Queries Preview">
      <EuiPanel paddingSize="s">
        <EuiText size="s">
          <h4>Preview ({parsedQueries.length} queries)</h4>
          <ul>
            {parsedQueries.slice(0, 5).map((query, idx) => {
              const parsed = JSON.parse(query);
              return (
                <li key={idx}>
                  <strong>Query:</strong> {parsed.queryText}
                  <br />
                  <strong>Reference:</strong> {parsed.referenceAnswer}
                </li>
              );
            })}
          </ul>
          {parsedQueries.length > 5 && <p>... and {parsedQueries.length - 5} more queries</p>}
        </EuiText>
      </EuiPanel>
    </EuiFormRow>
  );
};
