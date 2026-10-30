/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerSearchRelevanceStarterSuggestions } from '../starter_suggestions';
import { StarterSuggestionsProvider } from '../../../../../src/plugins/starter_suggestions/public';
import { PLUGIN_ID } from '../../../common';

describe('registerSearchRelevanceStarterSuggestions', () => {
  const registration = { invalidate: jest.fn(), unregister: jest.fn() };
  let registerProvider: jest.Mock;

  beforeEach(() => {
    registerProvider = jest.fn().mockReturnValue(registration);
  });

  const getProvider = (): StarterSuggestionsProvider => {
    registerSearchRelevanceStarterSuggestions({ registerProvider });
    return registerProvider.mock.calls[0][0];
  };

  it('registers a provider scoped to the search relevance app and returns its registration', () => {
    expect(registerSearchRelevanceStarterSuggestions({ registerProvider })).toBe(registration);
    expect(registerProvider).toHaveBeenCalledTimes(1);
    expect(registerProvider.mock.calls[0][0]).toMatchObject({ id: PLUGIN_ID, appId: PLUGIN_ID });
  });

  it('returns search relevance suggestions instead of the defaults', async () => {
    const provider = getProvider();
    const defaults = [{ id: 'default', icon: 'help', text: 'Default card', prompt: 'Default' }];

    const items = await provider.getSuggestions({
      appId: PLUGIN_ID,
      pathname: '/app/searchRelevance',
      defaults,
    });

    expect(items.map((item) => item.id)).toEqual([
      'compareSearchConfigurations',
      'evaluateSearchQuality',
      'createQuerySet',
    ]);
    items.forEach((item) => {
      expect(item.text).toBeTruthy();
      expect(item.prompt).toBeTruthy();
    });
  });
});
