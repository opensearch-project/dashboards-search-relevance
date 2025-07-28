/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteComponentProps, withRouter } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
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
import { CoreStart } from '../../../../../src/core/public';
import {
  reactRouterNavigate,
  TableListView,
} from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { DeleteModal } from '../common/DeleteModal';
import { useConfig } from '../../contexts/date_format_context';
import { Routes, ServiceEndpoints, extractUserMessageFromError } from '../../../common';
import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';

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
  const [tableData, setTableData] = useState<any[]>([]);

  const { services } = useOpenSearchDashboards();

  // Polling state
  const [judgments, setJudgments] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousJudgments = useRef<any[]>([]);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const pollingStartTime = useRef<number>(0);
  const errorCount = useRef<number>(0);
  const MAX_POLLING_DURATION = 10 * 60 * 1000;
  const MAX_ERRORS = 3;

  const hasProcessing = judgments.some((judgment) => judgment.status === 'PROCESSING');

  const startPolling = () => {
    if (intervalRef.current) return;
    pollingStartTime.current = Date.now();

    intervalRef.current = setInterval(async () => {
      if (Date.now() - pollingStartTime.current > MAX_POLLING_DURATION || errorCount.current >= MAX_ERRORS) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsBackgroundRefreshing(false);
        return;
      }

      if (isBackgroundRefreshing) return;

      setIsBackgroundRefreshing(true);
      try {
        const response = await http.get(ServiceEndpoints.Judgments);
        const updatedList = response ? response.hits.hits.map(mapJudgmentFields) : [];
        errorCount.current = 0;

        if (previousJudgments.current.length > 0) {
          const completions = updatedList.filter((curr) => {
            const prev = previousJudgments.current.find((p) => p.id === curr.id);
            return prev?.status === 'PROCESSING' && curr.status === 'COMPLETED';
          });

          completions.forEach((judgment) => {
            services.notifications?.toasts.addSuccess({
              title: 'Judgment Completed',
              text: `Judgment ${judgment.name} has completed successfully.`,
            });
          });
        }

        if (JSON.stringify(previousJudgments.current) !== JSON.stringify(updatedList)) {
          previousJudgments.current = updatedList;
          setJudgments(updatedList);
          setTableData(updatedList);
          setRefreshKey(prev => prev + 1);
        }

        if (!updatedList.some((judgment) => judgment.status === 'PROCESSING')) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
        }
      } catch (err) {
        console.error('Background refresh failed:', err);
        errorCount.current++;
      } finally {
        setIsBackgroundRefreshing(false);
      }
    }, 15000);
  };

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

  // Handle delete function
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await http.delete(`${ServiceEndpoints.Judgments}/${judgmentToDelete.id}`);

      // Close modal and clear state
      setShowDeleteModal(false);
      setJudgmentToDelete(null);
      setError(null);

      // Force table refresh
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to delete judgment', err);
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
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'COMPLETED':
              return 'success';
            case 'PROCESSING':
              return 'warning';
            case 'ERROR':
              return 'danger';
            default:
              return 'subdued';
          }
        };
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

  const mapJudgmentFields = (obj: any) => {
    return {
      id: obj._source.id,
      name: obj._source.name,
      type: obj._source.type,
      status: obj._source.status,
      timestamp: obj._source.timestamp,
    };
  };

  // Data fetching function
  const findJudgments = async (search: any) => {
    // Use tableData if available (from polling or previous fetch)
    if (tableData.length > 0) {
      const filteredList = search
        ? tableData.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
        : tableData;
      return {
        total: filteredList.length,
        hits: filteredList,
      };
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get(ServiceEndpoints.Judgments);
      const list = response ? response.hits.hits.map(mapJudgmentFields) : [];
      const filteredList = search
        ? list.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
        : list;
      
      setJudgments(filteredList);
      setTableData(filteredList);
      
      return {
        total: filteredList.length,
        hits: filteredList,
      };
    } catch (err) {
      console.error('Failed to load judgment lists.', err);
      const errorMessage = extractUserMessageFromError(err);
      setError(errorMessage ? errorMessage : 'Failed to load judgment lists due to an unknown error.');
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
        description={`View and manage your existing judgments. Click on a judgment list name to view details.${hasProcessing ? ` (Auto-refreshing for 10 min${isBackgroundRefreshing ? ' ●' : ''})` : ''}`}
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
