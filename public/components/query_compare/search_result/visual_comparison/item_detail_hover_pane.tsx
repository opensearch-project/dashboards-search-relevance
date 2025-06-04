/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';

interface Position {
  top: number;
  left: number;
}

interface ItemDetailHoverPaneProps {
  item: any;
  mousePosition: { x: number; y: number } | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  imageFieldName: string | null;
}

const EXCLUDED_FIELDS = [
  '_id',
  '_score',
  'rank',
  'rank1',
  'rank2',
  'score1',
  'score2',
  'change',
  'status',
];
const IMAGE_REGEX = /\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i;

export const ItemDetailHoverPane: React.FC<ItemDetailHoverPaneProps> = ({
  item,
  mousePosition,
  onMouseEnter,
  onMouseLeave,
  imageFieldName,
}) => {
  const [tooltipPosition, setTooltipPosition] = useState<Position>({ top: 0, left: 0 });

  // Calculate tooltip position based on mouse position and viewport
  useEffect(() => {
    if (!mousePosition) return;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    // Calculate tooltip width (approximately 30% of viewport)
    const tooltipWidth = viewportWidth * 0.3;
    // Calculate position with 1/6th viewport width spacing
    const spacing = viewportWidth / 6;

    // Get mouse position
    const mouseX = mousePosition.x;
    const mouseY = mousePosition.y;

    // Determine which side has more space
    const spaceOnRight = viewportWidth - mouseX;
    const spaceOnLeft = mouseX;

    const left =
      spaceOnRight > spaceOnLeft
        ? Math.min(mousePosition.x + spacing, viewportWidth - tooltipWidth - 20)
        : Math.max(20, mousePosition.x - spacing - tooltipWidth);

    const top = Math.max(
      20,
      Math.min(
        mousePosition.y - 200,
        viewportHeight - 420 // 400 + 20 padding
      )
    );

    // Update tooltip position
    setTooltipPosition({ left, top });
  }, [mousePosition]);

  if (!item) return null;

  return (
    <div
      className="fixed bg-white shadow-lg rounded-lg p-4 max-w-md z-20 border comparison-tooltip"
      style={{
        left: `${tooltipPosition.left}px`,
        top: `${tooltipPosition.top}px`,
        maxHeight: '400px',
        overflow: 'auto',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">Item Details</h3>
        <button onClick={onMouseLeave} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      {imageFieldName && item[imageFieldName] && item[imageFieldName].match(IMAGE_REGEX) ? (
        <>
          <div className="flex items-center mb-2">
            <div className="w-16 h-16 flex-shrink-0 mr-3">
              <img
                width="16"
                height="16"
                src={item[imageFieldName]}
                className="w-16 h-16 object-cover rounded"
              />
            </div>
          </div>
          <div className="border-t border-b py-2 mb-2" />
        </>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <div className="mb-1 text-sm">
          <span className="font-semibold">ID:</span> <span className="font-mono">{item._id}</span>
        </div>
      </div>

      {/* Display all fields from the item */}
      {Object.entries(item)
        .filter(([key]) => !EXCLUDED_FIELDS.includes(key))
        .filter(([key, value]) => typeof value === 'string')
        .map(([key, value]) => (
          <div key={key} className="mb-1 text-sm">
            <span className="font-semibold">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
            {typeof value === 'string' && value.length > 100 ? (
              <p className="text-xs mt-1">{String(value)}</p>
            ) : (
              <span> {String(value)}</span>
            )}
          </div>
        ))}
    </div>
  );
};

export default ItemDetailHoverPane;
