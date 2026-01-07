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
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
    };
    service = new QuerySetService(mockHttp);
  });

  describe('fetchUbiIndexes', () => {
    it('should fetch and filter UBI indexes', async () => {
      const mockIndexes = [
        { index: 'opensearch_dashboards_sample_ubi_queries', uuid: 'uuid1' },
        { index: 'opensearch_dashboards_sample_ubi_events', uuid: 'uuid2' },
        { index: '.kibana', uuid: 'uuid3' },
        { index: 'other_index', uuid: 'uuid4' },
      ];

      mockHttp.get.mockResolvedValue(mockIndexes);

      const result = await service.fetchUbiIndexes();

      expect(mockHttp.get).toHaveBeenCalledWith('/api/relevancy/search/indexes');
      expect(result).toEqual([
        { label: 'opensearch_dashboards_sample_ubi_queries', value: 'uuid1' },
      ]);
    });

    it('should filter out system indexes', async () => {
      const mockIndexes = [
        { index: '.internal', uuid: 'uuid1' },
        { index: 'my_ubi_queries_index', uuid: 'uuid2' },
      ];

      mockHttp.get.mockResolvedValue(mockIndexes);

      const result = await service.fetchUbiIndexes();

      expect(result).toEqual([
        { label: 'my_ubi_queries_index', value: 'uuid2' },
      ]);
    });

    it('should handle empty index list', async () => {
      mockHttp.get.mockResolvedValue([]);

      const result = await service.fetchUbiIndexes();

      expect(result).toEqual([]);
    });
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

    it('should include ubi_queries_index when provided', async () => {
      const querySetData = {
        name: 'Test Query Set',
        description: 'Test description',
        sampling: 'random',
        querySetSize: 10,
        ubi_queries_index: 'custom_ubi_queries',
      };

      mockHttp.post.mockResolvedValue({ success: true });

      await service.createQuerySet(querySetData, false);

      expect(mockHttp.post).toHaveBeenCalledWith('/api/relevancy/query_sets', {
        body: JSON.stringify({
          name: 'Test Query Set',
          description: 'Test description',
          sampling: 'random',
          querySetSize: 10,
          ubi_queries_index: 'custom_ubi_queries',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
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
