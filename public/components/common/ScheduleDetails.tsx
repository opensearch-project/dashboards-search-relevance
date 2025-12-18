/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiDescriptionListTitle, EuiDescriptionListDescription, EuiSpacer } from '@elastic/eui';
import { ScheduledJob } from '../../types/index';

export interface ScheduleDetailsProps {
  isScheduled: unknown; // can be boolean or string in current API
  scheduledExperimentJob?: ScheduledJob | null;
}

export const ScheduleDetails: React.FC<ScheduleDetailsProps> = ({
  isScheduled,
  scheduledExperimentJob,
}) => {
  const scheduled = Boolean(isScheduled);
  const cron = scheduledExperimentJob?.schedule?.cron;

  const formatTimestamp = (timestamp?: number): string => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '—';
    try {
      return date.toLocaleString(undefined, {
        timeZone: cron?.timezone,
      } as Intl.DateTimeFormatOptions);
    } catch (e) {
      return date.toString();
    }
  };

  const startedAtDisplay = formatTimestamp(scheduledExperimentJob?.enabledTime);
  const lastRunDisplay = formatTimestamp(scheduledExperimentJob?.lastUpdateTime);

  return (
    <>
      <EuiDescriptionListTitle>Schedule to Run</EuiDescriptionListTitle>
      <EuiDescriptionListDescription>
        {!scheduled ? (
          'Not Scheduled'
        ) : (
          <>
            <div>{cron?.expression || '—'}  {cron?.timezone}</div>
            <EuiSpacer size="s" />
            <div>Started at: {startedAtDisplay}</div>
            <div>Last run at: {lastRunDisplay}</div>
          </>
        )}
      </EuiDescriptionListDescription>
    </>
  );
};

export default ScheduleDetails;
