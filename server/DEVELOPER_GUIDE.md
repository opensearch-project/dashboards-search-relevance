## Developer Guide

This developer guide explains how to add new APIs to the middleware layer.


To add search-relevance related operations, directory structure should look like this:

```md
.
├── dashboards-search-relevance
│   └── common
│       └── index.ts
│   └── public
│       └── services.ts
│   └── server
│       └── routes
│           └── search_relevance_route_service.ts

```
#### Step1 - add common index
define your backend APIs and its node APIs as common index under `common/index.ts`
- [backend search relevance APIs](https://github.com/opensearch-project/dashboards-search-relevance/blob/evaluation_lab/common/index.ts#L12)
```
/**
 * BACKEND SEARCH RELEVANCE APIs
 */
export const SEARCH_RELEVANCE_QUERY_SET_API = `${SEARCH_RELEVANCE_BASE_API}/queryset`;
```
- [node APIs](https://github.com/opensearch-project/dashboards-search-relevance/blob/evaluation_lab/common/index.ts#L23)
```
/**
 * Node APIs
 */
export const BASE_QUERYSET_NODE_API_PATH = `${BASE_NODE_API_PATH}/queryset`;
```


#### Step2 - client-side API
add public-facing API routing under `public/service.ts`. When a user create a queryset, the application makes a POST request to ../api/relevancy/queryset path
```
export const postQuerySet = async (id: string, http: any) => {
  try {
    return await http.post(`..${BASE_QUERYSET_NODE_API_PATH}`, {
      body: JSON.stringify({
        querySetId: id,
      }),
    });
  } catch (e) {
    return e;
  }
};
```


#### Step3 - server-side API
add router `server/routes/search_relevance_route_service.ts` to route your node APIs to the functions. It's recommended to add data_source_id enabled router as well. 
```
  router.post(
    {
      path: BASE_QUERYSET_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
      options: {
        body: {
          accepts: 'application/json',
        },
      },
    },
    searchRelevanceRoutesService.createQuerySet
  );
```
add function definition under the same path `server/routes/search_relevance_route_service.ts` 
```
createQuerySet = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const body = req.body;
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const querysetResponse = await callWithRequest('searchRelevance.createQuerySet', {
        body,
      });

      return res.ok({
        body: {
          ok: true,
          resp: querysetResponse,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };
```

add server-side API routing under `server/clusters/search_relevance_plugin.ts` to make calls to backend APIs.
```
searchRelevance.createQuerySet = ca({
    url: {
      fmt: `${SEARCH_RELEVANCE_QUERY_SET_API}`,
    },
    method: 'POST',
  });
```

### Simple page testing
This page testing is not recommended after we have a page/workflow.
jest tests should be added components by components, this is a quick example for connector tests, since we don't have any workflows/pages ready yet.


To verify your api connection, your directory should look like this:

```md
.
├── dashboards-search-relevance
│   └── public
│       └── components
│           └── api
│               └── search_relevance_testing_page.tsx
│           └── app.tsx

```
#### step1 - change your API calls
The original testing page `search_relevance_testing_page.tsx` is pointing to postQuerySet function. you can replace with your new function.
```
const result = await postQuerySet(querySetId, http);
```

#### step2 - change your application landing page
You can change your landing page to point to your testing page under `app.tsx`.
Currently, the application is pointing to ExperimentPage if user opted in for the new version or QueryCompareHome.

By replacing ~~`<ExperimentPage application={application} chrome={chrome} />`~~
with `<QuerySetTester http={http} />`

- spin up your backend cluster, for example for search-relevance plugin, run `./gradlew run`
- start your frontend server, make sure your frontend plugins under OpenSearch-Dashboard like `OpenSearch-Dashboard/plugins/dashboard-search-relevance`, then under `OpenSearch-Dashboard` run `yarn start`
- now, you able to open a page `http://localhost:5603/{uuid}`
- you can now test your api and your backend api response should be returned and rendered after click.
- more detailed can be found from this [issue](https://github.com/opensearch-project/dashboards-search-relevance/pull/490)





