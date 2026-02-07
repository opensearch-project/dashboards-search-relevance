/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { ServiceEndpoints, extractUserMessageFromError } from '../../../../common';

export const useQuerySetView = (http: CoreStart['http'], id: string) => {
  const [querySet, setQuerySet] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuerySet = async () => {
      try {
        setLoading(true);
        setError(null);
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

    if (id) {
      fetchQuerySet();
    }
  }, [http, id]);

  return {
    querySet,
    loading,
    error,
  };
};
