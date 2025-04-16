import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  EuiPanel,
  EuiFlexItem,
  EuiFlexGroup,
  EuiTitle,
  EuiSpacer,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { ConfigurationForm } from './configuration_form';
import { ConfigurationActions } from './configuration_action';
import { TemplateConfigurationProps, ConfigurationFormData, SearchConfigFromData } from './types';
import { SearchConfigForm } from './search_configuration_form';
import { EvaluationResults } from '../evaluation/evaluation_results';
import { ServiceEndpoints } from '../../../../common';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';

export const TemplateConfiguration = ({
  templateType,
  onBack,
  onClose,
}: TemplateConfigurationProps) => {
  /**
   * Config Form will collect querySetId along with other experiment_type related fields to generate judgments.
   */
  const [configFormData, setConfigFormData] = useState<ConfigurationFormData | null>(null);
  /**
   * Search Config Form will collect pairs of searchConfigurationId + index
   */
  const [searchConfigData, setSearchConfigData] = useState<SearchConfigFromData>({
    searchConfigs: [],
  });

  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [showEvaluation, setShowEvaluation] = useState(false);

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
        setIsCreating(true);
        console.log('Experiment creation', combinedData);
        const response = await http.post(ServiceEndpoints.Experiments, {
          body: JSON.stringify({
            index: 'ecommerce', // TODO make selectable
            k: 10, // TODO make selectable
            querySetId: combinedData.querySets[0].value,
            searchConfigurationList: combinedData.searchConfigs.map((o) => o.value),
          }),
        });

        if (response.experiment_id) {
          setExperimentId(response.experiment_id);
          notifications.toasts.addSuccess(`Experiment created successfully`);
          setShowEvaluation(true);
        } else {
          throw new Error('No experiment ID received');
        }
      } catch (err) {
        notifications.toasts.addError(err, {
          title: 'Failed to create experiment',
        });
      } finally {
        setIsCreating(false);
      }
    } else {
      console.log('Validation failed: Please fill in all required fields');
    }
  };

  const handleBackToConfig = () => {
    setShowEvaluation(false);
  };

  const renderConfiguration = () => (
    <EuiFlexGroup direction="column" gutterSize="m">
      <EuiFlexItem grow={false}>
        <EuiTitle size="m">
          <h2>{templateType} Experiment</h2>
        </EuiTitle>
        <EuiSpacer size="m" />
        <ConfigurationForm templateType={templateType} onSave={handleConfigSave} />
      </EuiFlexItem>

      <EuiFlexItem>
        <SearchConfigForm
          formData={searchConfigData}
          onChange={handleSearchConfigChange}
          http={http}
        />
      </EuiFlexItem>

      <EuiFlexItem>
        <ConfigurationActions onBack={onBack} onClose={onClose} onNext={handleNext} />
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  const renderEvaluation = () => (
    <EvaluationResults
      templateType={templateType}
      experimentId={experimentId}
      onBack={handleBackToConfig}
    />
  );

  return (
    <>
      {isCreating ? (
        <EuiLoadingSpinner size="xl" />
      ) : showEvaluation ? (
        renderEvaluation()
      ) : (
        renderConfiguration()
      )}
    </>
  );
};
