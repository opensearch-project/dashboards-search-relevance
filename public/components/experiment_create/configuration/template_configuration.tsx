import React, { useState } from 'react';

import { EuiFlexItem, EuiFlexGroup, EuiTitle, EuiSpacer, EuiLoadingSpinner } from '@elastic/eui';
import { withRouter } from 'react-router-dom';
import { ConfigurationForm } from './configuration_form';
import { ConfigurationActions } from './configuration_action';
import { TemplateConfigurationProps, ConfigurationFormData, SearchConfigFromData } from './types';
import { ServiceEndpoints } from '../../../../common';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { EuiPanel } from '@elastic/eui';
export const TemplateConfiguration = ({
  templateType,
  onBack,
  onClose,
  history,
}: TemplateConfigurationProps) => {
  /**
   * Config Form will collect querySetId along with other experiment_type related fields to generate judgments.
   */
  const [configFormData, setConfigFormData] = useState<ConfigurationFormData | null>(null);

  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [showEvaluation, setShowEvaluation] = useState(false);

  const handleConfigSave = (data: ConfigurationFormData) => {
    setConfigFormData(data);
  };

  const {
    services: { http, notifications },
  } = useOpenSearchDashboards();

  const handleNext = async () => {
    if (configFormData) {
      try {
        setIsCreating(true);
        const response = await http.post(ServiceEndpoints.Experiments, {
          body: JSON.stringify(configFormData),
        });

        if (response.experiment_id) {
          setExperimentId(response.experiment_id);
          notifications.toasts.addSuccess(`Experiment ${response.experiment_id} created successfully`);
          history.push(`/experiment/`);
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
    <EuiPanel>
      <EuiFlexGroup direction="column" gutterSize="m">
        <EuiFlexItem grow={false}>
          <EuiTitle size="m">
            <h2>{templateType} Experiment</h2>
          </EuiTitle>
          <EuiSpacer size="m" />
          <ConfigurationForm templateType={templateType} onSave={handleConfigSave} />
        </EuiFlexItem>

        <EuiFlexItem>
          <ConfigurationActions onBack={onBack} onClose={onClose} onNext={handleNext} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );

  return (
    <>
      {isCreating ? (
        <EuiLoadingSpinner size="xl" />
      ) : (
        renderConfiguration()
      )}
    </>
  );
};

export const TemplateConfigurationWithRouter = withRouter(TemplateConfiguration);
