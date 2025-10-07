/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useQuerySetList } from '../hooks/use_query_set_list';

// Mock the common module
jest.mock('../../../../common', () => ({
  ServiceEndpoints: {
    QuerySets: '/api/relevancy/querySets',
  },
  extractUserMessageFromError: jest.fn(
    (err) => 'Failed to load query sets due to an unknown error.'
  ),
}));

const mockHttp = {
  get: jest.fn(),
  delete: jest.fn(),
} as any;

describe('useQuerySetList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHttp.get.mockClear();
    mockHttp.delete.mockClear();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useQuerySetList(mockHttp));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.refreshKey).toBe(0);
  });

  it('fetches query sets successfully', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test Query Set',
              sampling: 'random',
              description: 'Test description',
              timestamp: '2023-01-01T00:00:00Z',
              querySetQueries: { query1: 'test', query2: 'test2' },
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useQuerySetList(mockHttp));

    let queryResult;
    await act(async () => {
      queryResult = await result.current.findQuerySets('');
    });

    expect(queryResult).toEqual({
      total: 1,
      hits: [
        {
          id: '1',
          name: 'Test Query Set',
          sampling: 'random',
          description: 'Test description',
          timestamp: '2023-01-01T00:00:00Z',
          numQueries: 2,
        },
      ],
    });
    expect(result.current.error).toBe(null);
  });

  it('handles search filtering', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test Query Set',
              sampling: 'random',
              description: 'Test description',
              timestamp: '2023-01-01T00:00:00Z',
              querySetQueries: { query1: 'test' },
            },
          },
          {
            _source: {
              id: '2',
              name: 'Another Set',
              sampling: 'random',
              description: 'Another description',
              timestamp: '2023-01-01T00:00:00Z',
              querySetQueries: { query1: 'test' },
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useQuerySetList(mockHttp));

    let queryResult;
    await act(async () => {
      queryResult = await result.current.findQuerySets('test');
    });

    expect(queryResult?.hits).toHaveLength(1);
    expect(queryResult?.hits[0].name).toBe('Test Query Set');
  });

  it('handles fetch error', async () => {
    const mockError = new Error('Network error');
    mockHttp.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useQuerySetList(mockHttp));

    let queryResult;
    await act(async () => {
      queryResult = await result.current.findQuerySets('');
    });

    expect(queryResult).toEqual({
      total: 0,
      hits: [],
    });
    expect(result.current.error).toBe('Failed to load query sets due to an unknown error.');
  });

  it('deletes query set successfully', async () => {
    mockHttp.delete.mockResolvedValue({});

    const { result } = renderHook(() => useQuerySetList(mockHttp));

    const initialRefreshKey = result.current.refreshKey;

    await act(async () => {
      await result.current.deleteQuerySet('1');
    });

    expect(mockHttp.delete).toHaveBeenCalledWith('/api/relevancy/querySets/1');
    expect(result.current.refreshKey).toBe(initialRefreshKey + 1);
    expect(result.current.error).toBe(null);
  });

  it('handles delete error', async () => {
    const mockError = new Error('Delete failed');
    mockHttp.delete.mockRejectedValue(mockError);

    const { result } = renderHook(() => useQuerySetList(mockHttp));

    await act(async () => {
      try {
        await result.current.deleteQuerySet('1');
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    expect(result.current.error).toBe('Failed to delete query set');
  });

  it('sets error manually', () => {
    const { result } = renderHook(() => useQuerySetList(mockHttp));

    act(() => {
      result.current.setError('Custom error');
    });

    expect(result.current.error).toBe('Custom error');
  });

  it('handles null response gracefully', async () => {
    // Mock HTTP get to return null
    mockHttp.get.mockResolvedValue(null);

    const { result } = renderHook(() => useQuerySetList(mockHttp));

    let queryResult;
    await act(async () => {
      queryResult = await result.current.findQuerySets('');
    });

    expect(queryResult).toEqual({
      total: 0,
      hits: [],
    });
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });
});
