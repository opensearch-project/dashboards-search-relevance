/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerSearchRelevanceCommand } from '../search_relevance_command';
import { ChatPluginSetup } from '../../../../../src/plugins/chat/public';
import { CoreSetup } from '../../../../../src/core/public';

describe('registerSearchRelevanceCommand', () => {
  let mockRegisterCommand: jest.Mock;
  let mockChatSetup: ChatPluginSetup;
  let mockCoreSetup: any;
  let mockNavigateToApp: jest.Mock;
  let mockSendMessageWithWindow: jest.Mock;

  beforeEach(() => {
    mockRegisterCommand = jest.fn().mockReturnValue(jest.fn());
    mockNavigateToApp = jest.fn();
    mockSendMessageWithWindow = jest.fn();

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
        },
        {},
        {},
      ]),
    };
  });

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

    const handler = mockRegisterCommand.mock.calls[0][0].handler;
    const result = await handler('');

    expect(result).toEqual({
      localMessage: expect.stringContaining('only works in Search or Analytics (all) workspaces'),
      title: 'Incompatible workspace type',
    });
    expect(mockNavigateToApp).not.toHaveBeenCalled();
    expect(mockSendMessageWithWindow).not.toHaveBeenCalled();
  });

  it('returns localMessage when no workspace is set', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue(null);
    mockCoreSetup.workspaces.workspaceList$.getValue.mockReturnValue([]);
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup);

    const handler = mockRegisterCommand.mock.calls[0][0].handler;
    const result = await handler('');

    expect(result).toEqual({
      localMessage: expect.stringContaining('only works in Search or Analytics (all) workspaces'),
      title: 'Incompatible workspace type',
    });
    expect(mockNavigateToApp).not.toHaveBeenCalled();
  });

  it('navigates and shows welcome message when no args provided', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue({
      name: 'My Search',
      features: ['use-case-search'],
    });
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup);

    const handler = mockRegisterCommand.mock.calls[0][0].handler;
    const result = await handler('');

    expect(mockNavigateToApp).toHaveBeenCalledWith('searchRelevance');
    expect(mockSendMessageWithWindow).not.toHaveBeenCalled();
    expect(result).toEqual({
      localMessage: expect.stringContaining('Welcome to the OpenSearch Relevance Agent'),
      role: 'assistant',
    });
  });

  it('navigates and forwards user input', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue({
      name: 'My Search',
      features: ['use-case-search'],
    });
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup);

    const handler = mockRegisterCommand.mock.calls[0][0].handler;
    const result = await handler('check on cluster xxx');

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

    const handler = mockRegisterCommand.mock.calls[0][0].handler;
    const result = await handler('');

    expect(mockNavigateToApp).toHaveBeenCalledWith('searchRelevance');
    expect(mockSendMessageWithWindow).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({ role: 'assistant' }));
  });

  it('returns undefined when chat is not available', () => {
    const result = registerSearchRelevanceCommand(mockCoreSetup, undefined);
    expect(result).toBeUndefined();
  });
});
