/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { extractUserMessageFromError, ServiceEndpoints } from '../../../../common';

export interface SearchConfigurationItem {
  id: string;
  search_configuration_name: string;
  index: string;
  query: string;
  timestamp: string;
}

export const useSearchConfigurationList = (http: CoreStart['http'], dataSourceId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Trigger refresh when dataSourceId changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [dataSourceId]);

  const mapSearchConfigurationFields = (obj: any): SearchConfigurationItem => {
    return {
      id: obj._source.id,
      search_configuration_name: obj._source.name,
      index: obj._source.index,
      query: obj._source.query,
      timestamp: obj._source.timestamp,
    };
  };

  const findSearchConfigurations = useCallback(
    async (search?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const query = dataSourceId ? { dataSourceId } : {};
        const response = await http.get(ServiceEndpoints.SearchConfigurations, { query });
        const list: SearchConfigurationItem[] = response ? response.hits.hits.map(mapSearchConfigurationFields) : [];
        const filteredList = search
          ? list.filter((item) => {
              const term = search.toLowerCase();
              return (
                item.search_configuration_name.toLowerCase().includes(term) ||
                item.id?.toLowerCase().includes(term)
              );
            })
          : list;
        return {
          total: filteredList.length,
          hits: filteredList,
        };
      } catch (err) {
        console.error('Failed to load search configurations', err);
        const errorMessage = extractUserMessageFromError(err);
        setError(errorMessage || 'Failed to load search configurations due to an unknown error.');
        return {
          total: 0,
          hits: [],
        };
      } finally {
        setIsLoading(false);
      }
    },
    [http, dataSourceId]
  );

  const deleteSearchConfiguration = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const query = dataSourceId ? { dataSourceId } : {};
        await http.delete(`${ServiceEndpoints.SearchConfigurations}/${id}`, { query });
        setError(null);
        return true;
      } catch (err) {
        console.error('Failed to delete search config', err);
        setError('Failed to delete search configuration');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [http, dataSourceId]
  );

  return {
    isLoading,
    error,
    refreshKey,
    findSearchConfigurations,
    deleteSearchConfiguration,
  };
};
