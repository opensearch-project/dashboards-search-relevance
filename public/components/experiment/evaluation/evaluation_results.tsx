// src/components/EvaluationPage/index.tsx
import React from 'react';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiSpacer,
  EuiButtonEmpty,
  EuiHorizontalRule,
} from '@elastic/eui';
import {
  TEST_COMPARED_DOCUMENTS_RANK_1, TEST_COMPARED_DOCUMENTS_RANK_2,
  TEST_QUERY_RESPONSE
} from "../../../../test/constants";
import {
  ResultGridComponent
} from "../../query_compare/search_result/result_components/result_grid";

interface EvaluationPageProps {
  templateType: string;
  configData: any;
  onBack: () => void;
}

export const Evaluation_results = ({
                                 templateType,
                                 configData,
                                 onBack,
                               }: EvaluationPageProps) => {
  return (
    <EuiPanel paddingSize="l">
      <EuiFlexGroup direction="column">
        {/* Header Section */}
        <EuiFlexItem>
          <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
            <EuiFlexItem>
              <EuiTitle size="m">
                <h2>{templateType} Evaluation</h2>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                iconType="arrowLeft"
                onClick={onBack}
                size="s"
              >
                Back to Configuration
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="m" />
          <EuiHorizontalRule margin="none" />
        </EuiFlexItem>

        {/* Content Section */}
        <EuiFlexItem>
          <EuiFlexGroup direction="column" gutterSize="m">
            {/* Configuration Summary */}
            <EuiFlexItem>
              <EuiPanel color="subdued" paddingSize="m">
                <EuiTitle size="xs">
                  <h3>Configuration Summary</h3>
                </EuiTitle>
                <EuiSpacer size="s" />
                <pre style={{
                  background: '#f7f8fb',
                  padding: '12px',
                  borderRadius: '4px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(configData, null, 2)}
                </pre>
              </EuiPanel>
            </EuiFlexItem>

            {/* Evaluation Form */}
            <EuiFlexItem>
              <EuiPanel paddingSize="m">
                <EuiTitle size="xs">
                  <h3>Evaluation Results</h3>
                </EuiTitle>
                <EuiSpacer size="m" />
                {/* Add your evaluation form here */}
                <EuiFlexGroup gutterSize="m" direction="row">
                  <ResultGridComponent
                    queryResult={TEST_QUERY_RESPONSE}
                    resultNumber={1}
                    comparedDocumentsRank={TEST_COMPARED_DOCUMENTS_RANK_1}
                  />
                  <ResultGridComponent
                    queryResult={TEST_QUERY_RESPONSE}
                    resultNumber={2}
                    comparedDocumentsRank={TEST_COMPARED_DOCUMENTS_RANK_2}
                  />
                </EuiFlexGroup>
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
