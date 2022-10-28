/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiPageBody, EuiEmptyPrompt, EuiLink } from '@elastic/eui';

import { Header } from '../common/header/header';

export const CreateIndex = () => {
  return (
    <>
      <Header />
      <EuiPageBody>
        <EuiEmptyPrompt
          title={<h2>Create an index to start comparing search results. </h2>}
          body={
            <p>
              Before you can query data, you have to index it.{' '}
              <EuiLink>Learn how to index your data.</EuiLink>
            </p>
          }
        />
      </EuiPageBody>
    </>
  );
};
