/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { ChromeBreadcrumb, CoreStart, MountPoint } from '../../../../../src/core/public';
import { DataSourceManagementPluginSetup, DataSourceMenu } from '../../../../../src/plugins/data_source_management/public';
import { NavigationPublicPluginStart } from '../../../../../src/plugins/navigation/public';
import { QUERY_NUMBER_ONE, QUERY_NUMBER_TWO, ServiceEndpoints } from '../../../common';
import '../../ace-themes/sql_console';
import { useSearchRelevanceContext } from '../../contexts';
import { DocumentsIndex } from '../../types/index';
import { Flyout } from '../common/flyout';
import { CreateIndex } from './create_index';
import { SearchResult } from './search_result';

import './home.scss';

interface QueryExplorerProps {
  parentBreadCrumbs: ChromeBreadcrumb[];
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  setBreadcrumbs: (newBreadcrumbs: ChromeBreadcrumb[]) => void;
  setToast: (title: string, color?: string, text?: any, side?: string) => void;
  chrome: CoreStart['chrome'];
  savedObjects: CoreStart['savedObjects'];
  datasourceEnabled: boolean
  dataSourceManagement: DataSourceManagementPluginSetup;
  setActionMenu: (menuMount: MountPoint | undefined) => void;
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
  datasourceEnabled,
  dataSourceManagement,
  setActionMenu,
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
    setFetchedPipelines2
  } = useSearchRelevanceContext();

  useEffect(() => {
    setBreadcrumbs([...parentBreadCrumbs]);
  }, [setBreadcrumbs, parentBreadCrumbs]);

  const fetchIndexes = (dataConnectionId: string, queryNumber: string) => {
    if(dataConnectionId){
          http.get(ServiceEndpoints.GetIndexes+"/"+dataConnectionId).then((res: DocumentsIndex[]) => {
            if(queryNumber == QUERY_NUMBER_ONE){
              setDocumentsIndexes1(res)
            }
            else{
              setDocumentsIndexes2(res)
            }
          });
    }
    else{
      http.get(ServiceEndpoints.GetIndexes).then((res: DocumentsIndex[]) => {
        if(queryNumber == QUERY_NUMBER_ONE){
          setDocumentsIndexes1(res)
        }
        else{
          setDocumentsIndexes2(res)
        }
      })
    }
  }
  const fetchPipelines = (dataConnectionId: string, queryNumber: string) => {
    if(dataConnectionId){
      http.get(ServiceEndpoints.GetPipelines+"/"+dataConnectionId).then((res: {}) => {
        if(queryNumber == QUERY_NUMBER_ONE){
          setFetchedPipelines1(res)
        }
        else{
          setFetchedPipelines2(res)
        }
      });
    }
    else{
      http.get(ServiceEndpoints.GetPipelines).then((res: {}) => {
        if(queryNumber == QUERY_NUMBER_ONE){
          setFetchedPipelines1(res)
        }
        else{
          setFetchedPipelines2(res)
        }
      })
    }
  }

  // Get Indexes and Pipelines
  useEffect(() => {

    fetchIndexes(datasource1,QUERY_NUMBER_ONE)
    fetchIndexes(datasource2,QUERY_NUMBER_TWO)
    fetchPipelines(datasource1,QUERY_NUMBER_ONE)
    fetchPipelines(datasource2,QUERY_NUMBER_TWO)
    
  }, [http, setDocumentsIndexes1, setDocumentsIndexes2, setFetchedPipelines1, setFetchedPipelines2, datasource1, datasource2]);
  return (
    <>
      <DataSourceMenu
        setMenuMountPoint={setActionMenu}
        showDataSourceSelectable={true}
        dataSourceCallBackFunc={(id, label) => console.log(id, label)}
        disableDataSourceSelectable={true}
        savedObjects={savedObjects.client}
        notifications={notifications}
        appName={'searchRelevance'}
        hideLocalCluster={false}
        selectedOption={[{label: 'Local Cluster', id: 'a'}]}
        fullWidth={true}
      />
      <div className="osdOverviewWrapper">
        {documentsIndexes1.length || documentsIndexes2.length ? <SearchResult http={http} savedObjects={savedObjects} dataSourceEnabled={datasourceEnabled} dataSourceManagement={dataSourceManagement} navigation={navigation} setActionMenu={setActionMenu} /> : <CreateIndex />}
      </div>
      {showFlyout && <Flyout />}
    </>
  );
};
