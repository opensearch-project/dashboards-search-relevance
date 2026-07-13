/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateStatistics, createResultLookup } from '../comparison_utils';

describe('comparison utilities', () => {
  it('indexes result items with their positions', () => {
    const results = [
      { _id: 'a', rank: 1 },
      { _id: 'b', rank: 2 },
    ];

    expect(createResultLookup(results).get('b')).toEqual({ item: results[1], index: 1 });
  });

  it('calculates overlap and rank changes', () => {
    const result1 = [
      { _id: 'a', rank: 1 },
      { _id: 'b', rank: 2 },
      { _id: 'c', rank: 1 },
      { _id: 'left-only', rank: 4 },
    ];
    const result2 = [
      { _id: 'b', rank: 1 },
      { _id: 'a', rank: 1 },
      { _id: 'c', rank: 3 },
      { _id: 'right-only', rank: 4 },
    ];

    expect(calculateStatistics(result1, result2)).toEqual({
      inBoth: 3,
      onlyInResult1: 1,
      onlyInResult2: 1,
      unchanged: 1,
      improved: 1,
      worsened: 1,
    });
  });

  it('reads result IDs linearly', () => {
    let idReads = 0;
    const makeResult = (size: number) =>
      Array.from({ length: size }, (_, index) => ({
        get _id() {
          idReads += 1;
          return String(index);
        },
        rank: index,
      }));

    calculateStatistics(makeResult(100), makeResult(100));

    expect(idReads).toBeLessThanOrEqual(300);
  });
});
