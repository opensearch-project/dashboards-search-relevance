/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';
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

interface SearchConfigurationViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const SearchConfigurationView: React.FC<SearchConfigurationViewProps> = ({
  http,
  id,
}) => {
  const [searchConfiguration, setSearchConfiguration] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const SearchConfigurationViewPane: React.FC = () => {
    const formatJson = (json: string) => {
      try {
        return JSON.stringify(JSON.parse(json), null, 2);
      } catch {
        return json;
      }
    };

    return (
      <EuiForm>
        <EuiFormRow
          label="Search Configuration Name"
          fullWidth
        >
          <EuiText>{searchConfiguration.name}</EuiText>
        </EuiFormRow>

        <EuiFormRow
          label="Index"
          fullWidth
        >
          <EuiText>{searchConfiguration.index}</EuiText>
        </EuiFormRow>

        <EuiFormRow
          label="Query"
          fullWidth
        >
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

        {(searchConfiguration.pipeline || searchConfiguration.template) && (
          <EuiDescriptionList type="column" compressed>
            {searchConfiguration.pipeline && (
              <>
                <EuiDescriptionListTitle>Search Pipeline</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>{searchConfiguration.pipeline}</EuiDescriptionListDescription>
              </>
            )}
            {searchConfiguration.template && (
              <>
                <EuiDescriptionListTitle>Search Template</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>{searchConfiguration.template}</EuiDescriptionListDescription>
              </>
            )}
          </EuiDescriptionList>
        )}
      </EuiForm>
    );
  };

  useEffect(() => {
    const fetchSearchConfiguration = async () => {
      try {
        setLoading(true);
        const response = await http.get(ServiceEndpoints.SearchConfigurations);
        const list = response ? response.hits.hits.map((hit: any) => ({ ...hit._source })) : [];
        const filteredList = list.filter((item: any) => item.id === id);

        if (filteredList.length > 0) {
          setSearchConfiguration(filteredList[0]);
        } else {
          setError('No matching search configuration found');
        }
      } catch (err) {
        setError('Error loading search configuration data');
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchConfiguration();
  }, [http, id]);

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
