## Version 3.8.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 3.8.0

### Features

* Add `/search-relevance` slash command with welcome message for AI-assisted search relevance tuning ([#843](https://github.com/opensearch-project/dashboards-search-relevance/pull/843))
* Add `chatCommandEnabled` feature flag to gate the `/search-relevance` slash command behind dynamic config ([#890](https://github.com/opensearch-project/dashboards-search-relevance/pull/890))
* Add experiment name and description support for create, display, and edit workflows ([#823](https://github.com/opensearch-project/dashboards-search-relevance/pull/823))
* Add description support for Search Configurations in create, detail, and listing views ([#854](https://github.com/opensearch-project/dashboards-search-relevance/pull/854))
* Show failed documents with status indicators in the Judgment ratings view ([#899](https://github.com/opensearch-project/dashboards-search-relevance/pull/899))

### Enhancements

* Load experiment detail resources in parallel to reduce page latency ([#883](https://github.com/opensearch-project/dashboards-search-relevance/pull/883))
* Surface backend error message and HTTP status code instead of generic unknown error in list and detail views ([#874](https://github.com/opensearch-project/dashboards-search-relevance/pull/874))
* Surface backend error messages in detail views ([#895](https://github.com/opensearch-project/dashboards-search-relevance/pull/895))
* Render error state on Experiment Details page when experiment fails to load ([#901](https://github.com/opensearch-project/dashboards-search-relevance/pull/901))
* Onboard code diff analyzer/reviewer and issue dedupe workflows ([#887](https://github.com/opensearch-project/dashboards-search-relevance/pull/887))
* Onboard new backport-pr reusable GitHub workflow ([#884](https://github.com/opensearch-project/dashboards-search-relevance/pull/884))

### Bug Fixes

* Fix failed queries being incorrectly treated as zero search results in the Search Evaluation view ([#849](https://github.com/opensearch-project/dashboards-search-relevance/pull/849))
* Fix metrics retention trimming to evict expired entries from all interval-keyed maps ([#880](https://github.com/opensearch-project/dashboards-search-relevance/pull/880))
* Fix infinite re-render loop in `useDataSourceUrlSync` when local cluster is selected ([#859](https://github.com/opensearch-project/dashboards-search-relevance/pull/859))
* Accept numeric `tokenLimit` in judgment route validation ([#891](https://github.com/opensearch-project/dashboards-search-relevance/pull/891))

### Infrastructure

* Add unit tests for metrics route handler ([#903](https://github.com/opensearch-project/dashboards-search-relevance/pull/903))
* Migrate Jest test suite to Jest 30 and jsdom 26 ([#909](https://github.com/opensearch-project/dashboards-search-relevance/pull/909))

### Refactoring

* Refactor GetSearchResults to single-query endpoint ([#868](https://github.com/opensearch-project/dashboards-search-relevance/pull/868))
* Remove debug console logging from production UI code ([#878](https://github.com/opensearch-project/dashboards-search-relevance/pull/878))
* Remove unused resource management home components ([#853](https://github.com/opensearch-project/dashboards-search-relevance/pull/853))
