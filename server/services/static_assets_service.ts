/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter, Logger } from '../../../../src/core/server';

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
                const allowedFiles = ['ubi_dashboard.png', 'dark_ubi_dashboard.png'];
                if (!allowedFiles.includes(value)) {
                  return 'File not allowed';
                }
                if (value.includes('..') || value.includes('/') || value.includes('\\')) {
                  return 'Invalid file name';
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

  private async handleStaticFileRequest(request: any, response: any) {
    const path = require('path');
    const fs = require('fs');
    
    const allowedFiles = {
      'ubi_dashboard.png': 'image/png',
      'dark_ubi_dashboard.png': 'image/png'
    };
    
    const fileName = request.params.file;
    if (!allowedFiles[fileName]) {
      return response.notFound({ body: 'File not found' });
    }
    
    const filePath = path.resolve(__dirname, '../../public/assets', fileName);
    const assetsDir = path.resolve(__dirname, '../../public/assets');
    
    if (!filePath.startsWith(assetsDir)) {
      return response.forbidden({ body: 'Access denied' });
    }
    
    if (!fs.existsSync(filePath)) {
      return response.notFound({ body: 'File not found' });
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    
    return response.ok({
      body: fileBuffer,
      headers: {
        'content-type': allowedFiles[fileName],
        'cache-control': 'public, max-age=3600',
      },
    });
  }
}
