/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { LTR_MODEL_FETCH_SIZE, ServiceEndpoints } from '../../../../common';
import { LtrModelListItem, LtrUnavailableReason } from '../types';

/**
 * `GET /_ltr/_model` returns a raw OpenSearch search response rather than the flat list the
 * neighbouring Search Relevance resources return, so entries are unwrapped from
 * `hits.hits[]._source`.
 */
export const mapLtrModelFields = (hit: any): LtrModelListItem => {
  const source = hit?._source ?? {};
  const featureSet = source.model?.feature_set ?? {};
  return {
    name: source.name,
    featureSetName: featureSet.name ?? '',
    modelType: source.model?.model?.type ?? '',
    featureCount: Array.isArray(featureSet.features) ? featureSet.features.length : 0,
  };
};

export const useLtrModelList = (http: CoreStart['http']) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailableReason, setUnavailableReason] = useState<LtrUnavailableReason | null>(null);
  // Set when the store holds more models than a single fetch returned, so the listing can say
  // so rather than silently showing a partial registry.
  const [truncatedTotal, setTruncatedTotal] = useState<number | null>(null);

  const findLtrModels = async (search?: string) => {
    setIsLoading(true);
    setError(null);
    setUnavailableReason(null);
    setTruncatedTotal(null);
    try {
      const response = await http.get(ServiceEndpoints.LtrModels, {
        query: { size: LTR_MODEL_FETCH_SIZE },
      });

      const hits = response?.hits?.hits ?? [];
      const list = hits.map(mapLtrModelFields);

      // `hits.total` is an object on a normal response but a bare number when the cluster
      // runs with `rest_total_hits_as_int`; reading only `.value` would miss truncation there.
      const rawTotal = response?.hits?.total;
      const total = (typeof rawTotal === 'number' ? rawTotal : rawTotal?.value) ?? list.length;
      if (total > list.length) {
        setTruncatedTotal(total);
      }

      const filteredList = search
        ? list.filter((item: LtrModelListItem) =>
            item.name?.toLowerCase().includes(search.toLowerCase())
          )
        : list;

      return {
        total: filteredList.length,
        hits: filteredList,
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load LTR models', err);
      const reason = err?.body?.attributes?.ltrErrorType as LtrUnavailableReason | undefined;
      if (reason) {
        // Not an error the user needs to debug — the registry just has nothing to show yet.
        setUnavailableReason(reason);
      } else {
        setError(err?.body?.message || 'Failed to load LTR models due to an unknown error.');
      }
      return {
        total: 0,
        hits: [],
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    unavailableReason,
    truncatedTotal,
    findLtrModels,
    setError,
  };
};
