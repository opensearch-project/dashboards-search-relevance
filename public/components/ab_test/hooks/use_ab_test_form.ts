/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { AbTestService } from '../services/ab_test_service';
import { SearchConfigOption } from '../types';

export interface UseAbTestFormReturn {
  name: string;
  setName: (name: string) => void;
  size: number;
  setSize: (size: number) => void;
  searchConfigs: SearchConfigOption[];
  selectedConfigA: SearchConfigOption[];
  setSelectedConfigA: (selected: SearchConfigOption[]) => void;
  selectedConfigB: SearchConfigOption[];
  setSelectedConfigB: (selected: SearchConfigOption[]) => void;
  isLoading: boolean;
  isCreated: boolean;
  createdTestId: string;
  createAbTest: () => Promise<void>;
}

const DEFAULT_SIZE = 10;

export const useAbTestForm = (
  service: AbTestService,
  notifications: CoreStart['notifications'],
  history?: { push: (path: string) => void }
): UseAbTestFormReturn => {
  const [name, setName] = useState('');
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [searchConfigs, setSearchConfigs] = useState<SearchConfigOption[]>([]);
  const [selectedConfigA, setSelectedConfigA] = useState<SearchConfigOption[]>([]);
  const [selectedConfigB, setSelectedConfigB] = useState<SearchConfigOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [createdTestId, setCreatedTestId] = useState('');

  useEffect(() => {
    const fetchSearchConfigs = async () => {
      try {
        setSearchConfigs(await service.fetchSearchConfigurations());
      } catch (err) {
        console.error('Failed to fetch search configurations', err);
        notifications.toasts.addError(err?.body || err, {
          title: 'Failed to fetch search configurations',
        });
      }
    };
    fetchSearchConfigs();
  }, [service, notifications]);

  const createAbTest = useCallback(async () => {
    if (!name.trim()) {
      notifications.toasts.addWarning('Please enter a test name');
      return;
    }
    if (selectedConfigA.length === 0 || selectedConfigB.length === 0) {
      notifications.toasts.addWarning('Please select both search configurations');
      return;
    }

    setIsLoading(true);
    try {
      const testId = await service.createAbTest({
        name,
        searchConfigurationA: selectedConfigA[0].value,
        searchConfigurationB: selectedConfigB[0].value,
        size,
      });
      notifications.toasts.addSuccess(`A/B Test "${name}" created successfully`);
      if (history) {
        history.push('/abTest');
      } else {
        setIsCreated(true);
        setCreatedTestId(testId);
      }
    } catch (err) {
      console.error('Failed to create A/B test', err);
      notifications.toasts.addError(err?.body || err, {
        title: 'Failed to create A/B test',
      });
    } finally {
      setIsLoading(false);
    }
  }, [service, notifications, history, name, size, selectedConfigA, selectedConfigB]);

  return {
    name,
    setName,
    size,
    setSize,
    searchConfigs,
    selectedConfigA,
    setSelectedConfigA,
    selectedConfigB,
    setSelectedConfigB,
    isLoading,
    isCreated,
    createdTestId,
    createAbTest,
  };
};
