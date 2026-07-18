/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateStatistics } from '../visual_comparison';

// `rank` is a 1-based position where rank 1 is the top of the list (assigned as
// `index + 1` in convertFromSearchResult). For a document present in both result
// sets, a smaller rank in result2 than in result1 means it moved *up* toward the
// top => "improved"; a larger rank means it moved down => "worsened".
const item = (id: string, rank: number) => ({ _id: id, rank, title: `Doc ${id}` });

describe('calculateStatistics', () => {
  it('counts documents present in both result sets (inBoth) and those unique to each', () => {
    const result1 = [item('1', 1), item('2', 2), item('3', 3)];
    const result2 = [item('2', 1), item('3', 2), item('4', 3)];

    const stats = calculateStatistics(result1, result2);

    expect(stats.inBoth).toBe(2); // ids 2 and 3
    expect(stats.onlyInResult1).toBe(1); // id 1
    expect(stats.onlyInResult2).toBe(1); // id 4
  });

  it('counts a document as unchanged when its rank is identical in both sets', () => {
    const result1 = [item('1', 1), item('2', 2)];
    const result2 = [item('1', 1), item('2', 2)];

    const stats = calculateStatistics(result1, result2);

    expect(stats.unchanged).toBe(2);
    expect(stats.improved).toBe(0);
    expect(stats.worsened).toBe(0);
  });

  it('counts a document as improved when it moves toward the top (rank decreases)', () => {
    // id 1 goes from rank 3 in result1 to rank 1 in result2 -> improved.
    const result1 = [item('1', 3)];
    const result2 = [item('1', 1)];

    const stats = calculateStatistics(result1, result2);

    expect(stats.improved).toBe(1);
    expect(stats.worsened).toBe(0);
    expect(stats.unchanged).toBe(0);
  });

  it('counts a document as worsened when it moves down (rank increases)', () => {
    // id 1 goes from rank 1 in result1 to rank 3 in result2 -> worsened.
    const result1 = [item('1', 1)];
    const result2 = [item('1', 3)];

    const stats = calculateStatistics(result1, result2);

    expect(stats.worsened).toBe(1);
    expect(stats.improved).toBe(0);
    expect(stats.unchanged).toBe(0);
  });

  it('handles a mixed scenario covering every bucket at once', () => {
    const result1 = [
      item('unchanged', 1),
      item('improved', 3),
      item('worsened', 2),
      item('onlyIn1', 4),
    ];
    const result2 = [
      item('unchanged', 1), // same rank
      item('improved', 1), // 3 -> 1: improved
      item('worsened', 4), // 2 -> 4: worsened
      item('onlyIn2', 3),
    ];

    const stats = calculateStatistics(result1, result2);

    expect(stats).toEqual({
      inBoth: 3,
      onlyInResult1: 1,
      onlyInResult2: 1,
      unchanged: 1,
      improved: 1,
      worsened: 1,
    });
  });

  it('returns all-zero counts for empty result sets', () => {
    const stats = calculateStatistics([], []);

    expect(stats).toEqual({
      inBoth: 0,
      onlyInResult1: 0,
      onlyInResult2: 0,
      unchanged: 0,
      improved: 0,
      worsened: 0,
    });
  });

  it('matches the first occurrence when a result set contains duplicate _ids', () => {
    // Mirrors the previous .find()/.some() "first occurrence wins" behavior: the
    // rank of the first id '1' in result2 (rank 1) is used, so 2 -> 1 is improved.
    const result1 = [item('1', 2)];
    const result2 = [item('1', 1), item('1', 5)];

    const stats = calculateStatistics(result1, result2);

    expect(stats.inBoth).toBe(1);
    expect(stats.improved).toBe(1);
    expect(stats.worsened).toBe(0);
  });
});
