/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
    EuiFlyout,
    EuiFlyoutBody,
    EuiFlyoutHeader,
    EuiText,
    EuiTitle,
    EuiCodeBlock,
    EuiLink,
    EuiCode,
    EuiButton,
    EuiSpacer,
} from '@elastic/eui';

interface QuerySetHelpFlyoutProps {
    onClose: () => void;
}

const sampleQueries = [
    { queryText: 'red bluejeans', referenceAnswer: '' },
    { queryText: 'red blue jeans', referenceAnswer: '' },
    { queryText: 'bluejeans', referenceAnswer: '' },
    { queryText: 'acid wash blue jeans', referenceAnswer: '' },
];

export const QuerySetHelpFlyout: React.FC<QuerySetHelpFlyoutProps> = ({ onClose }) => {
    const downloadSampleFile = () => {
        const element = document.createElement('a');
        const file = new Blob([sampleQueries.map((q) => JSON.stringify(q)).join('\n')], {
            type: 'application/x-ndjson',
        });
        element.href = URL.createObjectURL(file);
        element.download = 'sample_queries.ndjson';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <EuiFlyout ownFocus onClose={onClose} aria-labelledby="flyoutTitle" paddingSize="l">
            <EuiFlyoutHeader hasBorder>
                <EuiTitle size="m">
                    <h2 id="flyoutTitle">Help</h2>
                </EuiTitle>
            </EuiFlyoutHeader>
            <EuiFlyoutBody>
                <EuiText>

                    <h3>Text Input / CSV Format</h3>
                    <p>
                        You can manually add queries by typing them one per line in the text area, or by
                        uploading a file (NDJSON or CSV/Text).
                    </p>
                    <p>
                        <b>Format:</b> <code>query</code> or <code>query, reference_answer</code>
                    </p>
                    <p>
                        If your query contains a comma, enclose it in double quotes.
                    </p>

                    <EuiCodeBlock language="text" paddingSize="s" isCopyable>
                        {`red bluejeans\nwhat is the capital of France?, Paris\n"query with, comma", reference answer\n"query with, comma no reference"`}
                    </EuiCodeBlock>

                    <EuiSpacer />

                    <h3>File Upload</h3>
                    <p>
                        You can upload a file containing queries in NDJSON format. Each line must be a valid JSON object
                        with a <EuiCode>queryText</EuiCode> field.
                    </p>
                    <p>
                        You can download a sample file to see the expected format.
                    </p>
                    <EuiButton onClick={downloadSampleFile} iconType="download" size="s">
                        Download sample file
                    </EuiButton>
                </EuiText>
            </EuiFlyoutBody>
        </EuiFlyout>
    );
};
