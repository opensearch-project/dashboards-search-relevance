/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BASE_QUERYSET_NODE_API_PATH } from '../common';

export const postQuerySet = async (id: string, http: any) => {
  try {
    return await http.post(`..${BASE_QUERYSET_NODE_API_PATH}`, {
      body: JSON.stringify({
        querySetId: id,
      }),
    });
  } catch (e) {
    return e;
  }
};
