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
import { initialQueryErrorState } from '../../../../../../public/types/index';
import { I18nProvider } from '@osd/i18n/react';

describe('Flyout component', () => {
  configure({ adapter: new Adapter() });

  it('Renders flyout component', async () => {
    const wrapper = mount(
      <I18nProvider>
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
          />
        </SearchRelevanceContextProvider>
      </I18nProvider>
    );

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
