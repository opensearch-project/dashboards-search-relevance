/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiText,
  EuiFieldText,
  EuiButton,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiPanel,
  EuiCallOut,
  EuiCodeBlock,
} from '@elastic/eui';
import { postQuerySet } from '../../services';
import { CoreStart } from '../../../../../src/core/public';

export interface TestProps {
  http: CoreStart['http'];
}
export const QuerySetTester = ({ http }: TestProps) => {
  const [querySetId, setQuerySetId] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await postQuerySet(querySetId, http);
      setResponse(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EuiPanel paddingSize="l">
      <EuiText>
        <h2>Query Set Tester</h2>
      </EuiText>
      <EuiSpacer size="m" />
      <EuiForm component="form" onSubmit={handleSubmit}>
        <EuiFormRow label="Query Set ID:">
          <EuiFieldText
            placeholder="Enter Query Set ID"
            value={querySetId}
            onChange={(e) => setQuerySetId(e.target.value)}
            fullWidth
          />
        </EuiFormRow>
        <EuiSpacer size="m" />
        <EuiButton type="submit" fill isLoading={isLoading}>
          {isLoading ? 'Sending...' : 'Send Request'}
        </EuiButton>
      </EuiForm>
      <EuiSpacer size="l" />

      {error && (
        <EuiCallOut title="Error" color="danger" iconType="alert">
          <p>{error}</p>
        </EuiCallOut>
      )}

      {response && (
        <>
          <EuiText>
            <h3>Response:</h3>
          </EuiText>
          <EuiSpacer size="s" />
          <EuiCodeBlock language="json" paddingSize="m" isCopyable>
            {JSON.stringify(response, null, 2)}
          </EuiCodeBlock>
        </>
      )}
    </EuiPanel>
  );
};

export default QuerySetTester;
