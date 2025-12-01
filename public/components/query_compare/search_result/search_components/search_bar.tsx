/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiCompressedFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui';
import React from 'react';

interface SearchBarProps {
  searchBarValue: string;
  setSearchBarValue: React.Dispatch<React.SetStateAction<string>>;
  onClickSearch: () => void;
  getNavGroupEnabled?: boolean;
  isSearching?: boolean;
}

export const SearchInputBar = ({
  searchBarValue,
  setSearchBarValue,
  onClickSearch,
  getNavGroupEnabled,
  isSearching = false,
}: SearchBarProps) => {
  return (
    <>
      {!getNavGroupEnabled && <EuiSpacer size="m" />}
      <EuiFlexGroup>
        <EuiFlexItem grow={true}>
          <EuiCompressedFieldSearch
            id="searchRelevance-searchBar"
            fullWidth={true}
            placeholder="Search"
            value={searchBarValue}
            onChange={(e) => setSearchBarValue(e.target.value)}
            isClearable={true}
            onSearch={onClickSearch}
            aria-label="Enter your Search query"
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSmallButton 
            fill 
            onClick={onClickSearch} 
            aria-label="searchRelevance-searchButton"
            isLoading={isSearching}
            disabled={isSearching}
          >
            Search
          </EuiSmallButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
