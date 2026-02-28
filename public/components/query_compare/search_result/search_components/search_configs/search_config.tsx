/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButtonEmpty,
  EuiCodeEditor,
  EuiCompressedComboBox,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiCompressedSelect,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import React, { FunctionComponent, useEffect } from 'react';

import semver from 'semver';
import {
  AppMountParameters,
  CoreStart,
  MountPoint,
  NotificationsStart,
  SavedObject,
  SavedObjectsStart,
  ToastsStart,
} from '../../../../../../../../src/core/public';
import { useOpenSearchDashboards } from '../../../../../../../../src/plugins/opensearch_dashboards_react/public';
import { DataSourceManagementPluginSetup } from '../../../../../../../../src/plugins/data_source_management/public';
import { DataSourceOption } from '../../../../../../../../src/plugins/data_source_management/public/components/data_source_menu/types';
import { NavigationPublicPluginStart } from '../../../../../../../../src/plugins/navigation/public';
import { useSearchRelevanceContext } from '../../../../../contexts';
import { QueryError, QueryStringError, SelectIndexError } from '../../../../../types/index';
import { DataSourceAttributes } from '../../../../../../../../src/plugins/data_source/common/data_sources';
import { ServiceEndpoints } from '../../../../../../common';
import * as pluginManifest from '../../../../../../opensearch_dashboards.json';
import { SearchConfigurationService } from '../../../../search_configuration/services/search_configuration_service';

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
  dataSourceOptions: DataSourceOption[];
  optional?: boolean;
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
  optional = false,
}) => {
  const [searchConfigOptions, setSearchConfigOptions] = React.useState<any[]>([]);
  const [selectedSearchConfig, setSelectedSearchConfig] = React.useState<any[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = React.useState<boolean>(false);
  const [allConfigs, setAllConfigs] = React.useState<any[]>([]);
  const { services } = useOpenSearchDashboards<SearchRelevanceServices>();
  const searchConfigurationService = React.useMemo(() => new SearchConfigurationService(services.http), [services.http]);
  const {
    documentsIndexes1,
    setDataSource1,
    setDataSource2,
    documentsIndexes2,
    fetchedPipelines1,
    fetchedPipelines2,
    setShowFlyout,
    datasource1,
    datasource2,
  } = useSearchRelevanceContext();

  useEffect(() => {
    let isMounted = true;
    const fetchSearchConfigurations = async () => {
      setIsLoadingConfigs(true);
      try {
        const data = await searchConfigurationService.getSearchConfigurations();
        if (isMounted) {
          setAllConfigs(data.hits.hits);
          const options = data.hits.hits.map((search_config: any) => ({
            label: search_config._source.name,
            value: search_config._source.id,
          }));
          setSearchConfigOptions(options);
        }
      } catch (error) {
        console.error('Failed to fetch search configurations', error);
      } finally {
        if (isMounted) {
          setIsLoadingConfigs(false);
        }
      }
    };

    fetchSearchConfigurations();

    return () => {
      isMounted = false;
    };
  }, [searchConfigurationService]);

  const onSearchConfigChange = (selectedOptions: any[]) => {
    setSelectedSearchConfig(selectedOptions);
    if (selectedOptions.length > 0) {
      const configId = selectedOptions[0].value;
      const config = allConfigs.find((c) => c._source.id === configId);
      if (config) {
        const source = config._source;
        // Update index
        if (source.index) {
          setSelectedIndex(source.index);
        }
        // Update pipeline
        if (source.search_pipeline) {
          setPipeline(source.search_pipeline);
        }
        // Update query
        if (source.query) {
          try {
            const parsedQuery = JSON.parse(source.query);
            setQueryString(JSON.stringify(parsedQuery, null, 2));
          } catch (e) {
            // Fallback to raw string if parsing fails
            setQueryString(source.query);
          }
          setQueryError((error: QueryError) => ({
            ...error,
            queryString: '',
          }));
        }
      }
    }
  };
  // On select index
  const onChangeSelectedIndex: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSelectedIndex(e.target.value);

    setQueryError((error: QueryError) => ({
      ...error,
      selectIndex: '',
    }));
  };

  const documentIndex = queryNumber === 1 ? documentsIndexes1 : documentsIndexes2;
  const pipelines = queryNumber === 1 ? fetchedPipelines1 : fetchedPipelines2;
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
    // Skip validation if this config is optional
    if (!selectedIndex.length && !optional) {
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
  const onSelectedDataSource = (e: any[]) => {
    const dataConnectionId = e[0] ? e[0].id : undefined;
    if (queryNumber == 1) {
      setDataSource1(dataConnectionId);
    } else {
      setDataSource2(dataConnectionId);
    }
    setPipeline('');
  };
  useEffect(() => {
    setSelectedIndex('');
    setPipeline('');
  }, [datasource1, datasource2]);

  let DataSourceSelector;

  if (dataSourceEnabled) {
    DataSourceSelector = dataSourceManagement.ui.DataSourceSelector;
  }
  const dataSourceFilterFn = (dataSource: SavedObject<DataSourceAttributes>) => {
    const dataSourceVersion = dataSource?.attributes?.dataSourceVersion || '';
    return semver.satisfies(dataSourceVersion, pluginManifest.supportedOSDataSourceVersions);
  };
  return (
    <>
      <EuiTitle size="xs">
        <h2 style={{ fontWeight: '300', fontSize: '21px' }}>Setup {queryNumber}</h2>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        {dataSourceEnabled && (
          <EuiFlexItem>
            <EuiCompressedFormRow fullWidth label="Data Source">
              <DataSourceSelector
                compressed={true}
                savedObjectsClient={savedObjects.client}
                notifications={notifications}
                onSelectedDataSource={onSelectedDataSource}
                disabled={false}
                fullWidth={false}
                removePrepend={true}
                dataSourceFilter={dataSourceFilterFn}
              />
            </EuiCompressedFormRow>
            <EuiSpacer size="s" />
          </EuiFlexItem>
        )}

        {/* Index */}
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

        {/* Search Configuration */}
        <EuiFlexItem>
          <EuiCompressedFormRow label="Search Configuration" fullWidth>
            <EuiCompressedComboBox
              data-test-subj="searchConfigComboBox"
              singleSelection={{ asPlainText: true }}
              options={searchConfigOptions}
              selectedOptions={selectedSearchConfig}
              onChange={onSearchConfigChange}
              isLoading={isLoadingConfigs}
              isClearable={true}
            />
          </EuiCompressedFormRow>
        </EuiFlexItem>

        {/* Pipeline */}
        <EuiFlexItem>
          <EuiCompressedFormRow
            label={
              <p>
                Pipeline <i> - optional </i>
              </p>
            }
            fullWidth
          >
            <EuiCompressedComboBox
              data-test-subj="pipelineComboBox"
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
            Use %queryText% to refer to the text in the search bar
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
