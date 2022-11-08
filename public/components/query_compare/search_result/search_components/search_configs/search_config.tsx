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
import { QueryError, QueryStringError } from '../../../../../types/index';

interface SearchConfigProps {
  queryNumber: 1 | 2;
  queryString: string;
  setQueryString: React.Dispatch<React.SetStateAction<string>>;
  selectedIndex: string;
  setSelectedIndex: React.Dispatch<React.SetStateAction<string>>;
  queryError: QueryError;
  setQueryError: React.Dispatch<React.SetStateAction<QueryError>>;
}

export const SearchConfig: FunctionComponent<SearchConfigProps> = ({
  queryNumber,
  queryString,
  setQueryString,
  selectedIndex,
  setSelectedIndex,
  queryError,
  setQueryError,
}) => {
  const { documentsIndexes, setShowFlyout } = useSearchRelevanceContext();

  // On select index
  const onChangeSelectedIndex: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSelectedIndex(e.target.value);

    setQueryError({
      ...queryError,
      selectIndex: '',
    });
  };

  // Select index on blur
  const selectIndexOnBlur = () => {
    // If Index Select on blur without selecting an index, show error
    if (!selectedIndex.length) {
      setQueryError({
        ...queryError,
        selectIndex: 'An index is required. Select an index.',
      });
    }
  };

  // On change query string
  const onChangeQueryString = (value: string) => {
    setQueryString(value);
    setQueryError({
      ...queryError,
      queryString: '',
    });
  };

  // Code editor on blur
  const codeEditorOnBlur = () => {
    // If no query string on blur, show error
    if (!queryString.length) {
      setQueryError({
        ...queryError,
        queryString: QueryStringError.empty,
      });
    }
  };

  return (
    <>
      <EuiTitle size="xs">
        <h2 style={{ fontWeight: '300', fontSize: '21px' }}>Query {queryNumber}</h2>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFormRow
        fullWidth
        label="Index"
        error={!!queryError.selectIndex.length && <span>{queryError.selectIndex}</span>}
        isInvalid={!!queryError.selectIndex.length}
      >
        <EuiSelect
          hasNoInitialSelection={true}
          options={documentsIndexes.map(({ index }) => ({
            value: index,
            text: index,
          }))}
          aria-label="Search Index"
          onChange={onChangeSelectedIndex}
          value={selectedIndex}
          onBlur={selectIndexOnBlur}
        />
      </EuiFormRow>
      <EuiFormRow
        fullWidth
        label="Query"
        error={!!queryError.queryString.length && <span>{queryError.queryString}</span>}
        isInvalid={!!queryError.queryString.length}
        labelAppend={
          <EuiText size="xs">
            <EuiButtonEmpty size="xs" color="primary" onClick={() => setShowFlyout(true)}>
              Help
            </EuiButtonEmpty>
          </EuiText>
        }
      >
        <EuiCodeEditor
          mode="json"
          theme="sql_console"
          width="100%"
          height="10rem"
          value={queryString}
          onChange={onChangeQueryString}
          showPrintMargin={false}
          setOptions={{
            fontSize: '14px',
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
          }}
          aria-label="Code Editor"
          onBlur={codeEditorOnBlur}
          tabSize={2}
        />
      </EuiFormRow>
      <EuiText>
        <p style={{ fontSize: '14px', fontWeight: '400', lineHeight: '18px' }}>
          Enter a query in OpenSearch Query DSL. Use %SearchText% to refer to the text in the search
          bar.
        </p>
      </EuiText>
    </>
  );
};
