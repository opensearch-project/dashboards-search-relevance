/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { AbTestService } from '../services/ab_test_service';
import { AbTestOption, ConfigResult, SearchConfigOption } from '../types';
import { SignificanceResult, calculateSignificance } from '../utils/statistics';

export interface UseAbTestResultsReturn {
  testOptions: AbTestOption[];
  selectedTest: AbTestOption[];
  setSelectedTest: (selected: AbTestOption[]) => void;
  indexOptions: SearchConfigOption[];
  selectedIndex: SearchConfigOption[];
  setSelectedIndex: (selected: SearchConfigOption[]) => void;
  results: ConfigResult[];
  totalClicks: number;
  stats: SignificanceResult | null;
  isLoading: boolean;
  fetchResults: () => Promise<void>;
}

export const useAbTestResults = (
  service: AbTestService,
  notifications: CoreStart['notifications']
): UseAbTestResultsReturn => {
  const [testOptions, setTestOptions] = useState<AbTestOption[]>([]);
  const [selectedTest, setSelectedTest] = useState<AbTestOption[]>([]);
  const [indexOptions, setIndexOptions] = useState<SearchConfigOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<SearchConfigOption[]>([]);
  const [results, setResults] = useState<ConfigResult[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [tests, indices] = await Promise.all([
          service.fetchAbTestOptions(),
          service.fetchUbiIndices(),
        ]);
        setTestOptions(tests);
        setIndexOptions(indices);
      } catch (err) {
        console.error('Failed to load A/B tests', err);
        notifications.toasts.addError(err?.body || err, {
          title: 'Failed to load A/B tests',
        });
      }
    };
    load();
  }, [service, notifications]);

  const fetchResults = useCallback(async () => {
    if (selectedTest.length === 0) {
      notifications.toasts.addWarning('Please select an A/B test');
      return;
    }
    if (selectedIndex.length === 0) {
      notifications.toasts.addWarning('Please select a UBI click index');
      return;
    }

    setIsLoading(true);
    try {
      const buckets = await service.fetchClickAggregation(
        selectedIndex[0].value,
        selectedTest[0].value
      );
      const total = buckets.reduce((sum, bucket) => sum + bucket.doc_count, 0);

      // A `terms` agg orders buckets by doc_count, so bucket[0] is simply whichever
      // configuration got more clicks -- not configuration A. Look the uuids up instead, and keep
      // a zero-click configuration in the list so it still renders (and so a lone bucket isn't
      // mistaken for a tie).
      const { configAUuid, configBUuid } = selectedTest[0];
      const countFor = (uuid?: string) =>
        buckets.find((bucket) => bucket.key === uuid)?.doc_count ?? 0;
      const ordered: ConfigResult[] =
        configAUuid && configBUuid
          ? [
              { key: configAUuid, doc_count: countFor(configAUuid), label: 'A' },
              { key: configBUuid, doc_count: countFor(configBUuid), label: 'B' },
            ]
          : buckets.map((bucket, i) => ({ ...bucket, label: i === 0 ? 'A' : 'B' }));

      setResults(ordered);
      setTotalClicks(total);
    } catch (err) {
      console.error('Failed to fetch A/B test results', err);
      notifications.toasts.addError(err?.body || err, {
        title: 'Failed to fetch results',
      });
    } finally {
      setIsLoading(false);
    }
  }, [service, notifications, selectedTest, selectedIndex]);

  return {
    testOptions,
    selectedTest,
    setSelectedTest,
    indexOptions,
    selectedIndex,
    setSelectedIndex,
    results,
    totalClicks,
    stats: calculateSignificance(results),
    isLoading,
    fetchResults,
  };
};
