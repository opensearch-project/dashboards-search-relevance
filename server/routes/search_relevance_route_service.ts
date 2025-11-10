/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import {
  IOpenSearchDashboardsResponse,
  IRouter,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  RequestHandlerContext,
} from '../../../../src/core/server';
import { ServiceEndpoints, BackendEndpoints, DISABLED_BACKEND_PLUGIN_MESSAGE } from '../../common';

// Helper function to clean up temporary resources
async function cleanupTempResources(caller: any, judgmentId: string, querySetId: string): Promise<void> {
  console.log(`Cleaning up temporary resources: judgment ${judgmentId}, querySet ${querySetId}`);

  try {
    // Delete judgment first
    await caller('transport.request', {
      method: 'DELETE',
      path: `${BackendEndpoints.Judgments}/${judgmentId}`,
    });
    console.log(`Successfully deleted temporary judgment ${judgmentId}`);
  } catch (err) {
    console.error(`Failed to delete temporary judgment ${judgmentId}:`, err.message);
  }

  try {
    // Then delete query set
    await caller('transport.request', {
      method: 'DELETE',
      path: `${BackendEndpoints.QuerySets}/${querySetId}`,
    });
    console.log(`Successfully deleted temporary querySet ${querySetId}`);
  } catch (err) {
    console.error(`Failed to delete temporary querySet ${querySetId}:`, err.message);
  }
}

