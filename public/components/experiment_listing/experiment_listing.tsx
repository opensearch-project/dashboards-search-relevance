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
  EuiButton,
  EuiSpacer,
} from '@elastic/eui';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import moment from 'moment';
import {
  reactRouterNavigate,
  TableListView,
} from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { CoreStart } from '../../../../../src/core/public';
import { Routes, ServiceEndpoints, DISABLED_BACKEND_PLUGIN_MESSAGE } from '../../../common';
import { DeleteModal } from '../common/DeleteModal';
import { useConfig } from '../../contexts/date_format_context';
import { combineResults, printType, toExperiment } from '../../types/index';
import { TemplateCards } from '../experiment_create/template_card/template_cards';
import { useAsyncAction } from '../../../common/use_async_action';

interface ExperimentListingProps extends RouteComponentProps {
  http: CoreStart['http'];
}

export const ExperimentListing: React.FC<ExperimentListingProps> = ({ http, history }) => {
  const { dateFormat } = useConfig();
  const {
    isLoading: isDeleting,
    error: deleteError,
    execute: executeDelete,
    clearError: clearDeleteError,
  } = useAsyncAction({
    genericErrorMessage: 'Failed to delete experiment due to an unknown error.',
  });

  const {
    isLoading: isFetching,
    error: fetchError,
    execute: executeFetch,
    clearError: clearFetchError,
  } = useAsyncAction({
    genericErrorMessage: 'Failed to load experiments due to an unknown error.',
    specificErrorMap: {
      [DISABLED_BACKEND_PLUGIN_MESSAGE]:
        DISABLED_BACKEND_PLUGIN_MESSAGE + '. Please activate the backend plugin.',
    },
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentError = deleteError || fetchError;

  // Handle delete function
  const handleDelete = async () => {
    await executeDelete(
      async () => {
        await http.delete(`${ServiceEndpoints.Experiments}/${experimentToDelete.id}`);
        setShowDeleteModal(false);
        setExperimentToDelete(null);
        setRefreshKey((prev) => prev + 1);
      },
      undefined,
      () => {
        setShowDeleteModal(false);
        setExperimentToDelete(null);
      }
    );
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
            {...reactRouterNavigate(history, `${Routes.ExperimentViewPrefix}/${experiment.id}`)}
          >
            {id}
          </EuiButtonEmpty>
        </>
      ),
    },
    {
      field: 'type',
      name: 'Experiment Type',
      dataType: 'string',
      sortable: true,
      render: (type: string) => {
        return <EuiText size="s">{printType(type)}</EuiText>;
      },
    },
    {
      field: 'status',
      name: 'Status',
      dataType: 'string',
      sortable: true,
    },
    {
      field: 'size',
      name: 'Queries Run',
      width: '20%',
      render: (size: number) => <EuiText size="s">{size}</EuiText>,
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
            clearDeleteError(); // Clear any previous delete error before attempting new delete
            setExperimentToDelete(item);
            setShowDeleteModal(true);
          }}
        />
      ),
    },
  ];

  // Data fetching function
  const findExperiments = async (search: any) => {
    const result = await executeFetch(
      async () => {
        const response = await http.get(ServiceEndpoints.Experiments);
        const parseResults = combineResults(
          ...(response ? response.hits.hits.map((hit) => toExperiment(hit._source)) : [])
        );

        if (!parseResults.success) {
          console.error(parseResults.errors);
          // If parsing fails, we'll throw an error that the useAsyncAction hook will catch
          throw new Error('Failed to parse experiment document');
        }

        const list = parseResults.data;
        // TODO: too many reissued requests on search
        const filteredList = search
          ? list.filter((item) => item.id.toLowerCase().includes(search.toLowerCase()))
          : list;

        return {
          total: filteredList.length,
          hits: filteredList,
        };
      },
      undefined, // No specific success callback needed here
      () => {
        // Error callback for findExperiments
        // This is where you might return default empty data on error
      }
    );

    // If an error occurred during fetch, result will be undefined.
    // We return empty data so the table doesn't hang.
    return (
      result || {
        total: 0,
        hits: [],
      }
    );
  };

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Experiments"
        description="Manage your existing experiments and create new ones. Click on a card to create an experiment."
      />

      <EuiSpacer size="m" />

      <TemplateCards history={history} onClose={() => {}} />

      <EuiSpacer size="m" />

      <EuiFlexItem>
        <EuiText>Click on an experiment id to view details.</EuiText>
        {currentError ? (
          <EuiCallOut title="Error" color="danger">
            <p>{currentError}</p>
          </EuiCallOut>
        ) : (
          <TableListView
            key={refreshKey}
            headingId="experimentListingHeading"
            entityName="Experiment"
            entityNamePlural="Experiments"
            tableColumns={tableColumns}
            findItems={findExperiments}
            loading={isFetching} // Use isFetching from the hook
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
            clearDeleteError(); // Clear delete error when modal is closed without confirming
          }}
          onConfirm={handleDelete}
          itemName={experimentToDelete.id}
          isDeleting={isDeleting} // Pass deleting state to the modal if it supports it
        />
      )}
    </EuiPageTemplate>
  );
};

export const ExperimentListingWithRoute = withRouter(ExperimentListing);

export default ExperimentListingWithRoute;
