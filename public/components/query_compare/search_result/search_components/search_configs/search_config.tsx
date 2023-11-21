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
  EuiFlexGroup,
  EuiFlexItem,
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
  pipeline: string;
  setPipeline: React.Dispatch<React.SetStateAction<string>>;
}

export const SearchConfig: FunctionComponent<SearchConfigProps> = ({
  queryNumber,
  queryString,
  setQueryString,
  selectedIndex,
  setSelectedIndex,
  queryError,
  setQueryError,
  pipeline,
  setPipeline,
}) => {
  const { documentsIndexes, pipelines, setShowFlyout } = useSearchRelevanceContext();
  // On select index
  const onChangeSelectedIndex: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSelectedIndex(e.target.value);

    setQueryError((error: QueryError) => ({
      ...error,
      selectIndex: '',
    }));
  };

  // Sort search pipelines based off of each individual pipeline name.
  const sortedPipelines = [...Object.keys(pipelines)].sort((a, b) => a.localeCompare(b));

  // On select index for ComboBox
  const onChangePipeline = (selectedOptions: string | any[]) => {
    if (selectedOptions.length === 0) {
      setPipeline('');
    } else {
      setPipeline(selectedOptions[0].label);
    }
  };

  // Select index on blur
  const selectIndexOnBlur = () => {
    // If Index Select on blur without selecting an index, show error
    if (!selectedIndex.length) {
      setQueryError((error: QueryError) => ({
        ...error,
        selectIndex: SelectIndexError.unselected,
      }));
    }
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
      <EuiFlexGroup>
        <EuiFlexItem>
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
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow fullWidth label="Pipeline" helpText="Optional">
            {
              <EuiComboBox
                placeholder="No pipeline"
                singleSelection={{ asPlainText: true }}
                options={sortedPipelines.map((searchPipeline) => ({
                  label: searchPipeline,
                }))}
                selectedOptions={pipeline ? [{ label: pipeline }] : []}
                onChange={onChangePipeline}
              />
            }
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
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
