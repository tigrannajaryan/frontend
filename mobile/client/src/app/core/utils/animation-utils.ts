/**
 * Indicate request failed for a short amount of time.
 */
export const animateFailed = <T>(setFailed: (isFailed: boolean) => any) => (request: Request<T>): Request<T> => {
  setFailed(false);

  return request.map(response => {
    if (response.errors) {
      setFailed(true);
      setTimeout(() => setFailed(false), 750);
    }

    return response;
  });
};

/**
 * Indicate request succeeded for a short amount of time.
 */
export const animateSucceeded = <T>(setSucceeded: (isSucceeded: boolean) => any) => (request: Request<T>): Request<T> => {
  setSucceeded(false);

  return request.map(response => {
    if (!response.errors) {
      setSucceeded(true);
      setTimeout(() => setSucceeded(false), 750);
    }

    return response;
  });
};
