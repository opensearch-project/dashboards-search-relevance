import React, { useState } from 'react';
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
import { BASE_EXPERIMENT_NODE_API_PATH } from '../../../../common';
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

  const handleConfigSave = (data: ConfigurationFormData) => {
    setConfigFormData(data);
  };

  const handleSearchConfigChange = (data: SearchConfigFromData) => {
    setSearchConfigData(data);
  };

  const {
      services: { http },
    } = useOpenSearchDashboards();

  const handleNext = async () => {
    console.log('configFormData:', configFormData);
    console.log('searchConfigs:', searchConfigData.searchConfigs);

    if (configFormData && searchConfigData.searchConfigs.length > 0) {
      const combinedData = {
        ...configFormData,
        ...searchConfigData,
      };
      try {
        await http.post(BASE_EXPERIMENT_NODE_API_PATH, {
          body: JSON.stringify(combinedData),
        });

        console.log('combinedData:', combinedData);
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
