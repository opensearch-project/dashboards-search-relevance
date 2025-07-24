/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useSearchConfigurationForm } from '../hooks/use_search_configuration_form';

jest.mock('../services/search_configuration_service');

const mockHttp = {};
const mockNotifications = {
  toasts: {
    addSuccess: jest.fn(),
    addError: jest.fn(),
    addWarning: jest.fn(),
    addDanger: jest.fn(),
  },
};
const mockOnSuccess = jest.fn();

const mockService = {
  fetchIndexes: jest.fn(),
  fetchPipelines: jest.fn(),
  createSearchConfiguration: jest.fn(),
  validateSearchQuery: jest.fn(),
};

describe('useSearchConfigurationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require('../services/search_configuration_service').SearchConfigurationService as jest.Mock).mockImplementation(
      () => mockService
    );
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useSearchConfigurationForm({
        http: mockHttp,
        notifications: mockNotifications,
        onSuccess: mockOnSuccess,
      })
    );

    expect(result.current.name).toBe('');
    expect(result.current.query).toBe('');
    expect(result.current.selectedIndex).toEqual([]);
    expect(result.current.selectedPipeline).toEqual([]);
  });

  it('should update name state', async () => {
    mockService.fetchIndexes.mockResolvedValue([]);
    mockService.fetchPipelines.mockResolvedValue([]);

    const { result, waitForNextUpdate } = renderHook(() =>
      useSearchConfigurationForm({
        http: mockHttp,
        notifications: mockNotifications,
        onSuccess: mockOnSuccess,
      })
    );

    await waitForNextUpdate();

    act(() => {
      result.current.setName('Test Configuration');
    });

    expect(result.current.name).toBe('Test Configuration');
  });

  it('should validate name field', async () => {
    mockService.fetchIndexes.mockResolvedValue([]);
    mockService.fetchPipelines.mockResolvedValue([]);

    const { result, waitForNextUpdate } = renderHook(() =>
      useSearchConfigurationForm({
        http: mockHttp,
        notifications: mockNotifications,
        onSuccess: mockOnSuccess,
      })
    );

    await waitForNextUpdate();

    act(() => {
      result.current.validateNameField({ target: { value: '' } } as any);
    });

    expect(result.current.nameError).toBe('Search Configuration Name is a required parameter.');
  });
});