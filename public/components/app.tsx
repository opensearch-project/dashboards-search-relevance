/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { I18nProvider } from '@osd/i18n/react';
import React, { useState } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { SearchRelevanceContextProvider } from '../contexts';
import { ResourceManagementPage } from './resource_management_home/resource_management_page';

export const SearchRelevanceApp = () => {
  return (
    <HashRouter>
      <I18nProvider>
        <SearchRelevanceContextProvider>
          <>
            <Switch>
              <Route
                path={[
                  '/',
                  '/:entity(querySet|searchConfiguration|experiment|judgment)/:entityAction(list|create|view)?/:entityId?',
                ]}
                exact
                render={(props) => {
                  const { entity, entityAction, entityId } = props.match.params;

                  return (
                    <>
                      <ResourceManagementPage
                        entity={entity}
                        entityAction={entityAction}
                        entityId={entityId}
                      />
                    </>
                  );
                }}
              />
            </Switch>
          </>
        </SearchRelevanceContextProvider>
      </I18nProvider>
    </HashRouter>
  );
};
