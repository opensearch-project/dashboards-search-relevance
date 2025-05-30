/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiLoadingSpinner, EuiPanel, EuiSpacer } from '@elastic/eui';
import { uniqueId } from 'lodash';

interface ResultsPanelProps {
  isValidating: boolean;
  searchResults: any;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ isValidating, searchResults }) => {
  if (isValidating) {
    return (
      <EuiPanel>
        <EuiLoadingSpinner size="l" />
      </EuiPanel>
    );
  }

  if (!searchResults?.hits?.hits || searchResults.hits.hits.length === 0) {
    return null;
  }

  const hits = searchResults.hits.hits;

  const getTds = (document: any, documentRank: number) => {
    const cells = [
      <td key="rank" className="osdDocTable__cell">
        {documentRank}
      </td>,
      <td key="id" className="osdDocTable__cell">
        {document._id}
      </td>,
    ];

    Object.entries(document._source).forEach(([key, value]) => {
      cells.push(
        <td key={key} className="osdDocTable__cell">
          {String(value)}
        </td>
      );
    });

    return cells;
  };

  const getHeaders = () => {
    const firstHit = hits[0];
    if (!firstHit?._source) return [];

    return [
      <th key="rank" className="osdDocTable__header">
        Rank
      </th>,
      <th key="id" className="osdDocTable__header">
        ID
      </th>,
      ...Object.keys(firstHit._source).map((key) => (
        <th key={key} className="osdDocTable__header">
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </th>
      )),
    ];
  };

  const resultGrid = () => {
    return (
      <>
        {hits.map((document: any, documentRank: number) => {
          return (
            <tr className="osdDocTable__row" key={uniqueId('documentId-')}>
              {getTds(document, documentRank + 1)}
            </tr>
          );
        })}
      </>
    );
  };

  return (
    <EuiPanel>
      <h3>Search Results ({hits.length} hits)</h3>
      <EuiSpacer size="s" />
      <div className="dscTable dscTableFixedScroll">
        <table className="osd-table table" data-test-subj="docTable">
          <thead>
            <tr className="osdDocTable__headerRow">{getHeaders()}</tr>
          </thead>
          <tbody>{resultGrid()}</tbody>
        </table>
      </div>
    </EuiPanel>
  );
};
