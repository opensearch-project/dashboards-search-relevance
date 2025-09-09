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
import { CoreStart } from '../../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';
import {
  VisualComparison,
  convertFromSearchResult,
} from '../../query_compare/search_result/visual_comparison/visual_comparison';
import {
  Experiment,
  SearchResults,
  QueryEvaluation,
  QuerySnapshot,
  toQueryEvaluations,
  toQuerySnapshots,
  combineResults,
} from '../../../types/index';
import { MetricsSummaryPanel } from '../metrics/metrics_summary';
import {
  JACCARD_TOOL_TIP,
  RBO50_TOOL_TIP,
  RBO90_TOOL_TIP,
  FREQUENCY_WEIGHTED_TOOL_TIP,
} from '../../../../common';

interface PairwiseExperimentViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
  inputExperiment: Experiment;
}

export const PairwiseExperimentView: React.FC<PairwiseExperimentViewProps> = ({
  http,
  inputExperiment,
  history,
}) => {
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [searchConfigurations, setSearchConfigurations] = useState<any | null>(null);
  const [querySet, setQuerySet] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<number | null>(null);
  const [queryResult1, setQueryResult1] = useState<SearchResults | null>(null);
  const [queryResult2, setQueryResult2] = useState<SearchResults | null>(null);

  const [queryEvaluations, setQueryEvaluations] = useState<QueryEvaluation[]>([]);
  const [querySnapshots, setQuerySnapshots] = useState<QuerySnapshot[]>([]);

  const [tableColumns, setTableColumns] = useState<any[]>([]);

  const sanitizeResponse = (response) => response?.hits?.hits?.[0]?._source || undefined;

  const loadSearchConfigurations = async (searchConfigurationIds: string[]) => {
    const promises = searchConfigurationIds.map(async (id) => {
      return await http
        .get(ServiceEndpoints.SearchConfigurations + '/' + id)
        .then(sanitizeResponse);
    });
    return Promise.all(promises);
  };

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        setLoading(true);
        const _experiment = await http
          .get(ServiceEndpoints.Experiments + '/' + inputExperiment.id)
          .then(sanitizeResponse);
        const _searchConfigurations = _experiment
          ? await loadSearchConfigurations(_experiment.searchConfigurationList)
          : [];
        const _querySet = _experiment
          ? await http
              .get(ServiceEndpoints.QuerySets + '/' + _experiment.querySetId)
              .then(sanitizeResponse)
          : null;

        if (
          _experiment &&
          _searchConfigurations.length >= 2 &&
          _searchConfigurations.every(Boolean)
        ) {
          setExperiment(_experiment);
          setSearchConfigurations(_searchConfigurations);
          setQuerySet(_querySet);
          const parseResults = combineResults(
            toQueryEvaluations(_experiment),
            toQuerySnapshots(_experiment, _searchConfigurations[0].id),
            toQuerySnapshots(_experiment, _searchConfigurations[1].id)
          );
          if (parseResults.success) {
            setQueryEvaluations(parseResults.data[0]);
            setQuerySnapshots([parseResults.data[1], parseResults.data[2]]);
          } else {
            setError('Error parsing experiment');
            console.error('Error parsing query evaluations and snapshots:', parseResults.errors);
            setQueryEvaluations([]);
            setQuerySnapshots([]);
          }
        } else {
          setError('No matching experiment found');
        }
      } catch (err) {
        console.error('Failed to load experiment', err);
        setExperiment(null);
        setError('Error loading experiment data');
        console.error(err);
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
      // metric tool tip texts
      const metricDescriptions: { [key: string]: string } = {
        jaccard: JACCARD_TOOL_TIP,
        rbo50: RBO50_TOOL_TIP,
        rbo90: RBO90_TOOL_TIP,
        frequencyWeighted: FREQUENCY_WEIGHTED_TOOL_TIP,
      };

      const columns = [
        {
          field: 'queryText',
          name: 'Query',
          dataType: 'string',
          sortable: true,
          render: (name: string) => (
            <EuiButtonEmpty
              size="xs"
              onClick={() => {
                const index = queryEvaluations.findIndex((q) => q.queryText === name);
                setSelectedQuery(index);
              }}
              title={name}
            >
              {name}
            </EuiButtonEmpty>
          ),
        },
      ];
      metricNames.forEach((metricName) => {
        columns.push({
          field: 'metrics.' + metricName,
          name: (
            <EuiToolTip
              content={
                metricDescriptions[metricName] || `No description available for ${metricName}`
              }
            >
              <span>{metricName + '@' + experiment.size}</span>
            </EuiToolTip>
          ),
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
  }, [experiment, queryEvaluations]);

  function resolve_attributes(ids, hits) {
    const res = ids.map((id) => hits.find((hit) => hit._id === id) || { _id: id });
    return res.map((x, index) => ({ ...x, rank: index + 1 }));
  }

  useEffect(() => {
    if (selectedQuery != null) {
      const queryText = queryEvaluations[selectedQuery].queryText;
      const snapshot1 = querySnapshots[0].find((s) => s.queryText === queryText).documentIds;
      const snapshot2 = querySnapshots[1].find((s) => s.queryText === queryText).documentIds;
      const query1 = {
        index: searchConfigurations[0].index,
        size: snapshot1.length,
        query: {
          terms: {
            _id: snapshot1,
          },
        },
      };
      const query2 = {
        index: searchConfigurations[1].index,
        size: snapshot2.length,
        query: {
          terms: {
            _id: snapshot2,
          },
        },
      };

      http
        .post(ServiceEndpoints.GetSearchResults, {
          body: JSON.stringify({ query1, query2 }),
        })
        .then((res) => {
          setQueryResult1(resolve_attributes(snapshot1, convertFromSearchResult(res.result1)));
          setQueryResult2(resolve_attributes(snapshot2, convertFromSearchResult(res.result2)));
        })
        .catch((error: Error) => {
          console.error(error);
        });
    }
  }, [selectedQuery]);

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
        <EuiDescriptionListTitle>Query Set</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          <EuiButtonEmpty
            size="xs"
            {...reactRouterNavigate(history, `/querySet/view/${querySet?.id}`)}
          >
            {querySet?.name}
          </EuiButtonEmpty>
        </EuiDescriptionListDescription>
        {searchConfigurations?.map((config, index) => (
          <React.Fragment key={config.id}>
            <EuiDescriptionListTitle>Search Configuration {index + 1}</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
              <EuiButtonEmpty
                size="xs"
                {...reactRouterNavigate(history, `/searchConfiguration/view/${config.id}`)}
              >
                {config.name}
              </EuiButtonEmpty>
            </EuiDescriptionListDescription>
          </React.Fragment>
        ))}
      </EuiDescriptionList>
    </EuiPanel>
  );

  const resultsPane = (
    <EuiPanel hasBorder paddingSize="l">
      <EuiResizableContainer>
        {(EuiResizablePanel, EuiResizableButton) => {
          return (
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
                {selectedQuery != null && queryResult1 && queryResult2 && (
                  <VisualComparison
                    queryResult1={queryResult1}
                    queryResult2={queryResult2}
                    queryText={queryEvaluations[selectedQuery].queryText}
                    resultText1={`${searchConfigurations[0].name} result`}
                    resultText2={`${searchConfigurations[1].name} result`}
                  />
                )}
              </EuiResizablePanel>
            </>
          );
        }}
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

export const PairwiseExperimentViewWithRouter = withRouter(PairwiseExperimentView);

export default PairwiseExperimentViewWithRouter;
