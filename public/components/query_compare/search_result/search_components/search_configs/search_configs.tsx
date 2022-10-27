/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiPanel, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import React from 'react';
import '../../../../../ace-themes/sql_console';
import { SearchConfig } from './search_config';

interface SearchConfigsPanelProps {
  isCollapsed: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, setter: any) => void;
  searchIndex1: string;
  searchIndex2: string;
  setSearchIndex1: React.Dispatch<React.SetStateAction<string>>;
  setSearchIndex2: React.Dispatch<React.SetStateAction<string>>;
  queryString1: string;
  queryString2: string;
  setQueryString1: React.Dispatch<React.SetStateAction<string>>;
  setQueryString2: React.Dispatch<React.SetStateAction<string>>;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SearchConfigsPanel = ({
  isCollapsed,
  onChange,
  searchIndex1,
  searchIndex2,
  setSearchIndex1,
  setSearchIndex2,
  queryString1,
  queryString2,
  setQueryString1,
  setQueryString2,
  setIsCollapsed,
}: SearchConfigsPanelProps) => {
  return (
    <EuiPanel
      hasShadow={false}
      hasBorder={false}
      color="transparent"
      grow={false}
      borderRadius="none"
      style={{ borderBottom: '1px solid #D3DAE6' }}
    >
      <EuiFlexGroup>
        <EuiFlexItem>
          <SearchConfig
            title="Query 1"
            setSearchIndex={setSearchIndex1}
            queryString={queryString1}
            setQueryString={setQueryString1}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <SearchConfig
            title="Query 2"
            setSearchIndex={setSearchIndex2}
            queryString={queryString2}
            setQueryString={setQueryString2}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
