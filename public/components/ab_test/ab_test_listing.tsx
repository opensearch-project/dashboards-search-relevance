/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CoreStart } from '../../../../../src/core/public';

interface AbTestListingProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  history: any;
}

export const AbTestListing = ({ http, notifications, history }: AbTestListingProps) => {
  return (
    <div>
      <h1>A/B Tests</h1>
      <p>This is the listing page. If you see this, the route works.</p>
      <button onClick={() => history.push('/abTest/create')}>Create A/B Test</button>
    </div>
  );
};
