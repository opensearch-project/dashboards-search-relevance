/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiText,
  EuiIcon,
} from '@elastic/eui';
import React, { useState } from 'react';
import { CoreStart } from '../../../../../src/core/public';
import { SavedObjectIds } from '../../../common';
import { escapedDashboardsData } from '../common_utils/dashboards_data';

interface DashboardInstallModalProps {
  onClose: () => void;
  onSuccess?: (() => void) | (() => (() => void));
  title?: string;
  http: CoreStart['http'];
  setError: (error: string | null) => void;
}

export const DashboardInstallModal: React.FC<DashboardInstallModalProps> = ({ 
  onClose, 
  onSuccess,
  title = "Install Dashboards",
  http,
  setError
}) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [dashboardsInstalled, setDashboardsInstalled] = useState<boolean | null>(null);

  // Check if dashboards are already installed when modal opens
  React.useEffect(() => {
    const checkInstallation = async () => {
      try {
        const _ = await http.get(`/api/saved_objects/dashboard/${SavedObjectIds.ExperimentDeepDive}`);
        setDashboardsInstalled(true);
      } catch(error) {
        setDashboardsInstalled(false);
      }
    };
    checkInstallation();
  }, [http]);

  const handleConfirm = async () => {
    setIsInstalling(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', new Blob([escapedDashboardsData], { type: 'application/x-ndjson' }), 'dashboards.ndjson');
      await http.post('/api/saved_objects/_import', {
        body: formData,
        headers: {
          'Content-Type': undefined,
        },
        query: {
          overwrite: true,
        }
      });
      onSuccess?.();
      onClose();
    } catch(error) {
      console.error('Failed to install dashboards:', error);
      setError('Failed to install dashboards');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <EuiModal onClose={handleCancel}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiIcon type="dashboardApp" size="m" style={{ marginRight: '8px' }} />
          {title}
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiText>
          {dashboardsInstalled === null ? (
            <p>Checking dashboard installation status...</p>
          ) : dashboardsInstalled ? (
            <>
              <p>The dashboards are already installed.</p>
              <p>You can reinstall them if needed, which will overwrite the existing dashboards.</p>
            </>
          ) : onSuccess ? ( // This is the message when the user clicks on the visualization button for an experiment
            <>
              <p>In order to visualize the experiment, you need dashboards that are not currently installed.</p>
              <p>Would you like to install them now?</p>
            </>
          ) : (
            <>
              <p>This will install the necessary dashboard visualizations for viewing experiment results.</p>
              <p>Would you like to install them now?</p>
            </>
          )}
        </EuiText>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty onClick={handleCancel}>Cancel</EuiButtonEmpty>
        <EuiButton 
          onClick={handleConfirm} 
          fill 
          color="primary" 
          isLoading={isInstalling}
          disabled={dashboardsInstalled === null}
        >
          {dashboardsInstalled ? 'Reinstall Dashboards' : 'Install Dashboards'}
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}; 