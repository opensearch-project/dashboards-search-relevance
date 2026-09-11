/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFlexItem,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiSpacer,
} from '@elastic/eui';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CoreStart, NotificationsStart } from '../../../../../../src/core/public';
import { Routes } from '../../../../common';
import { LtrModelUploadForm } from '../components/ltr_model_upload_form';
import { useLtrFeatureSetList } from '../hooks/use_ltr_feature_set_list';
import { useLtrModelUploadForm } from '../hooks/use_ltr_model_upload_form';
import { LtrModelService } from '../services/ltr_model_service';
import { LTR_UNAVAILABLE_COPY } from '../unavailable_copy';

interface LtrModelUploadProps extends RouteComponentProps {
  http: CoreStart['http'];
  notifications: NotificationsStart;
}

export const LtrModelUpload: React.FC<LtrModelUploadProps> = ({ http, notifications, history }) => {
  const form = useLtrModelUploadForm();
  const service = useMemo(() => new LtrModelService(http), [http]);
  const { featureSets, isLoading, unavailableReason } = useLtrFeatureSetList(http);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = useCallback(() => {
    history.push(Routes.LtrModelListing);
  }, [history]);

  const uploadModel = useCallback(async () => {
    const model = form.validate();
    if (!model) {
      return;
    }

    setIsSubmitting(true);
    try {
      await service.createModel(model);
      notifications.toasts.addSuccess(`Model "${model.name}" uploaded successfully`);
      // Straight to the detail view: it renders the definition back out of the store, which
      // is the only confirmation that what was pasted is what landed.
      history.push(`${Routes.LtrModelViewPrefix}/${encodeURIComponent(model.name)}`);
    } catch (err) {
      const reason = err?.body?.attributes?.ltrErrorType;

      // The store has no update path, so a collision is a form error the user can fix by
      // renaming -- not a failure to report and walk away from.
      if (reason === 'model_exists') {
        form.setErrors({
          name: `A model named "${model.name}" already exists. Models cannot be replaced, so choose a different name.`,
        });
      } else if (reason === 'featureset_not_found') {
        form.setErrors({
          featureSetName: `Feature set "${model.featureSetName}" is no longer in the store.`,
        });
      } else {
        notifications.toasts.addError(err?.body || err, {
          title: 'Failed to upload model',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [form, service, notifications.toasts, history]);

  const renderBody = () => {
    if (unavailableReason) {
      const { title, body } = LTR_UNAVAILABLE_COPY[unavailableReason];
      return (
        <EuiCallOut title={title} color="primary" iconType="iInCircle">
          <p>{body}</p>
        </EuiCallOut>
      );
    }

    return (
      <EuiPanel hasBorder={true}>
        <EuiFlexItem>
          <LtrModelUploadForm
            name={form.name}
            setName={form.setName}
            featureSetName={form.featureSetName}
            setFeatureSetName={form.setFeatureSetName}
            modelType={form.modelType}
            setModelType={form.setModelType}
            definitionText={form.definitionText}
            setDefinitionText={form.setDefinitionText}
            errors={form.errors}
            featureSets={featureSets}
            isLoadingFeatureSets={isLoading}
          />
        </EuiFlexItem>
      </EuiPanel>
    );
  };

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Upload LTR Model"
        description="Deploy a model trained outside the cluster into this cluster's feature store."
        rightSideItems={
          unavailableReason
            ? []
            : [
                <EuiButtonEmpty
                  onClick={handleCancel}
                  iconType="cross"
                  size="s"
                  data-test-subj="cancelLtrModelUploadButton"
                >
                  Cancel
                </EuiButtonEmpty>,
                <EuiButton
                  onClick={uploadModel}
                  fill
                  size="s"
                  iconType="check"
                  color="primary"
                  isLoading={isSubmitting}
                  data-test-subj="uploadLtrModelButton"
                >
                  Upload Model
                </EuiButton>,
              ]
        }
      />
      <EuiSpacer size="s" />
      {renderBody()}
    </EuiPageTemplate>
  );
};

export const LtrModelUploadWithRouter = withRouter(LtrModelUpload);
