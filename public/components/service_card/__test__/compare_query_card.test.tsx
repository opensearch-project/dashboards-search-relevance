/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerCompareQueryCard } from '../compare_query_card';

describe('CompareQueryCard', () => {
  const registerContentProviderMock = jest.fn();

  const contentManagement = {
    registerContentProvider: registerContentProviderMock,
    updatePageSection: jest.fn(),
    renderPage: jest.fn(),
  };

  it('registerCompareQueryCard', () => {
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
                Compare search results
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>,
          "layout": "horizontal",
        },
        "description": "The search comparison tool lets you compare the results of two different DSL queries applied to the same user query.",
        "getIcon": [Function],
        "id": "compare_query",
        "kind": "card",
        "order": 20,
        "title": "Compare queries",
      }
    `);
  });
});
