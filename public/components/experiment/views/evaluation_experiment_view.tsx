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
  EuiToolTip,
} from '@elastic/eui';
import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  TableListView,
  reactRouterNavigate,
} from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { CoreStart, ToastsStart } from '../../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';
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
  ExperimentType,
  toExperiment,
  ScheduledJob,
} from '../../../types/index';
import { ScheduleDetails } from '../../common/ScheduleDetails';
import { MetricsSummaryPanel } from '../metrics/metrics_summary';
import { DocumentScoresTable } from '../metrics/document_score_table';
import {
  NDCG_TOOL_TIP,
  PRECISION_TOOL_TIP,
  MAP_TOOL_TIP,
  COVERAGE_TOOL_TIP,
} from '../../../../common';

interface EvaluationExperimentViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  inputExperiment: EvaluationExperiment;
  dataSourceId?: string | null;
}

export const EvaluationExperimentView: React.FC<EvaluationExperimentViewProps> = ({
  http,
  notifications,
  inputExperiment,
  history,
  dataSourceId,
}) => {
  const AnyTableListView = TableListView as unknown as React.ComponentType<any>;
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [searchConfiguration, setSearchConfiguration] = useState<any | null>(null);
  const [querySet, setQuerySet] = useState<any | null>(null);
  const [judgmentSet, setJudgmentSet] = useState<any | null>(null);
  const [scheduledExperimentJob, setScheduledExperimentJob] = useState<ScheduledJob | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [queryEvaluations, setQueryEvaluations] = useState<QueryEvaluation[]>([]);

  const [tableColumns, setTableColumns] = useState<any[]>([]);

  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [selectedQueryScores, setSelectedQueryScores] = useState<
    Array<{ docId: string; rating: string }>
  >([]);

  const sanitizeResponse = (response: any) => response?.hits?.hits?.[0]?._source || undefined;

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
          (entry: any) => entry.query === queryText
        );
        const judgments = judgmentEntry?.ratings || [];

        // Create document scores by matching evaluation documentIds with judgments
        const documentScores = evaluation.documentIds.map((docId) => {
          const judgment = judgments.find((j: any) => j.docId === docId);
          return {
            docId,
            rating: judgment ? judgment.rating : 'N/A',
          };
        });

        setSelectedQuery(queryText);
        setSelectedQueryScores(documentScores);
      } catch (error) {
        console.error('Error handling query click:', error);
        notifications.toasts.addError(error?.body || error, {
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
        const options = dataSourceId ? { query: { dataSourceId } } : {};
        
        const _experiment = await http
          .get(ServiceEndpoints.Experiments + '/' + inputExperiment.id, options)
          .then(sanitizeResponse);
        const parsedExperiment = _experiment && toExperiment(_experiment);
        const _searchConfiguration =
          _experiment &&
          (await http
            .get(
              ServiceEndpoints.SearchConfigurations + '/' + inputExperiment.searchConfigurationId,
              options
            )
            .then(sanitizeResponse));
        const _querySet =
          _experiment &&
          (await http
            .get(ServiceEndpoints.QuerySets + '/' + inputExperiment.querySetId, options)
            .then(sanitizeResponse));
        const _judgmentSet =
          _experiment &&
          (await http
            .get(ServiceEndpoints.Judgments + '/' + inputExperiment.judgmentId, options)
            .then(sanitizeResponse));

        const _scheduledExperimentJob =
          _experiment && inputExperiment.isScheduled &&
          (await http
            .get(
              ServiceEndpoints.ScheduledExperiments + '/' + inputExperiment.scheduledExperimentJobId,
              options
            )
            .then(sanitizeResponse));

        const querySetSize = _querySet && Object.keys(_querySet.querySetQueries).length;
        const query = {
          index: 'search-relevance-evaluation-result',
          query: {
            match: {
              experimentId: _experiment.id,
            },
          },
          size: querySetSize,
        };
        console.log('Making GetSearchResults call with:', { 
          query, 
          dataSourceId, 
          hasDataSourceId: !!dataSourceId,
          endpoint: ServiceEndpoints.GetSearchResults
        });
        
        const requestBody = {
          query1: query,
          ...(dataSourceId && { dataSourceId1: dataSourceId })
        };
        
        console.log('Request body:', requestBody);
        
        const result = await http.post(ServiceEndpoints.GetSearchResults, {
          body: JSON.stringify(requestBody)
        });
        
        console.log('GetSearchResults response:', { 
          hasResult: !!result, 
          hasResult1: !!result?.result1,
          hitsLength: result?.result1?.hits?.hits?.length,
          fullResponse: result
        });
        const parseResults =
          result &&
          result.result1?.hits?.hits &&
          combineResults(...result.result1.hits.hits.map((x: any) => toQueryEvaluation(x._source)));
        if (_experiment && _searchConfiguration && _querySet && _judgmentSet) {
          setExperiment(parsedExperiment.data);
          setSearchConfiguration(_searchConfiguration);
          setQuerySet(_querySet);
          setJudgmentSet(_judgmentSet);
          setScheduledExperimentJob(_scheduledExperimentJob);
          if (parseResults.success) {
            setQueryEvaluations(parseResults.data);
            // Check if there are ZSR queries by comparing resultIds count with query set count
            if (_querySet && _querySet.querySetQueries && querySetSize > parseResults.data.length) {
              const zsrCount = querySetSize - parseResults.data.length;
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
  }, [http, inputExperiment, dataSourceId]);

  function extractMetricNames(queryEvaluations: any): string[] {
    if (queryEvaluations.length > 0) {
      return Object.keys(queryEvaluations[0].metrics);
    }
    return [];
  }

  const getBaseMetricName = (fullMetricName: string): string => {
    const parts = fullMetricName.split('@');
    return parts[0].toLowerCase();
  };

  useEffect(() => {
    if (experiment) {
      const metricNames = extractMetricNames(queryEvaluations);
      // metric tool tip texts
      const metricDescriptions: { [key: string]: string } = {
        ndcg: NDCG_TOOL_TIP,
        precision: PRECISION_TOOL_TIP,
        map: MAP_TOOL_TIP,
        coverage: COVERAGE_TOOL_TIP,
      };

      const columns: any[] = [
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
        // Extract base name for tooltip lookup
        const baseMetricName = getBaseMetricName(metricName);
        const tooltipContent =
          metricDescriptions[baseMetricName] || `No description available for ${metricName}`;

        columns.push({
          field: 'metrics.' + metricName,
          name: (
            <EuiToolTip content={tooltipContent}>
              {/* The actual text that triggers the tooltip */}
              <span>{metricName}</span>
            </EuiToolTip>
          ),
          dataType: 'number',
          sortable: true,
          render: (value: any) => {
            if (typeof value === 'number') {
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
        <EuiDescriptionListDescription>{experiment ? printType(experiment.type) : ''}</EuiDescriptionListDescription>
       
        {experiment && (experiment.type === ExperimentType.POINTWISE_EVALUATION || experiment.type === ExperimentType.HYBRID_OPTIMIZER) && (
          <ScheduleDetails
            isScheduled={experiment.isScheduled}
            scheduledExperimentJob={scheduledExperimentJob}
          />
        )}
    
        <EuiDescriptionListTitle>Query Set</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <EuiButtonEmpty
            size="xs"
            {...reactRouterNavigate(history, `/querySet/view/${inputExperiment.querySetId}${dataSourceId ? `?dataSourceId=${dataSourceId}` : ''}`)}
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
              `/searchConfiguration/view/${inputExperiment.searchConfigurationId}${dataSourceId ? `?dataSourceId=${dataSourceId}` : ''}`
            )}
          >
            {searchConfiguration?.name}
          </EuiButtonEmpty>
        </EuiDescriptionListDescription>
        <EuiDescriptionListTitle>Judgment Set</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <EuiButtonEmpty
            size="xs"
            {...reactRouterNavigate(history, `/judgment/view/${inputExperiment.judgmentId}${dataSourceId ? `?dataSourceId=${dataSourceId}` : ''}`)}
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
                <AnyTableListView
                  key={`table-${queryEvaluations.length}`}
                  entityName="Query"
                  entityNamePlural="Queries"
                  tableColumns={tableColumns}
                  findItems={findQueries as any}
                  loading={loading}
                  initialPageSize={10}
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
