export const DISABLED_BACKEND_PLUGIN_MESSAGE = 'Search Relevance Workbench is disabled';

export const extractUserMessageFromError = (err: any) => {
  if (err instanceof Error) {
    const errorWithBody = err as any;
    if (errorWithBody.body && errorWithBody.body.message === DISABLED_BACKEND_PLUGIN_MESSAGE) {
      return 'Search Relevance Workbench is disabled. Please activate the opensearch-search-relevance plugin.';
    }
  }
  return null;
};
