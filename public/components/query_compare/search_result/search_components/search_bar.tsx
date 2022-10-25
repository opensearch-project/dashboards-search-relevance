/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiFieldSearch, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import React from 'react';

interface SearchBarProps {
  searchBarValue: string;
  setSearchBarValue: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  onClickSearch: () => void;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SearchInputBar = ({
  searchBarValue,
  setSearchBarValue,
  isLoading,
  onClickSearch,
  setIsCollapsed,
}: SearchBarProps) => {
  return (
    <EuiFlexGroup justifyContent="center">
      <EuiFlexItem grow={false}>
        <EuiFieldSearch
          style={{ width: '700px' }}
          fullWidth={true}
          placeholder="Enter Search Query"
          value={searchBarValue}
          onChange={(e) => setSearchBarValue(e.target.value)}
          isClearable={true}
          isLoading={isLoading}
          onSearch={(value) => {}}
          aria-label="Enter your Search query"
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButton
          fill
          onClick={() => {
            setIsCollapsed(true);
            onClickSearch();
          }}
        >
          Search
        </EuiButton>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButton
          onClick={() => {
            setSearchBarValue('');
          }}
        >
          Clear
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
