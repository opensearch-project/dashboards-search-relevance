/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { waitFor } from '@testing-library/react';
import { configure, mount } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
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

  it('handles search configuration selection without crashing', async () => {
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <SearchConfigsPanel
          queryString1={TEST_QUERY_STRING}
          queryString2={TEST_QUERY_STRING}
          setQueryString1={jest.fn()}
          setQueryString2={jest.fn()}
          queryError1={initialQueryErrorState}
          queryError2={initialQueryErrorState}
          setQueryError1={jest.fn()}
          setQueryError2={jest.fn()}
          dataSourceEnabled={false}
        />
      </SearchRelevanceContextProvider>
    );

    wrapper.update();

    await waitFor(() => {
      // Ensure SearchConfig components are rendered
      expect(wrapper.find('SearchConfig').length).toBe(2);

      // Trigger search config combo box change for Query 1
      const searchConfigCombo = wrapper
        .find('EuiCompressedComboBox[data-test-subj="searchConfigComboBox"]')
        .at(0);

      expect(searchConfigCombo.exists()).toBe(true);

      searchConfigCombo.prop('onChange')?.([
        { label: 'Test Search Config', value: 'test-config-id' },
      ]);
    });

    expect(wrapper).toMatchSnapshot();
  });

  it('Renders flyout component when multi dataSource enabled', async () => {
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
          dataSourceEnabled={false}
        />
      </SearchRelevanceContextProvider>
    );

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
