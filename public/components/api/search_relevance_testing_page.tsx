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
import { postQuerySet, getQuerySet } from '../../services';
import { CoreStart } from '../../../../../src/core/public';

export interface TestProps {
  http: CoreStart['http'];
}
export const QuerySetTester = ({ http }: TestProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createResponse, setCreateResponse] = useState(null);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  const [id, setId] = useState('');
  const [getResponse, setGetResponse] = useState(null);
  const [isGetLoading, setIsGetLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsCreateLoading(true);
    setError(null);

    try {
      const postResult = await postQuerySet(name, description, http);
      setCreateResponse(postResult);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsCreateLoading(false);
    }
  };

  const handleGetSubmit = async (e) => {
    e.preventDefault();
    setIsGetLoading(true);
    setError(null);

    try {
      const listResult = await getQuerySet(id, http);
      setGetResponse(listResult);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGetLoading(false);
    }
  };

  return (
    <EuiPanel paddingSize="l">
      <EuiText>
        <h2>Query Set Tester</h2>
      </EuiText>
      <EuiSpacer size="m" />
      <EuiForm component="form" onSubmit={handleCreateSubmit}>
        <EuiFormRow label="Query Set Name:">
          <EuiFieldText
            placeholder="Enter Query Set Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
        </EuiFormRow>
        <EuiFormRow label="Query Set Description:">
          <EuiFieldText
            placeholder="Enter Query Set Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
        </EuiFormRow>
        <EuiSpacer size="m" />
        <EuiButton type="create submit" fill isCreateLoading={isCreateLoading}>
          {isCreateLoading ? 'Sending...' : 'Send Create Request'}
        </EuiButton>
        <EuiSpacer size="m" />
      </EuiForm>
      <EuiForm component="form" onSubmit={handleGetSubmit}>
        <EuiFormRow label="Get Query ID:">
          <EuiFieldText
            placeholder="Enter Get Query ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            fullWidth
          />
        </EuiFormRow>
        <EuiSpacer size="m" />
        <EuiButton type="get submit" fill isGetLoading={isGetLoading}>
          {isCreateLoading ? 'Sending...' : 'Send Get Request'}
        </EuiButton>
        <EuiSpacer size="m" />
      </EuiForm>
      <EuiSpacer size="l" />

      {error && (
        <EuiCallOut title="Error" color="danger" iconType="alert">
          <p>{error}</p>
        </EuiCallOut>
      )}

      {createResponse && (
        <>
          <EuiText>
            <h3>Create Response:</h3>
          </EuiText>
          <EuiSpacer size="s" />
          <EuiCodeBlock language="json" paddingSize="m" isCopyable>
            {JSON.stringify(createResponse, null, 2)}
          </EuiCodeBlock>
        </>
      )}

      {getResponse && (
        <>
          <EuiText>
            <h3>Get Response:</h3>
          </EuiText>
          <EuiSpacer size="s" />
          <EuiCodeBlock language="json" paddingSize="m" isCopyable>
            {typeof getResponse === 'string' ? getResponse : JSON.stringify(getResponse, null, 2)}
          </EuiCodeBlock>
        </>
      )}
    </EuiPanel>
  );
};

export default QuerySetTester;
