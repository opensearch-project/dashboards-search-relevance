/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  ConfigurationForm,
  mapToOptionLabels,
  mapQuerySetToOptionLabels,
} from '../configuration/configuration_form';
import { TemplateType } from '../configuration/types';

jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => ({
  useOpenSearchDashboards: () => ({
    services: { http: {} },
  }),
}));

jest.mock('../configuration/form/result_list_comparison_form', () => {
  const React = require('react');
  return {
    ResultListComparisonForm: React.forwardRef(() =>
      React.createElement('div', {}, 'Query Set Comparison Form')
    ),
  };
});

jest.mock('../configuration/form/pointwise_experiment_form', () => {
  const React = require('react');
  return {
    PointwiseExperimentForm: React.forwardRef(() =>
      React.createElement('div', {}, 'Search Evaluation Form')
    ),
  };
});

jest.mock('../configuration/form/hybrid_optimizer_experiment_form', () => {
  const React = require('react');
  return {
    HybridOptimizerExperimentForm: React.forwardRef(() =>
      React.createElement('div', {}, 'Hybrid Optimizer Form')
    ),
  };
});

describe('ConfigurationForm', () => {
  it('renders QuerySetComparison form', () => {
    render(<ConfigurationForm templateType={TemplateType.QuerySetComparison} />);
    expect(screen.getByText('Query Set Comparison Form')).toBeInTheDocument();
    expect(screen.getByText('Get started')).toBeInTheDocument();
  });

  it('renders SearchEvaluation form', () => {
    render(<ConfigurationForm templateType={TemplateType.SearchEvaluation} />);
    expect(screen.getByText('Search Evaluation Form')).toBeInTheDocument();
    expect(screen.getByText('Get started')).toBeInTheDocument();
  });

  it('renders HybridSearchOptimizer form', () => {
    render(<ConfigurationForm templateType={TemplateType.HybridSearchOptimizer} />);
    expect(screen.getByText('Hybrid Optimizer Form')).toBeInTheDocument();
    expect(screen.getByText('Get started')).toBeInTheDocument();
  });
});

describe('mapToOptionLabels', () => {
  it('maps array with name and id to option labels', () => {
    const input = [
      { id: '1', name: 'Test 1' },
      { id: '2', name: 'Test 2' },
    ];
    const result = mapToOptionLabels(input);
    expect(result).toEqual([
      { label: 'Test 1', value: '1' },
      { label: 'Test 2', value: '2' },
    ]);
  });

  it('handles empty array', () => {
    expect(mapToOptionLabels([])).toEqual([]);
  });

  it('filters out invalid items', () => {
    const input = [
      { id: '1', name: 'Test 1' },
      { id: '', name: '' },
      { id: '2', name: 'Test 2' },
    ];
    const result = mapToOptionLabels(input);
    expect(result).toEqual([
      { label: 'Test 1', value: '1' },
      { label: 'Test 2', value: '2' },
    ]);
  });
});

describe('mapQuerySetToOptionLabels', () => {
  it('maps valid query set to option label', () => {
    const result = mapQuerySetToOptionLabels('id1', 'Query Set 1');
    expect(result).toEqual([{ label: 'Query Set 1', value: 'id1' }]);
  });

  it('returns empty array for invalid inputs', () => {
    expect(mapQuerySetToOptionLabels('', '')).toEqual([]);
    expect(mapQuerySetToOptionLabels(undefined, undefined)).toEqual([]);
  });
});
