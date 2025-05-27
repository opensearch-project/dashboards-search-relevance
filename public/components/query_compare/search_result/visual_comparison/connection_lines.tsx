import React from 'react';

interface ConnectionLinesProps {
  mounted: boolean;
  result1: any[];
  result2: any[];
  result1ItemsRef: React.MutableRefObject<{ [key: string]: HTMLDivElement }>;
  result2ItemsRef: React.MutableRefObject<{ [key: string]: HTMLDivElement }>;
  getStatusColor: (item: any, resultNum: number) => string;
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  mounted,
  result1,
  result2,
  result1ItemsRef,
  result2ItemsRef,
  getStatusColor,
}) => {
  return (
    <svg width="100%" height="420" style={{ overflow: 'visible' }} className="absolute top-0 left-0" id="connection-lines">
      {/* Only draw lines after component has mounted to ensure refs are available */}
      {mounted && result1.map((r1Item) => {
        // Find if this item exists in result2
        const r2Match = result2.find(r2 => r2._id === r1Item._id);
        if (!r2Match) return null; // Skip if no match
        
        // Get elements by ref to ensure we have their positions
        const r1El = result1ItemsRef.current[r1Item._id];
        const r2El = result2ItemsRef.current[r1Item._id];
        
        // Only draw line if both elements exist
        if (!r1El || !r2El) return null;
        
        try {
          // Calculate positions for connecting line
          const r1Rect = r1El.getBoundingClientRect();
          const r2Rect = r2El.getBoundingClientRect();
          const svgRect = document.getElementById('connection-lines')?.getBoundingClientRect();
          
          if (!svgRect) return null;
          
          // Calculate relative positions within the SVG
          const y1 = r1Rect.top - svgRect.top + r1Rect.height / 2;
          const y2 = r2Rect.top - svgRect.top + r2Rect.height / 2;
          
          // Get color using the provided function
          const lineColor = getStatusColor(r1Item, 1);
          
          return (
            <line 
              key={`line-${r1Item._id}`}
              x1="0%" 
              y1={y1} 
              x2="100%" 
              y2={y2} 
              stroke={lineColor} 
              strokeWidth="4"
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