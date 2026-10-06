/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFormRow,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFilePicker,
} from '@elastic/eui';

interface ImportedJudgmentFieldsProps {
  handleJudgmentFileContent?: (files: FileList | null) => void;
  filePickerId?: string;
  uploadError?: string;
}

export const ImportedJudgmentFields: React.FC<ImportedJudgmentFieldsProps> = ({
  handleJudgmentFileContent,
  filePickerId = 'judgmentCsvFilePicker',
  uploadError,
}) => {
  return (
    <EuiFormRow
      label="Upload Judgment CSV"
      error={uploadError}
      isInvalid={Boolean(uploadError)}
      helpText="Upload a CSV file in the format: query,docid,rating"
      fullWidth
    >
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFilePicker
            id={filePickerId}
            initialPromptText="Select or drag and drop a judgment CSV file"
            onChange={(files) => handleJudgmentFileContent?.(files)}
            display="large"
            aria-label="Upload judgment CSV file"
            accept=".csv,text/csv"
            data-test-subj="importedJudgmentFilePicker"
            compressed
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFormRow>
  );
};
