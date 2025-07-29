/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuerySetService } from '../services/query_set_service';

describe('QuerySetService', () => {
  let mockHttp: any;
  let service: QuerySetService;

  beforeEach(() => {
    mockHttp = {
      post: jest.fn(),
      put: jest.fn(),
    };
    service = new QuerySetService(mockHttp);
  });

  describe('createQuerySet', () => {
    it('should call POST for non-manual input', async () => {
      const querySetData = {
        name: 'Test Query Set',
        description: 'Test description',
        sampling: 'random',
        querySetSize: 10,
      };

      mockHttp.post.mockResolvedValue({ success: true });

      await service.createQuerySet(querySetData, false);

      expect(mockHttp.post).toHaveBeenCalledWith('/api/relevancy/query_sets', {
        body: JSON.stringify({
          name: 'Test Query Set',
          description: 'Test description',
          sampling: 'random',
          querySetSize: 10,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(mockHttp.put).not.toHaveBeenCalled();
    });

    it('should call PUT for manual input', async () => {
      const querySetData = {
        name: 'Test Query Set',
        description: 'Test description',
        sampling: 'random',
        querySetQueries: [{ queryText: 'test query', referenceAnswer: 'test answer' }],
      };

      mockHttp.put.mockResolvedValue({ success: true });

      await service.createQuerySet(querySetData, true);

      expect(mockHttp.put).toHaveBeenCalledWith('/api/relevancy/query_sets', {
        body: JSON.stringify({
          name: 'Test Query Set',
          description: 'Test description',
          sampling: 'manual',
          querySetQueries: [{ queryText: 'test query', referenceAnswer: 'test answer' }],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const querySetData = {
        name: 'Test Query Set',
        description: 'Test description',
        sampling: 'random',
        querySetSize: 10,
      };

      const error = new Error('API Error');
      mockHttp.post.mockRejectedValue(error);

      await expect(service.createQuerySet(querySetData, false)).rejects.toThrow('API Error');
    });
  });
});
