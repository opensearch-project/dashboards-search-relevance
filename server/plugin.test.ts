/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { SearchRelevancePlugin } from './plugin';

jest.mock('./routes', () => ({
  defineRoutes: jest.fn(),
  registerSearchRelevanceRoutes: jest.fn(),
}));

jest.mock('./routes/ml_route_service', () => ({
  registerMLRoutes: jest.fn(),
}));

jest.mock('./sample_data/ubi_sample_data', () => ({
  ubiSpecProvider: {},
}));

jest.mock('./services/static_assets_service', () => ({
  StaticAssetsService: jest.fn().mockImplementation(() => ({
    setup: jest.fn(),
  })),
}));

jest.mock('./metrics/metrics_service', () => ({
  MetricsService: jest.fn().mockImplementation(() => ({
    setup: jest.fn().mockReturnValue({}),
  })),
}));

describe('SearchRelevancePlugin (server)', () => {
  let mockInitializerContext: any;
  let mockCoreSetup: any;
  let mockDeps: any;
  let registerProviderFn: jest.Mock;
  let registerSwitcherFn: jest.Mock;

  const createPlugin = (configOverrides: Record<string, any> = {}) => {
    const config = {
      chatCommandEnabled: false,
      metrics: { metricInterval: 60000, windowSize: 5 },
      ...configOverrides,
    };

    const mockLoggerInstance: any = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      get: jest.fn(),
    };
    // logger.get() returns a child logger with the same shape
    mockLoggerInstance.get.mockReturnValue(mockLoggerInstance);

    mockInitializerContext = {
      config: {
        create: jest.fn().mockReturnValue(of(config)),
      },
      logger: {
        get: jest.fn().mockReturnValue(mockLoggerInstance),
      },
    };

    return new SearchRelevancePlugin(mockInitializerContext);
  };

  beforeEach(() => {
    registerProviderFn = jest.fn();
    registerSwitcherFn = jest.fn();

    mockCoreSetup = {
      uiSettings: { register: jest.fn() },
      capabilities: {
        registerProvider: registerProviderFn,
        registerSwitcher: registerSwitcherFn,
      },
      dynamicConfigService: {
        getStartService: jest.fn(),
      },
      http: {
        createRouter: jest.fn().mockReturnValue({
          get: jest.fn(),
          post: jest.fn(),
          put: jest.fn(),
          delete: jest.fn(),
        }),
        registerRouteHandlerContext: jest.fn(),
      },
      opensearch: {
        legacy: {
          createClient: jest.fn(),
        },
      },
    };

    mockDeps = {
      dataSource: {},
    };
  });

  describe('capabilities provider', () => {
    it('registers chatCommandEnabled as false when config default is false', async () => {
      const plugin = createPlugin({ chatCommandEnabled: false });
      await plugin.setup(mockCoreSetup, mockDeps);

      expect(registerProviderFn).toHaveBeenCalledTimes(1);
      const provider = registerProviderFn.mock.calls[0][0];
      const capabilities = provider();

      expect(capabilities).toEqual({
        searchRelevanceDashboards: {
          chatCommandEnabled: false,
        },
      });
    });

    it('registers chatCommandEnabled as true when config is true', async () => {
      const plugin = createPlugin({ chatCommandEnabled: true });
      await plugin.setup(mockCoreSetup, mockDeps);

      expect(registerProviderFn).toHaveBeenCalledTimes(1);
      const provider = registerProviderFn.mock.calls[0][0];
      const capabilities = provider();

      expect(capabilities).toEqual({
        searchRelevanceDashboards: {
          chatCommandEnabled: true,
        },
      });
    });
  });

  describe('capabilities switcher', () => {
    it('overrides chatCommandEnabled from dynamic config', async () => {
      const plugin = createPlugin({ chatCommandEnabled: false });
      await plugin.setup(mockCoreSetup, mockDeps);

      expect(registerSwitcherFn).toHaveBeenCalledTimes(1);
      const switcher = registerSwitcherFn.mock.calls[0][0];

      const mockRequest = {};
      const mockCapabilities = {
        searchRelevanceDashboards: { chatCommandEnabled: false },
      };

      const mockStore = {};
      const mockClient = {
        getConfig: jest.fn().mockResolvedValue({ chatCommandEnabled: true }),
      };

      mockCoreSetup.dynamicConfigService.getStartService.mockResolvedValue({
        createStoreFromRequest: jest.fn().mockReturnValue(mockStore),
        getClient: jest.fn().mockReturnValue(mockClient),
      });

      const result = await switcher(mockRequest, mockCapabilities);

      expect(result).toEqual({
        searchRelevanceDashboards: {
          chatCommandEnabled: true,
        },
      });
      expect(mockClient.getConfig).toHaveBeenCalledWith(
        { pluginConfigPath: 'searchRelevanceDashboards' },
        { asyncLocalStorageContext: mockStore }
      );
    });

    it('returns empty object when store cannot be created', async () => {
      const plugin = createPlugin({ chatCommandEnabled: true });
      await plugin.setup(mockCoreSetup, mockDeps);

      const switcher = registerSwitcherFn.mock.calls[0][0];
      const mockRequest = {};
      const mockCapabilities = {
        searchRelevanceDashboards: { chatCommandEnabled: true },
      };

      mockCoreSetup.dynamicConfigService.getStartService.mockResolvedValue({
        createStoreFromRequest: jest.fn().mockReturnValue(null),
        getClient: jest.fn(),
      });

      const result = await switcher(mockRequest, mockCapabilities);

      expect(result).toEqual({});
    });

    it('returns empty object and logs warning when dynamic config throws', async () => {
      const plugin = createPlugin({ chatCommandEnabled: false });
      await plugin.setup(mockCoreSetup, mockDeps);

      const switcher = registerSwitcherFn.mock.calls[0][0];
      const mockRequest = {};
      const mockCapabilities = {
        searchRelevanceDashboards: { chatCommandEnabled: false },
      };

      mockCoreSetup.dynamicConfigService.getStartService.mockRejectedValue(
        new Error('Dynamic config unavailable')
      );

      const result = await switcher(mockRequest, mockCapabilities);

      expect(result).toEqual({});
      // Verify the warn was called
      const logger = mockInitializerContext.logger.get();
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to read dynamic config for searchRelevanceDashboards capability',
        expect.any(Error)
      );
    });

    it('returns empty object when getConfig throws', async () => {
      const plugin = createPlugin({ chatCommandEnabled: false });
      await plugin.setup(mockCoreSetup, mockDeps);

      const switcher = registerSwitcherFn.mock.calls[0][0];
      const mockRequest = {};
      const mockCapabilities = {
        searchRelevanceDashboards: { chatCommandEnabled: false },
      };

      const mockClient = {
        getConfig: jest.fn().mockRejectedValue(new Error('Config read failed')),
      };

      mockCoreSetup.dynamicConfigService.getStartService.mockResolvedValue({
        createStoreFromRequest: jest.fn().mockReturnValue({}),
        getClient: jest.fn().mockReturnValue(mockClient),
      });

      const result = await switcher(mockRequest, mockCapabilities);

      expect(result).toEqual({});
    });

    it('preserves existing capabilities while overriding chatCommandEnabled', async () => {
      const plugin = createPlugin({ chatCommandEnabled: false });
      await plugin.setup(mockCoreSetup, mockDeps);

      const switcher = registerSwitcherFn.mock.calls[0][0];
      const mockRequest = {};
      const mockCapabilities = {
        searchRelevanceDashboards: {
          chatCommandEnabled: false,
          someOtherCapability: true,
        },
      };

      const mockClient = {
        getConfig: jest.fn().mockResolvedValue({ chatCommandEnabled: true }),
      };

      mockCoreSetup.dynamicConfigService.getStartService.mockResolvedValue({
        createStoreFromRequest: jest.fn().mockReturnValue({}),
        getClient: jest.fn().mockReturnValue(mockClient),
      });

      const result = await switcher(mockRequest, mockCapabilities);

      expect(result).toEqual({
        searchRelevanceDashboards: {
          chatCommandEnabled: true,
          someOtherCapability: true,
        },
      });
    });
  });
});
