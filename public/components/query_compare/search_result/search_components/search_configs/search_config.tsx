/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButtonEmpty,
  EuiCodeEditor,
  EuiComboBox,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiCompressedSelect,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import React, { FunctionComponent, useEffect } from 'react';

import { AppMountParameters, CoreStart, MountPoint, NotificationsStart, SavedObjectsStart, ToastsStart } from '../../../../../../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../../../../../../src/plugins/data_source_management/public';
import { DataSourceOption } from '../../../../../../../../src/plugins/data_source_management/public/components/data_source_menu/types';
import { NavigationPublicPluginStart } from '../../../../../../../../src/plugins/navigation/public';
import { useSearchRelevanceContext } from '../../../../../contexts';
import { QueryError, QueryStringError, SelectIndexError } from '../../../../../types/index';

export interface SearchRelevanceServices extends CoreStart {
  setHeaderActionMenu: AppMountParameters['setHeaderActionMenu'];
  appBasePath: AppMountParameters['history'];
  element: AppMountParameters['element'];
  navigation: NavigationPublicPluginStart;
  toastNotifications: ToastsStart;
  history: AppMountParameters['history'];
  overlays: CoreStart['overlays'];
  chrome: CoreStart['chrome'];
  uiSettings: CoreStart['uiSettings'];
}

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
  dataSourceEnabled: boolean;
  notifications: NotificationsStart;
  savedObjects: SavedObjectsStart;
  setDataSource: React.Dispatch<React.SetStateAction<string>>;
  dataSourceManagement: DataSourceManagementPluginSetup;
  navigation: NavigationPublicPluginStart;
  setActionMenu: (menuMount: MountPoint | undefined) => void;
  dataSourceOptions: DataSourceOption[]
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
  dataSourceEnabled,
  savedObjects,
  notifications,
  dataSourceManagement,
  navigation,
  setActionMenu,
  dataSourceOptions,
}) => {
  const { documentsIndexes1, setDataSource1, setDataSource2, documentsIndexes2, fetchedPipelines1, fetchedPipelines2, setShowFlyout, datasource1, datasource2} = useSearchRelevanceContext();
  // On select index
  const onChangeSelectedIndex: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSelectedIndex(e.target.value);

    setQueryError((error: QueryError) => ({
      ...error,
      selectIndex: '',
    }));
  };

  const documentIndex = queryNumber === 1? documentsIndexes1: documentsIndexes2
  console.log(fetchedPipelines1)
  const pipelines = queryNumber === 1? fetchedPipelines1: fetchedPipelines2
  // Sort search pipelines based off of each individual pipeline name.
  const sortedPipelines = [...Object.keys(pipelines)]
    .sort((a, b) => a.localeCompare(b))
    .map((searchPipeline) => ({
      label: searchPipeline,
    }));
  // Add the '_none' option to the pipeline dropdown (runs the index without a pipeline).
  sortedPipelines.push({ label: '_none' });

  // On select pipeline for ComboBox
  const onChangePipeline = (selectedPipelineOptions: string | any[]) => {
    setPipeline(selectedPipelineOptions[0]?.label || '');
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
  const onSelectedDataSource = (e) => {
    const dataConnectionId = e[0] ? e[0].id : undefined;
    if(queryNumber == 1){
      setDataSource1(dataConnectionId)
    }
    else{
      setDataSource2(dataConnectionId)
    }
    setPipeline('')
  }
  useEffect(() => {
    setSelectedIndex('')
    setPipeline('')
  }, [datasource1, datasource2]);

  let DataSourceSelector;

  if (dataSourceEnabled) {
    DataSourceSelector = dataSourceManagement.ui.DataSourceSelector;
  }
  return (
    <>
      <EuiTitle size="xs">
        <h2 style={{ fontWeight: '300', fontSize: '21px' }}>Query {queryNumber}</h2>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        {dataSourceEnabled && (
          <EuiFlexItem>
            <EuiCompressedFormRow
              fullWidth
              label="Data Source"
            >
              <DataSourceSelector
                savedObjectsClient={savedObjects.client}
                notifications={notifications}
                onSelectedDataSource={onSelectedDataSource}
                disabled={false}
                fullWidth={false}
                removePrepend={true}
                defaultOption= {[]}
              />
            </EuiCompressedFormRow>
          </EuiFlexItem> )}
        <EuiFlexItem>
          <EuiCompressedFormRow
            fullWidth
            label="Index"
            error={!!queryError.selectIndex.length && <span>{queryError.selectIndex}</span>}
            isInvalid={!!queryError.selectIndex.length}
          >
            <EuiCompressedSelect
              hasNoInitialSelection={true}
              options={documentIndex.map(({ index }) => ({
                value: index,
                text: index,
              }))}
              aria-label="Search Index"
              onChange={onChangeSelectedIndex}
              value={selectedIndex}
              onBlur={selectIndexOnBlur}
            />
          </EuiCompressedFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiCompressedFormRow fullWidth label="Pipeline" helpText="Optional">
            <EuiComboBox
              placeholder=""
              singleSelection={{ asPlainText: true }}
              options={sortedPipelines}
              selectedOptions={pipeline ? [{ label: pipeline }] : []}
              onChange={onChangePipeline}
            />
          </EuiCompressedFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiCompressedFormRow
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
      </EuiCompressedFormRow>
    </>
  );
};
