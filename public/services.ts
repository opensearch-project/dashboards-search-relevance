/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BASE_QUERYSET_NODE_API_PATH } from '../common';

export const postQuerySet = async (name: string, description: string, http: any) => {
  try {
    return await http.post(`..${BASE_QUERYSET_NODE_API_PATH}`, {
      body: JSON.stringify({
        name,
        description,
      }),
    });
  } catch (e) {
    return e;
  }
};

export const getQuerySets = async (http: any) => {
  try {
    const response = await http.get(`..${BASE_QUERYSET_NODE_API_PATH}`);
    // Add logging to debug
    // eslint-disable-next-line no-console
    console.log('GET Response:', response);
    return response;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('GET Error:', e);
    return e;
  }
};
