/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Shared O(1) id / key lookup helpers for experiment detail views.
 * Replaces nested Array.prototype.find scans that scale as O(n²) over
 * result docs, query snapshots, and judgment ratings.
 * "First occurrence wins" matches prior .find() semantics for duplicate keys.
 */

/** Build a Map with first-occurrence-wins semantics (mirrors Array.prototype.find). */
export const buildFirstWinMap = <T>(
  items: T[] | null | undefined,
  getKey: (item: T) => string | undefined | null
): Map<string, T> => {
  const map = new Map<string, T>();
  if (!Array.isArray(items)) {
    return map;
  }
  for (const item of items) {
    const key = getKey(item);
    if (key == null || key === '' || map.has(key)) {
      continue;
    }
    map.set(key, item);
  }
  return map;
};

/**
 * Resolve hit attributes for an ordered list of document ids using a single
 * O(n) Map build instead of ids.map(id => hits.find(...)).
 * Missing ids produce a stub `{ _id, rank }` so rank order is preserved.
 */
export const resolveAttributesById = <T extends { _id: string }>(
  ids: string[],
  hits: T[] | null | undefined
): Array<T | { _id: string; rank: number }> => {
  const byId = buildFirstWinMap(hits ?? [], (hit) => hit._id);
  return ids.map((id, index) => {
    const hit = byId.get(id);
    if (hit) {
      return { ...hit, rank: index + 1 };
    }
    return { _id: id, rank: index + 1 };
  });
};

/**
 * Map queryText → documentIds from snapshot rows (first occurrence wins).
 */
export const buildSnapshotIdsByQueryText = (
  snapshots: Array<{ queryText: string; documentIds: string[] }> | null | undefined
): Map<string, string[]> => {
  const map = new Map<string, string[]>();
  if (!Array.isArray(snapshots)) {
    return map;
  }
  for (const snapshot of snapshots) {
    if (!snapshot?.queryText || map.has(snapshot.queryText)) {
      continue;
    }
    map.set(snapshot.queryText, snapshot.documentIds ?? []);
  }
  return map;
};

/**
 * Nested map queryText → (docId → rating) from judgmentRatings list shape.
 * First query entry and first doc rating for a given id win.
 */
export const buildJudgmentRatingsByQuery = (
  judgmentRatings: Array<{ query?: string; ratings?: Array<{ docId?: string; rating?: any }> }> | null | undefined
): Map<string, Map<string, string>> => {
  const byQuery = new Map<string, Map<string, string>>();
  if (!Array.isArray(judgmentRatings)) {
    return byQuery;
  }
  for (const entry of judgmentRatings) {
    if (!entry?.query || byQuery.has(entry.query)) {
      continue;
    }
    const byDoc = new Map<string, string>();
    for (const rating of entry.ratings || []) {
      if (rating?.docId == null || rating.docId === '' || byDoc.has(rating.docId)) {
        continue;
      }
      byDoc.set(rating.docId, rating.rating != null ? String(rating.rating) : 'N/A');
    }
    byQuery.set(entry.query, byDoc);
  }
  return byQuery;
};

/**
 * Build document score rows for an evaluation's documentIds using a prebuilt
 * ratings map for that query. O(n) in documentIds length.
 */
export const buildDocumentScores = (
  documentIds: string[],
  ratingsByDoc: Map<string, string> | undefined
): Array<{ docId: string; rating: string }> => {
  return documentIds.map((docId) => ({
    docId,
    rating: ratingsByDoc?.get(docId) ?? 'N/A',
  }));
};
