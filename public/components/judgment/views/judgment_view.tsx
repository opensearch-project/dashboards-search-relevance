/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteComponentProps } from 'react-router-dom';
import React from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiCodeBlock,
} from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { useJudgmentView } from '../hooks/use_judgment_view';

interface JudgmentViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const JudgmentView: React.FC<JudgmentViewProps> = ({ http, id }) => {
  const { judgment, loading, error, formatJson } = useJudgmentView(http, id);

  const JudgmentViewPane: React.FC = () => {
    return (
      <EuiForm>
        <EuiFormRow label="Judgment Name" fullWidth>
          <EuiText>{judgment.name}</EuiText>
        </EuiFormRow>

        <EuiFormRow label="Type" fullWidth>
          <EuiText>{judgment.type}</EuiText>
        </EuiFormRow>

        <EuiFormRow label="Metadata" fullWidth>
          <EuiText>
            {Object.entries(judgment.metadata).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {JSON.stringify(value)}
              </p>
            ))}
          </EuiText>
        </EuiFormRow>

        <EuiFormRow label="JudgmentRatings" fullWidth>
          <EuiPanel
            paddingSize="s"
            hasShadow={false}
            style={{ maxHeight: '200px', overflow: 'auto' }}
          >
            <EuiCodeBlock language="json" paddingSize="s" isCopyable>
              {JSON.stringify(judgment.judgmentRatings, null, 2)}
            </EuiCodeBlock>
          </EuiPanel>
        </EuiFormRow>
      </EuiForm>
    );
  };

  if (loading) {
    return <div>Loading judgment data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader pageTitle="Judgment Details" description="View the details of your judgment" />
      <EuiSpacer size="l" />
      <EuiPanel hasBorder={true}>
        <JudgmentViewPane />
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export default JudgmentView;