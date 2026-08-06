/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { getDisplayQuery } from '../utils/query_display';

interface ConfigQueryPreviewProps {
  queryA: string;
  queryB: string;
  configAName: string;
  configBName: string;
  searchText: string;
}

/** Side-by-side view of the two configurations' queries with the search text substituted in. */
export const ConfigQueryPreview: React.FC<ConfigQueryPreviewProps> = ({
  queryA,
  queryB,
  configAName,
  configBName,
  searchText,
}) => {
  if (!queryA && !queryB) return null;

  const panels: Array<{ label: string; name: string; query: string }> = [
    { label: 'A', name: configAName, query: queryA },
    { label: 'B', name: configBName, query: queryB },
  ];

  return (
    <EuiFlexGroup>
      {panels.map(({ label, name, query }) => (
        <EuiFlexItem key={label}>
          <EuiPanel paddingSize="m">
            <EuiTitle size="xs">
              <h4>
                Config {label}: {name}
              </h4>
            </EuiTitle>
            <EuiSpacer size="s" />
            <EuiCodeBlock
              language="json"
              fontSize="s"
              paddingSize="m"
              overflowHeight={150}
              isCopyable
              whiteSpace="pre"
            >
              {getDisplayQuery(query, searchText)}
            </EuiCodeBlock>
          </EuiPanel>
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  );
};
