/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const extractHighlightTags = (queryString: string) => {
  try {
    const query = JSON.parse(queryString);
    if (query.highlight?.pre_tags && query.highlight?.post_tags) {
      return {
        preTags: query.highlight.pre_tags,
        postTags: query.highlight.post_tags
      };
    }
  } catch {
    // Ignore parsing errors
  }
  return { preTags: ['<em>'], postTags: ['</em>'] };
};
