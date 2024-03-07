/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { ChromeBreadcrumb, CoreStart, MountPoint } from '../../../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../../../src/plugins/data_source_management/public';
import { NavigationPublicPluginStart } from '../../../../../src/plugins/navigation/public';
import { ServiceEndpoints } from '../../../common';
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
    documentsIndexes,
    setDocumentsIndexes,
    pipelines,
    setPipelines,
    showFlyout,
    datasourceItems,
    setDocumentsIndexes1,
    setDocumentsIndexes2
  } = useSearchRelevanceContext();

  useEffect(() => {
    setBreadcrumbs([...parentBreadCrumbs]);
  }, [setBreadcrumbs, parentBreadCrumbs]);

  const fetchIndexes = (dataConnectionId: string, queryNumber: string) => {
    if(dataConnectionId){
          http.get(ServiceEndpoints.GetIndexes+"/"+dataConnectionId).then((res: DocumentsIndex[]) => {
            if(queryNumber == "1"){
              setDocumentsIndexes1(res)
            }
            else{
              setDocumentsIndexes2(res)
            }
            // setDocumentsIndexes(res)
          });
    }
    else{
      http.get(ServiceEndpoints.GetIndexes).then((res: DocumentsIndex[]) => {
        setDocumentsIndexes(res)
        if(queryNumber == "1"){
          setDocumentsIndexes1(res)
        }
        else{
          setDocumentsIndexes2(res)
        }
      })
    }
  }
  // const fetchPipelines = (dataConnectionId: string) => {
  //   if(dataConnectionId){
  //     http.get(ServiceEndpoints.GetIndexes+"/"+data.dataConnectionId).then((res: DocumentsIndex[]) => {
  //       return res
  //       // setDocumentsIndexes(res)
  //     });
  //   }
  //   else{
  //     http.get(ServiceEndpoints.GetIndexes).then((res: DocumentsIndex[]) => {
  //       return res
  //     })
  //   }
  // }

  // Get Indexes and Pipelines
  useEffect(() => {

    for (const key in datasourceItems){
      if(datasourceItems.hasOwnProperty(key)) {
        const {dataConnectionId} = datasourceItems[key]

        fetchIndexes(dataConnectionId,key)
      }
    }
    
  }, [http, setDocumentsIndexes1, setDocumentsIndexes2, setPipelines, datasourceItems]);
  return (
    <>
      <navigation.ui.TopNavMenu
        appName={'searchRelevance'}
        setMenuMountPoint={setActionMenu}
        showSearchBar={true}
        showFilterBar={false}
        showDatePicker={false}
        showQueryBar={false}
        showSaveQuery={false}
        showQueryInput={false}
        showDataSourcePicker={true}
        dataSourceCallBackFunc={(id) => console.log(id)}
        disableDataSourcePicker={false}
      />
      <div className="osdOverviewWrapper">
        {documentsIndexes.length ? <SearchResult http={http} savedObjects={savedObjects} dataSourceEnabled={datasourceEnabled} dataSourceManagement={dataSourceManagement} navigation={navigation} setActionMenu={setActionMenu} /> : <CreateIndex />}
      </div>
      {showFlyout && <Flyout />}
    </>
  );
};
