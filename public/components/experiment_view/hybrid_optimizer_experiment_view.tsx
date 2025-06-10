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
} from '@elastic/eui';
import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  TableListView,
  reactRouterNavigate,
} from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { CoreStart, ToastsStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';
import { printType, HybridOptimizerExperiment } from '../../types/index';
import { VariantDetailsModal } from './variant_details';

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
}

export const HybridOptimizerExperimentView: React.FC<HybridOptimizerExperimentViewProps> = ({
  http,
  notifications,
  inputExperiment,
  history,
}) => {
  const [experiment, setExperiment] = useState<HybridOptimizerExperiment | null>(null);
  const [querySet, setQuerySet] = useState<any | null>(null);
  const [judgmentSet, setJudgmentSet] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [queryEvaluations, setQueryEvaluations] = useState<QueryVariantEvaluations>({});
  const [searchConfiguration, setSearchConfiguration] = useState<any | null>(null);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedVariantDetails, setSelectedVariantDetails] = useState<any>(null);

  const [tableColumns, setTableColumns] = useState<any[]>([]);

  const sanitizeResponse = (response) => response?.hits?.hits?.[0]?._source || undefined;

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

        if (_experiment && _searchConfiguration && _querySet && _judgmentSet) {
          // Get all evaluation result IDs
          const evaluationResultIds = _experiment.results
            .flatMap((res) => {
              return res.evaluationResults.map(({evaluationId}) => evaluationId);
            })
            .filter(Boolean);

          // Fetch all evaluation results in one query
          const query = {
            index: 'search-relevance-evaluation-result',
            query: {
              terms: {
                _id: evaluationResultIds,
              },
            },
            size: evaluationResultIds.length,
          };

          const result = await http.post(ServiceEndpoints.GetSearchResults, {
            body: JSON.stringify({ query1: query }),
          });

          if (!result?.result1?.hits?.hits) {
            console.error('No evaluation results found');
            notifications.toasts.addWarning({
              title: 'No Results',
              text: 'No evaluation results found for this experiment',
            });
            setQueryEvaluations({});
            return;
          }

          // Process results and organize by query and variant
          const evaluationsByQueryAndVariant: QueryVariantEvaluations = {};

          (_experiment.results || []).forEach((res) => {
            const queryText = res.queryText;
            const variantMap = res.evaluationResults;
            if (!variantMap) return;
            evaluationsByQueryAndVariant[queryText] = {};

            // Process all variants for this query
            variantMap.forEach((varEntry) => {
              const variantId = varEntry.experimentVariantId;
              const evalId = varEntry.evaluationId;
              if (!varEntry) return;

              const evaluation = result.result1?.hits?.hits?.find((hit) => hit._id === evalId)
                ?._source;

              let nMetrics = {}
              evaluation?.metrics?.forEach((metric) => {
                nMetrics[metric.metric] = metric.value;
              });
              if (nMetrics) {
                evaluationsByQueryAndVariant[queryText][variantId] = {
                  metrics: nMetrics,
                };
              }
            });
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
  }, [http, inputExperiment]);

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
        body: JSON.stringify({ query1: query }),
      });

      const variantDetails = result?.result1?.hits?.hits?.[0]?._source;
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
      notifications.toasts.addError(error, {
        title: 'Error loading variant details',
      });
    }
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
        ...metricNames.map((metricName) => ({
          field: `metrics.${metricName}`,
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
        })),
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
      const items = [];

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

      console.log('[DEBUG] Total items before filter:', items.length);

      const filteredItems = search
        ? items.filter((item) => item.queryText.includes(search))
        : items;

      console.log('[DEBUG] Total items after filter:', filteredItems.length);

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
          <TableListView
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
