/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { EuiFieldText, EuiSpacer, EuiPanel, EuiButton, EuiFlexItem } from '@elastic/eui';
import { ResultsPanel } from './results_panel';

interface ValidationPanelProps {
  testSearchText: string;
  setTestSearchText: (text: string) => void;
  isValidating: boolean;
  searchResults: any;
  onValidate: () => void;
  disabled?: boolean;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = memo(
  ({
    testSearchText,
    setTestSearchText,
    isValidating,
    searchResults,
    onValidate,
    disabled = false,
  }) => {
    return (
      <EuiFlexItem>
        <EuiFieldText
          placeholder="Enter a user query to replace %SearchText% placeholder to validate the search configuration..."
          value={testSearchText}
          onChange={(e) => setTestSearchText(e.target.value)}
          fullWidth
          data-test-subj="testSearchTextInput"
          disabled={disabled}
        />
        <EuiSpacer size="m" />
        <EuiPanel hasBorder={true}>
          <EuiButton
            onClick={onValidate}
            fullWidth
            iconType="check"
            data-test-subj="validateSearchQueryButton"
            disabled={disabled}
          >
            Validate Search Configuration
          </EuiButton>
          <EuiSpacer size="l" />
          <ResultsPanel isValidating={isValidating} searchResults={searchResults} />
        </EuiPanel>
      </EuiFlexItem>
    );
  }
);
