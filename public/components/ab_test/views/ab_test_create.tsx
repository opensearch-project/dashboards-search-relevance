/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  EuiCallOut,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { AbTestForm } from '../components/ab_test_form';
import { useAbTestForm } from '../hooks/use_ab_test_form';
import { AbTestService } from '../services/ab_test_service';

interface AbTestCreateProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  history?: { push: (path: string) => void };
}

export const AbTestCreate: React.FC<AbTestCreateProps> = ({ http, notifications, history }) => {
  const service = useMemo(() => new AbTestService(http), [http]);
  const formState = useAbTestForm(service, notifications, history);

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Create A/B Test"
        description="Compare two search configurations using Team Draft Interleaving. Results from both configurations are interleaved and served to users, allowing you to measure which configuration performs better based on click behavior."
      />

      <EuiPanel paddingSize="l">
        {formState.isCreated && (
          <>
            <EuiCallOut title="A/B Test Created" color="success" iconType="check">
              <EuiText size="s">
                <p>
                  Test ID: <strong>{formState.createdTestId}</strong>
                </p>
                <p>
                  Search endpoint:{' '}
                  <code>
                    POST /_plugins/_search_relevance/ab_tests/{formState.createdTestId}/_search
                  </code>
                </p>
              </EuiText>
            </EuiCallOut>
            <EuiSpacer size="l" />
          </>
        )}

        <AbTestForm formState={formState} />
      </EuiPanel>
    </EuiPageTemplate>
  );
};
