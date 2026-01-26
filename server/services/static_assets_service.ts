/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import {
  IRouter,
  Logger,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
} from '../../../../src/core/server';

const ALLOWED_FILES: Record<string, string> = {
  'ubi_dashboard.png': 'image/png',
  'dark_ubi_dashboard.png': 'image/png',
};

export class StaticAssetsService {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public setup(router: IRouter): void {
    try {
      this.registerStaticRoutes(router);
      this.logger.info('Static assets service initialized successfully');
    } catch (error) {
      this.logger.warn('Failed to initialize static assets service, continuing without it', error);
    }
  }

  private registerStaticRoutes(router: IRouter): void {
    router.get(
      {
        path: '/api/search_relevance/static/{file}',
        validate: {
          params: schema.object({
            file: schema.string({
              validate: (value) => {
                if (!(value in ALLOWED_FILES)) {
                  return 'File not allowed';
                }
              },
            }),
          }),
        },
      },
      async (context, request, response) => {
        try {
          return await this.handleStaticFileRequest(request, response);
        } catch (error) {
          this.logger.warn('Error serving static file', error);
          return response.custom({
            statusCode: 500,
            body: 'Internal server error',
          });
        }
      }
    );
  }

  private async handleStaticFileRequest(
    request: OpenSearchDashboardsRequest<{ file: string }>,
    response: OpenSearchDashboardsResponseFactory
  ) {
    const path = require('path');
    const fs = require('fs');
    const fileName = request.params.file;
    const filePath = path.resolve(__dirname, '../../public/assets', fileName);
    
    if (!fs.existsSync(filePath)) {
      return response.notFound({ body: 'File not found' });
    }
    
    return response.ok({
      body: fs.readFileSync(filePath),
      headers: {
        'content-type': ALLOWED_FILES[fileName],
        'cache-control': 'public, max-age=3600',
      },
    });
  }
}
