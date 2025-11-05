/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useSearchConfigurationList } from '../hooks/use_search_configuration_list';
import { ServiceEndpoints, extractUserMessageFromError } from '../../../../common';
import { description } from 'joi';

// Mock extractUserMessageFromError
jest.mock('../../../../common', () => ({
  ...jest.requireActual('../../../../common'),
  extractUserMessageFromError: jest.fn(),
}));

const mockExtractUserMessageFromError = extractUserMessageFromError as jest.MockedFunction<
  typeof extractUserMessageFromError
>;

const mockHttp = {
  get: jest.fn(),
  delete: jest.fn(),
};

describe('useSearchConfigurationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExtractUserMessageFromError.mockReturnValue(null);
  });

  it('should use extracted error message when available', async () => {
    const customError = new Error('Custom error');
    mockHttp.get.mockRejectedValue(customError);
    mockExtractUserMessageFromError.mockReturnValue('Extracted error message');

    const { result } = renderHook(() => useSearchConfigurationList(mockHttp as any));

    await act(async () => {
      await result.current.findSearchConfigurations();
    });

    expect(result.current.error).toBe('Extracted error message');
    expect(mockExtractUserMessageFromError).toHaveBeenCalledWith(customError);
  });

  it('should fetch search configurations successfully', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test Config',
              description: 'sample description',
              index: 'test-index',
              query: '{"query": {"match_all": {}}}',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSearchConfigurationList(mockHttp as any));

    await act(async () => {
      const response = await result.current.findSearchConfigurations();
      expect(response.total).toBe(1);
      expect(response.hits[0].search_configuration_name).toBe('Test Config');
    });

    expect(mockHttp.get).toHaveBeenCalledWith(ServiceEndpoints.SearchConfigurations);
  });

  it('should delete search configuration successfully', async () => {
    mockHttp.delete.mockResolvedValue({});

    const { result } = renderHook(() => useSearchConfigurationList(mockHttp as any));

    await act(async () => {
      const success = await result.current.deleteSearchConfiguration('1');
      expect(success).toBe(true);
    });

    expect(mockHttp.delete).toHaveBeenCalledWith(`${ServiceEndpoints.SearchConfigurations}/1`);
  });

  it('should handle delete error', async () => {
    mockHttp.delete.mockRejectedValue(new Error('Delete failed'));

    const { result } = renderHook(() => useSearchConfigurationList(mockHttp as any));

    await act(async () => {
      const success = await result.current.deleteSearchConfiguration('1');
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe('Failed to delete search configuration');
  });

  it('should handle fetch error', async () => {
    mockHttp.get.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useSearchConfigurationList(mockHttp as any));

    await act(async () => {
      const response = await result.current.findSearchConfigurations();
      expect(response.total).toBe(0);
      expect(response.hits).toEqual([]);
    });

    expect(result.current.error).toContain('Failed to load search configurations');
  });

  it('should filter search configurations by search term', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test Config',
              description: 'sample description 1'
              index: 'test-index',
              query: '{}',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
          {
            _source: {
              id: '2',
              name: 'Another Config',
              description: 'sample description 2'
              index: 'another-index',
              query: '{}',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSearchConfigurationList(mockHttp as any));

    await act(async () => {
      const response = await result.current.findSearchConfigurations('test');
      expect(response.total).toBe(1);
      expect(response.hits[0].search_configuration_name).toBe('Test Config');
    });
  });

  it('should handle empty response', async () => {
    mockHttp.get.mockResolvedValue(null);

    const { result } = renderHook(() => useSearchConfigurationList(mockHttp as any));

    await act(async () => {
      const response = await result.current.findSearchConfigurations();
      expect(response.total).toBe(0);
      expect(response.hits).toEqual([]);
    });
  });
});
