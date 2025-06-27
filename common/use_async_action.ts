import { useState, useCallback } from 'react';

interface AsyncActionOptions {
  /** A user-friendly message to display on generic errors if no specific message is found. */
  genericErrorMessage?: string;
  /** A mapping of specific error messages from the backend to more user-friendly messages. */
  specificErrorMap?: { [key: string]: string };
}

interface AsyncActionHook {
  isLoading: boolean;
  error: string | null;
  execute: <T>(
    action: () => Promise<T>,
    successCallback?: (data: T) => void,
    errorCallback?: (err: any) => void
  ) => Promise<T | undefined>;
  clearError: () => void;
}

/**
 * A custom React hook to manage loading and error states for asynchronous operations.
 *
 * @param options - Configuration options for error handling.
 * @returns An object containing isLoading, error, and an execute function.
 */
export const useAsyncAction = (options?: AsyncActionOptions): AsyncActionHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(
    async <T>(
      action: () => Promise<T>,
      successCallback?: (data: T) => void,
      errorCallback?: (err: any) => void
    ): Promise<T | undefined> => {
      setIsLoading(true);
      clearError(); // Clear error before new execution
      try {
        const result = await action();
        successCallback?.(result);
        return result;
      } catch (err: any) {
        console.error('Async action failed:', err);

        let errorMessage = options?.genericErrorMessage || 'An unexpected error occurred.';

        // Check for specific backend messages
        if (options?.specificErrorMap) {
          if (err.body && err.body.message && options.specificErrorMap[err.body.message]) {
            errorMessage = options.specificErrorMap[err.body.message];
          } else if (err.message && options.specificErrorMap[err.message]) {
            errorMessage = options.specificErrorMap[err.message];
          }
        }

        // Fallback to more generic error message if not handled by map
        if (err.body && err.body.message) {
          errorMessage = err.body.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        errorCallback?.(err); // Call the provided error callback
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [options?.genericErrorMessage, options?.specificErrorMap, clearError]
  );

  return { isLoading, error, execute, clearError };
};
