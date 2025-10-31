/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent_Deprecated as EuiPageContent,
  EuiPageContentBody_Deprecated as EuiPageContentBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiText,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
} from '@elastic/eui';
import { PromptPanel } from './prompt_panel';
import { ValidationPanel } from './validation_panel';
import { usePromptTemplate } from '../../hooks/use_prompt_template';

interface PromptTemplateSettingsProps {
  querySetId?: string;
  modelId?: string;
  modelOptions: Array<{ label: string; value: string }>;
  onSave?: (promptTemplate: any) => void;
  onCancel?: () => void;
  httpClient?: any;
}

export const PromptTemplateSettings: React.FC<PromptTemplateSettingsProps> = ({
  querySetId,
  modelId,
  modelOptions,
  onSave,
  onCancel,
  httpClient,
}) => {
  const {
    outputSchema,
    setOutputSchema,
    ratingCriteria,
    setRatingCriteria,
    customInstructions,
    setCustomInstructions,
    placeholders,
    validationModelId,
    setValidationModelId,
    validatePrompt,
    getPromptTemplate,
    resetToDefaults,
  } = usePromptTemplate({ querySetId, modelId, httpClient });

  const handleSave = () => {
    if (onSave) {
      const template = getPromptTemplate();
      onSave(template);
    }
  };

  const handleReset = () => {
    resetToDefaults();
  };

  return (
    <EuiPage restrictWidth>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>Prompt Template Configuration</h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </EuiPageHeader>

        <EuiPageContent>
          <EuiPageContentBody>
            <EuiText>
              <p>
                Configure and validate your LLM prompt template. The template will be used to
                generate relevance judgments based on your query set and search configurations.
              </p>
            </EuiText>

            <EuiSpacer size="l" />

            <EuiFlexGroup direction="column" gutterSize="l">
              <EuiFlexItem>
                <PromptPanel
                  outputSchema={outputSchema}
                  onOutputSchemaChange={setOutputSchema}
                  ratingCriteria={ratingCriteria}
                  onRatingCriteriaChange={setRatingCriteria}
                  customInstructions={customInstructions}
                  onCustomInstructionsChange={setCustomInstructions}
                  placeholders={placeholders}
                />
              </EuiFlexItem>

              <EuiFlexItem>
                <ValidationPanel
                  placeholders={placeholders}
                  modelId={validationModelId}
                  modelOptions={modelOptions}
                  onModelChange={setValidationModelId}
                  onValidate={validatePrompt}
                />
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiSpacer size="l" />

            <EuiFlexGroup justifyContent="spaceBetween">
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty onClick={handleReset} color="danger">
                  Reset to Defaults
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup gutterSize="s">
                  {onCancel && (
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty onClick={onCancel}>Cancel</EuiButtonEmpty>
                    </EuiFlexItem>
                  )}
                  <EuiFlexItem grow={false}>
                    <EuiButton fill onClick={handleSave}>
                      Save Template
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};
