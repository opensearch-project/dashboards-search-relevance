/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { SearchConfigurationView } from '../views/search_configuration_view';
import * as hooks from '../hooks/use_search_configuration_view';

// Mock the hook
jest.mock('../hooks/use_search_configuration_view');

const mockUseSearchConfigurationView = hooks.useSearchConfigurationView as jest.MockedFunction<
  typeof hooks.useSearchConfigurationView
>;

const mockHttp = {
  get: jest.fn(),
};

describe('SearchConfigurationView', () => {
  const history = createMemoryHistory();
  const defaultProps = {
    http: mockHttp,
    id: '1',
    history,
    location: history.location,
    match: { params: { id: '1' }, isExact: true, path: '', url: '' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseSearchConfigurationView.mockReturnValue({
      searchConfiguration: null,
      loading: true,
      error: null,
      formatJson: jest.fn(),
    });

    render(
      <Router history={history}>
        <SearchConfigurationView {...defaultProps} />
      </Router>
    );

    expect(screen.getByText('Loading search configuration data...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseSearchConfigurationView.mockReturnValue({
      searchConfiguration: null,
      loading: false,
      error: 'Failed to load configuration',
      formatJson: jest.fn(),
    });

    render(
      <Router history={history}>
        <SearchConfigurationView {...defaultProps} />
      </Router>
    );

    expect(screen.getByText('Failed to load configuration')).toBeInTheDocument();
  });

  it('renders search configuration details', () => {
    const mockFormatJson = jest.fn().mockReturnValue('{\n  "match_all": {}\n}');
    mockUseSearchConfigurationView.mockReturnValue({
      searchConfiguration: {
        id: '1',
        name: 'Test Config',
        index: 'test-index',
        query: '{"match_all": {}}',
        timestamp: '2023-01-01T00:00:00Z',
      },
      loading: false,
      error: null,
      formatJson: mockFormatJson,
    });

    render(
      <Router history={history}>
        <SearchConfigurationView {...defaultProps} />
      </Router>
    );

    expect(screen.getByText('Search Configuration Details')).toBeInTheDocument();
    expect(screen.getByText('Test Config')).toBeInTheDocument();
    expect(screen.getByText('test-index')).toBeInTheDocument();
    expect(mockFormatJson).toHaveBeenCalledWith('{"match_all": {}}');
  });

  it('renders search pipeline and template when available', () => {
    const mockFormatJson = jest.fn().mockReturnValue('{\n  "match_all": {}\n}');
    mockUseSearchConfigurationView.mockReturnValue({
      searchConfiguration: {
        id: '1',
        name: 'Test Config',
        index: 'test-index',
        query: '{"match_all": {}}',
        searchPipeline: 'test-pipeline',
        template: 'test-template',
        timestamp: '2023-01-01T00:00:00Z',
      },
      loading: false,
      error: null,
      formatJson: mockFormatJson,
    });

    render(
      <Router history={history}>
        <SearchConfigurationView {...defaultProps} />
      </Router>
    );

    expect(screen.getByText('Search Pipeline')).toBeInTheDocument();
    expect(screen.getByText('test-pipeline')).toBeInTheDocument();
    expect(screen.getByText('Search Template')).toBeInTheDocument();
    expect(screen.getByText('test-template')).toBeInTheDocument();
  });

  it('renders "None" for search pipeline when not available', () => {
    const mockFormatJson = jest.fn().mockReturnValue('{\n  "match_all": {}\n}');
    mockUseSearchConfigurationView.mockReturnValue({
      searchConfiguration: {
        id: '1',
        name: 'Test Config',
        index: 'test-index',
        query: '{"match_all": {}}',
        searchPipeline: undefined,
        template: undefined,
        timestamp: '2023-01-01T00:00:00Z',
      },
      loading: false,
      error: null,
      formatJson: mockFormatJson,
    });

    render(
      <Router history={history}>
        <SearchConfigurationView {...defaultProps} />
      </Router>
    );

    expect(screen.getByText('Search Pipeline')).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.queryByText('Search Template')).not.toBeInTheDocument();
  });
});
