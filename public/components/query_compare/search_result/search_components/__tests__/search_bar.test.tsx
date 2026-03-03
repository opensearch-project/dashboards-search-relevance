/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '@testing-library/react';
import React from 'react';
import { SearchInputBar } from '../search_bar';
import { TEST_SEARCH_TEXT } from '../../../../../../test/constants';

describe('Search bar component', () => {
  it('Renders search bar component', () => {
    const { container } = render(
      <SearchInputBar
        searchBarValue={TEST_SEARCH_TEXT}
        setSearchBarValue={() => {}}
        onClickSearch={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
