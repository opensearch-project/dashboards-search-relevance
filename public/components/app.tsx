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
} from '../../common';
import { SearchRelevanceContextProvider } from '../contexts';
import { Home as QueryCompareHome } from './query_compare/home';
import { useOpenSearchDashboards } from '../../../../src/plugins/opensearch_dashboards_react/public';
import { ExperimentListingWithRoute } from './experiment_listing';
import { ExperimentViewWithRouter } from './experiment_view/experiment_view';
import { TemplateCards } from './experiment_create/template_card/template_cards';
import { QuerySetListingWithRoute } from './query_set_listing';
import { SearchConfigurationListingWithRoute } from './search_config_listing';
import { JudgmentListingWithRoute } from './judgment_listing';
import QuerySetView from './query_set_view/query_set_view';
import SearchConfigurationView from './search_config_view/search_config_view';
import JudgmentView from './judgment_view/judgment_view';
import { QuerySetCreateWithRouter } from './query_set_create/query_set_create';
import { SearchConfigurationCreateWithRouter } from './search_config_create/search_config_create';
import { JudgmentCreateWithRouter } from './judgment_create/judgment_create';
import { GetStartedAccordion } from './resource_management_home/get_started_accordion';
import { TemplateType } from './experiment_create/configuration/types';

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

