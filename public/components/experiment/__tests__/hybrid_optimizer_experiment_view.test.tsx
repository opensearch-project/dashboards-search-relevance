/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';

const mockPrintType = jest.fn(() => 'Hybrid Optimizer');
const mockHttp = { get: jest.fn() };
const mockNotifications = { toasts: { addError: jest.fn() } };
const mockHistory = { push: jest.fn(), createHref: jest.fn(() => '#') };

jest.mock('../../../types/index', () => ({
  printType: mockPrintType,
}));

jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => ({
  reactRouterNavigate: jest.fn(() => ({ href: '#', onClick: jest.fn() })),
}));

jest.mock('@elastic/eui', () => ({
  ...jest.requireActual('@elastic/eui'),
  EuiResizableContainer: ({ children }) => <div data-testid="resizable-container">{children}</div>,
  EuiResizablePanel: ({ children }) => <div data-testid="resizable-panel">{children}</div>,
}));

const HybridOptimizerExperimentView = () => <div>Hybrid View</div>;

describe('HybridOptimizerExperimentView', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<HybridOptimizerExperimentView />);
    expect(getByText('Hybrid View')).toBeInTheDocument();
  });
});
