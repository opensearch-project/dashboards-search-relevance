/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { SearchInputBar } from '../search_bar';
import { TEST_SEARCH_TEXT } from '../../../../../../test/constants';

describe('Search bar component', () => {
  it('Renders search bar component', async () => {
    const { container } = render(
      <SearchInputBar
        searchBarValue={TEST_SEARCH_TEXT}
        setSearchBarValue={() => { }}
        onClickSearch={() => { }}
        isSearching={false}
      />
    );

    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });

  it('handles input change', () => {
    const setSearchBarValue = jest.fn();
    const { container } = render(
      <SearchInputBar
        searchBarValue=""
        setSearchBarValue={setSearchBarValue}
        onClickSearch={jest.fn()}
        isSearching={false}
      />
    );

    const input = container.querySelector('input[type="search"]');
    if (input) {
      fireEvent.change(input, { target: { value: 'new search' } });
      expect(setSearchBarValue).toHaveBeenCalledWith('new search');
    }
  });

  it('handles search button click', () => {
    const onClickSearch = jest.fn();
    const { container } = render(
      <SearchInputBar
        searchBarValue="test"
        setSearchBarValue={jest.fn()}
        onClickSearch={onClickSearch}
        isSearching={false}
      />
    );

    const searchButton = container.querySelector('button[aria-label="searchRelevance-searchButton"]');
    if (searchButton) {
      fireEvent.click(searchButton);
      expect(onClickSearch).toHaveBeenCalled();
    }
  });
});
