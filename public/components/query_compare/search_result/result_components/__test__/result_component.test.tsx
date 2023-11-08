/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { ResultComponents } from '../result_components';
import { TEST_QUERY_RESPONSE } from '../../../../../../test/constants';
import { SearchRelevanceContextProvider } from '../../../../../contexts';
import { initialQueryErrorState } from '../../../../../../public/types/index';
import { I18nProvider } from '@osd/i18n/react';

describe('Result component', () => {
  configure({ adapter: new Adapter() });
  it('Renders result component', async () => {
    const wrapper = mount(
      <I18nProvider>
        <SearchRelevanceContextProvider>
          <ResultComponents
            queryResult1={TEST_QUERY_RESPONSE}
            queryResult2={TEST_QUERY_RESPONSE}
            queryError1={initialQueryErrorState}
            queryError2={initialQueryErrorState}
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
