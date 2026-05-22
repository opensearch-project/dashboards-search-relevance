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
  let mockAddInfo: jest.Mock;

  beforeEach(() => {
    mockRegisterCommand = jest.fn();
    mockNavigateToApp = jest.fn();
    mockAddInfo = jest.fn();

    mockChatSetup = {
      commandRegistry: { registerCommand: mockRegisterCommand },
    } as unknown as ChatPluginSetup;

    mockCoreSetup = {
      workspaces: {
        currentWorkspace$: { getValue: jest.fn() },
      },
      getStartServices: jest.fn().mockResolvedValue([
        {
          application: { navigateToApp: mockNavigateToApp },
          notifications: { toasts: { addInfo: mockAddInfo } },
        },
        {},
        {},
      ]),
    };

    mockRegisterCommand.mockReturnValue(jest.fn());
  });

  it('registers the command', () => {
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup);
    expect(mockRegisterCommand).toHaveBeenCalledWith(
      expect.objectContaining({ command: 'search-relevance' })
    );
  });

  it('shows toast when not in Search workspace', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue({ name: 'Analytics' });
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup);

    const handler = mockRegisterCommand.mock.calls[0][0].handler;
    const result = await handler('');

    expect(mockAddInfo).toHaveBeenCalledWith(
      'Please switch to the "Search" workspace to use Search Relevance.'
    );
    expect(mockNavigateToApp).not.toHaveBeenCalled();
    expect(result).toBe('');
  });

  it('shows toast when no workspace is active', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue(null);
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup);

    const handler = mockRegisterCommand.mock.calls[0][0].handler;
    await handler('');

    expect(mockAddInfo).toHaveBeenCalled();
    expect(mockNavigateToApp).not.toHaveBeenCalled();
  });

  it('navigates to searchRelevance when in Search workspace', async () => {
    mockCoreSetup.workspaces.currentWorkspace$.getValue.mockReturnValue({ name: 'Search' });
    registerSearchRelevanceCommand(mockCoreSetup, mockChatSetup);

    const handler = mockRegisterCommand.mock.calls[0][0].handler;
    const result = await handler('');

    expect(mockNavigateToApp).toHaveBeenCalledWith('searchRelevance');
    expect(mockAddInfo).not.toHaveBeenCalled();
    expect(result).toBe('');
  });

  it('returns undefined when chat is not available', () => {
    const result = registerSearchRelevanceCommand(mockCoreSetup, undefined);
    expect(result).toBeUndefined();
  });
});
