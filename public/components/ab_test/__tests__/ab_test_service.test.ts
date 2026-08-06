/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AbTestService } from '../services/ab_test_service';

/** Wraps hits the way the generic search proxy returns them. */
const searchResponse = (hits: any[]) => ({ result1: { hits: { hits } } });

describe('AbTestService', () => {
  let mockHttp: any;
  let service: AbTestService;

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };
    service = new AbTestService(mockHttp);
  });

  describe('fetchSearchConfigurations', () => {
    it('maps configurations to combo box options', async () => {
      mockHttp.get.mockResolvedValue({
        hits: { hits: [{ _id: 'id-1', _source: { name: 'BM25' } }] },
      });

      expect(await service.fetchSearchConfigurations()).toEqual([{ label: 'BM25', value: 'id-1' }]);
    });

    it('falls back to the id when a configuration has no name', async () => {
      mockHttp.get.mockResolvedValue({ hits: { hits: [{ _id: 'id-1', _source: {} }] } });

      expect(await service.fetchSearchConfigurations()).toEqual([{ label: 'id-1', value: 'id-1' }]);
    });

    it('de-duplicates configurations sharing an id', async () => {
      mockHttp.get.mockResolvedValue({
        hits: {
          hits: [
            { _id: 'id-1', _source: { name: 'BM25' } },
            { _id: 'id-1', _source: { name: 'BM25' } },
            { _id: 'id-2', _source: { name: 'Neural' } },
          ],
        },
      });

      expect(await service.fetchSearchConfigurations()).toHaveLength(2);
    });

    it('returns an empty list when the response has no hits', async () => {
      mockHttp.get.mockResolvedValue({});

      expect(await service.fetchSearchConfigurations()).toEqual([]);
    });
  });

  describe('fetchUbiIndices', () => {
    it('keeps only indices whose name contains "ubi", case-insensitively', async () => {
      mockHttp.get.mockResolvedValue([
        { index: 'ubi_events' },
        { index: 'products' },
        { index: 'UBI_Custom' },
      ]);

      expect(await service.fetchUbiIndices()).toEqual([
        { label: 'ubi_events', value: 'ubi_events' },
        { label: 'UBI_Custom', value: 'UBI_Custom' },
      ]);
    });

    it('accepts plain index name strings', async () => {
      mockHttp.get.mockResolvedValue(['ubi_events', 'products']);

      expect(await service.fetchUbiIndices()).toEqual([
        { label: 'ubi_events', value: 'ubi_events' },
      ]);
    });
  });

  describe('findAbTests', () => {
    const hits = [
      {
        _id: 'test-1',
        _source: { doc_type: 'ab_test', name: 'BM25 vs Neural', test_id: 'test-1', size: 20 },
      },
      {
        _id: 'snap-1',
        _source: { doc_type: 'snapshot', test_id: 'test-1' },
      },
    ];

    it('excludes snapshot documents from the listing', async () => {
      mockHttp.post.mockResolvedValue(searchResponse(hits));

      const result = await service.findAbTests();

      expect(result.total).toBe(1);
      expect(result.hits[0].test_id).toBe('test-1');
    });

    it('reports an enabled test as Active and a disabled one as Disabled', async () => {
      mockHttp.post.mockResolvedValue(
        searchResponse([
          { _id: 'a', _source: { doc_type: 'ab_test', test_id: 'a', enabled: false } },
          { _id: 'b', _source: { doc_type: 'ab_test', test_id: 'b' } },
        ])
      );

      const result = await service.findAbTests();

      expect(result.hits.map((test) => test.status)).toEqual(['Disabled', 'Active']);
    });

    it('filters by name or test id, case-insensitively', async () => {
      mockHttp.post.mockResolvedValue(searchResponse(hits));

      expect((await service.findAbTests('NEURAL')).total).toBe(1);
      expect((await service.findAbTests('test-1')).total).toBe(1);
      expect((await service.findAbTests('nonexistent')).total).toBe(0);
    });
  });

  describe('fetchAbTestOptions', () => {
    it('carries the per-configuration uuids needed to label results', async () => {
      mockHttp.post.mockResolvedValue(
        searchResponse([
          {
            _id: 'test-1',
            _source: {
              doc_type: 'ab_test',
              name: 'My Test',
              test_id: 'test-1',
              config_a_uuid: 'uuid-a',
              config_b_uuid: 'uuid-b',
            },
          },
        ])
      );

      expect(await service.fetchAbTestOptions()).toEqual([
        { label: 'My Test', value: 'test-1', configAUuid: 'uuid-a', configBUuid: 'uuid-b' },
      ]);
    });
  });

  describe('fetchAbTest', () => {
    it('maps a hit onto the view model', async () => {
      mockHttp.post.mockResolvedValue(
        searchResponse([
          {
            _id: 'test-1',
            _source: {
              name: 'My Test',
              test_id: 'test-1',
              size: 20,
              search_configuration_a: 'config-a',
              search_configuration_b: 'config-b',
              created_at: '2026-01-01T00:00:00Z',
            },
          },
        ])
      );

      const test = await service.fetchAbTest('test-1');

      expect(test).toMatchObject({
        testId: 'test-1',
        name: 'My Test',
        size: 20,
        enabled: true,
        configA: 'config-a',
        configB: 'config-b',
      });
    });

    it('returns null when the id matches nothing', async () => {
      mockHttp.post.mockResolvedValue(searchResponse([]));

      expect(await service.fetchAbTest('missing')).toBeNull();
    });
  });

  describe('fetchSnapshots', () => {
    it('reads `created` from the top level and the configurations from `record`', async () => {
      mockHttp.post.mockResolvedValue(
        searchResponse([
          {
            _id: 'snap-1',
            _source: {
              created: '2026-01-01T00:00:00Z',
              record: {
                search_configuration_a: 'config-a',
                search_configuration_b: 'config-b',
                enabled: true,
              },
            },
          },
        ])
      );

      expect(await service.fetchSnapshots('test-1')).toEqual([
        {
          id: 'snap-1',
          created: '2026-01-01T00:00:00Z',
          configA: 'config-a',
          configB: 'config-b',
          enabled: true,
        },
      ]);
    });
  });

  describe('createAbTest', () => {
    it('derives a slug id from the name and returns it', async () => {
      const testId = await service.createAbTest({
        name: '  BM25 vs   Neural  ',
        searchConfigurationA: 'config-a',
        searchConfigurationB: 'config-b',
        size: 10,
      });

      expect(testId).toBe('bm25-vs-neural');
      expect(mockHttp.put).toHaveBeenCalledWith('/api/relevancy/ab_tests/bm25-vs-neural', {
        body: JSON.stringify({
          name: 'BM25 vs   Neural',
          search_configuration_a: 'config-a',
          search_configuration_b: 'config-b',
          size: 10,
        }),
      });
    });
  });

  describe('updateAbTest', () => {
    it('posts only the supplied fields to the update endpoint', async () => {
      await service.updateAbTest('test-1', { enabled: false });

      expect(mockHttp.put).toHaveBeenCalledWith('/api/relevancy/ab_tests/test-1/_update', {
        body: JSON.stringify({ enabled: false }),
      });
    });
  });

  describe('search', () => {
    it('sends the trimmed search text and returns the interleaved hits', async () => {
      mockHttp.post.mockResolvedValue({ hits: [{ _id: 'doc-1' }] });

      const results = await service.search('test-1', '  shoes  ');

      expect(mockHttp.post).toHaveBeenCalledWith('/api/relevancy/ab_tests/test-1/_search', {
        body: JSON.stringify({ query_params: { SearchText: 'shoes' } }),
      });
      expect(results).toEqual([{ _id: 'doc-1' }]);
    });

    it('returns an empty list when the response carries no hits', async () => {
      mockHttp.post.mockResolvedValue({});

      expect(await service.search('test-1', 'shoes')).toEqual([]);
    });
  });

  describe('registerClick', () => {
    it("maps the event onto the API's snake_case body", async () => {
      await service.registerClick({
        testId: 'test-1',
        searchConfigurationUuid: 'uuid-a',
        docId: 'doc-1',
        title: 'A Product',
        position: 3,
        ubiIndex: 'ubi_events',
      });

      expect(mockHttp.post).toHaveBeenCalledWith('/api/relevancy/ab_tests/register_click', {
        body: JSON.stringify({
          test_id: 'test-1',
          search_configuration_uuid: 'uuid-a',
          doc_id: 'doc-1',
          title: 'A Product',
          position: 3,
          ubi_index: 'ubi_events',
        }),
      });
    });
  });

  describe('fetchClickAggregation', () => {
    it('returns the raw buckets', async () => {
      mockHttp.post.mockResolvedValue({
        aggregations: { clicks_per_config: { buckets: [{ key: 'uuid-a', doc_count: 7 }] } },
      });

      expect(await service.fetchClickAggregation('ubi_events', 'test-1')).toEqual([
        { key: 'uuid-a', doc_count: 7 },
      ]);
    });

    it('returns an empty list when the aggregation is absent', async () => {
      mockHttp.post.mockResolvedValue({});

      expect(await service.fetchClickAggregation('ubi_events', 'test-1')).toEqual([]);
    });
  });

  describe('checkIndexExists', () => {
    it('is true when the index can be queried', async () => {
      mockHttp.post.mockResolvedValue(searchResponse([]));

      expect(await service.checkIndexExists('ubi_events')).toBe(true);
    });

    it('is false when the query fails', async () => {
      mockHttp.post.mockRejectedValue(new Error('index_not_found_exception'));

      expect(await service.checkIndexExists('missing')).toBe(false);
    });
  });

  describe('deleteAbTest', () => {
    it('deletes by test id', async () => {
      await service.deleteAbTest('test-1');

      expect(mockHttp.delete).toHaveBeenCalledWith('/api/relevancy/ab_tests/test-1');
    });
  });
});
