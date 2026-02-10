/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  EuiPanel,
  EuiEmptyPrompt,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSuperSelect,
  EuiFormRow,
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiText,
  EuiSpacer,
} from '@elastic/eui';

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
  highlightPreTags1?: string[];
  highlightPostTags1?: string[];
  highlightPreTags2?: string[];
  highlightPostTags2?: string[];
  isSearching?: boolean;
}

export const convertFromSearchResult = (searchResult) => {
  if (!searchResult?.hits?.hits) return undefined;

  return searchResult.hits.hits.map((x, index) => ({
    _id: x._id,
    _score: x._score,
    rank: index + 1,
    highlight: x.highlight,
    ...x._source,
  }));
};

export const defaultStyleConfig = {
  lineColors: {
    unchanged: { stroke: '#d8f9d5', strokeWidth: 4 },
    increased: { stroke: '#d8f9d5', strokeWidth: 4 },
    decreased: { stroke: '#d8f9d5', strokeWidth: 4 },
  },
  statusClassName: {
    unchanged: 'bg-unchanged',
    increased: 'bg-unchanged',
    decreased: 'bg-unchanged',
    inResult1: 'bg-result-set-1',
    inResult2: 'bg-result-set-2',
  },
  vennDiagramStyle: {
    left: { backgroundColor: 'rgba(133, 159, 209, 1.0)' },
    middle: { backgroundColor: 'rgba(216,249,213, 0.7)' },
    right: { backgroundColor: 'rgba(170, 235, 20, 1.0)' },
  },
  hideLegend: ['unchanged', 'increased', 'decreased', 'inResult1', 'inResult2'],
};

// Utility function to determine display fields and image field
const getDisplayFieldsAndImageField = (sampleItem) => {
  const fields = Object.keys(sampleItem)
    .filter((key) => !key.startsWith('_')) // Exclude hidden fields
    .filter((key) => typeof sampleItem[key] === 'string')
    .map((key) => ({ value: key, label: key.charAt(0).toUpperCase() + key.slice(1) }));

  // Find a field that might contain image names or URLs
  let imageField = null;
  if (sampleItem) {
    // Look for fields with common image-related names
    const possibleImageFields = ['image', 'img', 'thumbnail', 'picture', 'photo', 'avatar'];
    imageField = Object.keys(sampleItem).find((key) =>
      possibleImageFields.some((imgField) => key.toLowerCase().includes(imgField))
    );

    // If no obvious image field found, look for fields with URL patterns that might be images
    if (!imageField) {
      imageField = Object.keys(sampleItem).find((key) => {
        const value = String(sampleItem[key] || '');
        return (
          value.match(/\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i) ||
          value.match(/(\/images\/|\/img\/|\/photos\/)/i) ||
          value.match(/\b(amazon|cloudfront|cloudinary|unsplash|media).*(\.com|net|org)/i)
        );
      });
    }
  }

  // Always include _id at the beginning
  return {
    displayFields: [{ value: '_id', label: 'ID' }, ...fields],
    imageFieldName: imageField || null,
  };
};

// Utility function to calculate statistics for the Venn diagram and rank changes
const calculateStatistics = (result1, result2) => {
  const inBoth = result1.filter((item1) => result2.some((item2) => item2._id === item1._id)).length;
  const onlyInResult1 = result1.length - inBoth;
  const onlyInResult2 = result2.length - inBoth;
  const unchanged = result1.filter((item1) => {
    const item2 = result2.find((item2) => item2._id === item1._id);
    return item2 && item1.rank === item2.rank;
  }).length;
  const improved = result1.filter((item1) => {
    const item2 = result2.find((item2) => item2._id === item1._id);
    return item2 && item1.rank > item2.rank;
  }).length;
  const worsened = result1.filter((item1) => {
    const item2 = result2.find((item2) => item2._id === item1._id);
    return item2 && item1.rank < item2.rank;
  }).length;

  return {
    inBoth,
    onlyInResult1,
    onlyInResult2,
    unchanged,
    improved,
    worsened,
  };
};

