/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';

import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiTitle,
  EuiSpacer,
  EuiLoadingSpinner,
  EuiCallOut,
} from '@elastic/eui';
import { withRouter } from 'react-router-dom';
import { EuiPanel } from '@elastic/eui';
import { ConfigurationForm, ConfigurationFormRef } from './configuration_form';
import { TemplateConfigurationProps, ConfigurationFormData } from './types';
import { ServiceEndpoints, Routes } from '../../../../common';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { ConfigurationActions } from './configuration_action';

export const TemplateConfiguration = ({
  templateType,
  onBack,
  onClose,
  history,
}: TemplateConfigurationProps) => {
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showTemplateConfigError, setShowTemplateConfigError] = useState<boolean>(false);

  const configurationFormRef = useRef<ConfigurationFormRef>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const {
    services: { http, notifications },
  } = useOpenSearchDashboards();

  const handleNext = async () => {
    setShowTemplateConfigError(false); // Clear previous errors

    if (configurationFormRef.current) {
      const { data, isValid } = configurationFormRef.current.validateAndGetData(); // Get data and validity directly

      if (!isValid || data === null) {
        setShowTemplateConfigError(true);
        return;
      }

      // If we reach here, `data` is guaranteed to be valid and not null
      try {
        setIsCreating(true);
        const response = await http.post(ServiceEndpoints.Experiments, {
          body: JSON.stringify(data), // Use the validated data received from child
        });

        if (response.experiment_id) {
          if (isMountedRef.current) {
            setExperimentId(response.experiment_id);
          }
          notifications.toasts.addSuccess(
            `Experiment ${response.experiment_id} created successfully`
          );
          history.push(Routes.Home);
          if (configurationFormRef.current) {
            configurationFormRef.current.clearFormErrors();
          }
        } else {
          throw new Error('No experiment ID received');
        }
      } catch (err) {
        notifications.toasts.addError(err, {
          title: 'Failed to create experiment',
        });
      } finally {
        if (isMountedRef.current) {
          setIsCreating(false);
        }
      }
    } else {
      // This case should ideally not happen if the form is rendered,
      // but it's a good safeguard.
      setShowTemplateConfigError(true);
      notifications.toasts.addError('Form component not ready. Please try again.');
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
          <ConfigurationForm templateType={templateType} ref={configurationFormRef} />
        </EuiFlexItem>

        <EuiFlexItem>
          <ConfigurationActions onBack={onBack} onClose={onClose} onNext={handleNext} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );

  return <>{isCreating ? <EuiLoadingSpinner size="xl" /> : renderConfiguration()}</>;
};

export const TemplateConfigurationWithRouter = withRouter(TemplateConfiguration);
