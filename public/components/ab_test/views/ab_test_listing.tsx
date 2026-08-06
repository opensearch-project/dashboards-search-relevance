/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { EuiButton, EuiCallOut, EuiFlexItem, EuiPageHeader, EuiPageTemplate } from '@elastic/eui';
import { RouteComponentProps } from 'react-router-dom';
import { CoreStart } from '../../../../../../src/core/public';
import { Routes } from '../../../../common';
import { DeleteModal } from '../../common/DeleteModal';
import { AbTestTable } from '../components/ab_test_table';
import { useAbTestList } from '../hooks/use_ab_test_list';
import { AbTestService } from '../services/ab_test_service';
import { AbTestListItem } from '../types';

interface AbTestListingProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  history: RouteComponentProps['history'];
}

export const AbTestListing: React.FC<AbTestListingProps> = ({ http, notifications, history }) => {
  const service = useMemo(() => new AbTestService(http), [http]);
  const { isLoading, error, refreshKey, findAbTests, deleteAbTest } = useAbTestList(
    service,
    notifications
  );
  const [abTestToDelete, setAbTestToDelete] = useState<AbTestListItem | null>(null);

  const handleDelete = async () => {
    if (!abTestToDelete) return;
    try {
      await deleteAbTest(abTestToDelete.test_id);
    } finally {
      setAbTestToDelete(null);
    }
  };

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="A/B Tests"
        description="View and manage your A/B tests. Click on a Test ID to view details and version history."
        rightSideItems={[
          <EuiButton
            onClick={() => history.push(Routes.AbTestCreate)}
            fill
            size="s"
            iconType="plus"
            data-test-subj="createAbTestPageButton"
            color="primary"
          >
            Create A/B Test
          </EuiButton>,
        ]}
      />

      <EuiFlexItem>
        {error ? (
          <EuiCallOut title="Error" color="danger">
            <p>{error}</p>
          </EuiCallOut>
        ) : (
          <AbTestTable
            refreshKey={refreshKey}
            isLoading={isLoading}
            findItems={findAbTests}
            onDelete={setAbTestToDelete}
            history={history}
          />
        )}
      </EuiFlexItem>

      {abTestToDelete && (
        <DeleteModal
          onClose={() => setAbTestToDelete(null)}
          onConfirm={handleDelete}
          itemName={abTestToDelete.name}
        />
      )}
    </EuiPageTemplate>
  );
};
