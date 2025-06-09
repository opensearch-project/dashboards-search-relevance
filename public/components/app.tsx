/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiGlobalToastList } from '@elastic/eui';
import { I18nProvider } from '@osd/i18n/react';
import React, { useEffect, useState } from 'react';
import { HashRouter, Route, Switch, withRouter, useLocation } from 'react-router-dom';
import {
  EuiPageSideBar,
  EuiSideNav,
  EuiTitle,
  EuiSpacer,
  EuiPage,
  EuiPageBody,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { CoreStart, MountPoint, Toast, ReactChild } from '../../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../../src/plugins/data_source_management/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import {
  PLUGIN_NAME,
  COMPARE_SEARCH_RESULTS_TITLE,
  SEARCH_RELEVANCE_EXPERIMENTAL_WORKBENCH_UI_EXPERIENCE_ENABLED,
  ServiceEndpoints,
  Routes,
} from '../../common';
import { SearchRelevanceContextProvider } from '../contexts';
import { Home as QueryCompareHome } from './query_compare/home';
import { useOpenSearchDashboards } from '../../../../src/plugins/opensearch_dashboards_react/public';
import { ExperimentListingWithRoute } from './experiment_listing';
import { ExperimentViewWithRouter } from './experiment_view/experiment_view';
import { QuerySetListingWithRoute } from './query_set_listing';
import { SearchConfigurationListingWithRoute } from './search_config_listing';
import { JudgmentListingWithRoute } from './judgment_listing';
import QuerySetView from './query_set_view/query_set_view';
import SearchConfigurationView from './search_config_view/search_config_view';
import JudgmentView from './judgment_view/judgment_view';
import { QuerySetCreateWithRouter } from './query_set_create/query_set_create';
import { SearchConfigurationCreateWithRouter } from './search_config_create/search_config_create';
import { JudgmentCreateWithRouter } from './judgment_create/judgment_create';
import { GetStartedAccordion } from './experiment_create/get_started_accordion';
import { TemplateType, routeToTemplateType } from './experiment_create/configuration/types';
import { TemplateConfigurationWithRouter } from './experiment_create/configuration/template_configuration';

enum Navigation {
  SRW = 'Search Relevance Workbench',
  Overview = 'Overview',
  Experiments = 'Experiments',
  ExperimentsSingleQueryComparison = 'Single Query Comparison',
  ExperimentsQuerySetComparison = 'Query Set Comparison',
  ExperimentsSearchEvaluation = 'Search Evaluation',
  ExperimentsHybridOptimizer = 'Hybrid Optimizer',
  QuerySets = 'Query Sets',
  SearchConfigurations = 'Search Configurations',
  Judgments = 'Judgments',
}

interface SearchRelevanceAppDeps {
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  chrome: CoreStart['chrome'];
  savedObjects: CoreStart['savedObjects'];
  dataSourceEnabled: boolean;
  dataSourceManagement: DataSourceManagementPluginSetup;
  setActionMenu: (menuMount: MountPoint | undefined) => void;
  application: CoreStart['application'];
  uiSettings: CoreStart['uiSettings'];
}

interface SearchRelevancePageProps extends SearchRelevanceAppDeps {
  history: any; // From withRouter
}

