/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/** Placeholder the backend substitutes with the user's search text. */
export const SEARCH_TEXT_PLACEHOLDER = /%SearchText%/g;

/**
 * Renders a stored search configuration query for display, substituting the search text the user
 * typed so they can see the query that will actually run. Pretty-prints when the result parses as
 * JSON, and falls back to the substituted raw string when it does not — a configuration may hold
 * a partial or hand-edited query, which should still be shown rather than swallowed.
 *
 * @param query the raw query JSON held on the search configuration
 * @param searchText the text to substitute; when empty the placeholder is left visible
 */
export const getDisplayQuery = (query: string, searchText: string): string => {
  if (!query) return '';
  const substituted = query.replace(SEARCH_TEXT_PLACEHOLDER, searchText || '%SearchText%');
  try {
    return JSON.stringify(JSON.parse(substituted), null, 2);
  } catch {
    return substituted;
  }
};

/** Shortens a UUID for display, e.g. "d834d47a-..." → "d834d47a...". */
export const shortenId = (id: string): string => (id ? `${id.substring(0, 8)}...` : '-');
