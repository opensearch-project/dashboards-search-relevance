/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuerySetView } from '../hooks/use_query_set_view';
import { extractUserMessageFromError, ServiceEndpoints } from '../../../../common';

jest.mock('../../../../common', () => ({
  ...jest.requireActual('../../../../common'),
  extractUserMessageFromError: jest.fn(),
}));

const mockExtractUserMessageFromError = extractUserMessageFromError as jest.MockedFunction<
  typeof extractUserMessageFromError
>;

const mockHttp = {
  get: jest.fn(),
} as any;

describe('useQuerySetView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExtractUserMessageFromError.mockReturnValue(null);
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

    const { result } = renderHook(() => useQuerySetView(mockHttp, 'test-id'));

    await waitFor(() => expect(result.current.loading).toBe(false));

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

    const { result } = renderHook(() => useQuerySetView(mockHttp, 'test-id'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No matching query set found');
    expect(result.current.querySet).toBe(null);
  });

  it('handles fetch error', async () => {
    const mockError = new Error('Network error');
    mockHttp.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useQuerySetView(mockHttp, 'test-id'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Error loading query set data');
    expect(result.current.querySet).toBe(null);
  });

  it('surfaces backend error message when available', async () => {
    const customError = {
      body: {
        statusCode: 404,
        message: '[resource_not_found_exception] Document not found: query-set-1',
      },
    };
    mockHttp.get.mockRejectedValue(customError);
    mockExtractUserMessageFromError.mockReturnValue(
      '404: [resource_not_found_exception] Document not found: query-set-1'
    );

    const { result } = renderHook(() => useQuerySetView(mockHttp, 'query-set-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(
      '404: [resource_not_found_exception] Document not found: query-set-1'
    );
    expect(mockExtractUserMessageFromError).toHaveBeenCalledWith(customError);
  });

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useQuerySetView(mockHttp, ''));

    expect(result.current.loading).toBe(true);
    expect(mockHttp.get).not.toHaveBeenCalled();
  });

  it('passes dataSourceId when fetching a query set', async () => {
    const mockResponse = {
      hits: { hits: [{ _source: { id: 'test-id', name: 'Test' } }] },
    };
    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useQuerySetView(mockHttp, 'test-id', 'my-datasource'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockHttp.get).toHaveBeenCalledWith(`${ServiceEndpoints.QuerySets}/test-id`, {
      query: { dataSourceId: 'my-datasource' },
    });
  });

  it('omits dataSourceId query param when not provided', async () => {
    const mockResponse = {
      hits: { hits: [{ _source: { id: 'test-id', name: 'Test' } }] },
    };
    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useQuerySetView(mockHttp, 'test-id'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockHttp.get).toHaveBeenCalledWith(`${ServiceEndpoints.QuerySets}/test-id`, {});
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

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.querySet?.name).toBe('Query Set 1');

    rerender({ id: 'test-id-2' });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.querySet?.name).toBe('Query Set 2');
  });
});
