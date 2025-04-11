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
import { BASE_QUERYSET_NODE_API_PATH, BASE_SEARCH_CONFIGURATION_NODE_API_PATH } from '../../common';
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
  router.get(
    {
      path: `${BASE_QUERYSET_NODE_API_PATH}`,
      validate: false,
    },
    searchRelevanceRoutesService.listQuerySets
  );
  router.post(
    {
      path: `${BASE_SEARCH_CONFIGURATION_NODE_API_PATH}`,
      validate: {
        body: schema.any(),
      },
      options: {
        body: {
          accepts: 'application/json',
        },
      },
    },
    searchRelevanceRoutesService.createSearchConfiguration
  );
  router.get(
    {
      path: `${BASE_SEARCH_CONFIGURATION_NODE_API_PATH}`,
      validate: false
    },
    searchRelevanceRoutesService.listSearchConfigurations
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
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      // const querysetResponse = await callWithRequest('searchRelevance.createQuerySet', {
      //   body,
      // });
      //const querysetResponse = await callWithRequest('searchRelevance.createQuerySet', req.params);
      //const querysetResponse = await callWithRequest('searchRelevance.createQuerySet', {...req.searchParams});

      // likely manual parsing won't be needed when we are consistent with GET/POST parameters
      const keys = {}
      req.url.searchParams.forEach((value, key) => {
        keys[key] = value;
      });
      const querysetResponse = await callWithRequest('searchRelevance.createQuerySet', keys);

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

  createSearchConfiguration = async (
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

      // likely manual parsing won't be needed when we are consistent with GET/POST parameters
      const keys = {}
      req.url.searchParams.forEach((value, key) => {
       keys[key] = value;
      });
      //const SearchConfigurationsResponse = await callWithRequest('searchRelevance.createSearchConfiguration', keys);

      const configData = req.url.searchParams;
      console.log('Request Body:', configData)
      //console.log('Request:', req)
      console.log('keys:', keys)
      const SearchConfigurationsResponse = await callWithRequest('searchRelevance.createSearchConfiguration', configData);

      return res.ok({
        body: {
          ok: true,
          resp: SearchConfigurationsResponse,
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

  listSearchConfigurations = async (
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

      const SearchConfigurationsResponse = await callWithRequest('searchRelevance.listSearchConfigurations');
      return res.ok({
        body: {
          ok: true,
          resp: SearchConfigurationsResponse,
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
