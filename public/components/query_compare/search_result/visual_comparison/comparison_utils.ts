/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ComparisonResult {
  _id: string;
  rank: number;
}

export interface ResultLookupEntry<T extends ComparisonResult> {
  item: T;
  index: number;
}

export const createResultLookup = <T extends ComparisonResult>(results: T[]) =>
  new Map<string, ResultLookupEntry<T>>(results.map((item, index) => [item._id, { item, index }]));

export const calculateStatistics = (result1: ComparisonResult[], result2: ComparisonResult[]) => {
  const result2ById = createResultLookup(result2);
  let inBoth = 0;
  let unchanged = 0;
  let improved = 0;
  let worsened = 0;

  for (const item1 of result1) {
    const item2 = result2ById.get(item1._id)?.item;
    if (!item2) continue;

    inBoth += 1;
    if (item1.rank === item2.rank) unchanged += 1;
    else if (item1.rank > item2.rank) improved += 1;
    else worsened += 1;
  }

  return {
    inBoth,
    onlyInResult1: result1.length - inBoth,
    onlyInResult2: result2.length - inBoth,
    unchanged,
    improved,
    worsened,
  };
};
