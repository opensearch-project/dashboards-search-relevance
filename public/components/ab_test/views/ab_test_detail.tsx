/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  EuiButton,
  EuiLoadingSpinner,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import moment from 'moment';
import { CoreStart } from '../../../../../../src/core/public';
import { useConfig } from '../../../contexts/date_format_context';
import { VersionHistory } from '../components/version_history';
import { useAbTestDetail } from '../hooks/use_ab_test_detail';
import { AbTestService } from '../services/ab_test_service';

interface AbTestDetailProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  testId: string;
  history?: { push: (path: string) => void };
}

/** Read-only view of a test's configuration plus its version history. */
export const AbTestDetail: React.FC<AbTestDetailProps> = ({
  http,
  notifications,
  testId,
  history,
}) => {
  const service = useMemo(() => new AbTestService(http), [http]);
  const { dateFormat } = useConfig();
  const { test, configAName, configBName, snapshots, isLoading } = useAbTestDetail(
    service,
    notifications,
    testId
  );

  if (isLoading) {
    return (
      <EuiPageTemplate paddingSize="l" restrictWidth="100%">
        <EuiLoadingSpinner size="l" />
      </EuiPageTemplate>
    );
  }

  if (!test) {
    return (
      <EuiPageTemplate paddingSize="l" restrictWidth="100%">
        <EuiText>
          <p>A/B test not found.</p>
        </EuiText>
      </EuiPageTemplate>
    );
  }

  const formatDate = (timestamp: string) =>
    timestamp ? moment(timestamp).format(dateFormat) : '-';

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle={test.name || test.testId}
        rightSideItems={[
          <EuiButton
            iconType="arrowLeft"
            size="s"
            onClick={() => history && history.push('/abTest')}
          >
            Back
          </EuiButton>,
        ]}
      />

      <EuiPanel paddingSize="l">
        <EuiTitle size="s">
          <h3>Test Details</h3>
        </EuiTitle>
        <EuiSpacer size="m" />
        <EuiText size="s">
          <p>
            <strong>Test ID:</strong> {test.testId}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            {test.enabled ? 'Active (Interleaving ON)' : 'Disabled (Interleaving OFF)'}
          </p>
          <p>
            <strong>Result Size:</strong> {test.size}
          </p>
          <p>
            <strong>Created:</strong> {formatDate(test.createdAt)}
          </p>
          <p>
            <strong>Updated:</strong> {formatDate(test.updatedAt)}
          </p>
        </EuiText>

        <EuiSpacer size="l" />
        <EuiTitle size="s">
          <h3>Search Configurations</h3>
        </EuiTitle>
        <EuiSpacer size="m" />
        <EuiText size="s">
          <p>
            <strong>Configuration A:</strong> {configAName}
          </p>
          <p>
            <code>{test.configA}</code>
          </p>
          <EuiSpacer size="s" />
          <p>
            <strong>Configuration B:</strong> {configBName}
          </p>
          <p>
            <code>{test.configB}</code>
          </p>
        </EuiText>

        <EuiSpacer size="l" />
        <EuiTitle size="s">
          <h3>Search Endpoint</h3>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiText size="s">
          <code>POST /_plugins/_search_relevance/ab_tests/{test.testId}/_search</code>
        </EuiText>
      </EuiPanel>

      <EuiSpacer size="l" />
      <VersionHistory snapshots={snapshots} />
    </EuiPageTemplate>
  );
};
