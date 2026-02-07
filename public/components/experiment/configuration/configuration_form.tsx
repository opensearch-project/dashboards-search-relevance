/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { EuiSpacer, EuiCallOut } from '@elastic/eui';
import {
  ResultListComparisonForm,
  ResultListComparisonFormRef,
} from './form/result_list_comparison_form';
import {
  PointwiseExperimentForm,
  PointwiseExperimentFormRef,
} from './form/pointwise_experiment_form';
import {
  HybridOptimizerExperimentForm,
  HybridOptimizerExperimentFormRef,
} from './form/hybrid_optimizer_experiment_form';
import {
  ConfigurationFormProps,
  ConfigurationFormData,
  ResultListComparisonFormData,
  PointwiseExperimentFormData,
  HybridOptimizerExperimentFormData,
  TemplateType,
} from './types';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { ExperimentType } from '../../../types/index';
import { GetStartedAccordion } from '../get_started_accordion';

export interface ConfigurationFormRef {
  validateAndGetData: () => { data: ConfigurationFormData | null; isValid: boolean }; // Updated return type
  clearFormErrors: () => void;
}

interface ConfigurationFormProps {
  templateType: TemplateType;
}

export const ConfigurationForm = forwardRef<ConfigurationFormRef, ConfigurationFormProps>(
  ({ templateType }, ref) => {
    const {
      services: { http },
    } = useOpenSearchDashboards();

    // `formData` in ConfigurationForm should primarily reflect the *initial* state
    // and then be updated by `handleChange` which gets called by children.
    // However, the true source of "current" validated data will now be the child's ref.
    const [formData, setFormData] = useState<ConfigurationFormData>(
      getInitialFormData(templateType)
    );
    const [showFormError, setShowFormError] = useState<boolean>(false);

    const activeFormRef = useRef<
      | PointwiseExperimentFormRef
      | ResultListComparisonFormRef
      | HybridOptimizerExperimentFormRef
      | null
    >(null);

    useImperativeHandle(ref, () => ({
      validateAndGetData: () => {
        let isValid = false;
        let validatedData: ConfigurationFormData | null = null;

        if (activeFormRef.current) {
          const result = activeFormRef.current.validateAndSetErrors(); // Call child's validation
          isValid = result.isValid;
          validatedData = result.data as ConfigurationFormData; // Cast to general type
        }

        setShowFormError(!isValid);
        return { data: validatedData, isValid };
      },
      clearFormErrors: () => {
        setShowFormError(false);
        if (activeFormRef.current) {
          activeFormRef.current.clearAllErrors();
        }
      },
    }));

    useEffect(() => {
      // When templateType changes, reset form data and clear any displayed errors
      setFormData(getInitialFormData(templateType));
      setShowFormError(false);
      // The individual forms will clear their errors when their formData prop changes
      // or when `clearFormErrors` is called via the main ref.
    }, [templateType]);

    const handleChange = (field: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      setShowFormError(false);
    };

    const renderForm = () => {
      // When templateType changes, the previous child component unmounts and this ref
      // will naturally become null until the new component mounts and assigns itself.
      // Explicitly setting to null here is okay, but React's ref handling generally
      // takes care of it for conditionally rendered components.
      activeFormRef.current = null;

      switch (templateType) {
        case TemplateType.QuerySetComparison:
          return (
            <>
              <GetStartedAccordion isOpen={true} templateType={templateType} />
              <EuiSpacer size="l" />
              <ResultListComparisonForm
                formData={formData as ResultListComparisonFormData}
                onChange={handleChange}
                http={http}
                ref={activeFormRef as React.Ref<ResultListComparisonFormRef>}
              />
            </>
          );
        case TemplateType.SearchEvaluation:
          return (
            <>
              <GetStartedAccordion isOpen={true} templateType={templateType} />
              <EuiSpacer size="l" />
              <PointwiseExperimentForm
                formData={formData as PointwiseExperimentFormData}
                onChange={handleChange}
                http={http}
                ref={activeFormRef as React.Ref<PointwiseExperimentFormRef>}
              />
            </>
          );
        case TemplateType.HybridSearchOptimizer:
          return (
            <>
              <GetStartedAccordion isOpen={true} templateType={templateType} />
              <EuiSpacer size="l" />
              <HybridOptimizerExperimentForm
                formData={formData as HybridOptimizerExperimentFormData}
                onChange={handleChange}
                http={http}
                ref={activeFormRef as React.Ref<HybridOptimizerExperimentFormRef>}
              />
            </>
          );
        default:
          console.warn(`No form component defined for templateType: ${templateType}`);
          return null;
      }
    };

    return (
      <>
        {showFormError && (
          <EuiCallOut
            title="Please address the highlighted errors."
            color="danger"
            iconType="cross"
            size="s"
          />
        )}
        <EuiSpacer size="s" />
        {renderForm()}
      </>
    );
  }
);

