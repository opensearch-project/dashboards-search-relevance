/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FunctionComponent } from 'react';
import {
  EuiTitle,
  EuiSpacer,
  EuiFormRow,
  EuiSelect,
  EuiCodeEditor,
  EuiText,
  EuiButtonEmpty,
} from '@elastic/eui';

import { useSearchRelevanceContext } from '../../../../../contexts';

interface SearchConfigProps {
  queryNumber: 1 | 2;
  queryString: string;
  setQueryString: React.Dispatch<React.SetStateAction<string>>;
}

export const SearchConfig: FunctionComponent<SearchConfigProps> = ({
  queryNumber,
  queryString,
  setQueryString,
}) => {
  const {
    documentsIndexes,
    setShowFlyout,
    selectedIndex,
    updateSelectedIndex,
  } = useSearchRelevanceContext();

  const onChangeSearchIndex = (e: any) => {
    updateSelectedIndex({
      indexNumber: `index${queryNumber}`,
      indexName: e.target.value,
    });
  };

  return (
    <>
      <EuiTitle size="xs">
        <h2 style={{ fontWeight: '300', fontSize: '21px' }}>Query {queryNumber}</h2>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFormRow fullWidth label="Index">
        <EuiSelect
          hasNoInitialSelection={true}
          options={documentsIndexes.map(({ index }) => ({
            value: index,
            text: index,
          }))}
          aria-label="Search Index"
          onChange={onChangeSearchIndex}
          value={selectedIndex[`index${queryNumber}`]}
        />
      </EuiFormRow>
      <EuiFormRow fullWidth label="Query">
        <EuiCodeEditor
          mode="json"
          theme="sql_console"
          width="100%"
          height="10rem"
          value={queryString}
          onChange={setQueryString}
          showPrintMargin={false}
          setOptions={{
            fontSize: '14px',
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
          }}
          aria-label="Code Editor"
        />
      </EuiFormRow>
      <EuiText>
        <p style={{ fontSize: '14px', fontWeight: '400', lineHeight: '18px' }}>
          Enter a query in OpenSearch Query DSL. Use %SearchQuery% to refer to the text in the
          search bar. Need more help?{' '}
          <EuiButtonEmpty
            size="xs"
            color="primary"
            onClick={() => setShowFlyout(true)}
            style={{ margin: '0 -8px' }}
          >
            See some examples
          </EuiButtonEmpty>
        </p>
      </EuiText>
    </>
  );
};
