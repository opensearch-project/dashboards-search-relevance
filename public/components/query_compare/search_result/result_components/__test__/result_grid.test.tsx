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

describe('Result grid component', () => {
  configure({ adapter: new Adapter() });
  it('Renders result grid component', async () => {
    const setQueryError = jest.fn();
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <ResultGridComponent
          queryResult={TEST_QUERY_RESPONSE}
          resultNumber={1}
          comparedDocumentsRank={TEST_COMPARED_DOCUMENTS_RANK}
          setQueryError={setQueryError}
        />
      </SearchRelevanceContextProvider>
    );

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
      wrapper.find('EuiButtonIcon').first().prop('onClick')?.({ target: {} });
    });
    expect(setQueryError).toHaveBeenCalledTimes(1);
  });
});

describe('Result panel query error', () => {
  configure({ adapter: new Adapter() });
  it('Displays error message on query error', async () => {
    const setQueryError = jest.fn();
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <ResultPanel
          resultNumber={1}
          queryResult={TEST_QUERY_RESPONSE}
          queryError={TEST_QUERY_ERROR}
          setQueryError={setQueryError}
        />
      </SearchRelevanceContextProvider>
    );

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
