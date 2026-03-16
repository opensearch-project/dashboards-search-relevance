/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SearchConfigurationService } from '../services/search_configuration_service';

describe('SearchConfigurationService', () => {
  let service: SearchConfigurationService;
  let mockHttp: any;

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      put: jest.fn(),
      post: jest.fn(),
    };
    service = new SearchConfigurationService(mockHttp);
  });

  describe('fetchIndexes', () => {
    it('should fetch and format indexes correctly', async () => {
      const mockIndexes = [
        { index: 'test-index-1', uuid: 'uuid-1' },
        { index: '.system-index', uuid: 'uuid-2' },
        { index: 'test-index-2', uuid: 'uuid-3' },
      ];
      mockHttp.get.mockResolvedValue(mockIndexes);

      const result = await service.fetchIndexes();

      expect(result).toEqual([
        { label: 'test-index-1', value: 'uuid-1' },
        { label: 'test-index-2', value: 'uuid-3' },
      ]);
    });
  });

  describe('fetchPipelines', () => {
    it('should fetch and format pipelines correctly', async () => {
      const mockPipelines = {
        'pipeline-1': {},
        'pipeline-2': {},
      };
      mockHttp.get.mockResolvedValue(mockPipelines);

      const result = await service.fetchPipelines();

      expect(result).toEqual([{ label: 'pipeline-1' }, { label: 'pipeline-2' }]);
    });
  });

  describe('createSearchConfiguration', () => {
    it('should create search configuration with correct data', async () => {
      const configData = {
        name: 'Test Config',
        index: 'test-index',
        query: '{"query": {"match_all": {}}}',
        searchPipeline: 'test-pipeline',
      };
      mockHttp.put.mockResolvedValue({ success: true });

      await service.createSearchConfiguration(configData);

      expect(mockHttp.put).toHaveBeenCalledWith('/api/relevancy/search_configurations', {
        body: JSON.stringify(configData),
      });
    });
  });

  describe('validateSearchQuery', () => {
    it('should validate search query and return results', async () => {
      const requestBody = { query: {}, index: 'test-index' };
      const mockResponse = { result: { hits: { hits: [] } } };
      mockHttp.post.mockResolvedValue(mockResponse);

      const result = await service.validateSearchQuery(requestBody);

      expect(result).toEqual(mockResponse.result);
    });
  });

  describe('with dataSourceId', () => {
    it('fetchIndexes should append dataSourceId to URL', async () => {
      mockHttp.get.mockResolvedValue([{ index: 'test-index', uuid: 'uuid-1' }]);

      await service.fetchIndexes('my-ds');

      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('my-ds'));
    });

    it('fetchPipelines should append dataSourceId to URL', async () => {
      mockHttp.get.mockResolvedValue({});

      await service.fetchPipelines('my-ds');

      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('my-ds'));
    });

    it('getSearchConfigurations should pass dataSourceId as query param', async () => {
      mockHttp.get.mockResolvedValue({});

      await service.getSearchConfigurations('my-ds');

      expect(mockHttp.get).toHaveBeenCalledWith(
        expect.any(String),
        { query: { dataSourceId: 'my-ds' } }
      );
    });

    it('getSearchConfigurations should omit query param when no dataSourceId', async () => {
      mockHttp.get.mockResolvedValue({});

      await service.getSearchConfigurations();

      expect(mockHttp.get).toHaveBeenCalledWith(expect.any(String));
    });

    it('createSearchConfiguration should pass dataSourceId as query param', async () => {
      const configData = { name: 'c', index: 'i', query: '{}' };
      mockHttp.put.mockResolvedValue({});

      await service.createSearchConfiguration(configData, 'my-ds');

      expect(mockHttp.put).toHaveBeenCalledWith(expect.any(String), {
        body: JSON.stringify(configData),
        query: { dataSourceId: 'my-ds' },
      });
    });

    it('validateSearchQuery should pass dataSourceId as query param', async () => {
      mockHttp.post.mockResolvedValue({ result: {} });

      await service.validateSearchQuery({ index: 'i' }, 'my-ds');

      expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), {
        body: JSON.stringify({ index: 'i' }),
        query: { dataSourceId: 'my-ds' },
      });
    });
  });
});
