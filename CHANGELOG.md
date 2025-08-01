# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features
* Use Dashboards to visualize results of Evaluation and Hybrid Experiments ([#570](https://github.com/opensearch-project/dashboards-search-relevance/pull/570))
* Enable AutoPopulated Fields in SearchRelevance Query Compare Plugin Page ([#577](https://github.com/opensearch-project/dashboards-search-relevance/pull/577))
* Add polling mechanism to experiment_listing and judgment_listing view ([#594](https://github.com/opensearch-project/dashboards-search-relevance/pull/594))

### Enhancements
* Fetch models from ml-commons and add validation ([#568](https://github.com/opensearch-project/dashboards-search-relevance/pull/568))
* Show names instead of ids for experiment creation pages ([#567](https://github.com/opensearch-project/dashboards-search-relevance/pull/567))
* Retrieve experiment results using the experimentId field ([#574](https://github.com/opensearch-project/dashboards-search-relevance/pull/574))
* Add tooltips for metrics ([#573](https://github.com/opensearch-project/dashboards-search-relevance/pull/573))
* Remove ids from experiment table and link type instead ([#572](https://github.com/opensearch-project/dashboards-search-relevance/pull/572))
* Publish metrics stats without authorization to make it accessible to monitoring systems ([#593](https://github.com/opensearch-project/dashboards-search-relevance/pull/593))

### Bug Fixes
* Improve messaging when backend plugin is disabled ([#578](https://github.com/opensearch-project/dashboards-search-relevance/pull/578))
* Do not show Pipeline error if there are no pipelines yet ([#582](https://github.com/opensearch-project/dashboards-search-relevance/pull/582))
* Avoid validation results overflow in the creation of Search Configuration ([#585](https://github.com/opensearch-project/dashboards-search-relevance/pull/585))
* Fix wrong unique number of results in Venn diagram ([#586](https://github.com/opensearch-project/dashboards-search-relevance/pull/586))
* Bug fixes for error messages not render correctly for toast notifications ([#612](https://github.com/opensearch-project/dashboards-search-relevance/pull/612))

### Infrastructure

### Documentation

### Maintenance
* Adding @fen-qin and @epugh as maintainers ([#569](https://github.com/opensearch-project/dashboards-search-relevance/pull/569))
* Update Maintainers for dashboards-search-relevance repository ([#576](https://github.com/opensearch-project/dashboards-search-relevance/pull/576))
* Add issue template and codecov to add test coverage reports ([#601](https://github.com/opensearch-project/dashboards-search-relevance/pull/601))

### Refactoring
* Code refactors + Unit tests for query_set_create ([#580](https://github.com/opensearch-project/dashboards-search-relevance/pull/580))
* Code refactors + Unit tests for search_configuration_create ([#587](https://github.com/opensearch-project/dashboards-search-relevance/pull/587))
* Code refactors + Unit tests for judgment_create ([#588](https://github.com/opensearch-project/dashboards-search-relevance/pull/588))
* Code Refactor + Unit Tests for query_set_listing and query_set_view ([#595](https://github.com/opensearch-project/dashboards-search-relevance/pull/595))
* Code Refactor + Unit Tests for search_configuration and judgment ([#602](https://github.com/opensearch-project/dashboards-search-relevance/pull/602))
* Code Refactor + Unit Tests for experiment ([#613](https://github.com/opensearch-project/dashboards-search-relevance/pull/613))
