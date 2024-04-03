/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { waitFor } from '@testing-library/react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { initialQueryErrorState } from '../../../../../../public/types/index';
import { TEST_QUERY_STRING } from '../../../../../../test/constants';
import { SearchRelevanceContextProvider } from '../../../../../contexts';
import { SearchConfigsPanel } from '../search_configs/search_configs';

describe('Flyout component', () => {
  configure({ adapter: new Adapter() });

  it('Renders flyout component', async () => {
    const wrapper = mount(
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

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
