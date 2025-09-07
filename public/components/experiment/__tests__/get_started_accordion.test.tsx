/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { GetStartedAccordion } from '../get_started_accordion';
import { TemplateType } from '../configuration/types';

describe('GetStartedAccordion', () => {
  it('renders QuerySetComparison content by default', () => {
    render(<GetStartedAccordion />);

    expect(screen.getByText('1. Select your Query Set')).toBeInTheDocument();
    expect(screen.getByText('2. Gather your Search Configuration')).toBeInTheDocument();
    expect(screen.getByText('3. Evaluate your Experiment')).toBeInTheDocument();
  });

  it('renders SearchEvaluation content', () => {
    render(<GetStartedAccordion templateType={TemplateType.SearchEvaluation} />);

    expect(screen.getByText('1. Select your Query Set')).toBeInTheDocument();
    expect(screen.getByText('2. Select your Search Configuration')).toBeInTheDocument();
    expect(screen.getByText('3. Select your Judgment List')).toBeInTheDocument();
    expect(screen.getByText('4. Run Evaluation')).toBeInTheDocument();
  });

  it('renders HybridSearchOptimizer content', () => {
    render(<GetStartedAccordion templateType={TemplateType.HybridSearchOptimizer} />);

    expect(screen.getByText('1. Select your Query Set')).toBeInTheDocument();
    expect(screen.getByText('2. Configure Hybrid Search')).toBeInTheDocument();
    expect(screen.getByText('3. Select your Judgment List')).toBeInTheDocument();
    expect(screen.getByText('4. Run Optimizer')).toBeInTheDocument();
    expect(screen.getByText('5. Assess Results')).toBeInTheDocument();
  });

  it('renders SingleQueryComparison content', () => {
    render(<GetStartedAccordion templateType={TemplateType.SingleQueryComparison} />);

    expect(screen.getByText('1. Define Your Query')).toBeInTheDocument();
    expect(screen.getByText('2. Configure Search Parameters')).toBeInTheDocument();
    expect(screen.getByText('3. Define Comparison Metrics')).toBeInTheDocument();
    expect(screen.getByText('4. Compare Results')).toBeInTheDocument();
  });

  it('renders accordion button with Get started text', () => {
    render(<GetStartedAccordion />);

    expect(screen.getByText('Get started')).toBeInTheDocument();
  });
});
