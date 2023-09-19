/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { SearchConfig } from '../search_configs/search_config';
import { SearchRelevanceContextProvider } from '../../../../../contexts';
import { TEST_QUERY_STRING } from '../../../../../../test/constants';
import { initialQueryErrorState } from '../../../../../../public/types/index';

describe('Flyout component', () => {
  configure({ adapter: new Adapter() });

  it('Renders flyout component', async () => {
    const setQueryString = jest.fn();
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={TEST_QUERY_STRING}
          setQueryString={setQueryString}
          selectedIndex={''}
          setSelectedIndex={() => {}}
          queryError={initialQueryErrorState}
          setQueryError={() => {}}
        />
      </SearchRelevanceContextProvider>
    );

    wrapper.update();
    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
      wrapper.find('EuiCodeEditor').prop('onChange')?.({ target: { value: '{ "a": "a" }' } });
      expect(setQueryString).toHaveBeenCalled();
    });
  });
});
