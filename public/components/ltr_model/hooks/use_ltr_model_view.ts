/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';
import { LtrFeature, LtrModelDetail, LtrUnavailableReason } from '../types';
import { mapLtrModelFields } from './use_ltr_model_list';

const mapFeature = (feature: any): LtrFeature => ({
  name: feature?.name ?? '',
  params: Array.isArray(feature?.params) ? feature.params : [],
  templateLanguage: feature?.template_language ?? '',
  template: feature?.template,
});

/**
 * `GET /_ltr/_model/{name}` returns a document response, so the model itself is under
 * `_source` exactly as it is in a listing hit — the listing mapper is reused for the shared
 * fields.
 */
export const mapLtrModelDetail = (response: any): LtrModelDetail => {
  const source = response?._source ?? {};
  const features = source.model?.feature_set?.features;
  return {
    ...mapLtrModelFields(response),
    features: Array.isArray(features) ? features.map(mapFeature) : [],
    definition: source.model?.model?.definition,
  };
};

export const useLtrModelView = (http: CoreStart['http'], name: string) => {
  const [model, setModel] = useState<LtrModelDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState<LtrUnavailableReason | null>(null);

  const fetchModel = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    setUnavailableReason(null);
    try {
      const response = await http.get(`${ServiceEndpoints.LtrModels}/${encodeURIComponent(name)}`);
      setModel(mapLtrModelDetail(response));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load LTR model', err);
      setModel(null);
      const reason = err?.body?.attributes?.ltrErrorType;
      if (reason === 'model_not_found') {
        setNotFound(true);
      } else if (reason) {
        setUnavailableReason(reason as LtrUnavailableReason);
      } else {
        setError(err?.body?.message || 'Failed to load the model due to an unknown error.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [http, name]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  return { model, isLoading, error, notFound, unavailableReason };
};
