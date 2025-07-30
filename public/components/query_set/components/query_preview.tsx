/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFormRow, EuiPanel, EuiText } from '@elastic/eui';

interface QueryPreviewProps {
  parsedQueries: string[];
  isTextInput?: boolean;
}

export const QueryPreview: React.FC<QueryPreviewProps> = ({ parsedQueries, isTextInput = false }) => {
  if (parsedQueries.length === 0) {
    return null;
  }

  return (
    <EuiFormRow fullWidth label="Queries Preview">
      <EuiPanel paddingSize="s">
        <EuiText size="s">
          <h4>
            Preview ({parsedQueries.length} {parsedQueries.length === 1 ? 'query' : 'queries'})
            {isTextInput && <small> - from text input</small>}
          </h4>
          <ul>
            {parsedQueries.slice(0, 5).map((query, idx) => {
              const parsed = JSON.parse(query);
              return (
                <li key={idx}>
                  <strong>Query:</strong> {parsed.queryText}
                  {parsed.referenceAnswer && (
                    <>
                      <br />
                      <strong>Reference:</strong> {parsed.referenceAnswer}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
          {parsedQueries.length > 5 && (
            <p>... and {parsedQueries.length - 5} more {parsedQueries.length - 5 === 1 ? 'query' : 'queries'}</p>
          )}
        </EuiText>
      </EuiPanel>
    </EuiFormRow>
  );
};