// Extracted sub-component for field and size selector dropdowns
const FieldSelectorDropdown = ({ displayFields, displayField, setDisplayField, sizeMultiplier, setSizeMultiplier }: any) => {
  return (
    <EuiFlexGroup gutterSize="m" alignItems="center" style={{ marginBottom: '16px' }}>
      <EuiFlexItem grow={false}>
        <EuiFormRow label="Display Field">
          <EuiSuperSelect
            options={
              displayFields && displayFields.length > 0
                ? displayFields.map((field) => ({
                  value: field.value,
                  inputDisplay: field.label,
                  dropdownDisplay: field.label,
                }))
                : [
                  {
                    value: '',
                    inputDisplay: 'No fields available',
                    dropdownDisplay: 'No fields available',
                  },
                ]
            }
            valueOfSelected={displayField}
            onChange={(value) => setDisplayField(value)}
            style={{ minWidth: 200 }}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFormRow label="Size">
          <EuiSuperSelect
            options={[
              { value: '1', inputDisplay: 'Small' },
              { value: '2', inputDisplay: 'Medium' },
              { value: '3', inputDisplay: 'Large' },
            ]}
            valueOfSelected={String(sizeMultiplier)}
            onChange={(value) => setSizeMultiplier(Number(value))}
            style={{ minWidth: 120 }}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

// Extracted ResultPanel sub-component to reduce duplication between single and comparison modes.
// Renders either a ResultItems list or an empty prompt if the setup is not configured.
const ResultPanel = ({
  items,
  resultNum,
  isConfigured,
  setupLabel,
  imageFieldName,
  displayField,
  getStatusColor,
  handleItemClick,
  result1ItemsRef,
  result2ItemsRef,
  sizeMultiplier,
  highlightPreTags,
  highlightPostTags,
}: any) => {
  if (!isConfigured) {
    return (
      <EuiPanel hasBorder paddingSize="l" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EuiEmptyPrompt
          iconType="documents"
          title={<h3>No comparison</h3>}
          body={<p>Configure {setupLabel} to compare results.</p>}
        />
      </EuiPanel>
    );
  }

  return (
    <ResultItems
      items={items}
      resultNum={resultNum}
      imageFieldName={imageFieldName}
      displayField={displayField}
      getStatusColor={getStatusColor}
      handleItemClick={handleItemClick}
      result1ItemsRef={result1ItemsRef}
      result2ItemsRef={result2ItemsRef}
      sizeMultiplier={sizeMultiplier}
      highlightPreTags={highlightPreTags}
      highlightPostTags={highlightPostTags}
    />
  );
};


export const VisualComparison = ({
  queryResult1,
  queryResult2,
  queryText,
  resultText1,
  resultText2,
  highlightPreTags1,
  highlightPostTags1,
  highlightPreTags2,
  highlightPostTags2,
  isSearching = false,
}: OpenSearchComparisonProps) => {
  // Add state for selected style
  const [selectedStyle, setSelectedStyle] = useState('default');

  // Get the style based on selection
  const getCurrentStyle = () => {
    // Return the default style config. Keep this in case the need for additional styles turns up.
    return defaultStyleConfig;
  };

  const { lineColors, statusClassName, vennDiagramStyle, hideLegend } = getCurrentStyle();

  // State for selected display field
  const [displayField, setDisplayField] = useState('_id');
  const [imageFieldName, setImageFieldName] = useState(null);
  const [sizeMultiplier, setSizeMultiplier] = useState(2);

  // Available fields for display - will be updated based on actual data
  const [displayFields, setDisplayFields] = useState([{ value: '_id', label: 'ID' }]);

  // State for hover item details
  const [selectedItem, setSelectedItem] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);

  // Refs for elements
  const result1ItemsRef = useRef({});
  const result2ItemsRef = useRef({});

  // State to track if component has mounted
  const [mounted, setMounted] = useState(false);
  // State to track if we have valid results
  const [initialState, setInitialState] = useState(true);
  // State to track if we're in single result mode (only Setup 1 has results)
  const [singleResultMode, setSingleResultMode] = useState(false);

  // Process the results into the format we need
  const [result1, setResult1] = useState([]);
  const [result2, setResult2] = useState([]);

  // Summary statistics
  const [statistics, setStatistics] = useState({
    inBoth: 0,
    onlyInResult1: 0,
    onlyInResult2: 0,
    unchanged: 0,
    improved: 0,
    worsened: 0,
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
    // Check if setup is configured (array exists, even if empty) vs not configured (undefined/null)
    const isSetup1Configured = Array.isArray(queryResult1);
    const isSetup2Configured = Array.isArray(queryResult2);

    if (isSetup1Configured && isSetup2Configured) {
      // Both setups are configured - comparison mode (even if one or both have 0 results)
      setInitialState(false);
      setSingleResultMode(false);
    } else if (isSetup1Configured || isSetup2Configured) {
      // Single result mode - only one setup is configured
      setInitialState(false);
      setSingleResultMode(true);
    } else if (initialState !== true) {
      // Neither setup is configured
      setInitialState(true);
      setSingleResultMode(false);
    }
  }, [queryResult1, queryResult2, initialState]);

  // Single useEffect for all derived state
  // Treats missing queryResult as [] to leverage the same code path for both modes
  useEffect(() => {
    if (initialState) return;

    // Treat unconfigured setups as empty arrays
    const effectiveResult1 = queryResult1 || [];
    const effectiveResult2 = queryResult2 || [];

    setResult1(effectiveResult1);
    setResult2(effectiveResult2);

    // Determine available fields for display by checking what's in the data
    if (effectiveResult1.length > 0 || effectiveResult2.length > 0) {
      const sampleItem = effectiveResult1[0] || effectiveResult2[0];
      if (sampleItem) {
        const { displayFields, imageFieldName } = getDisplayFieldsAndImageField(sampleItem);
        setDisplayFields(displayFields);
        if (imageFieldName) {
          setImageFieldName(imageFieldName);
        } else {
          setImageFieldName(null);
        }
      }
    } else {
      setDisplayFields([{ value: '_id', label: 'ID' }]);
      setImageFieldName(null);
    }

    setStatistics(calculateStatistics(effectiveResult1, effectiveResult2));
  }, [queryResult1, queryResult2, initialState]);

  // Update lines on window resize and after mounting
  useEffect(() => {
    // Mark component as mounted
    setMounted(true);

    // Force re-render when window is resized to recalculate line positions
    const handleResize = () => {
      // Force a re-render by setting state
      setDisplayField((curr) => curr);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force re-render after result items are rendered and refs are set
  const [, forceRerender] = useState(0);
  useLayoutEffect(() => {
    forceRerender((v) => v + 1);
  }, [result1, result2, displayField, imageFieldName]);

  // Color function for item status
  const getStatusColor = (item, resultNum) => {
    const isResult1 = resultNum === 1;
    const otherResult = isResult1 ? result2 : result1;
    const matchingItem = otherResult.find((r) => r._id === item._id);

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

  // Function to handle click for item details
  const handleItemClick = (item, event, resultNum) => {
    // Toggle the selected item - if clicking the same item, close it
    if (selectedItem && selectedItem._id === item._id) {
      setSelectedItem(null);
    } else {
      setSelectedItem({ ...item, resultNum });
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  // Loading state for agentic search
  if (isSearching) {
    return (
      <EuiPanel
        hasBorder={false}
        hasShadow={false}
        grow={true}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}
      >
        <EuiFlexGroup direction="column" alignItems="center" gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner size="xl" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText textAlign="center">
              <h3>Searching...</h3>
              <p>Please wait while we process your search query.</p>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    );
  }

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
          body={<p>You need two Setups to display comparison.</p>}
        />
      </EuiPanel>
    );
  }

  // Single result mode - show results with a message on the unconfigured side
  if (singleResultMode) {
    const isSetup1Configured = Array.isArray(queryResult1);
    const isSetup2Configured = Array.isArray(queryResult2);
    const emptySetupNum = isSetup1Configured ? '2' : '1';

    return (
      <EuiPage>
        <EuiPageBody>
          <EuiPageContent>
            <h3 className="text-lg font-semibold mb-2">
              Results for query: <em>{queryText}</em>
            </h3>

            <FieldSelectorDropdown
              displayFields={displayFields}
              displayField={displayField}
              setDisplayField={setDisplayField}
              sizeMultiplier={sizeMultiplier}
              setSizeMultiplier={setSizeMultiplier}
            />

            {/* Single result layout */}
            <EuiFlexGroup gutterSize="l">
              {/* Left side - Setup 1 */}
              <EuiFlexItem>
                <EuiPanel hasBorder={false} hasShadow={false} paddingSize="m">
                  <EuiText textAlign="center">
                    <h4>{resultText1}</h4>
                    <p style={{ color: '#6a717d' }}>({result1.length} results)</p>
                  </EuiText>
                  <EuiSpacer size="m" />
                  <ResultPanel
                    items={result1}
                    resultNum={1}
                    isConfigured={isSetup1Configured}
                    setupLabel="Setup 1"
                    imageFieldName={imageFieldName}
                    displayField={displayField}
                    getStatusColor={getStatusColor}
                    handleItemClick={handleItemClick}
                    result1ItemsRef={result1ItemsRef}
                    result2ItemsRef={result2ItemsRef}
                    sizeMultiplier={sizeMultiplier}
                    highlightPreTags={highlightPreTags1}
                    highlightPostTags={highlightPostTags1}
                  />
                </EuiPanel>
              </EuiFlexItem>

              {/* Right side - Setup 2 */}
              <EuiFlexItem>
                <EuiPanel hasBorder={false} hasShadow={false} paddingSize="m">
                  <EuiText textAlign="center">
                    <h4>{resultText2}</h4>
                    <p style={{ color: '#6a717d' }}>({result2.length} results)</p>
                  </EuiText>
                  <EuiSpacer size="m" />
                  <ResultPanel
                    items={result2}
                    resultNum={2}
                    isConfigured={isSetup2Configured}
                    setupLabel="Setup 2"
                    imageFieldName={imageFieldName}
                    displayField={displayField}
                    getStatusColor={getStatusColor}
                    handleItemClick={handleItemClick}
                    result1ItemsRef={result1ItemsRef}
                    result2ItemsRef={result2ItemsRef}
                    sizeMultiplier={sizeMultiplier}
                    highlightPreTags={highlightPreTags2}
                    highlightPostTags={highlightPostTags2}
                  />
                </EuiPanel>
              </EuiFlexItem>
            </EuiFlexGroup>

            {/* Item Details Tooltip on Click */}
            <ItemDetailHoverPane
              item={selectedItem}
              mousePosition={mousePosition}
              onMouseEnter={() => { }}
              onMouseLeave={() => setSelectedItem(null)}
              imageFieldName={imageFieldName}
              highlightPreTags={isSetup1Configured ? highlightPreTags1 : highlightPreTags2}
              highlightPostTags={isSetup1Configured ? highlightPostTags1 : highlightPostTags2}
            />
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageContent>
          <h3 className="text-lg font-semibold mb-2">
            Results for query: <em>{queryText}</em>
          </h3>

          <FieldSelectorDropdown
            displayFields={displayFields}
            displayField={displayField}
            setDisplayField={setDisplayField}
            sizeMultiplier={sizeMultiplier}
            setSizeMultiplier={setSizeMultiplier}
          />

          {/* Summary section with Venn diagram style using CSS classes */}
          <div className="mb-6">{vennDiagram}</div>

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
              <div className="w-2/5 relative">
                <ResultPanel
                  items={result1}
                  resultNum={1}
                  isConfigured={true}
                  setupLabel="Setup 1"
                  imageFieldName={imageFieldName}
                  displayField={displayField}
                  getStatusColor={getStatusColor}
                  handleItemClick={handleItemClick}
                  result1ItemsRef={result1ItemsRef}
                  result2ItemsRef={result2ItemsRef}
                  sizeMultiplier={sizeMultiplier}
                  highlightPreTags={highlightPreTags1}
                  highlightPostTags={highlightPostTags1}
                />
              </div>

              {/* Connection lines */}
              <div className="w-1/5 relative">
                <ConnectionLines
                  mounted={mounted}
                  result1={result1}
                  result2={result2}
                  result1ItemsRef={result1ItemsRef}
                  result2ItemsRef={result2ItemsRef}
                  lineColors={lineColors}
                  sizeMultiplier={sizeMultiplier}
                />
                <div className="w-full h-full flex items-center justify-center">
                  {/* Center area for any additional stats */}
                </div>
              </div>

              {/* Result 2 ranks */}
              <div className="w-2/5 relative">
                <ResultPanel
                  items={result2}
                  resultNum={2}
                  isConfigured={true}
                  setupLabel="Setup 2"
                  imageFieldName={imageFieldName}
                  displayField={displayField}
                  getStatusColor={getStatusColor}
                  handleItemClick={handleItemClick}
                  result1ItemsRef={result1ItemsRef}
                  result2ItemsRef={result2ItemsRef}
                  sizeMultiplier={sizeMultiplier}
                  highlightPreTags={highlightPreTags2}
                  highlightPostTags={highlightPostTags2}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-4 text-sm justify-center">
            {!hideLegend.includes('unchanged') && (
              <div className="flex items-center">
                <div className={`w-4 h-4 ${statusClassName.unchanged} mr-1`} /> Unchanged rank
              </div>
            )}
            {!hideLegend.includes('increased') && (
              <div className="flex items-center">
                <div className={`w-4 h-4 ${statusClassName.increased} mr-1`} /> Increased rank
              </div>
            )}
            {!hideLegend.includes('decreased') && (
              <div className="flex items-center">
                <div className={`w-4 h-4 ${statusClassName.decreased} mr-1`} /> Decreased rank
              </div>
            )}
            {!hideLegend.includes('inResult1') && (
              <div className="flex items-center">
                <div className={`w-4 h-4 ${statusClassName.inResult1} mr-1`} /> Only in{' '}
                {resultText1}
              </div>
            )}
            {!hideLegend.includes('inResult2') && (
              <div className="flex items-center">
                <div className={`w-4 h-4 ${statusClassName.inResult2} mr-1`} /> Only in{' '}
                {resultText2}
              </div>
            )}
          </div>

          {/* Item Details Tooltip on Click */}
          <ItemDetailHoverPane
            item={selectedItem}
            mousePosition={mousePosition}
            onMouseEnter={() => { }}
            onMouseLeave={() => setSelectedItem(null)}
            imageFieldName={imageFieldName}
            highlightPreTags={selectedItem?.resultNum === 1 ? highlightPreTags1 : highlightPreTags2}
            highlightPostTags={selectedItem?.resultNum === 1 ? highlightPostTags1 : highlightPostTags2}
          />
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};

export default VisualComparison;
