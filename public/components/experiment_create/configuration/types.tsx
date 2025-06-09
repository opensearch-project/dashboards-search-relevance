/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteComponentProps } from 'react-router-dom';
import { RouteTemplateType } from '../../../../common';

export enum TemplateType {
  SingleQueryComparison = 'Single Query Comparison',
  QuerySetComparison = 'Query Set Comparison',
  SearchEvaluation = 'Search Evaluation',
  HybridSearchOptimizer = 'Hybrid Search Optimizer',
}

export const routeToTemplateType = (templateId: string) => {
  switch (templateId) {
    case RouteTemplateType.SingleQueryComparison:
      return TemplateType.SingleQueryComparison;
    case RouteTemplateType.QuerySetComparison:
      return TemplateType.QuerySetComparison;
    case RouteTemplateType.SearchEvaluation:
      return TemplateType.SearchEvaluation;
    case RouteTemplateType.HybridOptimizer:
      return TemplateType.HybridSearchOptimizer;
  }
};

export interface TemplateConfigurationProps extends RouteComponentProps {
  templateType: string;
  onBack: () => void;
  onClose: () => void;
}

export interface ConfigurationFormProps {
  templateType: string;
  onSave: (formData: ConfigurationFormData) => void;
}

export interface BaseFormData {
  type: string;
  querySetId: string;
  size: number;
  searchConfigurationList: string[];
}

export interface OptionLabel {
  label: string;
  value: string;
}

export type ResultListComparisonFormData = BaseFormData;

export interface PointwiseExperimentFormData extends BaseFormData {
  judgmentList: string[];
}

export interface HybridOptimizerExperimentFormData extends BaseFormData {
  judgmentList: string[];
}

export interface LLMFormData extends BaseFormData {
  modelId: string;
  scoreThreshold: string;
}

export type ConfigurationFormData =
  | ResultListComparisonFormData
  | PointwiseExperimentFormData
  | HybridOptimizerExperimentFormData
  | LLMFormData;

export interface ConfigurationActionsProps {
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
}
