/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteComponentProps, withRouter } from 'react-router-dom';
import React, { useState } from 'react';
import {
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiCallOut,
  EuiFlexItem,
  EuiPageHeader,
  EuiPageTemplate,
  EuiText,
} from '@elastic/eui';
import { CoreStart } from '../../../../../src/core/public';
import {
  reactRouterNavigate,
  TableListView,
} from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { DeleteModal } from '../common/DeleteModal';
import { useConfig } from '../../contexts/date_format_context';
import { ServiceEndpoints } from '../../../common';
import moment from 'moment';

interface JudgmentListingProps extends RouteComponentProps {
  http: CoreStart['http'];
}

export const JudgmentListing: React.FC<JudgmentListingProps> = ({ http, history }) => {
  const { dateFormat } = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [judgmentToDelete, setJudgmentToDelete] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle delete function
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await http.delete(`${ServiceEndpoints.Judgments}/${judgmentToDelete.id}`);
      console.log('Delete successful:', response);

      // Close modal and clear state
      setShowDeleteModal(false);
      setJudgmentToDelete(null);
      setError(null);

      // Force table refresh
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError('Failed to delete judgment');
      setShowDeleteModal(false);
      setJudgmentToDelete(null);
    } finally {
      setIsLoading(false);
    }
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
            {...reactRouterNavigate(history, `/judgment/view/${judgment.id}`)}
          >
            {name}
          </EuiButtonEmpty>
        </>
      ),
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

  const mapJudgmentFields = (obj: any) => {
    return {
      id: obj._source.id,
      name: obj._source.name,
      type: obj._source.type,
      timestamp: obj._source.timestamp,
    };
  };

  // Data fetching function
  const findJudgments = async (search: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get(ServiceEndpoints.Judgments);
      const list = response ? response.hits.hits.map(mapJudgmentFields) : [];
      // TODO: too many reissued requests on search
      const filteredList = search
        ? list.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
        : list;
      return {
        total: filteredList.length,
        hits: filteredList,
      };
    } catch (err) {
      setError('Failed to load judgments');
      return {
        total: 0,
        hits: [],
      };
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Judgments"
        description="View and manage your existing judgments. Click on a judgment name to view details."
        rightSideItems={[
          <EuiButtonEmpty
            iconType="arrowLeft"
            size="s"
            onClick={() => history.push('/')}
            data-test-subj="backToHomeButton"
          >
            Back to Home
          </EuiButtonEmpty>,
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
            pagination={{
              initialPageSize: 10,
              pageSizeOptions: [5, 10, 20, 50],
            }}
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
