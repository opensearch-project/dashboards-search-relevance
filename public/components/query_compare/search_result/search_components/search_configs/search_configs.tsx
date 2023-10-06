/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiPanel, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';

import '../../../../../ace-themes/sql_console';
import { SearchConfig } from './search_config';
import { useSearchRelevanceContext } from '../../../../../contexts';

import './search_configs.scss';
import { QueryError } from '../../../../../../public/types/index';

interface SearchConfigsPanelProps {
  queryString1: string;
  queryString2: string;
  setQueryString1: React.Dispatch<React.SetStateAction<string>>;
  setQueryString2: React.Dispatch<React.SetStateAction<string>>;
  queryError1: QueryError;
  queryError2: QueryError;
  setQueryError1: React.Dispatch<React.SetStateAction<QueryError>>;
  setQueryError2: React.Dispatch<React.SetStateAction<QueryError>>;
}

export const SearchConfigsPanel = ({
  queryString1,
  queryString2,
  setQueryString1,
  setQueryString2,
  queryError1,
  queryError2,
  setQueryError1,
  setQueryError2,
}: SearchConfigsPanelProps) => {
  const {
    selectedIndex1,
    setSelectedIndex1,
    selectedIndex2,
    setSelectedIndex2,
  } = useSearchRelevanceContext();

  return (
    <EuiPanel
      hasShadow={false}
      color="transparent"
      grow={false}
      borderRadius="none"
      className="right-border left-border"
    >
      <EuiFlexGroup>
        <EuiFlexItem className="search-relevance-config">
          <SearchConfig
            queryNumber={1}
            queryString={queryString1}
            setQueryString={setQueryString1}
            selectedIndex={selectedIndex1}
            setSelectedIndex={setSelectedIndex1}
            queryError={queryError1}
            setQueryError={setQueryError1}
          />
        </EuiFlexItem>
        <EuiFlexItem className="search-relevance-config">
          <SearchConfig
            queryNumber={2}
            queryString={queryString2}
            setQueryString={setQueryString2}
            selectedIndex={selectedIndex2}
            setSelectedIndex={setSelectedIndex2}
            queryError={queryError2}
            setQueryError={setQueryError2}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
