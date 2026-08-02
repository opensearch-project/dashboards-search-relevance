/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  EuiBasicTable,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiConfirmModal,
  EuiSwitch,
  EuiPanel,
  EuiTitle,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiFieldNumber,
  EuiButton,
  EuiSpacer,
  EuiComboBox,
  EuiCallOut,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageHeader,
  EuiPageTemplate,
  EuiToolTip,
} from '@elastic/eui';
import moment from 'moment';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';
import { TableListView } from '../../../../../src/plugins/opensearch_dashboards_react/public';

interface AbTestCreateProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  history?: any;
}

interface SearchConfigOption {
  label: string;
  value: string;
}

export const AbTestCreate = ({ http, notifications, history }: AbTestCreateProps) => {
  const [name, setName] = useState('');
  const [size, setSize] = useState(10);
  const [searchConfigs, setSearchConfigs] = useState<SearchConfigOption[]>([]);
  const [selectedConfigA, setSelectedConfigA] = useState<SearchConfigOption[]>([]);
  const [selectedConfigB, setSelectedConfigB] = useState<SearchConfigOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [createdTestId, setCreatedTestId] = useState('');

  useEffect(() => {
    fetchSearchConfigs();
  }, []);

  const fetchSearchConfigs = async () => {
    try {
      const response = await http.get(ServiceEndpoints.SearchConfigurations) as any;
      const configs = response?.hits?.hits || [];
      const options = configs.map((config: any) => ({
        label: config._source?.name || config._id,
        value: config._id,
      }));
      setSearchConfigs(options);
    } catch (error) {
      notifications.toasts.addDanger('Failed to fetch search configurations');
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      notifications.toasts.addWarning('Please enter a test name');
      return;
    }
    if (selectedConfigA.length === 0 || selectedConfigB.length === 0) {
      notifications.toasts.addWarning('Please select both search configurations');
      return;
    }
    if (selectedConfigA[0].value === selectedConfigB[0].value) {
      notifications.toasts.addWarning('Please select different configurations for A and B');
      return;
    }

    setIsLoading(true);
    try {
      const testId = name.trim().replace(/\s+/g, '-').toLowerCase();
      await http.put(`${ServiceEndpoints.AbTests}/${testId}`, {
        body: JSON.stringify({
          name: name.trim(),
          search_configuration_a: selectedConfigA[0].value,
          search_configuration_b: selectedConfigB[0].value,
          size,
        }),
      });
      notifications.toasts.addSuccess(`A/B Test "${name}" created successfully`);
      if (history) {
        history.push('/abTest');
      } else {
        setIsCreated(true);
        setCreatedTestId(testId);
      }
    } catch (error: any) {
      notifications.toasts.addDanger(`Failed to create A/B test: ${error.body?.message || error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <EuiTitle size="l">
        <h1>Create A/B Test</h1>
      </EuiTitle>
      <EuiSpacer size="l" />

      <EuiPanel paddingSize="l">
        <EuiText>
          <p>
            Compare two search configurations using Team Draft Interleaving.
            Results from both configurations are interleaved and served to users,
            allowing you to measure which configuration performs better based on click behavior.
          </p>
        </EuiText>
        <EuiSpacer size="l" />

        {isCreated && (
          <>
            <EuiCallOut title="A/B Test Created" color="success" iconType="check">
              <p>Test ID: <strong>{createdTestId}</strong></p>
              <p>
                Search endpoint: <code>POST /_plugins/_search_relevance/ab_tests/{createdTestId}/_search</code>
              </p>
            </EuiCallOut>
            <EuiSpacer size="l" />
          </>
        )}

        <EuiForm>
          <EuiFormRow label="Test Name" helpText="A unique identifier for this A/B test">
            <EuiFieldText
              placeholder="e.g., bm25-vs-neural"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreated}
            />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <EuiFormRow label="Search Configuration A" helpText="First search strategy">
            <EuiComboBox
              placeholder="Select configuration A"
              options={searchConfigs}
              selectedOptions={selectedConfigA}
              onChange={(selected) => setSelectedConfigA(selected as SearchConfigOption[])}
              singleSelection={{ asPlainText: true }}
              isDisabled={isCreated}
            />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <EuiFormRow label="Search Configuration B" helpText="Second search strategy">
            <EuiComboBox
              placeholder="Select configuration B"
              options={searchConfigs}
              selectedOptions={selectedConfigB}
              onChange={(selected) => setSelectedConfigB(selected as SearchConfigOption[])}
              singleSelection={{ asPlainText: true }}
              isDisabled={isCreated}
            />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <EuiFormRow label="Result Size" helpText="Number of interleaved results per search">
            <EuiFieldNumber
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value, 10) || 10)}
              min={1}
              max={100}
              disabled={isCreated}
            />
          </EuiFormRow>

          <EuiSpacer size="l" />

          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={handleCreate} isLoading={isLoading} disabled={isCreated}>
                Create A/B Test
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiForm>
      </EuiPanel>
    </>
  );
};

interface AbTestListingProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  history: any;
}

interface AbTestItem {
  id: string;
  name: string;
  size: number;
  enabled: boolean;
  testId: string;
  configA: string;
  configB: string;
  createdAt: string;
  updatedAt: string;
}

export const AbTestListing = ({ http, notifications, history }: AbTestListingProps) => {
  const [deleteItem, setDeleteItem] = useState<AbTestItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const findAbTests = useCallback(async (searchTerm?: string) => {
    try {
      const response = await http.post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({
          query1: {
            index: '.plugins-search-relevance-ab-test',
            query: { match_all: {} },
            size: 100,
          },
        }),
      }) as any;
      const hits = response?.result1?.hits?.hits || [];
      let tests = hits
        .filter((hit: any) => hit._source?.doc_type === 'ab_test')
        .map((hit: any) => ({
          id: hit._id,
          test_id: hit._source?.test_id || hit._id,
          name: hit._source?.name || hit._id,
          size: hit._source?.size || 10,
          status: hit._source?.enabled !== false ? 'Active' : 'Disabled',
          timestamp: hit._source?.created_at || '',
        }));
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        tests = tests.filter((t: any) => t.name.toLowerCase().includes(term) || t.test_id.toLowerCase().includes(term));
      }
      return { total: tests.length, hits: tests };
    } catch (err: any) {
      return { total: 0, hits: [] };
    }
  }, [http, refreshKey]);

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await http.delete(`${ServiceEndpoints.AbTests}/${deleteItem.testId}`);
      notifications.toasts.addSuccess(`Deleted "${deleteItem.name}"`);
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      notifications.toasts.addDanger(`Delete failed: ${err.body?.message || err.message}`);
    } finally {
      setDeleteItem(null);
    }
  };

  const tableColumns = [
    {
      field: 'test_id',
      name: 'Test ID',
      dataType: 'string' as const,
      sortable: true,
      render: (testId: string) => (
        <EuiButtonEmpty size="xs" onClick={() => history.push(`/abTest/detail/${testId}`)}>
          {testId}
        </EuiButtonEmpty>
      ),
    },
    { field: 'name', name: 'Name', dataType: 'string' as const, sortable: true },
    { field: 'size', name: 'Size', dataType: 'number' as const, width: '60px' },
    { field: 'status', name: 'Status', dataType: 'string' as const, width: '90px' },
    {
      field: 'timestamp',
      name: 'Timestamp',
      dataType: 'string' as const,
      sortable: true,
      render: (ts: string) => ts ? moment(ts).format('MMM D, YYYY @ HH:mm:ss') : '-',
    },
    {
      field: 'id',
      name: 'Actions',
      width: '100px',
      render: (id: string, item: any) => (
        <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiToolTip content="Update">
              <EuiButtonIcon
                iconType="pencil"
                aria-label="Update"
                onClick={() => history.push(`/abTest/update/${item.test_id}`)}
              />
            </EuiToolTip>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiToolTip content="Delete">
              <EuiButtonIcon
                iconType="trash"
                color="danger"
                aria-label="Delete"
                onClick={() => setDeleteItem({ ...item, testId: item.test_id })}
              />
            </EuiToolTip>
          </EuiFlexItem>
        </EuiFlexGroup>
      ),
    },
  ];

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="A/B Tests"
        description="View and manage your A/B tests. Click on a Test ID to view details and version history."
        rightSideItems={[
          <EuiButton
            onClick={() => history.push('/abTest/create')}
            fill
            size="s"
            iconType="plus"
          >
            Create A/B Test
          </EuiButton>,
        ]}
      />
      <EuiFlexItem>
        <TableListView
          key={refreshKey}
          headingId="abTestListingHeading"
          entityName="A/B Test"
          entityNamePlural="A/B Tests"
          tableColumns={tableColumns}
          findItems={findAbTests}
          loading={false}
          initialPageSize={10}
          search={{
            box: {
              incremental: true,
              placeholder: 'Search A/B tests...',
              schema: true,
            },
          }}
          sorting={{
            sort: {
              field: 'timestamp',
              direction: 'desc',
            },
          }}
        />
      </EuiFlexItem>
      {deleteItem && (
        <EuiConfirmModal
          title={`Delete "${deleteItem.name}"?`}
          onCancel={() => setDeleteItem(null)}
          onConfirm={handleDelete}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
        >
          <p>This will permanently delete this A/B test.</p>
        </EuiConfirmModal>
      )}
    </EuiPageTemplate>
  );
};

// Detail/Update page
interface AbTestViewProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  testId: string;
  history?: any;
}

export const AbTestView = ({ http, notifications, testId, history }: AbTestViewProps) => {
  const [test, setTest] = useState<AbTestItem | null>(null);
  const [searchConfigs, setSearchConfigs] = useState<SearchConfigOption[]>([]);
  const [selectedConfigA, setSelectedConfigA] = useState<SearchConfigOption[]>([]);
  const [selectedConfigB, setSelectedConfigB] = useState<SearchConfigOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSearchConfigs();
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (test && searchConfigs.length > 0) {
      const configA = searchConfigs.find((c) => c.value === test.configA);
      const configB = searchConfigs.find((c) => c.value === test.configB);
      if (configA) setSelectedConfigA([configA]);
      if (configB) setSelectedConfigB([configB]);
    }
  }, [test, searchConfigs]);

  const fetchTest = async () => {
    setIsLoading(true);
    try {
      const response = await http.post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({
          query1: {
            index: '.plugins-search-relevance-ab-test',
            query: { ids: { values: [testId] } },
            size: 1,
          },
        }),
      }) as any;
      const hits = response?.result1?.hits?.hits || [];
      if (hits.length > 0) {
        const hit = hits[0];
        const t: AbTestItem = {
          id: hit._id,
          name: hit._source?.name || hit._id,
          size: hit._source?.size || 10,
          enabled: hit._source?.enabled !== false,
          testId: hit._source?.test_id || hit._id,
          configA: hit._source?.search_configuration_a || '',
          configB: hit._source?.search_configuration_b || '',
          createdAt: hit._source?.created_at || '',
          updatedAt: hit._source?.updated_at || '',
        };
        setTest(t);
      }
    } catch (err: any) {
      notifications.toasts.addDanger('Failed to load A/B test');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchConfigs = async () => {
    try {
      const response = await http.get(ServiceEndpoints.SearchConfigurations) as any;
      const configs = response?.hits?.hits || [];
      const seen = new Set();
      const options = configs
        .map((c: any) => ({
          label: c._source?.name || c._id,
          value: c._id,
        }))
        .filter((o: SearchConfigOption) => {
          if (seen.has(o.value)) return false;
          seen.add(o.value);
          return true;
        });
      setSearchConfigs(options);
    } catch (err) {}
  };

  const handleToggle = async () => {
    if (!test) return;
    setIsSaving(true);
    try {
      await http.put(`${ServiceEndpoints.AbTests}/${test.testId}/_update`, {
        body: JSON.stringify({ enabled: !test.enabled }),
      });
      notifications.toasts.addSuccess(`Interleaving ${!test.enabled ? 'enabled' : 'disabled'}`);
      setTest({ ...test, enabled: !test.enabled });
    } catch (err: any) {
      notifications.toasts.addDanger(`Update failed: ${err.body?.message || err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateConfigs = async () => {
    if (!test) return;
    const body: any = {};
    if (selectedConfigA.length > 0 && selectedConfigA[0].value !== test.configA) {
      body.search_configuration_a = selectedConfigA[0].value;
    }
    if (selectedConfigB.length > 0 && selectedConfigB[0].value !== test.configB) {
      body.search_configuration_b = selectedConfigB[0].value;
    }
    if (Object.keys(body).length === 0) {
      notifications.toasts.addWarning('No changes to save');
      return;
    }
    setIsSaving(true);
    try {
      await http.put(`${ServiceEndpoints.AbTests}/${test.testId}/_update`, {
        body: JSON.stringify(body),
      });
      notifications.toasts.addSuccess('Configurations updated');
      if (history) {
        history.push('/abTest');
      } else {
        setTest({ ...test, ...body });
      }
    } catch (err: any) {
      notifications.toasts.addDanger(`Update failed: ${err.body?.message || err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!test) return <p>A/B test not found.</p>;

  return (
    <>
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem>
          <EuiTitle size="l"><h1>{test.name}</h1></EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => history && history.push('/abTest/search')}>
            Search
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiPanel paddingSize="l">
        <EuiText size="s">
          <p><strong>Test ID:</strong> {test.testId}</p>
          <p><strong>Search Endpoint:</strong> <code>POST /_plugins/_search_relevance/ab_tests/{test.testId}/_search</code></p>
          <p><strong>Size:</strong> {test.size}</p>
        </EuiText>
        <EuiSpacer size="l" />

        <EuiFormRow label="Interleaving" helpText="When disabled, only Config A results are returned">
          <EuiSwitch
            label={test.enabled ? 'Active' : 'Disabled'}
            checked={test.enabled}
            onChange={handleToggle}
            disabled={isSaving}
          />
        </EuiFormRow>

        <EuiSpacer size="l" />
        <EuiTitle size="s"><h3>Update Search Configurations</h3></EuiTitle>
        <EuiSpacer size="m" />

        <EuiFormRow label="Search Configuration A" helpText={selectedConfigA.length > 0 ? `Config ID: ${selectedConfigA[0].value}` : 'Select a configuration'}>
          <EuiComboBox
            placeholder="Select configuration A"
            options={searchConfigs}
            selectedOptions={selectedConfigA}
            onChange={(selected) => setSelectedConfigA(selected as SearchConfigOption[])}
            singleSelection={{ asPlainText: true }}
          />
        </EuiFormRow>
        <EuiSpacer size="m" />
        <EuiFormRow label="Search Configuration B" helpText={selectedConfigB.length > 0 ? `Config ID: ${selectedConfigB[0].value}` : 'Select a configuration'}>
          <EuiComboBox
            placeholder="Select configuration B"
            options={searchConfigs}
            selectedOptions={selectedConfigB}
            onChange={(selected) => setSelectedConfigB(selected as SearchConfigOption[])}
            singleSelection={{ asPlainText: true }}
          />
        </EuiFormRow>
        <EuiSpacer size="l" />
        <EuiButton onClick={handleUpdateConfigs} isLoading={isSaving}>
          Save Configuration Changes
        </EuiButton>
      </EuiPanel>
    </>
  );
};

// Search page
interface AbTestSearchProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  history?: any;
}

export const AbTestSearch = ({ http, notifications, history }: AbTestSearchProps) => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [testOptions, setTestOptions] = useState<SearchConfigOption[]>([]);
  const [selectedTest, setSelectedTest] = useState<SearchConfigOption[]>([]);
  const [ubiIndexName, setUbiIndexName] = useState(() => localStorage.getItem('ubi_index_name') || 'ubi_events');
  const [ubiIndexOptions, setUbiIndexOptions] = useState<SearchConfigOption[]>([]);
  const [selectedUbiIndex, setSelectedUbiIndex] = useState<SearchConfigOption[]>(() => {
    const saved = localStorage.getItem('ubi_index_name') || 'ubi_events';
    return [{ label: saved, value: saved }];
  });
  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');
  const [configAName, setConfigAName] = useState('');
  const [configBName, setConfigBName] = useState('');

  useEffect(() => {
    fetchTests();
    fetchUbiIndices();
  }, []);

  useEffect(() => {
    if (selectedTest.length > 0) {
      fetchTestConfigs(selectedTest[0].value);
    } else {
      setQueryA(''); setQueryB(''); setConfigAName(''); setConfigBName('');
    }
  }, [selectedTest]);

  const fetchUbiIndices = async () => {
    try {
      const response = await http.get(ServiceEndpoints.GetIndexes) as any;
      const indices = (response || [])
        .map((item: any) => typeof item === 'string' ? item : item.index)
        .filter((idx: string) => idx && idx.toLowerCase().includes('ubi'))
        .map((idx: string) => ({ label: idx, value: idx }));
      setUbiIndexOptions(indices);
    } catch (err) {}
  };

  const fetchTests = async () => {
    try {
      const response = await http.post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({
          query1: {
            index: '.plugins-search-relevance-ab-test',
            query: { match_all: {} },
            size: 100,
          },
        }),
      }) as any;
      const hits = response?.result1?.hits?.hits || [];
      const tests = hits
        .filter((hit: any) => hit._source?.doc_type === 'ab_test')
        .map((hit: any) => ({
          label: hit._source?.name || hit._id,
          value: hit._source?.test_id || hit._id,
        }));
      setTestOptions(tests);
    } catch (err) {}
  };

  const fetchTestConfigs = async (testId: string) => {
    try {
      const testResponse = await http.post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({
          query1: { index: '.plugins-search-relevance-ab-test', query: { ids: { values: [testId] } }, size: 1 },
        }),
      }) as any;
      const testHits = testResponse?.result1?.hits?.hits || [];
      if (testHits.length === 0) return;
      const testSource = testHits[0]._source;
      const configAId = testSource?.search_configuration_a;
      const configBId = testSource?.search_configuration_b;

      const configResponse = await http.get(ServiceEndpoints.SearchConfigurations) as any;
      const configs = configResponse?.hits?.hits || [];
      const configA = configs.find((c: any) => c._id === configAId);
      const configB = configs.find((c: any) => c._id === configBId);

      setQueryA(configA?._source?.query || '');
      setQueryB(configB?._source?.query || '');
      setConfigAName(configA?._source?.name || configAId || '');
      setConfigBName(configB?._source?.name || configBId || '');
    } catch (err) {}
  };

  const getDisplayQuery = (query: string) => {
    if (!query) return '';
    try {
      const replaced = query.replace(/%SearchText%/g, searchText || '%SearchText%');
      return JSON.stringify(JSON.parse(replaced), null, 2);
    } catch {
      return query.replace(/%SearchText%/g, searchText || '%SearchText%');
    }
  };

  const handleSearch = async () => {
    if (selectedTest.length === 0) {
      notifications.toasts.addWarning('Please select an A/B test');
      return;
    }
    if (!searchText.trim()) {
      notifications.toasts.addWarning('Please enter a search query');
      return;
    }
    setIsSearching(true);
    try {
      const testId = selectedTest[0].value;
      const response = await http.post(`${ServiceEndpoints.AbTests}/${testId}/_search`, {
        body: JSON.stringify({ query_params: { SearchText: searchText.trim() } }),
      }) as any;
      setResults(response?.hits || []);
    } catch (err: any) {
      notifications.toasts.addDanger(`Search failed: ${err.body?.message || err.message}`);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButton iconType="arrowLeft" onClick={() => history && history.push('/abTest')}>
            Back
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiTitle size="l"><h1>A/B Test Search</h1></EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />

      <EuiPanel paddingSize="l">
        <EuiFormRow label="Select A/B Test">
          <EuiComboBox
            placeholder="Choose a test"
            options={testOptions}
            selectedOptions={selectedTest}
            onChange={(selected) => setSelectedTest(selected as SearchConfigOption[])}
            singleSelection={{ asPlainText: true }}
          />
        </EuiFormRow>
        <EuiSpacer size="m" />
        <EuiFormRow label="Search Query" helpText="Type your query — it replaces %SearchText% in both configs below">
          <EuiFieldText
            placeholder="e.g., comedy, superhero, spy..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            fullWidth
          />
        </EuiFormRow>
        <EuiSpacer size="m" />
        <EuiFormRow label="UBI Click Index" helpText="Clicks will be registered to this index">
          <EuiComboBox
            placeholder="Select UBI index"
            options={ubiIndexOptions}
            selectedOptions={selectedUbiIndex}
            onChange={(selected) => {
              setSelectedUbiIndex(selected as SearchConfigOption[]);
              if (selected.length > 0) {
                setUbiIndexName((selected[0] as SearchConfigOption).value);
                localStorage.setItem('ubi_index_name', (selected[0] as SearchConfigOption).value);
              }
            }}
            singleSelection={{ asPlainText: true }}
          />
        </EuiFormRow>
        <EuiSpacer size="m" />
        <EuiButton fill onClick={handleSearch} isLoading={isSearching}>
          Search
        </EuiButton>
      </EuiPanel>

      {(queryA || queryB) && (
        <>
          <EuiSpacer size="l" />
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiPanel paddingSize="m">
                <EuiTitle size="xs"><h4>Config A: {configAName}</h4></EuiTitle>
                <EuiSpacer size="s" />
                <textarea
                  readOnly
                  style={{ width: '100%', height: '150px', fontFamily: 'monospace', fontSize: '12px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
                  value={getDisplayQuery(queryA)}
                />
              </EuiPanel>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiPanel paddingSize="m">
                <EuiTitle size="xs"><h4>Config B: {configBName}</h4></EuiTitle>
                <EuiSpacer size="s" />
                <textarea
                  readOnly
                  style={{ width: '100%', height: '150px', fontFamily: 'monospace', fontSize: '12px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
                  value={getDisplayQuery(queryB)}
                />
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      )}

      <EuiSpacer size="l" />

      {results.length > 0 && (
        <EuiPanel paddingSize="l">
          <EuiTitle size="s"><h3>Search Results ({results.length})</h3></EuiTitle>
          <EuiSpacer size="m" />
          {results.map((hit: any, idx: number) => (
            <div key={idx} style={{ marginBottom: '12px', padding: '10px', borderBottom: '1px solid #eee' }}>
              <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
                <EuiFlexItem>
                  <EuiText size="s">
                    <strong>#{idx + 1}</strong>{' '}
                    {hit._source?.title || hit._source?.product_title || hit._source?.name || hit._id}
                  </EuiText>
                  <EuiText size="xs" color="subdued">
                    {hit._source?.description || hit._source?.product_description || ''}
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="xs" color="subdued">
                    Config: {hit._search_configuration_id || 'N/A'}
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    size="s"
                    onClick={async () => {
                      try {
                        const testId = selectedTest[0]?.value || '';
                        await http.post(`${ServiceEndpoints.AbTests}/register_click`, {
                          body: JSON.stringify({
                            test_id: testId,
                            search_configuration_uuid: hit._search_configuration_id || '',
                            doc_id: hit._id || '',
                            title: hit._source?.title || hit._source?.product_title || '',
                            position: idx + 1,
                            ubi_index: ubiIndexName,
                          }),
                        });
                        // Short-lived so rapid clicks do not stack toasts over the result list.
                        notifications.toasts.addSuccess('Click registered', {
                          toastLifeTimeMs: 1500,
                        });
                      } catch (err: any) {
                        notifications.toasts.addDanger(`Click failed: ${err.body?.message || err.message}`);
                      }
                    }}
                  >
                    Click
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>
          ))}
        </EuiPanel>
      )}
    </>
  );
};

// Results page
interface AbTestResultsProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
}

// The per-request UUIDs each configuration's hits are tagged with. Needed to
// tell A from B: the clicks aggregation is a `terms` agg, so its buckets come
// back ordered by doc_count, NOT in A-then-B order.
interface AbTestOption extends SearchConfigOption {
  configAUuid?: string;
  configBUuid?: string;
}

interface ConfigResult {
  key: string;
  doc_count: number;
  label: 'A' | 'B';
}

export const AbTestResults = ({ http, notifications }: AbTestResultsProps) => {
  const [testOptions, setTestOptions] = useState<AbTestOption[]>([]);
  const [selectedTest, setSelectedTest] = useState<AbTestOption[]>([]);
  const [indexOptions, setIndexOptions] = useState<SearchConfigOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<SearchConfigOption[]>([]);
  // Always ordered [A, B] — never by click count. See fetchResults.
  const [results, setResults] = useState<ConfigResult[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTests();
    fetchIndices();
  }, []);

  const fetchIndices = async () => {
    try {
      const response = await http.get(ServiceEndpoints.GetIndexes) as any;
      const indices = (response || [])
        .map((item: any) => typeof item === 'string' ? item : item.index)
        .filter((idx: string) => idx && idx.toLowerCase().includes('ubi'))
        .map((idx: string) => ({ label: idx, value: idx }));
      setIndexOptions(indices);
    } catch (err) {}
  };

  const fetchTests = async () => {
    try {
      const response = await http.post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({
          query1: {
            index: '.plugins-search-relevance-ab-test',
            query: { match_all: {} },
            size: 100,
          },
        }),
      }) as any;
      const hits = response?.result1?.hits?.hits || [];
      const tests = hits
        .filter((hit: any) => hit._source?.doc_type === 'ab_test')
        .map((hit: any) => ({
          label: hit._source?.name || hit._id,
          value: hit._source?.test_id || hit._id,
          configAUuid: hit._source?.config_a_uuid,
          configBUuid: hit._source?.config_b_uuid,
        }));
      setTestOptions(tests);
    } catch (err) {}
  };

  const fetchResults = async () => {
    if (selectedTest.length === 0) {
      notifications.toasts.addWarning('Please select an A/B test');
      return;
    }
    if (selectedIndex.length === 0) {
      notifications.toasts.addWarning('Please select a UBI click index');
      return;
    }
    setIsLoading(true);
    try {
      const testId = selectedTest[0].value;
      const response = await http.post(`${ServiceEndpoints.AbTests}/results`, {
        body: JSON.stringify({
          index: selectedIndex[0].value,
          test_id: testId,
        }),
      }) as any;
      const aggs = response?.aggregations?.clicks_per_config?.buckets || [];
      const total = aggs.reduce((sum: number, b: any) => sum + b.doc_count, 0);

      // A `terms` agg orders buckets by doc_count, so bucket[0] is simply
      // whichever configuration got more clicks -- not configuration A. Look the
      // uuids up instead, and keep a zero-click configuration in the list so it
      // still renders (and so a lone bucket isn't mistaken for a tie).
      const { configAUuid, configBUuid } = selectedTest[0];
      const countFor = (uuid?: string) =>
        aggs.find((b: any) => b.key === uuid)?.doc_count ?? 0;
      const ordered: ConfigResult[] =
        configAUuid && configBUuid
          ? [
              { key: configAUuid, doc_count: countFor(configAUuid), label: 'A' },
              { key: configBUuid, doc_count: countFor(configBUuid), label: 'B' },
            ]
          : aggs.map((b: any, i: number) => ({ ...b, label: i === 0 ? 'A' : 'B' }));

      setResults(ordered);
      setTotalClicks(total);
    } catch (err: any) {
      notifications.toasts.addDanger(`Failed to fetch results: ${err.body?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePValue = () => {
    if (results.length < 2) return null;
    const n1 = results[0].doc_count;   // configuration A
    const n2 = results[1].doc_count;   // configuration B
    const n = n1 + n2;
    if (n === 0) return null;
    const p = 0.5;
    const expected = n * p;
    const stdDev = Math.sqrt(n * p * (1 - p));
    // Signed: positive means A drew more clicks, negative means B did.
    const zScore = (n1 - expected) / stdDev;
    const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
    const winner = n1 === n2 ? null : n1 > n2 ? 'A' : 'B';
    return { zScore, pValue, winner, significant: pValue < 0.05 && winner !== null };
  };

  const normalCDF = (x: number) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989422804 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  };

  const stats = calculatePValue();

  return (
    <>
      <EuiTitle size="l"><h1>A/B Test Results</h1></EuiTitle>
      <EuiSpacer size="l" />

      <EuiPanel paddingSize="l">
        <EuiFormRow label="Select A/B Test">
          <EuiComboBox
            placeholder="Choose a test"
            options={testOptions}
            selectedOptions={selectedTest}
            onChange={(selected) => setSelectedTest(selected as SearchConfigOption[])}
            singleSelection={{ asPlainText: true }}
          />
        </EuiFormRow>
        <EuiSpacer size="m" />
        <EuiFormRow label="UBI Click Index" helpText="Select the index where click events are stored">
          <EuiComboBox
            placeholder="Select an index"
            options={indexOptions}
            selectedOptions={selectedIndex}
            onChange={(selected) => setSelectedIndex(selected as SearchConfigOption[])}
            singleSelection={{ asPlainText: true }}
          />
        </EuiFormRow>
        <EuiSpacer size="m" />
        <EuiButton fill onClick={fetchResults} isLoading={isLoading}>
          Get Results
        </EuiButton>
      </EuiPanel>

      <EuiSpacer size="l" />

      {results.length > 0 && (
        <EuiPanel paddingSize="l">
          <EuiTitle size="s"><h3>Click Distribution (Total: {totalClicks})</h3></EuiTitle>
          <EuiSpacer size="m" />
          {results.map((bucket, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <EuiFlexGroup alignItems="center">
                <EuiFlexItem grow={false} style={{ width: '200px' }}>
                  <EuiText size="s"><strong>Config {bucket.label}</strong></EuiText>
                  <EuiText size="xs" color="subdued">{bucket.key.substring(0, 8)}...</EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <div style={{ background: bucket.label === 'A' ? '#006BB4' : '#BD271E', height: '24px', width: `${totalClicks ? (bucket.doc_count / totalClicks) * 100 : 0}%`, borderRadius: '4px' }} />
                </EuiFlexItem>
                <EuiFlexItem grow={false} style={{ width: '100px' }}>
                  <EuiText size="s"><strong>{bucket.doc_count}</strong> ({totalClicks ? ((bucket.doc_count / totalClicks) * 100).toFixed(1) : '0.0'}%)</EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>
          ))}

          {stats && (
            <>
              <EuiSpacer size="l" />
              <EuiPanel paddingSize="m" color={stats.significant ? 'success' : 'subdued'}>
                <EuiTitle size="xs"><h4>Statistical Significance</h4></EuiTitle>
                <EuiSpacer size="s" />
                <EuiText size="s">
                  <p><strong>P-Value:</strong> {stats.pValue.toFixed(4)}</p>
                  <p><strong>Result:</strong> {stats.significant
                    ? `Statistically significant (p < 0.05) — Config ${stats.winner} is the winner`
                    : 'Not statistically significant — need more data'}</p>
                </EuiText>
              </EuiPanel>
            </>
          )}
        </EuiPanel>
      )}
    </>
  );
};

// Detail page (read-only view of test config)
interface AbTestDetailProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  testId: string;
  history?: any;
}

export const AbTestDetail = ({ http, notifications, testId, history }: AbTestDetailProps) => {
  const [test, setTest] = useState<AbTestItem | null>(null);
  const [configAName, setConfigAName] = useState('');
  const [configBName, setConfigBName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    setIsLoading(true);
    try {
      const response = await http.post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({
          query1: {
            index: '.plugins-search-relevance-ab-test',
            query: { ids: { values: [testId] } },
            size: 1,
          },
        }),
      }) as any;
      const hits = response?.result1?.hits?.hits || [];
      if (hits.length > 0) {
        const hit = hits[0];
        const t: AbTestItem = {
          id: hit._id,
          name: hit._source?.name || hit._id,
          size: hit._source?.size || 10,
          enabled: hit._source?.enabled !== false,
          testId: hit._source?.test_id || hit._id,
          configA: hit._source?.search_configuration_a || '',
          configB: hit._source?.search_configuration_b || '',
          createdAt: hit._source?.created_at || '',
          updatedAt: hit._source?.updated_at || '',
        };
        setTest(t);
        fetchConfigName(t.configA, setConfigAName);
        fetchConfigName(t.configB, setConfigBName);
      }
    } catch (err: any) {
      notifications.toasts.addDanger('Failed to load A/B test');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfigName = async (configId: string, setter: (name: string) => void) => {
    if (!configId) { setter('-'); return; }
    try {
      const response = await http.post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({
          query1: {
            index: 'search-relevance-search-config',
            query: { ids: { values: [configId] } },
            size: 1,
          },
        }),
      }) as any;
      const hits = response?.result1?.hits?.hits || [];
      if (hits.length > 0) {
        setter(hits[0]._source?.name || configId);
      } else {
        setter(configId);
      }
    } catch (err) {
      setter(configId);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!test) return <p>A/B test not found.</p>;

  return (
    <>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButton iconType="arrowLeft" onClick={() => history && history.push('/abTest')}>
            Back
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiTitle size="l"><h1>{test.name || test.testId}</h1></EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />

      <EuiPanel paddingSize="l">
        <EuiTitle size="s"><h3>Test Details</h3></EuiTitle>
        <EuiSpacer size="m" />
        <EuiText size="s">
          <p><strong>Test ID:</strong> {test.testId}</p>
          <p><strong>Status:</strong> {test.enabled ? 'Active (Interleaving ON)' : 'Disabled (Interleaving OFF)'}</p>
          <p><strong>Result Size:</strong> {test.size}</p>
          <p><strong>Created:</strong> {test.createdAt ? new Date(test.createdAt).toLocaleString() : '-'}</p>
          <p><strong>Updated:</strong> {test.updatedAt ? new Date(test.updatedAt).toLocaleString() : '-'}</p>
        </EuiText>

        <EuiSpacer size="l" />
        <EuiTitle size="s"><h3>Search Configurations</h3></EuiTitle>
        <EuiSpacer size="m" />
        <EuiText size="s">
          <p><strong>Configuration A:</strong> {configAName}</p>
          <p><code>{test.configA}</code></p>
          <EuiSpacer size="s" />
          <p><strong>Configuration B:</strong> {configBName}</p>
          <p><code>{test.configB}</code></p>
        </EuiText>

        <EuiSpacer size="l" />
        <EuiTitle size="s"><h3>Search Endpoint</h3></EuiTitle>
        <EuiSpacer size="s" />
        <EuiText size="s">
          <code>POST /_plugins/_search_relevance/ab_tests/{test.testId}/_search</code>
        </EuiText>
      </EuiPanel>

      <EuiSpacer size="l" />
      <VersionHistory http={http} testId={testId} />
    </>
  );
};

// Version History component
const VersionHistory = ({ http, testId }: { http: CoreStart['http']; testId: string }) => {
  const [snapshots, setSnapshots] = useState<any[]>([]);

  useEffect(() => {
    fetchSnapshots();
  }, [testId]);

  const fetchSnapshots = async () => {
    try {
      const response = await http.post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({
          query1: {
            index: '.plugins-search-relevance-ab-test',
            query: { bool: { must: [{ term: { 'test_id': testId } }, { term: { 'doc_type': 'snapshot' } }] } },
            size: 50,
          },
        }),
      }) as any;
      const hits = response?.result1?.hits?.hits || [];
      setSnapshots(hits.map((h: any) => ({
        id: h._id,
        // The backend stores `created` at the top level of the snapshot, not inside `record`.
        created: h._source?.created || '',
        configA: h._source?.record?.search_configuration_a || '',
        configB: h._source?.record?.search_configuration_b || '',
        enabled: h._source?.record?.enabled,
      })));
    } catch (err) {}
  };

  if (snapshots.length === 0) return null;

  return (
    <EuiPanel paddingSize="l">
      <EuiTitle size="s"><h3>Version History</h3></EuiTitle>
      <EuiSpacer size="m" />
      <EuiBasicTable
        items={snapshots}
        columns={[
          { field: 'id', name: 'Version' },
          { field: 'created', name: 'Timestamp', render: (ts: string) => ts ? new Date(ts).toLocaleString() : '-' },
          { field: 'configA', name: 'Config A', render: (v: string) => v ? v.substring(0, 8) + '...' : '-' },
          { field: 'configB', name: 'Config B', render: (v: string) => v ? v.substring(0, 8) + '...' : '-' },
          { field: 'enabled', name: 'Enabled', render: (v: boolean) => v === undefined ? '-' : v ? 'Yes' : 'No' },
        ]}
      />
    </EuiPanel>
  );
};

// UBI Config page
interface AbTestUbiConfigProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
}

export const AbTestUbiConfig = ({ http, notifications }: AbTestUbiConfigProps) => {
  const [indexName, setIndexName] = useState(() => localStorage.getItem('ubi_index_name') || 'ubi_events');
  const [indexExists, setIndexExists] = useState<boolean | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkIndex = async () => {
    if (!indexName.trim()) {
      notifications.toasts.addWarning('Please enter an index name');
      return;
    }
    setIsChecking(true);
    try {
      const response = await http.post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({
          query1: {
            index: indexName.trim(),
            query: { match_all: {} },
            size: 0,
          },
        }),
      }) as any;
      setIndexExists(true);
      notifications.toasts.addSuccess(`Index "${indexName}" exists`);
    } catch (err) {
      setIndexExists(false);
    }
    setIsChecking(false);
  };

  const createIndex = async () => {
    if (!indexName.trim()) {
      notifications.toasts.addWarning('Please enter an index name');
      return;
    }
    setIsCreating(true);
    try {
      let mapping;
      try { mapping = JSON.parse(mappingJson); } catch (e) { mapping = undefined; }
      await http.put(`${ServiceEndpoints.AbTests}/ubi_index`, {
        body: JSON.stringify({ index: indexName.trim(), mapping }),
      });
      notifications.toasts.addSuccess(`Index "${indexName}" created successfully`);
      setIndexExists(true);
    } catch (err: any) {
      const msg = err.body?.message || err.message || '';
      if (msg.includes('already_exists')) {
        notifications.toasts.addSuccess(`Index "${indexName}" already exists`);
        setIndexExists(true);
      } else {
        notifications.toasts.addDanger(`Failed to create index: ${msg}`);
      }
    }
    setIsCreating(false);
  };

  const defaultMapping = JSON.stringify({
    mappings: {
      properties: {
        action_name: { type: 'keyword' },
        timestamp: { type: 'date' },
        event_attributes: {
          properties: {
            object: {
              properties: {
                id: { type: 'keyword' },
                search_configuration_uuid: { type: 'keyword' },
              },
            },
            position: {
              properties: {
                ordinal: { type: 'integer' },
              },
            },
            ab_test_id: { type: 'keyword' },
          },
        },
      },
    },
  }, null, 2);
  const [mappingJson, setMappingJson] = useState(defaultMapping);

  return (
    <>
      <EuiTitle size="l"><h1>UBI Click Index Configuration</h1></EuiTitle>
      <EuiSpacer size="l" />

      <EuiPanel paddingSize="l">
        <EuiText>
          <p>
            Configure the UBI (User Behavior Insights) index where click events will be stored.
            This index tracks which search results users click on, allowing you to measure
            which search configuration performs better.
          </p>
        </EuiText>
        <EuiSpacer size="l" />

        <EuiFormRow label="UBI Click Index Name" helpText="Default: ubi_events. Change only if you want a custom index. Used by Search and Results pages.">
          <EuiFieldText
            value={indexName}
            onChange={(e) => { setIndexName(e.target.value); setIndexExists(null); localStorage.setItem('ubi_index_name', e.target.value); }}
            placeholder="e.g., ubi_events (default)"
          />
        </EuiFormRow>
        <EuiSpacer size="m" />

        <EuiFlexGroup gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiButton onClick={checkIndex} isLoading={isChecking}>
              Check Index
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={createIndex} isLoading={isCreating}>
              Create Index
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        {indexExists !== null && (
          <>
            <EuiSpacer size="m" />
            <EuiCallOut
              title={indexExists ? 'Index exists and is ready' : 'Index does not exist — click "Create Index" to create it'}
              color={indexExists ? 'success' : 'warning'}
              iconType={indexExists ? 'check' : 'alert'}
            />
          </>
        )}

        <EuiSpacer size="l" />
        <EuiTitle size="s"><h3>Index Mapping</h3></EuiTitle>
        <EuiSpacer size="s" />
        <EuiText size="xs"><p>Edit the mapping below if needed. Required fields: <code>search_configuration_uuid</code> (keyword) and <code>ab_test_id</code> (keyword).</p></EuiText>
        <EuiSpacer size="s" />
        <textarea
          style={{ width: '100%', height: '250px', fontFamily: 'monospace', fontSize: '12px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          value={mappingJson}
          onChange={(e) => setMappingJson(e.target.value)}
        />
      </EuiPanel>
    </>
  );
};
