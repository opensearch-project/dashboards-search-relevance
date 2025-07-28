/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useSearchConfigurationForm } from '../hooks/use_search_configuration_form';

// Mock the service
const mockService = {
  fetchIndexes: jest.fn(),
  fetchPipelines: jest.fn(),
  validateSearchQuery: jest.fn(),
  createSearchConfiguration: jest.fn(),
};

jest.mock('../services/search_configuration_service', () => ({
  SearchConfigurationService: jest.fn(() => mockService),
}));

const mockHttp = {};
const mockNotifications = {
  toasts: {
    addDanger: jest.fn(),
    addSuccess: jest.fn(),
    addError: jest.fn(),
    addWarning: jest.fn(),
  },
};

describe('useSearchConfigurationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockService.fetchIndexes.mockResolvedValue([{ label: 'index1', value: 'index1' }]);
    mockService.fetchPipelines.mockResolvedValue([{ label: 'pipeline1' }]);
    mockService.validateSearchQuery.mockResolvedValue({
      hits: { hits: [{ _id: '1', _source: { title: 'test' } }] },
    });
    mockService.createSearchConfiguration.mockResolvedValue({});
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useSearchConfigurationForm({ http: mockHttp, notifications: mockNotifications })
    );

    expect(result.current.name).toBe('');
    expect(result.current.query).toBe('');
    expect(result.current.searchTemplate).toBe('');
    expect(result.current.testSearchText).toBe('');
    expect(result.current.nameError).toBe('');
    expect(result.current.queryError).toBe('');
    expect(result.current.selectedIndex).toEqual([]);
    expect(result.current.selectedPipeline).toEqual([]);
    expect(result.current.isValidating).toBe(false);
  });

  it('should update name', () => {
    const { result } = renderHook(() =>
      useSearchConfigurationForm({ http: mockHttp, notifications: mockNotifications })
    );

    act(() => {
      result.current.setName('test name');
    });

    expect(result.current.name).toBe('test name');
  });

  it('should update query', () => {
    const { result } = renderHook(() =>
      useSearchConfigurationForm({ http: mockHttp, notifications: mockNotifications })
    );

    act(() => {
      result.current.setQuery('{"query": {"match_all": {}}}');
    });

    expect(result.current.query).toBe('{"query": {"match_all": {}}}');
  });

  it('should validate name field', () => {
    const { result } = renderHook(() =>
      useSearchConfigurationForm({ http: mockHttp, notifications: mockNotifications })
    );

    const mockEvent = {
      target: { value: '' },
    } as React.FocusEvent<HTMLInputElement>;

    act(() => {
      result.current.validateNameField(mockEvent);
    });

    expect(result.current.nameError).toBe('Search Configuration Name is a required parameter.');
  });

  it('should validate search query successfully', async () => {
    const { result } = renderHook(() =>
      useSearchConfigurationForm({ http: mockHttp, notifications: mockNotifications })
    );

    act(() => {
      result.current.setSelectedIndex([{ label: 'index1', value: 'index1' }]);
      result.current.setQuery('{"query": {"match_all": {}}}');
      result.current.setTestSearchText('test');
    });

    await act(async () => {
      await result.current.validateSearchQuery();
    });

    expect(mockService.validateSearchQuery).toHaveBeenCalled();
    expect(mockNotifications.toasts.addSuccess).toHaveBeenCalledWith('Search query is valid');
    expect(result.current.searchResults).toBeTruthy();
  });

  it('should handle validation error - no index', async () => {
    const { result } = renderHook(() =>
      useSearchConfigurationForm({ http: mockHttp, notifications: mockNotifications })
    );

    await act(async () => {
      await result.current.validateSearchQuery();
    });

    expect(mockNotifications.toasts.addWarning).toHaveBeenCalledWith({
      title: 'Validation Warning',
      text: 'No index. Please select an index',
    });
  });

  it('should handle validation error - no query', async () => {
    const { result } = renderHook(() =>
      useSearchConfigurationForm({ http: mockHttp, notifications: mockNotifications })
    );

    act(() => {
      result.current.setSelectedIndex([{ label: 'index1', value: 'index1' }]);
    });

    await act(async () => {
      await result.current.validateSearchQuery();
    });

    expect(mockNotifications.toasts.addWarning).toHaveBeenCalledWith({
      title: 'Validation Warning',
      text: 'Query body is required',
    });
  });

  it('should handle API validation error', async () => {
    const { result } = renderHook(() =>
      useSearchConfigurationForm({ http: mockHttp, notifications: mockNotifications })
    );

    mockService.validateSearchQuery.mockRejectedValue(new Error('API Error'));

    act(() => {
      result.current.setSelectedIndex([{ label: 'index1', value: 'index1' }]);
      result.current.setQuery('{"query": {"match_all": {}}}');
    });

    await act(async () => {
      await result.current.validateSearchQuery();
    });

    expect(mockNotifications.toasts.addWarning).toHaveBeenCalledWith({
      title: 'Validation Warning',
      text: 'API Error',
      toastLifeTimeMs: 5000,
    });
  });

  it('should create search configuration successfully', async () => {
    const mockOnSuccess = jest.fn();
    const { result } = renderHook(() =>
      useSearchConfigurationForm({
        http: mockHttp,
        notifications: mockNotifications,
        onSuccess: mockOnSuccess,
      })
    );

    act(() => {
      result.current.setName('test config');
      result.current.setQuery('{"query": {"match_all": {}}}');
      result.current.setSelectedIndex([{ label: 'index1', value: 'index1' }]);
    });

    await act(async () => {
      await result.current.createSearchConfiguration();
    });

    expect(mockService.createSearchConfiguration).toHaveBeenCalledWith({
      name: 'test config',
      index: 'index1',
      query: '{"query": {"match_all": {}}}',
      searchPipeline: undefined,
    });
    expect(mockNotifications.toasts.addSuccess).toHaveBeenCalledWith(
      'Search configuration "test config" created successfully'
    );
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should handle create configuration validation errors', async () => {
    const { result } = renderHook(() =>
      useSearchConfigurationForm({ http: mockHttp, notifications: mockNotifications })
    );

    await act(async () => {
      await result.current.createSearchConfiguration();
    });

    expect(result.current.nameError).toBe('Search Configuration Name is a required parameter.');
    expect(result.current.queryError).toBe('Query is required.');
    expect(mockNotifications.toasts.addWarning).toHaveBeenCalledWith({
      title: 'Invalid input',
      text: 'No index selected. Please select an index.',
    });
  });

  it('should handle create configuration API error', async () => {
    const { result } = renderHook(() =>
      useSearchConfigurationForm({ http: mockHttp, notifications: mockNotifications })
    );

    mockService.createSearchConfiguration.mockRejectedValue(new Error('API Error'));

    act(() => {
      result.current.setName('test config');
      result.current.setQuery('{"query": {"match_all": {}}}');
      result.current.setSelectedIndex([{ label: 'index1', value: 'index1' }]);
    });

    await act(async () => {
      await result.current.createSearchConfiguration();
    });

    expect(mockNotifications.toasts.addError).toHaveBeenCalledWith(expect.any(Error), {
      title: 'Failed to create search configuration',
    });
  });

  it('should handle fetch indexes error', async () => {
    mockService.fetchIndexes.mockRejectedValue(new Error('Fetch error'));

    renderHook(() =>
      useSearchConfigurationForm({ http: mockHttp, notifications: mockNotifications })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockNotifications.toasts.addError).toHaveBeenCalledWith(expect.any(Error), {
      title: 'Failed to fetch indexes',
    });
  });

  it('should handle fetch pipelines 404 error silently', async () => {
    const error404 = { body: { statusCode: 404 } };
    mockService.fetchPipelines.mockRejectedValue(error404);

    renderHook(() =>
      useSearchConfigurationForm({ http: mockHttp, notifications: mockNotifications })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockNotifications.toasts.addDanger).not.toHaveBeenCalled();
  });

  it('should handle fetch pipelines non-404 error', async () => {
    const error = { body: { statusCode: 500 } };
    mockService.fetchPipelines.mockRejectedValue(error);

    renderHook(() =>
      useSearchConfigurationForm({ http: mockHttp, notifications: mockNotifications })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockNotifications.toasts.addDanger).toHaveBeenCalledWith(
      'Failed to fetch search pipelines'
    );
  });
});
