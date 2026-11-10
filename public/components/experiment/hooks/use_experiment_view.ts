/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { toExperiment } from '../../../types/index';
import { ExperimentService } from '../services/experiment_service';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ERRORS = 3;

export const useExperimentView = (
  http: CoreStart['http'],
  id: string,
  dataSourceId?: string | null
) => {
  const [experiment, setExperiment] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshRevision, setRefreshRevision] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollErrorCount = useRef<number>(0);
  const experimentServiceRef = useRef(new ExperimentService(http));
  const isMountedRef = useRef(true);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const fetchExperiment = useCallback(
    async (options?: { showLoading?: boolean }) => {
      const showLoading = options?.showLoading ?? false;

      try {
        if (showLoading && isMountedRef.current) {
          setLoading(true);
          setError(null);
        }

        const response = await experimentServiceRef.current.getExperiment(id, dataSourceId);
        if (!isMountedRef.current) {
          return;
        }
        const source = response?.hits?.hits?.[0]?._source;

        if (source) {
          const parsedExperiment = toExperiment(source);
          if (parsedExperiment.success) {
            setExperiment(parsedExperiment.data);
            setError(null);
            pollErrorCount.current = 0;

            if (parsedExperiment.data.status !== 'PROCESSING') {
              stopPolling();
            }
          } else {
            setError('Invalid experiment data format');
            setExperiment(null);
            stopPolling();
          }
        } else if (showLoading) {
          setExperiment(null);
          setError('No matching experiment found');
          stopPolling();
        } else {
          // Poll tick found no document (e.g. deleted mid-run). Treat like a poll
          // error rather than silently continuing to poll forever.
          pollErrorCount.current += 1;
          if (pollErrorCount.current >= MAX_POLL_ERRORS) {
            stopPolling();
          }
        }
      } catch (err) {
        console.error('Failed to fetch experiment', err);
        if (!isMountedRef.current) {
          return;
        }
        if (showLoading) {
          setExperiment(null);
          if (err?.body?.statusCode === 404) {
            setError('No matching experiment found');
          } else {
            setError(err?.body?.message || 'Error loading experiment data');
          }
          stopPolling();
        } else {
          pollErrorCount.current += 1;
          if (pollErrorCount.current >= MAX_POLL_ERRORS) {
            stopPolling();
          }
        }
      } finally {
        if (showLoading && isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [id, dataSourceId, stopPolling]
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchExperiment({ showLoading: true });
    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchExperiment, stopPolling, refreshRevision]);

  useEffect(() => {
    if (experiment?.status !== 'PROCESSING') {
      return undefined;
    }

    if (intervalRef.current) {
      return undefined;
    }

    intervalRef.current = setInterval(() => {
      fetchExperiment();
    }, POLL_INTERVAL_MS);

    return () => {
      stopPolling();
    };
  }, [experiment?.status, fetchExperiment, stopPolling]);

  return {
    experiment,
    loading,
    error,
    refetch: () => setRefreshRevision((r) => r + 1),
  };
};
