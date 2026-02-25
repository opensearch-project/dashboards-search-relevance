/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { waitFor, render } from '@testing-library/react';
import React from 'react';
import { initialQueryErrorState } from '../../../../../../public/types/index';
import { TEST_QUERY_STRING } from '../../../../../../test/constants';
import { SearchRelevanceContextProvider } from '../../../../../contexts';
import { SearchConfigsPanel } from '../search_configs/search_configs';

describe('Flyout component', () => {
  it('Renders flyout component', async () => {
    const { container } = render(
      <SearchRelevanceContextProvider>
        <SearchConfigsPanel
          queryString1={TEST_QUERY_STRING}
          queryString2={TEST_QUERY_STRING}
          setQueryString1={() => {}}
          setQueryString2={() => {}}
          queryError1={initialQueryErrorState}
          queryError2={initialQueryErrorState}
          setQueryError1={() => {}}
          setQueryError2={() => {}}
          dataSourceManagement={{ ui: { DataSourceSelector: <></> } }}
        />
      </SearchRelevanceContextProvider>
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
  it('Renders flyout component when multi dataSource enabled', async () => {
    const { container } = render(
      <SearchRelevanceContextProvider>
        <SearchConfigsPanel
          queryString1={TEST_QUERY_STRING}
          queryString2={TEST_QUERY_STRING}
          setQueryString1={() => {}}
          setQueryString2={() => {}}
          queryError1={initialQueryErrorState}
          queryError2={initialQueryErrorState}
          setQueryError1={() => {}}
          setQueryError2={() => {}}
          dataSourceEnabled={false}
        />
      </SearchRelevanceContextProvider>
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
