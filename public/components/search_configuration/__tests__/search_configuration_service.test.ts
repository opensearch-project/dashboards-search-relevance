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

  describe('fetchMappings', () => {
    it('should fetch mappings for a given index', async () => {
      const mockMappings = {
        'test-index': {
          mappings: {
            properties: {
              title: { type: 'text' },
            },
          },
        },
      };
      mockHttp.get.mockResolvedValue(mockMappings);

      const result = await service.fetchMappings('test-index');

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/api/relevancy/search/mappings/test-index'
      );
      expect(result).toEqual(mockMappings);
    });

    it('should encode special characters in index name', async () => {
      mockHttp.get.mockResolvedValue({});

      await service.fetchMappings('my index/special');

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/api/relevancy/search/mappings/my%20index%2Fspecial'
      );
    });

    it('should propagate errors from the API', async () => {
      const error = new Error('Network error');
      mockHttp.get.mockRejectedValue(error);

      await expect(service.fetchMappings('test-index')).rejects.toThrow('Network error');
    });
  });

  describe('fetchIndexes - edge cases', () => {
    it('should return empty array when all indexes are system indexes', async () => {
      const mockIndexes = [
        { index: '.system-1', uuid: 'uuid-1' },
        { index: '.kibana', uuid: 'uuid-2' },
      ];
      mockHttp.get.mockResolvedValue(mockIndexes);

      const result = await service.fetchIndexes();
      expect(result).toEqual([]);
    });

    it('should return empty array when response is empty', async () => {
      mockHttp.get.mockResolvedValue([]);

      const result = await service.fetchIndexes();
      expect(result).toEqual([]);
    });
  });

  describe('fetchPipelines - edge cases', () => {
    it('should return empty array when no pipelines exist', async () => {
      mockHttp.get.mockResolvedValue({});

      const result = await service.fetchPipelines();
      expect(result).toEqual([]);
    });
  });

  describe('getSearchConfigurations', () => {
    it('should fetch search configurations', async () => {
      const mockConfigs = [{ id: '1', name: 'config1' }];
      mockHttp.get.mockResolvedValue(mockConfigs);

      const result = await service.getSearchConfigurations();
      expect(result).toEqual(mockConfigs);
      expect(mockHttp.get).toHaveBeenCalledWith('/api/relevancy/search_configurations');
    });
  });
});
