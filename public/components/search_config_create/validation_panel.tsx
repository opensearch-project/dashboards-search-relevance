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
  queryBody: string;
  http: CoreStart['http'];
  notifications: NotificationsStart;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  selectedIndex,
  queryBody,
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

    if (!queryBody.trim()) {
      notifications.toasts.addWarning({title: 'Validation Warning', text: 'Query body is required'});
      return;
    }

    try {
      setIsValidating(true);
      const replacedQueryBody = queryBody.replace(/%SearchText%/g, testSearchText || '');
      const parsedQuery = JSON.parse(replacedQueryBody);

      const requestBody = {
        query: {
          index: selectedIndex[0].label,
          size: 5, // hard-coded to return 5 items
          query: parsedQuery,
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
        placeholder="Enter a text to replace %SearchText% for testing ..."
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
