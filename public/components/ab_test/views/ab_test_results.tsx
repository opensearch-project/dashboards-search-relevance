/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  EuiButton,
  EuiComboBox,
  EuiFormRow,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiSpacer,
} from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { ClickDistribution } from '../components/click_distribution';
import { SignificancePanel } from '../components/significance_panel';
import { useAbTestResults } from '../hooks/use_ab_test_results';
import { AbTestService } from '../services/ab_test_service';
import { AbTestOption, SearchConfigOption } from '../types';

interface AbTestResultsProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
}

export const AbTestResults: React.FC<AbTestResultsProps> = ({ http, notifications }) => {
  const service = useMemo(() => new AbTestService(http), [http]);
  const {
    testOptions,
    selectedTest,
    setSelectedTest,
    indexOptions,
    selectedIndex,
    setSelectedIndex,
    results,
    totalClicks,
    stats,
    isLoading,
    fetchResults,
  } = useAbTestResults(service, notifications);

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="A/B Test Results"
        description="Compare how many clicks each search configuration earned, and whether the difference is statistically significant."
      />

      <EuiPanel paddingSize="l">
        <EuiFormRow label="Select A/B Test">
          <EuiComboBox
            placeholder="Choose a test"
            options={testOptions}
            selectedOptions={selectedTest}
            onChange={(selected) => setSelectedTest(selected as AbTestOption[])}
            singleSelection={{ asPlainText: true }}
            data-test-subj="abTestResultsTestComboBox"
          />
        </EuiFormRow>

        <EuiSpacer size="m" />

        <EuiFormRow
          label="UBI Click Index"
          helpText="Select the index where click events are stored"
        >
          <EuiComboBox
            placeholder="Select an index"
            options={indexOptions}
            selectedOptions={selectedIndex}
            onChange={(selected) => setSelectedIndex(selected as SearchConfigOption[])}
            singleSelection={{ asPlainText: true }}
            data-test-subj="abTestResultsIndexComboBox"
          />
        </EuiFormRow>

        <EuiSpacer size="m" />

        <EuiButton
          fill
          onClick={fetchResults}
          isLoading={isLoading}
          data-test-subj="getAbTestResultsButton"
        >
          Get Results
        </EuiButton>
      </EuiPanel>

      <EuiSpacer size="l" />

      {results.length > 0 && (
        <EuiPanel paddingSize="l">
          <ClickDistribution results={results} totalClicks={totalClicks} />
          {stats && (
            <>
              <EuiSpacer size="l" />
              <SignificancePanel stats={stats} />
            </>
          )}
        </EuiPanel>
      )}
    </EuiPageTemplate>
  );
};
