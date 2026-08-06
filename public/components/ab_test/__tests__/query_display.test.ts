/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDisplayQuery, shortenId } from '../utils/query_display';

describe('getDisplayQuery', () => {
  it('returns an empty string for an empty query', () => {
    expect(getDisplayQuery('', 'shoes')).toBe('');
  });

  it('substitutes the search text and pretty-prints valid JSON', () => {
    const query = '{"query":{"match":{"title":"%SearchText%"}}}';

    expect(getDisplayQuery(query, 'shoes')).toBe(
      JSON.stringify({ query: { match: { title: 'shoes' } } }, null, 2)
    );
  });

  it('replaces every occurrence of the placeholder', () => {
    const query = '{"a":"%SearchText%","b":"%SearchText%"}';

    expect(getDisplayQuery(query, 'jeans')).toBe(
      JSON.stringify({ a: 'jeans', b: 'jeans' }, null, 2)
    );
  });

  it('leaves the placeholder visible when no search text is given', () => {
    const query = '{"query":{"match":{"title":"%SearchText%"}}}';

    expect(getDisplayQuery(query, '')).toContain('%SearchText%');
  });

  it('falls back to the substituted raw string when the query is not valid JSON', () => {
    expect(getDisplayQuery('title:%SearchText%', 'boots')).toBe('title:boots');
  });
});

describe('shortenId', () => {
  it('truncates a uuid to its first eight characters', () => {
    expect(shortenId('d834d47a-1234-5678-9abc-def012345678')).toBe('d834d47a...');
  });

  it('returns a dash for an empty id', () => {
    expect(shortenId('')).toBe('-');
  });
});
