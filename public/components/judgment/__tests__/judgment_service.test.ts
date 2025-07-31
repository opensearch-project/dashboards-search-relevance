/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { JudgmentService } from '../services/judgment_service';

describe('JudgmentService', () => {
  let mockHttp: any;
  let service: JudgmentService;

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
    };
    service = new JudgmentService(mockHttp);
  });

  describe('fetchQuerySets', () => {
    it('should fetch and transform query sets', async () => {
      const mockResponse = {
        hits: {
          hits: [
            { _source: { name: 'Query Set 1', id: 'qs1' } },
            { _source: { name: 'Query Set 2', id: 'qs2' } },
          ],
        },
      };
      mockHttp.get.mockResolvedValue(mockResponse);

      const result = await service.fetchQuerySets();

      expect(result).toEqual([
        { label: 'Query Set 1', value: 'qs1' },
        { label: 'Query Set 2', value: 'qs2' },
      ]);
    });
  });

  describe('fetchModels', () => {
    it('should fetch and filter deployed remote models', async () => {
      const mockResponse = {
        hits: {
          hits: [
            {
              _id: 'model1',
              _source: {
                name: 'Model 1',
                algorithm: 'REMOTE',
                model_state: 'DEPLOYED',
              },
            },
            {
              _id: 'model2',
              _source: {
                name: 'Model 2',
                algorithm: 'LOCAL',
                model_state: 'DEPLOYED',
              },
            },
          ],
        },
      };
      mockHttp.post.mockResolvedValue(mockResponse);

      const result = await service.fetchModels();

      expect(result).toEqual([
        {
          label: 'Model 1',
          value: 'model1',
          state: 'DEPLOYED',
          algorithm: 'REMOTE',
        },
      ]);
    });
  });

  describe('createJudgment', () => {
    it('should create judgment with correct payload', async () => {
      const formData = { name: 'test', type: 'LLM_JUDGMENT' };

      await service.createJudgment(formData);

      expect(mockHttp.put).toHaveBeenCalledWith(expect.any(String), {
        body: JSON.stringify(formData),
      });
    });
  });

  describe('error handling', () => {
    it('should handle fetchQuerySets error', async () => {
      mockHttp.get.mockRejectedValue(new Error('API Error'));

      await expect(service.fetchQuerySets()).rejects.toThrow('API Error');
    });

    it('should handle fetchSearchConfigs error', async () => {
      mockHttp.get.mockRejectedValue(new Error('API Error'));

      await expect(service.fetchSearchConfigs()).rejects.toThrow('API Error');
    });

    it('should handle fetchModels error', async () => {
      mockHttp.post.mockRejectedValue(new Error('API Error'));

      await expect(service.fetchModels()).rejects.toThrow('API Error');
    });

    it('should handle createJudgment error', async () => {
      mockHttp.put.mockRejectedValue(new Error('API Error'));
      const formData = { name: 'test', type: 'LLM_JUDGMENT' };

      await expect(service.createJudgment(formData)).rejects.toThrow('API Error');
    });
  });
});
