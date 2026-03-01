/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import {
  EuiText,
  EuiCodeBlock,
  EuiSpacer,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
  EuiCode,
} from '@elastic/eui';

/** Sample NDJSON content for queries without reference answers */
const SAMPLE_QUERIES_BASIC = `{"queryText": "red bluejeans"}
{"queryText": "table top bandsaw for metal"}
{"queryText": "tan strappy heels for women"}
{"queryText": "tank top plus size women"}
{"queryText": "tape and mudding tools"}`;

/** Sample NDJSON content for queries with reference answers */
const SAMPLE_QUERIES_WITH_REFERENCES = `{"queryText": "What is the capital of France?", "referenceAnswer": "Paris"}
{"queryText": "Who wrote 'Romeo and Juliet'?", "referenceAnswer": "William Shakespeare"}
{"queryText": "What is the chemical symbol for water?", "referenceAnswer": "H2O"}
{"queryText": "What is the highest mountain in the world?", "referenceAnswer": "Mount Everest"}
{"queryText": "When was the first iPhone released?", "referenceAnswer": "June 29, 2007"}`;

/** Example showing mixed input formats for text input */
const TEXT_INPUT_EXAMPLES = `red bluejeans
query: "capital of France?", answer: "Paris"
{"queryText": "acid wash jeans", "referenceAnswer": "denim"}`;

/**
 * Creates a downloadable file from string content and triggers browser download.
 * Uses Blob API for cross-browser compatibility.
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * QuerySetHelpButton provides a help button that opens a flyout with documentation
 * for query set input formats. It displays format examples and allows users to
 * download sample files.
 */
export const QuerySetHelpButton: React.FC = () => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);

  const openFlyout = useCallback(() => {
    setIsFlyoutOpen(true);
  }, []);

  const closeFlyout = useCallback(() => {
    setIsFlyoutOpen(false);
  }, []);

  const handleDownloadBasicSample = useCallback(() => {
    downloadFile(SAMPLE_QUERIES_BASIC, 'query_set_example.ndjson', 'application/x-ndjson');
  }, []);

  const handleDownloadReferenceSample = useCallback(() => {
    downloadFile(
      SAMPLE_QUERIES_WITH_REFERENCES,
      'query_set_example_with_references.ndjson',
      'application/x-ndjson'
    );
  }, []);

  return (
    <>
      <EuiButtonEmpty
        size="xs"
        color="primary"
        onClick={openFlyout}
        data-test-subj="querySetHelpButton"
      >
        Help
      </EuiButtonEmpty>

      {isFlyoutOpen && (
        <EuiFlyout
          ownFocus
          onClose={closeFlyout}
          aria-labelledby="querySetHelpFlyoutTitle"
          paddingSize="l"
          data-test-subj="querySetHelpFlyout"
        >
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="m">
              <h2 id="querySetHelpFlyoutTitle">Help</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiText>
              <h3>Text Input Format</h3>
              <p>
                You can manually add queries by typing them one per line in the text area.
                Multiple formats are supported and can be mixed freely:
              </p>
              <ul>
                <li>
                  <strong>Plain text:</strong> One query per line (no reference answer)
                </li>
                <li>
                  <strong>Key-value format:</strong> <EuiCode>query: "...", answer: "..."</EuiCode>
                </li>
                <li>
                  <strong>NDJSON format:</strong>{' '}
                  <EuiCode>{'{"queryText": "...", "referenceAnswer": "..."}'}</EuiCode>
                </li>
              </ul>

              <h4>Example</h4>
              <EuiCodeBlock isCopyable language="text" data-test-subj="textInputExample">
                {TEXT_INPUT_EXAMPLES}
              </EuiCodeBlock>

              <EuiSpacer size="l" />

              <h3>File Upload</h3>
              <p>
                Upload a file containing queries in NDJSON format. Each line must be a valid JSON
                object with a <EuiCode>queryText</EuiCode> field. The{' '}
                <EuiCode>referenceAnswer</EuiCode> field is optional.
              </p>
              <p>Download sample files to see the expected format:</p>
            </EuiText>

            <EuiSpacer size="m" />

            <EuiFlexGroup gutterSize="s" responsive={false}>
              <EuiFlexItem grow={false}>
                <EuiButton
                  iconType="download"
                  onClick={handleDownloadBasicSample}
                  data-test-subj="downloadBasicSampleButton"
                >
                  Download sample file
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  iconType="download"
                  onClick={handleDownloadReferenceSample}
                  data-test-subj="downloadReferenceSampleButton"
                >
                  Download sample with references
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </>
  );
};