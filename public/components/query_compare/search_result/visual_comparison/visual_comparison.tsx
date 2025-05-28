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

export const defaultStyleConfig = {
  lineColors: {
    unchanged: { stroke: "#93C5FD", strokeWidth: 4 },
    increased: { stroke: "#86EFAC", strokeWidth: 4 },
    decreased: { stroke: "#FCA5A5", strokeWidth: 4 },
  },
  statusClassName: {
    unchanged: "bg-blue-300",
    increased: "bg-green-300",
    decreased: "bg-red-300",
    inResult1: "bg-yellow-custom",
    inResult2: "bg-purple-custom",
  },
  vennDiagramStyle: {
    left: { backgroundColor: "rgba(var(--yellow-custom), 0.9)"},
    middle: {},
    right: { backgroundColor: "rgba(var(--purple-custom), 0.9)" },
  },
  hideLegend: [],
}

export const rankingChangeStyleConfig = {
  lineColors: {
    unchanged: { stroke: "#93C5FD", strokeWidth: 4 },
    increased: { stroke: "#86EFAC", strokeWidth: 4 },
    decreased: { stroke: "#FCA5A5", strokeWidth: 4 },
  },
  statusClassName: {
    unchanged: "bg-blue-300",
    increased: "bg-green-300",
    decreased: "bg-red-300",
    inResult1: "bg-purple-custom",
    inResult2: "bg-purple-custom",
  },
  vennDiagramStyle: {
    left: { backgroundColor: "rgba(var(--purple-custom), 0.9)"},
    middle: {},
    right: { backgroundColor: "rgba(var(--purple-custom), 0.9)" },
  },
  hideLegend: ['inResult1', 'inResult2'],
}

export const vennDiagramStyleConfig = {
  lineColors: {
    unchanged: { stroke: "black", strokeWidth: 2 },
    increased: { stroke: "black", strokeWidth: 2 },
    decreased: { stroke: "black", strokeWidth: 2 },
  },
  statusClassName: {
    unchanged: "bg-blue-100",
    increased: "bg-blue-100",
    decreased: "bg-blue-100",
    inResult1: "bg-purple-custom",
    inResult2: "bg-purple-custom",
  },
  vennDiagramStyle: {
    left: { backgroundColor: "rgba(var(--purple-custom), 0.9)"},
    middle: {},
    right: { backgroundColor: "rgba(var(--purple-custom), 0.9)" },
  },
  hideLegend: ['inResult1', 'inResult2', 'unchanged', 'increased', 'decreased'],
}

export const VisualComparison = ({
  queryResult1,
  queryResult2,
  queryText,
  resultText1,
  resultText2,
}: OpenSearchComparisonProps) => {
  // Add state for selected style
  const [selectedStyle, setSelectedStyle] = useState('default');
  
  // Get the style based on selection
  const getCurrentStyle = () => {
    switch (selectedStyle) {
      case 'simpler':
        return rankingChangeStyleConfig;
      case 'twoColor':
        return vennDiagramStyleConfig;
      default:
        return defaultStyleConfig;
    }
  };

  const { lineColors, statusClassName, vennDiagramStyle, hideLegend } = getCurrentStyle();

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
      <div className="venn-left" style={vennDiagramStyle.left}>
        <div className="venn-value">{statistics.onlyInResult1}</div>
        <div className="venn-label">Unique</div>
      </div>
      
      {/* Intersection (middle) */}
      <div className="venn-middle" style={vennDiagramStyle.middle}>
        <div className="venn-value">{statistics.inBoth}</div>
        <div className="venn-label">Common</div>
      </div>
      
      {/* Result 2 rectangle (right) */}
      <div className="venn-right" style={vennDiagramStyle.right}>
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

    if (!matchingItem) {
      if (isResult1) {
        return statusClassName.inResult1;
      } else {
        return statusClassName.inResult2;
      }
    }
    
    if (isResult1) {
      if (item.rank === matchingItem.rank) {
        return statusClassName.unchanged;
      } else if (item.rank > matchingItem.rank) {
        return statusClassName.increased;
      } else {
        return statusClassName.decreased;
      }
    } else {
      if (item.rank === matchingItem.rank) {
        return statusClassName.unchanged;
      } else if (item.rank > matchingItem.rank) {
        return statusClassName.decreased;
      } else {
        return statusClassName.increased;
      }
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

          {/* Style selector dropdown */}
          <div className="mb-4">
            <EuiFormRow label="Visualization Style:" id="styleSelectorForm">
              <EuiSuperSelect
                id="style-selector"
                options={[
                  { value: 'default', inputDisplay: 'Default Style', dropdownDisplay: 'Default Style' },
                  { value: 'simpler', inputDisplay: 'Ranking Change Color Coding', dropdownDisplay: 'Ranking Change Color Coding' },
                  { value: 'twoColor', inputDisplay: 'Venn Diagram Color Coding', dropdownDisplay: 'Venn Diagram Color Coding' }
                ]}
                valueOfSelected={selectedStyle}
                onChange={(value) => setSelectedStyle(value)}
                fullWidth
                hasDividers
              />
            </EuiFormRow>
          </div>

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
                  lineColors={lineColors}
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

          <div className="mt-4 flex gap-4 text-sm justify-center">
            { !hideLegend.includes('unchanged') && (
              <div className="flex items-center">
                <div className={`w-4 h-4 ${statusClassName.unchanged} mr-1`}></div> Unchanged rank
              </div>
            )}
            { !hideLegend.includes('increased') && (
              <div className="flex items-center">
                <div className={`w-4 h-4 ${statusClassName.increased} mr-1`}></div> Increased rank
              </div>
            )}
            { !hideLegend.includes('decreased') && (
              <div className="flex items-center">
                <div className={`w-4 h-4 ${statusClassName.decreased} mr-1`}></div> Decreased rank
              </div>
            )}
            { !hideLegend.includes('inResult1') && (
              <div className="flex items-center">
                <div className={`w-4 h-4 ${statusClassName.inResult1} mr-1`}></div> Only in {resultText1}
              </div>
            )}
            { !hideLegend.includes('inResult2') && (
              <div className="flex items-center">
                <div className={`w-4 h-4 ${statusClassName.inResult2} mr-1`}></div> Only in {resultText2}
              </div>
            )}
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