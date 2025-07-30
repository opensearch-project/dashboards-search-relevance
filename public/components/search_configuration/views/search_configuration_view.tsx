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
}

export const SearchConfigurationView: React.FC<SearchConfigurationViewProps> = ({ http, id }) => {
  const { searchConfiguration, loading, error, formatJson } = useSearchConfigurationView(http, id);

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

        {(searchConfiguration.searchPipeline || searchConfiguration.template) && (
          <EuiDescriptionList type="column" compressed>
            {searchConfiguration.searchPipeline && (
              <>
                <EuiDescriptionListTitle>Search Pipeline</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {searchConfiguration.searchPipeline}
                </EuiDescriptionListDescription>
              </>
            )}
            {searchConfiguration.template && (
              <>
                <EuiDescriptionListTitle>Search Template</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {searchConfiguration.template}
                </EuiDescriptionListDescription>
              </>
            )}
          </EuiDescriptionList>
        )}
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

export default SearchConfigurationView;