const getInitialFormData = (templateType: TemplateType): ConfigurationFormData => {
  const baseCommonData = {
    querySetId: '',
    size: 10,
    searchConfigurationList: [],
  };

  switch (templateType) {
    case TemplateType.QuerySetComparison:
      return {
        ...baseCommonData,
        type: ExperimentType.PAIRWISE_COMPARISON,
      } as ResultListComparisonFormData;
    case TemplateType.SearchEvaluation:
      return {
        ...baseCommonData,
        judgmentList: [],
        type: ExperimentType.POINTWISE_EVALUATION,
      } as PointwiseExperimentFormData;
    case TemplateType.HybridSearchOptimizer:
      return {
        ...baseCommonData,
        judgmentList: [],
        type: ExperimentType.HYBRID_OPTIMIZER,
      } as HybridOptimizerExperimentFormData;
    default:
      console.warn(
        `Attempted to get initial form data for unhandled TemplateType: ${templateType}. Returning a minimal base configuration.`
      );
      return {
        ...baseCommonData,
        type: 'UNKNOWN_TYPE' as any,
      } as ConfigurationFormData;
  }
};

/**
 * Utils to ensure valid labels for input form components like search configurations or query sets
 */
export interface OptionLabel {
  label: string;
  value: string;
}

/**
 * Transforms an array of objects (e.g., from API response) into an array of OptionLabel objects
 * suitable for EUI combo boxes. It handles cases where either 'name' or 'id' can serve as label/value.
 *
 * @param dataList The input array of objects.
 * @returns An array of OptionLabel objects.
 */
export const mapToOptionLabels = (dataList: any[]): OptionLabel[] => {
  if (!Array.isArray(dataList)) {
    return [];
  }

  return dataList
    .map((item: any) => {
      const label =
        typeof item.name === 'string' && item.name !== ''
          ? item.name
          : typeof item.id === 'string' && item.id !== ''
          ? item.id
          : '';
      const value = typeof item.id === 'string' && item.id !== '' ? item.id : '';

      return { label, value };
    })
    .filter((option) => option.label !== ''); // Ensure only valid options are returned
};

/**
 * Transforms an array of OptionLabel objects back into a format expected by the backend
 * (e.g., an array of objects with 'id' and 'name' properties).
 *
 * @param optionLabels The input array of OptionLabel objects.
 * @returns An array of objects with 'id' and 'name' properties.
 */
export const mapOptionLabelsToFormData = (
  optionLabels: OptionLabel[]
): Array<{ id: string; name: string }> => {
  if (!Array.isArray(optionLabels)) {
    return [];
  }
  return optionLabels.map((o) => ({ id: o.value, name: o.label }));
};

/**
 * Transforms a single query set ID and name into an array of OptionLabel objects.
 *
 * @param querySetId The ID of the query set.
 * @param querySetName The name of the query set.
 * @returns An array containing a single OptionLabel object, or an empty array if invalid.
 */
export const mapQuerySetToOptionLabels = (
  querySetId: string | undefined,
  querySetName: string | undefined
): OptionLabel[] => {
  if (
    typeof querySetId === 'string' &&
    querySetId !== '' &&
    typeof querySetName === 'string' &&
    querySetName !== ''
  ) {
    return [{ label: querySetName, value: querySetId }];
  }
  return [];
};
