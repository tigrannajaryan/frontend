import { FormGroup, Validators } from '@angular/forms';
import { Refresher } from 'ionic-angular';
import { Observable } from 'rxjs';

import { ApiResponse } from '~/core/api/base.models';
import { ApiError, ApiFieldError } from '~/core/api/errors.models';
import { LOADING_DELAY } from '~/core/api/request.models';

import { ApiDataStore } from '~/core/utils/api-data-store';

export type Request = Observable<ApiResponse<any>>;
export type Extension = (...args: any[]) => (request: Request) => Request;

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
export function composeRequest(...extensions): Promise<any> {
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
  // We emit request only once by calling toPromise:
  return request.toPromise();
}

/**
 * Cache solution based on ApiDataStore.
 */
export const cache = (cacheKey: string, refreshCache = false) => (request: Request): Request => {
  const store: ApiDataStore<Request> = new ApiDataStore(cacheKey, () => request);
  return Observable.from(store.get(refreshCache));
};

/**
 * Manual cache patching with request response.
 * E.g:
 *   - GET profile is cached,
 *   - update the cache on PATCH profile
 */
export const updateCacheWithResponse = (cacheKey: string) => (request: Request): Request => {
  const store: ApiDataStore<Request> = new ApiDataStore(cacheKey, () => request);
  return request.map(response => {
    if (response) {
      store.set(response.response);
    }
    return response;
  });
};

/**
 * Delayed loading extension.
 */
export const loading = (setLoading: (isLoading: boolean) => any) => (request: Request): Request => {
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
export const withRefresher = (refresher: Refresher) => (request: Request): Request =>
  request.map(response => {
    if (refresher && refresher.state === 'refreshing') {
      refresher.complete();
    }
    return response;
  });
