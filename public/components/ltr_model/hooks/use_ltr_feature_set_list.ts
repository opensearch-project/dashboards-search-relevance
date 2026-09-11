/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { LtrModelService } from '../services/ltr_model_service';
import { LtrFeatureSetSummary, LtrUnavailableReason } from '../types';

/**
 * Backs the upload form's feature set picker. A model is created against a feature set that
 * already exists in the store -- this plugin does not author feature sets -- so an empty
 * list is a dead end the form has to say something about rather than an error.
 */
export const useLtrFeatureSetList = (http: CoreStart['http']) => {
  const service = useMemo(() => new LtrModelService(http), [http]);
  const [featureSets, setFeatureSets] = useState<LtrFeatureSetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailableReason, setUnavailableReason] = useState<LtrUnavailableReason | null>(null);

  const fetchFeatureSets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setUnavailableReason(null);
    try {
      setFeatureSets(await service.listFeatureSets());
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load LTR feature sets', err);
      setFeatureSets([]);
      const reason = err?.body?.attributes?.ltrErrorType as LtrUnavailableReason | undefined;
      if (reason) {
        setUnavailableReason(reason);
      } else {
        setError(err?.body?.message || 'Failed to load feature sets due to an unknown error.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetchFeatureSets();
  }, [fetchFeatureSets]);

  return { featureSets, isLoading, error, unavailableReason };
};
