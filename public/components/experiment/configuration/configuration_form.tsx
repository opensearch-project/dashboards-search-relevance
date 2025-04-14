import React, { useState, useEffect } from 'react';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
} from '@elastic/eui';
import { ResultListComparisonForm } from './form/result_list_comparison_form';
import { UserBehaviorForm } from './form/user_behavior_form';
import { LLMForm } from './form/llm_form';
import {
  ConfigurationFormProps,
  ConfigurationFormData,
  ResultListComparisonFormData,
  UserBehaviorFormData,
  LLMFormData,
} from './types';

const getInitialFormData = (templateType: string): ConfigurationFormData => {
  const baseData = {
    querySets: [],
  };

  switch (templateType) {
    case 'Result List Comparison':
      return {
        ...baseData,
      };
    case 'User Behavior':
      return {
        ...baseData,
        startDate: '',
        endDate: '',
        collectSignal: '',
        scoreThreshold: '',
      };
    case 'LLM':
      return {
        ...baseData,
        modelId: '',
        scoreThreshold: '',
      };
    default:
      return baseData as unknown as ResultListComparisonFormData | UserBehaviorFormData | LLMFormData;
  }
};

export const ConfigurationForm = ({ templateType, onSave }: ConfigurationFormProps) => {
  const [formData, setFormData] = useState<ConfigurationFormData>(
    getInitialFormData(templateType)
  );

  useEffect(() => {
    setFormData(getInitialFormData(templateType));
  }, [templateType]);

  useEffect(() => {
    onSave(formData);
  }, [formData, onSave]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const renderForm = () => {
    switch (templateType) {
      case 'Result List Comparison':
        return (
          <ResultListComparisonForm
            formData={formData as ResultListComparisonFormData}
            onChange={handleChange}
          />
        );
      case 'User Behavior':
        return (
          <UserBehaviorForm
            formData={formData as UserBehaviorFormData}
            onChange={handleChange}
          />
        );
      case 'LLM':
        return (
          <>
          <LLMForm
            formData={formData as LLMFormData}
            onChange={handleChange}
          />

          <EuiFlexGroup justifyContent="flexEnd">
                  <EuiFlexItem grow={false}>
                    <EuiFormRow hasEmptyLabelSpace>
                      <EuiButton onClick={handleSave}>Save Judgement</EuiButton>
                    </EuiFormRow>
                  </EuiFlexItem>
                </EuiFlexGroup>
                </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderForm()}
    </>
  );
};
