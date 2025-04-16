/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiFlexItem,
  EuiButtonEmpty,
  EuiText,
  EuiCallOut,
  EuiPageTemplate,
  EuiPageHeader,
  EuiButtonIcon,
} from '@elastic/eui';
import {
  reactRouterNavigate,
  TableListView,
} from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { CoreStart } from '../../../../../src/core/public';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ServiceEndpoints } from '../../../common';
import { DeleteModal } from '../common/DeleteModal';

interface ExperimentListingProps extends RouteComponentProps {
  http: CoreStart['http'];
}

export const ExperimentListing: React.FC<ExperimentListingProps> = ({ http, history }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle delete function
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await http.delete(
        `${ServiceEndpoints.Experiments}/${experimentToDelete.id}`
      );
      console.log('Delete successful:', response);

      // Close modal and clear state
      setShowDeleteModal(false);
      setExperimentToDelete(null);
      setError(null);

      // Force table refresh
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError('Failed to delete experiment');
      setShowDeleteModal(false);
      setExperimentToDelete(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Column definitions
  const tableColumns = [
    {
      field: 'id',
      name: 'ID',
      dataType: 'string',
      sortable: true,
      render: (
        id: string,
        experiment: {
          id: string;
        }
      ) => (
        <>
          <EuiButtonEmpty
            size="xs"
            {...reactRouterNavigate(history, `experiment/view/${experiment.id}`)}
          >
            {id}
          </EuiButtonEmpty>
        </>
      ),
    },
    {
      field: 'searchConfigurationList',
      name: 'Evaluation Type',
      dataType: 'string',
      sortable: true,
      render: (searchConfigurationList: string[]) => {
        const evaluationType =
          searchConfigurationList.length === 2 ? 'Result List Comparison' : 'Quality Metrics';
        return <EuiText size="s">{evaluationType}</EuiText>;
      },
    },
    {
      field: 'results',
      name: 'Queries Run',
      width: '20%',
      render: (results: any) => <EuiText size="s">{results?.queryTexts?.length || '0'}</EuiText>,
    },
    {
      field: 'timestamp',
      name: 'Timestamp',
      dataType: 'string',
      sortable: true,
      render: (timestamp: string) => (
        <EuiText size="s">{new Date(timestamp).toLocaleString()}</EuiText>
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
            setExperimentToDelete(item);
            setShowDeleteModal(true);
          }}
        />
      ),
    },
  ];

  const mapExperimentFields = (obj: any) => {
    return {
      id: obj._source.id,
      index: obj._source.index,
      timestamp: obj._source.timestamp,
      querySetId: obj._source.querySetId,
      searchConfigurationList: obj._source.searchConfigurationList,
      k: obj._source.k,
      results: obj._source.results,
    };
  };

  // Data fetching function
  const findExperiments = async (search: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get(ServiceEndpoints.Experiments);
      const list = response ? response.hits.hits.map(mapExperimentFields) : [];
      // TODO: too many reissued requests on search
      const filteredList = search
        ? list.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
        : list;
      return {
        total: filteredList.length,
        hits: filteredList,
      };
    } catch (err) {
      setError('Failed to load experiments');
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
        pageTitle="Experiments"
        description="View and manage your existing experiments. Click on a experiment id to view details."
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
            headingId="experimentListingHeading"
            entityName="Experiment"
            entityNamePlural="Experiments"
            tableColumns={tableColumns}
            findItems={findExperiments}
            loading={isLoading}
            pagination={{
              initialPageSize: 10,
              pageSizeOptions: [5, 10, 20, 50],
            }}
            search={{
              box: {
                incremental: true,
                placeholder: 'Search experiments...',
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
      {showDeleteModal && experimentToDelete && (
        <DeleteModal
          onClose={() => {
            setShowDeleteModal(false);
            setExperimentToDelete(null);
          }}
          onConfirm={handleDelete}
          itemName={experimentToDelete.name}
        />
      )}
    </EuiPageTemplate>
  );
};

export const ExperimentListingWithRoute = withRouter(ExperimentListing);

export default ExperimentListingWithRoute;
