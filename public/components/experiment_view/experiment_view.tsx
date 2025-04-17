/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    EuiButton,
    EuiButtonEmpty,
    EuiButtonIcon,
    EuiCallOut,
    EuiFlexGroup,
    EuiFlexItem,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiPageHeader,
    EuiPageTemplate,
    EuiPanel,
    EuiText,
  } from '@elastic/eui';
import {
    TableListView,
} from '../../../../../src/plugins/opensearch_dashboards_react/public';  
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';
import VisualComparison from '../query_compare/search_result/visual_comparison/visual_comparison';

interface ExperimentViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const ExperimentView: React.FC<ExperimentViewProps> = ({ http, id }) => {
  const [experiment, setExperiment] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<number | null>(null);

  // Detailed experiment details
  const [queries, setQueries] = useState<any[]>([]);
  const [queryEntries, setQueryEntries] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [metricMeans, setMetricMeans] = useState<any>({});
  const [tableColumns, setTableColumns] = useState<any[]>([]);

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        setLoading(true);
        const response = await http.get(ServiceEndpoints.Experiments);
        const list = response ? response.hits.hits.map((hit: any) => ({ ...hit._source })) : [];
        const filteredList = list.filter((item) => item.id === id);

        if (filteredList.length > 0) {
          setExperiment(filteredList[0]);
        } else {
          setError('No matching experiment found');
        }
      } catch (err) {
        setError('Error loading experiment data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiment();
  }, [http, id]);

  function extractMetricNames(obj: any): string[] {
    const metrics = obj.results?.metrics;
    if (metrics) {
      const key0 = Object.keys(metrics)[0]
      const queryMetrics = metrics[key0]
      if (queryMetrics.pairwiseComparison) {
        return Object.keys(queryMetrics.pairwiseComparison)
      }
    }
    return [];
  }

  useEffect(() => {
    if (experiment) {
      setQueries(experiment.results.queryTexts)
      const metricNames = extractMetricNames(experiment)
      let _metrics = {}
      let _metricMeans = {}
      let _queryEntries = experiment.results.queryTexts.map(t => ({queryText: t, queryResults: {}, metrics: {}}))
      metricNames.forEach(metricName => {
        const vals = experiment.results.queryTexts.map(q => experiment.results.metrics[q].pairwiseComparison[metricName])
        vals.forEach((val, i) => {
          _queryEntries[i].metrics[metricName] = val
        })
        _metricMeans[metricName] = vals.reduce((a, b) => a + b, 0) / vals.length
      })
      // Store query results
      experiment.results.queryTexts.forEach((queryText, i) => {
        ["0", "1"].forEach(queryName => {
          const queryResults = experiment.results.metrics[queryText][queryName]
          _queryEntries[i].queryResults[queryName] = queryResults
          _queryEntries[i]["index"] = i
        })
      })

      const cheatColNames = {
        rbo90: "RBO",
        jaccard: "Jaccard",
      }

      let columns = [
        {
            field: 'queryText',
            name: 'Query',
            dataType: 'string',
            sortable: true,
            render: (
                name: string,
                queryEntry: {
                    index: number;
                },
            ) => (
                <>
                    <EuiButtonEmpty
                    size="xs"
                    onClick={() => setSelectedQuery(queryEntry.index)}
                    >
                    {name}
                    </EuiButtonEmpty>
                </>
            ),
            
        },
      ]
      Object.keys(_metricMeans).forEach(metricName => {
        if (cheatColNames[metricName]) {
          columns.push({
            field: 'metrics.' + metricName,
            name: cheatColNames[metricName],
            dataType: 'number',
            sortable: true,
          })
        }
      })

      console.log(_queryEntries)
      
      setQueryEntries(_queryEntries)
      setMetrics(_metrics);
      setMetricMeans(_metricMeans);
      setTableColumns(columns)
    }
  }, [experiment])

  const findQueries = async (search: any) => {
    const filteredQueryEntries = search ? queryEntries.filter(q => q.queryText.includes(search)) : queryEntries
    return {hits: filteredQueryEntries, total: filteredQueryEntries.length}
  }

  const processResults = (idArray) => {
    return idArray.map((id, i) => (
      {
        _id: id,
        _score: 0,
        rank: i + 1,
      }
    ))
  }

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="90%">
      <EuiPageHeader
        pageTitle="Experiment Visualization"
      />

      <EuiPanel hasBorder paddingSize="l">
        <EuiFlexGroup direction="column" gutterSize="m">

          <EuiFlexItem>
            {error ? (
              <EuiCallOut title="Error" color="danger">
                <p>{error}</p>
              </EuiCallOut>
            ) : (
              <TableListView
                entityName="Query"
                entityNamePlural="Queries"
                tableColumns={tableColumns}
                findItems={findQueries}
                loading={loading}
                pagination={{
                  initialPageSize: 10,
                  pageSizeOptions: [5, 10, 20, 50],
                }}
                search={{
                  box: {
                    incremental: true,
                    placeholder: 'Query...',
                    schema: true,
                  },
                }}
              />
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>

      {selectedQuery!=null ? (
        <VisualComparison
          queryResult1={processResults(queryEntries[selectedQuery].queryResults["0"])}
          queryResult2={processResults(queryEntries[selectedQuery].queryResults["1"])}
        />
      ) : (<></>)}

    </EuiPageTemplate>
  );

};

export default ExperimentView;
