/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiFieldSearch, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import React from 'react';

interface SearchBarProps {
  searchBarValue: string;
  setSearchBarValue: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  onClickSearch: () => void;
}

export const SearchInputBar = ({
  searchBarValue,
  setSearchBarValue,
  isLoading,
  onClickSearch,
}: SearchBarProps) => {
  return (
    <>
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        <EuiFlexItem grow={true}>
          <EuiFieldSearch
            fullWidth={true}
            placeholder="Search"
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
              onClickSearch();
            }}
          >
            Search
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
