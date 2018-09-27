import { Refresher } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { LOADING_DELAY } from '~/shared/api/request.models';
import { showAlert } from '~/core/utils/alert';

export type Request<T> = Observable<ApiResponse<T>>;
export type Extension<T> = (...args: any[]) => (request: Request<T>) => Request<T>;

/**
 * The function that helps to enhance requests.
 * It returns request promise and has extensions and a request as arguments:
 * ```
 *   composeRequest: (Extension, Extension, Request) => Promise<any>
 * ```
 * Usage example:
 * ```
 *   await composeRequest(
 *     loading(this),
 *     withRefresher(this.refresher),
 *     this.historyApi.getHistory()
 *   );
 * ```
 */
export function composeRequest<T>(...extensions): Promise<ApiResponse<T>> {
  // The last argument is a request itself:
  let [request] = extensions.splice(-1);

  // In case of using it with ApiDataStore.get or any other promise-based requests:
  if (request && request instanceof Promise) {
    request = Observable.from(request);
  }

  if (!request || !(request instanceof Observable)) {
    throw new Error('The last argument should be a request Observable.');
  }

  if (extensions.length === 0) {
    console.warn('You are using composeRequest without additional extensions. Consider just calling the request as is.');
  }

  // extension[1]( extension[0]( request ) ):
  for (const extension of extensions) {
    // Note: every extension use Observables inside in order to prevent it from emitting the request.
    request = extension(request);
  }

  // (!) Never subscribe in extensions because subscribe emits request.
  // We emit request only once by calling toPromise:
  return request.toPromise();
}

/**
 * Delayed loading extension.
 */
export const loading = <T>(setLoading: (isLoading: boolean) => any) => (request: Request<T>): Request<T> => {
  setLoading(false);

  // Show loader after LOADING_DELAY ms passed:
  const loadingTimeout = setTimeout(() => {
    setLoading(true);
  }, LOADING_DELAY);

  // Calling Observable.map works and looks very alike calling Promise.then:
  return request.map(response => {
    // Clear timeout to not change isLoading after request done:
    clearTimeout(loadingTimeout);
    setLoading(false);

    return response;
  });
};

/**
 * Complete refreshing on request done extension.
 */
export const withRefresher = <T>(refresher: Refresher) => (request: Request<T>): Request<T> =>
  request.map(response => {
    if (refresher && refresher.state === 'refreshing') {
      refresher.complete();
    }
    return response;
  });

/**
 * If the response is an ApiError that is not handled globally then show an alert
 * with the error message.
 */
export const alertError = <T>() => (request: Request<T>): Request<T> =>
  request.map(response => {
    if (response.error && !response.error.handleGlobally()) {
      showAlert('', response.error.getMessage());
    }
    return response;
  });
