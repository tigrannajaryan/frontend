import { Storage } from '@ionic/storage';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { AppModule } from '~/app.module';
import { ApiResponse } from '~/core/api/base.models';

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
 * ApiDataStore is a simple local storage of API responses that we
 * can use on many Client App screens to easily support the following:
 *
 * - Centralized stored of a data that is used by many different screens
 *   (e.g. User Profile data)
 *
 * - Caching of the data and manual refreshing of cache.
 *   The data is persistently cached, so it survives application restarts.
 *
 * - Initiating preloading of the data from any other view to make views
 *   that use the data appear faster.
 *
 * - Supports direct setting of data in the local storage to support
 *   scenarios where the data can be modified by the user locally
 *   (e.g. User Profile editing).
 *
 * The source of the data is any function that returns an async ApiResponse<T>,
 * which is the typical signature of all our API services, so it can be used
 * with any API service.
 *
 * This class supports both pull and push models of operation: you can
 * pull and ask for data using get() function or you can observe the changes
 * in the data which is exposed as an Observable and will be pushed to you
 * when the changes happen.
 *
 * The typical usage pattern is to create a singleton that derives from ApiDataStore
 * and is Injectable in views which need to works with this data. For example let's
 * assume we have ClientProfileApi class which implements getProfile() function
 * which returns ClientProfileResponse data. We can declare ClientProfileDataStore like this
 *
 *   @Injectable()
 *   export class ClientProfileDataStore extends ApiDataStore<ClientProfileResponse> {
 *   constructor(profileApi: ClientProfileApi) {
 *     super('client-profile', profileApi.getProfile);
 *   }
 *
 * then we can use it from ClientProfileView TS like this:
 *
 *   constructor(private dataStore: ClientProfileDataStore) {}
 *   ionViewWillEnter(): void {
 *     this.profileData = this.dataStore.asObservable();
 *     this.dataStore.get();
 *   }
 *
 * and in the HTML do this:
 *
 *   <div *ngIf="(profileData | async)?.response as profile">{{ profile.first_name }}</div>
 *
 * Alternatively we can use subscribe() function to work with data in the code, e.g.:
 *
 *   ionViewWillEnter(): void {
 *     this.subscription = dataStore.subscribe(data => { this.profile = data; });
 *   }
 *
 * and in the HTML do this:
 *
 *   <div *ngIf="profile>{{ profile.first_name }}</div>
 *
 * You can also set the data directly if it is modified in a view, e.g.
 *   submit(): void {
 *      const profileData = { first_name: ... };
 *      this.dataStore.set(profileData);
 *   }
 *
 * To perform preloading of data from any other view just inject ClientProfileDataStore
 * into that view and call the get() method, e.g.:
 *
 *   constructor(private dataStore: ClientProfileDataStore) {}
 *   ionViewDidEnter(): void {
 *     this.dataStore.get(true);
 *   }
 *
 * Note: how we use ionViewDidEnter() instead of ionViewWillEnter to avoid delaying
 * the loading of this view due to processing time spent on preloading operation.
 *
 */
export class ApiDataStore<T> {

  // Last value of API response
  private data = new BehaviorSubject<ApiResponse<T>>(undefined);

  // Currently ongoing get() operation
  private promise: Promise<ApiResponse<T>>;

  private storageKey: string;

  /**
   * Creates a ApiDataStore instance that is linked to the original data source.
   *
   * The cached data is associated with a key that must be unique across the app.
   * You can use a descriptive key name for easier debugging or use any uniquely
   * generated id.
   *
   * @param cacheKey a globally unique cache key string
   * @param apiEndpoint a function that returns any async data source that returns an ApiResponse<T>
   */
  constructor(cacheKey: string, private apiEndpoint: () => AsyncDataSource<ApiResponse<T>>) {
    this.storageKey = `cached_data_${cacheKey}`;
    this.promise = Promise.resolve(undefined);
  }

  /**
   * Get data. Loads it from the original data source if needed.
   *
   * The data is cached in a persistent storage. The result is cached under the specified
   * cacheKey which must be unique globally accross the entire app.
   *
   * If loading succeeds the result is saved in the cache. The return value will have 'response' field
   * of ApiResponse populated and 'errors' will be undefined.
   *
   * If loading fails with an error returns previously cached successful response (if any) in the
   * 'response' field of ApiResponse and the 'errors' field will contain the current errors.
   *
   * We ensure that get() operations are not executed concurrently. If get() is
   * called while the previous async get() request is not yet completed the new
   * call is queued and will be executed after the previous get() is completed.
   *
   * @param refreshCache if true will refresh the data from original data source otherwise
   *                     will return cached value if available.
   */
  get(refreshCache = false): Promise<ApiResponse<T>> {
    // Chain executions. We create a queue of promises to avoid concurrent get() or set() operations.
    // This prevents concurrent calls to API or concurrent calls to get() or set() functions.
    // Why we need it? It is needed for preloader scenarios.
    // How is preloading usually implemented? The first view calls get(true) to begin preloading data.
    // The API call starts executing. Now imagine I quickly click Next button and go to second view
    // which expects its data to be usually preloaded but cannot rely on it, so to be safe my second
    // view will call get(false), because it does not want to refresh the data but it still wants to
    // make sure the data exists. So this pattern of calls: get(true), get(false) is very common.
    // If I didn't have a mechanism to prevent concurrent execution of get() operations then the second
    // get(false) would try to execute a new API call because the first one is not completed. It would
    // be unnecessary second API call and not what you expect.
    // Instead because we have this mechanism the second get(false) call will wait until the first one
    // is completed and will return the same value from the cache.
    this.promise = this.promise.then(() => {
      return this.performGet(refreshCache);
    });

    return this.promise;
  }

  /**
   * Exposes this data store as an Observable. Useful if you want to observe
   * changes to the data.
   */
  asObservable(): Observable<ApiResponse<T>> {
    return this.data.asObservable();
  }

  /**
   * Subscribe to all changes to the data. The `next` callback is called anytime the data
   * is changed (e.g. new data is received from the API).
   */
  subscribe(next?: (value: ApiResponse<T>) => void): Subscription {
    return this.data.subscribe(next);
  }

  /**
   * Return currently stored value of the data.
   */
  value(): ApiResponse<T> {
    return this.data.value;
  }

  /**
   * Set the stored data directly. Will notify observers.
   */
  set(data: T): Promise<ApiResponse<T>> {
    // Chain executions. We create a queue of promises to avoid concurrent get() or set() operations.
    this.promise = this.promise.then(() => {
      const value: ApiResponse<T> = { response: data };

      // Publish the result to observers
      this.data.next(value);

      // And save in storage
      const storage = AppModule.injector.get(Storage);
      storage.set(this.storageKey, data);

      return value;
    });
    return this.promise;
  }

  private async performGet(refreshCache: boolean): Promise<ApiResponse<T>> {
    const storage = AppModule.injector.get(Storage);

    let retVal: ApiResponse<T>;

    // Get last cached value
    const cachedData = await storage.get(this.storageKey);
    if (cachedData && !refreshCache) {
      // We have a cached value and no refreshing is required, so just return it
      retVal = { response: cachedData };
    } else {
      // We don't have a cached value or we were asked to refresh it, so load it from the original data source
      retVal = await dataSourceToPromise(this.apiEndpoint());
      if (retVal.errors) {
        // Data loading failed. Return previously cached successful response and current errors.
        retVal.response = cachedData;
      } else {
        // Publish the result to observers
        this.data.next(retVal);
        // The call was successfull, save the response in the cache
        storage.set(this.storageKey, retVal.response);
      }
    }

    return retVal;
  }
}
