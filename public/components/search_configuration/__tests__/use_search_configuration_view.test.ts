/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useSearchConfigurationView } from '../hooks/use_search_configuration_view';
import { ServiceEndpoints } from '../../../../common';

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

const mockHttp = {
  get: jest.fn(),
};

describe('useSearchConfigurationView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockConsoleError.mockClear();
  });

  it('should fetch search configuration by id successfully', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test Config',
              index: 'test-index',
              query: '{"query": {"match_all": {}}}',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      useSearchConfigurationView(mockHttp as any, '1')
    );

    await waitFor(() => {});

    expect(result.current.searchConfiguration).toEqual({
      id: '1',
      name: 'Test Config',
      index: 'test-index',
      query: '{"query": {"match_all": {}}}',
      timestamp: '2023-01-01T00:00:00Z',
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle configuration not found', async () => {
    const mockResponse = {
      hits: {
        hits: [],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      useSearchConfigurationView(mockHttp as any, 'nonexistent')
    );

    await waitFor(() => {});

    expect(result.current.searchConfiguration).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No matching search configuration found');
  });

  it('should format JSON correctly', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test Config',
              index: 'test-index',
              query: '{"query":{"match_all":{}}}',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSearchConfigurationView(mockHttp as any, '1'));

    const formatted = result.current.formatJson('{"query":{"match_all":{}}}');
    expect(formatted).toBe('{\n  "query": {\n    "match_all": {}\n  }\n}');
  });

  it('should return original string when JSON parsing fails', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test Config',
              index: 'test-index',
              query: 'invalid json',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSearchConfigurationView(mockHttp as any, '1'));

    const formatted = result.current.formatJson('invalid json');
    expect(formatted).toBe('invalid json');
  });

  it('should handle fetch error', async () => {
    mockHttp.get.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() =>
      useSearchConfigurationView(mockHttp as any, '1')
    );

    await waitFor(() => {});

    expect(result.current.searchConfiguration).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Error loading search configuration data');
  });
});