const SearchRelevancePage = ({
  history,
  application,
  notifications,
  http,
  navigation,
  chrome,
  savedObjects,
  dataSourceEnabled,
  dataSourceManagement,
  setActionMenu,
}: SearchRelevancePageProps) => {
  const location = useLocation();
  const { http: osDashboardsHttp } = useOpenSearchDashboards().services;

  const getNavGroupEnabled = chrome.navGroup.getNavGroupEnabled();
  const parentBreadCrumbs = getNavGroupEnabled
    ? [{ text: COMPARE_SEARCH_RESULTS_TITLE, href: '#' }]
    : [{ text: PLUGIN_NAME, href: '#' }];

  const sideNavItems = [
    {
      name: Navigation.SRW,
      id: Navigation.SRW,
      renderItem: () => {
        return (
          <>
            <EuiTitle size="xs">
              <h3>{Navigation.SRW}</h3>
            </EuiTitle>
            <EuiSpacer />
          </>
        );
      },
      items: [
        {
          name: Navigation.Experiments,
          id: Navigation.Experiments,
          onClick: () => {
            history.push(Routes.Home);
          },
          isSelected:
            location.pathname === Routes.Home ||
            location.pathname.startsWith(Routes.ExperimentViewPrefix),
          forceOpen: true,
          items: [
            {
              name: Navigation.ExperimentsSingleQueryComparison,
              id: Navigation.ExperimentsSingleQueryComparison,
              onClick: () => {
                history.push(Routes.ExperimentCreateSingleQueryComparison);
              },
              isSelected: location.pathname.startsWith(
                Routes.ExperimentCreateSingleQueryComparison
              ),
            },
            {
              name: Navigation.ExperimentsQuerySetComparison,
              id: Navigation.ExperimentsQuerySetComparison,
              onClick: () => {
                history.push(Routes.ExperimentCreateQuerySetComparison);
              },
              isSelected: location.pathname.startsWith(Routes.ExperimentCreateQuerySetComparison),
            },
            {
              name: Navigation.ExperimentsSearchEvaluation,
              id: Navigation.ExperimentsSearchEvaluation,
              onClick: () => {
                history.push(Routes.ExperimentCreateSearchEvaluation);
              },
              isSelected: location.pathname.startsWith(Routes.ExperimentCreateSearchEvaluation),
            },
            {
              name: Navigation.ExperimentsHybridOptimizer,
              id: Navigation.ExperimentsHybridOptimizer,
              onClick: () => {
                history.push(Routes.ExperimentCreateHybridOptimizer);
              },
              isSelected: location.pathname.startsWith(Routes.ExperimentCreateHybridOptimizer),
            },
          ],
        },
        {
          name: Navigation.QuerySets,
          id: Navigation.QuerySets,
          onClick: () => {
            history.push(Routes.QuerySetListing);
          },
          isSelected: location.pathname.startsWith(Routes.QuerySetListing),
        },
        {
          name: Navigation.SearchConfigurations,
          id: Navigation.SearchConfigurations,
          onClick: () => {
            history.push(Routes.SearchConfigurationListing);
          },
          isSelected: location.pathname.startsWith(Routes.SearchConfigurationListing),
        },
        {
          name: Navigation.Judgments,
          id: Navigation.Judgments,
          onClick: () => {
            history.push(Routes.JudgmentListing);
          },
          isSelected: location.pathname.startsWith(Routes.JudgmentListing),
        },
      ],
    },
  ];

  return (
    <EuiPage restrictWidth={'100%'}>
      <EuiPageSideBar style={{ minWidth: 200 }}>
        <EuiSideNav style={{ width: 200 }} items={sideNavItems} />
      </EuiPageSideBar>
      <EuiPageBody>
        <Switch>
          <Route
            path={Routes.Home}
            exact
            render={() => {
              return <ExperimentListingWithRoute http={http} />;
            }}
          />
          <Route
            path={Routes.QuerySetListing}
            exact
            render={() => {
              return <QuerySetListingWithRoute http={http} />;
            }}
          />
          <Route
            path={Routes.SearchConfigurationListing}
            exact
            render={() => {
              return <SearchConfigurationListingWithRoute http={http} />;
            }}
          />
          <Route
            path={Routes.JudgmentListing}
            exact
            render={() => {
              return <JudgmentListingWithRoute http={http} />;
            }}
          />
          <Route
            path={Routes.ExperimentView}
            exact
            render={(props) => {
              const { entityId } = props.match.params;
              return (
                <ExperimentViewWithRouter http={http} notifications={notifications} id={entityId} />
              );
            }}
          />
          <Route
            path={Routes.QuerySetView}
            exact
            render={(props) => {
              const { entityId } = props.match.params;
              return <QuerySetView http={http} id={entityId} />;
            }}
          />
          <Route
            path={Routes.SearchConfigurationView}
            exact
            render={(props) => {
              const { entityId } = props.match.params;
              return <SearchConfigurationView http={http} id={entityId} />;
            }}
          />
          <Route
            path={Routes.JudgmentView}
            exact
            render={(props) => {
              const { entityId } = props.match.params;
              return <JudgmentView http={http} id={entityId} />;
            }}
          />
          <Route
            path={Routes.ExperimentCreateTemplate}
            exact
            render={(props) => {
              const templateId = routeToTemplateType(props.match.params.templateId);
              if (templateId === TemplateType.SingleQueryComparison) {
                return (
                  <QueryCompareHome
                    application={application}
                    parentBreadCrumbs={parentBreadCrumbs}
                    notifications={notifications}
                    http={http}
                    navigation={navigation}
                    setBreadcrumbs={chrome.setBreadcrumbs}
                    chrome={chrome}
                    savedObjects={savedObjects}
                    dataSourceEnabled={dataSourceEnabled}
                    dataSourceManagement={dataSourceManagement}
                    setActionMenu={setActionMenu}
                    setToast={(title: string, color = 'success', text?: React.ReactNode) => {
                      if (color === 'success') {
                        notifications.toasts.addSuccess({ title, text });
                      } else if (color === 'warning') {
                        notifications.toasts.addWarning({ title, text });
                      } else if (color === 'danger') {
                        notifications.toasts.addDanger({ title, text });
                      } else {
                        notifications.toasts.add({ title, text });
                      }
                    }}
                  />
                );
              } else {
                return (
                  <TemplateConfigurationWithRouter
                    templateType={templateId}
                    onBack={() => {
                      history.goBack();
                    }}
                    onClose={() => {}}
                  />
                );
              }
            }}
          />
          <Route
            path={Routes.QuerySetCreate}
            exact
            render={() => {
              return <QuerySetCreateWithRouter http={http} notifications={notifications} />;
            }}
          />
          <Route
            path={Routes.SearchConfigurationCreate}
            exact
            render={() => {
              return (
                <SearchConfigurationCreateWithRouter http={http} notifications={notifications} />
              );
            }}
          />
          <Route
            path={Routes.JudgmentCreate}
            exact
            render={() => {
              return (
                <JudgmentCreateWithRouter
                  http={http}
                  notifications={notifications}
                  history={history}
                />
              );
            }}
          />
        </Switch>
      </EuiPageBody>
    </EuiPage>
  );
};

