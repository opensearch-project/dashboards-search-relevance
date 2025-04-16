import React, { useRef, useEffect, useState } from 'react';

interface Position {
  top: number;
  left: number;
}

interface ItemDetailHoverPaneProps {
  item: any;
  mousePosition: { x: number, y: number } | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  imageFieldName: string | null;
}

export const ItemDetailHoverPane: React.FC<ItemDetailHoverPaneProps> = ({
  item,
  mousePosition,
  onMouseEnter,
  onMouseLeave,
  imageFieldName
}) => {
  const [tooltipPosition, setTooltipPosition] = useState<Position>({ top: 0, left: 0 });
  
  // Calculate tooltip position based on mouse position and viewport
  useEffect(() => {
    if (!mousePosition) return;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get mouse position
    const mouseX = mousePosition.x;
    const mouseY = mousePosition.y;

    // Determine which side has more space
    const spaceOnRight = viewportWidth - mouseX;
    const spaceOnLeft = mouseX;

    // Calculate tooltip width (approximately 30% of viewport)
    const tooltipWidth = viewportWidth * 0.3;

    // Calculate position with 1/6th viewport width spacing
    const spacing = viewportWidth / 6;
    let left;

    // Place tooltip on the side with more space
    if (spaceOnRight > spaceOnLeft) {
      // Position on right side with spacing
      left = mouseX + spacing;
      // Ensure tooltip stays within viewport
      if (left + tooltipWidth > viewportWidth - 20) {
        left = viewportWidth - tooltipWidth - 20;
      }
    } else {
      // Position on left side with spacing
      left = mouseX - spacing - tooltipWidth;
      // Ensure tooltip stays within viewport
      if (left < 20) {
        left = 20;
      }
    }

    // Calculate vertical position relative to mouse pointer
    // Center it vertically with the mouse position if possible
    let top = mouseY - 200; // Assume tooltip is about 400px tall

    // Ensure tooltip stays within viewport vertically
    if (top < 20) {
      top = 20;
    } else if (top + 400 > viewportHeight - 20) {
      top = viewportHeight - 400 - 20;
    }

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
        overflow: 'auto'
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">Item Details</h3>
        <button 
          onClick={onMouseLeave}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {imageFieldName && item[imageFieldName] && item[imageFieldName].match(/\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i) ? (
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
          <div className="border-t border-b py-2 mb-2"></div>
        </>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <div className="mb-1 text-sm">
          <span className="font-semibold">ID:</span> <span className="font-mono">{item._id}</span>
        </div>
      </div>
      
      {/* Display all fields from the item */}
      {Object.entries(item)
        .filter(([key]) => !['_id', '_score', 'rank', 'rank1', 'rank2', 'score1', 'score2', 'change', 'status'].includes(key))
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