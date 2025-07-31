/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useQuerySetView } from '../hooks/use_query_set_view';

// Mock the common module
jest.mock('../../../../common', () => ({
  ServiceEndpoints: {
    QuerySets: '/api/relevancy/querySets',
  },
  extractUserMessageFromError: jest.fn((err) => 'Failed to load query set due to an unknown error.'),
}));

const mockHttp = {
  get: jest.fn(),
} as any;

describe('useQuerySetView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with loading state', () => {
    mockHttp.get.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useQuerySetView(mockHttp, 'test-id'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.querySet).toBe(null);
  });

  it('fetches query set successfully', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: 'test-id',
              name: 'Test Query Set',
              description: 'Test description',
              sampling: 'random',
              querySetQueries: [{ queryText: 'test query' }],
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result, waitForNextUpdate } = renderHook(() => useQuerySetView(mockHttp, 'test-id'));

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.querySet).toEqual({
      id: 'test-id',
      name: 'Test Query Set',
      description: 'Test description',
      sampling: 'random',
      querySetQueries: [{ queryText: 'test query' }],
    });
  });

  it('handles no matching query set', async () => {
    const mockResponse = {
      hits: {
        hits: [],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result, waitForNextUpdate } = renderHook(() => useQuerySetView(mockHttp, 'test-id'));

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No matching query set found');
    expect(result.current.querySet).toBe(null);
  });

  it('handles fetch error', async () => {
    const mockError = new Error('Network error');
    mockHttp.get.mockRejectedValue(mockError);

    const { result, waitForNextUpdate } = renderHook(() => useQuerySetView(mockHttp, 'test-id'));

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to load query set due to an unknown error.');
    expect(result.current.querySet).toBe(null);
  });

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useQuerySetView(mockHttp, ''));

    expect(result.current.loading).toBe(true);
    expect(mockHttp.get).not.toHaveBeenCalled();
  });

  it('refetches when id changes', async () => {
    const mockResponse1 = {
      hits: {
        hits: [
          {
            _source: {
              id: 'test-id-1',
              name: 'Query Set 1',
            },
          },
        ],
      },
    };

    const mockResponse2 = {
      hits: {
        hits: [
          {
            _source: {
              id: 'test-id-2',
              name: 'Query Set 2',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValueOnce(mockResponse1).mockResolvedValueOnce(mockResponse2);

    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ id }) => useQuerySetView(mockHttp, id),
      {
        initialProps: { id: 'test-id-1' },
      }
    );

    await waitForNextUpdate();
    expect(result.current.querySet?.name).toBe('Query Set 1');

    rerender({ id: 'test-id-2' });
    await waitForNextUpdate();
    expect(result.current.querySet?.name).toBe('Query Set 2');
  });
});