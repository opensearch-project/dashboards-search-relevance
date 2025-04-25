import React, { useState, useEffect, useRef } from 'react';
import { EuiPanel, EuiEmptyPrompt } from '@elastic/eui';

import './visual_comparison.scss';
import { ItemDetailHoverPane } from './item_detail_hover_pane';
import { ConnectionLines } from './connection_lines';

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
  const [mousePosition, setMousePosition] = useState(null);

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

  const vennDiagram = (
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
  );

  const resultItems = (items, resultNum) => (
    <div className="w-1/3 relative" id={`result${resultNum}-items`}>
      {items.map((item, index) => (
        <div 
          key={`r${resultNum}-${index}`}
          id={`r${resultNum}-item-${item._id}`}
          ref={el => (resultNum === 1 ? result1ItemsRef : result2ItemsRef).current[item._id] = el}
          className={`flex ${resultNum === 1 ? 'flex-row-reverse' : ''} items-center mb-2 hover:bg-gray-100 p-1 rounded`}
          onMouseEnter={(event) => handleItemMouseEnter(item, event)}
          onMouseLeave={handleItemMouseLeave}
        >
          <div className={`w-8 h-8 rounded-full ${getStatusColor(item, resultNum)} flex items-center justify-center font-bold ${resultNum === 1 ? 'ml-2' : 'mr-2'} flex-shrink-0`}>
            {item.rank}
          </div>
          <div className={`w-8 h-8 ${resultNum === 1 ? 'ml-2' : 'mr-2'} flex-shrink-0`}>
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
          <div className="font-mono text-sm truncate overflow-hidden">
            {item[displayField] || item._id}
          </div>
        </div>
      ))}
    </div>
  );

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

    // Create combined dataset
    const combined = [...result1];

    // Add items that are only in result2
    result2.forEach(item2 => {
      const exists = combined.some(item => item._id === item2._id);
      if (!exists) {
        combined.push(item2);
      }
    });

    setCombinedData(combined);

    // Calculate summary statistics
    const inBoth = result1.filter(item1 => 
      result2.some(item2 => item2._id === item1._id)
    ).length;
    const onlyInResult1 = result1.length - inBoth;
    const onlyInResult2 = result2.length - inBoth;
    const unchanged = result1.filter(item1 => {
      const item2 = result2.find(item2 => item2._id === item1._id);
      return item2 && item1.rank === item2.rank;
    }).length;
    const improved = result1.filter(item1 => {
      const item2 = result2.find(item2 => item2._id === item1._id);
      return item2 && item1.rank > item2.rank;
    }).length;
    const worsened = result1.filter(item1 => {
      const item2 = result2.find(item2 => item2._id === item1._id);
      return item2 && item1.rank < item2.rank;
    }).length;

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
  const handleItemMouseEnter = (item, event) => {
    // Clear any existing timeout to prevent flickering
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set the hovered item and mouse position
    setHoveredItem(item);
    setMousePosition({ x: event.clientX, y: event.clientY });
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
        {vennDiagram}
      </div>

      {/* Rank-based overlap visualization */}
      <div className="mb-6">
        <div className="flex justify-between mb-4">
          <div className="text-center w-1/3">
            <h4 className="font-semibold">{resultText1}</h4>
            <div className="text-sm text-gray-600">({result1.length} results)</div>
          </div>
          <div className="text-center w-1/3">
            <h4 className="font-semibold">{resultText2}</h4>
            <div className="text-sm text-gray-600">({result2.length} results)</div>
          </div>
        </div>
        
        <div className="flex">
          {/* Result 1 ranks - with refs to capture positions */}
          {resultItems(result1, 1)}
          
          {/* Connection lines */}
          <div className="w-1/3 relative">
            <ConnectionLines 
              mounted={mounted}
              result1={result1}
              result2={result2}
              result1ItemsRef={result1ItemsRef}
              result2ItemsRef={result2ItemsRef}
            />
            <div className="w-full h-full flex items-center justify-center">
              {/* Center area for any additional stats */}
            </div>
          </div>
          
          {/* Result 2 ranks */}
          {resultItems(result2, 2)}
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
      <ItemDetailHoverPane
        item={hoveredItem}
        mousePosition={mousePosition}
        onMouseEnter={() => {
          // Prevent the tooltip from disappearing when mouse enters it
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
        }}
        onMouseLeave={handleItemMouseLeave}
        imageFieldName={imageFieldName}
      />

    </div>
  );
};

export default VisualComparison;