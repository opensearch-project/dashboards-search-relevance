/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { initialQueryErrorState } from '../../../../../../public/types/index';
import { TEST_QUERY_STRING } from '../../../../../../test/constants';
import { SearchRelevanceContextProvider } from '../../../../../contexts';
import { SearchConfig } from '../search_configs/search_config';

describe('SearchConfig component', () => {
  const defaultProps = {
    queryNumber: 1 as 1 | 2,
    queryString: TEST_QUERY_STRING,
    setQueryString: jest.fn(),
    selectedIndex: '',
    setSelectedIndex: jest.fn(),
    pipeline: '',
    setPipeline: jest.fn(),
    queryError: initialQueryErrorState,
    setQueryError: jest.fn(),
    dataSourceEnabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Renders search config component', async () => {
    const { container } = render(
      <SearchRelevanceContextProvider>
        <SearchConfig {...defaultProps} />
      </SearchRelevanceContextProvider>
    );

    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });

  it('Renders search config when multi-datasource is enabled', async () => {
    const { container } = render(
      <SearchRelevanceContextProvider>
        <SearchConfig
          {...defaultProps}
          dataSourceManagement={{ ui: { DataSourceSelector: <></> } }}
        />
      </SearchRelevanceContextProvider>
    );

    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });

  it('renders with data source enabled', () => {
    const { container } = render(
      <SearchRelevanceContextProvider>
        <SearchConfig
          {...defaultProps}
          dataSourceEnabled={true}
          notifications={{} as any}
          savedObjects={{ client: {} } as any}
          setDataSource={jest.fn()}
          dataSourceManagement={{ ui: { DataSourceSelector: () => <div>DataSourceSelector</div> } } as any}
          navigation={{} as any}
          setActionMenu={jest.fn()}
          dataSourceOptions={[]}
        />
      </SearchRelevanceContextProvider>
    );

    expect(container.textContent).toContain('DataSourceSelector');
  });
});
