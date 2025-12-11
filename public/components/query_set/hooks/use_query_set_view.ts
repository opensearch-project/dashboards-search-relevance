/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { ServiceEndpoints, extractUserMessageFromError } from '../../../../common';

export const useQuerySetView = (http: CoreStart['http'], id: string, dataSourceId?: string) => {
  const [querySet, setQuerySet] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuerySet = async (sourceId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('fetchQuerySet called with sourceId:', sourceId);
      
      // Try with dataSourceId first if provided
      if (sourceId && sourceId.trim() !== '') {
        try {
          const options = { query: { dataSourceId: sourceId } };
          console.log('Making API call with options:', options);
          const response = await http.get(`${ServiceEndpoints.QuerySets}/${id}`, options);
          
          if (response && response.hits && response.hits.hits && response.hits.hits.length > 0) {
            setQuerySet(response.hits.hits[0]._source);
            return;
          }
        } catch (err) {
          console.error('API call with dataSourceId failed:', err);
          // Continue to try without dataSourceId
        }
      }
      
      // Try without dataSourceId as fallback
      console.log('Making API call without dataSourceId');
      const response = await http.get(`${ServiceEndpoints.QuerySets}/${id}`);

      if (response && response.hits && response.hits.hits && response.hits.hits.length > 0) {
        setQuerySet(response.hits.hits[0]._source);
      } else {
        setError('No matching query set found');
      }
    } catch (err) {
      console.error('Failed to load query set', err);
      const errorMessage = extractUserMessageFromError(err);
      setError(errorMessage || 'Error loading query set data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuerySet(dataSourceId);
    }
  }, [http, id, dataSourceId]);

  return {
    querySet,
    loading,
    error,
    refetch: () => fetchQuerySet(dataSourceId),
  };
};
