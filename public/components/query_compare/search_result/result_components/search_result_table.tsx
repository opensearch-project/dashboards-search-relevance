/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSpacer, EuiSplitPanel, EuiText } from '@elastic/eui';
import React from 'react';
import { ResultGridComponent } from './result_grid_component';

interface SearchResultTableProps {
  querqyResult1: any;
  querqyResult2: any;
}

export const SearchResultTable = ({ querqyResult1, querqyResult2 }: SearchResultTableProps) => {
  return (
    <EuiSplitPanel.Outer direction="row" hasShadow={false} hasBorder={false}>
      <EuiSplitPanel.Inner style={{ minHeight: '500px' }}>
        <EuiText>
          <h3>Search Result 1</h3>
        </EuiText>
        <EuiSpacer size="l" />
        <ResultGridComponent querqyResult={querqyResult1} />
      </EuiSplitPanel.Inner>
      <EuiSplitPanel.Inner style={{ minHeight: '500px' }}>
        <EuiText>
          <h3>Search Result 2</h3>
        </EuiText>
        <EuiSpacer size="l" />
        <ResultGridComponent querqyResult={querqyResult2} />
      </EuiSplitPanel.Inner>
    </EuiSplitPanel.Outer>
  );
};
