/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiPanel,
  EuiText,
  EuiCallOut,
  EuiPageTemplate,
  EuiPageHeader,
  EuiButtonIcon,
  EuiButton,
} from '@elastic/eui';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  reactRouterNavigate,
  TableListView,
} from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';
import { DeleteModal } from '../common/DeleteModal';
import { useConfig } from '../../contexts/date_format_context';
import moment from 'moment';

interface QuerySetListingProps extends RouteComponentProps {
  http: CoreStart['http'];
}

export const QuerySetListing: React.FC<QuerySetListingProps> = ({ http, history }) => {
  const { dateFormat } = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [querySetToDelete, setQuerySetToDelete] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle delete function
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await http.delete(`${ServiceEndpoints.QuerySets}/${querySetToDelete.id}`);
      console.log('Delete successful:', response);

      // Close modal and clear state
      setShowDeleteModal(false);
      setQuerySetToDelete(null);
      setError(null);

      // Force table refresh
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError('Failed to delete query set');
      setShowDeleteModal(false);
      setQuerySetToDelete(null);
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
        querySet: {
          id: string;
        }
      ) => (
        <>
          <EuiButtonEmpty
            size="xs"
            {...reactRouterNavigate(history, `/querySet/view/${querySet.id}`)}
          >
            {name}
          </EuiButtonEmpty>
        </>
      ),
    },
    {
      field: 'sampling',
      name: 'Sampling Method',
      dataType: 'string',
      sortable: true,
    },
    {
      field: 'description',
      name: 'Description',
      dataType: 'string',
      sortable: true,
    },
    {
      field: 'numQueries',
      name: 'Query Set Size',
      dataType: 'number',
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
            setQuerySetToDelete(item);
            setShowDeleteModal(true);
          }}
        />
      ),
    },
  ];

  const mapQuerySetFields = (obj: any) => {
    return {
      id: obj._source.id,
      name: obj._source.name,
      sampling: obj._source.sampling,
      description: obj._source.description,
      timestamp: obj._source.timestamp,
      numQueries: Object.keys(obj._source.querySetQueries).length,
    };
  };

  // Data fetching function
  const findQuerySets = async (search: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get(ServiceEndpoints.QuerySets);
      const list = response ? response.hits.hits.map(mapQuerySetFields) : [];
      // TODO: too many reissued requests on search
      const filteredList = search
        ? list.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
        : list;
      return {
        total: filteredList.length,
        hits: filteredList,
      };
    } catch (err) {
      setError('Failed to load query sets');
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
        pageTitle="Query Sets"
        description="View and manage your existing query sets. Click on a query set name to view details."
        rightSideItems={[
          <EuiButton
            onClick={() => history.push('/querySet/create')}
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
          <TableListView
            key={refreshKey}
            headingId="querySetListingHeading"
            entityName="Query Set"
            entityNamePlural="Query Sets"
            tableColumns={tableColumns}
            findItems={findQuerySets}
            loading={isLoading}
            pagination={{
              initialPageSize: 10,
              pageSizeOptions: [5, 10, 20, 50],
            }}
            search={{
              box: {
                incremental: true,
                placeholder: 'Search query sets...',
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
