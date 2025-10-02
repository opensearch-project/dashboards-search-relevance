/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  EuiBadge,
  EuiHealth,
} from '@elastic/eui';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import moment from 'moment';
import {
  reactRouterNavigate,
  TableListView,
  useOpenSearchDashboards,
} from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { CoreStart } from '../../../../../../src/core/public';
import { Routes, SavedObjectIds, extractUserMessageFromError } from '../../../../common';
import { DeleteModal } from '../../common/DeleteModal';
import { DashboardInstallModal } from '../../common/dashboard_install_modal';
import { useConfig } from '../../../contexts/date_format_context';
import { printType } from '../../../types/index';
import { ExperimentService } from '../services/experiment_service';
import { TemplateCards } from '../template_card/template_cards';
import {
  dashboardUrl,
  createPhraseFilter,
  addDaysToTimestamp,
  checkDashboardsInstalled,
} from '../../common_utils/dashboards';
import { getStatusColor } from '../../common_utils/status';
import { ScheduleModal } from '../../common/ScheduleModal';

interface ExperimentListingProps extends RouteComponentProps {
  http: CoreStart['http'];
}

export const ExperimentListing: React.FC<ExperimentListingProps> = ({ http, history }) => {
  const { dateFormat } = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const experimentService = new ExperimentService(http);

  const [showDeleteExperimentModal, setShowDeleteExperimentModal] = useState(false);
  const [showDeleteScheduleModal, setShowDeleteScheduleModal] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState<any>(null);
  const [experimentToSchedule, setExperimentToSchedule] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tableData, setTableData] = useState<any[]>([]);
  // Dashboard installation modal state
  const [showDashboardInstallModal, setShowDashboardInstallModal] = useState(false);
  const [pendingDashboardAction, setPendingDashboardAction] = useState<
    (() => Promise<void>) | null
  >(null);
  // Whether the modal to schedule an experiment is shown
  const [showScheduleExperimentModal, setShowScheduleExperimentModal] = useState(false);

  const { services } = useOpenSearchDashboards();
  const share = services.share;

  // Custom hook for experiment polling
  const useExperimentPolling = () => {
    const [experiments, setExperiments] = useState<any[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const previousExperiments = useRef<any[]>([]);
    const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
    const pollingStartTime = useRef<number>(0);
    const errorCount = useRef<number>(0);

    const MAX_POLLING_DURATION = 10 * 60 * 1000;
    const MAX_ERRORS = 3;

    const startPolling = () => {
      if (intervalRef.current) return;

      pollingStartTime.current = Date.now();
      intervalRef.current = setInterval(async () => {
        if (
          Date.now() - pollingStartTime.current > MAX_POLLING_DURATION ||
          errorCount.current >= MAX_ERRORS
        ) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsBackgroundRefreshing(false);
          return;
        }

        if (isBackgroundRefreshing) return;

        setIsBackgroundRefreshing(true);
        try {
          const parseResults = await experimentService.getExperiments();

          if (parseResults.success) {
            const updatedList = parseResults.data;
            errorCount.current = 0;

            if (previousExperiments.current.length > 0) {
              const completions = updatedList.filter((curr) => {
                const prev = previousExperiments.current.find((p) => p.id === curr.id);
                return prev?.status === 'PROCESSING' && curr.status === 'COMPLETED';
              });

              completions.forEach((exp) => {
                services.notifications?.toasts.addSuccess({
                  title: 'Experiment Completed',
                  text: `Experiment ${exp.id} has completed successfully.`,
                });
              });
            }

            if (JSON.stringify(previousExperiments.current) !== JSON.stringify(updatedList)) {
              previousExperiments.current = updatedList;
              setExperiments(updatedList);
              setTableData(updatedList);
              setRefreshKey((prev) => prev + 1);
            }

            if (!updatedList.some((exp) => exp.status === 'PROCESSING')) {
              clearInterval(intervalRef.current!);
              intervalRef.current = null;
            }
          }
        } catch (err) {
          console.error('Background refresh failed:', err);
          errorCount.current++;
        } finally {
          setIsBackgroundRefreshing(false);
        }
      }, 15000);
    };

    const hasProcessing = experiments.some((exp) => exp.status === 'PROCESSING');

    useEffect(() => {
      if (hasProcessing && !intervalRef.current) {
        startPolling();
      }
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [hasProcessing]);

    return { experiments, setExperiments, isBackgroundRefreshing, hasProcessing };
  };

  const {
    experiments,
    setExperiments,
    isBackgroundRefreshing,
    hasProcessing,
  } = useExperimentPolling();

  const openDashboard = async (experiment: any, dashboardId: string, indexPatternId: string) => {
    const filters = [createPhraseFilter('experimentId', experiment.id, indexPatternId)];

    // Create timeRange from experiment timestamp
    const timeRange = {
      from: addDaysToTimestamp(experiment.timestamp, -1),
      to: addDaysToTimestamp(experiment.timestamp, 1),
    };

    const url = await dashboardUrl(share, dashboardId, indexPatternId, filters, timeRange);
    window.open(url, '_blank');
  };

  const handleVisualizationClick = async (
    experiment: any,
    dashboardId: string,
    indexPatternId: string
  ) => {
    try {
      const dashboardsAreInstalled = await checkDashboardsInstalled(http);
      if (!dashboardsAreInstalled) {
        setPendingDashboardAction(() => () =>
          openDashboard(experiment, dashboardId, indexPatternId)
        );
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
  const handleDeleteExperiment = async () => {
    if (!experimentToDelete) return;

    setIsLoading(true);
    try {
      await experimentService.deleteExperiment(experimentToDelete.id);

      // Close modal and clear state first
      setShowDeleteExperimentModal(false);
      setExperimentToDelete(null);
      setError(null);

      // Clear tableData to force fresh fetch
      setTableData([]);

      // Force table refresh after deletion
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to delete experiment', err);
      setError('Failed to delete experiment');
      setShowDeleteExperimentModal(false);
      setExperimentToDelete(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete schedule function
  const handleDeleteSchedule = async () => {
    if (!experimentToSchedule) return;

    setIsLoading(true);
    try {
      console.log("id to delete: " + experimentToSchedule.id)
      await experimentService.deleteScheduledExperiment(experimentToSchedule.id);

      // Close modal and clear state first
      setShowDeleteScheduleModal(false);
      setExperimentToSchedule(null);
      setError(null);

      // Clear tableData to force fresh fetch
      setTableData([]);

      // Force table refresh after deletion
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to delete schedule', err);
      setError('Failed to delete schedule');
      setShowDeleteScheduleModal(false);
      setExperimentToSchedule(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateScheduledExperiment = async (cronExpression: String) => {
    if (!experimentToSchedule) return;

    setIsLoading(true);
    try {
      await experimentService.createScheduledExperiment(JSON.stringify({
        experimentId: experimentToSchedule.id,
        cronExpression: `${cronExpression.trim()}`
      }));

      setShowScheduleExperimentModal(false);
      setExperimentToSchedule(null);
      setError(null);
    } catch (err) {
      console.error('Failed to schedule experiment', err);
      setError('Failed to schedule experiment');
      setShowScheduleExperimentModal(false);
      setExperimentToSchedule(null);
    } finally {
      setIsLoading(false);
      // Clear tableData to force fresh fetch
      setTableData([]);

      // Force table refresh after deletion
      setRefreshKey((prev) => prev + 1);
    }
  }

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
      render: (status: string) => {
        return <EuiHealth color={getStatusColor(status)}>{status}</EuiHealth>;
      },
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
              setShowDeleteExperimentModal(true);
            }}
          />
          {item.type === 'POINTWISE_EVALUATION' && item.status === 'COMPLETED' && (
            displayScheduleIcon(item)
          )}
          {item.type === 'HYBRID_OPTIMIZER' && item.status === 'COMPLETED' && (
            displayScheduleIcon(item)
          )}
        </>
      ),
    },
  ];

  const displayScheduleIcon = (item: any) => {
    if (item.isScheduled === true) {
      return (<EuiButtonIcon
              aria-label="Schedule"
              iconType="clock"
              color="primary"
              onClick={() => {
                setExperimentToSchedule(item);
                setShowDeleteScheduleModal(true);
              }}
            />);
    } else {
      return (<EuiButtonIcon
              aria-label="Schedule"
              iconType="clock"
              color="text"
              onClick={() => {
                setExperimentToSchedule(item);
                setShowScheduleExperimentModal(true);
              }}
            />);
    }
  }

  // Data fetching function
  const findExperiments = async (search: any) => {
    // Use tableData if available (from polling or previous fetch)
    if (tableData.length > 0) {
      const filteredList = search
        ? tableData.filter((item) => item.id.toLowerCase().includes(search.toLowerCase()))
        : tableData;
      return {
        total: filteredList.length,
        hits: filteredList,
      };
    }

    // Initial fetch only
    setIsLoading(true);
    setError(null);
    try {
      const parseResults = await experimentService.getExperiments();

      if (!parseResults.success) {
        console.error(parseResults.errors);
        setError('Failed to parse experiment document');
        return {
          total: 0,
          hits: [],
        };
      }

      const list = parseResults.data;
      const filteredList = search
        ? list.filter((item) => item.id.toLowerCase().includes(search.toLowerCase()))
        : list;

      setExperiments(filteredList);
      setTableData(filteredList);

      return {
        total: filteredList.length,
        hits: filteredList,
      };
    } catch (err) {
      console.error('Failed to load experiments', err);
      const errorMessage = extractUserMessageFromError(err);
      setError(errorMessage ? errorMessage : 'Failed to load experiments due to an unknown error.');
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
        description={`Manage your existing experiments and create new ones. Click on a card to create an experiment.${
          hasProcessing ? ` (Auto-refreshing for 10 min${isBackgroundRefreshing ? ' ●' : ''})` : ''
        }`}
        rightSideItems={[
          <EuiButton
            onClick={() => setRefreshKey((prev) => prev + 1)}
            size="s"
            iconType="refresh"
            isLoading={isLoading}
          >
            Refresh
          </EuiButton>,
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
            initialPageSize={10}
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
      {showDeleteExperimentModal && experimentToDelete && (
        <DeleteModal
          onClose={() => {
            setShowDeleteExperimentModal(false);
            setExperimentToDelete(null);
          }}
          onConfirm={handleDeleteExperiment}
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

      {/* Job Scheduling Modal */}
      {showScheduleExperimentModal && experimentToSchedule && (
        <ScheduleModal
          onClose={() => {
            setShowScheduleExperimentModal(false);
            setExperimentToSchedule(null);
          }}
          onSubmit={handleCreateScheduledExperiment}
          itemName={experimentToSchedule.id}
        />
      )}

      {/* Delete Job Scheduling Modal */}
      {showDeleteScheduleModal && experimentToSchedule && (
        <DeleteModal
          onClose={() => {
            setShowDeleteScheduleModal(false);
            setExperimentToSchedule(null);
          }}
          onConfirm={handleDeleteSchedule}
          itemName={"Schedule id: " + experimentToSchedule.id}
        />
      )}
    </EuiPageTemplate>
  );
};

export const ExperimentListingWithRoute = withRouter(ExperimentListing);

export default ExperimentListingWithRoute;
