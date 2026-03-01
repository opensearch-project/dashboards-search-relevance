/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { SearchConfigurationListing } from '../views/search_configuration_listing';
import * as hooks from '../hooks/use_search_configuration_list';
import { Routes } from '../../../../common';

// Mock the hook
jest.mock('../hooks/use_search_configuration_list');
jest.mock('../../../contexts/date_format_context', () => ({
  useConfig: () => ({ dateFormat: 'YYYY-MM-DD' }),
}));
jest.mock('../../common/DeleteModal', () => ({
  DeleteModal: ({ onClose, onConfirm, itemName }: any) => (
    <div data-test-subj="delete-modal">
      <span>Delete {itemName}?</span>
      <button onClick={onClose}>Cancel</button>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  ),
}));

jest.mock('@elastic/eui', () => {
  const originalModule = jest.requireActual('@elastic/eui');
  return {
    ...originalModule,
    EuiToolTip: ({ children, content }: any) => (
      <div data-test-subj="eui-tooltip" data-tooltip-content={content}>
        {children}
      </div>
    ),
  };
});

const mockHttp = {
  get: jest.fn(),
  delete: jest.fn(),
};

const mockUseSearchConfigurationList = hooks.useSearchConfigurationList as jest.MockedFunction<
  typeof hooks.useSearchConfigurationList
>;

describe('SearchConfigurationListing', () => {
  const history = createMemoryHistory();
  const defaultProps = {
    http: mockHttp,
    history,
    location: history.location,
    match: { params: {}, isExact: true, path: '', url: '' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchConfigurationList.mockReturnValue({
      isLoading: false,
      error: null,
      findSearchConfigurations: jest.fn().mockResolvedValue({
        total: 1,
        hits: [
          {
            id: '1',
            search_configuration_name: 'Test Config',
            index: 'test-index',
            query: '{"match_all": {}}',
            timestamp: '2023-01-01T00:00:00Z',
          },
        ],
      }),
      deleteSearchConfiguration: jest.fn().mockResolvedValue(true),
    });
  });

  it('renders search configuration listing', () => {
    render(
      <Router history={history}>
        <SearchConfigurationListing {...defaultProps} />
      </Router>
    );

    expect(screen.getByText('Search Configurations')).toBeInTheDocument();
    expect(screen.getByText('Create Search Configuration')).toBeInTheDocument();
  });

  it('navigates to create page when create button is clicked', () => {
    render(
      <Router history={history}>
        <SearchConfigurationListing {...defaultProps} />
      </Router>
    );

    fireEvent.click(screen.getByText('Create Search Configuration'));
    expect(history.location.pathname).toBe(Routes.SearchConfigurationCreate);
  });

  it('shows error message when error exists', () => {
    mockUseSearchConfigurationList.mockReturnValue({
      isLoading: false,
      error: 'Test error',
      findSearchConfigurations: jest.fn(),
      deleteSearchConfiguration: jest.fn(),
    });

    render(
      <Router history={history}>
        <SearchConfigurationListing {...defaultProps} />
      </Router>
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('opens delete modal when delete button is clicked', async () => {
    const mockFindConfigs = jest.fn().mockResolvedValue({
      total: 1,
      hits: [
        {
          id: '1',
          search_configuration_name: 'Test Config',
          index: 'test-index',
          query: '{"match_all": {}}',
          timestamp: '2023-01-01T00:00:00Z',
        },
      ],
    });

    mockUseSearchConfigurationList.mockReturnValue({
      isLoading: false,
      error: null,
      findSearchConfigurations: mockFindConfigs,
      deleteSearchConfiguration: jest.fn().mockResolvedValue(true),
    });

    render(
      <Router history={history}>
        <SearchConfigurationListing {...defaultProps} />
      </Router>
    );

    // Wait for table to load and find delete button
    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText('Delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
      fireEvent.click(deleteButtons[0]);
    });

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
  });

  it('renders "Delete" tooltip for the action button', async () => {
    mockUseSearchConfigurationList.mockReturnValue({
      isLoading: false,
      error: null,
      findSearchConfigurations: jest.fn().mockResolvedValue({
        total: 1,
        hits: [
          {
            id: '1',
            search_configuration_name: 'Test Config',
            index: 'test-index',
            query: '{"match_all": {}}',
            timestamp: '2023-01-01T00:00:00Z',
          },
        ],
      }),
      deleteSearchConfiguration: jest.fn(),
    });

    render(
      <Router history={history}>
        <SearchConfigurationListing {...defaultProps} />
      </Router>
    );

    await waitFor(() => {
      const tooltip = screen.getByTestId('eui-tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveAttribute('data-tooltip-content', 'Delete');
    });
  });

  it('handles delete confirmation', async () => {
    const mockDelete = jest.fn().mockResolvedValue(true);
    const mockFindConfigs = jest.fn().mockResolvedValue({
      total: 1,
      hits: [
        {
          id: '1',
          search_configuration_name: 'Test Config',
          index: 'test-index',
          query: '{"match_all": {}}',
          timestamp: '2023-01-01T00:00:00Z',
        },
      ],
    });

    mockUseSearchConfigurationList.mockReturnValue({
      isLoading: false,
      error: null,
      findSearchConfigurations: mockFindConfigs,
      deleteSearchConfiguration: mockDelete,
    });

    render(
      <Router history={history}>
        <SearchConfigurationListing {...defaultProps} />
      </Router>
    );

    // Open delete modal
    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText('Delete');
      fireEvent.click(deleteButtons[0]);
    });

    // Confirm delete
    fireEvent.click(screen.getByText('Confirm'));

    expect(mockDelete).toHaveBeenCalledWith('1');
  });
});
