/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { I18nProvider } from '@osd/i18n/react';
import React from 'react';
import { HashRouter, Route, Switch, withRouter, useLocation } from 'react-router-dom';
import { SearchRelevanceContextProvider } from '../contexts';
import { EuiPageSideBar, EuiSideNav, EuiTitle, EuiSpacer, EuiPage, EuiPageBody } from '@elastic/eui';
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

enum Navigation {
  SRW = 'Search Relevance Workbench',
  Overview = 'Overview',
  Experiments = 'Experiments',
  QuerySets = 'Query Sets',
  SearchConfigurations = 'Search Configurations',
  Judgments = 'Judgments',
}

const SearchRelevancePage = ({history}) => {
  const location = useLocation();
  const { http, notifications } = useOpenSearchDashboards().services;

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
          },
          isSelected: location.pathname === '/',
        },
        {
          name: Navigation.Experiments,
          id: Navigation.Experiments,
          onClick: () => {
            history.push("/experiment");
          },
          isSelected: location.pathname.startsWith('/experiment'),
        },
        {
          name: Navigation.QuerySets,
          id: Navigation.QuerySets,
          onClick: () => {
            history.push("/querySet");
          },
          isSelected: location.pathname.startsWith('/querySet'),
        },
        {
          name: Navigation.SearchConfigurations,
          id: Navigation.SearchConfigurations,
          onClick: () => {
            history.push("/searchConfiguration");
          },
          isSelected: location.pathname.startsWith('/searchConfiguration'),
        },
        {
          name: Navigation.Judgments,
          id: Navigation.Judgments,
          onClick: () => {
            history.push("/judgment");
          },
          isSelected: location.pathname.startsWith('/judgment'),
        },
      ],
    },
  ]
  
  return (
    <EuiPage restrictWidth={'100%'}>
      <EuiPageSideBar style={{ minWidth: 200 }}>          
        <EuiSideNav style={{ width: 200 }} items={sideNavItems} />
      </EuiPageSideBar>
      <EuiPageBody>
        <Switch>
          <Route path="/" exact render={() => {
            return <GetStartedAccordion isOpen={true} />;
          }} />
          <Route path="/experiment" exact render={() => {
            return <ExperimentListingWithRoute http={http} />;
          }} />
          <Route path="/querySet" exact render={() => {
            return <QuerySetListingWithRoute http={http} />;
          }} />
          <Route path="/searchConfiguration" exact render={() => {
            return <SearchConfigurationListingWithRoute http={http} />;
          }} />
          <Route path="/judgment" exact render={() => {
            return <JudgmentListingWithRoute http={http} />;
          }} />
          <Route path="/experiment/view/:entityId" exact render={(props) => {
            const { entityId } = props.match.params;
            return <ExperimentViewWithRouter http={http} id={entityId} />;
          }} />
          <Route path="/querySet/view/:entityId" exact render={(props) => {
            const { entityId } = props.match.params;
            return <QuerySetView http={http} id={entityId} />;
          }} />
          <Route path="/searchConfiguration/view/:entityId" exact render={(props) => {
            const { entityId } = props.match.params;
            return <SearchConfigurationView http={http} id={entityId} />;
          }} />
          <Route path="/judgment/view/:entityId" exact render={(props) => {
            const { entityId } = props.match.params;
            return <JudgmentView http={http} id={entityId} />;
          }} />
          <Route path="/experiment/create" exact render={() => {
            return <TemplateCards onClose={() => {}} />;
          }} />
          <Route path="/querySet/create" exact render={() => {
            return <QuerySetCreateWithRouter http={http} notifications={notifications} />;
          }} />
          <Route path="/searchConfiguration/create" exact render={() => {
            return <SearchConfigurationCreateWithRouter http={http} notifications={notifications} />;
          }} />
          <Route path="/judgment/create" exact render={() => {
            return <JudgmentCreateWithRouter http={http} notifications={notifications} history={history}/>;
          }} />
        </Switch>
      </EuiPageBody>
    </EuiPage>
  );
};

const SearchRelevancePageWithRouter = withRouter(SearchRelevancePage);

export const SearchRelevanceApp = () => {
  return (
    <HashRouter>
      <I18nProvider>
        <SearchRelevanceContextProvider>
          <SearchRelevancePageWithRouter />
        </SearchRelevanceContextProvider>
      </I18nProvider>
    </HashRouter>
  );
};
