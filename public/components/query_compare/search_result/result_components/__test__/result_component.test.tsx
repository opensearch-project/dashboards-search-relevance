/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '@testing-library/react';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { ResultComponents } from '../result_components';
import { TEST_QUERY_RESPONSE } from '../../../../../../test/constants';
import { SearchRelevanceContextProvider } from '../../../../../contexts';
import { initialQueryErrorState } from '../../../../../../public/types/index';

describe('Result component', () => {
  it('Renders result component', async () => {
    const { container } = render(
      <SearchRelevanceContextProvider>
        <ResultComponents
          queryResult1={TEST_QUERY_RESPONSE}
          queryResult2={TEST_QUERY_RESPONSE}
          queryError1={initialQueryErrorState}
          queryError2={initialQueryErrorState}
        />
      </SearchRelevanceContextProvider>
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
