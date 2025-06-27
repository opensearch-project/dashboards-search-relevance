/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButtonEmpty,
  EuiButton,
  EuiButtonIcon,
  EuiCallOut,
  EuiFlexItem,
  EuiPageHeader,
  EuiPageTemplate,
  EuiText,
} from '@elastic/eui';
import React, { useState } from 'react';
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

interface SearchConfigurationListingProps extends RouteComponentProps {
  http: CoreStart['http'];
}

export const SearchConfigurationListing: React.FC<SearchConfigurationListingProps> = ({
  http,
  history,
}) => {
  const { dateFormat } = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<any>(null);

  const [refreshKey, setRefreshKey] = useState(0);


  // Column definitions
  // TODO: extend the table columns by adding search_pipeline & search_template once they
  // are available
  const tableColumns = [
    {
      field: 'search_configuration_name',
      name: 'Name',
      dataType: 'string',
      sortable: true,
      render: (
        name: string,
        searchConfiguration: {
          id: string;
        }
      ) => (
        <>
          <EuiButtonEmpty
            size="xs"
            {...reactRouterNavigate(
              history,
              `${Routes.SearchConfigurationViewPrefix}/${searchConfiguration.id}`
            )}
          >
            {name}
          </EuiButtonEmpty>
        </>
      ),
    },
    {
      field: 'index',
      name: 'Index',
      dataType: 'string',
      sortable: true,
    },
    {
      field: 'query',
      name: 'Query',
      dataType: 'string',
      sortable: false,
      render: (query: string) => (
        <EuiText
          size="s"
          style={{
            maxWidth: '400px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {query}
        </EuiText>
      ),
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
            setConfigToDelete(item);
            setShowDeleteModal(true);
          }}
        />
      ),
    },
  ];

  // Add delete function
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await http.delete(
        `${ServiceEndpoints.SearchConfigurations}/${configToDelete.id}`
      );
      // Close modal and clear state on success
      setShowDeleteModal(false);
      setConfigToDelete(null);
      setError(null);

      // Force table refresh
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to delete search config', err);
      setError('Failed to delete search configuration');
      // Close modal on error
      setShowDeleteModal(false);
      setConfigToDelete(null);
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: extend mapping by adding search_pipeline & search_template once they
  // are available
  const mapSearchConfigurationFields = (obj: any) => {
    return {
      id: obj._source.id,
      search_configuration_name: obj._source.name,
      index: obj._source.index,
      query: obj._source.query,
      timestamp: obj._source.timestamp,
    };
  };

  // Data fetching function
  const findSearchConfigurations = async (search: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get(ServiceEndpoints.SearchConfigurations);
      const list = response ? response.hits.hits.map(mapSearchConfigurationFields) : [];
      // TODO: too many reissued requests on search
      const filteredList = search
        ? list.filter((item) =>
            item.search_configuration_name.toLowerCase().includes(search.toLowerCase())
          )
        : list;
      return {
        total: filteredList.length,
        hits: filteredList,
      };
    } catch (err) {
      console.error('Failed to load search configurations', err);
      if (err.body && err.body.message === DISABLED_BACKEND_PLUGIN_MESSAGE) {
        setError(DISABLED_BACKEND_PLUGIN_MESSAGE + '. Please activate the backend plugin.');
      } else if (err.body && err.body.message) {
        setError(err.body.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to load search configurations due to an unknown error.');
      }
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
        pageTitle="Search Configurations"
        description="View and manage your existing search configurations. Click on a configuration name
                to view details."
        rightSideItems={[
          <EuiButton
            onClick={() => history.push(Routes.SearchConfigurationCreate)}
            fill
            size="s"
            iconType="plus"
            data-test-subj="createSearchConfigurationButton"
            color="primary"
          >
            Create Search Configuration
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
            key={refreshKey} // force refresh
            headingId="searchConfigurationListingHeading"
            entityName="Search Configuration"
            entityNamePlural="Search Configurations"
            tableColumns={tableColumns}
            findItems={findSearchConfigurations}
            loading={isLoading}
            pagination={{
              initialPageSize: 10,
              pageSizeOptions: [5, 10, 20, 50],
            }}
            search={{
              box: {
                incremental: true,
                placeholder: 'Search configurations...',
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
      {showDeleteModal && configToDelete && (
        <DeleteModal
          onClose={() => {
            setShowDeleteModal(false);
            setConfigToDelete(null);
          }}
          onConfirm={handleDelete}
          itemName={configToDelete.search_configuration_name}
        />
      )}
    </EuiPageTemplate>
  );
};

export const SearchConfigurationListingWithRoute = withRouter(SearchConfigurationListing);

export default SearchConfigurationListingWithRoute;
