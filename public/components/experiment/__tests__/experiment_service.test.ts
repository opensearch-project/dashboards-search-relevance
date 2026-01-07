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
      delete: jest.fn(),
    };
    service = new ExperimentService(mockHttp);
  });

  describe('getExperiments', () => {
    it('should handle response with hits', async () => {
      const mockResponse = {
        hits: {
          hits: [
            { _source: { id: 'exp1', name: 'Experiment 1' } },
            { _source: { id: 'exp2', name: 'Experiment 2' } },
          ],
        },
      };
      mockHttp.get.mockResolvedValue(mockResponse);

      await service.getExperiments();

      expect(mockHttp.get).toHaveBeenCalled();
    });

    it('should handle null response', async () => {
      mockHttp.get.mockResolvedValue(null);

      await service.getExperiments();

      expect(mockHttp.get).toHaveBeenCalled();
    });
  });

  describe('getScheduledExperiments', () => {
    it('should handle response with hits', async () => {
      const mockResponse = {
        hits: {
          hits: [
            { _source: { id: 'sched1', name: 'Scheduled 1' } },
          ],
        },
      };
      mockHttp.get.mockResolvedValue(mockResponse);

      await service.getScheduledExperiments();

      expect(mockHttp.get).toHaveBeenCalled();
    });

    it('should handle null response', async () => {
      mockHttp.get.mockResolvedValue(null);

      await service.getScheduledExperiments();

      expect(mockHttp.get).toHaveBeenCalled();
    });
  });

  describe('getScheduledExperiment', () => {
    it('should handle response with hits', async () => {
      const mockResponse = {
        hits: {
          hits: [
            { _source: { id: 'sched1', name: 'Scheduled 1' } },
          ],
        },
      };
      mockHttp.get.mockResolvedValue(mockResponse);

      const result = await service.getScheduledExperiment('sched1');

      expect(result).toBeDefined();
    });

    it('should handle null response', async () => {
      mockHttp.get.mockResolvedValue(null);

      const result = await service.getScheduledExperiment('sched1');

      expect(result).toBeNull();
    });
  });
});
