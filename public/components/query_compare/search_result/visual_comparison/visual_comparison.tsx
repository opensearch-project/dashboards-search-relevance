import React, { useState, useEffect, useRef } from 'react';
import { EuiPanel, EuiEmptyPrompt } from '@elastic/eui';

import './visual_comparison.scss';

// Interface should match the first component
interface OpenSearchComparisonProps {
  queryResult1: any;
  queryResult2: any;
  queryError1: any;
  queryError2: any;
  queryText: string;
  resultText1: string;
  resultText2: string;
}

export const convertFromSearchResult = (searchResult) => {
  if (!searchResult.hits?.hits) return undefined;

  return searchResult.hits.hits.map((x, index) => ({
    _id: x._id,
    _score: x._score, 
    rank: index + 1,
    ...x._source
  }));
}

export const VisualComparison = ({
  queryResult1,
  queryResult2,
  queryError1,
  queryError2,
  queryText,
  resultText1,
  resultText2,
}: OpenSearchComparisonProps) => {
  // State for selected display field
  const [displayField, setDisplayField] = useState('_id');
  const [imageFieldName, setImageFieldName] = useState(null);
  
  // Available fields for display - will be updated based on actual data
  const [displayFields, setDisplayFields] = useState([
    { value: '_id', label: 'ID' }
  ]);

  // State for hover item details
  const [hoveredItem, setHoveredItem] = useState(null);
  const hoverTimeoutRef = useRef(null);

  // Refs for elements
  const result1ItemsRef = useRef({});
  const result2ItemsRef = useRef({});
  
  // State to track if component has mounted
  const [mounted, setMounted] = useState(false);
  // State to track if we have valid results
  const [initialState, setInitialState] = useState(true);
  
  // Process the results into the format we need
  const [result1, setResult1] = useState([]);
  const [result2, setResult2] = useState([]);
  const [combinedData, setCombinedData] = useState([]);

  // Summary statistics
  const [statistics, setStatistics] = useState({
    inBoth: 0,
    onlyInResult1: 0,
    onlyInResult2: 0,
    unchanged: 0,
    improved: 0,
    worsened: 0
  });

  // Set initial state similar to first component
  useEffect(() => {
    if (Array.isArray(queryResult1) && Array.isArray(queryResult2)) {
      setInitialState(false);
    } else if (initialState !== true) {
      setInitialState(true);
    }
  }, [queryResult1, queryResult2, initialState]);

  // Process results when they change
  useEffect(() => {
    if (!queryResult1 || !queryResult2) return;

    setResult1(queryResult1);
    setResult2(queryResult2);

    // Determine available fields for display by checking what's in the data
    if (queryResult1.length > 0 || queryResult2.length > 0) {
      const sampleItem = queryResult1[0] || queryResult2[0];
      if (sampleItem) {
        const fields = Object.keys(sampleItem)
          .filter(key => !key.startsWith('_')) // Exclude hidden fields
          .filter(key =>
            typeof sampleItem[key]==='string'
          )
          .map(key => ({ value: key, label: key.charAt(0).toUpperCase() + key.slice(1) }));
        
        // Find a field that might contain image names or URLs
        let imageField = null;
        if (sampleItem) {
          // Look for fields with common image-related names
          const possibleImageFields = ['image', 'img', 'thumbnail', 'picture', 'photo', 'avatar'];
          imageField = Object.keys(sampleItem).find(key =>
            possibleImageFields.some(imgField =>
              key.toLowerCase().includes(imgField)
            )
          );

          // If no obvious image field found, look for fields with URL patterns that might be images
          if (!imageField) {
            imageField = Object.keys(sampleItem).find(key => {
              const value = String(sampleItem[key] || '');
              return (
                value.match(/\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i) ||
                value.match(/(\/images\/|\/img\/|\/photos\/)/i) ||
                value.match(/\b(amazon|cloudfront|cloudinary|unsplash|media).*\.(com|net|org)/i)
              );
            });
          }

          // Store the image field in state if found
          if (imageField) {
            // Add this outside the component or in a new state variable
            // This will be used in the component where images need to be displayed
            console.log('Found potential image field:', imageField);
          }
        }

        // Always include _id at the beginning
        setDisplayFields([
          { value: '_id', label: 'ID' },
          ...fields
        ]);

        // Optionally set a preferred display field if an image field was found
        if (imageField) {
          setImageFieldName(imageField);
        }
      }
    }
  }, [queryResult1, queryResult2]);

  // Create combined dataset when results change
  useEffect(() => {
    if (!result1.length && !result2.length) return;

    // Create combined dataset with position changes
    const combined = result1.map(item1 => {
      // Find matching item in result2
      const matchingItem = result2.find(item2 => item2._id === item1._id);
      
      if (matchingItem) {
        // Item exists in both results
        return {
          ...item1,
          rank1: item1.rank,
          rank2: matchingItem.rank,
          score1: item1._score,
          score2: matchingItem._score,
          change: item1.rank - matchingItem.rank,
          status: "present in both",
        };
      } else {
        // Item exists only in result1
        return {
          ...item1,
          rank1: item1.rank,
          rank2: null,
          score1: item1._score,
          score2: null,
          change: null,
          status: "only in result 1",
        };
      }
    });

    // Add items that are only in result2
    result2.forEach(item2 => {
      const exists = combined.some(item => item._id === item2._id);
      if (!exists) {
        combined.push({
          ...item2,
          rank1: null,
          rank2: item2.rank,
          score1: null,
          score2: item2._score,
          change: null,
          status: "only in result 2",
        });
      }
    });

    setCombinedData(combined);

    // Calculate summary statistics
    const inBoth = combined.filter(item => item.status === "present in both").length;
    const onlyInResult1 = combined.filter(item => item.status === "only in result 1").length;
    const onlyInResult2 = combined.filter(item => item.status === "only in result 2").length;
    const unchanged = combined.filter(item => item.change === 0).length;
    const improved = combined.filter(item => item.change > 0).length;
    const worsened = combined.filter(item => item.change < 0).length;

    setStatistics({
      inBoth,
      onlyInResult1,
      onlyInResult2,
      unchanged,
      improved,
      worsened
    });
  }, [result1, result2]);

  // Update lines on window resize and after mounting  
  useEffect(() => {
    // Mark component as mounted
    setMounted(true);
    
    // Force re-render when window is resized to recalculate line positions
    const handleResize = () => {
      // Force a re-render by setting state
      setDisplayField(curr => curr);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update lines after component mounts to ensure all refs are loaded
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      setDisplayField(curr => curr); // Force re-render
    }, 100);
    
    return () => clearTimeout(timer);
  }, [mounted]);

  // Color function for item status
  const getStatusColor = (item, resultNum) => {
    if (resultNum === 1) {
      // For Result 1 items
      const matchingItem = result2.find(r2 => r2._id === item._id);
      if (!matchingItem) return "bg-yellow-300"; // Only in Result 1
      
      if (item.rank === matchingItem.rank) return "bg-blue-300"; // Same position
      if (item.rank < matchingItem.rank) return "bg-red-300"; // Dropped in Result 2
      return "bg-green-300"; // Improved in Result 2
    } else {
      // For Result 2 items
      const matchingItem = result1.find(r1 => r1._id === item._id);
      if (!matchingItem) return "bg-purple-300"; // Only in Result 2
      
      if (item.rank === matchingItem.rank) return "bg-blue-300"; // Same position
      if (item.rank > matchingItem.rank) return "bg-red-300"; // Improved from Result 1
      return "bg-green-300"; // Dropped from Result 1
    }
  };

  // Function to handle hover for item details
  const handleItemMouseEnter = (item) => {
    // Clear any existing timeout to prevent flickering
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredItem(item);
  };
  
  const handleItemMouseLeave = () => {
    // Add a small delay before hiding the tooltip to prevent flickering
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 100);
  };

  // Initial state (empty prompt) when no valid results
  if (initialState) {
    return (
      <EuiPanel
        hasBorder={false}
        hasShadow={false}
        grow={true}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <EuiEmptyPrompt
          iconType="search"
          title={<h2>No results</h2>}
          body={<p>Add at least one query to display search results.</p>}
        />
      </EuiPanel>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Results for query: <em>{queryText}</em></h3>

      {/* Field selector dropdown */}
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="field-selector" className="text-sm font-medium text-gray-700">
          Display Field:
        </label>
        <select
          id="field-selector"
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={displayField}
          onChange={(e) => setDisplayField(e.target.value)}
        >
          {displayFields && displayFields.length > 0 ? (
            displayFields.map((field) => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))
          ) : (
            <option value="">No fields available</option>
          )}
        </select>
      </div>
      
      {/* Summary section with Venn diagram style using CSS classes */}
      <div className="mb-6">
        <div className="venn-container">
          {/* Result 1 rectangle (left) */}
          <div className="venn-left">
            <div className="venn-value">{statistics.onlyInResult1}</div>
            <div className="venn-label">Unique</div>
          </div>
          
          {/* Intersection (middle) */}
          <div className="venn-middle">
            <div className="venn-value">{statistics.inBoth}</div>
            <div className="venn-label">Common</div>
          </div>
          
          {/* Result 2 rectangle (right) */}
          <div className="venn-right">
            <div className="venn-value">{statistics.onlyInResult2}</div>
            <div className="venn-label">Unique</div>
          </div>
        </div>
      </div>

      {/* Rank-based overlap visualization */}
      <div className="mb-6">
        <div className="flex justify-between mb-4">
          <div className="text-center w-1/4">
            <h4 className="font-semibold">{resultText1}</h4>
            <div className="text-sm text-gray-600">({result1.length} results)</div>
          </div>
          <div className="text-center w-1/4">
            <h4 className="font-semibold">{resultText2}</h4>
            <div className="text-sm text-gray-600">({result2.length} results)</div>
          </div>
        </div>
        
        <div className="flex">
          {/* Result 1 ranks - with refs to capture positions */}
          <div className="w-1/4 relative" id="result1-items">
            {result1.map((item, index) => (
              <div 
                key={`r1-${index}`}
                id={`r1-item-${item._id}`}
                ref={el => result1ItemsRef.current[item._id] = el}
                className="flex-row-reverse items-center mb-2 hover:bg-gray-100 p-1 rounded"
                onMouseEnter={() => handleItemMouseEnter(item)}
                onMouseLeave={handleItemMouseLeave}
              >
                <div className={`w-8 h-8 rounded-full ${getStatusColor(item, 1)} flex items-center justify-center font-bold ml-2 flex-shrink-0`}>
                  {item.rank}
                </div>
                <div className="w-8 h-8 ml-2 flex-shrink-0">
                  {imageFieldName && item[imageFieldName] && item[imageFieldName].match(/\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i) ? (
                    <img
                      width="32"
                      height="32"
                      src={item[imageFieldName]}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                </div>
                <div className="font-mono text-sm truncate flex-grow text-right">
                  {item[displayField] || item._id}
                </div>
              </div>
            ))}
          </div>
          
          {/* Connection lines */}
          <div className="w-2/4 relative">
            { /* TODO: Fixed size leads to lines being cut off, for now adding overflow to avoid that */ }
            <svg width="100%" height="420" style={{ overflow: 'visible' }} className="absolute top-0 left-0" id="connection-lines">
              {/* Only draw lines after component has mounted to ensure refs are available */}
              {mounted && result1.map((r1Item) => {
                // Find if this item exists in result2
                const r2Match = result2.find(r2 => r2._id === r1Item._id);
                if (!r2Match) return null; // Skip if no match
                
                // Line color based on rank comparison
                let lineColor;
                if (r1Item.rank === r2Match.rank) {
                  lineColor = "#93C5FD"; // Blue for unchanged
                } else if (r1Item.rank < r2Match.rank) {
                  lineColor = "#FCA5A5"; // Red for dropped
                } else {
                  lineColor = "#86EFAC"; // Green for improved
                }
                
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
            <div className="w-full h-full flex items-center justify-center">
              {/* Center area for any additional stats */}
            </div>
          </div>
          
          {/* Result 2 ranks */}
          <div className="w-1/4 relative" id="result2-items">
            {result2.map((item, index) => (
              <div 
                key={`r2-${index}`}
                id={`r2-item-${item._id}`}
                ref={el => result2ItemsRef.current[item._id] = el}
                className="flex items-center mb-2 hover:bg-gray-100 p-1 rounded"
                onMouseEnter={() => handleItemMouseEnter(item)}
                onMouseLeave={handleItemMouseLeave}
              >
                <div className={`w-8 h-8 rounded-full ${getStatusColor(item, 2)} flex items-center justify-center font-bold mr-2 flex-shrink-0`}>
                  {item.rank}
                </div>
                <div className="w-8 h-8 mr-2 flex-shrink-0">
                  {imageFieldName && item[imageFieldName] && item[imageFieldName].match(/\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i) ? (
                    <img
                    width="32"
                    height="32"
                    src={item[imageFieldName]}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                </div>
                <div className="font-mono text-sm truncate">
                  {item[displayField] || item._id}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-300 mr-1"></div> Same position
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-300 mr-1"></div> Improved position
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-300 mr-1"></div> Dropped position
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-300 mr-1"></div> Only in {resultText1}
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-purple-300 mr-1"></div> Only in {resultText2}
        </div>
      </div>
      
      {/* Item Details Tooltip on Hover */}
      {hoveredItem && (
        <div 
          className="fixed bg-white shadow-lg rounded-lg p-4 max-w-md z-20 border"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '400px',
            overflow: 'auto'
          }}
          onMouseEnter={() => handleItemMouseEnter(hoveredItem)}
          onMouseLeave={handleItemMouseLeave}
        >

          {imageFieldName && hoveredItem[imageFieldName] && hoveredItem[imageFieldName].match(/\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i) ? (
            <>
              <div className="flex items-center mb-2">
                <div className="w-16 h-16 flex-shrink-0 mr-3">
                  <img
                    width="16"
                    height="16"
                    src={hoveredItem[imageFieldName]}
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
                { /* hoveredItem.title && (<h3 className="text-lg font-bold">{hoveredItem.title}</h3>)} */}
              </div>
              <div className="border-t border-b py-2 mb-2"></div>
            </>
          ) : (
            <></>
          )}


          <div className="grid grid-cols-2 gap-2">
            <div className="mb-1 text-sm">
              <span className="font-semibold">ID:</span> <span className="font-mono">{hoveredItem._id}</span>
            </div>
          </div>
          
          {/* Display all fields from the item */}
          {Object.entries(hoveredItem)
            .filter(([key]) => !['_id', '_score', 'rank', 'rank1', 'rank2', 'score1', 'score2', 'change', 'status'].includes(key))
            .filter(([key, value]) => typeof value === 'string')
            .map(([key, value]) => (
              <div key={key} className="mb-1 text-sm">
                <span className="font-semibold">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> 
                {typeof value === 'string' && value.length > 100 ? (
                  <p className="text-xs mt-1">{value}</p>
                ) : (
                  <span> {String(value)}</span>
                )}
              </div>
            ))}
            
          {/* Rank comparison if available in both results */}
          {hoveredItem.status === "present in both" && (
            <div className="mt-2 pt-2 border-t">
              <div className="text-sm font-semibold">Rank Comparison:</div>
              <div className="flex justify-between mt-1">
                <div>
                  <span className="text-xs">Result 1: </span>
                  <span className="font-semibold">{hoveredItem.rank1}</span>
                </div>
                <div>
                  <span className="text-xs">Result 2: </span>
                  <span className="font-semibold">{hoveredItem.rank2}</span>
                </div>
                <div>
                  <span className="text-xs">Change: </span>
                  <span className={`font-semibold ${
                    hoveredItem.change > 0 ? 'text-green-600' : 
                    hoveredItem.change < 0 ? 'text-red-600' : ''
                  }`}>
                    {hoveredItem.change > 0 ? `+${hoveredItem.change}` : hoveredItem.change}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisualComparison;