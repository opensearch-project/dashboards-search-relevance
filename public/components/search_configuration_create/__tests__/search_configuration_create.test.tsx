/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { SearchConfigurationCreate } from '../search_configuration_create';

// Mock the service and hooks
jest.mock('../services/search_configuration_service');
jest.mock('../hooks/use_search_configuration_form');
jest.mock('../components/search_configuration_form', () => ({
  SearchConfigurationForm: ({ name, setName }: any) => (
    <div data-test-subj="search-configuration-form">
      <input
        data-test-subj="name-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  ),
}));
jest.mock('../components/validation_panel', () => ({
  ValidationPanel: ({ testSearchText }: any) => (
    <div data-test-subj="validation-panel">{testSearchText}</div>
  ),
}));

const mockFormState = {
  name: 'Test Search Configuration',
  setName: jest.fn(),
  nameError: '',
  validateNameField: jest.fn(),
  query: '{"query": {"match_all": {}}}',
  setQuery: jest.fn(),
  queryError: '',
  setQueryError: jest.fn(),
  searchTemplate: '',
  setSearchTemplate: jest.fn(),
  indexOptions: [{ label: 'test-index', value: 'uuid-1' }],
  selectedIndex: [{ label: 'test-index', value: 'uuid-1' }],
  setSelectedIndex: jest.fn(),
  isLoadingIndexes: false,
  pipelineOptions: [{ label: 'test-pipeline' }],
  selectedPipeline: [],
  setSelectedPipeline: jest.fn(),
  isLoadingPipelines: false,
  testSearchText: 'test query',
  setTestSearchText: jest.fn(),
  isValidating: false,
  searchResults: null,
  validateSearchQuery: jest.fn(),
  createSearchConfiguration: jest.fn(),
};

describe('SearchConfigurationCreate', () => {
  let mockHttp: any;
  let mockNotifications: any;
  let history: any;

  beforeEach(() => {
    mockHttp = {};
    mockNotifications = {
      toasts: {
        addSuccess: jest.fn(),
        addError: jest.fn(),
        addWarning: jest.fn(),
      },
    };
    history = createMemoryHistory();

    // Reset mocks
    jest.clearAllMocks();

    // Mock the hook return value
    (require('../hooks/use_search_configuration_form').useSearchConfigurationForm as jest.Mock).mockReturnValue(
      mockFormState
    );
  });

  const renderComponent = () => {
    return render(
      <Router history={history}>
        <SearchConfigurationCreate
          http={mockHttp}
          notifications={mockNotifications}
          history={history}
          location={history.location}
          match={{ params: {}, isExact: true, path: '', url: '' }}
        />
      </Router>
    );
  };

  it('should render the component correctly', () => {
    renderComponent();

    expect(screen.getByText('Search Configuration')).toBeInTheDocument();
    expect(screen.getByText(/Configure a new search configuration/)).toBeInTheDocument();
    expect(screen.getByTestId('search-configuration-form')).toBeInTheDocument();
    expect(screen.getByTestId('validation-panel')).toBeInTheDocument();
  });

  it('should handle successful form submission', async () => {
    mockFormState.createSearchConfiguration.mockResolvedValue({ success: true });

    renderComponent();

    const createButton = screen.getByTestId('createSearchConfigurationButton');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockFormState.createSearchConfiguration).toHaveBeenCalled();
    });
  });

  it('should handle cancel action', () => {
    renderComponent();

    const cancelButton = screen.getByTestId('cancelSearchConfigurationButton');
    fireEvent.click(cancelButton);

    expect(history.location.pathname).toBe('/searchConfiguration');
  });

  it('should display form and validation panel', () => {
    renderComponent();

    expect(screen.getByTestId('search-configuration-form')).toBeInTheDocument();
    expect(screen.getByTestId('validation-panel')).toBeInTheDocument();
    expect(screen.getByText('test query')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    renderComponent();

    expect(screen.getByTestId('createSearchConfigurationButton')).toBeInTheDocument();
    expect(screen.getByTestId('cancelSearchConfigurationButton')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toMatchSnapshot();
  });
});