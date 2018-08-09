import { Refresher } from 'ionic-angular';
import { Observable } from 'rxjs';

import { ApiResponse } from '~/core/api/base.models';
import { LOADING_DELAY } from '~/core/api/request.models';

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
  let [ request ] = extensions.splice(-1);

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
  // Note: we use .first() call to deal with BehaviorSubject (https://github.com/Reactive-Extensions/RxJS/issues/1088).
  // We emit request only once by calling toPromise:
  return request.first().toPromise();
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
 * Complete refresing on request done extension.
 */
export const withRefresher = <T>(refresher: Refresher) => (request: Request<T>): Request<T> =>
  request.map(response => {
    if (refresher && refresher.state === 'refreshing') {
      refresher.complete();
    }
    return response;
  });
