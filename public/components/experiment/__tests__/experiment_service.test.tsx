/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExperimentService } from '../services/experiment_service';

describe('ExperimentService', () => {
  let mockHttp: any;
  let service: ExperimentService;

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
    };
    service = new ExperimentService(mockHttp);
  });

  describe('getExperiments', () => {
    it('should fetch and transform experiments', async () => {
      const mockResponse = {
        hits: {
          hits: [
            { _source: { id: '1',
                    timestamp: '2000-01-01T00:00:00.000Z',
                    type: 'HYBRID_OPTIMIZER',
                    status: 'COMPLETED',
                    querySetId: '1',
                    searchConfigurationList: [
                        '1'
                    ],
                    judgmentList: [
                        '1'
                    ],
                    size: 10,
                    isScheduled: false, 
                    results: []
                    } },
          ],
        },
      };
      mockHttp.get.mockResolvedValue(mockResponse);

      const result = await service.getExperiments();

      expect(result).toEqual(
        {
          success: true,
          data: [{
              type: 'HYBRID_OPTIMIZER',
              status: 'COMPLETED',
              id: '1',
              k: 10,
              querySetId: '1',
              timestamp: '2000-01-01T00:00:00.000Z',
              searchConfigurationId: '1',
              judgmentId: '1',
              isScheduled: false,
              scheduledExperimentJobId: '',
              size: 0
          }],
        },
      );
    });
  });

  describe('createExperiment', () => {
    it('should create experiment with correct payload', async () => {
      const formData = {
        querySetId: '1',
        searchConfigurationList: ['1'],
        judgmentList: ['1'],
        size: 8,
        type: 'POINTWISE_EVALUATION'
      };

      await service.createExperiment(formData);

      expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), {
        body: JSON.stringify(formData),
      });
    });
  });

  describe('getScheduledExperiments', () => {
    it('should fetch and transform experiments', async () => {
      const mockResponse = {
        hits: {
          hits: [
            { _source: {
              id: '1',
              enabled: true,
              schedule: {
                  cron: {
                      expression: '* * * * *',
                      timezone: 'America/Los_Angeles'
                  }
              },
              enabledTime: 0,
              lastUpdateTime: 0,
              timestamp: '2000-01-01T00:00:00.000Z'
            },
            },
          ],
        },
      };
      mockHttp.get.mockResolvedValue(mockResponse);

      const result = await service.getScheduledExperiments();

      expect(result).toEqual(
        {
          success: true,
          data: [{
              id: '1',
              expression: '* * * * *',
          }],
        },
      );
    });
  });

  describe('createScheduledExperiment', () => {
    it('should create experiment with correct payload', async () => {
      const formData = {
        experimentId: '1',
        cronExpression: '* * * * *'
      };

      await service.createScheduledExperiment(formData);

      expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), {
        body: JSON.stringify(formData),
      });
    });
  });
});
