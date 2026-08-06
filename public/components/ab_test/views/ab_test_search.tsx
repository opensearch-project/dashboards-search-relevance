/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  EuiButton,
  EuiComboBox,
  EuiFieldText,
  EuiFormRow,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiSpacer,
} from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { ConfigQueryPreview } from '../components/config_query_preview';
import { SearchResultsList } from '../components/search_results_list';
import { useAbTestSearch } from '../hooks/use_ab_test_search';
import { AbTestService } from '../services/ab_test_service';
import { AbTestOption, SearchConfigOption } from '../types';

interface AbTestSearchProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  history?: { push: (path: string) => void };
}

export const AbTestSearch: React.FC<AbTestSearchProps> = ({ http, notifications, history }) => {
  const service = useMemo(() => new AbTestService(http), [http]);
  const {
    searchText,
    setSearchText,
    results,
    isSearching,
    testOptions,
    selectedTest,
    setSelectedTest,
    ubiIndexOptions,
    selectedUbiIndex,
    selectUbiIndex,
    queryA,
    queryB,
    configAName,
    configBName,
    search,
    registerClick,
  } = useAbTestSearch(service, notifications);

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="A/B Test Search"
        description="Run an interleaved search and register clicks against the configuration that produced each result."
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
        <EuiFormRow label="Select A/B Test">
          <EuiComboBox
            placeholder="Choose a test"
            options={testOptions}
            selectedOptions={selectedTest}
            onChange={(selected) => setSelectedTest(selected as AbTestOption[])}
            singleSelection={{ asPlainText: true }}
            data-test-subj="abTestSearchTestComboBox"
          />
        </EuiFormRow>

        <EuiSpacer size="m" />

        <EuiFormRow
          label="Search Query"
          helpText="Type your query — it replaces %SearchText% in both configs below"
        >
          <EuiFieldText
            placeholder="e.g., comedy, superhero, spy..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            fullWidth
            data-test-subj="abTestSearchTextInput"
            aria-label="Search query"
          />
        </EuiFormRow>

        <EuiSpacer size="m" />

        <EuiFormRow label="UBI Click Index" helpText="Clicks will be registered to this index">
          <EuiComboBox
            placeholder="Select UBI index"
            options={ubiIndexOptions}
            selectedOptions={selectedUbiIndex}
            onChange={(selected) => selectUbiIndex(selected as SearchConfigOption[])}
            singleSelection={{ asPlainText: true }}
            data-test-subj="abTestSearchUbiIndexComboBox"
          />
        </EuiFormRow>

        <EuiSpacer size="m" />

        <EuiButton
          fill
          onClick={search}
          isLoading={isSearching}
          data-test-subj="abTestSearchButton"
        >
          Search
        </EuiButton>
      </EuiPanel>

      <EuiSpacer size="l" />

      <ConfigQueryPreview
        queryA={queryA}
        queryB={queryB}
        configAName={configAName}
        configBName={configBName}
        searchText={searchText}
      />

      <EuiSpacer size="l" />

      <SearchResultsList results={results} onRegisterClick={registerClick} />
    </EuiPageTemplate>
  );
};
