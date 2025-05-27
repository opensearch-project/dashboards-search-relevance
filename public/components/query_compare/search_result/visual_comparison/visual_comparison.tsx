import React, { useState, useEffect, useRef } from 'react';
import { EuiPanel, EuiEmptyPrompt, EuiPage, EuiPageBody, EuiPageContent, EuiSuperSelect, EuiFormRow } from '@elastic/eui';

import './visual_comparison.scss';
import { ItemDetailHoverPane } from './item_detail_hover_pane';
import { ConnectionLines } from './connection_lines';
import { ResultItems } from './result_items';

// Interface should match the first component
interface OpenSearchComparisonProps {
  queryResult1: any;
  queryResult2: any;
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

// Helper function to determine color based on item status
const getItemStatusColor = (params: {
  isResult1: boolean;
  isOnlyInCurrentResult: boolean;
  isSamePosition: boolean;
  isImproved: boolean;
}) => {
  const { isResult1, isOnlyInCurrentResult, isSamePosition, isImproved } = params;

  if (isOnlyInCurrentResult) {
    return isResult1 ? "bg-yellow-custom" : "bg-purple-custom";
  }

  if (isSamePosition) {
    return "bg-blue-300";
  }

  if (isImproved) {
    return "bg-green-300";
  }

  return "bg-red-300";
};

// Helper function to get legend colors
const getLegendColors = () => ({
  unchanged: getItemStatusColor({ isResult1: true, isOnlyInCurrentResult: false, isSamePosition: true, isImproved: false }),
  increased: getItemStatusColor({ isResult1: true, isOnlyInCurrentResult: false, isSamePosition: false, isImproved: true }),
  decreased: getItemStatusColor({ isResult1: true, isOnlyInCurrentResult: false, isSamePosition: false, isImproved: false }),
  onlyInResult1: getItemStatusColor({ isResult1: true, isOnlyInCurrentResult: true, isSamePosition: false, isImproved: false }),
  onlyInResult2: getItemStatusColor({ isResult1: false, isOnlyInCurrentResult: true, isSamePosition: false, isImproved: false })
});

export const VisualComparison = ({
  queryResult1,
  queryResult2,
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
    const isResult1 = resultNum === 1;
    const otherResult = isResult1 ? result2 : result1;
    const matchingItem = otherResult.find(r => r._id === item._id);
    
    return getItemStatusColor({
      isResult1,
      isOnlyInCurrentResult: !matchingItem,
      isSamePosition: matchingItem && item.rank === matchingItem.rank,
      isImproved: matchingItem && (
        (isResult1 && item.rank > matchingItem.rank) || 
        (!isResult1 && item.rank < matchingItem.rank)
      )
    });
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
          body={<p>You need two queries to display search results.</p>}
        />
      </EuiPanel>
    );
  }

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageContent>
          <h3 className="text-lg font-semibold mb-2">Results for query: <em>{queryText}</em></h3>

          {/* Field selector dropdown */}
          <div className="mb-4">
            <EuiFormRow label="Display Field:" id="fieldSelectorForm">
              <EuiSuperSelect
                id="field-selector"
                options={displayFields && displayFields.length > 0 
                  ? displayFields.map((field) => ({
                      value: field.value,
                      inputDisplay: field.label,
                      dropdownDisplay: field.label,
                    }))
                  : [{ value: '', inputDisplay: 'No fields available', dropdownDisplay: 'No fields available' }]
                }
                valueOfSelected={displayField}
                onChange={(value) => setDisplayField(value)}
                fullWidth
                hasDividers
              />
            </EuiFormRow>
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
              <div className="w-1/3 relative">
                <ResultItems
                  items={result1}
                  resultNum={1}
                  imageFieldName={imageFieldName}
                  displayField={displayField}
                  getStatusColor={getStatusColor}
                  handleItemMouseEnter={handleItemMouseEnter}
                  handleItemMouseLeave={handleItemMouseLeave}
                  result1ItemsRef={result1ItemsRef}
                  result2ItemsRef={result2ItemsRef}
                />
              </div>

              {/* Connection lines */}
              <div className="w-1/3 relative">
                <ConnectionLines 
                  mounted={mounted}
                  result1={result1}
                  result2={result2}
                  result1ItemsRef={result1ItemsRef}
                  result2ItemsRef={result2ItemsRef}
                  getStatusColor={getStatusColor}
                />
                <div className="w-full h-full flex items-center justify-center">
                  {/* Center area for any additional stats */}
                </div>
              </div>

              {/* Result 2 ranks */}
              <div className="w-1/3 relative">
                <ResultItems
                  items={result2}
                  resultNum={2}
                  imageFieldName={imageFieldName}
                  displayField={displayField}
                  getStatusColor={getStatusColor}
                  handleItemMouseEnter={handleItemMouseEnter}
                  handleItemMouseLeave={handleItemMouseLeave}
                  result1ItemsRef={result1ItemsRef}
                  result2ItemsRef={result2ItemsRef}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center">
              <div className={`w-4 h-4 ${getLegendColors().unchanged} mr-1`}></div> Unchanged position
            </div>
            <div className="flex items-center">
              <div className={`w-4 h-4 ${getLegendColors().increased} mr-1`}></div> Increased position
            </div>
            <div className="flex items-center">
              <div className={`w-4 h-4 ${getLegendColors().decreased} mr-1`}></div> Decreased position
            </div>
            <div className="flex items-center">
              <div className={`w-4 h-4 ${getLegendColors().onlyInResult1} mr-1`}></div> Only in {resultText1}
            </div>
            <div className="flex items-center">
              <div className={`w-4 h-4 ${getLegendColors().onlyInResult2} mr-1`}></div> Only in {resultText2}
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
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};

export default VisualComparison;