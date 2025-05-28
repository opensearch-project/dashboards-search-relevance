/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiPageTemplate,
  EuiFieldNumber,
  EuiCompressedFormRow,
  EuiFlexItem,
  EuiPanel,
  EuiSelect,
  EuiForm,
  EuiPageHeader,
  EuiFieldText,
  EuiComboBox,
  EuiSpacer,
  EuiBadge,
  EuiSwitch,
  EuiFlexGroup,
  EuiAccordion,
} from '@elastic/eui';
import React, { useCallback, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ServiceEndpoints } from '../../../common';

enum JudgmentType {
  LLM = 'LLM_JUDGMENT',
  UBI = 'UBI_JUDGMENT',
}

interface JudgmentCreateProps {
  http: any;
  notifications: any;
  history: any;
}

export const JudgmentCreate: React.FC<JudgmentCreateProps> = ({ http, notifications, history }) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [type, setType] = useState<JudgmentType>(JudgmentType.LLM);

  // LLM specific states
  const [querySetOptions, setQuerySetOptions] = useState<Array<{ label: string; value: string }>>(
    []
  );
  const [selectedQuerySet, setSelectedQuerySet] = useState<Array<{ label: string; value: string }>>(
    []
  );
  const [searchConfigOptions, setSearchConfigOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [selectedSearchConfigs, setSelectedSearchConfigs] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [size, setSize] = useState(5);
  const [modelId, setModelId] = useState('');
  // Optional LLM states
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [contextFields, setContextFields] = useState<string[]>([]);
  const [newContextField, setNewContextField] = useState('');
  const [tokenLimit, setTokenLimit] = useState<number>(4000);
  const [ignoreFailure, setIgnoreFailure] = useState<boolean>(false);

  // UBI specific states
  const [clickModel, setClickModel] = useState('coec');
  const [maxRank, setMaxRank] = useState(20);

  // Loading states
  const [isLoadingQuerySets, setIsLoadingQuerySets] = useState(false);
  const [isLoadingSearchConfigs, setIsLoadingSearchConfigs] = useState(false);

  // Fetch query sets
  const fetchQuerySets = async () => {
    setIsLoadingQuerySets(true);
    try {
      const response = await http.get(ServiceEndpoints.QuerySets);
      const options = response.hits.hits.map((qs: any) => ({
        label: qs._source.name,
        value: qs._source.id,
      }));
      setQuerySetOptions(options);
    } catch (error) {
      notifications.toasts.addDanger('Failed to fetch query sets');
    } finally {
      setIsLoadingQuerySets(false);
    }
  };

  // Fetch search configurations
  const fetchSearchConfigs = async () => {
    setIsLoadingSearchConfigs(true);
    try {
      const response = await http.get(ServiceEndpoints.SearchConfigurations);
      const options = response.hits.hits.map((sc: any) => ({
        label: sc._source.name,
        value: sc._source.id,
      }));
      setSearchConfigOptions(options);
    } catch (error) {
      notifications.toasts.addDanger('Failed to fetch search configurations');
    } finally {
      setIsLoadingSearchConfigs(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (type === JudgmentType.LLM) {
      fetchQuerySets();
      fetchSearchConfigs();
    }
  }, [type]);

  // Validate form fields
  const validateForm = () => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('Name is a required parameter.');
      isValid = false;
    } else {
      setNameError('');
    }

    if (type === JudgmentType.LLM) {
      if (selectedQuerySet.length === 0) {
        notifications.toasts.addDanger('Please select a query set');
        isValid = false;
      }
      if (selectedSearchConfigs.length === 0) {
        notifications.toasts.addDanger('Please select at least one search configuration');
        isValid = false;
      }
      if (!modelId) {
        notifications.toasts.addDanger('Model ID is required');
        isValid = false;
      }
    }

    return isValid;
  };

  const addContextField = useCallback(() => {
    if (newContextField && !contextFields.includes(newContextField)) {
      setContextFields([...contextFields, newContextField]);
      setNewContextField('');
    }
  }, [newContextField, contextFields]);

  const removeContextField = useCallback(
    (field: string) => {
      setContextFields(contextFields.filter((f) => f !== field));
    },
    [contextFields]
  );

  // Handle form submission
  const createJudgment = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    const payload =
      type === JudgmentType.LLM
        ? {
            name,
            type,
            querySetId: selectedQuerySet[0]?.value,
            searchConfigurationList: selectedSearchConfigs.map((config) => config.value),
            size,
            modelId,
            ...(contextFields.length > 0 && { contextFields }),
            ...(tokenLimit !== 4000 && { tokenLimit: tokenLimit.toString() }),
            ...(ignoreFailure && { ignoreFailure }),
          }
        : {
            name,
            type,
            clickModel,
            maxRank,
          };

    http
      .put(ServiceEndpoints.Judgments, { body: JSON.stringify(payload) })
      .then(() => {
        notifications.toasts.addSuccess('Judgment created successfully');
        history.push('/judgment');
      })
      .catch((error: any) => {
        notifications.toasts.addDanger(`Failed to create judgment: ${error.message}`);
      });
  }, [
    validateForm,
    type,
    name,
    selectedQuerySet,
    selectedSearchConfigs,
    size,
    modelId,
    clickModel,
    maxRank,
    http,
    notifications.toasts,
    history,
    contextFields,
    tokenLimit,
    ignoreFailure,
  ]);

  const handleCancel = () => {
    history.push('/judgment');
  };

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Judgment"
        description="Configure a new judgment."
        rightSideItems={[
          <EuiButtonEmpty
            onClick={handleCancel}
            iconType="cross"
            size="s"
            data-test-subj="cancelJudgmentButton"
          >
            Cancel
          </EuiButtonEmpty>,
          <EuiButton
            onClick={createJudgment}
            fill
            size="s"
            iconType="check"
            data-test-subj="createJudgmentButton"
            color="primary"
          >
            Create Judgment
          </EuiButton>,
        ]}
      />

      <EuiPanel hasBorder={true}>
        <EuiFlexItem>
          <EuiForm component="form" isInvalid={Boolean(nameError)}>
            <EuiCompressedFormRow
              label="Name"
              isInvalid={nameError.length > 0}
              error={nameError}
              helpText="A unique name for this judgment."
              fullWidth
            >
              <EuiFieldText
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => {
                  if (!e.target.value.trim()) {
                    setNameError('Name is a required parameter.');
                  }
                }}
                isInvalid={nameError.length > 0}
                fullWidth
              />
            </EuiCompressedFormRow>

            <EuiCompressedFormRow
              label="Type"
              helpText={
                <p>
                  There are many types of judgments available. Learn more in{' '}
                  <a href="https://opensearch.org/docs/latest/search-plugins/search-relevance/index/">
                    Types of Judgments
                  </a>
                  .
                </p>
              }
              fullWidth
            >
              <EuiSelect
                options={[
                  { value: JudgmentType.LLM, text: 'LLM Judgment' },
                  { value: JudgmentType.UBI, text: 'UBI Judgment' },
                ]}
                value={type}
                onChange={(e) => setType(e.target.value as JudgmentType)}
              />
            </EuiCompressedFormRow>

            {type === JudgmentType.LLM ? (
              <>
                <EuiCompressedFormRow label="Query Set" fullWidth>
                  <EuiComboBox
                    placeholder="Select a query set"
                    options={querySetOptions}
                    selectedOptions={selectedQuerySet}
                    onChange={setSelectedQuerySet}
                    singleSelection={{ asPlainText: true }}
                    isLoading={isLoadingQuerySets}
                    fullWidth
                  />
                </EuiCompressedFormRow>

                <EuiCompressedFormRow label="Search Configurations" fullWidth>
                  <EuiComboBox
                    placeholder="Select configurations"
                    options={searchConfigOptions}
                    selectedOptions={selectedSearchConfigs}
                    onChange={setSelectedSearchConfigs}
                    isLoading={isLoadingSearchConfigs}
                    fullWidth
                  />
                </EuiCompressedFormRow>

                <EuiCompressedFormRow
                  label="K Value"
                  helpText="The number of documents from the result list to include in the judging process."
                  fullWidth
                >
                  <EuiFieldNumber
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value, 10))}
                    min={1}
                    fullWidth
                  />
                </EuiCompressedFormRow>

                <EuiCompressedFormRow
                  label="Model ID"
                  helpText="The ID of the LLM model that is used for the judging process."
                  fullWidth
                >
                  <EuiFieldText
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    fullWidth
                  />
                </EuiCompressedFormRow>

                <EuiSpacer size="m" />
                <EuiAccordion
                  id="advancedSettings"
                  buttonContent="Advanced Settings"
                  paddingSize="m"
                  isOpen={isAdvancedSettingsOpen}
                  onToggle={(isOpen) => setIsAdvancedSettingsOpen(isOpen)}
                >
                  <EuiSpacer size="m" />

                  <EuiCompressedFormRow
                    label="Context Fields"
                    helpText="Specify context fields used for the LLM judgment."
                    fullWidth
                  >
                    <div>
                      <EuiFlexGroup gutterSize="s">
                        <EuiFlexItem>
                          <EuiFieldText
                            placeholder="Enter field name"
                            value={newContextField}
                            onChange={(e) => setNewContextField(e.target.value)}
                            onKeyUp={(e) => {
                              if (e.key === 'Enter' && newContextField.trim()) {
                                addContextField();
                              }
                            }}
                            fullWidth
                          />
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                          <EuiButton
                            size="m"
                            onClick={addContextField}
                            isDisabled={!newContextField.trim()}
                          >
                            Add
                          </EuiButton>
                        </EuiFlexItem>
                      </EuiFlexGroup>

                      {contextFields.length > 0 && (
                        <>
                          <EuiSpacer size="s" />
                          <div>
                            {contextFields.map((field) => (
                              <EuiBadge
                                key={field}
                                color="hollow"
                                onClose={() => removeContextField(field)}
                                style={{ marginRight: '4px', marginBottom: '4px' }}
                              >
                                {field}
                              </EuiBadge>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </EuiCompressedFormRow>

                  <EuiCompressedFormRow
                    label="Token Limit"
                    helpText="Please check token limit for the modelId (1000-500000)"
                    fullWidth
                  >
                    <EuiFieldNumber
                      value={tokenLimit}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (value >= 1000 && value <= 500000) {
                          setTokenLimit(value);
                        }
                      }}
                      min={1000}
                      max={500000}
                      fullWidth
                    />
                  </EuiCompressedFormRow>

                  <EuiCompressedFormRow
                    label="Ignore Failure"
                    helpText="Continue processing even if some judgments fail"
                    fullWidth
                  >
                    <EuiSwitch
                      label="Ignore failures during judgment process"
                      checked={ignoreFailure}
                      onChange={(e) => setIgnoreFailure(e.target.checked)}
                    />
                  </EuiCompressedFormRow>
                </EuiAccordion>
              </>
            ) : (
              <>
                <EuiCompressedFormRow label="Click Model" fullWidth>
                  <EuiSelect
                    options={[
                      { value: 'coec', text: 'COEC' },
                      // Add other click model options here
                    ]}
                    value={clickModel}
                    onChange={(e) => setClickModel(e.target.value)}
                  />
                </EuiCompressedFormRow>

                <EuiCompressedFormRow label="Max Rank" fullWidth>
                  <EuiFieldNumber
                    value={maxRank}
                    onChange={(e) => setMaxRank(parseInt(e.target.value, 10))}
                    min={1}
                    fullWidth
                  />
                </EuiCompressedFormRow>
              </>
            )}
          </EuiForm>
        </EuiFlexItem>
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export const JudgmentCreateWithRouter = withRouter(JudgmentCreate);
