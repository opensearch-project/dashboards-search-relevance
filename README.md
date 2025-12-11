![OpenSearch Project](OpenSearch.svg)

# Search Relevance Tools
[![Build Search Relevance Plugin](https://github.com/opensearch-project/dashboards-search-relevance/actions/workflows/test-and-build.yml/badge.svg)](https://github.com/opensearch-project/dashboards-search-relevance/actions/workflows/test-and-build.yml)
[![Link Checker](https://github.com/opensearch-project/dashboards-search-relevance/actions/workflows/link-checker.yml/badge.svg?branch=main)](https://github.com/opensearch-project/dashboards-search-relevance/actions/workflows/link-checker.yml)
[![codecov](https://codecov.io/gh/opensearch-project/dashboards-search-relevance/branch/main/graph/badge.svg?token=PYQO2GW39S)](https://codecov.io/gh/opensearch-project/dashboards-search-relevance)


## Summary
In search applications, tuning relevance is a constant, iterative exercise to bring the right search results to your end users. The tooling in this repository aims to help the search relevance engineer and business user create the best search experience possible for application users without hiding internals from engineers who want to go deep into the details.

# Projects
Behind the scenes, the plugin uses the [Search Relevance OpenSearch plugin](https://github.com/opensearch-project/search-relevance) for resource management for each tool provided. For example, most use cases involve configuring and creating search configurations, query sets, and judgements. All of these resources are created, updated, deleted, and maintained by the Search Relevance plugin. When users are satisfied with the improvements to relevancy then they take the output and manually deploy the changes into their environment.

For tutorials on how to leverage these tools, see [here](https://docs.opensearch.org/latest/search-plugins/search-relevance/index/).

> [!IMPORTANT]  
> While shipping with OpenSearch, you must OPT IN to this feature.  To enable this go to *Dashboard Management* -> *advanced setting* -> *Search relevance* -> turn on the toggle -> don’t forget to save.
# Tools
## Query Comparison Tool
The Query Comparison tool allows users to enter a plain text search query, run it with two different Query DSLs and compare the results side by side.

## Search Configuration Comparison Tool
This tool lets you take a list of queries and compare them against two Search Configurations, and provides metrics that summarize the differences in results being returned by the two search configurations.   Users can then drill in to the individual queries to _eyeball_ the specific documents returned and how they have changed position.

## Search Evaluation Tool
Classic Information Retrieval is built around assessing search quality using Judgements, a rating of appropriateness between a query and a document returned.  This tool lets you evaluate a Search Configuration and returns metrics like Average Precision, MAP, and NDCG.  

## Hybrid Optimizer Tool
Hybrid queries blend lexical and vector search results together.  With the right Judgements, the Hybrid Optimizer will evaluate various ways of blending lexical and vector results together and provide an optimum balance.

# Security
See [SECURITY](SECURITY.md) for more information.

# Contributing
See [CONTRIBUTING](CONTRIBUTING.md) for more information.

# License

This project is licensed under the Apache-2.0 License.
