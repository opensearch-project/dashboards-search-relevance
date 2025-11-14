/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiFormRow,
  EuiSuperSelect,
  EuiTextArea,
  EuiText,
  EuiCallOut,
} from '@elastic/eui';
import {
  OutputSchema,
  OUTPUT_SCHEMA_LABELS,
  OUTPUT_SCHEMA_DESCRIPTIONS,
  SYSTEM_PROMPTS,
} from '../../types/prompt_template_types';

interface PromptPanelProps {
  outputSchema: OutputSchema;
  onOutputSchemaChange: (schema: OutputSchema) => void;
  userInstructions: string;
  onUserInstructionsChange: (instructions: string) => void;
  placeholders: string[];
  disabled?: boolean;
}

export const PromptPanel: React.FC<PromptPanelProps> = ({
  outputSchema,
  onOutputSchemaChange,
  userInstructions,
  onUserInstructionsChange,
  placeholders,
  disabled = false,
}) => {
  // Check for duplicate placeholders
  const getDuplicatePlaceholders = (): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = userInstructions.matchAll(regex);
    const allMatches: string[] = [];
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const match of matches) {
      const placeholder = match[1].trim();
      if (seen.has(placeholder)) {
        duplicates.add(placeholder);
      } else {
        seen.add(placeholder);
      }
      allMatches.push(placeholder);
    }

    return Array.from(duplicates);
  };

  const duplicatePlaceholders = getDuplicatePlaceholders();
  const hasDuplicates = duplicatePlaceholders.length > 0;

  const outputSchemaOptions = Object.values(OutputSchema).map((schema) => ({
    value: schema,
    inputDisplay: OUTPUT_SCHEMA_LABELS[schema],
    dropdownDisplay: (
      <>
        <strong>{OUTPUT_SCHEMA_LABELS[schema]}</strong>
        <EuiText size="s" color="subdued">
          <p>{OUTPUT_SCHEMA_DESCRIPTIONS[schema]}</p>
        </EuiText>
      </>
    ),
  }));

  return (
    <EuiPanel paddingSize="l">
      <EuiTitle size="s">
        <h3>Prompt Configuration</h3>
      </EuiTitle>
      <EuiSpacer size="m" />

      <EuiFormRow
        label="Output Schema"
        helpText="Select the rating format for LLM judgment output"
        fullWidth
      >
        <EuiSuperSelect
          options={outputSchemaOptions}
          valueOfSelected={outputSchema}
          onChange={onOutputSchemaChange}
          disabled={disabled}
          fullWidth
        />
      </EuiFormRow>

      <EuiSpacer size="m" />

      <EuiFormRow
        label="User Input Instructions (Optional)"
        helpText="Add custom instructions, examples, or specific guidance. Use {{field_name}} for placeholders that will be filled during validation and judgment generation."
        fullWidth
      >
        <EuiTextArea
          placeholder="Example: Focus on semantic similarity for {{query}} and {{document}}..."
          value={userInstructions}
          onChange={(e) => onUserInstructionsChange(e.target.value)}
          rows={4}
          disabled={disabled}
          fullWidth
        />
      </EuiFormRow>

      <EuiSpacer size="m" />

      {hasDuplicates && (
        <>
          <EuiCallOut
            title="Duplicate placeholders detected"
            color="warning"
            iconType="alert"
            size="s"
          >
            <p>
              The following placeholders appear multiple times:{' '}
              {duplicatePlaceholders.map((p, i) => (
                <React.Fragment key={p}>
                  <strong>{`{{${p}}}`}</strong>
                  {i < duplicatePlaceholders.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
              . Each placeholder should only be used once to avoid confusion.
            </p>
          </EuiCallOut>
          <EuiSpacer size="m" />
        </>
      )}
    </EuiPanel>
  );
};
