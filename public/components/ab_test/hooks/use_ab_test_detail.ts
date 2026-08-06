/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { AbTestService } from '../services/ab_test_service';
import { AbTestItem, AbTestSnapshot } from '../types';

export interface UseAbTestDetailReturn {
  test: AbTestItem | null;
  configAName: string;
  configBName: string;
  snapshots: AbTestSnapshot[];
  isLoading: boolean;
}

export const useAbTestDetail = (
  service: AbTestService,
  notifications: CoreStart['notifications'],
  testId: string
): UseAbTestDetailReturn => {
  const [test, setTest] = useState<AbTestItem | null>(null);
  const [configAName, setConfigAName] = useState('-');
  const [configBName, setConfigBName] = useState('-');
  const [snapshots, setSnapshots] = useState<AbTestSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const loadedTest = await service.fetchAbTest(testId);
        setTest(loadedTest);
        if (loadedTest) {
          const [nameA, nameB] = await Promise.all([
            service.fetchSearchConfigurationName(loadedTest.configA),
            service.fetchSearchConfigurationName(loadedTest.configB),
          ]);
          setConfigAName(nameA);
          setConfigBName(nameB);
        }
      } catch (err) {
        console.error('Failed to load A/B test', err);
        notifications.toasts.addError(err?.body || err, {
          title: 'Failed to load A/B test',
        });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [service, notifications, testId]);

  // Version history is supplementary: a failure here leaves the panel hidden rather than
  // blocking the test details the user came for.
  useEffect(() => {
    const loadSnapshots = async () => {
      try {
        setSnapshots(await service.fetchSnapshots(testId));
      } catch (err) {
        console.error('Failed to load A/B test version history', err);
        setSnapshots([]);
      }
    };
    loadSnapshots();
  }, [service, testId]);

  return { test, configAName, configBName, snapshots, isLoading };
};
