/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { SearchConfigsPanel } from '../search_configs/search_configs';
import { SearchRelevanceContextProvider } from '../../../../../contexts';
import { TEST_QUERY_STRING } from '../../../../../../test/constants';

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
        />
      </SearchRelevanceContextProvider>
    );

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
