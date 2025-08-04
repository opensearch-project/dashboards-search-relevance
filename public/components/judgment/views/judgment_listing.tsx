/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteComponentProps, withRouter } from 'react-router-dom';
import React, { useState } from 'react';
import {
  EuiButtonEmpty,
  EuiButton,
  EuiButtonIcon,
  EuiCallOut,
  EuiFlexItem,
  EuiPageHeader,
  EuiPageTemplate,
  EuiText,
  EuiHealth,
} from '@elastic/eui';
import moment from 'moment';
import { CoreStart } from '../../../../../../src/core/public';
import {
  reactRouterNavigate,
  TableListView,
} from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { DeleteModal } from '../../common/DeleteModal';
import { useConfig } from '../../../contexts/date_format_context';
import { Routes } from '../../../../common';
import { useJudgmentList } from '../hooks/use_judgment_list';
import { getStatusColor } from '../../common_utils/status';

interface JudgmentListingProps extends RouteComponentProps {
  http: CoreStart['http'];
}

export const JudgmentListing: React.FC<JudgmentListingProps> = ({ http, history }) => {
  const { dateFormat } = useConfig();
  const {
    isLoading,
    error,
    hasProcessing,
    isBackgroundRefreshing,
    refreshKey,
    findJudgments,
    deleteJudgment,
  } = useJudgmentList(http);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [judgmentToDelete, setJudgmentToDelete] = useState<any>(null);

  // Handle delete function
  const handleDelete = async () => {
    await deleteJudgment(judgmentToDelete.id);
    // Close modal regardless of success/failure
    setShowDeleteModal(false);
    setJudgmentToDelete(null);
  };

  // Column definitions
  const tableColumns = [
    {
      field: 'name',
      name: 'Name',
      dataType: 'string',
      sortable: true,
      render: (
        name: string,
        judgment: {
          id: string;
        }
      ) => (
        <>
          <EuiButtonEmpty
            size="xs"
            {...reactRouterNavigate(history, `${Routes.JudgmentViewPrefix}/${judgment.id}`)}
          >
            {name}
          </EuiButtonEmpty>
        </>
      ),
    },
    {
      field: 'status',
      name: 'Status',
      dataType: 'string',
      sortable: true,
      render: (status: string) => {
        return <EuiHealth color={getStatusColor(status)}>{status}</EuiHealth>;
      },
    },
    {
      field: 'type',
      name: 'Judgment Type',
      dataType: 'string',
      sortable: true,
    },
    {
      field: 'timestamp',
      name: 'Timestamp',
      dataType: 'string',
      sortable: true,
      render: (timestamp: string) => (
        <EuiText size="s">{moment(timestamp).format(dateFormat)}</EuiText>
      ),
    },
    {
      field: 'id',
      name: 'Actions',
      width: '10%',
      render: (id: string, item: any) => (
        <EuiButtonIcon
          aria-label="Delete"
          iconType="trash"
          color="danger"
          onClick={() => {
            setJudgmentToDelete(item);
            setShowDeleteModal(true);
          }}
        />
      ),
    },
  ];

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Judgments"
        description={`View and manage your existing judgments. Click on a judgment list name to view details.${
          hasProcessing ? ` (Auto-refreshing for 10 min${isBackgroundRefreshing ? ' ●' : ''})` : ''
        }`}
        rightSideItems={[
          <EuiButton
            onClick={() => history.push(Routes.JudgmentCreate)}
            fill
            size="s"
            iconType="plus"
            data-test-subj="createJudgmentButton"
            color="primary"
          >
            Create Judgment
          </EuiButton>,
        ]}
      />

      <EuiFlexItem>
        {error ? (
          <EuiCallOut title="Error" color="danger">
            <p>{error}</p>
          </EuiCallOut>
        ) : (
          <TableListView
            key={refreshKey}
            headingId="judgmentListingHeading"
            entityName="Judgment"
            entityNamePlural="Judgments"
            tableColumns={tableColumns}
            findItems={findJudgments}
            loading={isLoading}
            initialPageSize={10}
            search={{
              box: {
                incremental: true,
                placeholder: 'Search judgments...',
                schema: true,
              },
            }}
            sorting={{
              sort: {
                field: 'timestamp',
                direction: 'desc',
              },
            }}
          />
        )}
      </EuiFlexItem>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && judgmentToDelete && (
        <DeleteModal
          onClose={() => {
            setShowDeleteModal(false);
            setJudgmentToDelete(null);
          }}
          onConfirm={handleDelete}
          itemName={judgmentToDelete.name}
        />
      )}
    </EuiPageTemplate>
  );
};

export const JudgmentListingWithRoute = withRouter(JudgmentListing);

export default JudgmentListingWithRoute;