const SearchRelevancePage = ({ history }) => {
  const location = useLocation();
  const { http, notifications } = useOpenSearchDashboards().services;

  const routeToSelectedNavItem = (pathname: string) => {
    if (pathname === '/') {
      return Navigation.Overview;
    } else if (pathname.startsWith('/experiment')) {
      return Navigation.Experiments;
    } else if (pathname.startsWith('/querySet')) {
      return Navigation.QuerySets;
    } else if (pathname.startsWith('/searchConfiguration')) {
      return Navigation.SearchConfigurations;
    } else if (pathname.startsWith('/judgment')) {
      return Navigation.Judgments;
    }
  };

  const [selectedNavItem, setSelectedNavItem] = useState<Navigation | null>(
    routeToSelectedNavItem(location.pathname)
  );

  const extractSelectedTemplate = (selectedNavItem: Navigation) => {
    if (selectedNavItem === Navigation.ExperimentsSingleQueryComparison) {
      return TemplateType.SingleQueryComparison;
    }
    if (selectedNavItem === Navigation.ExperimentsQuerySetComparison) {
      return TemplateType.QuerySetComparison;
    }
    if (selectedNavItem === Navigation.ExperimentsSearchEvaluation) {
      return TemplateType.SearchEvaluation;
    }
    if (selectedNavItem === Navigation.ExperimentsHybridOptimizer) {
      return TemplateType.HybridSearchOptimizer;
    }
    return null;
  };

  const onCardClick = (templateId: TemplateType) => {
    if (templateId === TemplateType.SingleQueryComparison) {
      setSelectedNavItem(Navigation.ExperimentsSingleQueryComparison);
    }
    if (templateId === TemplateType.QuerySetComparison) {
      setSelectedNavItem(Navigation.ExperimentsQuerySetComparison);
    }
    if (templateId === TemplateType.SearchEvaluation) {
      setSelectedNavItem(Navigation.ExperimentsSearchEvaluation);
    }
    if (templateId === TemplateType.HybridSearchOptimizer) {
      setSelectedNavItem(Navigation.ExperimentsHybridOptimizer);
    }
  };

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
          name: Navigation.Overview,
          id: Navigation.Overview,
          onClick: () => {
            history.push('/');
            setSelectedNavItem(Navigation.Overview);
          },
          isSelected: selectedNavItem === Navigation.Overview,
        },
        {
          name: Navigation.Experiments,
          id: Navigation.Experiments,
          onClick: () => {
            history.push('/experiment');
            setSelectedNavItem(Navigation.Experiments);
          },
          isSelected: selectedNavItem === Navigation.Experiments,
          forceOpen: true,
          items: [
            {
              name: Navigation.ExperimentsSingleQueryComparison,
              id: Navigation.ExperimentsSingleQueryComparison,
              onClick: () => {
                history.push('/experiment/create');
                setSelectedNavItem(Navigation.ExperimentsSingleQueryComparison);
              },
              isSelected: selectedNavItem === Navigation.ExperimentsSingleQueryComparison,
            },
            {
              name: Navigation.ExperimentsQuerySetComparison,
              id: Navigation.ExperimentsQuerySetComparison,
              onClick: () => {
                history.push('/experiment/create');
                setSelectedNavItem(Navigation.ExperimentsQuerySetComparison);
              },
              isSelected: selectedNavItem === Navigation.ExperimentsQuerySetComparison,
            },
            {
              name: Navigation.ExperimentsSearchEvaluation,
              id: Navigation.ExperimentsSearchEvaluation,
              onClick: () => {
                history.push('/experiment/create');
                setSelectedNavItem(Navigation.ExperimentsSearchEvaluation);
              },
              isSelected: selectedNavItem === Navigation.ExperimentsSearchEvaluation,
            },
            {
              name: Navigation.ExperimentsHybridOptimizer,
              id: Navigation.ExperimentsHybridOptimizer,
              onClick: () => {
                history.push('/experiment/create');
                setSelectedNavItem(Navigation.ExperimentsHybridOptimizer);
              },
              isSelected: selectedNavItem === Navigation.ExperimentsHybridOptimizer,
            },
          ],
        },
        {
          name: Navigation.QuerySets,
          id: Navigation.QuerySets,
          onClick: () => {
            history.push('/querySet');
            setSelectedNavItem(Navigation.QuerySets);
          },
          isSelected: selectedNavItem === Navigation.QuerySets,
        },
        {
          name: Navigation.SearchConfigurations,
          id: Navigation.SearchConfigurations,
          onClick: () => {
            history.push('/searchConfiguration');
            setSelectedNavItem(Navigation.SearchConfigurations);
          },
          isSelected: selectedNavItem === Navigation.SearchConfigurations,
        },
        {
          name: Navigation.Judgments,
          id: Navigation.Judgments,
          onClick: () => {
            history.push('/judgment');
            setSelectedNavItem(Navigation.Judgments);
          },
          isSelected: selectedNavItem === Navigation.Judgments,
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
            path="/"
            exact
            render={() => {
              return <GetStartedAccordion isOpen={true} />;
            }}
          />
          <Route
            path="/experiment"
            exact
            render={() => {
              return <ExperimentListingWithRoute http={http} />;
            }}
          />
          <Route
            path="/querySet"
            exact
            render={() => {
              return <QuerySetListingWithRoute http={http} />;
            }}
          />
          <Route
            path="/searchConfiguration"
            exact
            render={() => {
              return <SearchConfigurationListingWithRoute http={http} />;
            }}
          />
          <Route
            path="/judgment"
            exact
            render={() => {
              return <JudgmentListingWithRoute http={http} />;
            }}
          />
          <Route
            path="/experiment/view/:entityId"
            exact
            render={(props) => {
              const { entityId } = props.match.params;
              return <ExperimentViewWithRouter http={http} id={entityId} />;
            }}
          />
          <Route
            path="/querySet/view/:entityId"
            exact
            render={(props) => {
              const { entityId } = props.match.params;
              return <QuerySetView http={http} id={entityId} />;
            }}
          />
          <Route
            path="/searchConfiguration/view/:entityId"
            exact
            render={(props) => {
              const { entityId } = props.match.params;
              return <SearchConfigurationView http={http} id={entityId} />;
            }}
          />
          <Route
            path="/judgment/view/:entityId"
            exact
            render={(props) => {
              const { entityId } = props.match.params;
              return <JudgmentView http={http} id={entityId} />;
            }}
          />
          <Route
            path="/experiment/create"
            exact
            render={() => {
              return (
                <TemplateCards
                  key={`selection-${selectedNavItem}`}
                  onClose={() => {}}
                  inputSelectedTemplate={extractSelectedTemplate(selectedNavItem)}
                  onCardClick={onCardClick}
                />
              );
            }}
          />
          <Route
            path="/querySet/create"
            exact
            render={() => {
              return <QuerySetCreateWithRouter http={http} notifications={notifications} />;
            }}
          />
          <Route
            path="/searchConfiguration/create"
            exact
            render={() => {
              return (
                <SearchConfigurationCreateWithRouter http={http} notifications={notifications} />
              );
            }}
          />
          <Route
            path="/judgment/create"
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
          <SearchRelevancePageWithRouter />
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
