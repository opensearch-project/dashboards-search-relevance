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
  EuiToolTip,
} from '@elastic/eui';
import React, { useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import moment from 'moment';
import {
  reactRouterNavigate,
  TableListView,
} from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { CoreStart } from '../../../../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../../../../src/plugins/data_source_management/public';
import { Routes } from '../../../../common';
import { DeleteModal } from '../../common/DeleteModal';
import { DataSourceSelector } from '../../common/datasource_selector';
import { useConfig } from '../../../contexts/date_format_context';
import { useSearchConfigurationList } from '../hooks/use_search_configuration_list';

interface SearchConfigurationListingProps extends RouteComponentProps {
  http: CoreStart['http'];
  savedObjects?: CoreStart['savedObjects'];
  dataSourceEnabled?: boolean;
  dataSourceManagement?: DataSourceManagementPluginSetup;
}

export const SearchConfigurationListing: React.FC<SearchConfigurationListingProps> = ({
  http,
  history,
  savedObjects,
  dataSourceEnabled = false,
  dataSourceManagement,
}) => {
  const { dateFormat } = useConfig();
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const {
    isLoading,
    error,
    findSearchConfigurations,
    deleteSearchConfiguration,
  } = useSearchConfigurationList(http, selectedDataSource || undefined);

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
              `${Routes.SearchConfigurationViewPrefix}/${searchConfiguration.id}${selectedDataSource ? `?dataSourceId=${selectedDataSource}` : ''}`
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
        <EuiToolTip content="Delete">
          <EuiButtonIcon
            aria-label="Delete"
            iconType="trash"
            color="danger"
            onClick={() => {
              setConfigToDelete(item);
              setShowDeleteModal(true);
            }}
          />
        </EuiToolTip>
      ),
    },
  ];

  // Add delete function
  const handleDelete = async () => {
    const success = await deleteSearchConfiguration(configToDelete.id);
    if (success) {
      // Force table refresh
      setRefreshKey((prev) => prev + 1);
    }
    // Close modal regardless of success/failure
    setShowDeleteModal(false);
    setConfigToDelete(null);
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

      {dataSourceEnabled && dataSourceManagement && savedObjects && (
        <DataSourceSelector
          dataSourceEnabled={dataSourceEnabled}
          dataSourceManagement={dataSourceManagement}
          savedObjects={savedObjects}
          selectedDataSource={selectedDataSource}
          setSelectedDataSource={setSelectedDataSource}
        />
      )}

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
            initialPageSize={10}
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
