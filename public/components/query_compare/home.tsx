/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ChromeBreadcrumb,
  CoreStart,
  MountPoint,
  NotificationsStart,
  SavedObject,
} from '../../../../../src/core/public';
import {
  DataSourceAggregatedViewConfig,
  DataSourceManagementPluginSetup,
} from '../../../../../src/plugins/data_source_management/public';
import { NavigationPublicPluginStart } from '../../../../../src/plugins/navigation/public';
import { ServiceEndpoints, QUERY_NUMBER_ONE, QUERY_NUMBER_TWO } from '../../../common';
import '../../ace-themes/sql_console';
import { useSearchRelevanceContext } from '../../contexts';
import { DocumentsIndex } from '../../types/index';
import { Flyout } from '../common/flyout';
import { CreateIndex } from './create_index';
import { SearchResult } from './search_result';

import semver from 'semver';
import { DataSourceAttributes } from '../../../../../src/plugins/data_source/common/data_sources';
import {
  DataSourceMenuProps,
  DataSourceOption,
} from '../../../../../src/plugins/data_source_management/public/components/data_source_menu/types';
import * as pluginManifest from '../../../opensearch_dashboards.json';
import './home.scss';

interface QueryExplorerProps {
  parentBreadCrumbs: ChromeBreadcrumb[];
  notifications: NotificationsStart;
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  setBreadcrumbs: (newBreadcrumbs: ChromeBreadcrumb[]) => void;
  setToast: (title: string, color?: string, text?: any, side?: string) => void;
  chrome: CoreStart['chrome'];
  savedObjects: CoreStart['savedObjects'];
  dataSourceEnabled: boolean;
  dataSourceManagement: DataSourceManagementPluginSetup;
  setActionMenu: (menuMount: MountPoint | undefined) => void;
  application: CoreStart['application'];
  uiSettings: CoreStart['uiSettings'];
}
export const Home = ({
  parentBreadCrumbs,
  notifications,
  http,
  navigation,
  setBreadcrumbs,
  setToast,
  chrome,
  savedObjects,
  dataSourceEnabled,
  dataSourceManagement,
  setActionMenu,
  application,
  uiSettings,
}: QueryExplorerProps) => {
  const {
    showFlyout,
    documentsIndexes1,
    documentsIndexes2,
    setDocumentsIndexes1,
    setDocumentsIndexes2,
    datasource1,
    datasource2,
    setFetchedPipelines1,
    setFetchedPipelines2,
    setDataSource1,
    setDataSource2,
  } = useSearchRelevanceContext();

  useEffect(() => {
    setBreadcrumbs([...parentBreadCrumbs]);
  }, [setBreadcrumbs, parentBreadCrumbs]);
  const [dataSourceOptions, setDataSourceOptions] = useState<DataSourceOption[]>([]);
  const [shouldShowCreateIndex, setShouldShowCreateIndex] = useState(false);
  const fetchIndexes = (dataConnectionId: string, queryNumber: string) => {
    http
      .get(`${ServiceEndpoints.GetIndexes}/${dataConnectionId}`)
      .then((res: DocumentsIndex[]) => {
        if (queryNumber === QUERY_NUMBER_ONE) {
          setDocumentsIndexes1(res);
        } else {
          setDocumentsIndexes2(res);
        }
      })
      .catch((err) => {
        if (queryNumber === QUERY_NUMBER_ONE) {
          setDocumentsIndexes1([]);
        } else {
          setDocumentsIndexes2([]);
        }
        console.error(err);
      });
  };
  const fetchPipelines = (dataConnectionId: string, queryNumber: string) => {
    http
      .get(`${ServiceEndpoints.GetPipelines}/${dataConnectionId}`)
      .then((res: {}) => {
        if (queryNumber === QUERY_NUMBER_ONE) {
          setFetchedPipelines1(res);
        } else {
          setFetchedPipelines2(res);
        }
      })
      .catch((err) => {
        if (queryNumber === QUERY_NUMBER_ONE) {
          setFetchedPipelines1('');
        } else {
          setFetchedPipelines2('');
        }
        console.error(err);
      });
  };

  useEffect(() => {
    if (!documentsIndexes1.length && !documentsIndexes2.length) {
      setShouldShowCreateIndex(true);
    } else {
      setShouldShowCreateIndex(false);
    }
  }, [documentsIndexes1, documentsIndexes2]);

  // Get Indexes and Pipelines
  useEffect(() => {
    if (dataSourceEnabled && datasource1 !== null && datasource2 !== null) {
      fetchIndexes(datasource1, QUERY_NUMBER_ONE);
      fetchIndexes(datasource2, QUERY_NUMBER_TWO);
      fetchPipelines(datasource1, QUERY_NUMBER_ONE);
      fetchPipelines(datasource2, QUERY_NUMBER_TWO);
    } else if (!dataSourceEnabled) {
      fetchIndexes('', QUERY_NUMBER_ONE);
      fetchIndexes('', QUERY_NUMBER_TWO);
      fetchPipelines('', QUERY_NUMBER_ONE);
      fetchPipelines('', QUERY_NUMBER_TWO);
    }
  }, [
    http,
    setDocumentsIndexes1,
    setDocumentsIndexes2,
    setFetchedPipelines1,
    setFetchedPipelines2,
    datasource1,
    datasource2,
  ]);

  return (
    <>
      <div className="osdOverviewWrapper">
        {shouldShowCreateIndex ? (
          <CreateIndex application={application} chrome={chrome} />
        ) : (
          <SearchResult
            application={application}
            chrome={chrome}
            http={http}
            savedObjects={savedObjects}
            dataSourceEnabled={dataSourceEnabled}
            dataSourceManagement={dataSourceManagement}
            navigation={navigation}
            setActionMenu={setActionMenu}
            dataSourceOptions={dataSourceOptions}
            notifications={notifications}
            uiSettings={uiSettings}
          />
        )}
      </div>
      {showFlyout && <Flyout />}
    </>
  );
};
