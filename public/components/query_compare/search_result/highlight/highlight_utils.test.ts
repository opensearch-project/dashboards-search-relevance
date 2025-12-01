/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { extractHighlightTags } from './highlight_utils';

describe('highlight_utils', () => {
  describe('extractHighlightTags', () => {
    it('should extract custom highlight tags', () => {
      const query = '{"highlight": {"pre_tags": ["<mark>"], "post_tags": ["</mark>"]}}';
      const result = extractHighlightTags(query);
      expect(result.preTags).toEqual(['<mark>']);
      expect(result.postTags).toEqual(['</mark>']);
    });

    it('should return default tags for query without highlight', () => {
      const query = '{"query": {"match": {"title": "test"}}}';
      const result = extractHighlightTags(query);
      expect(result.preTags).toEqual(['<em>']);
      expect(result.postTags).toEqual(['</em>']);
    });

    it('should return default tags for invalid JSON', () => {
      const query = '{"invalid": json}';
      const result = extractHighlightTags(query);
      expect(result.preTags).toEqual(['<em>']);
      expect(result.postTags).toEqual(['</em>']);
    });

    it('should return default tags when highlight section incomplete', () => {
      const query = '{"highlight": {"pre_tags": ["<mark>"]}}';
      const result = extractHighlightTags(query);
      expect(result.preTags).toEqual(['<em>']);
      expect(result.postTags).toEqual(['</em>']);
    });
  });
});
