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
    it('registers the command when chatCommandEnabled is true, passing dataSourceEnabled', () => {
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

      plugin.start(coreStartMock as any, {} as any);

      expect(registerSearchRelevanceCommand).toHaveBeenCalledWith(
        coreSetupMock,
        chatSetup,
        true,
        false
      );
    });

    it('forwards hideLocalCluster=true when the local cluster is hidden', () => {
      const chatSetup = {
        commandRegistry: { registerCommand: mockRegisterCommand },
      };

      plugin.setup(coreSetupMock as any, {
        dataSource: { hideLocalCluster: true } as any,
        dataSourceManagement: {} as any,
        chat: chatSetup as any,
      });

      coreStartMock.application.capabilities = {
        ...coreStartMock.application.capabilities,
        searchRelevanceDashboards: { chatCommandEnabled: true },
      };

      plugin.start(coreStartMock as any, {} as any);

      expect(registerSearchRelevanceCommand).toHaveBeenCalledWith(
        coreSetupMock,
        chatSetup,
        true,
        true
      );
    });

    it('passes dataSourceEnabled=false when the dataSource plugin is absent', () => {
      const chatSetup = {
        commandRegistry: { registerCommand: mockRegisterCommand },
      };

      plugin.setup(coreSetupMock as any, {
        dataSourceManagement: {} as any,
        chat: chatSetup as any,
      } as any);

      coreStartMock.application.capabilities = {
        ...coreStartMock.application.capabilities,
        searchRelevanceDashboards: { chatCommandEnabled: true },
      };

      plugin.start(coreStartMock as any, {} as any);

      expect(registerSearchRelevanceCommand).toHaveBeenCalledWith(
        coreSetupMock,
        chatSetup,
        false,
        false
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

      coreStartMock.application.capabilities = {
        ...coreStartMock.application.capabilities,
        searchRelevanceDashboards: { chatCommandEnabled: false },
      };

      plugin.start(coreStartMock as any, {} as any);

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

      coreStartMock.application.capabilities = {
        ...coreStartMock.application.capabilities,
      };

      plugin.start(coreStartMock as any, {} as any);

      expect(registerSearchRelevanceCommand).not.toHaveBeenCalled();
    });

    it('passes undefined chatSetup when chat plugin is not available', () => {
      (registerSearchRelevanceCommand as jest.Mock).mockReturnValue(undefined);

      plugin.setup(coreSetupMock as any, {
        dataSource: {} as any,
        dataSourceManagement: {} as any,
      } as any);

      coreStartMock.application.capabilities = {
        ...coreStartMock.application.capabilities,
        searchRelevanceDashboards: { chatCommandEnabled: true },
      };

      plugin.start(coreStartMock as any, {} as any);

      expect(registerSearchRelevanceCommand).toHaveBeenCalledWith(
        coreSetupMock,
        undefined,
        true,
        false
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

      plugin.start(coreStartMock as any, {} as any);
      plugin.stop();

      expect(mockUnregister).toHaveBeenCalled();
    });
  });
});
