/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerSearchRelevanceCommand } from '../search_relevance_command';
import { ChatPluginSetup } from '../../../../../src/plugins/chat/public';

jest.mock('../../../../../src/core/public', () => ({
  ALL_USE_CASE_ID: 'all',
  SEARCH_USE_CASE_ID: 'search',
  isNavGroupInFeatureConfigs: (navGroupId: string, featureConfigs: string[]) =>
    Array.isArray(featureConfigs) && featureConfigs.includes(`use-case-${navGroupId}`),
}));

describe('registerSearchRelevanceCommand', () => {
  let mockRegisterCommand: jest.Mock;
  let mockChatSetup: ChatPluginSetup;
  let mockCoreSetup: any;
  let mockNavigateToApp: jest.Mock;
  let mockSendMessageWithWindow: jest.Mock;
  let mockFind: jest.Mock;

  beforeEach(() => {
    mockRegisterCommand = jest.fn().mockReturnValue(jest.fn());
    mockNavigateToApp = jest.fn();
    mockSendMessageWithWindow = jest.fn();
    mockFind = jest.fn().mockResolvedValue({ savedObjects: [] });

    mockChatSetup = ({
      commandRegistry: { registerCommand: mockRegisterCommand },
    } as unknown) as ChatPluginSetup;

    mockCoreSetup = {
      workspaces: {
        currentWorkspace$: { getValue: jest.fn() },
        workspaceList$: { getValue: jest.fn().mockReturnValue([]) },
      },
      getStartServices: jest.fn().mockResolvedValue([
        {
          application: { navigateToApp: mockNavigateToApp },
          chat: { sendMessageWithWindow: mockSendMessageWithWindow },
          savedObjects: { client: { find: mockFind } },
        },
        {},
        {},
      ]),
    };
  });

  const getHandler = () => mockRegisterCommand.mock.calls[0][0].handler;

  it('registers /search-relevance command', () => {
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup);
    expect(mockRegisterCommand).toHaveBeenCalledTimes(1);
    expect(mockRegisterCommand).toHaveBeenCalledWith(
      expect.objectContaining({ command: 'search-relevance' })
    );
  });

  it('returns localMessage when not in Search workspace', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue({
      name: 'Analytics',
      features: ['use-case-observability'],
    });
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup);

    const result = await getHandler()('');

    expect(result).toEqual({
      localMessage: expect.stringContaining('only works in Search or Analytics (all) workspaces'),
      title: 'Incompatible workspace type',
    });
    expect(mockNavigateToApp).not.toHaveBeenCalled();
    expect(mockSendMessageWithWindow).not.toHaveBeenCalled();
  });

  it('returns localMessage when no workspace is set', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue(null);
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup);

    const result = await getHandler()('');

    expect(result).toEqual({
      localMessage: expect.stringContaining('only works in Search or Analytics (all) workspaces'),
      title: 'Incompatible workspace type',
    });
    expect(mockNavigateToApp).not.toHaveBeenCalled();
  });

  it('reports no supported data source when only an AnalyticEngine source is available (MDS on)', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue({
      name: 'My Search',
      features: ['use-case-search'],
    });
    mockFind.mockResolvedValue({
      savedObjects: [
        { attributes: { dataSourceEngineType: 'AnalyticEngine', dataSourceVersion: '2.12.0' } },
      ],
    });

    // dataSourceEnabled = true, local cluster hidden -> enumerate remote data sources
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup, true, true);

    const result = await getHandler()('');

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'data-source' })
    );
    expect(result).toEqual({
      title: 'Unsupported data source',
      localMessage: expect.stringContaining(
        'No available data source supports search relevance tuning'
      ),
    });
    expect(mockNavigateToApp).not.toHaveBeenCalled();
    expect(mockSendMessageWithWindow).not.toHaveBeenCalled();
  });

  it('reports no supported data source when the workspace has no data source (MDS on, local cluster hidden)', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue({
      name: 'My Search',
      features: ['use-case-search'],
    });
    mockFind.mockResolvedValue({ savedObjects: [] });

    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup, true, true);

    const result = await getHandler()('');

    expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ type: 'data-source' }));
    expect(result).toEqual({
      title: 'Unsupported data source',
      localMessage: expect.stringContaining(
        'No available data source supports search relevance tuning'
      ),
    });
    expect(mockNavigateToApp).not.toHaveBeenCalled();
  });

  it('navigates when a supported (non-AE, compatible) data source is available (MDS on)', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue({
      name: 'My Search',
      features: ['use-case-search'],
    });
    mockFind.mockResolvedValue({
      savedObjects: [
        { attributes: { dataSourceEngineType: 'AnalyticEngine', dataSourceVersion: '2.12.0' } },
        { attributes: { dataSourceEngineType: 'OpenSearch', dataSourceVersion: '2.12.0' } },
      ],
    });

    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup, true, true);

    const result = await getHandler()('');

    expect(mockNavigateToApp).toHaveBeenCalledWith('searchRelevance');
    expect(result).toEqual({
      localMessage: expect.stringContaining('Welcome to the OpenSearch Relevance Agent'),
      role: 'assistant',
    });
  });

  it('navigates when the local cluster is visible, even if only AnalyticEngine remotes exist', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue({
      name: 'My Search',
      features: ['use-case-search'],
    });
    mockFind.mockResolvedValue({
      savedObjects: [
        { attributes: { dataSourceEngineType: 'AnalyticEngine', dataSourceVersion: '2.12.0' } },
      ],
    });

    // MDS on but local cluster visible (hideLocalCluster=false): the Workbench offers the local
    // cluster, so the command proceeds without enumerating remote data sources.
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup, true, false);

    const result = await getHandler()('');

    expect(mockFind).not.toHaveBeenCalled();
    expect(mockNavigateToApp).toHaveBeenCalledWith('searchRelevance');
    expect(result).toEqual(expect.objectContaining({ role: 'assistant' }));
  });

  it('does not query data sources and navigates when MDS is disabled (single local cluster)', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue({
      name: 'My Search',
      features: ['use-case-search'],
    });

    // dataSourceEnabled defaults to false
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup);

    const result = await getHandler()('');

    expect(mockFind).not.toHaveBeenCalled();
    expect(mockNavigateToApp).toHaveBeenCalledWith('searchRelevance');
    expect(mockSendMessageWithWindow).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({ role: 'assistant' }));
  });

  it('fails open (navigates) when the data source lookup throws', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue({
      name: 'My Search',
      features: ['use-case-search'],
    });
    mockFind.mockRejectedValue(new Error('boom'));

    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup, true, true);

    const result = await getHandler()('');

    expect(mockNavigateToApp).toHaveBeenCalledWith('searchRelevance');
    expect(result).toEqual(expect.objectContaining({ role: 'assistant' }));
  });

  it('navigates and forwards user input', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue({
      name: 'My Search',
      features: ['use-case-search'],
    });
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup);

    const result = await getHandler()('check on cluster xxx');

    expect(mockNavigateToApp).toHaveBeenCalledWith('searchRelevance');
    expect(mockSendMessageWithWindow).toHaveBeenCalledWith('check on cluster xxx', [], {
      clearConversation: true,
    });
    expect(result).toBe('');
  });

  it('navigates when in All use-case workspace', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue({
      name: 'Everything',
      features: ['use-case-all'],
    });
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup);

    const result = await getHandler()('');

    expect(mockNavigateToApp).toHaveBeenCalledWith('searchRelevance');
    expect(result).toEqual(expect.objectContaining({ role: 'assistant' }));
  });

  it('returns undefined when chat is not available', () => {
    const result = registerSearchRelevanceCommand(mockCoreSetup, undefined);
    expect(result).toBeUndefined();
  });
});
