/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SearchRelevancePlugin } from './plugin';
import { coreMock } from '../../../src/core/public/mocks';

const mockRegisterCommand = jest.fn().mockReturnValue(jest.fn());

jest.mock('./chat/search_relevance_command', () => ({
  registerSearchRelevanceCommand: jest.fn().mockReturnValue(jest.fn()),
}));

jest.mock('./plugin_nav', () => ({
  registerAllPluginNavGroups: jest.fn(),
}));

jest.mock('./components/service_card/compare_query_card', () => ({
  registerCompareQueryCard: jest.fn(),
}));

import { registerSearchRelevanceCommand } from './chat/search_relevance_command';

describe('SearchRelevancePlugin', () => {
  let plugin: SearchRelevancePlugin;
  let coreSetupMock: ReturnType<typeof coreMock.createSetup>;
  let coreStartMock: ReturnType<typeof coreMock.createStart>;

  beforeEach(() => {
    jest.clearAllMocks();
    plugin = new SearchRelevancePlugin();
    coreSetupMock = coreMock.createSetup();
    coreStartMock = coreMock.createStart();
  });

  afterEach(() => {
    plugin.stop();
  });

  describe('chatCommandEnabled feature flag', () => {
    it('registers the command when chatCommandEnabled is true', () => {
      const chatSetup = {
        commandRegistry: { registerCommand: mockRegisterCommand },
      };

      plugin.setup(coreSetupMock as any, {
        dataSource: {} as any,
        dataSourceManagement: {} as any,
        chat: chatSetup as any,
      });

      // Set capability to true
      coreStartMock.application.capabilities = {
        ...coreStartMock.application.capabilities,
        searchRelevanceDashboards: { chatCommandEnabled: true },
      };

      plugin.start(coreStartMock as any, { dataSource: {} as any });

      expect(registerSearchRelevanceCommand).toHaveBeenCalledWith(
        coreSetupMock,
        chatSetup
      );
    });

    it('does not register the command when chatCommandEnabled is false', () => {
      const chatSetup = {
        commandRegistry: { registerCommand: mockRegisterCommand },
      };

      plugin.setup(coreSetupMock as any, {
        dataSource: {} as any,
        dataSourceManagement: {} as any,
        chat: chatSetup as any,
      });

      // Set capability to false (default)
      coreStartMock.application.capabilities = {
        ...coreStartMock.application.capabilities,
        searchRelevanceDashboards: { chatCommandEnabled: false },
      };

      plugin.start(coreStartMock as any, { dataSource: {} as any });

      expect(registerSearchRelevanceCommand).not.toHaveBeenCalled();
    });

    it('does not register the command when chatCommandEnabled capability is missing', () => {
      const chatSetup = {
        commandRegistry: { registerCommand: mockRegisterCommand },
      };

      plugin.setup(coreSetupMock as any, {
        dataSource: {} as any,
        dataSourceManagement: {} as any,
        chat: chatSetup as any,
      });

      // No searchRelevanceDashboards capability
      coreStartMock.application.capabilities = {
        ...coreStartMock.application.capabilities,
      };

      plugin.start(coreStartMock as any, { dataSource: {} as any });

      expect(registerSearchRelevanceCommand).not.toHaveBeenCalled();
    });

    it('passes undefined chatSetup when chat plugin is not available', () => {
      (registerSearchRelevanceCommand as jest.Mock).mockReturnValue(undefined);

      plugin.setup(coreSetupMock as any, {
        dataSource: {} as any,
        dataSourceManagement: {} as any,
        // No chat plugin
      });

      coreStartMock.application.capabilities = {
        ...coreStartMock.application.capabilities,
        searchRelevanceDashboards: { chatCommandEnabled: true },
      };

      plugin.start(coreStartMock as any, { dataSource: {} as any });

      expect(registerSearchRelevanceCommand).toHaveBeenCalledWith(
        coreSetupMock,
        undefined
      );
    });

    it('calls unregister on stop when command was registered', () => {
      const mockUnregister = jest.fn();
      (registerSearchRelevanceCommand as jest.Mock).mockReturnValue(mockUnregister);

      const chatSetup = {
        commandRegistry: { registerCommand: mockRegisterCommand },
      };

      plugin.setup(coreSetupMock as any, {
        dataSource: {} as any,
        dataSourceManagement: {} as any,
        chat: chatSetup as any,
      });

      coreStartMock.application.capabilities = {
        ...coreStartMock.application.capabilities,
        searchRelevanceDashboards: { chatCommandEnabled: true },
      };

      plugin.start(coreStartMock as any, { dataSource: {} as any });
      plugin.stop();

      expect(mockUnregister).toHaveBeenCalled();
    });
  });
});
