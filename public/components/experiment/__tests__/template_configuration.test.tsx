/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateConfiguration } from '../configuration/template_configuration';

const mockHttp = { post: jest.fn() };
const mockNotifications = {
  toasts: {
    addSuccess: jest.fn(),
    addError: jest.fn(),
  },
};
const mockHistory = { push: jest.fn() };

jest.mock('../services/experiment_service', () => ({
  ExperimentService: jest.fn().mockImplementation(() => ({
    createExperiment: mockHttp.post,
  })),
}));

jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => ({
  useOpenSearchDashboards: () => ({
    services: {
      http: mockHttp,
      notifications: mockNotifications,
    },
  }),
}));

jest.mock('../configuration/configuration_form', () => {
  const React = require('react');
  return {
    ConfigurationForm: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({
        validateAndGetData: jest.fn().mockReturnValue({
          data: { test: 'data' },
          isValid: true,
        }),
        clearFormErrors: jest.fn(),
      }));
      return React.createElement('div', {}, 'Configuration Form');
    }),
  };
});

jest.mock('../configuration/configuration_action', () => ({
  ConfigurationActions: ({ onNext, onBack, onClose }) => (
    <div>
      <button onClick={onNext}>Next</button>
      <button onClick={onBack}>Back</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const defaultProps = {
  templateType: 'Test Template',
  onBack: jest.fn(),
  onClose: jest.fn(),
  history: mockHistory,
};

describe('TemplateConfiguration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders configuration form', () => {
    render(<TemplateConfiguration {...defaultProps} />);

    expect(screen.getByText('Test Template Experiment')).toBeInTheDocument();
    expect(screen.getByText('Configuration Form')).toBeInTheDocument();
  });

  it('calls onBack when back button clicked', () => {
    render(<TemplateConfiguration {...defaultProps} />);

    fireEvent.click(screen.getByText('Back'));

    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('calls onClose when close button clicked', () => {
    render(<TemplateConfiguration {...defaultProps} />);

    fireEvent.click(screen.getByText('Close'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('renders next button', () => {
    render(<TemplateConfiguration {...defaultProps} />);

    expect(screen.getByText('Next')).toBeInTheDocument();
  });
});
