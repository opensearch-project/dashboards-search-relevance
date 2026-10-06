export const DISABLED_BACKEND_PLUGIN_MESSAGE = 'Search Relevance Workbench is disabled';

export const extractUserMessageFromError = (err: any): string | null => {
  const body = err?.body;
  if (!body) {
    return null;
  }
  if (body.message === DISABLED_BACKEND_PLUGIN_MESSAGE) {
    return 'Search Relevance Workbench is disabled. Please activate the opensearch-search-relevance plugin.';
  }
  // Surface the backend-provided reason (e.g. a 403 security_exception) instead of a
  // generic fallback, prefixing the HTTP status code when one is available.
  if (typeof body.message === 'string' && body.message) {
    const statusCode = body.statusCode ?? err?.response?.status;
    return statusCode ? `${statusCode}: ${body.message}` : body.message;
  }
  return null;
};
