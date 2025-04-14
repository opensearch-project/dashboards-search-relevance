import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  EuiPanel,
  EuiFlexItem,
  EuiFlexGroup,
} from "@elastic/eui";
import { ConfigurationHeader } from './configuration_header';
import { ConfigurationForm } from './configuration_form';
import { ConfigurationActions } from './configuration_action';
import {
  TemplateConfigurationProps,
  ConfigurationFormData, SearchConfigFromData
} from "./types";
import { SearchConfigForm } from "./search_configuration_form";
import { Evaluation_results } from "../evaluation/evaluation_results";
import { ServiceEndpoints } from '../../../../common';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';

export const TemplateConfiguration = ({
                                        templateType,
                                        onBack,
                                        onClose,
                                      }: TemplateConfigurationProps) => {
  const [configFormData, setConfigFormData] = useState<ConfigurationFormData | null>(null);
  const [searchConfigData, setSearchConfigData] = useState<SearchConfigFromData>({
    searchConfigs: [],
  });
  const [showEvaluation, setShowEvaluation] = useState(false);
  const history = useHistory();

  const handleConfigSave = (data: ConfigurationFormData) => {
    setConfigFormData(data);
  };

  const handleSearchConfigChange = (data: SearchConfigFromData) => {
    setSearchConfigData(data);
  };

  const {
      services: { http, notifications },
    } = useOpenSearchDashboards();

  const handleNext = async () => {

    if (configFormData && searchConfigData.searchConfigs.length > 0) {
      const combinedData = {
        ...configFormData,
        ...searchConfigData,
      };
      try {
        console.log("Experiment creation", combinedData)
        await http.post(ServiceEndpoints.Experiments, {
          body: JSON.stringify({
            index: "ecommerce", // TODO make selectable
            k: 10, // TODO make selectable
            querySetId: combinedData.querySets[0].value,
            searchConfigurationList: combinedData.searchConfigs.map((o) => (o.value)),
          }),
        });

        notifications.toasts.addSuccess(`Experiment created successfully`);
        history.push('/');
        setShowEvaluation(true);
      } catch (err) {
        notifications.toasts.addError(err, {
          title: 'Failed to create search configuration',
        });
      }
    } else {
      console.log('Validation failed: Please fill in all required fields');
    }
  };

  const handleBackToConfig = () => {
    setShowEvaluation(false);
  };

  if(showEvaluation) {
    return (
      <EuiPanel paddingSize="l" hasBorder={true} hasShadow={false} borderRadius="m">
        <Evaluation_results
          templateType={templateType}
          configData={{ ...configFormData, ...searchConfigData }}
          onBack={handleBackToConfig}
        />
      </EuiPanel>
    );
  }
  return (
    <EuiPanel paddingSize="l" hasBorder={true} hasShadow={false} borderRadius="m">
      <EuiFlexGroup direction="column" gutterSize="m">
        <EuiFlexItem grow={false}>
          <ConfigurationHeader templateType={templateType} />
          <ConfigurationForm
            templateType={templateType}
            onSave={handleConfigSave}
          />
        </EuiFlexItem>

        <EuiFlexItem>
          <SearchConfigForm
            formData={searchConfigData}
            onChange={handleSearchConfigChange}
            http={http}
          />
        </EuiFlexItem>

        <EuiFlexItem>
          <ConfigurationActions
            onBack={onBack}
            onClose={onClose}
            onNext={handleNext}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
