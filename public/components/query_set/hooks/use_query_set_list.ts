/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { ServiceEndpoints, extractUserMessageFromError } from '../../../../common';

export const useQuerySetList = (http: CoreStart['http']) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const mapQuerySetFields = (obj: any) => ({
    id: obj._source.id,
    name: obj._source.name,
    sampling: obj._source.sampling,
    description: obj._source.description,
    timestamp: obj._source.timestamp,
    numQueries: Object.keys(obj._source.querySetQueries).length,
  });

  const findQuerySets = async (search: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get(ServiceEndpoints.QuerySets);
      const list = response ? response.hits.hits.map(mapQuerySetFields) : [];
      const filteredList = search
        ? list.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
        : list;
      return {
        total: filteredList.length,
        hits: filteredList,
      };
    } catch (err) {
      console.error('Failed to load query sets', err);
      const errorMessage = extractUserMessageFromError(err);
      setError(errorMessage || 'Failed to load query sets due to an unknown error.');
      return {
        total: 0,
        hits: [],
      };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuerySet = async (id: string) => {
    setIsLoading(true);
    try {
      await http.delete(`${ServiceEndpoints.QuerySets}/${id}`);
      setError(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to delete query set', err);
      setError('Failed to delete query set');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    refreshKey,
    findQuerySets,
    deleteQuerySet,
    setError,
  };
};
