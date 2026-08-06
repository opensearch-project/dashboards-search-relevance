/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  buildDocumentScores,
  buildFirstWinMap,
  buildJudgmentRatingsByQuery,
  buildSnapshotIdsByQueryText,
  resolveAttributesById,
} from '../document_lookup';

describe('document_lookup', () => {
  describe('buildFirstWinMap', () => {
    it('keeps the first item when keys collide', () => {
      const map = buildFirstWinMap(
        [
          { id: 'a', v: 1 },
          { id: 'a', v: 2 },
          { id: 'b', v: 3 },
        ],
        (item) => item.id
      );
      expect(map.get('a')).toEqual({ id: 'a', v: 1 });
      expect(map.get('b')).toEqual({ id: 'b', v: 3 });
      expect(map.size).toBe(2);
    });

    it('returns an empty map for non-arrays', () => {
      expect(buildFirstWinMap(null, (x: any) => x.id).size).toBe(0);
      expect(buildFirstWinMap(undefined, (x: any) => x.id).size).toBe(0);
    });
  });

  describe('resolveAttributesById', () => {
    it('orders hits by the id list and assigns 1-based ranks', () => {
      const hits = [
        { _id: 'c', title: 'C' },
        { _id: 'a', title: 'A' },
        { _id: 'b', title: 'B' },
      ];
      const resolved = resolveAttributesById(['a', 'b', 'c'], hits);
      expect(resolved).toEqual([
        { _id: 'a', title: 'A', rank: 1 },
        { _id: 'b', title: 'B', rank: 2 },
        { _id: 'c', title: 'C', rank: 3 },
      ]);
    });

    it('stubs missing ids so rank order is preserved', () => {
      const resolved = resolveAttributesById(['x', 'y'], [{ _id: 'y', title: 'Y' }]);
      expect(resolved).toEqual([
        { _id: 'x', rank: 1 },
        { _id: 'y', title: 'Y', rank: 2 },
      ]);
    });

    it('uses the first hit when duplicate _ids are present (find semantics)', () => {
      const hits = [
        { _id: 'a', title: 'first' },
        { _id: 'a', title: 'second' },
      ];
      const resolved = resolveAttributesById(['a'], hits);
      expect(resolved[0]).toMatchObject({ _id: 'a', title: 'first', rank: 1 });
    });
  });

  describe('buildSnapshotIdsByQueryText', () => {
    it('maps queryText to documentIds with first-occurrence wins', () => {
      const map = buildSnapshotIdsByQueryText([
        { queryText: 'q1', documentIds: ['d1'] },
        { queryText: 'q1', documentIds: ['d-later'] },
        { queryText: 'q2', documentIds: ['d2', 'd3'] },
      ]);
      expect(map.get('q1')).toEqual(['d1']);
      expect(map.get('q2')).toEqual(['d2', 'd3']);
    });
  });

  describe('buildJudgmentRatingsByQuery + buildDocumentScores', () => {
    it('builds nested maps and scores docs in O(1) lookups', () => {
      const byQuery = buildJudgmentRatingsByQuery([
        {
          query: 'shoes',
          ratings: [
            { docId: '1', rating: '1.0' },
            { docId: '2', rating: '0.0' },
            { docId: '1', rating: '0.5' }, // ignored (first wins)
          ],
        },
        {
          query: 'shoes',
          ratings: [{ docId: '99', rating: '1.0' }], // ignored (first query wins)
        },
      ]);

      expect(byQuery.get('shoes')?.get('1')).toBe('1.0');
      expect(byQuery.get('shoes')?.get('2')).toBe('0.0');
      expect(byQuery.get('shoes')?.has('99')).toBe(false);

      expect(buildDocumentScores(['1', '2', 'missing'], byQuery.get('shoes'))).toEqual([
        { docId: '1', rating: '1.0' },
        { docId: '2', rating: '0.0' },
        { docId: 'missing', rating: 'N/A' },
      ]);
    });
  });
});
