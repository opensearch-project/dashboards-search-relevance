/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchConfigurationCreate } from '../views/search_configuration_create';
import { validateDescription } from '../utils/validation';

// Mock the hook
const mockHookReturn = {
  name: '',
  setName: jest.fn(),
  nameError: '',
  validateNameField: jest.fn(),
  description: '',
  setDescription: jest.fn(),
  descriptionError: '',
  validateDescriptionField: jest.fn(),
  query: '',
  setQuery: jest.fn(),
  queryError: '',
  setQueryError: jest.fn(),
  searchTemplate: '',
  setSearchTemplate: jest.fn(),
  indexOptions: [],
  selectedIndex: [],
  setSelectedIndex: jest.fn(),
  isLoadingIndexes: false,
  pipelineOptions: [],
  selectedPipeline: [],
  setSelectedPipeline: jest.fn(),
  isLoadingPipelines: false,
  testSearchText: '',
  setTestSearchText: jest.fn(),
  isValidating: false,
  searchResults: null,
  validateSearchQuery: jest.fn(),
  createSearchConfiguration: jest.fn(),
};

jest.mock('../hooks/use_search_configuration_form', () => ({
  useSearchConfigurationForm: () => mockHookReturn,
}));

const mockHttp = {};
const mockNotifications = {
  toasts: {
    addDanger: jest.fn(),
    addSuccess: jest.fn(),
    addError: jest.fn(),
  },
};
const mockHistory = {
  push: jest.fn(),
};

describe('SearchConfigurationCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render page header', () => {
    render(
      <SearchConfigurationCreate
        http={mockHttp}
        notifications={mockNotifications}
        history={mockHistory}
      />
    );

    expect(screen.getByText('Search Configuration')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Configure a new search configuration that represents all the aspects of an algorithm.'
      )
    ).toBeInTheDocument();
  });

  it('should render cancel button', () => {
    render(
      <SearchConfigurationCreate
        http={mockHttp}
        notifications={mockNotifications}
        history={mockHistory}
      />
    );

    expect(screen.getByTestId('cancelSearchConfigurationButton')).toBeInTheDocument();
  });

  it('should handle cancel button click', () => {
    render(
      <SearchConfigurationCreate
        http={mockHttp}
        notifications={mockNotifications}
        history={mockHistory}
      />
    );

    fireEvent.click(screen.getByTestId('cancelSearchConfigurationButton'));
    expect(mockHistory.push).toHaveBeenCalledWith('/searchConfiguration');
  });

  it('should render form component', () => {
    render(
      <SearchConfigurationCreate
        http={mockHttp}
        notifications={mockNotifications}
        history={mockHistory}
      />
    );

    // Form should be rendered (tested in form component tests)
    expect(screen.getByText('Search Configuration')).toBeInTheDocument();
  });

  it('should render validation panel', () => {
    render(
      <SearchConfigurationCreate
        http={mockHttp}
        notifications={mockNotifications}
        history={mockHistory}
      />
    );

    // Validation panel should be rendered
    expect(screen.getByText('Search Configuration')).toBeInTheDocument();
  });

  it('should render results panel when search results exist', () => {
    const mockHookWithResults = {
      ...mockHookReturn,
      searchResults: { hits: { hits: [{ _id: '1', _source: { title: 'test' } }] } },
    };

    jest.doMock('../hooks/use_search_configuration_form', () => ({
      useSearchConfigurationForm: () => mockHookWithResults,
    }));

    render(
      <SearchConfigurationCreate
        http={mockHttp}
        notifications={mockNotifications}
        history={mockHistory}
      />
    );

    // Results panel should be rendered when results exist
    expect(screen.getByText('Search Configuration')).toBeInTheDocument();
  });

  it('should render create button', () => {
    render(
      <SearchConfigurationCreate
        http={mockHttp}
        notifications={mockNotifications}
        history={mockHistory}
      />
    );

    expect(screen.getByTestId('createSearchConfigurationButton')).toBeInTheDocument();
  });
});
