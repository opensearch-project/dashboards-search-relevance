/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '@testing-library/react';
import React from 'react';
import { ResultGridComponent } from '../result_grid';
import {
  TEST_QUERY_RESPONSE,
  TEST_COMPARED_DOCUMENTS_RANK,
  TEST_QUERY_ERROR,
} from '../../../../../../test/constants';
import { SearchRelevanceContextProvider } from '../../../../../contexts';
import { ResultPanel } from '../result_panel';

describe('Result grid component', () => {
  it('Renders result grid component', () => {
    const { container } = render(
      <SearchRelevanceContextProvider>
        <ResultGridComponent
          queryResult={TEST_QUERY_RESPONSE}
          resultNumber={1}
          comparedDocumentsRank={TEST_COMPARED_DOCUMENTS_RANK}
        />
      </SearchRelevanceContextProvider>
    );
    expect(container).toMatchSnapshot();
  });
});

describe('Result panel query error', () => {
  it('Displays error message on query error', () => {
    const setQueryError = jest.fn();
    const { container } = render(
      <SearchRelevanceContextProvider>
        <ResultPanel
          resultNumber={1}
          queryResult={TEST_QUERY_RESPONSE}
          queryError={TEST_QUERY_ERROR}
          setQueryError={setQueryError}
        />
      </SearchRelevanceContextProvider>
    );
    expect(container).toMatchSnapshot();
  });
});
