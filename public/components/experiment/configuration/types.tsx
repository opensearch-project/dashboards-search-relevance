export interface TemplateConfigurationProps {
  templateType: string;
  onBack: () => void;
  onClose: () => void;
}

export interface ConfigurationFormProps {
  templateType: string
  onSave: (formData: ConfigurationFormData) => void;
}

export interface BaseFormData {
  querySets: QuerySetOption[];
}

export interface SearchConfigFromData {
  searchConfigs: SearchConfigOption[];
}

export interface CustomizeFormData extends BaseFormData {
  calculator: string;
  scoreThreshold: string;
}

export interface UserBehaviorFormData extends BaseFormData {
  startDate: string;
  endDate: string;
  collectSignal: string;
  scoreThreshold: string;
}

export interface LLMFormData extends BaseFormData {
  modelId: string;
  scoreThreshold: string;
}

export type ConfigurationFormData =
  | CustomizeFormData
  | UserBehaviorFormData
  | LLMFormData;

export interface ConfigurationHeaderProps {
  templateType: string;
}

export interface ConfigurationActionsProps {
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
}

export interface QuerySetOption {
  label: string;
  value: string;
}

export interface SearchConfigOption {
  label: string;
  value: string;
}
