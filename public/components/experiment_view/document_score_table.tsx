/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexGroup,
  EuiTitle,
  EuiPanel,
  EuiFlexItem,
  EuiBasicTable,
  EuiButton,
  EuiSpacer,
} from '@elastic/eui';
import React from 'react';

export const DocumentScoresTable: React.FC<{
  queryText: string;
  documentScores: Array<{ docId: string; rating: string }>;
}> = ({ queryText, documentScores }) => {
  const downloadCsv = () => {
    // Create CSV content
    const headers = ['Document ID', 'Rating'];
    const csvContent = [
      headers.join(','),
      ...documentScores.map((item) => `${item.docId},${item.rating}`),
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `document_scores_${queryText}_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <EuiPanel>
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiTitle size="s">
            <h3>Document Scores for "{queryText}"</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton size="s" onClick={downloadCsv} iconType="download">
            Download CSV
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <EuiBasicTable
        items={documentScores}
        columns={[
          {
            field: 'docId',
            name: 'Document ID',
            sortable: true,
          },
          {
            field: 'rating',
            name: 'Rating',
            sortable: true,
          },
        ]}
      />
    </EuiPanel>
  );
};
