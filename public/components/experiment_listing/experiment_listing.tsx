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
import { Routes, ServiceEndpoints, SavedObjectIds } from '../../../common';
import { DeleteModal } from '../common/DeleteModal';
import { DashboardInstallModal } from '../common/dashboard_install_modal';
import { useConfig } from '../../contexts/date_format_context';
import { combineResults, printType, toExperiment } from '../../types/index';
import { TemplateCards } from '../experiment_create/template_card/template_cards';
import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { dashboardUrl, createPhraseFilter, addDaysToTimestamp, checkDashboardsInstalled } from '../common_utils/dashboards';

interface ExperimentListingProps extends RouteComponentProps {
  http: CoreStart['http'];
}

export const ExperimentListing: React.FC<ExperimentListingProps> = ({ http, history }) => {
  const { dateFormat } = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Dashboard installation modal state
  const [showDashboardInstallModal, setShowDashboardInstallModal] = useState(false);
  const [pendingDashboardAction, setPendingDashboardAction] = useState<(() => Promise<void>) | null>(null);

  const { services } = useOpenSearchDashboards();
  const share = services.share;

  const openDashboard = async (experiment: any, dashboardId: string, indexPatternId: string) => {
    const filters = [
      createPhraseFilter('experimentId', experiment.id, indexPatternId),
    ];
    
    // Create timeRange from experiment timestamp
    const timeRange = {
      from: addDaysToTimestamp(experiment.timestamp, -1),
      to: addDaysToTimestamp(experiment.timestamp, 1),
    };

    const url = await dashboardUrl(
      share,
      dashboardId,
      indexPatternId,
      filters,
      timeRange
    );
    window.open(url, '_blank');
  };

  const handleVisualizationClick = async (experiment: any, dashboardId: string, indexPatternId: string) => {
    try {
      const dashboardsAreInstalled = await checkDashboardsInstalled(http);
      if (!dashboardsAreInstalled) {
        setPendingDashboardAction(() => () => openDashboard(experiment, dashboardId, indexPatternId));
        setShowDashboardInstallModal(true);
        return;
      }

      // If dashboards are already installed, open directly
      await openDashboard(experiment, dashboardId, indexPatternId);
    } catch (error) {
      console.error('Failed to open dashboard:', error);
      setError('Failed to open dashboard visualization');
    }
  };

  const handleEvaluationVisualizationClick = async (experiment: any) => {
    const dashboardId = SavedObjectIds.ExperimentDeepDive;
    const indexPatternId = SavedObjectIds.SearchEvaluationIndexPattern;
    await handleVisualizationClick(experiment, dashboardId, indexPatternId);
  };

  const handleHybridVisualizationClick = async (experiment: any) => {
    const dashboardId = SavedObjectIds.ExperimentVariantComparison;
    const indexPatternId = SavedObjectIds.SearchEvaluationIndexPattern;
    await handleVisualizationClick(experiment, dashboardId, indexPatternId);
  };

  // Handle manual dashboard installation
  const handleManualDashboardInstall = async () => {
    setPendingDashboardAction(null); // Clear any existing pending action
    setShowDashboardInstallModal(true);
  };

  // Handle delete function
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await http.delete(
        `${ServiceEndpoints.Experiments}/${experimentToDelete.id}`
      );

      // Close modal and clear state
      setShowDeleteModal(false);
      setExperimentToDelete(null);
      setError(null);

      // Force table refresh
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to delete experiment', err);
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
      field: 'type',
      name: 'Experiment Type',
      dataType: 'string',
      sortable: true,
      render: (
        type: string,
        experiment: {
          id: string;
        }
      ) => (
        <EuiButtonEmpty
          size="xs"
          {...reactRouterNavigate(history, `${Routes.ExperimentViewPrefix}/${experiment.id}`)}
        >
          {printType(type)}
        </EuiButtonEmpty>
      ),
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
        <>
          {item.type === 'POINTWISE_EVALUATION' && item.status === 'COMPLETED' && (
            <EuiButtonIcon
              aria-label="Visualization"
              iconType="dashboardApp"
              color="primary"
              onClick={() => handleEvaluationVisualizationClick(item)}
            />
          )}
          {item.type === 'HYBRID_OPTIMIZER' && item.status === 'COMPLETED' && (
            <EuiButtonIcon
              aria-label="Visualization"
              iconType="dashboardApp"
              color="primary"
              onClick={() => handleHybridVisualizationClick(item)}
            />
          )}
          <EuiButtonIcon
            aria-label="Delete"
            iconType="trash"
            color="danger"
            onClick={() => {
              setExperimentToDelete(item);
              setShowDeleteModal(true);
            }}
          />
        </>
      ),
    },
  ];

  // Data fetching function
  const findExperiments = async (search: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get(ServiceEndpoints.Experiments);
      const parseResults = combineResults(
        ...(response ? response.hits.hits.map((hit) => toExperiment(hit._source)) : [])
      );

      if (!parseResults.success) {
        console.error(parseResults.errors);
        setError('Failed to parse experiment document');
        return {
          total: 0,
          hits: [],
        };
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
    } catch (err) {
      console.error('Failed to load experiment', err);
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
        description="Manage your existing experiments and create new ones. Click on a card to create an experiment."
        rightSideItems={[
          <EuiButton
            onClick={handleManualDashboardInstall}
            size="s"
            iconType="dashboardApp"
            color="primary"
          >
            Install Dashboards
          </EuiButton>,
        ]}
      />

      <EuiSpacer size="m" />

      <TemplateCards history={history} onClose={() => {}} />

      <EuiSpacer size="m" />

      <EuiFlexItem>
        <EuiText>Click on an experiment id to view details.</EuiText>
        {error && (
          <EuiCallOut title="Error" color="danger">
            <p>{error}</p>
          </EuiCallOut>
        )}
        {!error && (
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
          itemName={experimentToDelete.id}
        />
      )}

      {/* Dashboard Installation Modal */}
      {showDashboardInstallModal && (
        <DashboardInstallModal
          onClose={() => setShowDashboardInstallModal(false)}
          onSuccess={pendingDashboardAction}
          http={http}
          setError={setError}
        />
      )}
    </EuiPageTemplate>
  );
};

export const ExperimentListingWithRoute = withRouter(ExperimentListing);

export default ExperimentListingWithRoute;
