/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { RequestParams } from '@opensearch-project/opensearch';

import { IRouter } from '../../../../src/core/server';
import { ServiceEndpoints } from '../../common';

export function registerDslRoute({ router }: { router: IRouter }) {
  router.post(
    {
      path: ServiceEndpoints.GetSearchResults,
      validate: { body: schema.any() },
    },
    async (context, request, response) => {
      const { index, size, ...rest } = request.body;
      const params: RequestParams.Search = {
        index,
        size,
        body: rest,
      };
      try {
        const resp = await context.core.opensearch.legacy.client.callAsCurrentUser(
          'search',
          params
        );
        return response.ok({
          body: resp,
        });
      } catch (error) {
        if (error.statusCode !== 404) console.error(error);

        // Template: Error: {{Error.type}} – {{Error.reason}}
        const errorMessage = `Error: ${error.body?.error?.type} - ${error.body?.error?.reason}`;

        return response.custom({
          statusCode: error.statusCode || 500,
          body: errorMessage,
        });
      }
    }
  );

  router.get(
    {
      path: ServiceEndpoints.GetIndexes,
      validate: {},
    },
    async (context, request, response) => {
      const params = {
        format: 'json',
      };
      try {
        const resp = await context.core.opensearch.legacy.client.callAsCurrentUser(
          'cat.indices',
          params
        );
        return response.ok({
          body: resp,
        });
      } catch (error) {
        if (error.statusCode !== 404) console.error(error);
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );
}
