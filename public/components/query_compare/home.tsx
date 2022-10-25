/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { NavigationPublicPluginStart } from 'src/plugins/navigation/public';
import { CoreStart, ChromeBreadcrumb } from '../../../../../../src/core/public';
import '../../ace-themes/sql_console';
import { CreateIndex } from './create_index';
import { SearchResult } from './search_result';
import { useSearchRelevanceContext } from '../../contexts';
import { DocumentsIndex } from '../../types/index';
import { ServiceEndpoints } from '../../constants';

import './home.scss';

interface QueryExplorerProps {
  parentBreadCrumbs: ChromeBreadcrumb[];
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  setBreadcrumbs: (newBreadcrumbs: ChromeBreadcrumb[]) => void;
  setToast: (title: string, color?: string, text?: any, side?: string) => void;
  chrome: CoreStart['chrome'];
}

export const Home = ({
  parentBreadCrumbs,
  notifications,
  http,
  navigation,
  setBreadcrumbs,
  setToast,
  chrome,
}: QueryExplorerProps) => {
  const { documentsIndexes, setDocumentsIndexes } = useSearchRelevanceContext();

  useEffect(() => {
    setBreadcrumbs([...parentBreadCrumbs]);
  }, [setBreadcrumbs, parentBreadCrumbs]);

  // Get Indexes
  useEffect(() => {
    http.get(ServiceEndpoints.GetIndexes).then((res: DocumentsIndex[]) => {
      setDocumentsIndexes(res);
    });
  }, [http, setDocumentsIndexes]);

  return (
    <div className="search-relevance">
      {documentsIndexes.length ? <SearchResult http={http} /> : <CreateIndex />}
    </div>
  );
};