export function registerSearchRelevanceRoutes(router: IRouter): void {
  router.post(
    {
      path: ServiceEndpoints.QuerySets,
      validate: {
        body: schema.object({
          name: schema.string(),
          description: schema.string(),
          sampling: schema.string(),
          querySetSize: schema.number(),
          ubiQueriesIndex: schema.maybe(schema.string()),
        }),
      },
    },
    backendAction('POST', BackendEndpoints.QuerySets)
  );
  router.put(
    {
      path: ServiceEndpoints.QuerySets,
      validate: {
        body: schema.object({
          name: schema.string(),
          description: schema.string(),
          sampling: schema.string(),
          querySetQueries: schema.oneOf([
            schema.arrayOf(
              schema.object({
                queryText: schema.string(),
                referenceAnswer: schema.maybe(schema.string()),
              }),
              { minSize: 1 }
            ),
            schema.string(),
          ]),
        }),
      },
    },
    backendAction('PUT', BackendEndpoints.QuerySets)
  );
  router.get(
    {
      path: ServiceEndpoints.QuerySets,
      validate: false,
    },
    backendAction('GET', BackendEndpoints.QuerySets)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.QuerySets}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('DELETE', BackendEndpoints.QuerySets)
  );
  router.put(
    {
      path: ServiceEndpoints.SearchConfigurations,
      validate: {
        body: schema.object({
          name: schema.string(),
          index: schema.string(),
          query: schema.string(),
          searchPipeline: schema.maybe(schema.string()),
        }),
      },
    },
    backendAction('PUT', BackendEndpoints.SearchConfigurations)
  );
  router.get(
    {
      path: ServiceEndpoints.SearchConfigurations,
      validate: false,
    },
    backendAction('GET', BackendEndpoints.SearchConfigurations)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.SearchConfigurations}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('DELETE', BackendEndpoints.SearchConfigurations)
  );
  router.post(
    {
      path: ServiceEndpoints.Experiments,
      validate: {
        body: schema.object({
          querySetId: schema.string(),
          searchConfigurationList: schema.arrayOf(schema.string()),
          size: schema.number(),
          type: schema.string(),
          // TODO: make mandatory conditional on experiment type
          judgmentList: schema.maybe(schema.arrayOf(schema.string())),
        }),
      },
    },
    backendAction('PUT', BackendEndpoints.Experiments)
  );
  router.get(
    {
      path: ServiceEndpoints.Experiments,
      validate: false,
    },
    backendAction('GET', BackendEndpoints.Experiments)
  );
  router.get(
    {
      path: `${ServiceEndpoints.Experiments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('GET', BackendEndpoints.Experiments)
  );
  router.get(
    {
      path: `${ServiceEndpoints.SearchConfigurations}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('GET', BackendEndpoints.SearchConfigurations)
  );
  router.get(
    {
      path: `${ServiceEndpoints.QuerySets}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('GET', BackendEndpoints.QuerySets)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.Experiments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('DELETE', BackendEndpoints.Experiments)
  );
  router.post(
    {
      path: `${ServiceEndpoints.ScheduledExperiments}`,
      validate: {
        body: schema.object({
          experimentId: schema.string(),
          cronExpression: schema.string()
        }),
      }
    },
    backendAction('POST', `${BackendEndpoints.ScheduledExperiments}`)
  );
  router.get(
    {
      path: `${ServiceEndpoints.ScheduledExperiments}`,
      validate: false,
    },
    backendAction('GET', `${BackendEndpoints.ScheduledExperiments}`)
  );
  router.get(
    {
      path: `${ServiceEndpoints.ScheduledExperiments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('GET', BackendEndpoints.ScheduledExperiments)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.ScheduledExperiments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('DELETE', BackendEndpoints.ScheduledExperiments)
  );
  router.put(
    {
      path: ServiceEndpoints.Judgments,
      validate: {
        body: schema.object({
          name: schema.string(),
          type: schema.string(),
          querySetId: schema.maybe(schema.string()),
          searchConfigurationList: schema.maybe(schema.arrayOf(schema.string())),
          size: schema.maybe(schema.number()),
          modelId: schema.maybe(schema.string()),
          tokenLimit: schema.maybe(schema.string()),
          ignoreFailure: schema.maybe(schema.boolean()),
          contextFields: schema.maybe(schema.arrayOf(schema.string())),
          clickModel: schema.maybe(schema.string()),
          maxRank: schema.maybe(schema.number()),
          startDate: schema.maybe(schema.string()),
          endDate: schema.maybe(schema.string()),
          ubiEventsIndex: schema.maybe(schema.string()),
        }),
      },
    },
    backendAction('PUT', BackendEndpoints.Judgments)
  );
  router.get(
    {
      path: ServiceEndpoints.Judgments,
      validate: {
        query: schema.object({
          status: schema.maybe(schema.oneOf([
            schema.literal('COMPLETED'),
            schema.literal('PROCESSING'),
            schema.literal('FAILED'),
            schema.literal('ERROR'),
          ])),
        }),
      },
    },
    backendAction('GET', BackendEndpoints.Judgments, { passQueryParams: ['status'] })
  );
  router.get(
    {
      path: `${ServiceEndpoints.Judgments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('GET', BackendEndpoints.Judgments)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.Judgments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('DELETE', BackendEndpoints.Judgments)
  );

  router.post(
    {
      path: ServiceEndpoints.ValidatePrompt,
      validate: {
        body: schema.object({
          modelId: schema.string(),
          promptTemplate: schema.any(),
          placeholderValues: schema.recordOf(schema.string(), schema.string()),
          searchConfigurationList: schema.maybe(schema.arrayOf(schema.string())),
          contextFields: schema.maybe(schema.arrayOf(schema.string())),
          size: schema.maybe(schema.number()),
          tokenLimit: schema.maybe(schema.oneOf([schema.number(), schema.string()])),
          ignoreFailure: schema.maybe(schema.boolean()),
          llmJudgmentRatingType: schema.string(),
        }),
      },
    },
    async (context, req, res) => {
      const {
        modelId,
        promptTemplate,
        placeholderValues,
        searchConfigurationList = [],
        contextFields = [],
        size = 5,
        tokenLimit: rawTokenLimit = 4000,
        ignoreFailure = false,
        llmJudgmentRatingType,
      } = req.body;

      // Convert tokenLimit to number if it's a string
      const tokenLimit = typeof rawTokenLimit === 'string'
        ? parseInt(rawTokenLimit, 10)
        : rawTokenLimit;

      const dataSourceId = req.query.data_source;
      const caller = dataSourceId
        ? context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI
        : context.core.opensearch.legacy.client.callAsCurrentUser;

      let tempQuerySetId: string | undefined;
      let judgmentId: string | undefined;

      try {
        console.log('Validate prompt request:', {
          modelId,
          placeholderValues,
          searchConfigurationList,
          contextFields,
          size,
          tokenLimit,
          llmJudgmentRatingType,
        });

        // Validate required fields
        if (!searchConfigurationList || searchConfigurationList.length === 0) {
          return res.badRequest({
            body: {
              message: 'At least one search configuration is required for validation',
            },
          });
        }
        // Step 1: Create temporary querySet with placeholder values
        const tempQuerySetBody = {
          name: `Temp Validation QuerySet ${Date.now()}`,
          description: 'Temporary query set for prompt validation',
          querySetQueries: [placeholderValues],
        };

        try {
          const querySetResponse = await caller('transport.request', {
            method: 'PUT',
            path: BackendEndpoints.QuerySets,
            body: tempQuerySetBody,
          });
          tempQuerySetId = querySetResponse.query_set_id;
          console.log(`Created temporary querySet: ${tempQuerySetId}`);
        } catch (err) {
          console.error('Failed to create temporary querySet:', err);
          throw new Error(`Failed to create query set: ${err.body?.error?.reason || err.message}`);
        }

        // Step 2: Create temporary judgment with the prompt template
        const tempJudgmentBody = {
          name: `Temp Validation Judgment ${Date.now()}`,
          type: 'LLM_JUDGMENT',
          querySetId: tempQuerySetId,
          searchConfigurationList,
          modelId,
          size,
          tokenLimit,
          contextFields,
          ignoreFailure,
          llmJudgmentRatingType,
          promptTemplate,
          overwriteCache: true,
        };

        try {
          const judgmentResponse = await caller('transport.request', {
            method: 'PUT',
            path: BackendEndpoints.Judgments,
            body: tempJudgmentBody,
          });
          judgmentId = judgmentResponse.judgment_id;
          console.log(`Temporary judgment created with ID: ${judgmentId}`);
          console.log(`Polling judgment status. You can check manually: GET /_plugins/_search_relevance/judgments/${judgmentId}`);
        } catch (err) {
          console.error('Failed to create temporary judgment:', err);
          throw new Error(`Failed to create judgment: ${err.body?.error?.reason || err.message}`);
        }

        // Step 3: Poll for judgment completion (max 60 seconds)
        const maxAttempts = 60;
        const pollInterval = 2000; // 2 seconds
        let attempts = 0;
        let judgmentResult;

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));

          judgmentResult = await caller('transport.request', {
            method: 'GET',
            path: `${BackendEndpoints.Judgments}/${judgmentId}`,
          });

          // The GET endpoint returns a search result: { hits: { hits: [{ _source: {...} }] } }
          const source = judgmentResult?.hits?.hits?.[0]?._source;
          const status = source?.status;
          console.log(`Attempt ${attempts + 1}/${maxAttempts}: Judgment status = ${status}`);

          if (status === 'COMPLETED') {
            console.log('Judgment completed successfully!');
            judgmentResult = { _source: source }; // Normalize for later use
            break;
          } else if (status === 'FAILED') {
            console.error('Judgment failed:', source);
            const failureReason = source?.error || source?.metadata?.error || 'Unknown error';
            throw new Error(`Judgment execution failed: ${failureReason}`);
          }

          attempts++;
        }

        if (attempts >= maxAttempts) {
          console.error(`Judgment ${judgmentId} timed out after ${maxAttempts * pollInterval / 1000} seconds`);

          // Clean up even on timeout
          await cleanupTempResources(caller, judgmentId, tempQuerySetId);

          throw new Error(`Judgment validation timed out. Check status manually: GET /_plugins/_search_relevance/judgments/${judgmentId}`);
        }

        // Step 4: Extract results before cleanup
        const judgmentResults = {
          success: true,
          judgmentResult: judgmentResult._source,
          ratings: judgmentResult._source?.judgmentRatings || [],
        };

        // Step 5: Clean up temporary resources
        await cleanupTempResources(caller, judgmentId, tempQuerySetId);

        // Step 6: Return the judgment results
        return res.ok({
          body: judgmentResults,
        });
      } catch (err) {
        console.error('Failed to validate prompt with judgment API', err);
        console.error('Error details:', {
          message: err.message,
          statusCode: err.statusCode,
          body: err.body,
          stack: err.stack,
        });

        // Try to clean up resources even on error
        if (judgmentId || tempQuerySetId) {
          console.log('Cleaning up temporary resources after error');

          if (judgmentId) {
            try {
              await caller('transport.request', {
                method: 'DELETE',
                path: `${BackendEndpoints.Judgments}/${judgmentId}`,
              });
              console.log(`Cleaned up temporary judgment ${judgmentId} after error`);
            } catch (cleanupErr) {
              console.error(`Failed to cleanup judgment after error:`, cleanupErr.message);
            }
          }

          if (tempQuerySetId) {
            try {
              await caller('transport.request', {
                method: 'DELETE',
                path: `${BackendEndpoints.QuerySets}/${tempQuerySetId}`,
              });
              console.log(`Cleaned up temporary querySet ${tempQuerySetId} after error`);
            } catch (cleanupErr) {
              console.error(`Failed to cleanup querySet after error:`, cleanupErr.message);
            }
          }
        }

        return res.customError({
          statusCode: err.statusCode || 500,
          body: {
            message: err.message,
            attributes: {
              error: err.body?.error || err.message,
            },
          },
        });
      }
    }
  );
}

const backendAction = (method, path, options?: { passQueryParams?: string[] }) => {
  return async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const dataSourceId = req.query.data_source;
    const caller = dataSourceId
      ? context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI
      : context.core.opensearch.legacy.client.callAsCurrentUser;

    try {
      let response;
      if (method === 'DELETE') {
        const { id } = req.params;
        const deletePath = `${path}/${id}`;
        response = await caller('transport.request', {
          method,
          path: deletePath,
        });
      } else if (method === 'GET' && req.params.id) {
        // Handle GET request for individual experiment
        const getPath = `${path}/${req.params.id}`;
        response = await caller('transport.request', {
          method,
          path: getPath,
        });
      } else {
        // Handle PUT, POST, GET as before
        // Build backend path with optional query params
        let backendPath = path;
        if (options?.passQueryParams && options.passQueryParams.length > 0) {
          const queryParams: string[] = [];
          options.passQueryParams.forEach((param) => {
            const value = (req.query as any)?.[param];
            if (value) {
              queryParams.push(`${param}=${value}`);
            }
          });
          if (queryParams.length > 0) {
            backendPath = `${path}?${queryParams.join('&')}`;
          }
        }
        response = await caller('transport.request', {
          method,
          path: backendPath,
          ...(method === 'POST' || method === 'PUT' ? { body: req.body } : {}),
        });
      }

      return res.ok({ body: response });
    } catch (err) {

      console.error('Failed to call search-relevance APIs', err); // Keep for full server-side logging

      let clientMessage = err.message; // Default to the err.message from transport.request
      let clientAttributesError = err.body?.error || err.message; // Default attributes error

      // Check if the backend error body contains the specific message
      if (err.body && typeof err.body === 'string' && err.body.includes(DISABLED_BACKEND_PLUGIN_MESSAGE)) {
          clientMessage = DISABLED_BACKEND_PLUGIN_MESSAGE;
          clientAttributesError = DISABLED_BACKEND_PLUGIN_MESSAGE;
      }
      // If the backend error body is a JSON object with a message/reason
      else if (err.body && typeof err.body === 'object') {
          // Check for common backend error formats
          if (err.body.message && typeof err.body.message === 'string' && err.body.message.includes(DISABLED_BACKEND_PLUGIN_MESSAGE)) {
              clientMessage = DISABLED_BACKEND_PLUGIN_MESSAGE;
              clientAttributesError = DISABLED_BACKEND_PLUGIN_MESSAGE;
          } else if (err.body.reason && typeof err.body.reason === 'string' && err.body.reason.includes(DISABLED_BACKEND_PLUGIN_MESSAGE)) {
              clientMessage = DISABLED_BACKEND_PLUGIN_MESSAGE;
              clientAttributesError = DISABLED_BACKEND_PLUGIN_MESSAGE;
          } else if (err.body.error && typeof err.body.error === 'object' && err.body.error.reason && typeof err.body.error.reason === 'string' && err.body.error.reason.includes(DISABLED_BACKEND_PLUGIN_MESSAGE)) {
              clientMessage = DISABLED_BACKEND_PLUGIN_MESSAGE;
              clientAttributesError = DISABLED_BACKEND_PLUGIN_MESSAGE;
          }
          // Fallback if specific message not found in complex body, but body has a message
          else if (err.body.message && typeof err.body.message === 'string') {
              clientMessage = err.body.message;
              clientAttributesError = err.body.message;
          }
      }

      return res.customError({
        statusCode: err.statusCode || 500,
        body: {
          message: clientMessage, // Use the determined message
          attributes: {
            error: clientAttributesError, // Use the determined attributes error
          },
        },
      });
    }
  };
};
