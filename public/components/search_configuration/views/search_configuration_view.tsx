/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiPageTemplate,
  EuiPageHeader,
  EuiPanel,
  EuiSpacer,
  EuiForm,
  EuiFormRow,
  EuiText,
  EuiCodeBlock,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
} from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { useSearchConfigurationView } from '../hooks/use_search_configuration_view';

interface SearchConfigurationViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
  dataSourceId?: string | null;
}

export const SearchConfigurationView: React.FC<SearchConfigurationViewProps> = ({ http, id, dataSourceId }) => {
  const { searchConfiguration, loading, error, formatJson } = useSearchConfigurationView(http, id, dataSourceId || undefined);

  const SearchConfigurationViewPane: React.FC = () => {
    return (
      <EuiForm>
        <EuiFormRow label="Search Configuration Name" fullWidth>
          <EuiText>{searchConfiguration.name}</EuiText>
        </EuiFormRow>

        <EuiFormRow label="Index" fullWidth>
          <EuiText>{searchConfiguration.index}</EuiText>
        </EuiFormRow>

        <EuiFormRow label="Query" fullWidth>
          <EuiCodeBlock
            language="json"
            fontSize="m"
            paddingSize="m"
            isCopyable={true}
            whiteSpace="pre"
          >
            {formatJson(searchConfiguration.query)}
          </EuiCodeBlock>
        </EuiFormRow>

        <EuiFormRow label="Search Pipeline" fullWidth>
          <EuiText>{searchConfiguration.searchPipeline || 'None'}</EuiText>
        </EuiFormRow>
      </EuiForm>
    );
  };

  if (loading) {
    return <div>Loading search configuration data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Search Configuration Details"
        description="View the details of your search configuration"
      />
      <EuiSpacer size="l" />
      <EuiPanel hasBorder={true}>
        <SearchConfigurationViewPane />
      </EuiPanel>
    </EuiPageTemplate>
  );
};
