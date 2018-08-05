import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';

import { LOADING_DELAY } from '~/core/api/request.models';
import { AppModule } from '~/app.module';

// Note 1: Observable.prototype.toPromise has been deprecated (RxJS 5.5+).
// Note 2: because of subscribe emits request, toPromise call emits request too. (!) We should never subscribe in extensions.
const toPromise = (observable: Observable<any>): Promise<any> =>
  new Promise((resolve, reject) => {
    const subscription =
      observable.subscribe(
        resolve,
        reject,
        () => { // on complete
          subscription.unsubscribe();
        }
      );
  });

/**
 * The function that helps to enhance requests.
 */
export function composeRequest(...extensions): Promise<any> {
  // The last argument is a request itself:
  let [ request ] = extensions.splice(-1);

  if (extensions.length === 0) {
    console.warn('You are using composeRequest without additional extensions. Consider just calling the request as is.');
  }

  // Similar to adding middlewares:
  // request --> extension_1 --> extension_2 --> response
  for (const extension of extensions) {
    // Note: every extension use Observables inside it in order to prevent it from emitting the request.
    request = extension(request);
  }

  // (!) We emit request only once by calling toPromise:
  return toPromise(request);
}

/**
 * Cache and restore from cache.
 */
export const cached = (cacheKey: string, options = { forced: false }) => request => {
  const storage = AppModule.injector.get(Storage);
  cacheKey = `cached_data_${cacheKey}`;

  // Converting storage promise to an Observable:
  const cachedDataObservable = Observable.from(
    options.forced ?
      Promise.resolve(undefined) : // using Promise.resolve for consistency
      storage.get(cacheKey).catch(() => undefined)
  );

  // Observable.prototype.switchMap is used to return cached Observable instead of original request Observable if needed.
  return cachedDataObservable.switchMap(cachedResponse => {

    // Restore from cache.
    // Check for undefined and null to pass when cachedResponse is false, 0 or empty string (*):
    if (cachedResponse !== undefined && cachedResponse !== null) {
      return Observable.of({ response: cachedResponse });
    }

    // Calling Observable.map is very like caling Promise.then:
    return request.map(response => {

      // Save in cache:
      if (response.response !== undefined && response.response !== null) { // same as in (*)
        storage.set(cacheKey, response.response); // optimistic
      }

      // Return original response:
      return response;
    });
  });
};

/**
 * Delayed loading solution.
 */
export const loading = component => request => {
  component.isLoading = false;

  // Show loader after LOADING_DELAY ms passed:
  const loadingTimeout = setTimeout(() => {
    component.isLoading = true;
  }, LOADING_DELAY);

  return request.map(response => {
    // Clear timeout to not change isLoading after request done:
    clearTimeout(loadingTimeout);
    component.isLoading = false;

    return response;
  });
};

/**
 * Completes refresing on request done.
 */
export const withRefresher = refresher => request =>
  request.map(response => {
    if (refresher && refresher.state === 'refreshing') {
      refresher.complete();
    }
    return response;
  });
