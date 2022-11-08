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
} from '../../../../../../test/constants';
import { SearchRelevanceContextProvider } from '../../../../../contexts';

describe('Result grid component', () => {
  configure({ adapter: new Adapter() });
  it('Renders result grid component', async () => {
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <ResultGridComponent
          queryResult={TEST_QUERY_RESPONSE}
          resultNumber={1}
          comparedDocumentsRank={TEST_COMPARED_DOCUMENTS_RANK}
        />
      </SearchRelevanceContextProvider>
    );

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
