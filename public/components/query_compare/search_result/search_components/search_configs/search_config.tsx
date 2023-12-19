/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FunctionComponent } from 'react';
import {
  EuiTitle,
  EuiSpacer,
  EuiFormRow,
  EuiCodeEditor,
  EuiText,
  EuiButtonEmpty,
  EuiComboBox,
} from '@elastic/eui';

import { useSearchRelevanceContext } from '../../../../../contexts';
import { QueryError, QueryStringError, SelectIndexError } from '../../../../../types/index';

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
  // Sort documents indexes based off of each individual index.
  const sortedDocumentsIndexes = [...documentsIndexes]
    .sort((a, b) => a.index.localeCompare(b.index))
    .map(({ index }) => ({
      label: index,
    }));

  // On select index for ComboBox
  const onChangeSelectedIndex = (selectedIndexOptions: string | any[]) => {
    setSelectedIndex(selectedIndexOptions[0]?.label || '');
  };

  // On change query string
  const onChangeQueryString = (value: string) => {
    setQueryString(value);
    setQueryError((error: QueryError) => ({
      ...error,
      queryString: '',
    }));
  };

  // Code editor on blur
  const codeEditorOnBlur = () => {
    // If no query string on blur, show error
    if (!queryString.length) {
      setQueryError((error: QueryError) => ({
        ...error,
        errorResponse: {
          body: '',
          statusCode: 400,
        },
        queryString: QueryStringError.empty,
      }));
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
        {
          <EuiComboBox
            singleSelection={{ asPlainText: true }}
            options={sortedDocumentsIndexes}
            selectedOptions={selectedIndex ? [{ label: selectedIndex }] : []}
            onChange={onChangeSelectedIndex}
          />
        }
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
        helpText={
          <p>
            Enter a query in{' '}
            <a href="https://opensearch.org/docs/latest/query-dsl/index/">OpenSearch Query DSL</a>.
            Use %SearchText% to refer to the text in the search bar
          </p>
        }
      >
        <EuiCodeEditor
          mode="json"
          theme="textmate"
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
    </>
  );
};
