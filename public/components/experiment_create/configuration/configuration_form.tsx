import React, { useState, useEffect } from 'react';
import { EuiSpacer } from '@elastic/eui';
import { ResultListComparisonForm } from './form/result_list_comparison_form';
import { PointwiseExperimentForm } from './form/pointwise_experiment_form';
import { HybridOptimizerExperimentForm } from './form/hybrid_optimizer_experiment_form';
import {
  ConfigurationFormProps,
  ConfigurationFormData,
  ResultListComparisonFormData,
  PointwiseExperimentFormData,
  HybridOptimizerExperimentFormData,
  LLMFormData,
  TemplateType,
} from './types';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { GetStartedAccordion } from '../../resource_management_home/get_started_accordion';

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
        type: "POINTWISE_EVALUATION",
      };
    default:
      return (baseData as unknown) as
        | ResultListComparisonFormData
        | PointwiseExperimentFormData
        | HybridOptimizerExperimentFormData
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
          <>
            <GetStartedAccordion isOpen={true} />
            <EuiSpacer size="l" />
            <ResultListComparisonForm
              formData={formData as ResultListComparisonFormData}
              onChange={handleChange}
              http={http}
            />
          </>
        );
      case TemplateType.SearchEvaluation:
        return (
          <>
            <GetStartedAccordion isOpen={true} />
            <EuiSpacer size="l" />
            <PointwiseExperimentForm formData={formData as PointwiseExperimentFormData} onChange={handleChange} http={http} />
          </>
        );
      case TemplateType.HybridSearchOptimizer:
        return (
          <>
            <GetStartedAccordion isOpen={true} />
            <EuiSpacer size="l" />
            <HybridOptimizerExperimentForm formData={formData as HybridOptimizerExperimentFormData} onChange={handleChange} http={http} />
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
