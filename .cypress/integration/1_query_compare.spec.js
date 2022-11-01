/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="cypress" />
import {
  landOnSearchRelevance,
} from '../utils/event_constants';

describe('Search a query', () => {
  it('Should get search bar', () => {
    landOnSearchRelevance();
    cy.get('input[type="search"]').should('exist')
  });
});
