/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiAccordion, EuiPanel, EuiTitle, EuiSpacer, EuiFlexGroup, EuiFlexItem, EuiDescriptionList, EuiText } from '@elastic/eui';
import cronstrue from 'cronstrue';
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
  const isCronEmpty = !cron || !cron.expression || cron.expression.trim() === '';

  const formatTimestamp = (timestamp?: number | string): string => {
    if (!timestamp) return '—';
    const date = new Date(Number(timestamp));
    if (isNaN(date.getTime())) return '—';
    try {
      // Intentionally omitting timeZone override to display in the user's local browser timezone.
      return date.toLocaleString();
    } catch (e) {
      return date.toString();
    }
  };

  const startedAtDisplay = formatTimestamp(scheduledExperimentJob?.enabledTime);
  const lastRunDisplay = formatTimestamp(scheduledExperimentJob?.lastUpdateTime);

  let cronDescription = '—';
  if (!isCronEmpty) {
    try {
      cronDescription = cronstrue.toString(cron!.expression);
    } catch (err) {
      cronDescription = cron!.expression;
    }
  }

  const scheduleInfoList = [
    { title: 'Cron setup', description: `${cron?.expression || '—'} ${cron?.timezone ? `(${cron.timezone})` : ''}` },
    { title: 'Frequency', description: cronDescription },
  ];

  const executionInfoList = [
    { title: 'Started at', description: startedAtDisplay },
    { title: 'Last run', description: lastRunDisplay },
  ];

  return (
    <EuiPanel paddingSize="l">
      <EuiAccordion
        id="scheduleDetailsAccordion"
        buttonContent={
          <EuiTitle size="s">
            <h3>Schedule</h3>
          </EuiTitle>
        }
        paddingSize="none"
        initialIsOpen={true}
      >
        <EuiSpacer size="m" />
        {(!scheduled || isCronEmpty) ? (
          <EuiText size="s" color="subdued">
            <p>No schedule (Manual run only)</p>
          </EuiText>
        ) : (
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiDescriptionList type="column" listItems={scheduleInfoList} compressed />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiDescriptionList type="column" listItems={executionInfoList} compressed />
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </EuiAccordion>
    </EuiPanel>
  );
};

export default ScheduleDetails;
