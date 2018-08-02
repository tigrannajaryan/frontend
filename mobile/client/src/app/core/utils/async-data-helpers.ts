import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';

import { AppModule } from '~/app.module';
import { ApiResponse } from '~/core/api/base.models';

enum RefresherState {
  refreshing = 'refreshing'
}

interface RefresherLike {
  complete: Function;
  state: string;
}

/**
 * An object that has a loading indicator and optional refresher
 */
interface LoadingComponent {
  isLoading: boolean;
  refresher?: RefresherLike;
}

/**
 * An async data source, either a Promise or Observable
 */
type AsyncDataSource<T> = Promise<T> | Observable<T>;

/**
 * Takes an AsyncDataSource and converts to a Promise.
 */
function dataSourceToPromise<T>(dataSource: AsyncDataSource<T>): Promise<T> {
  if (dataSource instanceof Observable) {
    dataSource = dataSource.toPromise();
  }
  return dataSource;
}

/**
 * Perform async data loading and indicate the loading process in the `isLoading`
 * property of given LoadingComponent.
 * If the component has a `refresher` property then we will also call complete()
 * of refresher at the end (which is the expected behavior for Ionic Refresher component).
 * Note: complete() is only called if refresher.state === 'refreshing' in the beginning.
 * @param comp on which to indicate the loading, must have public isLoading field
 * @param dataSource the source of the data
 */
export async function loading<T>(
  comp: LoadingComponent, dataSource: AsyncDataSource<T>): Promise<T> {

  const isRefresherActive = comp.refresher && comp.refresher.state === RefresherState.refreshing;
  try {
    comp.isLoading = true;
    return await dataSourceToPromise(dataSource);
  } finally {
    comp.isLoading = false;
    if (comp.refresher && isRefresherActive) {
      comp.refresher.complete();
    }
  }
}

/**
 * Perform async data loading and cache the results in persistent storage. The result
 * is cached under the specified cacheKey which must be unique globally accross the entire app.
 *
 * If loading succeeds the result is saved in the cache. The return value will have 'response' field
 * of ApiResponse populated and 'errors' will be undefined.
 *
 * If loading fails with an error returns previously cached successful response (if any) in the
 * 'response' field of ApiResponse and the 'errors' field will contain the current errors.
 *
 * @param cacheKey a globally unique cache key string
 * @param dataSource any async data source that returns an ApiResponse<T>
 */
export async function cached<T>(
  cacheKey: string, dataSource: AsyncDataSource<ApiResponse<T>>): Promise<ApiResponse<T>> {

  const storage = AppModule.injector.get(Storage);
  cacheKey = `cached_data_${cacheKey}`;

  const result = await dataSourceToPromise(dataSource);
  if (result.errors) {
    // Data loading failed. Return previously cached successful response and current errors.
    return {
      response: await storage.get(cacheKey),
      errors: result.errors
    };
  }

  // The call was successfull, save the response in the cache
  storage.set(cacheKey, result.response);
  return result;
}
