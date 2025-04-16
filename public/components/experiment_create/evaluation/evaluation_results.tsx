// src/components/EvaluationPage/index.tsx
import React, { useEffect, useState } from 'react';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiSpacer,
  EuiButtonEmpty,
  EuiHorizontalRule,
  EuiLoadingSpinner,
  EuiText,
  EuiHealth,
  EuiCallOut,
  EuiBasicTable,
} from '@elastic/eui';
import {
  TEST_COMPARED_DOCUMENTS_RANK_1,
  TEST_COMPARED_DOCUMENTS_RANK_2,
  TEST_QUERY_RESPONSE,
} from '../../../../test/constants';
import { ResultGridComponent } from '../../query_compare/search_result/result_components/result_grid';
import { ServiceEndpoints } from '../../../../common';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';

// interface EvaluationPageProps {
//   templateType: string;
//   configData: any;
//   onBack: () => void;
// }

// export const Evaluation_results = ({
//                                  templateType,
//                                  configData,
//                                  onBack,
//                                }: EvaluationPageProps) => {
//   return (
//     <EuiPanel paddingSize="l">
//       <EuiFlexGroup direction="column">
//         {/* Header Section */}
//         <EuiFlexItem>
//           <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
//             <EuiFlexItem>
//               <EuiTitle size="m">
//                 <h2>{templateType} Evaluation</h2>
//               </EuiTitle>
//             </EuiFlexItem>
//             <EuiFlexItem grow={false}>
//               <EuiButtonEmpty
//                 iconType="arrowLeft"
//                 onClick={onBack}
//                 size="s"
//               >
//                 Back to Configuration
//               </EuiButtonEmpty>
//             </EuiFlexItem>
//           </EuiFlexGroup>
//           <EuiSpacer size="m" />
//           <EuiHorizontalRule margin="none" />
//         </EuiFlexItem>
//
//         {/* Content Section */}
//         <EuiFlexItem>
//           <EuiFlexGroup direction="column" gutterSize="m">
//             {/* Configuration Summary */}
//             <EuiFlexItem>
//               <EuiPanel color="subdued" paddingSize="m">
//                 <EuiTitle size="xs">
//                   <h3>Configuration Summary</h3>
//                 </EuiTitle>
//                 <EuiSpacer size="s" />
//                 <pre style={{
//                   background: '#f7f8fb',
//                   padding: '12px',
//                   borderRadius: '4px',
//                   overflow: 'auto'
//                 }}>
//                   {JSON.stringify(configData, null, 2)}
//                 </pre>
//               </EuiPanel>
//             </EuiFlexItem>
//
//             {/* Evaluation Form */}
//             <EuiFlexItem>
//               <EuiPanel paddingSize="m">
//                 <EuiTitle size="xs">
//                   <h3>Evaluation Results</h3>
//                 </EuiTitle>
//                 <EuiSpacer size="m" />
//                 {/* Add your evaluation form here */}
//                 <EuiFlexGroup gutterSize="m" direction="row">
//                   <ResultGridComponent
//                     queryResult={TEST_QUERY_RESPONSE}
//                     resultNumber={1}
//                     comparedDocumentsRank={TEST_COMPARED_DOCUMENTS_RANK_1}
//                   />
//                   <ResultGridComponent
//                     queryResult={TEST_QUERY_RESPONSE}
//                     resultNumber={2}
//                     comparedDocumentsRank={TEST_COMPARED_DOCUMENTS_RANK_2}
//                   />
//                 </EuiFlexGroup>
//               </EuiPanel>
//             </EuiFlexItem>
//           </EuiFlexGroup>
//         </EuiFlexItem>
//       </EuiFlexGroup>
//     </EuiPanel>
//   );
// };

interface EvaluationResultsProps {
  templateType: string;
  experimentId: string;
  onBack: () => void;
}

export const EvaluationResults = ({
  templateType,
  experimentId,
  onBack,
}: EvaluationResultsProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [experimentResults, setExperimentResults] = useState<any>(null);

  const {
    services: { http, notifications },
  } = useOpenSearchDashboards();

  useEffect(() => {
    if (experimentId) {
      fetchExperimentResults();
    }
  }, [experimentId]);

  const fetchExperimentResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await http.get(`${ServiceEndpoints.Experiments}/${experimentId}`);
      const experiment = response?.hits?.hits?.[0]?._source;

      if (!experiment) {
        throw new Error('No experiment results found');
      }

      setExperimentResults(experiment);
    } catch (err) {
      setError('Failed to load experiment results');
      console.error('Error fetching results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMetricsTable = (queryText: string, metrics: any) => {
    if (!metrics || !metrics.pairwiseComparison) return null;

    const columns = [
      {
        field: 'metric',
        name: 'Metric',
        sortable: true,
      },
      {
        field: 'value',
        name: 'Value',
        sortable: true,
        render: (value: number) => Number(value).toFixed(4),
      },
    ];

    const items = Object.entries(metrics.pairwiseComparison).map(([metric, value]) => ({
      metric,
      value,
    }));

    return <EuiBasicTable items={items} columns={columns} compressed />;
  };

  const renderQueryResults = () => {
    if (!experimentResults?.results?.metrics) return null;

    return Object.entries(experimentResults.results.metrics).map(
      ([queryText, metrics]: [string, any]) => {
        const hasError =
          metrics['0']?.[0]?.includes('Error') || metrics['1']?.[0]?.includes('Error');

        return (
          <EuiFlexItem key={queryText}>
            <EuiPanel paddingSize="m">
              <EuiFlexGroup alignItems="center" gutterSize="s">
                <EuiFlexItem grow={false}>
                  <EuiHealth color={hasError ? 'danger' : 'success'}>Query: {queryText}</EuiHealth>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiSpacer size="s" />
              {hasError ? (
                <EuiText color="danger" size="s">
                  {metrics['0'][0]}
                </EuiText>
              ) : (
                renderMetricsTable(queryText, metrics)
              )}
            </EuiPanel>
          </EuiFlexItem>
        );
      }
    );
  };

  if (isLoading) {
    return (
      <EuiFlexGroup justifyContent="center" alignItems="center" style={{ minHeight: '200px' }}>
        <EuiFlexItem grow={false}>
          <EuiLoadingSpinner size="xl" />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  if (error) {
    return (
      <EuiCallOut title="Error loading results" color="danger" iconType="alealert">
        <p>{error}</p>
        <EuiButtonEmpty onClick={onBack}>Back to configuration</EuiButtonEmpty>
      </EuiCallOut>
    );
  }

  return (
    <div>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty iconType="arrowLeft" onClick={onBack} size="s">
            Back to configuration
          </EuiButtonEmpty>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="l" />

      <EuiFlexGroup direction="column">
        {experimentResults && (
          <>
            <EuiFlexItem>
              <EuiText>
                <h3>Experiment Details</h3>
              </EuiText>
              <EuiSpacer size="s" />
              <EuiText size="s">
                <p>Index: {experimentResults.index}</p>
                <p>Query Set ID: {experimentResults.querySetId}</p>
                <p>K: {experimentResults.k}</p>
                <p>Configurations: {experimentResults.searchConfigurationList.join(', ')}</p>
              </EuiText>
            </EuiFlexItem>

            <EuiHorizontalRule />

            <EuiFlexItem>
              <EuiText>
                <h3>Metrics</h3>
              </EuiText>
              <EuiSpacer size="s" />
              {renderQueryResults()}
            </EuiFlexItem>
          </>
        )}
      </EuiFlexGroup>
    </div>
  );
};
