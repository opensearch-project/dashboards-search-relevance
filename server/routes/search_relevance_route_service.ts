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
import {
  BASE_EXPERIMENT_NODE_API_PATH,
  BASE_QUERYSET_NODE_API_PATH,
  BASE_SEARCH_CONFIG_NODE_API_PATH,
} from '../../common';
import { getClientBasedOnDataSource } from '../common/helper';

export function registerSearchRelevanceRoutes(
  router: IRouter,
  searchRelevanceRoutesService: SearchRelevanceRoutesService
): void {
  router.post(
    {
      path: BASE_QUERYSET_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
      options: {
        body: {
          accepts: 'application/json',
        },
      },
    },
    searchRelevanceRoutesService.createQuerySet
  );
  router.post(
    {
      path: `${BASE_QUERYSET_NODE_API_PATH}/{data_source_id}/queryset`,
      validate: {
        params: schema.object({
          data_source_id: schema.string(),
        }),
        body: schema.any(),
      },
      options: {
        body: {
          accepts: 'application/json',
        },
      },
    },
    searchRelevanceRoutesService.createQuerySet
  );
  router.put(
    {
      path: BASE_QUERYSET_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
      options: {
        body: {
          accepts: 'application/json',
        },
      },
    },
    searchRelevanceRoutesService.putQuerySet
  );
  router.get(
    {
      path: `${BASE_QUERYSET_NODE_API_PATH}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    searchRelevanceRoutesService.getQuerySet
  );
  router.get(
    {
      path: BASE_QUERYSET_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
    },
    searchRelevanceRoutesService.listQuerySets
  );
  router.delete(
    {
      path: `${BASE_QUERYSET_NODE_API_PATH}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    searchRelevanceRoutesService.deleteQuerySet
  );
  router.put(
    {
      path: BASE_SEARCH_CONFIG_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
      options: {
        body: {
          accepts: 'application/json',
        },
      },
    },
    searchRelevanceRoutesService.putSearchConfig
  );
  router.get(
    {
      path: `${BASE_SEARCH_CONFIG_NODE_API_PATH}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    searchRelevanceRoutesService.getSearchConfig
  );
  router.get(
    {
      path: BASE_SEARCH_CONFIG_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
    },
    searchRelevanceRoutesService.listSearchConfigs
  );
  router.delete(
    {
      path: `${BASE_SEARCH_CONFIG_NODE_API_PATH}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    searchRelevanceRoutesService.deleteSearchConfig
  );
  router.put(
    {
      path: BASE_EXPERIMENT_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
      options: {
        body: {
          accepts: 'application/json',
        },
      },
    },
    searchRelevanceRoutesService.putExperiment
  );
  router.get(
    {
      path: `${BASE_EXPERIMENT_NODE_API_PATH}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    searchRelevanceRoutesService.getExperiment
  );
  router.get(
    {
      path: BASE_EXPERIMENT_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
    },
    searchRelevanceRoutesService.listExperiments
  );
  router.delete(
    {
      path: `${BASE_EXPERIMENT_NODE_API_PATH}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    searchRelevanceRoutesService.deleteExperiment
  );
}

export class SearchRelevanceRoutesService {
  private client: any;
  dataSourceEnabled: boolean;

  constructor(client: any, dataSourceEnabled: boolean) {
    this.client = client;
    this.dataSourceEnabled = dataSourceEnabled;
  }

  createQuerySet = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body;
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.createQuerySet', {
        body,
      });

      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  putQuerySet = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body;
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.putQuerySet', {
        body,
      });

      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getQuerySet = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { id } = req.params;
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.getQuerySet', {
        id,
      });
      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          resp: err.message,
        },
      });
    }
  };

  listQuerySets = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.listQuerySets', {});
      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          resp: err.message,
        },
      });
    }
  };

  deleteQuerySet = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { id } = req.params;
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.deleteQuerySet', {
        id,
      });
      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          resp: err.message,
        },
      });
    }
  };

  putSearchConfig = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body;
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.putSearchConfig', {
        body,
      });

      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getSearchConfig = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { id } = req.params;
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.getSearchConfig', {
        id,
      });
      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          resp: err.message,
        },
      });
    }
  };

  listSearchConfigs = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.listSearchConfigs', {});
      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          resp: err.message,
        },
      });
    }
  };

  deleteSearchConfig = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { id } = req.params;
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.deleteSearchConfig', {
        id,
      });
      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          resp: err.message,
        },
      });
    }
  };

  putExperiment = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body;
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.putExperiment', {
        body,
      });

      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getExperiment = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { id } = req.params;
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.getExperiment', {
        id,
      });
      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          resp: err.message,
        },
      });
    }
  };

  listExperiments = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.listExperiments', {});
      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          resp: err.message,
        },
      });
    }
  };

  deleteExperiment = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { id } = req.params;
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.deleteExperiment', {
        id,
      });
      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          resp: err.message,
        },
      });
    }
  };
}
