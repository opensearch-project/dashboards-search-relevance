/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { isJsonModelType, parseDefinition } from '../utils/definition';

describe('isJsonModelType', () => {
  it('treats every parser but RankLib as JSON', () => {
    expect(isJsonModelType('model/linear')).toBe(true);
    expect(isJsonModelType('model/xgboost+json')).toBe(true);
    expect(isJsonModelType('model/xgboost+json+raw')).toBe(true);
    expect(isJsonModelType('model/ranklib')).toBe(false);
  });

  it('does not claim an unselected type is JSON', () => {
    expect(isJsonModelType('')).toBe(false);
  });
});

describe('parseDefinition', () => {
  it('rejects an empty definition', () => {
    expect(parseDefinition('model/linear', '   ').error).toBe('A model definition is required.');
  });

  it('sends a JSON definition parsed, not as a string', () => {
    const { value, error } = parseDefinition('model/linear', '{"title_match": 0.4}');
    expect(error).toBeUndefined();
    // A string here would round-trip through the store as a quoted blob rather than the
    // object curl would have written.
    expect(value).toEqual({ title_match: 0.4 });
  });

  it('accepts a JSON array, which is what an xgboost dump is', () => {
    const { value } = parseDefinition('model/xgboost+json', '[{"split": "title_match"}]');
    expect(value).toEqual([{ split: 'title_match' }]);
  });

  it('reports invalid JSON against the type that required it', () => {
    const { value, error } = parseDefinition('model/xgboost+json', '[{"split":');
    expect(value).toBeUndefined();
    expect(error).toMatch(/^model\/xgboost\+json definitions must be valid JSON\./);
  });

  it('passes a RankLib definition through verbatim, whitespace included', () => {
    const ranklib = '## LambdaMART\n\n<ensemble>\n  <tree id="1" weight="0.1">\n';
    expect(parseDefinition('model/ranklib', ranklib)).toEqual({ value: ranklib });
  });

  it('does not turn a RankLib definition that happens to parse into JSON', () => {
    expect(parseDefinition('model/ranklib', '42')).toEqual({ value: '42' });
  });
});
