/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiFieldText, EuiSpacer, EuiPanel, EuiButton, EuiFlexItem } from '@elastic/eui';
import { NotificationsStart } from '../../../../../core/public';
import { ServiceEndpoints } from '../../../common';
import { ResultsPanel } from './results_panel';

interface ValidationPanelProps {
  selectedIndex: Array<{ label: string }>;
  query: string;
  http: CoreStart['http'];
  notifications: NotificationsStart;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  selectedIndex,
  query,
  http,
  notifications,
}) => {
  const [testSearchText, setTestSearchText] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const validateSearchQuery = async () => {
    if (!selectedIndex.length) {
      notifications.toasts.addWarning({title: 'Validation Warning', text: 'No index. Please select an index'});
      return;
    }

    if (!query.trim()) {
      notifications.toasts.addWarning({title: 'Validation Warning', text: 'Query body is required'});
      return;
    }

    try {
      setIsValidating(true);
      const replacedQuery = query.replace(/%SearchText%/g, testSearchText || '');
      const parsedQuery = JSON.parse(replacedQuery);
      const queryBody = parsedQuery.query ? parsedQuery : { query: parsedQuery };

      const requestBody = {
        query: {
          index: selectedIndex[0].label,
          size: 5, // hard-coded to return 5 items
          ...queryBody,
        },
      };

      const response = await http.post(ServiceEndpoints.GetSingleSearchResults, {
        body: JSON.stringify(requestBody),
      });

      if (!response || !response.result?.hits?.hits?.length) {
          throw new Error('Search returned no results');
      }

      setSearchResults(response.result);
      notifications.toasts.addSuccess('Search query is valid');
    } catch (error) {
      let errorMessage = 'Failed to validate search query';
      if (error.body?.message) {
        errorMessage = error.body.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      // Add warning toast instead of error since it's not a blocker
      notifications.toasts.addWarning({
        title: 'Validation Warning',
        text: errorMessage,
        toastLifeTimeMs: 5000, // 5 seconds display time
      });
      setSearchResults(null);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <EuiFlexItem>
      <EuiFieldText
        placeholder="Enter a user query to replace %SearchText% placeholder to validate the search configuration..."
        value={testSearchText}
        onChange={(e) => setTestSearchText(e.target.value)}
        fullWidth
        data-test-subj="testSearchTextInput"
      />
      <EuiSpacer size="m" />
      <EuiPanel hasBorder={true}>
        <EuiButton
          onClick={validateSearchQuery}
          fullWidth
          iconType="check"
          data-test-subj="validateSearchQueryButton"
        >
          Validate Search Configuration
        </EuiButton>
        <EuiSpacer size="l" />
        <ResultsPanel isValidating={isValidating} searchResults={searchResults} />
      </EuiPanel>
    </EuiFlexItem>
  );
};
