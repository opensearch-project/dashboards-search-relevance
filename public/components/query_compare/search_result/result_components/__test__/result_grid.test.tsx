/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { ResultGridComponent } from '../result_grid';
import {
  TEST_QUERY_RESPONSE,
  TEST_COMPARED_DOCUMENTS_RANK,
  TEST_QUERY_ERROR,
} from '../../../../../../test/constants';
import { SearchRelevanceContextProvider } from '../../../../../contexts';
import { ResultPanel } from '../result_panel';
import { I18nProvider } from '@osd/i18n/react';

describe('Result grid component', () => {
  configure({ adapter: new Adapter() });
  it('Renders result grid component', async () => {
    const wrapper = mount(
      <I18nProvider>
        <SearchRelevanceContextProvider>
          <ResultGridComponent
            queryResult={TEST_QUERY_RESPONSE}
            resultNumber={1}
            comparedDocumentsRank={TEST_COMPARED_DOCUMENTS_RANK}
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

describe('Result panel query error', () => {
  configure({ adapter: new Adapter() });
  it('Displays error message on query error', async () => {
    const wrapper = mount(
      <I18nProvider>
        <SearchRelevanceContextProvider>
          <ResultPanel
            resultNumber={1}
            queryResult={TEST_QUERY_RESPONSE}
            queryError={TEST_QUERY_ERROR}
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
