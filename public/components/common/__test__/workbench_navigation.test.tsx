/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { Routes } from '../../../../common';
import { WorkbenchNavigation } from '../workbench_navigation';

const renderNavigation = (route: string) => {
  const history = createMemoryHistory({ initialEntries: [route] });
  render(
    <Router history={history}>
      <WorkbenchNavigation />
    </Router>
  );
  return history;
};

describe('WorkbenchNavigation', () => {
  it.each([
    [Routes.Home, 'Experiments'],
    [Routes.ExperimentCreateQueryAnalysis, 'Experiments'],
    [Routes.ExperimentCreateQuerySetComparison, 'Experiments'],
    [Routes.ExperimentCreateSearchEvaluation, 'Experiments'],
    [Routes.ExperimentCreateHybridOptimizer, 'Experiments'],
    [`${Routes.ExperimentViewPrefix}/experiment-1`, 'Experiments'],
    [Routes.QuerySetListing, 'Query Sets'],
    [Routes.QuerySetCreate, 'Query Sets'],
    [`${Routes.QuerySetViewPrefix}/query-1`, 'Query Sets'],
    [Routes.SearchConfigurationListing, 'Search Configurations'],
    [Routes.SearchConfigurationCreate, 'Search Configurations'],
    [`${Routes.SearchConfigurationViewPrefix}/config-1`, 'Search Configurations'],
    [Routes.JudgmentListing, 'Judgments'],
    [Routes.JudgmentCreate, 'Judgments'],
    [`${Routes.JudgmentViewPrefix}/judgment-1`, 'Judgments'],
  ])('selects the parent section for %s', (route, name) => {
    renderNavigation(route);
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getByRole('tab', { name, selected: true })).toBeInTheDocument();
    expect(screen.getAllByRole('tab', { selected: true })).toHaveLength(1);
  });

  it.each([
    ['Experiments', Routes.Home],
    ['Query Sets', Routes.QuerySetListing],
    ['Search Configurations', Routes.SearchConfigurationListing],
    ['Judgments', Routes.JudgmentListing],
  ])('navigates to %s without losing the data source', (name, route) => {
    const history = renderNavigation(
      `${Routes.ExperimentViewPrefix}/experiment-1?dataSourceId=remote-1`
    );
    const tab = screen.getByRole('tab', { name });
    expect(tab).toHaveAttribute('href', `${route}?dataSourceId=remote-1`);
    fireEvent.click(tab);
    expect(history.location.pathname).toBe(route);
    expect(history.location.search).toBe('?dataSourceId=remote-1');
    expect(screen.getByRole('tab', { name, selected: true })).toBeInTheDocument();
  });

  it('does not carry experiment-specific URL parameters to another section', () => {
    const history = renderNavigation(`${Routes.Home}?config=experiment-config`);
    fireEvent.click(screen.getByRole('tab', { name: 'Judgments' }));
    expect(history.location.pathname).toBe(Routes.JudgmentListing);
    expect(history.location.search).toBe('');
  });
});
