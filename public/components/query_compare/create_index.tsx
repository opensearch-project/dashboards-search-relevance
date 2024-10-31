/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiButton, EuiSpacer } from '@elastic/eui';
import { CoreStart } from '../../../../../src/core/public';

interface CreateIndexProps {
  application: CoreStart['application'];
  chrome: CoreStart['chrome'];
}

export const CreateIndex: React.FC<CreateIndexProps> = ({ application, chrome }) => {
  return (
    <>
      <EuiSpacer size="xl" />
      <EuiButton
        onClick={() => {
          application.navigateToApp('management', {
            path: '/opensearch-dashboards/indexPatterns',
          });
        }}
      >
        Create index pattern
      </EuiButton>
    </>
  );
};
