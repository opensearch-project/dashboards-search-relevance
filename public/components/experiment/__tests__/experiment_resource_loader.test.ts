/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceEndpoints } from '../../../../common';
import {
  ExperimentResourceIds,
  loadExperimentResourcesParallel,
} from '../services/experiment_resource_loader';

const sampleIds: ExperimentResourceIds = {
  experimentId: 'exp-1',
  searchConfigurationId: 'sc-1',
  querySetId: 'qs-1',
  judgmentId: 'j-1',
  isScheduled: true,
  scheduledExperimentJobId: 'sched-1',
};

const sourceForPath = (path: string) => {
  const id = path.split('/').pop();
  return { hits: { hits: [{ _source: { id } }] } };
};

const createConcurrentTrackingHttp = () => {
  let inFlight = 0;
  let maxConcurrent = 0;

  const get = jest.fn(async () => {
    inFlight += 1;
    maxConcurrent = Math.max(maxConcurrent, inFlight);
    await new Promise((resolve) => setImmediate(resolve));
    inFlight -= 1;
    return { hits: { hits: [{ _source: { id: 'resource' } }] } };
  });

  return {
    http: { get },
    getMaxConcurrent: () => maxConcurrent,
  };
};

describe('loadExperimentResourcesParallel', () => {
  it('returns null when the experiment is not found', async () => {
    const http = {
      get: jest.fn().mockResolvedValue({ hits: { hits: [] } }),
    };

    const resources = await loadExperimentResourcesParallel(http, sampleIds);

    expect(resources).toBeNull();
    expect(http.get).toHaveBeenCalledTimes(1);
    expect(http.get).toHaveBeenCalledWith(`${ServiceEndpoints.Experiments}/exp-1`, {});
  });

  it('loads dependent resources concurrently after the experiment fetch', async () => {
    const { http, getMaxConcurrent } = createConcurrentTrackingHttp();

    await loadExperimentResourcesParallel(http, sampleIds);

    expect(http.get).toHaveBeenCalledTimes(5);
    expect(getMaxConcurrent()).toBeGreaterThanOrEqual(4);
  });

  it('returns all experiment resources', async () => {
    const http = {
      get: jest.fn(async (path: string) => sourceForPath(path)),
    };

    const resources = await loadExperimentResourcesParallel(http, sampleIds);

    expect(resources).toEqual({
      experiment: { id: 'exp-1' },
      searchConfiguration: { id: 'sc-1' },
      querySet: { id: 'qs-1' },
      judgmentSet: { id: 'j-1' },
      scheduledExperimentJob: { id: 'sched-1' },
    });
  });

  it('calls expected endpoints with dataSourceId when provided', async () => {
    const http = {
      get: jest.fn(async (path: string) => sourceForPath(path)),
    };
    const dsOptions = { query: { dataSourceId: 'ds-abc' } };

    await loadExperimentResourcesParallel(http, sampleIds, 'ds-abc');

    expect(http.get).toHaveBeenCalledTimes(5);
    expect(http.get).toHaveBeenCalledWith(`${ServiceEndpoints.Experiments}/exp-1`, dsOptions);
    expect(http.get).toHaveBeenCalledWith(
      `${ServiceEndpoints.SearchConfigurations}/sc-1`,
      dsOptions
    );
    expect(http.get).toHaveBeenCalledWith(`${ServiceEndpoints.QuerySets}/qs-1`, dsOptions);
    expect(http.get).toHaveBeenCalledWith(`${ServiceEndpoints.Judgments}/j-1`, dsOptions);
    expect(http.get).toHaveBeenCalledWith(
      `${ServiceEndpoints.ScheduledExperiments}/sched-1`,
      dsOptions
    );
  });

  it('skips scheduled job fetch when the experiment is not scheduled', async () => {
    const http = {
      get: jest.fn(async (path: string) => sourceForPath(path)),
    };

    const resources = await loadExperimentResourcesParallel(http, {
      ...sampleIds,
      isScheduled: false,
    });

    expect(http.get).toHaveBeenCalledTimes(4);
    expect(resources?.scheduledExperimentJob).toBeNull();
  });
});
