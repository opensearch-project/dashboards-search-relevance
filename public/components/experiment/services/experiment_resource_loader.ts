/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from '../../../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';

export interface ExperimentResourceIds {
  experimentId: string;
  searchConfigurationId: string;
  querySetId: string;
  judgmentId: string;
  isScheduled?: boolean;
  scheduledExperimentJobId?: string;
}

export interface ExperimentResources {
  experiment: unknown;
  searchConfiguration: unknown;
  querySet: unknown;
  judgmentSet: unknown;
  scheduledExperimentJob: unknown | null;
}

const sanitizeResponse = (response: unknown) =>
  (response as { hits?: { hits?: Array<{ _source?: unknown }> } })?.hits?.hits?.[0]?._source ??
  undefined;

const dsOpts = (dataSourceId?: string | null) =>
  dataSourceId ? { query: { dataSourceId } } : {};

/**
 * Fetch experiment first, then load independent resources in parallel.
 * Used by evaluation_experiment_view.tsx and hybrid_optimizer_experiment_view.tsx.
 */
export async function loadExperimentResourcesParallel(
  http: CoreStart['http'],
  ids: ExperimentResourceIds,
  dataSourceId?: string | null
): Promise<ExperimentResources | null> {
  const options = dsOpts(dataSourceId);

  const experiment = await http
    .get(`${ServiceEndpoints.Experiments}/${ids.experimentId}`, options)
    .then(sanitizeResponse);

  if (!experiment) {
    return null;
  }

  const schedulePromise =
    ids.isScheduled && ids.scheduledExperimentJobId
      ? http
          .get(`${ServiceEndpoints.ScheduledExperiments}/${ids.scheduledExperimentJobId}`, options)
          .then(sanitizeResponse)
      : Promise.resolve(null);

  const [searchConfiguration, querySet, judgmentSet, scheduledExperimentJob] = await Promise.all([
    http
      .get(`${ServiceEndpoints.SearchConfigurations}/${ids.searchConfigurationId}`, options)
      .then(sanitizeResponse),
    http.get(`${ServiceEndpoints.QuerySets}/${ids.querySetId}`, options).then(sanitizeResponse),
    http.get(`${ServiceEndpoints.Judgments}/${ids.judgmentId}`, options).then(sanitizeResponse),
    schedulePromise,
  ]);

  return { experiment, searchConfiguration, querySet, judgmentSet, scheduledExperimentJob };
}
