/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiPageBody, EuiEmptyPrompt, EuiLink } from '@elastic/eui';

import { Header } from '../common/header';

export const CreateIndex = () => {
  return (
    <>
      <Header />
      <EuiPageBody>
        <EuiEmptyPrompt
          title={<h2>Create an index to start comparing search results. </h2>}
          body={
            <p>
              Before you can query data, you need to index it.{' '}
              <EuiLink
                href="https://opensearch.org/docs/latest/opensearch/index-data/"
                target="_blank"
              >
                Learn how to index your data
              </EuiLink>
              , or <EuiLink href="/app/home#/tutorial_directory">add sample data </EuiLink>to
              OpenSearch Dashboards.
            </p>
          }
        />
      </EuiPageBody>
    </>
  );
};