const SearchRelevancePageWithRouter = withRouter(SearchRelevancePage);

export const SearchRelevanceApp = ({
  notifications,
  http,
  navigation,
  chrome,
  savedObjects,
  dataSourceEnabled,
  setActionMenu,
  dataSourceManagement,
  application,
  uiSettings,
}: SearchRelevanceAppDeps) => {
  // Move all useState declarations to the top
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastRightSide, setToastRightSide] = useState<boolean>(true);

  const getNavGroupEnabled = chrome.navGroup.getNavGroupEnabled();

  const parentBreadCrumbs = getNavGroupEnabled
    ? [{ text: COMPARE_SEARCH_RESULTS_TITLE, href: '#' }]
    : [{ text: PLUGIN_NAME, href: '#' }];

  const setToast = (title: string, color = 'success', text?: ReactChild, side?: string) => {
    if (!text) text = '';
    setToastRightSide(!side ? true : false);
    setToasts([...toasts, { id: new Date().toISOString(), title, text, color } as Toast]);
  };

  // UI Experience are controlled by ui settings
  const isNewExperienceEnabled = Boolean(
    uiSettings?.get(SEARCH_RELEVANCE_EXPERIMENTAL_WORKBENCH_UI_EXPERIENCE_ENABLED)
  );

  const renderNewExperience = () => (
    <HashRouter>
      <I18nProvider>
        <SearchRelevanceContextProvider>
          <SearchRelevancePageWithRouter
            application={application}
            parentBreadCrumbs={parentBreadCrumbs}
            notifications={notifications}
            http={http}
            navigation={navigation}
            chrome={chrome}
            savedObjects={savedObjects}
            dataSourceEnabled={dataSourceEnabled}
            dataSourceManagement={dataSourceManagement}
            setActionMenu={setActionMenu}
          />
        </SearchRelevanceContextProvider>
      </I18nProvider>
    </HashRouter>
  );

  const renderOldExperience = () => (
    <HashRouter>
      <I18nProvider>
        <SearchRelevanceContextProvider>
          <>
            <EuiGlobalToastList
              toasts={toasts}
              dismissToast={(removedToast) => {
                setToasts(toasts.filter((toast) => toast.id !== removedToast.id));
              }}
              side={toastRightSide ? 'right' : 'left'}
              toastLifeTimeMs={6000}
            />
            <Switch>
              <Route
                path={['/']}
                render={(props) => {
                  return (
                    <QueryCompareHome
                      application={application}
                      parentBreadCrumbs={parentBreadCrumbs}
                      notifications={notifications}
                      http={http}
                      navigation={navigation}
                      setBreadcrumbs={chrome.setBreadcrumbs}
                      setToast={setToast}
                      chrome={chrome}
                      savedObjects={savedObjects}
                      dataSourceEnabled={dataSourceEnabled}
                      dataSourceManagement={dataSourceManagement}
                      setActionMenu={setActionMenu}
                    />
                  );
                }}
              />
            </Switch>
          </>
        </SearchRelevanceContextProvider>
      </I18nProvider>
    </HashRouter>
  );

  return isNewExperienceEnabled ? renderNewExperience() : renderOldExperience();
};
