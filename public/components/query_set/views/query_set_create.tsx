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
import { QuerySetHelpFlyout } from '../components/query_set_help_flyout';

interface QuerySetCreateProps extends RouteComponentProps {
  http: CoreStart['http'];
  notifications: NotificationsStart;
}

export const QuerySetCreate = ({ http, notifications, history }: QuerySetCreateProps) => {
  const formState = useQuerySetForm();
  const querySetService = useMemo(() => new QuerySetService(http), [http]);
  const filePickerId = useMemo(() => `filePicker-${Math.random().toString(36).substr(2, 9)}`, []);
  const [showHelpFlyout, setShowHelpFlyout] = useState(false);

  const [indexOptions, setIndexOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(false);

  useEffect(() => {
    const fetchIndexes = async () => {
      setIsLoadingIndexes(true);
      try {
        const indexes = await querySetService.fetchUbiIndexes();
        setIndexOptions(indexes);
      } catch (error) {
        notifications.toasts.addDanger('Failed to fetch UBI indexes');
        setIndexOptions([]);
      } finally {
        setIsLoadingIndexes(false);
      }
    };
    fetchIndexes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [querySetService]);

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
        querySetQueries: (() => {
          if (!formState.manualQueries) return undefined;
          try {
            const parsed = JSON.parse(formState.manualQueries);
            if (Array.isArray(parsed)) {
              const queries = parsed.map((q: any) => ({
                queryText: q.queryText,
                referenceAnswer: q.referenceAnswer,
              }));
              console.log('Constructed querySetQueries (Array of Objects):', queries);
              return queries;
            }
            return undefined;
          } catch (e) {
            console.error('Failed to parse manualQueries:', e);
            return undefined;
          }
        })() as any,
        ...(formState.ubiQueriesIndex && { ubiQueriesIndex: formState.ubiQueriesIndex }),
      };

      console.log('Creating Query Set with data:', querySetData);

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
            onShowHelp={() => setShowHelpFlyout(true)}
          />
          {formState.isManualInput && <QueryPreview parsedQueries={formState.parsedQueries} />}
        </EuiFlexItem>
      </EuiPanel>

      {showHelpFlyout && <QuerySetHelpFlyout onClose={() => setShowHelpFlyout(false)} />}
    </EuiPageTemplate>
  );
};

export const QuerySetCreateWithRouter = withRouter(QuerySetCreate);
