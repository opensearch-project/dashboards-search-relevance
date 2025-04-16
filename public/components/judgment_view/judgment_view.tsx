/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteComponentProps } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
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
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';

interface JudgmentViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const JudgmentView: React.FC<JudgmentViewProps> = ({ http, id }) => {
  const [judgment, setJudgment] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const JudgmentViewPane: React.FC = () => {
    const formatJson = (json: string) => {
      try {
        return JSON.stringify(JSON.parse(json), null, 2);
      } catch {
        return json;
      }
    };

    return (
      <EuiForm>
        <EuiFormRow
          label="Judgment Name"
          fullWidth
        >
          <EuiText>{judgment.name}</EuiText>
        </EuiFormRow>

        <EuiFormRow
          label="Type"
          fullWidth
        >
          <EuiText>{judgment.type}</EuiText>
        </EuiFormRow>

        <EuiFormRow
          label="Metadata"
          fullWidth
        >
          <EuiText>
            {Object.entries(judgment.metadata).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {JSON.stringify(value)}
              </p>
            ))}
          </EuiText>
        </EuiFormRow>

        <EuiFormRow
          label="JudgmentScores"
          fullWidth
        >
          <EuiPanel
            paddingSize="s"
            hasShadow={false}
            style={{ maxHeight: '200px', overflow: 'auto' }}
          >
            <EuiCodeBlock language="json" paddingSize="s" isCopyable>
              {JSON.stringify(judgment.judgmentScores, null, 2)}
            </EuiCodeBlock>
          </EuiPanel>
        </EuiFormRow>
      </EuiForm>


    );
  };

  useEffect(() => {
    const fetchJudgment = async () => {
      try {
        setLoading(true);
        const response = await http.get(ServiceEndpoints.Judgments);
        const list = response ? response.hits.hits.map((hit: any) => ({ ...hit._source })) : [];
        const filteredList = list.filter((item: any) => item.id === id);

        if (filteredList.length > 0) {
          setJudgment(filteredList[0]);
        } else {
          setError('No matching judgment found');
        }
      } catch (err) {
        setError('Error loading judgment data');
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJudgment();
  }, [http, id]);

  if (loading) {
    return <div>Loading judgment data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Judgment Details"
        description="View the details of your judgment"
      />
      <EuiSpacer size="l" />
      <EuiPanel hasBorder={true}>
        <JudgmentViewPane />
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export default JudgmentView;
