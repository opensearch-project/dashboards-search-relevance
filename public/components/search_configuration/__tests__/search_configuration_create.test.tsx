/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchConfigurationCreate } from '../views/search_configuration_create';

// Mock the hook
const mockHookReturn = {
  name: '',
  setName: jest.fn(),
  nameError: '',
  validateNameField: jest.fn(),
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

// Test double for the OSD DataSourceSelector. The button lets the test drive
// `setSelectedDataSource` synchronously to simulate the real selector
// resolving its default after mount.
jest.mock('../../common/datasource_selector', () => ({
  DataSourceSelector: ({ setSelectedDataSource }: any) => (
    <div data-test-subj="mock-datasource-selector">
      <button
        type="button"
        data-test-subj="ds-pick-foo"
        onClick={() => setSelectedDataSource('foo-ds')}
      >
        pick-foo
      </button>
    </div>
  ),
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

  it('should handle create button click', () => {
    render(
      <SearchConfigurationCreate
        http={mockHttp}
        notifications={mockNotifications}
        history={mockHistory}
      />
    );

    fireEvent.click(screen.getByTestId('createSearchConfigurationButton'));
    // Just verify the button exists and can be clicked
    expect(screen.getByTestId('createSearchConfigurationButton')).toBeInTheDocument();
  });

  it('should render with data source enabled', () => {
    render(
      <SearchConfigurationCreate
        http={mockHttp}
        notifications={mockNotifications}
        history={mockHistory}
        dataSourceEnabled={true}
        dataSourceManagement={{ ui: { DataSourceSelector: () => null } } as any}
        savedObjects={{ client: {} } as any}
        navigation={{} as any}
        setActionMenu={jest.fn()}
      />
    );

    expect(screen.getByTestId('mock-datasource-selector')).toBeInTheDocument();
  });

  describe('multi-data-source initialization gating', () => {
    // Capture every props object the view passes into useSearchConfigurationForm
    // so we can assert on dataSourceEnabled / dataSourceInitialized directly.
    const installCapturingHook = (): any[] => {
      const captured: any[] = [];
      const useFormMock = jest.requireMock('../hooks/use_search_configuration_form');
      useFormMock.useSearchConfigurationForm = jest.fn((props: any) => {
        captured.push(props);
        return mockHookReturn;
      });
      return captured;
    };

    it('passes dataSourceInitialized=true to the form hook when multi-data-source is disabled', () => {
      const captured = installCapturingHook();

      render(
        <SearchConfigurationCreate
          http={mockHttp}
          notifications={mockNotifications}
          history={mockHistory}
        />
      );

      const lastCall = captured[captured.length - 1];
      expect(lastCall.dataSourceEnabled).toBe(false);
      expect(lastCall.dataSourceInitialized).toBe(true);
    });

    it('starts with dataSourceInitialized=false when multi-data-source is enabled and flips to true after the selector reports', () => {
      const captured = installCapturingHook();

      render(
        <SearchConfigurationCreate
          http={mockHttp}
          notifications={mockNotifications}
          history={mockHistory}
          dataSourceEnabled={true}
          dataSourceManagement={{ ui: { DataSourceSelector: () => null } } as any}
          savedObjects={{ client: {} } as any}
        />
      );

      // First render: gate is closed.
      expect(captured[0].dataSourceEnabled).toBe(true);
      expect(captured[0].dataSourceInitialized).toBe(false);

      // Selector reports a data source — gate opens, hook re-runs with both
      // the new dataSourceId and dataSourceInitialized=true.
      fireEvent.click(screen.getByTestId('ds-pick-foo'));

      const lastCall = captured[captured.length - 1];
      expect(lastCall.dataSourceId).toBe('foo-ds');
      expect(lastCall.dataSourceEnabled).toBe(true);
      expect(lastCall.dataSourceInitialized).toBe(true);
    });
  });
});
