/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { extractUserMessageFromError, ServiceEndpoints } from '../../../../common';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';

export interface JudgmentItem {
  id: string;
  name: string;
  type: string;
  status: string;
  timestamp: string;
}

export const useJudgmentList = (http: CoreStart['http']) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [judgments, setJudgments] = useState<JudgmentItem[]>([]);
  const [tableData, setTableData] = useState<JudgmentItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const { services } = useOpenSearchDashboards();

  // Polling state
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousJudgments = useRef<JudgmentItem[]>([]);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const pollingStartTime = useRef<number>(0);
  const errorCount = useRef<number>(0);
  const MAX_POLLING_DURATION = 10 * 60 * 1000;
  const MAX_ERRORS = 3;

  const hasProcessing = judgments.some((judgment) => judgment.status === 'PROCESSING');

  const mapJudgmentFields = (obj: any): JudgmentItem => {
    return {
      id: obj._source.id,
      name: obj._source.name,
      type: obj._source.type,
      status: obj._source.status,
      timestamp: obj._source.timestamp,
    };
  };

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    pollingStartTime.current = Date.now();

    intervalRef.current = setInterval(async () => {
      if (
        Date.now() - pollingStartTime.current > MAX_POLLING_DURATION ||
        errorCount.current >= MAX_ERRORS
      ) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsBackgroundRefreshing(false);
        return;
      }

      if (isBackgroundRefreshing) return;

      setIsBackgroundRefreshing(true);
      try {
        const response = await http.get(ServiceEndpoints.Judgments);
        const updatedList = response ? response.hits.hits.map(mapJudgmentFields) : [];
        errorCount.current = 0;

        if (previousJudgments.current.length > 0) {
          const completions = updatedList.filter((curr) => {
            const prev = previousJudgments.current.find((p) => p.id === curr.id);
            return prev?.status === 'PROCESSING' && curr.status === 'COMPLETED';
          });

          completions.forEach((judgment) => {
            services.notifications?.toasts.addSuccess({
              title: 'Judgment Completed',
              text: `Judgment ${judgment.name} has completed successfully.`,
            });
          });
        }

        if (JSON.stringify(previousJudgments.current) !== JSON.stringify(updatedList)) {
          previousJudgments.current = updatedList;
          setJudgments(updatedList);
          setTableData(updatedList);
          setRefreshKey((prev) => prev + 1);
        }

        if (!updatedList.some((judgment) => judgment.status === 'PROCESSING')) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
        }
      } catch (err) {
        console.error('Background refresh failed:', err);
        errorCount.current++;
      } finally {
        setIsBackgroundRefreshing(false);
      }
    }, 15000);
  }, [http, services.notifications]);

  useEffect(() => {
    if (hasProcessing && !intervalRef.current) {
      startPolling();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasProcessing, startPolling]);

  const findJudgments = useCallback(
    async (search?: string) => {
      // Use tableData if available (from polling or previous fetch)
      if (tableData.length > 0) {
        const filteredList = search
          ? tableData.filter((item) => {
              const q = search.toLowerCase();
              return item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
            })
          : tableData;
        return {
          total: filteredList.length,
          hits: filteredList,
        };
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await http.get(ServiceEndpoints.Judgments);
        const list = response ? response.hits.hits.map(mapJudgmentFields) : [];
        const filteredList = search
          ? list.filter((item: JudgmentItem) => {
              const q = search.toLowerCase();
              return item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
            })
          : list;

        setJudgments(filteredList);
        setTableData(filteredList);

        return {
          total: filteredList.length,
          hits: filteredList,
        };
      } catch (err) {
        console.error('Failed to load judgment lists.', err);
        const errorMessage = extractUserMessageFromError(err);
        setError(errorMessage || 'Failed to load judgment lists due to an unknown error.');
        return {
          total: 0,
          hits: [],
        };
      } finally {
        setIsLoading(false);
      }
    },
    [http, tableData]
  );

  const deleteJudgment = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await http.delete(`${ServiceEndpoints.Judgments}/${id}`);
        setError(null);
        setRefreshKey((prev) => prev + 1);
        return true;
      } catch (err) {
        console.error('Failed to delete judgment', err);
        setError('Failed to delete judgment');
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
    judgments,
    hasProcessing,
    isBackgroundRefreshing,
    refreshKey,
    findJudgments,
    deleteJudgment,
  };
};
