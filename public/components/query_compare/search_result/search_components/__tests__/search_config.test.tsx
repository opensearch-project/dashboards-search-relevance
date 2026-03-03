/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { initialQueryErrorState } from '../../../../../../public/types/index';
import { TEST_QUERY_STRING } from '../../../../../../test/constants';
import { SearchRelevanceContextProvider } from '../../../../../contexts';
import { SearchConfig } from '../search_configs/search_config';

describe('Flyout component', () => {
  it('Renders flyout component when multi-datasource is enabled', () => {
    const { container } = render(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={TEST_QUERY_STRING}
          setQueryString={jest.fn()}
          selectedIndex={''}
          setSelectedIndex={jest.fn()}
          pipeline={''}
          setPipeline={jest.fn()}
          queryError={initialQueryErrorState}
          setQueryError={jest.fn()}
          dataSourceManagement={{ ui: { DataSourceSelector: <></> } }}
        />
      </SearchRelevanceContextProvider>
    );

    expect(container).toMatchSnapshot();
  });

  it('Renders flyout component', () => {
    const { container } = render(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={TEST_QUERY_STRING}
          setQueryString={jest.fn()}
          selectedIndex={''}
          setSelectedIndex={jest.fn()}
          pipeline={''}
          setPipeline={jest.fn()}
          queryError={initialQueryErrorState}
          setQueryError={jest.fn()}
          dataSourceEnabled={false}
        />
      </SearchRelevanceContextProvider>
    );

    expect(container).toMatchSnapshot();
  });

  it('Handles user interactions', () => {
    const setQueryString = jest.fn();
    const setSelectedIndex = jest.fn();
    const setPipeline = jest.fn();
    const setQueryError = jest.fn();

    render(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={TEST_QUERY_STRING}
          setQueryString={setQueryString}
          selectedIndex={''}
          setSelectedIndex={setSelectedIndex}
          pipeline={''}
          setPipeline={setPipeline}
          queryError={initialQueryErrorState}
          setQueryError={setQueryError}
          dataSourceEnabled={false}
        />
      </SearchRelevanceContextProvider>
    );

    const selectElement = screen.getByLabelText('Search Index');
    fireEvent.blur(selectElement);
    expect(setQueryError).toHaveBeenCalled();
  });
});
