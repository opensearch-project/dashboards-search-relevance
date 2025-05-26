import React, { useState, useEffect } from 'react';
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiFormRow } from '@elastic/eui';
import { ResultListComparisonForm } from './form/result_list_comparison_form';
import { UserBehaviorForm } from './form/user_behavior_form';
import { LLMForm } from './form/llm_form';
import {
  ConfigurationFormProps,
  ConfigurationFormData,
  ResultListComparisonFormData,
  UserBehaviorFormData,
  LLMFormData,
  TemplateType,
} from './types';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';

const getInitialFormData = (templateType: TemplateType): ConfigurationFormData => {
  const baseData = {
    querySetId: '',
    size: 10,
    searchConfigurationList: [],
  };

  switch (templateType) {
    case TemplateType.QuerySetComparison:
      return {
        ...baseData,
        type: "PAIRWISE_COMPARISON",
      };
    case TemplateType.SearchEvaluation:
      return {
        ...baseData,
        judgmentList: [],
        type: "UBI_EVALUATION",
      };
    default:
      return (baseData as unknown) as
        | ResultListComparisonFormData
        | UserBehaviorFormData
        | LLMFormData;
  }
};

export const ConfigurationForm = ({ templateType, onSave }: ConfigurationFormProps) => {
  const {
    services: { http },
  } = useOpenSearchDashboards();

  const [formData, setFormData] = useState<ConfigurationFormData>(getInitialFormData(templateType));

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
      case TemplateType.QuerySetComparison:
        return (
          <ResultListComparisonForm
            formData={formData as ResultListComparisonFormData}
            onChange={handleChange}
            http={http}
          />
        );
      case TemplateType.SearchEvaluation:
        return (
          <UserBehaviorForm formData={formData as UserBehaviorFormData} onChange={handleChange} http={http} />
        );
      case TemplateType.HybridSearchOptimizer:
        return (
          <>
            <LLMForm formData={formData as LLMFormData} onChange={handleChange} />

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

  return <>{renderForm()}</>;
};
