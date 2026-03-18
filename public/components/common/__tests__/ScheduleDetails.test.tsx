/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScheduleDetails } from '../ScheduleDetails';

describe('ScheduleDetails', () => {
  it('renders "No schedule (Manual run only)" when isScheduled is false', () => {
    render(<ScheduleDetails isScheduled={false} scheduledExperimentJob={null} />);
    
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('No schedule (Manual run only)')).toBeInTheDocument();
  });

  it('renders "No schedule (Manual run only)" when isScheduled is true but cron is empty', () => {
    const job = {
      schedule: {
        cron: {
          expression: '',
          timezone: 'UTC',
        },
      },
    };
    render(<ScheduleDetails isScheduled={true} scheduledExperimentJob={job} />);
    
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('No schedule (Manual run only)')).toBeInTheDocument();
  });

  it('renders cron expression and execution details when scheduled with a valid cron', () => {
    const job = {
      schedule: {
        cron: {
          expression: '0 12 * * *',
          timezone: 'UTC',
        },
      },
      enabledTime: 1710782136000,
      lastUpdateTime: 1710782536000,
    };
    
    render(<ScheduleDetails isScheduled={true} scheduledExperimentJob={job} />);
    
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('0 12 * * * (UTC)')).toBeInTheDocument();
    expect(screen.getByText('At 12:00 PM')).toBeInTheDocument(); // cronstrue output for 0 12 * * *
    
    expect(screen.getByText('Started at')).toBeInTheDocument();
    expect(screen.getByText('Last run')).toBeInTheDocument();
  });

  it('renders proper execution fallbacks if enabledTime and lastUpdateTime are omitted', () => {
    const job = {
      schedule: {
        cron: {
          expression: '0 12 * * *',
        },
      },
    };
    
    render(<ScheduleDetails isScheduled={true} scheduledExperimentJob={job} />);
    
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText(/0 12 \* \* \*/)).toBeInTheDocument();
    expect(screen.getByText('Started at')).toBeInTheDocument();
    expect(screen.getByText('Last run')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });
});
