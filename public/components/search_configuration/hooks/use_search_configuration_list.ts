/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { extractUserMessageFromError, ServiceEndpoints } from '../../../../common';

export interface SearchConfigurationItem {
  id: string;
  search_configuration_name: string;
  description: string;
  index: string;
  query: string;
  timestamp: string;
}

export const useSearchConfigurationList = (http: CoreStart['http']) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapSearchConfigurationFields = (obj: any): SearchConfigurationItem => {
    return {
      id: obj._source.id,
      search_configuration_name: obj._source.name,
      description: obj._source.description,
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
        const response = await http.get(ServiceEndpoints.SearchConfigurations);
        const list = response ? response.hits.hits.map(mapSearchConfigurationFields) : [];
        const filteredList = search
          ? list.filter((item) =>
              item.search_configuration_name.toLowerCase().includes(search.toLowerCase())
            )
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
    [http]
  );

  const deleteSearchConfiguration = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await http.delete(`${ServiceEndpoints.SearchConfigurations}/${id}`);
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
    [http]
  );

  return {
    isLoading,
    error,
    findSearchConfigurations,
    deleteSearchConfiguration,
  };
};
