/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigurationFormData } from './types';

/**
 * Builds the JSON body for creating an experiment. Omits empty optional name/description
 * so the backend can apply its default naming behavior.
 */
export function buildExperimentCreateRequestBody(data: ConfigurationFormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    type: data.type,
    querySetId: data.querySetId,
    size: data.size,
    searchConfigurationList: data.searchConfigurationList,
  };

  if ('judgmentList' in data && Array.isArray(data.judgmentList) && data.judgmentList.length > 0) {
    payload.judgmentList = data.judgmentList;
  }

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const description = typeof data.description === 'string' ? data.description.trim() : '';

  if (name) {
    payload.name = name;
  }
  if (description) {
    payload.description = description;
  }

  return payload;
}
