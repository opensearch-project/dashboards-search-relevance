/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiPageTemplate,
  EuiFlexItem,
  EuiPanel,
  EuiPageHeader,
} from '@elastic/eui';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CoreStart, NotificationsStart } from '../../../../../../core/public';
import { QuerySetService } from '../services/query_set_service';
import { useQuerySetForm } from '../hooks/use_query_set_form';
import { QuerySetForm } from '../components/query_set_form';
import { QueryPreview } from '../components/query_preview';

interface QuerySetCreateProps extends RouteComponentProps {
  http: CoreStart['http'];
  notifications: NotificationsStart;
}

export const QuerySetCreate: React.FC<QuerySetCreateProps> = ({ http, notifications, history }) => {
  const formState = useQuerySetForm();
  const querySetService = useMemo(() => new QuerySetService(http), [http]);
  const filePickerId = useMemo(() => `filePicker-${Math.random().toString(36).substr(2, 9)}`, []);
  
  const [indexOptions, setIndexOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(false);

  useEffect(() => {
    const fetchIndexes = async () => {
      setIsLoadingIndexes(true);
      try {
        const indexes = await querySetService.fetchUbiIndexes();
        setIndexOptions(indexes);
      } catch (error) {
        notifications.toasts.addDanger('Failed to fetch indexes');
        setIndexOptions([]);
      } finally {
        setIsLoadingIndexes(false);
      }
    };
    fetchIndexes();
  }, [querySetService, notifications.toasts]);

  const createQuerySet = useCallback(async () => {
    if (!formState.isFormValid()) {
      return;
    }

    try {
      const querySetData = {
        name: formState.name,
        description: formState.description,
        sampling: formState.sampling,
        querySetSize: formState.querySetSize,
        querySetQueries: formState.manualQueries ? JSON.parse(formState.manualQueries) : undefined,
        ...(formState.ubiQueriesIndex && { ubi_queries_index: formState.ubiQueriesIndex }),
        ...(formState.ubiEventsIndex && { ubi_events_index: formState.ubiEventsIndex }),
      };

      await querySetService.createQuerySet(querySetData, formState.isManualInput);
      notifications.toasts.addSuccess(`Query set "${formState.name}" created successfully`);
      history.push('/querySet');
    } catch (err) {
      notifications.toasts.addError(err?.body || err, {
        title: 'Failed to create query set',
      });
    }
  }, [formState, querySetService, notifications.toasts, history]);

  const handleCancel = useCallback(() => {
    history.push('/querySet');
  }, [history]);

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Query Set"
        description={
          <span>
            Create a new query set by{' '}
            <a
              href="https://docs.opensearch.org/docs/latest/search-plugins/search-relevance/query-sets/"
              target="_blank"
              rel="noopener noreferrer"
            >
              either sampling from UBI data stored in the ubi_queries index or manually uploading a
              file
            </a>
            .
          </span>
        }
        rightSideItems={[
          <EuiButtonEmpty
            onClick={handleCancel}
            iconType="cross"
            size="s"
            data-test-subj="cancelQuerySetButton"
          >
            Cancel
          </EuiButtonEmpty>,
          <EuiButton
            onClick={createQuerySet}
            fill
            size="s"
            iconType="check"
            data-test-subj="createQuerySetButton"
            color="primary"
          >
            Create Query Set
          </EuiButton>,
        ]}
      />

      <EuiPanel hasBorder={true}>
        <EuiFlexItem>
          <QuerySetForm 
            formState={formState} 
            filePickerId={filePickerId}
            indexOptions={indexOptions}
            isLoadingIndexes={isLoadingIndexes}
          />
          {formState.isManualInput && <QueryPreview parsedQueries={formState.parsedQueries} />}
        </EuiFlexItem>
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export const QuerySetCreateWithRouter = withRouter(QuerySetCreate);
