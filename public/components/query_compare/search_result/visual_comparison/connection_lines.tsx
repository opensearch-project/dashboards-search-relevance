/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';

interface ConnectionLinesProps {
  mounted: boolean;
  result1: any[];
  result2: any[];
  result1ItemsRef: React.MutableRefObject<{ [key: string]: HTMLDivElement }>;
  result2ItemsRef: React.MutableRefObject<{ [key: string]: HTMLDivElement }>;
  lineColors: { [key: string]: { stroke: string; strokeWidth: number } };
  sizeMultiplier: number;
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  mounted,
  result1,
  result2,
  result1ItemsRef,
  result2ItemsRef,
  lineColors,
  sizeMultiplier,
}) => {
  const containerHeight = Math.max(420, Math.max(result1.length, result2.length) * (32 * sizeMultiplier + 20));

  // Precompute `_id` -> { item, index } for result2 and `_id` -> index for
  // result1 so drawing each connection line is O(1) rather than re-scanning both
  // result sets (previously one `.find()` plus two `.findIndex()` per row, i.e.
  // O(n²) overall). "First occurrence wins" matches the prior find/findIndex
  // behaviour for the (unexpected) duplicate-id case.
  const result2ById = useMemo(() => {
    const map = new Map<string, { item: any; index: number }>();
    result2.forEach((item, index) => {
      if (!map.has(item._id)) {
        map.set(item._id, { item, index });
      }
    });
    return map;
  }, [result2]);

  const result1IndexById = useMemo(() => {
    const map = new Map<string, number>();
    result1.forEach((item, index) => {
      if (!map.has(item._id)) {
        map.set(item._id, index);
      }
    });
    return map;
  }, [result1]);

  return (
    <svg
      width="100%"
      height={containerHeight}
      style={{ overflow: 'visible' }}
      className="absolute top-0 left-0"
      id="connection-lines"
    >
      {/* Only draw lines after component has mounted to ensure refs are available */}
      {mounted &&
        result1.map((r1Item) => {
          // Find if this item exists in result2
          const r2Entry = result2ById.get(r1Item._id);
          if (!r2Entry) return null; // Skip if no match
          const r2Match = r2Entry.item;

          // Get elements by ref to ensure we have their positions
          const r1El = result1ItemsRef.current[r1Item._id];
          const r2El = result2ItemsRef.current[r1Item._id];

          // Only draw line if both elements exist
          if (!r1El || !r2El) return null;

          try {
            // Calculate positions based on item index and size multiplier
            const r1Index = result1IndexById.get(r1Item._id);
            const r2Index = r2Entry.index;

            const itemHeight = 32 * sizeMultiplier + 20; // Image size + padding/margins
            const y1 = r1Index * itemHeight + itemHeight / 2;
            const y2 = r2Index * itemHeight + itemHeight / 2;

            let lineProps = lineColors.unchanged;
            if (r1Item.rank < r2Match.rank) {
              lineProps = lineColors.decreased;
            } else if (r1Item.rank > r2Match.rank) {
              lineProps = lineColors.increased;
            }

            return (
              <line 
                key={`line-${r1Item._id}`} 
                x1="0%" 
                y1={y1} 
                x2="100%" 
                y2={y2} 
                stroke={lineProps.stroke}
                strokeWidth={lineProps.strokeWidth * sizeMultiplier}
              />
            );
          } catch (error) {
            // Fail silently if there's an error calculating positions
            return null;
          }
        })}
    </svg>
  );
};
