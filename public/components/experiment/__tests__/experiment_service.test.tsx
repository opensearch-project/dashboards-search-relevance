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
      delete: jest.fn(),
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

  describe('getSingleExperiment', () => {
    it('should fetch and transform single experiment', async () => {
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

      const result = await service.getExperiment('1');

      expect(result).toEqual(
        {
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
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('deleteExperiment', () => {
    it('should delete single experiment', async () => {
      const mockResponse = {
        
      };
      mockHttp.delete.mockResolvedValue(mockResponse);

      const result = await service.deleteExperiment('id');

      expect(result).toEqual(
        mockResponse
      );
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

  describe('getSingleScheduledExperiments', () => {
    it('should fetch and transform single scheduled experiment', async () => {
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

      const result = await service.getScheduledExperiment('id');

      expect(result).toEqual(
        {
          success: true,
          data: {
              id: '1',
              expression: '* * * * *',
          },
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

  describe('deleteScheduledExperiment', () => {
    it('should delete single scheduled experiment', async () => {
      const mockResponse = {
        
      };
      mockHttp.delete.mockResolvedValue(mockResponse);

      const result = await service.deleteScheduledExperiment('id');

      expect(result).toEqual(
        mockResponse
      );
    });
  });

  describe('error handling', () => {
    it('should handle getExperiments error', async () => {
      mockHttp.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getExperiments()).rejects.toThrow('API Error');
    });

    it('should handle getSingleExperiment error', async () => {
      mockHttp.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getExperiment('id')).rejects.toThrow('API Error');
    });

    it('should handle createExperiment error', async () => {
      mockHttp.post.mockRejectedValue(new Error('API Error'));

      const formData = {
        querySetId: '1',
        searchConfigurationList: ['1'],
        judgmentList: ['1'],
        size: 8,
        type: 'POINTWISE_EVALUATION'
      };

      await expect(service.createExperiment(formData)).rejects.toThrow('API Error');
    });

    it('should handle deleteExperiment error', async () => {
      mockHttp.delete.mockRejectedValue(new Error('API Error'));

      await expect(service.deleteExperiment('id')).rejects.toThrow('API Error');
    });

    it('should handle getScheduledExperiments error', async () => {
      mockHttp.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getScheduledExperiments()).rejects.toThrow('API Error');
    });

    it('should handle getSingleScheduledExperiments error', async () => {
      mockHttp.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getScheduledExperiment('id')).rejects.toThrow('API Error');
    });

    it('should handle createScheduledExperiment error', async () => {
      mockHttp.post.mockRejectedValue(new Error('API Error'));

      const formData = {
        experimentId: '1',
        cronExpression: '* * * * *'
      };

      await expect(service.createScheduledExperiment(formData)).rejects.toThrow('API Error');
    });

    it('should handle deleteScheduledExperiment error', async () => {
      mockHttp.delete.mockRejectedValue(new Error('API Error'));

      await expect(service.deleteScheduledExperiment('id')).rejects.toThrow('API Error');
    });
  });
});
