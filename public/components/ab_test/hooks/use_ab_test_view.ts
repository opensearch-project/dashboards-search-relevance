/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { AbTestService, UpdateAbTestData } from '../services/ab_test_service';
import { AbTestItem, SearchConfigOption } from '../types';

export interface UseAbTestViewReturn {
  test: AbTestItem | null;
  searchConfigs: SearchConfigOption[];
  selectedConfigA: SearchConfigOption[];
  setSelectedConfigA: (selected: SearchConfigOption[]) => void;
  selectedConfigB: SearchConfigOption[];
  setSelectedConfigB: (selected: SearchConfigOption[]) => void;
  isLoading: boolean;
  isSaving: boolean;
  toggleInterleaving: () => Promise<void>;
  updateConfigurations: () => Promise<void>;
}

export const useAbTestView = (
  service: AbTestService,
  notifications: CoreStart['notifications'],
  testId: string,
  history?: { push: (path: string) => void }
): UseAbTestViewReturn => {
  const [test, setTest] = useState<AbTestItem | null>(null);
  const [searchConfigs, setSearchConfigs] = useState<SearchConfigOption[]>([]);
  const [selectedConfigA, setSelectedConfigA] = useState<SearchConfigOption[]>([]);
  const [selectedConfigB, setSelectedConfigB] = useState<SearchConfigOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [configs, loadedTest] = await Promise.all([
          service.fetchSearchConfigurations(),
          service.fetchAbTest(testId),
        ]);
        setSearchConfigs(configs);
        setTest(loadedTest);
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

  // Preselect the combo boxes once both the test and the configuration list are available.
  useEffect(() => {
    if (test && searchConfigs.length > 0) {
      const configA = searchConfigs.find((config) => config.value === test.configA);
      const configB = searchConfigs.find((config) => config.value === test.configB);
      if (configA) setSelectedConfigA([configA]);
      if (configB) setSelectedConfigB([configB]);
    }
  }, [test, searchConfigs]);

  const toggleInterleaving = useCallback(async () => {
    if (!test) return;
    setIsSaving(true);
    try {
      await service.updateAbTest(test.testId, { enabled: !test.enabled });
      notifications.toasts.addSuccess(`Interleaving ${!test.enabled ? 'enabled' : 'disabled'}`);
      setTest({ ...test, enabled: !test.enabled });
    } catch (err) {
      console.error('Failed to toggle interleaving', err);
      notifications.toasts.addError(err?.body || err, {
        title: 'Failed to update interleaving',
      });
    } finally {
      setIsSaving(false);
    }
  }, [service, notifications, test]);

  const updateConfigurations = useCallback(async () => {
    if (!test) return;

    // Send only the configurations that actually changed, so an unchanged field is not
    // rewritten (and does not create a spurious version snapshot).
    const body: UpdateAbTestData = {};
    if (selectedConfigA.length > 0 && selectedConfigA[0].value !== test.configA) {
      body.search_configuration_a = selectedConfigA[0].value;
    }
    if (selectedConfigB.length > 0 && selectedConfigB[0].value !== test.configB) {
      body.search_configuration_b = selectedConfigB[0].value;
    }
    if (Object.keys(body).length === 0) {
      notifications.toasts.addWarning('No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      await service.updateAbTest(test.testId, body);
      notifications.toasts.addSuccess('Configurations updated');
      if (history) {
        history.push('/abTest');
      } else {
        // Map back onto the view model's field names -- `body` uses the API's snake_case keys.
        setTest({
          ...test,
          configA: body.search_configuration_a ?? test.configA,
          configB: body.search_configuration_b ?? test.configB,
        });
      }
    } catch (err) {
      console.error('Failed to update configurations', err);
      notifications.toasts.addError(err?.body || err, {
        title: 'Failed to update configurations',
      });
    } finally {
      setIsSaving(false);
    }
  }, [service, notifications, history, test, selectedConfigA, selectedConfigB]);

  return {
    test,
    searchConfigs,
    selectedConfigA,
    setSelectedConfigA,
    selectedConfigB,
    setSelectedConfigB,
    isLoading,
    isSaving,
    toggleInterleaving,
    updateConfigurations,
  };
};
