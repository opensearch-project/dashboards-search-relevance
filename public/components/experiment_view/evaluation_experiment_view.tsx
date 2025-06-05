/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    EuiButtonEmpty,
    EuiCallOut,
    EuiPanel,
    EuiResizableContainer,
    EuiDescriptionList,
    EuiDescriptionListTitle,
    EuiDescriptionListDescription,
    EuiSpacer,
  } from '@elastic/eui';
import {
    TableListView,
    reactRouterNavigate,
} from '../../../../../src/plugins/opensearch_dashboards_react/public';
import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';
import {
  Experiment,
  SearchResults,
  QueryEvaluation,
  QuerySnapshot,
  toQueryEvaluations,
  toQuerySnapshots,
  combineResults,
  toQueryEvaluation,
  EvaluationExperiment,
  printType,
} from '../../types/index';
import { MetricsSummaryPanel } from './metrics_summary';

interface EvaluationExperimentViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
  inputExperiment: EvaluationExperiment;
}

export const EvaluationExperimentView: React.FC<EvaluationExperimentViewProps> = ({ http, inputExperiment, history }) => {
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [searchConfiguration, setSearchConfiguration] = useState<any | null>(null);
  const [querySet, setQuerySet] = useState<any | null>(null);
  const [judgmentSet, setJudgmentSet] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [queryEvaluations, setQueryEvaluations] = useState<QueryEvaluation[]>([]);

  const [tableColumns, setTableColumns] = useState<any[]>([]);

  const sanitizeResponse = (response) => response?.hits?.hits?.[0]?._source || undefined;

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        setLoading(true);
        const _experiment = await http.get(ServiceEndpoints.Experiments + "/" + inputExperiment.id).then(sanitizeResponse)
        const _searchConfiguration = _experiment && await http.get(ServiceEndpoints.SearchConfigurations + "/" + inputExperiment.searchConfigurationId).then(sanitizeResponse);
        const _querySet = _experiment && await http.get(ServiceEndpoints.QuerySets + "/" + inputExperiment.querySetId).then(sanitizeResponse);
        const _judgmentSet = _experiment && await http.get(ServiceEndpoints.Judgments + "/" + inputExperiment.judgmentId).then(sanitizeResponse);

        const resultIds = Object.entries(_experiment.results).map(([key, value]) => value[inputExperiment.searchConfigurationId]).filter(Boolean);
        const query = {
            index: "search-relevance-evaluation-result",
            query: {
              terms: {
                _id: resultIds
              }
            }
          }
        const result = await http.post(ServiceEndpoints.GetSearchResults, {
            body: JSON.stringify({ query1: query }),
        })
        const parseResults = result && result.result1?.hits?.hits && combineResults(...result.result1.hits.hits.map((x) => toQueryEvaluation(x._source)))

        if (_experiment && _searchConfiguration && _querySet && _judgmentSet) {
          setExperiment(_experiment);
          setSearchConfiguration(_searchConfiguration);
          setQuerySet(_querySet);
          setJudgmentSet(_judgmentSet);
          if (parseResults.success) {
            setQueryEvaluations(parseResults.data);
          } else {
            setError('Error parsing experiment');
            console.error('Error parsing query evaluations:', parseResults.errors);
            setQueryEvaluations([]);
          }
        } else {
          setError('No matching experiment found');
        }
      } catch (err) {
        setExperiment(null);
        setError('Error loading experiment data');
        console.error("Error loading experiment data:", err);
      } finally {
      }
    };

    fetchExperiment();
  }, [http, inputExperiment]);

  function extractMetricNames(queryEvaluations: any): string[] {
    if (queryEvaluations.length > 0) {
      return Object.keys(queryEvaluations[0].metrics)
    }
    return [];
  }

  useEffect(() => {
    if (experiment) {
      const metricNames = extractMetricNames(queryEvaluations)

      let columns = [
        {
            field: 'queryText',
            name: 'Query',
            dataType: 'string',
            sortable: true,
        },
      ]
      metricNames.forEach(metricName => {
        columns.push({
        field: 'metrics.' + metricName,
        name: metricName,
        dataType: 'number',
        sortable: true,
        render: (value) => {
            if (value !== undefined && value !== null) {
            return new Intl.NumberFormat(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value);
            }
            return '-';
        }
        })
      })

      setTableColumns(columns)
      setLoading(false);
    }
  }, [experiment, queryEvaluations])

  const findQueries = useCallback(async (search: any) => {
    const filteredQueryEntries = search ?
      queryEvaluations.filter(q => q.queryText.includes(search)) :
      queryEvaluations;
    return { hits: filteredQueryEntries, total: filteredQueryEntries.length };
  }, [queryEvaluations]);

  const experimentDetails = (
    <EuiPanel hasBorder={true}>
      <EuiDescriptionList type="column" compressed>
        <EuiDescriptionListTitle>Experiment Type</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          {printType(experiment?.type)}
        </EuiDescriptionListDescription>
        <EuiDescriptionListTitle>Query Set</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <EuiButtonEmpty
            size="xs"
            {...reactRouterNavigate(history, `/querySet/view/${inputExperiment.querySetId}`)}
          >
            {querySet?.name}
          </EuiButtonEmpty>
        </EuiDescriptionListDescription>
        <EuiDescriptionListTitle>Search Configuration</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
            <EuiButtonEmpty
            size="xs"
            {...reactRouterNavigate(history, `/searchConfiguration/view/${inputExperiment.searchConfigurationId}`)}
            >
            {searchConfiguration?.name}
            </EuiButtonEmpty>
        </EuiDescriptionListDescription>
        <EuiDescriptionListTitle>Judgment Set</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
            <EuiButtonEmpty
            size="xs"
            {...reactRouterNavigate(history, `/judgment/view/${inputExperiment.judgmentId}`)}
            >
            {judgmentSet?.name}
            </EuiButtonEmpty>
        </EuiDescriptionListDescription>
      </EuiDescriptionList>
    </EuiPanel>
  );

  const resultsPane = (
    <EuiPanel hasBorder paddingSize="l">
              {error ? (
                <EuiCallOut title="Error" color="danger">
                  <p>{error}</p>
                </EuiCallOut>
              ) : (
                <TableListView
                  key={`table-${queryEvaluations.length}`}
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
    </EuiPanel>
  );

  return (
    <>
      {experimentDetails}
      <EuiSpacer size="m" />
      <MetricsSummaryPanel
        metrics={queryEvaluations.map(q => q.metrics)}
      />
      <EuiSpacer size="m" />
      {resultsPane}
    </>
  );

};

export const EvaluationExperimentViewWithRouter = withRouter(EvaluationExperimentView);

export default EvaluationExperimentViewWithRouter;
