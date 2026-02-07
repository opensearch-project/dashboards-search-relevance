/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'PROCESSING':
      return 'warning';
    case 'ERROR':
      return 'danger';
    default:
      return 'subdued';
  }
};