/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiFormRow,
  EuiCodeEditor,
  EuiButtonIcon,
  EuiButton,
} from '@elastic/eui';
import React from 'react';
import '../../../../ace-themes/sql_console';

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
    <EuiPanel paddingSize="m">
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiButtonIcon
            color="text"
            display="base"
            iconType={isCollapsed ? 'arrowDown' : 'arrowRight'}
            iconSize="m"
            size="s"
            aria-label="Next"
            onClick={() => setIsCollapsed(!isCollapsed)}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiTitle size="s">
            <h2>Search Configs</h2>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
      {!isCollapsed && (
        <>
          <EuiSpacer size="l" />
          <EuiFlexGroup>
            <EuiFlexItem>
              <div>
                <EuiFormRow
                  fullWidth
                  label="Search Index 1"
                  helpText="Enter the index or index pattern for the query"
                >
                  <EuiFieldText
                    name="searchIndex1"
                    value={searchIndex1}
                    onChange={(e) => setSearchIndex1(e.target.value)}
                    aria-label="searchIndex1"
                  />
                </EuiFormRow>

                <EuiFormRow
                  fullWidth
                  label="Query String 1"
                  helpText="Enter the DSL query for searching over the index"
                >
                  <EuiCodeEditor
                    mode="sql"
                    theme="sql_console"
                    width="100%"
                    height="10rem"
                    value={queryString1}
                    onChange={setQueryString1}
                    showPrintMargin={false}
                    setOptions={{
                      fontSize: '14px',
                      enableBasicAutocompletion: true,
                      enableLiveAutocompletion: true,
                    }}
                    aria-label="Code Editor"
                  />
                </EuiFormRow>
                <EuiButton
                  onClick={() => {
                    setSearchIndex1('');
                    setQueryString1('');
                  }}
                >
                  Clear
                </EuiButton>
              </div>
            </EuiFlexItem>
            <EuiFlexItem>
              <div>
                <EuiFormRow
                  label="Search Index 2"
                  helpText="Enter the index or index pattern for the query"
                >
                  <EuiFieldText
                    name="searchIndex2"
                    value={searchIndex2}
                    onChange={(e) => setSearchIndex2(e.target.value)}
                    aria-label="searchIndex2"
                  />
                </EuiFormRow>

                <EuiFormRow
                  fullWidth
                  label="Query String 2"
                  helpText="Enter the DSL query for searching over the index"
                >
                  <EuiCodeEditor
                    mode="sql"
                    theme="sql_console"
                    width="100%"
                    height="10rem"
                    value={queryString2}
                    onChange={setQueryString2}
                    showPrintMargin={false}
                    setOptions={{
                      fontSize: '14px',
                      enableBasicAutocompletion: true,
                      enableLiveAutocompletion: true,
                    }}
                    aria-label="Code Editor"
                  />
                </EuiFormRow>
                <EuiButton
                  onClick={() => {
                    setSearchIndex2('');
                    setQueryString2('');
                  }}
                >
                  Clear
                </EuiButton>
              </div>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      )}
    </EuiPanel>
  );
};
