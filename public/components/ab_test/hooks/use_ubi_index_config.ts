/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { AbTestService } from '../services/ab_test_service';
import { DEFAULT_UBI_MAPPING, readStoredUbiIndex, storeUbiIndex } from '../utils/ubi_index';

export interface UseUbiIndexConfigReturn {
  indexName: string;
  setIndexName: (name: string) => void;
  mappingJson: string;
  setMappingJson: (json: string) => void;
  /** null until a check or create has run. */
  indexExists: boolean | null;
  isChecking: boolean;
  isCreating: boolean;
  checkIndex: () => Promise<void>;
  createIndex: () => Promise<void>;
}

export const useUbiIndexConfig = (
  service: AbTestService,
  notifications: CoreStart['notifications']
): UseUbiIndexConfigReturn => {
  const [indexName, setIndexNameState] = useState(readStoredUbiIndex);
  const [mappingJson, setMappingJson] = useState(() =>
    JSON.stringify(DEFAULT_UBI_MAPPING, null, 2)
  );
  const [indexExists, setIndexExists] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  /** Editing the name invalidates the previous existence check and updates the shared default. */
  const setIndexName = useCallback((name: string) => {
    setIndexNameState(name);
    setIndexExists(null);
    storeUbiIndex(name);
  }, []);

  const checkIndex = useCallback(async () => {
    if (!indexName.trim()) {
      notifications.toasts.addWarning('Please enter an index name');
      return;
    }
    setIsChecking(true);
    try {
      const exists = await service.checkIndexExists(indexName);
      setIndexExists(exists);
      if (exists) {
        notifications.toasts.addSuccess(`Index "${indexName}" exists`);
      } else {
        notifications.toasts.addWarning(`Index "${indexName}" was not found`);
      }
    } finally {
      setIsChecking(false);
    }
  }, [service, notifications, indexName]);

  const createIndex = useCallback(async () => {
    if (!indexName.trim()) {
      notifications.toasts.addWarning('Please enter an index name');
      return;
    }

    setIsCreating(true);
    try {
      // An unparseable mapping is sent as undefined so the backend applies its own default,
      // rather than failing the whole create.
      let mapping;
      try {
        mapping = JSON.parse(mappingJson);
      } catch (e) {
        mapping = undefined;
      }
      await service.createUbiIndex(indexName, mapping);
      notifications.toasts.addSuccess(`Index "${indexName}" created successfully`);
      setIndexExists(true);
    } catch (err) {
      const message = err?.body?.message || err?.message || '';
      // Already existing is the desired end state, so report it as success.
      if (message.includes('already_exists')) {
        notifications.toasts.addSuccess(`Index "${indexName}" already exists`);
        setIndexExists(true);
      } else {
        console.error('Failed to create UBI index', err);
        notifications.toasts.addError(err?.body || err, {
          title: `Failed to create index "${indexName}"`,
        });
      }
    } finally {
      setIsCreating(false);
    }
  }, [service, notifications, indexName, mappingJson]);

  return {
    indexName,
    setIndexName,
    mappingJson,
    setMappingJson,
    indexExists,
    isChecking,
    isCreating,
    checkIndex,
    createIndex,
  };
};
