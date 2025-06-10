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
import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  TableListView,
  reactRouterNavigate,
} from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { CoreStart, ToastsStart } from '../../../../../src/core/public';
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
import { DocumentScoresTable } from './document_score_table';

interface EvaluationExperimentViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  inputExperiment: EvaluationExperiment;
}

export const EvaluationExperimentView: React.FC<EvaluationExperimentViewProps> = ({
  http,
  notifications,
  inputExperiment,
  history,
}) => {
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [searchConfiguration, setSearchConfiguration] = useState<any | null>(null);
  const [querySet, setQuerySet] = useState<any | null>(null);
  const [judgmentSet, setJudgmentSet] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [queryEvaluations, setQueryEvaluations] = useState<QueryEvaluation[]>([]);

  const [tableColumns, setTableColumns] = useState<any[]>([]);

  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [selectedQueryScores, setSelectedQueryScores] = useState<
    Array<{ docId: string; rating: string }>
  >([]);

  const sanitizeResponse = (response) => response?.hits?.hits?.[0]?._source || undefined;

  const handleQueryClick = useCallback(
    (queryText: string) => {
      try {
        // Find the evaluation from already fetched queryEvaluations
        const evaluation = queryEvaluations.find((q) => q.queryText === queryText);

        if (!evaluation?.documentIds?.length) {
          notifications.toasts.addWarning({
            title: 'No documents',
            text: 'No documents found in evaluation results',
          });
          return;
        }

        // Get ratings from the already fetched judgment set
        const judgmentEntry = judgmentSet?.judgmentRatings?.find(
          (entry) => entry.query === queryText
        );
        const judgments = judgmentEntry?.ratings || [];

        // Create document scores by matching evaluation documentIds with judgments
        const documentScores = evaluation.documentIds.map((docId) => {
          const judgment = judgments.find((j) => j.docId === docId);
          return {
            docId,
            rating: judgment ? judgment.rating : 'N/A',
          };
        });

        setSelectedQuery(queryText);
        setSelectedQueryScores(documentScores);
      } catch (error) {
        console.error('Error handling query click:', error);
        notifications.toasts.addError(error, {
          title: 'Error processing document scores',
        });
      }
    },
    [queryEvaluations, judgmentSet, notifications]
  );

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        setLoading(true);
        const _experiment = await http
          .get(ServiceEndpoints.Experiments + '/' + inputExperiment.id)
          .then(sanitizeResponse);
        const _searchConfiguration =
          _experiment &&
          (await http
            .get(
              ServiceEndpoints.SearchConfigurations + '/' + inputExperiment.searchConfigurationId
            )
            .then(sanitizeResponse));
        const _querySet =
          _experiment &&
          (await http
            .get(ServiceEndpoints.QuerySets + '/' + inputExperiment.querySetId)
            .then(sanitizeResponse));
        const _judgmentSet =
          _experiment &&
          (await http
            .get(ServiceEndpoints.Judgments + '/' + inputExperiment.judgmentId)
            .then(sanitizeResponse));

        // the .filter(Boolean) is used to filter out undefineds which show up for queries that are ZSR.
        const resultIds = _experiment.results
          .map(({evaluationId}) => evaluationId)
          .filter(Boolean);

        const query = {
          index: 'search-relevance-evaluation-result',
          query: {
            terms: {
              _id: resultIds,
            },
          },
          size: resultIds.length,
        };
        const result = await http.post(ServiceEndpoints.GetSearchResults, {
          body: JSON.stringify({ query1: query }),
        });
        const parseResults =
          result &&
          result.result1?.hits?.hits &&
          combineResults(...result.result1.hits.hits.map((x) => toQueryEvaluation(x._source)));

        if (_experiment && _searchConfiguration && _querySet && _judgmentSet) {
          setExperiment(_experiment);
          setSearchConfiguration(_searchConfiguration);
          setQuerySet(_querySet);
          setJudgmentSet(_judgmentSet);
          if (parseResults.success) {
            setQueryEvaluations(parseResults.data);
            // Check if there are ZSR queries by comparing resultIds count with query set count
            if (
              _querySet &&
              _querySet.querySetQueries &&
              Object.keys(_querySet.querySetQueries).length > resultIds.length
            ) {
              const zsrCount = Object.keys(_querySet.querySetQueries).length - resultIds.length;
              notifications.toasts.addWarning({
                title: 'You have some ZSR queries',
                text: `${zsrCount} queries returned Zero Search Results`,
                'data-test-subj': 'zsrQueriesWarningToast',
                toastLifeTimeMs: 10000,
              });
            }
          } else {
            setError('Error parsing experiment');
            console.error('Error parsing query evaluations:', parseResults.errors);
            setQueryEvaluations([]);
          }
        } else {
          setError('No matching experiment found');
        }
      } catch (err) {
        console.error('Failed to load experiment', err);
        setExperiment(null);
        setError('Error loading experiment data');
        console.error('Error loading experiment data:', err);
      } finally {
      }
    };

    fetchExperiment();
  }, [http, inputExperiment]);

  function extractMetricNames(queryEvaluations: any): string[] {
    if (queryEvaluations.length > 0) {
      return Object.keys(queryEvaluations[0].metrics);
    }
    return [];
  }

  useEffect(() => {
    if (experiment) {
      const metricNames = extractMetricNames(queryEvaluations);

      const columns = [
        {
          field: 'queryText',
          name: 'Query',
          dataType: 'string',
          sortable: true,
          render: (queryText: string) => (
            <EuiButtonEmpty onClick={() => handleQueryClick(queryText)} size="xs">
              {queryText}
            </EuiButtonEmpty>
          ),
        },
      ];
      metricNames.forEach((metricName) => {
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
          },
        });
      });

      setTableColumns(columns);
      setLoading(false);
    }
  }, [experiment, queryEvaluations, handleQueryClick]);

  const findQueries = useCallback(
    async (search: any) => {
      const filteredQueryEntries = search
        ? queryEvaluations.filter((q) => q.queryText.includes(search))
        : queryEvaluations;
      return { hits: filteredQueryEntries, total: filteredQueryEntries.length };
    },
    [queryEvaluations]
  );

  const experimentDetails = (
    <EuiPanel hasBorder={true}>
      <EuiDescriptionList type="column" compressed>
        <EuiDescriptionListTitle>Experiment Type</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>{printType(experiment?.type)}</EuiDescriptionListDescription>
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
            {...reactRouterNavigate(
              history,
              `/searchConfiguration/view/${inputExperiment.searchConfigurationId}`
            )}
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
      <EuiResizableContainer>
        {(EuiResizablePanel, EuiResizableButton) => (
          <>
            <EuiResizablePanel initialSize={50} minSize="15%">
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
            </EuiResizablePanel>

            <EuiResizableButton />

            <EuiResizablePanel initialSize={50} minSize="30%">
              {selectedQuery && selectedQueryScores && (
                <DocumentScoresTable
                  queryText={selectedQuery}
                  documentScores={selectedQueryScores}
                />
              )}
            </EuiResizablePanel>
          </>
        )}
      </EuiResizableContainer>
    </EuiPanel>
  );

  return (
    <>
      {experimentDetails}
      <EuiSpacer size="m" />
      <MetricsSummaryPanel metrics={queryEvaluations.map((q) => q.metrics)} />
      <EuiSpacer size="m" />
      {resultsPane}
    </>
  );
};

export const EvaluationExperimentViewWithRouter = withRouter(EvaluationExperimentView);

export default EvaluationExperimentViewWithRouter;
