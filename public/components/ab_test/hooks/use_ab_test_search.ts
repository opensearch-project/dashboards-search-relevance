/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { AbTestService } from '../services/ab_test_service';
import { AbTestOption, SearchConfigOption } from '../types';
import { DEFAULT_UBI_INDEX, UBI_INDEX_STORAGE_KEY, readStoredUbiIndex } from '../utils/ubi_index';

export interface UseAbTestSearchReturn {
  searchText: string;
  setSearchText: (text: string) => void;
  results: any[];
  isSearching: boolean;
  testOptions: AbTestOption[];
  selectedTest: AbTestOption[];
  setSelectedTest: (selected: AbTestOption[]) => void;
  ubiIndexOptions: SearchConfigOption[];
  selectedUbiIndex: SearchConfigOption[];
  selectUbiIndex: (selected: SearchConfigOption[]) => void;
  queryA: string;
  queryB: string;
  configAName: string;
  configBName: string;
  search: () => Promise<void>;
  registerClick: (hit: any, position: number) => Promise<void>;
}

export const useAbTestSearch = (
  service: AbTestService,
  notifications: CoreStart['notifications']
): UseAbTestSearchReturn => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [testOptions, setTestOptions] = useState<AbTestOption[]>([]);
  const [selectedTest, setSelectedTest] = useState<AbTestOption[]>([]);
  const [ubiIndexOptions, setUbiIndexOptions] = useState<SearchConfigOption[]>([]);
  const [ubiIndexName, setUbiIndexName] = useState(readStoredUbiIndex);
  const [selectedUbiIndex, setSelectedUbiIndex] = useState<SearchConfigOption[]>(() => {
    const saved = readStoredUbiIndex();
    return [{ label: saved, value: saved }];
  });
  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');
  const [configAName, setConfigAName] = useState('');
  const [configBName, setConfigBName] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [tests, indices] = await Promise.all([
          service.fetchAbTestOptions(),
          service.fetchUbiIndices(),
        ]);
        setTestOptions(tests);
        setUbiIndexOptions(indices);
      } catch (err) {
        console.error('Failed to load A/B tests', err);
        notifications.toasts.addError(err?.body || err, {
          title: 'Failed to load A/B tests',
        });
      }
    };
    load();
  }, [service, notifications]);

  // Show the two configurations' stored queries as soon as a test is picked, so the user can see
  // what will run before searching.
  useEffect(() => {
    if (selectedTest.length === 0) {
      setQueryA('');
      setQueryB('');
      setConfigAName('');
      setConfigBName('');
      return;
    }

    const loadConfigs = async () => {
      try {
        const test = await service.fetchAbTest(selectedTest[0].value);
        if (!test) return;
        const {
          queryA: a,
          queryB: b,
          nameA,
          nameB,
        } = await service.fetchSearchConfigurationQueries(test.configA, test.configB);
        setQueryA(a);
        setQueryB(b);
        setConfigAName(nameA);
        setConfigBName(nameB);
      } catch (err) {
        console.error('Failed to load search configurations for this test', err);
        notifications.toasts.addError(err?.body || err, {
          title: 'Failed to load search configurations for this test',
        });
      }
    };
    loadConfigs();
  }, [service, notifications, selectedTest]);

  const selectUbiIndex = useCallback((selected: SearchConfigOption[]) => {
    setSelectedUbiIndex(selected);
    if (selected.length > 0) {
      setUbiIndexName(selected[0].value);
      localStorage.setItem(UBI_INDEX_STORAGE_KEY, selected[0].value);
    }
  }, []);

  const search = useCallback(async () => {
    if (selectedTest.length === 0) {
      notifications.toasts.addWarning('Please select an A/B test');
      return;
    }
    if (!searchText.trim()) {
      notifications.toasts.addWarning('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      setResults(await service.search(selectedTest[0].value, searchText));
    } catch (err) {
      console.error('A/B test search failed', err);
      notifications.toasts.addError(err?.body || err, {
        title: 'Search failed',
      });
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [service, notifications, selectedTest, searchText]);

  const registerClick = useCallback(
    async (hit: any, position: number) => {
      try {
        await service.registerClick({
          testId: selectedTest[0]?.value || '',
          searchConfigurationUuid: hit._search_configuration_id || '',
          docId: hit._id || '',
          title: hit._source?.title || hit._source?.product_title || '',
          position,
          ubiIndex: ubiIndexName || DEFAULT_UBI_INDEX,
        });
        // Short-lived so rapid clicks do not stack toasts over the result list.
        notifications.toasts.addSuccess('Click registered', { toastLifeTimeMs: 1500 });
      } catch (err) {
        console.error('Failed to register click', err);
        notifications.toasts.addError(err?.body || err, {
          title: 'Failed to register click',
        });
      }
    },
    [service, notifications, selectedTest, ubiIndexName]
  );

  return {
    searchText,
    setSearchText,
    results,
    isSearching,
    testOptions,
    selectedTest,
    setSelectedTest,
    ubiIndexOptions,
    selectedUbiIndex,
    selectUbiIndex,
    queryA,
    queryB,
    configAName,
    configBName,
    search,
    registerClick,
  };
};
