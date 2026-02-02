/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { SearchResult } from '../index';
import { SearchRelevanceContext } from '../../../../contexts';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

// Mock console.log to verify debug outputs
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

beforeAll(() => {
  console.log = mockConsoleLog;
});

afterAll(() => {
  console.log = originalConsoleLog;
});

beforeEach(() => {
  mockConsoleLog.mockClear();
});

describe('SearchResult Base64 Config Loading', () => {
  const mockProps = {
    application: { setAppDescriptionControls: jest.fn() },
    chrome: {
      navGroup: { getNavGroupEnabled: () => false },
      setBreadcrumbs: jest.fn(),
    },
    http: {
      get: jest.fn(),
      post: jest.fn(),
    },
    savedObjects: {},
    dataSourceEnabled: false,
    dataSourceManagement: {},
    setActionMenu: jest.fn(),
    navigation: { ui: {} },
    dataSourceOptions: [],
    notifications: {
      toasts: {
        addSuccess: jest.fn(),
        addWarning: jest.fn(),
        addDanger: jest.fn(),
        add: jest.fn(),
      },
    },
    uiSettings: {
      get: jest.fn().mockReturnValue(false), // Mock experimental workbench as disabled by default
    },
  };

  const mockContextValue = {
    documentsIndexes: [],
    setDocumentsIndexes: jest.fn(),
    documentsIndexes1: [],
    setDocumentsIndexes1: jest.fn(),
    documentsIndexes2: [],
    setDocumentsIndexes2: jest.fn(),
    showFlyout: false,
    setShowFlyout: jest.fn(),
    comparedResult1: {},
    updateComparedResult1: jest.fn(),
    comparedResult2: {},
    updateComparedResult2: jest.fn(),
    selectedIndex1: '',
    setSelectedIndex1: jest.fn(),
    selectedIndex2: '',
    setSelectedIndex2: jest.fn(),
    pipelines: {},
    setPipelines: jest.fn(),
    pipeline1: '',
    setPipeline1: jest.fn(),
    pipeline2: '',
    setPipeline2: jest.fn(),
    datasource1: '',
    setDataSource1: jest.fn(),
    datasource2: '',
    setDataSource2: jest.fn(),
    datasourceItems: {},
    setDatasourceItems: jest.fn(),
    fetchedPipelines1: {},
    setFetchedPipelines1: jest.fn(),
    fetchedPipelines2: {},
    setFetchedPipelines2: jest.fn(),
    dataSourceOptions: [],
    setDataSourceOptions: jest.fn(),
  };

  const renderWithContext = (props = mockProps) => {
    return render(
      <SearchRelevanceContext.Provider value={mockContextValue}>
        <SearchResult {...props} />
      </SearchRelevanceContext.Provider>
    );
  };

  describe('URL parameter parsing', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      delete (window as any).location;
      window.location = { ...originalLocation } as Location;
      window.history.replaceState = jest.fn();

      // Reset all mock calls
      Object.values(mockContextValue).forEach((mock) => {
        if (jest.isMockFunction(mock)) {
          mock.mockClear();
        }
      });

      // Set up default useLocation mock
      mockUseLocation.mockReturnValue({
        pathname: '/experiment/create/singleQueryComparison',
        search: window.location.search || '',
        hash: window.location.hash || '',
        state: undefined,
        key: '',
      });
    });

    afterEach(() => {
      window.location = originalLocation;
      mockUseLocation.mockReset();
    });

    it('should parse base64 config from hash parameters', async () => {
      const testConfig = {
        query1: {
          index: 'test_index_1',
          dsl_query: '{"query":{"match_all":{}}}',
          search_pipeline: 'test_pipeline_1',
        },
        query2: {
          index: 'test_index_2',
          dsl_query: '{"query":{"term":{"field":"value"}}}',
          search_pipeline: 'test_pipeline_2',
        },
        search: 'test search text',
      };

      const base64Config = btoa(JSON.stringify(testConfig));
      window.location.hash = `#/?config=${base64Config}`;

      renderWithContext();

      await waitFor(() => {
        // Verify setters were called with correct values
        expect(mockContextValue.setSelectedIndex1).toHaveBeenCalledWith('test_index_1');
        expect(mockContextValue.setSelectedIndex2).toHaveBeenCalledWith('test_index_2');
        expect(mockContextValue.setPipeline1).toHaveBeenCalledWith('test_pipeline_1');
        expect(mockContextValue.setPipeline2).toHaveBeenCalledWith('test_pipeline_2');
      });
    });

    it('should handle missing optional fields in config', async () => {
      const testConfig = {
        query1: {
          index: 'test_index_1',
          dsl_query: '{"query":{"match_all":{}}}',
          // No search_pipeline
        },
        query2: {
          index: 'test_index_2',
          dsl_query: '{"query":{"term":{"field":"value"}}}',
          // No search_pipeline
        },
        search: 'test search text',
      };

      const base64Config = btoa(JSON.stringify(testConfig));
      window.location.hash = `#/?config=${base64Config}`;

      renderWithContext();

      await waitFor(() => {
        expect(mockContextValue.setSelectedIndex1).toHaveBeenCalledWith('test_index_1');
        expect(mockContextValue.setSelectedIndex2).toHaveBeenCalledWith('test_index_2');
        // setPipeline should only be called for config load, not for empty string resets
        expect(mockContextValue.setPipeline1).toHaveBeenCalledTimes(1);
        expect(mockContextValue.setPipeline2).toHaveBeenCalledTimes(1);
        expect(mockContextValue.setPipeline1).toHaveBeenCalledWith('');
        expect(mockContextValue.setPipeline2).toHaveBeenCalledWith('');
      });
    });

    it('should handle invalid base64 config gracefully', async () => {
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

      window.location.hash = '#/?config=invalid_base64_string';

      renderWithContext();

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          'Failed to decode base64 configuration:',
          expect.any(Error)
        );
      });

      mockConsoleError.mockRestore();
    });

    it('should handle invalid JSON in decoded base64', async () => {
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

      const invalidJson = 'not a valid json string';
      const base64Config = btoa(invalidJson);
      window.location.hash = `#/?config=${base64Config}`;

      renderWithContext();

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          'Failed to decode base64 configuration:',
          expect.any(Error)
        );
      });

      mockConsoleError.mockRestore();
    });

    it('should not clean URL after loading config', async () => {
      const testConfig = {
        query1: { index: 'test_index_1', dsl_query: '{}' },
        query2: { index: 'test_index_2', dsl_query: '{}' },
        search: 'test',
      };

      const base64Config = btoa(JSON.stringify(testConfig));
      window.location.hash = `#/?config=${base64Config}`;
      window.location.href = `http://localhost:5603/hbk/app/searchRelevance#/?config=${base64Config}`;

      renderWithContext();

      await waitFor(() => {
        // Verify that the config was loaded properly
        expect(mockContextValue.setSelectedIndex1).toHaveBeenCalledWith('test_index_1');
        expect(mockContextValue.setSelectedIndex2).toHaveBeenCalledWith('test_index_2');
        // Verify URL was NOT cleaned (no replaceState calls)
        expect(window.history.replaceState).not.toHaveBeenCalled();
      });
    });

    it('should handle hash without config parameter', async () => {
      window.location.hash = '#/some/other/route';

      renderWithContext();

      await waitFor(() => {
        // SearchConfig component may initialize state by calling setters
        expect(mockContextValue.setSelectedIndex1).toHaveBeenCalledTimes(1);
        expect(mockContextValue.setSelectedIndex2).toHaveBeenCalledTimes(1);
        expect(mockContextValue.setSelectedIndex1).toHaveBeenCalledWith('');
        expect(mockContextValue.setSelectedIndex2).toHaveBeenCalledWith('');
        // Pipeline setters may be called by SearchConfig component's useEffect
        expect(mockContextValue.setPipeline1).toHaveBeenCalledTimes(1);
        expect(mockContextValue.setPipeline2).toHaveBeenCalledTimes(1);
        expect(mockContextValue.setPipeline1).toHaveBeenCalledWith('');
        expect(mockContextValue.setPipeline2).toHaveBeenCalledWith('');
      });
    });

    it('should strip leading slash and question mark from hash', async () => {
      const testConfig = {
        query1: { index: 'test_index', dsl_query: '{}' },
        search: 'test',
      };

      const base64Config = btoa(JSON.stringify(testConfig));
      window.location.hash = `#/?config=${base64Config}`;

      const { container } = renderWithContext();
      expect(container).toBeTruthy();
    });

    it('should handle partial config with only query1', async () => {
      const testConfig = {
        query1: {
          index: 'test_index_1',
          dsl_query: '{"query":{"match_all":{}}}',
        },
        search: 'test search',
      };

      const base64Config = btoa(JSON.stringify(testConfig));
      window.location.hash = `#/?config=${base64Config}`;

      renderWithContext();

      await waitFor(() => {
        expect(mockContextValue.setSelectedIndex1).toHaveBeenCalledWith('test_index_1');
        // Query2 setters may be called by SearchConfig component for initialization
        expect(mockContextValue.setSelectedIndex2).toHaveBeenCalledTimes(1);
        expect(mockContextValue.setSelectedIndex2).toHaveBeenCalledWith('');
        // Pipeline setters may be called by SearchConfig component's useEffect
        expect(mockContextValue.setPipeline1).toHaveBeenCalledTimes(1);
        expect(mockContextValue.setPipeline2).toHaveBeenCalledTimes(1);
        expect(mockContextValue.setPipeline1).toHaveBeenCalledWith('');
        expect(mockContextValue.setPipeline2).toHaveBeenCalledWith('');
      });
    });

    it('should handle config with special characters in search text', async () => {
      const testConfig = {
        query1: { index: 'test_index', dsl_query: '{}' },
        search: 'test & special <> characters',
      };

      const base64Config = btoa(JSON.stringify(testConfig));
      window.location.hash = `#/?config=${base64Config}`;

      const { container } = renderWithContext();
      expect(container).toBeTruthy();
    });

    // Note: URL length limit functionality is tested in the base64_config.test.ts file
    // The SearchResult component will handle URL length checking automatically when the search button is clicked
  });

  describe('Experimental workbench UI parameter handling', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      delete (window as any).location;
      window.location = { ...originalLocation } as Location;
      window.history.replaceState = jest.fn();

      // Reset all mock calls
      Object.values(mockContextValue).forEach((mock) => {
        if (jest.isMockFunction(mock)) {
          mock.mockClear();
        }
      });

      // Set up default useLocation mock
      mockUseLocation.mockReturnValue({
        pathname: '/experiment/create/singleQueryComparison',
        search: window.location.search || '',
        hash: window.location.hash || '',
        state: undefined,
        key: '',
      });
    });

    afterEach(() => {
      window.location = originalLocation;
      mockUseLocation.mockReset();
    });

    it('should parse base64 config from query parameters when experimental UI enabled', async () => {
      const testConfig = {
        query1: {
          index: 'test_index_1',
          dsl_query: '{"query":{"match_all":{}}}',
          search_pipeline: 'test_pipeline_1',
        },
        query2: {
          index: 'test_index_2',
          dsl_query: '{"query":{"term":{"field":"value"}}}',
          search_pipeline: 'test_pipeline_2',
        },
        search: 'test search text',
      };

      const base64Config = btoa(JSON.stringify(testConfig));

      // Update window.location and useLocation mock to return search parameters
      window.location.search = `?config=${base64Config}`;
      window.location.hash = '';

      // Mock useLocation to return the search parameters
      mockUseLocation.mockReturnValue({
        pathname: '/experiment/create/singleQueryComparison',
        search: `?config=${base64Config}`,
        hash: '',
        state: undefined,
        key: '',
      });

      // Create props with experimental UI enabled
      const propsWithExperimentalUI = {
        ...mockProps,
        uiSettings: {
          get: jest.fn().mockReturnValue(true), // Enable experimental workbench UI
        },
      };

      renderWithContext(propsWithExperimentalUI);

      await waitFor(() => {
        // Verify setters were called with correct values from query parameters
        expect(mockContextValue.setSelectedIndex1).toHaveBeenCalledWith('test_index_1');
        expect(mockContextValue.setSelectedIndex2).toHaveBeenCalledWith('test_index_2');
        expect(mockContextValue.setPipeline1).toHaveBeenCalledWith('test_pipeline_1');
        expect(mockContextValue.setPipeline2).toHaveBeenCalledWith('test_pipeline_2');
      });
    });

    it('should fallback to hash parameters when query parameters not found', async () => {
      const testConfig = {
        query1: { index: 'test_index_fallback', dsl_query: '{}' },
        search: 'fallback test',
      };

      const base64Config = btoa(JSON.stringify(testConfig));

      // Set up scenario where query params are empty but hash params exist
      window.location.search = '';
      window.location.hash = `#/?config=${base64Config}`;

      renderWithContext();

      await waitFor(() => {
        expect(mockContextValue.setSelectedIndex1).toHaveBeenCalledWith('test_index_fallback');
      });
    });

    it('should prioritize query parameters over hash parameters', async () => {
      const queryConfig = {
        query1: { index: 'query_param_index', dsl_query: '{}' },
        search: 'query param test',
      };
      const hashConfig = {
        query1: { index: 'hash_param_index', dsl_query: '{}' },
        search: 'hash param test',
      };

      const base64QueryConfig = btoa(JSON.stringify(queryConfig));
      const base64HashConfig = btoa(JSON.stringify(hashConfig));

      // Set both query and hash parameters
      window.location.search = `?config=${base64QueryConfig}`;
      window.location.hash = `#/?config=${base64HashConfig}`;

      // Mock useLocation to return the search parameters (which should take priority)
      mockUseLocation.mockReturnValue({
        pathname: '/experiment/create/singleQueryComparison',
        search: `?config=${base64QueryConfig}`,
        hash: `#/?config=${base64HashConfig}`,
        state: undefined,
        key: '',
      });

      renderWithContext();

      await waitFor(() => {
        // Should use query parameter config, not hash parameter config
        expect(mockContextValue.setSelectedIndex1).toHaveBeenCalledWith('query_param_index');
        expect(mockContextValue.setSelectedIndex1).not.toHaveBeenCalledWith('hash_param_index');
      });
    });

    it('should handle empty query and hash parameters gracefully', async () => {
      window.location.search = '';
      window.location.hash = '#/';

      renderWithContext();

      await waitFor(() => {
        // Should not throw errors and should call setters with empty values
        expect(mockContextValue.setSelectedIndex1).toHaveBeenCalledTimes(1);
        expect(mockContextValue.setSelectedIndex2).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle malformed query parameter gracefully', async () => {
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

      window.location.search = '?config=malformed_base64';
      window.location.hash = '';

      // Mock useLocation to return the malformed search parameters
      mockUseLocation.mockReturnValue({
        pathname: '/experiment/create/singleQueryComparison',
        search: '?config=malformed_base64',
        hash: '',
        state: undefined,
        key: '',
      });

      renderWithContext();

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          'Failed to decode base64 configuration:',
          expect.any(Error)
        );
      });

      mockConsoleError.mockRestore();
    });

    it('should handle mixed valid query param and invalid hash param', async () => {
      const validConfig = {
        query1: { index: 'valid_index', dsl_query: '{}' },
        search: 'valid search',
      };

      const validBase64Config = btoa(JSON.stringify(validConfig));

      window.location.search = `?config=${validBase64Config}`;
      window.location.hash = '#/?config=invalid_hash_config';

      // Mock useLocation to return the valid search parameters
      mockUseLocation.mockReturnValue({
        pathname: '/experiment/create/singleQueryComparison',
        search: `?config=${validBase64Config}`,
        hash: '#/?config=invalid_hash_config',
        state: undefined,
        key: '',
      });

      renderWithContext();

      await waitFor(() => {
        // Should successfully use query parameter config
        expect(mockContextValue.setSelectedIndex1).toHaveBeenCalledWith('valid_index');
      });
    });
  });
});
