/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButtonEmpty,
  EuiCallOut,
  EuiPanel,
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
import { printType, HybridOptimizerExperiment, ScheduledJob } from '../../../types/index';
import { ScheduleDetails } from '../../common/ScheduleDetails';
import { VariantDetailsModal } from '../metrics/variant_details';
import {
  NDCG_TOOL_TIP,
  PRECISION_TOOL_TIP,
  MAP_TOOL_TIP,
  COVERAGE_TOOL_TIP,
} from '../../../../common';
import { loadExperimentResourcesParallel } from '../services/experiment_resource_loader';

interface VariantEvaluation {
  metrics: Record<string, number>;
}

interface QueryVariantEvaluations {
  [queryText: string]: {
    [variantId: string]: VariantEvaluation;
  };
}

interface HybridOptimizerExperimentViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  inputExperiment: HybridOptimizerExperiment;
  dataSourceId?: string | null;
}

export const HybridOptimizerExperimentView: React.FC<HybridOptimizerExperimentViewProps> = ({
  http,
  notifications,
  inputExperiment,
  history,
  dataSourceId,
}) => {
  const AnyTableListView = TableListView as unknown as React.ComponentType<any>;
  const [experiment, setExperiment] = useState<HybridOptimizerExperiment | null>(null);
  const [querySet, setQuerySet] = useState<any | null>(null);
  const [judgmentSet, setJudgmentSet] = useState<any | null>(null);
  const [scheduledExperimentJob, setScheduledExperimentJob] = useState<ScheduledJob | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [queryEvaluations, setQueryEvaluations] = useState<QueryVariantEvaluations>({});
  const [searchConfiguration, setSearchConfiguration] = useState<any | null>(null);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedVariantDetails, setSelectedVariantDetails] = useState<any>(null);

  const [tableColumns, setTableColumns] = useState<any[]>([]);

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        setLoading(true);

        const resources = await loadExperimentResourcesParallel(
          http,
          {
            experimentId: inputExperiment.id,
            searchConfigurationId: inputExperiment.searchConfigurationId,
            querySetId: inputExperiment.querySetId,
            judgmentId: inputExperiment.judgmentId,
            isScheduled: inputExperiment.isScheduled,
            scheduledExperimentJobId: inputExperiment.scheduledExperimentJobId,
          },
          dataSourceId
        );

        const _experiment = resources?.experiment;
        const _searchConfiguration = resources?.searchConfiguration;
        const _querySet = resources?.querySet;
        const _judgmentSet = resources?.judgmentSet;
        const _scheduledExperimentJob = resources?.scheduledExperimentJob;

        if (_experiment && _searchConfiguration && _querySet && _judgmentSet) {
          const querySetSize = _querySet && Object.keys(_querySet.querySetQueries).length;
          const maxSize = 10000; // OpenSearch max result window
          const expectedSize = querySetSize * 66;

          setScheduledExperimentJob(_scheduledExperimentJob);
          
          // Process results and organize by query and variant
          const evaluationsByQueryAndVariant: QueryVariantEvaluations = {};
          let allResults: any[] = [];
          
          // If expected results exceed max, use pagination
          if (expectedSize > maxSize) {
            let from = 0;
            let hasMore = true;
            while (hasMore && from < maxSize) { // Important: from + size cannot exceed max_result_window
              const batchSize = Math.min(maxSize - from, expectedSize - from);
              const query = {
                index: 'search-relevance-evaluation-result',
                query: {
                  match: {
                    experimentId: _experiment.id,
                  },
                },
                from: from,
                size: batchSize,
              };
              const result = await http.post(ServiceEndpoints.GetSearchResults, {
                body: JSON.stringify({ query }),
              });
              
              if (result?.result?.hits?.hits && result.result.hits.hits.length > 0) {
                allResults = allResults.concat(result.result.hits.hits);
                from += result.result.hits.hits.length;
                
                // Stop if we got less than requested or reached max window
                if (result.result.hits.hits.length < batchSize || from >= maxSize) {
                  hasMore = false;
                  if (from >= maxSize && expectedSize > maxSize) {
                    console.warn(`[WARNING] Reached OpenSearch max_result_window limit (${maxSize}). Cannot fetch remaining ${expectedSize - from} results.`);
                    notifications.toasts.addWarning({
                      title: 'Partial Results',
                      text: `Due to OpenSearch limitations, only the first ${from} of ${expectedSize} results could be loaded.`,
                    });
                  }
                }
              } else {
                hasMore = false;
              }
            }
          } else {
            // Single query for small result sets
            const query = {
              index: 'search-relevance-evaluation-result',
              query: {
                match: {
                  experimentId: _experiment.id,
                },
              },
              size: expectedSize,
          };

          const result = await http.post(ServiceEndpoints.GetSearchResults, {
            body: JSON.stringify({ query }),
          });

          if (result?.result?.hits?.hits) {
              allResults = result.result.hits.hits;
            }
          }

          if (!allResults || allResults.length === 0) {
            console.error('No evaluation results found');
            notifications.toasts.addWarning({
              title: 'No Results',
              text: 'No evaluation results found for this experiment',
            });
            setQueryEvaluations({});
            return;
          }

          // Process all results
          allResults.forEach((hit: any) => {
            const nMetrics: Record<string, number> = {};
            hit._source.metrics?.forEach((metric: any) => {
              nMetrics[metric.metric] = metric.value;
            });
            evaluationsByQueryAndVariant[hit._source.searchText] =
              evaluationsByQueryAndVariant[hit._source.searchText] || {};
            evaluationsByQueryAndVariant[hit._source.searchText][
              hit._source.experimentVariantId
            ] = {
              metrics: nMetrics,
            };
          });

          setExperiment(_experiment as HybridOptimizerExperiment);
          setQueryEvaluations(evaluationsByQueryAndVariant);
          setExperiment(_experiment);
          setSearchConfiguration(_searchConfiguration);
          setQuerySet(_querySet);
          setJudgmentSet(_judgmentSet);
        }
      } catch (err) {
        console.error('Failed to load experiment', err);
        setError('Error loading experiment data');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiment();
  }, [http, inputExperiment, dataSourceId]);

  const fetchVariantDetails = async (variantId: string) => {
    try {
      const query = {
        index: 'search-relevance-experiment-variant',
        query: {
          terms: {
            _id: [variantId],
          },
        },
      };

      const result = await http.post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({ query }),
      });

      const variantDetails = result?.result?.hits?.hits?.[0]?._source;
      if (variantDetails) {
        setSelectedVariantDetails(variantDetails);
        setSelectedVariantId(variantId);
      } else {
        notifications.toasts.addWarning({
          title: 'Variant Not Found',
          text: `No details found for variant ${variantId}`,
        });
      }
    } catch (error) {
      console.error('Error fetching variant details:', error);
      notifications.toasts.addError(error?.body || error, {
        title: 'Error loading variant details',
      });
    }
  };

  const getBaseMetricName = (fullMetricName: string): string => {
    const parts = fullMetricName.split('@');
    return parts[0].toLowerCase();
  };

  useEffect(() => {
    if (experiment && queryEvaluations) {
      // Add null checks and default values
      const queries = Object.values(queryEvaluations);
      if (queries.length === 0) {
        console.warn('No queries found in evaluations');
        return;
      }

      const firstQuery = queries[0] || {};
      const variants = Object.values(firstQuery);
      if (variants.length === 0) {
        console.warn('No variants found in first query');
        return;
      }

      const firstVariant = variants[0];
      if (!firstVariant?.metrics) {
        console.warn('No metrics found in first variant');
        return;
      }

      const metricNames = Object.keys(firstVariant.metrics);

      // metric tool tip texts
      const metricDescriptions: { [key: string]: string } = {
        ndcg: NDCG_TOOL_TIP,
        precision: PRECISION_TOOL_TIP,
        map: MAP_TOOL_TIP,
        coverage: COVERAGE_TOOL_TIP,
      };

      if (metricNames.length === 0) {
        console.warn('No metric names found');
        return;
      }

      const columns = [
        {
          field: 'queryText',
          name: 'Query',
          dataType: 'string',
          sortable: true,
        },
        {
          field: 'variantId',
          name: 'Variant ID',
          dataType: 'string',
          sortable: true,
          render: (variantId: string) => (
            <EuiButtonEmpty size="xs" onClick={() => fetchVariantDetails(variantId)}>
              {variantId}
            </EuiButtonEmpty>
          ),
        },
        ...metricNames.map((metricName) => {
          const baseMetricName = getBaseMetricName(metricName);
          const tooltipContent =
            metricDescriptions[baseMetricName] || `No description available for ${metricName}`;

          return {
            field: `metrics.${metricName}`,
            name: (
              <EuiToolTip content={tooltipContent}>
                <span>{metricName}</span>
              </EuiToolTip>
            ),
            dataType: 'number',
            sortable: true,
            render: (value: any) => {
              if (value !== undefined && value !== null) {
                return new Intl.NumberFormat(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(value);
              }
              return '-';
            },
          };
        }),
      ];

      setTableColumns(columns);
    }
  }, [experiment, queryEvaluations]);

  const findQueries = useCallback(
    async (search: any) => {
      if (!queryEvaluations) {
        return { hits: [], total: 0 };
      }

      // Flatten the nested structure for table display
      const items: any[] = [];

      // For each query
      Object.entries(queryEvaluations).forEach(([queryText, variants]) => {
        // For each variant in the query
        Object.entries(variants).forEach(([variantId, data]) => {
          items.push({
            queryText,
            variantId,
            metrics: data.metrics,
          });
        });
      });

      const filteredItems = search
        ? items.filter((item) => item.queryText.includes(search))
        : items;

      return {
        hits: filteredItems,
        total: filteredItems.length,
      };
    },
    [queryEvaluations]
  );

  const experimentDetails = (
    <EuiPanel hasBorder={true}>
      <EuiDescriptionList type="column" compressed>
        <EuiDescriptionListTitle>Experiment Type</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>{experiment?.type ? printType(experiment.type) : ''}</EuiDescriptionListDescription>

        <ScheduleDetails
          isScheduled={experiment?.isScheduled}
          scheduledExperimentJob={scheduledExperimentJob}
        />

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

  return (
    <>
      {experimentDetails}
      <EuiSpacer size="m" />
      <EuiPanel hasBorder paddingSize="l">
        {error ? (
          <EuiCallOut title="Error" color="danger">
            <p>{error}</p>
          </EuiCallOut>
        ) : (
          <AnyTableListView
            key={`table-${Object.keys(queryEvaluations).length}`}
            entityName="Query"
            entityNamePlural="Queries"
            tableColumns={tableColumns}
            findItems={findQueries}
            loading={loading}
            initialPageSize={50}
            pageSizeOptions={[20, 50, 100]}
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
      {selectedVariantDetails && (
        <VariantDetailsModal
          variantDetails={selectedVariantDetails}
          onClose={() => {
            setSelectedVariantDetails(null);
            setSelectedVariantId(null);
          }}
        />
      )}
    </>
  );
};

export const HybridOptimizerExperimentViewWithRouter = withRouter(HybridOptimizerExperimentView);

export default HybridOptimizerExperimentViewWithRouter;
