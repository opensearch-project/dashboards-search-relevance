import { RouteComponentProps } from 'react-router-dom';

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

export interface IndexOption {
  label: string;
  value: string;
}

export interface ResultListComparisonFormData extends BaseFormData {}

export interface UserBehaviorFormData extends BaseFormData {
  judgmentList: string[];
}

export interface LLMFormData extends BaseFormData {
  modelId: string;
  scoreThreshold: string;
}

export type ConfigurationFormData =
  | ResultListComparisonFormData
  | UserBehaviorFormData
  | LLMFormData;

export interface ConfigurationActionsProps {
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
}
