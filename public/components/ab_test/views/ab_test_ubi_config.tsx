/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  EuiButton,
  EuiCallOut,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTextArea,
  EuiTitle,
} from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { useUbiIndexConfig } from '../hooks/use_ubi_index_config';
import { AbTestService } from '../services/ab_test_service';
import { DEFAULT_UBI_INDEX } from '../utils/ubi_index';

interface AbTestUbiConfigProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
}

export const AbTestUbiConfig: React.FC<AbTestUbiConfigProps> = ({ http, notifications }) => {
  const service = useMemo(() => new AbTestService(http), [http]);
  const {
    indexName,
    setIndexName,
    mappingJson,
    setMappingJson,
    indexExists,
    isChecking,
    isCreating,
    checkIndex,
    createIndex,
  } = useUbiIndexConfig(service, notifications);

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="UBI Click Index Configuration"
        description="Configure the UBI (User Behavior Insights) index where click events will be stored. This index tracks which search results users click on, allowing you to measure which search configuration performs better."
      />

      <EuiPanel paddingSize="l">
        <EuiFormRow
          label="UBI Click Index Name"
          helpText={`Default: ${DEFAULT_UBI_INDEX}. Change only if you want a custom index. Used by Search and Results pages.`}
        >
          <EuiFieldText
            value={indexName}
            onChange={(e) => setIndexName(e.target.value)}
            placeholder={`e.g., ${DEFAULT_UBI_INDEX} (default)`}
            data-test-subj="ubiIndexNameInput"
            aria-label="UBI click index name"
          />
        </EuiFormRow>

        <EuiSpacer size="m" />

        <EuiFlexGroup gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiButton
              onClick={checkIndex}
              isLoading={isChecking}
              data-test-subj="checkUbiIndexButton"
            >
              Check Index
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              onClick={createIndex}
              isLoading={isCreating}
              data-test-subj="createUbiIndexButton"
            >
              Create Index
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        {indexExists !== null && (
          <>
            <EuiSpacer size="m" />
            <EuiCallOut
              title={
                indexExists
                  ? 'Index exists and is ready'
                  : 'Index does not exist — click "Create Index" to create it'
              }
              color={indexExists ? 'success' : 'warning'}
              iconType={indexExists ? 'check' : 'alert'}
            />
          </>
        )}

        <EuiSpacer size="l" />
        <EuiTitle size="s">
          <h3>Index Mapping</h3>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiText size="xs">
          <p>
            Edit the mapping below if needed. Required fields:{' '}
            <code>search_configuration_uuid</code> (keyword) and <code>ab_test_id</code> (keyword).
          </p>
        </EuiText>
        <EuiSpacer size="s" />
        <EuiTextArea
          value={mappingJson}
          onChange={(e) => setMappingJson(e.target.value)}
          rows={15}
          fullWidth
          data-test-subj="ubiIndexMappingInput"
          aria-label="UBI index mapping JSON"
        />
      </EuiPanel>
    </EuiPageTemplate>
  );
};
