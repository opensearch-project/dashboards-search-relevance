/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';

export interface JudgmentData {
  id: string;
  name: string;
  type: string;
  status: string;
  metadata: Record<string, any>;
  judgmentRatings: any;
  timestamp: string;
}

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ERRORS = 3;

export const useJudgmentView = (http: CoreStart['http'], id: string, dataSourceId?: string | null) => {
  const [judgment, setJudgment] = useState<JudgmentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollErrorCount = useRef<number>(0);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const fetchJudgment = useCallback(
    async (options?: { showLoading?: boolean }) => {
      const showLoading = options?.showLoading ?? false;

      try {
        if (showLoading) {
          setLoading(true);
          setError(null);
        }

        const response = await http.get(
          `${ServiceEndpoints.Judgments}/${id}`,
          dataSourceId ? { query: { dataSourceId } } : {}
        );

        if (response && response.hits && response.hits.hits && response.hits.hits.length > 0) {
          const nextJudgment = response.hits.hits[0]._source as JudgmentData;
          setJudgment(nextJudgment);
          setError(null);
          pollErrorCount.current = 0;

          if (nextJudgment.status !== 'PROCESSING') {
            stopPolling();
          }
        } else if (showLoading) {
          setJudgment(null);
          setError('No matching judgment found');
          stopPolling();
        }
      } catch (err) {
        console.error('Failed to load judgment', err);
        if (showLoading) {
          setJudgment(null);
          setError('Error loading judgment data');
          stopPolling();
        } else {
          pollErrorCount.current += 1;
          if (pollErrorCount.current >= MAX_POLL_ERRORS) {
            stopPolling();
          }
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [http, id, dataSourceId, stopPolling]
  );

  useEffect(() => {
    fetchJudgment({ showLoading: true });
    return () => {
      stopPolling();
    };
  }, [fetchJudgment, stopPolling]);

  useEffect(() => {
    if (judgment?.status !== 'PROCESSING') {
      return undefined;
    }

    if (intervalRef.current) {
      return undefined;
    }

    intervalRef.current = setInterval(() => {
      fetchJudgment();
    }, POLL_INTERVAL_MS);

    return () => {
      stopPolling();
    };
  }, [judgment?.status, fetchJudgment, stopPolling]);

  const formatJson = (json: string) => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  return {
    judgment,
    loading,
    error,
    formatJson,
  };
};
