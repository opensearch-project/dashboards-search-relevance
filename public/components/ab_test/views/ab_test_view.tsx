/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  EuiButton,
  EuiComboBox,
  EuiFormRow,
  EuiLoadingSpinner,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { useAbTestView } from '../hooks/use_ab_test_view';
import { AbTestService } from '../services/ab_test_service';
import { SearchConfigOption } from '../types';

interface AbTestViewProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  testId: string;
  history?: { push: (path: string) => void };
}

/** Update page: toggle interleaving and reassign the two search configurations. */
export const AbTestView: React.FC<AbTestViewProps> = ({ http, notifications, testId, history }) => {
  const service = useMemo(() => new AbTestService(http), [http]);
  const {
    test,
    searchConfigs,
    selectedConfigA,
    setSelectedConfigA,
    selectedConfigB,
    setSelectedConfigB,
    isLoading,
    isSaving,
    toggleInterleaving,
    updateConfigurations,
  } = useAbTestView(service, notifications, testId, history);

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

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle={test.name}
        rightSideItems={[
          <EuiButton onClick={() => history && history.push('/abTest/search')} size="s">
            Search
          </EuiButton>,
        ]}
      />

      <EuiPanel paddingSize="l">
        <EuiText size="s">
          <p>
            <strong>Test ID:</strong> {test.testId}
          </p>
          <p>
            <strong>Search Endpoint:</strong>{' '}
            <code>POST /_plugins/_search_relevance/ab_tests/{test.testId}/_search</code>
          </p>
          <p>
            <strong>Size:</strong> {test.size}
          </p>
        </EuiText>
        <EuiSpacer size="l" />

        <EuiFormRow
          label="Interleaving"
          helpText="When disabled, only Config A results are returned"
        >
          <EuiSwitch
            label={test.enabled ? 'Active' : 'Disabled'}
            checked={test.enabled}
            onChange={toggleInterleaving}
            disabled={isSaving}
            data-test-subj="abTestInterleavingSwitch"
          />
        </EuiFormRow>

        <EuiSpacer size="l" />
        <EuiTitle size="s">
          <h3>Update Search Configurations</h3>
        </EuiTitle>
        <EuiSpacer size="m" />

        <EuiFormRow
          label="Search Configuration A"
          helpText={
            selectedConfigA.length > 0
              ? `Config ID: ${selectedConfigA[0].value}`
              : 'Select a configuration'
          }
        >
          <EuiComboBox
            placeholder="Select configuration A"
            options={searchConfigs}
            selectedOptions={selectedConfigA}
            onChange={(selected) => setSelectedConfigA(selected as SearchConfigOption[])}
            singleSelection={{ asPlainText: true }}
            data-test-subj="abTestUpdateConfigAComboBox"
          />
        </EuiFormRow>

        <EuiSpacer size="m" />

        <EuiFormRow
          label="Search Configuration B"
          helpText={
            selectedConfigB.length > 0
              ? `Config ID: ${selectedConfigB[0].value}`
              : 'Select a configuration'
          }
        >
          <EuiComboBox
            placeholder="Select configuration B"
            options={searchConfigs}
            selectedOptions={selectedConfigB}
            onChange={(selected) => setSelectedConfigB(selected as SearchConfigOption[])}
            singleSelection={{ asPlainText: true }}
            data-test-subj="abTestUpdateConfigBComboBox"
          />
        </EuiFormRow>

        <EuiSpacer size="l" />
        <EuiButton
          onClick={updateConfigurations}
          isLoading={isSaving}
          fill
          data-test-subj="saveAbTestConfigsButton"
        >
          Save Configuration Changes
        </EuiButton>
      </EuiPanel>
    </EuiPageTemplate>
  );
};
