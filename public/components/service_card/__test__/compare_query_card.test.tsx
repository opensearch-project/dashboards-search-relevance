/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerCompareQueryCard } from '../compare_query_card';

describe('SearchRelevanceCard', () => {
  const registerContentProviderMock = jest.fn();

  const contentManagement = {
    registerContentProvider: registerContentProviderMock,
    updatePageSection: jest.fn(),
    renderPage: jest.fn(),
  };

  it('registerSearchRelevanceCard', () => {
    registerCompareQueryCard(contentManagement, {});
    const call = registerContentProviderMock.mock.calls[0];
    expect(call[0].getTargetArea()).toEqual('search_overview/config_evaluate_search');
    expect(call[0].getContent()).toMatchInlineSnapshot(`
      Object {
        "cardProps": Object {
          "children": <EuiFlexGroup
            justifyContent="flexEnd"
          >
            <EuiFlexItem
              grow={false}
            >
              <EuiButton
                onClick={[Function]}
                size="s"
              >
                Search relevance
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>,
          "layout": "horizontal",
        },
        "description": "The search relevance tool lets you compare or evaluate the results of various DSL queries.",
        "getIcon": [Function],
        "id": "search_relevance",
        "kind": "card",
        "order": 20,
        "title": "Search relevance",
      }
    `);
  });
});
