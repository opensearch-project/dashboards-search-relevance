/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiFlexItem, EuiCallOut, EuiPageTemplate, EuiPageHeader, EuiButton } from '@elastic/eui';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CoreStart } from '../../../../../../src/core/public';
import { Routes } from '../../../../common';
import { DeleteModal } from '../../common/DeleteModal';
import { QuerySetTable } from '../components/query_set_table';
import { useQuerySetList } from '../hooks/use_query_set_list';

interface QuerySetListingProps extends RouteComponentProps {
  http: CoreStart['http'];
}

export const QuerySetListing: React.FC<QuerySetListingProps> = ({ http, history }) => {
  const { isLoading, error, refreshKey, findQuerySets, deleteQuerySet, setError } = useQuerySetList(
    http
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [querySetToDelete, setQuerySetToDelete] = useState<any>(null);

  const handleDelete = async () => {
    try {
      await deleteQuerySet(querySetToDelete.id);
      setShowDeleteModal(false);
      setQuerySetToDelete(null);
    } catch (err) {
      setShowDeleteModal(false);
      setQuerySetToDelete(null);
    }
  };

  const handleDeleteClick = (item: any) => {
    setQuerySetToDelete(item);
    setShowDeleteModal(true);
  };

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Query Sets"
        description="View and manage your existing query sets. Click on a query set name to view details."
        rightSideItems={[
          <EuiButton
            onClick={() => history.push(Routes.QuerySetCreate)}
            fill
            size="s"
            iconType="plus"
            data-test-subj="createQuerySetButton"
            color="primary"
          >
            Create Query Set
          </EuiButton>,
        ]}
      />

      <EuiFlexItem>
        {error ? (
          <EuiCallOut title="Error" color="danger">
            <p>{error}</p>
          </EuiCallOut>
        ) : (
          <QuerySetTable
            refreshKey={refreshKey}
            isLoading={isLoading}
            findItems={findQuerySets}
            onDelete={handleDeleteClick}
            history={history}
          />
        )}
      </EuiFlexItem>

      {showDeleteModal && querySetToDelete && (
        <DeleteModal
          onClose={() => {
            setShowDeleteModal(false);
            setQuerySetToDelete(null);
          }}
          onConfirm={handleDelete}
          itemName={querySetToDelete.name}
        />
      )}
    </EuiPageTemplate>
  );
};

export const QuerySetListingWithRoute = withRouter(QuerySetListing);
export default QuerySetListingWithRoute;
