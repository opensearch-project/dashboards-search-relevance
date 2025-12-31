/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { StaticAssetsService } from './static_assets_service';
import { IRouter, Logger } from '../../../../src/core/server';

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as unknown as Logger;

const mockRouter = {
  get: jest.fn(),
} as unknown as IRouter;

describe('StaticAssetsService', () => {
  let service: StaticAssetsService;

  beforeEach(() => {
    service = new StaticAssetsService(mockLogger);
    jest.clearAllMocks();
  });

  describe('setup', () => {
    it('should register static routes successfully', () => {
      service.setup(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/search_relevance/static/{file}',
          validate: expect.any(Object),
        }),
        expect.any(Function)
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Static assets service initialized successfully');
    });

    it('should handle setup errors gracefully', () => {
      const errorRouter = {
        get: jest.fn().mockImplementation(() => {
          throw new Error('Router error');
        }),
      } as unknown as IRouter;

      service.setup(errorRouter);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to initialize static assets service, continuing without it',
        expect.any(Error)
      );
    });
  });

  describe('route validation', () => {
    it('should register route with validation', () => {
      service.setup(mockRouter);
      const routeConfig = (mockRouter.get as jest.Mock).mock.calls[0][0];

      expect(routeConfig.validate).toBeDefined();
      expect(routeConfig.validate.params).toBeDefined();
      expect(routeConfig.path).toBe('/api/search_relevance/static/{file}');
    });
  });

  describe('file serving', () => {
    let routeHandler: Function;

    beforeEach(() => {
      service.setup(mockRouter);
      routeHandler = (mockRouter.get as jest.Mock).mock.calls[0][1];
    });

    it('should handle file serving without throwing errors', async () => {
      const mockRequest = {
        params: { file: 'ubi_dashboard.png' }
      };
      const mockResponse = {
        custom: jest.fn().mockReturnValue('error response'),
        notFound: jest.fn().mockReturnValue('not found response'),
        forbidden: jest.fn().mockReturnValue('forbidden response'),
        ok: jest.fn().mockReturnValue('ok response'),
      };

      // Should not throw an error
      await expect(routeHandler({}, mockRequest, mockResponse)).resolves.toBeDefined();
    });

    it('should handle requests for invalid files', async () => {
      const mockRequest = {
        params: { file: 'invalid.exe' }
      };
      const mockResponse = {
        custom: jest.fn().mockReturnValue('error response'),
        notFound: jest.fn().mockReturnValue('not found response'),
        forbidden: jest.fn().mockReturnValue('forbidden response'),
        ok: jest.fn().mockReturnValue('ok response'),
      };

      await routeHandler({}, mockRequest, mockResponse);

      // Should return not found for invalid files
      expect(mockResponse.notFound).toHaveBeenCalled();
    });
  });
});
