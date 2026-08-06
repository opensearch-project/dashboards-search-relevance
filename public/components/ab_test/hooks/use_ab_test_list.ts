/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { extractUserMessageFromError } from '../../../../common';
import { AbTestService } from '../services/ab_test_service';
import { AbTestListItem } from '../types';

export interface UseAbTestListReturn {
  isLoading: boolean;
  error: string | null;
  refreshKey: number;
  findAbTests: (search?: string) => Promise<{ total: number; hits: AbTestListItem[] }>;
  deleteAbTest: (testId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAbTestList = (
  service: AbTestService,
  notifications: CoreStart['notifications']
): UseAbTestListReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const findAbTests = useCallback(
    async (search?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        return await service.findAbTests(search);
      } catch (err) {
        console.error('Failed to load A/B tests', err);
        const errorMessage = extractUserMessageFromError(err);
        setError(errorMessage || 'Failed to load A/B tests due to an unknown error.');
        return { total: 0, hits: [] };
      } finally {
        setIsLoading(false);
      }
    },
    [service]
  );

  const deleteAbTest = useCallback(
    async (testId: string) => {
      setIsLoading(true);
      try {
        await service.deleteAbTest(testId);
        notifications.toasts.addSuccess('A/B test deleted');
        setError(null);
        setRefreshKey((prev) => prev + 1);
      } catch (err) {
        console.error('Failed to delete A/B test', err);
        notifications.toasts.addError(err?.body || err, {
          title: 'Failed to delete A/B test',
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [service, notifications]
  );

  return { isLoading, error, refreshKey, findAbTests, deleteAbTest, setError };
};
